import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/stores/hooks'
import { fetchAllMasterData } from '@/stores/master-data/masterDataSlice'

export const useMasterData = () => {
  const dispatch = useAppDispatch()
  const {
    locations,
    brands,
    colors,
    fuels,
    transmissions,
    bodyStyles,
    versions,
    models,
    loading,
    error,
    initialized
  } = useAppSelector(state => state.masterData)

  useEffect(() => {
    if (!initialized && !loading) {
      dispatch(fetchAllMasterData())
    }
  }, [dispatch, initialized, loading])

  return {
    locations,
    brands,
    colors,
    fuels,
    transmissions,
    bodyStyles,
    versions,
    models,
    loading,
    error,
    initialized
  }
}
