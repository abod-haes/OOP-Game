"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
  Rocket,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import FormInput from "./ui/form-input";
import { signIn, SignInRequest, signInWithGoogle } from "@/lib/api/client";

interface LoginFormProps {
  onSubmit: (success: boolean, message?: string) => void;
}

const DEMO_EMAIL = "player@roborescue.local";
const DEMO_PASSWORD = "12345678";

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestSubmitting, setIsGuestSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    router.prefetch("/");
    setRemember(localStorage.getItem("rememberMe") === "true");
  }, [router]);

  const completeLogin = async (
    credentials: SignInRequest,
    persistSession: boolean
  ) => {
    const result = await signIn(credentials, persistSession);

    if (!result.success) {
      const errorMessage = Array.isArray(result.error)
        ? result.error.join(", ")
        : result.error || "Unable to sign in.";
      throw new Error(errorMessage);
    }

    onSubmit(true, "Successfully signed in!");
    router.replace("/");
    router.refresh();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (isSubmitting || isGuestSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await completeLogin(
        {
          email: email.trim() || DEMO_EMAIL,
          password: password || DEMO_PASSWORD,
          fcm: null,
        },
        remember
      );
    } catch (loginError) {
      const message =
        loginError instanceof Error
          ? loginError.message
          : "An unexpected error occurred.";
      setError(message);
      onSubmit(false, message);
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    if (isSubmitting || isGuestSubmitting) return;

    setError(null);
    setIsGuestSubmitting(true);

    try {
      await signInWithGoogle();
    } catch (loginError) {
      const message =
        loginError instanceof Error
          ? loginError.message
          : "Unable to start a local session.";
      setError(message);
      onSubmit(false, message);
      setIsGuestSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.35, ease: "easeOut" },
    },
  };

  const isBusy = isSubmitting || isGuestSubmitting;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="rounded-2xl border border-white/10 bg-metallic-light/5 p-6 backdrop-blur-lg sm:p-8"
    >
      <motion.div variants={itemVariants} className="mb-7 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-metallic-accent/30 bg-metallic-accent/10">
          <ShieldCheck className="h-7 w-7 text-metallic-accent" />
        </div>
        <h2 className="text-3xl font-bold text-white">Welcome back</h2>
        <p className="mt-2 text-sm text-white/60">
          Press Login to enter instantly. Email and password are optional locally.
        </p>
        <div className="mt-3 flex items-center justify-center gap-3 text-metallic-accent/80">
          <Sparkles className="h-4 w-4" />
          <Rocket className="h-4 w-4" />
          <LockKeyhole className="h-4 w-4" />
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <motion.div variants={itemVariants}>
          <FormInput
            icon={<Mail className="text-white/60" size={18} />}
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
          />
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <FormInput
            icon={<LockKeyhole className="text-white/60" size={18} />}
            type={showPassword ? "text" : "password"}
            placeholder="Password (optional)"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/60 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-metallic-accent"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </motion.div>

        <motion.label
          variants={itemVariants}
          className="flex cursor-pointer items-start gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3 text-sm text-white/80"
        >
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
            className="mt-0.5 h-4 w-4 accent-metallic-accent"
          />
          <span>
            <span className="block font-medium">Keep me signed in</span>
            <span className="mt-0.5 block text-xs text-white/45">
              Save this local session in the browser.
            </span>
          </span>
        </motion.label>

        <motion.button
          variants={itemVariants}
          type="submit"
          disabled={isBusy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-metallic-accent py-3 font-medium text-white shadow-lg shadow-metallic-accent/20 transition hover:bg-metallic-accent/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-metallic-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? (
            <LoaderCircle className="h-5 w-5 animate-spin" />
          ) : (
            <LogIn className="h-5 w-5" />
          )}
          {isSubmitting ? "Opening..." : "Login"}
        </motion.button>
      </form>

      <motion.div variants={itemVariants} className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-wider text-white/40">or</span>
        <span className="h-px flex-1 bg-white/10" />
      </motion.div>

      <motion.button
        variants={itemVariants}
        type="button"
        onClick={handleGuestLogin}
        disabled={isBusy}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-metallic-accent/40 hover:bg-metallic-accent/10 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGuestSubmitting ? (
          <LoaderCircle className="h-4 w-4 animate-spin" />
        ) : (
          <UserRound className="h-4 w-4" />
        )}
        Continue as local player
      </motion.button>

      <motion.p
        variants={itemVariants}
        className="mt-7 text-center text-sm text-white/60"
      >
        Need a separate local profile?{" "}
        <Link
          href="/sign-up"
          className="font-medium text-white transition hover:text-metallic-accent"
        >
          Create an account
        </Link>
      </motion.p>
    </motion.div>
  );
};

export default LoginForm;
