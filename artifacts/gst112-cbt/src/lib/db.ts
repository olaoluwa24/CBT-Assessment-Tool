/**
 * All Supabase database operations.
 * Student submissions use the anon key (public INSERT allowed by RLS).
 * Admin read/delete/write operations require the user to be authenticated
 * via supabase.auth.signInWithPassword() first.
 */
import { supabase, isSupabaseConfigured } from './supabase';
import { Question } from '@/data/questions';
import { ExamSession, ExamSessionQuestion } from './storage';

// ─────────────────────────────────────────────
// Types that match the Supabase exam_attempts row
// ─────────────────────────────────────────────
export interface DbAttempt {
  id: string;
  student_name: string;
  matric_number: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  skipped: number;
  time_used: number;
  topic_accuracy: Record<string, { total: number; correct: number }>;
  questions: ExamSessionQuestion[];
  created_at: string;
}

// ─────────────────────────────────────────────
// Types that match the Supabase questions row
// ─────────────────────────────────────────────
interface DbQuestion {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  topic: string;
}

function dbRowToQuestion(row: DbQuestion): Question {
  return {
    id: row.id,
    question: row.question,
    options: { A: row.option_a, B: row.option_b, C: row.option_c, D: row.option_d },
    correctAnswer: row.correct_answer,
    topic: row.topic,
  };
}

function questionToDbRow(q: Question): Omit<DbQuestion, 'created_at'> {
  return {
    id: q.id,
    question: q.question,
    option_a: q.options.A,
    option_b: q.options.B,
    option_c: q.options.C,
    option_d: q.options.D,
    correct_answer: q.correctAnswer,
    topic: q.topic,
  };
}

// ─────────────────────────────────────────────
// Student: submit a completed exam attempt
// ─────────────────────────────────────────────
export async function submitAttemptToDb(
  session: ExamSession,
  result: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    skipped: number;
    timeUsed: number;
    topicAccuracy: Record<string, { total: number; correct: number }>;
  }
): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };

  const { error } = await supabase.from('exam_attempts').insert({
    student_name: session.studentName,
    matric_number: session.matricNumber,
    score: result.score,
    total_questions: result.totalQuestions,
    correct_answers: result.correctAnswers,
    wrong_answers: result.wrongAnswers,
    skipped: result.skipped,
    time_used: result.timeUsed,
    topic_accuracy: result.topicAccuracy,
    questions: session.questions,
  });

  return { error: error?.message ?? null };
}

// ─────────────────────────────────────────────
// Admin: fetch all attempts
// ─────────────────────────────────────────────
export async function fetchAllAttempts(): Promise<{ data: DbAttempt[]; error: string | null }> {
  const { data, error } = await supabase
    .from('exam_attempts')
    .select('*')
    .order('created_at', { ascending: false });

  return { data: (data as DbAttempt[]) ?? [], error: error?.message ?? null };
}

// ─────────────────────────────────────────────
// Admin: delete a single attempt
// ─────────────────────────────────────────────
export async function deleteAttempt(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase.from('exam_attempts').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ─────────────────────────────────────────────
// Questions: fetch for students (public read)
// ─────────────────────────────────────────────
export async function fetchQuestionsFromDb(): Promise<Question[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .order('id', { ascending: true });
  if (error || !data || data.length === 0) return [];
  return (data as DbQuestion[]).map(dbRowToQuestion);
}

// ─────────────────────────────────────────────
// Admin: insert a new question
// ─────────────────────────────────────────────
export async function insertQuestion(q: Question): Promise<{ error: string | null }> {
  const { error } = await supabase.from('questions').insert(questionToDbRow(q));
  return { error: error?.message ?? null };
}

// ─────────────────────────────────────────────
// Admin: update an existing question
// ─────────────────────────────────────────────
export async function updateQuestion(q: Question): Promise<{ error: string | null }> {
  const row = questionToDbRow(q);
  const { error } = await supabase
    .from('questions')
    .update(row)
    .eq('id', q.id);
  return { error: error?.message ?? null };
}

// ─────────────────────────────────────────────
// Admin: delete a question
// ─────────────────────────────────────────────
export async function deleteQuestion(id: number): Promise<{ error: string | null }> {
  const { error } = await supabase.from('questions').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ─────────────────────────────────────────────
// Admin: bulk-seed local questions into Supabase
// (uses upsert so it's safe to re-run)
// ─────────────────────────────────────────────
export async function seedQuestionsToDb(localQuestions: Question[]): Promise<{ error: string | null }> {
  const rows = localQuestions.map(questionToDbRow);
  const { error } = await supabase.from('questions').upsert(rows, { onConflict: 'id' });
  return { error: error?.message ?? null };
}
