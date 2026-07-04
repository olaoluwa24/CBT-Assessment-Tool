import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { fetchAllAttempts, DbAttempt } from '@/lib/db';
import { fetchQuestionsFromDb } from '@/lib/db';
import { Question, questions as localQuestions } from '@/data/questions';
import { OverviewTab } from './tabs/OverviewTab';
import { ResultsTab } from './tabs/ResultsTab';
import { QuestionsTab } from './tabs/QuestionsTab';
import { ShieldCheck, BarChart3, ClipboardList, BookOpen, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Tab = 'overview' | 'results' | 'questions';

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',   label: 'Overview',   icon: BarChart3     },
  { id: 'results',    label: 'Results',    icon: ClipboardList },
  { id: 'questions',  label: 'Questions',  icon: BookOpen      },
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [attempts, setAttempts] = useState<DbAttempt[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Guard: redirect to login if not authenticated
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) { setLocation('/admin/login'); return; }
      setAdminEmail(data.session.user.email ?? '');
    });
  }, [setLocation]);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    const [attemptsResult, dbQuestions] = await Promise.all([
      fetchAllAttempts(),
      fetchQuestionsFromDb(),
    ]);
    if (attemptsResult.error) {
      toast.error(`Failed to load results: ${attemptsResult.error}`);
    } else {
      setAttempts(attemptsResult.data);
    }
    // Use DB questions if available, else fall back to local
    setQuestions(dbQuestions.length > 0 ? dbQuestions : localQuestions);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLocation('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 h-14 bg-slate-900 border-b border-slate-800 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-teal-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm text-white">GST112 Admin</span>
            <span className="hidden sm:inline text-slate-500 text-xs ml-2">{adminEmail}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={loadData}
            disabled={refreshing}
            className="text-slate-400 hover:text-white hover:bg-slate-800 h-8 w-8 p-0"
            title="Refresh data"
          >
            <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 hover:bg-slate-800 gap-1.5"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Logout</span>
          </Button>
        </div>
      </header>

      {/* Tab bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6">
        <nav className="flex gap-1">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.id === 'results' && attempts.length > 0 && (
                  <span className="bg-teal-600/20 text-teal-400 text-xs px-1.5 py-0.5 rounded-full leading-none">
                    {attempts.length}
                  </span>
                )}
                {tab.id === 'questions' && questions.length > 0 && (
                  <span className="bg-slate-700 text-slate-400 text-xs px-1.5 py-0.5 rounded-full leading-none">
                    {questions.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-sm">Loading dashboard…</p>
            </div>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'overview'  && <OverviewTab  attempts={attempts} questions={questions} />}
            {activeTab === 'results'   && <ResultsTab   attempts={attempts} onRefresh={loadData} />}
            {activeTab === 'questions' && <QuestionsTab questions={questions} onRefresh={loadData} />}
          </motion.div>
        )}
      </main>
    </div>
  );
}
