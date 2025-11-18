import { ArrowLeft, MoreVertical, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ScopeUsageHeaderProps {
  onLogout: () => void
}

export default function ScopeUsageHeader({ onLogout }: ScopeUsageHeaderProps) {
  const router = useRouter()

  return (
    <header className="flex-shrink-0 border-b border-border bg-card p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/crimes")}
            className="p-2 hover:bg-accent rounded-lg transition-colors border border-border"
            title="Back to Crimes"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Scope Usage</h1>
            <p className="text-muted-foreground mt-1">Track scope spending across scenarios</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative group">
            <button
              className="p-2 hover:bg-accent rounded-lg transition-colors border border-border"
              title="Menu"
            >
              <MoreVertical size={20} />
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
              <button
                onClick={onLogout}
                className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-destructive/10 text-destructive transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
