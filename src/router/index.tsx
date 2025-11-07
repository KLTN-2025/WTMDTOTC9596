import { createBrowserRouter } from 'react-router'
import { Layout } from '@/components/layout/Layout'
import { Login, Register, ForgotPassword, Home } from '@/pages'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'forgot-password',
        element: <ForgotPassword />
      }
    ]
  }
])
