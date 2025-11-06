
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

const DashboardPage = () => {
  const { user } = useUser();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">{t('dashboard.welcome')}, {user.name}!</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('dashboard.openingDesc')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Opening and Closing Checklist Links - Only show for Office Boy */}
          {user.role === 'Officeboy' && (
            <>
              <Link to="/checklist/opening">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">{t('dashboard.openingChecklist')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">{t('dashboard.openingDesc')}</p>
                </div>
              </Link>
              <Link to="/checklist/closing">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-2xl font-semibold text-teal-600 dark:text-teal-400">{t('dashboard.closingChecklist')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">{t('dashboard.closingDesc')}</p>
                </div>
              </Link>
            </>
          )}
          <Link to="/history">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
              <h3 className="text-2xl font-semibold text-purple-600 dark:text-purple-400">{t('dashboard.viewHistory')}</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">{t('dashboard.historyDesc')}</p>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
