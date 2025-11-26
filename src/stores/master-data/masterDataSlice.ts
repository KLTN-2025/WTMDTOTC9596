import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { MasterDataItem, ModelItem } from '@/api/master-data'
import {
  getLocations,
  getBrands,
  getColors,
  getFuels,
  getTransmissions,
  getBodyStyles,
  getVersions,
  getModels,
  getAllMasterData
} from '@/api/master-data'

interface MasterDataState {
  locations: MasterDataItem[]
  brands: MasterDataItem[]
  colors: MasterDataItem[]
  fuels: MasterDataItem[]
  transmissions: MasterDataItem[]
  bodyStyles: MasterDataItem[]
  versions: MasterDataItem[]
  models: ModelItem[]
  loading: boolean
  error: string | null
  initialized: boolean
}

const initialState: MasterDataState = {
  locations: [],
  brands: [],
  colors: [],
  fuels: [],
  transmissions: [],
  bodyStyles: [],
  versions: [],
  models: [],
  loading: false,
  error: null,
  initialized: false
}

export const fetchAllMasterData = createAsyncThunk(
  'masterData/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const [result, modelsResult] = await Promise.all([getAllMasterData(), getModels()])

      const errors = []
      if (result.locations.error) errors.push('locations')
      if (result.brands.error) errors.push('brands')
      if (result.colors.error) errors.push('colors')
      if (result.fuels.error) errors.push('fuels')
      if (result.transmissions.error) errors.push('transmissions')
      if (result.bodyStyles.error) errors.push('bodyStyles')
      if (result.versions.error) errors.push('versions')
      if (modelsResult.error) errors.push('models')

      if (errors.length > 0) {
        return rejectWithValue(`Failed to fetch: ${errors.join(', ')}`)
      }

      return {
        locations: result.locations.data || [],
        brands: result.brands.data || [],
        colors: result.colors.data || [],
        fuels: result.fuels.data || [],
        transmissions: result.transmissions.data || [],
        bodyStyles: result.bodyStyles.data || [],
        versions: result.versions.data || [],
        models: modelsResult.data || []
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

export const fetchVersions = createAsyncThunk(
  'masterData/fetchVersions',
  async (_, { rejectWithValue }) => {
    const { data, error } = await getVersions()
    if (error) {
      return rejectWithValue(error.message)
    }
    return data || []
  }
)

export const fetchModels = createAsyncThunk(
  'masterData/fetchModels',
  async (_, { rejectWithValue }) => {
    const { data, error } = await getModels()
    if (error) {
      return rejectWithValue(error.message)
    }
    return data || []
  }
)

const masterDataSlice = createSlice({
  name: 'masterData',
  initialState,
  reducers: {
    addLocation: (state, action) => {
      state.locations.push(action.payload)
      state.locations.sort((a, b) => a.name.localeCompare(b.name))
    },
    updateLocation: (state, action) => {
      const index = state.locations.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.locations[index] = action.payload
        state.locations.sort((a, b) => a.name.localeCompare(b.name))
      }
    },
    removeLocation: (state, action) => {
      state.locations = state.locations.filter(item => item.id !== action.payload)
    },
    addBrand: (state, action) => {
      state.brands.push(action.payload)
      state.brands.sort((a, b) => a.name.localeCompare(b.name))
    },
    updateBrand: (state, action) => {
      const index = state.brands.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.brands[index] = action.payload
        state.brands.sort((a, b) => a.name.localeCompare(b.name))
      }
    },
    removeBrand: (state, action) => {
      state.brands = state.brands.filter(item => item.id !== action.payload)
    },
    addColor: (state, action) => {
      state.colors.push(action.payload)
      state.colors.sort((a, b) => a.name.localeCompare(b.name))
    },
    updateColor: (state, action) => {
      const index = state.colors.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.colors[index] = action.payload
        state.colors.sort((a, b) => a.name.localeCompare(b.name))
      }
    },
    removeColor: (state, action) => {
      state.colors = state.colors.filter(item => item.id !== action.payload)
    },
    addFuel: (state, action) => {
      state.fuels.push(action.payload)
      state.fuels.sort((a, b) => a.name.localeCompare(b.name))
    },
    updateFuel: (state, action) => {
      const index = state.fuels.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.fuels[index] = action.payload
        state.fuels.sort((a, b) => a.name.localeCompare(b.name))
      }
    },
    removeFuel: (state, action) => {
      state.fuels = state.fuels.filter(item => item.id !== action.payload)
    },
    addTransmission: (state, action) => {
      state.transmissions.push(action.payload)
      state.transmissions.sort((a, b) => a.name.localeCompare(b.name))
    },
    updateTransmission: (state, action) => {
      const index = state.transmissions.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.transmissions[index] = action.payload
        state.transmissions.sort((a, b) => a.name.localeCompare(b.name))
      }
    },
    removeTransmission: (state, action) => {
      state.transmissions = state.transmissions.filter(item => item.id !== action.payload)
    },
    addBodyStyle: (state, action) => {
      state.bodyStyles.push(action.payload)
      state.bodyStyles.sort((a, b) => a.name.localeCompare(b.name))
    },
    updateBodyStyle: (state, action) => {
      const index = state.bodyStyles.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.bodyStyles[index] = action.payload
        state.bodyStyles.sort((a, b) => a.name.localeCompare(b.name))
      }
    },
    removeBodyStyle: (state, action) => {
      state.bodyStyles = state.bodyStyles.filter(item => item.id !== action.payload)
    },
    addVersion: (state, action) => {
      state.versions.push(action.payload)
      state.versions.sort((a, b) => a.name.localeCompare(b.name))
    },
    updateVersion: (state, action) => {
      const index = state.versions.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.versions[index] = action.payload
        state.versions.sort((a, b) => a.name.localeCompare(b.name))
      }
    },
    removeVersion: (state, action) => {
      state.versions = state.versions.filter(item => item.id !== action.payload)
    },
    addModel: (state, action) => {
      state.models.push(action.payload)
      state.models.sort((a, b) => a.name.localeCompare(b.name))
    },
    updateModel: (state, action) => {
      const index = state.models.findIndex(item => item.id === action.payload.id)
      if (index !== -1) {
        state.models[index] = action.payload
        state.models.sort((a, b) => a.name.localeCompare(b.name))
      }
    },
    removeModel: (state, action) => {
      state.models = state.models.filter(item => item.id !== action.payload)
    }
  },
  extraReducers: builder => {
    builder
      .addCase(fetchAllMasterData.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllMasterData.fulfilled, (state, action) => {
        state.loading = false
        state.locations = action.payload.locations
        state.brands = action.payload.brands
        state.colors = action.payload.colors
        state.fuels = action.payload.fuels
        state.transmissions = action.payload.transmissions
        state.bodyStyles = action.payload.bodyStyles
        state.versions = action.payload.versions
        state.models = action.payload.models
        state.initialized = true
        state.error = null
      })
      .addCase(fetchAllMasterData.rejected, (state, action) => {
        state.loading = false
        state.initialized = true
        state.error = action.payload as string
      })
      .addCase(fetchLocations.fulfilled, (state, action) => {
        state.locations = action.payload
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
      .addCase(fetchVersions.fulfilled, (state, action) => {
        state.versions = action.payload
      })
      .addCase(fetchModels.fulfilled, (state, action) => {
        state.models = action.payload
      })
  }
})

export const {
  addLocation,
  updateLocation,
  removeLocation,
  addBrand,
  updateBrand,
  removeBrand,
  addColor,
  updateColor,
  removeColor,
  addFuel,
  updateFuel,
  removeFuel,
  addTransmission,
  updateTransmission,
  removeTransmission,
  addBodyStyle,
  updateBodyStyle,
  removeBodyStyle,
  addVersion,
  updateVersion,
  removeVersion,
  addModel,
  updateModel,
  removeModel
} = masterDataSlice.actions

export default masterDataSlice.reducer
