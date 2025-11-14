import { Box, Card, Flex, HStack, Icon, Separator, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink, Outlet, useLocation } from 'react-router'
import { FiUser, FiShoppingBag } from 'react-icons/fi'

export function Settings() {
  const location = useLocation()

  const menuItems = [
    {
      id: 'profile',
      label: 'Hồ sơ',
      icon: FiUser,
      path: '/settings/profile'
    },
    {
      id: 'seller',
      label: 'Đăng ký trở thành seller',
      icon: FiShoppingBag,
      path: '/settings/seller'
    }
  ]

  return (
    <Box bg='#F8FAFC' minH='calc(100vh - 200px)' py={8}>
      <Flex maxW='1200px' mx='auto' px={4} gap={8} align='flex-start'>
        <Card.Root flexShrink={0} w='280px' p={0}>
          <Card.Body p={0}>
            <VStack align='stretch' gap={0}>
              {menuItems.map((item, index) => {
                const isActive =
                  location.pathname === item.path ||
                  (location.pathname === '/settings' && item.id === 'profile')
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

        <Box flex={1}>
          <Outlet />
        </Box>
      </Flex>
    </Box>
  )
}
