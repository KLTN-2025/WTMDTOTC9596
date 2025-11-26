import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
dotenv.config()
const SUPABASE_URL = process.env.VITE_SUPABASE_URL!
const VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY!
const supabase = createClient(SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
async function checkIfSeeded(): Promise<boolean> {
  try {
    const { data, error } = await supabase.from('products').select('id').limit(1).maybeSingle()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking seed status:', error)
      return false
    }

    return !!data
  } catch (error) {
    console.error('Error checking seed status:', error)
    return false
  }
}

async function seedBrands() {
  const { data: existing } = await supabase.from('brands').select('name').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Brands already exist, skipping...')
    const { data } = await supabase.from('brands').select('*')
    return data || []
  }

  const brands = [
    'Toyota',
    'Honda',
    'Mazda',
    'Hyundai',
    'Kia',
    'Ford',
    'Chevrolet',
    'BMW',
    'Mercedes-Benz',
    'Audi',
    'Volkswagen',
    'Nissan',
    'Mitsubishi',
    'Suzuki',
    'VinFast',
    'Geely',
    'BYD',
    'Tesla',
    'Lexus',
    'Porsche'
  ]

  const brandData = brands.map(name => ({
    name,
    logo_url: faker.image.urlLoremFlickr({ category: 'car', width: 100, height: 100 })
  }))

  const { data, error } = await supabase.from('brands').insert(brandData).select()

  if (error) {
    console.error('Error seeding brands:', error)
    const { data: fallback } = await supabase.from('brands').select('*')
    return fallback || []
  }

  console.log(`✓ Seeded ${brandData.length} brands`)
  return data || []
}

async function seedLocations() {
  const { data: existing } = await supabase.from('locations').select('name').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Locations already exist, skipping...')
    const { data } = await supabase.from('locations').select('*')
    return data || []
  }

  const locations = [
    'Hà Nội',
    'Hồ Chí Minh',
    'Đà Nẵng',
    'Cần Thơ',
    'Hải Phòng',
    'An Giang',
    'Bà Rịa - Vũng Tàu',
    'Bắc Giang',
    'Bắc Kạn',
    'Bạc Liêu',
    'Bắc Ninh',
    'Bến Tre',
    'Bình Định',
    'Bình Dương',
    'Bình Phước',
    'Bình Thuận',
    'Cà Mau',
    'Cao Bằng',
    'Đắk Lắk',
    'Đắk Nông',
    'Điện Biên',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Giang',
    'Hà Nam',
    'Hà Tĩnh',
    'Hải Dương',
    'Hậu Giang',
    'Hòa Bình',
    'Hưng Yên',
    'Khánh Hòa',
    'Kiên Giang',
    'Kon Tum',
    'Lai Châu',
    'Lâm Đồng',
    'Lạng Sơn',
    'Lào Cai',
    'Long An',
    'Nam Định',
    'Nghệ An',
    'Ninh Bình',
    'Ninh Thuận',
    'Phú Thọ',
    'Phú Yên',
    'Quảng Bình',
    'Quảng Nam',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sóc Trăng',
    'Sơn La',
    'Tây Ninh',
    'Thái Bình',
    'Thái Nguyên',
    'Thanh Hóa',
    'Thừa Thiên Huế',
    'Tiền Giang',
    'Trà Vinh',
    'Tuyên Quang',
    'Vĩnh Long',
    'Vĩnh Phúc',
    'Yên Bái'
  ]

  const locationData = locations.map(name => ({ name }))

  const { data, error } = await supabase.from('locations').insert(locationData).select()

  if (error) {
    console.error('Error seeding locations:', error)
    const { data: fallback } = await supabase.from('locations').select('*')
    return fallback || []
  }

  console.log(`✓ Seeded ${locationData.length} locations`)
  return data || []
}

