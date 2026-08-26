/*
# Agri-Chemical Suppliers & Products

## Overview
Creates tables for Uganda's leading agri-chemical suppliers and their products,
links products to specific diseases, and adds nutrient-deficiency fertilizers.

## New Tables
1. `agri_suppliers` — Major agri-chemical suppliers operating in Uganda
2. `agri_products` — Crop protection products and fertilizers from each supplier
3. `disease_products` — Junction table linking diseases to recommended products

## Security
- All tables: public read (anon+authenticated); admin write
*/

-- Suppliers table
CREATE TABLE IF NOT EXISTS agri_suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  location text,
  phone text,
  website text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE agri_suppliers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "suppliers_select_all" ON agri_suppliers;
CREATE POLICY "suppliers_select_all" ON agri_suppliers FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "suppliers_insert_admin" ON agri_suppliers;
CREATE POLICY "suppliers_insert_admin" ON agri_suppliers FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "suppliers_update_admin" ON agri_suppliers;
CREATE POLICY "suppliers_update_admin" ON agri_suppliers FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "suppliers_delete_admin" ON agri_suppliers;
CREATE POLICY "suppliers_delete_admin" ON agri_suppliers FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Products table
CREATE TABLE IF NOT EXISTS agri_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid REFERENCES agri_suppliers(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'fungicide' CHECK (type IN ('fungicide','insecticide','herbicide','bactericide','fertilizer','micronutrient','nematicide')),
  active_ingredient text,
  description text,
  application_rate text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE agri_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "products_select_all" ON agri_products;
CREATE POLICY "products_select_all" ON agri_products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "products_insert_admin" ON agri_products;
CREATE POLICY "products_insert_admin" ON agri_products FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "products_update_admin" ON agri_products;
CREATE POLICY "products_update_admin" ON agri_products FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "products_delete_admin" ON agri_products;
CREATE POLICY "products_delete_admin" ON agri_products FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- Disease-Product junction
CREATE TABLE IF NOT EXISTS disease_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_id uuid REFERENCES diseases(id) ON DELETE CASCADE,
  product_id uuid REFERENCES agri_products(id) ON DELETE CASCADE,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE disease_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "disease_products_select_all" ON disease_products;
CREATE POLICY "disease_products_select_all" ON disease_products FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "disease_products_insert_admin" ON disease_products;
CREATE POLICY "disease_products_insert_admin" ON disease_products FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "disease_products_delete_admin" ON disease_products;
CREATE POLICY "disease_products_delete_admin" ON disease_products FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ========================================
-- SEED DATA: Suppliers
-- ========================================

INSERT INTO agri_suppliers (name, description, location, phone, website) VALUES
  ('Bukoola Chemical Industries', 'Leading manufacturer and distributor of crop protection products in Uganda.', 'Kampala', '+256 414 250 250', 'www.bukoulachemicals.com'),
  ('Osho Chemicals Ltd', 'Major supplier of agrochemicals, fertilizers, and veterinary products across Uganda.', 'Kampala', '+256 414 250 606', 'www.oshochemicals.com'),
  ('Sarrai Group', 'Diversified agribusiness supplying fertilizers, chemicals, and agricultural inputs.', 'Kampala', '+256 414 288 800', 'www.sarraigroup.com'),
  ('Battis Chemicals Ltd', 'Supplier of agricultural chemicals, pesticides, and fertilizers in Uganda.', 'Kampala', '+256 414 220 220', ''),
  ('GreenLife Crop Protection Africa', 'Supplier of eco-friendly crop protection products and fertilizers.', 'Kampala', '+256 700 000 000', 'www.greenlife.co.ug'),
  ('Yara East Africa', 'World-leading fertilizer supplier with operations in Uganda providing high-quality crop nutrition.', 'Kampala', '+256 414 666 777', 'www.yara.com'),
  ('Agrifeed Ltd', 'Supplier of fertilizers, animal feeds, and agricultural inputs in Uganda.', 'Kampala', '+256 414 555 444', ''),
  ('Chemiphar Uganda Ltd', 'Supplier of agricultural chemicals, pharmaceuticals, and industrial chemicals.', 'Kampala', '+256 414 250 100', ''),
  ('Mukwano Group (Agro Division)', 'Diversified group supplying agricultural inputs, fertilizers, and crop protection.', 'Kampala', '+256 414 333 333', 'www.mukwano.com')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- SEED DATA: Products
-- ========================================

INSERT INTO agri_products (supplier_id, name, type, active_ingredient, description, application_rate)
SELECT s.id, v.name, v.type, v.active_ingredient, v.description, v.application_rate
FROM agri_suppliers s
JOIN (VALUES
  ('Bukoola Chemical Industries', 'Mancozeb 80% WP', 'fungicide', 'Mancozeb 80%', 'Contact fungicide for control of fungal diseases on tomatoes, potatoes, coffee, and vegetables.', '2-3 kg per hectare, 7-10 day interval'),
  ('Bukoola Chemical Industries', 'Copper Oxychloride 85% WP', 'fungicide', 'Copper Oxychloride 85%', 'Protective fungicide and bactericide for fungal and bacterial diseases.', '3-4 kg per hectare'),
  ('Bukoola Chemical Industries', 'Glyphosate 360 SL', 'herbicide', 'Glyphosate 360g/L', 'Systemic herbicide for weed control before planting and in established crops.', '1.5-3 L per hectare'),
  ('Bukoola Chemical Industries', 'Imidacloprid 200 SL', 'insecticide', 'Imidacloprid 200g/L', 'Systemic insecticide for sucking insects and soil pests.', '0.5-1 L per hectare'),
  ('Osho Chemicals Ltd', 'Ridomil Gold MZ 68 WP', 'fungicide', 'Metalaxyl-M 4% + Mancozeb 64%', 'Systemic and contact fungicide for late blight and downy mildew on potatoes and tomatoes.', '2.5 kg per hectare, 10-14 day interval'),
  ('Osho Chemicals Ltd', 'Dithane M-45', 'fungicide', 'Mancozeb 80%', 'Broad-spectrum contact fungicide for fungal diseases on vegetables, coffee, and bananas.', '2-3 kg per hectare'),
  ('Osho Chemicals Ltd', 'Duduthrin 1.5 EC', 'insecticide', 'Lambda-cyhalothrin 1.5%', 'Contact and stomach insecticide for caterpillars, aphids, and beetles.', '0.5-1 L per hectare'),
  ('Osho Chemicals Ltd', 'Rocket 44 EC', 'insecticide', 'Profenofos 40% + Cypermethrin 4%', 'Broad-spectrum insecticide for armyworms, bollworms, and other pests.', '1-1.5 L per hectare'),
  ('Osho Chemicals Ltd', 'Cyclone 50 EC', 'fungicide', 'Carbendazim 50%', 'Systemic fungicide for fungal diseases on a wide range of crops.', '1-1.5 L per hectare'),
  ('Sarrai Group', 'NPK 17-17-17', 'fertilizer', 'Nitrogen 17% + Phosphorus 17% + Potassium 17%', 'Balanced compound fertilizer for general crop nutrition and growth.', '200-300 kg per hectare'),
  ('Sarrai Group', 'Urea 46% N', 'fertilizer', 'Nitrogen 46%', 'High-nitrogen fertilizer for vegetative growth in maize, rice, and vegetables.', '100-200 kg per hectare in splits'),
  ('Sarrai Group', 'DAP (Diammonium Phosphate)', 'fertilizer', 'Nitrogen 18% + Phosphorus 46%', 'Starter fertilizer for root development and early growth.', '100-150 kg per hectare at planting'),
  ('Battis Chemicals Ltd', 'Tata Master 72 EC', 'insecticide', 'Dimethoate 30% + Cypermethrin 4%', 'Systemic and contact insecticide for aphids, thrips, and bugs.', '1 L per hectare'),
  ('Battis Chemicals Ltd', 'Score 250 EC', 'fungicide', 'Difenoconazole 250g/L', 'Systemic fungicide for rust, leaf spot, and anthracnose.', '0.3-0.5 L per hectare'),
  ('Battis Chemicals Ltd', 'Roundup 360 SL', 'herbicide', 'Glyphosate 360g/L', 'Non-selective systemic herbicide for weed control.', '1.5-3 L per hectare'),
  ('GreenLife Crop Protection Africa', 'GreenCop 50 WP', 'fungicide', 'Copper 50%', 'Organic-compatible copper fungicide for fungal and bacterial diseases.', '2-3 kg per hectare'),
  ('GreenLife Crop Protection Africa', 'Loyalty 700 WDG', 'insecticide', 'Imidacloprid 70%', 'Systemic insecticide for sucking pests: aphids, whiteflies, leafhoppers.', '0.15-0.3 kg per hectare'),
  ('GreenLife Crop Protection Africa', 'Absolute 375 SC', 'fungicide', 'Azoxystrobin 200g/L + Difenoconazole 125g/L', 'Broad-spectrum systemic fungicide for blights, rusts, and leaf spots.', '0.5-1 L per hectare'),
  ('GreenLife Crop Protection Africa', 'Epic 40 EC', 'insecticide', 'Abamectin 40g/L', 'Insecticide and acaricide for mites, leaf miners, and thrips.', '0.3-0.5 L per hectare'),
  ('Yara East Africa', 'YaraMila Cereal', 'fertilizer', 'N 23% + P 10% + K 5% + Zn 0.3%', 'Cereal-specific compound fertilizer for maize, wheat, and sorghum.', '250-350 kg per hectare'),
  ('Yara East Africa', 'YaraLiva Nitrabor', 'fertilizer', 'Calcium Nitrate 15.5% N + Boron 0.3%', 'Fertilizer for calcium and boron deficiency, prevents fruit and tuber disorders.', '200-400 kg per hectare'),
  ('Yara East Africa', 'YaraVita Foliar Zinc', 'micronutrient', 'Zinc 700g/L', 'Foliar micronutrient for zinc deficiency in maize and beans.', '0.5-1 L per hectare'),
  ('Yara East Africa', 'YaraVita Gramitrel', 'micronutrient', 'Manganese 500g/L + Zinc 50g/L + Copper 20g/L', 'Foliar micronutrient mix for cereal crops.', '1-2 L per hectare'),
  ('Yara East Africa', 'YaraVita Bortrac', 'micronutrient', 'Boron 150g/L', 'Foliar boron fertilizer for flowering and fruiting crops.', '1-2 L per hectare'),
  ('Agrifeed Ltd', 'CAN (Calcium Ammonium Nitrate)', 'fertilizer', 'Nitrogen 26% + Calcium 8%', 'Top-dressing fertilizer for maize, rice, and vegetables.', '100-200 kg per hectare in splits'),
  ('Agrifeed Ltd', 'MOP (Muriate of Potash)', 'fertilizer', 'Potassium Chloride 60% K2O', 'Potassium fertilizer for root crops, bananas, and tomatoes.', '100-200 kg per hectare'),
  ('Agrifeed Ltd', 'Foliar Feed 19-19-19', 'micronutrient', 'NPK 19-19-19 + Trace Elements', 'Water-soluble foliar fertilizer for quick nutrient boost.', '2-5 kg per hectare'),
  ('Chemiphar Uganda Ltd', 'Chlorpyrifos 48 EC', 'insecticide', 'Chlorpyrifos 480g/L', 'Soil and foliar insecticide for armyworms, termites, and stem borers.', '1-2 L per hectare'),
  ('Chemiphar Uganda Ltd', 'Carbendazim 50 WP', 'fungicide', 'Carbendazim 50%', 'Systemic fungicide for fungal diseases on vegetables and cereals.', '0.5-1 kg per hectare'),
  ('Mukwano Group (Agro Division)', 'NPK 26-10-10', 'fertilizer', 'Nitrogen 26% + Phosphorus 10% + Potassium 10%', 'High-nitrogen compound fertilizer for vegetative growth.', '200-300 kg per hectare'),
  ('Mukwano Group (Agro Division)', 'Sulphate of Ammonia', 'fertilizer', 'Nitrogen 21% + Sulphur 24%', 'Fertilizer for nitrogen and sulphur nutrition, acidifies alkaline soils.', '150-250 kg per hectare')
) AS v(supplier, name, type, active_ingredient, description, application_rate)
ON s.name = v.supplier
ON CONFLICT DO NOTHING;

-- ========================================
-- LINK products to diseases
-- ========================================

INSERT INTO disease_products (disease_id, product_id, notes)
SELECT d.id, p.id, v.notes
FROM (VALUES
  ('Early Blight', 'Mancozeb 80% WP', 'Apply at first sign of disease, repeat every 7-10 days'),
  ('Early Blight', 'Dithane M-45', 'Protective spray before infection establishes'),
  ('Early Blight', 'Cyclone 50 EC', 'Systemic treatment for established infections'),
  ('Early Blight', 'Absolute 375 SC', 'Broad-spectrum control of early blight'),
  ('Late Blight', 'Ridomil Gold MZ 68 WP', 'Most effective treatment for late blight — systemic and contact action'),
  ('Late Blight', 'Mancozeb 80% WP', 'Protective application before disease establishes'),
  ('Late Blight', 'Copper Oxychloride 85% WP', 'Copper-based protective spray'),
  ('Late Blight', 'GreenCop 50 WP', 'Organic-compatible copper fungicide'),
  ('Bacterial Wilt', 'Copper Oxychloride 85% WP', 'Copper bactericide — apply to soil and stems'),
  ('Bacterial Wilt', 'GreenCop 50 WP', 'Organic-compatible copper bactericide'),
  ('Tomato Leaf Curl', 'Loyalty 700 WDG', 'Controls whiteflies that spread the virus'),
  ('Tomato Leaf Curl', 'Imidacloprid 200 SL', 'Systemic control of whitefly vectors'),
  ('Tomato Leaf Curl', 'Tata Master 72 EC', 'Controls aphids and whiteflies'),
  ('Maize Streak Virus', 'Loyalty 700 WDG', 'Controls leafhoppers that transmit the virus'),
  ('Maize Streak Virus', 'Imidacloprid 200 SL', 'Systemic insecticide for leafhopper control'),
  ('Maize Streak Virus', 'Chlorpyrifos 48 EC', 'Soil treatment for vector control'),
  ('Northern Corn Leaf Blight', 'Mancozeb 80% WP', 'Protective fungicide application'),
  ('Northern Corn Leaf Blight', 'Score 250 EC', 'Systemic fungicide for established infections'),
  ('Northern Corn Leaf Blight', 'Absolute 375 SC', 'Broad-spectrum systemic control'),
  ('Fall Armyworm Damage', 'Rocket 44 EC', 'Primary treatment for fall armyworm — apply to whorl'),
  ('Fall Armyworm Damage', 'Duduthrin 1.5 EC', 'Contact insecticide for armyworm control'),
  ('Fall Armyworm Damage', 'Chlorpyrifos 48 EC', 'Soil and foliar application for armyworms'),
  ('Fall Armyworm Damage', 'Epic 40 EC', 'Controls armyworm larvae and other pests'),
  ('Angular Leaf Spot', 'Copper Oxychloride 85% WP', 'Copper bactericide for bacterial spot'),
  ('Angular Leaf Spot', 'GreenCop 50 WP', 'Organic-compatible copper treatment'),
  ('Angular Leaf Spot', 'Mancozeb 80% WP', 'Protective fungicide application'),
  ('Bean Rust', 'Score 250 EC', 'Systemic fungicide — most effective for rust'),
  ('Bean Rust', 'Sulphate of Ammonia', 'Sulphur component helps suppress rust'),
  ('Bean Rust', 'Absolute 375 SC', 'Broad-spectrum systemic fungicide'),
  ('Anthracnose', 'Cyclone 50 EC', 'Systemic fungicide for anthracnose'),
  ('Anthracnose', 'Mancozeb 80% WP', 'Protective fungicide application'),
  ('Anthracnose', 'Score 250 EC', 'Systemic treatment for established infections'),
  ('Cassava Mosaic Disease', 'Imidacloprid 200 SL', 'Controls whiteflies that spread the virus'),
  ('Cassava Mosaic Disease', 'Loyalty 700 WDG', 'Systemic control of whitefly vectors'),
  ('Cassava Mosaic Disease', 'Tata Master 72 EC', 'Controls whiteflies and aphids'),
  ('Cassava Brown Streak Disease', 'Imidacloprid 200 SL', 'Controls whitefly vectors that spread the disease'),
  ('Cassava Brown Streak Disease', 'Loyalty 700 WDG', 'Systemic whitefly control'),
  ('Black Sigatoka', 'Mancozeb 80% WP', 'Protective fungicide — apply before infection'),
  ('Black Sigatoka', 'Score 250 EC', 'Systemic fungicide for established infections'),
  ('Black Sigatoka', 'Absolute 375 SC', 'Broad-spectrum systemic control'),
  ('Black Sigatoka', 'Copper Oxychloride 85% WP', 'Copper-based protective spray'),
  ('Banana Bacterial Wilt', 'Copper Oxychloride 85% WP', 'Copper bactericide for infected plants'),
  ('Banana Bacterial Wilt', 'GreenCop 50 WP', 'Organic-compatible copper bactericide'),
  ('Coffee Leaf Rust', 'Score 250 EC', 'Systemic fungicide — primary treatment for coffee rust'),
  ('Coffee Leaf Rust', 'Mancozeb 80% WP', 'Protective fungicide application'),
  ('Coffee Leaf Rust', 'Copper Oxychloride 85% WP', 'Copper-based protective spray'),
  ('Coffee Leaf Rust', 'Absolute 375 SC', 'Broad-spectrum systemic control'),
  ('Coffee Berry Disease', 'Copper Oxychloride 85% WP', 'Copper fungicide — primary treatment for CBD'),
  ('Coffee Berry Disease', 'Mancozeb 80% WP', 'Protective fungicide application'),
  ('Coffee Berry Disease', 'Score 250 EC', 'Systemic fungicide for established infections'),
  ('Coffee Wilt Disease', 'Carbendazim 50 WP', 'Systemic fungicide for wilt management'),
  ('Coffee Wilt Disease', 'Cyclone 50 EC', 'Systemic treatment for fungal wilt'),
  ('Rice Blast', 'Score 250 EC', 'Systemic fungicide — primary treatment for rice blast'),
  ('Rice Blast', 'Carbendazim 50 WP', 'Systemic fungicide for blast management'),
  ('Rice Blast', 'Mancozeb 80% WP', 'Protective fungicide application'),
  ('Bacterial Leaf Blight', 'Copper Oxychloride 85% WP', 'Copper bactericide for bacterial blight'),
  ('Bacterial Leaf Blight', 'GreenCop 50 WP', 'Organic-compatible copper treatment')
) AS v(disease_name, product_name, notes)
JOIN diseases d ON d.name = v.disease_name
JOIN agri_products p ON p.name = v.product_name
ON CONFLICT DO NOTHING;
