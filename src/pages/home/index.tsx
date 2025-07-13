import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trophy, UserIcon, LogOut, Save, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useStore } from "@/store";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { api, type PredictionData, type AuthResponse } from "@/lib/api/api";
import type { User as UserType } from "@/store/slices/userSlice";
import { getMatches, getMyPronostics } from "@/lib/api/matches/matches";
import type { Game } from "@/interfaces/matches";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  homeScore: number;
  awayScore: number;
  saved: boolean;
}

const initialMatches: Match[] = [
  {
    id: "1",
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    date: "2025-01-12",
    time: "15:00",
    homeScore: 0,
    awayScore: 0,
    saved: false,
  },
  {
    id: "2",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    date: "2025-01-12",
    time: "17:30",
    homeScore: 0,
    awayScore: 0,
    saved: false,
  },
  {
    id: "3",
    homeTeam: "Barcelona",
    awayTeam: "Real Madrid",
    date: "2025-01-13",
    time: "20:00",
    homeScore: 0,
    awayScore: 0,
    saved: false,
  },
  {
    id: "4",
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    date: "2025-01-13",
    time: "18:30",
    homeScore: 0,
    awayScore: 0,
    saved: false,
  },
  {
    id: "5",
    homeTeam: "PSG",
    awayTeam: "Marseille",
    date: "2025-01-14",
    time: "21:00",
    homeScore: 0,
    awayScore: 0,
    saved: false,
  },
  {
    id: "6",
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    date: "2025-01-14",
    time: "19:45",
    homeScore: 0,
    awayScore: 0,
    saved: false,
  },
];

