"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, LogOut, MoreVertical, ArrowLeft, Info } from "lucide-react"
import CrimesList from "@/components/crimes-list"
import CrimeSummary from "@/components/crime-summary"
import { fetchAndCacheItems } from "@/lib/items-cache"
import type { TornItem } from "@/lib/items-cache"

interface Member {
  id: number
  name: string
}

interface Crime {
  id: number
  name: string
  difficulty: number
  status: string
  participants: number
  planned_by: { id: number; name: string }
  initiated_by: { id: number; name: string } | null
  pass_rate?: number
  progress?: number
  item_requirement?: {
    id: number
    is_reusable: boolean
    is_available: boolean
  }
  created_at?: number
  planning_at?: number
  executed_at?: number
  ready_at?: number
  expired_at?: number
  slots: Array<{
    position: string
    position_id: string
    user: { id: number; name?: string } | null
    checkpoint_pass_rate?: number
    item_requirement?: {
      id: number
      is_reusable: boolean
      is_available: boolean
    }
  }>
  rewards?: {
    money: number
    items: Array<{ id: number; quantity: number }>
    respect: number
  }
}

export default function CrimesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [members, setMembers] = useState<Member[]>([])
  const [crimes, setCrimes] = useState<Crime[]>([])
  const [items, setItems] = useState<Map<number, TornItem>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [filteredMemberId, setFilteredMemberId] = useState<number | null>(null)
  const [minPassRate, setMinPassRate] = useState(65)

  useEffect(() => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (!apiKey) {
      router.push("/")
      return
    }

    console.log("[v0] Initial data fetch triggered")
    fetchData(apiKey)
  }, [router]) // Only depends on router, not searchParams

  useEffect(() => {
    const memberParam = searchParams.get("member")
    console.log("[v0] Member param changed:", memberParam)
    if (memberParam) {
      setFilteredMemberId(Number.parseInt(memberParam))
    } else {
      setFilteredMemberId(null)
    }
  }, [searchParams]) // Separate effect for searchParams

  const handleApiError = async (response: Response, endpoint: string) => {
    try {
      const errorData = await response.json()
      if (errorData.error?.code === 2) {
        const scope = endpoint.includes("/faction/members")
          ? "members"
          : endpoint.includes("/faction/crimes")
            ? "crimes"
            : "unknown"
        throw new Error(`API key does not have access to ${scope}`)
      }
      throw new Error(errorData.error?.error || "API request failed")
    } catch (e) {
      if (e instanceof Error) throw e
      throw new Error("Failed to fetch data")
    }
  }

  const fetchData = async (apiKey: string) => {
    console.log("[v0] fetchData called, isLoading:", isLoading, "refreshing:", refreshing)
    setIsLoading(true)

    try {
      const itemsData = await fetchAndCacheItems(apiKey)
      setItems(itemsData)

      const membersRes = await fetch("https://api.torn.com/v2/faction/members?striptags=true", {
        headers: { Authorization: `ApiKey ${apiKey}`, accept: "application/json" },
      })

      if (!membersRes.ok) await handleApiError(membersRes, "/faction/members")
      const membersData = await membersRes.json()

      if (membersData.error) {
        if (membersData.error.code === 2) throw new Error("API key does not have access to members")
        throw new Error(membersData.error.error || "Failed to fetch members")
      }

      setMembers(Object.values(membersData.members || {}))

      const crimesRes = await fetch("https://api.torn.com/v2/faction/crimes?striptags=true", {
        headers: { Authorization: `ApiKey ${apiKey}`, accept: "application/json" },
      })

      if (!crimesRes.ok) await handleApiError(crimesRes, "/faction/crimes")
      const crimesData = await crimesRes.json()

      if (crimesData.error) {
        if (crimesData.error.code === 2) throw new Error("API key does not have access to crimes")
        throw new Error(crimesData.error.error || "Failed to fetch crimes")
      }

      setCrimes(Object.values(crimesData.crimes || {}))

      if (!refreshing) {
        toast({
          title: "Success",
          description: "Crimes data loaded successfully",
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load data"
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
    setTimeout(() => router.push("/"), 500)
  }

  const handleRefresh = async () => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (apiKey) {
      console.log("[v0] Manual refresh triggered")
      setRefreshing(true)
      await fetchData(apiKey)
      setRefreshing(false)
      toast({
        title: "Success",
        description: "Data refreshed successfully",
      })
    }
  }

  const handleReloadCrime = async (crimeId: number): Promise<Crime | null> => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (!apiKey) return null

    try {
      console.log("[v0] Reloading crime:", crimeId)
      const response = await fetch(`https://api.torn.com/v2/faction/${crimeId}/crime`, {
        headers: { Authorization: `ApiKey ${apiKey}`, accept: "application/json" },
      })

      if (!response.ok) {
        await handleApiError(response, `/faction/${crimeId}/crime`)
        return null
      }

      const data = await response.json()
      if (data.error) throw new Error(data.error.error || "Failed to reload crime")

      const updatedCrime = data.crime
      setCrimes((prevCrimes) =>
        prevCrimes.map((crime) => (crime.id === crimeId ? { ...crime, ...updatedCrime } : crime)),
      )

      toast({
        title: "Success",
        description: `Crime ${crimeId} reloaded successfully`,
      })
      return updatedCrime
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to reload crime"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      return null
    }
  }

  const filteredCrimes = filteredMemberId
    ? crimes.filter((crime) => crime.slots.some((slot) => slot.user?.id === filteredMemberId))
    : crimes

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading crimes...</div>
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
              <button onClick={() => router.push("/dashboard")} className="hover:opacity-80 transition-opacity">
                <h1 className="text-3xl font-bold text-foreground">Organized Crimes</h1>
              </button>
              <p className="text-muted-foreground mt-1">View and manage faction operations</p>
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
                      router.push("/dashboard/faction")
                      setDropdownOpen(false)
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-accent transition-colors"
                  >
                    <Info size={18} />
                    Faction
                  </button>
                  <button
                    onClick={() => {
                      handleRefresh()
                      setDropdownOpen(false)
                    }}
                    disabled={refreshing}
                    className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-accent transition-colors disabled:opacity-50 border-t border-border"
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
        <div className="max-w-5xl mx-auto">
          {filteredMemberId && (
            <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between">
              <span className="text-sm text-foreground">
                Showing crimes for: <strong>{members.find((m) => m.id === filteredMemberId)?.name}</strong>
              </span>
              <button
                onClick={() => {
                  setFilteredMemberId(null)
                  router.push("/dashboard/crimes")
                  toast({
                    title: "Success",
                    description: "Showing all crimes",
                  })
                }}
                className="text-xs px-2 py-1 bg-background text-foreground hover:text-foreground rounded border border-border hover:border-primary transition-colors"
              >
                Clear Filter
              </button>
            </div>
          )}
          {filteredCrimes.length > 0 && (
            <CrimeSummary
              crimes={filteredCrimes}
              items={items}
              minPassRate={minPassRate}
              onMinPassRateChange={setMinPassRate}
            />
          )}
          {filteredCrimes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {filteredMemberId ? "This member is not participating in any crimes" : "No crimes available"}
              </p>
            </div>
          ) : (
            <CrimesList
              crimes={filteredCrimes}
              members={members}
              items={items}
              onCrimeReload={handleReloadCrime}
              minPassRate={minPassRate}
            />
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
