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
  userType: string;
  checklistType: string;
  user: string;
  tasks: Task[];
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
  supervisor: string;
  supervisorTimestamp: string;
}