import { supabase } from '@/configs/supabase'
import { TABLES } from '@/configs/db'
import type { LoginFormData, RegisterFormData } from '@/types/auth'
import { parsePhoneNumber } from 'awesome-phonenumber'
export const register = async (formData: RegisterFormData) => {
  const phone = parsePhoneNumber(formData.phone, { regionCode: 'VN' }).number?.e164 ?? ''
  const { data: authData, error: authError } = await supabase.auth.signUp({
    phone,
    password: formData.password,
    options: {
      data: {
        displayName: formData.fullName
      }
    }
  })

  if (authError || !authData?.user) {
    return { data: authData, error: authError }
  }

  await supabase.from(TABLES.PROFILES).insert({
    id: authData.user.id,
    full_name: formData.fullName,
    phone: phone,
    role: 'buyer'
  })
  return { data: authData, error: null }
}

export const login = async (formData: LoginFormData) => {
  const phone = parsePhoneNumber(formData.phone, { regionCode: 'VN' }).number?.e164 ?? ''
  return await supabase.auth.signInWithPassword({
    phone,
    password: formData.password
  })
}

export const resetPassword = async (phone: string, newPassword: string) => {
  const formattedPhone =
    parsePhoneNumber(phone, { regionCode: 'VN' }).number?.e164.replace(/\D/g, '') ?? ''

  if (!formattedPhone) {
    return {
      data: null,
      error: { message: 'Số điện thoại không hợp lệ' }
    }
  }

  if (!newPassword || newPassword.length < 6) {
    return {
      data: null,
      error: { message: 'Mật khẩu phải có ít nhất 6 ký tự' }
    }
  }

  const { data, error } = await supabase.functions.invoke('reset-password', {
    body: {
      phoneNumber: formattedPhone,
      newPassword
    }
  })

  if (error) {
    return {
      data: null,
      error: {
        message: error.message || 'Đã xảy ra lỗi khi đặt lại mật khẩu'
      }
    }
  }

  return {
    data,
    error: null
  }
}

export const logout = async () => {
  return await supabase.auth.signOut()
}
