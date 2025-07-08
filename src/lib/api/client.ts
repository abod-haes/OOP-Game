export interface CompilationResult {
    success: boolean;
    output?: string;
    error?: string;
}

// Authentication interfaces
export interface SignUpRequest {
    firstName: string;
    lastName: string;
    userName: string;
    password: string;
    email: string;
}

export interface SignInRequest {
    email: string;
    password: string;
    fcm: string | null;
}

export interface EmailActivationRequest {
    email: string;
    token: string;
}

export interface EmailActivationResponse {
    accessToken: string;
    refreshToken: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

// New interfaces for token refresh
export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
}

const BASE_URL = "/api";
const AUTH_BASE_URL = "http://roborescue.somee.com/api/authentication";

// Enhanced session storage utilities with refresh logic
export const sessionUtils = {
    setTokens: (tokens: AuthResponse) => {
        sessionStorage.setItem('accessToken', tokens.accessToken);
        sessionStorage.setItem('refreshToken', tokens.refreshToken);
    },
    
    getTokens: (): AuthResponse | null => {
        const accessToken = sessionStorage.getItem('accessToken');
        const refreshToken = sessionStorage.getItem('refreshToken');
        
        if (accessToken && refreshToken) {
            return { accessToken, refreshToken };
        }
        return null;
    },
    
    clearTokens: () => {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
    },
    
    isAuthenticated: (): boolean => {
        return sessionUtils.getTokens() !== null;
    },

    // New method to refresh tokens
    refreshTokens: async (): Promise<boolean> => {
        try {
            const tokens = sessionUtils.getTokens();
            if (!tokens?.refreshToken) {
                return false;
            }

            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    refreshToken: tokens.refreshToken,
                }),
            });

            if (!response.ok) {
                sessionUtils.clearTokens();
                return false;
            }

            const newTokens: RefreshTokenResponse = await response.json();
            sessionUtils.setTokens(newTokens);
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            sessionUtils.clearTokens();
            return false;
        }
    }
};

// Token refresh state management
let isRefreshingToken = false;
let failedRequestQueue: Array<{
    resolve: (value: Response) => void;
    reject: (reason?: unknown) => void;
    requestInfo: RequestInfo;
    requestInit?: RequestInit;
}> = [];

