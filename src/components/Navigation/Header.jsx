import React from 'react';
import { useStudy } from '../../context/StudyContext';
import { ChevronLeft, ChevronRight, Moon, Sun, Search, Download } from 'lucide-react';

export const Header = ({ onOpenSearch }) => {
  const { selectedDate, setSelectedDate, todayDate, darkMode, toggleDarkMode, exportDataJSON } = useStudy();

  // Date shifting
  const shiftDate = (days) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Format date: e.g. 16 AUG 2026
  const formatDateReadable = (dStr) => {
    try {
      const parts = dStr.split('-');
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const day = d.getDate();
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      const month = monthNames[d.getMonth()];
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch (e) {
      return dStr;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-xl mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Title */}
        <div>
          <h1 className="text-sm font-black tracking-wider uppercase text-neutral-900 dark:text-neutral-100">
            DAILY LEDGER
          </h1>
        </div>

        {/* Date Navigator: [ < ] 16 AUG 2026 [ TODAY ] [ > ] */}
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-lg border border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => shiftDate(-1)}
            className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded active-touch"
            aria-label="Previous day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-mono font-bold px-1 text-neutral-900 dark:text-neutral-100">
            {formatDateReadable(selectedDate)}
          </span>

          {selectedDate !== todayDate ? (
            <button
              onClick={() => setSelectedDate(todayDate)}
              className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 active-touch"
            >
              TODAY
            </button>
          ) : null}

          <button
            onClick={() => shiftDate(1)}
            className="p-1 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded active-touch"
            aria-label="Next day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={exportDataJSON}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg active-touch"
            title="Download Data Backup"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenSearch}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg active-touch"
            title="Search & Calendar"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg active-touch"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
