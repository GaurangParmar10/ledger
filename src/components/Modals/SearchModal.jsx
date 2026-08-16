import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { ChevronLeft, ChevronRight, Search, X, Calendar as CalendarIcon } from 'lucide-react';

export const SearchModal = ({ isOpen, onClose }) => {
  const {
    selectedDate,
    setSelectedDate,
    todayDate,
    targets,
    sessions,
    revisions,
    dailyNotes,
    chapters,
    subjects
  } = useStudy();

  // Calendar month state (defaults to month of selectedDate or today)
  const getInitialYearMonth = () => {
    try {
      const parts = selectedDate.split('-');
      return { year: parseInt(parts[0]), month: parseInt(parts[1]) - 1 };
    } catch (e) {
      return { year: 2026, month: 7 }; // Aug 2026
    }
  };

  const [currentYearMonth, setCurrentYearMonth] = useState(getInitialYearMonth());
  const [activeCalDate, setActiveCalDate] = useState(selectedDate);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const monthNames = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const currentMonthName = monthNames[currentYearMonth.month];

  // Month Shifting
  const shiftMonth = (delta) => {
    setCurrentYearMonth(prev => {
      let newM = prev.month + delta;
      let newY = prev.year;
      if (newM < 0) {
        newM = 11;
        newY -= 1;
      } else if (newM > 11) {
        newM = 0;
        newY += 1;
      }
      return { year: newY, month: newM };
    });
  };

  // Jump to Today
  const handleJumpToToday = () => {
    try {
      const parts = todayDate.split('-');
      setCurrentYearMonth({ year: parseInt(parts[0]), month: parseInt(parts[1]) - 1 });
      setActiveCalDate(todayDate);
      setSelectedDate(todayDate);
    } catch (e) {}
  };

  // Format minutes
  const formatMins = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Get data record for any YYYY-MM-DD
  const getDateRecord = (dStr) => {
    const dTargets = targets.filter(t => t.date === dStr);
    const completedTargets = dTargets.filter(t => t.completed);

    const dSessions = sessions.filter(s => s.date === dStr);
    const lectureMins = dSessions.filter(s => s.type === 'Lecture').reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const selfMins = dSessions.filter(s => s.type === 'Self Study').reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalMins = lectureMins + selfMins;

    const dRevisions = revisions.filter(r => r.date === dStr);
    const noteObj = dailyNotes[dStr] || null;

    const hasActivity = completedTargets.length > 0 || totalMins > 0 || dRevisions.length > 0;

    return {
      date: dStr,
      completedTargets,
      lectureMins,
      selfMins,
      totalMins,
      dRevisions,
      noteObj,
      hasActivity
    };
  };

  // Generate calendar days matrix for active month
  const generateCalendarGrid = () => {
    const { year, month } = currentYearMonth;
    const firstDayOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday = 0, Sunday = 6
    let dayOfWeek = firstDayOfMonth.getDay() - 1;
    if (dayOfWeek < 0) dayOfWeek = 6;

    const grid = [];
    // Blank leading offset cells
    for (let i = 0; i < dayOfWeek; i++) {
      grid.push(null);
    }
    // Day numbers
    for (let d = 1; d <= daysInMonth; d++) {
      const monthStr = (month + 1).toString().padStart(2, '0');
      const dayStr = d.toString().padStart(2, '0');
      const dateStr = `${year}-${monthStr}-${dayStr}`;
      grid.push({ dayNumber: d, dateStr, record: getDateRecord(dateStr) });
    }
    return grid;
  };

  const calendarGrid = generateCalendarGrid();

  // Search logic across chapters/subjects
  const searchResults = (() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const matches = [];

    // Search targets
    targets.forEach(t => {
      const chap = chapters.find(c => c.id === t.chapterId);
      const sub = subjects.find(s => s.id === chap?.subjectId);
      if (chap?.name.toLowerCase().includes(q) || sub?.name.toLowerCase().includes(q)) {
        matches.push({ date: t.date, title: `${sub?.name} → ${chap?.name}`, type: t.completed ? 'Completed ✓' : 'Target' });
      }
    });

    // Search sessions
    sessions.forEach(s => {
      const chap = chapters.find(c => c.id === s.chapterId);
      const sub = subjects.find(subItem => subItem.id === chap?.subjectId);
      if (chap?.name.toLowerCase().includes(q) || sub?.name.toLowerCase().includes(q)) {
        matches.push({ date: s.date, title: `${sub?.name} → ${chap?.name}`, type: `${s.type} (${formatMins(s.durationMinutes)})` });
      }
    });

    // Search revisions
    revisions.forEach(r => {
      const chap = chapters.find(c => c.id === r.chapterId);
      const sub = subjects.find(subItem => subItem.id === chap?.subjectId);
      if (chap?.name.toLowerCase().includes(q) || sub?.name.toLowerCase().includes(q)) {
        matches.push({ date: r.date, title: `${sub?.name} → ${chap?.name}`, type: `${r.revisionType}` });
      }
    });

    return matches;
  })();

  // Select date from search result
  const handleSelectSearchResult = (dStr) => {
    try {
      const parts = dStr.split('-');
      setCurrentYearMonth({ year: parseInt(parts[0]), month: parseInt(parts[1]) - 1 });
      setActiveCalDate(dStr);
      setSelectedDate(dStr);
      setSearchQuery('');
    } catch (e) {}
  };

  const activeRecord = getDateRecord(activeCalDate);

  // Group active record completed chapters by subject
  const completedBySubject = {};
  activeRecord.completedTargets.forEach(t => {
    const chap = chapters.find(c => c.id === t.chapterId);
    const sub = subjects.find(s => s.id === chap?.subjectId);
    const subName = sub ? sub.name : 'Other';
    if (!completedBySubject[subName]) completedBySubject[subName] = [];
    completedBySubject[subName].push(chap?.name);
  });

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="bg-white dark:bg-neutral-950 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-fade-in font-sans text-neutral-900 dark:text-neutral-100">

        {/* Modal Header */}
        <div className="p-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-neutral-900 dark:text-neutral-100" />
            <h2 className="text-xs font-black tracking-widest uppercase">STUDY HISTORY & CALENDAR</h2>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Secondary Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search chapter or subject e.g. Preliminary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 text-xs font-bold focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2 text-neutral-400 text-xs">
                ✕
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {searchQuery && (
            <div className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 space-y-1 max-h-36 overflow-y-auto">
              <span className="text-[10px] font-black uppercase text-neutral-400 block">Search Results</span>
              {searchResults.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No matching records found.</p>
              ) : (
                searchResults.map((res, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSearchResult(res.date)}
                    className="w-full text-left p-1.5 rounded text-xs font-bold hover:bg-neutral-200 dark:hover:bg-neutral-800 flex items-center justify-between active-touch"
                  >
                    <span>{res.title}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{res.date} ({res.type})</span>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Month Navigation Header */}
          <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-900 p-2 rounded-xl border border-neutral-200 dark:border-neutral-800">
            <button
              onClick={() => shiftMonth(-1)}
              className="text-xs font-bold px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 active-touch flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Prev
            </button>

            <div className="text-center">
              <h3 className="text-xs font-black font-mono">
                {currentMonthName} {currentYearMonth.year}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleJumpToToday}
                className="text-[10px] font-black uppercase px-2 py-1 rounded bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 active-touch"
              >
                Today
              </button>
              <button
                onClick={() => shiftMonth(1)}
                className="text-xs font-bold px-2 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 active-touch flex items-center gap-1"
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Calendar Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-black text-neutral-400 tracking-wider uppercase border-b border-neutral-200 dark:border-neutral-800 pb-1">
            <span>MON</span>
            <span>TUE</span>
            <span>WED</span>
            <span>THU</span>
            <span>FRI</span>
            <span>SAT</span>
            <span>SUN</span>
          </div>

          {/* Calendar Month Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarGrid.map((item, idx) => {
              if (!item) {
                return <div key={`blank_${idx}`} className="h-10" />;
              }

              const isToday = item.dateStr === todayDate;
              const isSelected = item.dateStr === activeCalDate;
              const rec = item.record;

              return (
                <button
                  key={item.dateStr}
                  onClick={() => {
                    setActiveCalDate(item.dateStr);
                    setSelectedDate(item.dateStr);
                  }}
                  className={`h-11 rounded-lg border flex flex-col items-center justify-between p-1 transition-all active-touch ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 font-extrabold'
                      : isToday
                      ? 'border-neutral-900 dark:border-neutral-100 font-bold bg-neutral-100 dark:bg-neutral-900'
                      : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200'
                  }`}
                >
                  <span className="text-xs font-mono">{item.dayNumber}</span>

                  {/* Compact Activity Indicator */}
                  {rec.hasActivity ? (
                    <span className={`text-[8px] font-black truncate max-w-full px-0.5 rounded ${
                      isSelected ? 'text-white dark:text-neutral-900' : 'text-neutral-900 dark:text-neutral-100'
                    }`}>
                      • {rec.totalMins > 0 ? formatTime(rec.totalMins) : `${rec.completedTargets.length} items`}
                    </span>
                  ) : (
                    <span className="w-1 h-1" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Daily Summary Inspector Panel */}
          <div className="p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-1.5">
              <h4 className="text-xs font-black font-mono uppercase text-neutral-900 dark:text-neutral-100">
                {activeCalDate} {activeCalDate === todayDate ? '(TODAY)' : ''}
              </h4>
              <span className="text-[10px] font-bold text-neutral-400 uppercase">DAILY SUMMARY</span>
            </div>

            {!activeRecord.hasActivity && !activeRecord.noteObj?.notes ? (
              <p className="text-xs font-bold text-neutral-400 py-2 italic text-center">
                No study recorded.
              </p>
            ) : (
              <div className="space-y-2 text-xs">
                {/* STUDIED Chapters */}
                {Object.keys(completedBySubject).length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-neutral-400 block">STUDIED</span>
                    {Object.entries(completedBySubject).map(([subName, chapList]) => (
                      <div key={subName} className="pl-1">
                        <span className="font-bold uppercase text-[10px] text-neutral-500">{subName}:</span>
                        <div className="space-y-0.5 mt-0.5">
                          {chapList.map((chapName, i) => (
                            <div key={i} className="font-bold flex items-center justify-between text-xs">
                              <span>• {chapName}</span>
                              <span className="font-black text-neutral-900 dark:text-neutral-100">✓</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* STUDY TIME */}
                {activeRecord.totalMins > 0 && (
                  <div className="p-2 rounded bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-0.5 text-xs">
                    <span className="text-[10px] font-black uppercase text-neutral-400 block">STUDY TIME</span>
                    <div className="flex justify-between font-mono">
                      <span>Lecture: {formatMins(activeRecord.lectureMins)}</span>
                      <span>Self Study: {formatMins(activeRecord.selfMins)}</span>
                    </div>
                    <div className="flex justify-between font-mono font-black border-t border-neutral-200 dark:border-neutral-800 pt-1">
                      <span>Total:</span>
                      <span>{formatMins(activeRecord.totalMins)}</span>
                    </div>
                  </div>
                )}

                {/* REVISIONS */}
                {activeRecord.dRevisions.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-neutral-400 block">REVISIONS</span>
                    {activeRecord.dRevisions.map((r, i) => {
                      const chap = chapters.find(c => c.id === r.chapterId);
                      const sub = subjects.find(s => s.id === chap?.subjectId);
                      return (
                        <div key={i} className="font-bold text-xs">
                          • {sub?.name} → {chap?.name} — {r.revisionType}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* NOTES */}
                {activeRecord.noteObj?.notes && (
                  <div className="text-[11px] italic text-neutral-600 dark:text-neutral-400 border-t border-neutral-200 dark:border-neutral-800 pt-1">
                    "{activeRecord.noteObj.notes}"
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
