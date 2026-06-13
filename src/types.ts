export type UserRole =
  | 'admin'
  | 'marketing_manager'
  | 'hr_manager'
  | 'academy_manager'
  | 'project_manager'
  | 'accountant'
  | 'coach'
  | 'employee'
  | 'client'
  | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  customPermissions: string[];
  password?: string;
  baseSalary?: number;
  hireDate?: string;
}

export interface LogEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface ClientCorp {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'active' | 'lead' | 'inactive';
  notes: string;
}

export interface Contract {
  id: string;
  clientId: string;
  title: string;
  value: number;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  fileUrl?: string;
}

export interface Proposal {
  id: string;
  clientId: string;
  title: string;
  technicalDetails: string;
  financialDetails: string;
  value: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
}

export interface MarketingCampaign {
  id: string;
  name: string;
  platform: 'facebook' | 'google' | 'instagram' | 'tiktok' | 'snapchat' | 'linkedin';
  budget: number;
  spent: number;
  leadsGenerated: number;
  status: 'planned' | 'active' | 'paused' | 'finished';
  contentUrl?: string;
  designUrl?: string;
  videoUrl?: string;
  leadsTarget?: number;
}

export interface AdPerformance {
  campaignId: string;
  impressions: number;
  clicks: number;
  conversions: number;
  reach: number;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  value: number;
  costEstimate: number;
  startDate: string;
  endDate: string;
  team: string[]; // User IDs
  progress: number; // 0 to 100
  timeSpent: number; // in hours
  status: 'planning' | 'active' | 'completed' | 'on_hold';
  files: Array<{ name: string; size: string; uploadedBy: string; url: string }>;
}

export interface ERPTask {
  id: string;
  projectId: string;
  title: string;
  assignedTo: string; // User ID
  dueDate: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  timeLogged: number; // in hours
}

export interface Course {
  id: string;
  title: string;
  coachId: string; // User ID
  description: string;
  price: number;
  duration: string;
  videos: Array<{ title: string; duration: string; url: string }>;
  files: Array<{ name: string; url: string }>;
  averageReview?: number;
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string; // User ID
  progress: number; // percentage
  grade?: number;
  certificateId?: string; // Verification code
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  questions: Array<{
    question: string;
    options: string[];
    answerIdx: number;
  }>;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  fileUrl: string;
  fileName: string;
  grade?: number;
  feedback?: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  latitude?: number;
  longitude?: number;
  remote: boolean;
  hours?: number;
  snapshots?: string[]; // optionally logs screenshot simulations
}

export interface LeaveRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved_level_1' | 'approved' | 'rejected';
  reason: string;
  type: 'sick' | 'annual' | 'casual';
  approverPath: string[]; // log of responses
}

export interface PerformanceReview {
  id: string;
  userId: string;
  period: string; // e.g., "June 2026", "Q2 2026"
  kpiScore: number; // 0 to 100
  okrsList: Array<{ objective: string; result: string; progress: number }>;
  quarterlyReview: string;
  managerRating: number; // 1 to 5
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: 'applied' | 'interview' | 'tested' | 'offered' | 'rejected';
  cvUrl?: string;
  testScore?: number;
  interviewNotes?: string;
}

export interface AccountLedger {
  id: string;
  type: 'revenue' | 'expense';
  category: 'salary' | 'marketing' | 'marketing_run' | 'subscription' | 'course_sell' | 'rent' | 'office' | 'penalty' | 'bonus' | 'commission' | 'tax' | 'other';
  amount: number;
  account: 'safe' | 'bank_ahli' | 'bank_cib';
  date: string;
  description: string;
  invoiceNo?: string;
  taxAmount?: number;
}

export interface CRMLead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'contact' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  value: number;
  source: string;
  timeline: Array<{
    type: 'call' | 'meeting' | 'email' | 'stage';
    date: string;
    notes: string;
  }>;
}

export interface ERPConfig {
  companyNameAr: string;
  companyNameEn: string;
  currency: string;
  taxRate: number;
  whatsAppNotifications: boolean;
  emailNotifications: boolean;
  backupStatus: string;
  lastBackupTime: string;
}

export type AuditLog = LogEntry;
