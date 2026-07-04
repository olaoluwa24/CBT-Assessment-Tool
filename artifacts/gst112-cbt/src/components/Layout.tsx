import React from 'react';
import { useTheme } from './theme-provider';
import { Link, useLocation } from 'wouter';
import { BookOpen, LayoutDashboard, Settings, BarChart3, Sun, Moon, Laptop, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isExamRoute = location === '/exam';

  // Do not show full layout on exam route
  if (isExamRoute) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/setup', label: 'Practice', icon: BookOpen },
    { href: '/statistics', label: 'Statistics', icon: BarChart3 },
    { href: '/bookmarks', label: 'Bookmarks', icon: BookOpen },
  ];

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                G
              </div>
              <span className="hidden font-bold sm:inline-block text-lg tracking-tight">
                GST112 CBT
              </span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    location === link.href ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
              title="Toggle theme"
              className="rounded-full w-9 h-9"
            >
              {theme === 'light' && <Sun className="h-[1.2rem] w-[1.2rem]" />}
              {theme === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem]" />}
              {theme === 'system' && <Laptop className="h-[1.2rem] w-[1.2rem]" />}
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full w-9 h-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur border-b">
          <nav className="container mx-auto p-4 flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-md text-base font-medium transition-colors",
                  location === link.href ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="h-5 w-5" />
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
