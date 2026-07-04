import React, { useState, useEffect } from 'react';
import { getBookmarks, toggleBookmark } from '@/lib/storage';
import { questions as allQuestions } from '@/data/questions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'wouter';
import { BookmarkMinus, Search, BookOpen, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Bookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setBookmarkedIds(getBookmarks());
  }, []);

  const handleRemove = (id: number) => {
    toggleBookmark(id);
    setBookmarkedIds(getBookmarks());
  };

  const bookmarkedQuestions = allQuestions.filter(q => bookmarkedIds.includes(q.id));
  
  const filteredQuestions = bookmarkedQuestions.filter(q => 
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (bookmarkedIds.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-3xl text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <BookmarkMinus className="w-10 h-10 text-muted-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">No Bookmarks Yet</h1>
        <p className="text-xl text-muted-foreground mb-8">
          You haven't saved any questions for review. Flag questions during practice to see them here.
        </p>
        <Link href="/setup">
          <Button size="lg" className="h-14 px-8 text-lg font-bold">Start Practice Exam</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Saved Questions</h1>
          <p className="text-muted-foreground mt-2">Review your bookmarked questions ({bookmarkedIds.length} total)</p>
        </div>
        
        {/* <Button className="font-semibold bg-secondary hover:bg-secondary/90 text-secondary-foreground">
          <Play className="w-4 h-4 mr-2" /> Practice Bookmarks
        </Button> */}
      </div>

      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        <Input
          type="text"
          placeholder="Search questions or topics..."
          className="pl-10 h-12 text-base bg-card border-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {filteredQuestions.map((q) => (
            <motion.div
              key={q.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border rounded-xl p-6 shadow-sm group"
            >
              <div className="flex justify-between items-start mb-4 gap-4">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                  {q.topic}
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleRemove(q.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 -mt-2 -mr-2"
                >
                  <BookmarkMinus className="w-4 h-4 mr-2" /> Remove
                </Button>
              </div>
              
              <h3 className="text-lg font-medium mb-6 leading-relaxed">{q.question}</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(q.options).map(([key, value]) => {
                  const isCorrect = key === q.correctAnswer;
                  return (
                    <div 
                      key={key}
                      className={`p-3 border rounded-lg text-sm flex items-start gap-3 ${
                        isCorrect ? 'border-success bg-success/5 text-foreground font-medium' : 'border-muted bg-muted/30 text-muted-foreground'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isCorrect ? 'bg-success text-success-foreground' : 'bg-muted-foreground/20'
                      }`}>
                        {key}
                      </span>
                      <span className="mt-0.5 leading-tight">{value}</span>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
            <BookOpen className="w-8 h-8 mx-auto mb-3 opacity-20" />
            <p>No questions match your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