export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [loginDialog, setLoginDialog] = useState(false);
  // Update predictions state to use "prediction" key
  const [predictions, setPredictions] = useState<Array<{
    externalId: string;
    prediction: { scores: number[] };
  }>>([]);
  const [savingPredictions, setSavingPredictions] = useState(false);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  
  // Use store state instead of local state
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError,
    setCurrentMatches,
    currentMatches,
  } = useStore();

  // Add function to fetch user's predictions
  const fetchUserPredictions = async () => {
    if (!isAuthenticated) return;
    
    setLoadingPredictions(true);
    try {
      const userPredictions = await getMyPronostics();
      console.log("Fetched user predictions:", userPredictions);
      
      // Transform the backend response to match our state format
      if (userPredictions && Array.isArray(userPredictions)) {
        const transformedPredictions = userPredictions.map((prediction: any) => ({
          externalId: prediction.externalId,
          prediction: {
            scores: prediction.prediction?.scores || [0, 0]
          }
        }));
        setPredictions(transformedPredictions);
      }
    } catch (error) {
      console.error("Error fetching user predictions:", error);
    } finally {
      setLoadingPredictions(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      const authResponse = await api.verifyUser(credentialResponse.credential || "");
      console.log("Auth response:", authResponse);
      
      // Transform the response to match your store's User interface
      const userForStore = {
        user: authResponse.user,
        accessToken: authResponse.access_token
      };
      
      console.log("User for store:", userForStore);
      
      login(userForStore);
      setLoginDialog(false);
      
      // Fetch user's predictions after successful login
      setTimeout(() => {
        fetchUserPredictions();
      }, 100);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Update prediction score function to handle direct input
  const updatePredictionScore = (
    gameId: string,
    team: "home" | "away",
    value: string
  ) => {
    // Convert input to number, default to 0 if invalid
    const score = value === "" ? 0 : Math.max(0, parseInt(value) || 0);
    
    setPredictions((prev) => {
      // Find existing prediction or create new one
      const existingIndex = prev.findIndex(p => p.externalId === gameId);
      
      if (existingIndex !== -1) {
        // Update existing prediction
        const updated = [...prev];
        const existingPrediction = updated[existingIndex];
        
        // Ensure prediction structure exists
        const currentScores = existingPrediction.prediction?.scores || [0, 0];
        const newScores = [...currentScores];
        
        if (team === "home") {
          newScores[0] = score;
        } else {
          newScores[1] = score;
        }
        
        updated[existingIndex] = {
          externalId: gameId,
          prediction: { scores: newScores }
        };
        
        return updated;
      } else {
        // Create new prediction
        const newScores = [0, 0];
        if (team === "home") {
          newScores[0] = score;
        } else {
          newScores[1] = score;
        }
        
        return [
          ...prev,
          {
            externalId: gameId,
            prediction: { scores: newScores }
          }
        ];
      }
    });
  };

  // Get prediction score for display
  const getPredictionScore = (gameId: string, team: "home" | "away") => {
    const prediction = predictions.find(p => p.externalId === gameId);
    if (!prediction) return "";
    
    const score = team === "home" ? prediction.prediction.scores[0] : prediction.prediction.scores[1];
    return score.toString();
  };

  // Save predictions to backend
  const savePredictions = async (gameIds?: string[]) => {
    if (!isAuthenticated) {
      setLoginDialog(true);
      return;
    }

    console.log("About to save predictions");
    console.log("Current user state:", user);
    console.log("Is authenticated:", isAuthenticated);
    console.log("Access token:", user?.accessToken);

    setSavingPredictions(true);
    try {
      let predictionsToSend = predictions;
      
      // If specific gameIds provided, filter predictions
      if (gameIds) {
        predictionsToSend = predictions.filter(p => gameIds.includes(p.externalId));
      }

      if (predictionsToSend.length > 0) {
        console.log("Sending predictions:", predictionsToSend);
        // Now the format is already correct for the API
        await api.sendPredictions(predictionsToSend);
        console.log("Predictions saved successfully!");
      }
    } catch (error) {
      console.error("Error saving predictions:", error);
    } finally {
      setSavingPredictions(false);
    }
  };

  // Save individual prediction
  const saveSinglePrediction = async (gameId: string) => {
    await savePredictions([gameId]);
  };

  // Save all predictions
  const saveAllPredictions = async () => {
    await savePredictions();
  };

  const formatDate = (dateString: string) => {
    // Parse date components to avoid timezone issues
    const dateOnly = dateString.split("T")[0];
    const [year, month, day] = dateOnly.split("-").map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    // Capitalize first letter of the day
    const formattedDate = date.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const capitalizedDay =
      formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
    return capitalizedDay;
  };

  const matchStatus = (match: Game) => {
    if (match.status.enum === 1) {
      return match.start_time.split(" ")[1];
    } else if (match.status.enum === 2) {
      return match.game_time_to_display;
    } else return match.game_time_status_to_display;
  };

  // Get prediction for a game
  const getPrediction = (gameId: string) => {
    const prediction = predictions.find(p => p.externalId === gameId);
    return prediction?.prediction || { scores: [0, 0] };
  };

  // Check if game has prediction
  const hasPrediction = (gameId: string) => {
    return predictions.some(p => p.externalId === gameId);
  };

  // Count predictions
  const predictionsCount = predictions.length;

  // Remove prediction function
  const removePrediction = (gameId: string) => {
    setPredictions((prev) => prev.filter(p => p.externalId !== gameId));
  };

  useEffect(() => {
    let isMounted = true;

    const fetchMatches = async () => {
      try {
        const matches = await api.getMatches();
        if (isMounted) {
          setCurrentMatches(matches.gamesByDate);
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching matches:", error);
        }
      }
    };

    fetchMatches();

    return () => {
      isMounted = false;
    };
  }, [setCurrentMatches]);

  // Add useEffect to fetch predictions when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserPredictions();
    }
  }, [isAuthenticated, user]);

  console.log(predictions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 w-screen">
      <div className="max-w-4xl mx-auto">
        {/* Add custom CSS to hide number input arrows */}
        <style jsx>{`
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}</style>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Football Predictions
            </h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">
            Compete with friends by predicting match results!
          </p>
          <Badge variant="secondary" className="text-sm">
            {predictionsCount} predictions made
          </Badge>
        </div>

        <div className="absolute top-4 right-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user.user.avatar} />
                <AvatarFallback>{user.user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">
                {user.user.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Dialog open={loginDialog} onOpenChange={setLoginDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                >
                  <UserIcon className="h-4 w-4" />
                  Iniciar sesión
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Iniciar sesión</DialogTitle>
                  <DialogDescription>
                    Inicia sesión con Google para guardar tus predicciones y
                    competir con tus amigos.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={(credentialResponse) => {
                        handleGoogleLogin(credentialResponse);
                      }}
                      onError={() => {
                        console.log("Google login failed");
                      }}
                    />
                  </div>
                  {error && (
                    <div className="text-red-600 text-sm text-center">
                      {error}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Matches by Date */}
        <div className="space-y-8">
          {currentMatches?.map((match) => (
            <Card key={match.date} className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg justify-center items-center">
                <CardTitle className="text-xl font-semibold items-end">
                  {formatDate(match.date)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {match.matches.map((game) => {
                    const isFinished = game.status.enum === 3;
                    const hasGamePrediction = hasPrediction(game.id);
                    const hasStarted = game.status.enum !== 1;
                    
                    return (
                      <div key={game.id}>
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          {/* Match Time */}
                          <div className="text-sm font-medium text-gray-500 min-w-[60px]">
                            {matchStatus(game)}
                          </div>

                          {/* Home Team */}
                          <div className="flex flex-col items-end gap-2 flex-1">
                            {/* Team name, logo and real score */}
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-gray-900">
                                {game.teams[0].name}
                              </span>
                              <img
                                src={`https://api.promiedos.com.ar/images/team/${game.teams[0].id}/1`}
                                alt={game.teams[0].name}
                                className="w-6 h-6"
                              />
                              <span className="text-lg font-bold text-green-600">
                                {hasStarted ? (game.scores?.[0] || 0) : "-"}
                              </span>
                            </div>
                            {/* Prediction input */}
                            {!isFinished && (
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="99"
                                  value={getPredictionScore(game.id, "home")}
                                  onChange={(e) => updatePredictionScore(game.id, "home", e.target.value)}
                                  placeholder="-"
                                  className="w-12 h-8 text-center text-sm font-medium text-blue-600 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                />
                              </div>
                            )}
                            {/* Show prediction for finished match - always show, dash if no prediction */}
                            {isFinished && (
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-blue-600 min-w-[20px] text-center">
                                  {hasGamePrediction ? getPredictionScore(game.id, "home") : "-"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* VS and Remove Button */}
                          <div className="flex flex-col items-center mx-4">
                            <div className={`text-gray-400 font-medium ${!isFinished ? 'mb-2' : ''}`}>VS</div>
                            {/* Only show trash button for unfinished matches with predictions */}
                            {!isFinished && (
                              <div className="flex items-center justify-center h-8">
                                {hasGamePrediction && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removePrediction(game.id)}
                                    className="h-8 w-8 p-0 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 hover:text-red-600"
                                    title="Remove prediction"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Away Team */}
                          <div className="flex flex-col items-start gap-2 flex-1">
                            {/* Team name, logo and real score */}
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold text-green-600">
                                {hasStarted ? (game.scores?.[1] || 0) : "-"}
                              </span>
                              <img
                                src={`https://api.promiedos.com.ar/images/team/${game.teams[1].id}/1`}
                                alt={game.teams[1].name}
                                className="w-6 h-6"
                              />
                              <span className="font-semibold text-gray-900">
                                {game.teams[1].name}
                              </span>
                            </div>
                            {/* Prediction input */}
                            {!isFinished && (
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="99"
                                  value={getPredictionScore(game.id, "away")}
                                  onChange={(e) => updatePredictionScore(game.id, "away", e.target.value)}
                                  placeholder="-"
                                  className="w-12 h-8 text-center text-sm font-medium text-blue-600 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                />
                              </div>
                            )}
                            {/* Show prediction for finished match - always show, dash if no prediction */}
                            {isFinished && (
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-blue-600 min-w-[20px] text-center">
                                  {hasGamePrediction ? getPredictionScore(game.id, "away") : "-"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save All Predictions Button - moved to bottom */}
        {predictionsCount > 0 && (
          <div className="flex justify-center mt-8 mb-8">
            <Button
              onClick={saveAllPredictions}
              disabled={savingPredictions || !isAuthenticated}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg font-semibold"
            >
              <Save className="h-5 w-5 mr-2" />
              {savingPredictions ? "Saving Predictions..." : `Save ${predictionsCount} Predictions`}
            </Button>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Good luck with your predictions! 🏆</p>
        </div>
      </div>
    </div>
  );
}
