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

export const getCourses = (req: Request, res: Response) => {
  const courses = readCourses();
  res.json(courses);
};

export const addCourse = (req: Request, res: Response) => {
  const courses = readCourses();
  const newCourse: Course = { ...req.body, id: Date.now().toString() };
  courses.push(newCourse);
  writeCourses(courses);
  res.status(201).json(newCourse);
};

export const updateCourse = (req: Request, res: Response) => {
  const { id } = req.params;
  const courses = readCourses();
  const idx = courses.findIndex(c => c.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Course not found' });
  courses[idx] = { ...courses[idx], ...req.body };
  writeCourses(courses);
  res.json(courses[idx]);
};

export const deleteCourse = (req: Request, res: Response) => {
  const { id } = req.params;
  let courses = readCourses();
  const initialLength = courses.length;
  courses = courses.filter(c => c.id !== id);
  if (courses.length === initialLength) return res.status(404).json({ error: 'Course not found' });
  writeCourses(courses);
  res.status(204).send();
}; 