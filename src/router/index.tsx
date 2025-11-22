import { createBrowserRouter } from 'react-router'
import type { RouteObject } from 'react-router'
import { Layout } from '@/components/layout/Layout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import {
  Login,
  Register,
  ForgotPassword,
  Home,
  Products,
  Liked,
  ManageListings,
  ProductDetail,
  TestDriveBooking,
  TestDrives,
  CustomerContacts,
  UsedCars,
  SoldCars,
  Sell,
  Stores,
  Dashboard,
  Users,
  Categories,
  CarListings,
  StoreRegistration
} from '@/pages'
import { createGuardedRoute, routeGuards } from './guards'
import { USER_ROLE } from '@/configs/constants'

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
        path: 'test-drives',
        element: createGuardedRoute(
          <TestDrives />,
          routeGuards.role([USER_ROLE.SELLER, USER_ROLE.ADMIN])
        )
      },
      {
        path: 'customer-contacts',
        element: createGuardedRoute(
          <CustomerContacts />,
          routeGuards.role([USER_ROLE.SELLER, USER_ROLE.ADMIN])
        )
      },
      {
        path: 'favorites',
        element: createGuardedRoute(<Liked />, routeGuards.protected)
      },
      {
        path: 'manage-listings',
        element: createGuardedRoute(
          <ManageListings />,
          routeGuards.role([USER_ROLE.SELLER, USER_ROLE.ADMIN])
        )
      },
      {
        path: 'sell',
        element: createGuardedRoute(<Sell />, routeGuards.protected)
      },
      {
        path: 'stores',
        element: createGuardedRoute(<Stores />, routeGuards.protected)
      },
      {
        path: 'store-registration',
        element: createGuardedRoute(<StoreRegistration />, routeGuards.protected)
      }
    ]
  },
  {
    path: '/admin',
    element: createGuardedRoute(<AdminLayout />, routeGuards.role([USER_ROLE.ADMIN])),
    children: [
      {
        index: true,
        element: createGuardedRoute(<Dashboard />, routeGuards.role([USER_ROLE.ADMIN]))
      },
      {
        path: 'users',
        element: createGuardedRoute(<Users />, routeGuards.role([USER_ROLE.ADMIN]))
      },
      {
        path: 'categories',
        element: createGuardedRoute(<Categories />, routeGuards.role([USER_ROLE.ADMIN]))
      },
      {
        path: 'car-listings',
        element: createGuardedRoute(<CarListings />, routeGuards.role([USER_ROLE.ADMIN]))
      }
    ]
  }
]

export const router = createBrowserRouter(routes)
