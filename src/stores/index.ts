import { configureStore } from '@reduxjs/toolkit'
import masterDataReducer from './master-data/masterDataSlice'
import authReducer from './auth/authSlice'

export const store = configureStore({
  reducer: {
    masterData: masterDataReducer,
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
