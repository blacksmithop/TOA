"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { RefreshCw, LogOut, MoreVertical, Info, Play, Loader2, ChevronDown } from "lucide-react"
import { fetchAndCacheItems } from "@/lib/items-cache"
import type { TornItem } from "@/lib/items-cache"
import { VictoryPie } from "victory"
import ItemModal from "@/components/item-modal"

interface Crime {
  id: number
  name: string
  status: string
  executed_at: number
  rewards?: {
    money: number
    items: Array<{ id: number; quantity: number }>
    respect: number
  }
  [key: string]: any
}

interface CrimesResponse {
  crimes: Record<string, Crime>
}

export default function ReportsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [totalCrimes, setTotalCrimes] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentWeek, setCurrentWeek] = useState(0)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [crimes, setCrimes] = useState<Crime[]>([])
  const [items, setItems] = useState<Map<number, TornItem>>(new Map())
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [expandedCrimes, setExpandedCrimes] = useState<Set<string>>(new Set())

  const WEEK_IN_SECONDS = 7 * 24 * 60 * 60
  const REQUEST_DELAY = 2000

  useEffect(() => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (!apiKey) {
      router.push("/")
      return
    }

    // Load cached crimes
    const cached = localStorage.getItem("factionCrimesReport")
    if (cached) {
      try {
        const data = JSON.parse(cached)
        setCrimes(data)
        setTotalCrimes(data.length || 0)
      } catch (e) {
        console.error("Failed to parse cached crimes:", e)
      }
    }

    // Fetch items data
    fetchAndCacheItems(apiKey).then((itemsData) => {
      setItems(itemsData)
    })
  }, [router])

  const summary = useMemo(() => {
    let totalMoney = 0
    let totalRespect = 0
    let totalItemValue = 0
    const statusCounts = {
      Planning: 0,
      Recruiting: 0,
      Successful: 0,
      Failed: 0,
      Expired: 0,
    }
    const itemsGained = new Map<number, { item: any; quantity: number; totalValue: number }>()

    crimes.forEach((crime) => {
      const status = crime.status === "Failure" ? "Failed" : crime.status
      if (status in statusCounts) {
        statusCounts[status as keyof typeof statusCounts]++
      }

      if (crime.status === "Successful" && crime.rewards) {
        totalMoney += crime.rewards.money || 0
        totalRespect += crime.rewards.respect || 0

        if (crime.rewards.items && crime.rewards.items.length > 0) {
          crime.rewards.items.forEach((item) => {
            const itemData = items.get(item.id)
            if (itemData && itemData.value?.market_price) {
              const itemValue = itemData.value.market_price * item.quantity
              totalItemValue += itemValue

              if (itemsGained.has(item.id)) {
                const existing = itemsGained.get(item.id)!
                existing.quantity += item.quantity
                existing.totalValue += itemValue
              } else {
                itemsGained.set(item.id, {
                  item: itemData,
                  quantity: item.quantity,
                  totalValue: itemValue,
                })
              }
            }
          })
        }
      }
    })

    const totalValue = totalMoney + totalItemValue

    return {
      totalValue,
      totalMoney,
      totalItemValue,
      totalRespect,
      statusCounts,
      itemsGained: Array.from(itemsGained.values()),
    }
  }, [crimes, items])

  const crimeStats = useMemo(() => {
    const stats = new Map<string, { successful: number; failed: number }>()

    crimes.forEach((crime) => {
      if (crime.status === "Successful") {
        const existing = stats.get(crime.name) || { successful: 0, failed: 0 }
        existing.successful++
        stats.set(crime.name, existing)
      } else if (crime.status === "Failure" || crime.status === "Failed") {
        const existing = stats.get(crime.name) || { successful: 0, failed: 0 }
        existing.failed++
        stats.set(crime.name, existing)
      }
    })

    return Array.from(stats.entries())
      .map(([name, data]) => ({
        name,
        successful: data.successful,
        failed: data.failed,
        total: data.successful + data.failed,
        successRate: ((data.successful / (data.successful + data.failed)) * 100).toFixed(1),
      }))
      .sort((a, b) => b.total - a.total)
  }, [crimes])

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  const fetchCompletedCrimes = async () => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (!apiKey) return

    setIsLoading(true)
    setIsPaused(false)
    setCurrentWeek(0)

    try {
      const allCrimes: Crime[] = []
      let hasMoreData = true
      let weekCount = 0
      let oldestTimestamp: number | null = null
      let lastOldestCrimeId: number | null = null

      const firstResponse = await fetch(
        `https://api.torn.com/v2/faction/crimes?cat=completed&sort=DESC&striptags=true`,
        {
          headers: {
            Authorization: `ApiKey ${apiKey}`,
            accept: "application/json",
          },
        },
      )

      if (!firstResponse.ok) {
        throw new Error("Failed to fetch crimes data")
      }

      const firstData: CrimesResponse = await firstResponse.json()

      if (firstData.crimes) {
        const crimesArray = Object.values(firstData.crimes)
        allCrimes.push(...crimesArray)
        setCrimes(allCrimes)
        setTotalCrimes(allCrimes.length)

        if (crimesArray.length > 0) {
          const oldestCrime = crimesArray.reduce((oldest, crime) =>
            crime.executed_at < oldest.executed_at ? crime : oldest,
          )
          oldestTimestamp = oldestCrime.executed_at
          lastOldestCrimeId = oldestCrime.id
        } else {
          hasMoreData = false
        }
      } else {
        hasMoreData = false
      }

      while (hasMoreData && !isPaused && oldestTimestamp) {
        await delay(REQUEST_DELAY)
        weekCount++
        setCurrentWeek(weekCount)

        const response = await fetch(
          `https://api.torn.com/v2/faction/crimes?cat=completed&sort=DESC&to=${oldestTimestamp}&striptags=true`,
          {
            headers: {
              Authorization: `ApiKey ${apiKey}`,
              accept: "application/json",
            },
          },
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch crimes for week ${weekCount}`)
        }

        const data: CrimesResponse = await response.json()

        if (data.crimes && Object.keys(data.crimes).length > 0) {
          const crimesArray = Object.values(data.crimes)

          const newOldestCrime = crimesArray.reduce((oldest, crime) =>
            crime.executed_at < oldest.executed_at ? crime : oldest,
          )

          if (newOldestCrime.id === lastOldestCrimeId) {
            hasMoreData = false
            break
          }

          allCrimes.push(...crimesArray)
          setCrimes(allCrimes)
          setTotalCrimes(allCrimes.length)

          oldestTimestamp = newOldestCrime.executed_at
          lastOldestCrimeId = newOldestCrime.id
        } else {
          hasMoreData = false
        }

        if (weekCount >= 52) {
          hasMoreData = false
          toast({
            title: "Success",
            description: "Reached 1 year limit. Stopping fetch.",
          })
        }
      }

      if (allCrimes.length > 0) {
        localStorage.setItem("factionCrimesReport", JSON.stringify(allCrimes))
      }

      if (!isPaused) {
        toast({
          title: "Success",
          description: `Successfully fetched ${allCrimes.length} crimes over ${weekCount} weeks`,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch crimes"
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

  const formatNumber = (num: number) => new Intl.NumberFormat().format(num)
  const formatCurrency = (num: number) => `$${formatNumber(num)}`

  const toggleCrime = (crimeName: string) => {
    const newExpanded = new Set(expandedCrimes)
    if (newExpanded.has(crimeName)) {
      newExpanded.delete(crimeName)
    } else {
      newExpanded.add(crimeName)
    }
    setExpandedCrimes(newExpanded)
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <header className="flex-shrink-0 border-b border-border bg-card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <button onClick={() => router.push("/dashboard")} className="hover:opacity-80 transition-opacity">
              <h1 className="text-3xl font-bold text-foreground">Crime Reports</h1>
            </button>
            <p className="text-muted-foreground mt-1">Detailed historical crime data</p>
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
                      router.push("/dashboard")
                      setDropdownOpen(false)
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-accent transition-colors border-t border-border"
                  >
                    <RefreshCw size={18} />
                    Dashboard
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
          {/* Total Crimes Card */}
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-muted-foreground mb-4">Total Completed Crimes</h2>
            <div className="text-6xl font-bold text-primary mb-2">{totalCrimes.toLocaleString()}</div>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
                <Loader2 size={16} className="animate-spin" />
                <span>Fetching week {currentWeek}...</span>
              </div>
            )}
          </div>

          {/* Fetch Control */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Fetch Historical Data</h3>
              <button
                onClick={fetchCompletedCrimes}
                disabled={isLoading}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Play size={18} />
                    Start Fetch
                  </>
                )}
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              This will fetch all completed crimes by cycling back in time using the oldest timestamp. The process may
              take several minutes depending on your faction's history. Requests are spaced 2 seconds apart.
            </p>
          </div>

          {crimes.length > 0 && (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-card p-3 rounded-lg border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">Total Value</div>
                  <div className="text-lg font-bold text-green-400">{formatCurrency(summary.totalValue)}</div>
                </div>
                <div className="bg-card p-3 rounded-lg border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">Direct Money</div>
                  <div className="text-lg font-bold text-green-400">{formatCurrency(summary.totalMoney)}</div>
                </div>
                <div className="bg-card p-3 rounded-lg border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">Item Value</div>
                  <div className="text-lg font-bold text-orange-400">{formatCurrency(summary.totalItemValue)}</div>
                </div>
                <div className="bg-card p-3 rounded-lg border border-border/50">
                  <div className="text-xs text-muted-foreground mb-1">Total Respect</div>
                  <div className="text-lg font-bold text-blue-400">{formatNumber(summary.totalRespect)}</div>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="bg-card p-3 rounded-lg border border-border/50">
                <div className="text-xs text-muted-foreground mb-2 font-bold">Status Breakdown</div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Planning:</span>
                    <span className="font-bold text-blue-400">{summary.statusCounts.Planning}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Recruiting:</span>
                    <span className="font-bold text-purple-400">{summary.statusCounts.Recruiting}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Successful:</span>
                    <span className="font-bold text-green-400">{summary.statusCounts.Successful}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Failure:</span>
                    <span className="font-bold text-red-400">{summary.statusCounts.Failed}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">Expired:</span>
                    <span className="font-bold text-gray-400">{summary.statusCounts.Expired}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground mb-3">Crime-Specific Analysis</h3>
                {crimeStats.map((crime) => {
                  const isExpanded = expandedCrimes.has(crime.name)
                  const pieData = [
                    {
                      x: "Success",
                      y: crime.successful,
                      label: `Success: ${crime.successful} (${crime.successRate}%)`,
                    },
                    {
                      x: "Fail",
                      y: crime.failed,
                      label: `Fail: ${crime.failed} (${(100 - Number.parseFloat(crime.successRate)).toFixed(1)}%)`,
                    },
                  ]
                  const colors = ["#22c55e", "#ef4444"]

                  return (
                    <div key={crime.name} className="bg-card border border-border/50 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleCrime(crime.name)}
                        className="w-full flex items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <h4 className="font-semibold text-foreground">{crime.name}</h4>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-green-400 font-bold">{crime.successful} Success</span>
                            <span className="text-red-400 font-bold">{crime.failed} Failed</span>
                            <span className="text-muted-foreground">({crime.successRate}%)</span>
                          </div>
                        </div>
                        <ChevronDown
                          size={20}
                          className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="p-6 border-t border-border/50 animate-in fade-in duration-200">
                          <div className="flex justify-center">
                            <svg width={300} height={300} style={{ overflow: "visible" }}>
                              <VictoryPie
                                standalone={false}
                                width={300}
                                height={300}
                                data={pieData}
                                innerRadius={0}
                                colorScale={colors}
                                style={{
                                  labels: { fill: "transparent" },
                                  data: {
                                    stroke: "#ffffff",
                                    strokeWidth: 2,
                                  },
                                }}
                                animate={{
                                  duration: 500,
                                }}
                              />
                            </svg>
                          </div>
                          <div className="flex justify-center gap-4 mt-4">
                            {pieData.map((entry, index) => (
                              <div key={`legend-${index}`} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index] }} />
                                <span className="text-sm font-medium" style={{ color: colors[index] }}>
                                  {entry.label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
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
