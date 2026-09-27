import { ItemReport, MatchItem, VerificationCase, AuditEvent, Message } from '../types';
import { api } from './api';

// Local storage keys
const REPORTS_KEY = 'sahayak_reports';
const MATCHES_KEY = 'sahayak_matches';
const CASES_KEY = 'sahayak_cases';
const AUDIT_KEY = 'sahayak_audit';

// Helper to safely get from localStorage
function getLocal<T>(key: string, fallback: T): T {
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

function setLocal<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Reports Service
export const reportsService = {
  getReports: (): ItemReport[] => {
    return getLocal<ItemReport[]>(REPORTS_KEY, []);
  },

  getAll: async (params?: { reporter_id?: string; type?: string; category?: string; status?: string; search?: string }): Promise<ItemReport[]> => {
    try {
      const liveReports = await api.reports.list(params);
      if (liveReports && Array.isArray(liveReports)) {
        if (!params || Object.keys(params).length === 0) {
          setLocal(REPORTS_KEY, liveReports);
        }
        return liveReports;
      }
    } catch (err) {
      console.warn('Could not fetch live reports from backend:', err);
    }
    const local = reportsService.getReports();
    if (!params) return local;
    return local.filter(r => {
      if (params.reporter_id && r.reporterId !== params.reporter_id && r.reporterUSN !== params.reporter_id && r.reporterName !== params.reporter_id) {
        return false;
      }
      if (params.type && r.type !== params.type) return false;
      if (params.status && r.status !== params.status) return false;
      return true;
    });
  },

  getMyReports: async (userId?: string, usn?: string): Promise<ItemReport[]> => {
    if (!userId && !usn) {
      return [];
    }
    try {
      if (userId) {
        const live = await api.reports.list({ reporter_id: userId });
        if (Array.isArray(live)) return live;
      }
    } catch (err) {
      console.warn('Live getMyReports error:', err);
    }
    const local = reportsService.getReports();
    return local.filter(r => (userId && r.reporterId === userId) || (usn && r.reporterUSN === usn));
  },

  getReportById: (id: string): ItemReport => {
    const reports = reportsService.getReports();
    const found = reports.find(r => 
      r.id === id || 
      r.id.toLowerCase() === id.toLowerCase() ||
      r.id.includes(id) ||
      id.includes(r.id)
    );
    return found || reports[0];
  },

  getById: async (id: string): Promise<ItemReport> => {
    try {
      const live = await api.reports.get(id);
      if (live) return live;
    } catch (err) {
      console.warn('Could not fetch live report, using local cache:', err);
    }
    return reportsService.getReportById(id);
  },

  createReport: async (reportData: Partial<ItemReport>, imageFile?: File | null): Promise<ItemReport> => {
    const reports = reportsService.getReports();
    const tempId = `rep_${Date.now().toString().slice(-4)}`;
    let finalId = tempId;
    let finalImageUrl = reportData.images && reportData.images.length > 0 
      ? reportData.images[0].url 
      : '';

    try {
      // 1. Create Report in FastAPI Backend DB
      const backendPayload = {
        report_type: reportData.type || 'LOST',
        title: reportData.title || 'Untitled Item',
        category: reportData.category || 'OTHER',
        description: reportData.description || '',
        incident_place: reportData.incidentPlace || 'Sir MV Block',
        current_location: reportData.currentLocation || 'NIE Main Security Desk Locker',
        event_date: reportData.incidentDate || new Date().toISOString().split('T')[0],
        event_time: reportData.incidentTime || '12:00',
        brand: reportData.brand,
        color: reportData.color,
        material: reportData.material,
        size: reportData.size,
        distinguishing_marks: reportData.distinguishingFeatures,
        is_anonymous: reportData.isAnonymous || false
      };

      const res = await api.reports.create(backendPayload);
      if (res && res.id) {
        finalId = res.id;
      }

      // 2. Upload actual image file if provided
      if (imageFile && finalId) {
        try {
          const imgRes = await api.reports.uploadImage(finalId, imageFile, true);
          if (imgRes && imgRes.url) {
            finalImageUrl = imgRes.url;
          }
        } catch (imgErr) {
          console.warn('Image upload error:', imgErr);
        }
      }
    } catch (apiErr) {
      console.warn('Backend report creation notice:', apiErr);
    }

    const tag = (reportData.type || 'LOST').toUpperCase().slice(0, 3);
    const trackingNumber = `NIE-${tag}-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const antiFraudCode = `SEC-${Math.floor(100000 + Math.random() * 900000)}`;

    const newReport: ItemReport = {
      id: finalId,
      type: reportData.type || 'LOST',
      trackingNumber: trackingNumber,
      antiFraudCode: antiFraudCode,
      securityClaimPin: antiFraudCode,
      title: reportData.title || 'Untitled Item',
      category: reportData.category || 'OTHER',
      description: reportData.description || '',
      incidentPlace: reportData.incidentPlace || 'Sir MV Block',
      currentLocation: reportData.currentLocation || 'NIE Main Security Desk Locker',
      incidentDate: reportData.incidentDate || new Date().toISOString().split('T')[0],
      incidentTime: reportData.incidentTime || '12:00',
      images: finalImageUrl ? [
        {
          id: `img-${Date.now()}`,
          url: finalImageUrl,
          source: (reportData.images?.[0]?.source as any) || 'USER_UPLOADED',
          uploadedAt: new Date().toISOString()
        }
      ] : [],
      status: reportData.status || 'SUBMITTED',
      reporterId: reportData.reporterId || '',
      reporterName: reportData.reporterName || 'Student',
      reporterUSN: reportData.reporterUSN || '',
      brand: reportData.brand,
      color: reportData.color,
      serialNumber: reportData.serialNumber,
      distinguishingFeatures: reportData.distinguishingFeatures,
      isAnonymous: reportData.isAnonymous || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updated = [newReport, ...reports];
    setLocal(REPORTS_KEY, updated);

    // Audit log
    auditService.logEvent({
      eventType: 'REPORT_CREATED',
      actorName: newReport.reporterName,
      actor: newReport.reporterName,
      status: 'SUCCESS',
      caseId: newReport.id,
      description: `New ${newReport.type} report registered in database: ${newReport.title} at ${newReport.incidentPlace}`
    });

    return newReport;
  },

  updateStatus: (id: string, status: string): ItemReport | undefined => {
    const reports = reportsService.getReports();
    const idx = reports.findIndex(r => r.id === id || r.id.includes(id));
    if (idx !== -1) {
      reports[idx].status = status;
      reports[idx].updatedAt = new Date().toISOString();
      setLocal(REPORTS_KEY, reports);

      // Async backend status transition
      api.reports.updateStatus(id, status).catch(e => console.warn('Status sync notice:', e));
      return reports[idx];
    }
    return undefined;
  }
};

// Multi-Signal Matching Service
export const matchingService = {
  getMatches: (): MatchItem[] => {
    return getLocal<MatchItem[]>(MATCHES_KEY, []);
  },

  getAll: async (): Promise<MatchItem[]> => {
    try {
      const data = await api.matches.list();
      if (Array.isArray(data)) {
        setLocal(MATCHES_KEY, data);
        return data;
      }
    } catch (err) {
      console.warn('Failed to fetch live matches:', err);
    }
    return matchingService.getMatches();
  },

  rescanMatches: async (): Promise<MatchItem[]> => {
    try {
      const data = await api.matches.scan();
      if (Array.isArray(data)) {
        setLocal(MATCHES_KEY, data);
        return data;
      }
    } catch (err) {
      console.warn('Failed to trigger live match scan:', err);
    }
    return matchingService.getAll();
  },

  getMatchById: async (id: string): Promise<MatchItem | undefined> => {
    try {
      const data = await api.matches.get(id);
      if (data && data.id) {
        return data as MatchItem;
      }
    } catch (err) {
      console.warn('Direct match fetch note:', err);
    }
    const matches = matchingService.getMatches();
    return matches.find(m => 
      m.id === id || 
      m.id.toLowerCase() === id.toLowerCase() ||
      m.id.includes(id) ||
      id.includes(m.id) ||
      m.lostReport?.id === id ||
      m.foundReport?.id === id
    );
  }
};

// Verification & Case Service
export const verificationService = {
  getCases: (): VerificationCase[] => {
    return getLocal<VerificationCase[]>(CASES_KEY, []);
  },

  getAllCases: async (): Promise<VerificationCase[]> => {
    try {
      const data = await api.verification.listCases();
      if (Array.isArray(data)) {
        setLocal(CASES_KEY, data);
        return data;
      }
    } catch (err) {
      console.warn('Failed to fetch live cases:', err);
    }
    return verificationService.getCases();
  },

  getCaseById: (id: string): VerificationCase | undefined => {
    const cases = verificationService.getCases();
    const found = cases.find(c => 
      c.id === id || 
      c.id.toLowerCase() === id.toLowerCase() ||
      c.matchId === id || 
      c.reportId === id ||
      c.id.includes(id)
    );
    return found;
  },

  submitVerification: (matchOrReportId: string, clues: string[]): VerificationCase => {
    const cases = verificationService.getCases();
    const newCase: VerificationCase = {
      id: `c-${Date.now().toString().slice(-3)}`,
      matchId: matchOrReportId,
      reportId: matchOrReportId,
      claimantName: 'Student Claimant',
      claimantUSN: 'NIE-STUDENT',
      answersSubmitted: clues.length > 0 ? clues : ['Confidential identifying marks submitted'],
      status: 'UNDER_REVIEW',
      handoverLocation: 'NIE Main Security Desk Locker',
      createdAt: new Date().toISOString()
    };

    const updated = [newCase, ...cases];
    setLocal(CASES_KEY, updated);

    auditService.logEvent({
      eventType: 'VERIFICATION_ATTEMPT',
      actor: 'Student Claimant',
      caseId: newCase.id,
      status: 'SUCCESS',
      description: `Claimant submitted confidential verification clues for case #${newCase.id}`
    });

    return newCase;
  },

  verifyCase: (caseId: string, officerId: string = 'SEC-01', otp: string = 'NIE-8842'): VerificationCase => {
    const cases = verificationService.getCases();
    const idx = cases.findIndex(c => c.id === caseId || c.matchId === caseId);
    if (idx !== -1) {
      cases[idx].status = 'VERIFIED';
      cases[idx].handoverOtp = otp;
      cases[idx].handoverStatus = 'SCHEDULED';
      cases[idx].assignedStaff = officerId;
      setLocal(CASES_KEY, cases);

      auditService.logEvent({
        eventType: 'VERIFICATION_APPROVED',
        actor: `Officer ${officerId} (NIE Security)`,
        caseId: caseId,
        status: 'SUCCESS',
        description: `Ownership confirmed. Issued OTP ${otp} for locker pickup.`
      });

      return cases[idx];
    }
    return cases[0];
  },

  completeHandover: (caseId: string): VerificationCase => {
    const cases = verificationService.getCases();
    const idx = cases.findIndex(c => c.id === caseId || c.matchId === caseId);
    if (idx !== -1) {
      cases[idx].status = 'COMPLETED';
      cases[idx].handoverStatus = 'COMPLETED';
      setLocal(CASES_KEY, cases);

      auditService.logEvent({
        eventType: 'HANDOVER_COMPLETED',
        actor: 'Security Desk #1 Officer',
        caseId: caseId,
        status: 'SUCCESS',
        description: `Handover signed off and item released to verified owner.`
      });

      return cases[idx];
    }
    return cases[0];
  }
};

