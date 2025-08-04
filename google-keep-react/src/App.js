import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import './style.css';
import NoteEditor from './components/NoteEditor';
import Toolbar from './components/Toolbar';
import Header from './components/Header';

function App() {
  const [currentNote, setCurrentNote] = useState({
    title: '',
    lines: [
      { id: 1, type: 'text', content: '', checked: false }
    ]
  });

  const [dragState, setDragState] = useState({
    isDragging: false,
    draggedItem: null,
    draggedIndex: -1
  });

  // Load note from localStorage on mount
  useEffect(() => {
    const savedNote = localStorage.getItem('googleKeepNote');
    if (savedNote) {
      try {
        setCurrentNote(JSON.parse(savedNote));
      } catch (error) {
        console.error('Error loading saved note:', error);
      }
    }
  }, []);

  // Save note to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('googleKeepNote', JSON.stringify(currentNote));
  }, [currentNote]);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = currentNote.lines.findIndex(line => line.id === active.id);
      const newIndex = currentNote.lines.findIndex(line => line.id === over.id);
      
      const newLines = [...currentNote.lines];
      const [movedItem] = newLines.splice(oldIndex, 1);
      newLines.splice(newIndex, 0, movedItem);
      
      setCurrentNote(prev => ({
        ...prev,
        lines: newLines
      }));
    }
  };

  const updateLine = (lineId, updates) => {
    setCurrentNote(prev => ({
      ...prev,
      lines: prev.lines.map(line => 
        line.id === lineId ? { ...line, ...updates } : line
      )
    }));
  };

  const addLine = (afterId = null) => {
    const newLine = {
      id: Date.now(),
      type: 'text',
      content: '',
      checked: false
    };

    setCurrentNote(prev => {
      const newLines = [...prev.lines];
      if (afterId) {
        const index = newLines.findIndex(line => line.id === afterId);
        newLines.splice(index + 1, 0, newLine);
      } else {
        newLines.push(newLine);
      }
      return { ...prev, lines: newLines };
    });
  };

  const deleteLine = (lineId) => {
    setCurrentNote(prev => ({
      ...prev,
      lines: prev.lines.filter(line => line.id !== lineId)
    }));
  };

  const updateTitle = (title) => {
    setCurrentNote(prev => ({ ...prev, title }));
  };

  return (
    <div className="app">
      <Header />
      <div className="note-container">
        <div className="note-editor">
          <input
            type="text"
            className="title-input"
            placeholder="Title"
            value={currentNote.title}
            onChange={(e) => updateTitle(e.target.value)}
          />
          
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentNote.lines.map(line => line.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="lines-container">
                {currentNote.lines.map((line, index) => (
                  <NoteEditor
                    key={line.id}
                    line={line}
                    index={index}
                    onUpdate={(updates) => updateLine(line.id, updates)}
                    onDelete={() => deleteLine(line.id)}
                    onAddLine={() => addLine(line.id)}
                    isLast={index === currentNote.lines.length - 1}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
        
        <Toolbar onAddLine={() => addLine()} />
      </div>
    </div>
  );
}

export default App;
