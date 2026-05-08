import { HABIT_ICONS, HABIT_COLORS } from "@/lib/constants"

export function getHabitColor(colorValue: string) {
  return HABIT_COLORS.find((c) => c.value === colorValue)?.light || HABIT_COLORS[0].light
}

export function getHabitIcon(iconValue: string) {
  return HABIT_ICONS.find((i) => i.value === iconValue)?.component || HABIT_ICONS[0].component
}
