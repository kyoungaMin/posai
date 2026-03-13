import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStoreId, upsertSocialAccount } from "@/lib/supabase/queries";

const APP_ID = process.env.FACEBOOK_APP_ID || "";
const APP_SECRET = process.env.FACEBOOK_APP_SECRET || "";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  // 사용자가 권한 거부한 경우
  if (error) {
    return NextResponse.redirect(`${APP_URL}/marketing?fb_error=${error}`);
  }

  if (!code) {
    return NextResponse.redirect(`${APP_URL}/marketing?fb_error=no_code`);
  }

  try {
    const redirectUri = `${APP_URL}/api/social/facebook/callback`;

    // 1. code → 사용자 access_token 교환
    const tokenRes = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${APP_SECRET}&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      console.error("Facebook token error:", tokenData.error);
      return NextResponse.redirect(`${APP_URL}/marketing?fb_error=token_failed`);
    }

    const userAccessToken = tokenData.access_token;

    // 2. 사용자가 관리하는 페이지 목록 조회
    const pagesRes = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${userAccessToken}`
    );
    const pagesData = await pagesRes.json();

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.redirect(`${APP_URL}/marketing?fb_error=no_pages`);
    }

    // 첫 번째 페이지 사용
    const page = pagesData.data[0];
    const pageAccessToken = page.access_token;
    const pageId = page.id;
    const pageName = page.name;

    // 3. DB에 저장
    const supabase = await createClient();
    const storeId = await getStoreId(supabase);

    if (storeId) {
      await upsertSocialAccount(
        supabase,
        storeId,
        "facebook",
        pageAccessToken,
        pageId,
        pageName
      );
    }

    return NextResponse.redirect(`${APP_URL}/marketing?fb_connected=true&page_name=${encodeURIComponent(pageName)}`);
  } catch (err) {
    console.error("Facebook callback error:", err);
    return NextResponse.redirect(`${APP_URL}/marketing?fb_error=callback_failed`);
  }
}
