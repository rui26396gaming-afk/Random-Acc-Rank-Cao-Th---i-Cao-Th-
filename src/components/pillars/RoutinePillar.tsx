import React, { useState } from 'react';
import {
  Calendar,
  CheckSquare,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Droplet,
  BookOpen,
  Moon,
  Clock,
  RotateCw,
  Award,
  ChevronRight,
  TrendingUp,
  Smile,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { TaskItem, HabitItem, RoutineSlot } from '../../types';
import { HabitStreakChart } from '../HabitStreakChart';

export const RoutinePillar: React.FC = () => {
  const {
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
    addXp,
  } = useApp();

  const [tab, setTab] = useState<'schedule' | 'tasks' | 'habits'>('schedule');

  // AI Routine Generator State
  const [availableHours, setAvailableHours] = useState<number>(14);
  const [prioritiesInput, setPrioritiesInput] = useState<string>(
    'Ôn tập toán giải tích, Viết bài văn nghị luận, Chơi 2 trận LMHT, Chạy bộ thể dục'
  );
  const [scheduleLoading, setScheduleLoading] = useState<boolean>(false);
  const [scheduleQuote, setScheduleQuote] = useState<string | null>(
    'Kỷ luật không phải là sự gò bó, mà là chìa khóa mở ra sự tự do đích thực.'
  );

  // New Task Form State
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskCategory, setTaskCategory] = useState<TaskItem['category']>('study');
  const [taskPriority, setTaskPriority] = useState<TaskItem['priority']>('medium');
  const [taskXp, setTaskXp] = useState<number>(25);

  const handleGenerateSchedule = async () => {
    setScheduleLoading(true);
    try {
      const res = await fetch('/api/gemini/routine-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availableHours,
          priorities: prioritiesInput.split(',').map((p) => p.trim()),
        }),
      });
      if (!res.ok) throw new Error('Không thể tạo lịch biểu.');
      const data = await res.json();
      if (data.slots && Array.isArray(data.slots)) {
        setRoutineSlots(data.slots);
      }
      if (data.motivationalQuote) {
        setScheduleQuote(data.motivationalQuote);
      }
      addXp(20);
    } catch (err: any) {
      console.error(err);
    } finally {
      setScheduleLoading(false);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle,
      category: taskCategory,
      priority: taskPriority,
      xp: taskXp,
    });
    setTaskTitle('');
    setShowAddTask(false);
  };

  const completedTasksCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      {/* Pillar Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-600/10 via-teal-600/5 to-transparent p-5 rounded-3xl border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏠</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Trụ Cột 3: Sinh Hoạt &amp; Quản Lý Bản Thân
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Lịch biểu linh hoạt AI không chồng chéo, To-Do List tích điểm thưởng XP và theo dõi thói quen sống lành mạnh.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
          <button
            onClick={() => setTab('schedule')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              tab === 'schedule'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Thời Gian Biểu AI</span>
          </button>
          <button
            onClick={() => setTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              tab === 'tasks'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>To-Do Thưởng XP ({completedTasksCount}/{tasks.length})</span>
          </button>
          <button
            onClick={() => setTab('habits')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              tab === 'habits'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Habit Tracker ({habits.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SMART ROUTINE TIMELINE */}
      {tab === 'schedule' && (
        <div className="space-y-6">
          {/* AI Optimizer Generator Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Tự Động Lên Lịch Biểu Ngày Linh Hoạt
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                Cân bằng Học tập (Focus) - Chơi game (Gaming) - Thư giãn (Chill)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Ưu tiên lớn nhất trong ngày của bạn
                </label>
                <input
                  type="text"
                  value={prioritiesInput}
                  onChange={(e) => setPrioritiesInput(e.target.value)}
                  placeholder="Ví dụ: Làm toán, Viết văn, Chơi game, Thể thao..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500 mb-1 block">
                  Tổng giờ hoạt động
                </label>
                <select
                  value={availableHours}
                  onChange={(e) => setAvailableHours(parseInt(e.target.value, 10))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                >
                  <option value={12}>12 giờ (Nhẹ nhàng)</option>
                  <option value={14}>14 giờ (Tiêu chuẩn)</option>
                  <option value={16}>16 giờ (Cường độ cao)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-500 italic max-w-lg hidden sm:block">
                💬 {scheduleQuote}
              </p>
              <button
                onClick={handleGenerateSchedule}
                disabled={scheduleLoading}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-600/30 transition active:scale-95 cursor-pointer ml-auto"
              >
                {scheduleLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Đang sắp xếp thông minh...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>AI Tối Ưu Lịch Biểu Hôm Nay</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Routine Slots Timeline */}
          <div className="space-y-3">
            {routineSlots.map((slot) => {
              const isCompleted = !!slot.completed;
              return (
                <div
                  key={slot.id}
                  onClick={() => toggleRoutineSlot(slot.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isCompleted
                      ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-70'
                      : slot.mode === 'focus'
                      ? 'bg-white dark:bg-slate-900 border-blue-200 dark:border-blue-900 shadow-xs hover:border-blue-400'
                      : slot.mode === 'gaming'
                      ? 'bg-white dark:bg-slate-900 border-purple-200 dark:border-purple-900 shadow-xs hover:border-purple-400'
                      : 'bg-white dark:bg-slate-900 border-amber-200 dark:border-amber-900 shadow-xs hover:border-amber-400'
                  }`}
                >
                  <button
                    type="button"
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {slot.time}
                        </span>
                        <span
                          className={`text-sm font-bold ${
                            isCompleted
                              ? 'line-through text-slate-400'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {slot.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            slot.mode === 'focus'
                              ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : slot.mode === 'gaming'
                              ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {slot.mode}
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          +{slot.xp} XP
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {slot.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TO-DO LIST WITH XP GAMIFICATION */}
      {tab === 'tasks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-emerald-600" />
                Quản Lý Công Việc &amp; Bài Tập (To-Do List)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chia nhỏ bài tập, việc nhà thành nhiệm vụ. Hoàn thành để nhận phần thưởng XP và duy trì chuỗi Streak!
              </p>
            </div>
            <button
              onClick={() => setShowAddTask(!showAddTask)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Việc Mới</span>
            </button>
          </div>

          {/* Add Task Form */}
          {showAddTask && (
            <form
              onSubmit={handleCreateTask}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-md space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Tạo Nhiệm Vụ Mới
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs"
                >
                  Đóng
                </button>
              </div>

              <div>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Tiêu đề việc cần làm (ví dụ: Giải 3 bài tập toán đại số, đọc 1 chương sách...)"
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                    Danh mục
                  </label>
                  <select
                    value={taskCategory}
                    onChange={(e) => setTaskCategory(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="study">📚 Học tập &amp; Nghiên cứu</option>
                    <option value="home">🏠 Việc nhà &amp; Sinh hoạt</option>
                    <option value="project">💻 Dự án &amp; Sáng tạo</option>
                    <option value="health">🏃 Sức khỏe &amp; Thể thao</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                    Mức độ ưu tiên
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  >
                    <option value="high">🔴 Cao (Cần làm ngay)</option>
                    <option value="medium">🟡 Trung bình</option>
                    <option value="low">🟢 Thấp</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 mb-1 block">
                    Điểm thưởng XP
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={100}
                    step={5}
                    value={taskXp}
                    onChange={(e) => setTaskXp(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition active:scale-95"
                >
                  Tạo Nhiệm Vụ (+{taskXp} XP)
                </button>
              </div>
            </form>
          )}

          {/* Task List */}
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all flex items-start justify-between gap-3 shadow-xs ${
                  task.completed
                    ? 'border-slate-200/50 dark:border-slate-800/50 opacity-60'
                    : 'border-slate-200 dark:border-slate-800 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold ${
                          task.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 dark:text-slate-100'
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.dueDate && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {task.dueDate}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        +{task.xp} XP
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span
                        className={`font-semibold ${
                          task.priority === 'high'
                            ? 'text-rose-500'
                            : task.priority === 'medium'
                            ? 'text-amber-500'
                            : 'text-emerald-500'
                        }`}
                      >
                        {task.priority === 'high' ? 'Ưu tiên cao' : task.priority === 'medium' ? 'Ưu tiên TB' : 'Ưu tiên thấp'}
                      </span>
                    </div>

                    {/* Subtasks */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1">
                        {task.subtasks.map((st) => (
                          <div key={st.id} className="text-xs text-slate-500 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            <span className={st.completed ? 'line-through' : ''}>{st.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition"
                  title="Xóa công việc"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: HABIT TRACKER */}
      {tab === 'habits' && (
        <div className="space-y-6">
          {/* D3-based 7-Day Streak & Completion Analytics */}
          <HabitStreakChart habits={habits} />

          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Theo Dõi &amp; Ghi Nhận Thói Quen Hằng Ngày</span>
            </h3>
            <span className="text-xs text-slate-400">Tích lũy XP khi hoàn thành mục tiêu</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {habits.map((h) => {
              const progressPct = Math.min(100, Math.round((h.currentCount / h.targetCount) * 100));
              const isGoalReached = h.currentCount >= h.targetCount;
              return (
                <div
                  key={h.id}
                  className={`p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                    isGoalReached
                      ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/40 shadow-xs'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                        {h.id === 'h-water' ? (
                          <Droplet className="w-5 h-5 text-blue-500" />
                        ) : h.id === 'h-read' ? (
                          <BookOpen className="w-5 h-5 text-emerald-500" />
                        ) : h.id === 'h-sleep' ? (
                          <Moon className="w-5 h-5 text-indigo-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-500" />
                        )}
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] font-bold text-orange-500 flex items-center gap-1 justify-end">
                          🔥 {h.streak} ngày
                        </span>
                        <span className="text-[10px] text-slate-400">Streak liên tiếp</span>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {h.title}
                    </h4>

                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-2xl font-black text-slate-800 dark:text-slate-100">
                        {h.currentCount}
                      </span>
                      <span className="text-xs text-slate-400">
                        / {h.targetCount} {h.unit}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isGoalReached ? 'bg-emerald-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => resetHabit(h.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 transition"
                    >
                      Đặt lại
                    </button>
                    <button
                      onClick={() => incrementHabit(h.id)}
                      className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ghi nhận (+1)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
