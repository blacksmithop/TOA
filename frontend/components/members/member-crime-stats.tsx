interface MemberCrimeStatsProps {
  report: {
    total: number
    successful: number
    failed: number
    planning: number
    recruiting: number
    totalMoney: number
    totalRespect: number
  }
}

export function MemberCrimeStats({ report }: MemberCrimeStatsProps) {
  const formatCurrency = (num: number) => {
    return `$${new Intl.NumberFormat().format(num)}`
  }

  return (
    <div className="space-y-2">
      <div className="text-xs font-bold text-foreground">Crime Stats:</div>
      <div className="flex flex-wrap gap-2">
        {report.successful > 0 && (
          <div className="bg-green-500/20 border border-green-500/30 rounded px-2 py-1 text-xs">
            <span className="text-green-400 font-bold">Successful: {report.successful}</span>
          </div>
        )}
        {report.failed > 0 && (
          <div className="bg-red-500/20 border border-red-500/30 rounded px-2 py-1 text-xs">
            <span className="text-red-400 font-bold">Failed: {report.failed}</span>
          </div>
        )}
        {report.planning > 0 && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded px-2 py-1 text-xs">
            <span className="text-blue-400 font-bold">Planning: {report.planning}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-background border border-border/30 rounded px-2 py-1">
          <div className="text-muted-foreground">Money Earned</div>
          <div className="font-bold text-green-400">{formatCurrency(report.totalMoney)}</div>
        </div>
        <div className="bg-background border border-border/30 rounded px-2 py-1">
          <div className="text-muted-foreground">Respect Earned</div>
          <div className="font-bold text-blue-400">{report.totalRespect}</div>
        </div>
      </div>
    </div>
  )
}
