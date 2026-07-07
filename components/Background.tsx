import React, { useEffect, useRef } from 'react';
import { Project } from '../types';

interface BackgroundProps {
  activeProject?: Project; 
}

const Background: React.FC<BackgroundProps> = ({ activeProject }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let frameId: number;

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      if (canvas) {
        canvas.width = width;
        canvas.height = height;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (width > 0 && height > 0) {
        targetMouseX = (e.clientX / width) * 2 - 1;
        targetMouseY = (e.clientY / height) * 2 - 1;
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const GRID_SPACING = 80;
    const PERSPECTIVE = 600;
    const ROTATION = Math.PI / 4; 
    
    const planes = Array.from({ length: 12 }).map(() => ({
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * 2000 + 500,
      w: Math.random() * 300 + 100,
      h: Math.random() * 300 + 100,
      speed: Math.random() * 0.5 + 0.1
    }));

    const draw = () => {
      if (width <= 0 || height <= 0) {
        frameId = requestAnimationFrame(draw);
        return;
      }

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // [핵심 수정] 캔버스를 매 프레임마다 완전히 지워서 투명하게 만듭니다.
      // fillRect로 채우는 대신 clearRect를 써야 배경 비디오가 보입니다.
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const camX = mouseX * 100;
      const camY = mouseY * 50;

      const project = (x: number, y: number, z: number) => {
        const scale = PERSPECTIVE / (PERSPECTIVE + z);
        const px = (x * Math.cos(ROTATION) - y * Math.sin(ROTATION) - camX) * scale + cx;
        const py = (x * Math.sin(ROTATION) + y * Math.cos(ROTATION) - camY) * scale + cy;
        return { x: px, y: py, scale };
      };

      // 그리드 드로잉
      ctx.lineWidth = 1;
      const gridSize = 4000;
      const lines = 40;
      
      for (let i = -lines; i <= lines; i++) {
        const offset = i * GRID_SPACING;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(40, 204, 158, ${0.03 + (1 - Math.abs(i/lines)) * 0.05})`; 
        const p1 = project(offset, -gridSize, 200);
        const p2 = project(offset, gridSize, 200);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();

        if (i % 5 === 0) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.015})`; 
            const h1 = project(-gridSize, offset, 200);
            const h2 = project(gridSize, offset, 200);
            ctx.moveTo(h1.x, h1.y);
            ctx.lineTo(h2.x, h2.y);
            ctx.stroke();
        }
      }

      // 평면 드로잉
      planes.forEach(plane => {
        plane.z -= plane.speed;
        if (plane.z < -200) plane.z = 2500;
        const depthFactor = 1 - (plane.z / 3000); 
        if (depthFactor < 0) return;

        const p1 = project(plane.x - plane.w/2, plane.y - plane.h/2, plane.z);
        const p2 = project(plane.x + plane.w/2, plane.y - plane.h/2, plane.z);
        const p3 = project(plane.x + plane.w/2, plane.y + plane.h/2, plane.z);
        const p4 = project(plane.x - plane.w/2, plane.y + plane.h/2, plane.z);

        ctx.beginPath();
        ctx.strokeStyle = `rgba(40, 204, 158, ${depthFactor * 0.15})`; 
        ctx.lineWidth = Math.max(0.5, 1 * p1.scale);
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineTo(p3.x, p3.y);
        ctx.lineTo(p4.x, p4.y);
        ctx.closePath();
        ctx.stroke();

        ctx.fillStyle = `rgba(25, 107, 105, ${depthFactor * 0.03})`;
        ctx.fill();
      });

      // 비넷 효과 (투명한 검정 그라데이션으로 외곽만 어둡게)
      const radius = Math.max(width, height, 1);
      const vignette = ctx.createRadialGradient(width / 2, height / 2, height * 0.3, width / 2, height / 2, radius);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, 'rgba(0,0,0,0.6)'); // 약간 흐리게
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      frameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 overflow-hidden">
      {/* 1. 실제 이미지/비디오 레이어 */}
      <div className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000">
        {activeProject && (
          <img
            key={activeProject.id}
            src={activeProject.imageUrl}
            alt=""
            className="w-full h-full object-cover blur-[100px] scale-125 opacity-40 animate-in fade-in duration-1000"
          />
        )}
      </div>

      {/* 2. 캔버스 레이어 (그리드) */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      
      {/* 3. 전체 분위기 조절용 오버레이 */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </div>
  );
};

export default Background;