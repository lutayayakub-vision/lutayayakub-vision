/*
# AgriDoctor AI — Core Schema

## Overview
Creates the full database schema for AgriDoctor AI, a crop disease diagnosis platform
for Ugandan small-scale farmers. Supports farmers, agricultural experts, and admins.

## New Tables
1. `profiles` — Extends auth.users with role (farmer/expert/admin), name, phone, location.
2. `crops` — Supported crop catalog (maize, beans, tomatoes, etc.).
3. `diseases` — Disease database keyed to crops (symptoms, prevention, actions, severity).
4. `farmer_crops` — Farmer's crop/field records.
5. `diagnoses` — AI diagnosis results with image, confidence, severity, expert review status.
6. `expert_requests` — Farmer requests for expert review of a diagnosis.
7. `messages` — Farmer-expert chat messages.
8. `educational_content` — Learn articles keyed to crops.

## Security
- RLS enabled on all tables.
- Profiles: users read/update own; admins read all.
- Crops, diseases, educational_content: public read (anon+authenticated); admin write.
- Farmer-specific tables (farmer_crops, diagnoses): owner-scoped CRUD.
- Expert_requests: farmer sees own requests; expert sees assigned/pending; admin sees all.
- Messages: sender and receiver can read; both can insert.
- Expert actions (confirm diagnosis, update status) handled via update policies.
*/

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  role text NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer', 'expert', 'admin')),
  location text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_select_admin" ON profiles;
CREATE POLICY "profiles_select_admin" ON profiles FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- Crops table
CREATE TABLE IF NOT EXISTS crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  icon text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE crops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crops_select_all" ON crops;
CREATE POLICY "crops_select_all" ON crops FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "crops_insert_admin" ON crops;
CREATE POLICY "crops_insert_admin" ON crops FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "crops_update_admin" ON crops;
CREATE POLICY "crops_update_admin" ON crops FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "crops_delete_admin" ON crops;
CREATE POLICY "crops_delete_admin" ON crops FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Diseases table
CREATE TABLE IF NOT EXISTS diseases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  crop_id uuid REFERENCES crops(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  symptoms text,
  causes text,
  prevention text,
  recommended_actions text,
  severity text DEFAULT 'moderate',
  warning_notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE diseases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "diseases_select_all" ON diseases;
CREATE POLICY "diseases_select_all" ON diseases FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "diseases_insert_admin" ON diseases;
CREATE POLICY "diseases_insert_admin" ON diseases FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "diseases_update_admin" ON diseases;
CREATE POLICY "diseases_update_admin" ON diseases FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "diseases_delete_admin" ON diseases;
CREATE POLICY "diseases_delete_admin" ON diseases FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Farmer crops table
CREATE TABLE IF NOT EXISTS farmer_crops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_id uuid REFERENCES crops(id),
  crop_name text NOT NULL,
  farm_name text,
  planting_date date,
  location text,
  notes text,
  photo_url text,
  status text DEFAULT 'monitoring',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE farmer_crops ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "farmer_crops_select_own" ON farmer_crops;
CREATE POLICY "farmer_crops_select_own" ON farmer_crops FOR SELECT
  TO authenticated USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "farmer_crops_insert_own" ON farmer_crops;
CREATE POLICY "farmer_crops_insert_own" ON farmer_crops FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "farmer_crops_update_own" ON farmer_crops;
CREATE POLICY "farmer_crops_update_own" ON farmer_crops FOR UPDATE
  TO authenticated USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "farmer_crops_delete_own" ON farmer_crops;
CREATE POLICY "farmer_crops_delete_own" ON farmer_crops FOR DELETE
  TO authenticated USING (auth.uid() = farmer_id);

-- Diagnoses table
CREATE TABLE IF NOT EXISTS diagnoses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  crop_name text NOT NULL,
  image_url text,
  ai_result text,
  confidence integer,
  severity text,
  symptoms_detected text,
  recommended_actions text,
  prevention_advice text,
  expert_review_status text DEFAULT 'pending',
  expert_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE diagnoses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "diagnoses_select_own" ON diagnoses;
CREATE POLICY "diagnoses_select_own" ON diagnoses FOR SELECT
  TO authenticated USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "diagnoses_select_expert" ON diagnoses;
CREATE POLICY "diagnoses_select_expert" ON diagnoses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'expert')
  );

