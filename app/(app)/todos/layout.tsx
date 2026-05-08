import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Todos",
}

export default function TodosLayout({ children }: { children: React.ReactNode }) {
  return children
}
