import React from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface QuestionPaletteProps {
  questions: {
    id: number;
    selectedOption: string | null;
    flagged: boolean;
  }[];
  currentIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

export function QuestionPalette({ questions, currentIndex, onSelect, className }: QuestionPaletteProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg">Question Palette</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {questions.filter(q => q.selectedOption).length} of {questions.length} answered
        </p>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1">
        <div className="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2">
          {questions.map((q, idx) => {
            const isAnswered = q.selectedOption !== null;
            const isFlagged = q.flagged;
            const isCurrent = idx === currentIndex;
            
            return (
              <button
                key={q.id}
                onClick={() => onSelect(idx)}
                className={cn(
                  "relative h-10 rounded-md font-medium text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isCurrent ? "ring-2 ring-primary ring-offset-1 scale-110 z-10" : "",
                  isAnswered && !isFlagged ? "bg-success text-success-foreground" : "",
                  !isAnswered && !isFlagged ? "bg-muted text-muted-foreground hover:bg-muted/80" : "",
                  isFlagged ? "bg-accent text-accent-foreground" : "",
                  isCurrent && !isAnswered && !isFlagged ? "bg-primary text-primary-foreground" : ""
                )}
              >
                {idx + 1}
                {isFlagged && isAnswered && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-success border border-background"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="p-4 border-t bg-muted/30">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-success"></div>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted border"></div>
            <span>Unanswered</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary"></div>
            <span>Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent"></div>
            <span>Flagged</span>
          </div>
        </div>
      </div>
    </div>
  );
}
