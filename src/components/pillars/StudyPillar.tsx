import React, { useState } from 'react';
import {
  Calculator,
  PenTool,
  Brain,
  Sparkles,
  ArrowRight,
  BookOpen,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  RotateCw,
  Layers,
  ChevronRight,
  ChevronDown,
  FileText,
  Send,
  Zap,
  Languages,
  Trophy,
} from 'lucide-react';
import { MathResult, WritingResult, SummarizeResult, FlashcardItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { EnglishMaster } from '../EnglishMaster';
import { UniversalProblemSolver } from '../UniversalProblemSolver';
import { StudyLeaderboard } from '../StudyLeaderboard';
import { LiteratureMaster } from '../LiteratureMaster';

export const StudyPillar: React.FC = () => {
  const { addXp, studySubTab: tab, setStudySubTab: setTab } = useApp();

  // Math State
  const [mathInput, setMathInput] = useState<string>(
    'Tìm giá trị lớn nhất và nhỏ nhất của hàm số y = x^3 - 3x^2 + 2 trên đoạn [-1, 3]'
  );
  const [mathHint, setMathHint] = useState<string>('Giải tích & Khảo sát hàm số');
  const [mathLoading, setMathLoading] = useState<boolean>(false);
  const [mathResult, setMathResult] = useState<MathResult | null>(null);
  const [mathError, setMathError] = useState<string | null>(null);

  // Writing State
  const [writingTopic, setWritingTopic] = useState<string>(
    'Nghị luận xã hội: "Sự kiên trì thầm lặng trong thế giới của sự hào nhoáng tức thì"'
  );
  const [essayType, setEssayType] = useState<string>('Nghị luận xã hội');
  const [writingTone, setWritingTone] = useState<string>('Sâu sắc, hùng biện, truyền cảm hứng');
  const [writingLoading, setWritingLoading] = useState<boolean>(false);
  const [writingResult, setWritingResult] = useState<WritingResult | null>(null);
  const [writingError, setWritingError] = useState<string | null>(null);
  const [copiedExcerpt, setCopiedExcerpt] = useState<boolean>(false);

  // Summarize / Mindmap State
  const [summaryInput, setSummaryInput] = useState<string>(
    `Quá trình quang hợp ở thực vật diễn ra chủ yếu ở bào quan lục lạp. Quang hợp bao gồm hai pha: Pha sáng và Pha tối.
Pha sáng diễn ra tại màng thylakoid, nơi sắc diệp lục hấp thu năng lượng ánh sáng mặt trời để quang phân ly nước, giải phóng O2 và tích lũy năng lượng dưới dạng ATP và NADPH.
Pha tối (chu trình Calvin) diễn ra trong chất nền stroma của lục lạp, không phụ thuộc trực tiếp vào ánh sáng nhưng cần sản phẩm ATP và NADPH của pha sáng để khử CO2 thành hợp chất hữu cơ (glucose, tinh bột).`
  );
  const [summarySubject, setSummarySubject] = useState<string>('Sinh học 11 - Quang hợp ở thực vật');
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryResult, setSummaryResult] = useState<SummarizeResult | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [activeMindmapBranch, setActiveMindmapBranch] = useState<number | null>(null);

  // Math Quick Examples
  const mathPresets = [
    {
      title: 'Khảo sát hàm số',
      problem: 'Tìm giá trị lớn nhất và nhỏ nhất của hàm số y = x^3 - 3x^2 + 2 trên đoạn [-1, 3]',
      hint: 'Giải tích 12',
    },
    {
      title: 'Tích phân từng phần',
      problem: 'Tính tích phân I = ∫ (2x + 1) * e^x dx từ 0 đến 1',
      hint: 'Tích phân & Giải tích',
    },
    {
      title: 'Hình học không gian',
      problem: 'Cho hình chóp S.ABC có đáy ABC là tam giác vuông tại B, SA vuông góc với đáy. Biết AB = a, BC = a*sqrt(3), SA = 2a. Tính thể tích khối chóp S.ABC và khoảng cách từ A đến mặt phẳng (SBC).',
      hint: 'Hình học không gian Oxyz/Thuần túy',
    },
    {
      title: 'Xác suất tổ hợp',
      problem: 'Một hộp chứa 5 viên bi đỏ và 4 viên bi xanh. Lấy ngẫu nhiên đồng thời 3 viên bi. Tính xác suất để lấy được ít nhất 2 viên bi đỏ.',
      hint: 'Xác suất cổ điển',
    },
  ];

  // Writing Quick Examples
  const writingPresets = [
    {
      topic: 'Nghị luận xã hội: "Sự kiên trì thầm lặng trong thế giới của sự hào nhoáng tức thì"',
      type: 'Nghị luận xã hội',
      tone: 'Sâu sắc, triết lý, văn phong trau chuốt',
    },
    {
      topic: 'Vẻ đẹp của khát vọng cống hiến tuổi trẻ qua hình tượng người lính trong bài thơ "Tây Tiến" (Quang Dũng)',
      type: 'Nghị luận văn học',
      tone: 'Hào hùng, lãng mạn, rung cảm thẩm mỹ cao',
    },
    {
      topic: 'Bức thư gửi chính mình vào 10 năm sau: Điều gì đáng giá hơn cả thành công bên ngoài?',
      type: 'Văn biểu cảm / Tâm tình',
      tone: 'Chân thành, ấm áp, sâu lắng',
    },
  ];

  // Handlers
  const handleSolveMath = async () => {
    if (!mathInput.trim()) return;
    setMathLoading(true);
    setMathError(null);
    try {
      const res = await fetch('/api/gemini/math', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problem: mathInput, topicHint: mathHint }),
      });
      if (!res.ok) throw new Error('Không thể giải bài toán lúc này.');
      const data = await res.json();
      setMathResult(data);
      addXp(25);
    } catch (err: any) {
      setMathError(err.message || 'Lỗi kết nối AI');
    } finally {
      setMathLoading(false);
    }
  };

  const handleGenerateWriting = async () => {
    if (!writingTopic.trim()) return;
    setWritingLoading(true);
    setWritingError(null);
    try {
      const res = await fetch('/api/gemini/writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: writingTopic,
          essayType,
          tone: writingTone,
        }),
      });
      if (!res.ok) throw new Error('Không thể lập dàn ý lúc này.');
      const data = await res.json();
      setWritingResult(data);
      addXp(25);
    } catch (err: any) {
      setWritingError(err.message || 'Lỗi kết nối AI');
    } finally {
      setWritingLoading(false);
    }
  };

  const handleSummarize = async () => {
    if (!summaryInput.trim()) return;
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const res = await fetch('/api/gemini/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: summaryInput, subject: summarySubject }),
      });
      if (!res.ok) throw new Error('Không thể tóm tắt bài học lúc này.');
      const data = await res.json();
      setSummaryResult(data);
      setFlippedCards({});
      addXp(25);
    } catch (err: any) {
      setSummaryError(err.message || 'Lỗi kết nối AI');
    } finally {
      setSummaryLoading(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedExcerpt(true);
    setTimeout(() => setCopiedExcerpt(false), 2000);
  };

  const toggleCard = (id: number) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      {/* Pillar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent p-5 rounded-3xl border border-blue-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">📌</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Trụ Cột 1: Học Tập &amp; Trí Tuệ
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Giải toán tư duy step-by-step, sáng tạo dàn ý văn học &amp; sơ đồ tư duy mindmap thông minh.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex flex-wrap items-center bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs gap-1">
          <button
            onClick={() => setTab('universal')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              tab === 'universal'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Giải Bài Tự Động Siêu Cấp</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-amber-400 text-slate-950 font-black rounded-full uppercase tracking-wider animate-pulse">
              HOT
            </span>
          </button>
          <button
            onClick={() => setTab('literature')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              tab === 'literature'
                ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-300" />
            <span>Giải Ngữ Văn Đa Cấp Bậc</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-rose-500 text-white font-black rounded-full uppercase tracking-wider">
              MỚI
            </span>
          </button>
          <button
            onClick={() => setTab('english')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              tab === 'english'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Languages className="w-3.5 h-3.5" />
            <span>Tiếng Anh &amp; Quiz AI</span>
          </button>
          <button
            onClick={() => setTab('math')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              tab === 'math'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Giải Toán Logic</span>
          </button>
          <button
            onClick={() => setTab('writing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              tab === 'writing'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Sáng Tạo Văn Học</span>
          </button>
          <button
            onClick={() => setTab('summarize')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              tab === 'summarize'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Mindmap &amp; Flashcard</span>
          </button>
          <button
            onClick={() => setTab('leaderboard')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              tab === 'leaderboard'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-300" />
            <span>Bảng Xếp Hạng Chăm Học</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-emerald-400 text-slate-950 font-black rounded-full uppercase tracking-wider animate-pulse">
              LIVE
            </span>
          </button>
        </div>
      </div>

      {/* TAB LEADERBOARD: AUTOMATED TIME-BASED STUDY LEADERBOARD */}
      {tab === 'leaderboard' && <StudyLeaderboard />}

      {/* TAB 0: UNIVERSAL AUTO-PROBLEM SOLVER */}
      {tab === 'universal' && <UniversalProblemSolver />}

      {/* TAB LITERATURE: MULTI-TIER LITERATURE EXAMINER & SOLVER */}
      {tab === 'literature' && <LiteratureMaster />}

      {/* TAB 1: MATH SOLVER */}
      {tab === 'math' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                Nhập đề bài toán (Đại số, Hình học, Xác suất, Giải tích...)
              </label>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                Phân dạng + Bước giải + Bài tập rèn luyện
              </span>
            </div>

            <textarea
              rows={3}
              value={mathInput}
              onChange={(e) => setMathInput(e.target.value)}
              placeholder="Nhập đề bài chi tiết..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-slate-100"
            />

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500">Mẫu bài toán điển hình:</span>
              <div className="flex flex-wrap gap-2">
                {mathPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setMathInput(preset.problem);
                      setMathHint(preset.hint);
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 border border-slate-200/60 dark:border-slate-700 transition"
                  >
                    ⚡ {preset.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <input
                type="text"
                value={mathHint}
                onChange={(e) => setMathHint(e.target.value)}
                placeholder="Gợi ý chủ đề / lớp học (tuỳ chọn)..."
                className="w-1/2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
              <button
                onClick={handleSolveMath}
                disabled={mathLoading || !mathInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-600/30 transition active:scale-95 cursor-pointer"
              >
                {mathLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Đang suy luận logic...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Phân Dạng &amp; Giải Từng Bước</span>
                  </>
                )}
              </button>
            </div>

            {mathError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {mathError}
              </div>
            )}
          </div>

          {/* Math Results Presentation */}
          {mathResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Category & Overview Bar */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Phân dạng toán</span>
                  <div className="text-base font-black text-blue-600 dark:text-blue-400 mt-1">
                    {mathResult.category}
                  </div>
                  <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                    Độ khó: {mathResult.difficulty}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs md:col-span-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400">Công thức then chốt &amp; Định lý</span>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 font-mono bg-slate-50 dark:bg-slate-800 p-2 rounded-xl">
                    {mathResult.coreFormula}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {mathResult.methodExplanation}
                  </p>
                </div>
              </div>

              {/* Step-by-Step Logic */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600" />
                  Lời Giải Chi Tiết Từng Bước (Step-by-Step)
                </h3>

                <div className="space-y-3">
                  {mathResult.steps.map((st, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[11px]">
                          {st.step}
                        </span>
                        <span>{st.title}</span>
                      </div>
                      <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line pl-7 leading-relaxed font-sans">
                        {st.explanation}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Final Answer Highlight */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase text-emerald-800 dark:text-emerald-300">
                      Đáp Số Cuối Cùng
                    </span>
                    <div className="text-lg font-black text-emerald-700 dark:text-emerald-400 font-mono mt-0.5">
                      {mathResult.finalAnswer}
                    </div>
                  </div>
                  <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>

                {/* Common Traps */}
                {mathResult.commonTraps && mathResult.commonTraps.length > 0 && (
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                    <span className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Bẫy Sai Lầm Thường Gặp Cần Tránh
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-amber-900 dark:text-amber-200/90">
                      {mathResult.commonTraps.map((trap, idx) => (
                        <li key={idx}>{trap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Similar Exercises to Practice */}
              {mathResult.similarExercises && mathResult.similarExercises.length > 0 && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" />
                      Bài Tập Tương Tự Để Tự Rèn Luyện
                    </h3>
                    <span className="text-xs text-slate-400">Thực hành ngay để nhớ lâu</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mathResult.similarExercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
                      >
                        <div>
                          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            {ex.title}
                          </span>
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium mt-1 leading-relaxed">
                            {ex.problem}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 italic">
                            💡 Gợi ý: {ex.hint}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {ex.answer ? `Đáp án: ${ex.answer}` : 'Tự luyện'}
                          </span>
                          <button
                            onClick={() => {
                              setMathInput(ex.problem);
                              window.scrollTo({ top: 100, behavior: 'smooth' });
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <span>Thử giải bài này</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: WRITING STUDIO */}
      {tab === 'writing' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-indigo-600" />
                Đề tài hoặc chủ đề bài viết văn học / nghị luận
              </label>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                Dàn ý sâu sắc + Góc nhìn mới lạ + Từ ngữ đắt giá
              </span>
            </div>

            <textarea
              rows={2}
              value={writingTopic}
              onChange={(e) => setWritingTopic(e.target.value)}
              placeholder="Nhập đề bài văn..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-slate-100"
            />

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-500">Đề tài gợi ý:</span>
              <div className="flex flex-wrap gap-2">
                {writingPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setWritingTopic(preset.topic);
                      setEssayType(preset.type);
                      setWritingTone(preset.tone);
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 border border-slate-200/60 dark:border-slate-700 transition"
                  >
                    📝 {preset.topic.slice(0, 40)}...
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Thể loại</label>
                <select
                  value={essayType}
                  onChange={(e) => setEssayType(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="Nghị luận xã hội">Nghị luận xã hội (Tư tưởng đạo lý / Hiện tượng đời sống)</option>
                  <option value="Nghị luận văn học">Nghị luận văn học (Tác phẩm / Đoạn thơ / Nhân vật)</option>
                  <option value="Văn biểu cảm">Văn biểu cảm / Cảm nghĩ chân thành</option>
                  <option value="Tự sự & Sáng tạo">Tự sự &amp; Sáng tạo độc đáo</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 mb-1 block">Văn phong mong muốn</label>
                <input
                  type="text"
                  value={writingTone}
                  onChange={(e) => setWritingTone(e.target.value)}
                  placeholder="Văn phong..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleGenerateWriting}
                disabled={writingLoading || !writingTopic.trim()}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-600/30 transition active:scale-95 cursor-pointer"
              >
                {writingLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Đang dệt ý tưởng &amp; từ vựng...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Lập Dàn Ý &amp; Trau Chuốt Từ Ngữ</span>
                  </>
                )}
              </button>
            </div>

            {writingError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {writingError}
              </div>
            )}
          </div>

          {/* Writing Result Output */}
          {writingResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Hook & Unique Angle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/40 dark:to-blue-950/30 border border-indigo-200 dark:border-indigo-800">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Mở bài gợi cảm &amp; Hook dẫn dắt
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-2 font-serif italic leading-relaxed">
                    "{writingResult.hook}"
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/30 border border-purple-200 dark:border-purple-800">
                  <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4" /> Góc nhìn mới lạ phá vỡ lối mòn
                  </span>
                  <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-2 leading-relaxed">
                    {writingResult.uniquePerspective}
                  </p>
                </div>
              </div>

              {/* Multi-tier Outline */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  Dàn Ý Chi Tiết Đầy Đủ Luận Điểm &amp; Dẫn Chứng
                </h3>

                <div className="space-y-3">
                  {writingResult.outline.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {sec.section}
                        </span>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          {sec.mainIdea}
                        </span>
                      </div>

                      <div className="pl-2 space-y-1">
                        <span className="text-[11px] font-bold text-slate-400">Luận cứ thuyết phục:</span>
                        <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
                          {sec.arguments.map((arg, aIdx) => (
                            <li key={aIdx}>{arg}</li>
                          ))}
                        </ul>
                      </div>

                      {sec.evidence && (
                        <div className="text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">Dẫn chứng đắt giá: </span>
                          {sec.evidence}
                        </div>
                      )}

                      {sec.vividPhrases && sec.vividPhrases.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] text-slate-400">Hình tượng gợi cảm:</span>
                          {sec.vividPhrases.map((phrase, pIdx) => (
                            <span
                              key={pIdx}
                              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50"
                            >
                              ✨ {phrase}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Vocab & Expression Polish */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    Từ Ngữ &amp; Thành Ngữ Đắt Giá
                  </h4>
                  <div className="space-y-2">
                    {writingResult.suggestedVocab.map((voc, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-serif">
                            "{voc.word}"
                          </span>
                          <span className="text-[11px] text-slate-400">{voc.meaning}</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 italic">
                          Ví dụ: {voc.sampleSentence}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Bí Quyết Mượt Mà Hóa Câu Chữ
                  </h4>
                  <ul className="space-y-2">
                    {writingResult.expressionPolishTips.map((tip, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2 p-2.5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50"
                      >
                        <Check className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sample Excerpt */}
              {writingResult.sampleExcerpt && (
                <div className="p-6 rounded-3xl bg-slate-900 text-white relative shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                      <FileText className="w-4 h-4" /> Đoạn Văn Mẫu Minh Họa Xuất Sắc
                    </span>
                    <button
                      onClick={() => copyText(writingResult.sampleExcerpt)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium flex items-center gap-1.5 transition text-slate-300"
                    >
                      {copiedExcerpt ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-sm font-serif leading-relaxed text-slate-200 whitespace-pre-line italic">
                    {writingResult.sampleExcerpt}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUMMARIZE & MINDMAP & FLASHCARDS */}
      {tab === 'summarize' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                Văn bản / Sách giáo khoa / Tài liệu nghiên cứu
              </label>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                Tự động biến thành Sơ đồ tư duy &amp; Flashcards
              </span>
            </div>

            <textarea
              rows={4}
              value={summaryInput}
              onChange={(e) => setSummaryInput(e.target.value)}
              placeholder="Dán nội dung tài liệu học tập vào đây..."
              className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-sm focus:ring-2 focus:ring-purple-500 outline-none text-slate-900 dark:text-slate-100"
            />

            <div className="flex items-center justify-between pt-1">
              <input
                type="text"
                value={summarySubject}
                onChange={(e) => setSummarySubject(e.target.value)}
                placeholder="Tên môn học / bài học..."
                className="w-1/2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 outline-none"
              />
              <button
                onClick={handleSummarize}
                disabled={summaryLoading || !summaryInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-purple-600/30 transition active:scale-95 cursor-pointer"
              >
                {summaryLoading ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Đang tạo Mindmap &amp; Flashcard...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Chuyển Thành Mindmap &amp; Flashcards</span>
                  </>
                )}
              </button>
            </div>

            {summaryError && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                {summaryError}
              </div>
            )}
          </div>

          {/* Results for Mindmap & Flashcard */}
          {summaryResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Quick Summary & Key Takeaways */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">
                  Tóm tắt cốt lõi
                </span>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                  {summaryResult.summaryOverview}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  {summaryResult.keyTakeaways.map((point, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700 shadow-xs"
                    >
                      ✓ {point}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive Mindmap Visual */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Sơ Đồ Tư Duy Tương Tác (Mindmap)
                  </h3>
                  <span className="text-xs text-slate-400">Bấm vào từng nhánh để xem ý chi tiết</span>
                </div>

                {/* Central Root */}
                <div className="flex flex-col items-center">
                  <div className="px-6 py-3 rounded-2xl bg-indigo-600 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-indigo-600/30 text-center">
                    {summaryResult.mindmap.root}
                  </div>
                  <div className="w-0.5 h-6 bg-slate-300 dark:bg-slate-700 my-1" />

                  {/* Branches */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                    {summaryResult.mindmap.branches.map((branch, idx) => {
                      const isExpanded = activeMindmapBranch === idx || activeMindmapBranch === null;
                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition cursor-pointer"
                          onClick={() =>
                            setActiveMindmapBranch(activeMindmapBranch === idx ? null : idx)
                          }
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: branch.color || '#3B82F6' }}
                              />
                              {branch.title}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-slate-400" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            )}
                          </div>

                          {isExpanded && (
                            <ul className="mt-3 space-y-1.5">
                              {branch.subBranches.map((sub, sIdx) => (
                                <li
                                  key={sIdx}
                                  className="text-xs text-slate-600 dark:text-slate-300 pl-3 border-l-2 border-indigo-300 dark:border-indigo-700 leading-relaxed"
                                >
                                  {sub}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Interactive Flashcards */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Bộ Flashcard Hỏi - Đáp Ôn Tập
                  </h3>
                  <span className="text-xs text-slate-400">Bấm vào thẻ để lật mặt sau</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summaryResult.flashcards.map((card) => {
                    const isFlipped = !!flippedCards[card.id];
                    return (
                      <div
                        key={card.id}
                        onClick={() => toggleCard(card.id)}
                        className={`h-48 rounded-2xl p-5 cursor-pointer transition-all duration-300 flex flex-col justify-between border ${
                          isFlipped
                            ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-500 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-md ${
                              isFlipped ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {card.tag}
                          </span>
                          <span className="opacity-75">{isFlipped ? 'Đáp án' : 'Câu hỏi'}</span>
                        </div>

                        <div className="my-auto text-center font-medium text-xs sm:text-sm leading-relaxed">
                          {isFlipped ? card.answer : card.question}
                        </div>

                        <div className="text-center text-[10px] opacity-60">
                          {isFlipped ? '↺ Bấm để xem câu hỏi' : '👉 Bấm để lật xem đáp án'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {/* TAB 4: ENGLISH AUTO-SOLVER & MASTERY */}
      {tab === 'english' && <EnglishMaster />}
    </div>
  );
};
