import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Search } from 'lucide-react';

export const RevisionTracker = () => {
  const { subjects, chapters, revisions, addRevision, selectedDate } = useStudy();
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChapters = chapters.filter(c => {
    if (subjectFilter !== 'all' && c.subjectId !== subjectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.group && c.group.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-4 pb-bottom-nav font-sans text-neutral-900 dark:text-neutral-100">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
          REVISION TRACKER
        </h2>
        <span className="text-xs font-mono font-bold text-neutral-400">
          {revisions.length} Total Revs
        </span>
      </div>

      {/* Filters */}
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Search chapter..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2.5 text-xs font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none"
        />

        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSubjectFilter('all')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded border ${
              subjectFilter === 'all'
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-transparent'
            }`}
          >
            All
          </button>
          {subjects.map(s => (
            <button
              key={s.id}
              onClick={() => setSubjectFilter(s.id)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded border ${
                subjectFilter === s.id
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900'
                  : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border-transparent'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chapter Revision List */}
      <div className="space-y-2">
        {filteredChapters.map(chap => {
          const sub = subjects.find(s => s.id === chap.subjectId);
          const count = chap.revisionCount || 0;

          return (
            <div
              key={chap.id}
              className="mono-card rounded-xl p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase text-neutral-400 block">
                  {sub?.name} {chap.group ? `• ${chap.group}` : ''}
                </span>
                <p className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                  {chap.name}
                </p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Last Rev: {chap.lastRevisionDate || 'Never'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black">
                  Revision × {count}
                </span>

                <button
                  onClick={() => addRevision({ chapterId: chap.id, revisionType: `Rev ${count + 1}`, date: selectedDate })}
                  className="px-2.5 py-1 rounded text-xs font-extrabold border border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900 active-touch"
                >
                  + REVISION
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
