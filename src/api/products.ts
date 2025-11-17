import { supabase } from '@/configs/supabase'
import { STORAGE_BUCKETS, TABLES } from '@/configs/db'
import type {
  ProductListItem,
  ProductDetailData,
  ProductFilters,
  StoreProduct,
  StoreProductCounts
} from '@/types/products'
import { normalizeRelation } from '@/utils/products'
import camelcaseKeys from 'camelcase-keys'
import snakecaseKeys from 'snakecase-keys'
import type { User } from '@supabase/supabase-js'
export type { ProductListItem, ProductDetailData, ProductFilters }

export const getBrands = async (limit = 12) => {
  const { data, error } = await supabase
    .from(TABLES.BRANDS)
    .select('*')
    .order('name', { ascending: true })
    .limit(limit)

  if (error) {
    return { data: null, error }
  }

  return { data: data ? camelcaseKeys(data, { deep: true }) : null, error: null }
}

export const getRecentProducts = async (limit = 8) => {
  const { data, error, count } = await supabase
    .from(TABLES.PRODUCTS)
    .select(
      'id,title,price,created_at,media_urls,body_styles(name),fuels(name),transmissions(name),locations(name),stores(name,logo_url)',
      {
        count: 'exact'
      }
    )
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { data: null, error, count: null }
  }

  const normalized = (data ?? []).map(p => {
    const camelized = camelcaseKeys(p, { deep: true }) as any
    const media = (camelized.mediaUrls as string[] | null) ?? []
    const store = camelized.stores
      ? {
          storeName: camelized.stores.name || '',
          storeLogo: camelized.stores.logoUrl || null
        }
      : null
    return {
      id: camelized.id,
      title: camelized.title,
      price: camelized.price,
      image: media[0] || null,
      store,
      createdAt: camelized.createdAt,
      imageCount: media.length,
      mediaUrls: media,
      bodyStyles: normalizeRelation(camelized.bodyStyles),
      fuels: normalizeRelation(camelized.fuels),
      transmissions: normalizeRelation(camelized.transmissions),
      locations: normalizeRelation(camelized.locations)
    }
  })

  return { data: normalized, error: null, count }
}

export const getNewCarModels = async (bodyStyleName?: string, limit = 8) => {
  let query = supabase
    .from(TABLES.PRODUCTS)
    .select('id,model_id,year_manufactured,price,media_urls,brand_id,brands(name),models(name)')
    .eq('condition_type', 'new')
    .eq('status', 'available')

  if (bodyStyleName) {
    const { data: bodyStyleData } = await supabase
      .from(TABLES.BODY_STYLES)
      .select('id')
      .eq('name', bodyStyleName)
      .single()
    if (bodyStyleData) {
      query = query.eq('body_style_id', bodyStyleData.id)
    }
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit)

  if (error) {
    return { data: null, error }
  }

  return { data: data ? camelcaseKeys(data, { deep: true }) : null, error: null }
}

