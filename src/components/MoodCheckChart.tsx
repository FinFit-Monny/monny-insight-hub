import { Card } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, YAxis } from "recharts";

const moodData = [
  { mood: "😰", label: "Stressed", count: 456, color: "hsl(var(--chart-5))" },
  { mood: "😟", label: "Worried", count: 892, color: "hsl(var(--chart-4))" },
  { mood: "😊", label: "Confident", count: 2134, color: "hsl(var(--chart-3))" },
  { mood: "🤩", label: "Very Confident", count: 1408, color: "hsl(var(--chart-1))" },
];

export const MoodCheckChart = () => {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">Money Confidence Mood Check</h3>
        <p className="text-sm text-muted-foreground">How users feel about their finances</p>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={moodData}>
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
              `${value.toLocaleString()} users`,
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
        {moodData.map((item) => (
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
