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

const app = express();
const PORT = 4000;

app.use(cors());
app.use(bodyParser.json());

// Assignment routes
app.get('/api/assignments', getAssignments);
app.post('/api/assignments', addAssignment);
app.put('/api/assignments/:id', updateAssignment);
app.delete('/api/assignments/:id', deleteAssignment);

// Assignment task routes
app.get('/api/assignments/:assignmentId/tasks', getTasks);
app.post('/api/assignments/:assignmentId/tasks', addTask);
app.put('/api/assignments/:assignmentId/tasks/:taskId', updateTask);
app.delete('/api/assignments/:assignmentId/tasks/:taskId', deleteTask);

// Assignment note routes
app.get('/api/assignments/:assignmentId/notes', getAssignmentNotes);
app.post('/api/assignments/:assignmentId/notes', addAssignmentNote);
app.put('/api/assignments/:assignmentId/notes/:noteId', updateAssignmentNote);
app.delete('/api/assignments/:assignmentId/notes/:noteId', deleteAssignmentNote);

// Assignment progress
app.get('/api/assignments/:assignmentId/progress', getAssignmentProgress);

// Note routes
app.get('/api/notes', getNotes);
app.post('/api/notes', addNote);
app.put('/api/notes/:id', updateNote);
app.delete('/api/notes/:id', deleteNote);

// Course routes
app.get('/api/courses', getCourses);
app.post('/api/courses', addCourse);
app.put('/api/courses/:id', updateCourse);
app.delete('/api/courses/:id', deleteCourse);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 