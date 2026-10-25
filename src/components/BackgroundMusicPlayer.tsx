import React, { useState, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Upload,
  Trash2,
  X,
  Maximize2,
  Minimize2,
  FolderPlus,
  Sparkles,
  Headphones,
  CheckCircle,
  FileAudio,
} from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function formatBytes(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const BackgroundMusicPlayer: React.FC = () => {
  const {
    playlist,
    currentTrackIndex,
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    loopMode,
    isShuffled,
    isExpanded,
    addFiles,
    playTrack,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolumeLevel,
    toggleMute,
    setSpeed,
    toggleLoopMode,
    toggleShuffle,
    removeTrack,
    clearPlaylist,
    setIsExpanded,
    loadSampleTracks,
  } = useMusicPlayer();

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files, true);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files, true);
      // Reset input value so re-selecting same file triggers change
      e.target.value = '';
    }
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <>
      {/* Hidden file input for file picker button */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac,.flac"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Floating Bottom Music Bar (Always present and interactive) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`fixed bottom-4 left-4 z-40 transition-all duration-300 max-w-sm sm:max-w-md ${
          isDragging ? 'ring-2 ring-indigo-400 scale-102' : ''
        }`}
      >
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-black/60 rounded-2xl p-2.5 sm:p-3 text-slate-100 flex items-center gap-3">
          {/* Animated vinyl / wave indicator or trigger */}
          <button
            onClick={() => setIsExpanded(true)}
            className="relative group shrink-0 w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center overflow-hidden cursor-pointer active:scale-95 transition"
            title="Mở trình phát nhạc đầy đủ"
          >
            {isPlaying ? (
              <div className="flex items-end justify-center gap-0.5 h-5 w-5">
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:0ms] h-3"></span>
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:150ms] h-5"></span>
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:300ms] h-4"></span>
                <span className="w-1 bg-white rounded-full animate-bounce [animation-delay:450ms] h-2"></span>
              </div>
            ) : (
              <Music className="w-5 h-5 text-white/90 group-hover:scale-110 transition" />
            )}
            {playlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                {playlist.length}
              </span>
            )}
          </button>

          {/* Track Info & Quick Scrubber */}
          <div
            onClick={() => setIsExpanded(true)}
            className="flex-1 min-w-0 cursor-pointer text-left select-none"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-white truncate max-w-[140px] sm:max-w-[180px]">
                {currentTrack ? currentTrack.name : 'Chưa có bài hát nào'}
              </span>
              {currentTrack?.isPreset && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  Preset
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
              <span>{formatTime(currentTime)}</span>
              <span>/</span>
              <span>{formatTime(duration)}</span>
              {playlist.length === 0 && (
                <span className="text-indigo-400 text-[10px] hover:underline">
                  + Thả file nhạc vào đây
                </span>
              )}
            </div>
            {/* Tiny progress bar */}
            <div className="w-full bg-slate-800 h-1 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Quick Action Controls */}
          <div className="flex items-center gap-1 shrink-0">
            {playlist.length > 0 && (
              <button
                onClick={prevTrack}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                title="Bài trước"
              >
                <SkipBack className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={togglePlay}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition active:scale-95"
              title={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
            </button>

            {playlist.length > 0 && (
              <button
                onClick={nextTrack}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
                title="Bài kế tiếp"
              >
                <SkipForward className="w-4 h-4" />
              </button>
            )}

            {/* Quick Upload Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Thêm file nhạc (.mp3, .wav, .m4a)"
            >
              <FolderPlus className="w-4 h-4" />
            </button>

            {/* Expand Drawer Button */}
            <button
              onClick={() => setIsExpanded(true)}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition"
              title="Mở rộng trình phát nhạc"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Full Music Player Modal / Drawer */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <span>Trình Phát Nhạc Nền Tự Động</span>
                    {isPlaying && (
                      <span className="flex items-center gap-1 text-[11px] font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Đang phát nền
                      </span>
                    )}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Thêm bài hát bất kỳ &bull; Tự động phát &bull; Không ngắt quãng khi đổi tab
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Thu nhỏ về góc màn hình"
                >
                  <Minimize2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Đóng cửa sổ"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01]'
                    : 'border-slate-700 hover:border-indigo-500/50 bg-slate-800/40 hover:bg-slate-800/70'
                }`}
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
                    <Upload className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">
                      Kéo thả file nhạc vào đây hoặc <span className="text-indigo-400 underline underline-offset-4">chọn từ máy tính</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Hỗ trợ MP3, WAV, M4A, OGG, AAC, FLAC &bull; Nhạc sẽ <b>tự động chạy ngay lập tức</b>
                    </p>
                  </div>
                  <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                    <span className="text-[11px] bg-slate-700/60 text-slate-300 px-2.5 py-1 rounded-lg">
                      Tự chạy trong nền xuyên suốt app
                    </span>
                    <span className="text-[11px] bg-slate-700/60 text-slate-300 px-2.5 py-1 rounded-lg">
                      Không giới hạn dung lượng file
                    </span>
                    <span className="text-[11px] bg-slate-700/60 text-slate-300 px-2.5 py-1 rounded-lg">
                      Phát trực tiếp từ trình duyệt
                    </span>
                  </div>
                </div>
              </div>

              {/* Now Playing Hero Deck */}
              {currentTrack && (
                <div className="bg-gradient-to-r from-slate-800/90 to-indigo-950/40 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-inner">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-300 shrink-0">
                        <FileAudio className="w-6 h-6" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                            Đang phát
                          </span>
                          {currentTrack.size && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              ({formatBytes(currentTrack.size)})
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                          {currentTrack.name}
                        </h3>
                      </div>
                    </div>

                    {/* Speed selector */}
                    <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
                      {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => setSpeed(rate)}
                          className={`px-2 py-0.5 rounded-lg font-semibold transition ${
                            playbackRate === rate
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Scrubber Seek Bar */}
                  <div className="space-y-1">
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={(e) => seekTo(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition"
                    />
                    <div className="flex justify-between text-xs text-slate-400 font-mono">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* Center Controls Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    {/* Shuffle & Loop */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleShuffle}
                        className={`p-2 rounded-xl border transition ${
                          isShuffled
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                            : 'border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                        title={isShuffled ? 'Bật phát ngẫu nhiên' : 'Tắt ngẫu nhiên'}
                      >
                        <Shuffle className="w-4 h-4" />
                      </button>

                      <button
                        onClick={toggleLoopMode}
                        className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-semibold ${
                          loopMode !== 'off'
                            ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300'
                            : 'border-slate-700 text-slate-400 hover:text-slate-200'
                        }`}
                        title={`Chế độ lặp: ${
                          loopMode === 'all' ? 'Lặp danh sách' : loopMode === 'one' ? 'Lặp 1 bài' : 'Không lặp'
                        }`}
                      >
                        {loopMode === 'one' ? (
                          <Repeat1 className="w-4 h-4" />
                        ) : (
                          <Repeat className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">
                          {loopMode === 'all' ? 'Tất cả' : loopMode === 'one' ? '1 bài' : 'Tắt'}
                        </span>
                      </button>
                    </div>

                    {/* Main playback buttons */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={prevTrack}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95"
                        title="Bài trước"
                      >
                        <SkipBack className="w-5 h-5" />
                      </button>

                      <button
                        onClick={togglePlay}
                        className="p-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 transition active:scale-95"
                        title={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 fill-white" />
                        )}
                      </button>

                      <button
                        onClick={nextTrack}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition active:scale-95"
                        title="Bài sau"
                      >
                        <SkipForward className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Volume control */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={toggleMute}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-200 transition"
                        title={isMuted ? 'Bật âm' : 'Tắt âm'}
                      >
                        {isMuted || volume === 0 ? (
                          <VolumeX className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolumeLevel(parseFloat(e.target.value))}
                        className="w-20 sm:w-24 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        title="Âm lượng"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Playlist Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Music className="w-4 h-4 text-indigo-400" />
                    <span>Danh Sách Bài Hát ({playlist.length})</span>
                  </h4>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={loadSampleTracks}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-xl border border-indigo-500/20 flex items-center gap-1.5 transition"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Thêm Nhạc Mẫu Chill/Lofi</span>
                    </button>

                    {playlist.length > 0 && (
                      <button
                        onClick={clearPlaylist}
                        className="text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-xl border border-rose-500/20 flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xoá hết</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Track Items List */}
                {playlist.length === 0 ? (
                  <div className="text-center py-8 px-4 rounded-2xl bg-slate-800/30 border border-slate-800 text-slate-400 space-y-3">
                    <p className="text-sm">Chưa có bài hát nào trong danh sách phát.</p>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Hãy thả file nhạc yêu thích của bạn từ máy tính vào khung bên trên, hoặc bấm nút dưới đây để nghe thử ngay các bản Lofi thư giãn tích hợp sẵn!
                    </p>
                    <button
                      onClick={loadSampleTracks}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg transition active:scale-95"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Nghe thử nhạc Lofi / Deep Focus mẫu</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {playlist.map((track, idx) => {
                      const isCurrent = idx === currentTrackIndex;
                      return (
                        <div
                          key={track.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                            isCurrent
                              ? 'bg-indigo-950/40 border-indigo-500/50 text-white shadow-sm'
                              : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-800 text-slate-300'
                          }`}
                        >
                          <button
                            onClick={() => playTrack(idx)}
                            className="flex items-center gap-3 min-w-0 flex-1 text-left cursor-pointer"
                          >
                            <span className="w-6 text-center text-xs font-mono text-slate-400">
                              {isCurrent && isPlaying ? (
                                <div className="flex items-end justify-center gap-0.5 h-3.5 w-3.5 mx-auto">
                                  <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0ms] h-2"></span>
                                  <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms] h-3.5"></span>
                                  <span className="w-0.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:300ms] h-2"></span>
                                </div>
                              ) : (
                                idx + 1
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-bold truncate ${isCurrent ? 'text-indigo-300' : 'text-slate-200'}`}>
                                {track.name}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                                {track.duration ? <span>{formatTime(track.duration)}</span> : null}
                                {track.size ? <span>&bull; {formatBytes(track.size)}</span> : null}
                                {track.isPreset && (
                                  <span className="text-indigo-400 font-sans">Bản mẫu có sẵn</span>
                                )}
                              </div>
                            </div>
                          </button>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              onClick={() => playTrack(idx)}
                              className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 hover:text-white transition"
                              title={isCurrent && isPlaying ? 'Đang phát' : 'Phát bài này'}
                            >
                              {isCurrent && isPlaying ? (
                                <Pause className="w-3.5 h-3.5 text-indigo-400" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>

                            <button
                              onClick={() => removeTrack(track.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                              title="Xoá khỏi danh sách"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Nhạc vẫn tiếp tục phát khi bạn chuyển tab học tập, giải bài hoặc ghi chú.</span>
              </span>
              <button
                onClick={() => setIsExpanded(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition"
              >
                Thu nhỏ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
