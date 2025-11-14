import { supabase } from '@/configs/supabase'
import { TABLES } from '@/configs/db'
import type { ProductListItem, ProductDetailData, ProductFilters } from '@/types/products'
import { normalizeRelation } from '@/utils/products'
import camelcaseKeys from 'camelcase-keys'
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
      'id,title,price,created_at,media_urls,body_styles(name),fuels(name),transmissions(name),locations(name),sellers(store_name,store_logo)',
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
    const seller = camelized.sellers
      ? {
          storeName: camelized.sellers.storeName || '',
          storeLogo: camelized.sellers.storeLogo || null
        }
      : null
    return {
      id: camelized.id,
      title: camelized.title,
      price: camelized.price,
      image: media[0] || null,
      seller,
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
    .select('id,model_name,year_manufactured,price,media_urls,brand_id,brands(name)')
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
      sellers(store_name,store_logo)
    `
    )
    .eq('id', id)
    .single()

  if (error) {
    return { data: null, error }
  }

  const camelized = camelcaseKeys(data, { deep: true })
  const seller = camelized.sellers
    ? {
        storeName: camelized.sellers.storeName || '',
        storeLogo: camelized.sellers.storeLogo || null
      }
    : null
  const normalized: ProductDetailData = {
    ...camelized,
    sellerId: camelized.sellerId || null,
    seller,
    brands: normalizeRelation(camelized.brands),
    fuels: normalizeRelation(camelized.fuels),
    transmissions: normalizeRelation(camelized.transmissions),
    locations: normalizeRelation(camelized.locations),
    colors: normalizeRelation(camelized.colors),
    bodyStyles: normalizeRelation(camelized.bodyStyles)
  }

  return { data: normalized, error: null }
}

export const getSimilarProducts = async (modelName: string, excludeId: string, limit = 3) => {
  const { data, error } = await supabase
    .from(TABLES.PRODUCTS)
    .select('id,title,price,media_urls,mileage_km,origin,condition_type,warranty_policy')
    .eq('status', 'available')
    .neq('id', excludeId)
    .eq('model_name', modelName)
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
      '*,body_styles(name),fuels(name),transmissions(name),locations(name),colors(name),sellers(store_name,store_logo)',
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
    const seller = camelized.sellers
      ? {
          storeName: camelized.sellers.storeName || '',
          storeLogo: camelized.sellers.storeLogo || null
        }
      : null
    return {
      ...camelized,
      image: media[0] || '',
      seller,
      imageCount: media.length,
      statsSelling: camelized.statsSelling ?? 0,
      statsSold: camelized.statsSold ?? 0,
      year: camelized.yearManufactured,
      mediaUrls: media,
      bodyStyles: normalizeRelation(camelized.bodyStyles),
      fuels: normalizeRelation(camelized.fuels),
      transmissions: normalizeRelation(camelized.transmissions),
      locations: normalizeRelation(camelized.locations),
      colors: normalizeRelation(camelized.colors)
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
        sellers(store_name,store_logo)
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
      const seller = product.sellers
        ? {
            storeName: product.sellers.storeName || '',
            storeLogo: product.sellers.storeLogo || null
          }
        : null
      return {
        id: camelized.id,
        favoriteId: camelized.id,
        productId: product.id,
        title: product.title,
        price: product.price,
        image: media[0] ?? 'https://via.placeholder.com/250x231',
        seller,
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
    .single()

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
