import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { MasterDataItem } from '@/api/master-data'
import {
  getLocations,
  getCategories,
  getBrands,
  getColors,
  getFuels,
  getTransmissions,
  getBodyStyles,
  getAllMasterData
} from '@/api/master-data'

interface MasterDataState {
  locations: MasterDataItem[]
  categories: MasterDataItem[]
  brands: MasterDataItem[]
  colors: MasterDataItem[]
  fuels: MasterDataItem[]
  transmissions: MasterDataItem[]
  bodyStyles: MasterDataItem[]
  loading: boolean
  error: string | null
  initialized: boolean
}

const initialState: MasterDataState = {
  locations: [],
  categories: [],
  brands: [],
  colors: [],
  fuels: [],
  transmissions: [],
  bodyStyles: [],
  loading: false,
  error: null,
  initialized: false
}

export const fetchAllMasterData = createAsyncThunk(
  'masterData/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const result = await getAllMasterData()

      const errors = []
      if (result.locations.error) errors.push('locations')
      if (result.categories.error) errors.push('categories')
      if (result.brands.error) errors.push('brands')
      if (result.colors.error) errors.push('colors')
      if (result.fuels.error) errors.push('fuels')
      if (result.transmissions.error) errors.push('transmissions')
      if (result.bodyStyles.error) errors.push('bodyStyles')

      if (errors.length > 0) {
        return rejectWithValue(`Failed to fetch: ${errors.join(', ')}`)
      }

      return {
        locations: result.locations.data || [],
        categories: result.categories.data || [],
        brands: result.brands.data || [],
        colors: result.colors.data || [],
        fuels: result.fuels.data || [],
        transmissions: result.transmissions.data || [],
        bodyStyles: result.bodyStyles.data || []
      }
    } catch (error) {
      return rejectWithValue('Failed to fetch master data')
    }
  }
)

export const fetchLocations = createAsyncThunk(
  'masterData/fetchLocations',
  async (_, { rejectWithValue }) => {
    const { data, error } = await getLocations()
    if (error) {
      return rejectWithValue(error.message)
    }
    return data || []
  }
)

export const fetchCategories = createAsyncThunk(
  'masterData/fetchCategories',
  async (_, { rejectWithValue }) => {
    const { data, error } = await getCategories()
    if (error) {
      return rejectWithValue(error.message)
    }
    return data || []
  }
)

export const fetchBrands = createAsyncThunk(
  'masterData/fetchBrands',
  async (_, { rejectWithValue }) => {
    const { data, error } = await getBrands()
    if (error) {
      return rejectWithValue(error.message)
    }
    return data || []
  }
)

export const fetchColors = createAsyncThunk(
  'masterData/fetchColors',
  async (_, { rejectWithValue }) => {
    const { data, error } = await getColors()
    if (error) {
      return rejectWithValue(error.message)
    }
    return data || []
  }
)

export const fetchFuels = createAsyncThunk(
  'masterData/fetchFuels',
  async (_, { rejectWithValue }) => {
    const { data, error } = await getFuels()
    if (error) {
      return rejectWithValue(error.message)
    }
    return data || []
  }
)

export const fetchTransmissions = createAsyncThunk(
  'masterData/fetchTransmissions',
  async (_, { rejectWithValue }) => {
    const { data, error } = await getTransmissions()
    if (error) {
      return rejectWithValue(error.message)
    }
    return data || []
  }
)

export const fetchBodyStyles = createAsyncThunk(
  'masterData/fetchBodyStyles',
  async (_, { rejectWithValue }) => {
    const { data, error } = await getBodyStyles()
    if (error) {
      return rejectWithValue(error.message)
    }
    return data || []
  }
)

const masterDataSlice = createSlice({
  name: 'masterData',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchAllMasterData.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllMasterData.fulfilled, (state, action) => {
        state.loading = false
        state.locations = action.payload.locations
        state.categories = action.payload.categories
        state.brands = action.payload.brands
        state.colors = action.payload.colors
        state.fuels = action.payload.fuels
        state.transmissions = action.payload.transmissions
        state.bodyStyles = action.payload.bodyStyles
        state.initialized = true
        state.error = null
      })
      .addCase(fetchAllMasterData.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.locations = action.payload
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload
      })
      .addCase(fetchColors.fulfilled, (state, action) => {
        state.colors = action.payload
      })
      .addCase(fetchFuels.fulfilled, (state, action) => {
        state.fuels = action.payload
      })
      .addCase(fetchTransmissions.fulfilled, (state, action) => {
        state.transmissions = action.payload
      })
      .addCase(fetchBodyStyles.fulfilled, (state, action) => {
        state.bodyStyles = action.payload
      })
  }
})

export default masterDataSlice.reducer
