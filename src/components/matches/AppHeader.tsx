import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AppHeaderProps {
  isAuthenticated: boolean;
  predictionsCount: number;
}

export default function AppHeader({ isAuthenticated, predictionsCount }: AppHeaderProps) {
  return (
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
  );
} 