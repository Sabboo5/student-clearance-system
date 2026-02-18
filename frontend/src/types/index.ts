export type UserRole = 'student' | 'officer' | 'admin';

export type ClearanceStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentClearance {
  _id: string;
  department: string;
  status: ClearanceStatus;
  officer?: User;
  comment?: string;
  reviewedAt?: string;
  documents?: string[];
}

export interface ClearanceRequest {
  _id: string;
  student: User;
  academicYear: string;
  reason: string;
  departmentClearances: DepartmentClearance[];
  overallStatus: ClearanceStatus;
  submittedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  user: User;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: Pagination;
  unreadCount?: number;
}

export interface Analytics {
  overview: {
    totalStudents: number;
    totalOfficers: number;
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
  };
  departmentStats: Record<string, Record<string, number>>;
  recentRequests: ClearanceRequest[];
  monthlyStats: Array<{
    _id: { month: number; year: number };
    count: number;
    approved: number;
    rejected: number;
  }>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
}
