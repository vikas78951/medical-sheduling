"use client"

import { useForm } from "@tanstack/react-form"
import { FieldInfo } from "@/components/fileInfo"

export default function SignupForm() {

  const initialValue = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  }

  const form = useForm({
    defaultValues: initialValue,

    onSubmit: async ({ value }) => {
      console.log("Signup data:", value)

      // Later:
      // 1. Call your server action
      // 2. Create Supabase Auth account
      // 3. Create profile/patient record

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
      {/* First Name */}
      <form.Field
        name="firstName"
        validators={{
          onChange: ({ value }) =>
            !value
              ? "First name is required"
              : value.length < 2
                ? "First name must be at least 2 characters"
                : undefined,
        }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>First Name</label>

            <input
              id={field.name}
              name={field.name}
              type="text"
              autoComplete="given-name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border ml-4"
            />

            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      {/* Last Name */}
      <form.Field
        name="lastName"
        validators={{
          onChange: ({ value }) =>
            !value
              ? "Last name is required"
              : value.length < 2
                ? "Last name must be at least 2 characters"
                : undefined,
        }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>Last Name</label>

            <input
              id={field.name}
              name={field.name}
              type="text"
              autoComplete="family-name"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border ml-4"
            />

            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      {/* Email */}
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

      {/* Password */}
      <form.Field
        name="password"
        validators={{
          onChange: ({ value }) =>
            !value
              ? "Password is required"
              : value.length < 8
                ? "Password must be at least 8 characters"
                : undefined,
        }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>Password</label>

            <input
              id={field.name}
              name={field.name}
              type="password"
              autoComplete="new-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border ml-4"
            />

            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      {/* Confirm Password */}
      <form.Field
        name="confirmPassword"
        validators={{
          onChange: ({ value }) =>
            !value
              ? "Please confirm your password"
              : value !== form.getFieldValue("password")
                ? "Passwords do not match"
                : undefined,
        }}
      >
        {(field) => (
          <div>
            <label htmlFor={field.name}>Confirm Password</label>

            <input
              id={field.name}
              name={field.name}
              type="password"
              autoComplete="new-password"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
              className="border ml-4"
            />

            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      {/* Submit */}
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="border bg-gray-400 p-2"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </button>
        )}
      </form.Subscribe>
    </form>
  )
}