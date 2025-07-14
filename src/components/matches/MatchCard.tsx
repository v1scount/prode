import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Game } from "@/interfaces/matches";
import PredictionInput from "./PredictionInput";

interface MatchCardProps {
  game: Game;
  isAuthenticated: boolean;
  hasGamePrediction: boolean;
  hasStarted: boolean;
  isFinished: boolean;
  isPredictionTimeExpired: boolean;
  matchStatus: string;
  getPredictionScore: (gameId: string, team: "home" | "away") => string;
  handleUpdatePredictionScore: (
    gameId: string,
    team: "home" | "away",
    value: string
  ) => void;
  removePrediction: (gameId: string) => void;
}

export default function MatchCard({
  game,
  isAuthenticated,
  hasGamePrediction,
  hasStarted,
  isFinished,
  isPredictionTimeExpired,
  matchStatus,
  getPredictionScore,
  handleUpdatePredictionScore,
  removePrediction,
}: MatchCardProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      {/* Match Time */}
      <div className="text-sm font-medium text-gray-500 min-w-[60px]">
        {matchStatus}
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
        {!isFinished && isAuthenticated && !isPredictionTimeExpired && (
          <PredictionInput
            gameId={game.id}
            team="home"
            value={getPredictionScore(game.id, "home")}
            onUpdate={handleUpdatePredictionScore}
          />
        )}
        {/* Show prediction for finished match - always show, dash if no prediction */}
        {isPredictionTimeExpired && isAuthenticated && (
          <div className="flex items-center">
            <span className="text-sm font-medium text-blue-600 min-w-[20px] text-center">
              {hasGamePrediction ? getPredictionScore(game.id, "home") : "-"}
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
        {!isFinished && isAuthenticated && !isPredictionTimeExpired && (
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
        {!isFinished && isAuthenticated && !isPredictionTimeExpired && (
          <PredictionInput
            gameId={game.id}
            team="away"
            value={getPredictionScore(game.id, "away")}
            onUpdate={handleUpdatePredictionScore}
          />
        )}
        {/* Show prediction for finished match - always show, dash if no prediction */}
        {isPredictionTimeExpired && isAuthenticated && (
          <div className="flex items-center">
            <span className="text-sm font-medium text-blue-600 min-w-[20px] text-center">
              {hasGamePrediction ? getPredictionScore(game.id, "away") : "-"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
} 