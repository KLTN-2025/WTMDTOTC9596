import { supabase } from '@/configs/supabase'
import { TABLES, STORAGE_BUCKETS } from '@/configs/db'
import camelcaseKeys from 'camelcase-keys'
import type { User } from '@supabase/supabase-js'
export type Profile = {
  id: string
  fullName: string | null
  phone: string | null
  address: string | null
  avatarUrl: string | null
  dob: string | null
  cid: string | null
  doi: string | null
  email: string | null
  joinDate: string | null
  role: 'buyer' | 'seller' | 'admin'
  createdAt: string
  updatedAt: string
}

export type UpdateProfileData = {
  fullName?: string
  address?: string
  avatarUrl?: string
  dob?: string
  cid?: string
  doi?: string
  email?: string
}

export const getProfile = async (user: User | null) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    return { data: null, error }
  }

  const camelized = camelcaseKeys(data, { deep: true }) as Profile
  return { data: camelized, error: null }
}

export const updateProfile = async (updateData: UpdateProfileData, user: User | null) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const { data, error } = await supabase
    .from(TABLES.PROFILES)
    .update({
      full_name: updateData.fullName,
      address: updateData.address,
      avatar_url: updateData.avatarUrl,
      dob: updateData.dob || null,
      cid: updateData.cid || null,
      doi: updateData.doi || null,
      email: updateData.email || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
    .select()
    .single()

  if (error) {
    return { data: null, error }
  }

  const camelized = camelcaseKeys(data, { deep: true }) as Profile
  return { data: camelized, error: null }
}

export const uploadAvatar = async (file: File, user: User | null) => {
  if (!user) {
    return { data: null, error: { message: 'User not authenticated' } }
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`
  const filePath = `${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKETS.AVATARS)
    .upload(filePath, file, {
      upsert: true
    })

  if (uploadError) {
    return { data: null, error: uploadError }
  }

  const {
    data: { publicUrl }
  } = supabase.storage.from(STORAGE_BUCKETS.AVATARS).getPublicUrl(filePath)

  return { data: { url: publicUrl, path: filePath }, error: null }
}

export const deleteAvatar = async (avatarUrl: string, user: User | null) => {
  if (!user) {
    return { error: { message: 'User not authenticated' } }
  }

  try {
    const urlParts = avatarUrl.split('/')
    const pathIndex = urlParts.findIndex(part => part === STORAGE_BUCKETS.AVATARS)
    if (pathIndex === -1) {
      return { error: { message: 'Invalid avatar URL' } }
    }
    const filePath = urlParts.slice(pathIndex + 1).join('/')
    const { error } = await supabase.storage.from(STORAGE_BUCKETS.AVATARS).remove([filePath])
    return { error }
  } catch (error) {
    return { error: { message: 'Failed to delete avatar' } }
  }
}

export const extractAvatarPath = (avatarUrl: string | null): string | null => {
  if (!avatarUrl) return null
  try {
    const urlParts = avatarUrl.split('/')
    const pathIndex = urlParts.findIndex(part => part === STORAGE_BUCKETS.AVATARS)
    if (pathIndex === -1) return null
    return urlParts.slice(pathIndex + 1).join('/')
  } catch {
    return null
  }
}
