import {
  ImageProcessingResponse,
  ComparisonResult,
  MultiMatchResponse,
  ProcessedItem,
  CandidatePayload
} from './api-contracts';

const CANDIDATE_BASES = [
  '/api/v1',
  'http://127.0.0.1:8000/api/v1',
  'http://localhost:8000/api/v1'
];

export class VisionApiClient {
  private async fetchWithFallback(endpoint: string, options: RequestInit = {}): Promise<any> {
    let lastError: any = null;
    for (const base of CANDIDATE_BASES) {
      try {
        const url = `${base}${endpoint}`;
        const res = await fetch(url, options);
        if (res.ok) {
          return await res.json();
        }
        const errJson = await res.json().catch(() => ({}));
        const message = errJson.detail || errJson.error?.message || `HTTP ${res.status}`;
        lastError = new Error(message);
      } catch (err: any) {
        lastError = err;
      }
    }
    throw lastError || new Error(`Failed to communicate with vision API at ${endpoint}`);
  }

  /**
   * Process an image with YOLOv8, OpenCLIP, Hashes, and ORB
   */
  async processImage(file: File | Blob, compact: boolean = false): Promise<ImageProcessingResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return this.fetchWithFallback(`/vision/process?compact=${compact}`, {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Directly compare two images with multi-signal visual AI
   */
  async compareImages(fileA: File | Blob, fileB: File | Blob): Promise<ComparisonResult> {
    const formData = new FormData();
    formData.append('image_a', fileA);
    formData.append('image_b', fileB);

    return this.fetchWithFallback('/vision/compare', {
      method: 'POST',
      body: formData,
    });
  }

  /**
   * Rank candidate items against query item features
   */
  async matchCandidates(queryItem: ProcessedItem, candidates: CandidatePayload[]): Promise<MultiMatchResponse> {
    return this.fetchWithFallback('/vision/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query_item: queryItem,
        candidates: candidates,
      }),
    });
  }

  /**
   * Get loaded AI models and detection thresholds
   */
  async getModelMetadata(): Promise<any> {
    return this.fetchWithFallback('/vision/models', {
      method: 'GET'
    });
  }
}

export const visionApi = new VisionApiClient();

