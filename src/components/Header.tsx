
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Header = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHistoryClick = () => {
    navigate('/history');
  };

  return (
    <header className="bg-white shadow-md dark:bg-gray-800">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">Daily Checklist</h1>
        <div className="flex items-center space-x-4">
          {user?.role === 'Supervisor' && location.pathname !== '/history' && (
            <button
              onClick={handleHistoryClick}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              History
            </button>
          )}
          <div className="text-right">
            <p className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
