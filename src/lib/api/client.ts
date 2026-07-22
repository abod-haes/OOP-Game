import {
  DEFAULT_LOCAL_USER,
  LOCAL_LEVELS,
  LOCAL_SECTIONS,
  LOCAL_STORAGE_KEYS,
  getLocalLevelById,
  validateLocalLevelCode,
} from "@/data/data";

export interface CompilationResult {
  success: boolean;
  output?: string;
  error?: string;
}

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
  error?: string | string[];
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

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

export interface Section {
  id: string;
  updatedAt: string | null;
  deletedAt: string | null;
  sectionNumber: number;
  description: string;
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

interface StoredUser extends UserProfile {
  password: string;
}

type ProgressStore = Record<string, string[]>;

const isBrowser = () => typeof window !== "undefined";

function createId(prefix: string): string {
  if (isBrowser() && typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readUsers(): StoredUser[] {
  if (!isBrowser()) return [{ ...DEFAULT_LOCAL_USER }];

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.users);
    if (!raw) {
      const seeded = [{ ...DEFAULT_LOCAL_USER }];
      localStorage.setItem(LOCAL_STORAGE_KEYS.users, JSON.stringify(seeded));
      return seeded;
    }

    const parsed = JSON.parse(raw) as StoredUser[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [{ ...DEFAULT_LOCAL_USER }];
    }
    return parsed;
  } catch {
    return [{ ...DEFAULT_LOCAL_USER }];
  }
}

function writeUsers(users: StoredUser[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(LOCAL_STORAGE_KEYS.users, JSON.stringify(users));
}

function readProgress(): ProgressStore {
  if (!isBrowser()) return {};

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.progress);
    return raw ? (JSON.parse(raw) as ProgressStore) : {};
  } catch {
    return {};
  }
}

function writeProgress(progress: ProgressStore): void {
  if (!isBrowser()) return;
  localStorage.setItem(LOCAL_STORAGE_KEYS.progress, JSON.stringify(progress));
}

function createTokens(userId: string): AuthResponse {
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    accessToken: `local-access-${userId}-${nonce}`,
    refreshToken: `local-refresh-${userId}-${nonce}`,
    userId,
  };
}

function profileFromEmail(email: string, password: string): StoredUser {
  const normalizedEmail = email.trim().toLowerCase();
  const namePart = normalizedEmail.split("@")[0] || "player";
  const displayName = namePart.replace(/[._-]+/g, " ").trim() || "player";
  const firstName = displayName
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  const now = new Date().toISOString();
  return {
    id: createId("local-user"),
    createdAt: now,
    updatedAt: now,
    firstName,
    lastName: "Player",
    birthDate: "",
    userName: namePart,
    password,
    email: normalizedEmail,
    fcmToken: "",
  };
}

export const sessionUtils = {
  setTokens: async (
    tokens: AuthResponse,
    rememberMe: boolean = false
  ): Promise<void> => {
    if (!isBrowser()) return;

    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("rememberMe");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("rememberMe");

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("accessToken", tokens.accessToken);
    storage.setItem("refreshToken", tokens.refreshToken);
    storage.setItem("rememberMe", rememberMe.toString());

    if (tokens.userId) {
      storage.setItem("userId", tokens.userId);
    }
  },

  getTokens: (): AuthResponse | null => {
    if (!isBrowser()) return null;

    const readFrom = (storage: Storage): AuthResponse | null => {
      const accessToken = storage.getItem("accessToken");
      const refreshToken = storage.getItem("refreshToken");
      const userId = storage.getItem("userId") || undefined;

      return accessToken && refreshToken
        ? { accessToken, refreshToken, userId }
        : null;
    };

    return readFrom(localStorage) || readFrom(sessionStorage);
  },

  clearTokens: (): void => {
    if (!isBrowser()) return;

    [sessionStorage, localStorage].forEach((storage) => {
      storage.removeItem("accessToken");
      storage.removeItem("refreshToken");
      storage.removeItem("userId");
      storage.removeItem("rememberMe");
    });
  },

  getUserId: (): string | null => {
    if (!isBrowser()) return null;
    return localStorage.getItem("userId") || sessionStorage.getItem("userId");
  },

  isAuthenticated: (): boolean => sessionUtils.getTokens() !== null,

  isRememberMeEnabled: (): boolean =>
    isBrowser() && localStorage.getItem("rememberMe") === "true",

  refreshTokens: async (): Promise<boolean> => {
    const tokens = sessionUtils.getTokens();
    if (!tokens?.userId) return false;

    const rememberMe = sessionUtils.isRememberMeEnabled();
    await sessionUtils.setTokens(createTokens(tokens.userId), rememberMe);
    return true;
  },
};

export class ProtectedApiClient {
  private static async makeRequest(
    url: RequestInfo | URL,
    options: RequestInit = {}
  ): Promise<Response> {
    const tokens = sessionUtils.getTokens();
    const headers = new Headers(options.headers);

    if (tokens?.accessToken) {
      headers.set("Authorization", `Bearer ${tokens.accessToken}`);
    }

    return fetch(url, { ...options, headers });
  }

