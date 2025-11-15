-- Insert Brands
INSERT INTO public.brands (name, logo_url) VALUES
  ('Toyota', NULL),
  ('Honda', NULL),
  ('Mazda', NULL),
  ('Hyundai', NULL),
  ('Kia', NULL),
  ('Ford', NULL),
  ('Chevrolet', NULL),
  ('BMW', NULL),
  ('Mercedes-Benz', NULL),
  ('Audi', NULL),
  ('Volkswagen', NULL),
  ('Nissan', NULL),
  ('Mitsubishi', NULL),
  ('Suzuki', NULL),
  ('VinFast', NULL),
  ('Geely', NULL),
  ('BYD', NULL),
  ('Tesla', NULL),
  ('Lexus', NULL),
  ('Porsche', NULL)
ON CONFLICT (name) DO NOTHING;

-- Insert Categories
INSERT INTO public.categories (name) VALUES
  ('Xe con'),
  ('Xe SUV'),
  ('Xe bán tải'),
  ('Xe tải'),
  ('Xe khách'),
  ('Xe điện'),
  ('Xe hybrid')
ON CONFLICT (name) DO NOTHING;

-- Insert Locations (63 tỉnh thành Việt Nam)
INSERT INTO public.locations (name) VALUES
  ('Hà Nội'),
  ('Hồ Chí Minh'),
  ('Đà Nẵng'),
  ('Cần Thơ'),
  ('Hải Phòng'),
  ('An Giang'),
  ('Bà Rịa - Vũng Tàu'),
  ('Bắc Giang'),
  ('Bắc Kạn'),
  ('Bạc Liêu'),
  ('Bắc Ninh'),
  ('Bến Tre'),
  ('Bình Định'),
  ('Bình Dương'),
  ('Bình Phước'),
  ('Bình Thuận'),
  ('Cà Mau'),
  ('Cao Bằng'),
  ('Đắk Lắk'),
  ('Đắk Nông'),
  ('Điện Biên'),
  ('Đồng Nai'),
  ('Đồng Tháp'),
  ('Gia Lai'),
  ('Hà Giang'),
  ('Hà Nam'),
  ('Hà Tĩnh'),
  ('Hải Dương'),
  ('Hậu Giang'),
  ('Hòa Bình'),
  ('Hưng Yên'),
  ('Khánh Hòa'),
  ('Kiên Giang'),
  ('Kon Tum'),
  ('Lai Châu'),
  ('Lâm Đồng'),
  ('Lạng Sơn'),
  ('Lào Cai'),
  ('Long An'),
  ('Nam Định'),
  ('Nghệ An'),
  ('Ninh Bình'),
  ('Ninh Thuận'),
  ('Phú Thọ'),
  ('Phú Yên'),
  ('Quảng Bình'),
  ('Quảng Nam'),
  ('Quảng Ngãi'),
  ('Quảng Ninh'),
  ('Quảng Trị'),
  ('Sóc Trăng'),
  ('Sơn La'),
  ('Tây Ninh'),
  ('Thái Bình'),
  ('Thái Nguyên'),
  ('Thanh Hóa'),
  ('Thừa Thiên Huế'),
  ('Tiền Giang'),
  ('Trà Vinh'),
  ('Tuyên Quang'),
  ('Vĩnh Long'),
  ('Vĩnh Phúc'),
  ('Yên Bái')
ON CONFLICT (name) DO NOTHING;

-- Insert Fuels
INSERT INTO public.fuels (name) VALUES
  ('Xăng'),
  ('Dầu'),
  ('Điện'),
  ('Hybrid'),
  ('Plug-in Hybrid')
ON CONFLICT (name) DO NOTHING;

-- Insert Transmissions
INSERT INTO public.transmissions (name) VALUES
  ('Số tự động'),
  ('Số sàn'),
  ('CVT'),
  ('DCT')
ON CONFLICT (name) DO NOTHING;

-- Insert Colors
INSERT INTO public.colors (name) VALUES
  ('Trắng'),
  ('Đen'),
  ('Bạc'),
  ('Xám'),
  ('Xanh dương'),
  ('Xanh lá'),
  ('Đỏ'),
  ('Vàng'),
  ('Cam'),
  ('Nâu'),
  ('Be'),
  ('Hồng')
ON CONFLICT (name) DO NOTHING;

-- Insert Body Styles
INSERT INTO public.body_styles (name) VALUES
  ('Sedan'),
  ('SUV'),
  ('Hatchback'),
  ('MPV'),
  ('Pickup'),
  ('CUV'),
  ('Coupe'),
  ('Van/Minibus'),
  ('Xe tải'),
  ('Xe du lịch'),
  ('Xe khách')
ON CONFLICT (name) DO NOTHING;

-- Insert Versions
INSERT INTO public.versions (name) VALUES
  ('Base'),
  ('Standard'),
  ('Premium'),
  ('Luxury'),
  ('Sport'),
  ('Limited'),
  ('Signature'),
  ('Elite'),
  ('Deluxe'),
  ('Ultimate'),
  ('Executive'),
  ('Comfort'),
  ('Advance'),
  ('Exclusive')
