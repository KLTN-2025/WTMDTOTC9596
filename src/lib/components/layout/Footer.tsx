import logo from '@/assets/images/logo.png'

export const Footer = () => {
  return (
    <footer className={`bg-primary text-white`}>
      <div className='inner py-10'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* Brand */}
          <div className='space-y-3'>
            <img src={logo} alt='logo' className='max-w-36' />
            <p className='text-sm text-white/90'>
              Nền tảng xe toàn diện cho mọi người lớn nhất Việt Nam.
            </p>
          </div>

          {/* Support */}
          <div className='space-y-3'>
            <h4 className='font-semibold'>Tổng đài hỗ trợ</h4>
            <div className='space-y-1 text-sm text-white/90'>
              <p>0877 999 888</p>
              <p>(Kinh doanh)</p>
              <p>hotro@carpla.vn</p>
            </div>
          </div>

          {/* Services */}
          <div className='space-y-3'>
            <h4 className='font-semibold'>Dịch vụ khách hàng</h4>
            <ul className='space-y-2 text-sm text-white/90'>
              <li>
                <a href='#' className='hover:underline'>
                  Mua xe
                </a>
              </li>
              <li>
                <a href='#' className='hover:underline'>
                  Xe cũ
                </a>
              </li>
              <li>
                <a href='#' className='hover:underline'>
                  Xe mới
                </a>
              </li>
              <li>
                <a href='#' className='hover:underline'>
                  Cửa hàng xe cũ
                </a>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className='space-y-3'>
            <h4 className='font-semibold'>Giới thiệu</h4>
            <ul className='space-y-2 text-sm text-white/90'>
              <li>
                <a href='#' className='hover:underline'>
                  Quy chế hoạt động
                </a>
              </li>
              <li>
                <a href='#' className='hover:underline'>
                  Quy định chính sách
                </a>
              </li>
              <li>
                <a href='#' className='hover:underline'>
                  Điều khoản hoạt động
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className='mt-10'>
          <h5 className='font-semibold mb-3'>Đăng ký nhận tin tức từ chúng tôi</h5>
          <div className='flex w-full max-w-xl'>
            <input
              type='email'
              placeholder='Nhập email của bạn'
              className='flex-1 px-4 py-3 rounded-l-md text-secondary outline-none bg-white'
            />
            <button className='px-4 py-3 bg-secondary text-white rounded-r-md font-medium hover:opacity-90'>
              Gửi ngay
            </button>
          </div>
        </div>
      </div>
    </footer>
  )
}
