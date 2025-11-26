import type { Crime, Member } from "@/types/crime"
import { formatDate, formatTime } from "@/lib/crimes/formatters"

interface CrimeTimestampsProps {
  crime: Crime
  currentTime: number
  memberMap?: Map<number, Member>
}

function getTimeRemaining(expiredAt: number, currentTime: number): string {
  const remaining = expiredAt - currentTime
  if (remaining <= 0) return "Expired"

  const days = Math.floor(remaining / 86400)
  const hours = Math.floor((remaining % 86400) / 3600)
  const minutes = Math.floor((remaining % 3600) / 60)
  const seconds = Math.floor(remaining % 60)

  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  parts.push(`${seconds}s`)

  return parts.join(" ") + " remaining"
}

function isAllPlanningComplete(crime: Crime): boolean {
  if (crime.status !== "Planning") return false

  for (const slot of crime.slots) {
    if (slot.user?.id) {
      const progress = slot.user.progress ?? 0
      if (progress < 100) {
        return false
      }
    }
  }
  return true
}

function hasFlyingMembers(crime: Crime, memberMap?: Map<number, Member>): boolean {
  if (!memberMap || crime.status !== "Planning") return false

  for (const slot of crime.slots) {
    if (slot.user?.id) {
      const member = memberMap.get(slot.user.id)
      if (member?.status?.state === "Traveling") {
        return true
      }
    }
  }
  return false
}

export default function CrimeTimestamps({ crime, currentTime, memberMap }: CrimeTimestampsProps) {
  if (!crime.created_at && !crime.ready_at && !crime.executed_at && !crime.expired_at) {
    return null
  }

  const allPlanningComplete = isAllPlanningComplete(crime)
  const hasFlyingMember = allPlanningComplete ? hasFlyingMembers(crime, memberMap) : false
  const isExpired = crime.expired_at && currentTime >= crime.expired_at
  const isPlanningDelayed = crime.status === "Planning" && isExpired && !allPlanningComplete
  const isMemberFlyingDelayed = crime.status === "Planning" && isExpired && allPlanningComplete && hasFlyingMember
  const shouldShowExpired = isExpired && !isPlanningDelayed && !isMemberFlyingDelayed

  return (
    <div className="mb-2">
      <div className="grid grid-cols-2 gap-1 text-xs">
        {crime.created_at && (
          <div className="flex items-center gap-1" title={`Created: ${formatTime(crime.created_at)}`}>
            <span className="text-muted-foreground">Created:</span>
            <span className="font-mono text-foreground font-bold">{formatDate(crime.created_at)}</span>
          </div>
        )}
        {crime.ready_at && (
          <div className="flex items-center gap-1" title={`Ready: ${formatTime(crime.ready_at)}`}>
            <span className="text-muted-foreground">Ready:</span>
            <span className="font-mono text-foreground font-bold">{formatDate(crime.ready_at)}</span>
          </div>
        )}
        {crime.executed_at && (
          <div className="flex items-center gap-1" title={`Executed: ${formatTime(crime.executed_at)}`}>
            <span className="text-muted-foreground">Executed:</span>
            <span className="font-mono text-foreground font-bold">{formatDate(crime.executed_at)}</span>
          </div>
        )}
        {!crime.executed_at && crime.expired_at && (
          <div className="flex items-center gap-1" title={`Expires: ${formatTime(crime.expired_at)}`}>
            <span className="text-muted-foreground">Expires:</span>
            <span className="font-mono text-foreground font-bold">{formatDate(crime.expired_at)}</span>
          </div>
        )}
      </div>
      {crime.expired_at && ["Planning", "Recruiting", "Ongoing"].includes(crime.status) && (
        <div
          className={`text-center font-bold mt-1.5 px-2 py-1.5 rounded ${
            shouldShowExpired
              ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/40"
              : isPlanningDelayed
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                : isMemberFlyingDelayed
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                  : "bg-green-500/20 text-green-300 border border-green-500/40"
          }`}
        >
          {shouldShowExpired
            ? "Expired"
            : isPlanningDelayed
              ? "Planning Delayed"
              : isMemberFlyingDelayed
                ? "Member Flying - Delayed"
                : getTimeRemaining(crime.expired_at, currentTime)}
        </div>
      )}
    </div>
  )
}
