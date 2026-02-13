import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// This defines which routes are private. 
// We want to protect /analyze and anything inside it.
const isProtectedRoute = createRouteMatcher(['/analyze(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect();
});

export const config = {
  matcher: [
    // This regex ensures Clerk runs on all pages EXCEPT static files (images, etc.)
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};