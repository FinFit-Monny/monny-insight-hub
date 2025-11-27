import { apiPost } from "@/api/client";

// =============================================================================
// Voucher Whitelist (POST /voucher-whitelist)
// =============================================================================

export interface CreateVoucherUploadPayload {
  userId: string;
  emails: string[];
}

export interface VoucherUploadResponse {
  companyName: string;
  voucherCode: string | null;
  uploadId: number;
  createdAt: string | null;
  counts: {
    totalValid: number;
    totalInvalid: number;
    totalDuplicates: number;
  };
  newEntries: number;
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

// =============================================================================
// Voucher Codes (POST /voucher-codes)
// =============================================================================

export type VoucherCode = {
  code: string;
  used: boolean;
  usedAt?: string | null;
};

export type VoucherCodeBatch = {
  id: string;
  label?: string;
  createdAt: string | null;
  expiresAt?: string | null;
  prefix?: string | null;
  length: number;
  excludeAmbiguous: boolean;
  ensureGlobalUnique: boolean;
  count: number;
  codes: VoucherCode[];
};

export interface CreateVoucherCodeBatchPayload {
  userId: string;
  label?: string;
  count: number;
  length: number;
  prefix?: string;
  excludeAmbiguous?: boolean;
  ensureGlobalUnique?: boolean;
  expiresAt?: string | null;
}

export async function createVoucherCodeBatch(
  payload: CreateVoucherCodeBatchPayload,
  authToken?: string | null,
): Promise<VoucherCodeBatch> {
  return apiPost<VoucherCodeBatch>("/voucher-codes", {
    body: JSON.stringify({ action: "create_batch", ...payload }),
    authToken: authToken ?? null,
  });
}

export async function getVoucherCodeBatches(
  userId: string,
  authToken?: string | null,
): Promise<VoucherCodeBatch[]> {
  const res = await apiPost<{ batches: VoucherCodeBatch[] }>("/voucher-codes", {
    body: JSON.stringify({ action: "list_batches", userId }),
    authToken: authToken ?? null,
  });
  return res.batches ?? [];
}

export interface ToggleVoucherCodeUsedPayload {
  userId: string;
  batchId: string;
  code: string;
}

export async function toggleVoucherCodeUsed(
  payload: ToggleVoucherCodeUsedPayload,
  authToken?: string | null,
): Promise<VoucherCodeBatch> {
  return apiPost<VoucherCodeBatch>("/voucher-codes", {
    body: JSON.stringify({ action: "toggle_used", ...payload }),
    authToken: authToken ?? null,
  });
}
