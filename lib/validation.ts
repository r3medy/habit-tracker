import { z } from "zod"

export const habitSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be 50 characters or less"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
  schedule_type: z.enum(["daily", "weekly", "monthly", "custom"]),
  schedule_days: z.array(z.number().min(0).max(6)).optional().nullable(),
})

export const goalSchema = z.object({
  target_type: z.enum(["streak", "count"]),
  target_value: z.number().int().positive("Target must be a positive number"),
  start_date: z.string(),
  end_date: z.string().nullable(),
})

export const journalSchema = z.object({
  content: z.string().max(2000, "Entry must be 2000 characters or less").optional().nullable(),
})

export const userProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be 50 characters or less"),
  timezone: z.string().min(1, "Timezone is required"),
})