async function seedFuels() {
  const { data: existing } = await supabase.from('fuels').select('name').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Fuels already exist, skipping...')
    const { data } = await supabase.from('fuels').select('*')
    return data || []
  }

  const fuels = ['Xăng', 'Dầu', 'Điện', 'Hybrid', 'Plug-in Hybrid']

  const fuelData = fuels.map(name => ({ name }))

  const { data, error } = await supabase.from('fuels').insert(fuelData).select()

  if (error) {
    console.error('Error seeding fuels:', error)
    const { data: fallback } = await supabase.from('fuels').select('*')
    return fallback || []
  }

  console.log(`✓ Seeded ${fuelData.length} fuels`)
  return data || []
}

async function seedTransmissions() {
  const { data: existing } = await supabase.from('transmissions').select('name').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Transmissions already exist, skipping...')
    const { data } = await supabase.from('transmissions').select('*')
    return data || []
  }

  const transmissions = ['Số tự động', 'Số sàn', 'CVT', 'DCT']

  const transmissionData = transmissions.map(name => ({ name }))

  const { data, error } = await supabase.from('transmissions').insert(transmissionData).select()

  if (error) {
    console.error('Error seeding transmissions:', error)
    const { data: fallback } = await supabase.from('transmissions').select('*')
    return fallback || []
  }

  console.log(`✓ Seeded ${transmissionData.length} transmissions`)
  return data || []
}

async function seedColors() {
  const { data: existing } = await supabase.from('colors').select('name').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Colors already exist, skipping...')
    const { data } = await supabase.from('colors').select('*')
    return data || []
  }

  const colors = [
    'Trắng',
    'Đen',
    'Bạc',
    'Xám',
    'Xanh dương',
    'Xanh lá',
    'Đỏ',
    'Vàng',
    'Cam',
    'Nâu',
    'Be',
    'Hồng'
  ]

  const colorData = colors.map(name => ({ name }))

  const { data, error } = await supabase.from('colors').insert(colorData).select()

  if (error) {
    console.error('Error seeding colors:', error)
    const { data: fallback } = await supabase.from('colors').select('*')
    return fallback || []
  }

  console.log(`✓ Seeded ${colorData.length} colors`)
  return data || []
}

async function seedBodyStyles() {
  const { data: existing } = await supabase.from('body_styles').select('name').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Body styles already exist, skipping...')
    const { data } = await supabase.from('body_styles').select('*')
    return data || []
  }

  const bodyStyles = [
    'Sedan',
    'SUV',
    'Hatchback',
    'MPV',
    'Pickup',
    'CUV',
    'Coupe',
    'Van/Minibus',
    'Xe tải',
    'Xe du lịch',
    'Xe khách'
  ]

  const bodyStyleData = bodyStyles.map(name => ({ name }))

  const { data, error } = await supabase.from('body_styles').insert(bodyStyleData).select()

  if (error) {
    console.error('Error seeding body_styles:', error)
    const { data: fallback } = await supabase.from('body_styles').select('*')
    return fallback || []
  }

  console.log(`✓ Seeded ${bodyStyleData.length} body_styles`)
  return data || []
}

