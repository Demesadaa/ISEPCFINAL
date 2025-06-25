export interface Course {
  id: string;
  name: string;
  color?: string;
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
}

export interface Note {
  id: string;
  content: string;
  courseId?: string;
  assignmentId?: string;
  createdAt: string; // ISO date string
  updatedAt?: string;
  tags?: string[];
  resources?: string[]; // URLs or file paths
} 