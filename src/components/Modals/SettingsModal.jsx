import React, { useRef } from 'react';
import { useStudy } from '../../context/StudyContext';
import { Settings, Download, Upload, RefreshCw, Calendar, X, ShieldAlert } from 'lucide-react';

export const SettingsModal = ({ isOpen, onClose }) => {
  const {
    examDate,
    setExamDate,
    exportDataJSON,
    importDataJSON,
    resetToDefault
  } = useStudy();

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        importDataJSON(event.target.result);
        onClose();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-fade-in">

        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-amber-500" />
            Settings & Data Backup
          </h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 1. Exam Countdown Settings */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Calendar className="w-4 h-4 text-amber-500" />
            <span>Target CA Exam Date</span>
          </div>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
          />
        </div>

        {/* 2. Backup & Export */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
          <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">Data Export & Import</h4>
          <p className="text-[11px] text-slate-500">Backup your entire study ledger to a JSON file or restore from a previous file.</p>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={exportDataJSON}
              className="py-2.5 px-3 rounded-xl bg-amber-500 text-white font-bold text-xs shadow-xs hover:bg-amber-600 active-touch flex items-center justify-center gap-1.5"
            >
              <Download className="w-4 h-4" /> Export Backup
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="py-2.5 px-3 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-bold text-xs shadow-xs hover:bg-slate-900 active-touch flex items-center justify-center gap-1.5"
            >
              <Upload className="w-4 h-4" /> Import Backup
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* 3. Reset Data */}
        <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-4 h-4" />
            <span>Reset Database</span>
          </div>
          <p className="text-[11px] text-rose-700 dark:text-rose-300">Resets chapters, targets, and sessions back to initial seed state.</p>
          <button
            onClick={() => {
              resetToDefault();
              onClose();
            }}
            className="w-full py-2 rounded-xl bg-rose-600 text-white font-extrabold text-xs hover:bg-rose-700 active-touch flex items-center justify-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset to Initial Seed
          </button>
        </div>

      </div>
    </div>
  );
};