async function seedModels(brands: any[]) {
  if (brands.length === 0) {
    console.log('⚠️  No brands to seed models for')
    return []
  }

  const { data: existing } = await supabase.from('models').select('id').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Models already exist, skipping...')
    const { data } = await supabase.from('models').select('*')
    return data || []
  }

  const modelMap: Record<string, string[]> = {
    Toyota: ['Camry', 'Corolla', 'Vios', 'Fortuner', 'Innova', 'Hiace', 'Land Cruiser', 'RAV4'],
    Honda: ['CR-V', 'Civic', 'Accord', 'City', 'HR-V', 'Pilot', 'Odyssey'],
    Mazda: ['CX-5', 'CX-8', 'CX-9', 'Mazda3', 'Mazda6', 'BT-50'],
    Hyundai: ['Tucson', 'Santa Fe', 'Elantra', 'Accent', 'Grand i10', 'Kona'],
    Kia: ['Sorento', 'Sportage', 'Seltos', 'Cerato', 'Carnival', 'Rio'],
    Ford: ['Ranger', 'Everest', 'Explorer', 'EcoSport', 'Territory'],
    Chevrolet: ['Trailblazer', 'Trax', 'Colorado', 'Tahoe', 'Equinox'],
    BMW: ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7'],
    'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS'],
    Audi: ['A4', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Q8'],
    Volkswagen: ['Golf', 'Passat', 'Tiguan', 'Touareg', 'Polo'],
    Nissan: ['Altima', 'Sentra', 'X-Trail', 'Navara', 'Terra'],
    Mitsubishi: ['Outlander', 'Pajero', 'Triton', 'Xpander', 'Attrage'],
    Suzuki: ['Swift', 'Ertiga', 'XL7', 'Vitara', 'Carry'],
    VinFast: ['VF 8', 'VF 9', 'VF 5', 'VF 6', 'VF 7', 'VF e34'],
    Geely: ['Monjaro', 'Tugella', 'Coolray', 'Atlas', 'Emgrand'],
    BYD: ['Atto 3', 'Dolphin', 'Seal', 'Tang', 'Han'],
    Tesla: ['Model 3', 'Model S', 'Model X', 'Model Y'],
    Lexus: ['ES', 'LS', 'RX', 'NX', 'GX', 'LX'],
    Porsche: ['Cayenne', 'Macan', 'Panamera', '911', 'Taycan']
  }

  const models: any[] = []
  for (const brand of brands) {
    const brandName = brand.name
    const modelNames = modelMap[brandName] || []
    for (const modelName of modelNames) {
      models.push({
        brand_id: brand.id,
        name: modelName
      })
    }
  }

  const { data, error } = await supabase.from('models').insert(models).select()

  if (error) {
    console.error('Error seeding models:', error)
    const { data: fallback } = await supabase.from('models').select('*')
    return fallback || []
  }

  console.log(`✓ Seeded ${models.length} models`)
  return data || []
}

async function seedVersionsTable() {
  const { data: existing } = await supabase.from('versions').select('name').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Versions already exist, skipping insert...')
    const { data } = await supabase.from('versions').select('*')
    return data || []
  }

  const versionNames = [
    'Base',
    'Standard',
    'Premium',
    'Luxury',
    'Sport',
    'Limited',
    'Signature',
    'Elite',
    'Deluxe',
    'Ultimate',
    'Executive',
    'Comfort',
    'Advance',
    'Exclusive'
  ]

  const payload = versionNames.map(name => ({ name }))

  const { data, error } = await supabase.from('versions').insert(payload).select()

  if (error) {
    console.error('Error seeding versions:', error)
    const { data: fallback } = await supabase.from('versions').select('*')
    return fallback || []
  }

  console.log(`✓ Seeded ${payload.length} versions`)
  return data || []
}

type SeedUserPayload = {
  full_name: string
  phone: string
  role: 'buyer' | 'seller' | 'admin'
  password: string
  email?: string
  status?: 'active' | 'banned'
}

const generateTimeline = (options?: { years?: number; days?: number }) => {
  const now = new Date()
  const created =
    options?.days !== undefined
      ? faker.date.recent({ days: options.days })
      : faker.date.past({ years: options?.years ?? 2 })
  const updated = faker.date.between({ from: created, to: now })
  return { created, updated }
}

const createUserViaEdgeFunction = async (payload: SeedUserPayload) => {
  const { data, error } = await supabase.functions.invoke('users', {
    body: {
      ...payload
    }
  })

  if (error) {
    console.error('Error creating user via edge function:', error)
    return null
  }

  const profile = data?.data || null
  if (!profile?.id) {
    return profile
  }

  const { created, updated } = generateTimeline({ years: 2 })
  await supabase
    .from('profiles')
    .update({
      created_at: created.toISOString(),
      updated_at: updated.toISOString()
    })
    .eq('id', profile.id)

  return {
    ...profile,
    created_at: created.toISOString(),
    updated_at: updated.toISOString()
  }
}

