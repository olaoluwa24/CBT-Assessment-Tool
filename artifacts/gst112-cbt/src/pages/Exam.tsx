import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuestions } from '@/contexts/QuestionsContext';
import { getSession, saveSession, ExamSession } from '@/lib/storage';
import { Timer } from '@/components/Timer';
import { QuestionPalette } from '@/components/QuestionPalette';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  X, 
  Maximize, 
  Minimize, 
  Menu,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from 'sonner';

export default function Exam() {
  const { questions: allQuestions } = useQuestions();
  const [location, setLocation] = useLocation();
  const [session, setSession] = useState<ExamSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobilePaletteOpen, setIsMobilePaletteOpen] = useState(false);
  
  // Track start time of current question for timeSpent calculation
  const questionStartTimeRef = useRef(Date.now());
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentIndexRef = useRef(currentIndex);

  // Keep refs in sync with state so callbacks always read the latest values
  const sessionRef = useRef<ExamSession | null>(null);
  useEffect(() => { sessionRef.current = session; }, [session]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      toast.error('No active session found. Redirecting to setup.');
      setLocation('/setup');
      return;
    }
    setSession(s);
    sessionRef.current = s;

    // Autosave loop — always reads latest session via ref, never a stale closure
    autoSaveTimerRef.current = setInterval(() => {
      if (sessionRef.current) {
        saveSession(sessionRef.current);
      }
    }, 10000);

    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleTimeUpdate = useCallback((newTime: number) => {
    if (!sessionRef.current) return;
    setSession(prev => {
      if (!prev) return prev;
      const updated = { ...prev, timeRemaining: newTime };
      return updated;
    });
  }, []);

  const handleTimeUp = useCallback(() => {
    toast.error('Time is up! Auto-submitting exam...');
    // Compute final session synchronously from refs — don't rely on pending React state
    const current = sessionRef.current;
    if (!current) return;
    const now = Date.now();
    const timeSpent = Math.floor((now - questionStartTimeRef.current) / 1000);
    const idx = currentIndexRef.current;
    const finalQuestions = current.questions.map((q, i) =>
      i === idx ? { ...q, timeSpent: q.timeSpent + timeSpent } : q
    );
    const finalSession = { ...current, questions: finalQuestions, timeRemaining: 0 };
    saveSession(finalSession);
    setSession(finalSession);
    setTimeout(() => setLocation('/submit'), 2000);
  }, [setLocation]);

  const updateQuestionTime = () => {
    if (!session) return;
    const now = Date.now();
    const timeSpent = Math.floor((now - questionStartTimeRef.current) / 1000);
    
    setSession(prev => {
      if (!prev) return prev;
      const newQuestions = [...prev.questions];
      newQuestions[currentIndex] = {
        ...newQuestions[currentIndex],
        timeSpent: newQuestions[currentIndex].timeSpent + timeSpent
      };
      return { ...prev, questions: newQuestions };
    });
    
    questionStartTimeRef.current = now;
  };

  const handleSelectOption = (option: string) => {
    if (!session) return;
    
    setSession(prev => {
      if (!prev) return prev;
      const newQuestions = [...prev.questions];
      newQuestions[currentIndex] = {
        ...newQuestions[currentIndex],
        selectedOption: option
      };
      const newSession = { ...prev, questions: newQuestions };
      saveSession(newSession); // Instant save on selection
      return newSession;
    });
  };

  const handleClearSelection = () => {
    if (!session) return;
    setSession(prev => {
      if (!prev) return prev;
      const newQuestions = [...prev.questions];
      newQuestions[currentIndex] = {
        ...newQuestions[currentIndex],
        selectedOption: null
      };
      const newSession = { ...prev, questions: newQuestions };
      saveSession(newSession);
      return newSession;
    });
  };

  const handleToggleFlag = () => {
    if (!session) return;
    setSession(prev => {
      if (!prev) return prev;
      const newQuestions = [...prev.questions];
      newQuestions[currentIndex] = {
        ...newQuestions[currentIndex],
        flagged: !newQuestions[currentIndex].flagged
      };
      return { ...prev, questions: newQuestions };
    });
  };

  const navigateTo = (index: number) => {
    if (index >= 0 && index < (session?.questions.length || 0)) {
      updateQuestionTime();
      setCurrentIndex(index);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        // Map display label (A/B/C/D) to the original option key via optionOrder
        const displayIdx = ['A', 'B', 'C', 'D'].indexOf(key);
        const optionOrder = sessionRef.current?.questions[currentIndexRef.current]?.optionOrder || ['A', 'B', 'C', 'D'];
        handleSelectOption(optionOrder[displayIdx]);
      } else if (e.key === 'ArrowRight') {
        navigateTo(currentIndex + 1);
      } else if (e.key === 'ArrowLeft') {
        navigateTo(currentIndex - 1);
      } else if (key === 'F') {
        handleToggleFlag();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, session]);

  if (!session) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  const currentQData = session.questions[currentIndex];
  const actualQuestion = allQuestions.find(q => q.id === currentQData.id);
  
  if (!actualQuestion) return <div>Question not found</div>;

  const answeredCount = session.questions.filter(q => q.selectedOption).length;
  const progressPercent = (answeredCount / session.questions.length) * 100;

  return (
    <div className="flex flex-col h-[100dvh] bg-background max-h-[100dvh] overflow-hidden">
      {/* Header */}
      <header className="flex-none flex items-center justify-between px-4 sm:px-6 h-16 border-b bg-card shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground font-bold">
            G
          </div>
          <div>
            <h1 className="font-bold leading-tight">GST112: Nigeria People & Culture</h1>
            <p className="text-xs text-muted-foreground hidden sm:block">Computer Based Test Environment</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <Timer 
            initialSeconds={session.config.timerSeconds} 
            timeRemaining={session.timeRemaining}
            isPaused={session.isPaused}
            onTimeUpdate={handleTimeUpdate}
            onTimeUp={handleTimeUp}
          />
          
          <Button variant="ghost" size="icon" onClick={toggleFullscreen} className="hidden sm:inline-flex" title="Toggle Fullscreen">
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </Button>

          <Button 
            variant="default" 
            className="bg-primary hover:bg-primary/90 font-bold"
            onClick={() => {
              // Compute final session synchronously from refs before navigating
              const current = sessionRef.current;
              if (!current) return;
              const now = Date.now();
              const timeSpent = Math.floor((now - questionStartTimeRef.current) / 1000);
              const idx = currentIndexRef.current;
              const finalQuestions = current.questions.map((q, i) =>
                i === idx ? { ...q, timeSpent: q.timeSpent + timeSpent } : q
              );
              const finalSession = { ...current, questions: finalQuestions };
              saveSession(finalSession);
              setLocation('/submit');
            }}
          >
            Submit
          </Button>

          {/* Mobile Palette Trigger */}
          <Sheet open={isMobilePaletteOpen} onOpenChange={setIsMobilePaletteOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0 flex flex-col">
              <SheetHeader className="p-4 border-b text-left">
                <SheetTitle>Navigation Palette</SheetTitle>
              </SheetHeader>
              <QuestionPalette 
                questions={session.questions} 
                currentIndex={currentIndex} 
                onSelect={(idx) => {
                  navigateTo(idx);
                  setIsMobilePaletteOpen(false);
                }} 
              />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Progress bar */}
      <div className="h-1 bg-muted w-full flex-none">
        <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative overflow-y-auto">
          <div className="flex-1 container max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
            
            {/* Question Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold bg-muted px-3 py-1 rounded-md">
                  Question {currentIndex + 1} <span className="text-muted-foreground text-sm font-normal">of {session.questions.length}</span>
                </span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 hidden sm:inline-block">
                  {actualQuestion.topic}
                </span>
              </div>
              <Button 
                variant={currentQData.flagged ? "secondary" : "outline"} 
                size="sm"
                className={cn("gap-2", currentQData.flagged && "bg-accent text-accent-foreground border-accent hover:bg-accent/90")}
                onClick={handleToggleFlag}
              >
                <Flag className={cn("w-4 h-4", currentQData.flagged ? "fill-current" : "")} />
                <span className="hidden sm:inline">{currentQData.flagged ? 'Flagged' : 'Flag for Review'}</span>
              </Button>
            </div>

            {/* Question Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col"
              >
                <div className="text-lg sm:text-xl md:text-2xl font-medium leading-relaxed mb-8 select-none">
                  {actualQuestion.question}
                </div>

                <div className="space-y-3 mt-auto mb-8">
                  {(currentQData.optionOrder || ['A', 'B', 'C', 'D']).map((originalKey, displayIdx) => {
                    const displayLabel = ['A', 'B', 'C', 'D'][displayIdx];
                    const value = actualQuestion.options[originalKey as keyof typeof actualQuestion.options];
                    // selectedOption always stores the original option key, not the display label
                    const isSelected = currentQData.selectedOption === originalKey;
                    return (
                      <div 
                        key={originalKey}
                        onClick={() => handleSelectOption(originalKey)}
                        className={cn(
                          "group relative flex items-center p-4 sm:p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 select-none",
                          isSelected 
                            ? "border-primary bg-primary/5 shadow-sm" 
                            : "border-muted hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "flex items-center justify-center w-8 h-8 rounded-full border-2 mr-4 font-bold text-sm shrink-0 transition-colors",
                          isSelected 
                            ? "border-primary bg-primary text-primary-foreground" 
                            : "border-muted-foreground/30 text-muted-foreground group-hover:border-primary/50"
                        )}>
                          {displayLabel}
                        </div>
                        <span className={cn(
                          "text-base sm:text-lg",
                          isSelected ? "font-medium text-foreground" : "text-foreground/90"
                        )}>
                          {value}
                        </span>
                        
                        {isSelected && (
                          <CheckCircle2 className="absolute right-4 w-6 h-6 text-primary animate-in zoom-in duration-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Controls */}
            <div className="mt-auto pt-4 flex items-center justify-between shrink-0">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigateTo(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="w-32"
              >
                <ChevronLeft className="w-5 h-5 mr-1" /> Previous
              </Button>

              {currentQData.selectedOption && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="w-4 h-4 mr-1" /> Clear
                </Button>
              )}

              <Button 
                variant="default" 
                size="lg"
                onClick={() => navigateTo(currentIndex + 1)}
                disabled={currentIndex === session.questions.length - 1}
                className="w-32 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              >
                Next <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
            
          </div>
        </main>

        {/* Desktop Sidebar Palette */}
        <aside className="hidden lg:flex w-[320px] flex-none border-l bg-card flex-col h-full overflow-hidden">
          <QuestionPalette 
            questions={session.questions} 
            currentIndex={currentIndex} 
            onSelect={navigateTo}
          />
        </aside>
      </div>
    </div>
  );
}
