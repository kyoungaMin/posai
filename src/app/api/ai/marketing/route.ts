import { NextRequest, NextResponse } from "next/server";
import { geminiService } from "@/lib/gemini/client";

export async function POST(request: NextRequest) {
  try {
    const { storeData, fileData, customTopic } = await request.json();

    const result = await geminiService.generateFacebookPost(storeData, fileData, customTopic);
    return NextResponse.json({ content: result });
  } catch (error) {
    console.error("AI Marketing Error:", error);
    return NextResponse.json(
      { error: "마케팅 문구 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
