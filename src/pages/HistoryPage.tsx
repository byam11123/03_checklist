import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { checklistService } from '../api/checklistService';
import type { ChecklistEntry } from '../types/checklist';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import HistoryFilter from '../components/HistoryFilter';

const HistoryPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [checklists, setChecklists] = useState<ChecklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });

  useEffect(() => {
  const loadChecklists = async () => {
  try {
    console.log('Attempting to load checklist history...');
    const data = await checklistService.fetchChecklistHistory();
    console.log('Received data:', data);
    
    // Sort by date descending (latest first)
    const sortedData = data.sort((a, b) => {
      // Parse dates for comparison
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // If dates are same, sort by time
      if (dateA.getTime() === dateB.getTime()) {
        const timeA = a.time || '00:00:00';
        const timeB = b.time || '00:00:00';
        return timeB.localeCompare(timeA); // Descending
      }
      
      return dateB.getTime() - dateA.getTime(); // Descending (latest first)
    });
    
    // Filter for office boy checklists only if user is a supervisor
    if (user.role === 'Supervisor') {
      setChecklists(sortedData);
    } else {
      // For office boys, show only their own checklists
      setChecklists(sortedData.filter(entry => entry.name === user.name));
    }
    setLoading(false);

      } catch (err: any) {
        const errorMessage = err.message || 'Failed to load checklist history';
        setError(errorMessage);
        setLoading(false);
        console.error('Error loading checklists:', err);
      }
    };

    loadChecklists();
  }, [user]);

  const filteredChecklists = useMemo(() => {
    return checklists.filter(entry => {
      const entryDate = new Date(entry.date);
      const startDate = dateRange.start ? new Date(dateRange.start) : null;
      const endDate = dateRange.end ? new Date(dateRange.end) : null;

      if (startDate && entryDate < startDate) return false;
      if (endDate && entryDate > endDate) return false;

      if (filterStatus !== 'all' && (filterStatus === 'reviewed' ? !entry.supervisorVerified : entry.supervisorVerified)) return false;

      if (searchTerm && !entry.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;

      return true;
    });
  }, [checklists, searchTerm, filterStatus, dateRange]);

  const handleViewDetail = (id: string) => {
    navigate(`/history/${id}`);
  };

  const handleExport = () => {
    const headers = [
      "ID", "Date", "Time", "Name", "Role", "Checklist Type", 
      "Completed Tasks", "Total Tasks", "Completion %", "Supervisor Name", 
      "Supervisor Verified", "Verified At"
    ];

    const rows = filteredChecklists.map(entry => [
      entry.id,
      entry.date,
      entry.time,
      entry.name,
      entry.role,
      entry.checklistType,
      entry.completedTasks,
      entry.totalTasks,
      entry.completionPercentage,
      entry.supervisorName,
      entry.supervisorVerified,
      entry.verifiedAt
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'checklist-history.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('history.loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">{t('history.myHistory')}</h2>
            <p className="text-red-500">{error}</p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="mt-4 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {t('history.backToDashboard')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {user.role === 'Supervisor' ? t('history.title') : t('history.myHistory')}
            </h1>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              {t('history.backToDashboard')}
            </button>
            <button 
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              {t('history.export')}
            </button>
          </div>
        </div>

        <HistoryFilter
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />
        
        {filteredChecklists.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">{t('history.noChecklists')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredChecklists.map((entry) => (
              <div 
                key={entry.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {t(`type.${entry.checklistType}`)} {t('detail.checklistDetails')}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      {entry.name} • {entry.date} • {entry.time}
                    </p>
                  </div>
                  <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    entry.completionPercentage === 100 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                      : entry.completionPercentage >= 80
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {entry.completionPercentage}%
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center text-sm mb-2">
                    <span className="text-gray-600 dark:text-gray-400">{t('history.status')}:</span>
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${
                      entry.supervisorName 
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {entry.supervisorName ? t('history.reviewed') : t('history.pendingReview')}
                    </span>
                  </div>
                  
                  {entry.supervisorName && (
                    <div className="text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">{t('history.reviewedBy')}:</span> {entry.supervisorName}
                      </p>
                      {entry.verifiedAt && (
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{t('history.on')}:</span> {entry.verifiedAt}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={() => handleViewDetail(entry.id)}
                    className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {user.role === 'Supervisor' ? t('checklist.submitReview') : t('history.viewDetails')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default HistoryPage;