export const getProductById = async (id: string) => {
  const { data, error } = await supabase
    .from(TABLES.PRODUCTS)
    .select(
      `
      *,
      brands(name),
      fuels(name),
      transmissions(name),
      locations(name),
      colors(name),
      body_styles(name),
      models(name),
      versions(name),
      stores(name,logo_url)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    return { data: null, error }
  }

  const camelized = camelcaseKeys(data, { deep: true })
  const store = camelized.stores
    ? {
        storeName: camelized.stores.name || '',
        storeLogo: camelized.stores.logoUrl || null
      }
    : null
  const normalized: ProductDetailData = {
    ...camelized,
    storeId: camelized.storeId || null,
    store,
    brands: normalizeRelation(camelized.brands),
    fuels: normalizeRelation(camelized.fuels),
    transmissions: normalizeRelation(camelized.transmissions),
    locations: normalizeRelation(camelized.locations),
    colors: normalizeRelation(camelized.colors),
    bodyStyles: normalizeRelation(camelized.bodyStyles),
    models: normalizeRelation(camelized.models),
    versions: normalizeRelation(camelized.versions)
  }

  return { data: normalized, error: null }
}

export const getSimilarProducts = async (modelId: string, excludeId: string, limit = 3) => {
  const { data, error } = await supabase
    .from(TABLES.PRODUCTS)
    .select('id,title,price,media_urls,mileage_km,origin,condition_type,warranty_policy')
    .eq('status', 'available')
    .neq('id', excludeId)
    .eq('model_id', modelId)
    .limit(limit)

  if (error) {
    return { data: null, error }
  }

  return { data: data ? camelcaseKeys(data, { deep: true }) : null, error: null }
}

export const getSimilarProductsBySpecs = async (
  product: ProductDetailData,
  excludeId: string,
  limit = 3
) => {
  let query = supabase
    .from(TABLES.PRODUCTS)
    .select(
      'id,title,price,media_urls,mileage_km,origin,condition_type,warranty_policy,brand_id,fuel_id,transmission_id,body_style_id,drive,power,torque,engine_capacity,fuel_consumption,doors,weight,payload,ground_clearance'
    )
    .eq('status', 'available')
    .neq('id', excludeId)

  const productAny = product as any
  const hasCondition = []

  if (product.brandId) {
    query = query.eq('brand_id', product.brandId)
    hasCondition.push(true)
  }

  if (product.bodyStyleId) {
    query = query.eq('body_style_id', product.bodyStyleId)
    hasCondition.push(true)
  }

  if (productAny.fuelId) {
    query = query.eq('fuel_id', productAny.fuelId)
    hasCondition.push(true)
  } else if (product.fuels?.name) {
    const { data: fuelData } = await supabase
      .from(TABLES.FUELS)
      .select('id')
      .eq('name', product.fuels.name)
      .single()
    if (fuelData) {
      query = query.eq('fuel_id', fuelData.id)
      hasCondition.push(true)
    }
  }

  if (productAny.transmissionId) {
    query = query.eq('transmission_id', productAny.transmissionId)
    hasCondition.push(true)
  } else if (product.transmissions?.name) {
    const { data: transmissionData } = await supabase
      .from(TABLES.TRANSMISSIONS)
      .select('id')
      .eq('name', product.transmissions.name)
      .single()
    if (transmissionData) {
      query = query.eq('transmission_id', transmissionData.id)
      hasCondition.push(true)
    }
  }

  if (product.conditionType) {
    query = query.eq('condition_type', product.conditionType)
    hasCondition.push(true)
  }

  if (hasCondition.length === 0) {
    return { data: [], error: null }
  }

  const { data, error } = await query.order('created_at', { ascending: false }).limit(limit)

  if (error) {
    return { data: null, error }
  }

  return { data: data ? camelcaseKeys(data, { deep: true }) : null, error: null }
}

export const getRelatedProducts = async (bodyStyleId: string, excludeId: string, limit = 4) => {
  const { data, error } = await supabase
    .from(TABLES.PRODUCTS)
    .select('id,title,price,media_urls,body_styles(name),fuels(name),transmissions(name)')
    .eq('status', 'available')
    .neq('id', excludeId)
    .eq('body_style_id', bodyStyleId)
    .limit(limit)

  if (error) {
    return { data: null, error }
  }

  const normalized = (data ?? []).map(p => {
    const camelized = camelcaseKeys(p, { deep: true })
    return {
      ...camelized,
      image: camelized.mediaUrls?.[0] || null,
      imageCount: camelized.mediaUrls?.length ?? 0,
      bodyStyles: normalizeRelation(camelized.bodyStyles),
      fuels: normalizeRelation(camelized.fuels),
      transmissions: normalizeRelation(camelized.transmissions)
    }
  })

  return { data: normalized, error: null }
}

export const getProducts = async (filters: ProductFilters = {}) => {
  let query = supabase
    .from(TABLES.PRODUCTS)
    .select(
      '*,body_styles(name),fuels(name),transmissions(name),locations(name),colors(name),models(name),versions(name),stores(name,logo_url)',
      {
        count: 'exact'
      }
    )

  if (filters.status) {
    query = query.eq('status', filters.status)
  } else {
    query = query.eq('status', 'available')
  }

  if (filters.q) {
    query = query.ilike('title', `%${filters.q}%`)
  }

  if (filters.location && filters.location !== 'Tất cả') {
    const { data: locationData } = await supabase
      .from(TABLES.LOCATIONS)
      .select('id')
      .eq('name', filters.location)
      .single()
    if (locationData) {
      query = query.eq('location_id', locationData.id)
    }
  }

  if (filters.year && filters.year !== 'Tất cả') {
    query = query.eq('year_manufactured', filters.year)
  }

  if (filters.brands && filters.brands.length > 0) {
    const { data: brandData } = await supabase
      .from(TABLES.BRANDS)
      .select('id')
      .in('name', filters.brands)
    if (brandData && brandData.length > 0) {
      query = query.in(
        'brand_id',
        brandData.map(b => b.id)
      )
    }
  }

  if (filters.conditionTypes && filters.conditionTypes.length > 0) {
    const conditionTypes = filters.conditionTypes.map(s => {
      if (s === 'Xe mới') return 'new'
      if (s === 'Xe cũ') return 'used'
      return s
    })
    query = query.in('condition_type', conditionTypes)
  }

  if (filters.fuels && filters.fuels.length > 0) {
    const { data: fuelData } = await supabase
      .from(TABLES.FUELS)
      .select('id')
      .in('name', filters.fuels)
    if (fuelData && fuelData.length > 0) {
      query = query.in(
        'fuel_id',
        fuelData.map(f => f.id)
      )
    }
  }

  if (filters.transmissions && filters.transmissions.length > 0) {
    const { data: transmissionData } = await supabase
      .from(TABLES.TRANSMISSIONS)
      .select('id')
      .in('name', filters.transmissions)
    if (transmissionData && transmissionData.length > 0) {
      query = query.in(
        'transmission_id',
        transmissionData.map(t => t.id)
      )
    }
  }

  if (filters.colors && filters.colors.length > 0) {
    const { data: colorData } = await supabase
      .from(TABLES.COLORS)
      .select('id')
      .in('name', filters.colors)
    if (colorData && colorData.length > 0) {
      query = query.in(
        'color_id',
        colorData.map(c => c.id)
      )
    }
  }

  if (filters.origins && filters.origins.length > 0) {
    query = query.in('origin', filters.origins)
  }

  if (filters.bodyStyles && filters.bodyStyles.length > 0) {
    const { data: bodyStyleData } = await supabase
      .from(TABLES.BODY_STYLES)
      .select('id')
      .in('name', filters.bodyStyles)
    if (bodyStyleData && bodyStyleData.length > 0) {
      query = query.in(
        'body_style_id',
        bodyStyleData.map(b => b.id)
      )
    }
  }

  if (filters.priceRange && filters.priceRange.length > 0) {
    const ranges = filters.priceRange
    const range = ranges.length === 1 ? ranges[0] : undefined
    if (range) {
      query = query.gte('price', range.min).lte('price', range.max)
    }
  }

  if (filters.sortBy === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else if (filters.sortBy === 'price_asc') {
    query = query.order('price', { ascending: true }).order('created_at', { ascending: false })
  } else if (filters.sortBy === 'price_desc') {
    query = query.order('price', { ascending: false }).order('created_at', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  if (filters.limit) {
    query = query.limit(filters.limit)
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1)
  }

  const { data, error, count } = await query

  if (error) {
    return { data: null, error, count: null }
  }

  const normalized = (data ?? []).map(d => {
    const camelized = camelcaseKeys(d, { deep: true }) as any
    const media = (camelized.mediaUrls as string[] | null) ?? []
    const store = camelized.stores
      ? {
          storeName: camelized.stores.name || '',
          storeLogo: camelized.stores.logoUrl || null
        }
      : null
    return {
      ...camelized,
      image: media[0] || '',
      store,
      imageCount: media.length,
      statsSelling: camelized.statsSelling ?? 0,
      statsSold: camelized.statsSold ?? 0,
      year: camelized.yearManufactured,
      mediaUrls: media,
      bodyStyles: normalizeRelation(camelized.bodyStyles),
      fuels: normalizeRelation(camelized.fuels),
      transmissions: normalizeRelation(camelized.transmissions),
      locations: normalizeRelation(camelized.locations),
      colors: normalizeRelation(camelized.colors),
      models: normalizeRelation(camelized.models),
      versions: normalizeRelation(camelized.versions)
    }
  })

  return { data: normalized, error: null, count }
}

export const getLocations = async () => {
  const { data, error } = await supabase
    .from(TABLES.LOCATIONS)
    .select('*')
    .order('name', { ascending: true })
  if (error) {
    return { data: null, error }
  }
  return { data: data ? camelcaseKeys(data, { deep: true }) : null, error: null }
}

export const getFuels = async () => {
  const { data, error } = await supabase
    .from(TABLES.FUELS)
    .select('*')
    .order('name', { ascending: true })
  if (error) {
    return { data: null, error }
  }
  return { data: data ? camelcaseKeys(data, { deep: true }) : null, error: null }
}

export const getTransmissions = async () => {
  const { data, error } = await supabase
    .from(TABLES.TRANSMISSIONS)
    .select('*')
    .order('name', { ascending: true })
  if (error) {
    return { data: null, error }
  }
  return { data: data ? camelcaseKeys(data, { deep: true }) : null, error: null }
}

export const getColors = async () => {
  const { data, error } = await supabase
    .from(TABLES.COLORS)
    .select('*')
    .order('name', { ascending: true })
  if (error) {
    return { data: null, error }
  }
  return { data: data ? camelcaseKeys(data, { deep: true }) : null, error: null }
}

export const getBodyStyles = async () => {
  const { data, error } = await supabase
    .from(TABLES.BODY_STYLES)
    .select('*')
    .order('name', { ascending: true })
  if (error) {
    return { data: null, error }
  }
  return { data: data ? camelcaseKeys(data, { deep: true }) : null, error: null }
}

export const getFavorites = async (user: User | null) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const { data, error } = await supabase
    .from(TABLES.PRODUCT_FAVORITES)
    .select(
      `
      id,
      created_at,
      products!inner(
        id,
        title,
        price,
        created_at,
        media_urls,
        body_styles(name),
        fuels(name),
        transmissions(name),
        locations(name),
        colors(name),
        stores(name,logo_url)
      )
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error }
  }

  const normalized = (data ?? [])
    .map(item => {
      const camelized = camelcaseKeys(item, { deep: true })
      const product = (camelized as any).products
      if (!product) return null

      const media = (product.mediaUrls as string[] | null) ?? []
      const store = product.stores
        ? {
            storeName: product.stores.name || '',
            storeLogo: product.stores.logoUrl || null
          }
        : null
      return {
        id: camelized.id,
        favoriteId: camelized.id,
        productId: product.id,
        title: product.title,
        price: product.price,
        image: media[0] ?? 'https://via.placeholder.com/250x231',
        store,
        createdAt: product.createdAt,
        likedAt: camelized.createdAt,
        imageCount: media.length,
        bodyStyles: normalizeRelation(product.bodyStyles),
        fuels: normalizeRelation(product.fuels),
        transmissions: normalizeRelation(product.transmissions),
        locations: normalizeRelation(product.locations),
        colors: normalizeRelation(product.colors)
      }
    })
    .filter(Boolean)

  return { data: normalized, error: null }
}

