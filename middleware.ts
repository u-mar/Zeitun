import { NextResponse } from "next/server";
import { withAuth, NextRequestWithAuth } from "next-auth/middleware";
type User = {
  role: string;
};
export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const token = request?.nextauth?.token;
    // Allow access to the root path
    if (request.nextUrl.pathname === "/") return NextResponse.next();
    // If no token and the user is not on the login or request page, redirect to the login page
    if (!token && request.nextUrl.pathname !== "/auth/signIn") {
      return NextResponse.redirect(new URL("/auth/signIn", request.url));
    }

    // If token exists and the user is trying to access the login page, redirect to the dashboard
    if (token && request.nextUrl.pathname === "/auth/signIn") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    // Check the user's role and redirect based on the path they are trying to access
    if (token) {
      const userRole = (token.user as User).role;
      if (
        request.nextUrl.pathname.startsWith("/dashboard/admin") &&
        userRole !== "admin"
      ) {
        return NextResponse.redirect(
          new URL("/dashboard/employee", request.url)
        );
      }
      if (
        request.nextUrl.pathname.startsWith("/dashboard/employee") &&
        userRole !== "employee"
      ) {
        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      }
    }
    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => true, // Ensure the token exists
    },
  }
);
export const config = {
  matcher: [
    "/dashboard/employee/:path*",
    "/dashboard/admin/:path*",
    "/auth/signIn",
    "/api/admin/:path*",
    "/api/employee/:path*",
  ],
};
