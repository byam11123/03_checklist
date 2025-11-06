import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

const LoginPage = () => {
  const { login } = useUser();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  const [userList, setUserList] = useState<string[]>([]);
  const [selectedName, setSelectedName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch user list on component mount
  useEffect(() => {
    const fetchUserList = async () => {
      const VITE_APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL;
      
      if (!VITE_APPSCRIPT_URL) {
        console.warn('VITE_APPSCRIPT_URL not set');
        return;
      }

      try {
        const response = await fetch(`${VITE_APPSCRIPT_URL}?action=getUserList`);
        const data = await response.json();
        
        if (data.result === 'success') {
          setUserList(data.users);
        } else {
          console.error('Error fetching user list:', data.message);
        }
      } catch (err) {
        console.error('Error fetching user list:', err);
      }
    };

    fetchUserList();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const VITE_APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL;

    if (!VITE_APPSCRIPT_URL) {
      setError('Configuration error. Please contact administrator.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${VITE_APPSCRIPT_URL}?action=authenticate&name=${encodeURIComponent(selectedName)}&password=${encodeURIComponent(password)}`
      );
      const data = await response.json();

      if (data.result === 'success') {
        // Login successful
        login(data.user.name, data.user.role);
        navigate('/dashboard');
      } else {
        // Login failed
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            {t('login.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            {t('login.subtitle')}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('login.name')}
            </label>
            <select
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">{t('login.selectName')}</option>
              {userList.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('login.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('login.passwordPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('login.signingIn') : t('login.signIn')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;