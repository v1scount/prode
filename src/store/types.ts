import type { UserSlice } from './slices/userSlice'
import type { MatchDaySlice } from './slices/matchDaySlice'
import type { LeaderboardSlice } from './slices/leaderboardSlice'

export interface AppStore extends UserSlice, MatchDaySlice, LeaderboardSlice {} 