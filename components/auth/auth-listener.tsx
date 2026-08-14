"use client"

import { useEffect } from "react"
import { createClient } from "@/lib/supabase/browser-client"
import { useAppDispatch } from "@/store/hook"

import {
  setUser,
  clearUser,
  setLoading,
} from "@/store/slices/user-slice"

export default function AuthListener() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("AUTH EVENT:", event)

        if (session?.user) {
          dispatch(setUser(session.user))
        } else {
          dispatch(clearUser())
        }

        dispatch(setLoading(false))
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [dispatch])

  return null
}