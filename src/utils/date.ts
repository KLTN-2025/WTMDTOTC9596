import { formatDistanceToNow, format } from 'date-fns'
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

export function formatDate(dateString: string | null | undefined, formatStr: string = 'dd/MM/yyyy'): string {
  if (!dateString) return ''

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''

    return format(date, formatStr, { locale: vi })
  } catch {
    return ''
  }
}