  static get(url: string, options: RequestInit = {}): Promise<Response> {
    return this.makeRequest(url, { ...options, method: "GET" });
  }

  static post(
    url: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = new Headers(options.headers);
    let body: BodyInit | undefined;

    if (data instanceof FormData) {
      body = data;
    } else if (data !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(data);
    }

    return this.makeRequest(url, {
      ...options,
      method: "POST",
      headers,
      body,
    });
  }

  static put(
    url: string,
    data?: unknown,
    options: RequestInit = {}
  ): Promise<Response> {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");

    return this.makeRequest(url, {
      ...options,
      method: "PUT",
      headers,
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  }

  static delete(url: string, options: RequestInit = {}): Promise<Response> {
    return this.makeRequest(url, { ...options, method: "DELETE" });
  }
}

export async function handleApiResponse<T>(
  response: Response
): Promise<ApiResponse<T>> {
  try {
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      const error = contentType?.includes("application/json")
        ? JSON.stringify(await response.json())
        : await response.text();

      return { success: false, error };
    }

    return { success: true, data: (await response.json()) as T };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown local API error",
    };
  }
}

export async function signUp(
  userData: SignUpRequest,
  rememberMe: boolean = false
): Promise<ApiResponse<AuthResponse>> {
  const email = userData.email.trim().toLowerCase();
  const users = readUsers();

  if (users.some((user) => user.email.toLowerCase() === email)) {
    return { success: false, error: "An account with this email already exists." };
  }

  const now = new Date().toISOString();
  const user: StoredUser = {
    id: createId("local-user"),
    createdAt: now,
    updatedAt: now,
    firstName: userData.firstName.trim(),
    lastName: userData.lastName.trim(),
    birthDate: "",
    userName: userData.userName.trim(),
    password: userData.password,
    email,
    fcmToken: "",
  };

  writeUsers([...users, user]);
  const tokens = createTokens(user.id);
  await sessionUtils.setTokens(tokens, rememberMe);

  return { success: true, data: tokens };
}

export async function signIn(
  credentials: SignInRequest,
  rememberMe: boolean = false
): Promise<ApiResponse<AuthResponse>> {
  const email = credentials.email.trim().toLowerCase();
  const users = readUsers();
  let user = users.find((item) => item.email.toLowerCase() === email);

  if (user && user.password !== credentials.password) {
    return { success: false, error: "Incorrect password." };
  }

  if (!user) {
    user = profileFromEmail(email, credentials.password);
    users.push(user);
    writeUsers(users);
  }

  const tokens = createTokens(user.id);
  await sessionUtils.setTokens(tokens, rememberMe);
  return { success: true, data: tokens };
}

export async function activateEmail(
  activationData: EmailActivationRequest,
  rememberMe: boolean = false
): Promise<ApiResponse<EmailActivationResponse>> {
  if (activationData.token.trim().length !== 8) {
    return { success: false, error: "Activation token must be 8 characters." };
  }

  const users = readUsers();
  const user = users.find(
    (item) =>
      item.email.toLowerCase() === activationData.email.trim().toLowerCase()
  );

  if (!user) {
    return { success: false, error: "Local account not found." };
  }

  const tokens = createTokens(user.id);
  await sessionUtils.setTokens(tokens, rememberMe);

  return {
    success: true,
    data: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    },
  };
}

export async function getGoogleSignInUrl(): Promise<
  ApiResponse<{ url: string }>
> {
  return { success: true, data: { url: "/" } };
}

export async function signInWithGoogle(): Promise<void> {
  const users = readUsers();
  let user = users.find((item) => item.id === "local-google-user");

  if (!user) {
    const now = new Date().toISOString();
    user = {
      id: "local-google-user",
      createdAt: now,
      updatedAt: now,
      firstName: "Google",
      lastName: "Player",
      birthDate: "",
      userName: "google-player",
      password: "",
      email: "google-player@roborescue.local",
      fcmToken: "",
    };
    writeUsers([...users, user]);
  }

  await sessionUtils.setTokens(createTokens(user.id), true);

  if (isBrowser()) {
    window.location.href = "/";
  }
}

export async function compileJava(code: string): Promise<CompilationResult> {
  try {
    const formData = new FormData();
    formData.append("code", code);

    const response = await fetch("/api/compile", {
      method: "POST",
      body: formData,
    });

    return (await response.json()) as CompilationResult;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Compilation failed",
    };
  }
}

export async function getProfile(): Promise<ApiResponse<UserProfile>> {
  const userId = sessionUtils.getUserId();
  return userId
    ? getUserById(userId)
    : { success: false, error: "User is not signed in." };
}

export async function checkCode(
  userId: string,
  levelId: string,
  code: string
): Promise<ApiResponse<boolean>> {
  const validation = validateLocalLevelCode(levelId, code);

  if (!validation.success) {
    return { success: false, error: validation.errors };
  }

  const progress = readProgress();
  const completed = new Set(progress[userId] || []);
  completed.add(levelId);
  progress[userId] = Array.from(completed);
  writeProgress(progress);

  return { success: true, data: true };
}

