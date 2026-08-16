import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import {
  Target,
  Clock,
  RotateCcw,
  HelpCircle,
  MessageSquare,
  X,
  Plus
} from 'lucide-react';

export const QuickAddModal = ({ isOpen, onClose, initialType = 'target' }) => {
  const {
    subjects,
    chapters,
    addDailyTarget,
    logStudySession,
    addRevision,
    addDoubt,
    selectedDate
  } = useStudy();

  const [activeType, setActiveType] = useState(initialType);

  // Shared form inputs
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || 'law');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [priority, setPriority] = useState('High');
  const [durationMins, setDurationMins] = useState('90');
  const [sessionType, setSessionType] = useState('Lecture');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const availableChapters = chapters.filter(c => c.subjectId === selectedSubject);

  const handleSubmit = (e) => {
    e.preventDefault();
    const chapId = selectedChapter || availableChapters[0]?.id;
    if (!chapId) return;

    if (activeType === 'target') {
      addDailyTarget({ date: selectedDate, subjectId: selectedSubject, chapterId: chapId, priority, notes });
    } else if (activeType === 'session') {
      logStudySession({ chapterId: chapId, type: sessionType, durationMinutes: parseInt(durationMins) || 60, notes, date: selectedDate });
    } else if (activeType === 'revision') {
      addRevision({ chapterId: chapId, revisionType: 'Rev 1', notes, date: selectedDate });
    } else if (activeType === 'doubt') {
      addDoubt(chapId, notes || 'Clarification needed');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-500" />
            Quick Add ({selectedDate})
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Type Selector Bar */}
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveType('target')}
            className={`py-1.5 rounded-xl text-[11px] font-extrabold flex flex-col items-center gap-1 active-touch ${
              activeType === 'target' ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> Target
          </button>

          <button
            type="button"
            onClick={() => setActiveType('session')}
            className={`py-1.5 rounded-xl text-[11px] font-extrabold flex flex-col items-center gap-1 active-touch ${
              activeType === 'session' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Study Time
          </button>

          <button
            type="button"
            onClick={() => setActiveType('revision')}
            className={`py-1.5 rounded-xl text-[11px] font-extrabold flex flex-col items-center gap-1 active-touch ${
              activeType === 'revision' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Revision
          </button>

          <button
            type="button"
            onClick={() => setActiveType('doubt')}
            className={`py-1.5 rounded-xl text-[11px] font-extrabold flex flex-col items-center gap-1 active-touch ${
              activeType === 'doubt' ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" /> Doubt
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapter('');
                }}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Chapter</label>
              <select
                value={selectedChapter || availableChapters[0]?.id || ''}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
              >
                {availableChapters.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
              </select>
            </div>
          </div>

          {activeType === 'target' && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🟢 Low Priority</option>
              </select>
            </div>
          )}

          {activeType === 'session' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Type</label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
                >
                  <option value="Lecture">Lecture Study</option>
                  <option value="Self Study">Self Study</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Duration (Mins)</label>
                <input
                  type="number"
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                  className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
              {activeType === 'doubt' ? 'Doubt Question' : 'Notes'}
            </label>
            <input
              type="text"
              placeholder="Add optional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border text-xs text-slate-900 dark:text-white"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 text-white font-black text-xs shadow-md active-touch"
          >
            Save Entry
          </button>
        </form>

      </div>
    </div>
  );
};
