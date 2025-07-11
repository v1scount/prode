import { useState } from 'react'


// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App


import { Button } from "@/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card"
import { Badge } from "@/components/badge"
import { Separator } from "@/components/separator"
import { Plus, Minus, Save, Trophy } from "lucide-react"
// import { useToast } from "@/hooks/use-toast"

interface Match {
  id: string
  homeTeam: string
  awayTeam: string
  date: string
  time: string
  homeScore: number
  awayScore: number
  saved: boolean
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
]

export default function App() {
  const [matches, setMatches] = useState<Match[]>(initialMatches)
  // const { toast } = useToast()

  const updateScore = (matchId: string, team: "home" | "away", increment: boolean) => {
    setMatches((prev) =>
      prev.map((match) => {
        if (match.id === matchId) {
          const newMatch = { ...match, saved: false }
          if (team === "home") {
            newMatch.homeScore = Math.max(0, match.homeScore + (increment ? 1 : -1))
          } else {
            newMatch.awayScore = Math.max(0, match.awayScore + (increment ? 1 : -1))
          }
          return newMatch
        }
        return match
      }),
    )
  }

  const saveMatch = (matchId: string) => {
    setMatches((prev) =>
      prev.map((match) => {
        if (match.id === matchId) {
          return { ...match, saved: true }
        }
        return match
      }),
    )

    // toast({
    //   title: "Prediction Saved!",
    //   description: "Your score prediction has been saved successfully.",
    // })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const groupMatchesByDate = (matches: Match[]) => {
    return matches.reduce(
      (groups, match) => {
        const date = match.date
        if (!groups[date]) {
          groups[date] = []
        }
        groups[date].push(match)
        return groups
      },
      {} as Record<string, Match[]>,
    )
  }

  const groupedMatches = groupMatchesByDate(matches)
  const savedCount = matches.filter((match) => match.saved).length

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 w-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-8 w-8 text-yellow-600" />
            <h1 className="text-4xl font-bold text-gray-900">Football Predictions</h1>
          </div>
          <p className="text-lg text-gray-600 mb-4">Compete with friends by predicting match results!</p>
          <Badge variant="secondary" className="text-sm">
            {savedCount} of {matches.length} predictions saved
          </Badge>
        </div>

        {/* Matches by Date */}
        <div className="space-y-8">
          {Object.entries(groupedMatches).map(([date, dayMatches]) => (
            <Card key={date} className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg justify-center items-center">
                <CardTitle className="text-xl font-semibold items-end">{formatDate(date)}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {dayMatches.map((match, index) => (
                    <div key={match.id}>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                        {/* Match Time */}
                        <div className="text-sm font-medium text-gray-500 min-w-[60px]">{match.time}</div>

                        {/* Home Team */}
                        <div className="flex items-center gap-3 flex-1">
                          <span className="font-semibold text-right flex-1 text-gray-900">{match.homeTeam}</span>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateScore(match.id, "home", false)}
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
                              onClick={() => updateScore(match.id, "home", true)}
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
                              onClick={() => updateScore(match.id, "away", false)}
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
                              onClick={() => updateScore(match.id, "away", true)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="font-semibold flex-1 text-gray-900">{match.awayTeam}</span>
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
  )
}


