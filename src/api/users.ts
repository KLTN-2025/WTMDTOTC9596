import { supabase, lambdaSupabase } from '@/configs/supabase'
import { TABLES } from '@/configs/db'
import camelcaseKeys from 'camelcase-keys'

export type AdminUser = {
  id: string
  fullName: string | null
  phone: string | null
  email: string | null
  address: string | null
  avatarUrl: string | null
  role: 'buyer' | 'seller' | 'admin'
  createdAt: string
  updatedAt: string
  banned: boolean
}

export type CreateUserData = {
  phone: string
  password: string
  fullName: string
  email?: string
  role?: 'buyer' | 'seller' | 'admin'
}

export type UpdateUserData = {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  role?: 'buyer' | 'seller' | 'admin'
}

export const getUsers = async (options?: {
  page?: number
  pageSize?: number
  search?: string
  role?: 'all' | 'buyer' | 'seller' | 'admin'
}) => {
  const page = options?.page || 1
  const pageSize = options?.pageSize || 10
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase.from(TABLES.PROFILES).select('*', { count: 'exact' })

  if (options?.search) {
    const searchTerm = `%${options.search}%`
    query = query.or(
      `full_name.ilike.${searchTerm},phone.ilike.${searchTerm},email.ilike.${searchTerm}`
    )
  }

  if (options?.role && options.role !== 'all') {
    query = query.eq('role', options.role)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error, count } = await query.range(from, to)

  if (error) {
    return { data: null, error, totalCount: 0 }
  }

  const userIds = (data ?? []).map(item => item.id)
  let bannedUsers = new Set<string>()

  if (userIds.length > 0) {
    try {
      const { data: responseData, error } = await lambdaSupabase.functions.invoke('admin-users', {
        body: {
          action: 'check-banned',
          userIds: userIds.join(',')
        }
      })

      if (!error && responseData?.data) {
        responseData.data.forEach((userId: string) => {
          bannedUsers.add(userId)
        })
      }
    } catch {
      // Ignore error if edge function is not available
    }
  }

  const normalized = (data ?? []).map(item => {
    const camelized = camelcaseKeys(item, { deep: true }) as any
    return {
      ...camelized,
      banned: bannedUsers.has(camelized.id)
    }
  })

  return { data: normalized, error: null, totalCount: count || 0 }
}

export const createUser = async (userData: CreateUserData) => {
  const { data: responseData, error } = await lambdaSupabase.functions.invoke('admin-users', {
    body: {
      action: 'create',
      phone: userData.phone,
      password: userData.password,
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role || 'buyer'
    }
  })

  if (error) {
    return { data: null, error }
  }

  if (responseData?.error) {
    return { data: null, error: { message: responseData.error } }
  }

  const camelized = camelcaseKeys(responseData.data, { deep: true }) as AdminUser
  return { data: { ...camelized, banned: false }, error: null }
}

export const updateUser = async (userId: string, updateData: UpdateUserData) => {
  const updatePayload: any = {
    updated_at: new Date().toISOString()
  }

  if (updateData.fullName !== undefined) {
    updatePayload.full_name = updateData.fullName
  }
  if (updateData.email !== undefined) {
    updatePayload.email = updateData.email
  }
  if (updateData.phone !== undefined) {
    updatePayload.phone = updateData.phone
  }
  if (updateData.address !== undefined) {
    updatePayload.address = updateData.address
  }
  if (updateData.role !== undefined) {
    updatePayload.role = updateData.role
  }

  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .update(updatePayload)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  if (updateData.email || updateData.phone) {
    try {
      await lambdaSupabase.functions.invoke('admin-users', {
        body: {
          action: 'update-auth',
          userId,
          email: updateData.email,
          phone: updateData.phone
        }
      })
    } catch {
      // Ignore auth update errors
    }
  }

  const camelized = camelcaseKeys(data, { deep: true }) as AdminUser
  return { data: { ...camelized, banned: false }, error: null }
}

export const banUser = async (userId: string, ban: boolean) => {
  const { data: responseData, error } = await lambdaSupabase.functions.invoke('admin-users', {
    body: {
      action: 'ban',
      userId,
      ban
    }
  })

  if (error) {
    return { data: null, error }
  }

  if (responseData?.error) {
    return { data: null, error: { message: responseData.error } }
  }

  return { data: responseData.data, error: null }
}
