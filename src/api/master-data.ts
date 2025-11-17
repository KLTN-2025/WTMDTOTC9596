import { supabase } from '@/configs/supabase'
import { TABLES } from '@/configs/db'
import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snakecase-keys'

export interface MasterDataItem {
  id: string
  name: string
  createdAt?: string
  updatedAt?: string
  logoUrl?: string
}

export const getLocations = async () => {
  const { data, error } = await supabase
    .from(TABLES.LOCATIONS)
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return { data: null, error }
  }

  return {
    data: data ? (camelcaseKeys(data, { deep: true }) as MasterDataItem[]) : null,
    error: null
  }
}

export const getBrands = async () => {
  const { data, error } = await supabase
    .from(TABLES.BRANDS)
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return { data: null, error }
  }

  return {
    data: data ? (camelcaseKeys(data, { deep: true }) as MasterDataItem[]) : null,
    error: null
  }
}

export const getColors = async () => {
  const { data, error } = await supabase
    .from(TABLES.COLORS)
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return { data: null, error }
  }

  return {
    data: data ? (camelcaseKeys(data, { deep: true }) as MasterDataItem[]) : null,
    error: null
  }
}

export const getFuels = async () => {
  const { data, error } = await supabase
    .from(TABLES.FUELS)
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return { data: null, error }
  }

  return {
    data: data ? (camelcaseKeys(data, { deep: true }) as MasterDataItem[]) : null,
    error: null
  }
}

export const getTransmissions = async () => {
  const { data, error } = await supabase
    .from(TABLES.TRANSMISSIONS)
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return { data: null, error }
  }

  return {
    data: data ? (camelcaseKeys(data, { deep: true }) as MasterDataItem[]) : null,
    error: null
  }
}

export const getBodyStyles = async () => {
  const { data, error } = await supabase
    .from(TABLES.BODY_STYLES)
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return { data: null, error }
  }

  return {
    data: data ? (camelcaseKeys(data, { deep: true }) as MasterDataItem[]) : null,
    error: null
  }
}

export interface ModelItem extends MasterDataItem {
  brandId: string
}

export const getModels = async (brandId?: string) => {
  let query = supabase.from(TABLES.MODELS).select('*').order('name', { ascending: true })

  if (brandId) {
    query = query.eq('brand_id', brandId)
  }

  const { data, error } = await query

  if (error) {
    return { data: null, error }
  }

  return {
    data: data ? (camelcaseKeys(data, { deep: true }) as ModelItem[]) : null,
    error: null
  }
}

export const getVersions = async () => {
  const { data, error } = await supabase
    .from(TABLES.VERSIONS)
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    return { data: null, error }
  }

  return {
    data: data ? (camelcaseKeys(data, { deep: true }) as MasterDataItem[]) : null,
    error: null
  }
}

export const getAllMasterData = async () => {
  const [locations, brands, colors, fuels, transmissions, bodyStyles, versions] = await Promise.all(
    [
      getLocations(),
      getBrands(),
      getColors(),
      getFuels(),
      getTransmissions(),
      getBodyStyles(),
      getVersions()
    ]
  )

  return {
    locations,
    brands,
    colors,
    fuels,
    transmissions,
    bodyStyles,
    versions
  }
}

export type CreateMasterDataInput = {
  name: string
  logoUrl?: string
}

export type UpdateMasterDataInput = {
  name?: string
  logoUrl?: string
}

export type CreateModelInput = {
  name: string
  brandId: string
}

export type UpdateModelInput = {
  name?: string
  brandId?: string
}

const createMasterDataItem = async (table: string, input: CreateMasterDataInput) => {
  const payload = snakecaseKeys({
    ...input,
    updatedAt: new Date().toISOString()
  })

  const { data, error } = await supabase.from(table).insert(payload).select().single()

  if (error) {
    return { data: null, error }
  }

  return { data: camelcaseKeys(data, { deep: true }) as MasterDataItem, error: null }
}

