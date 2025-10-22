import { Car, ChevronDown, MapPin, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { brands } from '../../constants'
import { fetchProvinces } from '../../utils'

export const Filter = () => {
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false)
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false)
  const [selectedArea, setSelectedArea] = useState('')
  const [selectedBrand, setSelectedBrand] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [provinces, setProvinces] = useState<any[]>([])
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(true)
  const filterRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsAreaDropdownOpen(false)
        setIsBrandDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        setIsLoadingProvinces(true)
        const data = await fetchProvinces()
        setProvinces(data)
      } catch (error) {
        setProvinces([
          { name: 'Thành phố Hà Nội', code: 1 },
          { name: 'TP. Hồ Chí Minh', code: 79 },
          { name: 'Thành phố Đà Nẵng', code: 48 },
          { name: 'Thành phố Hải Phòng', code: 31 },
          { name: 'Thành phố Cần Thơ', code: 92 }
        ])
      } finally {
        setIsLoadingProvinces(false)
      }
    }

    loadProvinces()
  }, [])

  return (
    <div ref={filterRef} className='wapper-card flex flex-col gap-5'>
      <h2 className='text-xl font-bold'>Mua xe</h2>
      <div className='bg-gray-100 rounded-xl p-4 lg:p-6'>
        <div className='flex flex-col lg:flex-row items-stretch lg:items-center gap-4'>
          {/* Search Input */}
          <div className='flex items-center gap-2 relative flex-1 bg-white'>
            <Search className='absolute left-3 top-1/2 -translate-y-1/2 text-secondary w-4 h-4' />
            <input
              type='text'
              placeholder='Tìm kiếm xe ...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='p-3 pl-10 outline-none w-full border border-gray-300 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary'
            />
          </div>

          {/* Filter Controls */}
          <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4'>
            {/* Area Selection */}
            <div className='relative'>
              <div
                className='flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 min-w-[180px] sm:min-w-[200px] hover:border-primary transition-colors cursor-pointer'
                onClick={() => {
                  setIsAreaDropdownOpen(!isAreaDropdownOpen)
                  setIsBrandDropdownOpen(false)
                }}
              >
                <MapPin className='w-4 h-4 text-secondary' />
                <span className='text-secondary font-medium text-sm lg:text-base'>
                  {selectedArea || 'Chọn khu vực'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-500 ml-auto transition-transform ${isAreaDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Area Dropdown */}
              {isAreaDropdownOpen && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto'>
                  {isLoadingProvinces ? (
                    <div className='px-4 py-3 text-center text-gray-500'>Đang tải...</div>
                  ) : (
                    provinces.map(province => (
                      <div
                        key={province.code}
                        className='px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm lg:text-base'
                        onClick={() => {
                          setSelectedArea(province.name)
                          setIsAreaDropdownOpen(false)
                        }}
                      >
                        {province.name}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Car Brand Selection */}
            <div className='relative'>
              <div
                className='flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-4 py-3 min-w-[180px] sm:min-w-[200px] hover:border-primary transition-colors cursor-pointer'
                onClick={() => {
                  setIsBrandDropdownOpen(!isBrandDropdownOpen)
                  setIsAreaDropdownOpen(false)
                }}
              >
                <div className='flex items-center gap-2'>
                  {selectedBrand ? (
                    <>
                      <img
                        src={brands.find(brand => brand.name === selectedBrand)?.logo}
                        alt={selectedBrand}
                        className='size-6'
                      />
                      <span className='text-secondary font-medium text-sm lg:text-base line-clamp-1 text-ellipsis'>
                        {selectedBrand}
                      </span>
                    </>
                  ) : (
                    <>
                      <Car className='w-4 h-4 text-secondary' />
                      <span className='text-secondary font-medium text-sm lg:text-base'>
                        {selectedBrand || 'Hãng xe'}
                      </span>
                    </>
                  )}
                </div>

                <ChevronDown
                  className={`w-4 h-4 text-gray-500 ml-auto transition-transform ${isBrandDropdownOpen ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Brand Dropdown */}
              {isBrandDropdownOpen && (
                <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto'>
                  {brands.map((brand, index) => (
                    <div
                      key={index}
                      className='px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm lg:text-base flex items-center gap-2'
                      onClick={() => {
                        setSelectedBrand(brand.name)
                        setIsBrandDropdownOpen(false)
                      }}
                    >
                      <img src={brand.logo} alt={brand.name} className='size-6' />
                      <span className='text-secondary font-medium text-sm lg:text-base'>
                        {brand.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <button className='bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-light transition-colors whitespace-nowrap text-sm lg:text-base cursor-pointer'>
              Tìm xe ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
