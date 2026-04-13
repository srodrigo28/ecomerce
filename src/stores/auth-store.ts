"use client";

import { create } from "zustand";

import { getCurrentSellerSession, loginSellerAuth, logoutSellerSession, type SellerAuthSession } from "@/lib/services/catalog-service";

const AUTH_TOKEN_COOKIE = "seller_auth_token";
const API_AUTH_TOKEN_COOKIE = "loja99_auth";
const STORE_SLUG_COOKIE = "seller_store_slug";
const OWNER_EMAIL_COOKIE = "seller_owner_email";
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 12;

const isBrowser = () => typeof window !== "undefined";

const setCookie = (name: string, value: string, maxAge = COOKIE_MAX_AGE_SECONDS) => {
  if (!isBrowser()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
};

const clearCookie = (name: string) => {
  if (!isBrowser()) return;
  document.cookie = `${name}=; path=/; max-age=0; samesite=lax`;
};

const readCookie = (name: string) => {
  if (!isBrowser()) return undefined;
  const prefix = `${name}=`;
  const entry = document.cookie.split("; ").find((item) => item.startsWith(prefix));
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined;
};

const persistSessionCookies = (session: SellerAuthSession) => {
  setCookie(AUTH_TOKEN_COOKIE, session.token);
  setCookie(API_AUTH_TOKEN_COOKIE, session.token);
  setCookie(STORE_SLUG_COOKIE, session.store.slug);
  if (session.user.ownerEmail) {
    setCookie(OWNER_EMAIL_COOKIE, session.user.ownerEmail.toLowerCase());
  }
};

const clearSessionCookies = () => {
  clearCookie(AUTH_TOKEN_COOKIE);
  clearCookie(API_AUTH_TOKEN_COOKIE);
  clearCookie(STORE_SLUG_COOKIE);
  clearCookie(OWNER_EMAIL_COOKIE);
};

type AuthState = {
  isAuthenticated: boolean;
  isHydrating: boolean;
  user: SellerAuthSession["user"] | null;
  store: SellerAuthSession["store"] | null;
  login: (email: string, password: string) => Promise<SellerAuthSession>;
  hydrateSession: () => Promise<void>;
  logout: () => Promise<void>;
  clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isHydrating: false,
  user: null,
  store: null,
  login: async (email: string, password: string) => {
    const session = await loginSellerAuth(email, password);
    persistSessionCookies(session);
    set({
      isAuthenticated: true,
      isHydrating: false,
      user: session.user,
      store: session.store,
    });
    return session;
  },
  hydrateSession: async () => {
    const token = readCookie(AUTH_TOKEN_COOKIE) ?? readCookie(API_AUTH_TOKEN_COOKIE);
    if (!token) {
      clearSessionCookies();
      set({ isAuthenticated: false, isHydrating: false, user: null, store: null });
      return;
    }

    set({ isHydrating: true });

    try {
      const session = await getCurrentSellerSession(token);
      if (!session) {
        clearSessionCookies();
        set({ isAuthenticated: false, isHydrating: false, user: null, store: null });
        return;
      }

      persistSessionCookies(session);
      set({
        isAuthenticated: true,
        isHydrating: false,
        user: session.user,
        store: session.store,
      });
    } catch {
      clearSessionCookies();
      set({ isAuthenticated: false, isHydrating: false, user: null, store: null });
    }
  },
  logout: async () => {
    const token = readCookie(AUTH_TOKEN_COOKIE) ?? readCookie(API_AUTH_TOKEN_COOKIE);
    try {
      await logoutSellerSession(token);
    } finally {
      clearSessionCookies();
      set({ isAuthenticated: false, isHydrating: false, user: null, store: null });
    }
  },
  clear: () => {
    clearSessionCookies();
    set({ isAuthenticated: false, isHydrating: false, user: null, store: null });
  },
}));
