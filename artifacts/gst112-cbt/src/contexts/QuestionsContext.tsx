/**
 * Provides questions to the entire app.
 * On mount, tries to load from Supabase (the source of truth after admin manages them).
 * Falls back to the bundled local questions.ts if Supabase is not configured or fails.
 * Students always see questions immediately (local fallback renders instantly).
 */
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { questions as localQuestions, Question } from '@/data/questions';
import { fetchQuestionsFromDb } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';

interface QuestionsContextType {
  questions: Question[];
  topics: string[];
  isLoading: boolean;
  refresh: () => void;
}

const QuestionsContext = createContext<QuestionsContextType>({
  questions: localQuestions,
  topics: Array.from(new Set(localQuestions.map(q => q.topic))).sort(),
  isLoading: false,
  refresh: () => {},
});

export function QuestionsProvider({ children }: { children: React.ReactNode }) {
  const [questions, setQuestions] = useState<Question[]>(localQuestions);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setIsLoading(true);
    try {
      const remote = await fetchQuestionsFromDb();
      if (remote.length > 0) setQuestions(remote);
    } catch {
      // silently keep local fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const topics = Array.from(new Set(questions.map(q => q.topic))).sort();

  return (
    <QuestionsContext.Provider value={{ questions, topics, isLoading, refresh: load }}>
      {children}
    </QuestionsContext.Provider>
  );
}

export function useQuestions() {
  return useContext(QuestionsContext);
}
