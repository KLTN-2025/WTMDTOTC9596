import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

export function formatTimeAgo(dateString: string | null | undefined): string {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''

    return formatDistanceToNow(date, {
      addSuffix: true,
      locale: vi
    })
  } catch {
    return ''
  }
}
