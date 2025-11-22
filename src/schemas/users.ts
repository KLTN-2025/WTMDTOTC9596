import { z } from 'zod'

export const userSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  role: z.enum(['buyer', 'seller', 'admin']),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự').optional()
})

export const userUpdateSchema = z.object({
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự'),
  phone: z.string().min(10, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  role: z.enum(['buyer', 'seller', 'admin'])
})
