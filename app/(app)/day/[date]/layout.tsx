import type { Metadata } from "next"
import { parseISO, format } from "date-fns"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ date: string }>
}): Promise<Metadata> {
  const { date } = await params
  const d = parseISO(date)
  return {
    title: format(d, "EEEE, MMMM d, yyyy"),
  }
}

export default function DayLayout({ children }: { children: React.ReactNode }) {
  return children
}
