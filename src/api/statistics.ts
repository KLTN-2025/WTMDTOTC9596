import { supabase } from '@/configs/supabase'
import { TABLES } from '@/configs/db'
import type {
  UserStats,
  ProductStats,
  StoreStats,
  EngagementStats,
  TestDriveStats,
  DashboardStats
} from '@/types/statistics'

const formatMonth = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const getLast12Months = (): string[] => {
  const months: string[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push(formatMonth(date))
  }
  return months
}

const fillMissingMonths = (
  data: Array<{ month: string; count: number }>,
  months: string[]
): Array<{ month: string; count: number }> => {
  const dataMap = new Map(data.map(item => [item.month, item.count]))
  return months.map(month => ({
    month,
    count: dataMap.get(month) || 0
  }))
}

export const getUserStats = async (): Promise<{ data: UserStats | null; error: any }> => {
  try {
    const { count: total, error: totalError } = await supabase
      .from(TABLES.PROFILES)
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      return { data: null, error: totalError }
    }

    const { data: byRoleData, error: byRoleError } = await supabase
      .from(TABLES.PROFILES)
      .select('role')

    if (byRoleError) {
      return { data: null, error: byRoleError }
    }

    const byRole = {
      buyer: 0,
      seller: 0,
      admin: 0
    }

    byRoleData?.forEach(item => {
      if (item.role === 'buyer') byRole.buyer++
      else if (item.role === 'seller') byRole.seller++
      else if (item.role === 'admin') byRole.admin++
    })

    const { data: newUsersData, error: newUsersError } = await supabase
      .from(TABLES.PROFILES)
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (newUsersError) {
      return { data: null, error: newUsersError }
    }

    const monthlyCounts = new Map<string, number>()
    newUsersData?.forEach(item => {
      const month = formatMonth(new Date(item.created_at))
      monthlyCounts.set(month, (monthlyCounts.get(month) || 0) + 1)
    })

    const months = getLast12Months()
    const newUsersByMonth = fillMissingMonths(
      Array.from(monthlyCounts.entries()).map(([month, count]) => ({ month, count })),
      months
    )

    return {
      data: {
        total: total || 0,
        byRole,
        newUsersByMonth
      },
      error: null
    }
  } catch (error) {
    return { data: null, error }
  }
}

