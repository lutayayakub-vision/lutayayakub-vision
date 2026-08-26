const AGRICULTURE_KEYWORDS = [
  'crop', 'plant', 'leaf', 'farm', 'farmer', 'field', 'garden', 'soil',
  'seed', 'harvest', 'maize', 'corn', 'tomato', 'banana', 'coffee', 'bean',
  'cassava', 'potato', 'rice', 'onion', 'cabbage', 'pest', 'disease',
  'fungus', 'insect', 'fruit', 'vegetable', 'flower', 'tree', 'irrigation',
  'fertilizer', 'compost', 'greenhouse', 'nursery', 'seedling', 'sprout',
  'grain', 'wheat', 'barley', 'sorghum', 'millet', 'groundnut', 'peanut',
  'yam', 'sweet potato', 'carrot', 'cucumber', 'pumpkin', 'mango', 'papaya',
  'avocado', 'pepper', 'chili', 'eggplant', 'pineapple', 'passion fruit',
  'watermelon', 'sugarcane', 'cotton', 'tea', 'sunflower', 'sesame',
  'soybean', 'cowpea', 'pea', 'pigeon pea', 'livestock', 'cattle', 'goat',
  'poultry', 'chicken', 'beehive', 'honey', 'agriculture', 'agronomy',
];

export function isImageRequest(text: string): boolean {
  const lower = text.toLowerCase();
  const hasImageWord = /\b(generate|create|draw|show|picture|image|photo|illustration)\b/.test(lower);
  const hasAgriKeyword = AGRICULTURE_KEYWORDS.some((kw) => lower.includes(kw));
  return hasImageWord && hasAgriKeyword;
}

export function extractImagePrompt(text: string): string {
  const lower = text.toLowerCase();
  const cleaned = lower
    .replace(/^(please\s+)?(can\s+you\s+)?/, '')
    .replace(/\b(generate|create|draw|show|make)\b/g, '')
    .replace(/\b(an?|image|picture|photo|illustration|of|me|for)\b/g, '')
    .replace(/\b(please)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const prompt = cleaned || text.trim();
  return `${prompt}, agriculture, farming, high quality, detailed, realistic`;
}

export function generateImageUrl(prompt: string, width = 768, height = 512): string {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;
}
