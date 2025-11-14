import { supabase } from '@/configs/supabase'
import { TABLES } from '@/configs/db'
import camelcaseKeys from 'camelcase-keys'

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

export const getCategories = async () => {
  const { data, error } = await supabase
    .from(TABLES.CATEGORIES)
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

export const getAllMasterData = async () => {
  const [locations, categories, brands, colors, fuels, transmissions, bodyStyles] =
    await Promise.all([
      getLocations(),
      getCategories(),
      getBrands(),
      getColors(),
      getFuels(),
      getTransmissions(),
      getBodyStyles()
    ])

  return {
    locations,
    categories,
    brands,
    colors,
    fuels,
    transmissions,
    bodyStyles
  }
}
