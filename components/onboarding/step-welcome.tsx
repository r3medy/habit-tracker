"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface StepWelcomeProps {
  name: string
  habitCount: number
  onFinish: () => void
}

const MESSAGES = [
  "Small, consistent actions compound into extraordinary results.",
  "You don't have to be great to start, but you have to start to be great.",
  "Progress, not perfection.",
  "Every expert was once a beginner.",
  "The secret of getting ahead is getting started.",
]

export function StepWelcome({ name, habitCount, onFinish }: StepWelcomeProps) {
  const message = MESSAGES[Math.floor(Math.random() * MESSAGES.length)]

  return (
    <div className="flex flex-col items-center gap-8 text-center py-8">
      <div className="space-y-3">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
          <Check className="size-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">
          Welcome, {name}!
        </h2>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          {habitCount > 0
            ? `You're tracking ${habitCount} habit${habitCount > 1 ? "s" : ""}. Let's build momentum.`
            : "You can add habits anytime from the tracker."}
        </p>
        <blockquote className="text-sm italic text-muted-foreground/70 pt-2 border-t border-border">
          &ldquo;{message}&rdquo;
        </blockquote>
      </div>

      <Button onClick={onFinish} size="lg">
        Start tracking
        <span className="ml-1">→</span>
      </Button>
    </div>
  )
}