// Audit Service
export const auditService = {
  getEvents: (): AuditEvent[] => {
    return getLocal<AuditEvent[]>(AUDIT_KEY, []);
  },

  getRecentLogs: (): AuditEvent[] => {
    return auditService.getEvents();
  },

  logEvent: (eventData: Partial<AuditEvent>): AuditEvent => {
    const events = auditService.getEvents();
    const newEvent: AuditEvent = {
      id: `aud-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      eventType: eventData.eventType || 'SYSTEM_ACTION',
      actor: eventData.actor || eventData.actorName || 'System Service',
      actorName: eventData.actorName || eventData.actor || 'System Service',
      caseId: eventData.caseId,
      status: eventData.status || 'SUCCESS',
      description: eventData.description || 'System event recorded'
    };

    setLocal(AUDIT_KEY, [newEvent, ...events]);
    return newEvent;
  }
};

// AI Campus Assistant Service
export const assistantService = {
  generateReportDescription: async (title: string, category: string, location: string): Promise<string> => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          incidentPlace: location
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.enhanced_description) {
          return json.data.enhanced_description;
        }
      }
    } catch (e) {
      // Fallback
    }
    return `Misplaced item: ${title} (${category.replace('_', ' ')}) near ${location}. In good condition with standard distinguishing markings. Please contact NIE Proctor office for verification.`;
  },

  askQuestion: async (query: string): Promise<string> => {
    try {
      const res = await fetch('http://localhost:8000/api/v1/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.reply) {
          return json.data.reply;
        }
      }
    } catch (e) {
      // Fallback
    }
    const lower = query.toLowerCase();
    if (lower.includes('where') || lower.includes('locker') || lower.includes('security') || lower.includes('desk')) {
      return 'Official NIE North Campus collection and handover points are located at:\n1. Main Security Desk (Ground Floor, Main Entrance Gate) - Open 24/7\n2. Sir MV Block Department Proctor Office (Room 102)\n3. Central Library Circulation Helpdesk\n4. North Canteen Security Desk.';
    }
    if (lower.includes('verify') || lower.includes('proof') || lower.includes('claim')) {
      return 'To verify ownership:\n1. Open your match in the AI Match Radar.\n2. Click "Verify My Ownership".\n3. Answer confidential questions (such as wallpaper photo, secret scratch marks, or exact loss scenario).\n4. Once reviewed by NIE Security/Proctor, you will receive a secure OTP to collect the item.';
    }
    if (lower.includes('point') || lower.includes('reward') || lower.includes('points') || lower.includes('samaritan')) {
      return 'Good Samaritan points are awarded for verified returns:\n- Reporting found items: +30 Points\n- Successful proctor-verified handover: +50 Points\nPoints can be redeemed for NIE Cafeteria vouchers, extended library privileges, and official Dean of Student Affairs certificates.';
    }
    return 'Thank you for asking SAHAYAK. You can report lost or found items directly from the student dashboard, track live AI similarity scores in the Match Radar, or visit the NIE North Main Security Desk for assistance.';
  }
};

