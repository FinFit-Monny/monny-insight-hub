import { useQuery } from "@tanstack/react-query";
import { useAuth, useUser } from "@clerk/clerk-react";
import { getDashboardData } from "@/api/dashboard";
import type {
  DashboardResponse,
  DashboardViewModel,
  MoodScoreKey,
  VoucherDashboardData,
} from "@/types/dashboard";
import { useMemo } from "react";

function isNotAdmin(data: DashboardResponse | undefined): boolean {
  if (!data) return false;
  return data.is_admin === "false" || data.is_admin === false;
}

function toViewModel(data: DashboardResponse | undefined): DashboardViewModel | null {
  if (!data) return null;
  if (isNotAdmin(data)) return null;
  
  // Ensure all required fields exist
  if (!data.companyInfo || !data.userGrowthChart || !data.enrolmentRate || 
      !data.coachingSessions || !data.moodCheckChart || !data.statCards) {
    return null;
  }

  const voucher: VoucherDashboardData = data.voucher ?? {
    whitelist: {
      voucherCode: null,
      uploads: [],
    },
    unique: {
      batches: [],
    },
  };

  return {
    companyName: data.companyInfo.companyName || "",
    userGrowth: data.userGrowthChart,
    enrolment: data.enrolmentRate,
    coaching: data.coachingSessions,
    mood: data.moodCheckChart,
    stats: data.statCards,
    voucher,
  };
}

export function useDashboardViewModel() {
  const { user } = useUser();
  const { getToken, isLoaded } = useAuth();
  const userId = user?.id || "";

  const query = useQuery({
    queryKey: ["dashboard", userId],
    enabled: Boolean(userId) && isLoaded,
    queryFn: async () => {
      const token = await getToken().catch(() => null);
      const res = await getDashboardData(userId, token);
      return res;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const isNotAdminUser = useMemo(() => {
    return isNotAdmin(query.data);
  }, [query.data]);

  const viewModel: DashboardViewModel | null = useMemo(() => {
    return toViewModel(query.data);
  }, [query.data]);

  return {
    data: viewModel,
    isLoading: query.isLoading,
    isError: query.isError,
    isNotAdmin: isNotAdminUser,
    error: query.error as Error | null,
    refetch: query.refetch,
  };
}

export function mapMoodScoreCountsToChart(
  scoreCounts: Record<MoodScoreKey, number>,
  labels: { stressed: string; worried: string; confident: string; veryConfident: string },
) {
  return [
    { mood: "😰", label: labels.stressed, count: scoreCounts["1"], color: "hsl(var(--chart-5))" },
    { mood: "😟", label: labels.worried, count: scoreCounts["2"], color: "hsl(var(--chart-4))" },
    { mood: "😊", label: labels.confident, count: scoreCounts["3"], color: "hsl(var(--chart-3))" },
    { mood: "🤩", label: labels.veryConfident, count: scoreCounts["4"], color: "hsl(var(--chart-1))" },
  ];
}


