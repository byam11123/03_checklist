import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { checklistService } from '../api/checklistService';
import type { ChecklistEntry } from '../types/checklist';
import { useUser } from '../context/UserContext';

const HistoryPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [checklists, setChecklists] = useState<ChecklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleViewDetail = (id: string) => {
    navigate(`/history/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading checklists...</p>
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
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-6">Checklist History</h2>
            <p className="text-red-500">{error}</p>
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
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {user.role === 'Supervisor' ? 'Office Boy Checklists' : 'My Checklist History'}
          </h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
        
        {checklists.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No checklists found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {checklists.map((entry) => (
              <div 
                key={entry.id} 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                      {entry.checklistType.charAt(0).toUpperCase() + entry.checklistType.slice(1)} Checklist
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {entry.name} • {entry.date} • {entry.time}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {entry.completedTasks}/{entry.totalTasks} tasks completed ({entry.completionPercentage}%)
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    entry.completionPercentage === 100 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {entry.checklistType.toUpperCase()}
                  </span>
                </div>
                
                <div className="mt-4">
                  <div className="flex items-center text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status:</span>
                    <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {entry.supervisorName ? 'Reviewed' : 'Pending Review'}
                    </span>
                  </div>
                  
                  {entry.supervisorName && (
                    <div className="mt-2 text-sm">
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Reviewed by:</span> {entry.supervisorName}
                      </p>
                      {entry.verifiedAt && (
                        <p className="text-gray-600 dark:text-gray-400">
                          <span className="font-medium">On:</span> {entry.verifiedAt}
                        </p>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={() => handleViewDetail(entry.id)}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {user.role === 'Supervisor' ? 'Review' : 'View Details'}
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