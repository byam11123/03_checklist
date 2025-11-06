
import type { ChecklistEntry } from '../types/checklist';
import { useLanguage } from '../context/LanguageContext';

interface DashboardStatsProps {
  entries: ChecklistEntry[];
  isLoading: boolean;
}

const DashboardStats = ({ entries, isLoading }: DashboardStatsProps) => {
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  const totalSubmissions = entries.length;
  const pendingReviews = entries.filter(entry => !entry.supervisorVerified).length;
  const averageCompletion = 
    totalSubmissions > 0
      ? Math.round(
          entries.reduce((acc, entry) => acc + (entry.completionPercentage || 0), 0) / totalSubmissions
        )
      : 0;

  const stats = [
    { 
      label: t('dashboard.totalSubmissions'), 
      value: totalSubmissions, 
      color: 'blue' 
    },
    { 
      label: t('dashboard.pendingReviews'), 
      value: pendingReviews, 
      color: 'orange' 
    },
    { 
      label: t('dashboard.avgCompletion'), 
      value: `${averageCompletion}%`, 
      color: 'green' 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {stats.map(stat => (
        <div key={stat.label} className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border-l-4 border-${stat.color}-500`}>
          <h4 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">{stat.label}</h4>
          <p className="text-3xl font-bold text-gray-800 dark:text-gray-200">{stat.value}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
