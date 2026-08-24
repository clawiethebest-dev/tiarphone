-- Create products table for admin management
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  long_description TEXT,
  price DECIMAL NOT NULL,
  original_price DECIMAL,
  category TEXT DEFAULT 'packets',
  images JSONB DEFAULT '[]'::jsonb,
  specifications JSONB DEFAULT '{}'::jsonb,
  in_stock BOOLEAN DEFAULT true,
  stock INTEGER DEFAULT 50,
  featured BOOLEAN DEFAULT false,
  deal BOOLEAN DEFAULT false,
  rating DECIMAL DEFAULT 5,
  reviews_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Allow public read
CREATE POLICY "Allow public read" ON products FOR SELECT USING (true);

-- Allow all operations (for admin - in production use proper auth)
CREATE POLICY "Allow all operations" ON products FOR ALL USING (true);

-- Insert existing products
INSERT INTO products (id, slug, name, description, long_description, price, original_price, category, images, in_stock, stock, featured, deal)
VALUES 
  ('1', 'pack-infinix-smart10', '📦 باك Infinix Smart 10', '📱 هاتف Infinix Smart 10 + ساعة Y36 Ultra3 + سماعات Hishell + Dunth V5.0!', '', 22000, 26000, 'packets', '[]'::jsonb, true, 50, true, true),
  ('2', 'pack-itel-a50-ultimate', '📦 باك itel A50 Ultimate', '📱 هاتف itel A50 4G + ماكينة حلاقة + مكنسة + باور بانك + شاحن + حامل سيارة!', '', 24900, 29000, 'packets', '["/images/products/pack-itel-a50/1-pack-complete.jpg","/images/products/pack-itel-a50/2-phone-a50.jpg","/images/products/pack-itel-a50/3-gevo-g1.jpg","/images/products/pack-itel-a50/4-powerbank.jpg","/images/products/pack-itel-a50/5-kemei.jpg","/images/products/pack-itel-a50/6-stand.jpg","/images/products/pack-itel-a50/7-vacuum.jpg","/images/products/pack-itel-a50/8-vacuum-uses.jpg"]'::jsonb, true, 50, true, true),
  ('3', 'pack-tech-ultimate', '📦 باك التكنولوجيا المتكامل', '📱 كل ما تحتاجه في مكان واحد!', '', 20650, 25000, 'packets', '[]'::jsonb, true, 50, true, true),
  ('4', 'pack-reekoo-note-60', '📱🔥 باك Reekoo NOTE 60', '📱 هاتفين + باور بانك + سماعات RGB + إكسسوارات!', '', 19900, 24000, 'packets', '[]'::jsonb, true, 30, true, true),
  ('5', 'pack-media-phone', '📦 باك Media Phone', '📱 باك كامل للموبايل مع كل الإكسسوارات!', '', 19700, 24000, 'packets', '[]'::jsonb, true, 25, true, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  images = EXCLUDED.images;
