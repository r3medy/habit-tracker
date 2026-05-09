import { describe, it, expect, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"

const mockPush = vi.fn()
let mockPathname = "/tracker"

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => mockPathname,
}))

vi.mock("@/hooks/use-user-profile", () => ({
  useUserProfile: () => ({
    profile: null,
    isLoading: false,
    error: null,
  }),
}))

const { default: AppLayout } = await import("@/app/(app)/layout")

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
      </AppLayout>
    )

    expect(container.querySelector("[data-testid='child']")).toBeInTheDocument()
  })

  it("redirects unverified user to root", async () => {
    render(<AppLayout><div>Content</div></AppLayout>)

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/")
    })
  })

  it("redirects unverified user away from onboarding to root", async () => {
    mockPathname = "/onboarding"

    render(<AppLayout><div>Content</div></AppLayout>)

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/")
    })
  })

  it("redirects verified but non-onboarded user to onboarding", async () => {
    localStorage.setItem("habit-tracker-verified", "true")

    render(<AppLayout><div>Content</div></AppLayout>)

    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/onboarding")
    })
  })

  it("stays on page when verified and onboarded", async () => {
    localStorage.setItem("habit-tracker-verified", "true")
    localStorage.setItem("habit-tracker-onboarded", "true")

    render(<AppLayout><div>Content</div></AppLayout>)

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(mockPush).not.toHaveBeenCalled()
  })

  it("allows verified onboarded user on onboarding", async () => {
    mockPathname = "/onboarding"
    localStorage.setItem("habit-tracker-verified", "true")
    localStorage.setItem("habit-tracker-onboarded", "true")

    render(<AppLayout><div>Content</div></AppLayout>)

    await new Promise((resolve) => setTimeout(resolve, 100))

    expect(mockPush).not.toHaveBeenCalled()
  })
})
