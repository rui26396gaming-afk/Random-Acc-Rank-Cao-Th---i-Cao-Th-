import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  Megaphone,
  Sparkles,
  Award,
  Crown,
  UserCheck,
  UserX,
  Trash2,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
  Activity,
  Cpu,
  Server,
  GitPullRequest,
  Clock,
  Search,
  Filter,
  Eye,
  RotateCcw,
  BookOpen,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole, UserProfile } from '../../types';

// Fallback community member profiles for initial demo if Firestore has only 1 user
const SAMPLE_COMMUNITY_MEMBERS: UserProfile[] = [
  {
    uid: 'demo-user-1',
    email: 'minhquan.toan@omnilife.edu.vn',
    displayName: 'Minh Quân (Chuyên Toán KHTN)',
    role: 'user',
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
    role: 'user',
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
    role: 'admin',
    xp: 920,
    level: 10,
    streak: 22,
    createdAt: '2026-10-10T09:15:00Z',
    updatedAt: '2026-10-24T16:00:00Z',
  },
];

export const AdminPillar: React.FC = () => {
  const {
    isAdmin,
    isRealAdmin,
    effectiveRole,
    isRolePreviewActive,
    toggleRolePreview,
    setShowRoleModal,
    setActivePillar,
    user,
    userProfile,
    allUsers,
    fetchAllUsers,
    updateUserRole,
    announcements,
    broadcastAnnouncement,
    deleteAnnouncement,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'announcements' | 'telemetry' | 'matrix'>('users');
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [telemetryData, setTelemetryData] = useState<any>(null);
  const [trainingStatus, setTrainingStatus] = useState<any>(null);
  const [patchList, setPatchList] = useState<any[]>([]);
  const [loadingTelemetry, setLoadingTelemetry] = useState<boolean>(false);

  // Search & Filter in Users tab
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');

  // New Announcement Form State
  const [annTitle, setAnnTitle] = useState<string>('');
  const [annContent, setAnnContent] = useState<string>('');
  const [annPriority, setAnnPriority] = useState<'low' | 'normal' | 'urgent'>('normal');
  const [annSubmitting, setAnnSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    await fetchAllUsers();
    setLoadingUsers(false);
  };

  const loadTelemetry = async () => {
    setLoadingTelemetry(true);
    try {
      const [telemRes, trainRes, patchRes] = await Promise.all([
        fetch('/api/admin/telemetry', {
          headers: { 'x-user-role': 'admin' },
        }),
        fetch('/api/training/status'),
        fetch('/api/admin/patches', {
          headers: { 'x-user-role': 'admin' },
        }),
      ]);
      if (telemRes.ok) setTelemetryData(await telemRes.json());
      if (trainRes.ok) setTrainingStatus(await trainRes.json());
      if (patchRes.ok) {
        const d = await patchRes.json();
        setPatchList(d.patches || []);
      }
    } catch (e) {
      console.warn('Cannot fetch telemetry', e);
    } finally {
      setLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'telemetry') {
      loadTelemetry();
    }
  }, [activeTab]);

  const handleRoleToggle = async (targetUid: string, currentRole: UserRole) => {
    const newRole: UserRole = currentRole === 'admin' ? 'user' : 'admin';
    await updateUserRole(targetUid, newRole);
    setStatusMessage(
      newRole === 'admin'
        ? `Đã thăng cấp thành viên thành QUẢN TRỊ VIÊN (Admin) 👑 thành công!`
        : `Đã chuyển vai trò người dùng về THÀNH VIÊN (Member) 🎓 thành công!`
    );
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annContent.trim()) return;
    setAnnSubmitting(true);
    await broadcastAnnouncement(annTitle, annContent, annPriority);
    setAnnTitle('');
    setAnnContent('');
    setAnnSubmitting(false);
    setStatusMessage('Đã phát thông báo thành công tới tất cả người dùng OmniLife!');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Merge Firestore users with current admin & sample community members if list is small
  const displayUserList: UserProfile[] = useMemo(() => {
    const map = new Map<string, UserProfile>();

    // Current logged-in user
    if (userProfile) {
      map.set(userProfile.uid, { ...userProfile });
    } else if (user) {
      map.set(user.uid, {
        uid: user.uid,
        email: user.email || 'user@omnilife.app',
        displayName: user.displayName || 'Bạn (Quản Trị)',
        role: isAdmin ? 'admin' : 'user',
        xp: 340,
        level: 4,
        streak: 7,
        createdAt: new Date().toISOString(),
      });
    }

    // Live fetched users from Firestore
    allUsers.forEach((u) => {
      map.set(u.uid, u);
    });

    // If only 1 user exists, add sample community members so table is rich & interactive
    if (map.size <= 2) {
      SAMPLE_COMMUNITY_MEMBERS.forEach((m) => {
        if (!map.has(m.uid)) {
          map.set(m.uid, m);
        }
      });
    }

    let list = Array.from(map.values());

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(q) ||
          u.email?.toLowerCase().includes(q) ||
          u.uid.toLowerCase().includes(q)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      list = list.filter((u) => u.role === roleFilter);
    }

    return list;
  }, [allUsers, userProfile, user, isAdmin, searchQuery, roleFilter]);

  // ==========================================
  // VIEW FOR NON-ADMIN MEMBERS (Thành Viên Hub)
  // ==========================================
  if (!isAdmin) {
    return (
      <div className="space-y-6">
        {/* Member Role Banner */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/60 border border-blue-500/40 relative overflow-hidden shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Trung Tâm Phân Quyền Thành Viên (Member Hub)</span>
              </div>
              <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Vai Trò Của Bạn:</span>
                <span className="text-blue-400">Thành Viên (Member) 🎓</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Bạn đang sử dụng tài khoản Thành Viên chính thức của OmniLife. Bạn có toàn quyền sử dụng toàn bộ hệ sinh thái trí tuệ nhân tạo, giải bài tập, luyện thi và tự động ghi nhận thời gian học!
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 shrink-0">
              <button
                onClick={() => setShowRoleModal(true)}
                className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
              >
                <Layers className="w-4 h-4" />
                <span>Xem Bảng Ma Trận Phân Quyền</span>
              </button>

              {/* If superadmin is previewing as member, show exit button */}
              {isRolePreviewActive && (
                <button
                  onClick={toggleRolePreview}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Quay lại quyền Admin 👑</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Member Privileges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              🧠
            </div>
            <h4 className="font-bold text-white text-sm">AI Universal Solver &amp; RAG</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Giải quyết mọi bài toán, đề thi, bài văn nghị luận xã hội và tiếng Anh theo từng bước có dẫn chứng thực tế.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ⏱️
            </div>
            <h4 className="font-bold text-white text-sm">Tự Động Đo Giờ Học Không Cần Bấm</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tự động tích lũy thời gian học khi bạn hoạt động và tự dừng khi bạn rời tab hoặc nghỉ quá 3 phút (Anti-AFK).
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              🏆
            </div>
            <h4 className="font-bold text-white text-sm">Vinh Danh Bảng Vàng Chăm Học</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Thành tích thời gian học của bạn được đồng bộ lên Bảng Xếp Hạng cộng đồng theo ngày, tuần và toàn thời gian.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              🤖
            </div>
            <h4 className="font-bold text-white text-sm">AI Companion Cá Nhân</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Trò chuyện, tâm sự và nhận lời khuyên tâm lý cá nhân hóa theo từng tâm trạng học tập và sinh hoạt.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              📝
            </div>
            <h4 className="font-bold text-white text-sm">Quản Lý Todo &amp; Thói Quen</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Lưu trữ danh sách công việc, thói quen rèn luyện chuỗi streak và bộ sưu tập kỷ niệm ý nghĩa.
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              🔒
            </div>
            <h4 className="font-bold text-white text-sm">Quyền Quản Trị Hệ Thống</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Phân quyền thành viên, phát thông báo toàn app và telemetry được bảo vệ bởi Firestore Rules &amp; API 403.
            </p>
          </div>
        </div>

        {/* Explain why admin features are restricted */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-amber-400 shrink-0" />
            <div className="text-xs text-slate-300">
              <strong>Vì sao quyền Admin được bảo vệ nghiêm ngặt?</strong> Hệ thống OmniLife sử dụng cơ chế bảo mật Zero-Trust ABAC. Thành viên không thể tự nâng quyền để chống gian lận thời gian và bảo vệ cơ sở dữ liệu học tập.
            </div>
          </div>
          <button
            onClick={() => {
              setActivePillar('study');
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Vào Học Ngay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW FOR ADMIN (Quản Trị Viên Control Center)
  // ==========================================
  const totalAdmins = displayUserList.filter((u) => u.role === 'admin').length;
  const totalRegularUsers = displayUserList.filter((u) => u.role === 'user').length;

  return (
    <div className="space-y-6">
      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-red-600/20 via-orange-600/10 to-transparent border border-red-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600 text-white shadow-md">
              <Crown className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              OmniLife Control Center (Quản Trị Hệ Thống)
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-black uppercase tracking-wider">
              ADMIN RBAC
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Quản trị phân quyền thành viên (Admin/Member), phát thông báo toàn hệ thống, giám sát AI Gateway &amp; Telemetry.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex flex-wrap items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-700 gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Phân Quyền Thành Viên ({displayUserList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'announcements'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>Thông Báo ({announcements.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'telemetry'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>AI Gateway &amp; Logs</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ma Trận RBAC</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{statusMessage}</span>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Tổng Thành Viên</span>
            <div className="text-2xl font-black text-white mt-1">{displayUserList.length}</div>
            <span className="text-[10px] text-slate-400">Thành viên đăng ký</span>
          </div>
          <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Quản Trị Viên (Admin)</span>
            <div className="text-2xl font-black text-red-400 mt-1">{totalAdmins}</div>
            <span className="text-[10px] text-red-300/80">Toàn quyền hệ thống</span>
          </div>
          <div className="p-3 rounded-2xl bg-red-500/20 text-red-400">
            <Crown className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Thành Viên (Member)</span>
            <div className="text-2xl font-black text-blue-400 mt-1">{totalRegularUsers}</div>
            <span className="text-[10px] text-blue-300/80">Người dùng học tập</span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase text-slate-400">Thông Báo Phát Sóng</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{announcements.length}</div>
            <span className="text-[10px] text-slate-400">Tin tức toàn app</span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
            <Megaphone className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TAB 1: USERS & RBAC MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-500" />
                <span>Danh Sách Thành Viên &amp; Phân Quyền (RBAC)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Bấm nút thao tác để thăng cấp thành viên lên Admin hoặc chuyển về Member.
              </p>
            </div>

            <button
              onClick={loadUsers}
              disabled={loadingUsers}
              className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
              <span>Đồng bộ Firestore</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 pb-1 border-t border-slate-800">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên hoặc email..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setRoleFilter('all')}
                className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  roleFilter === 'all' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                Tất cả ({displayUserList.length})
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  roleFilter === 'admin' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                👑 Admin ({totalAdmins})
              </button>
              <button
                onClick={() => setRoleFilter('user')}
                className={`flex-1 sm:flex-none px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  roleFilter === 'user' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                🎓 Thành Viên ({totalRegularUsers})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/90 text-slate-300 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Thành viên</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Vai Trò Hiện Tại</th>
                  <th className="p-3">Cấp Độ &amp; XP</th>
                  <th className="p-3">Chuỗi Streak</th>
                  <th className="p-3 text-right">Thao Tác Phân Quyền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 bg-slate-900">
                {displayUserList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500 italic">
                      Không tìm thấy thành viên nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  displayUserList.map((u) => {
                    const isRootSuperadmin = u.email?.toLowerCase() === 'pthina650@gmail.com';
                    const isCurrentUser = u.uid === user?.uid;
                    const isAdminUser = u.role === 'admin';

                    return (
                      <tr key={u.uid} className={`hover:bg-slate-800/40 transition ${isCurrentUser ? 'bg-indigo-950/20' : ''}`}>
                        <td className="p-3 flex items-center gap-2.5">
                          {u.photoURL ? (
                            <img src={u.photoURL} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-700" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center text-[11px]">
                              {u.displayName?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white">{u.displayName || 'Thành viên'}</span>
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[9px] font-black rounded-full uppercase">
                                  Bạn
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">UID: {u.uid.slice(0, 10)}...</span>
                          </div>
                        </td>

                        <td className="p-3 font-mono text-slate-300">{u.email}</td>

                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full font-black text-[10px] uppercase tracking-wider inline-flex items-center gap-1 border ${
                              isAdminUser
                                ? 'bg-red-500/20 text-red-400 border-red-500/40'
                                : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                            }`}
                          >
                            {isAdminUser ? '👑 Quản Trị (Admin)' : '🎓 Thành Viên (Member)'}
                          </span>
                        </td>

                        <td className="p-3 text-slate-300">
                          <span className="font-bold text-indigo-400">Lv.{u.level || 1}</span>{' '}
                          <span className="text-slate-500">({u.xp || 0} XP)</span>
                        </td>

                        <td className="p-3 text-orange-400 font-bold">🔥 {u.streak || 0} ngày</td>

                        <td className="p-3 text-right">
                          {isRootSuperadmin ? (
                            <span className="text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-1 rounded-lg">
                              🛡️ Root Superadmin
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRoleToggle(u.uid, u.role)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer active:scale-95 shadow-sm ${
                                isAdminUser
                                  ? 'bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40'
                                  : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                              }`}
                            >
                              {isAdminUser ? 'Hạ xuống Thành Viên 🎓' : 'Thăng cấp lên Admin 👑'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ANNOUNCEMENTS MANAGEMENT */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* Post New Announcement Form */}
          <form
            onSubmit={handleBroadcast}
            className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-emerald-400" />
                <span>Phát Thông Báo Toàn Hệ Thống (Broadcast)</span>
              </h3>
              <span className="text-xs text-slate-400">Mọi thành viên sẽ nhìn thấy thông báo này</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder="Tiêu đề thông báo..."
                  className="w-full p-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              <div>
                <select
                  value={annPriority}
                  onChange={(e) => setAnnPriority(e.target.value as any)}
                  className="w-full p-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="normal">Mức độ: Bình thường</option>
                  <option value="urgent">Mức độ: Khẩn cấp (Đỏ)</option>
                  <option value="low">Mức độ: Nhắc nhở nhẹ</option>
                </select>
              </div>
            </div>

            <textarea
              rows={3}
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              placeholder="Nội dung thông báo phát sóng tới tất cả thành viên..."
              className="w-full p-3 rounded-2xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-red-500"
              required
            />

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={annSubmitting}
                className="px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-red-600/30 transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>{annSubmitting ? 'Đang phát sóng...' : 'Gửi Thông Báo Hệ Thống'}</span>
              </button>
            </div>
          </form>

          {/* Announcements List */}
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <span>Danh Sách Thông Báo Đã Phát Sóng ({announcements.length})</span>
            </h3>

            {announcements.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 text-center">
                Chưa có thông báo nào được phát sóng từ Admin.
              </p>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{ann.title}</span>
                        <span
                          className={`text-[9px] uppercase px-2 py-0.5 rounded font-black tracking-wider ${
                            ann.priority === 'urgent'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          }`}
                        >
                          {ann.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{ann.content}</p>
                      <div className="text-[10px] text-slate-500">
                        Người gửi: {ann.authorEmail} &bull; {new Date(ann.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="self-end sm:self-center p-2 rounded-xl bg-slate-700 hover:bg-rose-600/30 text-slate-400 hover:text-rose-400 transition cursor-pointer"
                      title="Xóa thông báo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TELEMETRY & LOGS */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Providers Status */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span>Trạng Thái Cấu Hình Nhà Cung Cấp AI</span>
                </div>
                <button
                  onClick={loadTelemetry}
                  disabled={loadingTelemetry}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTelemetry ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {['gemini', 'openai', 'anthropic', 'deepseek'].map((prov) => {
                  const isConf = telemetryData?.summary?.providers?.[prov] ?? false;
                  return (
                    <div
                      key={prov}
                      className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between"
                    >
                      <span className="font-bold uppercase text-[11px] text-slate-300">{prov}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isConf ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {isConf ? 'ACTIVE' : 'NOT_CONFIG'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Training Gate Status */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Server className="w-4 h-4 text-amber-400" />
                <span>Training Gate &amp; Fine-Tuning Cluster</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Trạng thái hạ tầng:</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                    trainingStatus?.status === 'READY'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {trainingStatus?.status || 'NOT_CONFIGURED'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {trainingStatus?.message || 'Hạ tầng huấn luyện chưa cấu hình. Không giả lập thay đổi trọng số mô hình.'}
                </p>
                <div className="pt-1 text-[10px] text-slate-400">
                  Phân tách rõ ràng: <b>RAG</b> (Truy xuất tài liệu đã thẩm định) độc lập với <b>Fine-Tuning</b>.
                </div>
              </div>
            </div>
          </div>

          {/* Telemetry Logs */}
          <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Clock className="w-4 h-4 text-blue-400" />
                <span>Nhật Ký Yêu Cầu AI (Telemetry Logs - Sanitized)</span>
              </div>
              <span className="text-[10px] text-slate-500">200 bản ghi gần nhất</span>
            </div>

            {(!telemetryData?.logs || telemetryData.logs.length === 0) ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-800/40 rounded-xl">
                Chưa có nhật ký yêu cầu nào được ghi nhận.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[10px] uppercase text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2 px-3">Thời gian</th>
                      <th className="py-2 px-3">Request ID</th>
                      <th className="py-2 px-3">Provider</th>
                      <th className="py-2 px-3">Model</th>
                      <th className="py-2 px-3">Latency</th>
                      <th className="py-2 px-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300 font-mono text-[11px]">
                    {telemetryData.logs.slice(0, 15).map((log: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-800/40">
                        <td className="py-2 px-3 text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString('vi-VN')}
                        </td>
                        <td className="py-2 px-3 text-indigo-300">{log.requestId}</td>
                        <td className="py-2 px-3 uppercase text-[10px]">{log.provider}</td>
                        <td className="py-2 px-3 text-slate-400">{log.model}</td>
                        <td className="py-2 px-3">{log.latencyMs}ms</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                              log.status === 'success'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RBAC SECURITY RULES MATRIX */}
      {activeTab === 'matrix' && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Kiến Trúc Phân Quyền Bảo Mật (RBAC Security Architecture)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Chi tiết quy tắc phân quyền đã triển khai trên Firestore Security Rules và Server API Routes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-red-400">
                <Crown className="w-4 h-4" />
                <span>Quyền Hạn Của Quản Trị Viên (Admin)</span>
              </div>
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Phân quyền thành viên:</strong> Nâng cấp bất kỳ thành viên nào lên Admin hoặc hạ xuống Member.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Phát thông báo toàn hệ thống:</strong> Gửi thông báo khẩn cấp hoặc tin tức hiển thị cho toàn bộ người dùng app.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Giám sát AI Gateway:</strong> Kiểm tra tỷ lệ lỗi 503/429, độ trễ và nhật ký yêu cầu an toàn.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Xem danh sách người dùng:</strong> Firestore cấp quyền <code>allow list: if isAdmin();</code> độc quyền cho Admin.
                  </span>
                </li>
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm text-blue-400">
                <Users className="w-4 h-4" />
                <span>Quyền Hạn Của Thành Viên (Member)</span>
              </div>
              <ul className="text-xs space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Toàn bộ công cụ AI:</strong> Sử dụng Universal Solver, Giải toán Logic, Lập dàn ý văn học, Luyện đề tiếng Anh.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Tự động tính thời gian học:</strong> Tự động tích lũy thời gian học không cần bấm và vinh danh trên Bảng Xếp Hạng.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Dữ liệu cá nhân độc lập:</strong> Quản lý Todo cá nhân, Habit, Thói quen sinh hoạt và Kỷ niệm.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>Không thể tự thăng quyền:</strong> Quy tắc Firestore ngăn chặn cập nhật trường <code>role</code> từ client.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
