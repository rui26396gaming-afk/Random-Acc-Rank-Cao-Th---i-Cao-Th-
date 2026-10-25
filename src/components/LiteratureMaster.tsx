import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Award,
  CheckCircle2,
  Copy,
  Check,
  RotateCw,
  Send,
  Feather,
  Layers,
  Search,
  SlidersHorizontal,
  Bookmark,
  Share2,
  Quote,
  Lightbulb,
  GraduationCap,
  Scale,
  BrainCircuit,
  Maximize2,
  ZoomIn,
  ZoomOut,
  HelpCircle,
} from 'lucide-react';
import { LiteratureEducationLevel, LiteratureResult } from '../types';
import { useApp } from '../context/AppContext';

const PRESET_TOPICS = [
  {
    level: 'high_school' as LiteratureEducationLevel,
    label: 'Cấp 3 - HSG Quốc Gia',
    title: 'Lý luận văn học: Tiếng thét của nỗi đau & Niềm hy vọng',
    problem:
      'Nhà văn Pháp Albert Camus từng chia sẻ: "Nghệ thuật chân chính là tiếng thét của nỗi đau và bản tình ca của niềm hy vọng." Anh/chị hãy bình luận ý kiến trên và làm sáng tỏ qua nhân vật Tràng trong tác phẩm "Vợ nhặt" của nhà văn Kim Lân.',
    genre: 'Nghị luận văn học kết hợp Lý luận văn học',
  },
  {
    level: 'high_school' as LiteratureEducationLevel,
    label: 'Cấp 3 - Thi Tốt Nghiệp / ĐH',
    title: 'Cảm hứng lãng mạn & Bi tráng trong "Tây Tiến"',
    problem:
      'Cảm nhận của anh/chị về vẻ đẹp hào hùng, bi tráng và cảm hứng lãng mạn của người lính qua đoạn thơ trong bài thơ "Tây Tiến" của Quang Dũng: "Tây Tiến đoàn binh không mọc tóc / Quân xanh màu lá dữ oai hùm / Mắt trừng gửi mộng qua biên giới / Đêm mơ Hà Nội dáng kiều thơm..."',
    genre: 'Phân tích & Cảm thụ thơ ca',
  },
  {
    level: 'secondary' as LiteratureEducationLevel,
    label: 'Cấp 2 - THCS',
    title: 'Ý nghĩa hình tượng "Chiếc lá cuối cùng" (O. Henry)',
    problem:
      'Phân tích ý nghĩa nhân văn sâu sắc của kiệt tác chiếc lá thường xuân cuối cùng mà cụ Bơ-men đã vẽ trong truyện ngắn "Chiếc lá cuối cùng" của nhà văn O. Henry. Từ đó rút ra bài học về tình yêu thương giữa con người với con người.',
    genre: 'Nghị luận văn học THCS',
  },
  {
    level: 'primary' as LiteratureEducationLevel,
    label: 'Cấp 1 - Tiểu Học',
    title: 'Cảm thụ tình cảm gia đình qua "Quạt cho bà ngủ"',
    problem:
      'Đọc khổ thơ sau trong bài "Quạt cho bà ngủ" của nhà thơ Thạch Quỳ:\n"Ơi chích chòe ơi!\nChim đừng hót nữa,\nBà em ốm rồi,\nLặng nghe bà ngủ."\nEm hãy viết đoạn văn ngắn bày tỏ suy nghĩ về tình yêu thương, sự chăm sóc hiếu thảo của bạn nhỏ đối với người bà kính yêu của mình.',
    genre: 'Cảm thụ văn học Tiểu học',
  },
  {
    level: 'university' as LiteratureEducationLevel,
    label: 'Đại Học - Cử Nhân',
    title: 'Thi pháp trần thuật trong "Nỗi buồn chiến tranh"',
    problem:
      'Phân tích cấu trúc thời gian tâm tưởng và điểm nhìn trần thuật phức hợp trong tiểu thuyết "Nỗi buồn chiến tranh" của Bảo Ninh từ góc độ thi pháp học hiện đại.',
    genre: 'Tiểu luận nghiên cứu chuyên ngành',
  },
  {
    level: 'master' as LiteratureEducationLevel,
    label: 'Thạc Sĩ - Cao Học',
    title: 'Phê bình sinh thái trong văn xuôi Nam Bộ hậu hiện đại',
    problem:
      'Vận dụng lý thuyết Phê bình sinh thái (Ecocriticism) và Ký hiệu học văn hóa để làm sáng tỏ mối tương quan giữa sự tha hóa của không gian tự nhiên và vết thương tinh thần của con người trong tập truyện "Cánh đồng bất tận" của Nguyễn Ngọc Tư.',
    genre: 'Luận văn học thuật & Lý luận phê bình',
  },
];

