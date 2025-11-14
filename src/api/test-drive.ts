import { supabase } from '@/configs/supabase'
import { TABLES } from '@/configs/db'
import type { TestDriveBooking, TestDriveBookingFormData } from '@/types/test-drive'
import camelcaseKeys from 'camelcase-keys'
import type { User } from '@supabase/supabase-js'
export const createTestDriveBooking = async (
  productId: string,
  sellerId: string | null,
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
      seller_id: sellerId,
      full_name: formData.fullName,
      phone: formData.phone,
      scheduled_at: formData.scheduledAt,
      location: formData.location,
      note: formData.note || null,
      status: 'pending'
    })
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: camelcaseKeys(data, { deep: true }) as TestDriveBooking, error: null }
}

export const getTestDriveBookings = async (user: User | null) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const { data, error } = await supabase
    .from(TABLES.TEST_DRIVE_BOOKINGS)
    .select(
      `
      *,
      products(id, title, price, media_urls),
      sellers(store_name, store_logo)
    `
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { data: null, error }
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
            image: camelized.products.mediaUrls?.[0] || null
          }
        : null,
      seller: camelized.sellers
        ? {
            storeName: camelized.sellers.storeName,
            storeLogo: camelized.sellers.storeLogo
          }
        : null
    }
  })

  return { data: normalized, error: null }
}

export const cancelTestDriveBooking = async (bookingId: string, user: User | null) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const { data, error } = await supabase
    .from(TABLES.TEST_DRIVE_BOOKINGS)
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .eq('user_id', user.id)
    .eq('status', 'pending')
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  return { data: camelcaseKeys(data, { deep: true }) as TestDriveBooking, error: null }
}
