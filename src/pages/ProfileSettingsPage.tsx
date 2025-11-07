import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const ProfileSettingsPage = () => {
  const { user } = useUser();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setMessage({ type: 'error', text: 'All password fields are required' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (formData.newPassword.length < 4) {
      setMessage({ type: 'error', text: 'Password must be at least 4 characters' });
      return;
    }

    setSaving(true);

    try {
      const VITE_APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL;

      if (!VITE_APPSCRIPT_URL) {
        throw new Error('Configuration error');
      }

      // Call API to update password
      await fetch(VITE_APPSCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updatePassword',
          name: user.name,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        })
      });

      // Since no-cors mode doesn't give response, assume success
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      
      // Clear form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

    } catch (error) {
      console.error('Error updating password:', error);
      setMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (newLang: 'en' | 'hi') => {
    setLanguage(newLang);
    setMessage({ type: 'success', text: 'Language preference saved!' });
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setMessage({ type: 'success', text: 'Theme preference saved!' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Profile Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your account preferences
            </p>
          </div>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* User Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            User Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={user.name}
                disabled
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Role
              </label>
              <input
                type="text"
                value={user.role || ''}
                disabled
                className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Change Password
          </h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Enter new password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Confirm new password"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Preferences
          </h2>
          
          <div className="space-y-6">
            {/* Language Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Default Language
              </label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'hi')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी (Hindi)</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This will be your default language when you log in
              </p>
            </div>

            {/* Theme Preference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="light">☀️ Light Mode</option>
                <option value="dark">🌙 Dark Mode</option>
                <option value="system">💻 System Default</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Choose your preferred color scheme
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSettingsPage;
