"use client"

import { useForm } from "@tanstack/react-form"
import { FieldInfo } from "@/components/fileInfo"
import { toast } from "@/components/ui/toast"

import { createClient } from "@/lib/supabase/browser-client"

export default function RequestEmail() {
  const supabase = createClient()

  const form = useForm({
    defaultValues: {
      email: "",
    },

    onSubmit: async ({ value }) => {
      const { data, error } = await supabase.auth.signInWithOtp({
        email: value.email,
        options: {
          shouldCreateUser: true,
        },
      })

      console.log("data:", data)
      console.log("error:", error)

      if (error) {
        toast.add({
          type: "error",
          description: error.message || "Failed to send verification code.",
          priority: "high",
        })

        return
      }

      toast.add({
        type: "success",
        description: "Verification code sent to your email.",
      })

      window.location.href = `/verify?email=${encodeURIComponent(value.email)}`
      
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
        name="email"
        validators={{
          onChange: ({ value }) =>
            !value
              ? "Email is required"
              : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                ? "Please enter a valid email address"
                : undefined,
        }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>Email</label>

            <input
              id={field.name}
              name={field.name}
              type="email"
              autoComplete="email"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
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
            {isSubmitting ? "Sending..." : "Send OTP"}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}