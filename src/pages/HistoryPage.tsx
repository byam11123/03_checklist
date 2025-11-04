import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useUser } from '../context/UserContext';

const HistoryPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Checklist History</h2>
          <p className="text-gray-600 dark:text-gray-400">History page is under development</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;