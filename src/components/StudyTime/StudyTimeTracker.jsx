import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import {
  Clock,
  Video,
  BookOpen,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Calendar,
  TrendingUp
} from 'lucide-react';

export const StudyTimeTracker = () => {
  const {
    subjects,
    chapters,
    sessions,
    logStudySession,
    selectedDate
  } = useStudy();

  const [sessionType, setSessionType] = useState('Lecture'); // 'Lecture' | 'Self Study'
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id || 'law');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [hours, setHours] = useState('1');
  const [minutes, setMinutes] = useState('30');
  const [notes, setNotes] = useState('');
  const [link, setLink] = useState('');

  // Available chapters for selected subject
  const availableChapters = chapters.filter(c => c.subjectId === selectedSubject);

  // Form submit
  const handleLogSession = (e) => {
    e.preventDefault();
    const chapId = selectedChapter || availableChapters[0]?.id;
    if (!chapId) return;

    const totalDurationMins = (parseInt(hours) || 0) * 60 + (parseInt(minutes) || 0);
    if (totalDurationMins <= 0) return;

    logStudySession({
      chapterId: chapId,
      type: sessionType,
      durationMinutes: totalDurationMins,
      notes,
      link,
      date: selectedDate
    });

    setNotes('');
    setLink('');
  };

  // Format minutes
  const formatMins = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Calculate daily, weekly, monthly totals
  const dateObj = new Date(selectedDate);
  
  // Today's sessions
  const dateSessions = sessions.filter(s => s.date === selectedDate);
  const todayLectureMins = dateSessions.filter(s => s.type === 'Lecture').reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const todaySelfMins = dateSessions.filter(s => s.type === 'Self Study').reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  const todayTotalMins = todayLectureMins + todaySelfMins;

  // Past 7 Days (Weekly)
  const past7DaysMins = sessions.filter(s => {
    const diffDays = (dateObj - new Date(s.date)) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays < 7;
  }).reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  // Past 30 Days (Monthly)
  const past30DaysMins = sessions.filter(s => {
    const diffDays = (dateObj - new Date(s.date)) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays < 30;
  }).reduce((sum, s) => sum + (s.durationMinutes || 0), 0);

  return (
    <div className="space-y-5 animate-fade-in pb-bottom-nav">

      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Study Time Tracker
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Log Lecture vs Self-Study sessions
        </p>
      </div>

      {/* TOTALS SUMMARY GRID */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="glass-card p-3 rounded-2xl border border-blue-500/20 bg-blue-500/5">
          <span className="text-[10px] font-extrabold uppercase text-blue-500 block">Today Total</span>
          <span className="text-base font-black text-blue-600 dark:text-blue-400">{formatMins(todayTotalMins)}</span>
        </div>
        <div className="glass-card p-3 rounded-2xl">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Weekly (7d)</span>
          <span className="text-base font-black text-slate-800 dark:text-slate-200">{formatMins(past7DaysMins)}</span>
        </div>
        <div className="glass-card p-3 rounded-2xl">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Monthly (30d)</span>
          <span className="text-base font-black text-slate-800 dark:text-slate-200">{formatMins(past30DaysMins)}</span>
        </div>
      </div>

      {/* LOG STUDY SESSION FORM */}
      <div className="glass-card rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
            <Plus className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Log Study Duration
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Session for {selectedDate}
            </p>
          </div>
        </div>

        <form onSubmit={handleLogSession} className="space-y-3">
          {/* Lecture vs Self Study toggle */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSessionType('Lecture')}
              className={`py-2 rounded-xl text-xs font-black border flex items-center justify-center gap-1.5 active-touch ${
                sessionType === 'Lecture'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Video className="w-4 h-4" /> Lecture Study
            </button>

            <button
              type="button"
              onClick={() => setSessionType('Self Study')}
              className={`py-2 rounded-xl text-xs font-black border flex items-center justify-center gap-1.5 active-touch ${
                sessionType === 'Self Study'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" /> Self Study
            </button>
          </div>

          {/* Subject & Chapter selector */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedChapter('');
                }}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Chapter</label>
              <select
                value={selectedChapter || availableChapters[0]?.id || ''}
                onChange={(e) => setSelectedChapter(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              >
                {availableChapters.map(ch => (
                  <option key={ch.id} value={ch.id}>
                    {ch.num ? `${ch.num}. ` : ''}{ch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Duration inputs (Hours & Minutes) */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hours</label>
              <input
                type="number"
                min="0"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Session Notes & Optional Link */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Notes / Topics Covered</label>
            <input
              type="text"
              placeholder="e.g. Watched Lecture 5 or solved 15 practice questions"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          {sessionType === 'Lecture' && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Lecture Video Link (Optional)</label>
              <input
                type="url"
                placeholder="https://youtube.com/..."
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs shadow-md shadow-blue-500/20 active-touch flex items-center justify-center gap-1.5"
          >
            <Clock className="w-4 h-4" /> Save Study Session
          </button>
        </form>
      </div>

      {/* TODAY'S LOGGED SESSIONS LIST */}
      <div className="glass-card rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Logged Sessions ({selectedDate})</span>
          <span className="text-xs text-blue-500 font-bold">{formatMins(todayTotalMins)}</span>
        </h3>

        {dateSessions.length === 0 ? (
          <p className="text-xs text-slate-400 italic text-center py-4">No study sessions logged for {selectedDate} yet.</p>
        ) : (
          <div className="space-y-2">
            {dateSessions.map(s => {
              const chap = chapters.find(c => c.id === s.chapterId);
              const sub = subjects.find(sub => sub.id === chap?.subjectId);
              return (
                <div key={s.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${sub?.badgeColor}`}>
                        {sub?.name}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${s.type === 'Lecture' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {s.type}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white mt-1">
                      {chap?.name}
                    </p>
                    {s.notes && <p className="text-[11px] text-slate-500 italic mt-0.5">"{s.notes}"</p>}
                  </div>

                  <span className="font-black text-xs text-slate-800 dark:text-slate-100 whitespace-nowrap">
                    {formatMins(s.durationMinutes)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
