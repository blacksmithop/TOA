"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { LogOut, MoreVertical, ArrowLeft, Info, RotateCcw, Heart, AlertTriangle, Settings, X } from "lucide-react"
import { handleApiError, validateApiResponse } from "@/lib/api-error-handler"
import { ResetConfirmationDialog } from "@/components/reset-confirmation-dialog"
import { clearAllCache } from "@/lib/cache/cache-reset"
import { handleFullLogout } from "@/lib/logout-handler"
import type { MedicalItem, MedicalAlertSettings } from "@/lib/medical-types"
import { DEFAULT_MEDICAL_ALERTS } from "@/lib/medical-types"

export default function MedicalPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [medicalItems, setMedicalItems] = useState<MedicalItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [alertSettings, setAlertSettings] = useState<MedicalAlertSettings>(DEFAULT_MEDICAL_ALERTS)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [tempAlertSettings, setTempAlertSettings] = useState<MedicalAlertSettings>(DEFAULT_MEDICAL_ALERTS)

  useEffect(() => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (!apiKey) {
      router.push("/")
      return
    }

    const savedSettings = localStorage.getItem("medicalAlertSettings")
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setAlertSettings({ ...DEFAULT_MEDICAL_ALERTS, ...parsed })
        setTempAlertSettings({ ...DEFAULT_MEDICAL_ALERTS, ...parsed })
      } catch (e) {
        console.error("[v0] Failed to parse medical alert settings:", e)
      }
    }

    fetchMedicalData(apiKey)
  }, [router])

  const fetchMedicalData = async (apiKey: string) => {
    setIsLoading(true)

    try {
      const res = await fetch(`https://api.torn.com/faction/?selections=medical&comment=oc_dashboard_medical`, {
        headers: { Authorization: `ApiKey ${apiKey}`, accept: "application/json" },
      })

      if (!res.ok) {
        await handleApiError(res, "/faction/medical")
        return
      }

      const data = await res.json()
      validateApiResponse(data, "/faction/medical")

      if (data.medical) {
        setMedicalItems(data.medical)
        toast({
          title: "Success",
          description: `Loaded ${data.medical.length} medical items`,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch medical data"
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
    handleFullLogout()
    toast({
      title: "Success",
      description: "Logged out successfully",
    })
    setTimeout(() => router.push("/"), 500)
  }

  const handleReset = async () => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (apiKey) {
      clearAllCache()
      setMedicalItems([])
      await fetchMedicalData(apiKey)
      toast({
        title: "Success",
        description: "Cache cleared successfully",
      })
    }
  }

  const handleRefresh = async () => {
    const apiKey = localStorage.getItem("factionApiKey")
    if (apiKey) {
      await fetchMedicalData(apiKey)
    }
  }

  const handleSaveSettings = () => {
    localStorage.setItem("medicalAlertSettings", JSON.stringify(tempAlertSettings))
    setAlertSettings(tempAlertSettings)
    setShowSettingsModal(false)
    toast({
      title: "Settings saved",
      description: "Medical alert thresholds updated",
    })
  }

  const isLowStock = (item: MedicalItem) => {
    const threshold = alertSettings[item.ID] ?? 0
    return item.quantity < threshold
  }

  const getItemCategory = (item: MedicalItem): string => {
    if (item.name.includes("Blood Bag") && item.name !== "Empty Blood Bag") {
      return "Blood Bags (Filled)"
    }
    if (item.name === "Empty Blood Bag") {
      return "Empty Blood Bags"
    }
    if (item.name.includes("First Aid Kit") || item.name.includes("Bandage")) {
      return "First Aid Kits"
    }
    return "Other Medical Items"
  }

  const groupedItems = medicalItems.reduce(
    (acc, item) => {
      const category = getItemCategory(item)
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(item)
      return acc
    },
    {} as Record<string, MedicalItem[]>,
  )

  const categoryOrder = ["Blood Bags (Filled)", "Empty Blood Bags", "First Aid Kits", "Other Medical Items"]
  const sortedCategories = Object.keys(groupedItems).sort((a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading medical data...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <ResetConfirmationDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen} onConfirm={handleReset} />

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Configure Alert Thresholds</h2>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4">
              {medicalItems.map((item) => (
                <div
                  key={item.ID}
                  className="flex items-center justify-between gap-4 p-3 bg-background rounded-lg border border-border"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-sm text-muted-foreground">Current stock: {item.quantity}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-muted-foreground">Alert when below:</label>
                    <input
                      type="number"
                      min="0"
                      value={tempAlertSettings[item.ID] ?? 0}
                      onChange={(e) =>
                        setTempAlertSettings({
                          ...tempAlertSettings,
                          [item.ID]: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-24 px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-6 border-t border-border flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

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
              <h1 className="text-3xl font-bold text-foreground">Medical</h1>
              <p className="text-muted-foreground mt-1">Faction medical inventory</p>
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
                      setDropdownOpen(false)
                      setResetDialogOpen(true)
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-accent transition-colors border-t border-border"
                  >
                    <RotateCcw size={18} />
                    Reset
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
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Heart className="h-8 w-8 text-rose-500" />
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Medical Inventory</h2>
                  <p className="text-sm text-muted-foreground">{medicalItems.length} item types</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors flex items-center gap-2"
                >
                  <Settings size={18} />
                  Alert Settings
                </button>
                <button
                  onClick={handleRefresh}
                  className="px-6 py-3 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors flex items-center gap-2 font-semibold"
                >
                  <RotateCcw size={20} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {medicalItems.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center">
              <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-bold text-foreground mb-2">No Medical Items</h3>
              <p className="text-muted-foreground">Your faction medical inventory is empty</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedCategories.map((category) => (
                <div key={category} className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    {category}
                    <span className="text-sm text-muted-foreground font-normal">
                      ({groupedItems[category].length} items)
                    </span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                    {groupedItems[category].map((item) => {
                      const lowStock = isLowStock(item)
                      return (
                        <div
                          key={item.ID}
                          className={`bg-background border rounded-lg p-3 transition-all hover:scale-105 ${
                            lowStock
                              ? "border-red-500/50 bg-red-500/5 ring-1 ring-red-500/20"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            {/* Item thumbnail */}
                            <div className="relative">
                              <img
                                src={`https://www.torn.com/images/items/${item.ID}/large.png`}
                                alt={item.name}
                                className="w-16 h-16 object-contain"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.svg?height=64&width=64"
                                }}
                              />
                              {lowStock && (
                                <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                                  <AlertTriangle size={12} className="text-white" />
                                </div>
                              )}
                            </div>

                            {/* Item name */}
                            <div className="text-center w-full">
                              <p
                                className="font-semibold text-foreground text-xs leading-tight line-clamp-2"
                                title={item.name}
                              >
                                {item.name}
                              </p>
                            </div>

                            {/* Quantity */}
                            <div className="text-center w-full">
                              <p className={`text-xl font-bold ${lowStock ? "text-red-500" : "text-primary"}`}>
                                {item.quantity.toLocaleString()}
                              </p>
                              {alertSettings[item.ID] > 0 && (
                                <p className="text-[10px] text-muted-foreground">Alert: {alertSettings[item.ID]}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-border bg-card/30 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            ©{" "}
            <a
              href="https://www.torn.com/profiles.php?XID=1712955"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors"
            >
              oxiblurr [1712955]
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}
