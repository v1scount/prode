import type { StateCreator } from "zustand";
import type { Root, Game, Pronostic, MatchesByDate } from "@/interfaces/matches";
import type { AppStore } from "../types";

// User prediction interface
export interface UserPrediction {
  gameId: string;
  prediction: {
    scores: number[];
  };
  submitted: boolean;
  submittedAt?: string;
}

// Match day slice state interface
export interface MatchDaySlice {
  currentMatches: MatchesByDate[] | null;
  userPredictions: UserPrediction[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Actions
  savePrediction: (gameId: string, scores: number[]) => void;
  submitPrediction: (gameId: string) => void;
  clearPredictions: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentMatches: (matches: MatchesByDate[] | null) => void;
  setError: (error: string | null) => void;
  
  // Getters
  getPredictionForGame: (gameId: string) => UserPrediction | undefined;
  // getGameById: (gameId: string) => Game | undefined;
  hasSubmittedPrediction: (gameId: string) => boolean;
}

// Match day slice implementation
export const matchDaySlice: StateCreator<
  AppStore,
  [["zustand/immer", never]],
  [],
  MatchDaySlice
> = (set, get, api) => ({
  currentMatches: null,
  userPredictions: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  savePrediction: (gameId: string, scores: number[]) => {
    set((state) => {
      const existingPredictionIndex = state.userPredictions.findIndex(
        (p) => p.gameId === gameId
      );

      const newPrediction: UserPrediction = {
        gameId,
        prediction: { scores },
        submitted: false,
      };

      if (existingPredictionIndex >= 0) {
        // Update existing prediction only if not submitted
        if (!state.userPredictions[existingPredictionIndex].submitted) {
          state.userPredictions[existingPredictionIndex] = newPrediction;
        }
      } else {
        // Add new prediction
        state.userPredictions.push(newPrediction);
      }
    });
  },

  submitPrediction: (gameId: string) => {
    set((state) => {
      const predictionIndex = state.userPredictions.findIndex(
        (p) => p.gameId === gameId
      );

      if (predictionIndex >= 0) {
        state.userPredictions[predictionIndex].submitted = true;
        state.userPredictions[predictionIndex].submittedAt = new Date().toISOString();
      }
    });
  },

  clearPredictions: () => {
    set((state) => {
      state.userPredictions = [];
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

  setCurrentMatches: (matches: MatchesByDate[] | null) => {
    set((state) => {
      state.currentMatches = matches;
      state.lastUpdated = new Date().toISOString();
    });
  },

  setError: (error: string | null) => {
    set((state) => {
      state.error = error;
    });
  },

  // Getters
  getPredictionForGame: (gameId: string) => {
    const state = get();
    return state.userPredictions.find((p) => p.gameId === gameId);
  },

  // getGameById: (gameId: string) => {
  //   const state = get();
  //   return state.currentMatches?.gamesByDate.find((game) => game.id === gameId);
  // },

  hasSubmittedPrediction: (gameId: string) => {
    const state = get();
    const prediction = state.userPredictions.find((p) => p.gameId === gameId);
    return prediction?.submitted || false;
  },
}); 