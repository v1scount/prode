import { apiRequest } from "../api";
import type { Root } from "@/interfaces/matches";

// Prediction interface matching your backend format
export interface PredictionData {
  externalId: string;
  prediction: {
    scores: number[];
  };
}

export const getMatches = async () => {
  return apiRequest<Root>("/promiedos/lpf/current");
};

// Send predictions to backend
export const sendPredictions = async (predictions: PredictionData[]) => {
  return apiRequest("/pronostics/bulk", {
    method: "POST",
    data: predictions,
  });
};

// GET my pronostics
export const getMyPronostics = async () => {
  return apiRequest("/pronostics/my-pronostics", {
    method: "GET",
  });
};
