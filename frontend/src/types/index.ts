// SAHAYAK TypeScript Domain Models & Interfaces

export type UserRole = 'student' | 'admin' | 'faculty' | 'security' | 'proctor' | 'CLAIMANT' | 'FINDER' | 'PROCTOR_ADMIN';

export type ReportType = 'LOST' | 'FOUND';

export type ItemCategory = 
  | 'ELECTRONICS'
  | 'DOCUMENTS_ID'
  | 'CALCULATORS'
  | 'KEYS'
  | 'BAGS_WALLETS'
  | 'ACCESSORIES'
  | 'BOOKS_NOTES'
  | 'OTHER'
  | 'Electronics & Gadgets'
  | 'College ID & Documents'
  | 'Wallets & Money'
  | 'Keys & Access Cards'
  | 'Backpacks & Bags'
  | 'Books & Notes'
  | 'Clothing & Accessories'
  | 'Sports & Equipment'
  | 'Water Bottles'
  | 'Other Belongings';

export type ReportStatus = 
  | 'SUBMITTED'
  | 'ACTIVE_SEARCHING'
  | 'MATCHED'
  | 'MATCH_SUGGESTED'
  | 'VERIFICATION_PENDING'
  | 'VERIFICATION_INCONCLUSIVE'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'VERIFIED_OWNER'
  | 'HANDOVER_SCHEDULED'
  | 'RETURNED'
  | 'SAFELY_RETURNED'
  | 'CLOSED';

export type HandoverMethod = 
  | 'NIE_LOST_AND_FOUND_OFFICE'
  | 'CAMPUS_SECURITY_MAIN_GATE'
  | 'DEPARTMENT_ADMIN_DESK'
  | 'DIRECT_AUTHORIZED_STUDENT_HANDOVER';

export type ImageSource = 'USER_CAPTURED' | 'USER_UPLOADED' | 'REFERENCE_IMAGE' | 'UNKNOWN';

export interface User {
  id: string;
  fullName?: string;
  name?: string;
  email: string;
  role?: UserRole | string;
  usn?: string;
  department?: string;
  branch?: string;
  semester?: number;
  section?: string;
  avatar?: string;
  avatarUrl?: string;
  points?: number;
  finderPoints?: number;
  recoveredCount?: number;
  phone?: string;
  emergencyContact?: string;
  badgeLevel?: string;
}

export interface StudentProfile extends User {
  academicYear?: string;
  emergencyContact?: string;
  branch?: string;
  notificationsEnabled?: boolean;
  emailAlertsEnabled?: boolean;
  privacyShieldActive?: boolean;
}

export interface AdminUser extends User {
  designation?: string;
  permissions?: string[];
}

export interface ItemImage {
  id: string;
  url: string;
  source: ImageSource;
  isPrimary?: boolean;
  isReference?: boolean;
  uploadedAt: string;
}

export interface CampusLocation {
  id: string;
  name: string;
  zone: string;
  building?: string;
  campus?: string;
  floor?: string;
  room?: string;
  latitude: number;
  longitude: number;
  itemCount?: number;
  hasCollectionDesk?: boolean;
}

export interface ItemReport {
  id: string;
  type: ReportType;
  title: string;
  category: ItemCategory | string;
  description: string;
  incidentDate?: string;
  incidentTime?: string;
  dateLostOrFound?: string;
  timeLostOrFound?: string;
  
  // Explicit Location Model separation
  incidentPlace: string;      // Where lost or found (e.g. Sir MV Block - 2nd Floor)
  currentLocation?: string;   // Where physically stored now (e.g. NIE Security Desk Locker #3)
  
  images: ItemImage[];
  status: ReportStatus | string;
  
  // Reporter info
  reporterId?: string;
  reporterName?: string;
  reporterUSN?: string;
  user?: User;
  isAnonymous?: boolean;
  
  brand?: string;
  color?: string;
  primaryColor?: string;
  material?: string;
  size?: string;
  distinguishingFeatures?: string;
  identifyingMarks?: string;
  serialNumber?: string;
  secretVerificationClue?: string;
  
  // Anti-Fraud & Verification Code
  trackingNumber?: string;
  antiFraudCode?: string;
  securityClaimPin?: string;
  
  rewardPointsEligible?: number;
  createdAt?: string;
  updatedAt?: string;
  matchedReportId?: string;
}