async function seedUsers() {
  const { data: existingProfiles } = await supabase
    .from('profiles')
    .select('id, full_name, phone, role')
  if (existingProfiles && existingProfiles.length > 0) {
    console.log('⚠️  Users already exist (found profiles), skipping...')
    return existingProfiles
  }

  const userPlan = [
    { role: 'admin' as const, count: 1 },
    { role: 'seller' as const, count: 10 },
    { role: 'buyer' as const, count: 25 }
  ]

  const createdProfiles: any[] = []
  const usedPhones = new Set<string>()

  const generatePhone = () => {
    let phone = ''
    do {
      phone = `+84${faker.number.int({ min: 100000000, max: 999999999 })}`
    } while (usedPhones.has(phone))
    usedPhones.add(phone)
    return phone
  }

  for (const plan of userPlan) {
    for (let i = 0; i < plan.count; i += 1) {
      const fullName = plan.role === 'admin' ? 'Admin Mezo' : faker.person.fullName()
      const phone = plan.role === 'admin' ? '+84999999999' : generatePhone()
      const payload: SeedUserPayload = {
        full_name: fullName,
        phone,
        role: plan.role,
        password: plan.role === 'admin' ? 'admin123' : faker.internet.password({ length: 10 }),
        status: 'active',
        ...(plan.role === 'admin' ? { email: 'admin@mezo.vn' } : {})
      }

      const profile = await createUserViaEdgeFunction(payload)
      if (profile) {
        createdProfiles.push(profile)
      }
    }
  }

  console.log(`✓ Seeded ${createdProfiles.length} users via edge function`)
  return createdProfiles
}

async function seedStores(users: any[], locations: any[]) {
  if (users.length === 0) {
    console.log('⚠️  No users to seed stores for (users must be created via Auth API first)')
    return []
  }

  const { data: existing } = await supabase.from('stores').select('id').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Stores already exist, skipping...')
    const { data } = await supabase.from('stores').select('*')
    return data || []
  }

  const sellerUsers = users.filter(user => user.role === 'seller')
  const adminUsers = users.filter(user => user.role === 'admin')
  let storeOwners = [...adminUsers, ...sellerUsers]
  if (storeOwners.length === 0) {
    storeOwners = users.slice(0, Math.min(10, users.length))
  }

  const uniqueOwners = storeOwners.filter(
    (owner, index, self) => self.findIndex(item => item.id === owner.id) === index
  )

  const stores = uniqueOwners.map(user => {
    const loc = locations.length > 0 ? faker.helpers.arrayElement(locations).id : null
    return {
      owner_id: user.id,
      name: faker.company.name() + ' Auto',
      logo_url: faker.image.url({ width: 200, height: 200 }),
      banner_url: faker.image.url({ width: 1200, height: 400 }),
      description: faker.lorem.paragraph(),
      store_type: faker.helpers.arrayElement(['personal', 'business']),
      tax_code: faker.string.alphanumeric(10).toUpperCase(),
      invoice_info: { note: faker.company.name() },
      contact_email: faker.internet.email(),
      contact_phone: faker.phone.number(),
      address: loc,
      website_link: faker.internet.url(),
      zalo: faker.internet.username(),
      verified: true,
      status: faker.helpers.arrayElement(['pending', 'active', 'suspended', 'banned'])
    }
  })

  const { data, error } = await supabase.from('stores').insert(stores).select()

  if (error) {
    console.error('Error seeding stores:', error)
    const { data: fallback } = await supabase.from('stores').select('*')
    return fallback || []
  }

  console.log(`✓ Seeded ${stores.length} stores`)
  return data || []
}

