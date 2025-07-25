"use client";

import { useEffect, useState } from "react";
import { sessionUtils } from "@/lib/api/client";

export function AuthDebug() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userId: null as string | null,
    rememberMe: false,
    hasTokens: false,
  });

  useEffect(() => {
    const updateAuthState = () => {
      setAuthState({
        isAuthenticated: sessionUtils.isAuthenticated(),
        userId: sessionUtils.getUserId(),
        rememberMe: sessionUtils.isRememberMeEnabled(),
        hasTokens: sessionUtils.getTokens() !== null,
      });
    };

    // Update on mount
    updateAuthState();

    // Listen for storage changes
    const handleStorageChange = () => {
      updateAuthState();
    };

    window.addEventListener("storage", handleStorageChange);

    // Check periodically for changes - reduced frequency from 1s to 5s
    const interval = setInterval(updateAuthState, 5000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  if (process.env.NODE_ENV === "production") {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">🔐 Auth Debug</div>
      <div>Authenticated: {authState.isAuthenticated ? "✅" : "❌"}</div>
      <div>User ID: {authState.userId || "None"}</div>
      <div>Remember Me: {authState.rememberMe ? "✅" : "❌"}</div>
      <div>Has Tokens: {authState.hasTokens ? "✅" : "❌"}</div>
      <div className="mt-2 text-xs text-gray-400">
        Storage: {authState.rememberMe ? "localStorage" : "sessionStorage"}
      </div>
    </div>
  );
}
