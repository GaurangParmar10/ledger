import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  INITIAL_SUBJECTS,
  INITIAL_CHAPTERS,
  INITIAL_TARGETS,
  INITIAL_SESSIONS,
  INITIAL_REVISIONS,
  INITIAL_DAILY_NOTES,
  INITIAL_PRACTICE
} from '../data/initialData';

const StudyContext = createContext(null);

const TODAY_DATE = '2026-08-16';

export const StudyProvider = ({ children }) => {
  // Helper to get stored JSON or fallback
  const getStored = (key, fallback) => {
    try {
      const stored = localStorage.getItem(`ca_tracker_v3_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return fallback;
    }
  };

  const [subjects] = useState(() => getStored('subjects', INITIAL_SUBJECTS));
  const [chapters, setChapters] = useState(() => getStored('chapters', INITIAL_CHAPTERS));
  const [targets, setTargets] = useState(() => getStored('targets', INITIAL_TARGETS));
  const [sessions, setSessions] = useState(() => getStored('sessions', INITIAL_SESSIONS));
  const [revisions, setRevisions] = useState(() => getStored('revisions', INITIAL_REVISIONS));
  const [dailyNotes, setDailyNotes] = useState(() => getStored('dailyNotes', INITIAL_DAILY_NOTES));
  const [practice, setPractice] = useState(() => getStored('practice', INITIAL_PRACTICE));
  const [examDate, setExamDate] = useState(() => getStored('examDate', '2026-11-01'));
  const [darkMode, setDarkMode] = useState(() => getStored('darkMode', true));
  const [selectedDate, setSelectedDate] = useState(TODAY_DATE);

  // Sync to local storage
  useEffect(() => { localStorage.setItem('ca_tracker_v3_chapters', JSON.stringify(chapters)); }, [chapters]);
  useEffect(() => { localStorage.setItem('ca_tracker_v3_targets', JSON.stringify(targets)); }, [targets]);
  useEffect(() => { localStorage.setItem('ca_tracker_v3_sessions', JSON.stringify(sessions)); }, [sessions]);
  useEffect(() => { localStorage.setItem('ca_tracker_v3_revisions', JSON.stringify(revisions)); }, [revisions]);
  useEffect(() => { localStorage.setItem('ca_tracker_v3_dailyNotes', JSON.stringify(dailyNotes)); }, [dailyNotes]);
  useEffect(() => { localStorage.setItem('ca_tracker_v3_practice', JSON.stringify(practice)); }, [practice]);
  useEffect(() => { localStorage.setItem('ca_tracker_v3_examDate', JSON.stringify(examDate)); }, [examDate]);
  useEffect(() => { localStorage.setItem('ca_tracker_v3_darkMode', JSON.stringify(darkMode)); }, [darkMode]);

  // Apply Dark mode class on body/html
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Toggle Dark Mode
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Trigger celebration confetti
  const celebrate = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 }
      });
    } catch (e) {}
  };

  // --- AUTOMATED SYNCHRONIZATION DISPATCHERS ---

  // 1. Toggle Target Completed / Not Completed
  const toggleTargetStatus = (targetId) => {
    setTargets(prevTargets => {
      const target = prevTargets.find(t => t.id === targetId);
      if (!target) return prevTargets;

      const newCompleted = !target.completed;
      if (newCompleted) celebrate();

      const updatedTargets = prevTargets.map(t =>
        t.id === targetId ? { ...t, completed: newCompleted } : t
      );

      // Sync chapter status
      setChapters(prevChaps => {
        return prevChaps.map(ch => {
          if (ch.id === target.chapterId) {
            if (newCompleted) {
              return {
                ...ch,
                status: 'Completed',
                completionDate: ch.completionDate || target.date,
                lastStudiedDate: target.date
              };
            } else {
              // Check if any other target for this chapter is completed
              const hasOtherCompleted = updatedTargets.some(
                t => t.chapterId === ch.id && t.completed && t.id !== targetId
              );
              return {
                ...ch,
                status: hasOtherCompleted ? 'Completed' : 'In Progress'
              };
            }
          }
          return ch;
        });
      });

      return updatedTargets;
    });
  };

  // 2. Direct Update Chapter Status (Syllabus/Dashboard)
  const updateChapterStatus = (chapterId, newStatus) => {
    if (newStatus === 'Completed') celebrate();

    setChapters(prev => prev.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          status: newStatus,
          completionDate: newStatus === 'Completed' ? (ch.completionDate || selectedDate) : ch.completionDate,
          lastStudiedDate: selectedDate
        };
      }
      return ch;
    }));

    // Auto sync daily targets for selected date
    setTargets(prev => prev.map(t => {
      if (t.chapterId === chapterId && t.date === selectedDate) {
        return { ...t, completed: newStatus === 'Completed' };
      }
      return t;
    }));
  };

  // 3. Update Chapter Mastery (Strong / Average / Weak)
  const updateChapterMastery = (chapterId, mastery) => {
    setChapters(prev => prev.map(ch => ch.id === chapterId ? { ...ch, mastery } : ch));
  };

  // 4. Create Daily Target (Auto-populates under Main Study Task for date)
  const addDailyTarget = ({ date, subjectId, chapterId, priority = 'Medium', notes = '' }) => {
    const existing = targets.find(t => t.date === date && t.chapterId === chapterId);
    if (existing) return existing;

    const newTarget = {
      id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      date: date || selectedDate,
      chapterId,
      priority,
      notes,
      completed: false
    };

    setTargets(prev => [newTarget, ...prev]);

    // Update chapter last studied / in progress if not started
    setChapters(prev => prev.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          status: ch.status === 'Not Started' ? 'In Progress' : ch.status,
          firstStudiedDate: ch.firstStudiedDate || (date || selectedDate),
          lastStudiedDate: date || selectedDate
        };
      }
      return ch;
    }));

    return newTarget;
  };

  // 5. Delete Target
  const deleteTarget = (targetId) => {
    setTargets(prev => prev.filter(t => t.id !== targetId));
  };

  // 6. Move Target to Date (e.g. Missed Targets -> Move to Tomorrow)
  const moveTargetToDate = (targetId, newDate) => {
    setTargets(prev => {
      const target = prev.find(t => t.id === targetId);
      if (!target) return prev;

      // Mark original as missed/removed or update date
      const updatedOriginals = prev.filter(t => t.id !== targetId);

      // Create new target for target date if doesn't exist
      const existingInNewDate = prev.find(t => t.date === newDate && t.chapterId === target.chapterId);
      if (existingInNewDate) return updatedOriginals;

      const newTarget = {
        ...target,
        id: 't_' + Date.now(),
        date: newDate,
        completed: false
      };

      return [newTarget, ...updatedOriginals];
    });
  };

  // 7. Add Revision
  const addRevision = ({ chapterId, revisionType = 'Rev 1', notes = '', date = selectedDate, nextRevisionDate = null }) => {
    celebrate();
    const newRev = {
      id: 'r_' + Date.now(),
      date,
      chapterId,
      revisionType,
      notes
    };

    setRevisions(prev => [newRev, ...prev]);

    setChapters(prev => prev.map(ch => {
      if (ch.id === chapterId) {
        const count = (ch.revisionCount || 0) + 1;
        return {
          ...ch,
          revisionCount: count,
          lastRevisionDate: date,
          nextRevisionDate: nextRevisionDate || ch.nextRevisionDate,
          lastStudiedDate: date,
          status: ch.status === 'Not Started' ? 'In Progress' : ch.status
        };
      }
      return ch;
    }));
  };

  // 7b. Decrement Revision (Misclick correction)
  const decrementRevision = (chapterId) => {
    setRevisions(prevRevs => {
      const revIndex = prevRevs.findIndex(r => r.chapterId === chapterId);
      const remainingRevs = revIndex !== -1 ? prevRevs.filter((_, idx) => idx !== revIndex) : prevRevs;
      const remainingForChap = remainingRevs.filter(r => r.chapterId === chapterId);
      const newLastRevDate = remainingForChap.length > 0 ? remainingForChap[0].date : null;

      setChapters(prevChaps => prevChaps.map(ch => {
        if (ch.id === chapterId) {
          const currentCount = ch.revisionCount || 0;
          const newCount = Math.max(0, currentCount - 1);
          return {
            ...ch,
            revisionCount: newCount,
            lastRevisionDate: newLastRevDate
          };
        }
        return ch;
      }));

      return remainingRevs;
    });
  };

  // 8. Log Study Session (Lecture / Self Study)
  const logStudySession = ({ chapterId, type, durationMinutes, notes = '', link = '', date = selectedDate }) => {
    const newSession = {
      id: 's_' + Date.now(),
      date,
      chapterId,
      type,
      durationMinutes: Number(durationMinutes) || 0,
      notes,
      link
    };

    setSessions(prev => [newSession, ...prev]);

    setChapters(prev => prev.map(ch => {
      if (ch.id === chapterId) {
        return {
          ...ch,
          firstStudiedDate: ch.firstStudiedDate || date,
          lastStudiedDate: date,
          status: ch.status === 'Not Started' ? 'In Progress' : ch.status,
          totalLectureMinutes: type === 'Lecture' ? (ch.totalLectureMinutes || 0) + Number(durationMinutes) : (ch.totalLectureMinutes || 0),
          totalSelfStudyMinutes: type === 'Self Study' ? (ch.totalSelfStudyMinutes || 0) + Number(durationMinutes) : (ch.totalSelfStudyMinutes || 0)
        };
      }
      return ch;
    }));
  };

  // 8b. Delete Study Session
  const deleteStudySession = (sessionId) => {
    setSessions(prevSessions => {
      const session = prevSessions.find(s => s.id === sessionId);
      if (!session) return prevSessions;

      setChapters(prevChaps => prevChaps.map(ch => {
        if (ch.id === session.chapterId) {
          const dur = session.durationMinutes || 0;
          return {
            ...ch,
            totalLectureMinutes: session.type === 'Lecture' ? Math.max(0, (ch.totalLectureMinutes || 0) - dur) : (ch.totalLectureMinutes || 0),
            totalSelfStudyMinutes: session.type === 'Self Study' ? Math.max(0, (ch.totalSelfStudyMinutes || 0) - dur) : (ch.totalSelfStudyMinutes || 0)
          };
        }
        return ch;
      }));

      return prevSessions.filter(s => s.id !== sessionId);
    });
  };

  // 9. Save Daily Notes / Reflection
  const saveDailyNotes = (date, noteData) => {
    setDailyNotes(prev => ({
      ...prev,
      [date]: {
        ...(prev[date] || {}),
        ...noteData
      }
    }));
  };

  // 10. Add Doubt
  const addDoubt = (chapterId, doubtText) => {
    if (!doubtText.trim()) return;
    setChapters(prev => prev.map(ch => {
      if (ch.id === chapterId) {
        const doubts = ch.doubts || [];
        return {
          ...ch,
          doubts: [{ id: 'd_' + Date.now(), text: doubtText, solved: false, createdAt: selectedDate }, ...doubts]
        };
      }
      return ch;
    }));
  };

  // 11. Toggle Doubt Solved
  const toggleDoubtSolved = (chapterId, doubtId) => {
    setChapters(prev => prev.map(ch => {
      if (ch.id === chapterId) {
        const doubts = (ch.doubts || []).map(d => d.id === doubtId ? { ...d, solved: !d.solved } : d);
        return { ...ch, doubts };
      }
      return ch;
    }));
  };

  // 12. Add Practice Record
  const addPracticeRecord = (record) => {
    setPractice(prev => [{ id: 'p_' + Date.now(), date: selectedDate, ...record }, ...prev]);
  };

  // 13. Backup / Export Data
  const exportDataJSON = () => {
    const data = { subjects, chapters, targets, sessions, revisions, dailyNotes, practice, examDate, exportTimestamp: new Date().toISOString() };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ca_study_backup_${selectedDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 14. Import Data
  const importDataJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      if (data.chapters) setChapters(data.chapters);
      if (data.targets) setTargets(data.targets);
      if (data.sessions) setSessions(data.sessions);
      if (data.revisions) setRevisions(data.revisions);
      if (data.dailyNotes) setDailyNotes(data.dailyNotes);
      if (data.practice) setPractice(data.practice);
      if (data.examDate) setExamDate(data.examDate);
      alert('Data imported successfully!');
    } catch (e) {
      alert('Failed to import file. Invalid JSON format.');
    }
  };

  // 15. Reset Data to Seeds
  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset all data to default initial syllabus seed?')) {
      setChapters(INITIAL_CHAPTERS);
      setTargets(INITIAL_TARGETS);
      setSessions(INITIAL_SESSIONS);
      setRevisions(INITIAL_REVISIONS);
      setDailyNotes(INITIAL_DAILY_NOTES);
      setPractice(INITIAL_PRACTICE);
      localStorage.clear();
    }
  };

  // --- STATS & STREAK CALCULATOR ENGINE ---

  // Calculate Streak
  const calculateStreak = () => {
    const datesWithActivity = new Set();
    targets.filter(t => t.completed).forEach(t => datesWithActivity.add(t.date));
    sessions.forEach(s => datesWithActivity.add(s.date));
    revisions.forEach(r => datesWithActivity.add(r.date));

    const sortedDates = Array.from(datesWithActivity).sort().reverse();
    if (sortedDates.length === 0) return { currentStreak: 0, longestStreak: 0, activeDays: 0 };

    let current = 0;
    let maxStreak = 0;
    let tempStreak = 0;

    // Check today or yesterday
    let checkDate = new Date(selectedDate);
    
    // Iterate backwards day by day
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (datesWithActivity.has(dateStr)) {
        current++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If today has no activity yet, check yesterday before breaking current streak
        if (dateStr === selectedDate) {
          checkDate.setDate(checkDate.getDate() - 1);
          const yesterdayStr = checkDate.toISOString().split('T')[0];
          if (datesWithActivity.has(yesterdayStr)) {
            // Continuation from yesterday
            continue;
          }
        }
        break;
      }
    }

    // Longest streak calculation
    let prevTimestamp = null;
    sortedDates.forEach(dStr => {
      const ts = new Date(dStr).getTime();
      if (prevTimestamp === null || prevTimestamp - ts === 86400000) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
      if (tempStreak > maxStreak) maxStreak = tempStreak;
      prevTimestamp = ts;
    });

    return {
      currentStreak: current,
      longestStreak: Math.max(current, maxStreak),
      activeDays: datesWithActivity.size
    };
  };

  const streakStats = calculateStreak();

  return (
    <StudyContext.Provider value={{
      todayDate: TODAY_DATE,
      selectedDate,
      setSelectedDate,
      darkMode,
      toggleDarkMode,
      examDate,
      setExamDate,
      subjects,
      chapters,
      targets,
      sessions,
      revisions,
      dailyNotes,
      practice,
      streakStats,
      // Actions
      toggleTargetStatus,
      updateChapterStatus,
      updateChapterMastery,
      addDailyTarget,
      deleteTarget,
      moveTargetToDate,
      addRevision,
      decrementRevision,
      logStudySession,
      deleteStudySession,
      saveDailyNotes,
      addDoubt,
      toggleDoubtSolved,
      addPracticeRecord,
      exportDataJSON,
      importDataJSON,
      resetToDefault,
      celebrate
    }}>
      {children}
    </StudyContext.Provider>
  );
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) throw new Error('useStudy must be used within a StudyProvider');
  return context;
};
