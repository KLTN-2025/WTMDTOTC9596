import { Fragment } from 'react'
import { Breadcrumb, Icon, Text } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'
import { HiOutlineChevronDown } from 'react-icons/hi2'

export interface BreadcrumbItem {
  label: string
  path?: string
  isActive?: boolean
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function AppBreadcrumb({ items }: BreadcrumbProps) {
  return (
    <Breadcrumb.Root>
      <Breadcrumb.List gap={1}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          const isActive = item.isActive ?? isLast

          return (
            <Fragment key={`${item.label}-${index}`}>
              <Breadcrumb.Item>
                {item.path && !isActive ? (
                  <Breadcrumb.Link asChild>
                    <RouterLink
                      to={item.path}
                      style={{
                        fontSize: '14px',
                        fontWeight: index === 0 ? '600' : '400',
                        color: index === 0 ? '#1B2C5D' : '#6B7280',
                        textDecoration: 'none'
                      }}
                    >
                      {item.label}
                    </RouterLink>
                  </Breadcrumb.Link>
                ) : (
                  <Breadcrumb.CurrentLink>
                    <Text fontSize='14px' fontWeight='400' color='#6B7280'>
                      {item.label}
                    </Text>
                  </Breadcrumb.CurrentLink>
                )}
              </Breadcrumb.Item>
              {!isLast && (
                <Breadcrumb.Separator>
                  <Icon size='md' color='#B6B6B6'>
                    <HiOutlineChevronDown style={{ transform: 'rotate(-90deg)' }} />
                  </Icon>
                </Breadcrumb.Separator>
              )}
            </Fragment>
          )
        })}
      </Breadcrumb.List>
    </Breadcrumb.Root>
  )
}
