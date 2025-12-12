import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { supabase } from '@/configs/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { getStore } from '@/api/stores'
import { getProfile } from '@/api/profile'
import type { Store } from '@/types/stores'
import type { Profile } from '@/api/profile'

interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  initialized: boolean
  store: Store | null
  profile: Profile | null
}

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  initialized: false,
  store: null,
  profile: null
}

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()

      if (error) {
        return rejectWithValue(error.message)
      }

      const user = session?.user ?? null
      let store: Store | null = null
      let profile: Profile | null = null

      if (user) {
        const [storeResult, profileResult] = await Promise.all([getStore(user), getProfile(user)])

        if (storeResult.data) {
          store = storeResult.data
        }

        if (profileResult.data) {
          profile = profileResult.data
        }
      }

      return {
        user,
        session: session ?? null,
        isAuthenticated: !!user,
        store,
        profile
      }
    } catch (error) {
      return rejectWithValue('Failed to initialize auth')
    }
  }
)

export const fetchUserData = createAsyncThunk(
  'auth/fetchUserData',
  async (user: User, { rejectWithValue }) => {
    try {
      const [storeResult, profileResult] = await Promise.all([getStore(user), getProfile(user)])

      return {
        store: storeResult.data || null,
        profile: profileResult.data || null
      }
    } catch (error) {
      return rejectWithValue('Failed to fetch user data')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.user = action.payload.user
      state.session = action.payload.session
      state.isAuthenticated = !!action.payload.session?.user
      state.isLoading = false
      // Reset role-related data to avoid showing stale permissions between accounts
      state.store = null
      state.profile = null
    },
    clearAuth: state => {
      state.user = null
      state.session = null
      state.isAuthenticated = false
      state.isLoading = false
      state.store = null
      state.profile = null
    },
    setStore: (state, action) => {
      state.store = action.payload
    },
    setProfile: (state, action) => {
      state.profile = action.payload
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
        state.store = action.payload.store
        state.profile = action.payload.profile
        state.isLoading = false
        state.initialized = true
      })
      .addCase(initializeAuth.rejected, state => {
        state.user = null
        state.session = null
        state.isAuthenticated = false
        state.store = null
        state.profile = null
        state.isLoading = false
        state.initialized = true
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.store = action.payload.store
        state.profile = action.payload.profile
      })
      .addCase(fetchUserData.rejected, state => {
        state.store = null
        state.profile = null
      })
  }
})

export const { setAuth, clearAuth, setStore, setProfile } = authSlice.actions
export default authSlice.reducer
