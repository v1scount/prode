import { apiRequest } from './api'


// Type definitions for what backend actually returns
export interface UserData {
  id: number;
  email?: string
  name?: string
  googleId?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

// What the backend returns from /auth/google/verify
export interface AuthResponse {
  user: UserData;
  access_token: string;
}

export interface CreateUserData {
  name: string
  email: string
}

// User-related API functions
// POST verify user - should return both user and token
export const verifyUser = async (googleCredential: string) => {
  return apiRequest<AuthResponse>('/auth/google/verify', {
    method: 'POST',
    data: { credential: googleCredential },
  })
}

// POST create user
export const createUser = async (userData: CreateUserData) => {
  return apiRequest<UserData>('/users', {
    method: 'POST',
    data: userData,
  })
}
