import Link from "next/link"

export function DashboardFooter() {
  return (
    <footer className="flex-shrink-0 border-t border-border bg-card px-6 py-4 z-50">
      <div className="text-center text-sm">
        <a
          href="https://www.torn.com/profiles.php?XID=1712955"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:text-white/80 transition-colors"
        >
          © oxiblurr [1712955]
        </a>
        <span className="mx-2 text-muted-foreground">•</span>
        <Link href="/dashboard/credits" className="text-white hover:text-white/80 transition-colors">
          Credits
        </Link>
      </div>
    </footer>
  )
}
