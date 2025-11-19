import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Loader2, Copy as CopyIcon, Download, Printer, Check, Mail, Plus, Trash2 } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import {
  VoucherCodeBatch,
  generateVoucherCodes,
  getBatches,
  saveBatch,
  exportBatchCsv,
  exportBatchJson,
  exportBatchExcel,
  downloadBlob,
  toggleCodeUsed,
} from "@/lib/voucher";
import { isValidEmail } from "@/lib/email";

const VoucherCodes = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();

  const [label, setLabel] = useState("");
  const [count, setCount] = useState(50);
  // Hidden defaults
  const fixedLength = 5;
  const excludeAmbiguous = true;
  const ensureGlobalUnique = true;
  const [expiresAt, setExpiresAt] = useState<string>("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState<VoucherCodeBatch | null>(null);
  const [batches, setBatches] = useState<VoucherCodeBatch[]>([]);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [recipientInputs, setRecipientInputs] = useState<string[]>([]);

  useEffect(() => {
    setBatches(getBatches());
  }, []);

  const errors = useMemo(() => {
    const errs: Record<string, string> = {};
    if (!(count >= 1 && count <= 1000)) errs.count = t("voucher.codes.form.countError", "Count must be between 1 and 1000");
    return errs;
  }, [count, t]);

  const canGenerate = Object.keys(errors).length === 0;

  const onGenerate = async () => {
    if (!canGenerate) return;
    setIsGenerating(true);
    setGenerated(null);
    const options = {
      label: label || undefined,
      count,
      length: fixedLength,
      excludeAmbiguous,
      ensureGlobalUnique,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    };
    // Simulate processing emphasis
    setTimeout(() => {
      const batch = generateVoucherCodes(options);
      saveBatch(batch);
      setGenerated(batch);
      setBatches(getBatches());
      setIsGenerating(false);
      toast({
        title: t("voucher.codes.toasts.generatedTitle", "Codes generated"),
        description: t("voucher.codes.toasts.generatedDesc", "{{count}} codes in batch “{{label}}”", {
          count: batch.count,
          label: batch.label || batch.id.slice(0, 8),
        }),
      });
    }, 5000);
  };

  const copyAll = async (batch: VoucherCodeBatch) => {
    const text = batch.codes.map((c) => c.code).join("\n");
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      toast({ title: t("common.copied", "Copied!") });
    } catch {
      toast({ title: t("voucher.codes.toasts.copyError", "Could not copy. Please copy manually.") });
    }
  };

  const downloadCsv = (batch: VoucherCodeBatch) => {
    const blob = exportBatchCsv(batch);
    const name = `${batch.label || "voucher-codes"}-${batch.id.slice(0, 8)}.csv`;
    downloadBlob(blob, name);
  };

  const downloadJson = (batch: VoucherCodeBatch) => {
    const blob = exportBatchJson(batch);
    const name = `${batch.label || "voucher-codes"}-${batch.id.slice(0, 8)}.json`;
    downloadBlob(blob, name);
  };

  const printBatch = (batch: VoucherCodeBatch) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<pre>${batch.codes.map((c) => c.code).join("\n")}</pre>`);
    w.document.close();
    w.focus();
    w.print();
  };

  const systemEmail = user?.primaryEmailAddress?.emailAddress ?? "";
  const allEmails = useMemo(() => {
    const extras = recipientInputs.map((s) => s.trim()).filter(Boolean);
    return (systemEmail ? [systemEmail] : []).concat(extras);
  }, [systemEmail, recipientInputs]);

  const validEmails = useMemo(() => {
    return allEmails.map((e) => isValidEmail(e)).filter(Boolean) as string[];
  }, [allEmails]);

  const onSendEmails = async (batch: VoucherCodeBatch) => {
    const csv = exportBatchCsv(batch);
    const xls = exportBatchExcel(batch);
    const csvFile = new File([csv], `${batch.label || "voucher-codes"}-${batch.id.slice(0, 8)}.csv`, { type: "text/csv" });
    const xlsFile = new File([xls], `${batch.label || "voucher-codes"}-${batch.id.slice(0, 8)}.xls`, { type: "application/vnd.ms-excel" });

    const shareSupported = typeof navigator !== "undefined" && "canShare" in navigator && (navigator as any).canShare?.({ files: [csvFile, xlsFile] });
    if (shareSupported && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: t("voucher.codes.share.title", "Voucher codes"),
          text: t("voucher.codes.share.text", "Voucher codes attached. Recipients: {{emails}}", { emails: validEmails.join(", ") }),
          files: [csvFile, xlsFile],
        });
        toast({ title: t("common.copied", "Copied!") });
        setSendDialogOpen(false);
        return;
      } catch {
        // fallthrough to downloads + mailto
      }
    }

    // Fallback: download files and open mailto with recipients
    downloadBlob(csv, csvFile.name);
    downloadBlob(xls, xlsFile.name);
    const subject = encodeURIComponent(t("voucher.codes.share.mailSubject", "Voucher codes"));
    const body = encodeURIComponent(t("voucher.codes.share.mailBody", "Files downloaded locally. Please attach and send the CSV/XLS files."));
    if (validEmails.length > 0) {
      window.location.href = `mailto:${encodeURIComponent(validEmails.join(","))}?subject=${subject}&body=${body}`;
    }
    toast({
      title: t("voucher.codes.toasts.downloadedTitle", "Files prepared"),
      description: t("voucher.codes.toasts.downloadedDesc", "CSV and Excel downloaded. An email draft has been opened."),
    });
    setSendDialogOpen(false);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f1f4fd]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{t("voucher.codes.title", "Generate unique voucher codes")}</h1>
          <p className="text-muted-foreground">{t("voucher.choice.unique.lead", "Create unique, one-time codes to share with individuals")}</p>
        </div>
        <Card className="rounded-2xl">
          <CardContent className="pt-6 space-y-6">
            {/* Form */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="label">{t("voucher.codes.form.label", "Batch label (optional)")}</Label>
                <Input id="label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder={t("voucher.codes.form.labelPlaceholder", "e.g. Pilot Group Feb")} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expires">{t("voucher.codes.form.expires", "Expiry date (optional)")}</Label>
                <Input id="expires" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="count">{t("voucher.codes.form.count", "How many codes")}</Label>
                <Input id="count" type="number" min={1} max={1000} value={count} onChange={(e) => setCount(Number(e.target.value))} />
                {errors.count && <span className="text-xs text-red-600">{errors.count}</span>}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => navigate("/voucher")}>{t("common.back", "Back")}</Button>
                <Button variant="outline" onClick={() => navigate("/")}>{t("voucher.actions.backToDashboard", "Back to dashboard")}</Button>
              </div>
              <Button
                onClick={generated && !isGenerating ? () => navigate("/") : onGenerate}
                disabled={isGenerating || (!generated && !canGenerate)}
              >
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isGenerating
                  ? t("voucher.codes.form.generating", "Generating unique codes…")
                  : generated
                    ? t("voucher.codes.form.finishBack", "Finish — back to dashboard")
                    : t("voucher.codes.form.generate", "Generate codes")}
              </Button>
            </div>

            {/* Loader result or preview */}
            {isGenerating && (
              <div className="rounded-xl border p-8 bg-white flex flex-col items-center justify-center text-center gap-4">
                <Loader2 className="size-8 text-primary animate-spin" />
                <div className="text-base font-medium">{t("voucher.codes.form.generating", "Generating unique codes…")}</div>
              </div>
            )}

            {generated && !isGenerating && (
              <div className="rounded-xl border p-4 space-y-4 bg-white">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm">
                    <div className="font-medium">
                      {t("voucher.codes.result.title", "Batch generated")}
                    </div>
                    <div className="text-muted-foreground">
                      {t("voucher.codes.result.subtitle", "{{count}} codes • Batch “{{label}}”", {
                        count: generated.count,
                        label: generated.label || generated.id.slice(0, 8),
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => copyAll(generated)}><CopyIcon className="mr-2 h-4 w-4" />{t("voucher.codes.actions.copyAll", "Copy all")}</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadCsv(generated)}><Download className="mr-2 h-4 w-4" />CSV</Button>
                    <Button size="sm" variant="outline" onClick={() => downloadJson(generated)}><Download className="mr-2 h-4 w-4" />JSON</Button>
                    <Button size="sm" variant="outline" onClick={() => printBatch(generated)}><Printer className="mr-2 h-4 w-4" />{t("voucher.codes.actions.print", "Print")}</Button>
                    <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm"><Mail className="mr-2 h-4 w-4" />{t("voucher.codes.actions.sendEmail", "Send to email")}</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("voucher.codes.send.title", "Send codes by email")}</DialogTitle>
                          <DialogDescription>{t("voucher.codes.send.desc", "We’ll send the codes as CSV and Excel. Add recipients below.")}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-3">
                          <div className="grid gap-1">
                            <Label htmlFor="system-email">{t("voucher.codes.send.systemEmailLabel", "Your email (system)")}</Label>
                            <Input id="system-email" value={systemEmail} disabled />
                            <div className="text-xs text-muted-foreground">
                              {t("voucher.codes.send.systemEmailHint", "This email is linked to your account and cannot be changed.")}
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <Label>{t("voucher.codes.send.additionalLabel", "Additional recipients")}</Label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => setRecipientInputs((prev) => [...prev, ""])}
                              >
                                <Plus className="h-4 w-4 mr-1" />{t("voucher.codes.send.addRecipient", "Add recipient")}
                              </Button>
                            </div>
                            <div className="grid gap-2">
                              {recipientInputs.map((val, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <Input
                                    value={val}
                                    onChange={(e) => {
                                      const next = recipientInputs.slice();
                                      next[idx] = e.target.value;
                                      setRecipientInputs(next);
                                    }}
                                    placeholder="name@example.com"
                                  />
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="outline"
                                    onClick={() => {
                                      const next = recipientInputs.slice();
                                      next.splice(idx, 1);
                                      setRecipientInputs(next);
                                    }}
                                    aria-label={t("voucher.codes.send.remove", "Remove recipient")}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                            <div className="text-xs">
                              {t("voucher.codes.send.validPreview", "Valid emails")}: <span className="font-medium">{validEmails.length}</span>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSendDialogOpen(false)}>{t("common.close", "Close")}</Button>
                          <Button onClick={() => generated && onSendEmails(generated)} disabled={!generated || validEmails.length === 0}>
                            {t("voucher.codes.send.sendCtas", "Send codes to email")}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 font-mono text-sm">
                  {generated.codes.slice(0, 50).map((c) => (
                    <div key={c.code} className="px-2 py-1 rounded border bg-muted/30">{c.code}</div>
                  ))}
                </div>
                {generated.codes.length > 50 && (
                  <div className="text-xs text-muted-foreground">
                    {t("voucher.codes.result.more", "Only first 50 shown. Export to view all.")}
                  </div>
                )}
              </div>
            )}

            {/* Past batches */}
            <div className="space-y-2">
              <div className="text-sm font-medium">{t("voucher.codes.batches.title", "Previous batches")}</div>
              {batches.length === 0 && (
                <div className="text-sm text-muted-foreground">{t("voucher.codes.batches.empty", "No batches yet.")}</div>
              )}
              {batches.length > 0 && (
                <Accordion type="multiple" className="w-full">
                  {batches
                    .slice()
                    .reverse()
                    .map((b) => (
                      <AccordionItem key={b.id} value={b.id}>
                        <AccordionTrigger>
                          <div className="flex flex-col items-start text-left">
                            <div className="text-sm font-medium">{b.label || b.id.slice(0, 8)}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(b.createdAt).toLocaleString()} • {b.count} {t("common.users", "users")}
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex items-center gap-2 mb-3">
                            <Button size="sm" variant="outline" onClick={() => copyAll(b)}><CopyIcon className="mr-2 h-4 w-4" />{t("voucher.codes.actions.copyAll", "Copy all")}</Button>
                            <Button size="sm" variant="outline" onClick={() => downloadCsv(b)}><Download className="mr-2 h-4 w-4" />CSV</Button>
                            <Button size="sm" variant="outline" onClick={() => downloadJson(b)}><Download className="mr-2 h-4 w-4" />JSON</Button>
                            <Button size="sm" variant="outline" onClick={() => printBatch(b)}><Printer className="mr-2 h-4 w-4" />{t("voucher.codes.actions.print", "Print")}</Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 font-mono text-sm">
                            {b.codes.map((c) => (
                              <button
                                key={c.code}
                                className={`px-2 py-1 rounded border text-left ${c.used ? "bg-emerald-50 border-emerald-200" : "bg-muted/30"}`}
                                title={c.used ? t("voucher.codes.batches.markUnused", "Mark as unused") : t("voucher.codes.batches.markUsed", "Mark as used")}
                                onClick={() => {
                                  const updated = toggleCodeUsed(b.id, c.code);
                                  if (updated) {
                                    setBatches((prev) => prev.map((x) => (x.id === updated!.id ? updated! : x)));
                                  }
                                }}
                              >
                                <span className="mr-2">{c.code}</span>
                                {c.used && <Check className="inline h-3 w-3 text-emerald-600" />}
                              </button>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoucherCodes;
