import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { SessionMode, TimerStatus } from '../types';

interface Focus3DOrbProps {
  mode: SessionMode;
  status: TimerStatus;
  progress: number;
  accentColor?: string;
}

export const Focus3DOrb: React.FC<Focus3DOrbProps> = ({
  mode,
  status,
  progress,
  accentColor = '#6366f1',
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({ mode, status, progress, accentColor });

  // Keep ref up to date for animation loop
  useEffect(() => {
    stateRef.current = { mode, status, progress, accentColor };
  }, [mode, status, progress, accentColor]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 18;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'low-power',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL init failed, fallback active', e);
      return;
    }

    // 2. Geometry - Particle Ring & Subtle Inner Icosahedron
    const particleCount = 120;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const radius = 6.2;
    for (let i = 0; i < particleCount; i++) {
      const theta = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.15;
      const phi = (Math.random() - 0.5) * 0.45;
      const r = radius + (Math.random() - 0.5) * 0.8;

      positions[i * 3] = r * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = r * Math.sin(theta) * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi);

      scales[i] = Math.random() * 0.8 + 0.6;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Dynamic Focus color from accentColor, Break color: Emerald
    const focusColor = new THREE.Color(accentColor || '#6366f1');
    const breakColor = new THREE.Color(0x10b981);

    const particleMaterial = new THREE.PointsMaterial({
      color: mode === 'focus' ? focusColor : breakColor,
      size: 0.28,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Inner wireframe sphere for depth
    const innerGeo = new THREE.IcosahedronGeometry(4.5, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: mode === 'focus' ? focusColor : 0x34d399,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerSphere);

    // Subtle glow core
    const coreGeo = new THREE.SphereGeometry(2.8, 16, 16);
    const coreMat = new THREE.MeshBasicMaterial({
      color: mode === 'focus' ? focusColor : 0x059669,
      transparent: true,
      opacity: 0.08,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // 3. Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Don't render if tab is hidden to save battery
      if (document.hidden) return;

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();
      const current = stateRef.current;

      const isRunning = current.status === 'running';
      const speedMultiplier = isRunning ? 1.0 : 0.35;

      // Smooth rotation
      particles.rotation.z += delta * 0.12 * speedMultiplier;
      particles.rotation.y += delta * 0.08 * speedMultiplier;

      innerSphere.rotation.x += delta * 0.09 * speedMultiplier;
      innerSphere.rotation.y -= delta * 0.07 * speedMultiplier;

      // Gentle breathing pulse (simulates 4s calm breathing)
      const breath = Math.sin(time * (isRunning ? 1.4 : 0.8)) * 0.06 + 1.0;
      particles.scale.set(breath, breath, breath);
      innerSphere.scale.set(breath, breath, breath);

      // Color transition between focus & break, real-time accent color adaptation
      const currentFocusColor = new THREE.Color(current.accentColor || '#6366f1');
      const targetColor = current.mode === 'focus' ? currentFocusColor : breakColor;
      particleMaterial.color.lerp(targetColor, 0.08);
      innerMat.color.lerp(current.mode === 'focus' ? currentFocusColor : new THREE.Color(0x34d399), 0.08);
      coreMat.color.lerp(current.mode === 'focus' ? currentFocusColor : new THREE.Color(0x059669), 0.08);

      renderer?.render(scene, camera);
    };

    animate();

    // 4. Resize handling
    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      }
    };

    window.addEventListener('resize', handleResize);

    // Dynamic resize observer for fluid responsive container
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(container);
    }

    // 5. Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
      particleGeometry.dispose();
      particleMaterial.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      coreGeo.dispose();
      coreMat.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="focus-3d-orb-canvas"
      aria-hidden="true"
    />
  );
};