async function seedProducts(
  brands: any[],
  locations: any[],
  fuels: any[],
  transmissions: any[],
  colors: any[],
  bodyStyles: any[],
  models: any[],
  versions: any[],
  stores: any[],
  adminStoreOwnerIds: string[]
) {
  const { data: existing } = await supabase.from('products').select('id').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Products already exist, skipping...')
    const { data } = await supabase.from('products').select('*')
    return data || []
  }

  const conditionTypes = ['new', 'used']
  const statuses = ['pending', 'available', 'sold']
  const origins = [
    'Nhập khẩu',
    'Việt Nam',
    'Thái Lan',
    'Indonesia',
    'Trung Quốc',
    'Đức',
    'Nhật Bản'
  ]
  const warrantyPolicies = [
    'Bảo hành 3 năm',
    'Bảo hành 5 năm',
    'Bảo hành hãng',
    'Không bảo hành',
    'Bảo hành 1 năm'
  ]

  const carModels = [
    'Camry',
    'CR-V',
    'CX-5',
    'Tucson',
    'Sorento',
    'Ranger',
    'Trailblazer',
    '3 Series',
    'C-Class',
    'A4',
    'Golf',
    'Altima',
    'Outlander',
    'Swift',
    'VF 8',
    'Monjaro',
    'Atto 3',
    'Model 3',
    'ES',
    'Cayenne'
  ]

  const drives = ['FWD', 'RWD', 'AWD', '4WD']
  const powers = ['5000-6500 RPM', '6000 RPM', '5500-6500 RPM', '4500-6000 RPM']
  const torques = [
    '270 Nm @4600 RPM',
    '210 Nm @4400 RPM',
    '243 Nm @2000 RPM',
    '320 Nm @4000 RPM',
    '350 Nm @3500 RPM'
  ]
  const engineCapacities = ['1.5', '2.0', '2.5', '3.0', '3.5', '4.0']
  const fuelConsumptions = ['5.8', '6.8', '7.4', '8.2', '9.5', '10.2']
  const weights = ['> 1 tấn', '< 1 tấn', '1.5 tấn', '2 tấn']
  const payloads = ['> 2 tấn', '< 2 tấn', '2.5 tấn', '3 tấn']
  const groundClearances = ['140', '180', '210', '190', '200', '220']

  const createProductPayload = (storeId?: string) => {
    const conditionType = faker.helpers.arrayElement(conditionTypes)
    const year = faker.date.past({ years: 10 }).getFullYear().toString()
    const isNew = conditionType === 'new'
    const status = faker.helpers.arrayElement(statuses)
    const createdAt = faker.date.recent({ days: 365 })
    const updatedAt = faker.date.between({ from: createdAt, to: new Date() })
    const soldAt =
      status === 'sold' ? faker.date.between({ from: createdAt, to: new Date() }) : null

    return {
      title: `${faker.helpers.arrayElement(carModels)} ${
        versions.length > 0 ? faker.helpers.arrayElement(versions).name : ''
      } ${year} ${faker.helpers.arrayElement(['Màu', 'Phiên bản'])} ${faker.helpers.arrayElement([
        'Trắng',
        'Đen',
        'Bạc',
        'Xám'
      ])}`.trim(),
      price: faker.number.int({ min: 200000000, max: 5000000000 }),
      currency: 'VND',
      year_manufactured: year,
      mileage_km: isNew ? null : faker.number.int({ min: 1000, max: 200000 }),
      seats: faker.helpers.arrayElement([4, 5, 7, 8]),
      origin: faker.helpers.arrayElement(origins),
      model_id: models.length > 0 ? faker.helpers.arrayElement(models).id : null,
      version_id: versions.length > 0 ? faker.helpers.arrayElement(versions).id : null,
      condition_type: conditionType,
      description: faker.lorem.paragraphs(2),
      warranty_policy: faker.helpers.arrayElement(warrantyPolicies),
      status,
      media_urls: Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, () =>
        faker.image.urlLoremFlickr({ width: 800, height: 600, category: 'car' })
      ),
      brand_id: faker.helpers.arrayElement(brands).id,
      location_id: faker.helpers.arrayElement(locations).id,
      fuel_id: faker.helpers.arrayElement(fuels).id,
      transmission_id: faker.helpers.arrayElement(transmissions).id,
      color_id: faker.helpers.arrayElement(colors).id,
      body_style_id: faker.helpers.arrayElement(bodyStyles).id,
      store_id:
        storeId !== undefined
          ? storeId
          : stores.length > 0
            ? faker.helpers.arrayElement(stores).id
            : null,
      // Thông số kỹ thuật (từ product_specifications)
      drive: faker.helpers.arrayElement(drives),
      power: faker.helpers.arrayElement(powers),
      torque: faker.helpers.arrayElement(torques),
      engine_capacity: faker.helpers.arrayElement(engineCapacities),
      fuel_consumption: faker.helpers.arrayElement(fuelConsumptions),
      doors: faker.helpers.arrayElement([3, 4, 5]),
      weight: faker.helpers.arrayElement(weights),
      payload: faker.helpers.arrayElement(payloads),
      ground_clearance: faker.helpers.arrayElement(groundClearances),
      created_at: createdAt.toISOString(),
      updated_at: updatedAt.toISOString(),
      sold_at: soldAt ? soldAt.toISOString() : null
    }
  }

  const adminOwnerIdSet = new Set(adminStoreOwnerIds)
  const products: any[] = []

  stores.forEach(store => {
    const isAdminStore = adminOwnerIdSet.has(store.owner_id)
    const productCount = isAdminStore
      ? faker.number.int({ min: 18, max: 32 })
      : faker.number.int({ min: 5, max: 12 })
    for (let i = 0; i < productCount; i += 1) {
      products.push(createProductPayload(store.id))
    }
  })

  while (products.length < 150) {
    products.push(createProductPayload())
  }

  const { data, error } = await supabase.from('products').insert(products).select()

  if (error) {
    console.error('Error seeding products:', error)
    const { data: fallback } = await supabase.from('products').select('*')
    return fallback || []
  }

  console.log(`✓ Seeded ${products.length} products`)
  return data || []
}

