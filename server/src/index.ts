import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { getAssignments, addAssignment, updateAssignment, deleteAssignment } from './assignmentsController';
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