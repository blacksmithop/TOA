interface Member {
  id: number
  name: string
  level: number
  status: {
    description: string
    state: string
    color: string
  }
  position: string
  last_action: {
    status: string
    relative: string
    timestamp: number
  }
  days_in_faction: number
  money?: number
  bs_estimate_human?: string | null
  crimes_rank?: number
  nnb?: number
}

interface MemberCardProps {
  member: Member
  isInCrime: boolean
  crimeInfo?: { id: number; name: string }
  report: {
    total: number
    successful: number
    failed: number
    planning: number
    recruiting: number
    totalMoney: number
    totalRespect: number
    crimesByType: { [key: string]: { successful: number; failed: number; total: number } }
  } | null
  isReportExpanded: boolean
  onToggleReport: () => void
  onFilterByCrime?: (memberId: number) => void
  children?: React.ReactNode
}

export function MemberCard({
  member,
  isInCrime,
  crimeInfo,
  report,
  isReportExpanded,
  onToggleReport,
  onFilterByCrime,
  children,
}: MemberCardProps) {
  const formatLastAction = (timestamp: number) => {
    const now = Date.now() / 1000
    const diffSeconds = now - timestamp
    const diffMinutes = Math.floor(diffSeconds / 60)
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) return `${diffDays}d ago`
    if (diffHours > 0) return `${diffHours}h ago`
    if (diffMinutes > 0) return `${diffMinutes}m ago`
    return "Just now"
  }

  const formatCurrency = (num: number) => {
    return `$${new Intl.NumberFormat().format(num)}`
  }

  const getStatusIcon = (state: string) => {
    const iconMap: { [key: string]: string } = {
      online: "●",
      idle: "●",
      offline: "●",
    }
    const colorMap: { [key: string]: string } = {
      online: "text-green-500",
      idle: "text-yellow-500",
      offline: "text-gray-500",
    }
    return <span className={`text-lg ${colorMap[state] || "text-gray-500"}`}>{iconMap[state] || "●"}</span>
  }

  const getStatusColor = (color: string) => {
    const colors: { [key: string]: string } = {
      green: "bg-green-500/20 text-green-400 border-green-500/30",
      red: "bg-red-500/20 text-red-400 border-red-500/30",
      yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      gray: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    }
    return colors[color] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
  }

  return (
    <div className="bg-card border border-border rounded-lg p-3 hover:border-primary transition-all">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getStatusIcon(member.status.state)}
          <div className="flex-1 min-w-0">
            <a
              href={`https://www.torn.com/profiles.php?XID=${member.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-base text-foreground leading-tight hover:text-accent hover:underline transition-colors block truncate"
            >
              {member.name}
            </a>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="font-bold text-primary">Lvl {member.level}</span>
              <span>•</span>
              <span>{member.position}</span>
              {member.bs_estimate_human && (
                <>
                  <span>•</span>
                  <span className="font-bold text-cyan-400" title="Battle stat estimate from FF Scouter">
                    ~{member.bs_estimate_human}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="text-xs space-y-1 mb-2">
        <div className="text-muted-foreground">
          <span className="font-bold">Last seen:</span> {formatLastAction(member.last_action.timestamp)}
        </div>
        <div className="text-muted-foreground">
          <span className="font-bold">Days in Faction:</span> {member.days_in_faction}
        </div>
        {member.crimes_rank !== undefined && (
          <div className="text-muted-foreground">
            <span className="font-bold">Crime Rank:</span>{" "}
            <span className="font-bold text-yellow-400">#{member.crimes_rank}</span>
          </div>
        )}
        {member.nnb !== undefined && member.nnb > 0 && (
          <div className="text-muted-foreground">
            <span className="font-bold">NNB:</span> <span className="font-bold text-purple-400">{member.nnb}</span>
          </div>
        )}
        {member.money !== undefined && (
          <div className="text-green-400 font-bold">
            <span className="text-muted-foreground font-bold">Balance:</span> {formatCurrency(member.money)}
          </div>
        )}
      </div>

      <div className="mb-2">
        <span
          className={`text-xs px-2 py-1 rounded-md border font-bold inline-block ${getStatusColor(member.status.color)}`}
        >
          {member.status.description}
        </span>
      </div>

      {children}

      {isInCrime && crimeInfo && (
        <div className="flex gap-2 pt-2">
          <a
            href={`https://www.torn.com/factions.php?step=your&type=1#/tab=crimes&crimeId=${crimeInfo.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs px-3 py-1.5 rounded-md bg-accent text-white border border-accent font-bold hover:bg-accent/80 transition-all"
          >
            View
          </a>
          <button
            onClick={() => onFilterByCrime?.(member.id)}
            className="text-xs px-3 py-1.5 rounded-md bg-primary text-white border border-primary font-bold hover:bg-primary/80 transition-all"
            title="Filter crimes"
          >
            Filter
          </button>
        </div>
      )}
    </div>
  )
}
