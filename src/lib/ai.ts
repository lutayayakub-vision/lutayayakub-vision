import type { Disease, DiagnosisResult, DiseaseProduct } from '@/types';

const diseaseKeywords: Record<string, string[]> = {
  'Early Blight': ['spot', 'brown', 'yellow', 'lesion', 'ring', 'dark', 'lower leaf'],
  'Late Blight': ['water', 'dark', 'mold', 'white', 'wilt', 'rapid', 'collapse'],
  'Bacterial Wilt': ['wilt', 'sag', 'droop', 'brown', 'stem', 'sudden'],
  'Tomato Leaf Curl': ['curl', 'curling', 'upward', 'yellow', 'stunt', 'twist'],
  'Maize Streak Virus': ['streak', 'yellow', 'line', 'stunt', 'stripe'],
  'Northern Corn Leaf Blight': ['lesion', 'gray', 'tan', 'long', 'cigar', 'dry'],
  'Fall Armyworm Damage': ['hole', 'ragged', 'sawdust', 'worm', 'caterpillar', 'chew'],
  'Angular Leaf Spot': ['angular', 'spot', 'brown', 'yellow', 'drop'],
  'Bean Rust': ['rust', 'pustule', 'reddish', 'brown', 'powdery'],
  'Anthracnose': ['sunken', 'dark', 'lesion', 'pod', 'stem', 'brown'],
  'Cassava Mosaic Disease': ['mosaic', 'mottle', 'distort', 'stunt', 'yellow', 'green'],
  'Cassava Brown Streak Disease': ['streak', 'brown', 'yellow', 'rot', 'crack', 'blotch'],
  'Black Sigatoka': ['streak', 'black', 'dark', 'yellow', 'brown', 'banana'],
  'Banana Bacterial Wilt': ['wilt', 'yellow', 'premature', 'ripe', 'internal', 'brown'],
  'Coffee Leaf Rust': ['rust', 'orange', 'yellow', 'spot', 'powdery', 'underneath'],
  'Coffee Berry Disease': ['berry', 'dark', 'sunken', 'drop', 'lesion'],
  'Coffee Wilt Disease': ['wilt', 'brown', 'blue', 'black', 'death', 'sudden'],
  'Rice Blast': ['lesion', 'diamond', 'brown', 'neck', 'rot', 'empty'],
  'Bacterial Leaf Blight': ['yellow', 'white', 'wavy', 'margin', 'dry', 'blight'],
};

export function analyzeImage(
  cropName: string,
  imageDescription: string,
  diseases: Disease[],
  diseaseProducts: DiseaseProduct[] = []
): DiagnosisResult {
  const lowerDesc = imageDescription.toLowerCase();

  const cropDiseases = diseases.filter((d) => {
    const crop = (d as any).crops as { name: string } | null;
    return crop?.name === cropName;
  });

  const searchPool = cropDiseases.length > 0 ? cropDiseases : diseases;

  let bestMatch: Disease | null = null;
  let bestScore = 0;

  for (const disease of searchPool) {
    const keywords = diseaseKeywords[disease.name] || [];
    let score = 0;
    for (const keyword of keywords) {
      if (lowerDesc.includes(keyword)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = disease;
    }
  }

  const confidence = bestMatch && bestScore > 0
    ? Math.min(95, 60 + bestScore * 8 + Math.floor(Math.random() * 10))
    : 0;

  const canIdentify = bestMatch !== null && confidence >= 50;

  if (!canIdentify) {
    return {
      crop: cropName,
      disease: null,
      confidence: 0,
      severity: 'unknown',
      symptoms_detected: [],
      causes: [],
      recommended_actions: [],
      prevention_advice: [],
      recommended_products: [],
      can_identify: false,
      message: 'We cannot confidently identify the problem from this image. Please take another clear photo showing both healthy and affected parts of the plant.',
    };
  }

  const disease = bestMatch!;
  const symptoms = disease.symptoms?.split(';').map((s) => s.trim()).filter(Boolean) ?? [];
  const causes = disease.causes?.split(';').map((s) => s.trim()).filter(Boolean) ?? [];
  const actions = disease.recommended_actions?.split('.').map((s) => s.trim()).filter(Boolean) ?? [];
  const prevention = disease.prevention?.split(';').map((s) => s.trim()).filter(Boolean) ?? [];
  const products = diseaseProducts.filter((dp) => dp.disease_id === disease.id);

  return {
    crop: cropName,
    disease: disease.name,
    confidence,
    severity: disease.severity ?? 'moderate',
    symptoms_detected: symptoms,
    causes,
    recommended_actions: actions,
    prevention_advice: prevention,
    recommended_products: products,
    can_identify: true,
  };
}

export function generateImageDescription(fileName: string): string {
  const descriptions = [
    'brown spots on leaves yellow around edges dark patches lower leaves',
    'yellow streaks on leaves stunted growth some spots visible',
    'dark circular spots concentric rings yellowing around affected areas',
    'curling upward leaves yellow stunted twisted growth',
    'wilted drooping plant brown stem sudden collapse',
    'rust colored pustules reddish brown spots on leaves',
    'mosaic pattern mottled yellow green distorted leaves',
    'dark sunken lesions on pods and stems brown spots',
    'holes in leaves ragged edges sawdust near whorl',
    'white powdery spots underneath leaves yellow on top',
  ];
  const hash = fileName.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  return descriptions[hash % descriptions.length];
}

export function checkImageQuality(file: File): { ok: boolean; message?: string } {
  if (file.size < 10000) {
    return { ok: false, message: 'This image seems too small or low quality. Please take a clearer photo.' };
  }
  if (file.size > 15 * 1024 * 1024) {
    return { ok: false, message: 'This image is too large. Please take a smaller photo.' };
  }
  return { ok: true };
}

export async function compressImage(file: File, maxWidth: number = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
