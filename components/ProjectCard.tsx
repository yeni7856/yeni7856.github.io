import React, { useRef, useEffect } from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  width: number;
  height: number;
  transform: string;
  isActive: boolean; 
  onClick: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, width, height, transform, onClick, isActive }) => {
  // const videoRef = useRef<HTMLVideoElement>(null);

  /* 비디오 재생 로직 일시 중단
  useEffect(() => {
    if (videoRef.current) {
      if (isActive) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isActive]);
  */

  return (
    <div
      onClick={() => onClick(project)}
      className="absolute top-0 left-0 group transition-transform duration-500 ease-out"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        transform: transform,
        left: `calc(50% - ${width / 2}px)`,
        top: `calc(50% - ${height / 2}px)`,
        zIndex: isActive ? 10 : 1,
      }}
    >
      <div className={`w-full h-full relative cursor-pointer overflow-hidden bg-[#0a0a0a] transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] 
          ${isActive ? 'scale-105 -translate-y-6 shadow-[0_30px_60px_rgba(40,204,158,0.15)]' : 'border-white/5'} 
          group-hover:border-[#28CC9E]/40 group-hover:scale-110 group-hover:-translate-y-6 group-hover:shadow-[0_30px_60px_rgba(40,204,158,0.15)]`}>
        
        {/* 카드 메인 이미지: isActive일 때 흑백 해제 및 투명도 조절 */}
        <img
          src={project.imageUrl}
          alt={project.title}
          className={`absolut inset-0 w-full h-full object-cover object-[50%_30%] sm:object-[50%_35%] md:object-[50%_40%] lg:object-center scale-[1.2] sm:scale-[1.15] md:scale-110 lg:scale-100 transition-all duration-700 
            ${isActive ? 'grayscale-0 opacity-90' : 'grayscale opacity-50'} 
            group-hover:grayscale-0 group-hover:opacity-90`}
          draggable={false}
        />

        {/* 비디오 레이어 일시 중단
        {isActive && (
          <video
            ref={videoRef}
            src={project.videoUrl || project.imageUrl}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 grayscale-0 opacity-100"
            muted
            loop
            playsInline
            draggable={false}
          />
        )}
        */}

        {/* 텍스트 UI 레이어 */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 sm:p-6 md:p-8 transition-opacity duration-500 
          ${isActive ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100`}>
          
          <div className={`transform transition-transform duration-500 delay-75 ${isActive ? 'translate-y-0' : 'translate-y-4'} group-hover:translate-y-0`}>
            <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-black tracking-tighter text-white mb-1 sm:mb-2 md:mb-3 uppercase leading-none">{project.title}</h3>
            <div className="flex items-center gap-1.5 sm:gap-2 pt-1 sm:pt-2 md:pt-3">
              <p className="text-[10px] sm:text-[12px] md:text-[15px] tracking-[0.1em] text-[#28CC9E] uppercase font-bold">
                {project.category}
              </p>
              <span className="text-white/30 text-[10px] sm:text-[12px]">|</span>
              <span className="text-[10px] sm:text-[11px] md:text-[13px] tracking-[0.1em] text-white/70">{project.id.toString().padStart(2, '0')}</span>
              <span className="text-white/30 text-[10px] sm:text-[12px]">|</span>
              <span className="text-[10px] sm:text-[11px] md:text-[13px] tracking-[0.1em] text-white/70">{project.year}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProjectCard);