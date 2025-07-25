# Google OAuth Setup Guide

## Problem

You're encountering the error: "The OAuth client was deleted" (error 401: deleted_client). This happens because the hardcoded Google OAuth credentials in the application are no longer valid.

## Solution

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Enter a project name (e.g., "OOP-Game")
4. Click "Create"

### Step 2: Enable Required APIs

1. In your new project, go to "APIs & Services" → "Library"
2. Search for and enable these APIs:
   - Google+ API
   - Google OAuth2 API
   - Google Identity and Access Management (IAM) API

### Step 3: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Choose "External" user type
3. Fill in the required information:
   - App name: "OOP Game"
   - User support email: your email
   - Developer contact information: your email
4. Add scopes:
   - `openid`
   - `profile`
   - `email`
5. Add test users (your email address)
6. Click "Save and Continue"

### Step 4: Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Name: "OOP Game Web Client"
5. Add these Authorized redirect URIs:
   ```
   http://localhost:3000/auth/google/callback
   http://localhost:3001/auth/google/callback
   http://localhost:3000/api/externalProviders/GoogleUserAccountData
   ```
6. Click "Create"
7. **Save the Client ID and Client Secret** - you'll need these for the next step

### Step 5: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_new_client_id_here
GOOGLE_CLIENT_SECRET=your_new_client_secret_here

# NextAuth Configuration (optional)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
```

Replace:

- `your_new_client_id_here` with the Client ID from Step 4
- `your_new_client_secret_here` with the Client Secret from Step 4
- `your_random_secret_here` with a random string (you can generate one at https://generate-secret.vercel.app/32)

### Step 6: Test the Configuration

1. Restart your development server:

   ```bash
   npm run dev
   ```

2. Try signing in with Google again

## Troubleshooting

### If you still get errors:

1. **Check environment variables**: Make sure your `.env.local` file is in the project root and has the correct values
2. **Verify redirect URIs**: Ensure the redirect URIs in Google Cloud Console match exactly what's in your application
3. **Check API enablement**: Make sure all required APIs are enabled in your Google Cloud project
4. **Test credentials**: You can test your OAuth configuration by visiting `/api/test-oauth` in your application

### Common Issues:

- **"redirect_uri_mismatch"**: The redirect URI in your request doesn't match what's configured in Google Cloud Console
- **"invalid_client"**: The client ID or secret is incorrect
- **"access_denied"**: The user denied permission or the app isn't verified

## Security Notes

- Never commit your `.env.local` file to version control
- Keep your Client Secret secure and don't share it publicly
- For production, use different OAuth credentials and add your production domain to the authorized redirect URIs
