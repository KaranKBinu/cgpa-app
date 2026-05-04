import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = (req.auth?.user as any)?.role;

  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublicRoute = 
    ["/", "/auth/login", "/auth/register", "/sitemap.xml", "/robots.txt", "/feedback"].includes(nextUrl.pathname) ||
    nextUrl.pathname.startsWith("/calculate");
  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");
  const isSuperUserRoute = nextUrl.pathname.startsWith("/admin/users") || nextUrl.pathname.startsWith("/admin/settings");

  if (isApiAuthRoute) return NextResponse.next();

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  // Teacher/Superuser access to admin
  if (isAdminRoute) {
    if (userRole !== "TEACHER" && userRole !== "SUPERUSER") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  // Superuser only access to user management
  if (isSuperUserRoute) {
    if (userRole !== "SUPERUSER") {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
export default proxy;
