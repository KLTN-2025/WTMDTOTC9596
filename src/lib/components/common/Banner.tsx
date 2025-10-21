import Slider from 'react-slick'
import { home } from '../../constants'

export const Banner = () => {
  let settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  }
  return (
    <Slider {...settings}>
      {home.banner_image.map((image, index) => (
        <div key={index}>
          <img src={image} alt={`Banner ${index + 1}`} />
        </div>
      ))}
    </Slider>
  )
}
