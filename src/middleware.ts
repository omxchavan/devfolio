import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // If the user is authenticated but not onboarded and trying to access a protected route
    // other than /onboarding, redirect them to /onboarding
    if (token && !token.onboarded && req.nextUrl.pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
    
    // If they are onboarded and try to access /onboarding, redirect to dashboard
    if (token && token.onboarded && req.nextUrl.pathname === "/onboarding") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // If it's a route that explicitly requires authentication
        const isAuthRequired = [
          "/dashboard",
          "/create-project",
          "/onboarding",
          "/admin",
          "/settings"
        ].some(path => req.nextUrl.pathname.startsWith(path));
        
        if (isAuthRequired) return !!token;
        
        // For public routes, allow everyone (guests and users)
        // Guests will have no token, Users will have a token and the middleware function will then check their onboarding status
        return true;
      },
    },
    pages: {
      signIn: "/",
    },
  }
);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
