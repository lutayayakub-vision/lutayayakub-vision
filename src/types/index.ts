export type UserRole = 'farmer' | 'expert' | 'admin';

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  location: string | null;
  created_at: string;
}

export interface Crop {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Disease {
  id: string;
  crop_id: string | null;
  name: string;
  description: string | null;
  symptoms: string | null;
  causes: string | null;
  prevention: string | null;
  recommended_actions: string | null;
  severity: string | null;
  warning_notes: string | null;
  created_at: string;
}

export interface FarmerCrop {
  id: string;
  farmer_id: string;
  crop_id: string | null;
  crop_name: string;
  farm_name: string | null;
  planting_date: string | null;
  location: string | null;
  notes: string | null;
  photo_url: string | null;
  status: string;
  created_at: string;
}

export interface Diagnosis {
  id: string;
  farmer_id: string;
  crop_name: string;
  image_url: string | null;
  ai_result: string | null;
  confidence: number | null;
  severity: string | null;
  symptoms_detected: string | null;
  causes: string | null;
  recommended_actions: string | null;
  prevention_advice: string | null;
  expert_review_status: string;
  expert_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface ExpertRequest {
  id: string;
  farmer_id: string;
  expert_id: string | null;
  diagnosis_id: string | null;
  crop_name: string | null;
  question: string | null;
  status: string;
  created_at: string;
}

export interface Message {
  id: string;
  request_id: string;
  sender_id: string;
  receiver_id: string;
  body: string | null;
  image_url: string | null;
  created_at: string;
}

export interface AgriSupplier {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  website: string | null;
  created_at: string;
}

export interface AgriProduct {
  id: string;
  supplier_id: string | null;
  name: string;
  type: string;
  active_ingredient: string | null;
  description: string | null;
  application_rate: string | null;
  created_at: string;
}

export interface DiseaseProduct {
  id: string;
  disease_id: string;
  product_id: string;
  notes: string | null;
  product: AgriProduct | null;
  supplier: AgriSupplier | null;
  created_at: string;
}

export interface EducationalContent {
  id: string;
  title: string;
  crop_name: string | null;
  content: string | null;
  author: string | null;
  published: boolean;
  created_at: string;
}

export interface DiagnosisResult {
  crop: string;
  disease: string | null;
  confidence: number;
  severity: string;
  symptoms_detected: string[];
  causes: string[];
  recommended_actions: string[];
  prevention_advice: string[];
  recommended_products: DiseaseProduct[];
  can_identify: boolean;
  message?: string;
}
