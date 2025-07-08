"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { sessionUtils } from '@/lib/api/client';
import Loader from '@/components/ui/loader';

export default function GoogleCallbackPage() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Processing Google sign-in...');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleGoogleCallback = async () => {
            try {
                const code = searchParams.get('code');
                const error = searchParams.get('error');

                if (error) {
                    setStatus('error');
                    setMessage(`Google sign-in failed: ${error}`);
                    setTimeout(() => router.push('/sign-in'), 3000);
                    return;
                }

                if (!code) {
                    setStatus('error');
                    setMessage('No authorization code received from Google');
                    setTimeout(() => router.push('/sign-in'), 3000);
                    return;
                }

                // Exchange code for tokens
                const response = await fetch(`/api/externalProviders/GoogleUserAccountData?Code=${encodeURIComponent(code)}`);
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to authenticate with Google');
                }

                const userData = await response.json();
                
                // Store tokens
                sessionUtils.setTokens({
                    accessToken: userData.accessToken,
                    refreshToken: userData.refreshToken,
                });

                setStatus('success');
                setMessage('Successfully signed in with Google! Redirecting...');
                
                // Redirect to home page
                setTimeout(() => {
                    router.push('/');
                }, 2000);

            } catch (error) {
                console.error('Google callback error:', error);
                setStatus('error');
                setMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
                setTimeout(() => router.push('/sign-in'), 3000);
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
                    {status === 'loading' && (
                        <div className="w-16 h-16 mx-auto mb-4">
                            <Loader />
                        </div>
                    )}
                    {status === 'success' && (
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    )}
                    {status === 'error' && (
                        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    )}
                </div>

                <h2 className="text-2xl font-bold text-light-200 mb-4">
                    {status === 'loading' && 'Signing In...'}
                    {status === 'success' && 'Success!'}
                    {status === 'error' && 'Error'}
                </h2>

                <p className="text-metallic-light/80 mb-6">
                    {message}
                </p>

                {status === 'loading' && (
                    <div className="flex items-center justify-center space-x-2 text-sm text-metallic-light/60">
                        <div className="w-2 h-2 bg-metallic-accent rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-metallic-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-metallic-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                )}

                {(status === 'success' || status === 'error') && (
                    <p className="text-xs text-metallic-light/50">
                        Redirecting automatically...
                    </p>
                )}
            </motion.div>
        </div>
    );
} 