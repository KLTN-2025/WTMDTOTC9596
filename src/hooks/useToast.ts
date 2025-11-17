import { toaster } from '@/components/ui/toaster'

type ToastOptions = {
  title?: string
  description?: string
}

export function useToast() {
  const error = (message: string, options?: ToastOptions) => {
    toaster.create({
      title: options?.title || 'Lỗi',
      description: message,
      type: 'error'
    })
  }

  const info = (message: string, options?: ToastOptions) => {
    toaster.create({
      title: options?.title || 'Thông tin',
      description: message,
      type: 'info'
    })
  }

  const warning = (message: string, options?: ToastOptions) => {
    toaster.create({
      title: options?.title || 'Cảnh báo',
      description: message,
      type: 'warning'
    })
  }

  const success = (message: string, options?: ToastOptions) => {
    toaster.create({
      title: options?.title || 'Thành công',
      description: message,
      type: 'success'
    })
  }

  return {
    error,
    info,
    warning,
    success
  }
}
