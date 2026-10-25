import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calculator,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  FileQuestion,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  Bookmark,
  Share2,
  Trash2,
  MessageSquare,
  Send,
  Zap,
  Atom,
  TestTube,
  Dna,
  Code2,
  GraduationCap,
  ExternalLink,
  Mic,
  MicOff,
  Square,
  RefreshCw,
  ShieldCheck,
  Database,
  Clock,
} from 'lucide-react';
import { UniversalSolverResult, SolutionStep } from '../types';
import { useApp } from '../context/AppContext';
import { SpeechToTextManager, STTStatus } from '../services/sttService';

interface SolvedHistoryItem {
  id: string;
  timestamp: string;
  problem: string;
  subject: string;
  exactAnswer: string;
  result: UniversalSolverResult;
}

export const UniversalProblemSolver: React.FC = () => {
  const { addXp } = useApp();

  // Input states
  const [problemInput, setProblemInput] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('Tự động nhận diện');
  const [gradeLevel, setGradeLevel] = useState<string>('THPT (Lớp 10-12)');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Execution states & Terminal status
  type TerminalStatus = 'idle' | 'loading' | 'success' | 'partial' | 'error' | 'timeout' | 'cancelled';
  const [terminalStatus, setTerminalStatus] = useState<TerminalStatus>('idle');
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const activeRequestIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutTimerRef = useRef<any>(null);

  // STT Contract #9 states
  const sttManagerRef = useRef<SpeechToTextManager>(new SpeechToTextManager());
  const [sttStatus, setSttStatus] = useState<STTStatus>('READY');
  const [sttError, setSttError] = useState<string | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UniversalSolverResult | null>(null);
  const [copiedAnswer, setCopiedAnswer] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Deep-dive / Follow-up Q&A states
  const [activeStepForQuestion, setActiveStepForQuestion] = useState<SolutionStep | null>(null);
  const [deepDiveQuestion, setDeepDiveQuestion] = useState<string>('');
  const [deepDiveLoading, setDeepDiveLoading] = useState<boolean>(false);
  const [deepDiveAnswer, setDeepDiveAnswer] = useState<{
    directAnswer: string;
    detailedExplanation: string;
    shortcutOrTip: string;
    encouragement: string;
  } | null>(null);

  // History state
  const [history, setHistory] = useState<SolvedHistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('omnilife_solver_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Sync history to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('omnilife_solver_history', JSON.stringify(history.slice(0, 20)));
    } catch (e) {
      console.warn('Cannot save history', e);
    }
  }, [history]);

  // Handle Clipboard Image Paste anywhere in textarea
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (loadEvt) => {
            setImagePreview(loadEvt.target?.result as string);
          };
          reader.readAsDataURL(file);
          e.preventDefault();
          break;
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        setImagePreview(loadEvt.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  // Pre-configured real-world examples across varied subjects
  const samplePresets = [
    {
      subject: 'Toán học',
      grade: 'THPT (Lớp 10-12)',
      title: 'Khảo sát cực trị hàm số',
      text: 'Cho hàm số y = 2x^3 - 3(m+1)x^2 + 6mx. Tìm tất cả các giá trị thực của tham số m để đồ thị hàm số có hai điểm cực trị A và B sao cho tam giác OAB có diện tích bằng 4 (với O là gốc tọa độ).',
    },
    {
      subject: 'Vật lý',
      grade: 'THPT (Lớp 10-12)',
      title: 'Dao động điều hòa & Năng lượng',
      text: 'Một con lắc lò xo gồm vật nặng m = 200g và lò xo độ cứng k = 50 N/m dao động điều hòa trên mặt phẳng ngang. Tại thời điểm t1, vận tốc của vật là v1 = 20 cm/s và gia tốc a1 = -2 m/s^2. Tính cơ năng của con lắc và biên độ dao động A.',
    },
    {
      subject: 'Hóa học',
      grade: 'THPT (Lớp 10-12)',
      title: 'Hòa tan kim loại & Bảo toàn e',
      text: 'Hòa tan hoàn toàn 11,2 gam hỗn hợp Fe và Cu vào dung dịch HNO3 loãng dư, thu được 4,48 lít khí NO (sản phẩm khử duy nhất, ở đktc). Tính phần trăm khối lượng của mỗi kim loại trong hỗn hợp ban đầu.',
    },
    {
      subject: 'Tiếng Anh',
      grade: 'Luyện thi ĐGNL / THPTQG',
      title: 'Trắc nghiệm ngữ pháp & Đảo ngữ',
      text: 'Chọn đáp án đúng nhất và giải thích bẫy trắc nghiệm:\n"Not until all the guests had arrived _______ the opening ceremony."\nA. they did start\nB. did they start\nC. they started\nD. had they started',
    },
    {
      subject: 'Tin học / Thuật toán',
      grade: 'Đại học / Chuyên sâu',
      title: 'Tìm cặp số có tổng bằng Target',
      text: 'Cho mảng số nguyên nums = [2, 7, 11, 15] và target = 9. Tìm chỉ số hai số sao cho tổng bằng target với độ phức tạp tối ưu O(n). Viết mã giả hoặc code Python và giải thích cơ chế băm Hash Map.',
    },
  ];

  // Stop / Cancel in-flight request
  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
    setLoading(false);
    setTerminalStatus('cancelled');
    setError('Đã dừng tiến trình giải bài theo lệnh của bạn.');
  };

  const handleSolve = async (overrideProblem?: string, overrideSubject?: string) => {
    const textToSolve = overrideProblem !== undefined ? overrideProblem : problemInput;
    if (!textToSolve.trim() && !imagePreview) {
      setError('Vui lòng nhập nội dung đề bài hoặc tải ảnh chụp bài tập!');
      return;
    }

    // Cancel any previous in-flight request so requests never clobber each other
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }

    const currentReqId = `req-cli-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    activeRequestIdRef.current = currentReqId;
    setActiveRequestId(currentReqId);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setTerminalStatus('loading');
    setError(null);
    setDeepDiveAnswer(null);
    setActiveStepForQuestion(null);

    // 25-second client-side timeout gate
    timeoutTimerRef.current = setTimeout(() => {
      if (activeRequestIdRef.current === currentReqId) {
        controller.abort();
        setLoading(false);
        setTerminalStatus('timeout');
        setError('Quá thời gian phản hồi từ máy chủ (25s). Bạn có thể bấm [Thử lại] hoặc chọn một phân môn khác.');
      }
    }, 25000);

    try {
      const res = await fetch('/api/gemini/universal-solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: currentReqId,
          problem: textToSolve,
          imageBase64: imagePreview,
          subjectHint: overrideSubject || (selectedSubject === 'Tự động nhận diện' ? '' : selectedSubject),
          gradeHint: gradeLevel,
        }),
        signal: controller.signal,
      });

      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
        timeoutTimerRef.current = null;
      }

      // Check if another request superseded this one
      if (activeRequestIdRef.current !== currentReqId) {
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.error || `Máy chủ phản hồi lỗi (${res.status}). Vui lòng thử lại!`;
        setTerminalStatus('error');
        throw new Error(msg);
      }

      const data: UniversalSolverResult = await res.json();
      if (!data || !data.exactAnswer) {
        setTerminalStatus('partial');
        throw new Error('Dữ liệu phản hồi chưa đầy đủ đáp án chính xác.');
      }

      setTerminalStatus('success');
      setResult(data);
      addXp(35, 'Giải thành công bài toán');

      // Add to history
      const historyItem: SolvedHistoryItem = {
        id: currentReqId,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        problem: textToSolve || 'Bài tập qua ảnh chụp',
        subject: data.analysis?.subject || selectedSubject,
        exactAnswer: data.exactAnswer,
        result: data,
      };
      setHistory((prev) => [historyItem, ...prev.filter((h) => h.problem !== historyItem.problem)].slice(0, 25));

      // Scroll to result smoothly
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      if (activeRequestIdRef.current === currentReqId) {
        if (err.name === 'AbortError' || err.message?.includes('aborted')) {
          if (terminalStatus !== 'timeout') {
            setTerminalStatus('cancelled');
            setError('Đã hủy tiến trình giải bài.');
          }
        } else {
          setTerminalStatus('error');
          setError(err.message || 'Lỗi kết nối AI Gateway');
        }
      }
    } finally {
      if (activeRequestIdRef.current === currentReqId) {
        setLoading(false);
        abortControllerRef.current = null;
        if (timeoutTimerRef.current) {
          clearTimeout(timeoutTimerRef.current);
          timeoutTimerRef.current = null;
        }
      }
    }
  };

  // Phase 3: Microphone & Real STT Toggle (Contract #9)
  const toggleRecording = async () => {
    const mgr = sttManagerRef.current;
    if (sttStatus === 'RECORDING') {
      setSttStatus('TRANSCRIBING');
      const res = await mgr.stopAndTranscribe();
      setSttStatus(res.status);
      if (res.status === 'SUCCESS' && res.transcript) {
        setProblemInput((prev) => (prev ? `${prev} ${res.transcript}` : res.transcript));
        setSttError(null);
      } else if (res.status === 'NOT_CONFIGURED') {
        setSttError('Dịch vụ Nhận Dạng Giọng Nói (STT) chưa được cấu hình khóa trên server. Không giả lập dữ liệu.');
      } else if (res.error) {
        setSttError(res.error);
      }
    } else {
      setSttError(null);
      const ok = await mgr.startRecording((s) => setSttStatus(s));
      if (!ok) {
        setSttStatus(mgr.getStatus());
        if (mgr.getStatus() === 'PERMISSION_DENIED') {
          setSttError('Quyền truy cập Microphone bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt.');
        } else if (mgr.getStatus() === 'UNAVAILABLE') {
          setSttError('Thiết bị hoặc trình duyệt không hỗ trợ Web Audio API.');
        }
      }
    }
  };

  const handleCopyAnswer = () => {
    if (!result) return;
    const textToCopy = `[ĐÁP ÁN CHÍNH XÁC]\n${result.exactAnswer}\n\n[CÔNG THỨC ÁP DỤNG]\n${result.coreFormulas.map((f) => `${f.name}: ${f.formula}`).join('\n')}\n\n[LỜI GIẢI CHI TIẾT]\n${result.detailedSteps.map((s) => `Bước ${s.stepNumber}: ${s.title}\n${s.detail}`).join('\n\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  // Text-to-speech for answer & summary
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window) || !result) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `Đáp án chính xác: ${result.exactAnswer}. ${result.answerSummary}. Các công thức then chốt: ${result.coreFormulas.map((f) => f.name).join(', ')}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Deep-dive follow-up submit
  const handleDeepDiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deepDiveQuestion.trim() || !result) return;

    setDeepDiveLoading(true);
    try {
      const res = await fetch('/api/gemini/universal-solver/deep-dive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemContext: problemInput || result.analysis.problemSummary,
          currentAnswer: result.exactAnswer,
          question: deepDiveQuestion,
          stepNumber: activeStepForQuestion?.stepNumber,
        }),
      });

      if (!res.ok) throw new Error('Không thể giải đáp lúc này.');
      const data = await res.json();
      setDeepDiveAnswer(data);
      addXp(15, 'Hỏi sâu tư duy bài học');
    } catch (err: any) {
      console.error(err);
    } finally {
      setDeepDiveLoading(false);
    }
  };

  const subjectBadges = [
    { label: 'Tự động nhận diện', icon: Sparkles },
    { label: 'Toán học', icon: Calculator },
    { label: 'Vật lý', icon: Atom },
    { label: 'Hóa học', icon: TestTube },
    { label: 'Sinh học', icon: Dna },
    { label: 'Tiếng Anh', icon: BookOpen },
    { label: 'Tin học / Code', icon: Code2 },
    { label: 'Ngữ văn & KHXH', icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl border border-blue-500/30">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              Công Nghệ Trí Tuệ Siêu Cấp
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Giải Bài Tự Động Toàn Năng
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Thu thập dữ kiện bài toán, đưa ra <span className="text-amber-300 font-bold">đáp án chính xác 100%</span>,
              đóng khung <span className="text-cyan-300 font-bold">công thức cốt lõi</span> và trình bày{' '}
              <span className="text-emerald-300 font-bold">lời giải chi tiết từng bước</span> cho mọi môn học.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-xs">
            <div className="text-center px-2">
              <p className="text-slate-400 font-medium">Độ chính xác</p>
              <p className="text-emerald-400 font-black text-lg">100%</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2">
              <p className="text-slate-400 font-medium">Hỗ trợ</p>
              <p className="text-cyan-300 font-black text-lg">Mọi Môn</p>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center px-2">
              <p className="text-slate-400 font-medium">Ảnh / Chữ</p>
              <p className="text-amber-300 font-black text-lg">Đa thể thức</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Solver Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Subject & Grade Selector */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              Chọn phân môn &amp; Cấp học (tùy chọn):
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Cấp độ:</span>
              <select
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
                className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Tiểu học (Lớp 1-5)">Tiểu học (Lớp 1-5)</option>
                <option value="THCS (Lớp 6-9)">THCS (Lớp 6-9)</option>
                <option value="THPT (Lớp 10-12)">THPT (Lớp 10-12)</option>
                <option value="Luyện thi ĐGNL / THPTQG">Luyện thi ĐGNL / THPTQG</option>
                <option value="Đại học / Chuyên sâu">Đại học / Chuyên ngành</option>
              </select>
            </div>
          </div>

          {/* Subject Pills */}
          <div className="flex flex-wrap gap-2">
            {subjectBadges.map((badge) => {
              const Icon = badge.icon;
              const isSelected = selectedSubject === badge.label;
              return (
                <button
                  key={badge.label}
                  type="button"
                  onClick={() => setSelectedSubject(badge.label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{badge.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Problem Input Box with Image attachment & Paste detection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Nội dung đề bài / Câu hỏi
            </span>
            <span className="text-xs text-slate-400">
              Mẹo: Có thể dán ảnh trực tiếp bằng <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px]">Ctrl+V</kbd>
            </span>
          </div>

          <div
            className={`relative rounded-2xl border-2 transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
                : 'border-slate-200 dark:border-slate-700 focus-within:border-blue-600 dark:focus-within:border-blue-500'
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files?.[0];
              if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (loadEvt) => {
                  setImagePreview(loadEvt.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          >
            <textarea
              value={problemInput}
              onChange={(e) => setProblemInput(e.target.value)}
              onPaste={handlePaste}
              rows={4}
              placeholder="Nhập hoặc dán bất kỳ bài toán, bài tập lý hóa, câu hỏi trắc nghiệm tiếng Anh, đề văn hoặc đoạn mã cần giải vào đây..."
              className="w-full p-4 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none resize-y"
            />

            {/* Image Preview Thumbnail if attached */}
            {imagePreview && (
              <div className="p-3 mx-3 mb-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-between border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Problem attachment"
                    className="w-14 h-14 object-cover rounded-lg border border-slate-300 dark:border-slate-600 shadow-xs"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-500" />
                      Đã đính kèm ảnh bài tập
                    </p>
                    <p className="text-[11px] text-slate-500">Gemini sẽ đọc OCR toàn bộ công thức &amp; hình vẽ</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeImage}
                  className="px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                >
                  Xóa ảnh
                </button>
              </div>
            )}

            {/* Bottom Input Actions (Upload image / Camera / Presets) */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 rounded-b-2xl">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tải ảnh đề bài</span>
                </button>

                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition cursor-pointer shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Chụp ảnh camera</span>
                </button>

                {/* Microphone / Real STT (Contract #9) */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer shadow-xs ${
                    sttStatus === 'RECORDING'
                      ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                      : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100'
                  }`}
                  title="Nói đề bài qua Microphone (Speech-To-Text)"
                >
                  {sttStatus === 'RECORDING' ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>Đang thu âm (Bấm dừng)...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-purple-500" />
                      <span>Nói đề bài (Micro)</span>
                    </>
                  )}
                </button>
              </div>

              {problemInput && (
                <button
                  type="button"
                  onClick={() => {
                    setProblemInput('');
                    removeImage();
                    setTerminalStatus('idle');
                    setError(null);
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium"
                >
                  Xóa trắng
                </button>
              )}
            </div>

            {/* STT Status Banner if error/permission denied */}
            {sttError && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <span>{sttError}</span>
                <button onClick={() => setSttError(null)} className="text-amber-600 hover:underline">
                  Đóng
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Presets / Mẫu Đề Bài Tiêu Biểu */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-500" />
              Thử nhanh các bài mẫu các môn:
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {samplePresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setProblemInput(preset.text);
                  setSelectedSubject(preset.subject);
                  setGradeLevel(preset.grade);
                }}
                className="text-left p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
                    {preset.subject}
                  </span>
                  <span className="text-[10px] text-slate-400">{preset.grade}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-blue-600 transition">
                  {preset.title}
                </p>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                  {preset.text}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Action Button & Controls */}
        <div className="pt-2 space-y-2">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              type="button"
              onClick={() => handleSolve()}
              disabled={loading}
              className={`flex-1 w-full py-4 px-6 rounded-2xl font-bold text-base shadow-lg flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] cursor-pointer ${
                loading
                  ? 'bg-blue-600 text-white shadow-blue-500/20'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white shadow-blue-500/25'
              }`}
            >
              {loading ? (
                <>
                  <RotateCcw className="w-5 h-5 animate-spin" />
                  <span>Đang thu thập thông tin, bóc tách công thức &amp; giải chính xác...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 text-amber-300" />
                  <span>GIẢI BÀI TỰ ĐỘNG NGAY (Đáp án + Lời giải + Công thức)</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Stop / Cancel Button (Visible during loading) */}
            {loading && (
              <button
                type="button"
                onClick={handleCancel}
                className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer shrink-0"
                title="Hủy ngay yêu cầu đang xử lý"
              >
                <Square className="w-4 h-4 fill-white" />
                <span>Dừng lại</span>
              </button>
            )}

            {/* Retry Button (Visible on error, timeout, or cancelled) */}
            {!loading && (terminalStatus === 'error' || terminalStatus === 'timeout' || terminalStatus === 'cancelled') && (
              <button
                type="button"
                onClick={() => handleSolve()}
                className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition active:scale-95 cursor-pointer shrink-0"
                title="Thử lại yêu cầu với cơ chế failover"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Thử lại</span>
              </button>
            )}
          </div>

          {/* Diagnostic Request ID & Status Indicator */}
          {activeRequestId && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono px-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>Mã chẩn đoán: {activeRequestId}</span>
              </span>
              <span className={`px-2 py-0.5 rounded-md font-semibold uppercase text-[10px] ${
                terminalStatus === 'success'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : terminalStatus === 'loading'
                  ? 'bg-blue-500/20 text-blue-400'
                  : terminalStatus === 'timeout'
                  ? 'bg-amber-500/20 text-amber-400'
                  : terminalStatus === 'cancelled'
                  ? 'bg-slate-500/20 text-slate-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}>
                Trạng thái: {terminalStatus}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="font-bold">Thông báo hệ thống</p>
                {activeRequestId && <span className="text-[10px] font-mono opacity-80">{activeRequestId}</span>}
              </div>
              <p className="text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* RESULT SECTION */}
      {result && (
        <div ref={resultRef} className="space-y-6 pt-2">
          {/* Phase 2: Verified Grounding & Citations Header */}
          {result.citations && result.citations.length > 0 && (
            <div className="bg-slate-900 border border-blue-900/60 rounded-3xl p-5 space-y-3 text-slate-100 shadow-md">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm text-white">Nguồn Đối Chiếu &amp; Tri Thức Thẩm Định (Verified RAG Grounding)</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.provider && (
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      {result.provider} / {result.model} ({result.latencyMs}ms)
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    result.trustStatus === 'verified'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {result.trustStatus === 'verified' ? 'Đã Thẩm Định (Verified)' : result.trustStatus || 'No Sources'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {result.citations.map((c) => (
                  <div key={c.id} className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-300">{c.title}</span>
                      {c.dateVerified && <span className="text-[10px] text-slate-400">{c.dateVerified}</span>}
                    </div>
                    <p className="text-[11px] text-slate-400 italic">{c.domain} {c.version ? `• ${c.version}` : ''}</p>
                    <p className="text-slate-300 font-mono text-[11px] bg-slate-900/60 p-2 rounded-xl mt-1 border border-slate-800">
                      {c.snippet}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 1. THU THẬP THÔNG TIN BÀI TOÁN (Information Collection) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-xl">
                  <FileQuestion className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    1. Thu Thập &amp; Phân Tích Thông Tin Bài Toán
                  </h3>
                  <p className="text-xs text-slate-500">
                    Bóc tách giả thiết, yêu cầu và dạng bài học thuật
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold">
                  {result.analysis.subject}
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-medium">
                  {result.analysis.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  {result.analysis.gradeLevel}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Given Data */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Dữ liệu / Giả thiết đã cho (Given Data)
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {result.analysis.givenData.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Targets */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Yêu cầu / Đại lượng cần tìm (Targets)
                </div>
                <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                  {result.analysis.targetRequirements.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {result.analysis.problemSummary && (
              <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-semibold not-italic text-slate-700 dark:text-slate-300">Tóm tắt: </span>
                {result.analysis.problemSummary}
              </p>
            )}
          </div>

          {/* 2. ĐÁP ÁN CHÍNH XÁC TUYỆT ĐỐI (Exact Answer) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white p-6 sm:p-8 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  2. ĐÁP ÁN CHÍNH XÁC TUYỆT ĐỐI
                </div>
                <div className="flex items-baseline gap-3 flex-wrap">
                  {result.answerChoice && (
                    <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-xl rounded-xl shadow-md">
                      {result.answerChoice}
                    </span>
                  )}
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight break-words">
                    {result.exactAnswer}
                  </h2>
                </div>
                <p className="text-emerald-100 text-sm max-w-2xl font-medium">
                  {result.answerSummary}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={toggleSpeech}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold backdrop-blur-md transition cursor-pointer"
                  title="Nghe đọc đáp án"
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isSpeaking ? 'Dừng đọc' : 'Đọc đáp án'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyAnswer}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-emerald-900 text-xs font-black hover:bg-emerald-50 transition cursor-pointer shadow-md"
                >
                  {copiedAnswer ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedAnswer ? 'Đã sao chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3. CÔNG THỨC & ĐỊNH LÝ ÁP DỤNG (Core Formulas & Theorems) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="p-2 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 rounded-xl">
                <Calculator className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  3. Công Thức &amp; Định Lý Cốt Lõi Áp Dụng
                </h3>
                <p className="text-xs text-slate-500">
                  Hệ thống công thức, định luật và quy tắc then chốt để giải bài
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.coreFormulas.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-blue-50/40 dark:from-slate-800/80 dark:to-slate-800/40 border border-indigo-200/80 dark:border-slate-700 space-y-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-1.5">
                      <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                      {item.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-200 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 font-bold">
                      Công thức #{idx + 1}
                    </span>
                  </div>

                  {/* Formula Box styled like Math Block */}
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-indigo-100 dark:border-slate-700 font-mono text-sm sm:text-base font-black text-indigo-700 dark:text-indigo-300 overflow-x-auto shadow-inner text-center">
                    {item.formula}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. LỜI GIẢI CHI TIẾT TỪNG BƯỚC (Detailed Step-by-Step Solution) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 rounded-xl">
                  <BookOpen className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    4. Lời Giải Chi Tiết Từng Bước (Step-by-Step)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Trình bày logic sư phạm, không nhảy cóc biến đổi
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-xl">
                {result.detailedSteps.length} Bước giải
              </span>
            </div>

            <div className="space-y-4">
              {result.detailedSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 hover:border-blue-300 dark:hover:border-blue-700 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
                        {step.stepNumber}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                        {step.title}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setActiveStepForQuestion(step);
                        setDeepDiveQuestion(`Tại sao ở Bước ${step.stepNumber} lại biến đổi như vậy? Có mẹo nào giải nhanh hơn không?`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/60 transition cursor-pointer shrink-0"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Hỏi sâu bước này</span>
                    </button>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line pl-9">
                    {step.detail}
                  </p>

                  {step.mathExpression && (
                    <div className="ml-9 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-bold overflow-x-auto">
                      {step.mathExpression}
                    </div>
                  )}

                  {step.notes && (
                    <div className="ml-9 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5 font-medium">
                      <Lightbulb className="w-3.5 h-3.5 shrink-0" />
                      <span>Lưu ý: {step.notes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 5. KIỂM TRA LẠI & BẪY THƯỜNG GẶP (Verification & Common Traps) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Verification */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-200 dark:border-emerald-900/60 p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                <span>5. Thẩm Định &amp; Kiểm Tra Lại (Verification)</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {result.verification}
              </p>
            </div>

            {/* Common Traps */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-amber-200 dark:border-amber-900/60 p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-sm">
                <AlertTriangle className="w-5 h-5" />
                <span>6. Cạm Bẫy Sai Lầm Dễ Mắc Phải</span>
              </div>
              <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                {result.commonTraps.map((trap, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{trap}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 7. BÀI TẬP TỰ LUYỆN TƯƠNG TỰ (Similar Practice Exercises) */}
          {result.similarExercises && result.similarExercises.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300 rounded-xl">
                    <Zap className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      7. Bài Tập Tương Tự Để Tự Luyện Ngay
                    </h3>
                    <p className="text-xs text-slate-500">
                      Rèn luyện tức thì để nắm vững 100% dạng bài này
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.similarExercises.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-teal-700 dark:text-teal-400">
                        Bài tự luyện #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setProblemInput(ex.question);
                          handleSolve(ex.question, result.analysis.subject);
                        }}
                        className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Giải bài này</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {ex.question}
                    </p>

                    <div className="text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <p>
                        <strong className="text-slate-700 dark:text-slate-300">Gợi ý:</strong> {ex.hint}
                      </p>
                      {ex.answer && (
                        <p className="mt-1 text-emerald-600 dark:text-emerald-400 font-bold">
                          Đáp số tham khảo: {ex.answer}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DEEP DIVE MODAL / DRAWER */}
          {activeStepForQuestion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                      {activeStepForQuestion.stepNumber}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      Hỏi Sâu Về Bước {activeStepForQuestion.stepNumber}
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveStepForQuestion(null);
                      setDeepDiveAnswer(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300">
                  <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">
                    {activeStepForQuestion.title}
                  </p>
                  <p className="line-clamp-2">{activeStepForQuestion.detail}</p>
                </div>

                <form onSubmit={handleDeepDiveSubmit} className="space-y-3">
                  <textarea
                    value={deepDiveQuestion}
                    onChange={(e) => setDeepDiveQuestion(e.target.value)}
                    rows={2}
                    placeholder="Nhập thắc mắc của bạn về bước giải này..."
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveStepForQuestion(null);
                        setDeepDiveAnswer(null);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      Đóng
                    </button>
                    <button
                      type="submit"
                      disabled={deepDiveLoading || !deepDiveQuestion.trim()}
                      className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 disabled:opacity-50 cursor-pointer shadow-xs"
                    >
                      {deepDiveLoading ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Gửi thắc mắc</span>
                    </button>
                  </div>
                </form>

                {deepDiveAnswer && (
                  <div className="p-4 bg-blue-50/60 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 space-y-2 text-xs">
                    <p className="font-bold text-blue-900 dark:text-blue-300">
                      💡 {deepDiveAnswer.directAnswer}
                    </p>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {deepDiveAnswer.detailedExplanation}
                    </p>
                    {deepDiveAnswer.shortcutOrTip && (
                      <p className="text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-lg">
                        ⚡ Mẹo: {deepDiveAnswer.shortcutOrTip}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* RECENT SOLVED HISTORY */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-blue-600" />
              Lịch Sử Các Câu Đã Giải ({history.length})
            </span>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="text-xs text-rose-500 hover:text-rose-700 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3" />
              Xóa lịch sử
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setProblemInput(item.problem);
                  setResult(item.result);
                  resultRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 cursor-pointer transition space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                    {item.subject}
                  </span>
                  <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2">
                  {item.problem}
                </p>
                <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 line-clamp-1">
                  ĐS: {item.exactAnswer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
