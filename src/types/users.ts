import { userSchema, userUpdateSchema } from '@/schemas/users'
import { z } from 'zod'

export type UserFormData = z.infer<typeof userSchema>
export type UserUpdateFormData = z.infer<typeof userUpdateSchema>

export type UserRole = 'buyer' | 'seller' | 'admin'

export type UserRoleFilter = 'all' | UserRole

export type UserFilters = {
  q: string
  role: UserRoleFilter
}

export type UserQueryOptions = {
  page: number
  pageSize: number
  search?: string
  role?: UserRoleFilter
}
