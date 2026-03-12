import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getStoreId,
  getSocialAccount,
  upsertSocialAccount,
  updateMarketingPostStatus,
} from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const storeId = await getStoreId(supabase);

  if (!storeId) {
    return NextResponse.json({ error: "매장 정보가 없습니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "status") {
    const account = await getSocialAccount(supabase, storeId, "facebook");
    return NextResponse.json({
      connected: !!account,
      pageName: account?.page_name || null,
      connectedAt: account?.connected_at || null,
    });
  }

  if (action === "auth-url") {
    const appId = process.env.FACEBOOK_APP_ID;
    if (!appId) {
      return NextResponse.json({ error: "FACEBOOK_APP_ID not configured" }, { status: 500 });
    }
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/social/facebook/callback`;
    const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=public_profile,pages_manage_posts,pages_read_engagement,publish_video`;
    return NextResponse.json({ url });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const storeId = await getStoreId(supabase);

  if (!storeId) {
    return NextResponse.json({ error: "매장 정보가 없습니다." }, { status: 401 });
  }

  const { action, postId, accessToken, pageId, pageName } = await request.json();

  // 소셜 계정 연결 저장
  if (action === "connect") {
    if (!accessToken) {
      return NextResponse.json({ error: "accessToken required" }, { status: 400 });
    }
    await upsertSocialAccount(supabase, storeId, "facebook", accessToken, pageId, pageName);
    return NextResponse.json({ success: true });
  }

  // 게시물 게시 (데모 모드 - 실제 Facebook API 호출은 Facebook App 승인 후 가능)
  if (action === "publish") {
    if (postId) {
      await updateMarketingPostStatus(supabase, storeId, postId, "published", "demo_" + Date.now());
    }
    return NextResponse.json({
      success: true,
      postId: "demo_post_id_" + Date.now(),
      demo: true,
    });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