async function seedProductFavorites(products: any[], users: any[]) {
  const { data: existing } = await supabase.from('product_favorites').select('id').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Product favorites already exist, skipping...')
    return
  }

  const buyers = users.filter(user => user.role === 'buyer')
  if (buyers.length === 0 || products.length === 0) {
    console.log('⚠️  Not enough data to seed product favorites')
    return
  }

  const favorites: {
    user_id: string
    product_id: string
    created_at: string
    updated_at: string
  }[] = []
  buyers.forEach(buyer => {
    const count = faker.number.int({ min: 1, max: 5 })
    const selected = faker.helpers.arrayElements(products, Math.min(count, products.length))
    const usedProductIds = new Set<string>()
    selected.forEach(product => {
      if (!product?.id || usedProductIds.has(product.id)) {
        return
      }
      usedProductIds.add(product.id)
      const { created, updated } = generateTimeline({ days: 180 })
      favorites.push({
        user_id: buyer.id,
        product_id: product.id,
        created_at: created.toISOString(),
        updated_at: updated.toISOString()
      })
    })
  })

  if (favorites.length === 0) {
    return
  }

  const { error } = await supabase.from('product_favorites').insert(favorites)
  if (error) {
    console.error('Error seeding product favorites:', error)
    return
  }
  console.log(`✓ Seeded ${favorites.length} product favorites`)
}

