import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const publicPrefixes = ["/login", "/rsvp/", "/invite/", "/register/", "/rsvp-view/", "/p/"];
type CookieChange = { name: string; value: string; options?: Parameters<ReturnType<typeof NextResponse.next>["cookies"]["set"]>[2] };

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (publicPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix))) return NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next(); // Enables design preview before Supabase is connected.

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, { cookies: { getAll: () => request.cookies.getAll(), setAll: (cookies: CookieChange[]) => { cookies.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { const redirect = request.nextUrl.clone(); redirect.pathname = "/login"; redirect.searchParams.set("next", pathname); return NextResponse.redirect(redirect); }
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
