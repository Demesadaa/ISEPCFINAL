export interface Course {
  id: string;
  name: string;
  color?: string;
}

export interface Task {
  id: string;
  headline: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'to do' | 'in progress' | 'done' | 'rejected';
}

export interface AssignmentNote {
  id: string;
  headline: string;
  body: string;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  deadline: string; // ISO date string
  courseId: string;
  completed: boolean;
  tags?: string[];
  resources?: string[]; // URLs or file paths
  recurring?: string; // e.g., 'weekly', 'monthly'
  tasks?: Task[];
  notes?: AssignmentNote[];
}

export interface Note {
  id: string;
  content: string;
  createdAt: string; // ISO date string
  updatedAt?: string;
  tags?: string[];
  resources?: string[]; // URLs or file paths
} 