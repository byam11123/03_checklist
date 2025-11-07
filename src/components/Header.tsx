import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useLanguage } from "../context/LanguageContext";
import { checklistService } from "../api/checklistService";

const Header = () => {
  const { user, logout } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const [pendingReviews, setPendingReviews] = useState(0);

  useEffect(() => {
    if (user.role === "Supervisor") {
      const fetchPendingReviews = async () => {
        try {
          const history = await checklistService.fetchChecklistHistory();
          const pendingCount = history.filter(
            (entry) => !entry.supervisorVerified
          ).length;
          setPendingReviews(pendingCount);
        } catch (error) {
          console.error("Error fetching pending reviews:", error);
        }
      };

      fetchPendingReviews();

      const intervalId = setInterval(fetchPendingReviews, 30000);

      return () => clearInterval(intervalId);
    }
  }, [user.role]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white shadow-md dark:bg-gray-800 no-print">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('login.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {t('dashboard.welcome')}, {user.name}
            </p>
          </div>

          {/* Profile Settings Link */}
          <button
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Profile Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-sm">Profile</span>
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/history" className="text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.248 24.248 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            {user.role === 'Supervisor' && pendingReviews > 0 && (
              <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white animate-pulse">
                {pendingReviews > 99 ? '99+' : pendingReviews}
              </span>
            )}
          </Link>
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