// Protected API client with automatic token refresh
export class ProtectedApiClient {
    private static async makeRequest(
        url: RequestInfo,
        options: RequestInit = {}
    ): Promise<Response> {
        const tokens = sessionUtils.getTokens();
        
        // Add authorization header if tokens exist
        if (tokens?.accessToken) {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${tokens.accessToken}`,
            };
        }

        let response = await fetch(url, options);

        // Handle token expiration
        if (response.status === 401 || response.status === 403) {
            // If already refreshing, queue the request
            if (isRefreshingToken) {
                return new Promise((resolve, reject) => {
                    failedRequestQueue.push({
                        resolve,
                        reject,
                        requestInfo: url,
                        requestInit: options,
                    });
                });
            }

            // Attempt to refresh token
            isRefreshingToken = true;
            const refreshSuccess = await sessionUtils.refreshTokens();
            
            if (refreshSuccess) {
                // Retry original request with new token
                const newTokens = sessionUtils.getTokens();
                if (newTokens?.accessToken) {
                    options.headers = {
                        ...options.headers,
                        Authorization: `Bearer ${newTokens.accessToken}`,
                    };
                    response = await fetch(url, options);

                    // Process queued requests
                    const queuedRequests = failedRequestQueue.splice(0);
                    queuedRequests.forEach(async (queuedRequest) => {
                        try {
                            const newOptions = {
                                ...queuedRequest.requestInit,
                                headers: {
                                    ...queuedRequest.requestInit?.headers,
                                    Authorization: `Bearer ${newTokens.accessToken}`,
                                },
                            };
                            const retryResponse = await fetch(queuedRequest.requestInfo, newOptions);
                            queuedRequest.resolve(retryResponse);
                        } catch (error) {
                            queuedRequest.reject(error);
                        }
                    });
                }
            } else {
                // Refresh failed, redirect to login
                failedRequestQueue.forEach(queuedRequest => {
                    queuedRequest.reject(new Error('Token refresh failed'));
                });
                failedRequestQueue = [];
                
                // Redirect to login page
                if (typeof window !== 'undefined') {
                    window.location.href = '/sign-in';
                }
            }
            
            isRefreshingToken = false;
        }

        return response;
    }

    static async get(url: string, options: RequestInit = {}): Promise<Response> {
        return this.makeRequest(url, { ...options, method: 'GET' });
    }

    static async post(url: string, data?: unknown, options: RequestInit = {}): Promise<Response> {
        const requestOptions: RequestInit = {
            ...options,
            method: 'POST',
        };

        if (data) {
            if (data instanceof FormData) {
                // Don't set Content-Type for FormData, let browser set it
                requestOptions.body = data;
                requestOptions.headers = {
                    ...options.headers,
                };
            } else {
                // For JSON data
                requestOptions.headers = {
                    'Content-Type': 'application/json',
                    ...options.headers,
                };
                requestOptions.body = JSON.stringify(data);
            }
        } else {
            requestOptions.headers = {
                'Content-Type': 'application/json',
                ...options.headers,
            };
        }

        return this.makeRequest(url, requestOptions);
    }

    static async put(url: string, data?: unknown, options: RequestInit = {}): Promise<Response> {
        const requestOptions: RequestInit = {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        if (data) {
            requestOptions.body = JSON.stringify(data);
        }

        return this.makeRequest(url, requestOptions);
    }

    static async delete(url: string, options: RequestInit = {}): Promise<Response> {
        return this.makeRequest(url, { ...options, method: 'DELETE' });
    }
}

// Helper function to handle API responses
export async function handleApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
    try {
        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `HTTP error! status: ${response.status}, message: ${errorText}`,
            };
        }

        const data: T = await response.json();
        return {
            success: true,
            data,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Authentication API service
export async function signUp(userData: SignUpRequest): Promise<ApiResponse<AuthResponse>> {
    try {
        const response = await fetch(`${AUTH_BASE_URL}/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const tokens: AuthResponse = await response.json();
        
        // Store tokens in session
        sessionUtils.setTokens(tokens);
        
        return {
            success: true,
            data: tokens,
        };
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred during signup";
        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function signIn(credentials: SignInRequest): Promise<ApiResponse<AuthResponse>> {
    try {
        const response = await fetch(`${AUTH_BASE_URL}/signin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const tokens: AuthResponse = await response.json();
        
        // Store tokens in session
        sessionUtils.setTokens(tokens);
        
        return {
            success: true,
            data: tokens,
        };
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred during signin";
        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function activateEmail(activationData: EmailActivationRequest): Promise<ApiResponse<EmailActivationResponse>> {
    try {
        const response = await fetch(`/api/authentication/activeEmail`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(activationData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const tokens: EmailActivationResponse = await response.json();
        
        // Store tokens in session
        sessionUtils.setTokens(tokens);
        
        return {
            success: true,
            data: tokens,
        };
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred during email activation";
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Google Sign-In functions
export async function getGoogleSignInUrl(): Promise<ApiResponse<{ url: string }>> {
    try {
        const response = await fetch('/api/externalProviders/GoogleSignInUrl', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        return {
            success: true,
            data: data,
        };
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred while getting Google sign-in URL";
        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function signInWithGoogle(): Promise<void> {
    try {
        const result = await getGoogleSignInUrl();
        
        if (result.success && result.data) {
            // Redirect to Google OAuth
            window.location.href = result.data.url;
        } else {
            throw new Error(result.error || "Failed to get Google sign-in URL");
        }
    } catch (error) {
        console.error("Google sign-in error:", error);
        throw error;
    }
}

// Updated compileJava function with protected API client
export async function compileJava(code: string): Promise<CompilationResult> {
    try {
        const formData = new FormData();
        formData.append("code", code);

        const response = await ProtectedApiClient.post(`${BASE_URL}/compile`, formData);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "An unknown error occurred";
        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Example protected API functions - add more as needed
export async function getProfile(): Promise<ApiResponse<unknown>> {
    try {
        const response = await ProtectedApiClient.get('/api/profile');
        return await handleApiResponse(response);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function checkCode(userId: string, levelId: string, code: string): Promise<ApiResponse<unknown>> {
    try {
        const response = await ProtectedApiClient.post('/api/checkCode', {
            userId,
            levelId,
            code
        });
        return await handleApiResponse(response);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return {
            success: false,
            error: errorMessage,
        };
    }
}

export async function updateProfile(profileData: unknown): Promise<ApiResponse<unknown>> {
    try {
        const response = await ProtectedApiClient.put('/api/profile', profileData);
        return await handleApiResponse(response);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return {
            success: false,
            error: errorMessage,
        };
    }
}
