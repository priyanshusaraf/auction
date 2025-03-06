import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/auction", // ✅ Publicly accessible auction page
  "/", // ✅ Allow homepage access
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    return auth.protect(); // ✅ Corrected function call
  }
});

export const config = {
  matcher: [
    // Apply middleware to all pages but exclude Next.js internals & static files
    "/((?!_next|.*\\..*).*)",
    // Always apply middleware to API routes
    "/(api|trpc)(.*)",
  ],
};
