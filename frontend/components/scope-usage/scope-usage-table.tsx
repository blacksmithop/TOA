"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ScopeUsageEntry {
  user: string
  userId: number
  scenario: string
  scopeUsed: number
  timestamp: number
  crimeId?: string
  level?: number
  length?: number
  people?: number
}

interface ScopeUsageTableProps {
  entries: ScopeUsageEntry[]
}

export default function ScopeUsageTable({ entries }: ScopeUsageTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Calculate pagination
  const totalPages = Math.ceil(entries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentEntries = entries.slice(startIndex, endIndex)

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  // Reset to page 1 when entries change
  useState(() => {
    setCurrentPage(1)
  })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold text-foreground">Scope Usage History</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">User</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Scenario</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Level</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Length</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">People</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Scope Used</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-muted-foreground">Crime ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currentEntries.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                  No scope usage data available
                </td>
              </tr>
            ) : (
              currentEntries.map((entry, index) => (
                <tr key={index} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm">
                    <a
                      href={`https://www.torn.com/profiles.php?XID=${entry.userId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {entry.user}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">{entry.scenario}</td>
                  <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                    {entry.level || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                    {entry.length ? `${entry.length}d` : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-muted-foreground">
                    {entry.people || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold text-foreground">
                    {entry.scopeUsed}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(entry.timestamp)}</td>
                  <td className="px-4 py-3 text-sm text-center">
                    {entry.crimeId ? (
                      <a
                        href={`https://www.torn.com/factions.php?step=your#/tab=crimes&crimeId=${entry.crimeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        #{entry.crimeId}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, entries.length)} of {entries.length} entries
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    className="min-w-[40px]"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
