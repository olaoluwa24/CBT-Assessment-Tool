import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle2, Hash, GraduationCap } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface StudentInfoModalProps {
  open: boolean;
  onSubmit: (info: { studentName: string; matricNumber: string }) => void;
}

export function StudentInfoModal({ open, onSubmit }: StudentInfoModalProps) {
  const [name, setName] = useState('');
  const [matric, setMatric] = useState('');
  const [errors, setErrors] = useState<{ name?: string; matric?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Full name is required';
    else if (name.trim().length < 3) e.name = 'Please enter your full name';
    if (!matric.trim()) e.matric = 'Matric number is required';
    else if (matric.trim().length < 4) e.matric = 'Please enter a valid matric number';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ studentName: name.trim(), matricNumber: matric.trim().toUpperCase() });
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-lg">Student Identification</DialogTitle>
              <DialogDescription className="text-xs">
                Required before starting the exam
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="studentName" className="text-sm font-medium flex items-center gap-1.5">
              <UserCircle2 className="h-4 w-4 text-muted-foreground" />
              Full Name
            </Label>
            <Input
              id="studentName"
              placeholder="e.g. Amina Bello"
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })); }}
              className={errors.name ? 'border-destructive' : ''}
              autoFocus
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="matric" className="text-sm font-medium flex items-center gap-1.5">
              <Hash className="h-4 w-4 text-muted-foreground" />
              Matric Number
            </Label>
            <Input
              id="matric"
              placeholder="e.g. 22/0123"
              value={matric}
              onChange={e => { setMatric(e.target.value); setErrors(p => ({ ...p, matric: undefined })); }}
              className={errors.matric ? 'border-destructive' : ''}
            />
            {errors.matric && <p className="text-xs text-destructive">{errors.matric}</p>}
          </div>

          <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
            Your name and matric number will be recorded with your exam result for identification purposes.
          </div>

          <Button type="submit" className="w-full h-11 font-semibold bg-primary hover:bg-primary/90">
            Continue to Exam Setup
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
