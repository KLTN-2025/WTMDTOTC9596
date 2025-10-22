import { Banner, Filter } from '@/lib/components/common'

export const Home = () => {
  return (
    <div>
      <section id='banner' className='l-section'>
        <div className='inner'>
          <Banner />
        </div>
      </section>
      <section id='filter-product' className='l-section'>
        <div className='inner'>
          <Filter />
        </div>
      </section>
    </div>
  )
}
