import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getAttempts, AttemptResult } from '@/lib/storage';
import { CircularProgress } from '@/components/CircularProgress';
import { ConfettiEffect } from '@/components/ConfettiEffect';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle2, 
  XCircle, 
  MinusCircle, 
  Clock, 
  Trophy,
  LayoutDashboard,
  RotateCcw,
  BookOpen
} from 'lucide-react';

export default function Results() {
  const [, setLocation] = useLocation();
  const [attempt, setAttempt] = useState<AttemptResult | null>(null);

  useEffect(() => {
    const attempts = getAttempts();
    if (attempts.length === 0) {
      setLocation('/dashboard');
      return;
    }
    // Get the most recent attempt
    setAttempt(attempts[attempts.length - 1]);
  }, []);

  if (!attempt) return null;

  const scorePercentage = attempt.score;
  const isExcellent = scorePercentage >= 80;
  const isGood = scorePercentage >= 60 && scorePercentage < 80;
  
  let grade = 'F';
  if (scorePercentage >= 70) grade = 'A';
  else if (scorePercentage >= 60) grade = 'B';
  else if (scorePercentage >= 50) grade = 'C';
  else if (scorePercentage >= 45) grade = 'D';

  let message = "Keep studying! You'll get there.";
  if (isExcellent) message = "Excellent! You are extremely well prepared.";
  else if (isGood) message = "Good performance! A little more practice and you'll be perfect.";

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  // Prepare chart data
  const chartData = Object.entries(attempt.topicAccuracy).map(([topic, stats]) => ({
    topic: topic.length > 15 ? topic.substring(0, 15) + '...' : topic,
    fullTopic: topic,
    percentage: Math.round((stats.correct / stats.total) * 100),
    correct: stats.correct,
    total: stats.total
  })).sort((a, b) => b.percentage - a.percentage); // Sort highest to lowest

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-popover border text-popover-foreground p-3 rounded-lg shadow-lg">
          <p className="font-bold mb-1">{data.fullTopic}</p>
          <p className="text-sm">Score: <span className="font-bold">{data.percentage}%</span></p>
          <p className="text-sm text-muted-foreground">{data.correct} out of {data.total} correct</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      {isExcellent && <ConfettiEffect />}
      
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center p-3 bg-muted rounded-full mb-4"
        >
          <Trophy className={`w-8 h-8 ${isExcellent ? 'text-accent' : 'text-primary'}`} />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold tracking-tight mb-2"
        >
          Exam Completed!
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-xl text-muted-foreground"
        >
          {message}
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        <Card className="col-span-1 border-2 flex flex-col items-center justify-center p-8 bg-card shadow-sm">
          <CircularProgress value={scorePercentage} size={220} className="mb-6" />
          <div className="text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold mb-1">Grade Earned</p>
            <p className="text-5xl font-black text-foreground">{grade}</p>
          </div>
        </Card>

        <Card className="col-span-1 lg:col-span-2 border-2 shadow-sm">
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatWidget 
                icon={CheckCircle2} 
                label="Correct" 
                value={attempt.correctAnswers} 
                total={attempt.totalQuestions}
                color="text-success" 
                bg="bg-success/10" 
              />
              <StatWidget 
                icon={XCircle} 
                label="Incorrect" 
                value={attempt.wrongAnswers} 
                total={attempt.totalQuestions}
                color="text-destructive" 
                bg="bg-destructive/10" 
              />
              <StatWidget 
                icon={MinusCircle} 
                label="Skipped" 
                value={attempt.skipped} 
                total={attempt.totalQuestions}
                color="text-muted-foreground" 
                bg="bg-muted" 
              />
              <StatWidget 
                icon={Clock} 
                label="Time Used" 
                value={formatTime(attempt.timeUsed)} 
                color="text-secondary" 
                bg="bg-secondary/10" 
              />
            </div>

            {chartData.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold mb-6">Mastery by Topic</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis 
                        dataKey="topic" 
                        tick={{ fontSize: 11 }} 
                        interval={0}
                        angle={-45}
                        textAnchor="end"
                        height={60}
                      />
                      <YAxis tickFormatter={(val) => `${val}%`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.percentage >= 70 ? 'hsl(var(--success))' : entry.percentage >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/review">
          <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-base font-bold" variant="default">
            <BookOpen className="w-5 h-5 mr-2" /> Review Answers
          </Button>
        </Link>
        <Link href="/setup">
          <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-background">
            <RotateCcw className="w-5 h-5 mr-2" /> Take Another Test
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button size="lg" variant="ghost" className="w-full sm:w-auto h-14 px-8 text-base font-medium">
            <LayoutDashboard className="w-5 h-5 mr-2" /> Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

function StatWidget({ icon: Icon, label, value, total, color, bg }: any) {
  return (
    <div className="p-4 rounded-xl border bg-card flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-md ${bg} ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold mt-auto">
        {value}
        {total !== undefined && <span className="text-sm font-medium text-muted-foreground"> / {total}</span>}
      </p>
    </div>
  );
}
