import { memo } from 'react'
import { Box, Card, Checkbox, Collapsible, HStack, Icon, Text, VStack } from '@chakra-ui/react'
import { HiOutlineChevronRight } from 'react-icons/hi2'
import { PRICE_RANGES, VEHICLE_STATUSES, SEATS, ORIGINS } from '@/mocks/filters'

type FilterOptions = {
  bodyStyles: Array<{ id: string; name: string }>
  fuels: Array<{ id: string; name: string }>
  transmissions: Array<{ id: string; name: string }>
  colors: Array<{ id: string; name: string }>
}

type SelectedFilters = {
  vehicleStatus: string[]
  priceRange: string[]
  style: string[]
  seats: string[]
  fuel: string[]
  transmission: string[]
  color: string[]
  origin: string[]
}

type FilterSectionProps = {
  title: string
  items: ReadonlyArray<{ id?: string; name: string } | string>
  selectedValues: string[]
  filterKey: keyof SelectedFilters
  toggleFilter: (value: string, filterKey: keyof SelectedFilters, isArray?: boolean) => void
  defaultOpen?: boolean
}

const FilterSection = memo(
  ({ title, items, selectedValues, filterKey, toggleFilter, defaultOpen }: FilterSectionProps) => {
    return (
      <Card.Root
        bg='white'
        borderRadius='8px'
        border='1px solid #F0F0F0'
        boxShadow='0px 1px 2px 0px rgba(0, 0, 0, 0.03)'
      >
        <Collapsible.Root defaultOpen={defaultOpen}>
          <Collapsible.Trigger
            px={4}
            py={3}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            width='100%'
            bg='white'
            borderRadius={defaultOpen ? '8px 8px 0px 0px' : undefined}
          >
            <Text fontSize='14px' fontWeight='500' color='rgba(0,0,0,0.88)'>
              {title}
            </Text>
            <Collapsible.Indicator>
              <Icon size='md'>
                <HiOutlineChevronRight />
              </Icon>
            </Collapsible.Indicator>
          </Collapsible.Trigger>
          <Collapsible.Content>
            <VStack align='stretch' gap={2} px={4} pb={4}>
              {items.map(item => {
                const value = typeof item === 'string' ? item : item.name
                const key = typeof item === 'string' ? item : item.id || item.name
                return (
                  <HStack key={key} gap={2} py={0.5}>
                    <Checkbox.Root
                      checked={selectedValues.includes(value)}
                      onCheckedChange={() => toggleFilter(value, filterKey)}
                    >
                      <Checkbox.HiddenInput />
                      <Checkbox.Control borderRadius='8px' />
                    </Checkbox.Root>
                    <Text fontSize='14px' color='rgba(0,0,0,0.88)'>
                      {value}
                    </Text>
                  </HStack>
                )
              })}
            </VStack>
          </Collapsible.Content>
        </Collapsible.Root>
      </Card.Root>
    )
  },
  (prevProps, nextProps) => {
    return (
      prevProps.title === nextProps.title &&
      prevProps.filterKey === nextProps.filterKey &&
      prevProps.defaultOpen === nextProps.defaultOpen &&
      prevProps.items === nextProps.items &&
      prevProps.selectedValues.length === nextProps.selectedValues.length &&
      prevProps.selectedValues.every((val, idx) => val === nextProps.selectedValues[idx]) &&
      prevProps.toggleFilter === nextProps.toggleFilter
    )
  }
)

FilterSection.displayName = 'FilterSection'

type ProductFiltersSidebarProps = {
  selectedFilters: SelectedFilters
  filterOptions: FilterOptions
  toggleFilter: (value: string, filterKey: keyof SelectedFilters, isArray?: boolean) => void
}

export const ProductFiltersSidebar = memo(function ProductFiltersSidebar({
  selectedFilters,
  filterOptions,
  toggleFilter
}: ProductFiltersSidebarProps) {
  return (
    <Box width='280px' flexShrink={0} display={{ base: 'none', lg: 'block' }}>
      <VStack align='stretch' gap={4}>
        <FilterSection
          title='Trạng thái xe'
          items={VEHICLE_STATUSES}
          selectedValues={selectedFilters.vehicleStatus}
          filterKey='vehicleStatus'
          toggleFilter={toggleFilter}
          defaultOpen
        />
        <FilterSection
          title='Khoảng giá'
          items={PRICE_RANGES}
          selectedValues={selectedFilters.priceRange}
          filterKey='priceRange'
          toggleFilter={toggleFilter}
        />
        <FilterSection
          title='Kiểu dáng'
          items={filterOptions.bodyStyles}
          selectedValues={selectedFilters.style}
          filterKey='style'
          toggleFilter={toggleFilter}
        />
        <FilterSection
          title='Số chỗ ngồi'
          items={SEATS}
          selectedValues={selectedFilters.seats}
          filterKey='seats'
          toggleFilter={toggleFilter}
        />
        <FilterSection
          title='Nhiên liệu'
          items={filterOptions.fuels}
          selectedValues={selectedFilters.fuel}
          filterKey='fuel'
          toggleFilter={toggleFilter}
        />
        <FilterSection
          title='Hộp số'
          items={filterOptions.transmissions}
          selectedValues={selectedFilters.transmission}
          filterKey='transmission'
          toggleFilter={toggleFilter}
        />
        <FilterSection
          title='Màu sắc'
          items={filterOptions.colors}
          selectedValues={selectedFilters.color}
          filterKey='color'
          toggleFilter={toggleFilter}
        />
        <FilterSection
          title='Xuất xứ'
          items={ORIGINS}
          selectedValues={selectedFilters.origin}
          filterKey='origin'
          toggleFilter={toggleFilter}
        />
      </VStack>
    </Box>
  )
})
