import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { userSlice } from './slices/userSlice'
import type { UserSlice } from './slices/userSlice'

// Combine all slices into a single store
export const useStore = create<UserSlice>()(
  immer((...a) => ({
    ...userSlice(...a),
    // Add more slices here as needed
    // ...authSlice(...a),
    // ...settingsSlice(...a),
  }))
)

// Export types for better TypeScript support
export type Store = ReturnType<typeof useStore> 