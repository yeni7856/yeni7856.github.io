import React, { useEffect, useState, useRef } from 'react';
import { X, ExternalLink, Code2, Palette, ChevronRight, ChevronLeft } from 'lucide-react';
import { Project } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, isOpen, onClose, onNavigate }) => {
  const [displayProject, setDisplayProject] = useState<Project | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDisplayProject(project);
      const timer = setTimeout(() => {
        scrollRef.current?.scrollTo({ top: 0, behavior: 'instant' });
      }, 10);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setDisplayProject(null), 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen, project]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* 닫기 버튼 — 모달 열릴 때만 표시, 스크롤해도 고정 */}
      {isOpen && (
        <button
          onClick={onClose}
          className="fixed top-8 z-[400] p-3 bg-[#28CC9E]/60 backdrop-blur-md border border-[#28CC9E]/10 hover:bg-[#28CC9E] text-white hover:text-black transition-all rounded-full group"
          style={{ left: 'calc(50% + 30vw + 16px)' }}
        >
          <X strokeWidth={1} className="w-[24px] h-[24px] transition-transform group-hover:scale-90" />
        </button>
      )}
      {isOpen && (
        <button
          onClick={() => { onClose(); setTimeout(() => onNavigate('PROJECTS'), 300); }}
          className="fixed flex items-center gap-3 z-[400] px-3 py-2 text-white hover:text-[#28CC9E] transition-all group"
          style={isMobile 
            ? { top: '16px', left: '16px' }
            : { top: '56px', right: 'calc(50% + 32vw + 16px)' }
          }
        >
          <span className="text-[8px] lg:text-[14.5px] tracking-[0.12em] uppercase font-bold whitespace-nowrap">VIEW ALL PROJECTS</span>
          <ChevronRight size={16} className="shrink-0 transition-transform group-hover:-translate-x-1 rounded-full border border-white group-hover:border-[#28CC9E]" />
        </button>
      )}
        

      {/* 배경 오버레이 */}
      <div
        ref={scrollRef}
        className={`fixed inset-0 z-[300] bg-black/40 backdrop-blur-sm transition-opacity duration-700 flex items-start justify-center overflow-y-auto custom-scrollbar ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      >
        {/* 콘텐츠 */}
        <div
          className={`w-full md:w-[60vw] md:my-40 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {displayProject && (
            <div className="flex flex-col w-full">
              {/* 설명 */}
              {displayProject.description && (
                <section className="w-full mb-40 px-6 py-12 sm:px-10 md:px-16 md:py-16 bg-[#080808] border-b border-white/10">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[#28CC9E] font-mono text-[11px] md:text-[13px] tracking-[0.2em] font-bold uppercase">{displayProject.category}</span>
                    <span className="text-white/30">|</span>
                    <span className="text-white/50 font-mono text-[11px] md:text-[13px] tracking-[0.15em]">{displayProject.year}</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-6">{displayProject.title}</h2>
                  <p className="max-w-3xl text-sm sm:text-base md:text-lg leading-relaxed text-white/60 font-light">{displayProject.description}</p>
                </section>
              )}
              {/* 동영상 */}
              {displayProject.videoUrl?.map((url, idx) =>(
                 <video
                  key={idx}
                  src={url}
                  muted playsInline controls
                  className="w-full h-auto mb-40 "
                  onMouseEnter={() => document.documentElement.classList.add('video-hover')}
                  onMouseLeave={() => document.documentElement.classList.remove('video-hover')}
                />
              ))}
              {/* 설명 이미지들 */}
              {displayProject.images?.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  className="w-full h-auto object-cover"
                  alt={`Detail ${idx + 1}`}
                />
              ))}

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectDetailModal;

/*
  ====================================================
  아래는 추후 사용을 위해 보존된 코드들
  ====================================================

  // 정보 사이드바 섹션
  <div
    ref={rightScrollRef}
    className="w-full h-auto lg:h-full lg:w-[450px] xl:w-[600px] bg-[#080808] z-20 border-b lg:border-b-0 lg:border-l border-white/5 overflow-y-auto p-8 sm:p-10 lg:p-20 flex flex-col gap-8 lg:gap-16"
  >
    <button
      onClick={() => { onClose(); setTimeout(() => onNavigate('PROJECTS'), 300); }}
      className="flex items-center gap-2 text-white hover:text-[#28CC9E] transition-all group mb-8 lg:mb-12 w-fit"
    >
      <span className="text-[9px] lg:text-[10px] tracking-[0.4em] uppercase font-bold">VIEW ALL PROJECTS</span>
      <ChevronRight size={14} className="transition-transform group-hover:-translate-x-1 rounded-full border border-white group-hover:border-[#28CC9E]" />
    </button>

    <section>
      <div className="flex items-center gap-4 mb-4 lg:mb-8">
        <span className="text-[#28CC9E] font-mono text-[9px] lg:text-[11px] tracking-[0.4em] uppercase font-bold">{displayProject?.year}</span>
        <div className="h-[1px] w-8 lg:w-10 bg-white/10" />
        <span className="text-[#FF6B6B] font-mono text-[9px] lg:text-[11px] tracking-[0.4em] uppercase font-bold">{displayProject?.category}</span>
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-7xl font-black text-white tracking-tighter uppercase mb-4 lg:mb-10 leading-none">
        {displayProject?.title}<span className="text-[#28CC9E]">.</span>
      </h2>
      <p className="text-white/40 text-xs sm:text-sm lg:text-lg leading-relaxed font-light line-clamp-2 lg:line-clamp-none">
        {displayProject?.description}
      </p>
    </section>

    // 툴 목록
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-white/30 border-b border-white/5 pb-2">
        <Code2 size={16} className="text-[#196B69]" />
        <span className="text-[9px] tracking-[0.3em] font-black uppercase">Core</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {displayProject?.tools?.map((tool, idx) => (
          <span key={tool} className={`px-3 py-1 lg:px-5 lg:py-2 bg-white/[0.03] border border-white/10 text-white/60 text-[8px] lg:text-[10px] tracking-[0.2em] font-mono uppercase ${idx > 2 ? 'hidden sm:inline-block' : 'inline-block'}`}>
            {tool}
          </span>
        ))}
      </div>
    </div>

    // 컬러 스와치
    <div className="space-y-4">
      <div className="flex items-center gap-3 text-white/30 border-b border-white/5 pb-2">
        <Palette size={16} className="text-[#FF6B6B]" />
        <span className="text-[9px] tracking-[0.3em] font-black uppercase">Visual</span>
      </div>
      <div className="flex gap-3 lg:gap-6">
        {displayProject?.colors?.map((color, idx) => (
          <div key={color} className={`w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12 border border-white/20 rounded-sm ${idx > 3 ? 'hidden sm:block' : 'block'}`} style={{ backgroundColor: color }} />
        ))}
      </div>
    </div>

    // 런치 버튼
    <div className="pt-6 lg:pt-12 border-t border-white/5 mt-auto">
      <a href="#" className="flex justify-between items-center group text-white/30 hover:text-[#28CC9E] transition-all">
        <div className="flex items-center gap-3">
          <ChevronRight size={14} className="text-[#28CC9E]" />
          <span className="text-[9px] lg:text-[10px] tracking-[0.4em] uppercase font-bold">Launch Project</span>
        </div>
        <ExternalLink className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
      </a>
    </div>
  </div>
*/