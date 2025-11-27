import { useState, useCallback, useMemo } from 'react'
import { useAppDispatch } from '@/stores/hooks'
import { useMasterData } from '@/hooks/useMasterData'
import {
  addLocation,
  updateLocation,
  removeLocation,
  addBrand,
  updateBrand,
  removeBrand,
  addColor,
  updateColor,
  removeColor,
  addFuel,
  updateFuel,
  removeFuel,
  addTransmission,
  updateTransmission,
  removeTransmission,
  addBodyStyle,
  updateBodyStyle,
  removeBodyStyle,
  addVersion,
  updateVersion,
  removeVersion,
  addModel,
  updateModel,
  removeModel
} from '@/stores/master-data/masterDataSlice'
import { Box, Card, Flex, Heading, Text, VStack, Spinner, Tabs } from '@chakra-ui/react'
import {
  createBrand as apiCreateBrand,
  updateBrand as apiUpdateBrand,
  deleteBrand as apiDeleteBrand,
  createLocation as apiCreateLocation,
  updateLocation as apiUpdateLocation,
  deleteLocation as apiDeleteLocation,
  createFuel as apiCreateFuel,
  updateFuel as apiUpdateFuel,
  deleteFuel as apiDeleteFuel,
  createTransmission as apiCreateTransmission,
  updateTransmission as apiUpdateTransmission,
  deleteTransmission as apiDeleteTransmission,
  createColor as apiCreateColor,
  updateColor as apiUpdateColor,
  deleteColor as apiDeleteColor,
  createBodyStyle as apiCreateBodyStyle,
  updateBodyStyle as apiUpdateBodyStyle,
  deleteBodyStyle as apiDeleteBodyStyle,
  createVersion as apiCreateVersion,
  updateVersion as apiUpdateVersion,
  deleteVersion as apiDeleteVersion,
  createModel as apiCreateModel,
  updateModel as apiUpdateModel,
  deleteModel as apiDeleteModel,
  type MasterDataItem,
  type ModelItem,
  type CreateMasterDataInput,
  type UpdateMasterDataInput
} from '@/api/master-data'
import { useToast } from '@/hooks/useToast'
import { MasterDataTab } from './components/MasterDataTab'
import { ModelsTab } from './components/ModelsTab'
import { MasterDataDialog } from './components/MasterDataDialog'
import { ModelDialog } from './components/ModelDialog'
import { DeleteDialog } from './components/DeleteDialog'

type TabType =
  | 'brands'
  | 'locations'
  | 'fuels'
  | 'transmissions'
  | 'colors'
  | 'bodyStyles'
  | 'versions'
  | 'models'

interface TabConfig {
  label: string
  value: TabType
}

const TABS: TabConfig[] = [
  { label: 'Hãng xe', value: 'brands' },
  { label: 'Địa điểm', value: 'locations' },
  { label: 'Nhiên liệu', value: 'fuels' },
  { label: 'Hộp số', value: 'transmissions' },
  { label: 'Màu sắc', value: 'colors' },
  { label: 'Kiểu dáng', value: 'bodyStyles' },
  { label: 'Phiên bản', value: 'versions' },
  { label: 'Dòng xe', value: 'models' }
]

