"use client";

import { useState } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim() || disabled) return;
    onSend(input);
    setInput("");
  };

  return (
    <div className="p-4 md:p-8 border-t border-orange-100 bg-white">
      <div className="flex gap-2 md:gap-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="고민을 적어주세요..."
          className="flex-1 bg-orange-50 border-2 border-transparent focus:border-orange-200 rounded-xl md:rounded-2xl px-4 md:px-8 py-3 md:py-5 text-xs md:text-sm font-bold focus:ring-0 transition-all"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="bg-orange-500 text-white w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-30 shadow-xl shadow-orange-200"
        >
          <Send size={20} className="md:hidden" />
          <Send size={24} className="hidden md:block" />
        </button>
      </div>
    </div>
  );
}
