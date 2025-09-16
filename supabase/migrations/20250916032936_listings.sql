CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  title TEXT NOT NULL,
  description TEXT,
  make TEXT,
  model TEXT,
  condition TEXT NOT NULL, -- 'new', 'like-new', 'good', 'fair', 'poor'
  condition_description TEXT,
  price NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd', -- 'usd', 'xtz'
  similar_item_url TEXT,
  wikipedia_url TEXT,
  youtube_url TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'sold', 'removed', 'pending'
  smart_contract_listing_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_path TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
CREATE POLICY "Anyone can view active listings" ON listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "Sellers can manage own listings" ON listings
  FOR ALL USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can manage own listing images" ON listing_images
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM listings
    WHERE listings.id = listing_id
      AND listings.seller_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM listings
    WHERE listings.id = listing_id
      AND listings.seller_id = auth.uid()
  ));
