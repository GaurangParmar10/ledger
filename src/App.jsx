import React, { useState } from 'react';
import { StudyProvider } from './context/StudyContext';
import { Header } from './components/Navigation/Header';
import { BottomNav } from './components/Navigation/BottomNav';
import { HomeDashboard } from './components/Dashboard/HomeDashboard';
import { SyllabusTracker } from './components/Syllabus/SyllabusTracker';
import { RevisionTracker } from './components/Revision/RevisionTracker';
import { DailyLedger } from './components/Ledger/DailyLedger';
import { SearchModal } from './components/Modals/SearchModal';

function AppContent() {
  const [activeTab, setActiveTab] = useState('today');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans">
      {/* Minimal Top Header */}
      <Header onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Container */}
      <main className="flex-1 max-w-xl w-full mx-auto px-4 pt-4">
        {activeTab === 'today' && <HomeDashboard />}
        {activeTab === 'syllabus' && <SyllabusTracker />}
        {activeTab === 'revision' && <RevisionTracker />}
        {activeTab === 'ledger' && <DailyLedger />}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <StudyProvider>
      <AppContent />
    </StudyProvider>
  );
}
