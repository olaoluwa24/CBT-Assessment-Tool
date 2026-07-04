import React, { useState, useMemo } from 'react';
import { Question, questions as localQuestions } from '@/data/questions';
import { insertQuestion, updateQuestion, deleteQuestion, seedQuestionsToDb } from '@/lib/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Search, Plus, Pencil, Trash2, Database, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface QuestionsTabProps {
  questions: Question[];
  onRefresh: () => void;
}

const CORRECT_OPTIONS = ['A', 'B', 'C', 'D'] as const;

const emptyForm = (): Partial<Question> => ({
  question: '', options: { A: '', B: '', C: '', D: '' }, correctAnswer: 'A', topic: '',
});

function QuestionFormDialog({
  open, onClose, initial, onSave, isNew, allTopics,
}: {
  open: boolean; onClose: () => void; initial: Partial<Question>;
  onSave: (q: Question) => Promise<void>; isNew: boolean; allTopics: string[];
}) {
  const [form, setForm] = useState<Partial<Question>>(initial);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [customTopic, setCustomTopic] = useState(false);

  React.useEffect(() => {
    setForm(initial);
    setErrors({});
    setCustomTopic(false);
  }, [initial, open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.question?.trim()) e.question = 'Required';
    if (!form.options?.A?.trim()) e.A = 'Required';
    if (!form.options?.B?.trim()) e.B = 'Required';
    if (!form.options?.C?.trim()) e.C = 'Required';
    if (!form.options?.D?.trim()) e.D = 'Required';
    if (!form.topic?.trim()) e.topic = 'Required';
    if (!form.correctAnswer) e.correctAnswer = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    await onSave(form as Question);
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNew ? 'Add New Question' : 'Edit Question'}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isNew ? 'Fill in the fields to add a new question to the bank.' : `Editing question #${form.id}`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label className="text-slate-300 text-sm">Question text</Label>
            <Textarea
              value={form.question || ''}
              onChange={e => setForm(p => ({ ...p, question: e.target.value }))}
              placeholder="Enter the question…"
              rows={3}
              className="mt-1.5 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 resize-none"
            />
            {errors.question && <p className="text-red-400 text-xs mt-1">{errors.question}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CORRECT_OPTIONS.map(opt => (
              <div key={opt}>
                <Label className="text-slate-300 text-sm">Option {opt}</Label>
                <Input
                  value={form.options?.[opt] || ''}
                  onChange={e => setForm(p => ({ ...p, options: { ...p.options, [opt]: e.target.value } as Question['options'] }))}
                  placeholder={`Option ${opt}…`}
                  className="mt-1.5 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500"
                />
                {errors[opt] && <p className="text-red-400 text-xs mt-1">{errors[opt]}</p>}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-slate-300 text-sm">Correct Answer</Label>
              <Select
                value={form.correctAnswer || 'A'}
                onValueChange={v => setForm(p => ({ ...p, correctAnswer: v }))}
              >
                <SelectTrigger className="mt-1.5 bg-slate-800 border-slate-700 text-white focus:ring-teal-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {CORRECT_OPTIONS.map(o => (
                    <SelectItem key={o} value={o} className="text-white focus:bg-slate-700">Option {o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-slate-300 text-sm">Topic</Label>
              {customTopic ? (
                <div className="relative mt-1.5">
                  <Input
                    value={form.topic || ''}
                    onChange={e => setForm(p => ({ ...p, topic: e.target.value }))}
                    placeholder="New topic name…"
                    className="bg-slate-800 border-slate-700 text-white pr-8 focus:border-teal-500"
                  />
                  <button type="button" onClick={() => setCustomTopic(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <Select
                  value={form.topic || ''}
                  onValueChange={v => { if (v === '__new__') setCustomTopic(true); else setForm(p => ({ ...p, topic: v })); }}
                >
                  <SelectTrigger className="mt-1.5 bg-slate-800 border-slate-700 text-white focus:ring-teal-500">
                    <SelectValue placeholder="Select topic…" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 max-h-48">
                    {allTopics.map(t => (
                      <SelectItem key={t} value={t} className="text-white focus:bg-slate-700">{t}</SelectItem>
                    ))}
                    <SelectItem value="__new__" className="text-teal-400 focus:bg-slate-700">+ New topic…</SelectItem>
                  </SelectContent>
                </Select>
              )}
              {errors.topic && <p className="text-red-400 text-xs mt-1">{errors.topic}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}
              className="border-slate-700 text-slate-300 hover:bg-slate-800">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-teal-600 hover:bg-teal-700 text-white">
              {saving ? 'Saving…' : isNew ? 'Add Question' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function QuestionsTab({ questions, onRefresh }: QuestionsTabProps) {
  const [search, setSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [editTarget, setEditTarget] = useState<Question | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const allTopics = useMemo(() => Array.from(new Set(questions.map(q => q.topic))).sort(), [questions]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return questions.filter(question =>
      (topicFilter === 'all' || question.topic === topicFilter) &&
      (!q || question.question.toLowerCase().includes(q))
    );
  }, [questions, search, topicFilter]);

  const nextId = useMemo(() => Math.max(0, ...questions.map(q => q.id)) + 1, [questions]);

  const handleAdd = async (q: Question) => {
    const { error } = await insertQuestion({ ...q, id: nextId });
    if (error) { toast.error(error); return; }
    toast.success('Question added!');
    setShowAddModal(false);
    onRefresh();
  };

  const handleEdit = async (q: Question) => {
    const { error } = await updateQuestion(q);
    if (error) { toast.error(error); return; }
    toast.success('Question updated!');
    setEditTarget(null);
    onRefresh();
  };

  const handleDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    const { error } = await deleteQuestion(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (error) { toast.error(error); return; }
    toast.success('Question deleted.');
    onRefresh();
  };

  const handleSeed = async () => {
    setSeeding(true);
    const { error } = await seedQuestionsToDb(localQuestions);
    setSeeding(false);
    if (error) { toast.error(error); return; }
    toast.success(`${localQuestions.length} questions seeded into Supabase!`);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search questions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 w-full sm:w-56 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500"
            />
          </div>
          <Select value={topicFilter} onValueChange={setTopicFilter}>
            <SelectTrigger className="w-full sm:w-48 bg-slate-800 border-slate-700 text-white focus:ring-teal-500">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700 max-h-56">
              <SelectItem value="all" className="text-white focus:bg-slate-700">All Topics</SelectItem>
              {allTopics.map(t => (
                <SelectItem key={t} value={t} className="text-white focus:bg-slate-700">{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 shrink-0">
          {questions.length === 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeed}
              disabled={seeding}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <Database className="h-4 w-4 mr-1.5" />
              {seeding ? 'Seeding…' : 'Seed 282 Questions'}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Add Question
          </Button>
        </div>
      </div>

      <p className="text-slate-500 text-xs">{filtered.length} question{filtered.length !== 1 ? 's' : ''} shown{questions.length === 0 ? ' · No questions in Supabase yet. Click "Seed" to import local questions.' : ''}</p>

      {/* Table */}
      <div className="rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/80 text-left">
                <th className="px-4 py-3 text-slate-400 font-medium w-12">ID</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Question</th>
                <th className="px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Topic</th>
                <th className="px-4 py-3 text-slate-400 font-medium w-16">Ans</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-500">
                    {search || topicFilter !== 'all' ? 'No questions match your filter.' : 'No questions in Supabase yet.'}
                  </td>
                </tr>
              ) : filtered.map(q => (
                <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 text-slate-500 text-xs font-mono">{q.id}</td>
                  <td className="px-4 py-3 text-slate-200 text-sm max-w-xs">
                    <p className="truncate">{q.question}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">
                    <span className="bg-slate-800 px-2 py-0.5 rounded-full">{q.topic}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-teal-500/15 text-teal-400 px-2 py-0.5 rounded font-bold text-xs">{q.correctAnswer}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <button onClick={() => setEditTarget(q)}
                        className="text-slate-500 hover:text-blue-400 transition-colors p-1 rounded">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteId(q.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors p-1 rounded">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add modal */}
      <QuestionFormDialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        initial={emptyForm()}
        onSave={handleAdd}
        isNew
        allTopics={allTopics}
      />

      {/* Edit modal */}
      <QuestionFormDialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        initial={editTarget ?? emptyForm()}
        onSave={handleEdit}
        isNew={false}
        allTopics={allTopics}
      />

      {/* Delete confirm */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete this question?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Question #{deleteId} will be permanently removed from the bank. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-slate-300 hover:bg-slate-800">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700">
              {deleting ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
