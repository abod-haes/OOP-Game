"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/ui/loader';

export default function GoogleInterceptPage() {
    const router = useRouter();

    useEffect(() => {
        // Check if we're being redirected from Google with an authorization code
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (code || error) {
            // Redirect to our proper callback with the parameters
            const callbackUrl = `/auth/google/callback${window.location.search}`;
            router.replace(callbackUrl);
        } else {
            // If no params, redirect to sign-in
            router.replace('/sign-in');
        }
    }, [router]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-metallic-dark via-light-100 to-metallic-light flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4">
                    <Loader  />
                </div>
                <p className="text-light-200">Redirecting...</p>
            </div>
        </div>
    );
} 