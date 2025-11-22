import { useState, useEffect } from 'react'
import { useDebounce } from 'react-use'

type UseDebouncedFilterOptions = {
  delay?: number
  onFilterChange?: () => void
}

export const useDebouncedFilter = <T extends string>(
  initialValue: T,
  options: UseDebouncedFilterOptions = {}
) => {
  const { delay = 500, onFilterChange } = options
  const [filter, setFilter] = useState<T>(initialValue)
  const [debouncedFilter, setDebouncedFilter] = useState<T>(initialValue)

  useEffect(() => {
    setFilter(initialValue)
  }, [initialValue])

  useDebounce(
    () => {
      if (filter !== debouncedFilter) {
        setDebouncedFilter(filter)
        onFilterChange?.()
      }
    },
    delay,
    [filter]
  )

  return {
    filter,
    debouncedFilter,
    setFilter
  }
}
