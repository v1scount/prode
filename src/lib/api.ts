import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { useStore } from '../store'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to automatically add auth token
apiClient.interceptors.request.use(
  (config) => {
    const state = useStore.getState()
    if (state.user?.accessToken) {
      config.headers.Authorization = `Bearer ${state.user.accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      // Token is invalid or expired, logout the user
      useStore.getState().logout()
    }
    return Promise.reject(error)
  }
)

// Generic axios wrapper with error handling
async function apiRequest<T>(
  endpoint: string,
  options: AxiosRequestConfig = {}
): Promise<T> {
  try {
    const response: AxiosResponse<T> = await apiClient({
      url: endpoint,
      ...options,
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`API Error: ${error.response?.status} ${error.response?.statusText}`)
    }
    throw error
  }
}

// Example API functions
export const api = {
  // POST verify user
  async verifyUser(googleCredential: string) {
    return apiRequest<User>('/auth/google/verify', {
      method: 'POST',
      data: { credential: googleCredential },
    })
  },

  // POST create user
}

// Type definitions (you can move these to a separate types file)
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
