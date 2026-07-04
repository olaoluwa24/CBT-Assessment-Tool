import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularProgress({ value, size = 200, strokeWidth = 20, className }: CircularProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    // Animate value on mount
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 300);
    return () => clearTimeout(timer);
  }, [value]);

  const getColor = (val: number) => {
    if (val >= 80) return 'hsl(var(--success))';
    if (val >= 60) return 'hsl(var(--primary))';
    if (val >= 40) return 'hsl(var(--accent))';
    return 'hsl(var(--destructive))';
  };

  const data = [
    { name: 'Score', value: animatedValue },
    { name: 'Remaining', value: 100 - animatedValue },
  ];

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={(size / 2) - strokeWidth}
            outerRadius={size / 2}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
            isAnimationActive={true}
            animationDuration={1500}
            animationEasing="ease-out"
          >
            <Cell key="cell-0" fill={getColor(value)} />
            <Cell key="cell-1" fill="hsl(var(--muted))" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      
      <div className="absolute flex flex-col items-center justify-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-4xl font-bold tracking-tighter"
          style={{ color: getColor(value) }}
        >
          {Math.round(value)}%
        </motion.span>
        <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-1">Score</span>
      </div>
    </div>
  );
}
