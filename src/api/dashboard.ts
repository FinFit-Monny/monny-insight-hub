import { apiGet } from "@/api/client";
import type { DashboardResponse } from "@/types/dashboard";

export async function getDashboardData(userId: string, authToken?: string | null) {
  const params = new URLSearchParams({ userId });
  return apiGet<DashboardResponse>(`/get-company-dashboard-data?${params.toString()}`, {
    authToken: authToken ?? null,
  });
}


