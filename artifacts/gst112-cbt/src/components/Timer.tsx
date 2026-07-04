import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface TimerProps {
  initialSeconds: number;
  timeRemaining: number;
  isPaused: boolean;
  onTimeUpdate: (seconds: number) => void;
  onTimeUp: () => void;
}

export function Timer({ initialSeconds, timeRemaining, isPaused, onTimeUpdate, onTimeUp }: TimerProps) {
  // Using an internal reference to avoid multiple toast triggers
  const lastToastRef = React.useRef<number | null>(null);

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return;

    const interval = setInterval(() => {
      const nextTime = timeRemaining - 1;
      onTimeUpdate(nextTime);

      // Toast notifications for specific milestones
      if (nextTime === 600 && lastToastRef.current !== 600) {
        lastToastRef.current = 600;
        toast.warning('10 minutes remaining!', { icon: <Clock className="w-4 h-4" /> });
      } else if (nextTime === 300 && lastToastRef.current !== 300) {
        lastToastRef.current = 300;
        toast.error('5 minutes remaining! Please review your answers.', { icon: <AlertTriangle className="w-4 h-4" /> });
      } else if (nextTime === 60 && lastToastRef.current !== 60) {
        lastToastRef.current = 60;
        toast.error('1 minute remaining! Auto-submit imminent.', { duration: 10000 });
      }

      if (nextTime <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, isPaused, onTimeUpdate, onTimeUp]);

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isWarning = timeRemaining <= 300; // 5 mins
  const isDanger = timeRemaining <= 60; // 1 min

  return (
    <div className={cn(
      "flex items-center gap-2 font-mono text-xl font-bold px-4 py-2 rounded-lg border-2 transition-colors",
      isDanger ? "bg-destructive/10 text-destructive border-destructive animate-pulse" : 
      isWarning ? "bg-accent/10 text-accent border-accent" : 
      "bg-muted border-transparent"
    )}>
      <Clock className={cn("w-5 h-5", isDanger ? "text-destructive" : isWarning ? "text-accent" : "text-muted-foreground")} />
      {formatTime(timeRemaining)}
    </div>
  );
}
