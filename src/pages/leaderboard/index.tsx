import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"
import { getLeaderboard } from "@/lib/api/leaderboard"
import { useEffect, useState } from "react"
import { useStore } from "@/store"
import type { LeaderboardParticipant } from "@/store/slices/leaderboardSlice"
import { Skeleton } from "@/components/ui/skeleton"


export default function Leaderboard() {
  const leaderboard = useStore((s) => s.leaderboard)
  const isLoading = useStore((s) => s.isLeaderboardLoading)
  const setLeaderboard = useStore((s) => s.setLeaderboard)
  const setLeaderboardLoading = useStore((s) => s.setLeaderboardLoading)

  useEffect(() => {
    setLeaderboardLoading(true)
    getLeaderboard()
      .then((data) => setLeaderboard(data as LeaderboardParticipant[]))
      .catch(() => {/* handle error */})
      .finally(() => setLeaderboardLoading(false))
  }, [])

  // console.log(leaderboard)

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 2:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return null
    }
  }

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600">
            1st
          </Badge>
        )
      case 1:
        return <Badge variant="secondary">2nd</Badge>
      case 2:
        return (
          <Badge variant="outline" className="border-amber-600 text-amber-600">
            3rd
          </Badge>
        )
      default:
        return <Badge variant="outline">{index + 1}th</Badge>
    }
  }

  return (
    <div className="flex flex-1 flex-col space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
      </div>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Rank</TableHead>
                <TableHead>Participant</TableHead>
                <TableHead className="text-right">Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-6 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-6 w-32" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-6 w-12 ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))
                : leaderboard?.map((participant, index) => (
                    <TableRow key={participant.user.name} >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {getRankIcon(index)}
                          {getRankBadge(index)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{participant.user.name}</TableCell>
                      <TableCell className="text-right font-mono text-lg">{participant.globalPoints}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
