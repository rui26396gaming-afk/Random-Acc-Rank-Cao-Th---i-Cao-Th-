import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Heart,
  Flame,
  Lightbulb,
  RotateCw,
  Trash2,
  Smile,
  ShieldCheck,
  CheckCircle2,
  Coffee,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CompanionPersona } from '../../types';

export const CompanionPillar: React.FC = () => {
  const {
    companionPersona,
    setCompanionPersona,
    companionMessages,
    addCompanionMessage,
    clearCompanionChat,
    mode,
    addXp,
  } = useApp();

  const [inputMessage, setInputMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [companionMessages]);

  const personas: { id: CompanionPersona; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
    {
      id: 'super_ai',
      label: 'Trợ Lý AI Siêu Toàn Năng',
      icon: <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400" />,
      desc: 'Hiểu sâu mọi lĩnh vực: học tập, công việc, kỹ thuật, tài chính & đời sống',
      color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10 dark:bg-emerald-950/40',
    },
    {
      id: 'empathy',
      label: 'Bạn Tâm Tình Ấm Áp',
      icon: <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />,
      desc: 'Lắng nghe, thấu cảm, xoa dịu áp lực & đồng hành dịu dàng',
      color: 'border-pink-500 text-pink-600 bg-pink-50 dark:bg-pink-950/40',
    },
    {
      id: 'strict_coach',
      label: 'Huấn Luyện Viên Kỷ Luật',
      icon: <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />,
      desc: 'Trực diện, dập tắt trì hoãn, thúc đẩy hành động ngay tức khắc',
      color: 'border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-950/40',
    },
    {
      id: 'witty_mentor',
      label: 'Mentor Hóm Hỉnh & Sắc Bén',
      icon: <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />,
      desc: 'Thông thái, dí dỏm, biến vấn đề phức tạp thành góc nhìn thú vị',
      color: 'border-amber-500 text-amber-600 bg-amber-50 dark:bg-amber-950/40',
    },
  ];

  const quickPrompts = [
    'Phân tích chiến lược quản lý thời gian hiệu quả cho người vừa học vừa làm',
    'Tư vấn kế hoạch chinh phục IELTS 7.5+ từ band 5.5 trong 6 tháng',
    'Mình đang thấy lười quá, biết có bài mà không muốn bắt đầu...',
    'Áp lực bài thi và deadline dạo này đè nặng quá, giúp mình lập kế hoạch với!',
    'Giải thích tư duy phản biện (Critical Thinking) và cách áp dụng vào công việc',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    setInputMessage('');
    addCompanionMessage({
      role: 'user',
      text,
    });

    setLoading(true);
    try {
      const history = companionMessages.slice(-6).map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const res = await fetch('/api/gemini/companion-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          persona: companionPersona,
          currentMode: mode,
        }),
      });

      if (!res.ok) throw new Error('Companion đang suy nghĩ...');
      const data = await res.json();

      addCompanionMessage({
        role: 'model',
        text: data.reply || 'Mình luôn ở đây lắng nghe bạn!',
        detectedMood: data.detectedMood,
        mindsetTip: data.mindsetTip,
        suggestedAction: data.suggestedAction,
      });

      addXp(15);
    } catch (err: any) {
      addCompanionMessage({
        role: 'model',
        text: 'Mình vừa kết nối hơi chậm một chút. Bạn cứ thở sâu một hơi rồi chia sẻ lại với mình nhé!',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pillar Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-indigo-600/10 via-pink-600/5 to-transparent p-5 rounded-3xl border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧠</span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Trụ Cột 4: AI Companion (Người Bạn Đồng Hành Tâm Lý)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Hiểu tâm trạng, biến đổi tính cách linh hoạt từ Vỗ về êm dịu đến Huấn luyện viên kỷ luật hành động.
          </p>
        </div>

        <button
          onClick={clearCompanionChat}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 transition self-start sm:self-auto cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Làm mới đoạn chat</span>
        </button>
      </div>

      {/* Persona Switcher */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {personas.map((p) => {
          const isSelected = companionPersona === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setCompanionPersona(p.id)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? `${p.color} shadow-sm font-semibold`
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                {p.icon}
                <span className="text-xs font-bold">{p.label}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {p.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Chat Area */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[520px] overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {companionMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-pink-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Mood Tag & Mindset Tip (Model only) */}
                  {!isUser && (msg.detectedMood || msg.mindsetTip) && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                      {msg.detectedMood && (
                        <div className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                          <Smile className="w-3.5 h-3.5" />
                          <span>Tâm trạng nhận diện: {msg.detectedMood}</span>
                        </div>
                      )}
                      {msg.mindsetTip && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                          💡 {msg.mindsetTip}
                        </p>
                      )}
                      {msg.suggestedAction && (
                        <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          Hành động gợi ý: {msg.suggestedAction}
                        </span>
                      )}
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-2 text-right ${
                      isUser ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 items-center text-xs text-slate-500">
              <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600">
                <RotateCw className="w-4 h-4 animate-spin" />
              </div>
              <span className="italic">Companion đang suy nghĩ và chuẩn bị phản hồi...</span>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Situation Chips */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 shrink-0">Hỏi nhanh:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-400 transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={`Trò chuyện cùng ${
              personas.find((p) => p.id === companionPersona)?.label || 'Companion'
            }...`}
            className="flex-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !inputMessage.trim()}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold transition shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95"
            title="Gửi tin nhắn"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
