import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Public routes — no auth required.
 * / and /dashboard are accessible without signing in.
 * Everything else is protected by default.
 */
const isPublicRoute = createRouteMatcher([
  "/",               // landing page
  "/dashboard(.*)", // workspace (guest access allowed)
  "/sign-in(.*)",   // clerk sign-in
  "/sign-up(.*)",   // clerk sign-up
  "/sitemap.xml",    // sitemap
  "/robots.txt",     // robots.txt
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
