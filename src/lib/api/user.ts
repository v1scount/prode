import { apiRequest } from './api'


// Type definitions
export interface User {
  id: number;
  email?: string
  name?: string
  googleId?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  name: string
  email: string
}

// User-related API functions
// POST verify user
export const verifyUser = async (googleCredential: string) => {
  return apiRequest<User>('/auth/google/verify', {
    method: 'POST',
    data: { credential: googleCredential },
  })
}

// POST create user
export const createUser = async (userData: CreateUserData) => {
  return apiRequest<User>('/users', {
    method: 'POST',
    data: userData,
  })
}
