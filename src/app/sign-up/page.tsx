"use client";
import SignUpForm from "@/components/signup-form";
import React from "react";

function Page() {
    const handleSignUp = (
        email?: string,
        password?: string,
        confirmPassword?: string,
        remember?: boolean
    ) => {
        console.log("Sign up attempt:", {
            email,
            password,
            confirmPassword,
            remember,
        });
    };

    return (
        <div className="h-full min-h-[100dvh] w-full flex items-center mx-auto justify-center relative">
            <div className="relative z-20 w-full md:max-w-[600px] animate-fadeIn container max-md:px-4">
                <SignUpForm onSubmit={handleSignUp} />
            </div>
        </div>
    );
}

export default Page;
