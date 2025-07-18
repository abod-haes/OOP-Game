"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { sessionUtils } from "@/lib/api/client";
import Loader from "@/components/ui/loader";

export default function GoogleCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Processing Google sign-in...");
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    const handleGoogleCallback = async () => {
      // Prevent multiple processing
      if (processedRef.current) {
        console.log("Callback already processed, skipping...");
        return;
      }
      processedRef.current = true;

      try {
        const code = searchParams.get("code");
        const error = searchParams.get("error");
        const accessToken = searchParams.get("accessToken");
        const refreshToken = searchParams.get("refreshToken");

        if (error) {
          setStatus("error");
          setMessage(`Google sign-in failed: ${error}`);
          setTimeout(() => router.push("/sign-in"), 3000);
          return;
        }

        // If we have tokens directly from backend callback
        if (accessToken && refreshToken) {
          console.log("🔐 Google OAuth - Direct tokens received");
          console.log("  - Access token length:", accessToken.length);
          console.log("  - Refresh token length:", refreshToken.length);

          // Store tokens
          await sessionUtils.setTokens({
            accessToken,
            refreshToken,
          });

          // Log user ID if available
          const userId = sessionUtils.getUserId();
          console.log("🎉 Google sign-in successful! User ID:", userId);

          setStatus("success");
          setMessage("Successfully signed in with Google! Redirecting...");

          // Redirect to home page
          setTimeout(() => {
            router.push("/");
          }, 2000);
          return;
        }

        // If we have an authorization code, process it
        if (code) {
          console.log("Processing authorization code from Google");
          console.log("Code length:", code.length);

          // Exchange code for tokens
          const response = await fetch(
            `/api/externalProviders/GoogleUserAccountData?Code=${encodeURIComponent(
              code
            )}`
          );

          if (!response.ok) {
            const errorData = await response.json();
            console.error("API error response:", errorData);

            // Check if it's an expired code error
            if (errorData.error && errorData.error.includes("expired")) {
              throw new Error(
                "The authorization code has expired. Please try signing in again."
              );
            }

            // Check if it's an external API error - this might actually be successful with fallback
            if (
              errorData.error &&
              errorData.error.includes(
                "External authentication service is unavailable"
              )
            ) {
              console.log(
                "External API unavailable, but fallback should have been used"
              );
              // This should not happen if fallback is working correctly
              throw new Error(
                "Authentication service is temporarily unavailable. Please try again later."
              );
            }

            // Check if it's an invalid_grant error
            if (errorData.error && errorData.error.includes("invalid_grant")) {
              throw new Error(
                "The authorization code has expired or been used. Please try signing in again."
              );
            }

            throw new Error(
              errorData.error || "Failed to authenticate with Google"
            );
          }

          const userData = await response.json();

          console.log("🔐 Google OAuth - Processed authorization code");
          console.log(
            "  - Access token length:",
            userData.accessToken?.length || 0
          );
          console.log(
            "  - Refresh token length:",
            userData.refreshToken?.length || 0
          );
          console.log(
            "  - User ID in response:",
            userData.userId || "Not provided"
          );

          // Store tokens
          await sessionUtils.setTokens({
            accessToken: userData.accessToken,
            refreshToken: userData.refreshToken,
            userId: userData.userId,
          });

          // Log user ID if available
          const userId = sessionUtils.getUserId();
          console.log("🎉 Google sign-in successful! User ID:", userId);

          setStatus("success");
          setMessage("Successfully signed in with Google! Redirecting...");

          // Redirect to home page
          setTimeout(() => {
            router.push("/");
          }, 2000);
          return;
        }

        // No code or tokens found
        setStatus("error");
        setMessage("No authorization code or tokens received");
        setTimeout(() => router.push("/sign-in"), 3000);
      } catch (error) {
        console.error("Google callback error:", error);
        setStatus("error");

        // Provide more specific error messages
        let errorMessage = "An unexpected error occurred";
        if (error instanceof Error) {
          if (error.message.includes("expired")) {
            errorMessage = "The sign-in session has expired. Please try again.";
          } else if (error.message.includes("invalid_grant")) {
            errorMessage =
              "The authorization code has expired or been used. Please try signing in again.";
          } else {
            errorMessage = error.message;
          }
        }

        setMessage(errorMessage);
        setTimeout(() => router.push("/sign-in"), 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-metallic-dark via-light-100 to-metallic-light flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-metallic-light/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 text-center max-w-md w-full"
      >
        <div className="mb-6">
          {status === "loading" && (
            <div className="w-16 h-16 mx-auto mb-4">
              <Loader />
            </div>
          )}
          {status === "success" && (
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
          {status === "error" && (
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-light-200 mb-4">
          {status === "loading" && "Signing In..."}
          {status === "success" && "Success!"}
          {status === "error" && "Error"}
        </h2>

        <p className="text-metallic-light/80 mb-6">{message}</p>

        {status === "loading" && (
          <div className="flex items-center justify-center space-x-2 text-sm text-metallic-light/60">
            <div className="w-2 h-2 bg-metallic-accent rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-metallic-accent rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-metallic-accent rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        )}

        {(status === "success" || status === "error") && (
          <p className="text-xs text-metallic-light/50">
            Redirecting automatically...
          </p>
        )}
      </motion.div>
    </div>
  );
}
