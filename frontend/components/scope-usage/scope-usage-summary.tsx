interface ScopeUsageSummaryProps {
  totalScopeUsed: number
  totalSpawns: number
  avgScope: number
}

export default function ScopeUsageSummary({ totalScopeUsed, totalSpawns, avgScope }: ScopeUsageSummaryProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h2 className="text-xl font-semibold text-foreground mb-4">Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="text-sm text-muted-foreground">Total Scope Used</div>
          <div className="text-3xl font-bold text-foreground">{totalScopeUsed.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Total Spawns</div>
          <div className="text-3xl font-bold text-foreground">{totalSpawns.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-sm text-muted-foreground">Average Scope/Spawn</div>
          <div className="text-3xl font-bold text-foreground">
            {avgScope.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  )
}
