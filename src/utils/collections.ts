import { createListCollection } from '@chakra-ui/react'
import type { MasterDataItem } from '@/api/master-data'

type MasterDataLike = Pick<MasterDataItem, 'id' | 'name'>

type CollectionOption = {
  label: string
  value: string
}

type CollectionItem = MasterDataLike | CollectionOption

const mapToOption = (item: CollectionItem): CollectionOption => {
  if ('id' in item && 'name' in item) {
    return {
      label: item.name,
      value: item.id
    }
  }

  return item
}

export const createMasterDataCollection = (items: CollectionItem[]) => {
  return createListCollection({
    items: items.map(mapToOption)
  })
}