async function seedProductReactions(products: any[], users: any[]) {
  const { data: existing } = await supabase.from('product_reactions').select('id').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Product reactions already exist, skipping...')
    return
  }

  const reactionTypes = ['happy', 'love', 'surprised', 'sad', 'angry']
  const participants = users.filter(user => user.role !== 'admin')
  if (participants.length === 0 || products.length === 0) {
    console.log('⚠️  Not enough data to seed product reactions')
    return
  }

  const reactions: { product_id: string; user_id: string; reaction_type: string }[] = []
  const usedPairs = new Set<string>()
  const sampledProducts = faker.helpers.arrayElements(products, Math.min(60, products.length))

  sampledProducts.forEach(product => {
    const reactionCount = faker.number.int({ min: 1, max: 6 })
    const reactingUsers = faker.helpers.arrayElements(
      participants,
      Math.min(reactionCount, participants.length)
    )
    reactingUsers.forEach(user => {
      if (!product?.id) return
      const key = `${product.id}-${user.id}`
      if (usedPairs.has(key)) return
      usedPairs.add(key)
      reactions.push({
        product_id: product.id,
        user_id: user.id,
        reaction_type: faker.helpers.arrayElement(reactionTypes)
      })
    })
  })

  if (reactions.length === 0) {
    return
  }

  const { error } = await supabase.from('product_reactions').insert(reactions)
  if (error) {
    console.error('Error seeding product reactions:', error)
    return
  }
  console.log(`✓ Seeded ${reactions.length} product reactions`)
}

async function seedProductComments(products: any[], users: any[]) {
  const { data: existing } = await supabase.from('product_comments').select('id').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Product comments already exist, skipping...')
    return
  }

  const commenters = users.filter(user => user.role !== 'admin')
  if (commenters.length === 0 || products.length === 0) {
    console.log('⚠️  Not enough data to seed product comments')
    return
  }

  type CommentPayload = {
    product_id: string
    user_id: string
    content: string
    created_at: string
    updated_at: string
  }
  const commentPayloads: CommentPayload[] = []
  const sampledProducts = faker.helpers.arrayElements(products, Math.min(50, products.length))

  sampledProducts.forEach(product => {
    const commentCount = faker.number.int({ min: 1, max: 3 })
    for (let i = 0; i < commentCount; i += 1) {
      const commenter = faker.helpers.arrayElement(commenters)
      if (!product?.id) continue
      const { created, updated } = generateTimeline({ days: 180 })
      commentPayloads.push({
        product_id: product.id,
        user_id: commenter.id,
        content: faker.lorem.sentences({ min: 1, max: 2 }),
        created_at: created.toISOString(),
        updated_at: updated.toISOString()
      })
    }
  })

  if (commentPayloads.length === 0) {
    return
  }

  const { error } = await supabase.from('product_comments').insert(commentPayloads)
  if (error) {
    console.error('Error seeding product comments:', error)
    return
  }
  console.log(`✓ Seeded ${commentPayloads.length} product comments`)
}

async function seedTestDriveBookings(
  products: any[],
  stores: any[],
  users: any[],
  adminStoreOwnerIds: string[]
) {
  const { data: existing } = await supabase.from('test_drive_bookings').select('id').limit(1)
  if (existing && existing.length > 0) {
    console.log('⚠️  Test drive bookings already exist, skipping...')
    return
  }

  const buyers = users.filter(user => user.role === 'buyer')
  const fallbackBuyers = buyers.length > 0 ? buyers : users
  const productsWithStore = products.filter(product => product.store_id)

  if (fallbackBuyers.length === 0 || productsWithStore.length === 0 || stores.length === 0) {
    console.log('⚠️  Not enough data to seed test drive bookings')
    return
  }

  const adminOwnerIdSet = new Set(adminStoreOwnerIds)
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled']
  const bookings: any[] = []
  const storeOwnerMap = new Map<string, string>()
  stores.forEach(store => {
    if (store?.id) {
      storeOwnerMap.set(store.id, store.owner_id)
    }
  })

  const productsByStore = productsWithStore.reduce<Map<string, any[]>>((map, product) => {
    if (!product.store_id) {
      return map
    }
    if (!map.has(product.store_id)) {
      map.set(product.store_id, [])
    }
    map.get(product.store_id)?.push(product)
    return map
  }, new Map())

  productsByStore.forEach((storeProducts, storeId) => {
    if (storeProducts.length === 0) return
    const baseCount = adminOwnerIdSet.has(storeOwnerMap.get(storeId) || '')
      ? faker.number.int({ min: 10, max: 20 })
      : faker.number.int({ min: 1, max: 5 })

    for (let i = 0; i < baseCount; i += 1) {
      const buyer = faker.helpers.arrayElement(fallbackBuyers)
      const product = faker.helpers.arrayElement(storeProducts)
      const scheduledAt = faker.date.soon({ days: 120 })
      bookings.push({
        user_id: buyer.id,
        product_id: product.id,
        store_id: storeId,
        scheduled_at: scheduledAt.toISOString(),
        location: faker.location.streetAddress(),
        note: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(statuses),
        full_name: buyer.full_name || faker.person.fullName(),
        phone: buyer.phone || faker.phone.number()
      })
    }
  })

  const sampledProducts = faker.helpers.arrayElements(
    productsWithStore,
    Math.min(40, productsWithStore.length)
  )

  sampledProducts.forEach(product => {
    const buyer = faker.helpers.arrayElement(fallbackBuyers)
    const scheduledAt = faker.date.soon({ days: 120 })
    bookings.push({
      user_id: buyer.id,
      product_id: product.id,
      store_id: product.store_id,
      scheduled_at: scheduledAt.toISOString(),
      location: faker.location.streetAddress(),
      note: faker.lorem.sentence(),
      status: faker.helpers.arrayElement(statuses),
      full_name: buyer.full_name || faker.person.fullName(),
      phone: buyer.phone || faker.phone.number()
    })
  })

  const { error } = await supabase.from('test_drive_bookings').insert(bookings)
  if (error) {
    console.error('Error seeding test drive bookings:', error)
    return
  }

  console.log(`✓ Seeded ${bookings.length} test drive bookings`)
}

