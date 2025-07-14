import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Minus,
  Trophy,
  UserIcon,
  LogOut,
  Save,
  Trash2,
} from "lucide-react";
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
import { getMatches } from "@/lib/api/matches/matches";
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

export default function HomePage() {
  const [loginDialog, setLoginDialog] = useState(false);
  const [savingPredictions, setSavingPredictions] = useState(false);

  // Use store state and methods instead of local state
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
    // Prediction-related store methods
    updatePredictionScore,
    getPredictionScore,
    hasPrediction,
    removePrediction,
    getPredictionsCount,
    getPredictionsForBackend,
    submitPrediction,
    getAllPredictionsForGame,
  } = useStore();

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      const authResponse = await api.verifyUser(
        credentialResponse.credential || ""
      );
      console.log("Auth response:", authResponse);

      // Transform the response to match your store's User interface
      const userForStore = {
        user: authResponse.user,
        accessToken: authResponse.access_token,
      };

      console.log("User for store:", userForStore);

      login(userForStore);
      setLoginDialog(false);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Update prediction score function - now uses store
  const handleUpdatePredictionScore = (
    gameId: string,
    team: "home" | "away",
    value: string
  ) => {
    // Convert input to number, default to 0 if invalid
    const score = value === "" ? 0 : Math.max(0, parseInt(value) || 0);
    updatePredictionScore(gameId, team, score);
  };

  // Save predictions to backend using store data
  const savePredictions = async (gameIds?: string[]) => {
    if (!isAuthenticated) {
      setLoginDialog(true);
      return;
    }

    setSavingPredictions(true);
    try {
      const predictionsToSend = getPredictionsForBackend(gameIds);

      if (predictionsToSend.length > 0) {
        console.log("Sending predictions:", predictionsToSend);
        await api.sendPredictions(predictionsToSend);
        console.log("Predictions saved successfully!");

        // Mark predictions as submitted in store
        predictionsToSend.forEach((pred) => {
          submitPrediction(pred.externalId);
        });
      }
    } catch (error) {
      console.error("Error saving predictions:", error);
    } finally {
      setSavingPredictions(false);
    }
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

  // Check if predictions should be disabled (less than 30 minutes to start)
  const isPredictionTimeExpired = (game: Game) => {
    if (game.status.enum !== 1) {
      // Match has already started or finished
      return true;
    }

    try {
      // Add debugging to see the raw values
      // Parse start_time format: "14-07-2025 19:15" (DD-MM-YYYY HH:mm)
      const [datePart, timePart] = game.start_time.split(" ");
      const [day, month, year] = datePart.split("-");

      // Create a proper ISO date string: "YYYY-MM-DDTHH:mm"
      const isoDateString = `${year}-${month}-${day}T${timePart}`;

      const startTime = new Date(isoDateString);
      const now = new Date();

      if (isNaN(startTime.getTime())) {
        console.log("Invalid date, disabling predictions");
        return true;
      }

      // Calculate the difference in milliseconds
      const timeDifference = startTime.getTime() - now.getTime();

      // Convert to minutes
      const minutesUntilStart = timeDifference / (1000 * 60);

      // Return true if less than 30 minutes until start
      return minutesUntilStart <= 10;
    } catch (error) {
      console.error("Error parsing start time:", error);
      // If we can't parse the time, err on the side of caution and disable predictions
      return true;
    }
  };

  // Get predictions count from store
  const predictionsCount = getPredictionsCount();

  useEffect(() => {
    let isMounted = true;

    const fetchMatches = async () => {
      try {
        const matches = await api.getMatches();
        if (isMounted) {
          console.log("Matches fetched:", matches);
          // setCurrentMatches now automatically processes predictions
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

  console.log("Current matches:", currentMatches);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 w-screen">
      <div className="max-w-4xl mx-auto">
        {/* Add custom CSS to hide number input arrows */}
        <style>{`
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
          {isAuthenticated && (
            <Badge variant="secondary" className="text-sm">
              {predictionsCount} predictions made
            </Badge>
          )}
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
                                {hasStarted ? game.scores?.[0] || 0 : "-"}
                              </span>
                            </div>
                            {/* Prediction input */}
                            {!isFinished &&
                              isAuthenticated &&
                              !isPredictionTimeExpired(game) && (
                                <div className="flex items-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={getPredictionScore(game.id, "home")}
                                    onChange={(e) =>
                                      handleUpdatePredictionScore(
                                        game.id,
                                        "home",
                                        e.target.value
                                      )
                                    }
                                    placeholder="-"
                                    className="w-12 h-8 text-center text-sm font-medium text-blue-600 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                  />
                                </div>
                              )}
                            {/* Show prediction for finished match - always show, dash if no prediction */}
                            {isPredictionTimeExpired(game) && isAuthenticated && (
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-blue-600 min-w-[20px] text-center">
                                  {hasGamePrediction
                                    ? getPredictionScore(game.id, "home")
                                    : "-"}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* VS and Remove Button */}
                          <div className="flex flex-col items-center mx-4">
                            <div
                              className={`text-gray-400 font-medium ${
                                !isFinished ? "mb-2" : ""
                              }`}
                            >
                              VS
                            </div>
                            {/* Only show trash button for unfinished matches with predictions and time not expired */}
                            {!isFinished &&
                              isAuthenticated &&
                              !isPredictionTimeExpired(game) && (
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
                                {hasStarted ? game.scores?.[1] || 0 : "-"}
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
                            {!isFinished &&
                              isAuthenticated &&
                              !isPredictionTimeExpired(game) && (
                                <div className="flex items-center">
                                  <input
                                    type="number"
                                    min="0"
                                    max="99"
                                    value={getPredictionScore(game.id, "away")}
                                    onChange={(e) =>
                                      handleUpdatePredictionScore(
                                        game.id,
                                        "away",
                                        e.target.value
                                      )
                                    }
                                    placeholder="-"
                                    className="w-12 h-8 text-center text-sm font-medium text-blue-600 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield]"
                                  />
                                </div>
                              )}
                            {/* Show prediction for finished match - always show, dash if no prediction */}
                            {isPredictionTimeExpired(game) && isAuthenticated && (
                              <div className="flex items-center">
                                <span className="text-sm font-medium text-blue-600 min-w-[20px] text-center">
                                  {hasGamePrediction
                                    ? getPredictionScore(game.id, "away")
                                    : "-"}
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
        {predictionsCount > 0 && isAuthenticated && (
          <div className="flex justify-center mt-8 mb-8">
            <Button
              onClick={saveAllPredictions}
              disabled={savingPredictions || !isAuthenticated}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-3 text-lg font-semibold"
            >
              <Save className="h-5 w-5 mr-2" />
              {savingPredictions
                ? "Saving Predictions..."
                : `Save ${predictionsCount} Predictions`}
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
