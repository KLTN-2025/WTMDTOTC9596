import { Box, Card, HStack, Icon, Separator, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink, useLocation } from 'react-router'
import { FiLayout, FiUsers, FiFolder } from 'react-icons/fi'
import { IoCarSportOutline } from 'react-icons/io5'
import { PATHS } from '@/configs/paths'

export function AdminSidebar() {
  const location = useLocation()

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: FiLayout,
      path: PATHS.ADMIN.ROOT
    },
    {
      id: 'users',
      label: 'Quản lý user',
      icon: FiUsers,
      path: PATHS.ADMIN.USERS
    },
    {
      id: 'categories',
      label: 'Quản lý danh mục',
      icon: FiFolder,
      path: PATHS.ADMIN.CATEGORIES
    },
    {
      id: 'car-listings',
      label: 'Kiểm duyệt tin đăng xe',
      icon: IoCarSportOutline,
      path: PATHS.ADMIN.CAR_LISTINGS
    }
  ]

  return (
    <Box
      w='280px'
      flexShrink={0}
      bg='white'
      borderRight='1px solid'
      borderColor='gray.200'
      minH='calc(100vh - 80px)'
    >
      <Card.Root h='100%' p={0}>
        <Card.Body p={0}>
          <VStack align='stretch' gap={0} py={4}>
            {menuItems.map((item, index) => {
              const isActive =
                location.pathname === item.path ||
                (location.pathname === PATHS.ADMIN.ROOT && item.id === 'dashboard')
              return (
                <Box key={item.id}>
                  <RouterLink to={item.path}>
                    <HStack
                      px={4}
                      py={3}
                      gap={3}
                      cursor='pointer'
                      bg={isActive ? '#F0F4FF' : 'transparent'}
                      color={isActive ? '#204ED3' : '#04113E'}
                      fontWeight={isActive ? '600' : '400'}
                      _hover={{ bg: '#F0F4FF' }}
                    >
                      <Icon size='md'>
                        <item.icon />
                      </Icon>
                      <Text fontSize='sm'>{item.label}</Text>
                    </HStack>
                  </RouterLink>
                  {index < menuItems.length - 1 && <Separator />}
                </Box>
              )
            })}
          </VStack>
        </Card.Body>
      </Card.Root>
    </Box>
  )
}
