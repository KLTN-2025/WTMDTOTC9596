export const PRICE_RANGES = [
  'Dưới 300 triệu',
  '300 - 500 triệu',
  '500 - 700 triệu',
  '700 triệu - 1 tỷ',
  '1 tỷ - 2 tỷ',
  'Trên 2 tỷ'
] as const

export const VEHICLE_STATUSES = ['Xe cũ', 'Xe mới'] as const

export const SEATS = [
  '2 chỗ',
  '3 chỗ',
  '4 chỗ',
  '5 chỗ',
  '7 chỗ',
  '8 chỗ',
  '9 chỗ',
  '16 chỗ',
  '29 chỗ',
  '47 chỗ'
] as const

export const ORIGINS = ['Nhập khẩu', 'Việt Nam'] as const

export const getYears = (): string[] => {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => (currentYear - 10 + i).toString())
  years.push('Tất cả')
  return years
}
