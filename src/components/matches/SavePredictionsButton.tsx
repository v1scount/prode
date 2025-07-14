import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SavePredictionsButtonProps {
  predictionsCount: number;
  isAuthenticated: boolean;
  savingPredictions: boolean;
  onSaveAllPredictions: () => void;
}

export default function SavePredictionsButton({
  predictionsCount,
  isAuthenticated,
  savingPredictions,
  onSaveAllPredictions,
}: SavePredictionsButtonProps) {
  if (predictionsCount === 0 || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex justify-center mt-8 mb-8">
      <Button
        onClick={onSaveAllPredictions}
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
  );
} 