import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  Trophy,
  ShieldAlert,
  Clock,
  Sparkles,
  Heart,
  Film,
  Quote,
  Flame,
  Plus,
  Trash2,
  ExternalLink,
  RotateCw,
  Play,
  Pause,
  RotateCcw,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { GamingStrategyResult, MemoryHighlight } from '../../types';
import { useApp } from '../../context/AppContext';

export const GamingPillar: React.FC = () => {
  const { highlights, addHighlight, deleteHighlight, addXp, mode } = useApp();
  const [tab, setTab] = useState<'strategy' | 'balance' | 'memories'>('strategy');

  // Strategy AI state
  const [gameTitle, setGameTitle] = useState<string>('Liên Minh Huyền Thoại (LMHT)');
  const [userStyle, setUserStyle] = useState<string>('Thích mở giao tranh, kiểm soát tầm nhìn và bảo kê chủ lực');
  const [userRank, setUserRank] = useState<string>('Bạch Kim - Kim Cương');
  const [strategyLoading, setStrategyLoading] = useState<boolean>(false);
  const [strategyResult, setStrategyResult] = useState<GamingStrategyResult | null>(null);
  const [strategyError, setStrategyError] = useState<string | null>(null);

  // Game-Life Balance Session Timer State
  const [sessionSeconds, setSessionSeconds] = useState<number>(0);
  const [sessionRunning, setSessionRunning] = useState<boolean>(false);
  const [breakReminderTriggered, setBreakReminderTriggered] = useState<boolean>(false);

  // Memories Form State
  const [showAddMemory, setShowAddMemory] = useState<boolean>(false);
  const [memTitle, setMemTitle] = useState<string>('');
  const [memCategory, setMemCategory] = useState<MemoryHighlight['category']>('game_highlight');
  const [memContent, setMemContent] = useState<string>('');
  const [memSource, setMemSource] = useState<string>('');
  const [memMood, setMemMood] = useState<string>('Hào hứng 🔥');

  const popularGames = [
    'Liên Minh Huyền Thoại (LMHT)',
    'Liên Quân Mobile (Arena of Valor)',
    'Valorant',
    'Genshin Impact',
    'PUBG / Free Fire',
    'FC Online (FIFA Online 4)',
    'Honkai: Star Rail',
    'CS2 (Counter-Strike 2)',
  ];

  // Session timer logic
  useEffect(() => {
    let interval: any = null;
    if (sessionRunning) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => {
          const next = prev + 1;
          // Check for 45 minutes limit
          if (next % (45 * 60) === 0) {
            setBreakReminderTriggered(true);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionRunning]);

  const formatSessionTime = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${hours}h ${mins.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFetchStrategy = async () => {
    if (!gameTitle.trim()) return;
    setStrategyLoading(true);
    setStrategyError(null);
    try {
      const res = await fetch('/api/gemini/gaming', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameTitle,
          userStyle,
          userRank,
        }),
      });
      if (!res.ok) throw new Error('Không thể tải chiến lược game.');
      const data = await res.json();
      setStrategyResult(data);
      addXp(25);
    } catch (err: any) {
      setStrategyError(err.message || 'Lỗi kết nối');
    } finally {
      setStrategyLoading(false);
    }
  };

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memTitle.trim() || !memContent.trim()) return;
    addHighlight({
      title: memTitle,
      category: memCategory,
      content: memContent,
      authorOrSource: memSource || undefined,
      moodTag: memMood,
    });
    setMemTitle('');
    setMemContent('');
    setMemSource('');
    setShowAddMemory(false);
  };

  return (
    <div className="space-y-6">
      {/* Pillar Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-purple-600/10 via-pink-600/5 to-transparent p-5 rounded-3xl border border-purple-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎮</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Trụ Cột 2: Giải Trí &amp; Gaming
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Chiến thuật meta &amp; build nhân vật, bộ đếm giờ Game-Life Balance và kho lưu giữ kỷ niệm đáng nhớ.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <button
            onClick={() => setTab('strategy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              tab === 'strategy'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Chiến Thuật Meta</span>
          </button>
          <button
            onClick={() => setTab('balance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              tab === 'balance'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Game-Life Balance</span>
          </button>
          <button
            onClick={() => setTab('memories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              tab === 'memories'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Kho Kỷ Niệm ({highlights.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STRATEGY & META BUILDS */}
      {tab === 'strategy' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-purple-600" />
                Chọn tựa game &amp; phong cách chơi của bạn
              </label>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                Meta cập nhật + Cách lên đồ + Mẹo leo rank
              </span>
            </div>

            {/* Quick Game Selector */}
            <div className="flex flex-wrap gap-2">
              {popularGames.map((game, idx) => (
                <button
                  key={idx}
                  onClick={() => setGameTitle(game)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                    gameTitle === game
                      ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300'
                  }`}
                >
                  {game}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Phong cách chơi &amp; vị trí mong muốn
                </label>
                <input
                  type="text"
                  value={userStyle}
                  onChange={(e) => setUserStyle(e.target.value)}
                  placeholder="Ví dụ: Đấu sĩ đường trên, Xạ thủ gánh đội, Hỗ trợ..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Bậc Rank hiện tại
                </label>
                <input
                  type="text"
                  value={userRank}
                  onChange={(e) => setUserRank(e.target.value)}
                  placeholder="Ví dụ: Vàng, Bạch Kim, Cao Thủ..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleFetchStrategy}
                disabled={strategyLoading || !gameTitle.trim()}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-purple-600/30 transition active:scale-95 cursor-pointer"
              >
                {strategyLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Đang tổng hợp meta &amp; build đồ...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Phân Tích Meta &amp; Chiến Lược Build</span>
                  </>
                )}
              </button>
            </div>

            {strategyError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {strategyError}
              </div>
            )}
          </div>

          {/* Strategy Results */}
          {strategyResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Meta Overview */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white shadow-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                    Phân Tích Xu Hướng Meta Mới Nhất
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-800/80 text-purple-200 font-mono">
                    {strategyResult.gameTitle}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-200">
                  {strategyResult.metaOverview}
                </p>
              </div>

              {/* Build Recommendations */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Đề Xuất Nhân Vật / Tướng &amp; Lối Build Tối Ưu
                </h3>

                <div className="space-y-3">
                  {strategyResult.bestBuilds.map((build, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                            {build.championOrRole}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300">
                            TIER {build.tier}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-bold text-slate-400 block mb-1">
                          Trang bị trấn phái &amp; Bảng ngọc:
                        </span>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 font-mono">
                          {build.coreItems}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200/50">
                          <span className="font-bold text-purple-700 dark:text-purple-300 block mb-0.5">
                            Chiến thuật theo giai đoạn:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {build.strategy}
                          </p>
                        </div>
                        <div className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200/50">
                          <span className="font-bold text-rose-700 dark:text-rose-300 block mb-0.5">
                            Đối sách &amp; Cách khắc chế:
                          </span>
                          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            {build.counterTips}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pro Habits & Balance Advice */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-orange-500" />
                    Thói Quen Leo Rank &amp; Giữ Tâm Lý (Anti-Tilt)
                  </h4>
                  <ul className="space-y-2">
                    {strategyResult.rankClimbingHabits.map((habit, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 p-2.5 rounded-xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-200/50"
                      >
                        <span className="text-orange-500 font-bold">•</span>
                        <span>{habit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-emerald-600" />
                    Game-Life Balance: Khuyến Nghị Thư Giãn
                  </h4>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60">
                    {strategyResult.gameLifeBalanceAdvice}
                  </p>

                  <span className="text-xs font-semibold text-slate-400 block pt-1">
                    Game thư giãn gợi ý:
                  </span>
                  <div className="space-y-1.5">
                    {strategyResult.recommendedChillGames.map((game, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {game.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{game.genre}</span>
                        </div>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 italic">
                          {game.why}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: GAME-LIFE BALANCE */}
      {tab === 'balance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Session Timer Widget */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-950 to-slate-900 text-white shadow-xl space-y-4 md:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Bộ Đếm Phiên Gaming
                </span>
                {sessionRunning && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </div>

              <div className="text-center py-4">
                <div className="text-4xl font-black font-mono tracking-wider text-purple-200">
                  {formatSessionTime(sessionSeconds)}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  Giới hạn khuyến nghị: 60 - 90 phút / ngày
                </p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setSessionRunning(!sessionRunning)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition active:scale-95 ${
                    sessionRunning
                      ? 'bg-amber-500 hover:bg-amber-600 text-slate-900'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  {sessionRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{sessionRunning ? 'Tạm dừng chơi' : 'Bắt đầu phiên game'}</span>
                </button>
                <button
                  onClick={() => {
                    setSessionRunning(false);
                    setSessionSeconds(0);
                    setBreakReminderTriggered(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
                  title="Đặt lại phiên"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {breakReminderTriggered && (
                <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs text-center animate-bounce">
                  ⚠️ Đã chơi hơn 45 phút! Hãy đứng dậy uống nước và nhìn ra xa 20 giây để bảo vệ mắt nhé!
                </div>
              )}
            </div>

            {/* Health & Anti-tilt Rules */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-emerald-500" />
                Quy Tắc Vàng "Game-Life Balance" Cho Game Thủ Thông Minh
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                    👁️ Quy Tắc 20-20-20
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Sau mỗi 20 phút nhìn màn hình, hãy phóng tầm mắt nhìn xa ít nhất 20 feet (6m) trong 20 giây để giảm mỏi cơ điều tiết của mắt.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-1">
                    🛡️ Quy Tắc 2 Trận Thua Liên Tiếp
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Nếu thua liên tiếp 2 trận rank, HÃY DỪNG NGAY. Não bộ lúc này đang bị kích thích cortisol gây tilt. Đi bộ 5 phút hoặc nghe lofi trước khi chơi tiếp.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1">
                    💧 Hydration &amp; Tư Thế Ngồi
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Luôn để sẵn một chai nước 500ml cạnh bàn máy tính. Giữ lưng thẳng, khuỷu tay 90 độ để tránh đau mỏi vai gáy sau này.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                    🏆 "Nhiệm Vụ Đổi Thưởng"
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    Chỉ đăng nhập vào game SAU KHI đã hoàn thành ít nhất 2 nhiệm vụ học tập hoặc bài tập toán/văn trong ngày. Coi game là phần thưởng xứng đáng!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: HIGHLIGHTS & MEMORIES REPOSITORY */}
      {tab === 'memories' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                Kho Lưu Giữ Kỷ Niệm &amp; Cảm Hứng
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lưu lại những pha highlight trong game, câu nói truyền cảm hứng, hoặc những bộ phim đáng xem.
              </p>
            </div>
            <button
              onClick={() => setShowAddMemory(!showAddMemory)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Kỷ Niệm (+15 XP)</span>
            </button>
          </div>

          {/* Add Memory Modal / Form */}
          {showAddMemory && (
            <form
              onSubmit={handleCreateMemory}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 shadow-lg space-y-4 animate-in fade-in"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Tạo Kỷ Niệm / Cảm Hứng Mới
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddMemory(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Đóng
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Tiêu đề</label>
                  <input
                    type="text"
                    required
                    value={memTitle}
                    onChange={(e) => setMemTitle(e.target.value)}
                    placeholder="Ví dụ: Penta-kill rồng ngàn tuổi, Câu trích dẫn hay..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Danh mục</label>
                  <select
                    value={memCategory}
                    onChange={(e) => setMemCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="game_highlight">🎮 Khoảnh khắc Highlight Game</option>
                    <option value="quote">💬 Danh ngôn / Trích dẫn hay</option>
                    <option value="movie">🎬 Phim ảnh đáng xem</option>
                    <option value="study_milestone">🎓 Cột mốc học tập</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Nội dung chi tiết / Cảm nghĩ</label>
                <textarea
                  rows={3}
                  required
                  value={memContent}
                  onChange={(e) => setMemContent(e.target.value)}
                  placeholder="Ghi lại cảm xúc, khoảnh khắc, bài học hoặc nội dung quote..."
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">
                    Nguồn / Tác giả / Tựa game (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={memSource}
                    onChange={(e) => setMemSource(e.target.value)}
                    placeholder="Ví dụ: LMHT, Christopher Nolan, Victor Hugo..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-500 mb-1 block">Tâm trạng (Mood Tag)</label>
                  <select
                    value={memMood}
                    onChange={(e) => setMemMood(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="Hào hứng 🔥">Hào hứng 🔥</option>
                    <option value="Sâu sắc 💡">Sâu sắc 💡</option>
                    <option value="Thư thái 🌿">Thư thái 🌿</option>
                    <option value="Tự hào 🌟">Tự hào 🌟</option>
                    <option value="Xúc động ❤️">Xúc động ❤️</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
                >
                  Lưu Vào Kho Kỷ Niệm
                </button>
              </div>
            </form>
          )}

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {item.category === 'game_highlight'
                        ? '🎮 Highlight'
                        : item.category === 'quote'
                        ? '💬 Danh ngôn'
                        : item.category === 'movie'
                        ? '🎬 Phim hay'
                        : '🎓 Cột mốc'}
                    </span>
                    <span className="font-medium text-slate-400">{item.moodTag}</span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {item.content}
                  </p>

                  {item.authorOrSource && (
                    <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-2">
                      — {item.authorOrSource}
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                  <span>{item.date}</span>
                  <button
                    onClick={() => deleteHighlight(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded transition"
                    title="Xóa kỷ niệm này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
