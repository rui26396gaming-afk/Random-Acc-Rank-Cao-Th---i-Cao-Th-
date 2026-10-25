import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MusicPlayerProvider } from './context/MusicPlayerContext';
import { Navbar } from './components/Navbar';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { FocusPomodoro } from './components/FocusPomodoro';
import { StudyPillar } from './components/pillars/StudyPillar';
import { GamingPillar } from './components/pillars/GamingPillar';
import { RoutinePillar } from './components/pillars/RoutinePillar';
import { CompanionPillar } from './components/pillars/CompanionPillar';
import { AdminPillar } from './components/pillars/AdminPillar';
import { ChillStudio } from './components/ChillStudio';
import { RolePermissionModal } from './components/RolePermissionModal';
import {
  Sparkles,
  Calculator,
  PenTool,
  Calendar,
  Bot,
  Gamepad2,
  Coffee,
  CheckCircle2,
  Compass,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Crown,
  Languages,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    mode,
    activePillar,
    setActivePillar,
    studySubTab,
    setStudySubTab,
    doNotDisturb,
    isAdmin,
    showRoleModal,
    setShowRoleModal,
  } = useApp();

  return (
    <div
      className={`min-h-screen transition-colors duration-500 font-sans ${
        mode === 'focus'
          ? 'bg-slate-900 text-slate-100'
          : mode === 'gaming'
          ? 'bg-[#0f0a1c] text-slate-100'
          : 'bg-[#181310] text-slate-100'
      }`}
    >
      <Navbar />

      {/* Do Not Disturb Banner when enabled */}
      {doNotDisturb && (
        <div className="bg-rose-600/90 text-white text-xs py-2 px-4 text-center font-bold flex items-center justify-center gap-2 shadow-inner">
          <ShieldAlert className="w-4 h-4" />
          <span>
            Chế độ Tập Trung Cao Độ (Do Not Disturb) đang bật. Mọi thông báo không cần thiết đã được ẩn để bạn tập trung trọn vẹn!
          </span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Quick Launchpad Hero (Responding directly to user's question) */}
        <section className={`p-6 rounded-3xl border transition-all relative overflow-hidden ${
          mode === 'focus'
            ? 'bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900/60 border-blue-800/40'
            : mode === 'gaming'
            ? 'bg-gradient-to-r from-purple-900/40 via-pink-900/20 to-slate-900/60 border-purple-800/40'
            : 'bg-gradient-to-r from-amber-900/40 via-orange-900/20 to-slate-900/60 border-amber-800/40'
        }`}>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-indigo-400">
                <Sparkles className="w-4 h-4" />
                <span>Hệ Sinh Thái Toàn Năng OmniLife Đã Sẵn Sàng</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black tracking-tight text-white">
                Bạn muốn thử nghiệm ngay tính năng nào trước?
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Chọn một trong các mục tiêu dưới đây để AI kích hoạt công cụ phân tích logic, sáng tạo văn phong hoặc tối ưu thời gian biểu ngay lập tức.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setActivePillar('study');
                  setStudySubTab('english');
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                className="p-3 rounded-2xl bg-teal-600/30 hover:bg-teal-600/50 border border-teal-500/40 backdrop-blur-sm transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Languages className="w-5 h-5 text-teal-300" />
                <span className="text-xs font-bold text-white">Giải Tiếng Anh</span>
              </button>

              <button
                onClick={() => {
                  setActivePillar('study');
                  setStudySubTab('math');
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Calculator className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-bold text-white">Giải Toán Khó</span>
              </button>

              <button
                onClick={() => {
                  setActivePillar('study');
                  setStudySubTab('leaderboard');
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                className="p-3 rounded-2xl bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 backdrop-blur-sm transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span className="text-xs font-bold text-white">BXH Chăm Học</span>
              </button>

              <button
                onClick={() => {
                  setActivePillar('routine');
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Calendar className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-bold text-white">Lập Lịch Tuần</span>
              </button>

              <button
                onClick={() => setShowRoleModal(true)}
                className="p-3 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 backdrop-blur-sm transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-95"
                title="Kiểm tra phân quyền Admin & Thành Viên"
              >
                <ShieldCheck className="w-5 h-5 text-indigo-300" />
                <span className="text-xs font-bold text-white">Phân Quyền</span>
              </button>

              {isAdmin ? (
                <button
                  onClick={() => {
                    setActivePillar('admin');
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  className="p-3 rounded-2xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 backdrop-blur-sm transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span className="text-xs font-bold text-white">Admin Panel</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setActivePillar('companion');
                    window.scrollTo({ top: 380, behavior: 'smooth' });
                  }}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm transition flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Bot className="w-5 h-5 text-pink-400" />
                  <span className="text-xs font-bold text-white">AI Companion</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Layout Grid: Main Pillar View + Side Pomodoro or Quick Helper */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Pillar Content Area (3 cols) */}
          <div className="lg:col-span-3 space-y-6">
            {activePillar === 'study' && <StudyPillar />}
            {activePillar === 'gaming' && <GamingPillar />}
            {activePillar === 'routine' && <RoutinePillar />}
            {activePillar === 'companion' && <CompanionPillar />}
            {activePillar === 'admin' && <AdminPillar />}

            {/* If in Chill mode and not in routine pillar, show ChillStudio as complementary */}
            {mode === 'chill' && activePillar !== 'routine' && (
              <div className="mt-8 pt-6 border-t border-slate-800">
                <ChillStudio />
              </div>
            )}
          </div>

          {/* Sidebar Area (1 col): Focus Pomodoro & Quick Insights */}
          <aside className="space-y-6">
            <FocusPomodoro />

            {/* Mode-Specific Sidebar Widget */}
            {mode === 'focus' && (
              <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700/80 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-blue-400">
                  <Compass className="w-4 h-4" />
                  <span>Trạng Thái Focus Mode</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Giao diện đang tối ưu cho việc suy luận toán học và hành văn. Không pop-up quấy rầy.
                </p>
                <div className="pt-2 border-t border-slate-700 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>Độ tập trung:</span>
                    <span className="font-bold text-emerald-400">Tối đa (100%)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Âm thanh nền:</span>
                    <span className="text-slate-400">Lofi / Mưa êm dịu</span>
                  </div>
                </div>
              </div>
            )}

            {mode === 'gaming' && (
              <div className="p-5 rounded-3xl bg-purple-950/40 border border-purple-800/60 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-purple-400">
                  <Gamepad2 className="w-4 h-4" />
                  <span>Trạng Thái Cyber Gaming</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hiệu suất tối đa. Đã kích hoạt bộ đếm thời gian phiên chơi để chống mỏi mắt và tránh tilt khi leo rank.
                </p>
                <button
                  onClick={() => setActivePillar('gaming')}
                  className="w-full py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Xem Chiến Thuật &amp; Kỷ Niệm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {mode === 'chill' && (
              <div className="p-5 rounded-3xl bg-amber-950/30 border border-amber-800/40 shadow-sm space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-amber-400">
                  <Coffee className="w-4 h-4" />
                  <span>Trạng Thái Chillout</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hãy thư giãn đôi mắt, nhấp một ngụm trà ấm và lắng nghe tiếng mưa hoặc tiếng sóng biển nhẹ nhàng.
                </p>
                <button
                  onClick={() => setActivePillar('companion')}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <span>Tâm Sự Với AI Companion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Floating Action Quick Companion Trigger */}
      {activePillar !== 'companion' && (
        <button
          onClick={() => {
            setActivePillar('companion');
            window.scrollTo({ top: 380, behavior: 'smooth' });
          }}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 shadow-xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Trò chuyện nhanh cùng AI Companion"
        >
          <Bot className="w-5 h-5 animate-bounce" />
          <span>AI Companion</span>
        </button>
      )}

      {/* Role & Permissions Modal (RBAC Inspector) */}
      <RolePermissionModal isOpen={showRoleModal} onClose={() => setShowRoleModal(false)} />

      {/* Background Music Player (Always alive across tabs and pillars) */}
      <BackgroundMusicPlayer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MusicPlayerProvider>
        <MainContent />
      </MusicPlayerProvider>
    </AppProvider>
  );
}
