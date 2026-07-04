import React, { useEffect, useState } from 'react';
import { getAttempts, AttemptResult } from '@/lib/storage';
import { motion } from 'framer-motion';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function Statistics() {
  const [attempts, setAttempts] = useState<AttemptResult[]>([]);

  useEffect(() => {
    setAttempts(getAttempts());
  }, []);

  if (attempts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">No Data Available Yet</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Complete at least one practice exam to generate your performance statistics.
        </p>
        <Link href="/setup">
          <Button size="lg" className="h-14 px-8 text-lg font-bold">Start Practice Exam</Button>
        </Link>
      </div>
    );
  }

  // Calculate aggregate stats
  const totalTests = attempts.length;
  const bestScore = Math.max(...attempts.map(a => a.score));
  const avgScore = Math.round(attempts.reduce((acc, a) => acc + a.score, 0) / totalTests);
  const totalTimeSeconds = attempts.reduce((acc, a) => acc + a.timeUsed, 0);
  const totalQuestionsPracticed = attempts.reduce((acc, a) => acc + a.totalQuestions, 0);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  // Trend data for line chart (last 10)
  const trendData = attempts.slice(-10).map((a, i) => ({
    attempt: `Test ${i + 1}`,
    date: new Date(a.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    score: a.score
  }));

  // Aggregate topic mastery across all attempts
  const topicAggregates: Record<string, { total: number; correct: number }> = {};
  attempts.forEach(a => {
    Object.entries(a.topicAccuracy).forEach(([topic, stats]) => {
      if (!topicAggregates[topic]) {
        topicAggregates[topic] = { total: 0, correct: 0 };
      }
      topicAggregates[topic].total += stats.total;
      topicAggregates[topic].correct += stats.correct;
    });
  });

  const masteryData = Object.entries(topicAggregates)
    .map(([topic, stats]) => ({
      topic: topic.length > 15 ? topic.substring(0, 15) + '...' : topic,
      fullTopic: topic,
      percentage: Math.round((stats.correct / stats.total) * 100),
      practiced: stats.total
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border p-3 rounded-lg shadow-md">
          <p className="font-semibold text-sm mb-1">{payload[0].payload.date || payload[0].payload.fullTopic}</p>
          <p className="text-primary font-bold">{`Score: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Performance Statistics</h1>
        <p className="text-muted-foreground mt-2">Track your progress and identify areas for improvement.</p>
      </div>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Average Score" value={`${avgScore}%`} icon={BarChart3} color="text-primary" />
        <StatCard title="Best Score" value={`${bestScore}%`} icon={TrendingUp} color="text-success" />
        <StatCard title="Tests Taken" value={totalTests} icon={BookOpen} color="text-secondary" />
        <StatCard title="Time Studied" value={formatTime(totalTimeSeconds)} icon={Clock} color="text-accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Trend Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Score Trend (Last 10 Tests)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: "hsl(var(--primary))", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "hsl(var(--secondary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Mastery Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Overall Topic Mastery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={masteryData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="topic" 
                    tick={{ fontSize: 11 }} 
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.5)' }} />
                  <Bar dataKey="percentage" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {masteryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.percentage >= 70 ? 'hsl(var(--success))' : entry.percentage >= 50 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle>Test History</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Score</th>
                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Questions</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Time</th>
                <th className="px-6 py-4 font-semibold">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {attempts.slice().reverse().map((attempt) => {
                let grade = 'F';
                if (attempt.score >= 70) grade = 'A';
                else if (attempt.score >= 60) grade = 'B';
                else if (attempt.score >= 50) grade = 'C';
                else if (attempt.score >= 45) grade = 'D';

                return (
                  <tr key={attempt.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {new Date(attempt.date).toLocaleString(undefined, { 
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold ${
                        attempt.score >= 60 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {attempt.score}%
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden sm:table-cell text-muted-foreground">
                      {attempt.correctAnswers} / {attempt.totalQuestions}
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">
                      {Math.floor(attempt.timeUsed / 60)}m {attempt.timeUsed % 60}s
                    </td>
                    <td className="px-6 py-4 font-bold">{grade}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="shadow-sm border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <p className="text-3xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}
