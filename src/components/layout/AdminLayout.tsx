import { Box, Flex } from '@chakra-ui/react'
import { Outlet } from 'react-router'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar } from './AdminSidebar'

export function AdminLayout() {
  return (
    <Box minH='100vh' display='flex' flexDirection='column' bg='#F8FAFC'>
      <AdminHeader />
      <Flex flex={1} gap={0}>
        <AdminSidebar />
        <Box flex={1} as='main' p={6}>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  )
}