export async function updateProfile(
  profileData: unknown
): Promise<ApiResponse<boolean>> {
  if (!profileData || typeof profileData !== "object") {
    return { success: false, error: "Invalid profile data." };
  }
  return updateUser(profileData as UpdateUserRequest);
}

export async function getUserById(
  userId: string
): Promise<ApiResponse<UserProfile>> {
  const user = readUsers().find((item) => item.id === userId);

  return user
    ? { success: true, data: { ...user } }
    : { success: false, error: "Local user not found." };
}

export async function updateUser(
  userData: UpdateUserRequest
): Promise<ApiResponse<boolean>> {
  const users = readUsers();
  const index = users.findIndex((user) => user.id === userData.userId);

  if (index < 0) {
    return { success: false, error: "Local user not found." };
  }

  users[index] = {
    ...users[index],
    ...userData,
    updatedAt: new Date().toISOString(),
    fcmToken: userData.fcmToken ?? users[index].fcmToken,
  };
  writeUsers(users);

  return { success: true, data: true };
}

export async function getUserLastLevels(
  userId: string
): Promise<ApiResponse<UserLevel[]>> {
  const completedIds = readProgress()[userId] || [];
  const now = new Date().toISOString();

  const completedLevels = completedIds
    .map((levelId) => getLocalLevelById(levelId))
    .filter((level): level is NonNullable<typeof level> => Boolean(level))
    .map<UserLevel>((level) => ({
      id: level.id,
      updatedAt: now,
      deletedAt: null,
      name: level.name,
      levelNumber: level.levelNumber,
      sectionId: level.sectionId,
      codeAnalyzerId: level.codeAnalyzerId,
      description: level.description,
      task: level.task,
      successMessage: level.successMessage,
      previousCode: level.previousCode,
    }))
    .sort((a, b) => {
      const sectionA =
        LOCAL_SECTIONS.find((section) => section.id === a.sectionId)
          ?.sectionNumber ?? 0;
      const sectionB =
        LOCAL_SECTIONS.find((section) => section.id === b.sectionId)
          ?.sectionNumber ?? 0;
      return sectionA - sectionB || a.levelNumber - b.levelNumber;
    });

  return { success: true, data: completedLevels };
}

export async function getAllLevels(
  params: LevelGetAllParams = {}
): Promise<ApiResponse<LevelGetAllResponse>> {
  let levels: Level[] = LOCAL_LEVELS.map((level) => ({
    id: level.id,
    updatedAt: level.updatedAt,
    deletedAt: level.deletedAt,
    name: level.name,
    levelNumber: level.levelNumber,
    sectionId: level.sectionId,
    codeAnalyzerId: level.codeAnalyzerId,
    description: level.description,
    task: level.task,
    successMessage: level.successMessage,
    previousCode: level.previousCode,
  }));

  if (params.SectionId) {
    levels = levels.filter((level) => level.sectionId === params.SectionId);
  }

  if (params.LevelNumber !== undefined) {
    levels = levels.filter(
      (level) => level.levelNumber === params.LevelNumber
    );
  }

  if (params.Keyword?.trim()) {
    const keyword = params.Keyword.trim().toLowerCase();
    levels = levels.filter((level) =>
      [level.name, level.description, level.task].some((value) =>
        value.toLowerCase().includes(keyword)
      )
    );
  }

  levels.sort((a, b) => {
    const sectionA =
      LOCAL_SECTIONS.find((section) => section.id === a.sectionId)
        ?.sectionNumber ?? 0;
    const sectionB =
      LOCAL_SECTIONS.find((section) => section.id === b.sectionId)
        ?.sectionNumber ?? 0;
    const order = sectionA - sectionB || a.levelNumber - b.levelNumber;
    return params.Asc === false ? -order : order;
  });

  const pageNumber = Math.max(1, params.PageNumber ?? 1);
  const pageSize = Math.max(1, params.PageSize ?? 50);
  const totalCount = levels.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (pageNumber - 1) * pageSize;
  const data = levels.slice(start, start + pageSize);

  return {
    success: true,
    data: {
      data,
      totalCount,
      pageSize,
      pageNumber,
      totalPages,
      nextPage: pageNumber < totalPages ? pageNumber + 1 : null,
      previousPage: pageNumber > 1 ? pageNumber - 1 : null,
    },
  };
}

export async function getLevelById(
  levelId: string
): Promise<ApiResponse<Level>> {
  const level = getLocalLevelById(levelId);

  if (!level) {
    return { success: false, error: "Level not found." };
  }

  return {
    success: true,
    data: {
      id: level.id,
      updatedAt: level.updatedAt,
      deletedAt: level.deletedAt,
      name: level.name,
      levelNumber: level.levelNumber,
      sectionId: level.sectionId,
      codeAnalyzerId: level.codeAnalyzerId,
      description: level.description,
      task: level.task,
      successMessage: level.successMessage,
      previousCode: level.previousCode,
    },
  };
}

export async function getAllSections(): Promise<ApiResponse<Section[]>> {
  return {
    success: true,
    data: LOCAL_SECTIONS.map((section) => ({ ...section })),
  };
}
