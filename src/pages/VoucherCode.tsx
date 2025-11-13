import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { Check, Copy as CopyIcon, Info, Share2, UserPlus, ShieldCheck } from "lucide-react";

const VoucherCode = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const voucherCode = "FAIRC";
  const result = useMemo(() => {
    try {
      const raw = sessionStorage.getItem("voucherWhitelistResult");
      return raw ? JSON.parse(raw) as { totalValid: number; totalInvalid: number; totalDuplicates: number; createdAt: string } : null;
    } catch {
      return null;
    }
  }, []);

  const onCopy = async () => {
    setCopyError(null);
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        await navigator.clipboard.writeText(voucherCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      // Fallback for browsers without async clipboard API (e.g., some Safari contexts)
      const textarea = document.createElement("textarea");
      textarea.value = voucherCode;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "absolute";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      const selection = document.getSelection();
      const selected = selection ? selection.rangeCount > 0 ? selection.getRangeAt(0) : null : null;
      textarea.select();
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (selected && selection) {
        selection.removeAllRanges();
        selection.addRange(selected);
      }
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        return;
      }
      throw new Error("execCommand copy failed");
    } catch {
      setCopyError(t("voucher.code.copyError", "Kon niet kopiëren. Kopieer handmatig."));
      setTimeout(() => setCopyError(null), 2500);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f1f4fd]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{t("voucher.code.title", "Company Voucher Code")}</h1>
          <p className="text-muted-foreground">{t("voucher.code.subtitle", "Share this code with your recipients")}</p>
        </div>
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              <div className="mb-2">
                <div className="flex items-center justify-center gap-6">
                  <div
                    className="flex flex-col items-center gap-2 cursor-pointer"
                    onClick={() => navigate("/voucher-whitelist?step=1")}
                    role="button"
                    aria-label="Go to step 1"
                    title="Go to step 1"
                  >
                    <div className="size-9 rounded-full border border-primary grid place-items-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm text-primary font-medium">{t("voucher.steps.upload")}</div>
                  </div>
                  <div className="w-14 h-10 grid place-items-center">
                    <div className="h-px w-14 bg-muted-foreground/30" />
                  </div>
                  <div
                    className="flex flex-col items-center gap-2 cursor-pointer"
                    onClick={() => navigate("/voucher-whitelist?step=2")}
                    role="button"
                    aria-label="Go to step 2"
                    title="Go to step 2"
                  >
                    <div className="size-9 rounded-full border border-primary grid place-items-center">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm text-primary font-medium">{t("voucher.steps.review")}</div>
                  </div>
                  <div className="w-14 h-10 grid place-items-center">
                    <div className="h-px w-14 bg-muted-foreground/30" />
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="size-9 rounded-full border border-primary grid place-items-center">
                      <span className="text-sm text-primary font-medium">3</span>
                    </div>
                    <div className="text-sm text-primary font-medium">{t("voucher.steps.code")}</div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 items-start rounded-xl bg-[#f1f4fd] p-5 border border-[#7097ea]/40">
                <div className="shrink-0">
                  <div className="size-8 rounded-full grid place-items-center bg-primary/10 text-primary">
                    <Info className="size-4" />
                  </div>
                </div>
                <div className="text-sm text-[#282828]">
                  <div className="font-medium">
                    {t("voucher.code.howItWorks")}
                  </div>
                  <div className="mt-3 grid gap-2">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary">
                        <Share2 className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="font-medium">{t("voucher.code.shareTitle")}</div>
                        <div className="text-muted-foreground">{t("voucher.code.shareDesc")}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary">
                        <UserPlus className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="font-medium">{t("voucher.code.recipientTitle")}</div>
                        <div className="text-muted-foreground">{t("voucher.code.recipientDesc")}</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary">
                        <ShieldCheck className="h-4 w-4" />
                      </span>
                      <div>
                        <div className="font-medium">{t("voucher.code.eligibilityTitle")}</div>
                        <div className="text-muted-foreground">{t("voucher.code.eligibilityDesc")}</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="font-medium">{t("voucher.code.priceTitle")}</div>
                    <div className="text-muted-foreground">{t("voucher.code.privacyNote")}</div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl p-6 bg-white">
                <div className="flex flex-col items-center text-center gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">{t("voucher.code.label", "Voucher code")}</div>
                    <div className="mt-1">
                      <div className="inline-flex items-center justify-center border rounded-xl px-6 py-3 font-mono text-4xl md:text-5xl font-semibold tracking-widest uppercase">
                        {voucherCode}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    {copied && (
                      <span className="text-xs text-emerald-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {t("common.copied", "Copied!")}
                      </span>
                    )}
                    {!copied && copyError && (
                      <span className="text-xs text-red-600">{copyError}</span>
                    )}
                    <div className="flex items-center justify-center gap-2">
                      <Button type="button" onClick={onCopy} className="relative">
                        {copied ? <Check className="mr-2 h-4 w-4" /> : <CopyIcon className="mr-2 h-4 w-4" />}
                        {copied ? t("common.copied", "Copied!") : t("common.copy", "Copy")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
 
              <div className="mt-8 flex items-center justify-end">
                <Button variant="outline" onClick={() => navigate("/")}>
                  {t("voucher.actions.backToDashboard")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoucherCode;


