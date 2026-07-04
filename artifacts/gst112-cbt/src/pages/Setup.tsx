import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useQuestions } from '@/contexts/QuestionsContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveSession, getSession } from '@/lib/storage';
import { StudentInfoModal } from '@/components/StudentInfoModal';
import { Play, Settings2, AlertCircle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Setup() {
  const [, setLocation] = useLocation();
  const { questions, topics } = useQuestions();
  const existingSession = getSession();
  const [showOverrideWarning, setShowOverrideWarning] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  const [config, setConfig] = useState({
    totalQuestions: '60',
    timerMinutes: '45',
    topicFilter: 'all',
    randomizeQuestions: true,
    randomizeOptions: true,
  });

  const handleStart = () => {
    if (existingSession) {
      setShowOverrideWarning(true);
      return;
    }
    // Always ask for student identity before starting a new exam
    setShowStudentModal(true);
  };

  const handleStudentInfoSubmit = ({ studentName, matricNumber }: { studentName: string; matricNumber: string }) => {
    setShowStudentModal(false);
    initializeExam(studentName, matricNumber);
  };

  const initializeExam = (studentName: string, matricNumber: string) => {
    let pool = [...questions];
    
    if (config.topicFilter !== 'all') {
      pool = pool.filter(q => q.topic === config.topicFilter);
    }
    
    if (config.randomizeQuestions) {
      pool.sort(() => Math.random() - 0.5);
    }
    
    const count = config.totalQuestions === 'all' ? pool.length : parseInt(config.totalQuestions);
    const selectedQuestions = pool.slice(0, Math.min(count, pool.length));
    
    const shuffle = (arr: string[]) => [...arr].sort(() => Math.random() - 0.5);

    const sessionQuestions = selectedQuestions.map(q => ({
      id: q.id,
      selectedOption: null,
      flagged: false,
      timeSpent: 0,
      optionOrder: config.randomizeOptions
        ? shuffle(['A', 'B', 'C', 'D'])
        : ['A', 'B', 'C', 'D'],
    }));

    const session = {
      questions: sessionQuestions,
      config: {
        totalQuestions: sessionQuestions.length,
        timerSeconds: parseInt(config.timerMinutes) * 60,
        topicFilter: config.topicFilter === 'all' ? null : config.topicFilter,
        randomizeQuestions: config.randomizeQuestions,
        randomizeOptions: config.randomizeOptions,
      },
      startTime: Date.now(),
      timeRemaining: parseInt(config.timerMinutes) * 60,
      isPaused: false,
      studentName,
      matricNumber,
    };

    saveSession(session);
    setLocation('/exam');
  };

  const maxQuestionsAvailable = config.topicFilter === 'all' 
    ? questions.length 
    : questions.filter(q => q.topic === config.topicFilter).length;

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      {/* Student info modal — always shown before a new exam */}
      <StudentInfoModal open={showStudentModal} onSubmit={handleStudentInfoSubmit} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-primary" />
          Exam Setup
        </h1>
        <p className="text-muted-foreground mt-2">Configure your practice session parameters before starting.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border rounded-2xl p-6 sm:p-8 shadow-sm space-y-8"
      >
        {/* Topic Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">Focus Area</h3>
            <p className="text-sm text-muted-foreground">Select a specific topic or practice everything.</p>
          </div>
          
          <Select 
            value={config.topicFilter} 
            onValueChange={(val) => {
              const topicQCount = val === 'all' ? questions.length : questions.filter(q => q.topic === val).length;
              if (config.totalQuestions !== 'all' && parseInt(config.totalQuestions) > topicQCount) {
                setConfig({ ...config, topicFilter: val, totalQuestions: topicQCount.toString() });
              } else {
                setConfig({ ...config, topicFilter: val });
              }
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics (Mock Exam)</SelectItem>
              {topics.map(t => (
                <SelectItem key={t} value={t}>{t} ({questions.filter(q => q.topic === t).length} Qs)</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <hr />

        {/* Number of Questions */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Number of Questions</h3>
            <p className="text-sm text-muted-foreground">Available in selected focus area: {maxQuestionsAvailable}</p>
          </div>
          
          <RadioGroup 
            value={config.totalQuestions} 
            onValueChange={(val) => setConfig({ ...config, totalQuestions: val })}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[20, 40, 60].map(num => (
              <div key={num} className={maxQuestionsAvailable < num ? "opacity-50 pointer-events-none" : ""}>
                <RadioGroupItem value={num.toString()} id={`q${num}`} className="peer sr-only" disabled={maxQuestionsAvailable < num} />
                <Label
                  htmlFor={`q${num}`}
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-colors"
                >
                  <span className="text-2xl font-bold">{num}</span>
                </Label>
              </div>
            ))}
            <div>
              <RadioGroupItem value="all" id="qall" className="peer sr-only" />
              <Label
                htmlFor="qall"
                className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-colors h-full"
              >
                <span className="text-lg font-bold text-center leading-tight">All<br/>{maxQuestionsAvailable}</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <hr />

        {/* Time Limit */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Time Limit</h3>
            <p className="text-sm text-muted-foreground">Set how much time you have for this session.</p>
          </div>
          
          <RadioGroup 
            value={config.timerMinutes} 
            onValueChange={(val) => setConfig({ ...config, timerMinutes: val })}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[15, 30, 45, 60].map(mins => (
              <div key={mins}>
                <RadioGroupItem value={mins.toString()} id={`t${mins}`} className="peer sr-only" />
                <Label
                  htmlFor={`t${mins}`}
                  className="flex flex-col items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-colors"
                >
                  <span className="text-xl font-bold">{mins}</span>
                  <span className="text-sm font-normal text-muted-foreground">mins</span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <hr />

        {/* Advanced Options */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Advanced</h3>
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-base">Randomize Questions</Label>
              <p className="text-sm text-muted-foreground">Shuffle the order of questions</p>
            </div>
            <Switch 
              checked={config.randomizeQuestions} 
              onCheckedChange={(c) => setConfig({ ...config, randomizeQuestions: c })} 
            />
          </div>
          
          <div className="flex items-center justify-between p-4 border rounded-xl">
            <div className="space-y-0.5">
              <Label className="text-base">Randomize Options</Label>
              <p className="text-sm text-muted-foreground">Shuffle A, B, C, D choices per question</p>
            </div>
            <Switch 
              checked={config.randomizeOptions} 
              onCheckedChange={(c) => setConfig({ ...config, randomizeOptions: c })} 
            />
          </div>
        </div>
        
        <Button 
          className="w-full h-14 text-lg font-bold mt-8 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={handleStart}
        >
          <Play className="w-5 h-5 mr-2" /> Start Practice Exam
        </Button>
      </motion.div>

      <AlertDialog open={showOverrideWarning} onOpenChange={setShowOverrideWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Active Session Found
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              You have an unfinished practice exam in progress. Starting a new one will delete your current progress. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setShowOverrideWarning(false);
                setShowStudentModal(true);
              }}
            >
              Start New Exam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
