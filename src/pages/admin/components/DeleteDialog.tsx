import { memo } from 'react'
import { Button, Dialog, HStack, Text } from '@chakra-ui/react'

interface DeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  itemName?: string | undefined
  label: string
  isSubmitting?: boolean
}

export const DeleteDialog = memo(
  ({ isOpen, onClose, onConfirm, itemName, label, isSubmitting = false }: DeleteDialogProps) => {
    return (
      <Dialog.Root open={isOpen} onOpenChange={e => (!e.open ? onClose() : undefined)}>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Xóa {label.toLowerCase()}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text fontSize='14px' color='#6B7280'>
                Bạn có chắc chắn muốn xóa "{itemName}"? Hành động này không thể hoàn tác.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap={2}>
                <Button variant='outline' onClick={onClose}>
                  Hủy
                </Button>
                <Button bg='#dc2626' color='white' onClick={onConfirm} loading={isSubmitting}>
                  Xóa
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    )
  }
)

DeleteDialog.displayName = 'DeleteDialog'
