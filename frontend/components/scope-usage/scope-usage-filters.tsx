import { Filter, RefreshCw, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface ScopeUsageFiltersProps {
  showFilters: boolean
  onToggleFilters: () => void
  selectedLevels: number[]
  selectedLengths: number[]
  selectedPeople: number[]
  selectedCategories: string[]
  selectedUsers: string[]
  dateRange: { from: string; to: string }
  userFilter: string
  scenarioFilter: string
  crimeIdFilter: string
  availableLevels: (number | undefined)[]
  availableLengths: (number | undefined)[]
  availablePeople: (number | undefined)[]
  availableCategories: string[]
  availableUsers: string[]
  onLevelToggle: (level: number) => void
  onLengthToggle: (length: number) => void
  onPeopleToggle: (people: number) => void
  onCategoryToggle: (category: string) => void
  onUserToggle: (user: string) => void
  onDateRangeChange: (range: { from: string; to: string }) => void
  onUserFilterChange: (filter: string) => void
  onScenarioFilterChange: (filter: string) => void
  onCrimeIdFilterChange: (filter: string) => void
  onRefresh: () => void
  onClearFilters: () => void
}

export default function ScopeUsageFilters(props: ScopeUsageFiltersProps) {
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false)
  const [spawnerDropdownOpen, setSpawnerDropdownOpen] = useState(false)
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false)
  const [lengthDropdownOpen, setLengthDropdownOpen] = useState(false)
  const [peopleDropdownOpen, setPeopleDropdownOpen] = useState(false)

  return (
    <>
      <div className="flex justify-end">
        <button
          onClick={props.onToggleFilters}
          className={`px-4 py-2 rounded-lg transition-colors border border-border flex items-center gap-2 ${
            props.showFilters ? 'bg-accent' : 'hover:bg-accent'
          }`}
        >
          <Filter size={18} />
          {props.showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {props.showFilters && (
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Filters</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={props.onRefresh}
                className="p-2 hover:bg-accent rounded-lg transition-colors border border-border"
                title="Refresh"
              >
                <RefreshCw size={20} />
              </button>
              <button
                onClick={props.onClearFilters}
                className="px-3 py-2 text-sm text-primary hover:bg-accent rounded-lg transition-colors border border-border flex items-center gap-2"
              >
                <X size={16} />
                Clear All
              </button>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
                <button
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground flex items-center justify-between hover:bg-accent transition-colors"
                >
                  <span>{props.selectedCategories.length > 0 ? `${props.selectedCategories.length} selected` : 'All Categories'}</span>
                  <ChevronDown size={16} />
                </button>
                {categoryDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {props.availableCategories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center px-3 py-2 hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={props.selectedCategories.includes(category)}
                          onChange={() => props.onCategoryToggle(category)}
                          className="mr-2"
                        />
                        <span className="text-sm text-foreground">{category}</span>
                      </label>
                    ))}
                  </div>
                )}
                {props.selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {props.selectedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-sm rounded-md"
                      >
                        {cat}
                        <button
                          onClick={() => props.onCategoryToggle(cat)}
                          className="hover:text-destructive"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-foreground mb-2 block">Spawner</label>
                <button
                  onClick={() => setSpawnerDropdownOpen(!spawnerDropdownOpen)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground flex items-center justify-between hover:bg-accent transition-colors"
                >
                  <span>{props.selectedUsers.length > 0 ? `${props.selectedUsers.length} selected` : 'All Users'}</span>
                  <ChevronDown size={16} />
                </button>
                {spawnerDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {props.availableUsers.map((user) => (
                      <label
                        key={user}
                        className="flex items-center px-3 py-2 hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={props.selectedUsers.includes(user)}
                          onChange={() => props.onUserToggle(user)}
                          className="mr-2"
                        />
                        <span className="text-sm text-foreground">{user}</span>
                      </label>
                    ))}
                  </div>
                )}
                {props.selectedUsers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {props.selectedUsers.map((user) => (
                      <span
                        key={user}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-sm rounded-md"
                      >
                        {user}
                        <button
                          onClick={() => props.onUserToggle(user)}
                          className="hover:text-destructive"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <label className="text-sm font-medium text-foreground mb-2 block">Difficulty (Level)</label>
                <button
                  onClick={() => setDifficultyDropdownOpen(!difficultyDropdownOpen)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground flex items-center justify-between hover:bg-accent transition-colors"
                >
                  <span>{props.selectedLevels.length > 0 ? `${props.selectedLevels.length} selected` : 'All Levels'}</span>
                  <ChevronDown size={16} />
                </button>
                {difficultyDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {props.availableLevels.map((level) => level && (
                      <label
                        key={level}
                        className="flex items-center px-3 py-2 hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={props.selectedLevels.includes(level)}
                          onChange={() => props.onLevelToggle(level)}
                          className="mr-2"
                        />
                        <span className="text-sm text-foreground">Level {level}</span>
                      </label>
                    ))}
                  </div>
                )}
                {props.selectedLevels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {props.selectedLevels.map((level) => (
                      <span
                        key={level}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-sm rounded-md"
                      >
                        Level {level}
                        <button
                          onClick={() => props.onLevelToggle(level)}
                          className="hover:text-destructive"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-foreground mb-2 block">Length (Days)</label>
                <button
                  onClick={() => setLengthDropdownOpen(!lengthDropdownOpen)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground flex items-center justify-between hover:bg-accent transition-colors"
                >
                  <span>{props.selectedLengths.length > 0 ? `${props.selectedLengths.length} selected` : 'All Lengths'}</span>
                  <ChevronDown size={16} />
                </button>
                {lengthDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {props.availableLengths.map((length) => length && (
                      <label
                        key={length}
                        className="flex items-center px-3 py-2 hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={props.selectedLengths.includes(length)}
                          onChange={() => props.onLengthToggle(length)}
                          className="mr-2"
                        />
                        <span className="text-sm text-foreground">{length} days</span>
                      </label>
                    ))}
                  </div>
                )}
                {props.selectedLengths.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {props.selectedLengths.map((length) => (
                      <span
                        key={length}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-sm rounded-md"
                      >
                        {length} days
                        <button
                          onClick={() => props.onLengthToggle(length)}
                          className="hover:text-destructive"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-foreground mb-2 block">People Required</label>
                <button
                  onClick={() => setPeopleDropdownOpen(!peopleDropdownOpen)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground flex items-center justify-between hover:bg-accent transition-colors"
                >
                  <span>{props.selectedPeople.length > 0 ? `${props.selectedPeople.length} selected` : 'All People'}</span>
                  <ChevronDown size={16} />
                </button>
                {peopleDropdownOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-background border border-border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {props.availablePeople.map((people) => people && (
                      <label
                        key={people}
                        className="flex items-center px-3 py-2 hover:bg-accent cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={props.selectedPeople.includes(people)}
                          onChange={() => props.onPeopleToggle(people)}
                          className="mr-2"
                        />
                        <span className="text-sm text-foreground">{people} people</span>
                      </label>
                    ))}
                  </div>
                )}
                {props.selectedPeople.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {props.selectedPeople.map((people) => (
                      <span
                        key={people}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-accent text-sm rounded-md"
                      >
                        {people} people
                        <button
                          onClick={() => props.onPeopleToggle(people)}
                          className="hover:text-destructive"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Date Range</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="date-from" className="text-xs text-muted-foreground mb-1 block">From</label>
                  <input
                    id="date-from"
                    type="date"
                    value={props.dateRange.from}
                    onChange={(e) => props.onDateRangeChange({ ...props.dateRange, from: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="date-to" className="text-xs text-muted-foreground mb-1 block">To</label>
                  <input
                    id="date-to"
                    type="date"
                    value={props.dateRange.to}
                    onChange={(e) => props.onDateRangeChange({ ...props.dateRange, to: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-foreground mb-3">Search Table</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="user-search" className="text-xs text-muted-foreground mb-1 block">
                    User
                  </label>
                  <input
                    id="user-search"
                    type="text"
                    placeholder="Search user..."
                    value={props.userFilter}
                    onChange={(e) => props.onUserFilterChange(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="scenario-search" className="text-xs text-muted-foreground mb-1 block">
                    Scenario
                  </label>
                  <input
                    id="scenario-search"
                    type="text"
                    placeholder="Search scenario..."
                    value={props.scenarioFilter}
                    onChange={(e) => props.onScenarioFilterChange(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label htmlFor="crime-id-search" className="text-xs text-muted-foreground mb-1 block">
                    Crime ID
                  </label>
                  <input
                    id="crime-id-search"
                    type="text"
                    placeholder="Search crime ID..."
                    value={props.crimeIdFilter}
                    onChange={(e) => props.onCrimeIdFilterChange(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  )
}
