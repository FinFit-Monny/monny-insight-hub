export interface CompanyInfo {
  companyName: string;
}

export interface UserGrowthPoint {
  month: string;
  users: number;
}

export interface UserGrowthChartData {
  monthlyData: UserGrowthPoint[];
  currentUsers: number;
  previousUsers: number;
  growthPercentage: number;
}

export interface EnrolmentRateData {
  totalEmployees: number;
  enrolledUsers: number;
  enrolmentPercentage: number;
}

export interface CoachingSessionsData {
  totalSessions: number;
}

export type MoodScoreKey = "1" | "2" | "3" | "4";

export interface MoodCheckChartData {
  scoreCounts: Record<MoodScoreKey, number>;
  totalResponses: number;
}

export interface StatCardsTotalUsers {
  value: string;
}

export interface StatCardsBankAccountsConnected {
  value: string; // percentage string e.g., "84.2%"
  subtitle: {
    count: string; // e.g., "4,118"
    description: string; // e.g., "of 4,890 users"
  };
}

export interface StatCardsMonthlyActiveUsers {
  value: string; // number string e.g., "3,892"
  subtitle: {
    percentage: string; // e.g., "79.6%"
    description: string; // e.g., "of total users"
  };
}

export interface StatCardsData {
  totalUsers: StatCardsTotalUsers;
  bankAccountsConnected: StatCardsBankAccountsConnected;
  monthlyActiveUsers: StatCardsMonthlyActiveUsers;
}

export interface VoucherUploadSummary {
  createdAt: string | null;
  totalValid: number;
  totalInvalid: number;
  totalDuplicates: number;
}

export interface VoucherDashboardData {
  whitelist: {
    voucherCode: string | null;
    uploads: VoucherUploadSummary[];
  };
}

export interface Metadata {
  lastUpdated: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  currency: string | null;
  timezone: string | null;
}

export interface DashboardResponse {
  is_admin?: string | boolean; // "false" or false if not admin
  companyInfo?: CompanyInfo;
  userGrowthChart?: UserGrowthChartData;
  enrolmentRate?: EnrolmentRateData;
  coachingSessions?: CoachingSessionsData;
  moodCheckChart?: MoodCheckChartData;
  statCards?: StatCardsData;
  metadata?: Metadata;
  voucher?: VoucherDashboardData;
}

// ViewModel types exposed to UI
export interface DashboardViewModel {
  companyName: string;
  userGrowth: UserGrowthChartData;
  enrolment: EnrolmentRateData;
  coaching: CoachingSessionsData;
  mood: MoodCheckChartData;
  stats: StatCardsData;
  voucher: VoucherDashboardData;
}


