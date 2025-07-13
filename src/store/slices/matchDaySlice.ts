import type { StateCreator } from "zustand";
import type { Root, Game, Pronostic, MatchesByDate } from "@/interfaces/matches";
import type { AppStore } from "../types";

// User prediction interface - using externalId to match backend format
export interface UserPrediction {
  externalId: string;
  prediction: {
    scores: number[];
  };
  submitted: boolean;
  submittedAt?: string;
}

// Backend format for predictions
export interface BackendPrediction {
  externalId: string;
  prediction: {
    scores: number[];
  };
}

// Match day slice state interface
export interface MatchDaySlice {
  currentMatches: MatchesByDate[] | null;
  userPredictions: UserPrediction[];
  allPredictions: Pronostic[]; // Store all predictions from all users
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;

  // Actions
  savePrediction: (externalId: string, scores: number[]) => void;
  updatePredictionScore: (externalId: string, team: "home" | "away", score: number) => void;
  submitPrediction: (externalId: string) => void;
  removePrediction: (externalId: string) => void;
  clearPredictions: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentMatches: (matches: MatchesByDate[] | null) => void;
  setError: (error: string | null) => void;
  processMatchesWithPredictions: (matches: MatchesByDate[]) => void;
  
  // Getters
  getPredictionForGame: (externalId: string) => UserPrediction | undefined;
  getPredictionScore: (externalId: string, team: "home" | "away") => string;
  hasPrediction: (externalId: string) => boolean;
  hasSubmittedPrediction: (externalId: string) => boolean;
  getPredictionsCount: () => number;
  getUnsubmittedPredictions: () => UserPrediction[];
  getPredictionsForBackend: (externalIds?: string[]) => BackendPrediction[];
  getAllPredictionsForGame: (externalId: string) => Pronostic[];
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
  allPredictions: [],
  isLoading: false,
  error: null,
  lastUpdated: null,

  savePrediction: (externalId: string, scores: number[]) => {
    set((state) => {
      const existingPredictionIndex = state.userPredictions.findIndex(
        (p) => p.externalId === externalId
      );

      const newPrediction: UserPrediction = {
        externalId,
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

  updatePredictionScore: (externalId: string, team: "home" | "away", score: number) => {
    set((state) => {
      const existingPredictionIndex = state.userPredictions.findIndex(
        (p) => p.externalId === externalId
      );

      const teamIndex = team === "home" ? 0 : 1;
      const normalizedScore = Math.max(0, score || 0);

      if (existingPredictionIndex >= 0) {
        // Update existing prediction only if not submitted
        if (!state.userPredictions[existingPredictionIndex].submitted) {
          const currentScores = state.userPredictions[existingPredictionIndex].prediction.scores;
          const newScores = [...currentScores];
          newScores[teamIndex] = normalizedScore;
          state.userPredictions[existingPredictionIndex].prediction.scores = newScores;
        }
      } else {
        // Create new prediction
        const newScores = [0, 0];
        newScores[teamIndex] = normalizedScore;
        state.userPredictions.push({
          externalId,
          prediction: { scores: newScores },
          submitted: false,
        });
      }
    });
  },

  submitPrediction: (externalId: string) => {
    set((state) => {
      const predictionIndex = state.userPredictions.findIndex(
        (p) => p.externalId === externalId
      );

      if (predictionIndex >= 0) {
        state.userPredictions[predictionIndex].submitted = true;
        state.userPredictions[predictionIndex].submittedAt = new Date().toISOString();
      }
    });
  },

  removePrediction: (externalId: string) => {
    set((state) => {
      state.userPredictions = state.userPredictions.filter(
        (p) => p.externalId !== externalId || p.submitted
      );
    });
  },

  clearPredictions: () => {
    set((state) => {
      state.userPredictions = [];
      state.allPredictions = [];
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
    
    // Process predictions if matches are provided
    if (matches) {
      get().processMatchesWithPredictions(matches);
    }
  },

  setError: (error: string | null) => {
    set((state) => {
      state.error = error;
    });
  },

  processMatchesWithPredictions: (matches: MatchesByDate[]) => {
    set((state) => {
      // Extract all predictions from all games
      const allPredictions: Pronostic[] = [];
      
      matches.forEach(matchDay => {
        matchDay.matches.forEach(game => {
          allPredictions.push(...game.pronostics);
        });
      });
      
      // Store all predictions
      state.allPredictions = allPredictions;
      
      // Get current user ID from the store
      const currentUserId = (api as any).getState().user?.user?.id;
      
      if (currentUserId) {
        // Filter predictions for the current user and convert to UserPrediction format
        const currentUserPredictions: UserPrediction[] = allPredictions
          .filter(prediction => prediction.userId === currentUserId)
          .map(prediction => ({
            externalId: prediction.externalId,
            prediction: prediction.prediction,
            submitted: true, // All predictions from backend are already submitted
            submittedAt: prediction.updatedAt,
          }));
        
        // Merge with existing non-submitted predictions
        const existingNonSubmitted = state.userPredictions.filter(p => !p.submitted);
        
        // Create a map of submitted predictions for easy lookup
        const submittedPredictionsMap = new Map(
          currentUserPredictions.map(p => [p.externalId, p])
        );
        
        // Filter out non-submitted predictions that now have submitted versions
        const filteredNonSubmitted = existingNonSubmitted.filter(
          p => !submittedPredictionsMap.has(p.externalId)
        );
        
        // Combine submitted and non-submitted predictions
        state.userPredictions = [...currentUserPredictions, ...filteredNonSubmitted];
      }
    });
  },

  // Getters
  getPredictionForGame: (externalId: string) => {
    const state = get();
    return state.userPredictions.find((p) => p.externalId === externalId);
  },

  getPredictionScore: (externalId: string, team: "home" | "away") => {
    const state = get();
    const prediction = state.userPredictions.find((p) => p.externalId === externalId);
    if (!prediction) return "";
    
    const score = team === "home" ? prediction.prediction.scores[0] : prediction.prediction.scores[1];
    return score.toString();
  },

  hasPrediction: (externalId: string) => {
    const state = get();
    return state.userPredictions.some((p) => p.externalId === externalId);
  },

  hasSubmittedPrediction: (externalId: string) => {
    const state = get();
    const prediction = state.userPredictions.find((p) => p.externalId === externalId);
    return prediction?.submitted || false;
  },

  getPredictionsCount: () => {
    const state = get();
    return state.userPredictions.filter(p => !p.submitted).length;
  },

  getUnsubmittedPredictions: () => {
    const state = get();
    return state.userPredictions.filter(p => !p.submitted);
  },

  getPredictionsForBackend: (externalIds?: string[]) => {
    const state = get();
    let predictionsToReturn = state.userPredictions.filter(p => !p.submitted);
    
    // Filter by specific externalIds if provided
    if (externalIds) {
      predictionsToReturn = predictionsToReturn.filter(p => 
        externalIds.includes(p.externalId)
      );
    }
    
    // Convert to backend format
    return predictionsToReturn.map((prediction) => ({
      externalId: prediction.externalId,
      prediction: prediction.prediction,
    }));
  },

  getAllPredictionsForGame: (externalId: string) => {
    const state = get();
    return state.allPredictions.filter(p => p.externalId === externalId);
  },
}); 