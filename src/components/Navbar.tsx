import React, { useState } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Gamepad2,
  CalendarCheck,
  Bot,
  BellOff,
  Bell,
  SlidersHorizontal,
  Crown,
  LogIn,
  LogOut,
  User as UserIcon,
  Megaphone,
  Music,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { PillarId } from '../types';
import { AmbientSoundType } from '../utils/audioSynthesizer';

export const Navbar: React.FC = () => {
  const {
    mode,
    setMode,
    activePillar,
    setActivePillar,
    user,
    userProfile,
    isAdmin,
    loginWithGoogle,
    logout,
    announcements,
    xp,
    level,
    xpInLevel,
    streak,
    isAmbientPlaying,
    ambientType,
    ambientVolume,
    toggleAmbientSound,
    changeAmbientType,
    setAmbientVolumeLevel,
    doNotDisturb,
    toggleDoNotDisturb,
    showRoleModal,
    setShowRoleModal,
    isRolePreviewActive,
    toggleRolePreview,
    isRealAdmin,
  } = useApp();

  const {
    playlist: musicPlaylist,
    isPlaying: isMusicPlaying,
    currentTrack: currentMusicTrack,
    setIsExpanded: setIsMusicExpanded,
  } = useMusicPlayer();

  const [showSoundMenu, setShowSoundMenu] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);

  const pillars: { id: PillarId; label: string; icon: React.ReactNode; badge?: string; adminOnly?: boolean }[] = [
    { id: 'study', label: 'Học tập & Trí tuệ', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'gaming', label: 'Giải trí & Gaming', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'routine', label: 'Sinh hoạt & Thói quen', icon: <CalendarCheck className="w-4 h-4" /> },
    { id: 'companion', label: 'AI Companion', icon: <Bot className="w-4 h-4" />, badge: 'AI' },
    ...(isAdmin
      ? [
          {
            id: 'admin' as PillarId,
            label: 'Quản Trị Hệ Thống',
            icon: <Crown className="w-4 h-4 text-amber-400" />,
            badge: 'Admin',
            adminOnly: true,
          },
        ]
      : [
          {
            id: 'admin' as PillarId,
            label: 'Phân Quyền & Vai Trò',
            icon: <ShieldCheck className="w-4 h-4 text-blue-400" />,
            badge: 'Member',
          },
        ]),
  ];

  const soundOptions: { type: AmbientSoundType; label: string; emoji: string }[] = [
    { type: 'rain', label: 'Mưa rơi ấm áp', emoji: '🌧️' },
    { type: 'waves', label: 'Sóng biển đêm', emoji: '🌊' },
    { type: 'campfire', label: 'Lửa trại tí tách', emoji: '🔥' },
    { type: 'lofi', label: 'Lofi Chords thư giãn', emoji: '☕' },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-opacity-90 border-b border-slate-800/80 bg-slate-900/80 transition-colors duration-300">
      {/* Role Preview Banner for Root Admin Testing */}
      {isRolePreviewActive && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              <strong>Chế độ xem trước RBAC:</strong> Bạn đang kiểm tra app dưới tư cách <strong>Thành Viên (Member)</strong>. Các tính năng Admin đã bị khóa an toàn.
            </span>
          </div>
          <button
            onClick={toggleRolePreview}
            className="px-2.5 py-0.5 rounded-lg bg-slate-950 text-amber-300 text-[11px] font-black hover:bg-slate-900 transition ml-2 shrink-0 cursor-pointer"
          >
            Quay lại quyền Admin 👑
          </button>
        </div>
      )}

      {/* Top Banner & Mode Switcher */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md transition-all duration-300 ${
                mode === 'focus'
                  ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-blue-500/20'
                  : mode === 'gaming'
                  ? 'bg-gradient-to-tr from-purple-600 to-pink-500 shadow-purple-500/25 ring-1 ring-purple-400/50'
                  : 'bg-gradient-to-tr from-amber-500 to-orange-500 shadow-amber-500/20'
              }`}
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  OmniLife
                </span>
                <span
                  className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full tracking-wider border ${
                    mode === 'focus'
                      ? 'bg-blue-950/60 text-blue-300 border-blue-800'
                      : mode === 'gaming'
                      ? 'bg-purple-900/40 text-purple-300 border-purple-500/50'
                      : 'bg-amber-950/60 text-amber-300 border-amber-800'
                  }`}
                >
                  {mode === 'focus' ? '🎯 Focus' : mode === 'gaming' ? '⚡ Cyber Gaming' : '☕ Chillout'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Hệ sinh thái Toàn năng &amp; Trợ lý Tâm lý AI
              </p>
            </div>
          </div>

          {/* Core Mode Switcher Pill */}
          <div className="bg-slate-800/80 p-1 rounded-2xl flex items-center border border-slate-700/60 shadow-inner">
            <button
              onClick={() => setMode('focus')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                mode === 'focus'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-bold'
                  : 'text-slate-300 hover:text-blue-400'
              }`}
              title="Chế độ Tập trung: Làm toán, Viết văn, Pomodoro"
            >
              <span>🎯 Focus</span>
            </button>
            <button
              onClick={() => setMode('gaming')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                mode === 'gaming'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold'
                  : 'text-slate-300 hover:text-purple-400'
              }`}
              title="Chế độ Gaming: Meta build, Leo rank, Game-Life balance"
            >
              <span>🎮 Gaming</span>
            </button>
            <button
              onClick={() => setMode('chill')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                mode === 'chill'
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold'
                  : 'text-slate-300 hover:text-amber-400'
              }`}
              title="Chế độ Thư giãn: Lofi beats, Thói quen nhẹ nhàng, Quản lý sinh hoạt"
            >
              <span>☕ Chill</span>
            </button>
          </div>

          {/* Right Area: Announcements, Ambient Sound, DND, XP & Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Announcements Bell */}
            <div className="relative">
              <button
                onClick={() => setShowAnnouncements(!showAnnouncements)}
                className={`p-2 rounded-xl border transition-all relative ${
                  announcements.length > 0
                    ? 'bg-slate-800 text-amber-400 border-slate-700'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
                title="Thông báo hệ thống từ Admin"
              >
                <Megaphone className="w-3.5 h-3.5" />
                {announcements.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                )}
              </button>

              {showAnnouncements && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 p-4 z-50 animate-in fade-in zoom-in-95 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Megaphone className="w-4 h-4 text-amber-400" /> Thông báo từ Admin
                    </span>
                    <span className="text-[10px] text-slate-400">{announcements.length} tin mới</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {announcements.length === 0 ? (
                      <p className="text-xs text-slate-500 italic text-center py-2">
                        Chưa có thông báo nào từ ban quản trị.
                      </p>
                    ) : (
                      announcements.map((ann) => (
                        <div key={ann.id} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white">{ann.title}</span>
                            <span
                              className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-bold ${
                                ann.priority === 'urgent'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}
                            >
                              {ann.priority}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug">{ann.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Custom Background Music Player Trigger */}
            <button
              onClick={() => setIsMusicExpanded(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                isMusicPlaying
                  ? 'bg-indigo-950/70 text-indigo-300 border-indigo-600/80 shadow-xs shadow-indigo-500/20'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/60'
              }`}
              title={
                isMusicPlaying
                  ? `Đang phát: ${currentMusicTrack?.name || 'Nhạc nền'} - Bấm để mở trình phát`
                  : 'Trình phát nhạc nền tự động (Kéo thả file .mp3)'
              }
            >
              {isMusicPlaying ? (
                <div className="flex items-end gap-0.5 h-3 w-3">
                  <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms] h-2"></span>
                  <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms] h-3"></span>
                  <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms] h-1.5"></span>
                </div>
              ) : (
                <Music className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="hidden sm:inline font-semibold">
                {isMusicPlaying && currentMusicTrack
                  ? currentMusicTrack.name.length > 15
                    ? currentMusicTrack.name.substring(0, 15) + '...'
                    : currentMusicTrack.name
                  : 'Bật Nhạc'}
              </span>
              {musicPlaylist.length > 0 && !isMusicPlaying && (
                <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.2 rounded-full font-mono">
                  {musicPlaylist.length}
                </span>
              )}
            </button>

            {/* Ambient Sound Controller */}
            <div className="relative">
              <button
                onClick={() => setShowSoundMenu(!showSoundMenu)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  isAmbientPlaying
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700 animate-pulse'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700/60'
                }`}
                title="Âm thanh nền Lofi / Mưa / Biển / Lửa trại"
              >
                {isAmbientPlaying ? (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span className="hidden md:inline">
                  {isAmbientPlaying
                    ? soundOptions.find((s) => s.type === ambientType)?.emoji + ' Phát'
                    : 'Âm thanh'}
                </span>
              </button>

              {showSoundMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-3 z-50 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Âm thanh thư giãn
                    </span>
                    <button
                      onClick={toggleAmbientSound}
                      className={`text-xs px-2 py-0.5 rounded-lg font-semibold transition ${
                        isAmbientPlaying
                          ? 'bg-rose-900/40 text-rose-300'
                          : 'bg-emerald-900/40 text-emerald-300'
                      }`}
                    >
                      {isAmbientPlaying ? 'Tắt' : 'Bật ngay'}
                    </button>
                  </div>

                  <div className="space-y-1 mb-3">
                    {soundOptions.map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => {
                          changeAmbientType(opt.type);
                          if (!isAmbientPlaying) toggleAmbientSound();
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition ${
                          ambientType === opt.type
                            ? 'bg-indigo-950/60 text-indigo-300 font-bold'
                            : 'text-slate-300 hover:bg-slate-700/50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{opt.emoji}</span>
                          <span>{opt.label}</span>
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-700">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span>Âm lượng</span>
                      <span>{Math.round(ambientVolume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="1"
                      step="0.05"
                      value={ambientVolume}
                      onChange={(e) => setAmbientVolumeLevel(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Do Not Disturb Toggle */}
            <button
              onClick={toggleDoNotDisturb}
              className={`p-2 rounded-xl border transition-all ${
                doNotDisturb
                  ? 'bg-rose-950/50 text-rose-300 border-rose-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
              }`}
              title={doNotDisturb ? 'Đang chặn xao nhãng (DND On)' : 'Chế độ không làm phiền'}
            >
              {doNotDisturb ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
            </button>

            {/* Streak & XP Gamification */}
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl shadow-xs">
              <div className="flex items-center gap-1 text-orange-500 font-bold text-xs" title={`${streak} ngày liên tiếp rèn luyện!`}>
                <Flame className="w-3.5 h-3.5 fill-orange-500 animate-bounce" />
                <span>{streak}d</span>
              </div>
              <div className="h-3 w-px bg-slate-700" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-indigo-400">
                    Lv.{level}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {xpInLevel}/100 XP
                  </span>
                </div>
                <div className="w-14 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${xpInLevel}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Auth / Profile Area */}
            {user ? (
              <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-xl">
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer text-left"
                  title="Bấm để xem chi tiết Hồ sơ & Phân quyền RBAC"
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full object-cover" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white max-w-[80px] sm:max-w-[110px] truncate leading-tight">
                      {user.displayName || 'Thành viên'}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                        isAdmin ? 'text-red-400' : 'text-blue-400'
                      }`}
                    >
                      {isAdmin ? '👑 Admin' : '🎓 Member'}
                    </span>
                  </div>
                </button>
                <button
                  onClick={logout}
                  className="p-1 text-slate-400 hover:text-rose-400 transition ml-1 cursor-pointer"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowRoleModal(true)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1 border border-slate-700 cursor-pointer"
                  title="Xem Bảng Ma Trận Phân Quyền (RBAC)"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="hidden sm:inline">Phân quyền</span>
                </button>
                <button
                  onClick={loginWithGoogle}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition cursor-pointer active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 4 Pillars + Admin Tab Navigation */}
        <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/80">
          {pillars.map((p) => {
            const isActive = activePillar === p.id;
            return (
              <button
                key={p.id}
                onClick={() => setActivePillar(p.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? p.adminOnly
                      ? 'bg-red-600 text-white shadow-sm shadow-red-600/30 font-bold'
                      : mode === 'gaming'
                      ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                      : mode === 'chill'
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                      : 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                {p.icon}
                <span>{p.label}</span>
                {p.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-black tracking-wider uppercase ${
                    p.adminOnly ? 'bg-amber-400 text-slate-900' : 'bg-white/20 text-white'
                  }`}>
                    {p.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
