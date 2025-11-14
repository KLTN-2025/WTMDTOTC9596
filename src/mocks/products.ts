export const CONDITION_TYPE_MAP: Record<string, string> = {
  new: 'Xe mới',
  used: 'Đã sử dụng'
}

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Tin mới nhất' },
  { value: 'price_asc', label: 'Giá tăng dần' },
  { value: 'price_desc', label: 'Giá giảm dần' }
] as const

export const PRICE_RANGE_MAP: Record<string, { min: number; max: number }> = {
  'Dưới 300 triệu': { min: 0, max: 300_000_000 },
  '300 - 500 triệu': { min: 300_000_000, max: 500_000_000 },
  '500 - 700 triệu': { min: 500_000_000, max: 700_000_000 },
  '700 triệu - 1 tỷ': { min: 700_000_000, max: 1_000_000_000 },
  '1 tỷ - 2 tỷ': { min: 1_000_000_000, max: 2_000_000_000 },
  'Trên 2 tỷ': { min: 2_000_000_000, max: Number.MAX_SAFE_INTEGER }
}
