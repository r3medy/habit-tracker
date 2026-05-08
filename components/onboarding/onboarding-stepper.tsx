"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { StepName } from "@/components/onboarding/step-name"
import { StepHabits } from "@/components/onboarding/step-habits"
import { StepWelcome } from "@/components/onboarding/step-welcome"
import { useUserProfile } from "@/hooks/use-user-profile"
import { useHabits } from "@/hooks/use-habits"
import { cn } from "@/lib/utils"
import type { HabitInsert } from "@/lib/supabase/types"
import { User, CheckCircle, Rocket, Check } from "lucide-react"

const STEPS = [
  { label: "Name", icon: User },
  { label: "Habits", icon: CheckCircle },
  { label: "Ready", icon: Rocket },
]

export function OnboardingStepper() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [profileData, setProfileData] = useState({ name: "", timezone: "" })
  const [profileId, setProfileId] = useState<string | null>(null)
  const [habitCount, setHabitCount] = useState(0)
  const [isCreating, setIsCreating] = useState(false)

  const { createProfile, updateProfile } = useUserProfile()
  const { createHabit } = useHabits()

  const handleStepNameNext = async (data: { name: string; timezone: string }) => {
    setProfileData(data)
    try {
      const profile = await createProfile(data)
      if (profile?.id) {
        setProfileId(profile.id)
      }
    } catch (err) {
      console.error("Failed to create profile during onboarding:", err)
    }
    setStep(1)
  }

  const handleStepHabitsNext = async (habits: HabitInsert[]) => {
    setIsCreating(true)
    try {
      if (habits.length > 0) {
        await Promise.all(habits.map((h) => createHabit(h)))
      }
      setHabitCount(habits.length)

      if (profileId) {
        await updateProfile({ id: profileId, has_onboarded: true })
      }

      localStorage.setItem("habit-tracker-onboarded", "true")
      setStep(2)
    } catch (err) {
      console.error("Failed to create habits during onboarding:", err)
    } finally {
      setIsCreating(false)
    }
  }

  const handleFinish = () => {
    router.push("/tracker")
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-10 flex items-center justify-center gap-3">
        {STEPS.map((s, i) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-full border-2 transition-all",
                  i < step
                    ? "border-primary bg-primary text-primary-foreground"
                    : i === step
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground"
                )}
              >
                {i < step ? (
                  <Check className="size-5" />
                ) : (
                  <Icon className="size-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-sm font-medium hidden sm:inline",
                  i <= step ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {s.label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-8",
                    i < step ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="min-h-[400px]">
        {step === 0 && (
          <div>
            <h1 className="text-2xl font-semibold mb-2">Welcome to Habit Tracker</h1>
            <p className="text-muted-foreground text-sm mb-8">
              Let&apos;s set up your profile. Habits reset at midnight in your timezone.
            </p>
            <StepName initial={profileData} onNext={handleStepNameNext} />
          </div>
        )}

        {step === 1 && (
          <div>
            <StepHabits onNext={handleStepHabitsNext} isCreating={isCreating} />
          </div>
        )}

        {step === 2 && (
          <StepWelcome
            name={profileData.name}
            habitCount={habitCount}
            onFinish={handleFinish}
          />
        )}
      </div>
    </div>
  )
}
