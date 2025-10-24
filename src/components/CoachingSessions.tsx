import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

export const CoachingSessions = () => {
  const totalSessions = 1847;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Coaching Sessions
        </CardTitle>
        <CardDescription>Human budget coaching provided</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-4xl font-bold text-foreground">{totalSessions.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-1">Total sessions provided</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
