
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

const Header = () => {
  const { user, logout } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md dark:bg-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{t('login.title')}</h1>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t(user.role === 'Supervisor' ? 'login.supervisor' : 'login.officeboy')}</p>
          </div>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {t('dashboard.logout')}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
