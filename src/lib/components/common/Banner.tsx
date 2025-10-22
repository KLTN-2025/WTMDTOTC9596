import Slider from 'react-slick'
import { home } from '../../constants'

export const Banner = () => {
  let settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  }
  return (
    <div className='max-w-screen overflow-hidden'>
      <Slider {...settings}>
        {home.banner_image.map((image, index) => (
          <div key={index}>
            <img src={image} alt={`Banner ${index + 1}`} />
          </div>
        ))}
      </Slider>
    </div>
  )
}
