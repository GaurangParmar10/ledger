import React from 'react';
import { useStudy } from '../../context/StudyContext';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  RotateCcw,
  Flame,
  Award,
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';

export const AnalyticsDashboard = () => {
  const {
    subjects,
    chapters,
    sessions,
    revisions,
    targets,
    streakStats
  } = useStudy();

  // Format mins
  const formatMins = (mins) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  // Total Study Minutes across all time
  const totalMinsAllTime = sessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);

  // Subject-wise Study Time & Percentage
  const subjectTimeBreakdown = subjects.map(sub => {
    const subChapIds = new Set(chapters.filter(c => c.subjectId === sub.id).map(c => c.id));
    const subSessions = sessions.filter(s => subChapIds.has(s.chapterId));
    const mins = subSessions.reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const pct = totalMinsAllTime > 0 ? Math.round((mins / totalMinsAllTime) * 100) : 0;
    return { subject: sub, mins, pct };
  });

  // Chapter Status breakdown
  const completedCount = chapters.filter(c => c.status === 'Completed').length;
  const inProgressCount = chapters.filter(c => c.status === 'In Progress').length;
  const needsRevCount = chapters.filter(c => c.status === 'Needs Revision').length;
  const notStartedCount = chapters.filter(c => c.status === 'Not Started').length;
  const totalChaps = chapters.length;

  // Revision Stats
  const totalRevsCount = revisions.length;
  const zeroRevChaps = chapters.filter(c => (c.revisionCount || 0) === 0).length;
  const oneRevChaps = chapters.filter(c => (c.revisionCount || 0) === 1).length;
  const multiRevChaps = chapters.filter(c => (c.revisionCount || 0) >= 2).length;

  return (
    <div className="space-y-5 animate-fade-in pb-bottom-nav">

      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-amber-500" />
          Study Analytics & Insights
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Automatic calculations of hours, progress & revisions
        </p>
      </div>

      {/* STREAK & CONSISTENCY CARDS */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="glass-card p-3 rounded-2xl border border-amber-500/20 bg-amber-500/5">
          <span className="text-[9px] font-extrabold uppercase text-amber-500 block">Current Streak</span>
          <span className="text-lg font-black text-amber-600 dark:text-amber-400">{streakStats.currentStreak} Days</span>
        </div>

        <div className="glass-card p-3 rounded-2xl">
          <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Longest Streak</span>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100">{streakStats.longestStreak} Days</span>
        </div>

        <div className="glass-card p-3 rounded-2xl">
          <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Active Days</span>
          <span className="text-lg font-black text-slate-800 dark:text-slate-100">{streakStats.activeDays} Days</span>
        </div>
      </div>

      {/* SUBJECT TIME DISTRIBUTION */}
      <div className="glass-card rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
            <PieChart className="w-4 h-4 text-amber-500" />
            Subject Study Time Distribution
          </h3>
          <span className="text-xs font-bold text-slate-500">{formatMins(totalMinsAllTime)} Total</span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
          {subjectTimeBreakdown.map(({ subject, pct }) => (
            <div
              key={subject.id}
              className={`h-full bg-gradient-to-r ${subject.color}`}
              style={{ width: `${pct}%` }}
              title={`${subject.name}: ${pct}%`}
            />
          ))}
        </div>

        {/* Subject Legend Rows */}
        <div className="space-y-2 pt-1">
          {subjectTimeBreakdown.map(({ subject, mins, pct }) => (
            <div key={subject.id} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full bg-gradient-to-r ${subject.color}`} />
                <span className="font-bold text-slate-800 dark:text-slate-200">{subject.name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 font-medium">
                <span>{formatMins(mins)}</span>
                <span className="font-extrabold text-slate-900 dark:text-white w-10 text-right">{pct}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAPTER COMPLETION RATIOS */}
      <div className="glass-card rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          Chapter Completion Metrics
        </h3>

        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="text-[10px] font-bold text-emerald-600 uppercase block">Completed</span>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{completedCount}</span>
            <span className="text-[10px] text-slate-400 block">{Math.round((completedCount / totalChaps) * 100)}% of Syllabus</span>
          </div>

          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <span className="text-[10px] font-bold text-blue-600 uppercase block">In Progress</span>
            <span className="text-xl font-black text-blue-600 dark:text-blue-400">{inProgressCount}</span>
            <span className="text-[10px] text-slate-400 block">Active Study</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="text-[10px] font-bold text-amber-600 uppercase block">Needs Revision</span>
            <span className="text-xl font-black text-amber-600 dark:text-amber-400">{needsRevCount}</span>
            <span className="text-[10px] text-slate-400 block">Scheduled</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Not Started</span>
            <span className="text-xl font-black text-slate-700 dark:text-slate-300">{notStartedCount}</span>
            <span className="text-[10px] text-slate-400 block">{totalChaps - completedCount} Left</span>
          </div>
        </div>
      </div>

      {/* REVISION ANALYTICS */}
      <div className="glass-card rounded-2xl p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
          <RotateCcw className="w-4 h-4 text-purple-500" />
          Revision Analytics
        </h3>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Total Revisions Conducted</span>
            <span className="font-black text-purple-600 dark:text-purple-400 text-sm">{totalRevsCount}</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Chapters Never Revised (0)</span>
            <span className="font-bold text-rose-500">{zeroRevChaps} chapters</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Chapters Revised 1 Time</span>
            <span className="font-bold text-amber-500">{oneRevChaps} chapters</span>
          </div>

          <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Chapters Revised 2+ Times</span>
            <span className="font-bold text-emerald-500">{multiRevChaps} chapters</span>
          </div>
        </div>
      </div>

    </div>
  );
};
