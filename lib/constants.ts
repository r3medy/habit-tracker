import {
  Dumbbell,
  BookOpen,
  Brain,
  Coffee,
  Code,
  Pencil,
  Wallet,
  Moon,
  Utensils,
  Headphones,
  PersonStanding,
  Leaf,
  NotebookPen,
  Languages,
  Paintbrush,
  Gamepad2,
} from "lucide-react"

export const HABIT_ICONS = [
  { name: "Exercise", value: "Dumbbell", component: Dumbbell },
  { name: "Reading", value: "BookOpen", component: BookOpen },
  { name: "Meditation", value: "Brain", component: Brain },
  { name: "Water", value: "Coffee", component: Coffee },
  { name: "Code", value: "Code", component: Code },
  { name: "Writing", value: "Pencil", component: Pencil },
  { name: "Finance", value: "Wallet", component: Wallet },
  { name: "Sleep", value: "Moon", component: Moon },
  { name: "Food", value: "Utensils", component: Utensils },
  { name: "Music", value: "Headphones", component: Headphones },
  { name: "Walk", value: "PersonStanding", component: PersonStanding },
  { name: "Yoga", value: "Leaf", component: Leaf },
  { name: "Journal", value: "NotebookPen", component: NotebookPen },
  { name: "Language", value: "Languages", component: Languages },
  { name: "Art", value: "Paintbrush", component: Paintbrush },
  { name: "Gaming", value: "Gamepad2", component: Gamepad2 },
] as const

export const HABIT_COLORS = [
  { name: "Teal", value: "teal", light: "oklch(0.65 0.15 175)", dark: "oklch(0.72 0.14 175)" },
  { name: "Amber", value: "amber", light: "oklch(0.7 0.18 75)", dark: "oklch(0.78 0.16 75)" },
  { name: "Rose", value: "rose", light: "oklch(0.65 0.2 15)", dark: "oklch(0.72 0.18 15)" },
  { name: "Sky", value: "sky", light: "oklch(0.7 0.12 230)", dark: "oklch(0.78 0.1 230)" },
  { name: "Violet", value: "violet", light: "oklch(0.6 0.2 300)", dark: "oklch(0.68 0.18 300)" },
  { name: "Emerald", value: "emerald", light: "oklch(0.65 0.18 150)", dark: "oklch(0.72 0.16 150)" },
  { name: "Orange", value: "orange", light: "oklch(0.68 0.2 55)", dark: "oklch(0.75 0.18 55)" },
  { name: "Slate", value: "slate", light: "oklch(0.55 0.03 250)", dark: "oklch(0.65 0.03 250)" },
] as const

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const
export const DAYS_OF_WEEK_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const

export const HEATMAP_LEVELS = [
  { level: 0, label: "None" },
  { level: 1, label: "Low" },
  { level: 2, label: "Medium" },
  { level: 3, label: "High" },
] as const
