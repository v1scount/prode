import { apiRequest } from "../api";
import type { Root } from "@/interfaces/matches";


export const getMatches = async () => {
  return apiRequest<Root>("/promiedos/lpf/current");
};
