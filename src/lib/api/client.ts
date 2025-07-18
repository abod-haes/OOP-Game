import { BASE_URL } from "@/app/api-services";

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
  userId?: string;
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

// User API interfaces
export interface UserProfile {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  userName: string;
  password: string;
  email: string;
  fcmToken?: string;
}

export interface UpdateUserRequest {
  userId: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  userName: string;
  email: string;
  fcmToken?: string;
}

// Level interfaces
export interface UserLevel {
  id: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  levelNumber: number;
  sectionId: string;
  codeAnalyzerId: string;
  description: string;
  task: string;
  successMessage: string;
  previousCode: string;
}

export interface Level {
  id: string;
  updatedAt: string | null;
  deletedAt: string | null;
  name: string;
  levelNumber: number;
  sectionId: string;
  codeAnalyzerId: string;
  description: string;
  task: string;
  successMessage: string;
  previousCode: string | null;
}

export interface LevelGetAllParams {
  SectionId?: string;
  LevelNumber?: number;
  PageNumber?: number;
  PageSize?: number;
  Asc?: boolean;
  StartDate?: string;
  EndDate?: string;
  Keyword?: string;
}

export interface LevelGetAllResponse {
  data: Level[];
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  nextPage: number | null;
  previousPage: number | null;
}

const AUTH_BASE_URL = "http://roborescue.somee.com/api/authentication";

// Enhanced session storage utilities with refresh logic
// Helper function to decode JWT token and extract user ID
// Helper function to generate a hash from a string
const generateHash = async (str: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

const decodeJWT = async (token: string): Promise<{ userId?: string }> => {
  try {
    // Check if this is a JWT token (has 3 parts separated by dots)
    const parts = token.split(".");
    if (parts.length === 3) {
      // This is a JWT token
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      );

      const payload = JSON.parse(jsonPayload);

      // Try multiple possible field names for user ID
      const userId =
        payload.userId ||
        payload.sub ||
        payload.id ||
        payload.Id ||
        payload.user_id ||
        payload.userid;

      return {
        userId: userId,
      };
    } else {
      // This is not a JWT token (opaque token)
      // For opaque tokens, we need to extract user ID differently
      try {
        // Try to decode as base64
        const decoded = atob(token);

        // Look for user ID patterns in the decoded token
        const userIdMatch = decoded.match(/(\d{15,})/); // Look for long numbers (likely user IDs)
        if (userIdMatch) {
          const userId = userIdMatch[1];
          return { userId };
        }
      } catch {
        // Token is not base64 encoded
      }

      // Try to extract user ID from the token string itself
      const userIdMatch = token.match(/(\d{15,})/); // Look for long numbers
      if (userIdMatch) {
        const userId = userIdMatch[1];
        return { userId };
      }

      // Generate a user ID from the token hash
      const tokenHash = await generateHash(token);
      const generatedUserId = tokenHash.substring(0, 20); // Take first 20 characters
      return { userId: generatedUserId };
    }
  } catch (error) {
    console.error("Error decoding token:", error);
    return {};
  }
};

