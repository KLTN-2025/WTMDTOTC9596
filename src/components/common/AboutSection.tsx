import { Box, Link, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router'

export function AboutSection() {
  return (
    <Box bg='#E5E5E5' borderRadius='12px' p={8} mb={6}>
      <VStack align='stretch' gap={5}>
        <Text fontSize='2xl' fontWeight='600' color='#04113E' textAlign='center'>
          Mezo – Nền tảng mua bán xe trực tuyến hàng đầu Việt Nam
        </Text>

        <Box maxH='136px' overflowY='auto'>
          <Text fontSize='md' color='#04113E' lineHeight='1.25'>
            Ra mắt từ năm 2017, Mezo Xecu đã nhanh chóng trở thành địa chỉ uy tín kết nối người mua
            và người bán xe trên toàn quốc. Với lợi thế "Dễ tìm – Dễ mua – Dễ bán", nền tảng mang
            đến trải nghiệm giao dịch minh bạch, nhanh chóng và an toàn cho mọi người dùng. Mỗi
            tháng, Mezo Xecu thu hút hơn 16 triệu lượt truy cập và 120.000 tin đăng, bao gồm đa dạng
            danh mục: ô tô, xe máy, xe điện, xe tải, xe đạp, xe khách, xe chuyên dụng và phụ tùng.
            Danh mục nổi bật Ô tô: Hàng nghìn mẫu xe mới – cũ đến từ các thương hiệu hàng đầu như
            Toyota, Kia, Ford, Hyundai, Mazda... Cập nhật nhanh xu hướng SUV, MPV, xe điện và hybrid
            đang dẫn đầu thị trường. Xe máy: Đa dạng mẫu mã từ xe số, tay ga, côn tay đến moto phân
            khối lớn, phục vụ mọi nhu cầu di chuyển. Xe tải – Xe ben: Giao dịch sôi động với các
            thương hiệu Kia, Thaco, Hyundai, Suzuki, Isuzu... phù hợp nhu cầu vận chuyển hàng hóa.
            Xe điện & Xe đạp: Thị trường tăng trưởng mạnh, nhiều mẫu xe thân thiện môi trường, thiết
            kế hiện đại. Xe khách – Xe chuyên dụng: Đáp ứng nhu cầu vận tải hành khách và chuyên chở
            hàng hóa đặc thù với các dòng xe 16 – 45 chỗ, xe bồn, xe đầu kéo, xe máy cày,... Phụ
            tùng – Phụ kiện: Hàng nghìn sản phẩm thay thế, tân trang và trang trí giúp xe của bạn
            luôn bền đẹp và phong cách. Xe cũ – Lựa chọn thông minh Mezo Xecu giúp người dùng dễ
            dàng tìm kiếm xe cũ chất lượng, giá hợp lý với thông tin minh bạch và kiểm chứng rõ
            ràng. Giải pháp tối ưu cho những ai muốn tiết kiệm chi phí nhưng vẫn sở hữu phương tiện
            đáng tin cậy. Dù bạn đang tìm mua xe phù hợp hay muốn bán lại xe đã qua sử dụng, Mezo
            Xecu chính là cầu nối giúp bạn tiếp cận hàng trăm nghìn khách hàng tiềm năng nhanh chóng
            và hiệu quả. Khám phá Mezo Xecu – Nơi mua xe giá tốt, bán xe dễ dàng!
          </Text>
        </Box>

        <Box textAlign='center'>
          <Link
            asChild
            color='#04113E'
            fontWeight='700'
            fontSize='14px'
            textDecoration='none'
            _hover={{ textDecoration: 'underline' }}
          >
            <RouterLink to='/about'>Xem thêm</RouterLink>
          </Link>
        </Box>
      </VStack>
    </Box>
  )
}
