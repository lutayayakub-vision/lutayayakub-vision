/*
# Add Crop Images & New Uganda Crops

## Overview
Adds an image_url column to the crops table, updates existing crops with photos,
and inserts all major crops grown in Uganda with their photos.

## Changes
1. ALTER TABLE crops to add image_url column
2. UPDATE existing 7 crops with image URLs
3. INSERT 18 new crops with descriptions and image URLs
*/

-- Add image_url column to crops
ALTER TABLE crops ADD COLUMN IF NOT EXISTS image_url text;

-- Update existing crops with image URLs
UPDATE crops SET image_url = 'https://images.pexels.com/photos/34454659/pexels-photo-34454659.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Banana';
UPDATE crops SET image_url = 'https://images.pexels.com/photos/37740965/pexels-photo-37740965.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Beans';
UPDATE crops SET image_url = 'https://images.pexels.com/photos/36846177/pexels-photo-36846177.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Cassava';
UPDATE crops SET image_url = 'https://images.pexels.com/photos/7125438/pexels-photo-7125438.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Coffee';
UPDATE crops SET image_url = 'https://images.pexels.com/photos/1382102/pexels-photo-1382102.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Maize';
UPDATE crops SET image_url = 'https://images.pexels.com/photos/13888402/pexels-photo-13888402.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Rice';
UPDATE crops SET image_url = 'https://images.pexels.com/photos/33872280/pexels-photo-33872280.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Tomatoes';

-- Insert new crops grown in Uganda
INSERT INTO crops (name, description, icon, image_url) VALUES
  ('Sweet Potato', 'Drought-tolerant root crop widely grown for food security and income across Uganda.', 'CircleDot', 'https://images.pexels.com/photos/7456548/pexels-photo-7456548.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Irish Potato', 'Important highland crop grown in cooler regions like Kabale and Mbale for food and sale.', 'CircleDot', 'https://images.pexels.com/photos/31908568/pexels-photo-31908568.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Groundnuts', 'Key oilseed and protein crop, often intercropped with maize and widely grown across Uganda.', 'Sprout', 'https://images.pexels.com/photos/9799037/pexels-photo-9799037.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Sorghum', 'Drought-resistant cereal grown in drier areas like Karamoja and used for food and brewing.', 'Wheat', 'https://images.pexels.com/photos/17164609/pexels-photo-17164609.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Millet', 'Traditional staple cereal in northern and eastern Uganda, valued for its drought tolerance and nutrition.', 'Wheat', 'https://images.pexels.com/photos/16977456/pexels-photo-16977456.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Sesame', 'Oilseed crop grown in northern Uganda for local use and export, known locally as simsim.', 'Sprout', 'https://images.pexels.com/photos/39081777/pexels-photo-39081777.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Cotton', 'Important cash crop grown in eastern and northern Uganda for export and local textile industry.', 'Sprout', 'https://images.pexels.com/photos/13924870/pexels-photo-13924870.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Tea', 'Major export crop grown in highland areas like Kabale, Fort Portal, and Mukono.', 'Leaf', 'https://images.pexels.com/photos/31528044/pexels-photo-31528044.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Sugarcane', 'Commercial crop grown in areas like Lugazi and Kakira for sugar production and chewing.', 'Wheat', 'https://images.pexels.com/photos/9622985/pexels-photo-9622985.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Onions', 'High-value vegetable crop grown commercially in many districts for local markets and export.', 'Apple', 'https://images.pexels.com/photos/37405768/pexels-photo-37405768.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Cabbage', 'Popular vegetable grown in highland and lowland areas for local markets.', 'Apple', 'https://images.pexels.com/photos/8258134/pexels-photo-8258134.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Eggplant', 'Widely grown vegetable in home gardens and commercial farms, known locally as entula.', 'Apple', 'https://images.pexels.com/photos/35116491/pexels-photo-35116491.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Chili Pepper', 'Growing commercial crop for local use and export, valued for its high market demand.', 'Apple', 'https://images.pexels.com/photos/36133755/pexels-photo-36133755.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Watermelon', 'Increasingly popular fruit crop grown commercially in warm areas for local markets.', 'Apple', 'https://images.pexels.com/photos/12746876/pexels-photo-12746876.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Pineapple', 'Commercial fruit crop grown in areas like Kangulumira and Mukono for fresh market and juice.', 'Apple', 'https://images.pexels.com/photos/37413905/pexels-photo-37413905.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Sunflower', 'Oilseed crop grown in northern Uganda for cooking oil and animal feed.', 'Sun', 'https://images.pexels.com/photos/15395699/pexels-photo-15395699.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Passion Fruit', 'High-value fruit crop grown commercially for juice and fresh market, especially in central Uganda.', 'Apple', 'https://images.pexels.com/photos/32419594/pexels-photo-32419594.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Avocado', 'Widely grown fruit tree across Uganda, increasingly important for local and export markets.', 'Apple', 'https://images.pexels.com/photos/14023214/pexels-photo-14023214.jpeg?auto=compress&cs=tinysrgb&h=650&w=940')
ON CONFLICT (name) DO NOTHING;
