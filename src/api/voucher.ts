import { apiPost } from "@/api/client";

// =============================================================================
// Voucher Whitelist (POST /voucher-whitelist)
// =============================================================================

export interface CreateVoucherUploadPayload {
  userId: string;
  emails?: string[];
  phones?: string[];
}

export interface VoucherUploadResponse {
  companyName: string;
  voucherCode: string | null;
  uploadId?: number;
  createdAt?: string | null;
  emailCounts?: {
    totalValid: number;
    totalInvalid: number;
    totalDuplicates: number;
    newEntries: number;
  };
  phoneCounts?: {
    totalValid: number;
    totalInvalid: number;
    totalDuplicates: number;
    newEntries: number;
  };
  // Legacy fields for backwards compatibility
  counts?: {
    totalValid: number;
    totalInvalid: number;
    totalDuplicates: number;
  };
  newEntries?: number;
}

export async function createVoucherUpload(
  payload: CreateVoucherUploadPayload,
  authToken?: string | null,
): Promise<VoucherUploadResponse> {
  return apiPost<VoucherUploadResponse>("/voucher-whitelist", {
    body: JSON.stringify({ action: "create_upload", ...payload }),
    authToken: authToken ?? null,
  });
}

export interface ValidateVoucherCodePayload {
  userId: string;
  voucherCode: string;
}

export interface ValidateVoucherCodeResponse {
  companyName: string;
  type: "whitelist" | "one_time";
  status: "eligible";
}

export async function validateVoucherCode(
  payload: ValidateVoucherCodePayload,
  authToken?: string | null,
): Promise<ValidateVoucherCodeResponse> {
  return apiPost<ValidateVoucherCodeResponse>("/voucher-whitelist", {
    body: JSON.stringify({ action: "validate", ...payload }),
    authToken: authToken ?? null,
  });
}

