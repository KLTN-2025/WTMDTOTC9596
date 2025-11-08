import { Box } from '@chakra-ui/react'
import { Outlet } from 'react-router'
import { Footer } from './Footer'
import { Header } from './Header'
import { Toaster } from '@/components/ui/toaster'
export function Layout() {
  return (
    <Box minH='100vh' display='flex' flexDirection='column'>
      <Header />
      <Box flex={1} as='main'>
        <Outlet />
      </Box>
      <Footer />
      <Toaster />
    </Box>
  )
}
