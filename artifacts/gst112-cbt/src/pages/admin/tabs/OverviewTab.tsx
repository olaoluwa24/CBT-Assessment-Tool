import React, { useMemo } from 'react';
import { DbAttempt } from '@/lib/db';
import { Question } from '@/data/questions';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Users, TrendingUp, Award, AlertTriangle, BarChart3, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverviewTabProps {
  attempts: DbAttempt[];
  questions: Question[];
}

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-start gap-4">
      <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center shrink-0', color)}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</p>
        <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export function OverviewTab({ attempts, questions }: OverviewTabProps) {
  const stats = useMemo(() => {
    if (attempts.length === 0) return null;
    const scores = attempts.map(a => a.score);
    const avg = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const uniqueStudents = new Set(attempts.map(a => a.matric_number)).size;
    const passRate = Math.round(attempts.filter(a => a.score >= 50).length / attempts.length * 100);
    return {
      total: attempts.length,
      uniqueStudents,
      avg,
      highest: Math.max(...scores),
      lowest: Math.min(...scores),
      passRate,
    };
  }, [attempts]);

  // Daily attempts — last 30 days
  const dailyData = useMemo(() => {
    const map: Record<string, number> = {};
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      map[d.toISOString().slice(0, 10)] = 0;
    }
    attempts.forEach(a => {
      const day = a.created_at.slice(0, 10);
      if (day in map) map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map).map(([date, count]) => ({
      date: date.slice(5), // MM-DD
      count,
    }));
  }, [attempts]);

  // Score distribution in 10 buckets
  const scoreDistData = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10 + 1}-${(i + 1) * 10}`,
      count: 0,
    }));
    buckets[0].range = '0-10';
    attempts.forEach(a => {
      const idx = Math.min(Math.floor(a.score / 10), 9);
      buckets[idx].count += 1;
    });
    return buckets;
  }, [attempts]);

  // Most missed questions (top 10)
  const mostMissed = useMemo(() => {
    const map: Record<number, number> = {};
    attempts.forEach(attempt => {
      attempt.questions.forEach((sq: any) => {
        const q = questions.find(q => q.id === sq.id);
        if (!q) return;
        if (sq.selectedOption && sq.selectedOption !== q.correctAnswer) {
          map[sq.id] = (map[sq.id] || 0) + 1;
        }
      });
    });
    return Object.entries(map)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([idStr, count]) => ({
        q: questions.find(q => q.id === Number(idStr)),
        count,
      }))
      .filter(x => x.q);
  }, [attempts, questions]);

  if (attempts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <BarChart3 className="h-12 w-12 mb-4 opacity-40" />
        <p className="text-lg font-medium text-slate-400">No data yet</p>
        <p className="text-sm mt-1">Student results will appear here after exams are submitted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users}       label="Total Attempts"    value={stats!.total}                    color="bg-teal-600" />
        <StatCard icon={Target}      label="Unique Students"   value={stats!.uniqueStudents}            color="bg-blue-600" />
        <StatCard icon={TrendingUp}  label="Average Score"     value={`${stats!.avg}%`}                color="bg-violet-600" />
        <StatCard icon={Award}       label="Highest Score"     value={`${stats!.highest}%`}            color="bg-emerald-600" />
        <StatCard icon={AlertTriangle} label="Lowest Score"    value={`${stats!.lowest}%`}             color="bg-orange-600" />
        <StatCard icon={BarChart3}   label="Pass Rate (≥50%)"  value={`${stats!.passRate}%`}           color="bg-pink-600" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily attempts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm">Daily Attempts — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} interval={4} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="count" name="Attempts" radius={[3, 3, 0, 0]} fill="#14b8a6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={scoreDistData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="range" tick={{ fill: '#64748b', fontSize: 10 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="count" name="Students" radius={[3, 3, 0, 0]}>
                {scoreDistData.map((entry, idx) => (
                  <Cell
                    key={idx}
                    fill={entry.range.startsWith('0') || entry.range.startsWith('1') || entry.range.startsWith('2') || entry.range.startsWith('3') || entry.range.startsWith('4')
                      ? '#f97316'
                      : '#14b8a6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Most missed questions */}
      {mostMissed.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="text-white font-semibold mb-4 text-sm">Top 10 Most Missed Questions</h3>
          <div className="space-y-2">
            {mostMissed.map(({ q, count }, i) => (
              <div key={q!.id} className="flex items-center gap-3 py-2 border-b border-slate-800 last:border-0">
                <span className="text-slate-600 text-xs w-5 shrink-0">{i + 1}.</span>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-300 text-sm truncate">{q!.question}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{q!.topic} · Correct: {q!.correctAnswer}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-orange-400 font-bold text-sm">{count}</span>
                  <span className="text-slate-500 text-xs ml-1">wrong</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
