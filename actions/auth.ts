"use server"

import { createClient } from "@/lib/supabase/server-client"
import { redirect } from "next/navigation"

export async function logout() {
  const supabase = await createClient()

  await supabase.auth.signOut()

  redirect("/")
}