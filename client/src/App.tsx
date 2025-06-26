import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
  useParams
} from 'react-router-dom';
import './App.css';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ProfilePage from './ProfilePage';

// Types
interface Task {
  id: string;
  headline: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'to do' | 'in progress' | 'done' | 'rejected';
}
interface AssignmentNote {
  id: string;
  headline: string;
  body: string;
}
interface Assignment {
  id: string;
  title: string;
  description?: string;
  deadline: string;
  courseId: string;
  completed: boolean;
  tasks?: Task[];
  notes?: AssignmentNote[];
}
interface Course {
  id: string;
  name: string;
}

const API = 'http://localhost:4000/api';

function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">Academic Organizer</Link>
      {user && (
        <div className="navbar-actions">
          <Link to="/profile" className="profile-link">👤 Profile</Link>
          <button onClick={logout} className="logout-btn">🚪 Logout</button>
        </div>
      )}
    </nav>
  );
}

function HomePage({ courses, onAddCourse, onDeleteCourse }: { courses: Course[], onAddCourse: (name: string) => void, onDeleteCourse: (id: string) => void }) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [newCourse, setNewCourse] = useState('');
  return (
    <div className="home-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <h2>Courses</h2>
        <button onClick={() => setAdding(a => !a)}>{adding ? 'Cancel' : '+ New Course'}</button>
      </div>
      {adding && (
        <form
          style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}
          onSubmit={e => {
            e.preventDefault();
            if (newCourse.trim()) {
              onAddCourse(newCourse.trim());
              setNewCourse('');
              setAdding(false);
            }
          }}
        >
          <input
            type="text"
            placeholder="Course name"
            value={newCourse}
            onChange={e => setNewCourse(e.target.value)}
            autoFocus
            required
          />
          <button type="submit">Add</button>
        </form>
      )}
      <div className="courses-list">
        {courses.map(course => (
          <div
            key={course.id}
            className="course-card"
            onClick={() => navigate(`/course/${course.id}/assignments`)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span>{course.name}</span>
            <button
              className="delete-btn"
              title="Delete course"
              onClick={e => { e.stopPropagation(); onDeleteCourse(course.id); }}
            >🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssignmentsPage({ courses, assignments, fetchAll, onAddAssignment, onDeleteAssignment, authFetch }: {
  courses: Course[];
  assignments: Assignment[];
  fetchAll: () => void;
  onAddAssignment: (a: Partial<Assignment>) => void;
  onDeleteAssignment: (id: string) => void;
  authFetch: (url: string, options?: any) => Promise<Response>;
}) {
  const { id } = useParams();
  const course = courses.find(c => c.id === id);
  const [showPopup, setShowPopup] = useState<string | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({ title: '', deadline: '' });
  if (!course) return <div>Course not found</div>;
  const courseAssignments = assignments.filter(a => a.courseId === course.id);
  return (
    <div className="assignments-container">
      <div className="assignments-list-section">
        <div className="section-header">
          <h3>Assignments for {course.name}</h3>
          <button onClick={() => setShowAssignmentModal(true)}>+ New Assignment</button>
        </div>
        <ul className="organizer-list">
          {courseAssignments.map(a => (
            <li
              key={a.id}
              className="organizer-list-item"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => setShowPopup(a.id)}
            >
              <span style={{ flex: 1 }}>{a.title} <span style={{ color: '#888', fontSize: '0.95em' }}>{a.deadline}</span> {a.completed ? '✓' : ''}</span>
              <button
                className="delete-btn"
                title="Delete assignment"
                onClick={e => { e.stopPropagation(); onDeleteAssignment(a.id); }}
              >🗑️</button>
            </li>
          ))}
        </ul>
      </div>
      {showPopup && (
        <AssignmentPopup
          assignment={courseAssignments.find(a => a.id === showPopup)!}
          onClose={() => setShowPopup(null)}
          fetchAll={fetchAll}
          authFetch={authFetch}
        />
      )}
      {showAssignmentModal && (
        <div className="side-popup">
          <button className="close-btn" onClick={() => setShowAssignmentModal(false)}>Close</button>
          <h2>Add Assignment</h2>
          <form onSubmit={e => {
            e.preventDefault();
            if (assignmentForm.title && assignmentForm.deadline) {
              onAddAssignment({ ...assignmentForm, courseId: course.id });
              setAssignmentForm({ title: '', deadline: '' });
              setShowAssignmentModal(false);
            }
          }} className="task-form">
            <input type="text" placeholder="Title" value={assignmentForm.title} onChange={e => setAssignmentForm(f => ({ ...f, title: e.target.value }))} required />
            <input type="date" value={assignmentForm.deadline} onChange={e => setAssignmentForm(f => ({ ...f, deadline: e.target.value }))} required />
            <button type="submit">Add Assignment</button>
          </form>
        </div>
      )}
    </div>
  );
}

function AssignmentPopup({ assignment, onClose, fetchAll, authFetch }: {
  assignment: Assignment;
  onClose: () => void;
  fetchAll: () => void;
  authFetch: (url: string, options?: any) => Promise<Response>;
}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<AssignmentNote[]>([]);
  const [progress, setProgress] = useState(0);
  const [showNote, setShowNote] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  useEffect(() => {
    authFetch(`${API}/assignments/${assignment.id}/tasks`).then(r => r.json()).then(data => setTasks(Array.isArray(data) ? data : []));
    authFetch(`${API}/assignments/${assignment.id}/notes`).then(r => r.json()).then(data => setNotes(Array.isArray(data) ? data : []));
    authFetch(`${API}/assignments/${assignment.id}/progress`).then(r => r.json()).then(data => setProgress(data.progress));
  }, [assignment.id]);
  const addTask = async (task: Omit<Task, 'id'>) => {
    await authFetch(`${API}/assignments/${assignment.id}/tasks`, {
      method: 'POST',
      body: JSON.stringify(task)
    });
    authFetch(`${API}/assignments/${assignment.id}/tasks`).then(r => r.json()).then(data => setTasks(Array.isArray(data) ? data : []));
    authFetch(`${API}/assignments/${assignment.id}/progress`).then(r => r.json()).then(data => setProgress(data.progress));
    fetchAll();
    setShowTaskModal(false);
  };
  const addNote = async (note: Omit<AssignmentNote, 'id'>) => {
    await authFetch(`${API}/assignments/${assignment.id}/notes`, {
      method: 'POST',
      body: JSON.stringify(note)
    });
    authFetch(`${API}/assignments/${assignment.id}/notes`).then(r => r.json()).then(data => setNotes(Array.isArray(data) ? data : []));
    setShowNoteModal(false);
  };
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    await authFetch(`${API}/assignments/${assignment.id}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    authFetch(`${API}/assignments/${assignment.id}/tasks`).then(r => r.json()).then(data => setTasks(Array.isArray(data) ? data : []));
    authFetch(`${API}/assignments/${assignment.id}/progress`).then(r => r.json()).then(data => setProgress(data.progress));
    fetchAll();
  };
  const deleteTask = async (taskId: string) => {
    await authFetch(`${API}/assignments/${assignment.id}/tasks/${taskId}`, { method: 'DELETE' });
    authFetch(`${API}/assignments/${assignment.id}/tasks`).then(r => r.json()).then(data => setTasks(Array.isArray(data) ? data : []));
    authFetch(`${API}/assignments/${assignment.id}/progress`).then(r => r.json()).then(data => setProgress(data.progress));
    fetchAll();
  };
  const updateNote = async (noteId: string, updates: Partial<AssignmentNote>) => {
    await authFetch(`${API}/assignments/${assignment.id}/notes/${noteId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
    authFetch(`${API}/assignments/${assignment.id}/notes`).then(r => r.json()).then(data => setNotes(Array.isArray(data) ? data : []));
  };
  const deleteNote = async (noteId: string) => {
    await authFetch(`${API}/assignments/${assignment.id}/notes/${noteId}`, { method: 'DELETE' });
    authFetch(`${API}/assignments/${assignment.id}/notes`).then(r => r.json()).then(data => setNotes(Array.isArray(data) ? data : []));
  };
  return (
    <div className="assignment-popup">
      <div className="assignment-popup-main">
        <button className="close-btn" onClick={onClose}>Close</button>
        <h2>{assignment.title}</h2>
        <div>Deadline: {assignment.deadline}</div>
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: progress + '%' }} />
          <span>{progress}% complete</span>
        </div>
        <h3>Tasks</h3>
        <button onClick={() => setShowTaskModal(true)}>+ New Task</button>
        <ul className="task-list">
          {tasks.map(task => (
            <li
              key={task.id}
              className={`task-item task-${task.difficulty}`}
              title={`${task.headline} (${task.difficulty}) - ${task.description}`}
            >
              <span className="task-status-icon">
                {task.status === 'to do' && '⏳'}
                {task.status === 'in progress' && '🔄'}
                {task.status === 'done' && '✅'}
                {task.status === 'rejected' && '❌'}
              </span>
              <span className="task-text">
                <b>{task.headline}</b> ({task.difficulty}) - {task.description}
              </span>
              <span className="task-controls">
                Status: <select value={task.status} onChange={e => updateTask(task.id, { status: e.target.value as any })}>
                  <option value="to do">To Do</option>
                  <option value="in progress">In Progress</option>
                  <option value="done">Done</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button onClick={() => deleteTask(task.id)} style={{ marginLeft: 8 }}>Delete</button>
              </span>
            </li>
          ))}
        </ul>
        {showTaskModal && (
          <TaskModal
            onClose={() => setShowTaskModal(false)}
            onCreate={addTask}
          />
        )}
      </div>
      <div className="assignment-popup-notes">
        <h3>Notes</h3>
        <button onClick={() => setShowNoteModal(true)}>+ New Note</button>
        <ul className="note-list">
          {notes.map(note => (
            <li key={note.id} className="note-item" onClick={() => setShowNote(note.id)}>
              <b>{note.headline}</b>
              <button onClick={e => { e.stopPropagation(); deleteNote(note.id); }}>Delete</button>
            </li>
          ))}
        </ul>
        {showNoteModal && (
          <NoteModal
            onClose={() => setShowNoteModal(false)}
            onCreate={addNote}
          />
        )}
        {showNote && (
          <div className="assignment-popup">
            <div className="note-popup-header">
              <h4 style={{ margin: 0 }}>{notes.find(n => n.id === showNote)?.headline}</h4>
              <button className="close-btn" onClick={() => setShowNote(null)}>Close</button>
            </div>
            <textarea
              value={notes.find(n => n.id === showNote)?.body || ''}
              onChange={e => updateNote(showNote, { body: e.target.value })}
              style={{ width: '100%', minHeight: 100 }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TaskModal({ onClose, onCreate }: { onClose: () => void; onCreate: (task: Omit<Task, 'id'>) => void }) {
  const [form, setForm] = useState<{headline: string; description: string; difficulty: 'easy' | 'medium' | 'hard'; status: 'to do' | 'in progress' | 'done' | 'rejected';}>(
    { headline: '', description: '', difficulty: 'easy', status: 'to do' }
  );
  return (
    <div className="side-popup">
      <button className="close-btn" onClick={onClose}>Close</button>
      <h2>Add Task</h2>
      <form onSubmit={e => { e.preventDefault(); onCreate(form); setForm({ headline: '', description: '', difficulty: 'easy', status: 'to do' }); }} className="task-form">
        <input type="text" placeholder="Headline" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} required />
        <input type="text" placeholder="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required />
        <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'to do' | 'in progress' | 'done' | 'rejected' }))}>
          <option value="to do">To Do</option>
          <option value="in progress">In Progress</option>
          <option value="done">Done</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit">Add Task</button>
      </form>
    </div>
  );
}

function NoteModal({ onClose, onCreate }: { onClose: () => void; onCreate: (note: Omit<AssignmentNote, 'id'>) => void }) {
  const [form, setForm] = useState({ headline: '', body: '' });
  return (
    <div className="side-popup">
      <button className="close-btn" onClick={onClose}>Close</button>
      <h2>Add Note</h2>
      <form onSubmit={e => { e.preventDefault(); onCreate(form); setForm({ headline: '', body: '' }); }} className="note-form">
        <input type="text" placeholder="Headline" value={form.headline} onChange={e => setForm(f => ({ ...f, headline: e.target.value }))} required />
        <textarea placeholder="Body" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} required />
        <button type="submit">Add Note</button>
      </form>
    </div>
  );
}

function ProtectedApp() {
  const { token, logout, user } = useAuth();
  // State
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Defensive: ensure arrays
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeAssignments = Array.isArray(assignments) ? assignments : [];

  // Helper to add JWT to fetch
  const authFetch = (url: string, options: any = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
  };

  // Fetch data
  const fetchAll = () => {
    authFetch(`${API}/assignments`).then(r => r.json()).then(setAssignments);
    authFetch(`${API}/courses`).then(r => r.json()).then(setCourses);
  };
  useEffect(() => {
    if (token) fetchAll();
  }, [token]);

  // Add handlers
  const addAssignment = async (a: Partial<Assignment>) => {
    await authFetch(`${API}/assignments`, {
      method: 'POST',
      body: JSON.stringify(a)
    });
    fetchAll();
  };
  const addCourse = async (name: string) => {
    await authFetch(`${API}/courses`, {
      method: 'POST',
      body: JSON.stringify({ name })
    });
    fetchAll();
  };
  const deleteCourse = async (id: string) => {
    await authFetch(`${API}/courses/${id}`, { method: 'DELETE' });
    fetchAll();
  };
  const deleteAssignment = async (id: string) => {
    await authFetch(`${API}/assignments/${id}`, { method: 'DELETE' });
    fetchAll();
  };

  if (!token) {
    window.location.href = '/login';
    return null;
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage courses={safeCourses} onAddCourse={addCourse} onDeleteCourse={deleteCourse} />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/course/:id/assignments"
          element={
            <AssignmentsPage
              courses={safeCourses}
              assignments={safeAssignments}
              fetchAll={fetchAll}
              onAddAssignment={addAssignment}
              onDeleteAssignment={deleteAssignment}
              authFetch={authFetch}
            />
          }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/*" element={<ProtectedApp />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;