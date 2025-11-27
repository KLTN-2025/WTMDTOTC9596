import { ButtonGroup, Flex, IconButton, Pagination } from '@chakra-ui/react'
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi2'

type PaginationControlsProps = {
  totalCount: number
  pageSize: number
  currentPage: number
  onPageChange: (page: number) => void
}

export function PaginationControls({
  totalCount,
  pageSize,
  currentPage,
  onPageChange
}: PaginationControlsProps) {
  if (totalCount <= pageSize) {
    return null
  }

  return (
    <Flex justify='center' mt={6} mb={6}>
      <Pagination.Root
        count={totalCount}
        pageSize={pageSize}
        page={currentPage}
        onPageChange={e => onPageChange(e.page)}
      >
        <ButtonGroup variant='ghost' size='sm'>
          <Pagination.PrevTrigger asChild>
            <IconButton>
              <HiChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>
          <Pagination.Items
            render={page => (
              <IconButton
                variant={currentPage === page.value ? 'outline' : 'ghost'}
                onClick={() => onPageChange(page.value)}
                _hover={{ bg: '#E5E5E5' }}
                color='#04113E'
              >
                {page.value}
              </IconButton>
            )}
          />
          <Pagination.NextTrigger asChild>
            <IconButton>
              <HiChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>
    </Flex>
  )
}
