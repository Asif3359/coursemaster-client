"use client";

import { createSlice, configureStore } from "@reduxjs/toolkit";

// Initialize with null to avoid hydration mismatch
// We'll hydrate from localStorage after mount
const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null as any,
    token: null as string | null,
  },
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      if (typeof window !== "undefined") {
        localStorage.setItem("token", action.payload.token);
        localStorage.setItem("user", JSON.stringify(action.payload.user));
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    },
    hydrate: (state) => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");
        if (token && userStr) {
          try {
            state.token = token;
            state.user = JSON.parse(userStr);
          } catch (e) {
            // Invalid JSON, clear it
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        }
      }
    },
  },
});

export const { setAuth, clearAuth, hydrate } = authSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

