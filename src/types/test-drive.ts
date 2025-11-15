export type TestDriveBooking = {
  id: string
  userId: string
  productId: string
  storeId: string | null
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
    model: string | null
  } | null
  store?: {
    storeName: string
    storeLogo: string | null
  } | null
}

export type CustomerContact = {
  id: string
  userId: string
  productId: string
  storeId: string | null
  fullName: string
  phone: string
  scheduledAt: string
  location: string
  note: string | null
  status: 'confirmed'
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    email: string
  } | null
  profile?: {
    id: string
    fullName: string | null
    phone: string | null
    address: string | null
    avatarUrl: string | null
    email: string | null
  } | null
}

export type TestDriveBookingFormData = {
  fullName: string
  phone: string
  scheduledAt: string
  location: string
  note?: string
}
