// QLens 공용 타입 정의
// DB 타입은 추후 supabase gen types로 교체 가능

export interface Organization {
  id: string;
  name: string;
  plan: "free" | "pro" | "enterprise";
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  default_org_id: string | null;
  created_at: string;
}

export interface Membership {
  id: string;
  org_id: string;
  user_id: string;
  role: "owner" | "admin" | "analyst" | "viewer";
  created_at: string;
}

export interface Product {
  id: string;
  org_id: string;
  name: string;
  code: string | null;
  description: string | null;
  created_at: string;
}

export interface ProductSize {
  id: string;
  product_id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface SpecPoint {
  id: string;
  product_size_id: string;
  point_index: number;
  label: string;
  is_length: boolean;
  nominal: number | null;
  usl: number | null;
  lsl: number | null;
  unit: string;
}

export interface Batch {
  id: string;
  org_id: string;
  product_size_id: string;
  source_file: string | null;
  instrument: string | null;
  measured_at: string | null;
  uploaded_by: string | null;
  status: "processing" | "ready" | "failed";
  row_count: number;
  rejected_count: number;
  created_at: string;
}

export interface Measurement {
  id: string;
  batch_id: string;
  sample_no: number;
  length: number | null;
  is_flagged: boolean;
  created_at: string;
}

export interface MeasurementPoint {
  id: number;
  measurement_id: string;
  point_index: number;
  value: number;
}

export interface PointStats {
  point_index: number;
  label: string;
  n: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  nominal: number | null;
  usl: number | null;
  lsl: number | null;
  cp: number | null;
  cpk: number | null;
  oos_count: number;
}

export interface Anomaly {
  measurement_id: string;
  sampleNo: number;
  pointIndex: number;
  label: string;
  value: number;
  reason: string;
  deviationSigma: number | null;
}
