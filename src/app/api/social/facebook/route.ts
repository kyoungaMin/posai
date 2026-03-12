import { NextRequest, NextResponse } from "next/server";

// 데모용 인메모리 토큰 저장
const facebookTokens = new Map<string, string>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  if (action === "status") {
    return NextResponse.json({ connected: facebookTokens.has("default_user") });
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
  const { message } = await request.json();

  // 데모 모드: 실제 Facebook API 호출 없이 성공 응답
  return NextResponse.json({
    success: true,
    postId: "demo_post_id_" + Date.now(),
    demo: true,
  });
}
