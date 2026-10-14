import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface AboutThreeSceneProps {
  className?: string;
  isLeaving?: boolean;
}

export const AboutThreeScene: React.FC<AboutThreeSceneProps> = ({ className = '', isLeaving = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const animIdRef = useRef<number>(0);
  const isLeavingRef = useRef(isLeaving);
  isLeavingRef.current = isLeaving;

  useEffect(() => {
    if (isLeaving && animIdRef.current) {
      cancelAnimationFrame(animIdRef.current);
    }
  }, [isLeaving]);

  useEffect(() => {
    let animId: number;
    let isCancelled = false;
    let renderer: THREE.WebGLRenderer | null = null;
    let tomatoGeo: THREE.SphereGeometry | null = null;
    let tomatoMat: THREE.MeshPhysicalMaterial | null = null;
    let dialRingGeo: THREE.CylinderGeometry | null = null;
    let dialRingMat: THREE.MeshStandardMaterial | null = null;
    let stemGeo: THREE.CylinderGeometry | null = null;
    let stemMat: THREE.MeshStandardMaterial | null = null;
    let pointerGeo: THREE.ConeGeometry | null = null;
    let pointerMat: THREE.MeshBasicMaterial | null = null;
    let particleGeo: THREE.BufferGeometry | null = null;
    let particleMat: THREE.PointsMaterial | null = null;

    let handleResize: (() => void) | null = null;
    let handlePointerMove: ((e: PointerEvent) => void) | null = null;
    let handlePointerLeave: (() => void) | null = null;

    // Defer WebGL context creation and shader compilation by 160ms so the initial
    // page slide transition executes at a smooth 60fps/120fps without frame drops.
    const startTimer = setTimeout(() => {
      if (isCancelled) return;
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const width = container.clientWidth || 320;
      const height = container.clientHeight || 280;

      // 1. Scene, Camera, Renderer
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 0.4, 5.8);

      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Master Group for 3D Tomato Timer
      const tomatoGroup = new THREE.Group();
      tomatoGroup.rotation.x = 0.22;
      scene.add(tomatoGroup);

      // 2. Tomato Body Geometry with organic radial lobes and flattened poles
      const tomatoRadius = 1.48;
      // 44, 32 provides smooth curvature while saving 50% CPU cycles on setup
      tomatoGeo = new THREE.SphereGeometry(tomatoRadius, 44, 32);
      const pos = tomatoGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);

        const flattenedY = y * 0.86;
        const angle = Math.atan2(z, x);
        const lobeFactor = 1 + 0.05 * Math.cos(angle * 6);

        pos.setXYZ(i, x * lobeFactor, flattenedY, z * lobeFactor);
      }
      tomatoGeo.computeVertexNormals();

      // Ripe lustrous crimson red material with realistic clearcoat sheen
      tomatoMat = new THREE.MeshPhysicalMaterial({
        color: 0xee2b3f,
        emissive: 0x220206,
        roughness: 0.22,
        metalness: 0.06,
        clearcoat: 0.85,
        clearcoatRoughness: 0.12,
      });
      const tomatoMesh = new THREE.Mesh(tomatoGeo, tomatoMat);
      tomatoGroup.add(tomatoMesh);

      // 3. Mechanical Pomodoro Kitchen Timer Dial Belt
      dialRingGeo = new THREE.CylinderGeometry(1.51, 1.51, 0.22, 48, 1, true);
      dialRingMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.35,
        metalness: 0.08,
        side: THREE.DoubleSide,
      });
      const dialRing = new THREE.Mesh(dialRingGeo, dialRingMat);
      tomatoGroup.add(dialRing);

      // Minute Ticks around the dial ring
      const tickGroup = new THREE.Group();
      const totalTicks = 24;
      for (let i = 0; i < totalTicks; i++) {
        const angle = (i / totalTicks) * Math.PI * 2;
        const isMajor = i % 4 === 0;
        const tickGeo = new THREE.BoxGeometry(0.024, isMajor ? 0.16 : 0.08, 0.035);
        const tickMat = new THREE.MeshBasicMaterial({
          color: isMajor ? 0xdc2626 : 0x475569,
        });
        const tickMesh = new THREE.Mesh(tickGeo, tickMat);
        const r = 1.52;
        tickMesh.position.set(Math.cos(angle) * r, 0, Math.sin(angle) * r);
        tickMesh.rotation.y = -angle + Math.PI / 2;
        tickGroup.add(tickMesh);
      }
      tomatoGroup.add(tickGroup);

      // Indicator Arrow pointer at top of the dial
      pointerGeo = new THREE.ConeGeometry(0.065, 0.14, 3);
      pointerMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
      const pointer = new THREE.Mesh(pointerGeo, pointerMat);
      pointer.position.set(0, 0.18, 1.525);
      pointer.rotation.x = Math.PI;
      tomatoGroup.add(pointer);

      // 4. Fresh Green Leaves & Stem at top of Tomato
      const stemGroup = new THREE.Group();
      stemGroup.position.y = 1.25;

      stemGeo = new THREE.CylinderGeometry(0.06, 0.09, 0.42, 12);
      stemMat = new THREE.MeshStandardMaterial({
        color: 0x15803d,
        roughness: 0.45,
        metalness: 0.05,
      });
      const stemMesh = new THREE.Mesh(stemGeo, stemMat);
      stemMesh.position.y = 0.19;
      stemMesh.rotation.z = 0.14;
      stemGroup.add(stemMesh);

      // Star-shaped sepals
      const leafCount = 5;
      for (let i = 0; i < leafCount; i++) {
        const angle = (i / leafCount) * Math.PI * 2;
        const leafGeo = new THREE.ConeGeometry(0.12, 0.58, 4);
        const leafMat = new THREE.MeshStandardMaterial({
          color: 0x16a34a,
          roughness: 0.38,
        });
        const leafMesh = new THREE.Mesh(leafGeo, leafMat);
        leafMesh.rotation.z = Math.PI / 2.35;
        leafMesh.rotation.y = angle;
        leafMesh.position.set(Math.cos(angle) * 0.24, 0.03, Math.sin(angle) * 0.24);
        stemGroup.add(leafMesh);
      }
      tomatoGroup.add(stemGroup);

      // 5. Orbiting Stardust Particles Ring
      const particleCount = 42;
      const particlePositions = new Float32Array(particleCount * 3);
      for (let i = 0; i < particleCount; i++) {
        const a = (i / particleCount) * Math.PI * 2;
        const r = 2.3 + (Math.random() - 0.5) * 0.4;
        particlePositions[i * 3] = Math.cos(a) * r;
        particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 0.7;
        particlePositions[i * 3 + 2] = Math.sin(a) * r;
      }
      particleGeo = new THREE.BufferGeometry();
      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
      particleMat = new THREE.PointsMaterial({
        color: 0xfacc15,
        size: 0.065,
        transparent: true,
        opacity: 0.85,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      tomatoGroup.add(particles);

      // 6. Professional Studio Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
      keyLight.position.set(4, 5, 4);
      scene.add(keyLight);

      // Dynamic Accent Rim Light that synchronizes with the user's selected accent
      let accentHex = 0x6366f1;
      try {
        const accentVal = getComputedStyle(document.documentElement).getPropertyValue('--color-indigo').trim();
        if (accentVal) {
          const parsed = parseInt(accentVal.replace('#', ''), 16);
          if (!isNaN(parsed)) accentHex = parsed;
        }
      } catch {
        // Fallback default
      }

      const rimLight = new THREE.DirectionalLight(accentHex, 1.9);
      rimLight.position.set(-4, -2, -3);
      scene.add(rimLight);

      // 7. Interactive Pointer & Touch Tracking
      let targetRotX = 0.22;
      let targetRotY = 0;
      let currentRotX = 0.22;
      let currentRotY = 0;

      handlePointerMove = (e: PointerEvent) => {
        const rect = container.getBoundingClientRect();
        const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const ny = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        targetRotY = nx * 0.7;
        targetRotX = 0.22 - ny * 0.5;
      };

      handlePointerLeave = () => {
        targetRotX = 0.22;
        targetRotY = 0;
      };

      container.addEventListener('pointermove', handlePointerMove, { passive: true });
      container.addEventListener('pointerleave', handlePointerLeave, { passive: true });

      handleResize = () => {
        if (!container || !renderer || !camera) return;
        const newW = container.clientWidth || 320;
        const newH = container.clientHeight || 280;
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      };

      window.addEventListener('resize', handleResize);

      // 8. Animation Loop
      let time = 0;
      const animate = () => {
        if (isCancelled || isLeavingRef.current) return;

        if (document.hidden) {
          animId = requestAnimationFrame(animate);
          animIdRef.current = animId;
          return;
        }

        time += 0.012;

        tomatoGroup.rotation.y += 0.007;
        tomatoGroup.position.y = Math.sin(time) * 0.09;

        currentRotX += (targetRotX - currentRotX) * 0.055;
        currentRotY += (targetRotY - currentRotY) * 0.055;
        tomatoGroup.rotation.x = currentRotX;
        tomatoGroup.rotation.y += currentRotY * 0.04;

        particles.rotation.y += 0.003;

        renderer?.render(scene, camera);
        animId = requestAnimationFrame(animate);
        animIdRef.current = animId;
      };

      // Initial frame render
      renderer.render(scene, camera);
      setIsLoaded(true);

      animId = requestAnimationFrame(animate);
      animIdRef.current = animId;
    }, 160);

    // 9. Memory Cleanup
    return () => {
      isCancelled = true;
      clearTimeout(startTimer);
      if (animId) cancelAnimationFrame(animId);
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      if (handleResize) window.removeEventListener('resize', handleResize);
      if (handlePointerMove && containerRef.current) {
        containerRef.current.removeEventListener('pointermove', handlePointerMove);
      }
      if (handlePointerLeave && containerRef.current) {
        containerRef.current.removeEventListener('pointerleave', handlePointerLeave);
      }

      tomatoGeo?.dispose();
      tomatoMat?.dispose();
      dialRingGeo?.dispose();
      dialRingMat?.dispose();
      stemGeo?.dispose();
      stemMat?.dispose();
      pointerGeo?.dispose();
      pointerMat?.dispose();
      particleGeo?.dispose();
      particleMat?.dispose();
      renderer?.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`about-three-container ${className}`}
      aria-label="StudyPomodoro 3D Tomato Timer"
    >
      <canvas ref={canvasRef} className={`about-three-canvas ${isLoaded ? 'is-loaded' : ''}`} />
    </div>
  );
};
