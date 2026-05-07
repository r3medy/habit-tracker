"use client"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator"
import { useRef, useState } from "react"

export default function Page() {
  const [val, setVal] = useState("")
  const ref = useRef<HTMLInputElement | null>(null)

  return (
    <div className="flex min-h-svh p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
        <div>
          <h1 className="font-medium">Project ready!</h1>
          <p>You may now add components and start building.</p>
          <p>We&apos;ve already added the button component for you.</p>
          <Separator className="my-4" />
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setVal(ref.current?.value ?? "")
            }}
          >
            <FieldLabel htmlFor="link" className="my-2">
              Address
            </FieldLabel>
            <InputGroup className="max-w-xs">
              <InputGroupAddon align="inline-start">
                <p>https://</p>
              </InputGroupAddon>
              <InputGroupInput
                placeholder="yousefworks.online"
                ref={ref}
                id="link"
              />
              <InputGroupAddon align="inline-end">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1" />
                  <path d="m12 15 5 6H7Z" />
                </svg>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription className="mt-2 last:mt-2">
              Enter your domain name
            </FieldDescription>
          </form>
          <div className="mt-4 flex gap-2">
            <Button
              size="lg"
              onClick={() => ref.current?.value && setVal(ref.current.value)}
            >
              Submit
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                if (ref.current?.value) ref.current.value = ""
                setVal("")
              }}
            >
              Clear
            </Button>
          </div>
        </div>
        {!val.trim() ? null : (
          <p className="my-5 text-lg text-muted-foreground">{`https://${val}`}</p>
        )}
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>
    </div>
  )
}
