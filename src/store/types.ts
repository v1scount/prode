import type { UserSlice } from './slices/userSlice'
import type { MatchDaySlice } from './slices/matchDaySlice'

export interface AppStore extends UserSlice, MatchDaySlice {} 