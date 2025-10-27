import { Card } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";
import { useTranslation } from 'react-i18next';

interface MoodItem { mood: string; label: string; count: number; color: string }

interface Props {
  data: MoodItem[];
}

export const MoodCheckChart = ({ data }: Props) => {
  const { t } = useTranslation();
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">{t('cards.moodCheck.title')}</h3>
        <p className="text-sm text-muted-foreground">{t('cards.moodCheck.subtitle')}</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
            formatter={(value: number, name: string, props: any) => [
              `${value.toLocaleString()} ${t('cards.moodCheck.users')}`,
              props.payload.label
            ]}
          />
          <Bar 
            dataKey="count" 
            radius={[8, 8, 0, 0]}
            fill="hsl(var(--primary))"
          />
        </BarChart>
      </ResponsiveContainer>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {data.map((item) => (
          <div key={item.label} className="text-center">
            <div className="text-3xl mb-1">{item.mood}</div>
            <div className="text-sm font-medium text-foreground">{item.count.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{item.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};
