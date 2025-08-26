-- Site ayarları için tablo
create table if not exists settings (
  id uuid primary key default gen_random_uuid(),
  site_name text,
  site_description text,
  contact_email text,
  contact_phone text,
  language text default 'tr',
  logo_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tek satırda ayar saklamak için unique constraint
alter table settings add constraint one_row CHECK (id IS NOT NULL) not valid;
