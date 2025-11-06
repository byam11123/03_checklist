
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ChecklistItem from '../components/ChecklistItem';
import { checklists } from '../data';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

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
        
        // Check localStorage first (quick check)
        const localSubmission = localStorage.getItem(storageKey);
        if (localSubmission) {
          setHasSubmittedToday(true);
          setCheckingSubmission(false);
          return;
        }

        // Also check from server (more reliable)
        const VITE_APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL;
        if (VITE_APPSCRIPT_URL) {
          const response = await fetch(`${VITE_APPSCRIPT_URL}?action=getHistory`);
          const data = await response.json();
          
          // Check if user already submitted this checklist type today
          const todaySubmission = data.find((entry: any) => {
            const entryDate = new Date(entry.date).toLocaleDateString();
            return (
              entry.name === user.name &&
              entry.checklistType === type &&
              entryDate === today
            );
          });

          if (todaySubmission) {
            setHasSubmittedToday(true);
            // Also save to localStorage for faster future checks
            localStorage.setItem(storageKey, new Date().toISOString());
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

  // Format date and time in a readable format
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).replace(',', '');
  };

  const handleSubmit = () => {
    const VITE_APPSCRIPT_URL = import.meta.env.VITE_APPSCRIPT_URL;
    
    // Calculate completion statistics
    const completedTasks = tasks.filter(task => task.isCompleted).length;
    const totalTasks = tasks.length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    console.log('Submitting data to Google Sheets...');
    console.log(`Total tasks: ${totalTasks}, Completed tasks: ${totalTasks}`);
    
    setIsSubmitting(true);
    
    // Send all tasks as a single batch to avoid duplicate submission issues
    const currentDateTime = new Date();
    const payload: any = {
      user: user.name,
      role: user.role,
      checklistType: type,
      tasks: tasks.map(task => ({
        taskName: task.task,
        status: task.isCompleted ? 'Completed' : 'Pending',
        remarks: task.remarks,
        supervisorRemarks: task.supervisorRemarks
      })),
      timestamp: formatDateTime(currentDateTime),
      completedTasks: completedTasks,
      totalTasks: totalTasks,
      completionPercentage: completionPercentage,
      loginTime: formatDateTime(currentDateTime),
      supervisor: user.role === 'Supervisor' ? user.name : '',
      supervisorTimestamp: user.role === 'Supervisor' ? formatDateTime(currentDateTime) : '',
      supervisorRemarks: user.role === 'Supervisor' ? 'Supervisor review' : '' // Add supervisor remarks field
    };
    
    // If this is a supervisor, they are updating an existing checklist
    if (user.role === 'Supervisor') {
      // Get the checklist ID from URL parameter to update the existing row
      const urlParams = new URLSearchParams(window.location.search);
      const checklistId = urlParams.get('checklistId');
      if (checklistId) {
        payload.checklistId = parseInt(checklistId);
      }
    }
    
    console.log('Batch payload:', payload);

    if (VITE_APPSCRIPT_URL) {
      // Submit the entire checklist as one request
      fetch(VITE_APPSCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script requires no-cors mode from web applications
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })
      .then(() => {
        // With no-cors mode, we can't access response details
        console.log('Batch request sent for checklist type:', type);
        
        // For Office Boys, record the submission in localStorage to prevent duplicate attempts
        if (user.role === 'Officeboy' && type) {
          const today = new Date().toLocaleDateString();
          const storageKey = `lastSubmission_${user.name}_${type}_${today}`;
          localStorage.setItem(storageKey, new Date().toISOString());
        }
        

        if (user?.role === 'Supervisor') {
          alert(`Supervisor verification has been saved successfully! You can view it in History.`);
        } else {
          alert(`Checklist has been submitted successfully! ${totalTasks} tasks sent.`);
        }
        
        if (user?.role === 'Supervisor') {
          navigate('/history');
        } else {
          navigate('/dashboard');
        }
      })
      .catch(error => {
        console.error('Network error sending batch data:', error);
        console.error('Full error object:', error);
        console.error('URL being called:', VITE_APPSCRIPT_URL);
        alert(`Error submitting checklist: ${error.message}`);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
    } else {
      console.warn('VITE_APPSCRIPT_URL is not set. Data will not be sent to Google Sheets.');
      alert('Warning: Google Apps Script URL is not configured. Data will not be saved.');
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
