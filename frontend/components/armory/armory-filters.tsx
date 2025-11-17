"use client"

interface Member {
  id: number
  name: string
}

interface ArmoryFiltersProps {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (category: string) => void
  members: Member[]
  selectedUser: string
  onUserChange: (userId: string) => void
  timeFilter: string
  onTimeFilterChange: (filter: string) => void
  itemsPerPage: number
  onItemsPerPageChange: (count: number) => void
}

export default function ArmoryFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  members,
  selectedUser,
  onUserChange,
  timeFilter,
  onTimeFilterChange,
  itemsPerPage,
  onItemsPerPageChange,
}: ArmoryFiltersProps) {
  const timeOptions = [
    { label: "All Time", value: "All" },
    { label: "Last 1 Hour", value: "1h" },
    { label: "Last 6 Hours", value: "6h" },
    { label: "Last 12 Hours", value: "12h" },
    { label: "Last 24 Hours", value: "24h" },
    { label: "Last 7 Days", value: "7d" },
    { label: "Last 30 Days", value: "30d" },
  ]

  return (
    <>
      {/* Category Filter */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Filter by Category</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent/20 hover:bg-accent/30"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* User Filter */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Filter by User</h3>
        <select
          value={selectedUser}
          onChange={(e) => onUserChange(e.target.value)}
          className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
        >
          <option value="All">All Users</option>
          {members
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((member) => (
              <option key={member.id} value={member.id.toString()}>
                {member.name}
              </option>
            ))}
        </select>
      </div>

      {/* Time Filter */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Filter by Time</h3>
        <div className="flex flex-wrap gap-2">
          {timeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onTimeFilterChange(option.value)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                timeFilter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-accent/20 hover:bg-accent/30"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items per page selector */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Items per page</h3>
        <div className="flex gap-2">
          {[25, 50, 100, 200].map((count) => (
            <button
              key={count}
              onClick={() => onItemsPerPageChange(count)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                itemsPerPage === count ? "bg-primary text-primary-foreground" : "bg-accent/20 hover:bg-accent/30"
              }`}
            >
              {count}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