const updateMasterDataItem = async (table: string, id: string, input: UpdateMasterDataInput) => {
  const payload = snakecaseKeys({
    ...input,
    updatedAt: new Date().toISOString()
  })

  const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single()

  if (error) {
    return { data: null, error }
  }

  return { data: camelcaseKeys(data, { deep: true }) as MasterDataItem, error: null }
}

const deleteMasterDataItem = async (table: string, id: string) => {
  const { error } = await supabase.from(table).delete().eq('id', id)

  return { error }
}

export const createLocation = (input: CreateMasterDataInput) =>
  createMasterDataItem(TABLES.LOCATIONS, input)
export const updateLocation = (id: string, input: UpdateMasterDataInput) =>
  updateMasterDataItem(TABLES.LOCATIONS, id, input)
export const deleteLocation = (id: string) => deleteMasterDataItem(TABLES.LOCATIONS, id)

export const createBrand = (input: CreateMasterDataInput) =>
  createMasterDataItem(TABLES.BRANDS, input)
export const updateBrand = (id: string, input: UpdateMasterDataInput) =>
  updateMasterDataItem(TABLES.BRANDS, id, input)
export const deleteBrand = (id: string) => deleteMasterDataItem(TABLES.BRANDS, id)

export const createColor = (input: CreateMasterDataInput) =>
  createMasterDataItem(TABLES.COLORS, input)
export const updateColor = (id: string, input: UpdateMasterDataInput) =>
  updateMasterDataItem(TABLES.COLORS, id, input)
export const deleteColor = (id: string) => deleteMasterDataItem(TABLES.COLORS, id)

export const createFuel = (input: CreateMasterDataInput) =>
  createMasterDataItem(TABLES.FUELS, input)
export const updateFuel = (id: string, input: UpdateMasterDataInput) =>
  updateMasterDataItem(TABLES.FUELS, id, input)
export const deleteFuel = (id: string) => deleteMasterDataItem(TABLES.FUELS, id)

export const createTransmission = (input: CreateMasterDataInput) =>
  createMasterDataItem(TABLES.TRANSMISSIONS, input)
export const updateTransmission = (id: string, input: UpdateMasterDataInput) =>
  updateMasterDataItem(TABLES.TRANSMISSIONS, id, input)
export const deleteTransmission = (id: string) => deleteMasterDataItem(TABLES.TRANSMISSIONS, id)

export const createBodyStyle = (input: CreateMasterDataInput) =>
  createMasterDataItem(TABLES.BODY_STYLES, input)
export const updateBodyStyle = (id: string, input: UpdateMasterDataInput) =>
  updateMasterDataItem(TABLES.BODY_STYLES, id, input)
export const deleteBodyStyle = (id: string) => deleteMasterDataItem(TABLES.BODY_STYLES, id)

export const createVersion = (input: CreateMasterDataInput) =>
  createMasterDataItem(TABLES.VERSIONS, input)
export const updateVersion = (id: string, input: UpdateMasterDataInput) =>
  updateMasterDataItem(TABLES.VERSIONS, id, input)
export const deleteVersion = (id: string) => deleteMasterDataItem(TABLES.VERSIONS, id)

export const createModel = async (input: CreateModelInput) => {
  const payload = snakecaseKeys({
    name: input.name,
    brandId: input.brandId,
    updatedAt: new Date().toISOString()
  })

  const { data, error } = await supabase.from(TABLES.MODELS).insert(payload).select().single()

  if (error) {
    return { data: null, error }
  }

  return { data: camelcaseKeys(data, { deep: true }) as ModelItem, error: null }
}

export const updateModel = async (id: string, input: UpdateModelInput) => {
  const payload = snakecaseKeys({
    ...input,
    updatedAt: new Date().toISOString()
  })

  const { data, error } = await supabase
    .from(TABLES.MODELS)
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: camelcaseKeys(data, { deep: true }) as ModelItem, error: null }
}

export const deleteModel = (id: string) => deleteMasterDataItem(TABLES.MODELS, id)
