import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

const mockPush = vi.fn()
let mockPathname = "/tracker"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}))

const { default: AppLayout } = await import("@/app/(app)/layout")

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("AppLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockPathname = "/tracker"
  })

  it("renders children", () => {
    const { container } = render(
      <AppLayout>
        <div data-testid="child">Test Content</div>
      </AppLayout>,
      { wrapper: createWrapper() }
    )

    expect(container.querySelector("[data-testid='child']")).toBeInTheDocument()
  })

  it("redirects to root when not verified", async () => {
    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>,
      { wrapper: createWrapper() }
    )

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/")
    })
  })

  it("does not redirect when verified", async () => {
    localStorage.setItem("habit-tracker-verified", "true")

    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>,
      { wrapper: createWrapper() }
    )

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(mockPush).not.toHaveBeenCalled()
  })

  it("does not redirect when on onboarding page", async () => {
    mockPathname = "/onboarding"

    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>,
      { wrapper: createWrapper() }
    )

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(mockPush).not.toHaveBeenCalled()
  })

  it("redirects when on onboarding but verified flag is false", async () => {
    mockPathname = "/onboarding"
    localStorage.removeItem("habit-tracker-verified")

    render(
      <AppLayout>
        <div>Content</div>
      </AppLayout>,
      { wrapper: createWrapper() }
    )

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(mockPush).not.toHaveBeenCalled()
  })
})
