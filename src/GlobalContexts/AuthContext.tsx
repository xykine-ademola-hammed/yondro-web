import { useMutation } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMutationMethod } from "../common/api-methods";
import type { Organization } from "../common/types";

export interface Department {
  id: string;
  name: string;
}

export interface Position {
  id: string;
  title: string;
  departmentId: string;
  isMultiple: boolean;
}

export type UserRole = "Admin" | "Manager" | "Employee";

export interface User {
  role: UserRole;
  id: string;
  firstName: string;
  lastName: string;
  organization?: Organization;
  department?: Department;
  position?: Position;
  institution?: Institution;
}

export interface Institution {
  id?: string;
  name: string;
  code: string;
}

interface AuthContextType {
  user: User | null;
  token: string;
  logout: () => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setToken: React.Dispatch<React.SetStateAction<string>>;
  isRole: (role: UserRole) => boolean;
  login: (email: string, password: string) => void;
  loading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Initialize token state
  const [token, setToken] = useState<string>(
    () => localStorage.getItem("token") || ""
  );

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken("");
    navigate("/");
  };

  const { mutateAsync: loginMutation } = useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      getMutationMethod("POST", `api/auth/login`, body, false),
    onSuccess: (data) => {
      setUser(data.data.user);
      setToken(data?.data.token);

      localStorage.setItem("user", JSON.stringify(data.data?.user));
      localStorage.setItem("token", data.data?.token);
      if ((data.data.user.role = "Super_Admin")) {
        navigate("/super-admin");
      } else {
        navigate("/dashboard");
      }
    },
    onError: async (error) => {
      console.log(error?.message);
    },
  });

  const login = async (email: string, password: string) => {
    try {
      await loginMutation({ email, password });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const isRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        logout,
        setUser,
        token,
        setToken,
        isRole,
        login,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }
  return context;
};
