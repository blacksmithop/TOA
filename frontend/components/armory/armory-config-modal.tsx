"use client"

import { X } from 'lucide-react'
import { useState } from "react"

interface ArmoryConfigModalProps {
  isOpen: boolean
  currentMaxFetch: number
  onSave: (maxFetch: number) => void
  onClose: () => void
}

export default function ArmoryConfigModal({ isOpen, currentMaxFetch, onSave, onClose }: ArmoryConfigModalProps) {
  const [tempMaxFetch, setTempMaxFetch] = useState(currentMaxFetch)

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg shadow-xl z-50 w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Fetch Configuration</h3>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="maxFetch" className="block text-sm font-medium text-foreground mb-2">
              Maximum Logs to Fetch
            </label>
            <input
              id="maxFetch"
              type="number"
              min="1"
              value={tempMaxFetch}
              onChange={(e) => setTempMaxFetch(Number.parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter maximum number of logs"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Set how many armory logs to fetch when clicking "Fetch Historical Data"
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 bg-accent/20 hover:bg-accent/30 rounded-lg transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(tempMaxFetch)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </>
  )
}
