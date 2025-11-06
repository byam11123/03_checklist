import type { ChecklistEntry } from '../types/checklist';

interface ExportData {
  date: string;
  time: string;
  name: string;
  checklistType: string;
  completionPercentage: number;
  supervisorName: string;
  tasks: {
    taskName: string;
    status: string;
    remarks: string;
  }[];
}

export const exportToExcel = (checklists: ChecklistEntry[], fileName: string) => {
  // Prepare data for export
  const exportData: ExportData[] = checklists.map(entry => ({
    date: entry.date,
    time: entry.time,
    name: entry.name,
    checklistType: entry.checklistType,
    completionPercentage: entry.completionPercentage,
    supervisorName: entry.supervisorName,
    tasks: entry.tasks.map(task => ({
      taskName: task.taskName,
      status: task.status,
      remarks: task.remarks
    }))
  }));

  // Create CSV content
  let csvContent = 'Date,Time,Name,Checklist Type,Completion %,Supervisor,Task Name,Task Status,Task Remarks\n';
  
  exportData.forEach(entry => {
    entry.tasks.forEach((task, index) => {
      // For the first task, include the summary data
      if (index === 0) {
        csvContent += `"${entry.date}","${entry.time}","${entry.name}","${entry.checklistType}",${entry.completionPercentage},"${entry.supervisorName}","${task.taskName}","${task.status}","${task.remarks}"\n`;
      } else {
        // For subsequent tasks in the same entry, leave summary fields empty
        csvContent += `,,,,,,"${task.taskName}","${task.status}","${task.remarks}"\n`;
      }
    });
  });

  // Create a Blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};