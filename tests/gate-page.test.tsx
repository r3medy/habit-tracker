import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactNode } from "react"

const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  usePathname: () => "/",
}))

vi.mock("@/app/actions", () => ({
  verifyPassword: vi.fn(),
}))

const { default: GatePage } = await import("@/app/page")

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

describe("GatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("renders password input and submit button", () => {
    render(<GatePage />, { wrapper: createWrapper() })

    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Continue" })).toBeInTheDocument()
  })

  it("renders welcome heading", () => {
    render(<GatePage />, { wrapper: createWrapper() })

    expect(screen.getByRole("heading", { name: "Welcome back" })).toBeInTheDocument()
  })

  it("disables submit button when password is empty", () => {
    render(<GatePage />, { wrapper: createWrapper() })

    expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled()
  })

  it("enables submit button when password is entered", async () => {
    const user = userEvent.setup()
    render(<GatePage />, { wrapper: createWrapper() })

    const input = screen.getByPlaceholderText("Password")
    await user.type(input, "test")

    expect(screen.getByRole("button", { name: "Continue" })).not.toBeDisabled()
  })

  it("shows error message on incorrect password", async () => {
    const user = userEvent.setup()
    const { verifyPassword } = await import("@/app/actions")
    vi.mocked(verifyPassword).mockResolvedValue({
      success: false,
      error: "Incorrect password",
    })

    render(<GatePage />, { wrapper: createWrapper() })

    const input = screen.getByPlaceholderText("Password")
    await user.type(input, "wrong")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    await waitFor(() => {
      expect(screen.getByText("Incorrect password")).toBeInTheDocument()
    })
  })

  it("stores verification flag and redirects on success", async () => {
    const user = userEvent.setup()
    const { verifyPassword } = await import("@/app/actions")
    vi.mocked(verifyPassword).mockResolvedValue({ success: true })

    render(<GatePage />, { wrapper: createWrapper() })

    const input = screen.getByPlaceholderText("Password")
    await user.type(input, "correct")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    await waitFor(() => {
      expect(localStorage.getItem("habit-tracker-verified")).toBe("true")
      expect(mockPush).toHaveBeenCalledWith("/tracker")
    })
  })

  it("shows loading state during verification", async () => {
    const user = userEvent.setup()
    const { verifyPassword } = await import("@/app/actions")
    vi.mocked(verifyPassword).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    )

    render(<GatePage />, { wrapper: createWrapper() })

    const input = screen.getByPlaceholderText("Password")
    await user.type(input, "test")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    await waitFor(() => {
      expect(screen.getByText("Verifying...")).toBeInTheDocument()
    })
  })

  it("clears error message on new submission", async () => {
    const user = userEvent.setup()
    const { verifyPassword } = await import("@/app/actions")
    vi.mocked(verifyPassword)
      .mockResolvedValueOnce({ success: false, error: "Incorrect password" })
      .mockResolvedValueOnce({ success: true })

    render(<GatePage />, { wrapper: createWrapper() })

    const input = screen.getByPlaceholderText("Password")
    await user.type(input, "wrong")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    await waitFor(() => {
      expect(screen.getByText("Incorrect password")).toBeInTheDocument()
    })

    await user.clear(input)
    await user.type(input, "correct")
    await user.click(screen.getByRole("button", { name: "Continue" }))

    await waitFor(() => {
      expect(screen.queryByText("Incorrect password")).not.toBeInTheDocument()
    })
  })
})
