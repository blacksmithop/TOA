import { ChevronDown } from 'lucide-react'

interface Crime {
  id: number
  name: string
  status?: string
  rewards?: {
    money?: number
    respect?: number
  }
  slots: Array<{
    user: { id: number } | null
  }>
}

interface MemberCrimeReportProps {
  report: {
    total: number
    crimesByType: { [key: string]: { successful: number; failed: number; total: number } }
  }
  isExpanded: boolean
  onToggle: () => void
}

export function MemberCrimeReport({ report, isExpanded, onToggle }: MemberCrimeReportProps) {
  return (
    <div className="space-y-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity pt-2 border-t border-border/30"
      >
        <span className="text-xs font-bold text-foreground uppercase">
          Report ({report.total} participations)
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
        />
      </button>

      {isExpanded && (
        <div className="mt-2 space-y-2 text-xs animate-in fade-in duration-200">
          {Object.keys(report.crimesByType).length > 0 && (
            <div className="space-y-1.5">
              {Object.entries(report.crimesByType)
                .sort(([, a], [, b]) => b.total - a.total)
                .map(([crimeName, stats]) => (
                  <div
                    key={crimeName}
                    className="bg-background border border-border/30 rounded px-2 py-1.5 space-y-1"
                  >
                    <div className="font-bold text-foreground">{crimeName}</div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-muted-foreground">Total: {stats.total}</span>
                      {stats.successful > 0 && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-green-400 font-bold">Success: {stats.successful}</span>
                        </>
                      )}
                      {stats.failed > 0 && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-red-400 font-bold">Failed: {stats.failed}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
