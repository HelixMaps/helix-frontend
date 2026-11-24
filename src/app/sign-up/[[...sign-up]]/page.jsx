"use client";

import React, { useEffect, useState, useRef } from "react";
import { SignUp, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [isAutoCompleting, setIsAutoCompleting] = useState(false);
  const attemptCountRef = useRef(0);

  useEffect(() => {
    if (!isLoaded || !signUp) return;

    // 1. If sign up is already complete, activate the session and go to dashboard
    if (signUp.status === "complete" && signUp.createdSessionId) {
      setActive({ session: signUp.createdSessionId }).then(() => {
        router.replace("/dashboard");
      });
      return;
    }

    // 2. Check if Clerk paused waiting for missing requirements (specifically username from OAuth)
    const isMissingRequirements = signUp.status === "missing_requirements";
    const needsUsername =
      Array.isArray(signUp.missingFields) &&
      signUp.missingFields.includes("username");

    if (isMissingRequirements && needsUsername && attemptCountRef.current < 4) {
      setIsAutoCompleting(true);

      const autoFillUsername = async () => {
        attemptCountRef.current += 1;
        try {
          // Derive a clean, user-friendly username from Google email or name
          let base = "user";
          if (signUp.emailAddress) {
            base = signUp.emailAddress.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
          } else if (signUp.firstName) {
            const namePart = `${signUp.firstName}${signUp.lastName || ""}`.toLowerCase().replace(/[^a-z0-9]/g, "");
            if (namePart) base = namePart;
          }
          if (base.length < 3) base = `user_${base}`;
          if (base.length > 15) base = base.substring(0, 15);

          // Append random digits to guarantee uniqueness
          const randomSuffix = Math.floor(1000 + Math.random() * 9000);
          const candidateUsername = `${base}_${randomSuffix}`;

          console.log(`[Helix Auth] Auto-completing username for OAuth account: ${candidateUsername}`);

          const res = await signUp.update({
            username: candidateUsername,
          });

          if (res.status === "complete" && res.createdSessionId) {
            await setActive({ session: res.createdSessionId });
            router.replace("/dashboard");
          } else if (res.status === "missing_requirements" && res.missingFields?.includes("username")) {
            if (attemptCountRef.current < 4) {
              autoFillUsername();
            } else {
              setIsAutoCompleting(false);
            }
          } else {
            setIsAutoCompleting(false);
          }
        } catch (err) {
          console.warn("[Helix Auth] Auto-fill username error:", err?.message || err);
          if (attemptCountRef.current < 4) {
            setTimeout(autoFillUsername, 350);
          } else {
            setIsAutoCompleting(false);
          }
        }
      };

      autoFillUsername();
    }
  }, [isLoaded, signUp, setActive, router]);

  if (isAutoCompleting) {
    return (
      <div className="flex min-h-screen w-screen bg-[#090A0D] items-center justify-center p-4 select-none">
        <div className="flex flex-col items-center gap-3.5 p-8 rounded-2xl bg-[#0e0f14] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.8)] max-w-sm w-full text-center animate-in fade-in-0 duration-200">
          <div className="w-8 h-8 rounded-full border-2 border-white/[0.1] border-t-cyan-400 animate-spin" />
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-semibold text-zinc-100">Connecting Google Account</h3>
            <p className="text-xs text-zinc-400">
              Finalizing your workspace setup automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp
        fallbackRedirectUrl="/dashboard"
        signInUrl="/sign-in"
        appearance={{
          variables: {
            colorPrimary: "#ffffff",
            colorBackground: "#09090b",
            colorText: "#f4f4f5",
            colorForeground: "#f4f4f5",
            colorNeutral: "#f4f4f5",
            colorTextSecondary: "#a1a1aa",
            colorInputBackground: "#18181b",
            colorInputText: "#f4f4f5",
            colorInputForeground: "#f4f4f5",
            colorBorder: "#27272a",
            colorTextOnPrimaryBackground: "#09090b",
          },
        }}
      />
    </div>
  );
}
