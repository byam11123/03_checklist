import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useUser } from '../context/UserContext';

const HistoryDetailPage = () => {
  const params = useParams();
  const id = params.id as string;
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            Checklist Details
          </h2>
          <p className="text-gray-600 dark:text-gray-400">Details for checklist {id} would be shown here</p>
          <button
            onClick={() => navigate('/history')}
            className="mt-4 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Back to History
          </button>
        </div>
      </main>
    </div>
  );
};

export default HistoryDetailPage;