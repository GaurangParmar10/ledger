import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import {
  Plus,
  Check,
  RotateCcw,
  Clock,
  ChevronDown,
  ChevronUp,
  X,
  BookOpen
} from 'lucide-react';

export const HomeDashboard = () => {
  const {
    selectedDate,
    targets,
    chapters,
    subjects,
    sessions,
    revisions,
    addDailyTarget,
    toggleTargetStatus,
    addRevision,
    logStudySession,
    dailyNotes,
    saveDailyNotes
  } = useStudy();

  // Add Chapter Inline State
  const [showAddInline, setShowAddInline] = useState(false);
  const [targetSubject, setTargetSubject] = useState(subjects[0]?.id || 'law');
  const [searchChapter, setSearchChapter] = useState('');
  const [selectedChapId, setSelectedChapId] = useState('');

  // Study Time Inline State
  const [activeTimeType, setActiveTimeType] = useState(null); // 'Lecture' | 'Self Study' | null
  const [timeHours, setTimeHours] = useState('');
  const [timeMins, setTimeMins] = useState('');

  // Daily Notes state
  const [notesText, setNotesText] = useState(dailyNotes[selectedDate]?.notes || '');

  React.useEffect(() => {
    setNotesText(dailyNotes[selectedDate]?.notes || '');
  }, [selectedDate, dailyNotes]);

  // Filter targets for selected date
  const dateTargets = targets.filter(t => t.date === selectedDate);

  // Available chapters for selected subject
  const availableChapters = chapters.filter(c => c.subjectId === targetSubject);

  // Filtered chapters for inline search
  const filteredSearchChapters = availableChapters.filter(c => {
    if (!searchChapter.trim()) return true;
    return c.name.toLowerCase().includes(searchChapter.toLowerCase()) || (c.group && c.group.toLowerCase().includes(searchChapter.toLowerCase()));
  });

  // Handle Target Creation (1-Tap)
  const handleQuickAddTarget = (chapId) => {
    if (!chapId) return;
    addDailyTarget({
      date: selectedDate,
      subjectId: targetSubject,
      chapterId: chapId,
      priority: 'Medium',
      notes: ''
    });
    setSearchChapter('');
    setSelectedChapId('');
    setShowAddInline(false);
  };

  // Log Study Time
  const handleSaveStudyTime = (e) => {
    e.preventDefault();
    if (!activeTimeType) return;
    const durMins = (parseInt(timeHours) || 0) * 60 + (parseInt(timeMins) || 0);
    if (durMins <= 0) return;

    // Pick first chapter from today's targets or default chapter
    const fallbackChapId = dateTargets[0]?.chapterId || chapters[0]?.id;

    logStudySession({
      chapterId: fallbackChapId,
      type: activeTimeType,
      durationMinutes: durMins,
      date: selectedDate
    });

    setTimeHours('');
    setTimeMins('');
    setActiveTimeType(null);
  };

  // Filter sessions for selected date
  const dateSessions = sessions.filter(s => s.date === selectedDate);
  const lectureMins = dateSessions.filter(s => s.type === 'Lecture').reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const selfStudyMins = dateSessions.filter(s => s.type === 'Self Study').reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const totalMins = lectureMins + selfStudyMins;

  // Format minutes: e.g. 2h 30m
  const formatTime = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Completed chapters for derived "WHAT I STUDIED"
  const completedTodayTargets = dateTargets.filter(t => t.completed);

  // Syllabus Overview calculations
  const getSubStats = (subId) => {
    const subChaps = chapters.filter(c => c.subjectId === subId);
    const done = subChaps.filter(c => c.status === 'Completed').length;
    return { done, total: subChaps.length };
  };

  const totalDone = chapters.filter(c => c.status === 'Completed').length;
  const totalChaps = chapters.length;

  return (
    <div className="space-y-6 pb-bottom-nav font-sans text-neutral-900 dark:text-neutral-100">

      {/* 1. TODAY'S TARGET SECTION */}
      <section className="mono-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
            TODAY'S TARGET
          </h2>
          {!showAddInline && (
            <button
              onClick={() => setShowAddInline(true)}
              className="text-xs font-bold px-2.5 py-1 rounded border border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 active-touch"
            >
              + ADD TARGET
            </button>
          )}
        </div>

        {/* Inline Quick Target Picker */}
        {showAddInline && (
          <div className="p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Select Chapter to Add</span>
              <button onClick={() => setShowAddInline(false)} className="text-neutral-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Subject Selector Pills */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar py-1">
              {subjects.map(s => (
                <button
                  key={s.id}
                  onClick={() => setTargetSubject(s.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded border ${
                    targetSubject === s.id
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-transparent'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Type chapter name e.g. Preliminary..."
              value={searchChapter}
              onChange={(e) => setSearchChapter(e.target.value)}
              className="w-full p-2 text-xs font-medium rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 focus:outline-none"
            />

            {/* Quick List */}
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredSearchChapters.map(ch => (
                <button
                  key={ch.id}
                  onClick={() => handleQuickAddTarget(ch.id)}
                  className="w-full text-left p-2 rounded text-xs font-bold border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-between active-touch"
                >
                  <span>{ch.num ? `${ch.num}. ` : ''}{ch.name}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">+ Add</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 2. STUDY MAIN TASK CHECKLIST */}
      <section className="mono-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <h2 className="text-xs font-black tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
            STUDY
          </h2>
          <span className="text-xs font-mono font-bold text-neutral-400">
            {dateTargets.filter(t => t.completed).length} / {dateTargets.length}
          </span>
        </div>

        {dateTargets.length === 0 ? (
          <p className="text-xs text-neutral-400 italic py-4 text-center">
            No study chapters added for today yet. Tap "+ ADD TARGET" above.
          </p>
        ) : (
          <div className="space-y-2">
            {dateTargets.map(target => {
              const chap = chapters.find(c => c.id === target.chapterId);
              const sub = subjects.find(s => s.id === chap?.subjectId);
              const revCount = chap?.revisionCount || 0;

              return (
                <div
                  key={target.id}
                  className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-start justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase">
                      <span>{sub?.name}</span>
                      {chap?.group && (
                        <>
                          <span>•</span>
                          <span>{chap.group}</span>
                        </>
                      )}
                    </div>

                    <p className={`text-xs font-bold mt-0.5 ${target.completed ? 'line-through opacity-50' : 'text-neutral-900 dark:text-neutral-100'}`}>
                      {chap ? chap.name : 'Chapter'}
                    </p>

                    {/* Revision Counter & 1-Tap Revision trigger */}
                    <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                      <span className="font-mono text-neutral-500">
                        Revision × {revCount}
                      </span>
                      <button
                        onClick={() => addRevision({ chapterId: target.chapterId, revisionType: `Rev ${revCount + 1}`, date: selectedDate })}
                        className="px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 font-bold hover:bg-neutral-100 dark:hover:bg-neutral-800 active-touch"
                      >
                        + REVISION
                      </button>
                    </div>
                  </div>

                  {/* 1-TAP DONE BUTTON */}
                  <button
                    onClick={() => toggleTargetStatus(target.id)}
                    className={`px-3 py-1.5 rounded text-xs font-extrabold border active-touch ${
                      target.completed
                        ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900'
                        : 'border-neutral-400 text-neutral-800 dark:text-neutral-200 hover:border-neutral-900 dark:hover:border-neutral-100'
                    }`}
                  >
                    {target.completed ? '✓ DONE' : 'DONE'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. STUDY TIME SECTION */}
      <section className="mono-card rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
          <h2 className="text-xs font-black tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
            STUDY TIME
          </h2>
          <span className="text-xs font-mono font-bold text-neutral-900 dark:text-neutral-100">
            TOTAL: {formatTime(totalMins)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Lecture Time Row */}
          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
            <span className="text-[10px] font-bold uppercase text-neutral-400 block">Lecture</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-bold">{formatTime(lectureMins)}</span>
              <button
                onClick={() => setActiveTimeType(activeTimeType === 'Lecture' ? null : 'Lecture')}
                className="text-[10px] font-bold px-2 py-1 rounded border border-neutral-400 active-touch"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Self Study Time Row */}
          <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-1">
            <span className="text-[10px] font-bold uppercase text-neutral-400 block">Self Study</span>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono font-bold">{formatTime(selfStudyMins)}</span>
              <button
                onClick={() => setActiveTimeType(activeTimeType === 'Self Study' ? null : 'Self Study')}
                className="text-[10px] font-bold px-2 py-1 rounded border border-neutral-400 active-touch"
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Tiny Inline Time Input */}
        {activeTimeType && (
          <form onSubmit={handleSaveStudyTime} className="p-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 space-y-2">
            <span className="text-xs font-bold block">Add {activeTimeType} Time</span>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Hours"
                min="0"
                max="24"
                value={timeHours}
                onChange={(e) => setTimeHours(e.target.value)}
                className="w-1/2 p-2 text-xs font-bold rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none"
              />
              <input
                type="number"
                placeholder="Mins"
                min="0"
                max="59"
                value={timeMins}
                onChange={(e) => setTimeMins(e.target.value)}
                className="w-1/2 p-2 text-xs font-bold rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 py-1.5 rounded bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-bold active-touch"
              >
                SAVE
              </button>
              <button
                type="button"
                onClick={() => setActiveTimeType(null)}
                className="px-3 py-1.5 rounded border border-neutral-400 text-xs font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </section>

      {/* 4. WHAT I STUDIED TODAY (AUTOMATICALLY DERIVED) */}
      <section className="mono-card rounded-xl p-4 space-y-2">
        <h2 className="text-xs font-black tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
          WHAT I STUDIED TODAY
        </h2>

        {completedTodayTargets.length === 0 ? (
          <p className="text-xs text-neutral-400 italic">No completed chapters recorded today yet.</p>
        ) : (
          <div className="space-y-1">
            {completedTodayTargets.map(t => {
              const chap = chapters.find(c => c.id === t.chapterId);
              const sub = subjects.find(s => s.id === chap?.subjectId);
              return (
                <div key={t.id} className="text-xs font-medium flex items-center gap-2">
                  <span className="text-neutral-400 font-bold">•</span>
                  <span className="font-bold">{sub?.name}</span>
                  <span>→</span>
                  <span>{chap?.name}</span>
                  <span className="font-bold text-neutral-900 dark:text-neutral-100">✓</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. MINIMAL SYLLABUS PROGRESS */}
      <section className="mono-card rounded-xl p-4 space-y-3">
        <h2 className="text-xs font-black tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
          PROGRESS
        </h2>

        <div className="space-y-2">
          {subjects.map(s => {
            const stats = getSubStats(s.id);
            const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
            return (
              <div key={s.id} className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span>{s.name}</span>
                  <span className="font-mono">{stats.done} / {stats.total}</span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-neutral-900 dark:bg-neutral-100 h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}

          {/* OVERALL */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
            <div className="flex justify-between text-xs font-black">
              <span>OVERALL</span>
              <span className="font-mono">{totalDone} / {totalChaps} ({Math.round((totalDone / totalChaps) * 100)}%)</span>
            </div>
            <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-neutral-900 dark:bg-neutral-100 h-full rounded-full"
                style={{ width: `${Math.round((totalDone / totalChaps) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 6. DAILY REFLECTION NOTES */}
      <section className="mono-card rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
            DAILY NOTES
          </h2>
          <button
            onClick={() => saveDailyNotes(selectedDate, { notes: notesText })}
            className="text-[10px] font-bold px-2 py-0.5 rounded border border-neutral-400 active-touch"
          >
            Save Notes
          </button>
        </div>
        <textarea
          rows={2}
          placeholder="Quick notes on what went well or doubts..."
          value={notesText}
          onChange={(e) => setNotesText(e.target.value)}
          className="w-full p-2 text-xs font-medium rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none"
        />
      </section>

    </div>
  );
};
