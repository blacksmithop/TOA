"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, LogOut, MoreVertical, Users, Shield, Info, FileText } from "lucide-react"
import { fetchAndCacheItems } from "@/lib/items-cache"
import type { TornItem } from "@/lib/items-cache"
import CrimeSummary from "@/components/crime-summary"
import CrimeSuccessCharts from "@/components/crime-success-charts"

interface Crime {
  id: number
  status: string
  rewards?: {
    money: number
    items: Array<{ id: number; quantity: number }>
    respect: number
  }
}

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [crimes, setCrimes] = useState<Crime[]>([])
  const [memberCount, setMemberCount] = useState(0)
  const [items, setItems] = useState<Map<number, TornItem>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (!apiKey) {
      router.push("/")
      return
    }

    fetchData(apiKey)
  }, [router])

  const handleApiError = async (response: Response, endpoint: string) => {
    try {
      const errorData = await response.json()

      if (errorData.error?.code === 2) {
        const scope = endpoint.includes("/faction/members")
          ? "members"
          : endpoint.includes("/faction/crimes")
            ? "crimes"
            : endpoint.includes("/faction/basic")
              ? "basic"
              : endpoint.includes("/torn/items")
                ? "items"
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
    setIsLoading(true)

    try {
      const itemsData = await fetchAndCacheItems(apiKey)
      setItems(itemsData)

      const membersRes = await fetch("https://api.torn.com/v2/faction/members?striptags=true", {
        headers: {
          Authorization: `ApiKey ${apiKey}`,
          accept: "application/json",
        },
      })

      if (!membersRes.ok) {
        await handleApiError(membersRes, "/faction/members")
      }

      const membersData = await membersRes.json()

      if (membersData.error) {
        if (membersData.error.code === 2) {
          throw new Error("API key does not have access to members")
        }
        throw new Error(membersData.error.error || "Failed to fetch members")
      }

      setMemberCount(Object.keys(membersData.members || {}).length)

      const crimesRes = await fetch("https://api.torn.com/v2/faction/crimes?striptags=true", {
        headers: {
          Authorization: `ApiKey ${apiKey}`,
          accept: "application/json",
        },
      })

      if (!crimesRes.ok) {
        await handleApiError(crimesRes, "/faction/crimes")
      }

      const crimesData = await crimesRes.json()

      if (crimesData.error) {
        if (crimesData.error.code === 2) {
          throw new Error("API key does not have access to crimes")
        }
        throw new Error(crimesData.error.error || "Failed to load data")
      }

      setCrimes(Object.values(crimesData.crimes || {}))

      if (!refreshing) {
        toast({
          title: "Success",
          description: "Dashboard loaded successfully",
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
    setTimeout(() => {
      router.push("/")
    }, 500)
  }

  const handleRefresh = async () => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (apiKey) {
      setRefreshing(true)
      await fetchData(apiKey)
      setRefreshing(false)
      toast({
        title: "Success",
        description: "Data refreshed successfully",
      })
    }
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
          <div>
            <button onClick={() => router.push("/dashboard")} className="hover:opacity-80 transition-opacity">
              <h1 className="text-3xl font-bold text-foreground">Faction Crimes</h1>
            </button>
            <p className="text-muted-foreground mt-1">View and manage faction operations</p>
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
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Summary Section */}
          {crimes.length > 0 && <CrimeSummary crimes={crimes} items={items} />}

          {/* Success Rate Charts */}
          {crimes.length > 0 && <CrimeSuccessCharts crimes={crimes} />}

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Members Card */}
            <button
              onClick={() => router.push("/dashboard/members")}
              className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-all text-left group"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-primary/20 p-3 rounded-lg border border-primary/40">
                  <Users size={28} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Members
                  </h2>
                  <p className="text-sm text-muted-foreground">View faction members</p>
                </div>
              </div>
              <div className="text-4xl font-bold text-primary mb-2">{memberCount}</div>
              <p className="text-sm text-muted-foreground">Total members with participation stats</p>
            </button>

            {/* Organized Crimes Card */}
            <button
              onClick={() => router.push("/dashboard/crimes")}
              className="bg-card border border-border rounded-lg p-6 hover:border-accent transition-all text-left group"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-accent/20 p-3 rounded-lg border border-accent/40">
                  <Shield size={28} className="text-accent" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground group-hover:text-accent transition-colors">
                    Organized Crimes
                  </h2>
                  <p className="text-sm text-muted-foreground">Manage operations</p>
                </div>
              </div>
              <div className="text-4xl font-bold text-accent mb-2">{crimes.length}</div>
              <p className="text-sm text-muted-foreground">Active and completed crimes</p>
            </button>

            {/* Reports Card */}
            <button
              onClick={() => router.push("/dashboard/reports")}
              className="bg-card border border-border rounded-lg p-6 hover:border-cyan-500 transition-all text-left group"
            >
              <div className="flex items-center gap-4 mb-3">
                <div className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-500/40">
                  <FileText size={28} className="text-cyan-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground group-hover:text-cyan-500 transition-colors">
                    Reports
                  </h2>
                  <p className="text-sm text-muted-foreground">Historical data</p>
                </div>
              </div>
              <div className="text-4xl font-bold text-cyan-500 mb-2">
                <FileText size={40} />
              </div>
              <p className="text-sm text-muted-foreground">Detailed crime reports</p>
            </button>
          </div>
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
