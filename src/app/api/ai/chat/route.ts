import { NextRequest, NextResponse } from "next/server";
import { geminiService } from "@/lib/gemini/client";

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "메시지가 필요합니다." }, { status: 400 });
    }

    const result = await geminiService.chat(message, context);
    return NextResponse.json({ content: result });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "AI 채팅 응답에 실패했습니다." },
      { status: 500 }
    );
  }
}
