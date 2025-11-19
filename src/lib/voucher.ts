export type VoucherCode = {
  code: string;
  used: boolean;
  usedAt?: string;
};

export type VoucherCodeBatch = {
  id: string;
  label?: string;
  createdAt: string;
  expiresAt?: string | null;
  prefix?: string | null;
  length: number;
  excludeAmbiguous: boolean;
  ensureGlobalUnique: boolean;
  count: number;
  codes: VoucherCode[];
};

export type GenerateOptions = {
  label?: string;
  count: number;
  length: number;
  prefix?: string;
  excludeAmbiguous?: boolean;
  ensureGlobalUnique?: boolean;
  expiresAt?: string | null;
};

const STORAGE_KEY = "voucherCodeBatches";

export function getBatches(): VoucherCodeBatch[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as VoucherCodeBatch[]) : [];
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

export function saveBatches(batches: VoucherCodeBatch[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(batches));
  } catch {
    // ignore storage errors
  }
}

export function saveBatch(batch: VoucherCodeBatch) {
  const existing = getBatches();
  existing.push(batch);
  saveBatches(existing);
}

export function updateBatch(batchId: string, updater: (b: VoucherCodeBatch) => VoucherCodeBatch) {
  const existing = getBatches();
  const idx = existing.findIndex((b) => b.id === batchId);
  if (idx === -1) return;
  existing[idx] = updater(existing[idx]);
  saveBatches(existing);
}

export function toggleCodeUsed(batchId: string, code: string): VoucherCodeBatch | null {
  let updated: VoucherCodeBatch | null = null;
  updateBatch(batchId, (b) => {
    const copy = { ...b, codes: b.codes.map((c) => ({ ...c })) };
    const item = copy.codes.find((c) => c.code === code);
    if (item) {
      item.used = !item.used;
      item.usedAt = item.used ? new Date().toISOString() : undefined;
    }
    updated = copy;
    return copy;
  });
  return updated;
}

function randomCode(length: number, opts: { excludeAmbiguous: boolean }): string {
  const ambiguous = new Set(["O", "0", "I", "1", "L"]);
  const baseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ23456789"; // Crockford-like without 0/1 by default? keep then filter
  const letters = Array.from(baseChars).filter((ch) => (opts.excludeAmbiguous ? !ambiguous.has(ch) : true));
  let out = "";
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * letters.length);
    out += letters[idx];
  }
  return out;
}

export function generateVoucherCodes(options: GenerateOptions): VoucherCodeBatch {
  const {
    label,
    count,
    length,
    prefix,
    excludeAmbiguous = true,
    ensureGlobalUnique = true,
    expiresAt = null,
  } = options;

  const globalSet = new Set<string>();
  if (ensureGlobalUnique) {
    for (const batch of getBatches()) {
      for (const c of batch.codes) {
        globalSet.add(c.code);
      }
    }
  }

  const withinBatch = new Set<string>();
  const codes: VoucherCode[] = [];
  const normalizedPrefix = (prefix || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");

  while (codes.length < count) {
    const base = randomCode(length, { excludeAmbiguous });
    const code = normalizedPrefix ? `${normalizedPrefix}-${base}` : base;
    if (withinBatch.has(code)) continue;
    if (ensureGlobalUnique && globalSet.has(code)) continue;
    withinBatch.add(code);
    codes.push({ code, used: false });
  }

  const batch: VoucherCodeBatch = {
    id: crypto.randomUUID ? crypto.randomUUID() : `batch_${Date.now()}`,
    label,
    createdAt: new Date().toISOString(),
    expiresAt,
    prefix: normalizedPrefix || null,
    length,
    excludeAmbiguous,
    ensureGlobalUnique,
    count,
    codes,
  };
  return batch;
}

export function exportBatchCsv(batch: VoucherCodeBatch): Blob {
  const header = "code,used,usedAt\n";
  const lines = batch.codes.map((c) => `${c.code},${c.used ? "true" : "false"},${c.usedAt ?? ""}`).join("\n");
  return new Blob([header + lines], { type: "text/csv;charset=utf-8" });
}

export function exportBatchJson(batch: VoucherCodeBatch): Blob {
  return new Blob([JSON.stringify(batch, null, 2)], { type: "application/json;charset=utf-8" });
}

export function exportBatchExcel(batch: VoucherCodeBatch): Blob {
  // Simple HTML table with Excel-compatible MIME so it opens in Excel
  const rows = batch.codes
    .map((c) => `<tr><td>${c.code}</td><td>${c.used ? "true" : "false"}</td><td>${c.usedAt ?? ""}</td></tr>`)
    .join("");
  const html =
    `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>` +
    `<table border="1"><thead><tr><th>code</th><th>used</th><th>usedAt</th></tr></thead><tbody>${rows}</tbody></table>` +
    `</body></html>`;
  return new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


