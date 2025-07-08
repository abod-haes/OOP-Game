# Automatic Token Refresh System

This system provides automatic token refresh for all API calls when the access token expires.

## Features

### 🔄 Automatic Token Refresh
- Automatically detects 401/403 responses indicating token expiration
- Refreshes tokens using the stored refresh token
- Retries the original request with new tokens
- Handles concurrent requests during token refresh

### 📝 Request Queueing
- Queues requests while token refresh is in progress
- Processes all queued requests with new tokens
- Prevents multiple refresh attempts

### 🚪 Automatic Logout
- Redirects to login page if token refresh fails
- Clears stored tokens on refresh failure

### 🛠️ Easy Migration
- Replace `fetch()` calls with `ProtectedApiClient` methods
- Handles both JSON and FormData automatically
- Maintains the same API interface

## Usage

### Basic Usage

```typescript
import { ProtectedApiClient, handleApiResponse } from '@/lib/api/client';

// GET request
const response = await ProtectedApiClient.get('/api/user/profile');
const result = await handleApiResponse(response);

// POST request with JSON data
const userData = { name: 'John', email: 'john@example.com' };
const response = await ProtectedApiClient.post('/api/user', userData);
const result = await handleApiResponse(response);

// PUT request
const response = await ProtectedApiClient.put('/api/user/123', updatedData);
const result = await handleApiResponse(response);

// DELETE request
const response = await ProtectedApiClient.delete('/api/user/123');
const result = await handleApiResponse(response);
```

### File Upload

```typescript
// File upload with FormData
const formData = new FormData();
formData.append('file', file);

const response = await ProtectedApiClient.post('/api/upload', formData);
const result = await handleApiResponse(response);
```

### Batch Requests

```typescript
// Multiple concurrent requests - token refresh handled automatically
const [profileResponse, settingsResponse, levelsResponse] = await Promise.all([
    ProtectedApiClient.get('/api/user/profile'),
    ProtectedApiClient.get('/api/user/settings'),
    ProtectedApiClient.get('/api/game/levels')
]);
```

## Implementation Details

### Files Modified
- `src/lib/api/client.ts` - Enhanced with automatic token refresh
- `src/app/api/auth/refresh/route.ts` - New token refresh endpoint

### Key Components

1. **ProtectedApiClient**: Main API client with automatic token refresh
2. **sessionUtils.refreshTokens()**: Handles token refresh logic
3. **Request Queue**: Manages concurrent requests during token refresh
4. **Error Handling**: Graceful fallback and automatic logout

### Token Refresh Flow

1. API request is made with current access token
2. If response is 401/403, token refresh is triggered
3. System uses refresh token to get new access token
4. Original request is retried with new token
5. Concurrent requests are queued and processed after refresh
6. If refresh fails, user is redirected to login

## Migration Guide

### Before (using fetch)
```typescript
const response = await fetch('/api/user/profile', {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});
```

### After (using ProtectedApiClient)
```typescript
const response = await ProtectedApiClient.get('/api/user/profile');
const result = await handleApiResponse(response);
```

## Benefits

1. **Seamless User Experience**: No manual token handling required
2. **Robust Error Handling**: Automatic retry and fallback mechanisms
3. **Concurrent Request Support**: Handles multiple simultaneous requests
4. **Type Safety**: Full TypeScript support with proper typing
5. **Consistent API**: Same interface across all request types

## Usage Examples for Your App

```typescript
// Game level APIs
export async function getGameLevel(levelId: string) {
    const response = await ProtectedApiClient.get(`/api/game/level/${levelId}`);
    return await handleApiResponse(response);
}

// Profile management
export async function updateProfile(profileData: any) {
    const response = await ProtectedApiClient.put('/api/profile', profileData);
    return await handleApiResponse(response);
}

// Java compilation (already updated)
// The compileJava function now uses ProtectedApiClient automatically
```

Now all your API calls will automatically handle token refresh when needed! 