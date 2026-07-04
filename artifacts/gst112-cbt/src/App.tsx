import React from 'react';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import { Layout } from '@/components/Layout';
import { QuestionsProvider } from '@/contexts/QuestionsContext';
import NotFound from '@/pages/not-found';

// Student pages
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import Setup from '@/pages/Setup';
import Exam from '@/pages/Exam';
import Submit from '@/pages/Submit';
import Results from '@/pages/Results';
import Review from '@/pages/Review';
import Statistics from '@/pages/Statistics';
import Bookmarks from '@/pages/Bookmarks';

// Admin pages (no student layout)
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';

const queryClient = new QueryClient();

function StudentRouter() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/setup" component={Setup} />
        <Route path="/exam" component={Exam} />
        <Route path="/submit" component={Submit} />
        <Route path="/results" component={Results} />
        <Route path="/review" component={Review} />
        <Route path="/statistics" component={Statistics} />
        <Route path="/bookmarks" component={Bookmarks} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Admin routes — completely outside student layout */}
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />

      {/* All other routes → student app */}
      <Route component={StudentRouter} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="gst112-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <QuestionsProvider>
              <Router />
            </QuestionsProvider>
          </WouterRouter>
          <Toaster richColors position="top-center" />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
