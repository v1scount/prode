import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown, ChevronUp, Users, Clock, Play, Trophy, PartyPopper } from "lucide-react";
import type { Game } from "@/interfaces/matches";
import PredictionInput from "./PredictionInput";
import { useState, useEffect } from "react";
import { useStore } from "@/store";

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
  const [showPredictions, setShowPredictions] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { user } = useStore();

  // Filter out current user's prediction from the list
  const otherUsersPredictions = game.pronostics?.filter(
    (pronostic) => pronostic.userId !== user?.user?.id
  ) || [];

  // Check if user has the correct prediction
  const hasCorrectPrediction = () => {
    if (!hasGamePrediction || !isFinished || !game.scores) return false;
    
    const homeScore = parseInt(getPredictionScore(game.id, "home"));
    const awayScore = parseInt(getPredictionScore(game.id, "away"));
    
    return homeScore === (game.scores[0] || 0) && awayScore === (game.scores[1] || 0);
  };

  // Trigger celebration when match finishes and user has correct prediction
  useEffect(() => {
    if (isFinished && hasCorrectPrediction() && !showCelebration) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }
  }, [isFinished, hasGamePrediction]);

  // Determine card styling based on match state
  const getCardStyling = () => {
    if (isFinished) {
      // Show celebration styling if user got it right
      if (hasCorrectPrediction()) {
        return {
          container: "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400 shadow-lg ring-2 ring-yellow-200",
          statusBadge: "bg-yellow-600 text-white",
          statusIcon: <Trophy className="h-3 w-3" />,
          statusText: "¡Acertaste!"
        };
      }
      return {
        container: "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 shadow-sm",
        statusBadge: "bg-gray-600 text-white",
        statusIcon: <Trophy className="h-3 w-3" />,
        statusText: "Finalizado"
      };
    } else if (hasStarted) {
      return {
        container: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-md ring-2 ring-green-100",
        statusBadge: "bg-green-600 text-white animate-pulse",
        statusIcon: <Play className="h-3 w-3" />,
        statusText: "En vivo"
      };
    } else if (isPredictionTimeExpired) {
      return {
        container: "bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300 shadow-sm",
        statusBadge: "bg-orange-600 text-white",
        statusIcon: <Clock className="h-3 w-3" />,
        statusText: "Cerrado"
      };
    } else {
      return {
        container: "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-sm hover:shadow-md",
        statusBadge: "bg-blue-600 text-white",
        statusIcon: <Clock className="h-3 w-3" />,
        statusText: "Abierto"
      };
    }
  };

  const cardStyle = getCardStyling();

  // Get score styling based on match state
  const getScoreStyle = (score: number | string) => {
    if (isFinished) {
      return "text-xl font-bold text-gray-700";
    } else if (hasStarted) {
      return "text-xl font-bold text-green-700 animate-pulse";
    } else {
      return "text-xl font-bold text-gray-400";
    }
  };

  return (
    <div className={`rounded-lg border transition-all duration-300 ${cardStyle.container} ${showCelebration ? 'animate-celebration' : ''}`}>
      {/* Celebration confetti effect */}
      {showCelebration && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="relative">
            <PartyPopper className="h-16 w-16 text-yellow-500 animate-bounce" />
            <div className="absolute -top-2 -right-2 text-2xl animate-spin">🎉</div>
            <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce">🏆</div>
          </div>
        </div>
      )}

      {/* Match Status Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white/50">
        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${cardStyle.statusBadge}`}>
            {cardStyle.statusIcon}
            {cardStyle.statusText}
          </div>
          <span className="text-sm font-medium text-gray-600">
            {matchStatus}
          </span>
        </div>
        
        {/* Prediction Status Indicator */}
        {isAuthenticated && (
          <div className="flex items-center gap-2">
            {!isPredictionTimeExpired && !isFinished && (
              <div className={`text-xs px-2 py-1 rounded-full font-medium ${
                hasGamePrediction 
                  ? "bg-green-100 text-green-700" 
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {hasGamePrediction ? "Pronóstico guardado" : "Sin pronóstico"}
              </div>
            )}
            {isPredictionTimeExpired && !isFinished && (
              <div className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">
                Predicciones cerradas
              </div>
            )}
            {isFinished && hasGamePrediction && hasCorrectPrediction() && (
              <div className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-700 animate-pulse">
                🎯 ¡Acertaste!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Match Card */}
      <div className="flex items-center justify-between p-4 bg-white/70">
        {/* Home Team */}
        <div className="flex flex-col items-end gap-3 flex-1">
          {/* Team name, logo and real score */}
          <div className="flex items-center gap-3">
            <span className="font-bold text-gray-900 text-lg">
              {game.teams[0].name}
            </span>
            <div className="relative">
              <img
                src={`https://api.promiedos.com.ar/images/team/${game.teams[0].id}/1`}
                alt={game.teams[0].name}
                className="w-8 h-8 rounded-full border-2 border-gray-200"
              />
            </div>
            <span className={getScoreStyle(game.scores?.[0] || 0)}>
              {hasStarted ? game.scores?.[0] || 0 : "-"}
            </span>
          </div>
          
          {/* Prediction input - always show while match is not finished */}
          {!isFinished && isAuthenticated && (
            <div className="relative">
              <PredictionInput
                gameId={game.id}
                team="home"
                value={getPredictionScore(game.id, "home")}
                onUpdate={handleUpdatePredictionScore}
                isPredictionTimeExpired={isPredictionTimeExpired}
              />
            </div>
          )}
          
          {/* Show prediction for finished match only - improved styling */}
          {isFinished && isAuthenticated && (
            <div className="flex items-center">
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${
                hasGamePrediction 
                  ? hasCorrectPrediction()
                    ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-400 shadow-md"
                    : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-400 shadow-sm"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-gray-300 shadow-sm"
              }`}>
                {hasGamePrediction ? getPredictionScore(game.id, "home") : "-"}
              </div>
            </div>
          )}
        </div>

        {/* VS and Remove Button */}
        <div className="flex flex-col items-center mx-6">
          <div className="bg-white rounded-full p-3 shadow-sm border border-gray-200">
            <div className="text-gray-500 font-bold text-sm">VS</div>
          </div>
          
          {/* Remove button */}
          {!isFinished && isAuthenticated && !isPredictionTimeExpired && hasGamePrediction && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => removePrediction(game.id)}
                className="h-8 w-8 p-0 border-red-300 text-red-500 hover:bg-red-50 hover:border-red-400 hover:text-red-600"
                title="Eliminar pronóstico"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-col items-start gap-3 flex-1">
          {/* Team name, logo and real score */}
          <div className="flex items-center gap-3">
            <span className={getScoreStyle(game.scores?.[1] || 0)}>
              {hasStarted ? game.scores?.[1] || 0 : "-"}
            </span>
            <div className="relative">
              <img
                src={`https://api.promiedos.com.ar/images/team/${game.teams[1].id}/1`}
                alt={game.teams[1].name}
                className="w-8 h-8 rounded-full border-2 border-gray-200"
              />
            </div>
            <span className="font-bold text-gray-900 text-lg">
              {game.teams[1].name}
            </span>
          </div>
          
          {/* Prediction input - always show while match is not finished */}
          {!isFinished && isAuthenticated && (
            <div className="relative">
              <PredictionInput
                gameId={game.id}
                team="away"
                value={getPredictionScore(game.id, "away")}
                onUpdate={handleUpdatePredictionScore}
                isPredictionTimeExpired={isPredictionTimeExpired}
              />
            </div>
          )}
          
          {/* Show prediction for finished match only - improved styling */}
          {isFinished && isAuthenticated && (
            <div className="flex items-center">
              <div className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all duration-200 ${
                hasGamePrediction 
                  ? hasCorrectPrediction()
                    ? "bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-400 shadow-md"
                    : "bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-400 shadow-sm"
                  : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-gray-300 shadow-sm"
              }`}>
                {hasGamePrediction ? getPredictionScore(game.id, "away") : "-"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Predictions Toggle Button */}
      {otherUsersPredictions.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-3 bg-white/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPredictions(!showPredictions)}
            className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900 hover:bg-gray-100/50"
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="font-medium">Pronósticos de otros jugadores ({otherUsersPredictions.length})</span>
            </div>
            {showPredictions ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* Predictions List */}
      {showPredictions && otherUsersPredictions.length > 0 && (
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50/80">
          <div className="space-y-2">
            {otherUsersPredictions.map((pronostic) => {
              // Check if this user's prediction is correct
              const isCorrect = isFinished && game.scores && 
                pronostic.prediction.scores[0] === (game.scores[0] || 0) &&
                pronostic.prediction.scores[1] === (game.scores[1] || 0);
              
              return (
                <div
                  key={pronostic.id}
                  className={`flex items-center justify-between py-3 px-4 rounded-lg border shadow-sm hover:shadow-md transition-all ${
                    isCorrect 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 ring-1 ring-yellow-200' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                      isCorrect 
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500' 
                        : 'bg-gradient-to-r from-blue-500 to-purple-500'
                    }`}>
                      <span className="text-sm font-bold text-white">
                        {pronostic.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {pronostic.user.name}
                        </span>
                        {isCorrect && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">
                            🎯 ¡Acertó!
                          </span>
                        )}
                      </div>
                      {pronostic.processed && (
                        <div className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full inline-block mt-1">
                          +{pronostic.livePoints} pts
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-3 py-2 rounded-lg border ${
                      isCorrect 
                        ? 'bg-yellow-50 border-yellow-300'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <span className={`text-sm font-bold ${
                        isCorrect ? 'text-yellow-700' : 'text-blue-700'
                      }`}>
                        {pronostic.prediction.scores[0]}
                      </span>
                      <span className="text-gray-400 mx-1">-</span>
                      <span className={`text-sm font-bold ${
                        isCorrect ? 'text-yellow-700' : 'text-blue-700'
                      }`}>
                        {pronostic.prediction.scores[1]}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


    </div>
  );
} 