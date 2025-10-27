import { Card } from "@/components/ui/card";
import { Target } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface Props {
  totalEmployees: number;
  enrolledUsers: number;
  enrolmentPercentage: number;
}

export const EnrolmentRate = ({ totalEmployees, enrolledUsers, enrolmentPercentage }: Props) => {
  const { t } = useTranslation();

  return (
    <Card className="p-6 flex-1 flex flex-col justify-between">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Target className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{t('cards.enrolmentRate.title')}</h3>
      </div>
      
      <div className="mb-4">
        <div className="text-4xl font-bold text-primary mb-2">{enrolmentPercentage.toFixed(1)}%</div>
        <p className="text-sm text-muted-foreground">
          {t('cards.enrolmentRate.subtitle', { enrolled: enrolledUsers.toLocaleString(), total: totalEmployees.toLocaleString() })}
        </p>
      </div>
      
      <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${enrolmentPercentage}%` }}
        />
      </div>
    </Card>
  );
};
