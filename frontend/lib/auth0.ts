import { Auth0Client } from "@auth0/nextjs-auth0/server";

// The SDK uses APP_BASE_URL to construct absolute callback URLs
const appBaseUrl = process.env.APP_BASE_URL ?? process.env.AUTH0_BASE_URL ?? "http://localhost:3000";

export const auth0 = new Auth0Client({
    appBaseUrl,
    authorizationParameters: {
        audience: process.env.AUTH0_AUDIENCE,
        scope: "openid profile email",
    },
});