export const addFavorite = async (productId: string, user: User | null) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const { data, error } = await supabase
    .from(TABLES.PRODUCT_FAVORITES)
    .insert({
      user_id: user.id,
      product_id: productId
    })
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: camelcaseKeys(data, { deep: true }), error: null }
}

export const checkFavorite = async (productId: string, user: User | null) => {
  if (!user) {
    return { data: null, error: null }
  }

  const { data, error } = await supabase
    .from(TABLES.PRODUCT_FAVORITES)
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    return { data: null, error }
  }

  return { data: data ? camelcaseKeys(data, { deep: true }) : null, error: null }
}

export const removeFavorite = async (favoriteId: string, user: User | null) => {
  if (!user) {
    return { error: { message: 'User not authenticated' } }
  }

  const { error } = await supabase
    .from(TABLES.PRODUCT_FAVORITES)
    .delete()
    .eq('id', favoriteId)
    .eq('user_id', user.id)

  return { error }
}

export const removeFavoriteByProductId = async (productId: string, user: User | null) => {
  if (!user) {
    return { error: { message: 'User not authenticated' } }
  }

  const { error } = await supabase
    .from(TABLES.PRODUCT_FAVORITES)
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)

  return { error }
}

export type StoreProductsFilters = {
  storeId: string
  status?: StoreProduct['status']
  sortBy?: 'updated_desc' | 'price_asc' | 'price_desc'
  search?: string
  page?: number
  pageSize?: number
}

