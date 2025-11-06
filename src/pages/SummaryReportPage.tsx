
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { checklistService } from '../api/checklistService';
import { useUser } from '../context/UserContext';
import { exportToExcel } from '../utils/exportUtils';
import type { ChecklistEntry } from '../types/checklist';

const SummaryReportPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // Redirect if user is not a supervisor (but only after loading is complete)
  useEffect(() => {
    if (user.role && user.role !== 'Supervisor') {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0]
  });
  
  const [checklists, setChecklists] = useState<ChecklistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    openingCount: 0,
    closingCount: 0,
    avgCompletion: 0,
    reviewedCount: 0,
    pendingCount: 0,
    userStats: [] as { name: string; count: number; avgCompletion: number }[],
    issueFrequency: [] as { issue: string; count: number }[]
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await checklistService.fetchChecklistHistory();
        
        // Filter by date range
        const filtered = data.filter((entry: ChecklistEntry) => {
          const entryDate = new Date(entry.date);
          const formattedEntryDate = new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate());
          const fromDate = new Date(dateRange.from);
          const toDate = new Date(dateRange.to);
          
          return formattedEntryDate >= fromDate && formattedEntryDate <= toDate;
        });

        setChecklists(filtered);
        
        // Calculate statistics
        const totalSubmissions = filtered.length;
        const openingCount = filtered.filter((e: ChecklistEntry) => e.checklistType === 'opening').length;
        const closingCount = filtered.filter((e: ChecklistEntry) => e.checklistType === 'closing').length;
        
        const avgCompletion = totalSubmissions > 0
          ? Math.round(
              filtered.reduce((sum: number, e: ChecklistEntry) => sum + e.completionPercentage, 0) / totalSubmissions
            )
          : 0;
        
        const reviewedCount = filtered.filter((e: ChecklistEntry) => e.supervisorName).length;
        const pendingCount = filtered.filter((e: ChecklistEntry) => !e.supervisorName).length;
        
        // User-wise statistics
        const userMap = new Map<string, { count: number; totalCompletion: number }>();
        filtered.forEach((entry: ChecklistEntry) => {
          const existing = userMap.get(entry.name) || { count: 0, totalCompletion: 0 };
          userMap.set(entry.name, {
            count: existing.count + 1,
            totalCompletion: existing.totalCompletion + entry.completionPercentage
          });
        });
        
        const userStats = Array.from(userMap.entries()).map(([name, data]) => ({
          name,
          count: data.count,
          avgCompletion: Math.round(data.totalCompletion / data.count)
        })).sort((a, b) => b.count - a.count);
        
        // Issue frequency analysis (from remarks)
        const issueMap = new Map<string, number>();
        filtered.forEach((entry: ChecklistEntry) => {
          entry.tasks.forEach(task => {
            if (task.status === 'Pending' || task.remarks.toLowerCase().includes('issue') || 
                task.remarks.toLowerCase().includes('not working') || task.remarks.toLowerCase().includes('problem')) {
              const issue = task.taskName;
              issueMap.set(issue, (issueMap.get(issue) || 0) + 1);
            }
          });
        });
        
        const issueFrequency = Array.from(issueMap.entries())
          .map(([issue, count]) => ({ issue, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5 issues
        
        setStats({
          totalSubmissions,
          openingCount,
          closingCount,
          avgCompletion,
          reviewedCount,
          pendingCount,
          userStats,
          issueFrequency
        });
        
      } catch (error) {
        console.error('Error loading summary data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dateRange]);

  const handleExport = () => {
    exportToExcel(checklists, `summary-report-${dateRange.from}-to-${dateRange.to}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600 dark:text-gray-400">Loading summary...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Summary Report
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Analyze checklist performance and trends
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Back
            </button>
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Date Range Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Select Date Range
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* Total Submissions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Submissions</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalSubmissions}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Opening: {stats.openingCount} | Closing: {stats.closingCount}
            </p>
          </div>

          {/* Average Completion */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Completion Rate</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.avgCompletion}%</p>
          </div>

          {/* Review Status */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Review Status</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.reviewedCount}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Pending: {stats.pendingCount}
            </p>
          </div>
        </div>

        {/* User Performance */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Performance
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Submissions</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Completion</th>
                </tr>
              </thead>
              <tbody>
                {stats.userStats.map((user, index) => (
                  <tr key={index} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{user.name}</td>
                    <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{user.count}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        user.avgCompletion >= 90 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : user.avgCompletion >= 70
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {user.avgCompletion}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Issues */}
        {stats.issueFrequency.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Recurring Issues
            </h3>
            <div className="space-y-3">
              {stats.issueFrequency.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <span className="text-gray-900 dark:text-white font-medium">{item.issue}</span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {item.count} times
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SummaryReportPage;
