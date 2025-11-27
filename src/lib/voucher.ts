import type { VoucherCode, VoucherCodeBatch } from "@/api/voucher";

export type { VoucherCode, VoucherCodeBatch } from "@/api/voucher";

// Legacy local-generation and persistence helpers have been removed in favour
// of backend-driven voucher management. This module now only provides export
// helpers that operate on the shared VoucherCodeBatch type.

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


