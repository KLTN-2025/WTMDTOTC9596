import {
  Badge,
  Box,
  Button,
  Card,
  Image,
  SimpleGrid,
  Tabs,
  Text,
  VStack,
  HStack
} from '@chakra-ui/react'
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { getNewCarModels } from '@/api/products'
import { useToast } from '@/hooks/useToast'
import type { NewCarModel } from '@/types/products'
import { DEFAULT_VALUES } from '@/configs/constants'
import { PATHS } from '@/configs/paths'
import { useMasterData } from '@/hooks/useMasterData'
import { normalizeRelation } from '@/utils/products'

const buildProductsPath = (params?: { status?: string }) => {
  if (!params) return PATHS.PRODUCTS
  const searchParams = new URLSearchParams()
  if (params.status) searchParams.set('status', params.status)
  const queryString = searchParams.toString()
  return queryString ? `${PATHS.PRODUCTS}?${queryString}` : PATHS.PRODUCTS
}

export function NewCarModelsSection() {
  const navigate = useNavigate()
  const toast = useToast()
  const { bodyStyles: masterBodyStyles } = useMasterData()
  const [newCarModels, setNewCarModels] = useState<NewCarModel[]>([])
  const [selectedTab, setSelectedTab] = useState('all')

  const bodyStyleTabs = useMemo(
    () => [
      { value: 'all', label: 'Tất cả' },
      ...masterBodyStyles.map(bs => ({
        value: bs.id,
        label: bs.name
      }))
    ],
    [masterBodyStyles]
  )

  const bodyStyleMap = useMemo(() => {
    const map: Record<string, string> = { all: '' }
    masterBodyStyles.forEach(bs => {
      map[bs.id] = bs.name
    })
    return map
  }, [masterBodyStyles])

  useEffect(() => {
    const loadNewCarModels = async () => {
      try {
        const bodyStyleName =
          selectedTab !== 'all' && bodyStyleMap[selectedTab] ? bodyStyleMap[selectedTab] : undefined
        const { data, error } = await getNewCarModels(
          bodyStyleName,
          DEFAULT_VALUES.NEW_CAR_MODELS_DISPLAY_LIMIT
        )

        if (error) {
          toast.error(error.message, {
            title: 'Lỗi tải dòng xe mới'
          })
          return
        }

        const grouped = (data ?? []).reduce(
          (acc, product: any) => {
            const camelized = product
            const models = normalizeRelation(camelized.models)
            const modelName = models?.name || DEFAULT_VALUES.UNKNOWN
            const key = `${modelName}-${camelized.yearManufactured}`
            if (!acc[key]) {
              let brandName: string = DEFAULT_VALUES.UNKNOWN
              if (camelized.brands) {
                const brandData = normalizeRelation(camelized.brands)
                brandName = brandData?.name || DEFAULT_VALUES.UNKNOWN
              }
              acc[key] = {
                id: camelized.id,
                brand: brandName,
                name: modelName,
                year: camelized.yearManufactured || '',
                priceRange: '',
                image: (camelized.mediaUrls as string[] | null)?.[0] || '',
                modelId: camelized.modelId,
                models: models,
                brandId: camelized.brandId,
                prices: []
              }
            }
            const model = acc[key]
            if (model && model.prices) {
              model.prices.push(camelized.price)
            }
            return acc
          },
          {} as Record<string, NewCarModel & { prices: number[] }>
        )

        const models = Object.values(grouped).map(model => {
          const prices = model.prices
          const min = Math.min(...prices)
          const max = Math.max(...prices)
          const minFormatted = new Intl.NumberFormat('vi-VN', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 0
          }).format(min)
          const maxFormatted = new Intl.NumberFormat('vi-VN', {
            notation: 'compact',
            compactDisplay: 'short',
            maximumFractionDigits: 0
          }).format(max)
          return {
            ...model,
            priceRange: min === max ? `${minFormatted}` : `${minFormatted} - ${maxFormatted}`
          }
        })

        setNewCarModels(models.slice(0, DEFAULT_VALUES.NEW_CAR_MODELS_DISPLAY_LIMIT))
      } catch (error) {
        toast.error('Đã xảy ra lỗi', {
          title: 'Lỗi tải dòng xe mới'
        })
      }
    }

    if (masterBodyStyles.length > 0) {
      loadNewCarModels()
    }
  }, [selectedTab, bodyStyleMap])

  const handleViewAllNewCars = () => {
    navigate(buildProductsPath({ status: 'new' }))
  }

  if (newCarModels.length === 0 && masterBodyStyles.length === 0) {
    return null
  }

  return (
    <Box bg='#04113E' borderRadius='16px' p={8} mb={6}>
      <VStack align='stretch' gap={5}>
        <Text fontSize='2xl' fontWeight='700' color='white' textAlign='start'>
          THÔNG TIN DÒNG XE MỚI
        </Text>

        <Tabs.Root
          value={selectedTab}
          onValueChange={e => setSelectedTab(e.value ?? 'all')}
          colorPalette='blue'
        >
          <Tabs.List borderBottom='1px solid #F0F0F0' pb={0}>
            {bodyStyleTabs.map(tab => (
              <Tabs.Trigger key={tab.value} value={tab.value}>
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value={selectedTab} pt={6}>
            {newCarModels.length === 0 ? (
              <VStack align='center' gap={4} py={8}>
                <Text
                  fontSize='16px'
                  fontWeight='400'
                  color='rgba(255,255,255,0.7)'
                  textAlign='center'
                >
                  Chưa có dòng xe mới nào
                </Text>
              </VStack>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 4 }} gap={5}>
                {newCarModels.map(car => (
                  <Card.Root key={car.id} bg='white' borderRadius='16px' overflow='hidden'>
                    <Image
                      src={car.image}
                      alt={car.name}
                      width='100%'
                      height='153px'
                      objectFit='cover'
                    />
                    <Card.Body p={4}>
                      <HStack gap={2} mb={2}>
                        <Badge bg='#204ED3' color='white' borderRadius='8px' px={2} py={1}>
                          {car.brand}
                        </Badge>
                        <Text fontSize='md' color='#04113E'>
                          {car.year}
                        </Text>
                      </HStack>
                      <Text fontSize='xl' fontWeight='700' color='#04113E' mb={2}>
                        {car.name}
                      </Text>
                      <HStack gap={2}>
                        <Text fontSize='md' fontWeight='700' color='#204ED3'>
                          {car.priceRange}
                        </Text>
                        <Text fontSize='sm' color='#204ED3'>
                          VNĐ
                        </Text>
                      </HStack>
                    </Card.Body>
                  </Card.Root>
                ))}
              </SimpleGrid>
            )}
          </Tabs.Content>
        </Tabs.Root>

        <Button
          variant='outline'
          borderColor='white'
          color='white'
          borderRadius='6px'
          px={5}
          py={3}
          fontWeight='700'
          fontSize='sm'
          alignSelf='center'
          _hover={{ bg: 'rgba(255,255,255,0.1)' }}
          onClick={handleViewAllNewCars}
        >
          Xem tất cả
        </Button>
      </VStack>
    </Box>
  )
}
