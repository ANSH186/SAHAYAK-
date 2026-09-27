/**
 * SAHAYAK Frontend API Client
 * Seamlessly interfaces with the FastAPI Python Backend (/api/v1)
 * with robust local fallback for resilient dev experience.
 */

const PRIMARY_API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';
const FALLBACK_API_BASES = ['http://127.0.0.1:8000/api/v1', 'http://localhost:8000/api/v1'];

export interface ApiResponseEnvelope<T> {
  data: T | null;
  error: { code: string; message: string } | null;
  meta: Record<string, any>;
}

// Token helper
export function getAuthToken(): string | null {
  return localStorage.getItem('sahayak_token') || sessionStorage.getItem('sahayak_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('sahayak_token', token);
}

export function removeAuthToken() {
  localStorage.removeItem('sahayak_token');
  sessionStorage.removeItem('sahayak_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const baseHeaders: Record<string, string> = {};

  if (!(options.body instanceof FormData)) {
    baseHeaders['Content-Type'] = 'application/json';
  }
  if (token) {
    baseHeaders['Authorization'] = `Bearer ${token}`;
  }

  const customHeaders = options.headers instanceof Headers
    ? Object.fromEntries(options.headers.entries())
    : (options.headers as Record<string, string>) || {};

  const mergedHeaders = { ...baseHeaders, ...customHeaders };

  const urlsToTry = [
    `${PRIMARY_API_BASE}${endpoint}`,
    ...FALLBACK_API_BASES.map(b => `${b}${endpoint}`)
  ];

  let lastError: any = null;

  for (const url of urlsToTry) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: mergedHeaders
      });

      const json: ApiResponseEnvelope<T> = await response.json();

      if (!response.ok || json.error) {
        const errorMsg = json.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMsg);
      }

      return json.data as T;
    } catch (err: any) {
      lastError = err;
      // If it was a 4xx HTTP response with valid JSON error, don't retry other hosts
      if (err.message && (err.message.includes('Invalid') || err.message.includes('HTTP 4') || err.message.includes('already exists'))) {
        throw err;
      }
      // Otherwise continue to next fallback URL in case of CORS or connection issue
    }
  }

  throw lastError || new Error('Unable to connect to SAHAYAK Backend API');
}

export const api = {
  // Health
  health: () => request<{ status: string; version: string }>('/health'),

  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<{ access_token: string; user: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    adminLogin: (credentials: { email: string; password: string }) =>
      request<{ access_token: string; user: any }>('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    register: (studentData: any) =>
      request<{ access_token: string; user: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(studentData)
      }),
    me: () => request<any>('/auth/me')
  },

  // Users
  users: {
    getProfile: () => request<any>('/users/profile'),
    updateProfile: (profileData: any) =>
      request<any>('/users/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileData)
      })
  },

  // Reports
  reports: {
    list: (params?: { type?: string; category?: string; status?: string; search?: string; reporter_id?: string }) => {
      const cleanParams: Record<string, string> = {};
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            cleanParams[k] = String(v);
          }
        });
      }
      const q = new URLSearchParams(cleanParams).toString();
      return request<any[]>(`/reports${q ? `?${q}` : ''}`);
    },
    get: (id: string) => request<any>(`/reports/${id}`),
    create: (reportData: any) =>
      request<any>('/reports', {
        method: 'POST',
        body: JSON.stringify(reportData)
      }),
    uploadImage: async (reportId: string, file: File, isPrimary: boolean = true) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('is_primary', String(isPrimary));
      return request<any>(`/reports/${reportId}/images`, {
        method: 'POST',
        body: formData
      });
    },
    updateStatus: (id: string, status: string, notes?: string) =>
      request<any>(`/reports/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ new_status: status, notes })
      })
  },

  // Matches
  matches: {
    list: (reportId?: string) =>
      request<any[]>(`/matches${reportId ? `?report_id=${reportId}` : ''}`),
    get: (id: string) => request<any>(`/matches/${id}`),
    scan: () =>
      request<any[]>('/matches/scan', {
        method: 'POST'
      })
  },

  // Verification
  verification: {
    listCases: () => request<any[]>('/verification/cases'),
    getCase: (id: string) => request<any>(`/verification/cases/${id}`),
    initiate: (matchId: string) =>
      request<any>(`/verification/initiate?match_id=${matchId}`, {
        method: 'POST'
      }),
    submitAnswers: (caseId: string, answers: string[]) =>
      request<any>(`/verification/cases/${caseId}/answers`, {
        method: 'POST',
        body: JSON.stringify({ case_id: caseId, answers })
      }),
    manualReview: (caseId: string, decision: string, notes: string) =>
      request<any>(`/verification/cases/${caseId}/manual-review`, {
        method: 'POST',
        body: JSON.stringify({ decision, staff_notes: notes })
      })
  },

  // Handover
  handover: {
    get: (caseId: string) => request<any>(`/handover/${caseId}`),
    schedule: (data: any) =>
      request<any>('/handover/schedule', {
        method: 'POST',
        body: JSON.stringify(data)
      }),
    confirm: (caseId: string, actionType: string, otp?: string) =>
      request<any>('/handover/confirm', {
        method: 'POST',
        body: JSON.stringify({ case_id: caseId, action_type: actionType, otp_code: otp })
      })
  },

  // Messages
  messages: {
    getCaseMessages: (caseId: string) => request<any[]>(`/messages/${caseId}`),
    send: (caseId: string, content: string) =>
      request<any>('/messages', {
        method: 'POST',
        body: JSON.stringify({ case_id: caseId, content })
      })
  },

  // Rewards & Leaderboard
  rewards: {
    getBalance: () => request<any>('/rewards/balance'),
    getTransactions: () => request<any[]>('/rewards/transactions'),
    getMilestones: () => request<any[]>('/rewards/milestones'),
    getLeaderboard: () => request<any[]>('/rewards/leaderboard'),
    getCertificate: (certId: string) => request<any>(`/rewards/certificate/${certId}`)
  },

  // Notifications
  notifications: {
    list: () => request<any[]>('/notifications'),
    markRead: (id: string) =>
      request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllRead: () => request<any>('/notifications/read-all', { method: 'POST' })
  },

  // Locations & Campus Map
  locations: {
    list: () => request<any[]>('/locations'),
    heatmap: () => request<any>('/locations/heatmap')
  },

  // Admin APIs
  admin: {
    dashboard: () => request<any>('/admin/dashboard'),
    reports: () => request<any[]>('/admin/reports'),
    matches: () => request<any[]>('/admin/matches'),
    locations: () => request<any[]>('/admin/locations'),
    resolution: () => request<any>('/admin/resolution'),
    rewards: () => request<any[]>('/admin/rewards'),
    audit: () => request<any[]>('/admin/audit'),
    notifications: () => request<any[]>('/admin/notifications')
  },

  // Assistant & AI
  assistant: {
    chat: (message: string, context?: any) =>
      request<{ reply: string; suggestedActions: string[] }>('/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ message, context })
      }),
    describe: (facts: any) =>
      request<any>('/ai/describe', {
        method: 'POST',
        body: JSON.stringify(facts)
      })
  }
};
