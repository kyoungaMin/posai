import { NextRequest, NextResponse } from "next/server";
import { geminiService } from "@/lib/gemini/client";
import { createClient } from "@/lib/supabase/server";
import {
  getStoreId,
  getUserId,
  getStoreContext,
  saveMarketingPost,
} from "@/lib/supabase/queries";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const storeId = await getStoreId(supabase);

    if (!storeId) {
      return NextResponse.json({ error: "매장 정보가 없습니다." }, { status: 401 });
    }

    const { fileData, customTopic } = await request.json();

    // 실제 매장 데이터를 컨텍스트로 가져오기
    const storeData = await getStoreContext(supabase, storeId);

    const result = await geminiService.generateFacebookPost(storeData, fileData, customTopic);

    // 생성된 마케팅 문구를 DB에 저장 (draft 상태)
    const userId = await getUserId(supabase);
    let postId: number | null = null;
    if (userId && result) {
      postId = await saveMarketingPost(
        supabase,
        storeId,
        userId,
        "facebook",
        result,
        customTopic
      );
    }

    return NextResponse.json({ content: result, postId });
  } catch (error) {
    console.error("AI Marketing Error:", error);
    return NextResponse.json(
      { error: "마케팅 문구 생성에 실패했습니다." },
      { status: 500 }
    );
  }
}
