import type { Member, Crime } from "@/types/crime"

export function getMembersNotInOC(members: Member[], crimes: Crime[]): Member[] {
  // Filter positions to exclude
  const excludedPositions = ["Recruit"]
  const excludedStates = ["Hospital", "Jail", "Fallen"]

  // Get member IDs from Planning and Recruiting crimes
  const membersInCrimes = new Set<number>()
  crimes
    .filter((crime) => crime.status === "Planning" || crime.status === "Recruiting")
    .forEach((crime) => {
      crime.slots.forEach((slot) => {
        if (slot.user?.id) {
          membersInCrimes.add(slot.user.id)
        }
      })
    })

  // Filter members not in OCs
  return members
    .filter((member) => {
      // Exclude by position
      if (excludedPositions.includes(member.position)) return false

      // Exclude by status
      if (excludedStates.includes(member.status?.state)) return false

      // Primary check: is_in_oc field
      if (member.is_in_oc) return false

      // Additional validation: check if in Planning/Recruiting crimes
      if (membersInCrimes.has(member.id)) return false

      return true
    })
    .sort((a, b) => b.last_action.timestamp - a.last_action.timestamp)
}
