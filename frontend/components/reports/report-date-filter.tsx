"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { format, isValid, startOfDay, endOfDay, subDays } from "date-fns"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface ReportDateFilterProps {
  minDate: Date
  maxDate: Date
  startDate: Date
  endDate: Date
  onDateRangeChange: (start: Date, end: Date) => void
  onPresetChange: (preset: string) => void
  selectedPreset: string
}

export function ReportDateFilter({
  minDate,
  maxDate,
  startDate,
  endDate,
  onDateRangeChange,
  onPresetChange,
  selectedPreset,
}: ReportDateFilterProps) {
  const [startOpen, setStartOpen] = useState(false)
  const [endOpen, setEndOpen] = useState(false)
  const [startMonth, setStartMonth] = useState<Date | undefined>()
  const [endMonth, setEndMonth] = useState<Date | undefined>()

  const safeStartDate = isValid(startDate) ? startDate : new Date()
  const safeEndDate = isValid(endDate) ? endDate : new Date()
  const safeMinDate = isValid(minDate) ? minDate : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const safeMaxDate = isValid(maxDate) ? maxDate : new Date()

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      const start = startOfDay(date)
      onDateRangeChange(start, safeEndDate)
      onPresetChange("custom")
      setStartOpen(false)
    }
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      const end = endOfDay(date)
      onDateRangeChange(safeStartDate, end)
      onPresetChange("custom")
      setEndOpen(false)
    }
  }

  const handleStartOpenChange = (open: boolean) => {
    setStartOpen(open)
    if (open) {
      setStartMonth(safeStartDate)
    }
  }

  const handleEndOpenChange = (open: boolean) => {
    setEndOpen(open)
    if (open) {
      setEndMonth(safeEndDate)
    }
  }

  const handlePresetChange = (value: string) => {
    onPresetChange(value)

    if (value === "all") {
      onDateRangeChange(safeMinDate, safeMaxDate)
    } else if (value !== "custom") {
      const days = Number.parseInt(value)
      const end = safeMaxDate
      const start = startOfDay(subDays(end, days))
      onDateRangeChange(start, end)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold">Date Range Filter</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Preset Dropdown */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Quick Select</label>
          <Select value={selectedPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="14">Last 14 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="60">Last 60 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Start Date Picker */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">From Date</label>
          <Popover open={startOpen} onOpenChange={handleStartOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !isValid(safeStartDate) && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(safeStartDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={safeStartDate}
                onSelect={handleStartDateSelect}
                month={startMonth}
                onMonthChange={setStartMonth}
                disabled={(date) => date > safeEndDate || date < safeMinDate || date > safeMaxDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* End Date Picker */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">To Date</label>
          <Popover open={endOpen} onOpenChange={handleEndOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !isValid(safeEndDate) && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(safeEndDate, "PPP")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={safeEndDate}
                onSelect={handleEndDateSelect}
                month={endMonth}
                onMonthChange={setEndMonth}
                disabled={(date) => date < safeStartDate || date < safeMinDate || date > safeMaxDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  )
}