export const getStoreProducts = async (filters: StoreProductsFilters) => {
  const { storeId, status, sortBy = 'updated_desc', search, page = 1, pageSize = 6 } = filters

  let query = supabase
    .from(TABLES.PRODUCTS)
    .select('id,title,price,status,updated_at,created_at,media_urls', {
      count: 'exact'
    })
    .eq('store_id', storeId)

  if (status) {
    query = query.eq('status', status)
  }

  if (search && search.trim().length > 0) {
    query = query.ilike('title', `%${search.trim()}%`)
  }

  if (sortBy === 'price_asc') {
    query = query.order('price', { ascending: true }).order('updated_at', { ascending: false })
  } else if (sortBy === 'price_desc') {
    query = query.order('price', { ascending: false }).order('updated_at', { ascending: false })
  } else {
    query = query.order('updated_at', { ascending: false })
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    return { data: null, error, count: null }
  }

  const items: StoreProduct[] = (data ?? []).map(item => {
    const camelized = camelcaseKeys(item, { deep: true }) as any
    return {
      id: camelized.id,
      title: camelized.title,
      price: camelized.price,
      mediaUrls: (camelized.mediaUrls as string[] | null) ?? [],
      status: camelized.status,
      updatedAt: camelized.updatedAt ?? null,
      createdAt: camelized.createdAt ?? null
    }
  })

  return { data: items, error: null, count: count ?? 0 }
}

