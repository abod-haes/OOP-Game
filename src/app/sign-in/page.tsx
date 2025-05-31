"use client";
import LoginForm from "@/components/signin-form";
import React from "react";

function Page() {
    const handleLogin = (
        email?: string,
        password?: string,
        remember?: boolean
    ) => {
        console.log("Login attempt:", { email, password, remember });
    };

    return (
        <div className="  h-full  min-h-[100dvh] w-full flex items-center mx-auto  justify-center relative">
            <div className="relative z-20 w-full md:max-w-[600px]  animate-fadeIn container max-md:px-4">
                <LoginForm onSubmit={handleLogin} />
            </div>
        </div>
    );
}

export default Page;
