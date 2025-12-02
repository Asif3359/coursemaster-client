import { apiCall } from "./client";

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin" | "instructor";
  };
}

export const authApi = {
  async register(data: RegisterData) {
    return apiCall<{ user: AuthResponse["user"] }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async login(data: LoginData) {
    return apiCall<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async logout() {
    return apiCall("/auth/logout", {
      method: "POST",
    });
  },
};

