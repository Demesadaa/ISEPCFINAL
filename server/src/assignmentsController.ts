import { Request, Response } from 'express';
import { Assignment, Task, AssignmentNote } from './types';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(__dirname, '../data/assignments.json');

function readAssignments(): Assignment[] {
  if (!fs.existsSync(DATA_PATH)) return [];
  const data = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

function writeAssignments(assignments: Assignment[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(assignments, null, 2));
}

export const getAssignments: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const assignments = readAssignments().filter(a => a.userId === userId);
  res.json(assignments);
};

export const addAssignment: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const assignments = readAssignments();
  const newAssignment: Assignment = { ...req.body, id: Date.now().toString(), completed: false, userId };
  assignments.push(newAssignment);
  writeAssignments(assignments);
  res.status(201).json(newAssignment);
};

export const updateAssignment: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const assignments = readAssignments();
  const idx = assignments.findIndex(a => a.id === id && a.userId === userId);
  if (idx === -1) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  assignments[idx] = { ...assignments[idx], ...req.body };
  writeAssignments(assignments);
  res.json(assignments[idx]);
};

export const deleteAssignment: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  let assignments = readAssignments();
  const initialLength = assignments.length;
  assignments = assignments.filter(a => !(a.id === id && a.userId === userId));
  if (assignments.length === initialLength) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  writeAssignments(assignments);
  res.status(204).send();
};

// Get tasks for an assignment
export const getTasks: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { assignmentId } = req.params;
  const assignments = readAssignments();
  const assignment = assignments.find(a => a.id === assignmentId && a.userId === userId);
  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  res.json(Array.isArray(assignment.tasks) ? assignment.tasks : []);
};

// Add a task to an assignment
export const addTask: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { assignmentId } = req.params;
  const assignments = readAssignments();
  const assignment = assignments.find(a => a.id === assignmentId && a.userId === userId);
  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  const newTask: Task = { ...req.body, id: Date.now().toString(), userId };
  assignment.tasks = Array.isArray(assignment.tasks) ? assignment.tasks : [];
  assignment.tasks.push(newTask);
  writeAssignments(assignments);
  res.status(201).json(newTask);
};

// Update a task in an assignment
export const updateTask: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { assignmentId, taskId } = req.params;
  const assignments = readAssignments();
  const assignment = assignments.find(a => a.id === assignmentId && a.userId === userId);
  if (!assignment || !Array.isArray(assignment.tasks)) {
    res.status(404).json({ error: 'Assignment or task not found' });
    return;
  }
  const idx = assignment.tasks.findIndex(t => t.id === taskId && t.userId === userId);
  if (idx === -1) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  assignment.tasks[idx] = { ...assignment.tasks[idx], ...req.body };
  writeAssignments(assignments);
  res.json(assignment.tasks[idx]);
};

// Delete a task from an assignment
export const deleteTask: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { assignmentId, taskId } = req.params;
  const assignments = readAssignments();
  const assignment = assignments.find(a => a.id === assignmentId && a.userId === userId);
  if (!assignment || !Array.isArray(assignment.tasks)) {
    res.status(404).json({ error: 'Assignment or task not found' });
    return;
  }
  const initialLength = assignment.tasks.length;
  assignment.tasks = assignment.tasks.filter(t => !(t.id === taskId && t.userId === userId));
  if (assignment.tasks.length === initialLength) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  writeAssignments(assignments);
  res.status(204).send();
};

// Get notes for an assignment
export const getAssignmentNotes: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { assignmentId } = req.params;
  const assignments = readAssignments();
  const assignment = assignments.find(a => a.id === assignmentId && a.userId === userId);
  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  res.json(Array.isArray(assignment.notes) ? assignment.notes.filter(n => n.userId === userId) : []);
};

// Add a note to an assignment
export const addAssignmentNote: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { assignmentId } = req.params;
  const assignments = readAssignments();
  const assignment = assignments.find(a => a.id === assignmentId && a.userId === userId);
  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found' });
    return;
  }
  const newNote: AssignmentNote = { ...req.body, id: Date.now().toString(), userId };
  assignment.notes = Array.isArray(assignment.notes) ? assignment.notes : [];
  assignment.notes.push(newNote);
  writeAssignments(assignments);
  res.status(201).json(newNote);
};

// Update a note in an assignment
export const updateAssignmentNote: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { assignmentId, noteId } = req.params;
  const assignments = readAssignments();
  const assignment = assignments.find(a => a.id === assignmentId && a.userId === userId);
  if (!assignment || !Array.isArray(assignment.notes)) {
    res.status(404).json({ error: 'Assignment or note not found' });
    return;
  }
  const idx = assignment.notes.findIndex(n => n.id === noteId && n.userId === userId);
  if (idx === -1) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  assignment.notes[idx] = { ...assignment.notes[idx], ...req.body };
  writeAssignments(assignments);
  res.json(assignment.notes[idx]);
};

// Delete a note from an assignment
export const deleteAssignmentNote: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { assignmentId, noteId } = req.params;
  const assignments = readAssignments();
  const assignment = assignments.find(a => a.id === assignmentId && a.userId === userId);
  if (!assignment || !Array.isArray(assignment.notes)) {
    res.status(404).json({ error: 'Assignment or note not found' });
    return;
  }
  const initialLength = assignment.notes.length;
  assignment.notes = assignment.notes.filter(n => !(n.id === noteId && n.userId === userId));
  if (assignment.notes.length === initialLength) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  writeAssignments(assignments);
  res.status(204).send();
};

// Get assignment progress (percentage of tasks done)
export const getAssignmentProgress: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { assignmentId } = req.params;
  const assignments = readAssignments();
  const assignment = assignments.find(a => a.id === assignmentId && a.userId === userId);
  if (!assignment || !Array.isArray(assignment.tasks) || assignment.tasks.length === 0) {
    res.json({ progress: 0 });
    return;
  }
  const doneCount = assignment.tasks.filter(t => t.status === 'done' && t.userId === userId).length;
  const progress = Math.round((doneCount / assignment.tasks.length) * 100);
  res.json({ progress });
}; 