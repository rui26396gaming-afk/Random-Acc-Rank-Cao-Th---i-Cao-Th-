import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { handleFirestoreError, OperationType } from '../firebase/errors';
import {
  AppMode,
  PillarId,
  TaskItem,
  HabitItem,
  MemoryHighlight,
  RoutineSlot,
  CompanionMessage,
  CompanionPersona,
  UserProfile,
  UserRole,
  Announcement,
} from '../types';
import {
  playAmbientSound,
  stopAmbientSound,
  updateAmbientVolume,
  AmbientSoundType,
} from '../utils/audioSynthesizer';

interface AppContextType {
  // Mode & Navigation
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  activePillar: PillarId;
  setActivePillar: (pillar: PillarId) => void;
  studySubTab: 'universal' | 'literature' | 'english' | 'math' | 'writing' | 'summarize' | 'leaderboard';
  setStudySubTab: (tab: 'universal' | 'literature' | 'english' | 'math' | 'writing' | 'summarize' | 'leaderboard') => void;

  // Auth & Roles
  user: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  isRealAdmin: boolean;
  effectiveRole: UserRole;
  isRolePreviewActive: boolean;
  toggleRolePreview: () => void;
  showRoleModal: boolean;
  setShowRoleModal: (show: boolean) => void;
  loadingAuth: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;

  // Admin Capabilities
  allUsers: UserProfile[];
  fetchAllUsers: () => Promise<void>;
  updateUserRole: (targetUid: string, newRole: UserRole) => Promise<void>;
  announcements: Announcement[];
  broadcastAnnouncement: (title: string, content: string, priority: 'low' | 'normal' | 'urgent') => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;

  // Gamification & Stats
  xp: number;
  level: number;
  xpInLevel: number;
  streak: number;
  addXp: (amount: number, reason?: string) => void;

  // Ambient Sound
  isAmbientPlaying: boolean;
  ambientType: AmbientSoundType;
  ambientVolume: number;
  toggleAmbientSound: () => void;
  changeAmbientType: (type: AmbientSoundType) => void;
  setAmbientVolumeLevel: (vol: number) => void;

  // Tasks & Habits
  tasks: TaskItem[];
  toggleTask: (id: string) => void;
  addTask: (task: Omit<TaskItem, 'id' | 'completed'>) => void;
  deleteTask: (id: string) => void;
  habits: HabitItem[];
  incrementHabit: (id: string) => void;
  resetHabit: (id: string) => void;

  // Routine
  routineSlots: RoutineSlot[];
  setRoutineSlots: React.Dispatch<React.SetStateAction<RoutineSlot[]>>;
  toggleRoutineSlot: (id: string) => void;

  // Memories & Highlights
  highlights: MemoryHighlight[];
  addHighlight: (highlight: Omit<MemoryHighlight, 'id' | 'date'>) => void;
  deleteHighlight: (id: string) => void;

  // Companion
  companionPersona: CompanionPersona;
  setCompanionPersona: (persona: CompanionPersona) => void;
  companionMessages: CompanionMessage[];
  addCompanionMessage: (message: Omit<CompanionMessage, 'id' | 'timestamp'>) => void;
  clearCompanionChat: () => void;

  // Focus Mode Do Not Disturb
  doNotDisturb: boolean;
  toggleDoNotDisturb: () => void;

