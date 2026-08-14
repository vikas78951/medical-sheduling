"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useForm } from "@tanstack/react-form"
import { FieldInfo } from "@/components/fileInfo"
import { toast } from "@/components/ui/toast"

import { createClient } from "@/lib/supabase/browser-client"

export default function VerifyOtp() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const email = searchParams.get("email") || ""

  const supabase = createClient()

  const form = useForm({
    defaultValues: {
      token: "",
    },

    onSubmit: async ({ value }) => {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: value.token,
        type: "email",
      })

      console.log("verify otp data:", data)
      console.log("error:", error)

      if (error) {
        toast.add({
          type: "error",
          description: error.message || "Invalid verification code.",
          priority: "high",
        })

        return
      }

      toast.add({
        type: "success",
        description: "Email verified successfully.",
      })

      router.push("/")
      router.refresh()
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      <form.Field
        name="token"
        validators={{
          onChange: ({ value }) =>
            !value
              ? "OTP is required"
              : !/^\d{8}$/.test(value)
                ? "OTP must be 8 digits"
                : undefined,
        }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>
              Verification Code
            </label>

            <input
              id={field.name}
              name={field.name}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={8}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => {
                const value = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 8)

                field.handleChange(value)
              }}
              className="border ml-4"
            />

            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="border bg-gray-400 p-2"
          >
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </button>
        )}


      </form.Subscribe>
      <form.Subscribe      >
        <button
          type="submit"
          className="border bg-gray-400 p-2"
          onClick={()=>router.push('/request')}
        >
          Sign Up
        </button>



      </form.Subscribe>

    </form>
  )
}