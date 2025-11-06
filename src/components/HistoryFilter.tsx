
import { useLanguage } from '../context/LanguageContext';

interface HistoryFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  dateRange: { start: string; end: string };
  setDateRange: (range: { start: string; end: string }) => void;
}

const HistoryFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  filterStatus, 
  setFilterStatus, 
  dateRange, 
  setDateRange 
}: HistoryFilterProps) => {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder={t('history.searchByName')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="all">{t('history.allStatuses')}</option>
          <option value="reviewed">{t('history.reviewed')}</option>
          <option value="pending">{t('history.pendingReview')}</option>
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
      </div>
    </div>
  );
};

export default HistoryFilter;
