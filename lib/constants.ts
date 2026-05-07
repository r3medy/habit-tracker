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

export const HABIT_ICONS = [
  { name: "Exercise", value: "RiRunLine" },
  { name: "Reading", value: "RiBookReadLine" },
  { name: "Meditation", value: "RiMindMap" },
  { name: "Water", value: "RiCupLine" },
  { name: "Code", value: "RiCodeLine" },
  { name: "Writing", value: "RiEditLine" },
  { name: "Finance", value: "RiWalletLine" },
  { name: "Sleep", value: "RiMoonLine" },
  { name: "Food", value: "RiRestaurantLine" },
  { name: "Music", value: "RiHeadphoneLine" },
  { name: "Walk", value: "RiWalkLine" },
  { name: "Yoga", value: "RiYogaLine" },
  { name: "Journal", value: "RiBookletLine" },
  { name: "Language", value: "RiTranslate" },
  { name: "Art", value: "RiPaintBrushLine" },
  { name: "Gaming", value: "RiGamepadLine" },
] as const

export const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const
export const DAYS_OF_WEEK_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const

export const HEATMAP_LEVELS = [
  { level: 0, label: "None" },
  { level: 1, label: "Low" },
  { level: 2, label: "Medium" },
  { level: 3, label: "High" },
] as const
