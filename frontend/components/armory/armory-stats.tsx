"use client"

import { RefreshCw, Package, Settings } from 'lucide-react'

interface ArmoryStatsProps {
  totalLogs: number
  maxFetchCount: number
  isFetching: boolean
  fetchProgress: { current: number; max: number }
  onFetch: () => void
  onConfigClick: () => void
}

export default function ArmoryStats({
  totalLogs,
  maxFetchCount,
  isFetching,
  fetchProgress,
  onFetch,
  onConfigClick,
}: ArmoryStatsProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-xl font-bold text-foreground">Total Armory Logs</h2>
            <button
              onClick={onConfigClick}
              className="p-1.5 hover:bg-accent rounded-lg transition-colors"
              title="Configure max fetch count"
            >
              <Settings size={18} className="text-muted-foreground hover:text-foreground" />
            </button>
          </div>
          <div className="text-4xl font-bold text-primary">{totalLogs}</div>
          <div className="text-xs text-muted-foreground mt-1">Max fetch: {maxFetchCount} logs</div>
        </div>
        <button
          onClick={onFetch}
          disabled={isFetching}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isFetching ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              Fetching {fetchProgress.current}/{fetchProgress.max}...
            </>
          ) : (
            <>
              <Package size={20} />
              Fetch Historical Data
            </>
          )}
        </button>
      </div>
    </div>
  )
}
