import React, { useEffect, useRef } from 'react';

interface ThreeWaveRippleProps {
  accentColor?: string;
}

export const ThreeWaveRipple: React.FC<ThreeWaveRippleProps> = ({ accentColor = '#6366F1' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    // Parse hex color into RGB components
    const cleanHex = accentColor.replace('#', '');
    const r = parseInt(cleanHex.substring(0, 2), 16) || 99;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 102;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 241;

    const startTime = performance.now();

    const render = (now: number) => {
      if (document.hidden) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      // Maximum expansion radius to reach screen bounds
      const maxRadius = Math.hypot(width, height) * 0.58;
      const elapsed = (now - startTime) / 1000;

      // 4 serene concentric water ripples continuously propagating from center
      const rippleCount = 4;
      const cycleDuration = 6.2; // Slow, gentle breathing expansion

      for (let i = 0; i < rippleCount; i++) {
        const progress = ((elapsed / cycleDuration + i / rippleCount) % 1);
        const radius = progress * maxRadius;

        if (radius < 2) continue;

        // Smooth organic fade: quickly emerges, peaks around 22%, gently dissipates
        const fadeIn = Math.sin(Math.min(progress / 0.22, 1) * Math.PI * 0.5);
        const fadeOut = Math.pow(1 - progress, 1.35);
        const alpha = fadeIn * fadeOut * 0.32;

        // Main outer ripple crest
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx.lineWidth = 1.6 + progress * 2.2;
        ctx.stroke();

        // Subtle inner echo ring (water refraction shadow)
        if (radius > 16) {
          const innerOffset = 8 * (1 - progress * 0.5);
          ctx.beginPath();
          ctx.arc(cx, cy, Math.max(0, radius - innerOffset), 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.45})`;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }

        // Soft translucent water wash between ripple crests
        if (radius > 24 && alpha > 0.04) {
          ctx.beginPath();
          ctx.arc(cx, cy, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.05})`;
          ctx.fill();
        }
      }

      // Subtle drop origin at center
      const dropPulse = Math.sin(elapsed * 2.2) * 0.5 + 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 4 + dropPulse * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.12 + dropPulse * 0.16})`;
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [accentColor]);

  return (
    <div className="bg-layer-wave-3d" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};
