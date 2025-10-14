import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
} from "react";
import { authService } from "../services/authService";
import type { Organization, Unit } from "../common/types";

export interface Department {
  id?: string;
  name?: string;
  units?: Unit[];
  financeCode?: string;
}

export interface Position {
  id: string;
  title: string;
  departmentId: string;
  isMultiple: boolean;
}

export interface Institution {
  id?: string;
  name: string;
  code: string;
}

export type UserRole = "Admin" | "Manager" | "Employee" | undefined | "admin";

export interface User {
  role?: UserRole;
  id: number;
  email?: string;
  category?: string;
  firstName?: string;
  lastName?: string;
  organization?: Organization;
  department?: Department;
  position?: Position;
  permissions?: string[];
  organizationId: number;
  institution?: Institution;
  schoolOrOfficeId?: number;
  unit?: Unit;
  phone?: string;
  schoolOrOffice?: any;
}

// interface User {
//   id: number;
//   email: string;
//   firstName?: string;
//   lastName?: string;
//   createdAt?: string;
//   role?: string;
// }

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "SET_AUTH";
      payload: {
        user: User;
        accessToken: string;
        refreshToken: string;
        expiresAt: number;
      };
    }
  | { type: "CLEAR_AUTH" }
  | {
      type: "UPDATE_USER";
      payload: {
        user: User;
      };
    }
  | {
      type: "UPDATE_TOKENS";
      payload: { accessToken: string; refreshToken: string; expiresAt: number };
    };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  isLoading: true,
  isAuthenticated: false,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_AUTH":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
        isLoading: false,
        isAuthenticated: true,
      };
    case "UPDATE_TOKENS":
      return {
        ...state,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        expiresAt: action.payload.expiresAt,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload.user },
      };
    case "CLEAR_AUTH":
      return {
        ...initialState,
        isLoading: false,
      };
    default:
      return state;
  }
}

interface AuthContextType extends AuthState {
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signup: (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshTokens: () => Promise<boolean>;
  updateUser: (data: any) => void;
  hasPermission: (permission: string) => boolean | undefined | "";
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const accessToken = localStorage.getItem("accessToken");
        const refreshToken = localStorage.getItem("refreshToken");
        const expiresAt = localStorage.getItem("expiresAt");
        const storedUser = localStorage.getItem("user");

        if (accessToken && refreshToken && expiresAt) {
          const expiryTime = parseInt(expiresAt);
          const now = Date.now();

          if (now < expiryTime) {
            // Token is still valid, get user info
            const result = await authService.getCurrentUser(accessToken);
            if (result.success && result.user) {
              dispatch({
                type: "SET_AUTH",
                payload: {
                  user: result.user || storedUser,
                  accessToken,
                  refreshToken,
                  expiresAt: expiryTime,
                },
              });
              return;
            }
          }

          // Token expired or invalid, try to refresh
          const refreshResult = await authService.refreshToken(refreshToken);
          if (refreshResult.success && refreshResult.tokens) {
            const userResult = await authService.getCurrentUser(
              refreshResult.tokens.accessToken
            );
            if (userResult.success && userResult.user) {
              const newExpiresAt = refreshResult.tokens.expiresAt;

              localStorage.setItem(
                "accessToken",
                refreshResult.tokens.accessToken
              );
              localStorage.setItem(
                "refreshToken",
                refreshResult.tokens.refreshToken
              );
              localStorage.setItem("expiresAt", newExpiresAt.toString());
              dispatch({
                type: "SET_AUTH",
                payload: {
                  user: userResult.user,
                  accessToken: refreshResult.tokens.accessToken,
                  refreshToken: refreshResult.tokens.refreshToken,
                  expiresAt: newExpiresAt,
                },
              });
              return;
            }
          }
        }

        // Clear invalid tokens
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("expiresAt");
        dispatch({ type: "CLEAR_AUTH" });
      } catch (error) {
        console.error("Auth state load error:", error);
        dispatch({ type: "CLEAR_AUTH" });
      }
    };

    loadAuthState();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await authService.login(email, password);
      if (result.success && result?.data?.user && result.data.tokens) {
        localStorage.setItem("accessToken", result.data.tokens.accessToken);
        localStorage.setItem("refreshToken", result.data.tokens.refreshToken);
        localStorage.setItem("user", JSON.stringify(result?.data?.user));
        localStorage.setItem(
          "expiresAt",
          result?.data?.tokens?.expiresAt?.toString()
        );
        dispatch({
          type: "SET_AUTH",
          payload: {
            user: result?.data?.user,
            accessToken: result.data.tokens.accessToken,
            refreshToken: result.data.tokens.refreshToken,
            expiresAt: result.data.tokens.expiresAt,
          },
        });
        return { success: true };
      }
      return { success: false, error: result.error || "Login failed" };
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const signup = async (
    email: string,
    password: string,
    firstName?: string,
    lastName?: string
  ) => {
    try {
      const result = await authService.signup(
        email,
        password,
        firstName,
        lastName
      );

      if (result.success && result.user && result.tokens) {
        localStorage.setItem("accessToken", result.tokens.accessToken);
        localStorage.setItem("refreshToken", result.tokens.refreshToken);
        localStorage.setItem("expiresAt", result.tokens.expiresAt.toString());

        dispatch({
          type: "SET_AUTH",
          payload: {
            user: result.user,
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
            expiresAt: result.tokens.expiresAt,
          },
        });

        return { success: true };
      }

      return { success: false, error: result.error || "Signup failed" };
    } catch (error) {
      return { success: false, error: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    try {
      if (state.accessToken) {
        await authService.logout(state.accessToken);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("expiresAt");
      dispatch({ type: "CLEAR_AUTH" });
    }
  };

  const refreshTokens = async (): Promise<boolean> => {
    try {
      if (!state.refreshToken) {
        return false;
      }

      const result = await authService.refreshToken(state.refreshToken);
      console.log(result);
      if (result.success && result.tokens) {
        localStorage.setItem("accessToken", result?.tokens?.accessToken);
        localStorage.setItem("refreshToken", result?.tokens.refreshToken);
        localStorage.setItem("expiresAt", result.tokens?.expiresAt.toString());

        dispatch({
          type: "UPDATE_TOKENS",
          payload: {
            accessToken: result.tokens.accessToken,
            refreshToken: result.tokens.refreshToken,
            expiresAt: result.tokens.expiresAt,
          },
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  };

  const updateUser = (data: any) => {
    dispatch({
      type: "UPDATE_USER",
      payload: {
        user: data,
      },
    });
  };

  const hasPermission = (
    permission: string | undefined
  ): boolean | undefined | "" => {
    if (!state.user) return false;
    if (state.user.role === "admin") return true;
    return permission && state.user.permissions?.includes(permission);
  };

  const hasRole = (roles: string[]): boolean => {
    if (!state.user?.role) return false;
    return state.user?.role && roles.includes(state?.user?.role);
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    logout,
    refreshTokens,
    updateUser,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
