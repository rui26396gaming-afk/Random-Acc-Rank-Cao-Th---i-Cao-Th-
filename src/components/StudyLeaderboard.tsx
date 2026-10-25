import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Flame,
  Clock,
  Sparkles,
  Zap,
  UserCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Crown,
  Activity,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import { collection, onSnapshot, query, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import { useApp } from '../context/AppContext';
import { StudyLeaderboardEntry } from '../types';
import {
  useAutoStudyTracker,
  formatSecondsToHumanReadable,
  formatSecondsToDigitalTimer,
  getTodayDateString,
  getCurrentIsoWeek,
} from '../hooks/useAutoStudyTracker';

type LeaderboardTimeframe = 'today' | 'week' | 'all';

// Seeded exemplary study peers for community motivation
const SEED_STUDENTS: StudyLeaderboardEntry[] = [
  {
    userId: 'seed-1',
    displayName: 'Minh Quân (Chuyên Toán KHTN)',
    photoURL: '',
    totalSeconds: 38 * 3600 + 45 * 60,
    todaySeconds: 5 * 3600 + 12 * 60,
    weekSeconds: 22 * 3600 + 30 * 60,
    lastActiveDate: getTodayDateString(),
    weekIdentifier: getCurrentIsoWeek(),
    isStudying: true,
    lastHeartbeat: Date.now() - 30000,
    level: 14,
    streak: 18,
  },
  {
    userId: 'seed-2',
    displayName: 'Bảo Trâm (IELTS 8.0 Target)',
    photoURL: '',
    totalSeconds: 34 * 3600 + 20 * 60,
    todaySeconds: 4 * 3600 + 40 * 60,
    weekSeconds: 19 * 3600 + 15 * 60,
    lastActiveDate: getTodayDateString(),
    weekIdentifier: getCurrentIsoWeek(),
    isStudying: true,
    lastHeartbeat: Date.now() - 45000,
    level: 12,
    streak: 15,
  },
  {
    userId: 'seed-3',
    displayName: 'Hoàng Nam (Bách Khoa IT)',
    photoURL: '',
    totalSeconds: 31 * 3600 + 10 * 60,
    todaySeconds: 3 * 3600 + 55 * 60,
    weekSeconds: 18 * 3600 + 0,
    lastActiveDate: getTodayDateString(),
    weekIdentifier: getCurrentIsoWeek(),
    isStudying: false,
    lastHeartbeat: Date.now() - 15 * 60000,
    level: 11,
    streak: 12,
  },
  {
    userId: 'seed-4',
    displayName: 'Khánh Linh (Ôn thi Y Hà Nội)',
    photoURL: '',
    totalSeconds: 27 * 3600 + 40 * 60,
    todaySeconds: 3 * 3600 + 10 * 60,
    weekSeconds: 15 * 3600 + 50 * 60,
    lastActiveDate: getTodayDateString(),
    weekIdentifier: getCurrentIsoWeek(),
    isStudying: true,
    lastHeartbeat: Date.now() - 10000,
    level: 10,
    streak: 9,
  },
  {
    userId: 'seed-5',
    displayName: 'Đức Huy (Thủ khoa Khối A1)',
    photoURL: '',
    totalSeconds: 24 * 3600 + 15 * 60,
    todaySeconds: 2 * 3600 + 35 * 60,
    weekSeconds: 13 * 3600 + 20 * 60,
    lastActiveDate: getTodayDateString(),
    weekIdentifier: getCurrentIsoWeek(),
    isStudying: false,
    lastHeartbeat: Date.now() - 40 * 60000,
    level: 9,
    streak: 8,
  },
];

export const StudyLeaderboard: React.FC = () => {
  const { user, userProfile } = useApp();
  const tracker = useAutoStudyTracker();

  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('today');
  const [firestoreEntries, setFirestoreEntries] = useState<StudyLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showExplainer, setShowExplainer] = useState<boolean>(false);

  // Subscribe to real-time study leaderboard from Firestore
  useEffect(() => {
    const q = query(collection(db, 'study_leaderboard'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const entries: StudyLeaderboardEntry[] = [];
        snapshot.forEach((docSnap) => {
          entries.push(docSnap.data() as StudyLeaderboardEntry);
        });
        setFirestoreEntries(entries);
        setLoading(false);
      },
      (error) => {
        console.warn('[StudyLeaderboard] Realtime listener notice:', error);
        setLoading(false);
        // Do not crash the UI if Firestore offline or initializing
        try {
          handleFirestoreError(error, OperationType.LIST, 'study_leaderboard');
        } catch {
          // Handled
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // Merge current user's live tracked seconds with Firestore data & seed data
  const currentUserId = user?.uid || 'guest-current-user';
  const currentUserName = userProfile?.displayName || user?.displayName || 'Bạn (Người dùng)';

  // Build the unified list
  const combinedEntries: StudyLeaderboardEntry[] = React.useMemo(() => {
    const map = new Map<string, StudyLeaderboardEntry>();

    // 1. Add seeded community students
    SEED_STUDENTS.forEach((student) => {
      map.set(student.userId, { ...student });
    });

    // 2. Overlay live Firestore data
    firestoreEntries.forEach((entry) => {
      map.set(entry.userId, { ...entry });
    });

    // 3. Ensure current user's live stats (including unsaved seconds) are prominently and accurately present
    const existing = map.get(currentUserId) || {
      userId: currentUserId,
      displayName: currentUserName,
      photoURL: userProfile?.photoURL || user?.photoURL || '',
      totalSeconds: tracker.totalSeconds,
      todaySeconds: tracker.todaySeconds,
      weekSeconds: tracker.weekSeconds,
      lastActiveDate: getTodayDateString(),
      weekIdentifier: getCurrentIsoWeek(),
      isStudying: tracker.isActivelyStudying,
      lastHeartbeat: Date.now(),
      level: userProfile?.level || 1,
      streak: userProfile?.streak || 1,
    };

    map.set(currentUserId, {
      ...existing,
      displayName: currentUserName,
      totalSeconds: Math.max(existing.totalSeconds, tracker.totalSeconds),
      todaySeconds: Math.max(existing.todaySeconds, tracker.todaySeconds),
      weekSeconds: Math.max(existing.weekSeconds, tracker.weekSeconds),
      isStudying: tracker.isActivelyStudying,
      lastHeartbeat: Date.now(),
      level: userProfile?.level || existing.level || 1,
      streak: userProfile?.streak || existing.streak || 1,
    });

    return Array.from(map.values());
  }, [firestoreEntries, currentUserId, currentUserName, tracker, userProfile, user]);

  // Sort by the chosen timeframe
  const sortedEntries = React.useMemo(() => {
    return [...combinedEntries].sort((a, b) => {
      if (timeframe === 'today') {
        return (b.todaySeconds || 0) - (a.todaySeconds || 0);
      }
      if (timeframe === 'week') {
        return (b.weekSeconds || 0) - (a.weekSeconds || 0);
      }
      return (b.totalSeconds || 0) - (a.totalSeconds || 0);
    });
  }, [combinedEntries, timeframe]);

  // Current user's rank
  const currentUserRankIndex = sortedEntries.findIndex((e) => e.userId === currentUserId);
  const currentUserRank = currentUserRankIndex >= 0 ? currentUserRankIndex + 1 : sortedEntries.length + 1;

  const top3 = sortedEntries.slice(0, 3);
  const restList = sortedEntries.slice(3);

  const getTimeForEntry = (entry: StudyLeaderboardEntry) => {
    if (timeframe === 'today') return entry.todaySeconds || 0;
    if (timeframe === 'week') return entry.weekSeconds || 0;
    return entry.totalSeconds || 0;
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Auto-Tracker Live Ticker */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border border-indigo-800/40 p-6 shadow-xl">
        {/* Glow ambient background circles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5" />
              <span>Bảng Xếp Hạng Chăm Học — Tự Động 100%</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>Bảng Vinh Danh Thời Gian Học</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span>Không Cần Bấm</span>
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Hệ thống tự động đo lường từng giây bạn học tập, giải bài, đọc tài liệu và ghi nhớ.
              Thời gian tự động đồng bộ lên bảng vàng mà không cần bạn phải thao tác check-in hay bấm bắt đầu!
            </p>
          </div>

          {/* Quick Zero-Touch Explainer Toggle */}
          <button
            onClick={() => setShowExplainer(!showExplainer)}
            className="self-start md:self-center px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-bold text-slate-200 flex items-center gap-2 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span>Cơ chế "Không cần bấm" hoạt động thế nào?</span>
          </button>
        </div>

        {/* Expandable Explainer Box */}
        {showExplainer && (
          <div className="mt-5 pt-5 border-t border-indigo-900/60 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-3.5 rounded-2xl bg-indigo-900/30 border border-indigo-700/30 space-y-1">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Tự Động Nhận Diện Học Tập</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Thời gian bắt đầu tích lũy ngay khi bạn mở app, vào phần Giải bài, Luyện Tiếng Anh, Làm văn hoặc Bật Pomodoro.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-900/30 border border-indigo-700/30 space-y-1">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Chống Gian Lận Tự Động (Anti-AFK)</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Nếu bạn chuyển tab khác hoặc không có tương tác chuột/bàn phím sau 3 phút, bộ đếm sẽ tự động tạm dừng để công bằng tuyệt đối.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-indigo-900/30 border border-indigo-700/30 space-y-1">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                <span>3. Tự Động Đồng Bộ Đám Mây</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Dữ liệu được lưu trữ tự động vào Firestore mỗi 30 giây và khi đóng trang, đảm bảo không mất dù chỉ 1 phút học quý giá.
              </p>
            </div>
          </div>
        )}

        {/* 2. Current User's Live Tracking Status Card */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full sm:w-auto">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-md">
                {currentUserName.charAt(0).toUpperCase()}
              </div>
              {tracker.isActivelyStudying && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 animate-ping"></span>
              )}
              {tracker.isActivelyStudying && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900"></span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-white text-sm sm:text-base">{currentUserName}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold">
                  Hạng #{currentUserRank}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                {tracker.isActivelyStudying ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    <span>Đang ghi nhận tự động (Live)</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Tạm dừng (Không phát hiện thao tác &gt; 3 phút)</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics of Current User */}
          <div className="grid grid-cols-3 gap-3 w-full sm:w-auto shrink-0 text-center">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 min-w-[90px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Phiên này</div>
              <div className="text-sm font-black font-mono text-emerald-400 mt-0.5">
                {tracker.formattedSession}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 min-w-[90px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Hôm nay</div>
              <div className="text-sm font-black text-blue-400 mt-0.5">
                {tracker.formattedToday}
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 min-w-[90px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Tổng cộng</div>
              <div className="text-sm font-black text-purple-400 mt-0.5">
                {tracker.formattedTotal}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Timeframe Filter Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-2 sm:p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setTimeframe('today')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              timeframe === 'today'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Hôm Nay</span>
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              timeframe === 'week'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Tuần Này</span>
          </button>
          <button
            onClick={() => setTimeframe('all')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              timeframe === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Toàn Thời Gian</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 self-end sm:self-center pr-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Tự động cập nhật thời gian thực</span>
        </div>
      </div>

      {/* 4. Top 3 Podium (Bục Vinh Danh Top 3) */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* #2 Silver (Shown left on desktop) */}
          {top3[1] && (
            <div className="order-2 md:order-1 p-5 rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 shadow-lg relative flex flex-col items-center text-center">
              <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-slate-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md">
                <Medal className="w-3.5 h-3.5" />
                <span>HẠNG 2</span>
              </div>
              <div className="w-16 h-16 mt-2 rounded-2xl bg-gradient-to-tr from-slate-400 to-slate-200 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg ring-4 ring-slate-400/30">
                {top3[1].displayName.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white mt-3 line-clamp-1">
                {top3[1].displayName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-amber-400" />
                  <span>{top3[1].streak || 1} ngày chuỗi</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-[11px] font-semibold text-slate-400">Lv.{top3[1].level || 1}</span>
              </div>
              <div className="mt-4 px-4 py-2 rounded-2xl bg-slate-800 border border-slate-700 w-full">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Thời gian tích lũy</div>
                <div className="text-lg font-black text-slate-200 mt-0.5 font-mono">
                  {formatSecondsToHumanReadable(getTimeForEntry(top3[1]))}
                </div>
              </div>
            </div>
          )}

          {/* #1 Gold Champion (Center, prominent) */}
          {top3[0] && (
            <div className="order-1 md:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-900 border-2 border-amber-500/60 shadow-xl relative flex flex-col items-center text-center transform md:-translate-y-2">
              <div className="absolute -top-3.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-400/20">
                <Crown className="w-4 h-4 fill-slate-950" />
                <span>QUÁN QUÂN #1</span>
              </div>
              <div className="w-20 h-20 mt-3 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 text-slate-950 font-black text-3xl flex items-center justify-center shadow-xl ring-4 ring-amber-400/40">
                {top3[0].displayName.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-black text-base sm:text-lg text-amber-200 mt-3 line-clamp-1">
                {top3[0].displayName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 fill-amber-300" />
                  <span>{top3[0].streak || 1} ngày chuỗi</span>
                </span>
                <span className="text-amber-500/50">•</span>
                <span className="text-xs font-bold text-amber-400">Lv.{top3[0].level || 1}</span>
              </div>
              <div className="mt-4 px-4 py-2.5 rounded-2xl bg-amber-950/50 border border-amber-600/40 w-full shadow-inner">
                <div className="text-[10px] text-amber-400 uppercase font-black tracking-wider">Thời gian kỷ lục</div>
                <div className="text-2xl font-black text-amber-300 mt-0.5 font-mono">
                  {formatSecondsToHumanReadable(getTimeForEntry(top3[0]))}
                </div>
              </div>
            </div>
          )}

          {/* #3 Bronze (Right) */}
          {top3[2] && (
            <div className="order-3 md:order-3 p-5 rounded-3xl bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-amber-800/40 shadow-lg relative flex flex-col items-center text-center">
              <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-700 text-white font-black text-xs flex items-center gap-1 shadow-md">
                <Medal className="w-3.5 h-3.5" />
                <span>HẠNG 3</span>
              </div>
              <div className="w-16 h-16 mt-2 rounded-2xl bg-gradient-to-tr from-amber-700 to-amber-600 text-white font-black text-2xl flex items-center justify-center shadow-lg ring-4 ring-amber-700/30">
                {top3[2].displayName.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white mt-3 line-clamp-1">
                {top3[2].displayName}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  <Flame className="w-3 h-3 fill-amber-400" />
                  <span>{top3[2].streak || 1} ngày chuỗi</span>
                </span>
                <span className="text-slate-500">•</span>
                <span className="text-[11px] font-semibold text-slate-400">Lv.{top3[2].level || 1}</span>
              </div>
              <div className="mt-4 px-4 py-2 rounded-2xl bg-slate-800 border border-slate-700 w-full">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Thời gian tích lũy</div>
                <div className="text-lg font-black text-slate-200 mt-0.5 font-mono">
                  {formatSecondsToHumanReadable(getTimeForEntry(top3[2]))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Leaderboard Table / Cards for Ranks 4+ */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Danh sách các học viên chăm chỉ khác</span>
          </div>
          <span className="text-xs text-slate-400 font-medium">{sortedEntries.length} thành viên tham gia</span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {sortedEntries.map((entry, index) => {
            const rank = index + 1;
            const isCurrentUser = entry.userId === currentUserId;
            const timeVal = getTimeForEntry(entry);
            const isOnline = entry.isStudying || (entry.lastHeartbeat && Date.now() - entry.lastHeartbeat < 180000);

            return (
              <div
                key={entry.userId || index}
                className={`p-4 transition-colors flex items-center justify-between gap-4 ${
                  isCurrentUser
                    ? 'bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-blue-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {/* Left: Rank & Avatar & Info */}
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 ${
                      rank === 1
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : rank === 2
                        ? 'bg-slate-300 text-slate-950 font-black'
                        : rank === 3
                        ? 'bg-amber-700 text-white font-black'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold'
                    }`}
                  >
                    #{rank}
                  </div>

                  <div className="relative shrink-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold text-sm">
                      {entry.displayName.charAt(0).toUpperCase()}
                    </div>
                    {isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs sm:text-sm font-bold truncate ${isCurrentUser ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-800 dark:text-slate-200'}`}>
                        {entry.displayName}
                      </span>
                      {isCurrentUser && (
                        <span className="px-1.5 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider">
                          Bạn
                        </span>
                      )}
                      {isCurrentUser && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          userProfile?.role === 'admin'
                            ? 'bg-red-500/20 text-red-400 border-red-500/40'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        }`}>
                          {userProfile?.role === 'admin' ? '👑 Admin' : '🎓 Member'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                        <Flame className="w-3 h-3 fill-amber-500" />
                        <span>{entry.streak || 1}d</span>
                      </span>
                      <span>•</span>
                      <span>Lv.{entry.level || 1}</span>
                      {isOnline && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-500 font-medium hidden sm:inline">🟢 Đang học</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Automated Time Display */}
                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-slate-100">
                    {formatSecondsToHumanReadable(timeVal)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
                    {timeframe === 'today' ? 'hôm nay' : timeframe === 'week' ? 'tuần này' : 'tích lũy'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
