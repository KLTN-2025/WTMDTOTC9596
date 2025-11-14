import { createBrowserRouter } from 'react-router'
import type { RouteObject } from 'react-router'
import { Layout } from '@/components/layout/Layout'
import {
  Login,
  Register,
  ForgotPassword,
  Home,
  Products,
  Liked,
  ProductDetail,
  TestDriveBooking,
  Settings,
  Profile,
  SellerRegistration,
  UsedCars,
  SoldCars
} from '@/pages'
import { createGuardedRoute, routeGuards } from './guards'

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: createGuardedRoute(<Home />, routeGuards.public)
      },
      {
        path: 'login',
        element: createGuardedRoute(<Login />, routeGuards.guest)
      },
      {
        path: 'register',
        element: createGuardedRoute(<Register />, routeGuards.guest)
      },
      {
        path: 'forgot-password',
        element: createGuardedRoute(<ForgotPassword />, routeGuards.guest)
      },
      {
        path: 'products',
        element: createGuardedRoute(<Products />, routeGuards.public)
      },
      {
        path: 'used-cars',
        element: createGuardedRoute(<UsedCars />, routeGuards.public)
      },
      {
        path: 'sold-cars',
        element: createGuardedRoute(<SoldCars />, routeGuards.public)
      },
      {
        path: 'products/:id',
        element: createGuardedRoute(<ProductDetail />, routeGuards.public)
      },
      {
        path: 'products/:id/booking',
        element: createGuardedRoute(<TestDriveBooking />, routeGuards.protected)
      },
      {
        path: 'favorites',
        element: createGuardedRoute(<Liked />, routeGuards.protected)
      },
      {
        path: 'settings',
        element: createGuardedRoute(<Settings />, routeGuards.protected),
        children: [
          {
            index: true,
            element: createGuardedRoute(<Profile />, routeGuards.protected)
          },
          {
            path: 'profile',
            element: createGuardedRoute(<Profile />, routeGuards.protected)
          },
          {
            path: 'seller',
            element: createGuardedRoute(<SellerRegistration />, routeGuards.protected)
          }
        ]
      }
    ]
  }
]

export const router = createBrowserRouter(routes)
