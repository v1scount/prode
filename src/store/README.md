# Zustand Store Configuration

This project uses Zustand with Immer for state management. The store is organized into slices for better maintainability and scalability.

## Structure

```
src/store/
├── index.ts          # Main store configuration
├── slices/           # Individual store slices
│   └── userSlice.ts  # User authentication slice
└── README.md         # This documentation
```

## Current Slices

### User Slice (`userSlice.ts`)
Handles user authentication and user data management.

**State:**
- `user: User | null` - Current user data
- `isAuthenticated: boolean` - Authentication status
- `isLoading: boolean` - Loading state for async operations
- `error: string | null` - Error messages

**Actions:**
- `login(email, password)` - Authenticate user
- `logout()` - Clear user session
- `setUser(user)` - Set user data
- `clearError()` - Clear error state
- `setLoading(loading)` - Set loading state

## Usage

### Basic Usage
```tsx
import { useStore } from '../store'

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useStore()
  
  // Use the store state and actions
}
```

### Selective State Subscription
```tsx
import { useStore } from '../store'

function MyComponent() {
  // Only re-render when user changes
  const user = useStore(state => state.user)
  
  // Only re-render when authentication status changes
  const isAuthenticated = useStore(state => state.isAuthenticated)
}
```

## Adding New Slices

To add a new slice, follow this pattern:

1. Create a new slice file in `src/store/slices/`
2. Define the slice interface and implementation
3. Import and combine it in `src/store/index.ts`

### Example: Adding a Settings Slice

```tsx
// src/store/slices/settingsSlice.ts
import type { StateCreator } from 'zustand'

export interface SettingsSlice {
  theme: 'light' | 'dark'
  language: string
  
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: string) => void
}

export const settingsSlice: StateCreator<
  SettingsSlice,
  [['zustand/immer', never]],
  [],
  SettingsSlice
> = (set) => ({
  theme: 'light',
  language: 'en',
  
  setTheme: (theme) => {
    set((state) => {
      state.theme = theme
    })
  },
  
  setLanguage: (language) => {
    set((state) => {
      state.language = language
    })
  }
})
```

Then update `src/store/index.ts`:

```tsx
import { settingsSlice, SettingsSlice } from './slices/settingsSlice'

// Update the store type
export const useStore = create<UserSlice & SettingsSlice>()(
  immer((...a) => ({
    ...userSlice(...a),
    ...settingsSlice(...a),
  }))
)
```

## Best Practices

1. **Use Immer**: All state mutations should use Immer's `set` function for immutable updates
2. **Type Safety**: Always define interfaces for your slices
3. **Selective Subscriptions**: Use selective subscriptions to avoid unnecessary re-renders
4. **Async Actions**: Handle loading and error states in async actions
5. **Slice Organization**: Keep related state and actions together in slices

## Example Components

See `src/components/LoginForm.tsx` for a complete example of using the store with a React component. 