export const getProductStats = async (): Promise<{ data: ProductStats | null; error: any }> => {
  try {
    const { count: total, error: totalError } = await supabase
      .from(TABLES.PRODUCTS)
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      return { data: null, error: totalError }
    }

    const { data: byStatusData, error: byStatusError } = await supabase
      .from(TABLES.PRODUCTS)
      .select('status')

    if (byStatusError) {
      return { data: null, error: byStatusError }
    }

    const byStatus = {
      pending: 0,
      rejected: 0,
      available: 0,
      sold: 0
    }

    byStatusData?.forEach(item => {
      if (item.status === 'pending') byStatus.pending++
      else if (item.status === 'rejected') byStatus.rejected++
      else if (item.status === 'available') byStatus.available++
      else if (item.status === 'sold') byStatus.sold++
    })

    const { data: byConditionData, error: byConditionError } = await supabase
      .from(TABLES.PRODUCTS)
      .select('condition_type')

    if (byConditionError) {
      return { data: null, error: byConditionError }
    }

    const byCondition = {
      new: 0,
      used: 0
    }

    byConditionData?.forEach(item => {
      if (item.condition_type === 'new') byCondition.new++
      else if (item.condition_type === 'used') byCondition.used++
    })

    const { data: brandData, error: brandError } = await supabase
      .from(TABLES.PRODUCTS)
      .select('brand_id, brands(name)')
      .not('brand_id', 'is', null)

    if (brandError) {
      return { data: null, error: brandError }
    }

    const brandCounts = new Map<string, number>()
    brandData?.forEach(item => {
      const brand = Array.isArray(item.brands) ? item.brands[0] : item.brands
      if (brand && typeof brand === 'object' && 'name' in brand && typeof brand.name === 'string') {
        brandCounts.set(brand.name, (brandCounts.get(brand.name) || 0) + 1)
      }
    })

    const byBrand = Array.from(brandCounts.entries())
      .map(([brandName, count]) => ({ brandName, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const { data: newProductsData, error: newProductsError } = await supabase
      .from(TABLES.PRODUCTS)
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (newProductsError) {
      return { data: null, error: newProductsError }
    }

    const monthlyCounts = new Map<string, number>()
    newProductsData?.forEach(item => {
      const month = formatMonth(new Date(item.created_at))
      monthlyCounts.set(month, (monthlyCounts.get(month) || 0) + 1)
    })

    const months = getLast12Months()
    const newProductsByMonth = fillMissingMonths(
      Array.from(monthlyCounts.entries()).map(([month, count]) => ({ month, count })),
      months
    )

    return {
      data: {
        total: total || 0,
        byStatus,
        byBrand,
        byCondition,
        newProductsByMonth
      },
      error: null
    }
  } catch (error) {
    return { data: null, error }
  }
}

export const getStoreStats = async (): Promise<{ data: StoreStats | null; error: any }> => {
  try {
    const { count: total, error: totalError } = await supabase
      .from(TABLES.STORES)
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      return { data: null, error: totalError }
    }

    const { data: byStatusData, error: byStatusError } = await supabase
      .from(TABLES.STORES)
      .select('status')

    if (byStatusError) {
      return { data: null, error: byStatusError }
    }

    const byStatus = {
      pending: 0,
      active: 0,
      suspended: 0,
      banned: 0
    }

    byStatusData?.forEach(item => {
      if (item.status === 'pending') byStatus.pending++
      else if (item.status === 'active') byStatus.active++
      else if (item.status === 'suspended') byStatus.suspended++
      else if (item.status === 'banned') byStatus.banned++
    })

    const { data: byTypeData, error: byTypeError } = await supabase
      .from(TABLES.STORES)
      .select('store_type')

    if (byTypeError) {
      return { data: null, error: byTypeError }
    }

    const byType = {
      personal: 0,
      business: 0
    }

    byTypeData?.forEach(item => {
      if (item.store_type === 'personal') byType.personal++
      else if (item.store_type === 'business') byType.business++
    })

    const { data: newStoresData, error: newStoresError } = await supabase
      .from(TABLES.STORES)
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true })

    if (newStoresError) {
      return { data: null, error: newStoresError }
    }

    const monthlyCounts = new Map<string, number>()
    newStoresData?.forEach(item => {
      const month = formatMonth(new Date(item.created_at))
      monthlyCounts.set(month, (monthlyCounts.get(month) || 0) + 1)
    })

    const months = getLast12Months()
    const newStoresByMonth = fillMissingMonths(
      Array.from(monthlyCounts.entries()).map(([month, count]) => ({ month, count })),
      months
    )

    return {
      data: {
        total: total || 0,
        byStatus,
        byType,
        newStoresByMonth
      },
      error: null
    }
  } catch (error) {
    return { data: null, error }
  }
}

export const getEngagementStats = async (): Promise<{
  data: EngagementStats | null
  error: any
}> => {
  try {
    const { count: totalFavorites, error: favoritesError } = await supabase
      .from(TABLES.PRODUCT_FAVORITES)
      .select('*', { count: 'exact', head: true })

    if (favoritesError) {
      return { data: null, error: favoritesError }
    }

    const { count: totalComments, error: commentsError } = await supabase
      .from(TABLES.PRODUCT_COMMENTS)
      .select('*', { count: 'exact', head: true })

    if (commentsError) {
      return { data: null, error: commentsError }
    }

    const { count: totalReactions, error: reactionsError } = await supabase
      .from(TABLES.PRODUCT_REACTIONS)
      .select('*', { count: 'exact', head: true })

    if (reactionsError) {
      return { data: null, error: reactionsError }
    }

    const { data: favoritesData, error: favoritesMonthError } = await supabase
      .from(TABLES.PRODUCT_FAVORITES)
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

    if (favoritesMonthError) {
      return { data: null, error: favoritesMonthError }
    }

    const favoritesMonthlyCounts = new Map<string, number>()
    favoritesData?.forEach(item => {
      const month = formatMonth(new Date(item.created_at))
      favoritesMonthlyCounts.set(month, (favoritesMonthlyCounts.get(month) || 0) + 1)
    })

    const { data: commentsData, error: commentsMonthError } = await supabase
      .from(TABLES.PRODUCT_COMMENTS)
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

    if (commentsMonthError) {
      return { data: null, error: commentsMonthError }
    }

    const commentsMonthlyCounts = new Map<string, number>()
    commentsData?.forEach(item => {
      const month = formatMonth(new Date(item.created_at))
      commentsMonthlyCounts.set(month, (commentsMonthlyCounts.get(month) || 0) + 1)
    })

    const { data: reactionsData, error: reactionsTypeError } = await supabase
      .from(TABLES.PRODUCT_REACTIONS)
      .select('reaction_type')

    if (reactionsTypeError) {
      return { data: null, error: reactionsTypeError }
    }

    const reactionCounts = new Map<string, number>()
    reactionsData?.forEach(item => {
      reactionCounts.set(item.reaction_type, (reactionCounts.get(item.reaction_type) || 0) + 1)
    })

    const months = getLast12Months()
    const favoritesByMonth = fillMissingMonths(
      Array.from(favoritesMonthlyCounts.entries()).map(([month, count]) => ({ month, count })),
      months
    )

    const commentsByMonth = fillMissingMonths(
      Array.from(commentsMonthlyCounts.entries()).map(([month, count]) => ({ month, count })),
      months
    )

    const reactionsByType = Array.from(reactionCounts.entries()).map(([reactionType, count]) => ({
      reactionType,
      count
    }))

    return {
      data: {
        totalFavorites: totalFavorites || 0,
        totalComments: totalComments || 0,
        totalReactions: totalReactions || 0,
        favoritesByMonth,
        commentsByMonth,
        reactionsByType
      },
      error: null
    }
  } catch (error) {
    return { data: null, error }
  }
}

