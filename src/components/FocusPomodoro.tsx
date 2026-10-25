import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Timer, Sparkles, CheckCircle2, Trophy, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAutoStudyTracker } from '../hooks/useAutoStudyTracker';

export const FocusPomodoro: React.FC = () => {
  const { addXp, playChime, mode, setActivePillar, setStudySubTab } = useApp();
  const tracker = useAutoStudyTracker();
  const [timerType, setTimerType] = useState<'work' | 'shortBreak' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(2);

  const getDuration = (type: 'work' | 'shortBreak' | 'longBreak') => {
    switch (type) {
      case 'work':
        return 25 * 60;
      case 'shortBreak':
        return 5 * 60;
      case 'longBreak':
        return 15 * 60;
    }
  };

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playChime();
      if (timerType === 'work') {
        addXp(30);
        setCompletedSessions((prev) => prev + 1);
        setTimerType('shortBreak');
        setTimeLeft(getDuration('shortBreak'));
      } else {
        setTimerType('work');
        setTimeLeft(getDuration('work'));
      }
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerType]);

  const switchType = (type: 'work' | 'shortBreak' | 'longBreak') => {
    setIsRunning(false);
    setTimerType(type);
    setTimeLeft(getDuration(type));
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration(timerType));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((getDuration(timerType) - timeLeft) / getDuration(timerType)) * 100;

  return (
    <div className={`p-4 rounded-2xl border transition-all ${
      mode === 'gaming'
        ? 'bg-purple-950/40 border-purple-800/60 shadow-lg shadow-purple-950/20'
        : mode === 'chill'
        ? 'bg-amber-950/20 border-amber-800/40'
        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
    }`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {timerType === 'work' ? '🎯 Phiên Học Tập Sâu' : '☕ Thời Gian Nghỉ Ngơi'}
          </span>
        </div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          <span>{completedSessions} phiên hoàn thành</span>
        </div>
      </div>

      {/* Mode selectors */}
      <div className="flex gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/70 rounded-xl mb-3">
        <button
          onClick={() => switchType('work')}
          className={`flex-1 py-1 text-xs font-semibold rounded-lg transition ${
            timerType === 'work'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          25m Focus
        </button>
        <button
          onClick={() => switchType('shortBreak')}
          className={`flex-1 py-1 text-xs font-semibold rounded-lg transition ${
            timerType === 'shortBreak'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          5m Nghỉ ngắn
        </button>
        <button
          onClick={() => switchType('longBreak')}
          className={`flex-1 py-1 text-xs font-semibold rounded-lg transition ${
            timerType === 'longBreak'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          15m Nghỉ dài
        </button>
      </div>

      {/* Circular Timer Visual */}
      <div className="flex flex-col items-center justify-center my-2">
        <div className="text-4xl font-black font-mono tracking-wider text-slate-800 dark:text-slate-100">
          {formatTime(timeLeft)}
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${
              timerType === 'work'
                ? 'bg-blue-500'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`px-5 py-2 rounded-xl text-xs font-bold text-white flex items-center gap-2 shadow-md transition-all active:scale-95 ${
            isRunning
              ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
              : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
          {isRunning ? 'Tạm dừng' : 'Bắt đầu ngay (+30 XP)'}
        </button>
        <button
          onClick={resetTimer}
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          title="Đặt lại đồng hồ"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Zero-Touch Automated Study Time Tracking Section */}
      <div className="mt-4 pt-3.5 border-t border-slate-200 dark:border-slate-800/80 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>Tự Động Tính Giờ Học</span>
          </div>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Không cần bấm
          </span>
        </div>

        <div className="flex items-center justify-between text-xs bg-slate-100/80 dark:bg-slate-800/60 p-2.5 rounded-xl">
          <div className="space-y-0.5">
            <div className="text-[10px] text-slate-400">Hôm nay đã học</div>
            <div className="font-black text-blue-600 dark:text-blue-400 font-mono text-sm">
              {tracker.formattedToday}
            </div>
          </div>
          <button
            onClick={() => {
              setActivePillar('study');
              setStudySubTab('leaderboard');
              window.scrollTo({ top: 380, behavior: 'smooth' });
            }}
            className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-[11px] flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
          >
            <Trophy className="w-3 h-3 text-yellow-200" />
            <span>Xem BXH</span>
          </button>
        </div>
      </div>
    </div>
  );
};
