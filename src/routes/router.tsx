import { Home } from '@/pages'
import { Car, FileText, Heart, Newspaper, Phone } from 'lucide-react'
import type { ComponentType, ReactNode } from 'react'

type RouterItem = {
  label: string
  path: string
  icon: ComponentType<{ className?: string; size?: number | string }>
  element?: ReactNode
}

export const router: RouterItem[] = [
  {
    label: 'Xe cũ',
    path: '/',
    icon: Car,
    element: <Home />
  },
  {
    label: 'Xe mới',
    path: '/new',
    icon: Car
  },
  {
    label: 'Yêu thích',
    path: '/favorites',
    icon: Heart
  },
  {
    label: 'Tin tức',
    path: '/news',
    icon: Newspaper
  },
  {
    label: 'Liên hệ',
    path: '/contact',
    icon: Phone
  },
  {
    label: 'Chính sách  ',
    path: '/policy',
    icon: FileText
  }
]
