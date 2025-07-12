import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Minus, Trophy, UserIcon, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useStore } from "@/store";
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { api } from "@/lib/api";
import type { User as UserType } from "@/store/slices/userSlice";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  homeScore: number;
  awayScore: number;
  saved: boolean;
}

const initialMatches: Match[] = [
  {
    id: "1",
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    date: "2025-01-12",
    time: "15:00",
    homeScore: 0,
    awayScore: 0,
    saved: false,
  },
  {
    id: "2",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    date: "2025-01-12",
    time: "17:30",
    homeScore: 0,
    awayScore: 0,
    saved: false,
  },
  {
    id: "3",
    homeTeam: "Barcelona",
    awayTeam: "Real Madrid",
    date: "2025-01-13",
    time: "20:00",
    homeScore: 0,
    awayScore: 0,
    saved: false,
  },
  {
    id: "4",
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    date: "2025-01-13",
    time: "18:30",
    homeScore: 0,
    awayScore: 0,
    saved: false,
  },
  {
    id: "5",
    homeTeam: "PSG",
    awayTeam: "Marseille",
    date: "2025-01-14",
    time: "21:00",
    homeScore: 0,
    awayScore: 0,
    saved: false,
  },
  {
    id: "6",
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    date: "2025-01-14",
    time: "19:45",
    homeScore: 0,
    awayScore: 0,
    saved: false,
  },
];


export default function HomePage() {
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [loginDialog, setLoginDialog] = useState(false);
  // Use store state instead of local state
  const { user, isAuthenticated, isLoading, error, login, logout, clearError } = useStore();

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    const user = await api.verifyUser(credentialResponse.credential || "");
    login(user as unknown as UserType);
  }

  const handleLogout = () => {
    logout();
  };

  const updateScore = (
    matchId: string,
    team: "home" | "away",
    increment: boolean
  ) => {
    setMatches((prev) =>
      prev.map((match) => {
        if (match.id === matchId) {
          const newMatch = { ...match, saved: false };
          if (team === "home") {
            newMatch.homeScore = Math.max(
              0,
              match.homeScore + (increment ? 1 : -1)
            );
          } else {
            newMatch.awayScore = Math.max(
              0,
              match.awayScore + (increment ? 1 : -1)
            );
          }
          return newMatch;
        }
        return match;
      })
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const groupMatchesByDate = (matches: Match[]) => {
    return matches.reduce((groups, match) => {
      const date = match.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(match);
      return groups;
    }, {} as Record<string, Match[]>);
  };

  const groupedMatches = groupMatchesByDate(matches);
  const savedCount = matches.filter((match) => match.saved).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 w-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
          <Badge variant="secondary" className="text-sm">
            {savedCount} of {matches.length} predictions saved
          </Badge>
        </div>

        <div className="absolute top-4 right-4">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user.user.avatar} />
                <AvatarFallback>{user.user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">{user.user.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          ) : (
            <Dialog open={loginDialog} onOpenChange={setLoginDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-transparent"
                >
                  <UserIcon className="h-4 w-4" />
                  Iniciar sesión
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Iniciar sesión</DialogTitle>
                  <DialogDescription>
                    Inicia sesión con Google para guardar tus predicciones y competir con
                    tus amigos.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={(credentialResponse) => {
                        handleGoogleLogin(credentialResponse);
                      }}
                      onError={() => {
                        console.log('Google login failed');
                      }}
                    />
                  </div>
                  {error && (
                    <div className="text-red-600 text-sm text-center">{error}</div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Matches by Date */}
        <div className="space-y-8">
          {Object.entries(groupedMatches).map(([date, dayMatches]) => (
            <Card key={date} className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg justify-center items-center">
                <CardTitle className="text-xl font-semibold items-end">
                  {formatDate(date)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {dayMatches.map((match, index) => (
                    <div key={match.id}>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        {/* Match Time */}
                        <div className="text-sm font-medium text-gray-500 min-w-[60px]">
                          {match.time}
                        </div>

                        {/* Home Team */}
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-semibold text-right flex-1 text-gray-900">
                            {match.homeTeam}
                          </span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateScore(match.id, "home", false)
                              }
                              disabled={match.homeScore === 0}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-2xl font-bold text-blue-600 min-w-[30px] text-center">
                              {match.homeScore}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateScore(match.id, "home", true)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* VS */}
                        <div className="mx-4 text-gray-400 font-medium">VS</div>

                        {/* Away Team */}
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateScore(match.id, "away", false)
                              }
                              disabled={match.awayScore === 0}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-2xl font-bold text-red-600 min-w-[30px] text-center">
                              {match.awayScore}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateScore(match.id, "away", true)
                              }
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="font-semibold flex-1 text-gray-900">
                            {match.awayTeam}
                          </span>
                        </div>

                        {/* Save Button */}
                        {/* <Button
                          onClick={() => saveMatch(match.id)}
                          disabled={match.saved}
                          className={`ml-4 ${
                            match.saved ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                          }`}
                          size="sm"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          {match.saved ? "Saved" : "Save"}
                        </Button> */}
                      </div>
                      {/* {index < dayMatches.length - 1 && <Separator className="my-2" />} */}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Good luck with your predictions! 🏆</p>
        </div>
      </div>
    </div>
  );
}
