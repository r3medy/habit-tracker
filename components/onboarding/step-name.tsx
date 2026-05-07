"use client"

import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

interface StepNameProps {
  initial: { name: string; timezone: string }
  onNext: (data: { name: string; timezone: string }) => void
}

const COMMON_TIMEZONES = [
  { value: "America/New_York", label: "Eastern (US)" },
  { value: "America/Chicago", label: "Central (US)" },
  { value: "America/Denver", label: "Mountain (US)" },
  { value: "America/Los_Angeles", label: "Pacific (US)" },
  { value: "America/Anchorage", label: "Alaska" },
  { value: "Pacific/Honolulu", label: "Hawaii" },
  { value: "Europe/London", label: "London" },
  { value: "Europe/Berlin", label: "Berlin" },
  { value: "Europe/Paris", label: "Paris" },
  { value: "Europe/Moscow", label: "Moscow" },
  { value: "Asia/Dubai", label: "Dubai" },
  { value: "Asia/Kolkata", label: "India" },
  { value: "Asia/Shanghai", label: "China" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "Asia/Seoul", label: "Seoul" },
  { value: "Australia/Sydney", label: "Sydney" },
  { value: "Pacific/Auckland", label: "Auckland" },
  { value: "America/Sao_Paulo", label: "São Paulo" },
  { value: "America/Mexico_City", label: "Mexico City" },
  { value: "Africa/Cairo", label: "Cairo" },
]

function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {
    return "UTC"
  }
}

export function StepName({ initial, onNext }: StepNameProps) {
  const [name, setName] = useState(initial.name)
  const [timezone, setTimezone] = useState(initial.timezone)
  const [error, setError] = useState("")
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    if (!initial.timezone) {
      setTimezone(getBrowserTimezone())
    }
  }, [initial.timezone])

  const sortedZones = useMemo(() => {
    if (!timezone) return COMMON_TIMEZONES
    const selected = COMMON_TIMEZONES.find((tz) => tz.value === timezone)
    if (!selected) return COMMON_TIMEZONES
    return [selected, ...COMMON_TIMEZONES.filter((tz) => tz.value !== timezone)]
  }, [timezone])

  const visibleZones = showAll ? sortedZones : sortedZones.slice(0, 6)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Please enter your name")
      return
    }
    if (!timezone) {
      setError("Please select a timezone")
      return
    }
    setError("")
    onNext({ name: name.trim(), timezone })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="onboarding-name">Your name</Label>
          <Input
            id="onboarding-name"
            placeholder="What should we call you?"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError("")
            }}
            autoFocus
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label>Timezone</Label>
          <p className="text-sm text-muted-foreground">
            We use this to reset your habits at midnight in your local time.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {visibleZones.map((tz) => {
              const isSelected = timezone === tz.value
              return (
                <button
                  key={tz.value}
                  type="button"
                  onClick={() => {
                    setTimezone(tz.value)
                    setError("")
                  }}
                  className={cn(
                    "rounded-xl border px-3 py-2 text-left text-sm transition-all",
                    "hover:border-primary/50 hover:bg-muted/50",
                    isSelected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {tz.label}
                </button>
              )
            })}
          </div>
          {COMMON_TIMEZONES.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAll ? "Show fewer" : `Show all ${COMMON_TIMEZONES.length} timezones`}
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="self-end">
        Continue
        <ArrowRight className="ml-1 size-4" />
      </Button>
    </form>
  )
}
