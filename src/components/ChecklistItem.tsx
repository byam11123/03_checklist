import { useState } from 'react';
import { getOfficebyTemplates } from '../config/remarkTemplates';

interface ChecklistItemProps {
task: string;
onUpdate: (taskName: string, isCompleted: boolean, remarks: string, isVerified: boolean, supervisorRemarks: string) => void;
}

const ChecklistItem = ({ task, onUpdate }: ChecklistItemProps) => {
const [isCompleted, setIsCompleted] = useState(false);
const [remarks, setRemarks] = useState('');
const [showTemplates, setShowTemplates] = useState(false);
const officeboyTemplates = getOfficebyTemplates();

const handleCheckboxChange = (checked: boolean) => {
setIsCompleted(checked);
onUpdate(task, checked, remarks, false, '');
};

const handleRemarksChange = (value: string) => {
setRemarks(value);
onUpdate(task, isCompleted, value, false, '');
};

const selectTemplate = (template: string) => {
setRemarks(template);
onUpdate(task, isCompleted, template, false, '');
setShowTemplates(false);
};

return (
<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
<div className="flex items-start gap-4">
        {/* Checkbox */}
<input
type="checkbox"
checked={isCompleted}
onChange={(e) => handleCheckboxChange(e.target.checked)}
className="mt-1 w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
/>

        {/* Task Details */}
        <div className="flex-1">
          <h3 className={`text-lg font-medium mb-3 ${
            isCompleted
              ? 'text-green-600 dark:text-green-400 line-through'
              : 'text-gray-900 dark:text-white'
          }`}>
            {task}
          </h3>

          {/* Remarks Section with Templates */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Remarks (Optional)
            </label>

            <div className="flex gap-2">
              <textarea
                value={remarks}
                onChange={(e) => handleRemarksChange(e.target.value)}
                placeholder="Add any comments or issues..."
                rows={2}
                className="flex-1 px-3 py-2 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />

              {/* Template Button */}
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm self-start"
                title="Quick Templates"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Template Dropdown */}
            {showTemplates && (
              <div className="absolute z-10 mt-1 right-0 w-72 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {/* Working */}
                <div className="p-2">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">✓ Working Fine</p>
                  {officeboyTemplates.working.map((template, idx) => (
                    <button
                      key={`work-${idx}`}
                      type="button"
                      onClick={() => selectTemplate(template)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
                    >
                      {template}
                    </button>
                  ))}
                </div>

                {/* Issues */}
                <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">⚠️ Issues</p>
                  {officeboyTemplates.issues.map((template, idx) => (
                    <button
                      key={`issue-${idx}`}
                      type="button"
                      onClick={() => selectTemplate(template)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      {template}
                    </button>
                  ))}
                </div>

                {/* Maintenance */}
                <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">🔧 Maintenance</p>
                  {officeboyTemplates.maintenance.map((template, idx) => (
                    <button
                      key={`maint-${idx}`}
                      type="button"
                      onClick={() => selectTemplate(template)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded transition-colors"
                    >
                      {template}
                    </button>
                  ))}
                </div>

                {/* Equipment */}
                <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">🖥️ Equipment</p>
                  {officeboyTemplates.equipment.map((template, idx) => (
                    <button
                      key={`equip-${idx}`}
                      type="button"
                      onClick={() => selectTemplate(template)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                    >
                      {template}
                    </button>
                  ))}
                </div>

                {/* Common */}
                <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase">💬 Common</p>
                  {officeboyTemplates.common.map((template, idx) => (
                    <button
                      key={`com-${idx}`}
                      type="button"
                      onClick={() => selectTemplate(template)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status Indicator */}
          <div className="mt-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
              isCompleted
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
            }`}>
              {isCompleted ? '✓ Completed' : '○ Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>

);
};

export default ChecklistItem;