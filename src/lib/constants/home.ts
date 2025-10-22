import banner1 from '../../assets/images/banner_1.jpg'
import banner2 from '../../assets/images/banner_2.png'
import banner3 from '../../assets/images/banner_3.png'
import AudiLogo from '../../assets/images/logo_brand/audi.png'
import BmwLogo from '../../assets/images/logo_brand/bmw.png'
import FordLogo from '../../assets/images/logo_brand/ford.png'
import HondaLogo from '../../assets/images/logo_brand/honda.png'
import HyundaiLogo from '../../assets/images/logo_brand/hyundai.png'
import KiaLogo from '../../assets/images/logo_brand/kia.png'
import MazdaLogo from '../../assets/images/logo_brand/mazda.png'
import MercedesLogo from '../../assets/images/logo_brand/mercedes-benz.png'
import MitsubishiLogo from '../../assets/images/logo_brand/mitsubishi.png'
import NissanLogo from '../../assets/images/logo_brand/nissan.png'
import ToyotaLogo from '../../assets/images/logo_brand/toyota.png'

export const home = {
  slogan: 'Mua bán xe chính hãng, nhanh chóng và tin cậy',
  banner_image: [banner1, banner2, banner3]
}

export type Brand = {
  name: string
  logo: string
}

export const brands: Brand[] = [
  { name: 'Toyota', logo: ToyotaLogo },
  { name: 'Honda', logo: HondaLogo },
  { name: 'Hyundai', logo: HyundaiLogo },
  { name: 'Kia', logo: KiaLogo },
  { name: 'Mazda', logo: MazdaLogo },
  { name: 'Mitsubishi', logo: MitsubishiLogo },
  { name: 'Nissan', logo: NissanLogo },
  { name: 'Ford', logo: FordLogo },
  { name: 'BMW', logo: BmwLogo },
  { name: 'Mercedes', logo: MercedesLogo },
  { name: 'Audi', logo: AudiLogo }
]
