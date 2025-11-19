import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info, MailCheck, KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const VoucherMethod = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-120px)] bg-[#f1f4fd]">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">{t("voucher.choice.title", "Choose voucher method")}</h1>
          <p className="text-muted-foreground">{t("voucher.choice.subtitle", "Decide how recipients will get access")}</p>
        </div>
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex gap-3 items-start rounded-xl bg-[#f1f4fd] p-5">
              <div className="shrink-0">
                <div className="size-9 rounded-full grid place-items-center bg-primary/10 text-primary">
                  <Info className="size-5" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-[#282828]">
                  {t("voucher.choice.lead", "Both options still control access to your offer. Choose what fits your case.")}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="rounded-xl">
                <CardContent className="pt-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full grid place-items-center bg-primary/10 text-primary">
                      <MailCheck className="size-5" />
                    </div>
                    <div className="text-lg font-semibold">
                      {t("voucher.choice.whitelist.title", "Upload emails (hashed)")}
                    </div>
                  </div>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>{t("voucher.choice.whitelist.point1", "One code for everyone")}</li>
                    <li>{t("voucher.choice.whitelist.point2", "Verify signups against your list")}</li>
                  </ul>
                  <div>
                    <Button onClick={() => navigate("/voucher-whitelist?step=1")}>
                      {t("voucher.choice.whitelist.cta", "Use email whitelist")}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardContent className="pt-6 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full grid place-items-center bg-primary/10 text-primary">
                      <KeyRound className="size-5" />
                    </div>
                    <div className="text-lg font-semibold">
                      {t("voucher.choice.unique.title", "Generate unique codes")}
                    </div>
                  </div>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>{t("voucher.choice.unique.point1", "Each code can be used once")}</li>
                    <li>{t("voucher.choice.unique.point2", "No email validation required")}</li>
                  </ul>
                  <div>
                    <Button variant="outline" onClick={() => navigate("/voucher-codes")}>
                      {t("voucher.choice.unique.cta", "Generate unique codes")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-8 flex items-center justify-end">
              <Button variant="outline" onClick={() => navigate("/")}>
                {t("voucher.actions.backToDashboard")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoucherMethod;