DROP POLICY IF EXISTS "diagnoses_select_admin" ON diagnoses;
CREATE POLICY "diagnoses_select_admin" ON diagnoses FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "diagnoses_insert_own" ON diagnoses;
CREATE POLICY "diagnoses_insert_own" ON diagnoses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "diagnoses_update_own" ON diagnoses;
CREATE POLICY "diagnoses_update_own" ON diagnoses FOR UPDATE
  TO authenticated USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "diagnoses_update_expert" ON diagnoses;
CREATE POLICY "diagnoses_update_expert" ON diagnoses FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('expert', 'admin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('expert', 'admin'))
  );

-- Expert requests table
CREATE TABLE IF NOT EXISTS expert_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  diagnosis_id uuid REFERENCES diagnoses(id) ON DELETE CASCADE,
  crop_name text,
  question text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'answered', 'closed')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE expert_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "expert_requests_select_farmer" ON expert_requests;
CREATE POLICY "expert_requests_select_farmer" ON expert_requests FOR SELECT
  TO authenticated USING (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "expert_requests_select_expert" ON expert_requests;
CREATE POLICY "expert_requests_select_expert" ON expert_requests FOR SELECT
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('expert', 'admin'))
  );

DROP POLICY IF EXISTS "expert_requests_insert_own" ON expert_requests;
CREATE POLICY "expert_requests_insert_own" ON expert_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = farmer_id);

DROP POLICY IF EXISTS "expert_requests_update_expert" ON expert_requests;
CREATE POLICY "expert_requests_update_expert" ON expert_requests FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('expert', 'admin'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('expert', 'admin'))
  );

DROP POLICY IF EXISTS "expert_requests_update_farmer" ON expert_requests;
CREATE POLICY "expert_requests_update_farmer" ON expert_requests FOR UPDATE
  TO authenticated USING (auth.uid() = farmer_id) WITH CHECK (auth.uid() = farmer_id);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES expert_requests(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text,
  image_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_select_participants" ON messages;
CREATE POLICY "messages_select_participants" ON messages FOR SELECT
  TO authenticated USING (
    auth.uid() = sender_id OR auth.uid() = receiver_id
  );

DROP POLICY IF EXISTS "messages_insert_participants" ON messages;
CREATE POLICY "messages_insert_participants" ON messages FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = sender_id
  );

-- Educational content table
CREATE TABLE IF NOT EXISTS educational_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  crop_id uuid REFERENCES crops(id) ON DELETE SET NULL,
  crop_name text,
  content text,
  author text,
  published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE educational_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "edu_select_all" ON educational_content;
CREATE POLICY "edu_select_all" ON educational_content FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "edu_insert_admin" ON educational_content;
CREATE POLICY "edu_insert_admin" ON educational_content FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "edu_update_admin" ON educational_content;
CREATE POLICY "edu_update_admin" ON educational_content FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "edu_delete_admin" ON educational_content;
CREATE POLICY "edu_delete_admin" ON educational_content FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_diseases_crop_id ON diseases(crop_id);
CREATE INDEX IF NOT EXISTS idx_farmer_crops_farmer_id ON farmer_crops(farmer_id);
CREATE INDEX IF NOT EXISTS idx_diagnoses_farmer_id ON diagnoses(farmer_id);
CREATE INDEX IF NOT EXISTS idx_expert_requests_farmer_id ON expert_requests(farmer_id);
CREATE INDEX IF NOT EXISTS idx_expert_requests_status ON expert_requests(status);
CREATE INDEX IF NOT EXISTS idx_messages_request_id ON messages(request_id);