export interface MatchSignal {
  categoryMatch?: boolean;
  imageSimilarity?: number;
  imageSimilarityScore?: number;
  textSimilarity?: number;
  textSimilarityScore?: number;
  locationScore?: number;
  locationProximityScore?: number;
  timeScore?: number;
  timeProximityScore?: number;
  attributeMatchScore?: number;
  descriptionA?: string;
  descriptionB?: string;
  descriptionSimilarity?: number;
  classPenalty?: number;
  classCompatible?: boolean;
  reasons: string[];
}

export interface MatchItem {
  id: string;
  lostReport: ItemReport;
  foundReport: ItemReport;
  similarityScore: number;
  signals: MatchSignal;
  status: 'PENDING_REVIEW' | 'VERIFICATION_REQUESTED' | 'VERIFIED' | 'REJECTED' | 'INCONCLUSIVE' | string;
  suggestedAt?: string;
  matchClues?: string[];
}

export interface VerificationQuestion {
  id: string;
  question: string;
  providedAnswer?: string;
  isVerified?: boolean;
}

export interface VerificationCase {
  id: string;
  matchId?: string;
  reportId?: string;
  lostReportId?: string;
  foundReportId?: string;
  claimantId?: string;
  claimantName?: string;
  claimantUSN?: string;
  claimantUser?: User;
  finderUser?: User;
  questions?: VerificationQuestion[];
  answersSubmitted?: string[];
  status: 'AWAITING_CLAIMANT' | 'UNDER_AI_CHECK' | 'MANUAL_STAFF_REVIEW' | 'OWNERSHIP_CONFIRMED' | 'CLAIM_DENIED' | 'UNDER_REVIEW' | 'VERIFIED' | 'PENDING' | string;
  handoverStatus?: 'PENDING' | 'SCHEDULED' | 'COMPLETED' | string;
  handoverOtp?: string;
  handoverLocation?: string;
  confidenceRating?: 'High' | 'Moderate' | 'Inconclusive' | 'Flagged' | string;
  manualReviewNotes?: string;
  assignedStaff?: string;
  createdAt?: string;
}

export interface Message {
  id: string;
  caseId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole | string;
  content?: string;
  text?: string;
  timestamp: string;
  read?: boolean;
  isSystemMessage?: boolean;
}

export interface HandoverSchedule {
  id: string;
  caseId: string;
  method?: HandoverMethod | string;
  locationName: string;
  scheduledDate?: string;
  scheduledTimeWindow?: string;
  qrVerificationCode?: string;
  otpCode?: string;
  isFinderConfirmed?: boolean;
  isClaimantConfirmed?: boolean;
  isStaffWitnessed?: boolean;
  status?: 'SCHEDULED' | 'CHECKED_IN' | 'COMPLETED' | 'MISSED' | string;
  completedAt?: string;
}

export interface RewardTransaction {
  id: string;
  userId?: string;
  caseId?: string;
  points: number;
  reason: string;
  badgeAwarded?: string;
  timestamp?: string;
  date?: string;
}

export interface LeaderboardEntry {
  rank: number;
  studentId?: string;
  studentName?: string;
  usn?: string;
  user?: User;
  avatar?: string;
  points: number;
  recoveriesCount?: number;
  recoveredCount?: number;
  streakDays?: number;
  department: string;
  isCurrentUser?: boolean;
}

export interface AppNotification {
  id: string;
  userId?: string;
  type: 'MATCH' | 'VERIFICATION' | 'HANDOVER' | 'REWARD' | 'SYSTEM' | 'MATCH_FOUND' | 'VERIFICATION_UPDATE' | 'HANDOVER_ALERT' | 'MESSAGE_RECEIVED' | 'REWARD_EARNED';
  title: string;
  message: string;
  linkUrl?: string;
  link?: string;
  read?: boolean;
  isRead?: boolean;
  needsAction?: boolean;
  timestamp: string;
}

export type NotificationItem = AppNotification;

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: 'REPORT_CREATED' | 'MATCH_GENERATED' | 'VERIFICATION_ATTEMPT' | 'HANDOVER_COMPLETED' | 'ADMIN_OVERRIDE' | 'SETTINGS_CHANGED' | string;
  actor?: string;
  actorName?: string;
  actorRole?: UserRole | string;
  caseId?: string;
  status: 'SUCCESS' | 'WARNING' | 'FLAGGED' | string;
  description: string;
}
