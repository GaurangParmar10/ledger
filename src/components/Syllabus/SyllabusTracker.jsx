import React, { useState } from 'react';
import { useStudy } from '../../context/StudyContext';
import { ChevronDown, ChevronRight, Check, Search } from 'lucide-react';

export const SyllabusTracker = () => {
  const {
    subjects,
    chapters,
    updateChapterStatus,
    addRevision,
    selectedDate
  } = useStudy();

  const [expandedSubject, setExpandedSubject] = useState(subjects[0]?.id || 'law');
  const [searchQuery, setSearchQuery] = useState('');

  // Status symbols
  const getStatusSymbol = (status) => {
    switch (status) {
      case 'Completed': return '✓ Done';
      case 'In Progress': return '◐ In Progress';
      case 'Needs Revision': return '⟳ Needs Rev';
      default: return '○ Not Started';
    }
  };

  return (
    <div className="space-y-4 pb-bottom-nav font-sans text-neutral-900 dark:text-neutral-100">

      {/* Header & Search */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-black tracking-widest uppercase text-neutral-500 dark:text-neutral-400">
          COMPLETE SYLLABUS
        </h2>
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Filter chapters e.g. Preliminary, Basic, AS 3..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-2.5 text-xs font-bold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none"
      />

      {/* Subject Accordions */}
      <div className="space-y-3">
        {subjects.map(sub => {
          const subChaps = chapters.filter(c => c.subjectId === sub.id);
          const filteredChaps = subChaps.filter(c => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return c.name.toLowerCase().includes(q) || (c.group && c.group.toLowerCase().includes(q));
          });

          const isExpanded = expandedSubject === sub.id || searchQuery.trim().length > 0;
          const doneCount = subChaps.filter(c => c.status === 'Completed').length;

          // Group by group
          const groupsMap = {};
          filteredChaps.forEach(c => {
            const g = c.group || 'General';
            if (!groupsMap[g]) groupsMap[g] = [];
            groupsMap[g].push(c);
          });

          return (
            <div key={sub.id} className="mono-card rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedSubject(isExpanded ? null : sub.id)}
                className="w-full p-3.5 flex items-center justify-between font-black text-xs uppercase bg-neutral-100 dark:bg-neutral-900 active-touch"
              >
                <span>{sub.name} ({subChaps.length} Chapters)</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-neutral-400">{doneCount} / {subChaps.length}</span>
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-3 space-y-3 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800">
                  {Object.entries(groupsMap).map(([groupName, groupChaps]) => (
                    <div key={groupName} className="space-y-1.5">
                      <span className="text-[10px] font-black uppercase text-neutral-400 block">
                        {groupName}
                      </span>

                      <div className="space-y-1.5">
                        {groupChaps.map(chap => {
                          const revCount = chap.revisionCount || 0;
                          return (
                            <div
                              key={chap.id}
                              className="p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-2"
                            >
                              <div className="min-w-0 flex-1">
                                <p className={`text-xs font-bold ${chap.status === 'Completed' ? 'line-through opacity-60' : ''}`}>
                                  {chap.num ? `${chap.num}. ` : ''}{chap.name}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-neutral-400">
                                  <span>Revision × {revCount}</span>
                                  <button
                                    onClick={() => addRevision({ chapterId: chap.id, revisionType: `Rev ${revCount + 1}`, date: selectedDate })}
                                    className="px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold active-touch"
                                  >
                                    + REVISION
                                  </button>
                                </div>
                              </div>

                              {/* 1-Tap Status Cycler Button */}
                              <button
                                onClick={() => {
                                  const next =
                                    chap.status === 'Not Started' ? 'In Progress' :
                                    chap.status === 'In Progress' ? 'Completed' :
                                    chap.status === 'Completed' ? 'Needs Revision' : 'Not Started';
                                  updateChapterStatus(chap.id, next);
                                }}
                                className={`text-[10px] font-extrabold px-2.5 py-1 rounded border active-touch ${
                                  chap.status === 'Completed'
                                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 border-neutral-900'
                                    : 'border-neutral-400 text-neutral-700 dark:text-neutral-300'
                                }`}
                              >
                                {getStatusSymbol(chap.status)}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
};
