import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { getAttempts, AttemptResult, getBookmarks, toggleBookmark } from '@/lib/storage';
import { questions as allQuestions, Question } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Bookmark, 
  ArrowLeft,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

type FilterType = 'all' | 'correct' | 'wrong' | 'skipped' | 'flagged';

export default function Review() {
  const [, setLocation] = useLocation();
  const [attempt, setAttempt] = useState<AttemptResult | null>(null);
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filter, setFilter] = useState<FilterType>('all');
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  useEffect(() => {
    const attempts = getAttempts();
    if (attempts.length === 0) {
      setLocation('/dashboard');
      return;
    }
    const latest = attempts[attempts.length - 1];
    setAttempt(latest);
    setBookmarks(getBookmarks());
  }, []);

  useEffect(() => {
    if (!attempt) return;

    let filtered = attempt.questions;
    switch (filter) {
      case 'correct':
        filtered = attempt.questions.filter(q => {
          const actual = allQuestions.find(x => x.id === q.id);
          return actual && q.selectedOption === actual.correctAnswer;
        });
        break;
      case 'wrong':
        filtered = attempt.questions.filter(q => {
          const actual = allQuestions.find(x => x.id === q.id);
          return actual && q.selectedOption !== null && q.selectedOption !== actual.correctAnswer;
        });
        break;
      case 'skipped':
        filtered = attempt.questions.filter(q => q.selectedOption === null);
        break;
      case 'flagged':
        filtered = attempt.questions.filter(q => q.flagged);
        break;
    }
    setFilteredQuestions(filtered);
    setCurrentIndex(0);
  }, [filter, attempt]);

  const handleToggleBookmark = (id: number) => {
    toggleBookmark(id);
    setBookmarks(getBookmarks());
    toast.success(bookmarks.includes(id) ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  if (!attempt || filteredQuestions.length === 0) {
    if (attempt && filter !== 'all') {
      return (
        <div className="container mx-auto p-8 max-w-4xl text-center flex flex-col items-center">
          <div className="mb-8 w-full flex justify-between">
            <Link href="/results">
              <Button variant="ghost"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Results</Button>
            </Link>
            <FilterTabs currentFilter={filter} setFilter={setFilter} />
          </div>
          <div className="p-12 border rounded-xl bg-card w-full">
            <Filter className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No questions match this filter</h2>
            <p className="text-muted-foreground mb-6">You didn't have any {filter} questions in this attempt.</p>
            <Button onClick={() => setFilter('all')}>View All Questions</Button>
          </div>
        </div>
      );
    }
    return null;
  }

  const sessionQuestion = filteredQuestions[currentIndex];
  const actualQuestion = allQuestions.find(q => q.id === sessionQuestion.id)!;
  
  const isCorrect = sessionQuestion.selectedOption === actualQuestion.correctAnswer;
  const isSkipped = sessionQuestion.selectedOption === null;
  const isBookmarked = bookmarks.includes(actualQuestion.id);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <Link href="/results">
          <Button variant="ghost" className="pl-0 hover:bg-transparent hover:text-primary">
            <ArrowLeft className="w-5 h-5 mr-2" /> Back to Results
          </Button>
        </Link>
        
        <FilterTabs currentFilter={filter} setFilter={setFilter} />
      </div>

      {/* Main Review Card */}
      <div className="flex-1 bg-card border rounded-2xl shadow-sm flex flex-col overflow-hidden mb-6">
        {/* Status Bar */}
        <div className={cn(
          "px-6 py-3 flex items-center justify-between border-b text-sm font-medium",
          isCorrect ? "bg-success/10 text-success border-success/20" :
          isSkipped ? "bg-muted text-muted-foreground border-border" :
          "bg-destructive/10 text-destructive border-destructive/20"
        )}>
          <div className="flex items-center gap-2">
            {isCorrect ? <CheckCircle2 className="w-5 h-5" /> : 
             isSkipped ? <MinusCircle className="w-5 h-5" /> : 
             <XCircle className="w-5 h-5" />}
            <span>
              {isCorrect ? "Correctly Answered" : 
               isSkipped ? "Skipped Question" : 
               "Incorrectly Answered"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-foreground">
            <span className="px-2 py-1 rounded bg-background/50 border font-mono">
              Time: {sessionQuestion.timeSpent}s
            </span>
            <span className="font-bold">
              {currentIndex + 1} / {filteredQuestions.length}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-10 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
              {actualQuestion.topic}
            </span>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => handleToggleBookmark(actualQuestion.id)}
              className={cn(isBookmarked ? "text-accent" : "text-muted-foreground")}
              title="Bookmark Question"
            >
              <Bookmark className="w-5 h-5" fill={isBookmarked ? "currentColor" : "none"} />
            </Button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={sessionQuestion.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <h2 className="text-xl md:text-2xl font-medium leading-relaxed mb-8">
                {actualQuestion.question}
              </h2>

              <div className="space-y-4">
                {Object.entries(actualQuestion.options).map(([key, value]) => {
                  const isUserSelection = sessionQuestion.selectedOption === key;
                  const isCorrectAnswer = actualQuestion.correctAnswer === key;
                  
                  let optionState = "default";
                  if (isCorrectAnswer) optionState = "correct";
                  else if (isUserSelection && !isCorrectAnswer) optionState = "wrong";

                  return (
                    <div 
                      key={key}
                      className={cn(
                        "relative flex items-center p-4 border-2 rounded-xl transition-all",
                        optionState === "correct" ? "border-success bg-success/5 shadow-sm" :
                        optionState === "wrong" ? "border-destructive bg-destructive/5 opacity-70" :
                        "border-muted bg-card"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-8 h-8 rounded-full border-2 mr-4 font-bold text-sm shrink-0",
                        optionState === "correct" ? "border-success bg-success text-success-foreground" :
                        optionState === "wrong" ? "border-destructive bg-destructive text-destructive-foreground" :
                        "border-muted-foreground/30 text-muted-foreground"
                      )}>
                        {key}
                      </div>
                      <span className={cn(
                        "text-base md:text-lg",
                        optionState !== "default" ? "font-medium text-foreground" : "text-foreground/80"
                      )}>
                        {value}
                      </span>
                      
                      {optionState === "correct" && <CheckCircle2 className="absolute right-4 w-6 h-6 text-success" />}
                      {optionState === "wrong" && <XCircle className="absolute right-4 w-6 h-6 text-destructive" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pb-8">
        <Button 
          variant="outline" 
          size="lg"
          onClick={() => setCurrentIndex(prev => prev - 1)}
          disabled={currentIndex === 0}
          className="w-32"
        >
          <ChevronLeft className="w-5 h-5 mr-1" /> Previous
        </Button>

        <Button 
          variant="default" 
          size="lg"
          onClick={() => setCurrentIndex(prev => prev + 1)}
          disabled={currentIndex === filteredQuestions.length - 1}
          className="w-32 bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Next <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function FilterTabs({ currentFilter, setFilter }: { currentFilter: FilterType, setFilter: (f: FilterType) => void }) {
  return (
    <Tabs value={currentFilter} onValueChange={(v) => setFilter(v as FilterType)} className="w-full md:w-auto overflow-x-auto">
      <TabsList className="h-10 p-1">
        <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
        <TabsTrigger value="correct" className="text-xs sm:text-sm text-success data-[state=active]:text-success">Correct</TabsTrigger>
        <TabsTrigger value="wrong" className="text-xs sm:text-sm text-destructive data-[state=active]:text-destructive">Wrong</TabsTrigger>
        <TabsTrigger value="skipped" className="text-xs sm:text-sm">Skipped</TabsTrigger>
        <TabsTrigger value="flagged" className="text-xs sm:text-sm text-accent data-[state=active]:text-accent">Flagged</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}

function MinusCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
    </svg>
  )
}
