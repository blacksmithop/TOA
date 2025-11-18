import { useState } from 'react'
import { X } from 'lucide-react'

interface ScopeUsageConfigModalProps {
  isOpen: boolean
  currentMaxFetch: number
  onSave: (maxFetch: number) => void
  onClose: () => void
}

export default function ScopeUsageConfigModal({
  isOpen,
  currentMaxFetch,
  onSave,
  onClose,
}: ScopeUsageConfigModalProps) {
  const [maxFetch, setMaxFetch] = useState(currentMaxFetch)

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg p-6 w-full max-w-md z-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Configure Backfill</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="max-fetch" className="text-sm font-medium text-foreground block mb-2">
              Maximum Entries to Fetch
            </label>
            <input
              id="max-fetch"
              type="number"
              min="1"
              value={maxFetch}
              onChange={(e) => setMaxFetch(Number.parseInt(e.target.value, 10))}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Higher values will take longer to fetch
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(maxFetch)}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
