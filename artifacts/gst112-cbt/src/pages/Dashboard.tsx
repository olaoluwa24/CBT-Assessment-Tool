import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  BarChart3, 
  Clock, 
  Award, 
  Flame, 
  ChevronRight, 
  Play,
  RotateCcw,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAttempts, getStreak, getSession } from '@/lib/storage';
import { questions } from '@/data/questions';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAttempts: 0,
    bestScore: 0,
    avgScore: 0,
    questionsPracticed: 0
  });
  
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [streak, setStreak] = useState({ current: 0, lastDate: null as string | null });
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    const attempts = getAttempts();
    const currentStreak = getStreak();
    const session = getSession();
    
    setStreak(currentStreak);
    setHasActiveSession(!!session);
    
    if (attempts.length > 0) {
      const best = Math.max(...attempts.map(a => (a.correctAnswers / a.totalQuestions) * 100));
      const avg = attempts.reduce((acc, curr) => acc + (curr.correctAnswers / curr.totalQuestions) * 100, 0) / attempts.length;
      const practiced = attempts.reduce((acc, curr) => acc + curr.totalQuestions, 0);
      
      setStats({
        totalAttempts: attempts.length,
        bestScore: Math.round(best),
        avgScore: Math.round(avg),
        questionsPracticed: practiced
      });
      
      setRecentAttempts(attempts.slice(-5).reverse());
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-muted-foreground mt-1">Here is your GST112 preparation summary.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-card border rounded-full px-4 py-2 shadow-sm w-fit">
          <Flame className={`w-5 h-5 ${streak.current > 0 ? 'text-accent' : 'text-muted-foreground'}`} fill={streak.current > 0 ? 'currentColor' : 'none'} />
          <span className="font-semibold">{streak.current} Day Streak</span>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard 
          title="Total Practice Tests" 
          value={stats.totalAttempts.toString()} 
          icon={BookOpen}
          trend={null}
        />
        <StatCard 
          title="Best Score" 
          value={`${stats.bestScore}%`} 
          icon={Award}
          trend={stats.bestScore >= 70 ? 'positive' : stats.bestScore === 0 ? null : 'negative'}
          color="text-success"
        />
        <StatCard 
          title="Average Score" 
          value={`${stats.avgScore}%`} 
          icon={BarChart3}
          trend={null}
          color="text-primary"
        />
        <StatCard 
          title="Questions Practiced" 
          value={`${stats.questionsPracticed} / ${questions.length}`} 
          icon={Target}
          trend={null}
          color="text-secondary"
        />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-muted/30">
              <h2 className="text-xl font-bold">Recent Activity</h2>
              {recentAttempts.length > 0 && (
                <Link href="/statistics">
                  <Button variant="ghost" size="sm" className="text-primary">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
            
            {recentAttempts.length > 0 ? (
              <div className="divide-y">
                {recentAttempts.map((attempt) => {
                  const score = Math.round((attempt.correctAnswers / attempt.totalQuestions) * 100);
                  const isGood = score >= 60;
                  
                  return (
                    <div key={attempt.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${isGood ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                          {score}%
                        </div>
                        <div>
                          <p className="font-semibold">{new Date(attempt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Clock className="w-3 h-3" /> {Math.round(attempt.timeUsed / 60)} mins
                            <span className="w-1 h-1 rounded-full bg-border"></span>
                            {attempt.totalQuestions} questions
                          </p>
                        </div>
                      </div>
                      <Link href={`/review`}>
                        <Button variant="outline" size="sm">Review</Button>
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No practice tests taken yet.</p>
                <p className="text-sm mt-1">Start your first exam to see your history here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            
            <div className="space-y-3">
              {hasActiveSession && (
                <Link href="/exam">
                  <Button className="w-full h-12 justify-start font-semibold border-2 border-primary bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                    <Play className="w-5 h-5 mr-3" />
                    Resume Session
                  </Button>
                </Link>
              )}
              
              <Link href="/setup">
                <Button className="w-full h-12 justify-start font-semibold text-base">
                  <RotateCcw className="w-5 h-5 mr-3" />
                  New Practice Exam
                </Button>
              </Link>
              
              <Link href="/bookmarks">
                <Button variant="outline" className="w-full h-12 justify-start font-semibold">
                  <BookOpen className="w-5 h-5 mr-3" />
                  Review Bookmarks
                </Button>
              </Link>
              
              <Link href="/statistics">
                <Button variant="outline" className="w-full h-12 justify-start font-semibold">
                  <BarChart3 className="w-5 h-5 mr-3" />
                  Detailed Statistics
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 border rounded-xl p-6 relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            <h3 className="font-bold text-lg mb-2">Exam Tip</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pace yourself during the exam. Don't spend more than a minute on a single question. Flag difficult questions and return to them later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color = "text-foreground" }: any) {
  return (
    <div className="bg-card border rounded-xl p-6 hover-elevate">
      <div className="flex justify-between items-start mb-4">
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        <div className={`p-2 bg-muted rounded-md ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold">{value}</h3>
      </div>
    </div>
  );
}