  // Quick sound effect
  playChime: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_BOOTSTRAP_EMAIL = 'pthina650@gmail.com';

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    title: 'Giải 3 bài toán hình học không gian (Khối đa diện)',
    category: 'study',
    priority: 'high',
    xp: 35,
    completed: false,
    dueDate: 'Hôm nay',
    subtasks: [
      { id: 'st-1', title: 'Vẽ hình và phân tích góc', completed: true },
      { id: 'st-2', title: 'Áp dụng định lý thể tích', completed: false },
    ],
  },
  {
    id: 't-2',
    title: 'Lập dàn ý bài văn nghị luận xã hội: "Sự kiên trì"',
    category: 'study',
    priority: 'medium',
    xp: 30,
    completed: false,
    dueDate: 'Hôm nay',
  },
  {
    id: 't-3',
    title: 'Dọn dẹp bàn học & cắm bình hoa nhỏ',
    category: 'home',
    priority: 'low',
    xp: 15,
    completed: true,
  },
  {
    id: 't-4',
    title: 'Chạy bộ 2km & Giãn cơ buổi chiều',
    category: 'health',
    priority: 'medium',
    xp: 25,
    completed: false,
    dueDate: '17:30',
  },
];

const INITIAL_HABITS: HabitItem[] = [
  {
    id: 'h-water',
    title: 'Uống đủ nước',
    iconName: 'Droplet',
    currentCount: 5,
    targetCount: 8,
    unit: 'ly (250ml)',
    streak: 6,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'h-read',
    title: 'Đọc sách phát triển',
    iconName: 'BookOpen',
    currentCount: 15,
    targetCount: 20,
    unit: 'trang',
    streak: 4,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'h-sleep',
    title: 'Ngủ trước 23:00',
    iconName: 'Moon',
    currentCount: 1,
    targetCount: 1,
    unit: 'đêm',
    streak: 5,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'h-pomodoro',
    title: 'Phiên Pomodoro tập trung',
    iconName: 'Clock',
    currentCount: 3,
    targetCount: 4,
    unit: 'phiên',
    streak: 7,
    lastUpdated: new Date().toISOString(),
  },
];

const INITIAL_HIGHLIGHTS: MemoryHighlight[] = [
  {
    id: 'm-1',
    title: 'Penta-kill mãn nhãn trận chung kết rank',
    category: 'game_highlight',
    content: 'Pha lật kèo phút 32 cực kỳ xuất thần ở hang Rồng Ngàn Tuổi cùng đồng đội!',
    authorOrSource: 'LMHT - Rank Kim Cương',
    date: '2026-10-21',
    moodTag: 'Hào hứng 🔥',
  },
  {
    id: 'm-2',
    title: '"Con người sinh ra không phải để tan biến như một hạt cát vô danh..."',
    category: 'quote',
    content: 'Hãy in dấu chân trên mặt đất, in dấu ấn trong lòng người khác.',
    authorOrSource: 'V.A. Sukhomlinsky',
    date: '2026-10-22',
    moodTag: 'Sâu sắc 💡',
  },
  {
    id: 'm-3',
    title: 'Interstellar - Khúc tráng ca không gian',
    category: 'movie',
    content: 'Tình yêu là thứ duy nhất vượt qua mọi chiều không gian và thời gian.',
    authorOrSource: 'Christopher Nolan',
    date: '2026-10-18',
    moodTag: 'Kinh ngạc 🌌',
  },
];

