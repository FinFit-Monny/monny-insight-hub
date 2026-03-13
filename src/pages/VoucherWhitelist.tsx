import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { isValidEmail, parseEmailsFromText, hashEmailSha256 } from "@/lib/email";
import { looksLikeEmail, looksLikePhone, isValidPhone, normalizePhone, hashPhoneSha256 } from "@/lib/phone";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Info, Shield, Upload, Trash2, FileSpreadsheet, Check, Loader2 } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { createVoucherUpload } from "@/api/voucher";

const VoucherWhitelist = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getToken } = useAuth();
  const { user } = useUser();
  const [step, setStep] = useState<1 | 2>(1);
  const [acceptedDpa, setAcceptedDpa] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [validEmails, setValidEmails] = useState<string[]>([]);
  const [validPhones, setValidPhones] = useState<string[]>([]);
  const [invalidEntries, setInvalidEntries] = useState<string[]>([]);
  const [duplicateEntries, setDuplicateEntries] = useState<string[]>([]);
  const [isAnonymising, setIsAnonymising] = useState(false);
  const [hashedEmailPreview, setHashedEmailPreview] = useState<string[]>([]);
  const [hashedPhonePreview, setHashedPhonePreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const canContinue = useMemo(() => {
    if (step === 1) return validEmails.length > 0 || validPhones.length > 0;
    if (step === 2) return acceptedDpa;
    return false;
  }, [step, acceptedDpa, validEmails.length, validPhones.length]);

  // Initialize step from query param (?step=1|2)
  useEffect(() => {
    const raw = searchParams.get("step");
    if (raw === "2") setStep(2);
    if (raw === "1") setStep(1);
  }, [searchParams]);

  // When entering step 2, pre-compute a truncated hashed preview of first 8 emails and phones
  useEffect(() => {
    let cancelled = false;
    async function computePreview() {
      if (step !== 2) {
        setHashedEmailPreview([]);
        setHashedPhonePreview([]);
        return;
      }
      try {
        // Compute email hashes
        if (validEmails.length > 0) {
          const emailHashes = await Promise.all(validEmails.slice(0, 4).map((e) => hashEmailSha256(e)));
          if (!cancelled) {
            setHashedEmailPreview(emailHashes.map((h) => `${h.slice(0, 12)}…`));
          }
        } else {
          if (!cancelled) setHashedEmailPreview([]);
        }
        // Compute phone hashes
        if (validPhones.length > 0) {
          const phoneHashes = await Promise.all(validPhones.slice(0, 4).map((p) => hashPhoneSha256(p)));
          if (!cancelled) {
            setHashedPhonePreview(phoneHashes.map((h) => `${h.slice(0, 12)}…`));
          }
        } else {
          if (!cancelled) setHashedPhonePreview([]);
        }
      } catch {
        if (!cancelled) {
          setHashedEmailPreview([]);
          setHashedPhonePreview([]);
        }
      }
    }
    computePreview();
    return () => {
      cancelled = true;
    };
  }, [step, validEmails, validPhones]);

  const onConfirm = async () => {
    if (!acceptedDpa || (validEmails.length === 0 && validPhones.length === 0) || !user) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const token = await getToken().catch(() => null);
      const upload = await createVoucherUpload(
        {
          userId: user.id,
          emails: validEmails.length > 0 ? validEmails : undefined,
          phones: validPhones.length > 0 ? validPhones : undefined,
        },
        token ?? null,
      );
      navigate("/voucher-whitelist/code", { state: { upload } });
    } catch (error) {
      // Surface a clear error to the admin so issues can be fixed, instead of silently falling back
      const message =
        error instanceof Error
          ? error.message
          : t("voucher.step3.errorGeneric", "Could not save whitelist. Please try again.");
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  function parseAndValidate(text: string) {
    // Split by common delimiters
    const entries = text
      .split(/[\n\r,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    
    const seenEmails = new Set<string>();
    const seenPhones = new Set<string>();
    const dups: string[] = [];
    const emails: string[] = [];
    const phones: string[] = [];
    const invalids: string[] = [];
    
    for (const entry of entries) {
      if (looksLikeEmail(entry)) {
        // It's an email
        const normalized = entry.toLowerCase();
        if (seenEmails.has(normalized)) {
          dups.push(normalized);
          continue;
        }
        seenEmails.add(normalized);
        if (isValidEmail(normalized)) {
          emails.push(normalized);
        } else {
          invalids.push(entry);
        }
      } else if (looksLikePhone(entry)) {
        // It's a phone number
        const normalized = normalizePhone(entry);
        if (seenPhones.has(normalized)) {
          dups.push(entry);
          continue;
        }
        seenPhones.add(normalized);
        if (isValidPhone(normalized)) {
          phones.push(normalized);
        } else {
          invalids.push(entry);
        }
      } else {
        // Unknown format
        invalids.push(entry);
      }
    }
    
    setValidEmails(emails);
    setValidPhones(phones);
    setInvalidEntries(invalids);
    setDuplicateEntries(dups);
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
    const header = "entry\n";
    const sample = [
      "jane.doe@example.com",
      "+31612345678",
      "john.smith@example.com",
      "0687654321",
    ].join("\n");
    const blob = new Blob([header + sample], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "whitelist-template.csv";
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
                      <Button variant="ghost" size="icon" className="rounded-full bg-red-500/10 text-red-600 hover:text-red-700 hover:bg-red-500/20" onClick={() => { setFileName(null); setPastedText(""); setValidEmails([]); setValidPhones([]); setInvalidEntries([]); setDuplicateEntries([]); }}>
                        <Trash2 className="size-5" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="entries-text">{t("voucher.step2.orPasteLabelUnified", "Or paste emails and phone numbers (one per line)")}</Label>
                  <Textarea
                    id="entries-text"
                    placeholder={t("voucher.step2.textPlaceholderUnified", "jan@company.nl\n+31612345678\nmarie@company.nl\n0687654321")}
                    value={pastedText}
                    onChange={(e) => onTextChange(e.target.value)}
                    className="min-h-[160px]"
                  />
                </div>

                <div className="rounded-md border p-3 text-sm bg-white">
                  <div className="flex flex-wrap gap-4">
                    <div>{t("voucher.step2.validEmails", "Valid emails")}: <span className="font-medium">{validEmails.length}</span></div>
                    <div>{t("voucher.step2.validPhones", "Valid phones")}: <span className="font-medium">{validPhones.length}</span></div>
                    <div>{t("voucher.step2.invalid")}: <span className="font-medium">{invalidEntries.length}</span></div>
                    <div>{t("voucher.step2.duplicates")}: <span className="font-medium">{duplicateEntries.length}</span></div>
                  </div>
                  {validEmails.length === 0 && validPhones.length === 0 && (
                    <div className="mt-2 text-muted-foreground">{t("voucher.step2.validationHintUnified", "Add at least one valid email or phone number to continue.")}</div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                {isAnonymising ? (
                  <div className="rounded-xl border p-8 bg-white flex flex-col items-center justify-center text-center gap-4">
                    <Loader2 className="size-8 text-primary animate-spin" />
                    <div className="text-base font-medium">Anonymising email adresses</div>
                    <div className="text-xs text-muted-foreground">
                      {t("voucher.step3.reviewInfoTextHashed", "We convert emails into encrypted hashes. We never store plain text emails.")}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3 items-start rounded-xl bg-[#f1f4fd] p-5">
                      <div className="shrink-0">
                        <div className="size-9 rounded-full grid place-items-center bg-primary/10 text-primary">
                          <Info className="size-5" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-primary">{t("voucher.step3.reviewInfoTitle")}</div>
                        <div className="text-xs text-[#282828]">{t("voucher.step3.reviewInfoTextHashed", "You can review a hashed preview below. Only encrypted email representations will be stored after confirmation.")}</div>
                      </div>
                    </div>

                    <div className="rounded-xl border p-4 space-y-3 bg-white">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>{t("voucher.step2.validEmails", "Valid emails")}: <span className="font-medium">{validEmails.length}</span></div>
                        <div>{t("voucher.step2.validPhones", "Valid phones")}: <span className="font-medium">{validPhones.length}</span></div>
                        <div>{t("voucher.step3.invalid")}: <span className="font-medium">{invalidEntries.length}</span></div>
                        <div>{t("voucher.step3.duplicates")}: <span className="font-medium">{duplicateEntries.length}</span></div>
                      </div>
                      {hashedEmailPreview.length > 0 && (
                        <div>
                          <div className="text-sm font-medium">{t("voucher.step3.previewEmailsHashed", "Email preview (hashed)")}</div>
                          <ul className="mt-2 list-disc pl-5 text-sm font-mono">
                            {hashedEmailPreview.map((h, idx) => (
                              <li key={`email-${h}-${idx}`}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {hashedPhonePreview.length > 0 && (
                        <div>
                          <div className="text-sm font-medium">{t("voucher.step3.previewPhonesHashed", "Phone preview (hashed)")}</div>
                          <ul className="mt-2 list-disc pl-5 text-sm font-mono">
                            {hashedPhonePreview.map((h, idx) => (
                              <li key={`phone-${h}-${idx}`}>{h}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {hashedEmailPreview.length === 0 && hashedPhonePreview.length === 0 && (
                        <div className="text-muted-foreground">{t("voucher.step3.noEntries", "No valid entries to show.")}</div>
                      )}
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
                  </>
                )}
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
                  <Button
                    disabled={!canContinue}
                    onClick={() => {
                      setStep(2);
                      setIsAnonymising(true);
                      // Show loader for 5 seconds to emphasize anonymisation
                      window.setTimeout(() => setIsAnonymising(false), 5000);
                    }}
                  >
                    {t("common.next", "Next")}
                  </Button>
                ) : (
                  <Button disabled={!canContinue || isSubmitting} onClick={onConfirm}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t("voucher.codes.form.generating", "Generating unique codes…")}
                      </>
                    ) : (
                      t("common.confirm", "Confirm")
                    )}
                  </Button>
                )}
              </div>
            </div>
            {submitError && (
              <div className="mt-3 text-sm text-red-600">
                {submitError}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoucherWhitelist;