export function Categories() {
  const dispatch = useAppDispatch()
  const toast = useToast()
  const {
    brands,
    locations,
    fuels,
    transmissions,
    colors,
    bodyStyles,
    versions,
    models,
    loading: isLoading
  } = useMasterData()
  const [activeTab, setActiveTab] = useState<TabType>('brands')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<MasterDataItem | ModelItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getTabData = useCallback(
    (tab: TabType): MasterDataItem[] | ModelItem[] => {
      switch (tab) {
        case 'brands':
          return brands
        case 'locations':
          return locations
        case 'fuels':
          return fuels
        case 'transmissions':
          return transmissions
        case 'colors':
          return colors
        case 'bodyStyles':
          return bodyStyles
        case 'versions':
          return versions
        case 'models':
          return models
        default:
          return []
      }
    },
    [brands, locations, fuels, transmissions, colors, bodyStyles, versions, models]
  )

  const currentTabConfig = useMemo(() => {
    return TABS.find(t => t.value === activeTab) || TABS[0]
  }, [activeTab])

  const brandsMap = useMemo(() => {
    return new Map(brands.map(brand => [brand.id, brand.name]))
  }, [brands])

  const handleCreate = useCallback(() => {
    setSelectedItem(null)
    setIsDialogOpen(true)
  }, [])

  const handleEdit = useCallback((item: MasterDataItem | ModelItem) => {
    setSelectedItem(item)
    setIsDialogOpen(true)
  }, [])

  const handleDeleteClick = useCallback((item: MasterDataItem | ModelItem) => {
    setSelectedItem(item)
    setIsDeleteDialogOpen(true)
  }, [])

  const handleMasterDataSubmit = useCallback(
    async (formData: { name: string; logoUrl?: string | undefined }) => {
      setIsSubmitting(true)
      try {
        let result
        if (selectedItem) {
          const updateInput: UpdateMasterDataInput = {
            name: formData.name,
            ...(formData.logoUrl && formData.logoUrl.trim() ? { logoUrl: formData.logoUrl } : {})
          }

          switch (activeTab) {
            case 'brands':
              result = await apiUpdateBrand(selectedItem.id, updateInput)
              break
            case 'locations':
              result = await apiUpdateLocation(selectedItem.id, updateInput)
              break
            case 'fuels':
              result = await apiUpdateFuel(selectedItem.id, updateInput)
              break
            case 'transmissions':
              result = await apiUpdateTransmission(selectedItem.id, updateInput)
              break
            case 'colors':
              result = await apiUpdateColor(selectedItem.id, updateInput)
              break
            case 'bodyStyles':
              result = await apiUpdateBodyStyle(selectedItem.id, updateInput)
              break
            case 'versions':
              result = await apiUpdateVersion(selectedItem.id, updateInput)
              break
          }

          if (result?.error) {
            toast.error(result.error.message || 'Không thể cập nhật', {
              title: 'Cập nhật thất bại'
            })
            return
          }

          if (result?.data) {
            switch (activeTab) {
              case 'brands':
                dispatch(updateBrand(result.data))
                break
              case 'locations':
                dispatch(updateLocation(result.data))
                break
              case 'fuels':
                dispatch(updateFuel(result.data))
                break
              case 'transmissions':
                dispatch(updateTransmission(result.data))
                break
              case 'colors':
                dispatch(updateColor(result.data))
                break
              case 'bodyStyles':
                dispatch(updateBodyStyle(result.data))
                break
              case 'versions':
                dispatch(updateVersion(result.data))
                break
            }
          }

          toast.success('Đã cập nhật thành công', {
            title: 'Cập nhật thành công'
          })
        } else {
          const createInput: CreateMasterDataInput = {
            name: formData.name,
            ...(formData.logoUrl && formData.logoUrl.trim() ? { logoUrl: formData.logoUrl } : {})
          }

          switch (activeTab) {
            case 'brands':
              result = await apiCreateBrand(createInput)
              break
            case 'locations':
              result = await apiCreateLocation(createInput)
              break
            case 'fuels':
              result = await apiCreateFuel(createInput)
              break
            case 'transmissions':
              result = await apiCreateTransmission(createInput)
              break
            case 'colors':
              result = await apiCreateColor(createInput)
              break
            case 'bodyStyles':
              result = await apiCreateBodyStyle(createInput)
              break
            case 'versions':
              result = await apiCreateVersion(createInput)
              break
          }

          if (result?.error) {
            toast.error(result.error.message || 'Không thể tạo', {
              title: 'Tạo thất bại'
            })
            return
          }

          if (result?.data) {
            switch (activeTab) {
              case 'brands':
                dispatch(addBrand(result.data))
                break
              case 'locations':
                dispatch(addLocation(result.data))
                break
              case 'fuels':
                dispatch(addFuel(result.data))
                break
              case 'transmissions':
                dispatch(addTransmission(result.data))
                break
              case 'colors':
                dispatch(addColor(result.data))
                break
              case 'bodyStyles':
                dispatch(addBodyStyle(result.data))
                break
              case 'versions':
                dispatch(addVersion(result.data))
                break
            }
          }

          toast.success('Đã tạo thành công', {
            title: 'Tạo thành công'
          })
        }

        setIsDialogOpen(false)
        setSelectedItem(null)
      } catch {
        toast.error('Đã xảy ra lỗi', {
          title: 'Lỗi'
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [activeTab, selectedItem, dispatch, toast]
  )

  const handleModelSubmit = useCallback(
    async (formData: { name: string; brandId: string }) => {
      setIsSubmitting(true)
      try {
        if (selectedItem) {
          const { data, error } = await apiUpdateModel(selectedItem.id, formData)
          if (error) {
            toast.error(error.message || 'Không thể cập nhật dòng xe', {
              title: 'Cập nhật thất bại'
            })
            return
          }
          if (data) {
            dispatch(updateModel(data))
          }
          toast.success('Dòng xe đã được cập nhật', {
            title: 'Cập nhật thành công'
          })
        } else {
          const { data, error } = await apiCreateModel(formData)
          if (error) {
            toast.error(error.message || 'Không thể tạo dòng xe', {
              title: 'Tạo thất bại'
            })
            return
          }
          if (data) {
            dispatch(addModel(data))
          }
          toast.success('Dòng xe đã được tạo', {
            title: 'Tạo thành công'
          })
        }

        setIsDialogOpen(false)
        setSelectedItem(null)
      } catch {
        toast.error('Đã xảy ra lỗi', {
          title: 'Lỗi'
        })
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedItem, dispatch, toast]
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedItem) return

    setIsSubmitting(true)
    try {
      let result
      switch (activeTab) {
        case 'brands':
          result = await apiDeleteBrand(selectedItem.id)
          break
        case 'locations':
          result = await apiDeleteLocation(selectedItem.id)
          break
        case 'fuels':
          result = await apiDeleteFuel(selectedItem.id)
          break
        case 'transmissions':
          result = await apiDeleteTransmission(selectedItem.id)
          break
        case 'colors':
          result = await apiDeleteColor(selectedItem.id)
          break
        case 'bodyStyles':
          result = await apiDeleteBodyStyle(selectedItem.id)
          break
        case 'versions':
          result = await apiDeleteVersion(selectedItem.id)
          break
        case 'models':
          result = await apiDeleteModel(selectedItem.id)
          break
      }

      if (result?.error) {
        toast.error(result.error.message || 'Không thể xóa', {
          title: 'Xóa thất bại'
        })
        return
      }

      switch (activeTab) {
        case 'brands':
          dispatch(removeBrand(selectedItem.id))
          break
        case 'locations':
          dispatch(removeLocation(selectedItem.id))
          break
        case 'fuels':
          dispatch(removeFuel(selectedItem.id))
          break
        case 'transmissions':
          dispatch(removeTransmission(selectedItem.id))
          break
        case 'colors':
          dispatch(removeColor(selectedItem.id))
          break
        case 'bodyStyles':
          dispatch(removeBodyStyle(selectedItem.id))
          break
        case 'versions':
          dispatch(removeVersion(selectedItem.id))
          break
        case 'models':
          dispatch(removeModel(selectedItem.id))
          break
      }

      toast.success('Đã xóa thành công', {
        title: 'Xóa thành công'
      })

      setIsDeleteDialogOpen(false)
      setSelectedItem(null)
    } catch {
      toast.error('Đã xảy ra lỗi', {
        title: 'Lỗi'
      })
    } finally {
      setIsSubmitting(false)
    }
  }, [activeTab, selectedItem, dispatch, toast])

  const handleTabChange = useCallback((newTab: TabType) => {
    setActiveTab(newTab)
    setIsDialogOpen(false)
    setIsDeleteDialogOpen(false)
    setSelectedItem(null)
  }, [])

  if (isLoading && getTabData(activeTab).length === 0) {
    return (
      <Box p={6}>
        <Card.Root bg='white' borderRadius='16px' p={8}>
          <Flex justify='center' align='center' minH='400px'>
            <Spinner size='lg' color='#204ED3' />
          </Flex>
        </Card.Root>
      </Box>
    )
  }

  return (
    <Box p={2}>
      <VStack align='stretch' gap={6}>
        <VStack align='start' gap={2}>
          <Heading fontSize='24px' fontWeight='700' color='#04113E'>
            Quản lý danh mục
          </Heading>
          <Text fontSize='14px' color='#6B7280'>
            Quản lý các danh mục và thông tin cơ bản của hệ thống
          </Text>
        </VStack>

        <Card.Root bg='white' borderRadius='16px' p={6}>
          <Tabs.Root
            value={activeTab}
            onValueChange={e => handleTabChange(e.value as TabType)}
            colorPalette='blue'
          >
            <Tabs.List gap={2} mb={6} flexWrap='wrap'>
              {TABS.map(tab => (
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  px={4}
                  py={2}
                  borderRadius='8px'
                  fontWeight='600'
                  fontSize='14px'
                  color='#04113E'
                >
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {TABS.map(tab => (
              <Tabs.Content key={tab.value} value={tab.value}>
                {tab.value === activeTab &&
                  (tab.value === 'models' ? (
                    <ModelsTab
                      data={getTabData(tab.value) as ModelItem[]}
                      brandsMap={brandsMap}
                      onCreate={handleCreate}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  ) : (
                    <MasterDataTab
                      data={getTabData(tab.value) as MasterDataItem[]}
                      label={tab.label}
                      showLogo={tab.value === 'brands'}
                      onCreate={handleCreate}
                      onEdit={handleEdit}
                      onDelete={handleDeleteClick}
                    />
                  ))}
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </Card.Root>
      </VStack>

      {activeTab === 'models' ? (
        <ModelDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false)
            setSelectedItem(null)
          }}
          onSubmit={handleModelSubmit}
          selectedItem={selectedItem as ModelItem | null}
          brands={brands}
          isSubmitting={isSubmitting}
        />
      ) : (
        <MasterDataDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false)
            setSelectedItem(null)
          }}
          onSubmit={handleMasterDataSubmit}
          selectedItem={selectedItem as MasterDataItem | null}
          label={currentTabConfig?.label || ''}
          showLogo={activeTab === 'brands'}
          isSubmitting={isSubmitting}
        />
      )}

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false)
          setSelectedItem(null)
        }}
        onConfirm={handleDeleteConfirm}
        itemName={selectedItem?.name || undefined}
        label={currentTabConfig?.label || ''}
        isSubmitting={isSubmitting}
      />
    </Box>
  )
}
