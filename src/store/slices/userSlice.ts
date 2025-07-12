import type { StateCreator } from "zustand";

// User state interface
export interface User {
  user: {
    id: number;
    email?: string;
    name?: string;
    googleId?: string;
    avatar?: string;
  };
  accessToken?: string;
}

// User slice state interface
export interface UserSlice {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  
  login: (user: User) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// User slice implementation
export const userSlice: StateCreator<
  UserSlice,
  [["zustand/immer", never]],
  [],
  UserSlice
> = (set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (user: User) => {
    set((state) => {
      state.isLoading = true;
      state.error = null;
    });

    try {
      set((state) => {
        state.user = user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      });
    } catch (error) {
      set((state) => {
        state.isLoading = false;
        state.error = error instanceof Error ? error.message : "Login failed";
      });
    }
  },

  logout: () => {
    set((state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },

  setUser: (user: User) => {
    set((state) => {
      state.user = user;
      state.isAuthenticated = true;
    });
  },

  clearError: () => {
    set((state) => {
      state.error = null;
    });
  },

  setLoading: (loading: boolean) => {
    set((state) => {
      state.isLoading = loading;
    });
  },
});
