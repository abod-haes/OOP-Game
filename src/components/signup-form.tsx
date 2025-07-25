"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import * as lucideReact from "lucide-react";
import { HoverButton } from "./ui/hover-button";
import { motion } from "framer-motion";
import FormInput from "./ui/form-input";
import {
  signUp,
  SignUpRequest,
  signInWithGoogle,
  sessionUtils,
} from "@/lib/api/client";

interface SignUpFormProps {
  onSubmit: (success: boolean, message?: string) => void;
}

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  id: string;
}

// ToggleSwitch Component
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  onChange,
  id,
}) => {
  return (
    <div className="relative inline-block w-10 h-5 cursor-pointer">
      <input
        type="checkbox"
        id={id}
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${
          checked ? "bg-metallic-accent" : "bg-white/20"
        }`}
      >
        <div
          className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${
            checked ? "transform translate-x-5" : ""
          }`}
        />
      </div>
    </div>
  );
};

// Main SignUpForm Component
const SignUpForm: React.FC<SignUpFormProps> = ({ onSubmit }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [remember, setRemember] = useState(() => {
    // Check if user previously enabled remember me
    if (typeof window !== "undefined") {
      return localStorage.getItem("rememberMe") === "true";
    }
    return false;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !userName.trim()) {
      setError("Please fill in all required fields!");
      return;
    }

    console.log("🔐 Remember me:", remember);
    setIsSubmitting(true);

    try {
      const userData: SignUpRequest = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        userName: userName.trim(),
        password,
        email: email.trim(),
      };

      const result = await signUp(userData, remember);

      if (result.success) {
        setIsSuccess(true);
        console.log(
          "🔐 Remember me enabled:",
          sessionUtils.isRememberMeEnabled()
        );
        // Redirect to email activation page with email as query parameter
        await new Promise((resolve) => setTimeout(resolve, 1000));
        router.push(
          `/activate-email?email=${encodeURIComponent(email.trim())}`
        );
      } else {
        setError(result.error || "Failed to create account");
        onSubmit(false, result.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      onSubmit(false, errorMessage);
    } finally {
      setIsSubmitting(false);
      setIsSuccess(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsGoogleLoading(true);

    try {
      await signInWithGoogle();
      // User will be redirected to Google, so no need to handle success here
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to sign in with Google";
      setError(errorMessage);
      setIsGoogleLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-8 rounded-2xl bg-metallic-light/5 backdrop-blur-lg border border-white/10"
    >
      <motion.div variants={itemVariants} className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2 relative group">
          <span className="absolute -inset-1 bg-gradient-to-r from-metallic-accent/20 via-metallic-accent/30 to-metallic-light/20 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse"></span>
          <span className="relative inline-block text-3xl font-bold mb-2 text-white">
            Create Account
          </span>
        </h2>
        <div className="text-white/80 flex flex-col items-center space-y-1">
          <span className="relative group cursor-default">
            <span className="absolute -inset-1 bg-gradient-to-r from-metallic-accent/20 to-metallic-accent/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
            <span className="relative inline-block animate-pulse">
              Join us on this exciting journey
            </span>
          </span>
          <span className="text-xs text-white/50 animate-pulse">
            Fill in your details to get started
          </span>
          <div className="flex space-x-2 text-xs text-white/40">
            <span className="animate-pulse">🎮</span>
            <span className="animate-bounce">🌟</span>
            <span className="animate-pulse">🎯</span>
          </div>
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <motion.div variants={itemVariants}>
            <FormInput
              icon={<lucideReact.User className="text-white/60" size={18} />}
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <FormInput
              icon={<lucideReact.User className="text-white/60" size={18} />}
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <FormInput
            icon={<lucideReact.AtSign className="text-white/60" size={18} />}
            type="text"
            placeholder="Username"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <FormInput
            icon={<lucideReact.Mail className="text-white/60" size={18} />}
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <FormInput
            icon={<lucideReact.Lock className="text-white/60" size={18} />}
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <lucideReact.EyeOff size={18} />
            ) : (
              <lucideReact.Eye size={18} />
            )}
          </button>
        </motion.div>

        <motion.div variants={itemVariants} className="relative">
          <FormInput
            icon={<lucideReact.Lock className="text-white/60" size={18} />}
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
          >
            {showConfirmPassword ? (
              <lucideReact.EyeOff size={18} />
            ) : (
              <lucideReact.Eye size={18} />
            )}
          </button>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <div
              onClick={() => setRemember(!remember)}
              className="cursor-pointer"
            >
              <ToggleSwitch
                checked={remember}
                onChange={() => setRemember(!remember)}
                id="remember-me"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="remember-me"
                className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors"
                onClick={() => setRemember(!remember)}
              >
                Keep me signed in
              </label>
              <span className="text-xs text-white/50">
                {remember
                  ? "You'll stay signed in even after closing the browser"
                  : "Sign out when you close the browser"}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg ${
              isSuccess
                ? "animate-success bg-green-500"
                : "bg-metallic-accent hover:bg-metallic-accent/70"
            } text-white font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-metallic-accent focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-metallic-accent/20 hover:shadow-metallic-accent/40`}
          >
            {isSubmitting
              ? "Creating account..."
              : isSuccess
              ? "Account Created!"
              : "Sign Up"}
          </button>
        </motion.div>
      </form>

      <motion.div variants={itemVariants} className="mt-8">
        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 absolute w-full"></div>
          <div className="bg-transparent px-4 relative text-white/60 text-sm">
            Or sign up with
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5">
          <HoverButton
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
            className="text-sm flex items-center justify-center px-2 bg-metallic-accent/20 hover:bg-metallic-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
          </HoverButton>
        </div>
      </motion.div>

      <motion.p
        variants={itemVariants}
        className="mt-8 text-center text-sm text-white/60"
      >
        Already have an account?{" "}
        <a
          href="/sign-in"
          className="font-medium text-white hover:text-metallic-accent transition-colors"
        >
          Sign in
        </a>
      </motion.p>
    </motion.div>
  );
};

export default SignUpForm;
