import { RefreshCw, Settings } from 'lucide-react'

interface ScopeUsageStatsProps {
  totalLogs: number
  maxFetchCount: number
  isFetching: boolean
  fetchProgress: { current: number; max: number }
  onFetch: () => void
  onConfigClick: () => void
}

export default function ScopeUsageStats({
  totalLogs,
  maxFetchCount,
  isFetching,
  fetchProgress,
  onFetch,
  onConfigClick,
}: ScopeUsageStatsProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Scope Usage Data</h2>
        <button
          onClick={onConfigClick}
          className="p-2 hover:bg-accent rounded-lg transition-colors border border-border"
          title="Configure Backfill"
        >
          <Settings size={20} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-sm text-muted-foreground">Cached Entries</div>
          <div className="text-3xl font-bold text-foreground">{totalLogs.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Max Fetch</div>
          <div className="text-3xl font-bold text-foreground">{maxFetchCount.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Progress</div>
          <div className="text-3xl font-bold text-foreground">
            {isFetching ? `${fetchProgress.current}/${fetchProgress.max}` : '—'}
          </div>
        </div>
      </div>
      <button
        onClick={onFetch}
        disabled={isFetching}
        className="w-full px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
        {isFetching ? 'Fetching Historical Data...' : 'Fetch Historical Data'}
      </button>
    </div>
  )
}
