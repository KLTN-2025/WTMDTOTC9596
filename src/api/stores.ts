import camelcaseKeys from 'camelcase-keys'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/configs/supabase'
import { STORAGE_BUCKETS, TABLES } from '@/configs/db'
import type { Store, StoreStats } from '@/types/stores'

export type UpsertStoreInput = {
  name: string
  logoUrl: string
  bannerUrl: string
  description: string
  taxCode: string | null
  invoiceInfo: Record<string, unknown> | null
  contactEmail: string
  contactPhone: string
  address: string | null
  websiteLink: string | null
  zalo: string | null
  storeType?: 'personal' | 'business'
}

export const getStore = async (user: User | null) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const { data, error } = await supabase
    .from(TABLES.STORES)
    .select('*')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (error) {
    return { data: null, error }
  }

  if (!data) {
    return { data: null, error: null }
  }

  const formatted = camelcaseKeys(data, { deep: true }) as Store
  return { data: formatted, error: null }
}

export const upsertStore = async (input: UpsertStoreInput, user: User | null) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const payload = {
    owner_id: user.id,
    name: input.name,
    logo_url: input.logoUrl,
    banner_url: input.bannerUrl,
    description: input.description,
    tax_code: input.taxCode,
    invoice_info: input.invoiceInfo,
    address: input.address && input.address.length > 0 ? input.address : null,
    contact_phone: input.contactPhone,
    contact_email: input.contactEmail,
    zalo: input.zalo,
    website_link: input.websiteLink,
    store_type: input.storeType ?? 'personal',
    status: 'active',
    verified: true,
    updated_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from(TABLES.STORES)
    .upsert(payload, { onConflict: 'owner_id' })
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  const formatted = camelcaseKeys(data, { deep: true }) as Store
  return { data: formatted, error: null }
}

export const uploadStoreAsset = async (file: File, user: User | null, key: 'logo' | 'banner') => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const extension = file.name.split('.').pop()
  const timestamp = Date.now()
  const filePath = `stores/${user.id}/${key}-${timestamp}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.MEDIA)
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(STORAGE_BUCKETS.MEDIA).getPublicUrl(filePath)

  return { data: { url: publicUrl, path: filePath }, error: null }
}

export const getStoreStats = async (storeId: string) => {
  if (!storeId) {
    return { data: null, error: null }
  }

  const { data: products, error: productsError } = await supabase
    .from(TABLES.PRODUCTS)
    .select('id,status')
    .eq('store_id', storeId)

  if (productsError) {
    return { data: null, error: productsError }
  }

  const productList = products ?? []
  const selling = productList.filter(product => product.status === 'available').length
  const sold = productList.filter(product => product.status === 'sold').length
  const productIds = productList.map(product => product.id).filter(Boolean)

  let favorites = 0
  if (productIds.length > 0) {
    const { count, error: reactionsError } = await supabase
      .from(TABLES.PRODUCT_REACTIONS)
      .select('id', { count: 'exact', head: true })
      .in('product_id', productIds)
      .in('reaction_type', ['happy', 'love'])

    if (reactionsError) {
      return { data: null, error: reactionsError }
    }
    favorites = count ?? 0
  }

  const stats: StoreStats = {
    selling,
    sold,
    favorites
  }

  return { data: stats, error: null }
}
