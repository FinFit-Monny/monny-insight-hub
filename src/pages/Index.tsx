import { Users, CreditCard } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { UserGrowthChart } from "@/components/UserGrowthChart";
import { EnrolmentRate } from "@/components/EnrolmentRate";
import { CoachingSessions } from "@/components/CoachingSessions";
import { MoodCheckChart } from "@/components/MoodCheckChart";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import monnyLogo from "@/assets/monny-logo.png";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useDashboardViewModel, mapMoodScoreCountsToChart } from "@/viewmodels/useDashboardViewModel";
import { Link } from "react-router-dom";

const Index = () => {
  const { isSignedIn } = useUser();
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, isNotAdmin } = useDashboardViewModel();
  const companyName = data?.companyName || "";
  const normalizedLanguage = i18n.language.split('-')[0];
  const locale = normalizedLanguage === 'nl' ? 'nl-NL' : 'en-US';
  const uploads = data?.voucher.whitelist.uploads ?? [];
  const hasUploads = uploads.length > 0;
  const uniqueBatches = data?.voucher.unique.batches ?? [];
  const hasUniqueBatches = uniqueBatches.length > 0;
  const voucherCode = data?.voucher.whitelist.voucherCode ?? "";
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={monnyLogo} alt="Monny Logo" className="w-10 h-10 rounded-lg" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-foreground">{t('header.title')}</h1>
              <p className="text-sm text-muted-foreground">{t('header.company', { company: companyName })}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {isSignedIn && <UserButton afterSignOutUrl="/" />}
          </div>
        </div>
      </header>

      {/* Loading State */}
      {isLoading && !isNotAdmin && (
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-lg text-muted-foreground">{t('common.loading')}</p>
            </div>
          </div>
        </main>
      )}

      {/* Non-Admin Message */}
      {isNotAdmin && !isLoading && (
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="w-full max-w-md">
              <CardContent className="pt-6">
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('access.notAdminTitle')}</h1>
                    <p className="text-gray-600 mb-4">{t('access.notAdminDescription')}</p>
                    <p className="text-sm text-gray-500">{t('access.notAdminContact')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      )}

      {/* Main Content */}
      {!isNotAdmin && !isLoading && (
        <main className="container mx-auto px-4 py-8">
        {/* Top Section: User Growth (left) with stats below + Voucher (right) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {data ? (
              <UserGrowthChart
                data={data.userGrowth.monthlyData}
                currentUsers={data.userGrowth.currentUsers}
                previousUsers={data.userGrowth.previousUsers}
                growthPercentage={data.userGrowth.growthPercentage}
              />
            ) : (
              <UserGrowthChart
                data={[]}
                currentUsers={0}
                previousUsers={0}
                growthPercentage={0}
              />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data ? (
                <EnrolmentRate
                  totalEmployees={data.enrolment.totalEmployees}
                  enrolledUsers={data.enrolment.enrolledUsers}
                  enrolmentPercentage={data.enrolment.enrolmentPercentage}
                />
              ) : (
                <EnrolmentRate totalEmployees={0} enrolledUsers={0} enrolmentPercentage={0} />
              )}
              {data ? (
                <CoachingSessions totalSessions={data.coaching.totalSessions} />
              ) : (
                <CoachingSessions totalSessions={0} />
              )}
            </div>
            {/* Moved up: Stats Cards beneath the chart to reduce whitespace */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <StatCard
                title={t('cards.stat.totalUsers')}
                value={data?.stats.totalUsers.value ?? "0"}
                icon={Users}
                trend={undefined}
              />
              <StatCard
                title={t('cards.stat.bankAccountsConnected')}
                value={data?.stats.bankAccountsConnected.value ?? "0.0%"}
                icon={CreditCard}
                subtitle={t('cards.stat.bankAccountsConnectedSubtitle', { count: data?.stats.bankAccountsConnected.subtitle.count ?? '0' })}
                trend={undefined}
              />
            </div>
          </div>
          <div className="h-full flex flex-col">
            <Card className="h-full flex flex-col">
              {!hasUploads && (
                <CardContent className="pt-6 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">{t('voucher.cta.title')}</h2>
                    <p className="text-sm text-muted-foreground">{t('voucher.cta.description')}</p>
                  </div>
                  <Button asChild>
                  <Link to="/voucher-whitelist">{t('voucher.cta.button')}</Link>
                  </Button>
                </CardContent>
              )}
              {hasUploads && (
                <CardContent className="pt-6 flex flex-col h-full">
                  <div className="flex flex-col gap-4 flex-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-semibold">{t('voucher.dashboard.panelTitle')}</h2>
                        <p className="text-sm text-muted-foreground">{t('voucher.dashboard.panelDescription')}</p>
                      </div>
                      <Button asChild>
                        <Link to="/voucher-whitelist">{t('voucher.dashboard.uploadButton')}</Link>
                      </Button>
                    </div>
                    <div className="rounded-lg border p-4 flex-1 flex flex-col">
                      <div className="flex flex-col gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground">{t('voucher.code.label')}</div>
                          <div className="mt-1 inline-flex items-center justify-center border rounded-md px-3 py-2 font-mono text-xl font-semibold tracking-widest uppercase">
                            {voucherCode || "—"}
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col">
                          <div className="text-sm font-medium mb-2">{t('voucher.dashboard.uploadsLabel')}</div>
                          <div className="rounded-md border h-full">
                            <div className="divide-y">
                              {uploads.map((u, idx) => {
                                const when = new Date(u.createdAt);
                                const formatted = isNaN(when.getTime())
                                  ? u.createdAt
                                  : when.toLocaleString(locale, {
                                      year: "numeric",
                                      month: "short",
                                      day: "2-digit",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    });
                                return (
                                  <div key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                                    <div className="text-muted-foreground">{t('voucher.dashboard.uploadItemPrefix')} {idx + 1} • {formatted}</div>
                                    <div className="font-medium">{u.totalValid} {t('common.users')}</div>
                                  </div>
                                );
                              })}
                              {uploads.length === 0 && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">{t('voucher.dashboard.emptyUploads')}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
            <div className="mt-4">
              <Card className="h-full flex flex-col">
                <CardContent className="pt-6 flex flex-col h-full">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">{t('voucher.unique.panelTitle', 'Unique voucher codes')}</h2>
                      <p className="text-sm text-muted-foreground">
                        {t('voucher.unique.panelDescription', 'Generate one-time codes and manage past batches.')}
                      </p>
                    </div>
                    <Button asChild>
                      <Link to="/voucher-codes">{t('voucher.unique.generateButton', 'Generate codes')}</Link>
                    </Button>
                  </div>
                  <div className="mt-4 rounded-lg border p-4 flex-1">
                    <div className="text-sm font-medium mb-2">{t('voucher.unique.batchesLabel', 'Batches')}</div>
                    <div className="rounded-md border">
                      <div className="divide-y">
                        {(() => {
                          const previewCount = 5;
                          const ordered = uniqueBatches.slice().reverse();
                          const preview = ordered.slice(0, previewCount);
                          const remaining = Math.max(0, ordered.length - preview.length);
                          return (
                            <>
                              {preview.map((b) => {
                          const when = new Date(b.createdAt);
                          const formatted = isNaN(when.getTime())
                            ? b.createdAt
                            : when.toLocaleString(locale, {
                                year: "numeric",
                                month: "short",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                              });
                                return (
                                  <div key={b.id} className="flex items-center justify-between px-3 py-2 text-sm">
                                    <div className="text-muted-foreground">
                                      {(b.label || b.id.slice(0, 8))} • {formatted}
                                    </div>
                                    <div className="font-medium">{b.count}</div>
                                  </div>
                                );
                              })}
                              {remaining > 0 && (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                  {t('voucher.unique.andMore', { count: remaining, defaultValue: 'and {{count}} more…' })}
                                </div>
                              )}
                            </>
                          );
                        })()}
                        {uniqueBatches.length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            {t('voucher.unique.emptyBatches', 'No batches yet.')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" asChild>
                        <Link to="/voucher-codes">{t('voucher.unique.manageButton', 'Open codes')}</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Mood Check Chart */}
        <div>
          <MoodCheckChart
            data={mapMoodScoreCountsToChart(
              data?.mood.scoreCounts ?? { "1": 0, "2": 0, "3": 0, "4": 0 },
              {
                stressed: t('cards.moodCheck.stressed'),
                worried: t('cards.moodCheck.worried'),
                confident: t('cards.moodCheck.confident'),
                veryConfident: t('cards.moodCheck.veryConfident'),
              }
            )}
          />
        </div>
        </main>
      )}
    </div>
  );
};

export default Index;
