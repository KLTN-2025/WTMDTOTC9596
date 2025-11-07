import { supabase } from '@/configs/supabase'
import type { LoginFormData, RegisterFormData } from '@/types/auth'
import { parsePhoneNumber } from 'awesome-phonenumber'

export const register = async (formData: RegisterFormData) => {
  const phone = parsePhoneNumber(formData.phone, { regionCode: 'VN' }).number?.e164 ?? ''
  return await supabase.auth.signUp({
    phone,
    password: formData.password,
    options: {
      data: {
        displayName: formData.fullName
      }
    }
  })
}

export const login = async (formData: LoginFormData) => {
  const phone = parsePhoneNumber(formData.phone, { regionCode: 'VN' }).number?.e164 ?? ''
  return await supabase.auth.signInWithPassword({
    phone,
    password: formData.password
  })
}

export const resetPassword = async (phone: string) => {
  const formattedPhone = parsePhoneNumber(phone, { regionCode: 'VN' }).number?.e164 ?? ''
  return await supabase.auth.signInWithOtp({
    phone: formattedPhone,
    options: {
      shouldCreateUser: false
    }
  })
}

export const logout = async () => {
  return await supabase.auth.signOut()
}
