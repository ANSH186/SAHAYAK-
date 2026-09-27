export interface BoundingBox {
  xmin: number;
  ymin: number;
  xmax: number;
  ymax: number;
  width?: number;
  height?: number;
}

export interface DetectionResult {
  category: string;
  confidence: number;
  bbox: BoundingBox;
  is_fallback: boolean;
  raw_class_name?: string;
}

export interface ImageHashes {
  phash: string;
  dhash: string;
  ahash: string;
}

export interface ORBFeatures {
  keypoint_count: number;
  descriptors_b64?: string | null;
}

export interface VisualEmbedding {
  model: string;
  dimension: number;
  vector: number[];
}

export interface ProcessedItem {
  detection: DetectionResult;
  hashes: ImageHashes;
  orb: ORBFeatures;
  embedding: VisualEmbedding;
  description?: string;
  color_distribution?: Record<string, number>;
}

export interface ImageProcessingResponse {
  success: boolean;
  filename?: string | null;
  width: number;
  height: number;
  items: ProcessedItem[];
  device: string;
}

export interface MatchSignals {
  clip_similarity: number;
  description_similarity?: number;
  hash_similarity: number;
  orb_inliers_score: number;
  category_match: number;
  class_penalty?: number;
  overall_confidence: number;
}

export interface ComparisonResult {
  match: boolean;
  confidence: number;
  verdict: 'MATCH' | 'POSSIBLE_MATCH' | 'NO_MATCH' | 'CLASS_MISMATCH_PENALTY';
  description_a?: string;
  description_b?: string;
  class_compatible?: boolean;
  signals: MatchSignals;
  reasons: string[];
}

export interface CandidatePayload {
  id: string;
  title: string;
  category: string;
  features: ProcessedItem;
}

export interface RankedMatch {
  candidate_id: string;
  title: string;
  confidence: number;
  verdict: string;
  signals: MatchSignals;
  reasons: string[];
}

export interface MultiMatchResponse {
  query_category: string;
  matches: RankedMatch[];
}
