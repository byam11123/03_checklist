// types/checklist.ts

export interface Task {
  taskName: string;
  status: string;
  remarks: string;
  supervisorRemarks: string;
}

export interface ChecklistEntry {
  id: string;
  date: string;
  time: string;
  role: string;
  checklistType: string;
  name: string;
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
  supervisorName: string;
  verifiedAt: string;
}