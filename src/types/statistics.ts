export type UserStats = {
  total: number
  byRole: {
    buyer: number
    seller: number
    admin: number
  }
  newUsersByMonth: Array<{
    month: string
    count: number
  }>
}

export type ProductStats = {
  total: number
  byStatus: {
    pending: number
    rejected: number
    available: number
    sold: number
  }
  byBrand: Array<{
    brandName: string
    count: number
  }>
  byCondition: {
    new: number
    used: number
  }
  newProductsByMonth: Array<{
    month: string
    count: number
  }>
}

export type StoreStats = {
  total: number
  byStatus: {
    pending: number
    active: number
    suspended: number
    banned: number
  }
  byType: {
    personal: number
    business: number
  }
  newStoresByMonth: Array<{
    month: string
    count: number
  }>
}

export type EngagementStats = {
  totalFavorites: number
  totalComments: number
  totalReactions: number
  favoritesByMonth: Array<{
    month: string
    count: number
  }>
  commentsByMonth: Array<{
    month: string
    count: number
  }>
  reactionsByType: Array<{
    reactionType: string
    count: number
  }>
}

export type TestDriveStats = {
  total: number
  byStatus: {
    pending: number
    confirmed: number
    completed: number
    cancelled: number
  }
  bookingsByMonth: Array<{
    month: string
    count: number
  }>
}

export type DashboardStats = {
  users: UserStats
  products: ProductStats
  stores: StoreStats
  engagement: EngagementStats
  testDrives: TestDriveStats
}
