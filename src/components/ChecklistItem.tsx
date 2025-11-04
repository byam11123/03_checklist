
import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

interface ChecklistItemProps {
  task: string;
  onUpdate: (task: string, status: boolean, remarks: string, isVerified: boolean, supervisorRemarks: string) => void;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ task, onUpdate }) => {
  const { user } = useUser();
  const [isCompleted, setIsCompleted] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [supervisorRemarks, setSupervisorRemarks] = useState('');

  const handleCompletionChange = () => {
    const newStatus = !isCompleted;
    setIsCompleted(newStatus);
    onUpdate(task, newStatus, remarks, isVerified, supervisorRemarks);
  };

  const handleRemarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRemarks(e.target.value);
    onUpdate(task, isCompleted, e.target.value, isVerified, supervisorRemarks);
  };
  
  const handleVerificationChange = () => {
    const newVerifiedStatus = !isVerified;
    setIsVerified(newVerifiedStatus);
    onUpdate(task, isCompleted, remarks, newVerifiedStatus, supervisorRemarks);
  };

  const handleSupervisorRemarksChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSupervisorRemarks(e.target.value);
    onUpdate(task, isCompleted, remarks, isVerified, e.target.value);
  };

  const isOfficeboy = user.role === 'Officeboy';
  const isSupervisor = user.role === 'Supervisor';

  return (
    <div className={`p-4 rounded-lg transition-colors duration-300 ${isCompleted ? 'bg-green-100 dark:bg-green-900' : 'bg-white dark:bg-gray-800'}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {isOfficeboy && (
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={handleCompletionChange}
              className="h-6 w-6 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              disabled={!isOfficeboy} // Disable for supervisor
            />
          )}
          {isSupervisor && (
             <div className="w-6 h-6 flex items-center justify-center">
                {isCompleted ? <span className="text-green-500">✔️</span> : <span className="text-red-500">❌</span>}
             </div>
          )}
        </div>

        <div className="flex-grow">
          <p className={`font-medium ${isCompleted ? 'line-through text-gray-500' : 'text-gray-900 dark:text-gray-200'}`}>
            {task}
          </p>
          {isOfficeboy && (
            <input
              type="text"
              placeholder="Add remarks (optional)"
              value={remarks}
              onChange={handleRemarksChange}
              className="w-full mt-2 p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={!isOfficeboy}
            />
          )}
           {isSupervisor && remarks && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1"><strong>Remarks:</strong> {remarks}</p>
          )}
        </div>

        {isSupervisor && isCompleted && (
          <div className="flex-shrink-0 flex flex-col items-end">
             <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={isVerified}
                    onChange={handleVerificationChange}
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Verify</label>
             </div>
             {isVerified && (
                <input
                    type="text"
                    placeholder="Supervisor remarks"
                    value={supervisorRemarks}
                    onChange={handleSupervisorRemarksChange}
                    className="w-full mt-2 p-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistItem;
