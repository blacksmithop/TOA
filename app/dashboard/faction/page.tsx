"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, LogOut, MoreVertical, ArrowLeft, Users, Award, TrendingUp, Calendar, Crown } from "lucide-react"
import { Card } from "@/components/ui/card"

interface FactionBasic {
  id: number
  name: string
  tag: string
  tag_image: string
  leader_id: number
  co_leader_id: number
  respect: number
  days_old: number
  capacity: number
  members: number
  is_enlisted: boolean
  rank: {
    level: number
    name: string
    division: number
    position: number
    wins: number
  }
  best_chain: number
}

interface Member {
  id: number
  name: string
}

export default function FactionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [factionData, setFactionData] = useState<FactionBasic | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (!apiKey) {
      router.push("/")
      return
    }

    fetchFactionData(apiKey)
  }, [router])

  const fetchFactionData = async (apiKey: string) => {
    setIsLoading(true)

    try {
      const [basicResponse, membersResponse] = await Promise.all([
        fetch("https://api.torn.com/v2/faction/basic?striptags=true", {
          headers: {
            Authorization: `ApiKey ${apiKey}`,
            accept: "application/json",
          },
        }),
        fetch("https://api.torn.com/v2/faction/members?striptags=true", {
          headers: {
            Authorization: `ApiKey ${apiKey}`,
            accept: "application/json",
          },
        }),
      ])

      if (!basicResponse.ok) {
        throw new Error("Failed to fetch faction data")
      }

      const basicData = await basicResponse.json()

      if (basicData.error) {
        if (basicData.error.code === 2) {
          throw new Error("API key does not have access to faction basic info")
        }
        throw new Error(basicData.error.error || "Failed to fetch faction data")
      }

      setFactionData(basicData.basic)

      if (membersResponse.ok) {
        const membersData = await membersResponse.json()
        if (!membersData.error) {
          setMembers(Object.values(membersData.members || {}))
        }
      }

      if (!refreshing) {
        toast({
          title: "Success",
          description: "Faction data loaded successfully",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load faction data"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("factionApiKey")
    toast({
      title: "Success",
      description: "Logged out successfully",
    })
    setTimeout(() => {
      router.push("/")
    }, 500)
  }

  const handleRefresh = async () => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (apiKey) {
      setRefreshing(true)
      await fetchFactionData(apiKey)
      setRefreshing(false)
      toast({
        title: "Success",
        description: "Data refreshed successfully",
      })
    }
  }

  const getLeaderName = () => {
    if (!factionData) return null
    const leader = members.find((m) => m.id === factionData.leader_id)
    return leader ? leader.name : null
  }

  const getCoLeaderName = () => {
    if (!factionData) return null
    const coLeader = members.find((m) => m.id === factionData.co_leader_id)
    return coLeader ? coLeader.name : null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading faction data...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <header className="flex-shrink-0 border-b border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="p-2 hover:bg-accent rounded-lg transition-colors border border-border"
              title="Back to Dashboard"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Faction Info</h1>
              <p className="text-muted-foreground mt-1">View faction details and statistics</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="p-2 hover:bg-accent rounded-lg transition-colors border border-border"
              title="Menu"
            >
              <MoreVertical size={20} />
            </button>
            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => {
                      handleRefresh()
                      setDropdownOpen(false)
                    }}
                    disabled={refreshing}
                    className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-accent transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </button>
                  <button
                    onClick={() => {
                      handleLogout()
                      setDropdownOpen(false)
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-destructive/10 text-destructive transition-colors border-t border-border"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {factionData && (
            <>
              {/* Faction Header */}
              <Card className="bg-card border-border p-8">
                <div className="flex items-center gap-6">
                  <a
                    href={`https://www.torn.com/factions.php?step=profile&ID=${factionData.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0"
                  >
                    <img
                      src={`https://factiontags.torn.com/${factionData.tag_image}`}
                      alt={`${factionData.name} faction tag`}
                      className="w-32 h-32 object-contain border border-border rounded-lg bg-background hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  </a>
                  <div className="flex-1">
                    <a
                      href={`https://www.torn.com/factions.php?step=profile&ID=${factionData.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-4xl font-bold text-foreground hover:text-primary transition-colors"
                    >
                      {factionData.name}
                    </a>
                    <a
                      href={`https://www.torn.com/factions.php?step=profile&ID=${factionData.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xl text-muted-foreground hover:text-primary transition-colors mb-1 inline-block"
                    >
                      [{factionData.tag}]
                    </a>
                    <p className="text-sm text-muted-foreground">Faction ID: {factionData.id}</p>
                  </div>
                </div>
              </Card>

              {/* Stats Grid - Made cards more compact with reduced padding and font sizes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Members */}
                <Card className="bg-card border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/40">
                      <Users size={18} className="text-primary" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Members</h3>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-0.5">
                    {factionData.members} / {factionData.capacity}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((factionData.members / factionData.capacity) * 100)}% capacity
                  </p>
                </Card>

                {/* Respect */}
                <Card className="bg-card border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-accent/20 p-1.5 rounded-lg border border-accent/40">
                      <Award size={18} className="text-accent" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Respect</h3>
                  </div>
                  <p className="text-2xl font-bold text-accent mb-0.5">{factionData.respect.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total faction respect</p>
                </Card>

                {/* Best Chain */}
                <Card className="bg-card border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-chart-1/20 p-1.5 rounded-lg border border-chart-1/40">
                      <TrendingUp size={18} className="text-chart-1" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Best Chain</h3>
                  </div>
                  <p className="text-2xl font-bold text-chart-1 mb-0.5">{factionData.best_chain.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Highest chain achieved</p>
                </Card>

                {/* Age */}
                <Card className="bg-card border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-chart-2/20 p-1.5 rounded-lg border border-chart-2/40">
                      <Calendar size={18} className="text-chart-2" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Faction Age</h3>
                  </div>
                  <p className="text-2xl font-bold text-chart-2 mb-0.5">{factionData.days_old.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Days old</p>
                </Card>

                {/* Rank */}
                <Card className="bg-card border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-chart-3/20 p-1.5 rounded-lg border border-chart-3/40">
                      <Crown size={18} className="text-chart-3" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Rank</h3>
                  </div>
                  <p className="text-2xl font-bold text-chart-3 mb-0.5">{factionData.rank.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Level {factionData.rank.level} • Division {factionData.rank.division}
                  </p>
                </Card>

                {/* Rank Wins */}
                <Card className="bg-card border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-chart-4/20 p-1.5 rounded-lg border border-chart-4/40">
                      <Award size={18} className="text-chart-4" />
                    </div>
                    <h3 className="text-sm font-semibold text-foreground">Rank Wins</h3>
                  </div>
                  <p className="text-2xl font-bold text-chart-4 mb-0.5">{factionData.rank.wins}</p>
                  <p className="text-xs text-muted-foreground">Territory wars won</p>
                </Card>
              </div>

              {/* Leadership - Updated to show names with IDs as clickable links */}
              <Card className="bg-card border-border p-4">
                <h3 className="text-base font-semibold text-foreground mb-3">Leadership</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg border border-border">
                    <Crown size={16} className="text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground mb-0.5">Leader</p>
                      {getLeaderName() ? (
                        <a
                          href={`https://www.torn.com/profiles.php?XID=${factionData.leader_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-primary hover:underline truncate block"
                        >
                          {getLeaderName()} [{factionData.leader_id}]
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">ID: {factionData.leader_id}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-background rounded-lg border border-border">
                    <Crown size={16} className="text-accent flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground mb-0.5">Co-Leader</p>
                      {getCoLeaderName() ? (
                        <a
                          href={`https://www.torn.com/profiles.php?XID=${factionData.co_leader_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-accent hover:underline truncate block"
                        >
                          {getCoLeaderName()} [{factionData.co_leader_id}]
                        </a>
                      ) : (
                        <p className="text-sm font-semibold text-foreground">ID: {factionData.co_leader_id}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </main>

      <footer className="flex-shrink-0 border-t border-border bg-card px-6 py-4 z-50">
        <div className="text-center text-sm">
          <a
            href="https://www.torn.com/profiles.php?XID=1712955"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-white/80 transition-colors"
          >
            © oxiblurr [1712955]
          </a>
        </div>
      </footer>
    </div>
  )
}