const EDUCATION_LEVEL_OPTIONS: {
  id: LiteratureEducationLevel;
  name: string;
  badge: string;
  description: string;
  icon: string;
}[] = [
  {
    id: 'auto',
    name: 'Tự động nhận diện',
    badge: 'Khuyên dùng',
    description: 'AI Giám khảo tự phân tích độ phức tạp của đề bài để định chuẩn cấp học phù hợp',
    icon: '⚡',
  },
  {
    id: 'primary',
    name: 'Cấp 1 (Tiểu học)',
    badge: 'Lớp 1 - 5',
    description: 'Diễn đạt trong sáng, hồn nhiên, bám sát đọc hiểu, cảm thụ từ ngữ đơn giản',
    icon: '🎒',
  },
  {
    id: 'secondary',
    name: 'Cấp 2 (THCS)',
    badge: 'Lớp 6 - 9',
    description: 'Tư duy lập luận rõ ràng, bố cục mở - thân - kết, phân tích ý nghĩa và biện pháp tu từ',
    icon: '📘',
  },
  {
    id: 'high_school',
    name: 'Cấp 3 (THPT & Thi HSG)',
    badge: 'Lớp 10 - 12 & Chuyên',
    description: 'Giàu cảm xúc, sắc sảo, vận dụng lý luận văn học, mở rộng nhân sinh và hoàn cảnh sáng tác',
    icon: '🎓',
  },
  {
    id: 'university',
    name: 'Đại học (Cử nhân)',
    badge: 'Chuyên ngành',
    description: 'Văn phong học thuật, khách quan, phân tích đa chiều thi pháp học và bối cảnh lịch sử',
    icon: '🏛️',
  },
  {
    id: 'master',
    name: 'Thạc sĩ (Cao học)',
    badge: 'Nghiên cứu / Lý luận',
    description: 'Tư duy phản biện cấp độ cao, làm chủ thi pháp hiện đại, ký hiệu học, sinh thái, so sánh học thuyết',
    icon: '📜',
  },
];