export const getTestDriveStats = async (): Promise<{ data: TestDriveStats | null; error: any }> => {
  try {
    const { count: total, error: totalError } = await supabase
      .from(TABLES.TEST_DRIVE_BOOKINGS)
      .select('*', { count: 'exact', head: true })

    if (totalError) {
      return { data: null, error: totalError }
    }

    const { data: byStatusData, error: byStatusError } = await supabase
      .from(TABLES.TEST_DRIVE_BOOKINGS)
      .select('status')

    if (byStatusError) {
      return { data: null, error: byStatusError }
    }

    const byStatus = {
      pending: 0,
      confirmed: 0,
      completed: 0,
      cancelled: 0
    }

    byStatusData?.forEach(item => {
      if (item.status === 'pending') byStatus.pending++
      else if (item.status === 'confirmed') byStatus.confirmed++
      else if (item.status === 'completed') byStatus.completed++
      else if (item.status === 'cancelled') byStatus.cancelled++
    })

    const { data: bookingsData, error: bookingsError } = await supabase
      .from(TABLES.TEST_DRIVE_BOOKINGS)
      .select('created_at')
      .gte('created_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString())

    if (bookingsError) {
      return { data: null, error: bookingsError }
    }

    const monthlyCounts = new Map<string, number>()
    bookingsData?.forEach(item => {
      const month = formatMonth(new Date(item.created_at))
      monthlyCounts.set(month, (monthlyCounts.get(month) || 0) + 1)
    })

    const months = getLast12Months()
    const bookingsByMonth = fillMissingMonths(
      Array.from(monthlyCounts.entries()).map(([month, count]) => ({ month, count })),
      months
    )

    return {
      data: {
        total: total || 0,
        byStatus,
        bookingsByMonth
      },
      error: null
    }
  } catch (error) {
    return { data: null, error }
  }
}

export const getDashboardStats = async (): Promise<{ data: DashboardStats | null; error: any }> => {
  try {
    const [usersResult, productsResult, storesResult, engagementResult, testDrivesResult] =
      await Promise.all([
        getUserStats(),
        getProductStats(),
        getStoreStats(),
        getEngagementStats(),
        getTestDriveStats()
      ])

    if (
      usersResult.error ||
      productsResult.error ||
      storesResult.error ||
      engagementResult.error ||
      testDrivesResult.error
    ) {
      return {
        data: null,
        error: {
          users: usersResult.error,
          products: productsResult.error,
          stores: storesResult.error,
          engagement: engagementResult.error,
          testDrives: testDrivesResult.error
        }
      }
    }

    return {
      data: {
        users: usersResult.data!,
        products: productsResult.data!,
        stores: storesResult.data!,
        engagement: engagementResult.data!,
        testDrives: testDrivesResult.data!
      },
      error: null
    }
  } catch (error) {
    return { data: null, error }
  }
}
