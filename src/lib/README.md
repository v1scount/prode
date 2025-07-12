# React Query Setup

This directory contains the React Query (TanStack Query) configuration and utilities for making API calls.

## Files

- `queryClient.ts` - QueryClient configuration with default options
- `api.ts` - API service functions for making HTTP requests
- `hooks.ts` - Custom React Query hooks for data fetching and mutations

## Usage

### Basic Query Hook

```tsx
import { useUsers } from '../lib/hooks'

function MyComponent() {
  const { data: users, isLoading, error } = useUsers()
  
  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>
  
  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  )
}
```

### Mutation Hook

```tsx
import { useCreateUser } from '../lib/hooks'

function CreateUserForm() {
  const createUserMutation = useCreateUser()
  
  const handleSubmit = (userData) => {
    createUserMutation.mutate(userData, {
      onSuccess: () => {
        // Handle success
      },
      onError: (error) => {
        // Handle error
      }
    })
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={createUserMutation.isPending}>
        {createUserMutation.isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  )
}
```

### Available Hooks

- `useUsers()` - Fetch all users
- `useUser(id)` - Fetch a specific user by ID
- `useCreateUser()` - Create a new user
- `useUpdateUser()` - Update an existing user
- `useDeleteUser()` - Delete a user

### Environment Variables

Set the following environment variable to configure the API base URL:

```env
VITE_API_URL=http://localhost:3000/api
```

If not set, it defaults to `http://localhost:3000/api`.

### Query Client Configuration

The QueryClient is configured with the following defaults:

- **Stale Time**: 5 minutes (data is considered fresh for 5 minutes)
- **GC Time**: 10 minutes (cached data is kept for 10 minutes)
- **Retry**: 1 attempt for failed requests
- **Refetch on Window Focus**: Disabled

### DevTools

React Query DevTools are included in development mode. You can toggle them by clicking the floating button in the bottom-right corner of your app.

## Adding New API Endpoints

1. Add the API function to `api.ts`
2. Create a custom hook in `hooks.ts`
3. Use the hook in your components

Example:

```tsx
// In api.ts
export const api = {
  async getPosts() {
    return apiRequest<Post[]>('/posts')
  }
}

// In hooks.ts
export const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: api.getPosts,
  })
}

// In your component
const { data: posts } = usePosts()
``` 