async function main() {
  console.log('🌱 Starting database seed...')

  const isSeeded = await checkIfSeeded()
  if (isSeeded) {
    console.log('⚠️  Database already seeded. Skipping...')
    console.log('   To re-seed, delete all data from tables first.')
    return
  }

  try {
    console.log('📦 Seeding taxonomies...')
    const brands = await seedBrands()
    const locations = await seedLocations()
    const fuels = await seedFuels()
    const transmissions = await seedTransmissions()
    const colors = await seedColors()
    const bodyStyles = await seedBodyStyles()

    if (
      brands.length === 0 ||
      locations.length === 0 ||
      fuels.length === 0 ||
      transmissions.length === 0 ||
      colors.length === 0 ||
      bodyStyles.length === 0
    ) {
      console.error('❌ Failed to seed taxonomies. Aborting.')
      return
    }

    console.log('\n📦 Seeding users...')
    const users = await seedUsers()

    if (users.length === 0) {
      console.log('⚠️  No users created. Continuing with products without store_id...')
    }
    const adminOwnerIds = users.filter(user => user.role === 'admin').map(user => user.id)

    console.log('\n📦 Seeding stores...')
    const stores = await seedStores(users, locations)

    console.log('\n📦 Seeding models...')
    const models = await seedModels(brands)

    console.log('\n📦 Seeding versions...')
    const versions = await seedVersionsTable()

    console.log('\n📦 Seeding products...')
    const products = await seedProducts(
      brands,
      locations,
      fuels,
      transmissions,
      colors,
      bodyStyles,
      models,
      versions,
      stores,
      adminOwnerIds
    )

    if (products.length === 0) {
      console.error('❌ Failed to seed products. Aborting.')
      return
    }

    console.log('\n📦 Seeding product favorites...')
    await seedProductFavorites(products, users)

    console.log('\n📦 Seeding product reactions...')
    await seedProductReactions(products, users)

    console.log('\n📦 Seeding product comments...')
    await seedProductComments(products, users)

    console.log('\n📦 Seeding test drive bookings...')
    await seedTestDriveBookings(products, stores, users, adminOwnerIds)

    console.log('\n✅ Database seed completed successfully!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exit(1)
  }
}

main()
  .then(() => {
    console.log('✨ Seed script finished')
    process.exit(0)
  })
  .catch(error => {
    console.error('❌ Fatal error:', error)
    process.exit(1)
  })
