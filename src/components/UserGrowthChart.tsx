import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card } from "@/components/ui/card";

const data = [
  { month: "Jan", users: 1245 },
  { month: "Feb", users: 1567 },
  { month: "Mar", users: 1892 },
  { month: "Apr", users: 2234 },
  { month: "May", users: 2789 },
  { month: "Jun", users: 3456 },
  { month: "Jul", users: 4123 },
  { month: "Aug", users: 4890 },
];

export const UserGrowthChart = () => {
  const currentUsers = data[data.length - 1].users;
  const previousUsers = data[data.length - 2].users;
  const growthPercentage = (((currentUsers - previousUsers) / previousUsers) * 100).toFixed(1);

  return (
    <Card className="p-6 h-full">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-1">User Growth</h3>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-foreground">{currentUsers.toLocaleString()}</span>
          <span className="text-lg font-semibold text-accent">+{growthPercentage}%</span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">Total active users</p>
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
