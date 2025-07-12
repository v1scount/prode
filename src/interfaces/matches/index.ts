export interface Root {
    round: number
    roundName: string
    totalGames: number
    gamesByDate: MatchesByDate[]
    externalIdPattern: string
    databaseStatus: string
  }

  export interface MatchesByDate {
    date: string
    matches: Game[]
  }
  
  export interface Game {
    id: string
    stage_round_name: string
    winner: number
    teams: Team[]
    url_name: string
    scores?: number[]
    status: Status
    start_time: string
    game_time: number
    game_time_to_display: string
    game_time_status_to_display: string
    pronostics: Pronostic[]
    totalPronostics: number
  }
  
  export interface Team {
    name: string
    short_name: string
    url_name: string
    id: string
    country_id: string
    allow_open: boolean
    colors: Colors
    red_cards: number
    goals?: Goal[]
  }
  
  export interface Colors {
    color: string
    text_color: string
  }
  
  export interface Goal {
    player_name: string
    player_sname: string
    time: number
    time_to_display: string
    goal_type?: string
  }
  
  export interface Status {
    enum: number
    name: string
    short_name: string
    symbol_name: string
  }
  
  export interface Pronostic {
    id: number
    externalId: string
    userId: number
    prediction: Prediction
    processed: boolean
    livePoints: number
    createdAt: string
    updatedAt: string
    user: User
  }
  
  export interface Prediction {
    scores: number[]
  }
  
  export interface User {
    id: number
    name: string
    email: string
  }