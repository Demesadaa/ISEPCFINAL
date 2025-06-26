import { Request, Response } from 'express';
import { User, UserProfile } from './types';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

const USERS_PATH = path.join(__dirname, '../data/users.json');
const UPLOADS_PATH = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_PATH)) {
  fs.mkdirSync(UPLOADS_PATH, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_PATH);
  },
  filename: (req, file, cb) => {
    const userId = (req as any).userId;
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${userId}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

function readUsers(): User[] {
  if (!fs.existsSync(USERS_PATH)) return [];
  const data = fs.readFileSync(USERS_PATH, 'utf-8');
  return JSON.parse(data);
}

function writeUsers(users: User[]) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

// Get user profile
export const getProfile: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const users = readUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Initialize default profile if not exists
  if (!user.profile) {
    user.profile = {
      backgroundColor: '#111111',
      accentColor: '#A084E8',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    writeUsers(users);
  }

  res.json(user.profile);
};

// Update user profile
export const updateProfile: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { backgroundColor, accentColor } = req.body;
  
  const users = readUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  if (!user.profile) {
    user.profile = {
      backgroundColor: '#111111',
      accentColor: '#A084E8',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  user.profile.backgroundColor = backgroundColor || user.profile.backgroundColor;
  user.profile.accentColor = accentColor || user.profile.accentColor;
  user.profile.updatedAt = new Date().toISOString();

  writeUsers(users);
  res.json(user.profile);
};

// Upload avatar
export const uploadAvatar = upload.single('avatar');
export const handleAvatarUpload: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded' });
    return;
  }

  const users = readUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  // Delete old avatar if exists
  if (user.profile?.avatar) {
    const oldAvatarPath = path.join(UPLOADS_PATH, user.profile.avatar);
    if (fs.existsSync(oldAvatarPath)) {
      fs.unlinkSync(oldAvatarPath);
    }
  }

  // Initialize profile if not exists
  if (!user.profile) {
    user.profile = {
      backgroundColor: '#111111',
      accentColor: '#A084E8',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  user.profile.avatar = req.file.filename;
  user.profile.updatedAt = new Date().toISOString();

  writeUsers(users);
  res.json({ avatar: req.file.filename });
};

// Get avatar
export const getAvatar: (req: Request, res: Response) => void = (req, res) => {
  const { filename } = req.params;
  const avatarPath = path.join(UPLOADS_PATH, filename);
  
  if (!fs.existsSync(avatarPath)) {
    res.status(404).json({ error: 'Avatar not found' });
    return;
  }

  res.sendFile(avatarPath);
};

// Get user statistics
export const getStats: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  
  // Read all data files
  const assignmentsPath = path.join(__dirname, '../data/assignments.json');
  const coursesPath = path.join(__dirname, '../data/courses.json');
  
  let assignments = [];
  let courses = [];
  
  if (fs.existsSync(assignmentsPath)) {
    assignments = JSON.parse(fs.readFileSync(assignmentsPath, 'utf-8'));
  }
  
  if (fs.existsSync(coursesPath)) {
    courses = JSON.parse(fs.readFileSync(coursesPath, 'utf-8'));
  }

  // Filter by user
  const userAssignments = assignments.filter((a: any) => a.userId === userId);
  const userCourses = courses.filter((c: any) => c.userId === userId);

  // Calculate statistics
  const totalAssignments = userAssignments.length;
  const completedAssignments = userAssignments.filter((a: any) => a.completed).length;
  const totalCourses = userCourses.length;
  
  // Calculate total tasks and completed tasks
  let totalTasks = 0;
  let completedTasks = 0;
  
  userAssignments.forEach((assignment: any) => {
    if (Array.isArray(assignment.tasks)) {
      totalTasks += assignment.tasks.length;
      completedTasks += assignment.tasks.filter((t: any) => t.status === 'done').length;
    }
  });

  res.json({
    totalCourses,
    totalAssignments,
    completedAssignments,
    totalTasks,
    completedTasks,
    completionRate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0,
    taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  });
}; 