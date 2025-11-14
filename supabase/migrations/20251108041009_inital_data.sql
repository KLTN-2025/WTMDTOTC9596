create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  address text,
  avatar_url text,
  dob date,
  cid text,
  doi date,
  join_date date,
  role text default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create type public.product_condition as enum ('new', 'used');
create type public.product_status as enum ('available', 'sold');

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,                           -- tiêu đề sản phẩm
  price bigint not null,                         -- giá bán
  currency text default 'VND',                   -- đơn vị tiền tệ
  year_manufactured text,                        -- năm sản xuất
  mileage_km integer check (mileage_km >= 0),    -- số km đã đi (xe cũ)
  seats integer,                                 -- số chỗ ngồi
  origin text,                                   -- xuất xứ
  model_name text,                               -- tên mẫu xe
  version_name text,                             -- phiên bản xe
  condition_type public.product_condition not null default 'used',  -- tình trạng xe (new/used/demo/refurbished)
  description text,                              -- mô tả chi tiết
  warranty_policy text,                          -- chính sách bảo hành
  status public.product_status not null default 'available',               -- trạng thái: available/solds
  media_urls text[] default '{}',                -- danh sách ảnh/video
  drive text,                                    -- hệ dẫn động (FWD, RWD, AWD, 4WD)
  power text,                                    -- công suất động cơ (hp, kW, hoặc RPM)
  torque text,                                   -- momen xoắn (Nm @ RPM)
  engine_capacity text,                         -- dung tích động cơ (L)
  fuel_consumption text,                        -- nhiên liệu tiêu thụ (L/100km)
  doors integer,                                -- số cửa
  weight text,                                  -- trọng lượng (kg hoặc tấn)
  payload text,                                 -- trọng tải (kg hoặc tấn)
  ground_clearance text,                        -- khoảng sáng gầm xe (mm)
  created_at timestamp with time zone default now(),  -- ngày tạo bản ghi
  updated_at timestamp with time zone default now()  -- ngày tạo bản ghi
);

create index if not exists products_title_idx on public.products using gin (to_tsvector('simple', coalesce(title, '')));
create index if not exists products_year_manufactured_idx on public.products (year_manufactured);
create index if not exists products_origin_idx on public.products (origin);
create index if not exists products_price_idx on public.products (price);
create index if not exists products_created_at_idx on public.products (created_at desc);
create index if not exists products_condition_type_idx on public.products (condition_type);
create index if not exists products_status_idx on public.products (status);

create table if not exists public.product_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (user_id, product_id)
);
create index if not exists product_favorites_user_id_idx on public.product_favorites (user_id);
create index if not exists product_favorites_product_id_idx on public.product_favorites (product_id);



create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  logo_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.fuels (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.transmissions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.colors (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.body_styles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.sellers (
  id uuid primary key references auth.users (id) ON DELETE CASCADE,
  store_name text not null,
  store_logo text,
  store_banner text,
  description text,
  tax_code text,
  invoice_info text,
  address text,
  store_phone text,
  zalo text,
  email text,
  website_link text,
  verified boolean default false,
  status text default 'active' check (status in ('active', 'suspended', 'banned')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.test_drive_bookings (
  id uuid primary key default gen_random_uuid(),
  
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  seller_id uuid references public.sellers (id) on delete set null,
  
  scheduled_at timestamp with time zone not null,
  location text,
  note text,
  status text default 'pending' check (
    status in ('pending', 'confirmed', 'completed', 'cancelled')
  ),
  full_name text,
  phone text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);
create index if not exists test_drive_bookings_user_id_idx on public.test_drive_bookings (user_id);
create index if not exists test_drive_bookings_product_id_idx on public.test_drive_bookings (product_id);
create index if not exists test_drive_bookings_seller_id_idx on public.test_drive_bookings (seller_id);
create index if not exists test_drive_bookings_scheduled_at_idx on public.test_drive_bookings (scheduled_at);
create index if not exists test_drive_bookings_location_idx on public.test_drive_bookings (location);
create index if not exists test_drive_bookings_status_idx on public.test_drive_bookings (status);
create index if not exists test_drive_bookings_full_name_idx on public.test_drive_bookings (full_name);
create index if not exists test_drive_bookings_phone_idx on public.test_drive_bookings (phone);

alter table public.products
  add column if not exists brand_id uuid references public.brands(id) on delete set null,
  add column if not exists category_id uuid references public.categories(id) on delete set null,
  add column if not exists location_id uuid references public.locations(id) on delete set null,
  add column if not exists fuel_id uuid references public.fuels(id) on delete set null,
  add column if not exists transmission_id uuid references public.transmissions(id) on delete set null,
  add column if not exists color_id uuid references public.colors(id) on delete set null,
  add column if not exists body_style_id uuid references public.body_styles(id) on delete set null,
  add column if not exists seller_id uuid references public.sellers(id) on delete set null,
  add column if not exists year_text text;

create index if not exists products_brand_idx on public.products (brand_id);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_location_fk_idx on public.products (location_id);
create index if not exists products_fuel_fk_idx on public.products (fuel_id);
create index if not exists products_transmission_fk_idx on public.products (transmission_id);
create index if not exists products_color_fk_idx on public.products (color_id);
create index if not exists products_body_style_fk_idx on public.products (body_style_id);
create index if not exists products_seller_idx on public.products (seller_id);
create index if not exists products_seats_idx on public.products (seats);

create table if not exists public.product_comments (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  parent_id uuid references public.product_comments(id) on delete cascade,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index if not exists product_comments_product_id_idx on public.product_comments (product_id);
create index if not exists product_comments_user_id_idx on public.product_comments (user_id);
create index if not exists product_comments_parent_id_idx on public.product_comments (parent_id);
create index if not exists product_comments_created_at_idx on public.product_comments (created_at desc);

create table if not exists public.product_reactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('happy', 'love', 'surprised', 'sad', 'angry')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (product_id, user_id)
);

create index if not exists product_reactions_product_id_idx on public.product_reactions (product_id);
create index if not exists product_reactions_user_id_idx on public.product_reactions (user_id);
create index if not exists product_reactions_reaction_type_idx on public.product_reactions (reaction_type);



grant usage on schema "public" to anon;
grant usage on schema "public" to authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "public" TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA "public" TO anon;
