import { apiRequest } from "../api";


export const getLeaderboard = async () => {
  return apiRequest("/users/ranking/global");
};