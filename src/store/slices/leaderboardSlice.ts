import type { StateCreator } from "zustand";
import type { AppStore } from "../types";

// Type for a leaderboard participant
export interface LeaderboardParticipant {
  user: {
    id: number;
    name: string;
    email?: string;
    avatar?: string;
  };
  globalPoints: number;
}

// Slice state and actions
export interface LeaderboardSlice {
  leaderboard: LeaderboardParticipant[] | null; // null = loading, [] = loaded but empty
  isLeaderboardLoading: boolean;
  leaderboardError: string | null;

  setLeaderboard: (data: LeaderboardParticipant[]) => void;
  setLeaderboardLoading: (loading: boolean) => void;
  setLeaderboardError: (error: string | null) => void;
}

// Implementation
export const leaderboardSlice: StateCreator<
  AppStore,
  [["zustand/immer", never]],
  [],
  LeaderboardSlice
> = (set) => ({
  leaderboard: [], // null means "loading", [] means "no data"
  isLeaderboardLoading: false,
  leaderboardError: null,

  setLeaderboard: (data) => set((state) => { state.leaderboard = data; }),
  setLeaderboardLoading: (loading) => set((state) => { state.isLeaderboardLoading = loading; }),
  setLeaderboardError: (error) => set((state) => { state.leaderboardError = error; }),
}); 