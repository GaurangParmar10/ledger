import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
  Circle,
  Trash2,
  ArrowRight,
  AlertCircle,
  Sparkles,
  BookOpen,
  MessageSquare,
  Save,
  Tag
} from 'lucide-react';

export const DailyTargetSection = () => {
  const {
    selectedDate,
    setSelectedDate,
    todayDate,
    targets,
    chapters,
    subjects,
    addDailyTarget,
    toggleTargetStatus,
    deleteTarget,
    moveTargetToDate,
    dailyNotes,
    saveDailyNotes
  } = useStudy();

  // Form State
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || 'law');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [priority, setPriority] = useState('High');
  const [notes, setNotes] = useState('');

  // Daily reflection state
  const currentReflection = dailyNotes[selectedDate] || { achievements: '', struggles: '', tomorrowPriority: '', notes: '' };
  const [reflectionForm, setReflectionForm] = useState(currentReflection);
  const [notesSaved, setNotesSaved] = useState(false);

  // Sync reflection form when selected date changes
  React.useEffect(() => {
    setReflectionForm(dailyNotes[selectedDate] || { achievements: '', struggles: '', tomorrowPriority: '', notes: '' });
  }, [selectedDate, dailyNotes]);

  // Date shifting
  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Filter chapters by selected subject
  const availableChapters = chapters.filter(c => c.subjectId === selectedSubject);

  // Handle Target Creation
  const handleAddTarget = (e) => {
    e.preventDefault();
    const chapId = selectedChapter || availableChapters[0]?.id;
    if (!chapId) return;

    addDailyTarget({
      date: selectedDate,
      subjectId: selectedSubject,
      chapterId: chapId,
      priority,
      notes
    });

    setNotes('');
  };

  // Filter targets for selected date
  const dateTargets = targets.filter(t => t.date === selectedDate);

  // Identify Missed Targets (Targets before selected date or today that remain incomplete)
  const missedTargets = targets.filter(t => t.date < selectedDate && !t.completed);

  // Save Reflection
  const handleSaveNotes = (e) => {
    e.preventDefault();
    saveDailyNotes(selectedDate, reflectionForm);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  return (
    <div className="space-y-5 animate-fade-in pb-bottom-nav">

      {/* Date Navigation Selector */}
      <div className="glass-card rounded-2xl p-3 shadow-xs flex items-center justify-between">
        <button
          onClick={() => shiftDate(-1)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active-touch flex items-center gap-1 text-xs font-bold"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </button>

        <div className="text-center">
          <div className="flex items-center gap-1.5 justify-center">
            <Calendar className="w-4 h-4 text-amber-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent font-black text-sm text-slate-900 dark:text-white border-b border-transparent hover:border-amber-500 focus:outline-none text-center cursor-pointer"
            />
          </div>
          {selectedDate === todayDate && (
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
              (TODAY)
            </span>
          )}
        </div>

        <button
          onClick={() => shiftDate(1)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors active-touch flex items-center gap-1 text-xs font-bold"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* CREATE DAILY TARGET FORM */}
      <div className="glass-card rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xs">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Add Daily Target
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Auto-syncs into main STUDY task for {selectedDate}
            </p>
          </div>
        </div>

        <form onSubmit={handleAddTarget} className="space-y-3">
          {/* Subject Tabs */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Subject</label>
            <div className="grid grid-cols-4 gap-1.5">
              {subjects.map(s => (
                <button
                  type="button"
                  key={s.id}
                  onClick={() => {
                    setSelectedSubject(s.id);
                    setSelectedChapter('');
                  }}
                  className={`py-1.5 px-2 rounded-xl text-xs font-extrabold border transition-all active-touch ${
                    selectedSubject === s.id
                      ? 'bg-amber-500 text-white border-amber-500 shadow-xs scale-102'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Chapter Selector */}
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Chapter</label>
            <select
              value={selectedChapter || availableChapters[0]?.id || ''}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {availableChapters.map(ch => (
                <option key={ch.id} value={ch.id}>
                  {ch.group ? `[${ch.group}] ` : ''}{ch.num ? `${ch.num}. ` : ''}{ch.name} ({ch.status})
                </option>
              ))}
            </select>
          </div>

          {/* Priority & Target Notes Grid */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-[11px] font-bold text-slate-400 block mb-1 uppercase">Target Notes</label>
              <input
                type="text"
                placeholder="e.g. Solve Q1-5 or watch Lecture"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs font-black shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-orange-700 active-touch flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Chapter to Daily Target
          </button>
        </form>
      </div>

      {/* MAIN STUDY TASK VIEW */}
      <div className="glass-card rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div>
            <span className="text-[10px] font-extrabold text-amber-500 uppercase tracking-widest block">MAIN STUDY TASK</span>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-500" />
              STUDY — {selectedDate}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {dateTargets.filter(t => t.completed).length} / {dateTargets.length} Done
          </span>
        </div>

        {dateTargets.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Sparkles className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">No study subtasks created for {selectedDate}.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Use the form above to add chapters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {dateTargets.map(target => {
              const chap = chapters.find(c => c.id === target.chapterId);
              const sub = subjects.find(s => s.id === chap?.subjectId);
              return (
                <div
                  key={target.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    target.completed
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-500 dark:text-slate-400'
                      : 'bg-white dark:bg-slate-800/90 border-slate-200 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5 flex-1 min-w-0">
                    <button
                      onClick={() => toggleTargetStatus(target.id)}
                      className="mt-0.5 text-emerald-500 hover:scale-110 transition-transform active-touch"
                    >
                      {target.completed ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-500 text-white dark:text-slate-900" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 hover:text-emerald-500" />
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${sub?.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                          {sub?.name || 'Subject'}
                        </span>
                        {chap?.group && (
                          <span className="text-[10px] text-slate-400 font-medium">
                            {chap.group}
                          </span>
                        )}
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                          target.priority === 'High' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                          target.priority === 'Medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          {target.priority}
                        </span>
                      </div>

                      <p className={`text-xs font-bold mt-1 ${target.completed ? 'line-through opacity-70' : ''}`}>
                        {chap ? chap.name : 'Unknown Chapter'}
                      </p>

                      {target.notes && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 italic">
                          Notes: {target.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTarget(target.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50"
                    title="Delete target"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MISSED TARGETS SECTION (REQUIREMENT #13) */}
      {missedTargets.length > 0 && (
        <div className="glass-card rounded-2xl p-4 shadow-sm border-l-4 border-l-rose-500 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-extrabold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                Unfinished Missed Targets ({missedTargets.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400">Carry over to today</span>
          </div>

          <div className="space-y-2">
            {missedTargets.map(t => {
              const chap = chapters.find(c => c.id === t.chapterId);
              const sub = subjects.find(s => s.id === chap?.subjectId);
              return (
                <div key={t.id} className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                      <span>{t.date}</span>
                      <span>•</span>
                      <span className="text-rose-500">{sub?.name}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {chap?.name}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => moveTargetToDate(t.id, selectedDate)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-[10px] font-extrabold flex items-center gap-1 active-touch"
                    >
                      Move to Today <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteTarget(t.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DAILY REFLECTION & NOTES */}
      <div className="glass-card rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            Daily Study Reflection ({selectedDate})
          </h3>
          {notesSaved && (
            <span className="text-[10px] font-bold text-emerald-500 animate-fade-in">
              ✓ Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveNotes} className="space-y-2.5">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">What I Studied & Achieved Today</label>
            <textarea
              rows={2}
              placeholder="e.g. Mastered Companies Act preliminary definitions and solved 10 tax sums"
              value={reflectionForm.achievements || ''}
              onChange={(e) => setReflectionForm({ ...reflectionForm, achievements: e.target.value })}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Doubts & Difficult Topics</label>
            <textarea
              rows={2}
              placeholder="e.g. Need more practice in PGBP depreciation block adjustments"
              value={reflectionForm.struggles || ''}
              onChange={(e) => setReflectionForm({ ...reflectionForm, struggles: e.target.value })}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Tomorrow's Priority</label>
            <input
              type="text"
              placeholder="e.g. Finish Incorporation MOA/AOA and start Cash Flow AS 3"
              value={reflectionForm.tomorrowPriority || ''}
              onChange={(e) => setReflectionForm({ ...reflectionForm, tomorrowPriority: e.target.value })}
              className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-xs font-bold hover:bg-slate-900 active-touch flex items-center justify-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" /> Save Reflection Notes
          </button>
        </form>
      </div>

    </div>
  );
};
