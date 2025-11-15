import { Box, HStack, Tabs, Text } from '@chakra-ui/react'
import { useState } from 'react'
import { Link as RouterLink } from 'react-router'
import { HiOutlineChevronDown } from 'react-icons/hi2'
import { PATHS } from '@/configs/paths'
import { PersonalInfoTab, StoreInfoTab } from './components'

export function Stores() {
  const [activeTab, setActiveTab] = useState<'personal' | 'store'>('personal')

  return (
    <Box bg='#F8FAFC' minH='100vh' py={10}>
      <Box maxW='1200px' mx='auto' px={{ base: 4, md: 6 }} className='max-w-[1200px]'>
        <HStack gap={2} mb={6}>
          <RouterLink to={PATHS.HOME}>
            <Text fontSize='14px' fontWeight='600' color='#1B2C5D' className='text-sm font-semibold'>
              Trang chủ
            </Text>
          </RouterLink>
          <Box transform='rotate(-90deg)'>
            <HiOutlineChevronDown size={16} color='#B6B6B6' />
          </Box>
          <Text fontSize='14px' fontWeight='400' color='#6B7280' className='text-sm text-[#6B7280]'>
            Cửa hàng
          </Text>
        </HStack>

        <Tabs.Root
          value={activeTab}
          variant='subtle'
          colorPalette='blue'
          onValueChange={({ value }) => setActiveTab(value === 'store' ? 'store' : 'personal')}
        >
          <Tabs.List gap={4} mb={4} display='flex'>
            <Tabs.Trigger
              value='personal'
              px={5}
              py={3}
              flex={1}
              justifyContent='center'
              borderRadius='6px'
              fontWeight='600'
              fontSize='14px'
              bg={activeTab === 'personal' ? '#204ED3' : 'white'}
              color={activeTab === 'personal' ? 'white' : '#04113E'}
              border='1px solid'
              borderColor={activeTab === 'personal' ? '#204ED3' : '#E5E5E5'}
              className='rounded-md px-5 py-3 font-semibold text-sm'
            >
              Hồ sơ cá nhân
            </Tabs.Trigger>
            <Tabs.Trigger
              value='store'
              px={5}
              py={3}
              flex={1}
              justifyContent='center'
              borderRadius='6px'
              fontWeight='600'
              fontSize='14px'
              bg={activeTab === 'store' ? '#204ED3' : 'white'}
              color={activeTab === 'store' ? 'white' : '#04113E'}
              border='1px solid'
              borderColor={activeTab === 'store' ? '#204ED3' : '#E5E5E5'}
              className='rounded-md px-5 py-3 font-semibold text-sm'
            >
              Thông tin cửa hàng
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value='personal'>
            <PersonalInfoTab />
          </Tabs.Content>

          <Tabs.Content value='store'>
            <StoreInfoTab />
          </Tabs.Content>
        </Tabs.Root>
      </Box>
    </Box>
  )
}

