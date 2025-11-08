import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { checklistService } from '../api/checklistService';
import type { ChecklistEntry } from '../types/checklist';
import { useUser } from '../context/UserContext';
import { useLanguage } from '../context/LanguageContext';
import { getSupervisorTemplates } from '../config/remarkTemplates';

const HistoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [checklist, setChecklist] = useState<ChecklistEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supervisorTemplates = getSupervisorTemplates();
  const [showTemplates, setShowTemplates] = useState<{ [key: number]: boolean }>({});

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

  const selectTemplate = (template: string, taskIndex: number) => {
    handleReviewTask(taskIndex, template);
    setShowTemplates(prev => ({ ...prev, [taskIndex]: false }));
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 printable-area">
        <div className="print-only print-header">
          <h1>{t(`type.${checklist.checklistType}`)} {t('detail.checklistDetails')}</h1>
        </div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t(`type.${checklist.checklistType}`)} {t('detail.checklistDetails')}
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 no-print"
            >
              {t('detail.print')}
            </button>
            <button
              onClick={() => navigate('/history')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 no-print"
            >
              {t('detail.backToHistory')}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Checklist Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">{t('detail.user')}:</span> {checklist.name}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">{t('detail.date')}:</span> {checklist.date}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">{t('detail.time')}:</span> {checklist.time}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">{t('detail.type')}:</span> {t(`type.${checklist.checklistType}`)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">{t('detail.progress')}:</span> 
                <span className={`inline-flex ml-2 px-2 py-1 rounded-full text-sm font-medium ${
                  checklist.completionPercentage === 100 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                    : checklist.completionPercentage >= 80
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {checklist.completedTasks}/{checklist.totalTasks} {t('history.tasksCompleted')} ({checklist.completionPercentage}%)
                </span>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">{t('detail.status')}:</span>
                <span className={`inline-flex ml-2 px-2 py-1 rounded-full text-sm font-medium ${
                  checklist.supervisorName
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {checklist.supervisorName ? t('history.reviewed') : t('history.pendingReview')}
                </span>
              </p>
              {checklist.supervisorName && (
                <>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{t('history.reviewedBy')}:</span> {checklist.supervisorName}
                  </p>
                  {checklist.verifiedAt && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium text-gray-700 dark:text-gray-300">{t('history.on')}:</span> {checklist.verifiedAt}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('detail.tasks')}</h3>
          
          <div className="space-y-4">
            {checklist.tasks.map((task, index) => (
              <div 
                key={index} 
                className={`p-6 rounded-lg transition-colors duration-300 ${
                  task.status === 'Completed' 
                    ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
                    : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full ${
                      task.status === 'Completed' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {task.status === 'Completed' ? '✓' : '✗'}
                    </span>
                    <div>
                      <p className="font-medium text-lg text-gray-900 dark:text-white">{task.taskName}</p>
                      <div className="flex items-center mt-2">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          task.status === 'Completed' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {t(task.status === 'Completed' ? 'common.completed' : 'common.pending')}
                        </span>
                      </div>
                      {task.remarks && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{t('detail.officeboyRemarks')}:</span> {task.remarks}
                        </p>
                      )}
                      {task.supervisorRemarks && (
                        <p className="text-blue-600 dark:text-blue-400 mt-2">
                          <span className="font-medium text-blue-700 dark:text-blue-300">{t('detail.supervisorRemarks')}:</span> {task.supervisorRemarks}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {user.role === 'Supervisor' && (
                    <div className="mt-4 md:mt-0 md:ml-4 flex flex-col w-full md:w-80 relative">
                      <label className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('detail.supervisorRemarksLabel')}
                      </label>
                      <div className="flex gap-2">
                        <textarea
                          value={task.supervisorRemarks || ''}
                          onChange={(e) => handleReviewTask(index, e.target.value)}
                          placeholder={t('detail.remarksPlaceholder')}
                          rows={2}
                          className="flex-1 px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowTemplates(prev => ({ ...prev, [index]: !prev[index] }))}
                          className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm self-start"
                          title="Quick Templates"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                          </svg>
                        </button>
                      </div>

                      {showTemplates[index] && (
                        <div className="absolute z-10 mt-1 right-0 w-72 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                          {Object.entries(supervisorTemplates).map(([category, templates]) => (
                            <div key={category} className="p-2 border-t border-gray-200 dark:border-gray-600">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">{category}</p>
                              {templates.map((template, idx) => (
                                <button
                                  key={`${category}-${idx}`}
                                  type="button"
                                  onClick={() => selectTemplate(template, index)}
                                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                >
                                  {template}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-end gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 no-print"
            >
              {t('detail.print')}
            </button>
            <button
              onClick={() => navigate('/history')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 no-print"
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