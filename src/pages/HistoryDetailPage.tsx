import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { checklistService } from '../api/checklistService';
import type { ChecklistEntry } from '../types/checklist';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';

const HistoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [checklist, setChecklist] = useState<ChecklistEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChecklistDetail = async () => {
      try {
        if (!id) {
          setError('Checklist ID is required');
          setLoading(false);
          return;
        }
        const data = await checklistService.fetchChecklistDetail(id);
        if (data) {
          setChecklist(data);
        } else {
          console.warn(`Checklist with ID ${id} not found. Using mock data fallback.`);
          // Set a fallback checklist if none found with the given ID
          setChecklist({
            id: id,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            role: 'Officeboy',
            checklistType: 'opening',
            name: 'Unknown User',
            tasks: [],
            completedTasks: 0,
            totalTasks: 0,
            completionPercentage: 0,
            supervisorName: '',
            supervisorVerified: '',
            verifiedAt: ''
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Error loading checklist detail:', err);
        setError('Failed to load checklist details');
        setLoading(false);
      }
    };

    loadChecklistDetail();
  }, [id]);

  const handleReviewTask = (taskIndex: number, remarks: string) => {
    if (!checklist) return;

    const updatedTasks = [...checklist.tasks];
    updatedTasks[taskIndex] = {
      ...updatedTasks[taskIndex],
      supervisorRemarks: remarks
    };

    setChecklist({
      ...checklist,
      tasks: updatedTasks
    });
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('detail.loading')}</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !checklist) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              {t('detail.checklistDetails')}
            </h2>
            <p className="text-red-500">{error || t('detail.notFound')}</p>
            <button
              onClick={() => navigate('/history')}
              className="mt-4 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              {t('detail.backToHistory')}
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 printable-area">
        <div className="print-only print-header">
          <h1>{t(`type.${checklist.checklistType}`)} {t('detail.checklistDetails')}</h1>
        </div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200">
            {t(`type.${checklist.checklistType}`)} {t('detail.checklistDetails')}
          </h2>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 no-print"
          >
            {t('detail.print')}
          </button>
          <button
            onClick={() => navigate('/history')}
            className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 no-print"
          >
            {t('detail.backToHistory')}
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('detail.checklistInfo')}</h3>
              <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">{t('detail.user')}:</span> {checklist.name}</p>
              <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">{t('detail.date')}:</span> {checklist.date}</p>
              <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">{t('detail.time')}:</span> {checklist.time}</p>
              <p className="text-gray-600 dark:text-gray-400"><span className="font-medium">{t('detail.type')}:</span> {t(`type.${checklist.checklistType}`)}</p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">{t('detail.progress')}:</span> {checklist.completedTasks}/{checklist.totalTasks} {t('history.tasksCompleted')} ({checklist.completionPercentage}%)
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{t('detail.reviewStatus')}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium">{t('detail.status')}:</span>
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  checklist.supervisorName
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  {checklist.supervisorName ? t('history.reviewed') : t('history.pendingReview')}
                </span>
              </p>
              {checklist.supervisorName && (
                <>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{t('history.reviewedBy')}:</span> {checklist.supervisorName}
                  </p>
                  {checklist.verifiedAt && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">{t('history.on')}:</span> {checklist.verifiedAt}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-6">{t('detail.tasks')}</h3>
          
          <div className="space-y-4">
            {checklist.tasks.map((task, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg transition-colors duration-300 ${
                  task.status === 'Completed' 
                    ? 'bg-green-50 dark:bg-green-900/30' 
                    : 'bg-red-50 dark:bg-red-900/30'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full ${
                      task.status === 'Completed' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {task.status === 'Completed' ? '✓' : '✗'}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">{task.taskName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="font-medium">{t('detail.status')}:</span> {t(task.status === 'Completed' ? 'common.completed' : 'common.pending')}
                      </p>
                      {task.remarks && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="font-medium">{t('detail.officeboyRemarks')}:</span> {task.remarks}
                        </p>
                      )}
                      {task.supervisorRemarks && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                          <span className="font-medium">{t('detail.supervisorRemarks')}:</span> {task.supervisorRemarks}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {user.role === 'Supervisor' && (
                    <div className="mt-3 md:mt-0 md:ml-4 flex flex-col w-full md:w-auto">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('detail.supervisorRemarksLabel')}
                      </label>
                      <input
                        type="text"
                        value={task.supervisorRemarks || ''}
                        onChange={(e) => handleReviewTask(index, e.target.value)}
                        placeholder={t('detail.remarksPlaceholder')}
                        className="w-full md:w-64 p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 no-print"
            >
              {t('detail.print')}
            </button>
            <button
              onClick={() => navigate('/history')}
              className="px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 no-print"
            >
              {t('detail.backToHistory')}
            </button>
          </div>
        </div>

        <div className="print-only mt-8">
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="font-semibold">{t('detail.employeeSignature')}</p>
              <div className="border-t border-gray-400 mt-8"></div>
            </div>
            <div>
              <p className="font-semibold">{t('detail.supervisorSignature')}</p>
              <div className="border-t border-gray-400 mt-8"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HistoryDetailPage;