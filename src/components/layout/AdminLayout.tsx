import { Box, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar } from './AdminSidebar'
import { ScrollToTop } from '@/components/common/ScrollToTop'

export function AdminLayout() {
  return (
    <Box minH='100vh' display='flex' flexDirection='column' bg='#F8FAFC'>
      <AdminHeader />
      <Flex flex={1} gap={0}>
        <AdminSidebar />
        <Box flex={1} as='main' p={6}>
          <ScrollToTop />
          <Outlet />
        </Box>
      </Flex>
    </Box>
  )
}

