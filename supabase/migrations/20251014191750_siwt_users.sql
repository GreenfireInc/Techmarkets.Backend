-- First, create the public.siwt_users table with the correct schema
CREATE TABLE public.siwt_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  wallet_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add an index for email lookups (optional but recommended)
CREATE INDEX idx_siwt_users_email ON public.siwt_users(email);

-- Enable Row Level Security
ALTER TABLE public.siwt_users ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow users to view their own data
CREATE POLICY "Users can view their own user data" ON public.siwt_users
  FOR SELECT
  USING (auth.uid() = id);

-- Create the trigger function that syncs data from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.siwt_users (id, email, wallet_address, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'wallet_address',
    NEW.created_at,
    NEW.updated_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the trigger on the auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create an update trigger function to keep data in sync
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.siwt_users
  SET 
    email = NEW.email,
    wallet_address = NEW.raw_user_meta_data->>'wallet_address',
    updated_at = NEW.updated_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create the update trigger
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();
