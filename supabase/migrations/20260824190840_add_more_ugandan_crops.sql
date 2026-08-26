/*
# Add remaining major Ugandan crops

Adds crops that are grown in Uganda but were missing from the database:
Yam, Peas, Cowpeas, Soybean, Barley, Wheat, Pumpkin, Carrot, Cucumber,
Mango, Papaya, Pigeon Peas
*/

INSERT INTO crops (name, description, image_url) VALUES
  ('Yam', 'Traditional root crop grown across Uganda, especially in eastern and western regions, valued for food security.', 'https://images.pexels.com/photos/30204260/pexels-photo-30204260.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Peas', 'Cool-season legume grown in highland areas of Uganda for food and income.', 'https://images.pexels.com/photos/4750262/pexels-photo-4750262.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Cowpeas', 'Drought-tolerant legume widely grown in northern and eastern Uganda for leaves and grain, known locally as bo.', 'https://images.pexels.com/photos/17553406/pexels-photo-17553406.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Soybean', 'High-protein legume increasingly grown in Uganda for food, animal feed, and oil extraction.', 'https://images.pexels.com/photos/36893985/pexels-photo-36893985.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Barley', 'Cereal crop grown in cooler highland areas of Uganda, used for food and brewing.', 'https://images.pexels.com/photos/32602419/pexels-photo-32602419.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Wheat', 'Cereal crop grown in highland areas like Kapchorwa and Kabale for flour and baking.', 'https://images.pexels.com/photos/10383335/pexels-photo-10383335.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Pumpkin', 'Widely grown vegetable in home gardens and farms across Uganda, valued for food and animal feed.', 'https://images.pexels.com/photos/30378129/pexels-photo-30378129.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Carrot', 'Root vegetable grown in cooler highland areas and irrigated lowlands for local markets.', 'https://images.pexels.com/photos/8245914/pexels-photo-8245914.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Cucumber', 'Vegetable crop grown in home gardens and commercial farms across Uganda.', 'https://images.pexels.com/photos/38272574/pexels-photo-38272574.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Mango', 'Widely grown fruit tree across Uganda, valued for fresh fruit and local markets.', 'https://images.pexels.com/photos/20987903/pexels-photo-20987903.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Papaya', 'Tropical fruit tree grown in home gardens and farms across Uganda, rich in vitamins.', 'https://images.pexels.com/photos/3187119/pexels-photo-3187119.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'),
  ('Pigeon Peas', 'Drought-tolerant legume grown in eastern and northern Uganda, known locally as enkolimbo.', 'https://images.pexels.com/photos/36546288/pexels-photo-36546288.jpeg?auto=compress&cs=tinysrgb&h=650&w=940')
ON CONFLICT (name) DO NOTHING;
