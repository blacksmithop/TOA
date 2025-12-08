"use client"

import { useState, useEffect } from "react"
import { Copy, Check, ExternalLink, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { fetchAndCacheBalance, type FactionBalance } from "@/lib/cache/balance-cache"
import { canAccessBalance } from "@/lib/api-scopes"

export function WithdrawUrlGenerator() {
  const { toast } = useToast()
  const [balance, setBalance] = useState<FactionBalance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [amount, setAmount] = useState<string>("")
  const [selectedMemberId, setSelectedMemberId] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [generatedUrl, setGeneratedUrl] = useState<string>("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    if (!canAccessBalance()) {
      toast({
        title: "Balance scope required",
        description: "Please add the 'balance' scope to your API key",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    const apiKey = localStorage.getItem("factionApiKey")
    if (!apiKey) {
      setIsLoading(false)
      return
    }

    try {
      const balanceData = await fetchAndCacheBalance(apiKey)
      setBalance(balanceData)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load faction data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${new Intl.NumberFormat().format(amount)}`
  }

  const getSelectedMemberBalance = () => {
    if (!balance || !selectedMemberId) return 0
    const member = balance.members.find((m) => m.id.toString() === selectedMemberId)
    return member?.money || 0
  }

  const getSelectedMemberName = () => {
    if (!balance || !selectedMemberId) return ""
    const member = balance.members.find((m) => m.id.toString() === selectedMemberId)
    return member?.username || ""
  }

  const handleAmountChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "")
    setAmount(cleaned)
    setGeneratedUrl("")
  }

  const handleSetMax = () => {
    const memberBalance = getSelectedMemberBalance()
    if (memberBalance > 0) {
      setAmount(memberBalance.toString())
      setGeneratedUrl("")
    }
  }

  const generateUrl = () => {
    const numAmount = Number.parseInt(amount || "0")
    const memberBalance = getSelectedMemberBalance()

    if (!selectedMemberId) {
      toast({
        title: "No member selected",
        description: "Please select a member to withdraw to",
        variant: "destructive",
      })
      return
    }

    if (numAmount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      })
      return
    }

    if (numAmount > memberBalance) {
      toast({
        title: "Insufficient balance",
        description: `Amount exceeds ${getSelectedMemberName()}'s balance of ${formatCurrency(memberBalance)}`,
        variant: "destructive",
      })
      return
    }

    const url = `https://www.torn.com/factions.php?step=your#/tab=controls&giveMoneyTo=${selectedMemberId}&money=${numAmount}`
    setGeneratedUrl(url)
  }

  const handleCopyUrl = () => {
    if (generatedUrl) {
      navigator.clipboard.writeText(generatedUrl)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Withdraw URL copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleOpenUrl = () => {
    if (generatedUrl) {
      window.open(generatedUrl, "_blank", "noopener,noreferrer")
    }
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!balance) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center">
          <DollarSign className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">Unable to load faction balance</p>
          <p className="text-sm text-muted-foreground mt-1">Ensure you have the balance scope enabled</p>
        </div>
      </div>
    )
  }

  const sortedMembers = [...balance.members].sort((a, b) => a.username.localeCompare(b.username))
  const memberBalance = getSelectedMemberBalance()

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <DollarSign className="h-8 w-8 text-green-500" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Withdraw</h2>
          <p className="text-sm text-muted-foreground">
            Faction Balance: <span className="font-bold text-green-400">{formatCurrency(balance.total)}</span>
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Select Member</label>
          <select
            value={selectedMemberId}
            onChange={(e) => {
              setSelectedMemberId(e.target.value)
              setAmount("")
              setGeneratedUrl("")
            }}
            className="w-full px-3 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">-- Select a member --</option>
            {sortedMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.username} - {formatCurrency(member.money)}
              </option>
            ))}
          </select>
          {selectedMemberId && (
            <p className="text-sm text-muted-foreground mt-2">
              Member Balance: <span className="font-bold text-green-400">{formatCurrency(memberBalance)}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Withdraw Amount</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={amount ? Number.parseInt(amount).toLocaleString() : ""}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0"
                disabled={!selectedMemberId}
                className="w-full pl-7 pr-3 py-3 bg-background border border-border rounded-lg text-foreground font-mono text-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              onClick={handleSetMax}
              disabled={!selectedMemberId || memberBalance === 0}
              className="px-4 py-3 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors font-semibold whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Max
            </button>
          </div>
          {amount && selectedMemberId && Number.parseInt(amount) > memberBalance && (
            <p className="text-xs text-red-400 mt-1">Amount exceeds member's available balance</p>
          )}
        </div>

        <button
          onClick={generateUrl}
          disabled={
            !amount || !selectedMemberId || Number.parseInt(amount) <= 0 || Number.parseInt(amount) > memberBalance
          }
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          Generate Withdraw URL
        </button>

        {generatedUrl && (
          <div className="p-4 bg-background rounded-lg border border-border space-y-3">
            <label className="block text-sm font-semibold text-foreground">Generated URL</label>
            <div className="p-3 bg-card rounded border border-border break-all text-sm font-mono text-muted-foreground">
              {generatedUrl}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCopyUrl}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                {copied ? (
                  <>
                    <Check size={18} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={18} />
                    Copy URL
                  </>
                )}
              </button>
              <button
                onClick={handleOpenUrl}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} />
                Open in Torn
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
