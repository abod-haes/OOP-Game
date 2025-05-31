"use client";
import React, { useState } from "react";
import * as lucideReact from "lucide-react";
import { HoverButton } from "./ui/hover-button";
import { motion } from "framer-motion";
import FormInput from "./ui/form-input";

interface LoginFormProps {
    onSubmit: (email: string, password: string, remember: boolean) => void;
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

// Main LoginForm Component
const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSuccess(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        onSubmit(email, password, remember);
        setIsSubmitting(false);
        setIsSuccess(false);
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
            className="p-8 rounded-2xl  bg-metallic-light/5 backdrop-blur-lg  border border-white/10"
        >
            <motion.div variants={itemVariants} className="mb-8 text-center">
                <h2 className="text-3xl font-bold mb-2 relative group">
                    <span className="absolute -inset-1 bg-gradient-to-r from-metallic-accent/20 via-metallic-accent/30 to-metallic-light/20 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse"></span>
                    <span className="relative inline-block text-3xl font-bold mb-2 text-white">
                        Welcome Back
                    </span>
                </h2>
                <div className="text-white/80 flex flex-col items-center space-y-1">
                    <span className="relative group cursor-default">
                        <span className="absolute -inset-1 bg-gradient-to-r from-metallic-accent/20 to-metallic-accent/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
                        <span className="relative inline-block animate-pulse">
                            Sign in to continue your journey
                        </span>
                    </span>
                    <span className="text-xs text-white/50 animate-pulse">
                        Enter your credentials to proceed
                    </span>
                    <div className="flex space-x-2 text-xs text-white/40">
                        <span className="animate-pulse">🔐</span>
                        <span className="animate-bounce">✨</span>
                        <span className="animate-pulse">🚀</span>
                    </div>
                </div>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={itemVariants}>
                    <FormInput
                        icon={
                            <lucideReact.Mail
                                className="text-white/60"
                                size={18}
                            />
                        }
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </motion.div>

                <motion.div variants={itemVariants} className="relative">
                    <FormInput
                        icon={
                            <lucideReact.Lock
                                className="text-white/60"
                                size={18}
                            />
                        }
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={
                            showPassword ? "Hide password" : "Show password"
                        }
                    >
                        {showPassword ? (
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
                        <label
                            htmlFor="remember-me"
                            className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors"
                            onClick={() => setRemember(!remember)}
                        >
                            Keep me signed in
                        </label>
                    </div>
                    {/* <a
                        href="#"
                        className="text-sm text-white/80 hover:text-white transition-colors"
                    >
                        Reset password
                    </a> */}
                </motion.div>

                <motion.div variants={itemVariants}>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-3 rounded-lg ${
                            isSuccess
                                ? "animate-success"
                                : "bg-metallic-accent hover:bg-metallic-accent/70"
                        } text-white font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-metallic-accent focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-metallic-accent/20 hover:shadow-metallic-accent/40`}
                    >
                        {isSubmitting ? "Signing in..." : "Sign In"}
                    </button>
                </motion.div>
            </form>

            <motion.div variants={itemVariants} className="mt-8">
                <div className="relative flex items-center justify-center">
                    <div className="border-t border-white/10 absolute w-full"></div>
                    <div className="bg-transparent px-4 relative text-white/60 text-sm">
                        OR continue with
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-5">
                    <HoverButton className="text-sm flex items-center justify-center px-2 bg-metallic-accent/20 hover:bg-metallic-accent/30 ">
                        <lucideReact.Chrome size={18} />
                    </HoverButton>
                    <HoverButton className="text-sm flex items-center justify-center px-2 bg-metallic-accent/20 hover:bg-metallic-accent/30 ">
                        <lucideReact.Twitter size={18} />
                    </HoverButton>
                    <HoverButton className="text-sm flex items-center justify-center px-2 bg-metallic-accent/20 hover:bg-metallic-accent/30 ">
                        <lucideReact.Gamepad2 size={18} />
                    </HoverButton>
                </div>
            </motion.div>

            <motion.p
                variants={itemVariants}
                className="mt-8 text-center text-sm text-white/60"
            >
                New to our platform?
                <a
                    href="#"
                    className="font-medium text-white hover:text-metallic-accent transition-colors"
                >
                    Create an account
                </a>
            </motion.p>
        </motion.div>
    );
};

// Export as default components

export default LoginForm;
