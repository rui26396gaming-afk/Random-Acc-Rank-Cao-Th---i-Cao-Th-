import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  HelpCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  Award,
  Zap,
  BookOpen,
  ChevronRight,
  TrendingUp,
  History,
  Languages,
  Check,
  Flame,
  Volume2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { EnglishQuizQuestion, EnglishQuizSummary } from '../types';

interface EnglishQuizMasterProps {
  recentLearnedTopics?: string[];
  recentVocabulary?: string[];
}

export const EnglishQuizMaster: React.FC<EnglishQuizMasterProps> = ({
  recentLearnedTopics = [],
  recentVocabulary = [],
}) => {
  const { addXp } = useApp();

  // Generator Config State
  const [topic, setTopic] = useState<string>('Ngữ pháp & Cụm từ cố định (Collocations)');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('B1 - B2 Trung cấp & THPT Quốc Gia');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [includeLearnedData, setIncludeLearnedData] = useState<boolean>(true);

  // Quiz Engine State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [quizData, setQuizData] = useState<{
    quizTitle: string;
    topic: string;
    difficulty: string;
    questions: EnglishQuizQuestion[];
  } | null>(null);

  // Active Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [quizSummary, setQuizSummary] = useState<EnglishQuizSummary | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  // Quiz History (Stored in LocalStorage)
  const [quizHistory, setQuizHistory] = useState<EnglishQuizSummary[]>(() => {
    try {
      const saved = localStorage.getItem('omnilife_english_quiz_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && !isSubmitted) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isSubmitted]);

  // TTS helper
  const speakEnglish = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const presetTopics = [
    { label: 'Ngữ pháp & Collocations', value: 'Ngữ pháp & Cụm từ cố định (Collocations)' },
    { label: 'Mệnh đề quan hệ & Phân từ rút gọn', value: 'Mệnh đề quan hệ & Rút gọn mệnh đề phân từ' },
    { label: 'Thì động từ & Sự hòa hợp S - V', value: 'Các thì động từ & Sự hòa hợp giữa Chủ ngữ và Động từ' },
    { label: 'Từ vựng & Phrasal Verbs', value: 'Từ vựng thông dụng & Cụm động từ (Phrasal Verbs)' },
    { label: 'Luyện đề THPT Quốc Gia', value: 'Bộ câu hỏi phân loại thi THPT Quốc Gia môn Tiếng Anh' },
    { label: 'Luyện đề IELTS Grammar & Vocab', value: 'IELTS Academic Vocabulary & Complex Sentence Structures' },
    { label: 'Tìm lỗi sai ngữ pháp', value: 'Nhận diện lỗi sai ngữ pháp trong câu tiếng Anh' },
  ];

  const difficultyLevels = [
    { label: 'Cơ bản (A2 - B1)', value: 'A2 - B1 Nền tảng cơ bản', desc: 'Dành cho người mới bắt đầu lấy lại gốc' },
    { label: 'Trung cấp (B1 - B2)', value: 'B1 - B2 Trung cấp & THPT Quốc Gia', desc: 'Trọng tâm thi THPT QG và giao tiếp học thuật' },
    { label: 'Nâng cao (B2 - C1)', value: 'B2 - C1 Nâng cao & Học sinh giỏi', desc: 'Cấu trúc đảo ngữ, từ vựng phong phú' },
    { label: 'Chuyên sâu (C1 - IELTS 7.0+)', value: 'C1 - C2 Chuyên sâu & IELTS 7.0+', desc: 'Idiomatic expressions & Collocations hiếm' },
  ];

  // Generate Quiz
  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setGenerateError(null);
    setQuizData(null);
    setIsSubmitted(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setElapsedSeconds(0);

    const effectiveTopic = customTopic.trim() || topic;
    let progressContext = '';
    if (includeLearnedData) {
      const parts: string[] = [];
      if (recentLearnedTopics.length > 0) {
        parts.push(`Các dạng bài người học vừa giải gần đây: ${recentLearnedTopics.slice(-4).join(', ')}`);
      }
      if (recentVocabulary.length > 0) {
        parts.push(`Từ vựng cần củng cố: ${recentVocabulary.slice(-8).join(', ')}`);
      }
      progressContext = parts.join('; ');
    }

    try {
      const res = await fetch('/api/gemini/english-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: effectiveTopic,
          difficulty,
          questionCount,
          progressContext,
        }),
      });

      if (!res.ok) {
        throw new Error('Máy chủ bận, không thể tạo bài trắc nghiệm lúc này.');
      }

      const data = await res.json();
      if (!data.questions || data.questions.length === 0) {
        throw new Error('Dữ liệu câu hỏi tạo ra chưa đầy đủ. Vui lòng bấm tạo lại!');
      }

      setQuizData(data);
      setIsTimerRunning(true);
    } catch (err: any) {
      setGenerateError(err.message || 'Không thể tạo bài trắc nghiệm.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Select Option
  const handleSelectOption = (questionId: number, optionIdx: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIdx,
    }));
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    if (!quizData) return;
    setIsTimerRunning(false);
    setIsSubmitted(true);

    let correctCount = 0;
    quizData.questions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctIndex) {
        correctCount += 1;
      }
    });

    const total = quizData.questions.length;
    const scorePct = Math.round((correctCount / total) * 100);
    const earnedXp = correctCount * 15 + (scorePct === 100 ? 50 : scorePct >= 80 ? 25 : 10);

    addXp(earnedXp);

    let feedback = 'Cố gắng ôn tập lại các cấu trúc chưa nắm vững nhé!';
    if (scorePct === 100) {
      feedback = 'Xuất sắc tuyệt đối! Bạn đã làm chủ hoàn toàn các chủ điểm ngữ pháp này.';
    } else if (scorePct >= 80) {
      feedback = 'Làm bài rất tốt! Kiến thức vững vàng, chỉ cần chú ý thêm một số bẫy nhỏ.';
    } else if (scorePct >= 50) {
      feedback = 'Khá ổn! Hãy đọc kỹ giải thích chi tiết bên dưới để cải thiện điểm số.';
    }

    const summary: EnglishQuizSummary = {
      quizTitle: quizData.quizTitle,
      topic: quizData.topic,
      difficulty: quizData.difficulty,
      totalQuestions: total,
      score: correctCount,
      earnedXp,
      questions: quizData.questions,
      userAnswers: selectedAnswers,
      feedback,
      completedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    setQuizSummary(summary);

    // Save history
    const updatedHistory = [summary, ...quizHistory.slice(0, 9)];
    setQuizHistory(updatedHistory);
    try {
      localStorage.setItem('omnilife_english_quiz_history', JSON.stringify(updatedHistory));
    } catch (e) {
      console.warn('Cannot persist quiz history', e);
    }
  };

  // Retake Quiz
  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setIsSubmitted(false);
    setQuizSummary(null);
    setCurrentQuestionIndex(0);
    setElapsedSeconds(0);
    setIsTimerRunning(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Quiz Header Bar */}
      <div className="bg-slate-900/90 p-5 rounded-3xl border border-teal-500/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-teal-500/20 text-teal-300">
              <Award className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Trắc Nghiệm Tiếng Anh Tùy Biến (Custom AI English Quiz)
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Gemini AI Powered
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tự động sinh đề trắc nghiệm chuẩn quốc tế dựa trên tiến độ học tập và mục tiêu của bạn.
              </p>
            </div>
          </div>
        </div>

        {quizHistory.length > 0 && (
          <button
            onClick={() => setShowHistoryModal(!showHistoryModal)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition cursor-pointer self-start md:self-auto"
          >
            <History className="w-3.5 h-3.5 text-teal-400" />
            <span>Lịch sử ({quizHistory.length})</span>
          </button>
        )}
      </div>

      {/* History Modal / Drawer */}
      {showHistoryModal && (
        <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-teal-400" />
              Lịch Sử Làm Bài Trắc Nghiệm Gần Đây
            </h4>
            <button
              onClick={() => setShowHistoryModal(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              Đóng
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {quizHistory.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white truncate max-w-[160px]">{item.quizTitle}</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {item.score}/{item.totalQuestions} ({Math.round((item.score / item.totalQuestions) * 100)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[11px]">
                  <span>{item.difficulty.split(' ')[0]}</span>
                  <span>+{item.earnedXp} XP • {item.completedAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 1: QUIZ GENERATOR CONFIG (Shown when no quiz is currently active or after reset) */}
      {!quizData && (
        <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-400" />
              Thiết Lập Đề Trắc Nghiệm Thông Minh
            </h4>
            <span className="text-xs text-slate-400">Chọn chủ đề &amp; mức độ phù hợp</span>
          </div>

          {/* Preset Topics */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">1. Chọn Chủ Đề Ngữ Pháp / Kỹ Năng:</label>
            <div className="flex flex-wrap gap-2">
              {presetTopics.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => {
                    setTopic(pt.value);
                    setCustomTopic('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer border ${
                    topic === pt.value && !customTopic
                      ? 'bg-teal-600 text-white border-teal-500 shadow-xs'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
            {/* Custom Topic Input */}
            <div className="pt-1">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Hoặc tự nhập chủ đề (ví dụ: Câu điều kiện hỗn hợp, Idioms chủ đề môi trường...)"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300">2. Trình Độ Mục Tiêu:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {difficultyLevels.map((lvl) => (
                <div
                  key={lvl.value}
                  onClick={() => setDifficulty(lvl.value)}
                  className={`p-3 rounded-2xl border cursor-pointer transition flex items-start gap-3 ${
                    difficulty === lvl.value
                      ? 'bg-teal-500/10 border-teal-500 text-white'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      difficulty === lvl.value
                        ? 'border-teal-400 bg-teal-500 text-slate-950'
                        : 'border-slate-600'
                    }`}
                  >
                    {difficulty === lvl.value && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{lvl.label}</div>
                    <div className="text-[11px] text-slate-400">{lvl.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Question Count & Context Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">3. Số Lượng Câu Hỏi:</label>
              <div className="flex items-center gap-2">
                {[3, 5, 10].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuestionCount(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      questionCount === num
                        ? 'bg-teal-600 text-white border-teal-500 shadow-xs'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {num} câu {num === 3 ? '(2p)' : num === 5 ? '(5p)' : '(10p)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-2">4. Tiến Độ Học Cá Nhân:</label>
              <label className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLearnedData}
                  onChange={(e) => setIncludeLearnedData(e.target.checked)}
                  className="rounded text-teal-600 focus:ring-0 focus:outline-none w-4 h-4 cursor-pointer"
                />
                <span className="text-xs text-slate-300">
                  Tự động tích hợp từ vựng và bài tập đã giải gần đây vào đề
                </span>
              </label>
            </div>
          </div>

          {generateError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{generateError}</span>
            </div>
          )}

          {/* Submit Action */}
          <button
            type="button"
            disabled={isGenerating}
            onClick={handleGenerateQuiz}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin" />
                <span>Gemini AI đang biên soạn {questionCount} câu trắc nghiệm chuyên sâu...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Bắt Đầu Làm Bài Trắc Nghiệm ({questionCount} câu)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 2: ACTIVE QUIZ RUNNER */}
      {quizData && (
        <div className="space-y-6">
          {/* Quiz Top Action Bar */}
          <div className="bg-slate-900 p-4 rounded-3xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-teal-400 px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20">
                  {quizData.difficulty.split(' ')[0]}
                </span>
                <h4 className="text-sm font-bold text-white truncate max-w-[280px] sm:max-w-md">
                  {quizData.quizTitle}
                </h4>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timer */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{formatTime(elapsedSeconds)}</span>
              </div>

              {/* Progress Count */}
              <div className="text-xs text-slate-400 font-semibold">
                Đã chọn:{' '}
                <span className="text-teal-400 font-bold">
                  {Object.keys(selectedAnswers).length}/{quizData.questions.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setQuizData(null)}
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition cursor-pointer"
              >
                Đổi Đề
              </button>
            </div>
          </div>

          {/* SUMMARY SCORECARD (Shown upon submission) */}
          {isSubmitted && quizSummary && (
            <div className="bg-gradient-to-br from-slate-900 via-teal-950/20 to-slate-900 p-6 rounded-3xl border border-teal-500/30 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${
                      quizSummary.score === quizSummary.totalQuestions
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : quizSummary.score >= quizSummary.totalQuestions * 0.7
                        ? 'bg-teal-500/20 border-teal-500 text-teal-300'
                        : 'bg-amber-500/20 border-amber-500 text-amber-300'
                    }`}
                  >
                    {Math.round((quizSummary.score / quizSummary.totalQuestions) * 100)}%
                  </div>
                  <div>
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      Kết Quả: {quizSummary.score} / {quizSummary.totalQuestions} Câu Đúng
                      {quizSummary.score === quizSummary.totalQuestions && (
                        <Flame className="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />
                      )}
                    </h4>
                    <p className="text-xs text-slate-300">{quizSummary.feedback}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-2 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-teal-400" />
                    <span>+{quizSummary.earnedXp} XP Nhận Được</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRetakeQuiz}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition cursor-pointer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Làm Lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuizData(null)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Tạo Đề Khác</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* QUESTION CARDS LIST */}
          <div className="space-y-5">
            {quizData.questions.map((q, qIndex) => {
              const selectedOpt = selectedAnswers[q.id];
              const isAnswered = selectedOpt !== undefined;
              const isCorrect = selectedOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`bg-slate-900 p-5 rounded-3xl border transition ${
                    isSubmitted
                      ? isCorrect
                        ? 'border-emerald-500/40 bg-slate-900/90'
                        : 'border-rose-500/40 bg-slate-900/90'
                      : isAnswered
                      ? 'border-teal-500/40'
                      : 'border-slate-800'
                  }`}
                >
                  {/* Question header */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 text-teal-400 font-bold text-xs flex items-center justify-center">
                        {qIndex + 1}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {q.grammarFocus}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => speakEnglish(q.question)}
                        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-teal-400 transition cursor-pointer"
                        title="Nghe phát âm câu hỏi"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>

                      {isSubmitted && (
                        <span
                          className={`text-xs font-bold flex items-center gap-1 px-2 py-0.5 rounded-full ${
                            isCorrect
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Đúng</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Sai</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <h5 className="text-sm sm:text-base font-semibold text-white mb-4 leading-relaxed font-sans">
                    {q.question}
                  </h5>

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((option, optIdx) => {
                      const isOptionSelected = selectedOpt === optIdx;
                      const isOptionTheCorrectAnswer = q.correctIndex === optIdx;

                      let optionStyle =
                        'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800';

                      if (isSubmitted) {
                        if (isOptionTheCorrectAnswer) {
                          optionStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                        } else if (isOptionSelected && !isCorrect) {
                          optionStyle = 'bg-rose-500/20 border-rose-500 text-rose-300 line-through';
                        } else {
                          optionStyle = 'bg-slate-800/40 border-slate-800 text-slate-500';
                        }
                      } else if (isOptionSelected) {
                        optionStyle = 'bg-teal-500/20 border-teal-500 text-teal-200 font-semibold shadow-xs';
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelectOption(q.id, optIdx)}
                          className={`p-3 rounded-2xl border text-xs cursor-pointer transition flex items-center justify-between gap-2 ${optionStyle}`}
                        >
                          <span className="flex-1">{option}</span>
                          {isSubmitted && isOptionTheCorrectAnswer && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          )}
                          {isSubmitted && isOptionSelected && !isCorrect && (
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Detailed Explanation upon submission */}
                  {isSubmitted && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center gap-1.5 text-teal-400 font-bold">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Giải thích chi tiết &amp; Quy tắc ngữ pháp:</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Footer Button */}
          {!isSubmitted && (
            <div className="sticky bottom-4 z-20 bg-slate-900/95 backdrop-blur-md p-4 rounded-3xl border border-teal-500/30 shadow-2xl flex items-center justify-between gap-4">
              <div className="text-xs text-slate-300">
                Đã hoàn thành{' '}
                <span className="font-bold text-teal-400">
                  {Object.keys(selectedAnswers).length}/{quizData.questions.length}
                </span>{' '}
                câu hỏi.
              </div>

              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={Object.keys(selectedAnswers).length === 0}
                className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition cursor-pointer disabled:opacity-40"
              >
                Nộp Bài &amp; Xem Giải Thích Chi Tiết
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
