import type { AuthState, LoginResponse, User } from "../types/auth";

const TOKEN_KEY = "ikeja_auth_token";
const USER_KEY = "ikeja_auth_user";

export const authService = {
  /**
   * Log in user against POST /api/auth/login
   */
  async login(email: string, password: string, rememberMe: boolean = false): Promise<LoginResponse> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.error || "Invalid email or password. Please try again.";
      throw new Error(errorMessage);
    }

    const { token, user } = data as LoginResponse;

    // Persist session
    const storage = rememberMe ? localStorage : sessionStorage;
    // Clear any previous token in the alternate storage
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);

    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(user));

    return { token, user };
  },

  /**
   * Retrieve current stored auth state
   */
  getCurrentAuth(): AuthState {
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        return { token, user, isAuthenticated: true };
      } catch {
        // Corrupted session
        this.logout();
      }
    }

    return { token: null, user: null, isAuthenticated: false };
  },

  /**
   * Clear session
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
  },
};
