import { Users, CreditCard, Activity, LogOut } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { UserGrowthChart } from "@/components/UserGrowthChart";
import { EnrolmentRate } from "@/components/EnrolmentRate";
import { CoachingSessions } from "@/components/CoachingSessions";
import { MoodCheckChart } from "@/components/MoodCheckChart";
import monnyLogo from "@/assets/monny-logo.png";

const Index = () => {
  const companyName = "Excent";
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={monnyLogo} alt="Monny Logo" className="w-10 h-10 rounded-lg" />
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-foreground">Monny Dashboard</h1>
              <p className="text-sm text-muted-foreground">{companyName}</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Log out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Top Section: Main Chart + Enrolment Rate + Coaching Sessions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <UserGrowthChart />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-6 h-full">
            <EnrolmentRate />
            <CoachingSessions />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value="4,890"
            icon={Users}
            trend={{ value: 18.7, label: "vs last month" }}
          />
          <StatCard
            title="Bank Accounts Connected"
            value="84.2%"
            icon={CreditCard}
            subtitle="4,118 users connected"
            trend={{ value: 5.2, label: "vs last month" }}
          />
          <StatCard
            title="Monthly Active Users"
            value="3,892"
            icon={Activity}
            subtitle="79.6% of total users"
            trend={{ value: 12.3, label: "vs last month" }}
          />
        </div>

        {/* Mood Check Chart */}
        <div>
          <MoodCheckChart />
        </div>
      </main>
    </div>
  );
};

export default Index;
