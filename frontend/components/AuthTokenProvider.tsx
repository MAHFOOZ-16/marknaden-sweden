'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { getAccessToken } from '@auth0/nextjs-auth0/client';
import { useEffect, createContext, useContext, useState } from 'react';
import { api } from '@/lib/api';

const AuthTokenContext = createContext(false);

/**
 * Fetches the Auth0 access token and feeds it to the API client.
 * Uses the SDK's built-in client-side getAccessToken() which calls
 * the middleware-managed /auth/access-token endpoint automatically.
 * Provides a context value confirming when the token is ready.
 */
export function AuthTokenProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useUser();
    const [isTokenReady, setIsTokenReady] = useState(false);

    useEffect(() => {
        if (isLoading) return;

        const fetchToken = async () => {
            if (!user) {
                api.setToken(null);
                setIsTokenReady(true);
                return;
            }
            try {
                const token = await getAccessToken();
                api.setToken(token);
            } catch {
                // Fallback: try the raw fetch approach
                try {
                    const res = await fetch('/auth/access-token');
                    const data = await res.json();
                    if (data.token) {
                        api.setToken(data.token);
                    } else if (data.accessToken) {
                        api.setToken(data.accessToken);
                    } else {
                        api.setToken(null);
                    }
                } catch {
                    api.setToken(null);
                }
            } finally {
                setIsTokenReady(true);
            }
        };
        fetchToken();
    }, [user, isLoading]);

    return (
        <AuthTokenContext.Provider value={isTokenReady}>
            {children}
        </AuthTokenContext.Provider>
    );
}

export function useAuthTokenReady() {
    return useContext(AuthTokenContext);
}