const INITIAL_ROUTINE: RoutineSlot[] = [
  {
    id: 'r-1',
    time: '06:30 - 07:15',
    title: 'Khởi động ngày mới & Uống 300ml nước ấm',
    category: 'Sức khỏe',
    mode: 'chill',
    xp: 15,
    description: 'Khởi động cơ thể 10 phút, hít thở sâu và bữa sáng giàu dinh dưỡng.',
    completed: true,
  },
  {
    id: 'r-2',
    time: '07:45 - 11:30',
    title: 'Ca học sáng: Toán chuyên đề & Đọc hiểu',
    category: 'Học tập',
    mode: 'focus',
    xp: 45,
    description: 'Áp dụng kỹ thuật Pomodoro 25/5, giải quyết các dạng toán khó.',
    completed: false,
  },
  {
    id: 'r-3',
    time: '12:00 - 13:30',
    title: 'Nghỉ trưa & Chợp mắt 20 phút phục hồi',
    category: 'Nghỉ ngơi',
    mode: 'chill',
    xp: 15,
    description: 'Tạm gác màn hình, nghe lofi hoặc thiền tĩnh tâm.',
    completed: false,
  },
  {
    id: 'r-4',
    time: '14:00 - 16:30',
    title: 'Ca chiều: Sáng tạo văn học & Ôn Flashcards',
    category: 'Học tập',
    mode: 'focus',
    xp: 40,
    description: 'Viết dàn ý chi tiết bài luận và kiểm tra sơ đồ tư duy.',
    completed: false,
  },
  {
    id: 'r-5',
    time: '17:00 - 18:00',
    title: 'Vận động thể thao / Chạy bộ / Cầu lông',
    category: 'Thể chất',
    mode: 'chill',
    xp: 30,
    description: 'Tiết mồ hôi, xua tan căng thẳng học tập.',
    completed: false,
  },
  {
    id: 'r-6',
    time: '19:30 - 21:00',
    title: 'Chiến Game giải trí cùng bạn bè',
    category: 'Gaming',
    mode: 'gaming',
    xp: 25,
    description: 'Tối đa 2-3 trận rank có kiểm soát, áp dụng meta mới.',
    completed: false,
  },
  {
    id: 'r-7',
    time: '21:30 - 22:45',
    title: 'Thư giãn ban đêm, đọc sách & Nhật ký',
    category: 'Thư giãn',
    mode: 'chill',
    xp: 20,
    description: 'Bật âm thanh mưa rơi nhẹ, ghi lại 3 điều biết ơn trong ngày.',
    completed: false,
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<AppMode>(() => {
    return (localStorage.getItem('omnilife_mode') as AppMode) || 'focus';
  });

  const [activePillar, setActivePillar] = useState<PillarId>('study');
  const [studySubTab, setStudySubTab] = useState<'universal' | 'literature' | 'english' | 'math' | 'writing' | 'summarize' | 'leaderboard'>('universal');

  // Firebase Auth & User Profile State
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loadingAuth, setLoadingAuth] = useState<boolean>(true);

  // Admin user list and announcements
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Local state fallbacks and gamification
  const [xp, setXp] = useState<number>(() => {
    const saved = localStorage.getItem('omnilife_xp');
    return saved ? parseInt(saved, 10) : 340;
  });
  const [streak, setStreak] = useState<number>(7);

  // Ambient sound
  const [isAmbientPlaying, setIsAmbientPlaying] = useState<boolean>(false);
  const [ambientType, setAmbientType] = useState<AmbientSoundType>('rain');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.5);

  // Tasks & Habits
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const saved = localStorage.getItem('omnilife_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [habits, setHabits] = useState<HabitItem[]>(() => {
    const saved = localStorage.getItem('omnilife_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [routineSlots, setRoutineSlots] = useState<RoutineSlot[]>(() => {
    const saved = localStorage.getItem('omnilife_routine');
    return saved ? JSON.parse(saved) : INITIAL_ROUTINE;
  });

  const [highlights, setHighlights] = useState<MemoryHighlight[]>(() => {
    const saved = localStorage.getItem('omnilife_highlights');
    return saved ? JSON.parse(saved) : INITIAL_HIGHLIGHTS;
  });

  const [companionPersona, setCompanionPersona] = useState<CompanionPersona>('empathy');
  const [companionMessages, setCompanionMessages] = useState<CompanionMessage[]>([
    {
      id: 'm-init',
      role: 'model',
      text: 'Chào bạn! Mình là AI Companion của OmniLife. Hệ thống phân quyền Admin & User đã sẵn sàng. Bạn muốn cùng mình chinh phục mục tiêu nào hôm nay?',
      timestamp: 'Vừa xong',
      detectedMood: 'sẵn sàng',
      suggestedAction: 'chọn_mục_tiêu',
    },
  ]);

  const [doNotDisturb, setDoNotDisturb] = useState<boolean>(false);
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [isRolePreviewActive, setIsRolePreviewActive] = useState<boolean>(false);

  // Authoritative Admin Check:
  // 1. Matches bootstrapped root admin email pthina650@gmail.com
  // 2. Or userProfile.role === 'admin'
  const isRealAdmin = Boolean(
    (user?.email && user.email.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase()) ||
    userProfile?.role === 'admin'
  );

  // Effective role: Allows superadmins to preview the app as a regular Member
  const effectiveRole: UserRole = isRealAdmin && !isRolePreviewActive ? 'admin' : 'user';
  const isAdmin = effectiveRole === 'admin';

  const toggleRolePreview = () => {
    if (!isRealAdmin) return;
    setIsRolePreviewActive((prev) => !prev);
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const userSnap = await getDoc(userDocRef);
          const isUserAdmin = currentUser.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            // If the user is pthina650@gmail.com, ensure role is 'admin'
            if (isUserAdmin && data.role !== 'admin') {
              await updateDoc(userDocRef, { role: 'admin' });
              data.role = 'admin';
            }
            setUserProfile(data);
            setXp(data.xp || 340);
            setStreak(data.streak || 7);
          } else {
            // New user registration
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'OmniLife User',
              photoURL: currentUser.photoURL || '',
              role: isUserAdmin ? 'admin' : 'user',
              xp: 340,
              level: 4,
              streak: 7,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setUserProfile(newProfile);

            // Also create admin lookup doc if admin
            if (isUserAdmin) {
              const adminDocRef = doc(db, 'admins', currentUser.uid);
              await setDoc(adminDocRef, {
                email: currentUser.email,
                grantedAt: new Date().toISOString(),
                grantedBy: 'system_bootstrap',
              });
            }
          }
        } catch (error) {
          console.warn('User profile fetch warning:', error);
        }
      } else {
        setUserProfile(null);
      }
      setLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Announcements Listener
  useEffect(() => {
    const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Announcement[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...(doc.data() as any) });
        });
        setAnnouncements(list);
      },
      (error) => {
        console.warn('Announcements snapshot listener warning:', error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch all users for Admin Panel
  const fetchAllUsers = async () => {
    if (!isAdmin) return;
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        list.push(d.data() as UserProfile);
      });
      setAllUsers(list);
    } catch (error) {
      console.warn('Could not fetch all users:', error);
    }
  };

  // Admin: Update user role
  const updateUserRole = async (targetUid: string, newRole: UserRole) => {
    if (!isAdmin) return;
    try {
      // 1. If it's a simulated demo user (demo-user-*)
      if (targetUid.startsWith('demo-')) {
        setAllUsers((prev) => {
          const exists = prev.some((u) => u.uid === targetUid);
          if (exists) {
            return prev.map((u) => (u.uid === targetUid ? { ...u, role: newRole } : u));
          }
          const sample = [
            {
              uid: 'demo-user-1',
              email: 'minhquan.toan@omnilife.edu.vn',
              displayName: 'Minh Quân (Chuyên Toán KHTN)',
              role: 'user' as const,
              xp: 680,
              level: 7,
              streak: 18,
              createdAt: '2026-10-15T08:00:00Z',
              updatedAt: '2026-10-24T12:00:00Z',
            },
            {
              uid: 'demo-user-2',
              email: 'baotram.ielts@omnilife.edu.vn',
              displayName: 'Bảo Trâm (IELTS 8.0 Target)',
              role: 'user' as const,
              xp: 540,
              level: 6,
              streak: 15,
              createdAt: '2026-10-18T10:30:00Z',
              updatedAt: '2026-10-24T14:20:00Z',
            },
            {
              uid: 'demo-user-3',
              email: 'hoangnam.it@omnilife.edu.vn',
              displayName: 'Hoàng Nam (Bách Khoa IT)',
              role: 'admin' as const,
              xp: 920,
              level: 10,
              streak: 22,
              createdAt: '2026-10-10T09:15:00Z',
              updatedAt: '2026-10-24T16:00:00Z',
            },
          ].find((s) => s.uid === targetUid);
          const fallback: UserProfile = sample
            ? { ...sample, role: newRole }
            : {
                uid: targetUid,
                email: `${targetUid}@omnilife.local`,
                displayName: targetUid,
                role: newRole,
                xp: 100,
                level: 1,
                streak: 1,
                createdAt: new Date().toISOString(),
              };
          return [...prev, fallback];
        });
        playChime();
        return;
      }

      // 2. Real Firestore user document
      const userRef = doc(db, 'users', targetUid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const targetUser = allUsers.find((u) => u.uid === targetUid);
        const newRecord: UserProfile = targetUser
          ? { ...targetUser, role: newRole, updatedAt: new Date().toISOString() }
          : {
              uid: targetUid,
              email: '',
              displayName: 'Thành viên',
              role: newRole,
              xp: 100,
              level: 1,
              streak: 1,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
        await setDoc(userRef, newRecord);
      } else {
        await updateDoc(userRef, { role: newRole, updatedAt: new Date().toISOString() });
      }

      // If granting admin, add to admins collection; if revoking, delete
      const adminRef = doc(db, 'admins', targetUid);
      if (newRole === 'admin') {
        const targetUser = allUsers.find((u) => u.uid === targetUid);
        await setDoc(adminRef, {
          email: targetUser?.email || userSnap.data()?.email || '',
          grantedAt: new Date().toISOString(),
          grantedBy: user?.email || 'admin',
        });
      } else {
        await deleteDoc(adminRef).catch(() => {});
      }

      setAllUsers((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, role: newRole } : u))
      );
      playChime();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${targetUid}`);
    }
  };

  // Admin: Broadcast announcement
  const broadcastAnnouncement = async (title: string, content: string, priority: 'low' | 'normal' | 'urgent') => {
    if (!isAdmin) return;
    try {
      await addDoc(collection(db, 'announcements'), {
        title,
        content,
        authorEmail: user?.email || ADMIN_BOOTSTRAP_EMAIL,
        priority,
        createdAt: new Date().toISOString(),
      });
      confetti({ particleCount: 30, spread: 50 });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'announcements');
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    }
  };

  // Google Login
  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      playChime();
    } catch (err: any) {
      console.error('Google sign-in error:', err);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  // Sync to local storage for guest / fallback
  useEffect(() => {
    localStorage.setItem('omnilife_mode', mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem('omnilife_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('omnilife_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('omnilife_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('omnilife_routine', JSON.stringify(routineSlots));
  }, [routineSlots]);

  useEffect(() => {
    localStorage.setItem('omnilife_highlights', JSON.stringify(highlights));
  }, [highlights]);

  // Mode Switch
  const setMode = (newMode: AppMode) => {
    setModeState(newMode);
    if (newMode === 'focus') {
      setActivePillar('study');
    } else if (newMode === 'gaming') {
      setActivePillar('gaming');
    } else if (newMode === 'chill') {
      setActivePillar('routine');
    }
  };

  const playChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio fallback
    }
  };

  const addXp = (amount: number) => {
    setXp((prev) => {
      const nextXp = prev + amount;
      if (user && userProfile) {
        const userRef = doc(db, 'users', user.uid);
        const nextLevel = Math.floor(nextXp / 100) + 1;
        updateDoc(userRef, {
          xp: nextXp,
          level: nextLevel,
          updatedAt: new Date().toISOString(),
        }).catch((err) => console.error(err));
      }
      return nextXp;
    });
    playChime();
  };

  // Ambient sound handlers
  const toggleAmbientSound = () => {
    if (isAmbientPlaying) {
      stopAmbientSound();
      setIsAmbientPlaying(false);
    } else {
      playAmbientSound(ambientType, ambientVolume);
      setIsAmbientPlaying(true);
    }
  };

  const changeAmbientType = (type: AmbientSoundType) => {
    setAmbientType(type);
    if (isAmbientPlaying) {
      playAmbientSound(type, ambientVolume);
    }
  };

  const setAmbientVolumeLevel = (vol: number) => {
    setAmbientVolume(vol);
    updateAmbientVolume(vol);
  };

  // Tasks
  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextCompleted = !t.completed;
          if (nextCompleted) {
            addXp(t.xp);
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.7 },
            });
          }
          return { ...t, completed: nextCompleted };
        }
        return t;
      })
    );
  };

  const addTask = (taskData: Omit<TaskItem, 'id' | 'completed'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `t-${Date.now()}`,
      completed: false,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Habits
  const incrementHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextCount = Math.min(h.currentCount + 1, h.targetCount * 2);
          if (nextCount === h.targetCount) {
            addXp(20);
            confetti({
              particleCount: 50,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
          return { ...h, currentCount: nextCount, lastUpdated: new Date().toISOString() };
        }
        return h;
      })
    );
  };

  const resetHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, currentCount: 0 } : h))
    );
  };

  // Routine
  const toggleRoutineSlot = (id: string) => {
    setRoutineSlots((prev) =>
      prev.map((slot) => {
        if (slot.id === id) {
          const nextState = !slot.completed;
          if (nextState) {
            addXp(slot.xp);
            confetti({
              particleCount: 30,
              spread: 50,
              origin: { y: 0.7 },
            });
          }
          return { ...slot, completed: nextState };
        }
        return slot;
      })
    );
  };

  // Highlights
  const addHighlight = (data: Omit<MemoryHighlight, 'id' | 'date'>) => {
    const item: MemoryHighlight = {
      ...data,
      id: `m-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    setHighlights((prev) => [item, ...prev]);
    addXp(15);
  };

  const deleteHighlight = (id: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== id));
  };

  // Companion chat
  const addCompanionMessage = (msg: Omit<CompanionMessage, 'id' | 'timestamp'>) => {
    const newMsg: CompanionMessage = {
      ...msg,
      id: `chat-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };
    setCompanionMessages((prev) => [...prev, newMsg]);
  };

  const clearCompanionChat = () => {
    setCompanionMessages([
      {
        id: `m-${Date.now()}`,
        role: 'model',
        text: 'Lịch sử trò chuyện đã được làm mới. Mình đang ở đây, bạn muốn bắt đầu điều gì tiếp theo?',
        timestamp: 'Vừa xong',
      },
    ]);
  };

  const toggleDoNotDisturb = () => {
    setDoNotDisturb((prev) => !prev);
  };

  const level = Math.floor(xp / 100) + 1;
  const xpInLevel = xp % 100;

  return (
    <AppContext.Provider
      value={{
        mode,
        setMode,
        activePillar,
        setActivePillar,
        studySubTab,
        setStudySubTab,
        user,
        userProfile,
        isAdmin,
        isRealAdmin,
        effectiveRole,
        isRolePreviewActive,
        toggleRolePreview,
        showRoleModal,
        setShowRoleModal,
        loadingAuth,
        loginWithGoogle,
        logout,
        allUsers,
        fetchAllUsers,
        updateUserRole,
        announcements,
        broadcastAnnouncement,
        deleteAnnouncement,
        xp,
        level,
        xpInLevel,
        streak,
        addXp,
        isAmbientPlaying,
        ambientType,
        ambientVolume,
        toggleAmbientSound,
        changeAmbientType,
        setAmbientVolumeLevel,
        tasks,
        toggleTask,
        addTask,
        deleteTask,
        habits,
        incrementHabit,
        resetHabit,
        routineSlots,
        setRoutineSlots,
        toggleRoutineSlot,
        highlights,
        addHighlight,
        deleteHighlight,
        companionPersona,
        setCompanionPersona,
        companionMessages,
        addCompanionMessage,
        clearCompanionChat,
        doNotDisturb,
        toggleDoNotDisturb,
        playChime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
