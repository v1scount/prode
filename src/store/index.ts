import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { userSlice } from './slices/userSlice'
import { matchDaySlice } from './slices/matchDaySlice'
import type { UserSlice } from './slices/userSlice'
import type { MatchDaySlice } from './slices/matchDaySlice'

// Combined store interface
export interface AppStore extends UserSlice, MatchDaySlice {}

// Combine all slices into a single store with persistence
export const useStore = create<AppStore>()(
  persist(
    immer((set, get, api) => ({
      ...userSlice(set, get, api),
      ...matchDaySlice(set, get, api),
    })),
    {
      name: 'prode-store', // unique name for localStorage key
      // Only persist user data, auth state, and user predictions
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        userPredictions: state.userPredictions,
      }),
    }
  )
)

// Export types for better TypeScript support
export type Store = ReturnType<typeof useStore> 