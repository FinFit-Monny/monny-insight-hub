import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface Props {
  totalSessions: number;
}

export const CoachingSessions = ({ totalSessions }: Props) => {
  const { t } = useTranslation();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t('cards.coachingSessions.title')}
        </CardTitle>
        <CardDescription>{t('cards.coachingSessions.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-4xl font-bold text-foreground">{totalSessions.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground mt-1">{t('cards.coachingSessions.total')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
