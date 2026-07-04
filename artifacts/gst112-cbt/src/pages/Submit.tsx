import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { getSession, saveAttempt, clearSession, ExamSession } from '@/lib/storage';
import { useQuestions } from '@/contexts/QuestionsContext';
import { submitAttemptToDb } from '@/lib/db';
import { isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle2, Circle, Clock, Flag } from 'lucide-react';
import { toast } from 'sonner';

export default function Submit() {
  const [, setLocation] = useLocation();
  const { questions: allQuestions } = useQuestions();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      setLocation('/setup');
      return;
    }
    setSession(s);
  }, []);

  if (!session) return null;

  const totalQuestions = session.questions.length;
  const answered = session.questions.filter(q => q.selectedOption !== null).length;
  const unanswered = totalQuestions - answered;
  const flagged = session.questions.filter(q => q.flagged).length;

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}m ${s}s`;
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);

    // Give UI a moment to show the submitting state
    await new Promise(r => setTimeout(r, 500));

    // Calculate results
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    const topicStats: Record<string, { total: number; correct: number }> = {};

    session.questions.forEach(sq => {
      const q = allQuestions.find(x => x.id === sq.id);
      if (!q) return;

      if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
      topicStats[q.topic].total += 1;

      if (!sq.selectedOption) {
        skipped += 1;
      } else if (sq.selectedOption === q.correctAnswer) {
        correct += 1;
        topicStats[q.topic].correct += 1;
      } else {
        wrong += 1;
      }
    });

    const score = Math.round((correct / totalQuestions) * 100);
    const timeUsed = session.config.timerSeconds - session.timeRemaining;

    const resultPayload = {
      score,
      totalQuestions,
      correctAnswers: correct,
      wrongAnswers: wrong,
      skipped,
      timeUsed,
      topicAccuracy: topicStats,
    };

    // 1. Save to Supabase (primary — used by admin dashboard)
    if (isSupabaseConfigured) {
      const { error } = await submitAttemptToDb(session, resultPayload);
      if (error) {
        console.warn('Supabase save failed, falling back to localStorage:', error);
      }
    }

    // 2. Always save to localStorage as local history / offline fallback
    saveAttempt({
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...resultPayload,
      questions: session.questions,
    });

    clearSession();
    toast.success('Exam submitted successfully!');
    setLocation('/results');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl w-full"
      >
        <Card className="border-2 shadow-lg overflow-hidden">
          <div className="bg-primary p-6 text-primary-foreground text-center">
            <h1 className="text-2xl font-bold">Exam Summary</h1>
            <p className="opacity-80 mt-2">Please review your status before final submission</p>
            {session.studentName && (
              <p className="opacity-70 text-sm mt-1">{session.studentName} · {session.matricNumber}</p>
            )}
          </div>
          
          <CardContent className="p-8">
            {unanswered > 0 && (
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 flex items-start gap-3 mb-8">
                <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-accent">You have unanswered questions!</h3>
                  <p className="text-sm text-accent/80 mt-1">
                    It is highly recommended to guess rather than leave questions blank. Unanswered questions score 0 points.
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <StatBox icon={CheckCircle2} label="Answered"  value={answered}  total={totalQuestions} color="text-success"            bg="bg-success/10" />
              <StatBox icon={Circle}       label="Unanswered" value={unanswered} total={totalQuestions} color={unanswered > 0 ? "text-destructive" : "text-muted-foreground"} bg={unanswered > 0 ? "bg-destructive/10" : "bg-muted"} />
              <StatBox icon={Flag}         label="Flagged"   value={flagged}   total={totalQuestions} color="text-accent"             bg="bg-accent/10" />
              <StatBox icon={Clock}        label="Time Left" value={formatTime(session.timeRemaining)} total={null} color="text-primary" bg="bg-primary/10" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
              <Link href="/exam" className="flex-1">
                <Button variant="outline" size="lg" className="w-full h-14 text-base font-semibold" disabled={isSubmitting}>
                  Go Back to Exam
                </Button>
              </Link>
              <Button 
                onClick={handleFinalSubmit}
                size="lg" 
                className="flex-1 h-14 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting…
                  </span>
                ) : 'Submit Final Answers'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, total, color, bg }: any) {
  return (
    <div className="p-4 rounded-xl border flex flex-col items-center justify-center text-center">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${bg} ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold tracking-tight">
        {value} {total && <span className="text-sm font-normal text-muted-foreground">/ {total}</span>}
      </p>
      <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
}
