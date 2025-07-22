import { useState, useEffect } from "react";
import { useStore } from "@/store";
import { type CredentialResponse } from "@react-oauth/google";
import { api } from "@/lib/api/api";
import type { Game } from "@/interfaces/matches";
import {
  AppHeader,
  MatchesByDate,
  SavePredictionsButton,
} from "@/components/matches";
import { UserAuthSection } from "@/components/auth";

export default function HomePage() {
  const [savingPredictions, setSavingPredictions] = useState(false);

  // Use store state and methods
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
  } = useStore();

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    try {
      const authResponse = await api.verifyUser(
        credentialResponse.credential || ""
      );
      console.log("Auth response:", authResponse);

      const userForStore = {
        user: authResponse.user,
        accessToken: authResponse.access_token,
      };

      console.log("User for store:", userForStore);
      login(userForStore);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  // Update prediction score function
  const handleUpdatePredictionScore = (
    gameId: string,
    team: "home" | "away",
    value: string
  ) => {
    const score = value === "" ? 0 : Math.max(0, parseInt(value) || 0);
    updatePredictionScore(gameId, team, score);
  };

  // Save predictions to backend
  const savePredictions = async (gameIds?: string[]) => {
    if (!isAuthenticated) {
      return;
    }

    setSavingPredictions(true);
    try {
      const predictionsToSend = getPredictionsForBackend(gameIds);

      if (predictionsToSend.length > 0) {
        console.log("Sending predictions:", predictionsToSend);
        await api.sendPredictions(predictionsToSend);
        console.log("Predictions saved successfully!");

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

  const saveAllPredictions = async () => {
    await savePredictions();
  };

  const formatDate = (dateString: string) => {
    const dateOnly = dateString.split("T")[0];
    const [year, month, day] = dateOnly.split("-").map(Number);
    const date = new Date(year, month - 1, day);
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

  const isPredictionTimeExpired = (game: Game) => {
    if (game.status.enum !== 1) {
      return true;
    }

    try {
      const [datePart, timePart] = game.start_time.split(" ");
      const [day, month, year] = datePart.split("-");
      const isoDateString = `${year}-${month}-${day}T${timePart}`;
      const startTime = new Date(isoDateString);
      const now = new Date();

      if (isNaN(startTime.getTime())) {
        console.log("Invalid date, disabling predictions");
        return true;
      }

      const timeDifference = startTime.getTime() - now.getTime();
      const minutesUntilStart = timeDifference / (1000 * 60);
      return minutesUntilStart <= 10;
    } catch (error) {
      console.error("Error parsing start time:", error);
      return true;
    }
  };

  const predictionsCount = getPredictionsCount();

  useEffect(() => {
    let isMounted = true;

    const fetchMatches = async () => {
      try {
        const matches = await api.getMatches();
        if (isMounted) {
          console.log("Matches fetched:", matches);
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
    <div className="min-h-full w-full">
      <div className="max-w-6xl mx-auto">
        {/* CSS to hide number input arrows */}
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
        <AppHeader
          isAuthenticated={isAuthenticated}
          predictionsCount={predictionsCount}
        />


        {/* Matches by Date */}
        <div className="space-y-8">
          {currentMatches?.map((match) => (
            <MatchesByDate
              key={match.date}
              date={match.date}
              matches={match.matches}
              isAuthenticated={isAuthenticated}
              formatDate={formatDate}
              matchStatus={matchStatus}
              isPredictionTimeExpired={isPredictionTimeExpired}
              hasPrediction={hasPrediction}
              getPredictionScore={getPredictionScore}
              handleUpdatePredictionScore={handleUpdatePredictionScore}
              removePrediction={removePrediction}
            />
          ))}
        </div>

        {/* Save All Predictions Button */}
        <SavePredictionsButton
          predictionsCount={predictionsCount}
          isAuthenticated={isAuthenticated}
          savingPredictions={savingPredictions}
          onSaveAllPredictions={saveAllPredictions}
        />

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Buena suerte con tus predicciones! 🏆</p>
        </div>
      </div>
    </div>
  );
}
