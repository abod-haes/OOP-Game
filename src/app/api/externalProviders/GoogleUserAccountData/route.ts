import { NextRequest, NextResponse } from 'next/server';
import { completeGoogleOAuthFlow } from '@/lib/config/google-oauth';

export interface GoogleUserAccountResponse {
    accessToken: string;
    refreshToken: string;
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('Code');

        if (!code) {
            return NextResponse.json(
                { error: 'Authorization code is required' },
                { status: 400 }
            );
        }

        // Use the new Google OAuth service to complete the flow
        const oauthResult = await completeGoogleOAuthFlow(code);
        
        const userData: GoogleUserAccountResponse = {
            accessToken: oauthResult.accessToken,
            refreshToken: oauthResult.refreshToken,
        };
        
        return NextResponse.json(userData, { status: 200 });
        
    } catch (error) {
        console.error('Google OAuth completion error:', error);
        return NextResponse.json(
            { error: `Google authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { status: 500 }
        );
    }
} 