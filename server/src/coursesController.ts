import { Request, Response } from 'express';
import { Course } from './types';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(__dirname, '../data/courses.json');

function readCourses(): Course[] {
  if (!fs.existsSync(DATA_PATH)) return [];
  const data = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

function writeCourses(courses: Course[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(courses, null, 2));
}

export const getCourses: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const courses = readCourses().filter(c => c.userId === userId);
  res.json(courses);
};

export const addCourse: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const courses = readCourses();
  const newCourse: Course = { ...req.body, id: Date.now().toString(), userId };
  courses.push(newCourse);
  writeCourses(courses);
  res.status(201).json(newCourse);
};

export const updateCourse: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  const courses = readCourses();
  const idx = courses.findIndex(c => c.id === id && c.userId === userId);
  if (idx === -1) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  courses[idx] = { ...courses[idx], ...req.body };
  writeCourses(courses);
  res.json(courses[idx]);
};

export const deleteCourse: (req: Request, res: Response) => void = (req, res) => {
  const userId = (req as any).userId;
  const { id } = req.params;
  let courses = readCourses();
  const initialLength = courses.length;
  courses = courses.filter(c => !(c.id === id && c.userId === userId));
  if (courses.length === initialLength) {
    res.status(404).json({ error: 'Course not found' });
    return;
  }
  writeCourses(courses);
  res.status(204).send();
}; 