import {
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Icon,
  Image,
  Input,
  InputGroup,
  Menu,
  Portal,
  Text,
  VStack
} from '@chakra-ui/react'
import {
  HiOutlineMapPin,
  HiOutlineChevronDown,
  HiOutlineTrash,
  HiOutlineAdjustmentsHorizontal
} from 'react-icons/hi2'
import { HiOutlineSearch } from 'react-icons/hi'
import { FaCar } from 'react-icons/fa'
import { memo, useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'react-router'
import { DEFAULT_VALUES } from '@/configs/constants'
import { getYears } from '@/mocks/filters'
import type { Brand } from '@/types/products'

const searchSchema = z.object({
  q: z.string().trim().max(200).optional().or(z.literal(''))
})

const LOCATION_DISPLAY_LIMIT = 5

interface Location {
  id: string
  name: string
}

interface SelectedFilters {
  location: string
  year: string
  brand: string
  vehicleStatus: string[]
  priceRange: string[]
  style: string[]
  seats: string[]
  fuel: string[]
  transmission: string[]
  color: string[]
  origin: string[]
  sortBy: 'newest' | 'price_asc' | 'price_desc'
}

interface SearchFilters {
  q?: string
  location: string
  year: string
  brand: string
}

interface ProductSearchSectionProps {
  filterOptions: {
    brands: Brand[]
    locations: Location[]
  }
  onSearch: (filters: SearchFilters) => void
  onClear: () => void
  isLoading: boolean
  initialSearchQuery?: string
}

export const ProductSearchSection = memo<ProductSearchSectionProps>(
  ({ filterOptions, onSearch, onClear, isLoading, initialSearchQuery = '' }) => {
    const [searchParams] = useSearchParams()
    const [displayedBrandsCount, setDisplayedBrandsCount] = useState<number>(
      DEFAULT_VALUES.BRAND_DISPLAY_LIMIT
    )
    const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
      location: 'Tất cả',
      year: 'Tất cả',
      brand: '',
      vehicleStatus: [],
      priceRange: [],
      style: [],
      seats: [],
      fuel: [],
      transmission: [],
      color: [],
      origin: [],
      sortBy: 'newest'
    })

    const { register, handleSubmit, setValue, getValues } = useForm<z.infer<typeof searchSchema>>({
      resolver: zodResolver(searchSchema),
      defaultValues: { q: initialSearchQuery || searchParams.get('q') || '' }
    })

    useEffect(() => {
      const qParam = searchParams.get('q')
      const locationParam = searchParams.get('location')
      const brandParam = searchParams.get('brand')

      if (qParam) {
        setValue('q', qParam)
      }
      if (locationParam) {
        setSelectedFilters(prev => ({ ...prev, location: locationParam }))
      }
      if (brandParam) {
        setSelectedFilters(prev => ({ ...prev, brand: brandParam }))
      }
    }, [searchParams, setValue])

    const handleLocationChange = useCallback((location: string) => {
      setSelectedFilters(prev => ({ ...prev, location }))
    }, [])

    const handleBrandChange = useCallback((brand: string) => {
      setSelectedFilters(prev => ({ ...prev, brand }))
    }, [])

    const handleBrandClick = useCallback(
      (brandName: string) => {
        setSelectedFilters(prev => ({ ...prev, brand: brandName }))
        const q = getValues('q') || ''
        onSearch({
          q,
          location: selectedFilters.location,
          year: selectedFilters.year,
          brand: brandName
        })
      },
      [getValues, onSearch, selectedFilters.location, selectedFilters.year]
    )

    const handleYearChange = useCallback((year: string) => {
      setSelectedFilters(prev => ({ ...prev, year }))
    }, [])

    const handleApplyFilters = useCallback(() => {
      const q = getValues('q') || ''
      onSearch({
        q,
        location: selectedFilters.location,
        year: selectedFilters.year,
        brand: selectedFilters.brand
      })
    }, [getValues, onSearch, selectedFilters])

    const handleClearFilters = useCallback(() => {
      setSelectedFilters({
        location: 'Tất cả',
        year: 'Tất cả',
        brand: '',
        vehicleStatus: [],
        priceRange: [],
        style: [],
        seats: [],
        fuel: [],
        transmission: [],
        color: [],
        origin: [],
        sortBy: 'newest'
      })
      setValue('q', '')
      setDisplayedBrandsCount(DEFAULT_VALUES.BRAND_DISPLAY_LIMIT)
      onClear()
    }, [setValue, onClear])

    const handleLoadMoreBrands = useCallback(() => {
      setDisplayedBrandsCount(prev => prev + Number(DEFAULT_VALUES.BRAND_DISPLAY_LIMIT))
    }, [])

    return (
      <Card.Root bg='white' borderRadius='16px' p={6} mb={6}>
        <VStack align='stretch' gap={5}>
          <Text fontSize='20px' fontWeight='700' color='#04113E'>
            Mua xe
          </Text>

          <Box bg='white' border='1px solid #E5E5E5' borderRadius='12px' p={2} pl={4}>
            <form onSubmit={handleSubmit(() => handleApplyFilters())}>
              <Flex gap={5} direction={{ base: 'column', md: 'row' }} align='center'>
                <InputGroup
                  flex={1}
                  endElement={
                    <Icon size='lg' color='#04113E'>
                      <HiOutlineSearch />
                    </Icon>
                  }
                >
                  <Input
                    placeholder='Tìm xe cộ...'
                    border='none'
                    fontSize='16px'
                    pl={0}
                    _focus={{ boxShadow: 'none' }}
                    {...register('q', { required: false })}
                  />
                </InputGroup>

                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button
                      variant='outline'
                      borderColor='#04113E'
                      color='#04113E'
                      borderRadius='6px'
                      px={5}
                      py={3}
                      gap={2}
                      fontWeight='700'
                      fontSize='14px'
                    >
                      <Icon size='md'>
                        <HiOutlineMapPin />
                      </Icon>
                      {selectedFilters.location !== 'Tất cả'
                        ? selectedFilters.location
                        : 'Chọn khu vực'}
                      <Icon size='md'>
                        <HiOutlineChevronDown />
                      </Icon>
                    </Button>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content>
                        <Menu.Item value='all' onClick={() => handleLocationChange('Tất cả')}>
                          Tất cả
                        </Menu.Item>
                        {filterOptions.locations.map(loc => (
                          <Menu.Item
                            key={loc.id}
                            value={loc.id}
                            onClick={() => handleLocationChange(loc.name)}
                          >
                            {loc.name}
                          </Menu.Item>
                        ))}
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>

                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button
                      variant='outline'
                      borderColor='#04113E'
                      color='#04113E'
                      borderRadius='6px'
                      px={5}
                      py={3}
                      gap={2}
                      fontWeight='700'
                      fontSize='14px'
                    >
                      <Icon size='md'>
                        <FaCar />
                      </Icon>
                      {selectedFilters.brand || 'Hãng xe'}
                      <Icon size='md'>
                        <HiOutlineChevronDown />
                      </Icon>
                    </Button>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content>
                        <Menu.Item value='all' onClick={() => handleBrandChange('')}>
                          Tất cả
                        </Menu.Item>
                        {filterOptions.brands.map(brand => (
                          <Menu.Item
                            key={brand.id}
                            value={brand.id}
                            onClick={() => handleBrandChange(brand.name)}
                          >
                            {brand.name}
                          </Menu.Item>
                        ))}
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>

                <Button
                  bg='#204ED3'
                  color='white'
                  borderRadius='6px'
                  px={5}
                  py={3}
                  fontWeight='700'
                  fontSize='14px'
                  _hover={{ bg: '#1a3fb0' }}
                  type='submit'
                  disabled={isLoading}
                  loading={isLoading}
                >
                  Tìm xe ngay
                </Button>
              </Flex>
            </form>
          </Box>

          <Box>
            <Flex gap={4} wrap='wrap' py={2}>
              {filterOptions.brands.slice(0, displayedBrandsCount).map(brand => (
                <Box
                  key={brand.id}
                  minW='120px'
                  p={2}
                  borderRadius='8px'
                  border='1px solid #E5E5E5'
                  textAlign='center'
                  cursor='pointer'
                  _hover={{ bg: 'gray.50' }}
                  onClick={() => handleBrandClick(brand.name)}
                >
                  <Box
                    width='40px'
                    height='40px'
                    bg={brand.logoUrl ? 'transparent' : '#204ED3'}
                    borderRadius='4px'
                    mx='auto'
                    mb={2}
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    color='white'
                    fontWeight='bold'
                  >
                    {brand.logoUrl ? (
                      <Image
                        src={brand.logoUrl}
                        alt={brand.name}
                        width='40px'
                        height='40px'
                        objectFit='contain'
                      />
                    ) : (
                      brand.name.charAt(0)
                    )}
                  </Box>
                  <Text fontSize='14px' fontWeight='700' color='#04113E'>
                    {brand.name}
                  </Text>
                </Box>
              ))}
              {displayedBrandsCount < filterOptions.brands.length && (
                <Box
                  minW='120px'
                  p={2}
                  borderRadius='8px'
                  border='1px solid #E5E5E5'
                  textAlign='center'
                  cursor='pointer'
                  _hover={{ bg: 'gray.50' }}
                  onClick={handleLoadMoreBrands}
                >
                  <Box
                    width='40px'
                    height='36px'
                    mx='auto'
                    mb={2}
                    display='flex'
                    alignItems='center'
                    justifyContent='center'
                    fontSize='20px'
                    fontWeight='700'
                    color='#171717'
                  >
                    +
                  </Box>
                  <Text fontSize='14px' fontWeight='700' color='#04113E'>
                    Xem thêm
                  </Text>
                </Box>
              )}
            </Flex>
          </Box>

          <VStack align='stretch' gap={2}>
            <Text fontSize='16px' fontWeight='600' color='#04113E'>
              Khu vực
            </Text>
            <HStack gap={4} wrap='wrap'>
              <Button
                size='sm'
                bg={selectedFilters.location === 'Tất cả' ? '#204ED3' : '#F3F4F6'}
                color={selectedFilters.location === 'Tất cả' ? 'white' : '#04113E'}
                borderRadius='6px'
                px={4}
                py={1}
                fontWeight='500'
                fontSize='14px'
                onClick={() => handleLocationChange('Tất cả')}
                _hover={{
                  bg: selectedFilters.location === 'Tất cả' ? '#1a3fb0' : '#E5E7EB'
                }}
              >
                Tất cả
              </Button>
              {filterOptions.locations.slice(0, LOCATION_DISPLAY_LIMIT).map(location => (
                <Button
                  key={location.id}
                  size='sm'
                  bg={selectedFilters.location === location.name ? '#204ED3' : '#F3F4F6'}
                  color={selectedFilters.location === location.name ? 'white' : '#04113E'}
                  borderRadius='6px'
                  px={4}
                  py={1}
                  fontWeight='500'
                  fontSize='14px'
                  onClick={() => handleLocationChange(location.name)}
                  _hover={{
                    bg: selectedFilters.location === location.name ? '#1a3fb0' : '#E5E7EB'
                  }}
                >
                  {location.name}
                </Button>
              ))}
              {filterOptions.locations.length > LOCATION_DISPLAY_LIMIT && (
                <Menu.Root>
                  <Menu.Trigger asChild>
                    <Button
                      size='sm'
                      bg='#F3F4F6'
                      color='#04113E'
                      borderRadius='6px'
                      px={4}
                      py={1}
                      fontWeight='500'
                      fontSize='14px'
                      _hover={{ bg: '#E5E7EB' }}
                    >
                      Xem thêm
                      <Icon size='xs' ml={1}>
                        <HiOutlineChevronDown />
                      </Icon>
                    </Button>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content maxH='300px' overflowY='auto'>
                        {filterOptions.locations.slice(LOCATION_DISPLAY_LIMIT).map(location => (
                          <Menu.Item
                            key={location.id}
                            value={location.id}
                            onClick={() => handleLocationChange(location.name)}
                          >
                            {location.name}
                          </Menu.Item>
                        ))}
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              )}
            </HStack>
          </VStack>

          <VStack align='stretch' gap={2}>
            <Text fontSize='16px' fontWeight='600' color='#04113E'>
              Năm sản xuất
            </Text>
            <HStack gap={4} wrap='wrap'>
              {getYears().map(year => (
                <Button
                  key={year}
                  size='sm'
                  bg={selectedFilters.year === year ? '#204ED3' : '#F3F4F6'}
                  color={selectedFilters.year === year ? 'white' : '#04113E'}
                  borderRadius='6px'
                  px={4}
                  py={1}
                  fontWeight='500'
                  fontSize='14px'
                  onClick={() => handleYearChange(year)}
                  _hover={{
                    bg: selectedFilters.year === year ? '#1a3fb0' : '#E5E7EB'
                  }}
                >
                  {year}
                </Button>
              ))}
            </HStack>
          </VStack>

          <HStack gap={5}>
            <Button
              bg='#204ED3'
              color='white'
              borderRadius='6px'
              px={5}
              py={3}
              gap={2}
              fontWeight='700'
              fontSize='14px'
              _hover={{ bg: '#1a3fb0' }}
              onClick={handleApplyFilters}
            >
              <Icon size='md'>
                <HiOutlineAdjustmentsHorizontal />
              </Icon>
              Lọc
            </Button>
            <Button
              variant='outline'
              borderColor='#04113E'
              color='#04113E'
              borderRadius='6px'
              px={5}
              py={3}
              gap={2}
              fontWeight='700'
              fontSize='14px'
              onClick={handleClearFilters}
            >
              <Icon size='md'>
                <HiOutlineTrash />
              </Icon>
              Xóa lọc
            </Button>
          </HStack>
        </VStack>
      </Card.Root>
    )
  }
)

ProductSearchSection.displayName = 'ProductSearchSection'
