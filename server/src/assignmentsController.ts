import { Request, Response } from 'express';
import { Assignment } from './types';
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

export const getAssignments = (req: Request, res: Response) => {
  const assignments = readAssignments();
  res.json(assignments);
};

export const addAssignment = (req: Request, res: Response) => {
  const assignments = readAssignments();
  const newAssignment: Assignment = { ...req.body, id: Date.now().toString(), completed: false };
  assignments.push(newAssignment);
  writeAssignments(assignments);
  res.status(201).json(newAssignment);
};

export const updateAssignment = (req: Request, res: Response) => {
  const { id } = req.params;
  const assignments = readAssignments();
  const idx = assignments.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Assignment not found' });
  assignments[idx] = { ...assignments[idx], ...req.body };
  writeAssignments(assignments);
  res.json(assignments[idx]);
};

export const deleteAssignment = (req: Request, res: Response) => {
  const { id } = req.params;
  let assignments = readAssignments();
  const initialLength = assignments.length;
  assignments = assignments.filter(a => a.id !== id);
  if (assignments.length === initialLength) return res.status(404).json({ error: 'Assignment not found' });
  writeAssignments(assignments);
  res.status(204).send();
}; 