export const getStoreProductCounts = async (storeId: string) => {
  const statuses: StoreProduct['status'][] = ['pending', 'available', 'sold', 'rejected']
  const queries = statuses.map(status =>
    supabase
      .from(TABLES.PRODUCTS)
      .select('id', { count: 'exact', head: true })
      .eq('store_id', storeId)
      .eq('status', status)
  )

  const results = await Promise.all(queries)

  const failed = results.find(result => result.error)
  if (failed && failed.error) {
    return { data: null, error: failed.error }
  }

  const counts: Record<StoreProduct['status'], number> = {
    pending: 0,
    available: 0,
    sold: 0,
    rejected: 0
  }

  results.forEach((result, index) => {
    const status = statuses[index]
    if (status) {
      counts[status] = result.count ?? 0
    }
  })

  const total = Object.values(counts).reduce((acc, value) => acc + value, 0)

  const formatted: StoreProductCounts = {
    total,
    pending: counts.pending,
    available: counts.available,
    sold: counts.sold,
    rejected: counts.rejected
  }

  return { data: formatted, error: null }
}

export const updateStoreProductStatus = async (
  productId: string,
  storeId: string,
  status: StoreProduct['status'],
  user: User | null
) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const payload = snakecaseKeys(
    {
      status,
      updatedAt: new Date().toISOString()
    },
    { deep: true }
  )

  const { data, error } = await supabase
    .from(TABLES.PRODUCTS)
    .update(payload)
    .eq('id', productId)
    .eq('store_id', storeId)
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  const camelized = camelcaseKeys(data, { deep: true }) as any
  const formatted: StoreProduct = {
    id: camelized.id,
    title: camelized.title,
    price: camelized.price,
    mediaUrls: (camelized.mediaUrls as string[] | null) ?? [],
    status: camelized.status,
    updatedAt: camelized.updatedAt ?? null,
    createdAt: camelized.createdAt ?? null
  }

  return { data: formatted, error: null }
}

export const deleteStoreProduct = async (productId: string, storeId: string, user: User | null) => {
  if (!user) {
    return { error: { message: 'User not authenticated' } }
  }

  const { error } = await supabase
    .from(TABLES.PRODUCTS)
    .delete()
    .eq('id', productId)
    .eq('store_id', storeId)

  return { error }
}

export type CreateProductInput = {
  title: string
  description: string | null
  price: number
  mileageKm: number | null
  conditionType: 'new' | 'used'
  origin: string
  warrantyPolicy: string | null
  brandId: string
  modelId: string
  yearManufactured: string
  versionId: string
  transmissionId: string
  fuelId: string
  bodyStyleId: string
  seats: number
  colorId: string
  mediaUrls: string[]
  specs: Array<{ name: string; value: string }>
  storeId: string | null
}

export const createProduct = async (input: CreateProductInput, user: User | null) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const payload = snakecaseKeys(
    {
      title: input.title,
      description: input.description,
      price: input.price,
      mileageKm: input.mileageKm,
      conditionType: input.conditionType,
      origin: input.origin,
      warrantyPolicy: input.warrantyPolicy,
      brandId: input.brandId,
      modelId: input.modelId,
      yearManufactured: input.yearManufactured,
      versionId: input.versionId,
      transmissionId: input.transmissionId,
      fuelId: input.fuelId,
      bodyStyleId: input.bodyStyleId,
      seats: input.seats,
      colorId: input.colorId,
      mediaUrls: input.mediaUrls,
      specs: input.specs,
      storeId: input.storeId,
      status: 'pending'
    },
    { deep: true }
  )

  const { data, error } = await supabase.from(TABLES.PRODUCTS).insert(payload).select().single()

  if (error) {
    return { data: null, error }
  }

  const formatted = camelcaseKeys(data, { deep: true })
  return { data: formatted, error: null }
}

