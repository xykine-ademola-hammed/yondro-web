import { baseUrl } from "../common/api-methods";
import type { UserRole } from "../GlobalContexts/AuthContext";

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
  createdAt?: string;
  role?: UserRole;
  organizationId: number;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  expiresAt: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  user?: User;
  tokens?: AuthTokens;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const API_BASE = `${baseUrl}api/auth`;

class AuthService {
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: {
            user: data.data.user,
            tokens: {
              accessToken: data.data.tokens.accessToken,
              refreshToken: data.data.tokens.refreshToken,
              expiresIn: data.data.tokens.expiresIn,
              expiresAt: data.data.tokens.expiresAt,
            },
          },
        };
      }

      return {
        success: false,
        error: data.error || "Login failed",
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  }

  async signup(
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    try {
      const response = await fetch(`${API_BASE}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: {
            user: data.user,
            tokens: {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              expiresIn: data.expiresIn,
              expiresAt: data.expiresAt,
            },
          },
        };
      }

      return {
        success: false,
        error: data.error || "Signup failed",
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  }

  async logout(accessToken: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      return {
        success: response.ok,
        error: response.ok ? undefined : "Logout failed",
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async getCurrentUser(
    accessToken: string
  ): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        return {
          success: true,
          user: data.data,
        };
      }

      return {
        success: false,
        error: data.error || "Failed to get user info",
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<{ tokens: AuthTokens }>> {
    try {
      const response = await fetch(`${API_BASE}/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          tokens: {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresIn: data.expiresIn,
            expiresAt: data.expiresAt,
          },
        };
      }

      return {
        success: false,
        error: data.error || "Token refresh failed",
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async requestReset(email: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/reset`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        data: data,
        error: response.ok ? undefined : data.error,
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  }

  async resendReset(email: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${API_BASE}/reset/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      return {
        success: response.ok,
        data: data,
        error: response.ok ? undefined : data.error,
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  }

  async exchangeToken(token: string): Promise<{
    ok: boolean;
    data?: { remainingSec: number; serverNow: number };
    error?: string;
  }> {
    try {
      const response = await fetch(`${API_BASE}/reset/exchange`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          ok: true,
          data: {
            remainingSec: data.remainingSec,
            serverNow: data.serverNow,
          },
        };
      }

      return {
        ok: false,
        error: data.error || "Token exchange failed",
      };
    } catch (error) {
      return {
        ok: false,
        error: "Network error. Please try again.",
      };
    }
  }

  async confirmPassword(
    newPassword: string
  ): Promise<{ ok: boolean; error?: string; code?: string }> {
    try {
      const response = await fetch(`${API_BASE}/reset/confirm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        return { ok: true };
      }

      return {
        ok: false,
        error: data.error || "Password reset failed",
        code: data.code,
      };
    } catch (error) {
      return {
        ok: false,
        error: "Network error. Please try again.",
      };
    }
  }

  async getUsers(
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: "active" | "inactive"
  ): Promise<ApiResponse<UsersResponse>> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      if (status) {
        params.append("status", status);
      }

      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE}/admin/users?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: data,
        };
      }

      return {
        success: false,
        error: data.error || "Failed to load users",
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async activateUser(
    userId: number,
    reason?: string
  ): Promise<ApiResponse<{ user: User }>> {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE}/admin/users/${userId}/activate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: { user: data.user },
        };
      }

      return {
        success: false,
        error: data.error || "Failed to activate user",
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }

  async deactivateUser(
    userId: number,
    reason?: string
  ): Promise<ApiResponse<{ user: User }>> {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await fetch(
        `${API_BASE}/admin/users/${userId}/deactivate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reason }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: { user: data.user },
        };
      }

      return {
        success: false,
        error: data.error || "Failed to deactivate user",
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error",
      };
    }
  }
}

export const authService = new AuthService();
