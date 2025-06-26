import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import {
  getAssignments, addAssignment, updateAssignment, deleteAssignment,
  getTasks, addTask, updateTask, deleteTask,
  getAssignmentNotes, addAssignmentNote, updateAssignmentNote, deleteAssignmentNote,
  getAssignmentProgress
} from './assignmentsController';
import { getNotes, addNote, updateNote, deleteNote } from './notesController';
import { getCourses, addCourse, updateCourse, deleteCourse } from './coursesController';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { User } from './types';
import { Request, Response, NextFunction } from 'express';

const app = express();
const PORT = 4000;

const USERS_PATH = path.join(__dirname, '../data/users.json');
const JWT_SECRET = 'your_jwt_secret';

function readUsers(): User[] {
  if (!fs.existsSync(USERS_PATH)) return [];
  const data = fs.readFileSync(USERS_PATH, 'utf-8');
  return JSON.parse(data);
}
function writeUsers(users: User[]) {
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
}

app.use(cors());
app.use(bodyParser.json());

// Assignment routes
app.get('/api/assignments', authMiddleware, getAssignments);
app.post('/api/assignments', authMiddleware, addAssignment);
app.put('/api/assignments/:id', authMiddleware, updateAssignment);
app.delete('/api/assignments/:id', authMiddleware, deleteAssignment);

// Assignment task routes
app.get('/api/assignments/:assignmentId/tasks', authMiddleware, getTasks);
app.post('/api/assignments/:assignmentId/tasks', authMiddleware, addTask);
app.put('/api/assignments/:assignmentId/tasks/:taskId', authMiddleware, updateTask);
app.delete('/api/assignments/:assignmentId/tasks/:taskId', authMiddleware, deleteTask);

// Assignment note routes
app.get('/api/assignments/:assignmentId/notes', authMiddleware, getAssignmentNotes);
app.post('/api/assignments/:assignmentId/notes', authMiddleware, addAssignmentNote);
app.put('/api/assignments/:assignmentId/notes/:noteId', authMiddleware, updateAssignmentNote);
app.delete('/api/assignments/:assignmentId/notes/:noteId', authMiddleware, deleteAssignmentNote);

// Assignment progress
app.get('/api/assignments/:assignmentId/progress', authMiddleware, getAssignmentProgress);

// Note routes
app.get('/api/notes', authMiddleware, getNotes);
app.post('/api/notes', authMiddleware, addNote);
app.put('/api/notes/:id', authMiddleware, updateNote);
app.delete('/api/notes/:id', authMiddleware, deleteNote);

// Course routes
app.get('/api/courses', authMiddleware, getCourses);
app.post('/api/courses', authMiddleware, addCourse);
app.put('/api/courses/:id', authMiddleware, updateCourse);
app.delete('/api/courses/:id', authMiddleware, deleteCourse);

// Register endpoint
app.post('/api/register', (req: Request, res: Response): void => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }
  const users = readUsers();
  if (users.find(u => u.username === username)) {
    res.status(409).json({ error: 'Username already exists' });
    return;
  }
  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser: User = { id: Date.now().toString(), username, passwordHash };
  users.push(newUser);
  writeUsers(users);
  const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
  return;
});

// Login endpoint
app.post('/api/login', (req: Request, res: Response): void => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }
  const users = readUsers();
  const user = users.find(u => u.username === username);
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  if (!bcrypt.compareSync(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
  return;
});

// Auth middleware
function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token' });
    return;
  }
  try {
    const payload = jwt.verify(auth.split(' ')[1], JWT_SECRET) as { userId: string };
    (req as any).userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
    return;
  }
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 