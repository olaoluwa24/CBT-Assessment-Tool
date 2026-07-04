export interface AttemptResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  skipped: number;
  timeUsed: number;
  topicAccuracy: Record<string, { total: number; correct: number }>;
  questions: ExamSessionQuestion[];
}

export interface ExamSessionQuestion {
  id: number;
  selectedOption: string | null;
  flagged: boolean;
  timeSpent: number;
  /** Shuffled order of original option keys (A/B/C/D) for display. Index 0 = display 'A', etc. Only set when randomizeOptions is true. */
  optionOrder?: string[];
}

export interface ExamSession {
  questions: ExamSessionQuestion[];
  config: {
    totalQuestions: number;
    timerSeconds: number;
    topicFilter: string | null;
    randomizeQuestions: boolean;
    randomizeOptions: boolean;
  };
  startTime: number;
  timeRemaining: number;
  isPaused: boolean;
  /** Collected before the exam starts via the StudentInfoModal */
  studentName: string;
  matricNumber: string;
}

const STORAGE_KEYS = {
  ATTEMPTS: 'gst112_attempts',
  SESSION: 'gst112_session',
  BOOKMARKS: 'gst112_bookmarks',
  STREAK: 'gst112_streak',
};

export function saveAttempt(attempt: AttemptResult): void {
  const attempts = getAttempts();
  attempts.push(attempt);
  localStorage.setItem(STORAGE_KEYS.ATTEMPTS, JSON.stringify(attempts));
  updateStreak();
}

export function getAttempts(): AttemptResult[] {
  const data = localStorage.getItem(STORAGE_KEYS.ATTEMPTS);
  return data ? JSON.parse(data) : [];
}

export function saveSession(session: ExamSession): void {
  // Store session in sessionStorage so it persists across reloads but not tabs
  sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
}

export function getSession(): ExamSession | null {
  const data = sessionStorage.getItem(STORAGE_KEYS.SESSION);
  return data ? JSON.parse(data) : null;
}

export function clearSession(): void {
  sessionStorage.removeItem(STORAGE_KEYS.SESSION);
}

export function getBookmarks(): number[] {
  const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
  return data ? JSON.parse(data) : [];
}

export function toggleBookmark(questionId: number): void {
  const bookmarks = getBookmarks();
  const index = bookmarks.indexOf(questionId);
  if (index >= 0) {
    bookmarks.splice(index, 1);
  } else {
    bookmarks.push(questionId);
  }
  localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
}

export function getStreak(): { current: number; lastDate: string | null } {
  const data = localStorage.getItem(STORAGE_KEYS.STREAK);
  return data ? JSON.parse(data) : { current: 0, lastDate: null };
}

export function updateStreak(): void {
  const streak = getStreak();
  const today = new Date().toISOString().split('T')[0];
  
  if (streak.lastDate === today) {
    return; // Already updated today
  }

  if (streak.lastDate) {
    const lastDate = new Date(streak.lastDate);
    const currentDate = new Date(today);
    const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Consecutive day
      streak.current += 1;
    } else if (diffDays > 1) {
      // Streak broken
      streak.current = 1;
    }
  } else {
    // First time
    streak.current = 1;
  }
  
  streak.lastDate = today;
  localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
}
