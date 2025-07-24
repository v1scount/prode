import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Game } from "@/interfaces/matches";
import MatchCard from "./MatchCard";

interface MatchesByDateProps {
  date: string;
  matches: Game[];
  isAuthenticated: boolean;
  formatDate: (dateString: string) => string;
  matchStatus: (match: Game) => string;
  isPredictionTimeExpired: (game: Game) => boolean;
  hasPrediction: (gameId: string) => boolean;
  getPredictionScore: (gameId: string, team: "home" | "away") => string;
  handleUpdatePredictionScore: (
    gameId: string,
    team: "home" | "away",
    value: string
  ) => void;
  removePrediction: (gameId: string) => void;
}

export default function MatchesByDate({
  date,
  matches,
  isAuthenticated,
  formatDate,
  matchStatus,
  isPredictionTimeExpired,
  hasPrediction,
  getPredictionScore,
  handleUpdatePredictionScore,
  removePrediction,
}: MatchesByDateProps) {
  return (
    <Card className="shadow-lg w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg flex justify-center items-center p-3 md:p-6">
        <CardTitle className="text-base md:text-xl font-semibold items-end">
          {formatDate(date)}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 md:p-6">
        <div className="space-y-3 md:space-y-4">
          {matches.map((game) => {
            const isFinished = game.status.enum === 3;
            const hasGamePrediction = hasPrediction(game.id);
            const hasStarted = game.status.enum !== 1;
            const isPredictionExpired = isPredictionTimeExpired(game);

            return (
              <MatchCard
                key={game.id}
                game={game}
                isAuthenticated={isAuthenticated}
                hasGamePrediction={hasGamePrediction}
                hasStarted={hasStarted}
                isFinished={isFinished}
                isPredictionTimeExpired={isPredictionExpired}
                matchStatus={matchStatus(game)}
                getPredictionScore={getPredictionScore}
                handleUpdatePredictionScore={handleUpdatePredictionScore}
                removePrediction={removePrediction}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
} 