export const uploadProductMedia = async (file: File, user: User | null) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const extension = file.name.split('.').pop()
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 9)
  const filePath = `products/${user.id}/${timestamp}-${randomStr}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.MEDIA)
    .upload(filePath, file, { upsert: false })

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(STORAGE_BUCKETS.MEDIA).getPublicUrl(filePath)

  return { data: { url: publicUrl, path: filePath }, error: null }
}

export type AdminProduct = {
  id: string
  title: string
  price: number
  status: 'pending' | 'available' | 'sold' | 'rejected'
  mediaUrls: string[]
  createdAt: string | null
  updatedAt: string | null
  approvedAt: string | null
  approvedBy: string | null
  rejectedBy: string | null
  rejectedReason: string | null
  store?: {
    name: string
    logoUrl: string | null
  } | null
  brands?: { name: string } | null
  models?: { name: string } | null
  yearManufactured: string | null
  mileageKm: number | null
  conditionType: string
}

export const getAdminProducts = async (options?: {
  page?: number
  pageSize?: number
  search?: string
  status?: 'all' | 'pending' | 'available' | 'sold' | 'rejected'
}) => {
  const page = options?.page || 1
  const pageSize = options?.pageSize || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from(TABLES.PRODUCTS)
    .select(
      'id,title,price,status,media_urls,created_at,updated_at,approved_at,approved_by,rejected_by,rejected_reason,year_manufactured,mileage_km,condition_type,stores(name,logo_url),brands(name),models(name)',
      { count: 'exact' }
    )

  if (options?.search) {
    query = query.ilike('title', `%${options.search}%`)
  }

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error, count } = await query.range(from, to)

  if (error) {
    return { data: null, error, totalCount: 0 }
  }

  const normalized = (data ?? []).map(item => {
    const camelized = camelcaseKeys(item, { deep: true }) as any
    return {
      id: camelized.id,
      title: camelized.title,
      price: camelized.price,
      status: camelized.status,
      mediaUrls: (camelized.mediaUrls as string[] | null) ?? [],
      createdAt: camelized.createdAt ?? null,
      updatedAt: camelized.updatedAt ?? null,
      approvedAt: camelized.approvedAt ?? null,
      approvedBy: camelized.approvedBy ?? null,
      rejectedBy: camelized.rejectedBy ?? null,
      rejectedReason: camelized.rejectedReason ?? null,
      yearManufactured: camelized.yearManufactured ?? null,
      mileageKm: camelized.mileageKm ?? null,
      conditionType: camelized.conditionType,
      store: camelized.stores
        ? {
            name: camelized.stores.name || '',
            logoUrl: camelized.stores.logoUrl || null
          }
        : null,
      brands: camelized.brands ? { name: camelized.brands.name } : null,
      models: camelized.models ? { name: camelized.models.name } : null
    }
  })

  return { data: normalized, error: null, totalCount: count || 0 }
}

export const approveProduct = async (productId: string, userId: string) => {
  const payload = snakecaseKeys(
    {
      status: 'available',
      approvedBy: userId,
      approvedAt: new Date().toISOString(),
      rejectedBy: null,
      rejectedReason: null,
      updatedAt: new Date().toISOString()
    },
    { deep: true }
  )

  const { data, error } = await supabase
    .from(TABLES.PRODUCTS)
    .update(payload)
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  const camelized = camelcaseKeys(data, { deep: true }) as any
  return { data: camelized, error: null }
}

export const rejectProduct = async (productId: string, userId: string, reason: string) => {
  const payload = snakecaseKeys(
    {
      status: 'rejected',
      rejectedBy: userId,
      rejectedReason: reason,
      approvedBy: null,
      approvedAt: null,
      updatedAt: new Date().toISOString()
    },
    { deep: true }
  )

  const { data, error } = await supabase
    .from(TABLES.PRODUCTS)
    .update(payload)
    .eq('id', productId)
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  const camelized = camelcaseKeys(data, { deep: true }) as any
  return { data: camelized, error: null }
}
