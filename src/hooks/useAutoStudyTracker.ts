import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { useApp } from '../context/AppContext';
import { StudyLeaderboardEntry } from '../types';

const IDLE_TIMEOUT_MS = 180 * 1000; // 3 minutes of zero input pauses auto-tracking
const SYNC_INTERVAL_SECONDS = 30; // Flush to Firestore every 30s of active study
const LOCAL_STORAGE_KEY = 'omnilife_auto_study_tracker_v1';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentIsoWeek(): string {
  const now = new Date();
  const target = new Date(now.valueOf());
  const dayNr = (now.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  return `${now.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

export function formatSecondsToHumanReadable(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} giây`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  return secs > 0 ? `${minutes}m ${secs}s` : `${minutes} phút`;
}

export function formatSecondsToDigitalTimer(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  if (hrs > 0) {
    return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

interface LocalTrackerData {
  totalSeconds: number;
  todaySeconds: number;
  weekSeconds: number;
  lastActiveDate: string;
  weekIdentifier: string;
  lastSyncedTimestamp: number;
}

export function useAutoStudyTracker() {
  const { user, userProfile, addXp } = useApp();

  // Local state
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [todaySeconds, setTodaySeconds] = useState<number>(0);
  const [weekSeconds, setWeekSeconds] = useState<number>(0);
  const [totalSeconds, setTotalSeconds] = useState<number>(0);
  const [isActivelyStudying, setIsActivelyStudying] = useState<boolean>(true);
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'idle' | 'offline'>('synced');

  const lastUserActivityRef = useRef<number>(Date.now());
  const unsavedSecondsRef = useRef<number>(0);
  const isSyncingRef = useRef<boolean>(false);
  const initialLoadDoneRef = useRef<boolean>(false);

  // 1. Initialize from localStorage or Firestore
  useEffect(() => {
    const today = getTodayDateString();
    const currentWeek = getCurrentIsoWeek();

    // Read cached local stats first for instant UI response
    let localData: LocalTrackerData = {
      totalSeconds: 0,
      todaySeconds: 0,
      weekSeconds: 0,
      lastActiveDate: today,
      weekIdentifier: currentWeek,
      lastSyncedTimestamp: Date.now(),
    };

    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.totalSeconds === 'number') {
          localData.totalSeconds = parsed.totalSeconds;
          localData.todaySeconds = parsed.lastActiveDate === today ? (parsed.todaySeconds || 0) : 0;
          localData.weekSeconds = parsed.weekIdentifier === currentWeek ? (parsed.weekSeconds || 0) : 0;
          localData.lastActiveDate = today;
          localData.weekIdentifier = currentWeek;
        }
      }
    } catch {
      // Local storage fallback
    }

    setTodaySeconds(localData.todaySeconds);
    setWeekSeconds(localData.weekSeconds);
    setTotalSeconds(localData.totalSeconds);

    // If user is authenticated with Firebase, load their authoritative record
    if (user?.uid) {
      const userRef = doc(db, 'study_leaderboard', user.uid);
      getDoc(userRef)
        .then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as Partial<StudyLeaderboardEntry>;
            const remoteTotal = typeof data.totalSeconds === 'number' ? data.totalSeconds : 0;
            const remoteDate = data.lastActiveDate || '';
            const remoteToday = remoteDate === today && typeof data.todaySeconds === 'number' ? data.todaySeconds : 0;
            const remoteWeek = data.weekIdentifier === currentWeek && typeof data.weekSeconds === 'number' ? data.weekSeconds : 0;

            // Merge whichever is larger (local offline progress + remote)
            const finalTotal = Math.max(localData.totalSeconds, remoteTotal);
            const finalToday = Math.max(localData.todaySeconds, remoteToday);
            const finalWeek = Math.max(localData.weekSeconds, remoteWeek);

            setTotalSeconds(finalTotal);
            setTodaySeconds(finalToday);
            setWeekSeconds(finalWeek);
          }
          initialLoadDoneRef.current = true;
        })
        .catch((err) => {
          console.warn('[AutoStudyTracker] Could not fetch remote study record:', err);
          initialLoadDoneRef.current = true;
        });
    } else {
      initialLoadDoneRef.current = true;
    }
  }, [user?.uid]);

  // 2. Activity & Idle Detection
  useEffect(() => {
    const handleActivity = () => {
      lastUserActivityRef.current = Date.now();
      if (isIdle) {
        setIsIdle(false);
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach((evt) => window.addEventListener(evt, handleActivity, { passive: true }));

    const idleChecker = setInterval(() => {
      const elapsed = Date.now() - lastUserActivityRef.current;
      const isVisible = document.visibilityState === 'visible';
      if (elapsed > IDLE_TIMEOUT_MS || !isVisible) {
        setIsIdle(true);
      } else {
        setIsIdle(false);
      }
    }, 2000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearInterval(idleChecker);
    };
  }, [isIdle]);

  // 3. Flush to Firestore and LocalStorage
  const flushStudyTime = useCallback(
    async (isPageClosing = false) => {
      if (unsavedSecondsRef.current <= 0 && !isPageClosing) return;
      if (isSyncingRef.current) return;

      const secondsToSave = unsavedSecondsRef.current;
      unsavedSecondsRef.current = 0;
      isSyncingRef.current = true;
      setSyncStatus('syncing');

      const today = getTodayDateString();
      const currentWeek = getCurrentIsoWeek();

      // Update LocalStorage first
      try {
        const payload: LocalTrackerData = {
          totalSeconds: totalSeconds + secondsToSave,
          todaySeconds: todaySeconds + secondsToSave,
          weekSeconds: weekSeconds + secondsToSave,
          lastActiveDate: today,
          weekIdentifier: currentWeek,
          lastSyncedTimestamp: Date.now(),
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(payload));
      } catch {
        // Ignore local storage error
      }

      // Sync to Firestore if authenticated
      if (user?.uid) {
        try {
          const entryRef = doc(db, 'study_leaderboard', user.uid);
          const entryPayload: StudyLeaderboardEntry = {
            userId: user.uid,
            displayName: userProfile?.displayName || user.displayName || user.email?.split('@')[0] || 'Học viên ẩn danh',
            photoURL: userProfile?.photoURL || user.photoURL || '',
            totalSeconds: totalSeconds + secondsToSave,
            todaySeconds: todaySeconds + secondsToSave,
            weekSeconds: weekSeconds + secondsToSave,
            lastActiveDate: today,
            weekIdentifier: currentWeek,
            isStudying: !isIdle && !isPageClosing,
            lastHeartbeat: Date.now(),
            level: userProfile?.level || 1,
            streak: userProfile?.streak || 1,
            updatedAt: new Date().toISOString(),
          };

          await setDoc(entryRef, entryPayload, { merge: true });
          setSyncStatus('synced');

          // Grant bonus XP every 5 minutes (300s) of active automated studying
          if (secondsToSave >= 60) {
            addXp(Math.floor(secondsToSave / 60) * 2, 'Tự động học tập tập trung');
          }
        } catch (error) {
          console.warn('[AutoStudyTracker] Firestore sync error:', error);
          setSyncStatus('offline');
          // Put back unsaved seconds so they aren't lost
          unsavedSecondsRef.current += secondsToSave;
          handleFirestoreError(error, OperationType.WRITE, 'study_leaderboard');
        } finally {
          isSyncingRef.current = false;
        }
      } else {
        setSyncStatus('synced');
        isSyncingRef.current = false;
      }
    },
    [user?.uid, user?.displayName, user?.photoURL, user?.email, userProfile, totalSeconds, todaySeconds, weekSeconds, isIdle, addXp]
  );

  // 4. One-second heartbeat ticking (Only ticks when active and not idle)
  useEffect(() => {
    const timer = setInterval(() => {
      const isVisible = document.visibilityState === 'visible';
      const isUserActive = Date.now() - lastUserActivityRef.current <= IDLE_TIMEOUT_MS;
      const canTrack = isVisible && isUserActive;

      setIsActivelyStudying(canTrack);

      if (canTrack) {
        setSessionSeconds((prev) => prev + 1);
        setTodaySeconds((prev) => prev + 1);
        setWeekSeconds((prev) => prev + 1);
        setTotalSeconds((prev) => prev + 1);
        unsavedSecondsRef.current += 1;

        // Auto flush if reached threshold
        if (unsavedSecondsRef.current >= SYNC_INTERVAL_SECONDS) {
          flushStudyTime();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [flushStudyTime]);

  // 5. Save before leaving tab / window unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      flushStudyTime(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushStudyTime(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [flushStudyTime]);

  return {
    isActivelyStudying,
    isIdle,
    sessionSeconds,
    todaySeconds,
    weekSeconds,
    totalSeconds,
    formattedSession: formatSecondsToDigitalTimer(sessionSeconds),
    formattedToday: formatSecondsToHumanReadable(todaySeconds),
    formattedWeek: formatSecondsToHumanReadable(weekSeconds),
    formattedTotal: formatSecondsToHumanReadable(totalSeconds),
    syncStatus,
    forceSync: () => flushStudyTime(false),
  };
}