export const sessionUtils = {
  setTokens: async (tokens: AuthResponse) => {
    sessionStorage.setItem("accessToken", tokens.accessToken);
    sessionStorage.setItem("refreshToken", tokens.refreshToken);

    // Try to extract user ID from access token
    const decodedToken = await decodeJWT(tokens.accessToken);

    if (decodedToken.userId) {
      sessionStorage.setItem("userId", decodedToken.userId);
    } else {
      // Fallback: use user ID from response if provided
      if (tokens.userId) {
        sessionStorage.setItem("userId", tokens.userId);
      }
    }
  },

  getTokens: (): AuthResponse | null => {
    const accessToken = sessionStorage.getItem("accessToken");
    const refreshToken = sessionStorage.getItem("refreshToken");
    const userId = sessionStorage.getItem("userId");

    if (accessToken && refreshToken) {
      return { accessToken, refreshToken, userId: userId || undefined };
    }
    return null;
  },

  clearTokens: () => {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("userId");
  },

  getUserId: (): string | null => {
    return sessionStorage.getItem("userId");
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

      const response = await fetch(BASE_URL + "/authentication/refreshToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      await sessionUtils.setTokens(newTokens);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      sessionUtils.clearTokens();
      return false;
    }
  },
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
              const retryResponse = await fetch(
                queuedRequest.requestInfo,
                newOptions
              );
              queuedRequest.resolve(retryResponse);
            } catch (error) {
              queuedRequest.reject(error);
            }
          });
        }
      } else {
        // Refresh failed, redirect to login
        failedRequestQueue.forEach((queuedRequest) => {
          queuedRequest.reject(new Error("Token refresh failed"));
        });
        failedRequestQueue = [];

        // Redirect to login page
        if (typeof window !== "undefined") {
          window.location.href = "/sign-in";
        }
      }

      isRefreshingToken = false;
    }

    return response;
  }

  static async get(url: string, options: RequestInit = {}): Promise<Response> {
    return this.makeRequest(url, { ...options, method: "GET" });
  }

  static async post(
    url: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<Response> {
    const requestOptions: RequestInit = {
      ...options,
      method: "POST",
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
          "Content-Type": "application/json",
          ...options.headers,
        };
        requestOptions.body = JSON.stringify(data);
      }
    } else {
      requestOptions.headers = {
        "Content-Type": "application/json",
        ...options.headers,
      };
    }

    return this.makeRequest(url, requestOptions);
  }

  static async put(
    url: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<Response> {
    const requestOptions: RequestInit = {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    if (data) {
      requestOptions.body = JSON.stringify(data);
    }

    return this.makeRequest(url, requestOptions);
  }

  static async delete(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    return this.makeRequest(url, { ...options, method: "DELETE" });
  }
}

// Helper function to handle API responses
export async function handleApiResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
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
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Authentication API service
export async function signUp(
  userData: SignUpRequest
): Promise<ApiResponse<AuthResponse>> {
  try {
    console.log("🚀 Starting sign-up process for:", userData.email);

    const response = await fetch(`${AUTH_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const tokens: AuthResponse = await response.json();

    console.log("🔐 Sign-up successful!");
    console.log("  - Email:", userData.email);
    console.log("  - Username:", userData.userName);
    console.log("  - Access token length:", tokens.accessToken?.length || 0);
    console.log("  - Refresh token length:", tokens.refreshToken?.length || 0);
    console.log("  - User ID in response:", tokens.userId || "Not provided");

    // Store tokens in session
    await sessionUtils.setTokens(tokens);

    // Log the final user ID after storage
    const finalUserId = sessionUtils.getUserId();
    console.log("🎉 Registration complete! User ID:", finalUserId);

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

export async function signIn(
  credentials: SignInRequest
): Promise<ApiResponse<AuthResponse>> {
  try {
    console.log("🚀 Starting sign-in process for:", credentials.email);

    const response = await fetch(`${AUTH_BASE_URL}/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const tokens: AuthResponse = await response.json();

    console.log("🔐 Sign-in successful!");
    console.log("  - Email:", credentials.email);
    console.log("  - Access token length:", tokens.accessToken?.length || 0);
    console.log("  - Refresh token length:", tokens.refreshToken?.length || 0);
    console.log("  - User ID in response:", tokens.userId || "Not provided");

    // Store tokens in session
    await sessionUtils.setTokens(tokens);

    // Log the final user ID after storage
    const finalUserId = sessionUtils.getUserId();
    console.log("🎉 Login complete! User ID:", finalUserId);

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

export async function activateEmail(
  activationData: EmailActivationRequest
): Promise<ApiResponse<EmailActivationResponse>> {
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
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
    }

    const tokens: EmailActivationResponse = await response.json();

    // Store tokens in session
    await sessionUtils.setTokens(tokens);

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
export async function getGoogleSignInUrl(): Promise<
  ApiResponse<{ url: string }>
> {
  try {
    const response = await fetch("/api/externalProviders/GoogleSignInUrl", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error || `HTTP error! status: ${response.status}`
      );
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

    const response = await ProtectedApiClient.post(
      `${BASE_URL}/compile`,
      formData
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Example protected API functions - add more as needed
export async function getProfile(): Promise<ApiResponse<unknown>> {
  try {
    const response = await ProtectedApiClient.get("/api/profile");
    return await handleApiResponse(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function checkCode(
  userId: string,
  levelId: string,
  code: string
): Promise<ApiResponse<unknown>> {
  try {
    const response = await ProtectedApiClient.post("/api/checkCode", {
      userId,
      levelId,
      code,
    });
    return await handleApiResponse(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function updateProfile(
  profileData: unknown
): Promise<ApiResponse<unknown>> {
  try {
    const response = await ProtectedApiClient.put("/api/profile", profileData);
    return await handleApiResponse(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// User API functions
export async function getUserById(
  userId: string
): Promise<ApiResponse<UserProfile>> {
  try {
    const response = await ProtectedApiClient.get(
      `${BASE_URL}/user/getUserById/${userId}`
    );
    return await handleApiResponse<UserProfile>(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function updateUser(
  userData: UpdateUserRequest
): Promise<ApiResponse<boolean>> {
  try {
    // Create a copy of userData without fcmToken if it's not provided
    const { fcmToken, ...updateData } = userData;
    const requestData = fcmToken ? userData : { ...updateData, fcmToken: "" };

    const response = await ProtectedApiClient.post(
      `${BASE_URL}/user/update`,
      requestData
    );
    return await handleApiResponse<boolean>(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Level API functions
export async function getUserLastLevels(
  userId: string
): Promise<ApiResponse<UserLevel[]>> {
  try {
    const response = await ProtectedApiClient.get(
      `${BASE_URL}/level/getUserLastLevels?UserId=${userId}`
    );
    return await handleApiResponse<UserLevel[]>(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getAllLevels(
  params: LevelGetAllParams = {}
): Promise<ApiResponse<LevelGetAllResponse>> {
  try {
    // Build query string from parameters
    const queryParams = new URLSearchParams();

    if (params.SectionId) queryParams.append("SectionId", params.SectionId);
    if (params.LevelNumber !== undefined)
      queryParams.append("LevelNumber", params.LevelNumber.toString());
    if (params.PageNumber !== undefined)
      queryParams.append("PageNumber", params.PageNumber.toString());
    if (params.PageSize !== undefined)
      queryParams.append("PageSize", params.PageSize.toString());
    if (params.Asc !== undefined)
      queryParams.append("Asc", params.Asc.toString());
    if (params.StartDate) queryParams.append("StartDate", params.StartDate);
    if (params.EndDate) queryParams.append("EndDate", params.EndDate);
    if (params.Keyword) queryParams.append("Keyword", params.Keyword);

    const queryString = queryParams.toString();
    const url = queryString
      ? `${BASE_URL}/level/getAll?${queryString}`
      : `${BASE_URL}/level/getAll`;

    const response = await ProtectedApiClient.get(url);
    return await handleApiResponse<LevelGetAllResponse>(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function getLevelById(
  levelId: string
): Promise<ApiResponse<Level>> {
  try {
    const url = `${BASE_URL}/level/getLevelById?LevelId=${levelId}`;
    const response = await ProtectedApiClient.get(url);
    return await handleApiResponse<Level>(response);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
}
