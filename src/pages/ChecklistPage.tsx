
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ChecklistItem from '../components/ChecklistItem';
import { checklists } from '../data';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { saveOfflineChecklist } from '../utils/offlineStorage';

type ChecklistType = 'opening' | 'closing';

interface TaskState {
  task: string;
  isCompleted: boolean;
  remarks: string;
  isVerified: boolean;
  supervisorRemarks: string;
}

const ChecklistPage = () => {
  const { type } = useParams<{ type: ChecklistType }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<TaskState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // ADD THESE NEW STATES
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [checkingSubmission, setCheckingSubmission] = useState(true);

  // EXISTING useEffect for loading tasks
  useEffect(() => {
    const taskList = type ? checklists[type] : [];
    console.log(`Loading ${type} checklist with ${taskList.length} tasks:`, taskList);
    setTasks(taskList.map(task => ({
      task,
      isCompleted: false,
      remarks: '',
      isVerified: false,
      supervisorRemarks: ''
    })));
  }, [type]);

  // ADD THIS NEW useEffect - Check if already submitted today
  useEffect(() => {
    const checkTodaySubmission = async () => {
      // Only check for Officeboy
      if (user.role !== 'Officeboy') {
        setCheckingSubmission(false);
        return;
      }

      try {
        const today = new Date().toLocaleDateString();
        const storageKey = `lastSubmission_${user.name}_${type}_${today}`;
        
        console.log(`Checking for existing ${type} checklist submission for ${user.name} on ${today}`);
        console.log(`Storage key: ${storageKey}`);
        
        // First, check server data (primary source of truth)
        const VITE_APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL;
        if (VITE_APPSCRIPT_URL) {
          try {
            const response = await fetch(`${VITE_APPSCRIPT_URL}?action=getHistory`);
            const responseText = await response.text();
            
            let data;
            try {
              data = JSON.parse(responseText);
            } catch (parseError) {
              console.error('Error parsing server response:', responseText);
              // If there's an error parsing the response, we should allow submission
              setCheckingSubmission(false);
              return;
            }
            
            console.log(`Server data received for ${user.name}:`, data);
            console.log(`Looking for ${type} checklist on ${today}`);
            
            // Check if user already submitted this checklist type today
            const todaySubmission = data.find((entry: any) => {
              const entryDate = new Date(entry.date).toLocaleDateString();
              const matches = (
                entry.name === user.name &&
                entry.checklistType === type &&  // Critical: Must match the current checklist type
                entryDate === today
              );
              
              console.log(`Checking entry:`, entry, `Matches:`, matches, `Expected type: ${type}, Got type: ${entry.checklistType}`);
              return matches;
            });

            if (todaySubmission) {
              console.log(`Found server submission for ${type} checklist`, todaySubmission);
              setHasSubmittedToday(true);
              // Also save to localStorage for faster future checks
              localStorage.setItem(storageKey, new Date().toISOString());
              console.log(`Saved submission to localStorage with key: ${storageKey}`);
            } else {
              console.log(`No server submission found for ${type} checklist on ${today}`);
              // If no server submission found, also clear localStorage to avoid stale data
              localStorage.removeItem(storageKey);
            }
          } catch (networkError) {
            console.error('Network error while checking submission status:', networkError);
            // If there's a network error, we can't verify submission status,
            // so we'll proceed to let the user submit (to be safe)
            console.log('Network error occurred, proceeding with checklist access');
          }
        } else {
          // When no server URL is configured, only use localStorage
          // This is the fallback mode when Google Sheets integration isn't set up
          console.log('No server URL configured, checking localStorage only');
          const localSubmission = localStorage.getItem(storageKey);
          if (localSubmission) {
            console.log(`Found local submission for ${type} checklist`);
            setHasSubmittedToday(true);
          } else {
            console.log(`No local submission found for ${type} checklist`);
          }
        }
      } catch (error) {
        console.error('Error checking submission status:', error);
      } finally {
        setCheckingSubmission(false);
      }
    };

    checkTodaySubmission();
  }, [user.name, user.role, type]);

  const handleUpdateTask = (taskName: string, isCompleted: boolean, remarks: string, isVerified: boolean, supervisorRemarks: string) => {
    setTasks(currentTasks =>
      currentTasks.map(t =>
        t.task === taskName ? { ...t, isCompleted, remarks, isVerified, supervisorRemarks } : t
      )
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Prepare payload first
    const payload = {
      user: user.name,
      role: user.role,
      checklistType: type,
      tasks: tasks.map(task => ({
        taskName: task.task,
        status: task.isCompleted ? 'Completed' : 'Pending',
        remarks: task.remarks,
        supervisorRemarks: task.supervisorRemarks || ''
      })),
      timestamp: new Date().toISOString(),
      loginTime: new Date().toLocaleString(),
    };

    const VITE_APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL;

    // Check if offline BEFORE attempting fetch
    if (!navigator.onLine) {
      console.log('Offline mode detected - saving locally');
      saveOfflineChecklist(payload);
      alert('📱 You are offline. Checklist saved locally and will sync when you\'re back online.');
      setIsSubmitting(false);
      navigate('/dashboard');
      return;
    }

    // Check if API URL is configured
    if (!VITE_APPSCRIPT_URL) {
      console.error('API URL not configured - saving offline');
      saveOfflineChecklist(payload);
      alert('⚠️ Configuration error. Checklist saved offline.');
      setIsSubmitting(false);
      navigate('/dashboard');
      return;
    }

    // Try online submission with timeout
    try {
      // Add timeout to fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      await fetch(VITE_APPSCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      // Save to localStorage as backup even on success
      const today = new Date().toLocaleDateString();
      const storageKey = `lastSubmission_${user.name}_${type}_${today}`;
      localStorage.setItem(storageKey, new Date().toISOString());

      alert('✅ Checklist submitted successfully!');
      navigate('/dashboard');

    } catch (error: any) {
      console.error('Submission error object:', error);
      
      // Determine error type
      let errorMessage = 'An unexpected error occurred. Saved offline.';
      
      if (error.name === 'AbortError') {
        errorMessage = 'Request timeout. Saved offline.';
      } else if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('NetworkError'))) {
        errorMessage = 'Network error. Saved offline.';
      } else if (error.message) {
        errorMessage = `Submission failed: ${error.message}. Saved offline.`;
      }
      
      // Always save offline as fallback
      saveOfflineChecklist(payload);
      alert(`📱 ${errorMessage}\n\nYour checklist is saved and will sync automatically when you\'re back online.`);
      navigate('/dashboard');
      
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = type ? t(`checklist.${type}`) : 'Checklist';
  const allTasksCompleted = tasks.every(t => t.isCompleted);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
              {user.role === 'Supervisor' ? `${t('checklist.reviewNote')} ${title}` : title}
            </h2>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              {t('history.backToDashboard')}
            </button>
          </div>
          
          {user.role === 'Supervisor' && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200">
                <strong>{t('checklist.reviewNote')}:</strong> {t('checklist.supervisorNote')}
              </p>
            </div>
          )}
          
          <div className="space-y-4">
            {tasks.map((taskState) => (
              <ChecklistItem
                key={taskState.task}
                task={taskState.task}
                onUpdate={handleUpdateTask}
              />
            ))}
          </div>
          <div className="mt-8 text-center">
            {/* Submit/Review Buttons */}
{checkingSubmission ? (
  <div className="text-center py-4">
    <p className="text-gray-600 dark:text-gray-400">
      {t('checklist.checkingStatus')}
    </p>
  </div>
) : hasSubmittedToday && user.role === 'Officeboy' ? (
  <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-6 text-center">
    <svg className="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
      {t('checklist.alreadySubmitted')}
    </h3>
    <p className="text-gray-600 dark:text-gray-300 mb-4">
      {t('checklist.alreadySubmittedMsg', { type: type ? t(`type.${type}`) : '' })}
    </p>
    <button
      onClick={() => navigate('/dashboard')}
      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300"
    >
      {t('checklist.backToDashboard')}
    </button>
  </div>
) : (
  <>
    {user.role === 'Officeboy' && (
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !allTasksCompleted}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Checklist'}
      </button>
    )}
    {user.role === 'Supervisor' && (
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Reviewing...' : 'Submit Review'}
      </button>
    )}
  </>
)}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChecklistPage;
