export type Store = {
  id: string
  ownerId: string
  name: string
  description: string | null
  logoUrl: string | null
  bannerUrl: string | null
  storeType: 'personal' | 'business'
  taxCode: string | null
  invoiceInfo: Record<string, unknown> | null
  contactEmail: string | null
  contactPhone: string | null
  address: string | null
  websiteLink: string | null
  zalo: string | null
  verified: boolean
  status: 'pending' | 'active' | 'suspended' | 'banned'
  createdAt: string
  updatedAt: string
}

