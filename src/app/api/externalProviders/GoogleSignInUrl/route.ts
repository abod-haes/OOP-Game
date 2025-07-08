import { NextResponse } from 'next/server';
import { generateGoogleSignInUrl } from '@/lib/config/google-oauth';

export async function GET() {
    try {
        const googleSignInUrl = generateGoogleSignInUrl();
        
        return NextResponse.json({ url: googleSignInUrl }, { status: 200 });
        
    } catch (error) {
        console.error('Google sign-in URL generation error:', error);
        return NextResponse.json(
            { error: 'Failed to generate Google sign-in URL' },
            { status: 500 }
        );
    }
} 