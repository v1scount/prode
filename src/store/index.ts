import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { userSlice } from './slices/userSlice'
import type { UserSlice } from './slices/userSlice'

// Combine all slices into a single store with persistence
export const useStore = create<UserSlice>()(
  persist(
    immer((...a) => ({
      ...userSlice(...a),
      // Add more slices here as needed
      // ...authSlice(...a),
      // ...settingsSlice(...a),
    })),
    {
      name: 'prode-store', // unique name for localStorage key
      // Only persist user data and auth state, not loading states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Export types for better TypeScript support
export type Store = ReturnType<typeof useStore> 