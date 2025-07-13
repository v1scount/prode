import axios from 'axios'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
import { useStore } from '../../store'
import { createUser, verifyUser } from './user'
import { getMatches, sendPredictions, getMyPronostics } from './matches/matches'

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
    console.log("Request interceptor - Full state:", state);
    console.log("Request interceptor - User:", state.user);
    console.log("Request interceptor - Access token:", state.user?.accessToken);
    
    if (state.user?.accessToken) {
      config.headers.Authorization = `Bearer ${state.user.accessToken}`
      console.log("Authorization header added:", config.headers.Authorization);
    } else {
      console.log("No access token found, skipping auth header");
    }
    
    console.log("Final request config:", config);
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
export async function apiRequest<T>(
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

// Main API object with all endpoints
export const api = {
  // User-related endpoints
  verifyUser,
  createUser,

  // Matches-related endpoints
  getMatches,
  sendPredictions,
  getMyPronostics,

  // Other API endpoints can be added here
}

// Re-export types for convenience
export type { UserData, CreateUserData, AuthResponse } from './user'
export type { PredictionData } from './matches/matches'
