import { Button } from "@/components/ui/button";
import { Save, Check, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [wasSaving, setWasSaving] = useState(false);

  // Trigger success animation when saving completes
  useEffect(() => {
    if (wasSaving && !savingPredictions) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    }
    setWasSaving(savingPredictions);
  }, [savingPredictions, wasSaving]);

  if (predictionsCount === 0 || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex justify-center mt-8 mb-8">
      <div className="relative">
        <Button
          onClick={onSaveAllPredictions}
          disabled={savingPredictions || !isAuthenticated}
          size="lg"
          className={`px-8 py-3 text-lg font-semibold transition-all duration-300 ${
            showSuccess
              ? 'bg-green-600 hover:bg-green-700 scale-105'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {savingPredictions ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Guardando predicciones...
            </>
          ) : showSuccess ? (
            <>
              <Check className="h-5 w-5 mr-2 animate-bounce" />
              ¡Predicciones guardadas!
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Guardar {predictionsCount} predicciones
            </>
          )}
        </Button>

        {/* Success feedback confetti */}
        {showSuccess && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-2 -right-2 text-lg animate-confettiPop">🎉</div>
            <div className="absolute -bottom-2 -left-2 text-lg animate-confettiPop" style={{ animationDelay: '0.2s' }}>✨</div>
            <div className="absolute -top-2 -left-2 text-lg animate-confettiPop" style={{ animationDelay: '0.4s' }}>🎊</div>
          </div>
        )}

        {/* Progress feedback */}
        {savingPredictions && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-gray-600 animate-fadeIn">
            Enviando al servidor...
          </div>
        )}

        {/* Success message */}
        {showSuccess && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm text-green-600 font-medium animate-fadeIn">
            ¡Listo! Buena suerte 🍀
          </div>
        )}
      </div>
    </div>
  );
} 