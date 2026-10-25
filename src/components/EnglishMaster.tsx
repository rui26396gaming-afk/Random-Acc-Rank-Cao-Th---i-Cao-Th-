import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  BookOpen,
  Copy,
  Check,
  RotateCw,
  Send,
  Languages,
  PenTool,
  Award,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { EnglishSolverResult, EnglishWritingResult } from '../types';
import { useApp } from '../context/AppContext';
import { EnglishQuizMaster } from './EnglishQuizMaster';

export const EnglishMaster: React.FC = () => {
  const { addXp } = useApp();
  const [subTab, setSubTab] = useState<'solver' | 'quiz' | 'writing'>('solver');

  // Track English learning progress for customized quizzes
  const [recentLearnedTopics, setRecentLearnedTopics] = useState<string[]>([
    'Mệnh đề phân từ rút gọn (Participle Clauses)',
    'Collocation & Cụm từ cố định',
    'Hòa hợp Chủ ngữ - Động từ',
  ]);
  const [recentVocabulary, setRecentVocabulary] = useState<string[]>([
    'take into account',
    'promptly',
    'unattended',
    'irresponsible',
  ]);

  // Exercise Solver State
  const [exerciseInput, setExerciseInput] = useState<string>(
    `Mark the letter A, B, C, or D to indicate the correct answer:\n______ all his homework, Tom went out to play football with his friends.\nA. Having finished\nB. Finished\nC. Finishing\nD. To finish`
  );
  const [exerciseType, setExerciseType] = useState<string>('Trắc nghiệm ngữ pháp & Mệnh đề phân từ');
  const [levelHint, setLevelHint] = useState<string>('Ôn thi THPT Quốc Gia / B2');
  const [loadingSolver, setLoadingSolver] = useState<boolean>(false);
  const [solverResult, setSolverResult] = useState<EnglishSolverResult | null>(null);
  const [solverError, setSolverError] = useState<string | null>(null);

  // Writing Polish State
  const [writingInput, setWritingInput] = useState<string>(
    'In my opinion, learning English is very important because it help people get good job and make many friends from around the world.'
  );
  const [targetTone, setTargetTone] = useState<string>('Academic & Native Band 8.0+');
  const [loadingWriting, setLoadingWriting] = useState<boolean>(false);
  const [writingResult, setWritingResult] = useState<EnglishWritingResult | null>(null);
  const [writingError, setWritingError] = useState<string | null>(null);

  const [copiedText, setCopiedText] = useState<boolean>(false);

  // Text to Speech
  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const exercisePresets = [
    {
      title: 'THPT QG: Phân từ hoàn thành',
      text: `______ all his homework, Tom went out to play football with his friends.\nA. Having finished\nB. Finished\nC. Finishing\nD. To finish`,
      type: 'Mệnh đề phân từ rút gọn',
      level: 'THPT Quốc Gia',
    },
    {
      title: 'Đảo ngữ điều kiện loại 3',
      text: `Rewrite the sentence without changing its meaning:\n"If the firefighters had not arrived promptly, the whole building would have been destroyed."\n-> Had it _________________________________.`,
      type: 'Viết lại câu & Đảo ngữ',
      level: 'B2 - C1 Nâng cao',
    },
    {
      title: 'Tìm lỗi sai ngữ pháp',
      text: `Identify the underlined part that needs correction:\n"The number of students who is applying for the overseas scholarship have increased significantly this year."`,
      type: 'Tìm lỗi sai hòa hợp S - V',
      level: 'B1 - B2',
    },
    {
      title: 'Word Formation (Dạng từ)',
      text: `Complete the sentence with the correct form of the word in brackets:\n"It was completely ______ (RESPONSIBLE) of him to leave the laboratory equipment unattended overnight."`,
      type: 'Word Formation (Tiền tố/Hậu tố)',
      level: 'B2 - IELTS',
    },
    {
      title: 'Phrasal Verb & Collocation',
      text: `The committee decided to ______ into account the environmental impact before approving the project.\nA. make\nB. take\nC. give\nD. hold`,
      type: 'Collocation & Cụm từ cố định',
      level: 'THPT Quốc Gia / IELTS',
    },
  ];

  const handleSolveExercise = async () => {
    if (!exerciseInput.trim()) return;
    setLoadingSolver(true);
    setSolverError(null);
    try {
      const res = await fetch('/api/gemini/english', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exercise: exerciseInput,
          exerciseType,
          levelHint,
        }),
      });
      if (!res.ok) throw new Error('Không thể giải bài tiếng Anh lúc này.');
      const data = await res.json();
      setSolverResult(data);
      addXp(30);

      // Record learned items to personalize subsequent quizzes
      if (data.exerciseCategory) {
        setRecentLearnedTopics((prev) =>
          Array.from(new Set([...prev, data.exerciseCategory, data.grammarRule].filter(Boolean)))
        );
      }
      if (Array.isArray(data.keyVocabulary) && data.keyVocabulary.length > 0) {
        const words = data.keyVocabulary.map((v: any) => v.word).filter(Boolean);
        setRecentVocabulary((prev) => Array.from(new Set([...prev, ...words])));
      }
    } catch (err: any) {
      setSolverError(err.message || 'Lỗi xử lý AI');
    } finally {
      setLoadingSolver(false);
    }
  };

  const handlePolishWriting = async () => {
    if (!writingInput.trim()) return;
    setLoadingWriting(true);
    setWritingError(null);
    try {
      const res = await fetch('/api/gemini/english-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: writingInput,
          targetTone,
        }),
      });
      if (!res.ok) throw new Error('Không thể kiểm tra bài viết lúc này.');
      const data = await res.json();
      setWritingResult(data);
      addXp(25);
    } catch (err: any) {
      setWritingError(err.message || 'Lỗi xử lý AI');
    } finally {
      setLoadingWriting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Sub Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-600/10 via-teal-600/10 to-transparent p-5 rounded-3xl border border-teal-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-teal-500/20 text-teal-400">
              <Languages className="w-5 h-5" />
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Học &amp; Tự Động Giải Tiếng Anh Thông Minh (AI English Master)
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Tự động giải mọi dạng bài tập tiếng Anh: Trắc nghiệm, Tìm lỗi sai, Chia thì, Viết lại câu, Phát âm &amp; Sửa bài viết.
          </p>
        </div>

        {/* Sub tab toggles */}
        <div className="flex items-center bg-slate-900/80 p-1 rounded-2xl border border-slate-700">
          <button
            onClick={() => setSubTab('solver')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === 'solver'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Tự Động Giải Đề</span>
          </button>
          <button
            onClick={() => setSubTab('quiz')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === 'quiz'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Trắc Nghiệm Tùy Biến</span>
          </button>
          <button
            onClick={() => setSubTab('writing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              subTab === 'writing'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Sửa Lỗi Câu</span>
          </button>
        </div>
      </div>

      {/* MODE 1: EXERCISE AUTO-SOLVER */}
      {subTab === 'solver' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-teal-400" />
                Nhập câu hỏi hoặc đề bài tiếng Anh cần giải
              </label>
              <span className="text-xs text-teal-400 font-semibold">
                Phân tích ngữ pháp + Dịch nghĩa + Bẫy thi cử
              </span>
            </div>

            <textarea
              rows={4}
              value={exerciseInput}
              onChange={(e) => setExerciseInput(e.target.value)}
              placeholder="Dán câu trắc nghiệm (A, B, C, D), câu viết lại hoặc đoạn đọc hiểu vào đây..."
              className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 font-mono leading-relaxed"
            />

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Đề bài mẫu điển hình:
              </span>
              <div className="flex flex-wrap gap-2">
                {exercisePresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setExerciseInput(preset.text);
                      setExerciseType(preset.type);
                      setLevelHint(preset.level);
                    }}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-teal-950/60 hover:text-teal-300 text-slate-300 border border-slate-700 transition cursor-pointer"
                  >
                    📝 {preset.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Dạng bài tập</label>
                <input
                  type="text"
                  value={exerciseType}
                  onChange={(e) => setExerciseType(e.target.value)}
                  placeholder="Ví dụ: Trắc nghiệm, Tìm lỗi sai, Viết lại câu..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 mb-1 block">Cấp độ mục tiêu</label>
                <input
                  type="text"
                  value={levelHint}
                  onChange={(e) => setLevelHint(e.target.value)}
                  placeholder="Ví dụ: THPT Quốc Gia, IELTS, TOEIC, B1, B2..."
                  className="w-full p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleSolveExercise}
                disabled={loadingSolver || !exerciseInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-teal-600/30 transition active:scale-95 cursor-pointer"
              >
                {loadingSolver ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>AI Đang Phân Tích &amp; Giải...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Tự Động Giải &amp; Phân Tích Toàn Diện (+30 XP)</span>
                  </>
                )}
              </button>
            </div>

            {solverError && (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs border border-rose-500/40">
                {solverError}
              </div>
            )}
          </div>

          {/* Solver Result Presentation */}
          {solverResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Correct Answer & Translation Banner */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-500/50 shadow-xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                      Đáp Án Chính Xác Nhất
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700">
                      {solverResult.exerciseCategory}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {solverResult.difficulty}
                    </span>
                  </div>
                </div>

                <div className="text-lg sm:text-xl font-black text-white font-mono bg-black/40 p-4 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                  <span>{solverResult.correctAnswer}</span>
                  <button
                    onClick={() => speakWord(solverResult.correctAnswer)}
                    className="p-2 rounded-xl bg-teal-600/40 hover:bg-teal-600 text-white transition cursor-pointer"
                    title="Phát âm đáp án"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2 text-xs text-slate-200">
                  <span className="font-bold text-teal-400 block mb-0.5">Bản dịch nghĩa tiếng Việt:</span>
                  <p className="italic leading-relaxed">{solverResult.fullTranslation}</p>
                </div>

                <div className="pt-2 border-t border-teal-500/20 flex items-center justify-between">
                  <span className="text-[11px] text-teal-300">Muốn kiểm tra độ hiểu bài ngay?</span>
                  <button
                    onClick={() => {
                      setRecentLearnedTopics((prev) => [
                        solverResult.exerciseCategory,
                        solverResult.grammarRule,
                        ...prev,
                      ]);
                      setSubTab('quiz');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Tạo Đề Trắc Nghiệm Dạng Này Ngay</span>
                  </button>
                </div>
              </div>

              {/* Grammar Formula & Core Rule */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-sm space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" /> Quy Tắc Ngữ Pháp / Công Thức Cốt Lõi
                </span>
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 font-mono text-xs sm:text-sm font-semibold">
                  {solverResult.grammarRule}
                </div>
              </div>

              {/* Step-by-Step Explanation */}
              <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  Các Bước Suy Luận Logic (Step-by-Step Breakdown)
                </h4>

                <div className="space-y-3">
                  {solverResult.explanationSteps.map((st, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 space-y-1"
                    >
                      <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
                        <span className="w-5 h-5 rounded-full bg-teal-900/60 text-teal-300 flex items-center justify-center text-[10px]">
                          {st.step}
                        </span>
                        <span>{st.title}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-300 pl-7 leading-relaxed whitespace-pre-line">
                        {st.detail}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Exam Traps Warning */}
                {solverResult.examTraps && solverResult.examTraps.length > 0 && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-1.5">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" /> Bẫy Thi Cử Cần Đặc Biệt Chú Ý
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-xs text-rose-200/90 pl-1">
                      {solverResult.examTraps.map((trap, idx) => (
                        <li key={idx}>{trap}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Key Vocabulary & IPA Audio */}
              {solverResult.keyVocabulary && solverResult.keyVocabulary.length > 0 && (
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-teal-400" />
                      Từ Vựng Mở Rộng &amp; Phiên Âm IPA
                    </h4>
                    <span className="text-xs text-slate-400">Bấm loa để nghe phát âm chuẩn</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {solverResult.keyVocabulary.map((vocab, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-800/70 border border-slate-700 flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-teal-300 font-sans">
                            {vocab.word}
                          </span>
                          <button
                            onClick={() => speakWord(vocab.word)}
                            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                            title="Phát âm"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {vocab.ipa}
                        </span>
                        <p className="text-xs text-slate-200 font-medium mt-1.5">
                          {vocab.meaning}
                        </p>
                        {vocab.collocation && (
                          <div className="mt-2 text-[10px] text-amber-300/80 bg-slate-900/60 p-1.5 rounded-lg border border-slate-700/60">
                            ⚡ {vocab.collocation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Similar Practice Exercises */}
              {solverResult.similarExercises && solverResult.similarExercises.length > 0 && (
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-teal-400" />
                      Bài Tập Tương Tự Để Luyện Tập Tức Thì
                    </h4>
                    <span className="text-xs text-slate-400">Khắc sâu kiến thức</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {solverResult.similarExercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <p className="text-xs sm:text-sm text-white font-medium whitespace-pre-line leading-relaxed">
                            {ex.question}
                          </p>
                          <p className="text-[11px] text-teal-400/90 mt-2 italic">
                            💡 Gợi ý: {ex.hint}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-slate-700 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">
                            {ex.answer ? `Đáp án: ${ex.answer}` : 'Tự giải'}
                          </span>
                          <button
                            onClick={() => {
                              setExerciseInput(ex.question);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }}
                            className="text-xs text-teal-400 hover:text-teal-300 font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <span>Thử giải câu này</span>
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

      {/* MODE 2: CUSTOM MULTIPLE-CHOICE QUIZ (GEMINI POWERED) */}
      {subTab === 'quiz' && (
        <EnglishQuizMaster
          recentLearnedTopics={recentLearnedTopics}
          recentVocabulary={recentVocabulary}
        />
      )}

      {/* MODE 3: WRITING POLISH & GRAMMAR CHECKER */}
      {subTab === 'writing' && (
        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-white flex items-center gap-2">
                <PenTool className="w-4 h-4 text-teal-400" />
                Nhập câu hoặc đoạn văn tiếng Anh của bạn
              </label>
              <span className="text-xs text-teal-400 font-semibold">
                Sửa ngữ pháp + Nâng cấp từ vựng + Native Band 8.0+
              </span>
            </div>

            <textarea
              rows={4}
              value={writingInput}
              onChange={(e) => setWritingInput(e.target.value)}
              placeholder="Nhập câu hoặc bài luận tiếng Anh cần sửa..."
              className="w-full p-4 rounded-2xl bg-slate-800 border border-slate-700 text-xs sm:text-sm text-slate-100 outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              <select
                value={targetTone}
                onChange={(e) => setTargetTone(e.target.value)}
                className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
              >
                <option value="Academic & Native Band 8.0+">Học thuật &amp; Bản ngữ (Academic Band 8.0+)</option>
                <option value="Natural Conversational">Giao tiếp tự nhiên đời thường</option>
                <option value="Professional Business">Thư từ &amp; Công sở chuyên nghiệp</option>
              </select>

              <button
                onClick={handlePolishWriting}
                disabled={loadingWriting || !writingInput.trim()}
                className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-teal-600/30 transition active:scale-95 cursor-pointer"
              >
                {loadingWriting ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Đang rà soát &amp; nâng cấp câu...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Kiểm Tra &amp; Trau Chuốt Ngôn Ngữ</span>
                  </>
                )}
              </button>
            </div>

            {writingError && (
              <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 text-xs border border-rose-500/40">
                {writingError}
              </div>
            )}
          </div>

          {/* Writing Results */}
          {writingResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Native Polished Version Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-teal-950 via-slate-900 to-indigo-950 border border-teal-500/40 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Phiên Bản Diễn Đạt Tự Nhiên (Native Native 8.0+)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => speakWord(writingResult.nativePolishedText)}
                      className="p-1.5 rounded-lg bg-teal-600/40 hover:bg-teal-600 text-white transition cursor-pointer"
                      title="Nghe phát âm chuẩn"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(writingResult.nativePolishedText)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 text-xs text-slate-300 hover:text-white flex items-center gap-1 transition cursor-pointer"
                    >
                      {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText ? 'Đã sao chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-white font-medium leading-relaxed italic bg-black/30 p-4 rounded-2xl border border-teal-500/30">
                  "{writingResult.nativePolishedText}"
                </p>

                <p className="text-xs text-slate-300 pt-1 leading-relaxed">
                  💡 {writingResult.cohesionTips}
                </p>
              </div>

              {/* Grammar Corrections */}
              {writingResult.grammarErrors && writingResult.grammarErrors.length > 0 && (
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    Các Lỗi Ngữ Pháp &amp; Cách Sửa Chuẩn Xác
                  </h4>

                  <div className="space-y-2">
                    {writingResult.grammarErrors.map((err, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs line-through text-rose-400 font-mono">
                            {err.original}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          <span className="text-xs font-bold text-emerald-400 font-mono">
                            {err.correction}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 italic">{err.explanation}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Vocabulary Upgrades */}
              {writingResult.vocabularyUpgrades && writingResult.vocabularyUpgrades.length > 0 && (
                <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-3">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-teal-400" />
                    Từ Vựng Nâng Cấp (Vocabulary Upgrades)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {writingResult.vocabularyUpgrades.map((voc, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400">Từ thông dụng: {voc.basicWord}</span>
                          <span className="text-xs font-bold text-teal-300 font-mono">
                            → {voc.advancedAlternative}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 italic pt-1">
                          Ví dụ: {voc.exampleSentence}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
