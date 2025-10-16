import logo from '@/assets/images/logo.png'
import { CircleUserRound, Menu } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { router } from '../../../routes/router'
import { home } from '../../constants'

export const Header = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleOpen = () => {
    setIsOpen(!isOpen)
  }

  return (
    <header className='fixed top-0 left-0 right-0 z-50 h-22.5'>
      <div className='h-full relative'>
        <div className=' size-full bg-primary relative z-10'>
          {/* Mobile menu */}
          <div className='inner h-full flex items-center justify-between'>
            <button
              onClick={handleOpen}
              className='p-1.5 rounded-lg bg-white flex items-center cursor-pointer text-secondary md:hidden'
            >
              <Menu />
            </button>
            <a href='/'>
              <img src={logo} alt='logo' className='lg:max-w-50 md:max-w-40 max-w-30' />
            </a>
            <h2 className='md:text-lg font-bold lg:text-2xl max-md:hidden'>{home.slogan}</h2>
            <button className='lg:px-5 md:px-3 md:py-3 p-1.5 rounded-lg bg-white flex items-center gap-2 cursor-pointer hover:bg-secondary hover:text-white transition-all duration-300 text-secondary'>
              <CircleUserRound />
              <span className='font-bold max-md:hidden'>Đăng nhập</span>
            </button>
          </div>
        </div>
        {/* Mobile slogan */}
        <div className='border-b border-gray-200 relative z-10 bg-white md:hidden '>
          <div className='w-full py-2 text-center'>
            <span className='text-sm font-bold text-secondary text-center'>{home.slogan}</span>
          </div>
        </div>
        <div className='relative z-10 bg-secondary max-md:hidden'>
          <div className='inner'>
            <div className='w-full py-2 flex items-center justify-between gap-4'>
              {router.map(item => {
                const Icon = item.icon
                return (
                  <Link
                    to={item.path}
                    key={item.label}
                    className='flex items-center gap-4 md:gap-2 text-secondary md:text-white hover:underline transition-colors'
                  >
                    <Icon className='size-5' />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        {/* Category */}
        <div
          className={`bg-white md:hidden max-md:shadow-md md:bg-secondary max-md:absolute top-32.5 left-0 right-0 transition-all duration-300 z-0 ${isOpen ? 'translate-y-0' : 'translate-y-[-200%]'}`}
        >
          <div className='inner'>
            <div className='py-3 flex flex-wrap gap-4 justify-between md:items-center md:flex-row flex-col'>
              {router.map(item => {
                const Icon = item.icon
                return (
                  <Link
                    to={item.path}
                    key={item.label}
                    className='flex items-center gap-4 md:gap-2 text-secondary md:text-white hover:underline transition-colors'
                  >
                    <Icon className='size-5' />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
