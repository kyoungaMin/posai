import { NextRequest, NextResponse } from "next/server";
import { geminiService } from "@/lib/gemini/client";
import { createClient } from "@/lib/supabase/server";
import {
  getStoreId,
  getUserId,
  getStoreContext,
  createChatSession,
  saveChatMessage,
} from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const storeId = await getStoreId(supabase);

    if (!storeId) {
      return NextResponse.json({ error: "매장 정보가 없습니다." }, { status: 401 });
    }

    const { message, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "메시지가 필요합니다." }, { status: 400 });
    }

    // 실제 매장 데이터를 컨텍스트로 가져오기
    const context = await getStoreContext(supabase, storeId);

    // 세션이 없으면 새로 생성
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const userId = await getUserId(supabase);
      if (userId) {
        const title = message.length > 30 ? message.substring(0, 30) + "..." : message;
        activeSessionId = await createChatSession(supabase, storeId, userId, title);
      }
    }

    // 사용자 메시지 저장
    if (activeSessionId) {
      await saveChatMessage(supabase, activeSessionId, "user", message);
    }

    // Gemini AI 응답 생성
    const result = await geminiService.chat(message, context);

    // AI 응답 저장
    if (activeSessionId && result) {
      await saveChatMessage(supabase, activeSessionId, "ai", result);
    }

    return NextResponse.json({
      content: result,
      sessionId: activeSessionId,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "AI 채팅 응답에 실패했습니다." },
      { status: 500 }
    );
  }
}
