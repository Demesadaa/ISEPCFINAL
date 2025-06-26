import { Request, Response } from 'express';
import { Note } from './types';
import fs from 'fs';
import path from 'path';

const DATA_PATH = path.join(__dirname, '../data/notes.json');

function readNotes(): Note[] {
  if (!fs.existsSync(DATA_PATH)) return [];
  const data = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(data);
}

function writeNotes(notes: Note[]) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(notes, null, 2));
}

export const getNotes: (req: Request, res: Response) => void = (req, res) => {
  const notes = readNotes();
  res.json(notes);
};

export const addNote: (req: Request, res: Response) => void = (req, res) => {
  const notes = readNotes();
  const newNote: Note = { ...req.body, id: Date.now().toString(), createdAt: new Date().toISOString() };
  notes.push(newNote);
  writeNotes(notes);
  res.status(201).json(newNote);
};

export const updateNote: (req: Request, res: Response) => void = (req, res) => {
  const { id } = req.params;
  const notes = readNotes();
  const idx = notes.findIndex(n => n.id === id);
  if (idx === -1) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  notes[idx] = { ...notes[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeNotes(notes);
  res.json(notes[idx]);
};

export const deleteNote: (req: Request, res: Response) => void = (req, res) => {
  const { id } = req.params;
  let notes = readNotes();
  const initialLength = notes.length;
  notes = notes.filter(n => n.id !== id);
  if (notes.length === initialLength) {
    res.status(404).json({ error: 'Note not found' });
    return;
  }
  writeNotes(notes);
  res.status(204).send();
}; 