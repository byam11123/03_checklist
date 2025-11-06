
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        
        setIsSubmitted(true);
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
            {user.role === 'Officeboy' && (
              <button
                onClick={handleSubmit}
                disabled={(!allTasksCompleted || isSubmitted) || isSubmitting}
                className="w-full md:w-auto px-6 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {isSubmitting ? t('checklist.submitting') : isSubmitted ? t('common.completed') : t('checklist.submitChecklist')}
              </button>
            )}
            {user.role === 'Supervisor' && (
              <button
                onClick={handleSubmit} // Supervisors also submit their verifications
                disabled={isSubmitting}
                className="w-full md:w-auto px-6 py-3 font-semibold text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                {isSubmitting ? t('checklist.reviewing') : t('checklist.submitReview')}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChecklistPage;
