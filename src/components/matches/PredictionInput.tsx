interface PredictionInputProps {
  gameId: string;
  team: "home" | "away";
  value: string;
  onUpdate: (gameId: string, team: "home" | "away", value: string) => void;
  disabled?: boolean;
}

export default function PredictionInput({
  gameId,
  team,
  value,
  onUpdate,
  disabled = false,
}: PredictionInputProps) {
  return (
    <div className="flex items-center">
      <input
        type="number"
        min="0"
        max="99"
        value={value}
        onChange={(e) => onUpdate(gameId, team, e.target.value)}
        placeholder="-"
        disabled={disabled}
        className="w-12 h-8 text-center text-sm font-medium text-blue-600 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [-moz-appearance:textfield] disabled:bg-gray-100 disabled:text-gray-500"
      />
    </div>
  );
} 