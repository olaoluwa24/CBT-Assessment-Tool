import React, { useEffect, useState } from 'react';

export function ConfettiEffect() {
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    const colors = ['#22C55E', '#2563EB', '#F59E0B', '#0F766E', '#EF4444'];
    const newParticles = Array.from({ length: 100 }).map((_, i) => {
      return {
        id: i,
        x: Math.random() * 100, // vw
        y: -20 - Math.random() * 20, // vh
        size: Math.random() * 8 + 4, // px
        color: colors[Math.floor(Math.random() * colors.length)],
        velocity: Math.random() * 2 + 1,
        angle: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5,
        delay: Math.random() * 2,
      };
    });
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-sm animate-confetti"
          style={{
            left: `${p.x}vw`,
            top: `${p.y}vh`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${3 / p.velocity}s`,
            transform: `rotate(${p.angle}deg)`,
          } as React.CSSProperties}
        />
      ))}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(720deg); opacity: 0; }
        }
        .animate-confetti {
          animation-name: confetti;
          animation-timing-function: linear;
          animation-iteration-count: 1;
          animation-fill-mode: forwards;
        }
      `}} />
    </div>
  );
}
