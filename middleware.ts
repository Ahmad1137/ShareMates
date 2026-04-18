import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Only refresh the Supabase session on routes that need it. A global matcher
// runs getUser() (remote round-trip) on every navigation, including /login
// and marketing pages, which feels very slow.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/groups/:path*",
    "/group/:path*",
    "/contacts/:path*",
    "/ledger/:path*",
    "/profile/:path*",
    "/invite/:path*",
    "/auth/callback",
  ],
};
