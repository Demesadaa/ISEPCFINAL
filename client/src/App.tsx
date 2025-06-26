import React, { useState, useEffect } from 'react';
import './App.css';

// Types
interface Assignment {
  id: string;
  title: string;
  deadline: string;
  courseId: string;
  completed: boolean;
}
interface Course {
  id: string;
  name: string;
}
interface Note {
  id: string;
  content: string;
  courseId?: string;
  assignmentId?: string;
}

const API = 'http://localhost:4000/api';

function App() {
  // State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [newAssignment, setNewAssignment] = useState({ title: '', deadline: '', courseId: '' });
  const [newCourse, setNewCourse] = useState('');
  const [newNote, setNewNote] = useState({ content: '', courseId: '' });

  // Fetch data
  const fetchAll = () => {
    fetch(`${API}/assignments`).then(r => r.json()).then(setAssignments);
    fetch(`${API}/courses`).then(r => r.json()).then(setCourses);
    fetch(`${API}/notes`).then(r => r.json()).then(setNotes);
  };
  useEffect(() => {
    fetchAll();
  }, []);

  // Handlers
  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API}/assignments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAssignment)
    });
    if (res.ok) {
      fetchAll();
      setNewAssignment({ title: '', deadline: '', courseId: '' });
    }
  };
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCourse })
    });
    if (res.ok) {
      fetchAll();
      setNewCourse('');
    }
  };
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote)
    });
    if (res.ok) {
      fetchAll();
      setNewNote({ content: '', courseId: '' });
    }
  };

  // Defensive: ensure arrays
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeAssignments = Array.isArray(assignments) ? assignments : [];
  const safeNotes = Array.isArray(notes) ? notes : [];

  return (
    <div className="organizer-container">
      <header className="organizer-header">
        <h1>Academic Organizer</h1>
      </header>
      <main className="organizer-main">
        <section className="organizer-section">
          <h2>Assignments</h2>
          <form className="organizer-form" onSubmit={handleAddAssignment}>
            <input
              type="text"
              placeholder="Title"
              value={newAssignment.title}
              onChange={e => setNewAssignment(a => ({ ...a, title: e.target.value }))}
              required
            />
            <input
              type="date"
              value={newAssignment.deadline}
              onChange={e => setNewAssignment(a => ({ ...a, deadline: e.target.value }))}
              required
            />
            <select
              value={newAssignment.courseId}
              onChange={e => setNewAssignment(a => ({ ...a, courseId: e.target.value }))}
              required
            >
              <option value="">Select Course</option>
              {safeCourses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button type="submit">Add</button>
          </form>
          <ul className="organizer-list">
            {safeAssignments.map(a => (
              <li key={a.id} className="organizer-list-item">
                <span>{a.title}</span>
                <span>{a.deadline}</span>
                <span>{safeCourses.find(c => c.id === a.courseId)?.name || 'No course'}</span>
                <span>{a.completed ? '✓' : ''}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="organizer-section">
          <h2>Courses</h2>
          <form className="organizer-form" onSubmit={handleAddCourse}>
            <input
              type="text"
              placeholder="Course name"
              value={newCourse}
              onChange={e => setNewCourse(e.target.value)}
              required
            />
            <button type="submit">Add</button>
          </form>
          <ul className="organizer-list">
            {safeCourses.map(c => (
              <li key={c.id} className="organizer-list-item">{c.name}</li>
            ))}
          </ul>
        </section>
        <section className="organizer-section">
          <h2>Notes</h2>
          <form className="organizer-form" onSubmit={handleAddNote}>
            <textarea
              placeholder="Note content"
              value={newNote.content}
              onChange={e => setNewNote(a => ({ ...a, content: e.target.value }))}
              required
            />
            <select
              value={newNote.courseId}
              onChange={e => setNewNote(a => ({ ...a, courseId: e.target.value }))}
            >
              <option value="">No course</option>
              {safeCourses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button type="submit">Add</button>
          </form>
          <ul className="organizer-list">
            {safeNotes.map(n => (
              <li key={n.id} className="organizer-list-item">
                <span>{n.content}</span>
                <span>{safeCourses.find(c => c.id === n.courseId)?.name || ''}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}

export default App;
