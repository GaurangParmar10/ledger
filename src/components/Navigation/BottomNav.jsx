import React from 'react';
import { Home, BookOpen, RotateCcw, BookMarked } from 'lucide-react';

export const BottomNav = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'today', label: 'TODAY', icon: Home },
    { id: 'syllabus', label: 'SYLLABUS', icon: BookOpen },
    { id: 'revision', label: 'REVISION', icon: RotateCcw },
    { id: 'ledger', label: 'LEDGER', icon: BookMarked }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 py-2 px-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-all active-touch ${
                isActive
                  ? 'text-neutral-900 dark:text-neutral-100 font-extrabold'
                  : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 font-bold'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.8px]'}`} />
              <span className="text-[10px] tracking-wider mt-1">{item.label}</span>
              {isActive && (
                <span className="w-4 h-0.5 bg-neutral-900 dark:bg-neutral-100 rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
