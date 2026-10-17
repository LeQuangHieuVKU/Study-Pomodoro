import React, { useEffect, useRef, useMemo } from 'react';
import type { AppSettings } from '../types';
import { PRESET_BG_IMAGES } from '../data/themePresets';
import { ThreeWaveRipple } from './ThreeWaveRipple';

interface BackgroundRendererProps {
  settings: AppSettings;
}

export const BackgroundRenderer: React.FC<BackgroundRendererProps> = ({ settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Determine active background image URL
  const bgImageUrl = useMemo(() => {
    if (settings.backgroundImage === 'none') return null;
    if (settings.backgroundImage === 'custom' && settings.customBgData) {
      return settings.customBgData;
    }
    const preset = PRESET_BG_IMAGES.find((p) => p.id === settings.backgroundImage);
    return preset ? preset.url : null;
  }, [settings.backgroundImage, settings.customBgData]);

  // Handle Canvas effects: Particles & Rain
  useEffect(() => {
    const effect = settings.backgroundEffect;
    if (effect !== 'particles' && effect !== 'rain' && effect !== 'stars' && effect !== 'bubbles') return;

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

    if (effect === 'particles') {
      // Subtle drifting glow particles (Notes / Motes)
      const particleCount = 36;
      const particles = Array.from({ length: particleCount }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 1.2,
        speedX: (Math.random() - 0.5) * 0.4,
        speedY: -Math.random() * 0.5 - 0.15,
        opacity: Math.random() * 0.45 + 0.2,
      }));

      const renderParticles = () => {
        if (document.hidden) {
          animId = requestAnimationFrame(renderParticles);
          return;
        }

        ctx.clearRect(0, 0, width, height);

        particles.forEach((p) => {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.y < -10) p.y = height + 10;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = settings.accentColor || '#6366F1';
          ctx.fill();
        });

        animId = requestAnimationFrame(renderParticles);
      };

      renderParticles();
    } else if (effect === 'stars') {
      // Gentle twinkling starfield with occasional soft shooting star
      const starCount = 60;
      const stars = Array.from({ length: starCount }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.6,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.008,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
      }));

      let shootingStar: { x: number; y: number; length: number; speed: number; opacity: number; angle: number } | null = null;
      let lastShootingStarTime = Date.now();

      const renderStars = () => {
        if (document.hidden) {
          animId = requestAnimationFrame(renderStars);
          return;
        }

        ctx.clearRect(0, 0, width, height);

        stars.forEach((s) => {
          s.alpha += s.twinkleSpeed * s.twinkleDir;
          if (s.alpha > 0.95) {
            s.alpha = 0.95;
            s.twinkleDir = -1;
          } else if (s.alpha < 0.15) {
            s.alpha = 0.15;
            s.twinkleDir = 1;
          }

          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = '#FFFFFF';
          ctx.fill();
        });

        const now = Date.now();
        if (!shootingStar && now - lastShootingStarTime > 4500 && Math.random() < 0.03) {
          shootingStar = {
            x: Math.random() * (width * 0.7),
            y: Math.random() * (height * 0.4),
            length: Math.random() * 70 + 40,
            speed: Math.random() * 8 + 10,
            opacity: 0.9,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
          };
          lastShootingStarTime = now;
        }

        if (shootingStar) {
          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed;
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed;
          shootingStar.opacity -= 0.025;

          if (shootingStar.opacity <= 0 || shootingStar.x > width || shootingStar.y > height) {
            shootingStar = null;
          } else {
            const tailX = shootingStar.x - Math.cos(shootingStar.angle) * shootingStar.length;
            const tailY = shootingStar.y - Math.sin(shootingStar.angle) * shootingStar.length;

            const grad = ctx.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
            grad.addColorStop(1, `rgba(255, 255, 255, ${shootingStar.opacity})`);

            ctx.beginPath();
            ctx.moveTo(tailX, tailY);
            ctx.lineTo(shootingStar.x, shootingStar.y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }

        animId = requestAnimationFrame(renderStars);
      };

      renderStars();
    } else if (effect === 'bubbles') {
      // Gentle rising translucent bubbles
      const bubbleCount = 28;
      const bubbles = Array.from({ length: bubbleCount }).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 12 + 6,
        speedY: Math.random() * 0.8 + 0.4,
        angle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.35 + 0.15,
      }));

      const renderBubbles = () => {
        if (document.hidden) {
          animId = requestAnimationFrame(renderBubbles);
          return;
        }

        ctx.clearRect(0, 0, width, height);

        bubbles.forEach((b) => {
          b.y -= b.speedY;
          b.angle += 0.02;
          b.x += Math.sin(b.angle) * 0.5;

          if (b.y < -b.radius * 2) {
            b.y = height + b.radius;
            b.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.15})`;
          ctx.strokeStyle = `rgba(255, 255, 255, ${b.opacity * 0.6})`;
          ctx.lineWidth = 1.2;
          ctx.fill();
          ctx.stroke();

          // Bubble glossy highlight
          ctx.beginPath();
          ctx.arc(b.x - b.radius * 0.35, b.y - b.radius * 0.35, b.radius * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${b.opacity * 0.8})`;
          ctx.fill();
        });

        animId = requestAnimationFrame(renderBubbles);
      };

      renderBubbles();
    } else if (effect === 'rain') {
      // Calming falling raindrops for deep focus
      const dropCount = 75;
      const slant = 1.6;
      const drops = Array.from({ length: dropCount }).map(() => ({
        x: Math.random() * (width + 100) - 50,
        y: Math.random() * height,
        length: Math.random() * 16 + 12,
        speed: Math.random() * 9 + 13,
        opacity: Math.random() * 0.35 + 0.2,
        thickness: Math.random() * 0.8 + 1,
      }));

      const renderRain = () => {
        if (document.hidden) {
          animId = requestAnimationFrame(renderRain);
          return;
        }

        ctx.clearRect(0, 0, width, height);

        drops.forEach((d) => {
          d.y += d.speed;
          d.x += slant;

          if (d.y > height + d.length) {
            d.y = -d.length - Math.random() * 20;
            d.x = Math.random() * (width + 100) - 50;
          }

          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + slant * 0.8, d.y + d.length);
          ctx.lineWidth = d.thickness;
          ctx.lineCap = 'round';
          ctx.strokeStyle = `rgba(210, 230, 255, ${d.opacity})`;
          ctx.stroke();
        });

        animId = requestAnimationFrame(renderRain);
      };

      renderRain();
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
    };
  }, [settings.backgroundEffect, settings.accentColor]);

  return (
    <div
      className={`app-global-background-container effect-${settings.backgroundEffect} ${bgImageUrl ? 'has-bg-image' : 'no-bg-image'}`}
      aria-hidden="true"
    >
      {/* Layer 1 (Bottom): Solid base color if no image, or Wallpaper if image selected */}
      {!bgImageUrl ? (
        <div className="bg-layer-base" />
      ) : (
        <div
          className="bg-layer-image"
          style={{ backgroundImage: `url(${bgImageUrl})` }}
        />
      )}

      {/* Layer 2 (Middle): Ambient Effects */}
      {settings.backgroundEffect === 'gradient' && (
        <div className="bg-layer-gradient" />
      )}

      {(settings.backgroundEffect === 'wave' || settings.backgroundEffect === 'blob') && (
        <ThreeWaveRipple accentColor={settings.accentColor} />
      )}

      {(settings.backgroundEffect === 'particles' ||
        settings.backgroundEffect === 'rain' ||
        settings.backgroundEffect === 'stars' ||
        settings.backgroundEffect === 'bubbles') && (
        <canvas ref={canvasRef} className="bg-layer-particles-canvas" />
      )}
    </div>
  );
};
