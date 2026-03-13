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

  const { action, postId, content, accessToken, pageId, pageName } = await request.json();

  // 소셜 계정 연결 저장
  if (action === "connect") {
    if (!accessToken) {
      return NextResponse.json({ error: "accessToken required" }, { status: 400 });
    }
    await upsertSocialAccount(supabase, storeId, "facebook", accessToken, pageId, pageName);
    return NextResponse.json({ success: true });
  }

  // 게시물 게시 - Facebook Graph API 호출
  if (action === "publish") {
    const account = await getSocialAccount(supabase, storeId, "facebook");

    if (!account?.access_token || !account?.page_id) {
      return NextResponse.json({ error: "페이스북 페이지가 연결되지 않았습니다." }, { status: 400 });
    }

    const fbRes = await fetch(
      `https://graph.facebook.com/v18.0/${account.page_id}/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          access_token: account.access_token,
        }),
      }
    );
    const fbData = await fbRes.json();

    if (fbData.error) {
      console.error("Facebook publish error:", fbData.error);
      return NextResponse.json({ error: fbData.error.message }, { status: 400 });
    }

    if (postId) {
      await updateMarketingPostStatus(supabase, storeId, postId, "published", fbData.id);
    }

    return NextResponse.json({ success: true, postId: fbData.id });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
