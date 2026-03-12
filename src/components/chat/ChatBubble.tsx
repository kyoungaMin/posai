"use client";

import type { ChatMessage } from "@/types/pos";

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  return (
    <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[90%] md:max-w-[85%] p-4 md:p-5 rounded-2xl md:rounded-[1.5rem] text-xs md:text-sm font-medium leading-relaxed shadow-sm ${
          message.role === "user"
            ? "bg-orange-500 text-white rounded-tr-none"
            : "bg-white text-slate-700 rounded-tl-none border border-orange-100"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
