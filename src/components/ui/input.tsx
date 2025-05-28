import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="text-sm font-medium text-metallic-light">
                        {label}
                    </label>
                )}
                <div className="group/input rounded-lg p-[2px] transition duration-300 relative">
                    <input
                        type={type}
                        className={cn(
                            "relative z-10 shadow-input dark:placeholder-text-neutral-600 flex h-10 w-full rounded-md border-none bg-metallic-dark/50 px-3 py-2 text-sm text-metallic-light transition duration-400 group-hover/input:shadow-none file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-metallic-light/40 focus-visible:ring-[2px] focus-visible:ring-metallic-accent/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                            error &&
                                "border-red-500 focus-visible:ring-red-500",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = "Input";

export default Input;
