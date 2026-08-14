import Link from "next/link"

import { createClient } from "@/lib/supabase/server-client"
import { logout } from "@/actions/auth"

export default async function Header() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <header className="flex sm:items-center justify-between border-b px-6 py-4 flex-col sm:flex-row">
      <Link href="/" className="font-semibold">
        Doctor Appointment
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span>{user.email}</span>

            <form action={logout}>
              <button
                type="submit"
                className="border px-3 py-2"
              >
                Logout
              </button>
            </form>
          </>
        ) : (
          <Link
            href="/request"
            className="border px-3 py-2"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}