export type TestDriveBooking = {
  id: string
  userId: string
  productId: string
  sellerId: string | null
  fullName: string
  phone: string
  scheduledAt: string
  location: string
  note: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  createdAt: string
  updatedAt: string
  product?: {
    id: string
    title: string
    price: number
    image: string | null
  } | null
  seller?: {
    storeName: string
    storeLogo: string | null
  } | null
}

export type TestDriveBookingFormData = {
  fullName: string
  phone: string
  scheduledAt: string
  location: string
  note?: string
}