ON CONFLICT (name) DO NOTHING;

-- Insert Models (Toyota)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('Camry'),
    ('Corolla'),
    ('Vios'),
    ('Fortuner'),
    ('Innova'),
    ('Hiace'),
    ('Land Cruiser'),
    ('RAV4')
) AS models(model_name)
WHERE brands.name = 'Toyota'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Honda)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('CR-V'),
    ('Civic'),
    ('Accord'),
    ('City'),
    ('HR-V'),
    ('Pilot'),
    ('Odyssey')
) AS models(model_name)
WHERE brands.name = 'Honda'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Mazda)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('CX-5'),
    ('CX-8'),
    ('CX-9'),
    ('Mazda3'),
    ('Mazda6'),
    ('BT-50')
) AS models(model_name)
WHERE brands.name = 'Mazda'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Hyundai)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES 
    ('Tucson'),
    ('Santa Fe'),
    ('Elantra'),
    ('Accent'),
    ('Grand i10'),
    ('Kona')
) AS models(model_name)
WHERE brands.name = 'Hyundai'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Kia)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('Sorento'),
    ('Sportage'),
    ('Seltos'),
    ('Cerato'),
    ('Carnival'),
    ('Rio')
) AS models(model_name)
WHERE brands.name = 'Kia'
ON CONFLICT (brand_id, name) DO NOTHING;


-- Insert Models (Ford)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('Ranger'),
    ('Everest'),
    ('Explorer'),
    ('EcoSport'),
    ('Territory')
) AS models(model_name)
WHERE brands.name = 'Ford'
ON CONFLICT (brand_id, name) DO NOTHING;


-- Insert Models (Chevrolet)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('Trailblazer'),
    ('Trax'),
    ('Colorado'),
    ('Tahoe'),
    ('Equinox')
) AS models(model_name)
WHERE brands.name = 'Chevrolet'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (BMW)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('3 Series'),
    ('5 Series'),
    ('7 Series'),
    ('X3'),
    ('X5'),
    ('X7')
) AS models(model_name)
WHERE brands.name = 'BMW'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Mercedes-Benz)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('C-Class'),
    ('E-Class'),
    ('S-Class'),
    ('GLC'),
    ('GLE'),
    ('GLS')
) AS models(model_name)
WHERE brands.name = 'Mercedes-Benz'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Audi)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('A4'),
    ('A6'),
    ('A8'),
    ('Q3'),
    ('Q5'),
    ('Q7'),
    ('Q8')
) AS models(model_name)
WHERE brands.name = 'Audi'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Volkswagen)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('Golf'),
    ('Passat'),
    ('Tiguan'),
    ('Touareg'),
    ('Polo')
) AS models(model_name)
WHERE brands.name = 'Volkswagen'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Nissan)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('Altima'),
    ('Sentra'),
    ('X-Trail'),
    ('Navara'),
    ('Terra')
) AS models(model_name)
WHERE brands.name = 'Nissan'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Mitsubishi)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('Outlander'),
    ('Pajero'),
    ('Triton'),
    ('Xpander'),
    ('Attrage')
) AS models(model_name)
WHERE brands.name = 'Mitsubishi'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Suzuki)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('Swift'),
    ('Ertiga'),
    ('XL7'),
    ('Vitara'),
    ('Carry')
) AS models(model_name)
WHERE brands.name = 'Suzuki'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (VinFast)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('VF 8'),
    ('VF 9'),
    ('VF 5'),
    ('VF 6'),
    ('VF 7'),
    ('VF e34')
) AS models(model_name)
WHERE brands.name = 'VinFast'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Geely)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('Monjaro'),
    ('Tugella'),
    ('Coolray'),
    ('Atlas'),
    ('Emgrand')
) AS models(model_name)
WHERE brands.name = 'Geely'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (BYD)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('Atto 3'),
    ('Dolphin'),
    ('Seal'),
    ('Tang'),
    ('Han')
) AS models(model_name)
WHERE brands.name = 'BYD'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Tesla)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('Model 3'),
    ('Model S'),
    ('Model X'),
    ('Model Y')
) AS models(model_name)
WHERE brands.name = 'Tesla'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Lexus)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('ES'),
    ('LS'),
    ('RX'),
    ('NX'),
    ('GX'),
    ('LX')
) AS models(model_name)
WHERE brands.name = 'Lexus'
ON CONFLICT (brand_id, name) DO NOTHING;

-- Insert Models (Porsche)
INSERT INTO public.models (brand_id, name)
SELECT id, model_name
FROM public.brands, (
  VALUES
    ('Cayenne'),
    ('Macan'),
    ('Panamera'),
    ('911'),
    ('Taycan')
) AS models(model_name)
WHERE brands.name = 'Porsche'
ON CONFLICT (brand_id, name) DO NOTHING;

