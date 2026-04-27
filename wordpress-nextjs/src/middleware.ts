import { NextResponse, type NextRequest } from "next/server";
import {
  OPENAI_API_KEY_MISSING_COOKIE,
  isOpenAiApiKeyConfigured,
} from "@/lib/openai/openAiApiKeyCookie";

/**
 * `cookies().set` is not allowed from Server Components / shared libs (Next strips or throws).
 * Middleware runs before the response and may attach Set-Cookie so the browser can read this flag.
 */
export function middleware(_request: NextRequest) {
  const res = NextResponse.next();
  if (!isOpenAiApiKeyConfigured()) {
    res.cookies.set(OPENAI_API_KEY_MISSING_COOKIE, "true", {
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      httpOnly: false,
    });
  } else {
    res.cookies.delete(OPENAI_API_KEY_MISSING_COOKIE);
  }
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
