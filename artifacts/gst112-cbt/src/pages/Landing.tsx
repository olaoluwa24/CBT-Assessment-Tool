import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  GraduationCap, 
  Clock, 
  BarChart, 
  CheckCircle2, 
  Smartphone,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export default function Landing() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute inset-0 bg-primary/5 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium text-sm mb-8"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>JAMB Standard CBT Environment</span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6"
          >
            Ace Your <span className="text-primary">GST112</span> With Confidence
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Practice with a real CBT experience. Master Nigeria People & Culture with our comprehensive question bank, instant scoring, and detailed analytics.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/setup">
              <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 font-semibold rounded-full group">
                Start Practice <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base h-12 px-8 font-semibold rounded-full bg-background">
                View Dashboard
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Succeed</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Our platform is built specifically to mimic the exact environment you will face on exam day, while giving you the tools to learn from your mistakes.
            </p>
          </div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <FeatureCard 
              icon={GraduationCap} 
              title="Real CBT Experience" 
              description="Pixel-perfect replica of the JAMB CBT interface. Keyboard shortcuts, on-screen timer, and question palette included."
              color="text-primary"
              bg="bg-primary/10"
            />
            <FeatureCard 
              icon={CheckCircle2} 
              title="Instant Scoring" 
              description="Get your results immediately after submission. See your grade, percentage, and time spent at a glance."
              color="text-success"
              bg="bg-success/10"
            />
            <FeatureCard 
              icon={BookOpen} 
              title="Review Mistakes" 
              description="Comprehensive review mode highlights your selected answer alongside the correct one for optimal learning."
              color="text-secondary"
              bg="bg-secondary/10"
            />
            <FeatureCard 
              icon={BarChart} 
              title="Performance Analytics" 
              description="Track your mastery across all 12 topics. Beautiful charts show your progress and identify weak areas."
              color="text-accent"
              bg="bg-accent/10"
            />
            <FeatureCard 
              icon={Clock} 
              title="Custom Sessions" 
              description="Short on time? Create custom practice sessions with specific topics, time limits, and question counts."
              color="text-destructive"
              bg="bg-destructive/10"
            />
            <FeatureCard 
              icon={Smartphone} 
              title="Mobile Friendly" 
              description="Practice on the go. Our responsive design ensures the exam experience is flawless on any device."
              color="text-primary"
              bg="bg-primary/10"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="container relative z-10 mx-auto px-4 text-center text-primary-foreground max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to test your knowledge?</h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl mb-10">
            Join hundreds of students preparing for GST112 with our authoritative question bank covering all syllabus topics.
          </p>
          <Link href="/setup">
            <Button size="lg" variant="secondary" className="text-primary font-bold text-lg h-14 px-10 rounded-full hover:scale-105 transition-transform">
              Start Free Practice
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-background border-t py-12 text-center">
        <p className="text-muted-foreground">
          © {new Date().getFullYear()} GST112 CBT Practice Platform. Built for academic excellence.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description, color, bg }: any) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className="p-6 bg-card border rounded-2xl hover-elevate transition-all duration-300 group"
    >
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 ${bg} ${color} group-hover:scale-110 transition-transform`}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </motion.div>
  );
}
