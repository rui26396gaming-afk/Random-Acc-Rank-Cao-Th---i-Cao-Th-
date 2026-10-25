import React, { useState, useEffect } from 'react';
import {
  Coffee,
  Wind,
  Sparkles,
  Utensils,
  CheckCircle2,
  Volume2,
  Clock,
  Heart,
  Play,
  Pause,
  Music,
  Upload,
  Headphones,
  SkipForward,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import { AmbientSoundType } from '../utils/audioSynthesizer';

export const ChillStudio: React.FC = () => {
  const {
    isAmbientPlaying,
    ambientType,
    toggleAmbientSound,
    changeAmbientType,
    addXp,
  } = useApp();

  const {
    playlist,
    currentTrack,
    isPlaying: isMusicPlaying,
    togglePlay: toggleMusicPlay,
    setIsExpanded: setIsMusicExpanded,
    addFiles,
    loadSampleTracks,
  } = useMusicPlayer();

  const [isDropZoneActive, setIsDropZoneActive] = useState<boolean>(false);
  const chillFileInputRef = React.useRef<HTMLInputElement | null>(null);

  // 4-7-8 Breathing Guide State
  const [breathingActive, setBreathingActive] = useState<boolean>(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathSeconds, setBreathSeconds] = useState<number>(4);

  useEffect(() => {
    let interval: any = null;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathSeconds((prev) => {
          if (prev <= 1) {
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              return 7;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              return 8;
            } else {
              setBreathPhase('inhale');
              addXp(5);
              return 4;
            }
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive, breathPhase]);

  const quickRecipes = [
    {
      title: 'Mì Trứng Lòng Đào & Rong Biển (7 Phút)',
      category: 'Bữa ăn nhanh ấm bụng',
      time: '7 phút',
      ingredients: '1 gói mì/udon, 1 quả trứng, rong biển vụn, hành hoa, dầu mè.',
      steps: 'Đun sôi nước, luộc trứng lòng đào 5.5 phút. Trụng mì trong nước dùng, rắc rong biển và dầu mè thơm lừng.',
    },
    {
      title: 'Sinh Tố Chuối Yến Mạch Tỉnh Táo',
      category: 'Nạp năng lượng não bộ',
      time: '3 phút',
      ingredients: '1 quả chuối chín, 3 thìa yến mạch, 200ml sữa chua/sữa tươi, 1 thìa mật ong.',
      steps: 'Xay nhuyễn toàn bộ nguyên liệu trong 30 giây. Uống mát lạnh giúp phục hồi năng lượng học tập ngay tức thì.',
    },
    {
      title: 'Trà Hoa Cúc Mật Ong Ngủ Ngon',
      category: 'Thức uống thư giãn ban đêm',
      time: '5 phút',
      ingredients: 'Hoa cúc sấy khô, 1 lát chanh mỏng, 1 thìa mật ong nguyên chất.',
      steps: 'Hãm trà hoa cúc với nước 85°C trong 4 phút. Thêm mật ong và chanh nhẹ, nhâm nhi khi còn ấm.',
    },
  ];

  const lightChores = [
    { title: 'Tưới cây ban công & Hít thở khí trời', xp: 10, done: false },
    { title: 'Dọn dẹp bàn học, sắp xếp lại sách vở', xp: 15, done: false },
    { title: 'Uống trọn một cốc nước ấm 300ml', xp: 10, done: true },
    { title: 'Mở toang cửa sổ đón gió và ánh sáng', xp: 10, done: false },
  ];

  const [choresList, setChoresList] = useState(lightChores);

  const toggleChore = (idx: number) => {
    setChoresList((prev) =>
      prev.map((c, i) => {
        if (i === idx) {
          if (!c.done) addXp(c.xp);
          return { ...c, done: !c.done };
        }
        return c;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Chillout Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
            <Coffee className="w-4 h-4" /> Không gian thư giãn (Chill Mode)
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
            Góc Hạ Nhiệt Tâm Hồn &amp; Phục Hồi Năng Lượng
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
            Khi áp lực học tập hoặc các trận game căng thẳng trôi qua, hãy thả lỏng cơ thể với âm thanh êm dịu, bài tập thở 4-7-8 và công thức món ăn nhanh dinh dưỡng.
          </p>
        </div>

        <button
          onClick={toggleAmbientSound}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition active:scale-95 cursor-pointer ${
            isAmbientPlaying
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{isAmbientPlaying ? 'Đang phát âm thanh thư giãn' : 'Bật nhạc Lofi & Mưa'}</span>
        </button>
      </div>

      {/* Dedicated Custom Background Music Player Dropzone */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-900/60 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Bật Nhạc Nền Tự Động (Tải File Nhạc Của Bạn)</span>
                {isMusicPlaying && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Đang chạy nền
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Chỉ cần kéo thả file nhạc (.mp3, .wav, .m4a, .ogg) vào là nhạc tự động chạy nền xuyên suốt mọi trang.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {playlist.length > 0 && (
              <button
                onClick={toggleMusicPlay}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
              >
                {isMusicPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                <span>{isMusicPlaying ? 'Tạm Dừng' : 'Phát Tiếp'}</span>
              </button>
            )}

            <button
              onClick={() => setIsMusicExpanded(true)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition cursor-pointer"
            >
              <Music className="w-4 h-4 text-indigo-400" />
              <span>Mở Trình Phát Đầy Đủ</span>
            </button>
          </div>
        </div>

        {/* Drop Zone Box */}
        <input
          ref={chillFileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              addFiles(e.target.files, true);
              e.target.value = '';
            }
          }}
          className="hidden"
        />

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDropZoneActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDropZoneActive(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            setIsDropZoneActive(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              addFiles(e.dataTransfer.files, true);
            }
          }}
          onClick={() => chillFileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            isDropZoneActive
              ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-indigo-500/50 bg-slate-800/40 hover:bg-slate-800/70'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className="w-6 h-6 text-indigo-400 animate-bounce" />
            <p className="text-sm font-bold text-white">
              Kéo &amp; thả file nhạc vào đây hoặc <span className="text-indigo-400 underline underline-offset-4">bấm để chọn file</span>
            </p>
            <p className="text-xs text-slate-400">
              Hệ thống tự động nhận diện và phát ngay lập tức &bull; Chạy nền khi bạn chuyển sang làm toán, giải tiếng Anh hay lập trình
            </p>
          </div>
        </div>

        {/* Current Track & Sample Pack bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
          <div className="text-slate-300 flex items-center gap-2">
            <span className="text-slate-400">Bài hiện tại:</span>
            <span className="font-semibold text-white">
              {currentTrack ? currentTrack.name : 'Chưa có bài hát nào'}
            </span>
            {playlist.length > 0 && (
              <span className="text-slate-500 font-mono">({playlist.length} bài trong danh sách)</span>
            )}
          </div>

          <button
            onClick={loadSampleTracks}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chưa có file? Bấm đây để nghe thử nhạc mẫu Lofi &amp; Ambient</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4-7-8 Breathing Meditation */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between items-center text-center space-y-4">
          <div className="w-full flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-teal-500" /> Bài Tập Thở 4-7-8
            </span>
            <span className="text-xs text-teal-600 dark:text-teal-400 font-semibold">
              Xoa dịu nhịp tim &amp; Hạ cortisol
            </span>
          </div>

          <div className="relative my-4 flex flex-col items-center justify-center">
            <div
              className={`w-44 h-44 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-1000 ${
                breathingActive
                  ? breathPhase === 'inhale'
                    ? 'scale-110 border-teal-500 bg-teal-500/10'
                    : breathPhase === 'hold'
                    ? 'scale-105 border-amber-500 bg-amber-500/10'
                    : 'scale-95 border-indigo-500 bg-indigo-500/10'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800'
              }`}
            >
              <span className="text-xs font-bold uppercase text-slate-500">
                {breathingActive
                  ? breathPhase === 'inhale'
                    ? 'HÍT VÀO'
                    : breathPhase === 'hold'
                    ? 'GIỮ HƠI'
                    : 'THỞ RA'
                  : 'Sẵn sàng'}
              </span>
              <span className="text-4xl font-black font-mono mt-1 text-slate-900 dark:text-white">
                {breathingActive ? breathSeconds : '4-7-8'}
              </span>
              <span className="text-[11px] text-slate-400 mt-1">giây</span>
            </div>
          </div>

          <button
            onClick={() => setBreathingActive(!breathingActive)}
            className={`px-6 py-2.5 rounded-2xl text-xs font-bold text-white shadow-md transition active:scale-95 cursor-pointer ${
              breathingActive
                ? 'bg-rose-500 hover:bg-rose-600'
                : 'bg-teal-600 hover:bg-teal-700'
            }`}
          >
            {breathingActive ? 'Dừng bài thở' : 'Bắt đầu thư giãn 4-7-8'}
          </button>
        </div>

        {/* Light Chores to Clear the Mind */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Việc Nhà Nhẹ Nhàng Giúp "Clear Mind"
            </h3>
            <span className="text-xs text-slate-400">Vận động nhẹ tay chân</span>
          </div>

          <div className="space-y-2.5">
            {choresList.map((chore, idx) => (
              <div
                key={idx}
                onClick={() => toggleChore(idx)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  chore.done
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/50 dark:border-slate-800 opacity-60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      chore.done ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      chore.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {chore.title}
                  </span>
                </div>
                <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                  +{chore.xp} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Healthy Recipes */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Utensils className="w-4 h-4 text-orange-500" />
            Công Thức Nấu Nhanh Dinh Dưỡng Phục Hồi Năng Lượng
          </h3>
          <span className="text-xs text-slate-400">Dễ làm dưới 10 phút</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickRecipes.map((rec, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-orange-600 dark:text-orange-400 mb-1">
                  <span>{rec.category}</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" /> {rec.time}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  {rec.title}
                </h4>

                <div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="font-semibold text-slate-400 block mb-0.5">Nguyên liệu:</span>
                  {rec.ingredients}
                </div>

                <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-semibold text-amber-600 block mb-0.5">Cách làm:</span>
                  {rec.steps}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
