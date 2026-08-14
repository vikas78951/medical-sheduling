import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import type { User } from "@supabase/supabase-js" 

type UserState = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

const userSlice = createSlice({
  name: "user",

  initialState,

  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
    },
  },
})

export const {
  setUser,
  setLoading,
  clearUser,
} = userSlice.actions

 


export default userSlice.reducer