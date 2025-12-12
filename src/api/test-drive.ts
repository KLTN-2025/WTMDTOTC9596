import { supabase } from '@/configs/supabase'
import { TABLES } from '@/configs/db'
import type { TestDriveBooking, TestDriveBookingFormData, BookingStatus } from '@/types/test-drive'
import camelcaseKeys from 'camelcase-keys'
import type { User } from '@supabase/supabase-js'
import { BOOKING_STATUS } from '@/configs/constants'
export const createTestDriveBooking = async (
  productId: string,
  storeId: string | null,
  formData: TestDriveBookingFormData,
  user: User | null
) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const { data, error } = await supabase
    .from(TABLES.TEST_DRIVE_BOOKINGS)
    .insert({
      user_id: user.id,
      product_id: productId,
      store_id: storeId,
      full_name: formData.fullName,
      phone: formData.phone,
      scheduled_at: formData.scheduledAt,
      location: formData.location,
      note: formData.note || null,
      status: BOOKING_STATUS.PENDING
    })
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: camelcaseKeys(data, { deep: true }) as TestDriveBooking, error: null }
}

export const getTestDriveBookings = async (
  storeId: string | null,
  options?: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    dateFrom?: string
    dateTo?: string
    includeAll?: boolean
  }
) => {
  const shouldFetchAll = options?.includeAll === true

  if (!storeId && !shouldFetchAll) {
    return { data: [], error: null, totalCount: 0 }
  }

  const page = options?.page || 1
  const pageSize = options?.pageSize || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from(TABLES.TEST_DRIVE_BOOKINGS)
    .select(
      `
      *,
      products(id, title, price, media_urls, models(name)),
      stores(id, name, logo_url)
    `,
      { count: 'exact' }
    )

  if (!shouldFetchAll && storeId) {
    query = query.eq('store_id', storeId)
  }

  if (options?.search) {
    const searchTerm = `%${options.search}%`
    query = query.or(`full_name.ilike.${searchTerm},phone.ilike.${searchTerm}`)
  }

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status)
  }

  if (options?.dateFrom) {
    query = query.gte('scheduled_at', options.dateFrom)
  }

  if (options?.dateTo) {
    query = query.lte('scheduled_at', options.dateTo)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error, count } = await query.range(from, to)

  if (error) {
    return { data: null, error, totalCount: 0 }
  }

  const normalized = (data ?? []).map(item => {
    const camelized = camelcaseKeys(item, { deep: true }) as any
    return {
      ...camelized,
      product: camelized.products
        ? {
            id: camelized.products.id,
            title: camelized.products.title,
            price: camelized.products.price,
            image: camelized.products.mediaUrls?.[0] || null,
            model: camelized.products.models?.name || null
          }
        : null,
      store: camelized.stores
        ? {
            storeName: camelized.stores.name,
            storeLogo: camelized.stores.logoUrl
          }
        : null
    }
  })

  return { data: normalized, error: null, totalCount: count || 0 }
}

export const cancelTestDriveBooking = async (bookingId: string, user: User | null) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const { data, error } = await supabase
    .from(TABLES.TEST_DRIVE_BOOKINGS)
    .update({ status: BOOKING_STATUS.CANCELLED })
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .eq('status', BOOKING_STATUS.PENDING)
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: camelcaseKeys(data, { deep: true }) as TestDriveBooking, error: null }
}

export const updateTestDriveBookingStatus = async (
  bookingId: string,
  status: Exclude<BookingStatus, typeof BOOKING_STATUS.PENDING>,
  user: User | null
) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const { data: storeData } = await supabase
    .from(TABLES.STORES)
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle()

  if (!storeData) {
    return { data: null, error: { message: 'Store not found' } }
  }

  const { data, error } = await supabase
    .from(TABLES.TEST_DRIVE_BOOKINGS)
    .update({ status })
    .eq('id', bookingId)
    .eq('store_id', storeData.id)
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: camelcaseKeys(data, { deep: true }) as TestDriveBooking, error: null }
}

export const getConfirmedCustomerContacts = async (
  storeId: string | null,
  options?: {
    page?: number
    pageSize?: number
    search?: string
    status?: typeof BOOKING_STATUS.CONFIRMED | typeof BOOKING_STATUS.COMPLETED | 'all'
    includeAll?: boolean
  }
) => {
  const shouldFetchAll = options?.includeAll === true

  if (!storeId && !shouldFetchAll) {
    return { data: [], error: null, totalCount: 0 }
  }

  const page = options?.page || 1
  const pageSize = options?.pageSize || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from(TABLES.TEST_DRIVE_BOOKINGS).select('*', { count: 'exact' })

  if (!shouldFetchAll && storeId) {
    query = query.eq('store_id', storeId)
  }

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status)
  } else if (!options?.status || options.status === 'all') {
    query = query.in('status', [BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.COMPLETED])
  }

  if (options?.search) {
    const searchTerm = `%${options.search}%`
    query = query.or(`full_name.ilike.${searchTerm},phone.ilike.${searchTerm}`)
  }

  query = query.order('scheduled_at', { ascending: false })

  const { data, error, count } = await query.range(from, to)

  if (error) {
    return { data: null, error, totalCount: 0 }
  }

  const userIds = [...new Set((data ?? []).map(item => item.user_id))]
  let profilesMap = new Map<string, any>()

  if (userIds.length > 0) {
    const { data: profilesData } = await supabase
      .from(TABLES.PROFILES)
      .select('id, full_name, phone, address, avatar_url, email')
      .in('id', userIds)

    if (profilesData) {
      profilesData.forEach(profile => {
        const camelized = camelcaseKeys(profile, { deep: true })
        profilesMap.set(camelized.id, camelized)
      })
    }
  }

  const normalized = (data ?? []).map(item => {
    const camelized = camelcaseKeys(item, { deep: true }) as any
    const profile = profilesMap.get(camelized.userId)

    return {
      ...camelized,
      user: profile?.email
        ? {
            id: camelized.userId,
            email: profile.email
          }
        : null,
      profile: profile
        ? {
            id: profile.id,
            fullName: profile.fullName,
            phone: profile.phone,
            address: profile.address,
            avatarUrl: profile.avatarUrl,
            email: profile.email
          }
        : null
    }
  })

  return { data: normalized, error: null, totalCount: count || 0 }
}
