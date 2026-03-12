"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare } from "lucide-react";
import Header from "@/components/layout/Header";
import ChatBubble from "@/components/chat/ChatBubble";
import MessageInput from "@/components/chat/MessageInput";
import type { ChatMessage } from "@/types/pos";

export default function ChatPage() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async (message: string) => {
    if (chatLoading) return;
    setChatMessages((prev) => [...prev, { role: "user", text: message }]);
    setChatLoading(true);
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, sessionId }),
      });
      const json = await res.json();
      setChatMessages((prev) => [...prev, { role: "ai", text: json.content }]);
      // 세션 ID 저장 (첫 메시지에서 생성됨)
      if (json.sessionId && !sessionId) {
        setSessionId(json.sessionId);
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { role: "ai", text: "죄송합니다, 응답 중 오류가 발생했습니다. 다시 시도해 주세요." },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleNewChat = () => {
    setChatMessages([]);
    setSessionId(null);
  };

  return (
    <>
      <Header title="무엇이든 물어보세요" />
      <div className="bg-white rounded-4xl border border-orange-100 shadow-sm h-[calc(100vh-180px)] md:h-[calc(100vh-220px)] flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 md:p-6 border-b border-orange-100 bg-orange-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-orange-500 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
              <MessageSquare className="text-white" size={20} />
            </div>
            <div>
              <h3 className="font-black text-base md:text-lg text-slate-800">AI 경영 비서</h3>
              <p className="text-[8px] md:text-[10px] text-orange-500 font-black uppercase tracking-widest">
                Gemini Pro Consultant
              </p>
            </div>
          </div>
          {chatMessages.length > 0 && (
            <button
              onClick={handleNewChat}
              className="text-xs font-bold text-orange-500 hover:text-orange-600 bg-orange-100 hover:bg-orange-200 px-3 py-1.5 rounded-xl transition-all"
            >
              새 대화
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8 bg-[#FFFDFB]">
          {chatMessages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 md:mb-8">
                <MessageSquare className="text-orange-200" size={28} />
              </div>
              <h4 className="font-black text-lg md:text-xl text-slate-800 mb-2 md:mb-3">무엇이든 물어보세요!</h4>
              <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed">
                &ldquo;화요일 오전 매출을 올리려면 어떻게 할까요?&rdquo;
                <br />
                &ldquo;재고 낭비를 줄이는 방법을 알려주세요.&rdquo;
              </p>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <ChatBubble key={i} message={msg} />
          ))}
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-orange-50 p-4 md:p-5 rounded-2xl rounded-tl-none flex gap-1.5">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-300 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-orange-300 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <MessageInput onSend={handleSendMessage} disabled={chatLoading} />
      </div>
    </>
  );
}
