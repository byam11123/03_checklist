
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

const LoginPage = () => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<'Officeboy' | 'Supervisor'>('Officeboy');
  const navigate = useNavigate();
  const { login } = useUser();
  const { language, setLanguage, t } = useLanguage();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      login(name.trim(), role);
      // Here you would also record the login timestamp to Google Sheets
      console.log(`Login: ${name}, Role: ${role}, Timestamp: ${new Date().toISOString()}`);
      navigate('/dashboard');
    } else {
      alert('Please enter your name.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="absolute top-4 right-4">
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('login.title')}</h1>
          <p className="mt-2 text-sm text-gray-600">{t('login.subtitle')}</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700">{t('login.name')}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('login.namePlaceholder')}
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="text-sm font-medium text-gray-700">{t('login.role')}</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'Officeboy' | 'Supervisor')}
              className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Officeboy">{t('login.officeboy')}</option>
              <option value="Supervisor">{t('login.supervisor')}</option>
            </select>
          </div>
          <label htmlFor="language" className="text-sm font-medium text-gray-700">{t('login.language')}</label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'en' | 'hi')}
            className="w-full px-3 py-2 mt-1 text-gray-900 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी</option>
          </select>
          <button
            type="submit"
            className="w-full py-2 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('login.signIn')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
