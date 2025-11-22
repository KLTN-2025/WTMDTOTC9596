import { supabase } from '@/configs/supabase'
import { TABLES } from '@/configs/db'
import camelcaseKeys, { type ObjectLike } from 'camelcase-keys'
import snakecaseKeys from 'snakecase-keys'

export type AdminUser = {
  id: string
  fullName: string | null
  phone: string | null
  email: string | null
  address: string | null
  avatarUrl: string | null
  role: 'buyer' | 'seller' | 'admin'
  status: 'active' | 'banned'
  createdAt: string
  updatedAt: string
  banned: boolean
}

type ProfileRow = Omit<AdminUser, 'banned'>

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
  status?: 'active' | 'banned'
}

const normalizeProfile = (data: unknown): AdminUser => {
  const camelized = camelcaseKeys(data as ObjectLike, { deep: true }) as ProfileRow
  const status = (camelized.status || 'active') as AdminUser['status']
  return {
    ...camelized,
    status,
    banned: status === 'banned'
  }
}

const getProfileById = async (userId: string) => {
  const { data, error } = await supabase.from(TABLES.PROFILES).select('*').eq('id', userId).single()

  if (error) {
    return { data: null, error }
  }

  return { data: normalizeProfile(data), error: null }
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

  const normalized = (data ?? []).map(normalizeProfile)

  return { data: normalized, error: null, totalCount: count || 0 }
}

export const createUser = async (userData: CreateUserData) => {
  const payload = snakecaseKeys({
    phone: userData.phone,
    password: userData.password,
    email: userData.email,
    fullName: userData.fullName,
    role: userData.role || 'buyer'
  })

  const { data: responseData, error } = await supabase.functions.invoke('users', {
    method: 'POST',
    body: payload
  })

  if (error) {
    return { data: null, error }
  }

  if (responseData?.error) {
    return { data: null, error: { message: responseData.error } }
  }

  return { data: normalizeProfile(responseData.data), error: null }
}

export const updateUser = async (userId: string, updateData: UpdateUserData) => {
  const cleanedPayload = Object.fromEntries(
    Object.entries({
      userId,
      fullName: updateData.fullName,
      email: updateData.email,
      phone: updateData.phone,
      address: updateData.address,
      role: updateData.role,
      status: updateData.status
    }).filter(([, value]) => value !== undefined && value !== null)
  )

  const payload = snakecaseKeys(cleanedPayload)

  const { data: responseData, error } = await supabase.functions.invoke('users', {
    method: 'PUT',
    body: payload
  })

  if (error) {
    return { data: null, error }
  }

  if (responseData?.error) {
    return { data: null, error: { message: responseData.error } }
  }

  return getProfileById(userId)
}

export const banUser = async (userId: string, ban: boolean) => {
  return updateUser(userId, { status: ban ? 'banned' : 'active' })
}
