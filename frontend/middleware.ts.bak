import { auth0 } from "@/lib/auth0";

export async function middleware(request: Request) {
    console.log("[PROXY HIT] URL:", request.url);
    const res = await auth0.middleware(request);
    console.log("[PROXY OUT] Status:", res?.status);
    return res;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
    ]
};
