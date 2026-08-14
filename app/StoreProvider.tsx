'use client'
import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/store/store'

import { setUser } from '@/store/slices/user-slice'


export default function StoreProvider({
  children
}: {
  children: React.ReactNode
}) {
  const storeRef = useRef<AppStore | null>(null)
  if (!storeRef.current) {
    
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
    storeRef.current.dispatch(setUser(null))

  }

  return <Provider store={storeRef.current}>{children}</Provider>
}


