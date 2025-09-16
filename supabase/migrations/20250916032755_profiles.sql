CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  user_type TEXT NOT NULL DEFAULT 'buyer', -- 'buyer', 'seller', 'admin'
  wallet_address TEXT UNIQUE,
  google_verified BOOLEAN DEFAULT FALSE,
  seller_verified BOOLEAN DEFAULT FALSE,
  firstname TEXT,
  lastname TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  zipcode TEXT,
  instagram TEXT,
  twitter TEXT,
  linkedin TEXT,
  website TEXT,
  lunc_address TEXT,
  xtz_address TEXT,
  what3words TEXT,
  pluscode TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
