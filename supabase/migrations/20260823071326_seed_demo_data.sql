/*
# Create Demo Accounts & Seed Sample Data

## Overview
Creates three demo accounts (farmer, expert, admin) in auth.users and profiles,
plus sample diagnoses and an expert request so the demo flow works immediately.

## New Data
1. Three auth.users entries (sarah, david, admin @agridoctor.demo)
2. Three profiles entries with roles
3. Two sample diagnoses for the farmer
4. One sample expert request
*/

-- Create demo auth users
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role, raw_app_meta_data, raw_user_meta_data)
VALUES
  ('a0000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'sarah@agridoctor.demo', crypt('demo1234', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"role":"farmer"}', '{"name":"Sarah"}'),
  ('a0000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'david@agridoctor.demo', crypt('demo1234', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"role":"expert"}', '{"name":"David"}'),
  ('a0000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'admin@agridoctor.demo', crypt('demo1234', gen_salt('bf')), now(), now(), now(), 'authenticated', 'authenticated', '{"role":"admin"}', '{"name":"Vet4 Admin"}')
ON CONFLICT DO NOTHING;

-- Create profiles
INSERT INTO profiles (id, name, email, role, location)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Sarah', 'sarah@agridoctor.demo', 'farmer', 'Wakiso'),
  ('a0000000-0000-0000-0000-000000000002', 'David', 'david@agridoctor.demo', 'expert', 'Kampala'),
  ('a0000000-0000-0000-0000-000000000003', 'Vet4 Admin', 'admin@agridoctor.demo', 'admin', 'Makerere')
ON CONFLICT (id) DO NOTHING;

-- Seed sample diagnoses for the farmer
INSERT INTO diagnoses (id, farmer_id, crop_name, image_url, ai_result, confidence, severity, symptoms_detected, recommended_actions, prevention_advice, expert_review_status, created_at)
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'Tomatoes',
    NULL,
    'Early Blight',
    87,
    'moderate',
    'Brown circular spots with concentric rings on older leaves; Yellowing around spots; Lower leaves affected first',
    'Remove badly affected leaves. Keep foliage dry. Improve spacing and airflow. Seek expert advice before using chemicals.',
    'Rotate crops; mulch around plants; avoid overhead watering; improve spacing',
    'pending',
    now() - interval '2 days'
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'a0000000-0000-0000-0000-000000000001',
    'Maize',
    NULL,
    'Maize Streak Virus',
    74,
    'moderate',
    'Yellow streaks on leaves; Stunted growth; Reduced ear size',
    'Remove infected plants. Control leafhoppers with appropriate methods. Plant resistant varieties next season.',
    'Plant resistant varieties; control weeds; use early planting',
    'pending',
    now() - interval '5 days'
  )
ON CONFLICT (id) DO NOTHING;

-- Seed a sample expert request
INSERT INTO expert_requests (id, farmer_id, diagnosis_id, crop_name, question, status, created_at)
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'Tomatoes',
    'My tomato leaves have brown spots and are yellowing. The AI says Early Blight. Can you confirm and advise on treatment?',
    'pending',
    now() - interval '1 day'
  )
ON CONFLICT (id) DO NOTHING;
