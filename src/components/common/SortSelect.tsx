import { Portal, Select } from '@chakra-ui/react'
import { useMemo } from 'react'
import { createMasterDataCollection } from '@/utils/collections'

type SortOption = Readonly<{
  label: string
  value: string
}>

type SortSelectProps = {
  value: string
  onChange: (value: string) => void
  options: ReadonlyArray<SortOption>
  placeholder?: string
  size?: 'sm' | 'md' | 'lg'
  minW?: string | number
  maxW?: string | number
  onBlur?: () => void
  triggerClassName?: string
}

export const SortSelect = ({
  value,
  onChange,
  options,
  placeholder = 'Chọn sắp xếp',
  size = 'md',
  minW,
  maxW,
  onBlur,
  triggerClassName
}: SortSelectProps) => {
  const collection = useMemo(
    () => createMasterDataCollection(options.map(option => ({ ...option }))),
    [options]
  )

  return (
    <Select.Root
      collection={collection}
      size={size}
      value={value ? [value] : []}
      onValueChange={({ value: selected }) => onChange(selected[0] ?? value)}
      onInteractOutside={() => onBlur?.()}
    >
      <Select.HiddenSelect />
      <Select.Control minW={minW} maxW={maxW}>
        <Select.Trigger
          bg='white'
          borderColor='#E5E5E5'
          borderRadius='8px'
          px={4}
          py={2}
          width='100%'
          className={triggerClassName}
        >
          <Select.ValueText placeholder={placeholder} />
        </Select.Trigger>
        <Select.IndicatorGroup>
          <Select.Indicator />
        </Select.IndicatorGroup>
      </Select.Control>
      <Portal>
        <Select.Positioner>
          <Select.Content>
            {collection.items.map(item => (
              <Select.Item key={item.value} item={item}>
                {item.label}
                <Select.ItemIndicator />
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Positioner>
      </Portal>
    </Select.Root>
  )
}
