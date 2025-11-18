"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { ArrowLeft, MoreVertical, LogOut, RefreshCw } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"
import { fetchAndCacheCrimeNews, type CrimeNewsItem } from "@/lib/cache/crimenews-cache"
import { handleFullLogout } from "@/lib/logout-handler"

interface ScopeUsageEntry {
  user: string
  userId: number
  scenario: string
  scopeUsed: number
  timestamp: number
  crimeId?: string
}

export default function ScopeUsagePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [scopeUsage, setScopeUsage] = useState<ScopeUsageEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (!apiKey) {
      router.push("/")
      return
    }

    loadScopeUsage(apiKey)
  }, [router])

  const loadScopeUsage = async (apiKey: string) => {
    setIsLoading(true)
    try {
      const crimeNews = await fetchAndCacheCrimeNews(apiKey)
      const usageEntries: ScopeUsageEntry[] = []

      crimeNews.forEach((item, id) => {
        // Parse scope usage entries
        // Pattern: "User used X scope spawning the [difficulty] scenario Name [view]"
        const scopeRegex = /<a href\s*=\s*"[^"]*XID=(\d+)">([^<]+)<\/a>\s+used\s+(\d+)\s+scope\s+spawning\s+the\s+\w+\s+scenario\s+<span[^>]*>([^<]+)<\/span>/i
        const match = item.news.match(scopeRegex)
        
        if (match) {
          // Extract crime ID from the view link
          const crimeIdMatch = item.news.match(/crimeId=(\d+)/)
          
          usageEntries.push({
            userId: Number.parseInt(match[1]),
            user: match[2],
            scopeUsed: Number.parseInt(match[3]),
            scenario: match[4],
            timestamp: item.timestamp,
            crimeId: crimeIdMatch ? crimeIdMatch[1] : undefined,
          })
        }
      })

      // Sort by timestamp descending
      usageEntries.sort((a, b) => b.timestamp - a.timestamp)
      setScopeUsage(usageEntries)

      toast({
        title: "Success",
        description: `Loaded ${usageEntries.length} scope usage entries`,
      })
    } catch (error) {
      console.error("[v0] Error loading scope usage:", error)
      toast({
        title: "Error",
        description: "Failed to load scope usage data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (apiKey) {
      await loadScopeUsage(apiKey)
    }
  }

  const handleLogout = () => {
    handleFullLogout()
    toast({
      title: "Success",
      description: "Logged out successfully",
    })
    setTimeout(() => router.push("/"), 500)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const totalScopeUsed = scopeUsage.reduce((sum, entry) => sum + entry.scopeUsed, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading scope usage...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <header className="flex-shrink-0 border-b border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard/crimes")}
              className="p-2 hover:bg-accent rounded-lg transition-colors border border-border"
              title="Back to Crimes"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Scope Usage</h1>
              <p className="text-muted-foreground mt-1">Track scope spending across scenarios</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-accent rounded-lg transition-colors border border-border"
              title="Refresh"
            >
              <RefreshCw size={20} />
            </button>
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
                        handleLogout()
                        setDropdownOpen(false)
                      }}
                      className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-destructive/10 text-destructive transition-colors"
                    >
                      <LogOut size={18} />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Summary Card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Scope Used</div>
                <div className="text-3xl font-bold text-foreground">{totalScopeUsed}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Spawns</div>
                <div className="text-3xl font-bold text-foreground">{scopeUsage.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Average Scope/Spawn</div>
                <div className="text-3xl font-bold text-foreground">
                  {scopeUsage.length > 0 ? (totalScopeUsed / scopeUsage.length).toFixed(1) : 0}
                </div>
              </div>
            </div>
          </div>

          {/* Usage Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">Scope Usage History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Scenario</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Scope Used</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Crime ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scopeUsage.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No scope usage data available
                      </td>
                    </tr>
                  ) : (
                    scopeUsage.map((entry, index) => (
                      <tr key={index} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-sm">
                          <a
                            href={`https://www.torn.com/profiles.php?XID=${entry.userId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            {entry.user}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">{entry.scenario}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold text-foreground">
                          {entry.scopeUsed}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(entry.timestamp)}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          {entry.crimeId ? (
                            <a
                              href={`https://www.torn.com/factions.php?step=your#/tab=crimes&crimeId=${entry.crimeId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              #{entry.crimeId}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