export const LiteratureMaster: React.FC = () => {
  const { addXp, playChime } = useApp();

  const [problem, setProblem] = useState<string>(PRESET_TOPICS[0].problem);
  const [selectedLevel, setSelectedLevel] = useState<LiteratureEducationLevel>('high_school');
  const [genreHint, setGenreHint] = useState<string>(PRESET_TOPICS[0].genre);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LiteratureResult | null>(null);

  const [activeViewTab, setActiveViewTab] = useState<'four_parts' | 'three_steps'>('four_parts');
  const [copiedText, setCopiedText] = useState<boolean>(false);
  const [fontSizeClass, setFontSizeClass] = useState<'text-base' | 'text-lg' | 'text-xl'>('text-base');

  const handleSolve = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    setError(null);
    setLoadingStep('BƯỚC 1: Đang thu thập thông tin & Phân tích cấp học...');

    const timer1 = setTimeout(() => {
      setLoadingStep('BƯỚC 2: Đang dự thảo lần 1 với cấu trúc lý luận chuẩn mực...');
    }, 1800);

    const timer2 = setTimeout(() => {
      setLoadingStep('BƯỚC 3: Đang tự đánh giá (Critique) & Nâng cấp ngôn từ (Refine)...');
    }, 3800);

    try {
      const response = await fetch('/api/gemini/literature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problem,
          level: selectedLevel,
          genreHint,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Máy chủ gặp gián đoạn khi xử lý đề bài. Vui lòng thử lại!');
      }

      const data: LiteratureResult = await response.json();
      setResult(data);
      addXp(40, 'Giải Ngữ văn với Giám khảo AI');
      playChime();
    } catch (err: any) {
      console.error('Literature solver error:', err);
      setError(err.message || 'Không thể giải bài lúc này.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2200);
  };

  const applyPreset = (preset: (typeof PRESET_TOPICS)[0]) => {
    setProblem(preset.problem);
    setSelectedLevel(preset.level);
    setGenreHint(preset.genre);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-rose-950/80 p-6 sm:p-8 border border-amber-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black uppercase tracking-wider">
              <Feather className="w-3.5 h-3.5" />
              <span>Chuyên Gia &amp; Giám Khảo Ngữ Văn Đa Cấp Bậc</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Giải Đề Văn Học Chuẩn Mực</span>
              <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
            </h1>
            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              Tự động nhận diện cấp học từ <strong>Tiểu học đến Cao học</strong>. Quy trình 3 bước khép kín:{' '}
              <em>Thu thập dữ liệu → Dự thảo lần 1 → Tự đánh giá &amp; Cải thiện (Critique &amp; Refine)</em> để xuất bài làm đạt điểm tối đa.
            </p>
          </div>

          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>5 Bậc Học Phổ Quát</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
              <Scale className="w-4 h-4 text-emerald-400" />
              <span>Tự Phản Biện &amp; Nâng Cấp</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200">
              <Award className="w-4 h-4 text-purple-400" />
              <span>Xuất Bản Chuẩn 4 Phần</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Topics Carousel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 font-bold">
          <span className="flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            Đề Bài Tiêu Biểu Tuyển Chọn (Nhấn để nạp nhanh):
          </span>
          <span>{PRESET_TOPICS.length} đề bài các cấp</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRESET_TOPICS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(preset)}
              className="text-left p-3 rounded-2xl bg-white dark:bg-slate-800/80 hover:bg-amber-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-amber-400/60 transition group shadow-xs cursor-pointer"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  {preset.label}
                </span>
                <span className="text-[10px] text-slate-400 group-hover:text-amber-500 font-bold">Dùng thử →</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                {preset.title}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                {preset.problem}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Step 0: Education Level Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-xs">
              0
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                BƯỚC 0: Chọn Cấp Học &amp; Tiêu Chuẩn Đánh Giá
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Điều chỉnh văn phong, chiều sâu lý luận và phương pháp tiếp cận tương ứng với trình độ người học
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {EDUCATION_LEVEL_OPTIONS.map((opt) => {
            const isSelected = selectedLevel === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedLevel(opt.id)}
                className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-base mb-1.5">
                    <span>{opt.icon}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {opt.badge}
                    </span>
                  </div>
                  <div className="text-xs font-black line-clamp-1">{opt.name}</div>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              Đề Bài / Câu Hỏi / Văn Bản Cần Giải Quyết:
            </span>
            <span className="text-[11px] font-normal text-slate-400">
              Có thể nhập cả đề thi thử, đoạn trích thơ, câu hỏi đọc hiểu hoặc đề luận HSG
            </span>
          </label>
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            rows={4}
            placeholder="Nhập đề bài ngữ văn tại đây (Ví dụ: Cảm nhận đoạn thơ Tây Tiến, Nghị luận xã hội về sự thấu cảm, hoặc Phân tích tính liên văn bản trong tiểu thuyết hiện đại...)"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-sm leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1 block">
              Gợi ý thể loại / Yêu cầu mở rộng (Tùy chọn):
            </label>
            <input
              type="text"
              value={genreHint}
              onChange={(e) => setGenreHint(e.target.value)}
              placeholder="Ví dụ: Nghị luận văn học, Cảm thụ thơ, Đoạn văn 200 chữ, Bài nghiên cứu..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSolve}
              disabled={loading || !problem.trim()}
              className="w-full h-[42px] rounded-xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin text-amber-200" />
                  <span>Giám Khảo Đang Tự Đánh Giá...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Giải Quyết Đề &amp; Tự Nâng Cấp Chất Lượng</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Progress Indicator */}
        {loading && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs space-y-2 animate-pulse">
            <div className="flex items-center gap-2 font-bold">
              <BrainCircuit className="w-4 h-4 text-amber-500 animate-spin" />
              <span>{loadingStep || 'Hệ thống đang khởi động quy trình thẩm định 3 bước...'}</span>
            </div>
            <div className="w-full bg-amber-200/30 dark:bg-amber-950/40 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-rose-500 h-full rounded-full w-2/3 animate-[pulse_1s_ease-in-out_infinite]" />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={handleSolve}
              className="px-3 py-1 rounded-lg bg-red-600 text-white text-[11px] font-bold"
            >
              Thử lại
            </button>
          </div>
        )}
      </div>

      {/* RESULTS SECTION */}
      {result && (
        <div className="space-y-6 animate-fade-in">
          {/* Result Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveViewTab('four_parts')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeViewTab === 'four_parts'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                📝 Bài Làm Hoàn Chỉnh (Chuẩn 4 Phần)
              </button>
              <button
                onClick={() => setActiveViewTab('three_steps')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                  activeViewTab === 'three_steps'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                🔄 Quy Trình 3 Bước Xử Lý &amp; Tự Cải Thiện
              </button>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              {/* Font Size Adjuster */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setFontSizeClass('text-base')}
                  title="Cỡ chữ vừa"
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    fontSizeClass === 'text-base' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => setFontSizeClass('text-lg')}
                  title="Cỡ chữ lớn"
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    fontSizeClass === 'text-lg' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  A+
                </button>
                <button
                  onClick={() => setFontSizeClass('text-xl')}
                  title="Cỡ chữ rất lớn"
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${
                    fontSizeClass === 'text-xl' ? 'bg-white dark:bg-slate-700 text-amber-600 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  A++
                </button>
              </div>

              {/* Copy Full Text */}
              <button
                onClick={() => handleCopy(result.detailedWork.fullText || result.detailedWork.introduction)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500/20 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 border border-slate-200 dark:border-slate-700 text-xs font-bold transition cursor-pointer"
              >
                {copiedText ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép bài làm</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* VIEW TAB 1: 4 OUTPUT SECTIONS */}
          {activeViewTab === 'four_parts' && (
            <div className="space-y-6">
              {/* SECTION 1: CẤP HỌC ÁP DỤNG */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-lg shadow-xs">
                    🎯
                  </span>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
                      Phần 1: Cấp Học &amp; Tiêu Chuẩn Thẩm Định Áp Dụng
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {result.educationLevelTarget}
                    </h3>
                  </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold self-start sm:self-auto">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã qua tự kiểm duyệt chuẩn mực</span>
                </div>
              </div>

              {/* SECTION 2: PHÂN TÍCH NHANH ĐỀ BÀI & ĐỊNH HƯỚNG TIẾP CẬN */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm sm:text-base border-b border-slate-100 dark:border-slate-800 pb-3">
                  <span className="text-lg">📌</span>
                  <span>Phần 2: Phân Tích Nhanh Đề Bài &amp; Định Hướng Tiếp Cận</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                    <span className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Search className="w-3 h-3" />
                      Yêu Cầu Trọng Tâm Của Đề
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {result.promptAnalysis.requestSummary}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                    <span className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <SlidersHorizontal className="w-3 h-3" />
                      Định Hướng Tiếp Cận &amp; Phương Pháp
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {result.promptAnalysis.approachDirection}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                    <span className="text-[11px] font-black uppercase text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      Giới Hạn Phạm Vi Tri Thức
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {result.promptAnalysis.knowledgeScope}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                    <span className="text-[11px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      Dữ Liệu Nền Tảng (Tác giả / Tác phẩm / Lý luận)
                    </span>
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {result.promptAnalysis.foundationalData}
                    </p>
                  </div>
                </div>
              </div>

              {/* SECTION 3: BÀI LÀM CHI TIẾT (BẢN ĐÃ QUA TỰ CẢI THIỆN) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-amber-500/30 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 gap-2">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                      <Feather className="w-3.5 h-3.5" />
                      Phần 3: Bài Làm Chi Tiết (Bản Đã Qua Tự Cải Thiện)
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                      {result.detailedWork.title}
                    </h2>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold self-start sm:self-auto border border-amber-500/20">
                    Văn phong trau chuốt &amp; Chuẩn học thuật
                  </div>
                </div>

                {/* Essay Reader Body */}
                <article className={`space-y-6 text-slate-800 dark:text-slate-200 leading-relaxed font-serif ${fontSizeClass}`}>
                  {/* Mở bài */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 dark:bg-slate-800/40 border-l-4 border-amber-500">
                    <span className="text-[10px] font-black uppercase font-sans tracking-wider text-amber-700 dark:text-amber-400 block mb-1.5">
                      [ MỞ BÀI - Dẫn Dắt &amp; Định Vị Vấn Đề ]
                    </span>
                    <p className="italic text-justify font-normal leading-loose">
                      {result.detailedWork.introduction}
                    </p>
                  </div>

                  {/* Thân bài - Các Luận điểm */}
                  {result.detailedWork.bodyParagraphs && result.detailedWork.bodyParagraphs.length > 0 && (
                    <div className="space-y-5">
                      {result.detailedWork.bodyParagraphs.map((para, pIdx) => (
                        <div
                          key={pIdx}
                          className="p-5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 space-y-3"
                        >
                          <h4 className="text-xs sm:text-sm font-sans font-black text-amber-700 dark:text-amber-400 flex items-center gap-2">
                            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px]">
                              {pIdx + 1}
                            </span>
                            <span>{para.heading}</span>
                          </h4>
                          <p className="text-justify font-normal leading-loose">
                            {para.content}
                          </p>
                          {para.quoteOrEvidence && (
                            <div className="mt-2 pl-4 py-2 border-l-2 border-purple-500 bg-purple-500/5 text-purple-900 dark:text-purple-300 text-xs sm:text-sm font-sans italic flex items-start gap-2">
                              <Quote className="w-3.5 h-3.5 shrink-0 text-purple-500 mt-0.5" />
                              <span>{para.quoteOrEvidence}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Phản đề / Mở rộng nếu có */}
                  {result.detailedWork.counterArgumentOrExtension && (
                    <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-blue-500 font-sans text-xs sm:text-sm space-y-1">
                      <span className="font-black uppercase text-blue-700 dark:text-blue-300 block">
                        [ Phản Đề / Đối Thoại Đa Chiều &amp; Triết Lý Nhân Sinh ]
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                        {result.detailedWork.counterArgumentOrExtension}
                      </p>
                    </div>
                  )}

                  {/* Kết bài */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/50 dark:bg-slate-800/40 border-l-4 border-rose-500">
                    <span className="text-[10px] font-black uppercase font-sans tracking-wider text-rose-700 dark:text-rose-400 block mb-1.5">
                      [ KẾT BÀI - Dư Ba &amp; Tầm Nhìn Thẩm Mỹ ]
                    </span>
                    <p className="text-justify font-normal leading-loose">
                      {result.detailedWork.conclusion}
                    </p>
                  </div>
                </article>
              </div>

              {/* SECTION 4: ĐIỂM SÁNG HỌC THUẬT / ĐIỂM NHẤN ĐẮT GIÁ */}
              <div className="bg-gradient-to-br from-amber-500/10 via-purple-500/5 to-slate-900/40 rounded-3xl p-6 border border-amber-500/30 shadow-sm space-y-5">
                <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-sm sm:text-base border-b border-amber-500/20 pb-3">
                  <span className="text-lg">💡</span>
                  <span>Phần 4: Điểm Sáng Học Thuật / Điểm Nhấn Đắt Giá (Ăn Điểm Tuyệt Đối)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Keywords & Theories */}
                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-amber-500/20 space-y-2">
                    <span className="text-[11px] font-black uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                      Từ Khóa &amp; Thuật Ngữ Lý Luận Đắt Giá
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.academicHighlights.keywordsAndTheories.map((kw, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-900 dark:text-amber-200 border border-amber-500/30 text-xs font-bold"
                        >
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Breakthrough Points */}
                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-emerald-500/20 space-y-2">
                    <span className="text-[11px] font-black uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-500" />
                      Luận Điểm Sáng Tạo Bứt Phá
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {result.academicHighlights.breakthroughPoints.map((pt, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-500 font-bold shrink-0">✦</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Comparative Connections */}
                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-purple-500/20 space-y-2">
                    <span className="text-[11px] font-black uppercase text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-purple-500" />
                      Liên Hệ So Sánh Đa Chiều Nâng Tầm Bài Luận
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {result.academicHighlights.comparativeConnections.map((conn, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-purple-500 font-bold shrink-0">❖</span>
                          <span>{conn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Examiner Note */}
                  <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-rose-500/20 space-y-2">
                    <span className="text-[11px] font-black uppercase text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-rose-500" />
                      Lời Nhận Xét Của Giám Khảo Chuyên Môn
                    </span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
                      "{result.academicHighlights.examinerNote}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 2: 3-STEP REASONING PROCESS */}
          {activeViewTab === 'three_steps' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase text-amber-600 tracking-wider">
                  Minh Bạch Hóa Quá Trình Tư Duy &amp; Thẩm Định
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Quy Trình Xử Lý 3 Bước Khép Kín Của Giám Khảo AI
                </h3>
              </div>

              <div className="space-y-4">
                {/* Step 1 */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-500 text-white font-black text-xs">
                      1
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      BƯỚC 1: Thu Thập &amp; Phân Tích Thông Tin
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                    {result.stepByStepProcess.step1_infoGathering}
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-black text-xs">
                      2
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white">
                      BƯỚC 2: Dự Thảo Câu Trả Lời Lần 1
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                    {result.stepByStepProcess.step2_initialDraft}
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-500 text-white font-black text-xs">
                      3
                    </span>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>BƯỚC 3: Tự Đánh Giá &amp; Cải Thiện (Critique &amp; Refine)</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                        Đã tối ưu hóa
                      </span>
                    </h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pl-8">
                    {result.stepByStepProcess.step3_critiqueAndRefine}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
