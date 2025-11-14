import { useEffect, type ReactNode } from 'react'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { fetchAllMasterData } from '@/stores/master-data/masterDataSlice'

interface MasterDataInitializerProps {
  children: ReactNode
}

export const MasterDataInitializer = ({ children }: MasterDataInitializerProps) => {
  const dispatch = useAppDispatch()
  const { initialized, loading } = useAppSelector(state => state.masterData)

  useEffect(() => {
    if (!initialized && !loading) {
      dispatch(fetchAllMasterData())
    }
  }, [dispatch, initialized, loading])

  return <>{children}</>
}
