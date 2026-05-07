"use client"

import { useState, useEffect, useCallback } from "react"
import { Textarea } from "@/components/ui/textarea"
import { useJournal } from "@/hooks/use-journal"
import { useUserProfile } from "@/hooks/use-user-profile"
import { getTodayInTimeZone } from "@/lib/date-utils"
import { cn } from "@/lib/utils"

export function JournalSection() {
  const { profile } = useUserProfile()
  const timezone = profile?.timezone || "UTC"
  const today = getTodayInTimeZone(timezone)

  const { entry, isLoading, saveEntry, isSaving } = useJournal(today, timezone)
  const [content, setContent] = useState("")
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    if (entry?.content) {
      setContent(entry.content)
    }
  }, [entry?.content])

  const handleSave = useCallback(async (text: string) => {
    if (!profile?.id) return
    setSaved(false)
    try {
      await saveEntry({ date: today, content: text || null, userId: profile.id })
      setSaved(true)
    } catch {
      setSaved(true)
    }
  }, [profile?.id, today, saveEntry])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    setContent(text)
    setSaved(false)
  }, [])

  const handleBlur = useCallback(() => {
    if (!saved) {
      handleSave(content)
    }
  }, [saved, content, handleSave])

  return (
    <div className="rounded-lg border border-muted bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium">Today's reflection</h3>
        <span className={cn("text-xs", saved ? "text-muted-foreground" : "text-amber-500")}>
          {isSaving ? "Saving..." : saved ? "Saved" : "Unsaved"}
        </span>
      </div>

      <Textarea
        placeholder="How did today go? What went well? What could be better?"
        value={content}
        onChange={handleChange}
        onBlur={handleBlur}
        maxLength={2000}
        className="min-h-32 resize-none"
        disabled={isLoading}
      />

      <div className="mt-2 flex justify-end text-xs text-muted-foreground">
        {content.length}/2000
      </div>
    </div>
  )
}
