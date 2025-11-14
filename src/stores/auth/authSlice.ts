import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '@/configs/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  initialized: boolean
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  initialized: false
}

export const initializeAuth = createAsyncThunk('auth/initialize', async (_, { rejectWithValue }) => {
  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    if (error) {
      return rejectWithValue(error.message)
    }

    return {
      user: session?.user ?? null,
      session: session ?? null,
      isAuthenticated: !!session?.user
    }
  } catch (error) {
    return rejectWithValue('Failed to initialize auth')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user
      state.session = action.payload.session
      state.isAuthenticated = !!action.payload.session?.user
      state.isLoading = false
    },
    clearAuth: state => {
      state.user = null
      state.session = null
      state.isAuthenticated = false
      state.isLoading = false
    }
  },
  extraReducers: builder => {
    builder
      .addCase(initializeAuth.pending, state => {
        state.isLoading = true
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.session = action.payload.session
        state.isAuthenticated = action.payload.isAuthenticated
        state.isLoading = false
        state.initialized = true
      })
      .addCase(initializeAuth.rejected, state => {
        state.user = null
        state.session = null
        state.isAuthenticated = false
        state.isLoading = false
        state.initialized = true
      })
  }
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer

