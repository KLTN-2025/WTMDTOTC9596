create table if not exists public.products (
  id bigint generated always as identity primary key,
  title text not null,                           -- tiêu đề sản phẩm
  price bigint not null,                         -- giá bán
  currency text default 'VND',                   -- đơn vị tiền tệ
  fuel text,                                     -- nhiên liệu (xăng, dầu, điện...)
  transmission text,                             -- hộp số
  year_manufactured text,                        -- năm sản xuất
  mileage_km integer check (mileage_km >= 0),    -- số km đã đi (xe cũ)
  color text,                                    -- màu xe
  seats integer,                                 -- số chỗ ngồi
  origin text,                                   -- xuất xứ
  location text,                                 -- địa điểm đăng bán
  dealer text,                                   -- người bán hoặc đại lý
  dealer_image text,                             -- ảnh đại lý/người bán
  model_name text,                               -- tên mẫu xe
  version_name text,                             -- phiên bản xe
  condition_type product_condition not null default 'used',  -- tình trạng xe (new/used/demo/refurbished)
  description text,                              -- mô tả chi tiết
  warranty_policy text,                          -- chính sách bảo hành
  status text,               -- trạng thái: available/sold/hidden
  media_urls text[] default '{}',                -- danh sách ảnh/video
  created_at timestamp with time zone default now()  -- ngày tạo bản ghi
);
create index if not exists products_title_idx on public.products using gin (to_tsvector('simple', coalesce(title, '')));
create index if not exists products_location_idx on public.products (location);
create index if not exists products_year_idx on public.products (year);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_fuel_idx on public.products (fuel);
create index if not exists products_transmission_idx on public.products (transmission);
create index if not exists products_color_idx on public.products (color);
create index if not exists products_origin_idx on public.products (origin);
create index if not exists products_price_idx on public.products (price);
create index if not exists products_created_at_idx on public.products (created_at desc);

create table if not exists public.brands (
  id bigint generated always as identity primary key,
  name text not null unique,
  logo_url text,
  created_at timestamp with time zone default now()
);

create table if not exists public.categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamp with time zone default now()
);

create table if not exists public.locations (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamp with time zone default now()
);

create table if not exists public.fuels (
  id bigint generated always as identity primary key,
  name text not null unique
);

create table if not exists public.transmissions (
  id bigint generated always as identity primary key,
  name text not null unique
);

create table if not exists public.colors (
  id bigint generated always as identity primary key,
  name text not null unique
);

create table if not exists public.body_styles (
  id bigint generated always as identity primary key,
  name text not null unique
);

alter table public.products
  add column if not exists brand_id bigint references public.brands(id) on delete set null,
  add column if not exists category_id bigint references public.categories(id) on delete set null,
  add column if not exists location_id bigint references public.locations(id) on delete set null,
  add column if not exists fuel_id bigint references public.fuels(id) on delete set null,
  add column if not exists transmission_id bigint references public.transmissions(id) on delete set null,
  add column if not exists color_id bigint references public.colors(id) on delete set null,
  add column if not exists body_style_id bigint references public.body_styles(id) on delete set null,
  add column if not exists year_text text;

create index if not exists products_brand_idx on public.products (brand_id);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_location_fk_idx on public.products (location_id);
create index if not exists products_fuel_fk_idx on public.products (fuel_id);
create index if not exists products_transmission_fk_idx on public.products (transmission_id);
create index if not exists products_color_fk_idx on public.products (color_id);
create index if not exists products_body_style_fk_idx on public.products (body_style_id); 
create index if not exists products_year_manufactured_idx on public.products (year_manufactured);
create index if not exists products_seats_idx on public.products (seats);
create index if not exists products_origin_text_idx on public.products (origin);
create index if not exists products_condition_text_idx on public.products (condition_text);

