import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";
import { useTranslation } from 'react-i18next';

type Point = { month: string; users: number };

interface Props {
  data: Point[];
  currentUsers: number;
  previousUsers: number;
  growthPercentage: number | string;
}

export const UserGrowthChart = ({ data, currentUsers, previousUsers, growthPercentage }: Props) => {
  const { t } = useTranslation();

  return (
    <Card className="p-6 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">{t('cards.userGrowth.title')}</h3>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-foreground">{currentUsers.toLocaleString()}</span>
          {growthPercentage > 0 && (
            <span className="text-lg font-semibold text-accent">+{typeof growthPercentage === 'string' ? growthPercentage : growthPercentage.toFixed(1)}%</span>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{t('cards.userGrowth.subtitle')}</p>
      </div>
      
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="month" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "var(--radius)",
            }}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="hsl(var(--primary))"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorUsers)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
};
