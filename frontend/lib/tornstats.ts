export interface TornStatsCPRData {
  status: boolean
  message: string
  members: {
    [memberId: string]: {
      [crimeName: string]: {
        [roleName: string]: number // CPR percentage
      }
    }
  }
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CachedData {
  data: TornStatsCPRData | null
  timestamp: number
}

let cache: CachedData = {
  data: null,
  timestamp: 0
}

export async function getTornStatsCPR(apiKey: string): Promise<TornStatsCPRData | null> {
  // Check cache
  if (cache.data && Date.now() - cache.timestamp < CACHE_DURATION) {
    console.log('[v0] Using cached TornStats CPR data')
    return cache.data
  }

  try {
    console.log('[v0] Fetching TornStats CPR data')
    const response = await fetch(`https://www.tornstats.com/api/v2/${apiKey}/faction/cpr`)
    
    if (!response.ok) {
      console.error(`[v0] TornStats API error: ${response.status}`)
      return null
    }

    const data: TornStatsCPRData = await response.json()
    
    if (!data.status) {
      console.error('[v0] TornStats API returned error:', data.message)
      return null
    }

    // Update cache
    cache = {
      data,
      timestamp: Date.now()
    }

    return data
  } catch (error) {
    console.error('[v0] Failed to fetch TornStats CPR:', error)
    return null
  }
}

export interface MemberRecommendation {
  memberId: number
  memberName: string
  cpr: number
}

export async function getRecommendedMembers(
  apiKey: string,
  crimeName: string,
  roleName: string,
  membersNotInOC: Set<number>,
  minPassRate: number
): Promise<MemberRecommendation[]> {
  const cprData = await getTornStatsCPR(apiKey)
  
  if (!cprData) {
    return []
  }

  const recommendations: MemberRecommendation[] = []

  // Iterate through all members
  Object.entries(cprData.members).forEach(([memberIdStr, crimeData]) => {
    const memberId = Number.parseInt(memberIdStr)
    
    // Check if member is not in any OC
    if (!membersNotInOC.has(memberId)) {
      return
    }

    // Check if member has CPR data for this crime/role
    const crimeInfo = crimeData[crimeName]
    if (!crimeInfo) return

    const cpr = crimeInfo[roleName]
    if (cpr === undefined) return

    // Check if meets minimum CPR
    if (cpr >= minPassRate) {
      recommendations.push({
        memberId,
        memberName: '', // Will be filled from members list
        cpr
      })
    }
  })

  // Sort by CPR descending
  recommendations.sort((a, b) => b.cpr - a.cpr)

  return recommendations
}
