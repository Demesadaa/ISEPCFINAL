export interface User {
  id: string;
  username: string;
  passwordHash: string;
  profile?: UserProfile;
}

export interface UserProfile {
  avatar?: string; // filename of uploaded avatar
  backgroundColor: string; // hex color for background
  accentColor: string; // hex color for accents/buttons
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  color?: string;
  userId: string;
}

export interface Task {
  id: string;
  headline: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'to do' | 'in progress' | 'done' | 'rejected';
  userId: string;
}

export interface AssignmentNote {
  id: string;
  headline: string;
  body: string;
  userId: string;
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
  userId: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string; // ISO date string
  updatedAt?: string;
  tags?: string[];
  resources?: string[]; // URLs or file paths
  userId: string;
} 