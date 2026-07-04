import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  // If already logged in, redirect immediately
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setLocation('/admin/dashboard');
      else setChecking(false);
    });
  }, [setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY secrets.');
      setIsLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
      return;
    }

    setLocation('/admin/dashboard');
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 mb-4">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
          <p className="text-slate-400 text-sm mt-1">GST112 CBT Management System</p>
        </div>

        <Card className="bg-slate-900 border-slate-800 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg">Sign in</CardTitle>
            <CardDescription className="text-slate-400">
              Use your Supabase Auth admin account credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  {error}
                </motion.div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 text-sm">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300 text-sm">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-teal-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 font-semibold bg-teal-600 hover:bg-teal-700 text-white mt-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : 'Sign in to Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-600 text-xs mt-4">
          This portal is restricted. Students should use the main app.
        </p>
      </motion.div>
    </div>
  );
}
