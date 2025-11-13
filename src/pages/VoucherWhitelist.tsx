import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { isValidEmail, parseEmailsFromText, maskEmail, hashEmailSha256 } from "@/lib/email";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Info, Shield, Upload, Trash2, FileSpreadsheet, Check } from "lucide-react";

const VoucherWhitelist = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<1 | 2>(1);
  const [acceptedDpa, setAcceptedDpa] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [validEmails, setValidEmails] = useState<string[]>([]);
  const [invalidEmails, setInvalidEmails] = useState<string[]>([]);
  const [duplicateEmails, setDuplicateEmails] = useState<string[]>([]);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const canContinue = useMemo(() => {
    if (step === 1) return validEmails.length > 0;
    if (step === 2) return acceptedDpa;
    return false;
  }, [step, acceptedDpa, validEmails.length]);

  // Initialize step from query param (?step=1|2)
  useEffect(() => {
    const raw = searchParams.get("step");
    if (raw === "2") setStep(2);
    if (raw === "1") setStep(1);
  }, [searchParams]);

  async function onConfirm() {
    // Hash emails and persist in session for the code page to reference
    try {
      const hashes = await Promise.all(validEmails.map((e) => hashEmailSha256(e)));
      const payload = {
        hashedEmails: hashes,
        totalValid: validEmails.length,
        totalInvalid: invalidEmails.length,
        totalDuplicates: duplicateEmails.length,
        createdAt: new Date().toISOString(),
      };
      try {
        sessionStorage.setItem("voucherWhitelistResult", JSON.stringify(payload));
        // Also persist a lightweight record of this upload locally for dashboard display
        try {
          const raw = localStorage.getItem("voucherUploads");
          const existing: Array<{ createdAt: string; totalValid: number; totalInvalid: number; totalDuplicates: number }> =
            raw ? JSON.parse(raw) : [];
          const next = [
            ...existing,
            {
              createdAt: payload.createdAt,
              totalValid: payload.totalValid,
              totalInvalid: payload.totalInvalid,
              totalDuplicates: payload.totalDuplicates,
            },
          ];
          localStorage.setItem("voucherUploads", JSON.stringify(next));
        } catch {
          // ignore localStorage/JSON issues
        }
      } catch {
        // ignore storage issues
      }
    } catch {
      // If hashing fails (e.g., crypto.subtle unavailable), still proceed with minimal payload
      const payload = {
        hashedEmails: [],
        totalValid: validEmails.length,
        totalInvalid: invalidEmails.length,
        totalDuplicates: duplicateEmails.length,
        createdAt: new Date().toISOString(),
      };
      try {
        sessionStorage.setItem("voucherWhitelistResult", JSON.stringify(payload));
        // Attempt to persist a lightweight record even if hashing failed
        try {
          const raw = localStorage.getItem("voucherUploads");
          const existing: Array<{ createdAt: string; totalValid: number; totalInvalid: number; totalDuplicates: number }> =
            raw ? JSON.parse(raw) : [];
          const next = [
            ...existing,
            {
              createdAt: payload.createdAt,
              totalValid: payload.totalValid,
              totalInvalid: payload.totalInvalid,
              totalDuplicates: payload.totalDuplicates,
            },
          ];
          localStorage.setItem("voucherUploads", JSON.stringify(next));
        } catch {
          // ignore localStorage/JSON issues
        }
      } catch {
        // ignore
      }
    }
    navigate("/voucher-whitelist/code");
  }

  function parseAndValidate(text: string) {
    const emails = parseEmailsFromText(text);
    const seen = new Set<string>();
    const dups = new Set<string>();
    const valids: string[] = [];
    const invalids: string[] = [];
    for (const e of emails) {
      const normalized = e.trim().toLowerCase();
      if (seen.has(normalized)) {
        dups.add(normalized);
        continue;
      }
      seen.add(normalized);
      if (isValidEmail(normalized)) {
        valids.push(normalized);
      } else {
        invalids.push(normalized);
      }
    }
    setValidEmails(valids);
    setInvalidEmails(invalids);
    setDuplicateEmails(Array.from(dups));
  }

  function onTextChange(value: string) {
    setPastedText(value);
    parseAndValidate(value);
  }

  function onFileChange(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || "");
      parseAndValidate(content);
      setPastedText(content);
    };
    reader.readAsText(file);
  }

  function onDropFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    onFileChange(files[0]);
  }

  function onDownloadTemplate() {
    const header = "email\n";
    const sample = ["jane.doe@example.com", "john.smith@example.com"].join("\n");
    const blob = new Blob([header + sample], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-whitelist-template.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f1f4fd]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{t("voucher.title")}</h1>
          <p className="text-muted-foreground">{t("voucher.subtitle", "Upload and approve recipient emails")}</p>
        </div>
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="mb-8">
              <div className="flex items-center justify-center gap-6">
                <div
                  className={`flex flex-col items-center gap-2 ${step > 1 ? "cursor-pointer" : ""}`}
                  onClick={() => {
                    if (step > 1) setStep(1);
                  }}
                  role={step > 1 ? "button" : undefined}
                  aria-label="Go to step 1"
                  title={step > 1 ? "Go to step 1" : undefined}
                >
                  <div className={`size-9 rounded-full border ${step >= 1 ? "border-primary" : "border-muted-foreground/30"} grid place-items-center`}>
                    {step > 1 ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <span className={`text-sm ${step === 1 ? "text-primary font-medium" : "text-muted-foreground"}`}>1</span>
                    )}
                  </div>
                  <div className={`text-sm ${step > 1 || step === 1 ? "text-primary font-medium" : "text-muted-foreground"}`}>{t("voucher.steps.upload")}</div>
                </div>
                <div className="w-14 h-10 grid place-items-center">
                  <div className="h-px w-14 bg-muted-foreground/30" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className={`size-9 rounded-full border ${step >= 2 ? "border-primary" : "border-muted-foreground/30"} grid place-items-center`}>
                    {step > 2 ? (
                      <Check className="h-4 w-4 text-primary" />
                    ) : (
                      <span className={`text-sm ${step === 2 ? "text-primary font-medium" : "text-muted-foreground"}`}>2</span>
                    )}
                  </div>
                  <div className={`text-sm ${step === 2 ? "text-primary font-medium" : "text-muted-foreground"}`}>{t("voucher.steps.review")}</div>
                </div>
                <div className="w-14 h-10 grid place-items-center">
                  <div className="h-px w-14 bg-muted-foreground/30" />
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="size-9 rounded-full border border-muted-foreground/30 grid place-items-center">
                    <span className="text-sm text-muted-foreground">3</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{t("voucher.steps.code")}</div>
                </div>
              </div>
            </div>

            {step === 1 && (
              <div className="space-y-7">
                <div className="flex gap-3 items-start rounded-xl bg-[#f1f4fd] p-5">
                  <div className="shrink-0">
                    <div className="size-9 rounded-full grid place-items-center bg-primary/10 text-primary">
                      <Shield className="size-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-primary">{t("voucher.step1.gdprTitle")}</div>
                    <div className="text-xs text-[#282828]">{t("voucher.step1.gdprText")}</div>
                  </div>
                </div>

                <div className="flex items-start justify-between gap-4 rounded-xl border p-5">
                  <div className="space-y-1">
                    <div className="text-base font-medium">{t("voucher.step2.uploadingGuidelinesTitle")}</div>
                    <div className="text-sm text-muted-foreground">{t("voucher.step2.uploadingGuidelinesText")}</div>
                  </div>
                  <Button variant="outline" onClick={onDownloadTemplate} className="rounded-full">
                    <Upload className="size-4 mr-2" />
                    {t("voucher.step2.downloadTemplate")}
                  </Button>
                </div>

                <div className="space-y-4">
                  <div
                    ref={dropRef}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dropRef.current) dropRef.current.classList.add("ring-2", "ring-primary");
                    }}
                    onDragLeave={() => {
                      if (dropRef.current) dropRef.current.classList.remove("ring-2", "ring-primary");
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dropRef.current) dropRef.current.classList.remove("ring-2", "ring-primary");
                      onDropFiles(e.dataTransfer?.files || null);
                    }}
                    className="rounded-xl border-2 border-dashed border-primary/40 bg-white p-6 grid place-items-center cursor-pointer"
                    onClick={() => inputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center text-center gap-2 text-muted-foreground">
                      <Upload className="size-6" />
                      <div className="text-sm">
                        <span className="text-primary font-medium">{t("voucher.step2.clickToUpload")}</span> {t("voucher.step2.orDragHere")}
                      </div>
                      <div className="text-xs">{t("voucher.step2.maxSize")}</div>
                    </div>
                    <Input
                      ref={inputRef}
                      id="hidden-file"
                      type="file"
                      accept=".csv,.txt"
                      className="hidden"
                      onChange={(e) => onFileChange(e.target.files?.[0] || null)}
                    />
                  </div>
                  {fileName && (
                    <div className="flex items-center gap-3 rounded-xl border p-4 bg-white">
                      <div className="size-12 grid place-items-center overflow-hidden">
                        <FileSpreadsheet className="size-8 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{fileName}</div>
                        <div className="text-xs text-muted-foreground">{t("voucher.step2.fileType")}</div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full bg-red-500/10 text-red-600 hover:text-red-700 hover:bg-red-500/20" onClick={() => { setFileName(null); setPastedText(""); setValidEmails([]); setInvalidEmails([]); setDuplicateEmails([]); }}>
                        <Trash2 className="size-5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="emails-text">{t("voucher.step2.orPasteLabel")}</Label>
                  <Textarea
                    id="emails-text"
                    placeholder={t("voucher.step2.textPlaceholder")}
                    value={pastedText}
                    onChange={(e) => onTextChange(e.target.value)}
                    className="min-h-[160px]"
                  />
                </div>

                <div className="rounded-md border p-3 text-sm bg-white">
                  <div className="flex flex-wrap gap-4">
                    <div>{t("voucher.step2.valid")}: <span className="font-medium">{validEmails.length}</span></div>
                    <div>{t("voucher.step2.invalid")}: <span className="font-medium">{invalidEmails.length}</span></div>
                    <div>{t("voucher.step2.duplicates")}: <span className="font-medium">{duplicateEmails.length}</span></div>
                  </div>
                  {validEmails.length === 0 && (
                    <div className="mt-2 text-muted-foreground">{t("voucher.step2.validationHint")}</div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="flex gap-3 items-start rounded-xl bg-[#f1f4fd] p-5">
                  <div className="shrink-0">
                    <div className="size-9 rounded-full grid place-items-center bg-primary/10 text-primary">
                      <Info className="size-5" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-medium text-primary">{t("voucher.step3.reviewInfoTitle")}</div>
                    <div className="text-xs text-[#282828]">{t("voucher.step3.reviewInfoText")}</div>
                  </div>
                </div>

                <div className="rounded-xl border p-4 space-y-3 bg-white">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>{t("voucher.step3.valid")}: <span className="font-medium">{validEmails.length}</span></div>
                    <div>{t("voucher.step3.invalid")}: <span className="font-medium">{invalidEmails.length}</span></div>
                    <div>{t("voucher.step3.duplicates")}: <span className="font-medium">{duplicateEmails.length}</span></div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t("voucher.step3.preview")}</div>
                    <ul className="mt-2 list-disc pl-5 text-sm">
                      {validEmails.slice(0, 8).map((e) => (
                        <li key={e}>{maskEmail(e)}</li>
                      ))}
                      {validEmails.length === 0 && <li className="text-muted-foreground">{t("voucher.step3.noEmails")}</li>}
                    </ul>
                  </div>
                </div>

                <div className="rounded-md border p-4 bg-muted/30">
                  <div className="flex flex-wrap items-center gap-3">
                    <Checkbox id="accept-dpa" checked={acceptedDpa} onCheckedChange={(v) => setAcceptedDpa(Boolean(v))} />
                    <Label htmlFor="accept-dpa" className="text-sm">
                      {t("voucher.step1.checkbox")}
                    </Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" className="px-0">{t("voucher.step1.viewDpa")}</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("voucher.step1.dpaTitle")}</DialogTitle>
                          <DialogDescription>{t("voucher.step1.dpaModalPlaceholder")}</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button>{t("common.close")}</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" onClick={() => navigate("/")}>{t("voucher.actions.backToDashboard", "Back to dashboard")}</Button>
              <div className="flex gap-2">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(1)}>
                    {t("common.back", "Back")}
                  </Button>
                )}
                {step < 2 ? (
                  <Button disabled={!canContinue} onClick={() => setStep(2)}>
                    {t("common.next", "Next")}
                  </Button>
                ) : (
                  <Button disabled={!canContinue} onClick={onConfirm}>{t("common.confirm", "Confirm")}</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoucherWhitelist;


