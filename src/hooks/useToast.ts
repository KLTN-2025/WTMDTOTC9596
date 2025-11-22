import { useCallback, useMemo } from 'react'
import { toaster } from '@/components/ui/toaster'

type ToastOptions = {
  title?: string
  description?: string
}

export function useToast() {
  const error = useCallback((message: string, options?: ToastOptions) => {
    toaster.create({
      title: options?.title || 'Lỗi',
      description: message,
      type: 'error'
    })
  }, [])

  const info = useCallback((message: string, options?: ToastOptions) => {
    toaster.create({
      title: options?.title || 'Thông tin',
      description: message,
      type: 'info'
    })
  }, [])

  const warning = useCallback((message: string, options?: ToastOptions) => {
    toaster.create({
      title: options?.title || 'Cảnh báo',
      description: message,
      type: 'warning'
    })
  }, [])

  const success = useCallback((message: string, options?: ToastOptions) => {
    toaster.create({
      title: options?.title || 'Thành công',
      description: message,
      type: 'success'
    })
  }, [])

  return useMemo(
    () => ({
      error,
      info,
      warning,
      success
    }),
    [error, info, warning, success]
  )
}
