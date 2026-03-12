import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 보호 라우트 + auth 페이지
    "/dashboard/:path*",
    "/inventory/:path*",
    "/marketing/:path*",
    "/chat/:path*",
    "/login",
    "/signup",
  ],
};
