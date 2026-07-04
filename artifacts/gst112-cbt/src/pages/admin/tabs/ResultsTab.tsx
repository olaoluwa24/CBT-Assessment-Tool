import React, { useState, useMemo } from 'react';
import { DbAttempt, deleteAttempt } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Trash2, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ResultsTabProps {
  attempts: DbAttempt[];
  onRefresh: () => void;
}

type SortKey = 'student_name' | 'matric_number' | 'score' | 'created_at';
type SortDir = 'asc' | 'desc';

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export function ResultsTab({ attempts, onRefresh }: ResultsTabProps) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return attempts
      .filter(a =>
        !q ||
        a.student_name.toLowerCase().includes(q) ||
        a.matric_number.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        let av = a[sortKey] as string | number;
        let bv = b[sortKey] as string | number;
        if (typeof av === 'string') av = av.toLowerCase();
        if (typeof bv === 'string') bv = bv.toLowerCase();
        return sortDir === 'asc' ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
      });
  }, [attempts, search, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />
      : <ChevronUp className="h-3 w-3 opacity-20" />;

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const { error } = await deleteAttempt(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (error) { toast.error(`Failed to delete: ${error}`); return; }
    toast.success('Result deleted.');
    onRefresh();
  };

  const exportCSV = () => {
    const header = ['Student Name', 'Matric Number', 'Score (%)', 'Correct', 'Wrong', 'Skipped', 'Time Used', 'Date'];
    const rows = filtered.map(a => [
      `"${a.student_name}"`,
      a.matric_number,
      a.score,
      a.correct_answers,
      a.wrong_answers,
      a.skipped,
      formatTime(a.time_used),
      formatDate(a.created_at),
    ].join(','));
    const csv = [header.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gst112-results-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filtered.length} results as CSV.`);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search by name or matric…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-slate-400 text-sm">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            disabled={filtered.length === 0}
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/80 text-left">
                {([
                  ['student_name', 'Name'],
                  ['matric_number', 'Matric No.'],
                  ['score', 'Score'],
                ] as [SortKey, string][]).map(([k, label]) => (
                  <th
                    key={k}
                    className="px-4 py-3 text-slate-400 font-medium cursor-pointer select-none hover:text-slate-200 transition-colors"
                    onClick={() => toggleSort(k)}
                  >
                    <span className="inline-flex items-center gap-1">{label} <SortIcon k={k} /></span>
                  </th>
                ))}
                <th className="px-4 py-3 text-slate-400 font-medium">Correct / Wrong / Skipped</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Time Used</th>
                <th
                  className="px-4 py-3 text-slate-400 font-medium cursor-pointer select-none hover:text-slate-200 transition-colors"
                  onClick={() => toggleSort('created_at')}
                >
                  <span className="inline-flex items-center gap-1">Date <SortIcon k="created_at" /></span>
                </th>
                <th className="px-4 py-3 text-slate-400 font-medium w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    {search ? 'No results match your search.' : 'No exam attempts yet.'}
                  </td>
                </tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{a.student_name}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">{a.matric_number}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded-full text-xs ${a.score >= 70 ? 'bg-teal-500/15 text-teal-400' : a.score >= 50 ? 'bg-blue-500/15 text-blue-400' : 'bg-red-500/15 text-red-400'}`}>
                      {a.score}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400">{a.correct_answers}✓</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-red-400">{a.wrong_answers}✗</span>
                    <span className="text-slate-600 mx-1">/</span>
                    <span className="text-slate-500">{a.skipped}–</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">{formatTime(a.time_used)}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(a.created_at)}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setDeleteId(a.id)}
                      className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete this result?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete the student's exam record. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
