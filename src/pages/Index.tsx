import { Users, CreditCard } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { UserGrowthChart } from "@/components/UserGrowthChart";
import { EnrolmentRate } from "@/components/EnrolmentRate";
import { CoachingSessions } from "@/components/CoachingSessions";
import { MoodCheckChart } from "@/components/MoodCheckChart";
import { Card, CardContent } from "@/components/ui/card";
import monnyLogo from "@/assets/monny-logo.png";
import { UserButton, useUser } from "@clerk/clerk-react";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useDashboardViewModel, mapMoodScoreCountsToChart } from "@/viewmodels/useDashboardViewModel";

const Index = () => {
  const { isSignedIn } = useUser();
  const { t } = useTranslation();
  const { data, isLoading, isError, isNotAdmin } = useDashboardViewModel();
  const companyName = data?.companyName || "";
  
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
        {/* Top Section: Main Chart + Enrolment Rate + Coaching Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
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
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-6 h-full">
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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
