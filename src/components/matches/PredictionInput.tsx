import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";

interface PredictionInputProps {
  gameId: string;
  team: "home" | "away";
  value: string;
  onUpdate: (gameId: string, team: "home" | "away", value: string) => void;
  disabled?: boolean;
  isPredictionTimeExpired?: boolean;
}

export default function PredictionInput({
  gameId,
  team,
  value,
  onUpdate,
  disabled = false,
  isPredictionTimeExpired = false,
}: PredictionInputProps) {
  const [isShaking, setIsShaking] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastValue, setLastValue] = useState(value);

  // Trigger success animation when value changes
  useEffect(() => {
    if (value !== lastValue && value !== "" && !disabled) {
      setShowSuccess(true);
      setIsLoading(false);
      setTimeout(() => setShowSuccess(false), 1500);
    }
    setLastValue(value);
  }, [value, lastValue, disabled]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Check if trying to input when time is expired
    if (isPredictionTimeExpired && newValue !== value) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    // Show loading state briefly
    setIsLoading(true);
    
    // Simulate brief loading for better UX
    setTimeout(() => {
      onUpdate(gameId, team, newValue);
    }, 150);
  };

  const handleFocus = () => {
    if (isPredictionTimeExpired) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  return (
    <div className="relative flex items-center">
      <div className={`relative transition-all duration-300 ${
        isShaking ? 'animate-shake' : ''
      }`}>
        <input
          type="number"
          min="0"
          max="99"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder="-"
          disabled={disabled || isPredictionTimeExpired}
          className={`w-16 h-10 text-center text-sm font-semibold transition-all duration-200 border-2 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent shadow-sm [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] ${
            showSuccess 
              ? 'text-green-800 border-green-400 bg-gradient-to-r from-green-100 to-emerald-100 focus:ring-green-500 shadow-md' 
              : disabled || isPredictionTimeExpired
              ? 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border-gray-300 shadow-sm'
              : 'text-blue-800 border-blue-400 bg-gradient-to-r from-blue-100 to-indigo-100 focus:ring-blue-500 hover:shadow-md'
          }`}
        />
        
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded">
            <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
          </div>
        )}
        
        {/* Success checkmark */}
        {showSuccess && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-green-50/90 rounded">
            <Check className="h-3 w-3 text-green-600 animate-bounce" />
          </div>
        )}
      </div>

      {/* Success feedback message */}
      {/* {showSuccess && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-green-600 font-medium animate-fadeIn">
          ✓ Guardado
        </div>
      )} */}

      {/* Error feedback for expired predictions */}
      {isShaking && isPredictionTimeExpired && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-red-600 font-medium animate-fadeIn">
          ⚠️ Cerrado
        </div>
      )}


    </div>
  );
} 