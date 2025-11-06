
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { checklistService } from '../api/checklistService';
import type { ChecklistEntry } from '../types/checklist';
import DashboardStats from '../components/DashboardStats';

const DashboardPage = () => {
  const { user } = useUser();
  const { t } = useLanguage();
  const [entries, setEntries] = useState<ChecklistEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await checklistService.fetchChecklistHistory();
        setEntries(history);
      } catch (error) {
        console.error('Error fetching checklist history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('dashboard.welcome')}, {user.name}!</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('dashboard.openingDesc')}</p>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats entries={entries} isLoading={isLoading} />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-8">
          {/* Opening and Closing Checklist Links - Only show for Office Boy */}
          {user.role === 'Officeboy' && (
            <>
              <Link to="/checklist/opening">
                <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-xl md:text-2xl font-bold mb-2">
                        {t('dashboard.openingChecklist')}
                      </h3>
                      <p className="text-indigo-100 text-sm md:text-base">
                        {t('dashboard.openingDesc')}
                      </p>
                    </div>
                    <svg className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </Link>
              <Link to="/checklist/closing">
                <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full">
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <h3 className="text-xl md:text-2xl font-bold mb-2">
                        {t('dashboard.closingChecklist')}
                      </h3>
                      <p className="text-teal-100 text-sm md:text-base">
                        {t('dashboard.closingDesc')}
                      </p>
                    </div>
                    <svg className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
              </Link>
            </>
          )}
          <Link to="/history">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">
                    {t('dashboard.viewHistory')}
                  </h3>
                  <p className="text-blue-100 text-sm md:text-base">
                    {t('dashboard.historyDesc')}
                  </p>
                </div>
                <svg className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </Link>
          {/* Summary Report Button - Only for Supervisor */}
          {user.role === 'Supervisor' && (
            <Link to="/summary">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 h-full">
                <div className="flex items-center justify-between">
                  <div className="text-left">
                    <h3 className="text-xl md:text-2xl font-bold mb-2">
                      {t('dashboard.summaryReport')}
                    </h3>
                    <p className="text-purple-100 text-sm md:text-base">
                      {t('dashboard.summaryReportDesc')}
                    </p>
                  </div>
                  <svg className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </Link>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
