import { useState, useMemo, useEffect } from 'react'
import { useMasterData } from './useMasterData'
import { createMasterDataCollection } from '@/utils/collections'

export const useBrandModelSelect = (initialBrandId?: string, initialModelId?: string) => {
  const { brands, models: allModels } = useMasterData()
  const [selectedBrandId, setSelectedBrandId] = useState<string>(initialBrandId || '')
  const [selectedModelId, setSelectedModelId] = useState<string>(initialModelId || '')

  const models = useMemo(() => {
    if (!selectedBrandId) {
      return []
    }
    return allModels.filter(model => model.brandId === selectedBrandId)
  }, [allModels, selectedBrandId])

  useEffect(() => {
    if (!selectedBrandId) {
      setSelectedModelId('')
    }
  }, [selectedBrandId])

  const brandCollection = useMemo(() => createMasterDataCollection(brands), [brands])

  const modelCollection = useMemo(() => createMasterDataCollection(models), [models])

  return {
    selectedBrandId,
    selectedModelId,
    setSelectedBrandId,
    setSelectedModelId,
    brandCollection,
    modelCollection,
    models,
    isModelDisabled: !selectedBrandId
  }
}
