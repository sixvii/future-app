import React, { createContext, useContext, useState, useEffect } from "react";
import { apiRequest, tokenStorage } from "@/lib/api";

interface User {
  _id: string;
  phone: string;
  name?: string;
  gender?: string;
}

interface AuthContextType {
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
  login: (phone: string, password: string) => Promise<void>;
  signup: (name: string, phone: string, password: string, gender: string) => Promise<void>;
  updateProfile: (name: string, gender: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const clearSession = () => {
    setUser(null);
    setIsAuthenticated(false);
    tokenStorage.clear();
    localStorage.removeItem("user");
  };

  const refreshProfile = async () => {
    const profile = await apiRequest<{ _id: string; name: string; phone: string; gender?: string }>(
      "/api/auth/profile",
    );

    const userData: User = {
      _id: profile._id,
      name: profile.name,
      phone: profile.phone,
      gender: profile.gender,
    };

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  useEffect(() => {
    const restoreSession = async () => {
      const token = tokenStorage.get();
      const savedUser = localStorage.getItem("user");

      if (!token) {
        clearSession();
        setIsAuthLoading(false);
        return;
      }

      if (savedUser) {
        try {
          const parsed = JSON.parse(savedUser) as User;
          setUser(parsed);
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem("user");
        }
      }

      try {
        await refreshProfile();
      } catch (error) {
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        if (message.includes("not authorized") || message.includes("token")) {
          clearSession();
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (phone: string, password: string) => {
    const response = await apiRequest<{ _id: string; name: string; phone: string; gender: string; token: string }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ phone, password }),
      },
      false,
    );

    const userData: User = {
      _id: response._id,
      name: response.name,
      phone: response.phone,
      gender: response.gender,
    };

    tokenStorage.set(response.token);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const signup = async (name: string, phone: string, password: string, gender: string) => {
    const response = await apiRequest<{ _id: string; name: string; phone: string; gender: string; token: string }>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ name, phone, password, gender }),
      },
      false,
    );

    const userData: User = {
      _id: response._id,
      name: response.name,
      phone: response.phone,
      gender: response.gender,
    };

    tokenStorage.set(response.token);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const updateProfile = async (name: string, gender: string) => {
    const profile = await apiRequest<{ _id: string; name: string; phone: string; gender?: string }>(
      "/api/auth/profile",
      {
        method: "PUT",
        body: JSON.stringify({ name, gender }),
      },
    );

    const userData: User = {
      _id: profile._id,
      name: profile.name,
      phone: profile.phone,
      gender: profile.gender,
    };

    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    clearSession();
  };

  return (
    <AuthContext.Provider value={{ isAuthLoading, isAuthenticated, user, login, signup, updateProfile, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
