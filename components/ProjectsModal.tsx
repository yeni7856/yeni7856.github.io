import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Menu, ArrowLeft } from 'lucide-react';
import SideMenu from './SideMenu';
import { Project } from '../types';
import { projects } from '../data';

interface ProjectsModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onProjectClick: (project: Project) => void;
  onNavigate: (section: string) => void;
}

const ProjectsModal: React.FC<ProjectsModalProps> = ({ isOpen, onClose, title, onProjectClick, onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [isInternalMenuOpen, setIsInternalMenuOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeFilter]);

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'ALL') return projects;
    return projects.filter((project) => project.category === activeFilter);
  }, [activeFilter]);

  const ProjectItem: React.FC<{ project: Project }> = ({ project }) => (
    <button
      type="button"
      onClick={() => onProjectClick(project)}
      className="relative block w-full aspect-[3/2] overflow-hidden group cursor-pointer text-left border border-white/10 bg-[#080808] transition-all duration-500 hover:border-[#28CC9E]/40 focus-visible:outline-none focus-visible:border-[#28CC9E]"
    >
      <img
        src={project.imageUrl}
        alt={project.title}
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-[1.1]"
      />

      <div className="absolute inset-0 bg-black/5 transition-colors duration-500 group-hover:bg-black/10" />

      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 md:p-8">
        <div className="translate-y-4 transition-transform duration-500 group-hover:translate-y-0 group-focus-visible:translate-y-0">
          <span className="mb-2 block font-mono text-[11px] font-bold uppercase tracking-widest text-[#28CC9E] md:text-[14px]">
            {project.category}
          </span>

          <h3 className="text-xl font-black uppercase leading-none tracking-tighter text-white md:text-2xl">
            {project.title}
          </h3>

          <span className="mt-2 block font-mono text-[10px] tracking-[0.18em] text-white/50 md:text-[11px]">
            {project.year}
          </span>
        </div>
      </div>
    </button>
  );

  return (
    <div className={`fixed inset-0 z-[200] bg-black transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}>
      <button
        type="button"
        onClick={() => setIsInternalMenuOpen(true)}
        aria-label="메뉴 열기"
        className="fixed right-6 top-6 z-[210] rounded-full border border-white/10 bg-white/5 p-3 text-white transition-all hover:bg-[#28CC9E] hover:text-black md:right-12 md:top-12"
      >
        <Menu size={32} strokeWidth={1} />
      </button>

      <SideMenu
        isOpen={isInternalMenuOpen}
        onClose={() => setIsInternalMenuOpen(false)}
        onNavigate={(section) => {
          onNavigate(section);
          setIsInternalMenuOpen(false);
        }}
      />

      <div
        ref={scrollRef}
        className="custom-scrollbar flex h-full w-full flex-col overflow-y-auto px-5 py-6 sm:px-8 sm:py-8 md:px-16 md:py-12"
      >
        <header className="mb-14 border-b border-white/5 pb-10 md:mb-24 md:pb-12">
          <button
            type="button"
            onClick={onClose}
            className="group mb-8 flex items-center gap-2 text-white/80 transition-colors hover:text-white"
          >
            <ArrowLeft size={28} strokeWidth={2} className="transition-transform group-hover:-translate-x-2" />
            <span className="text-xs uppercase tracking-[0.3em]">BACK</span>
          </button>

          <h2 className="max-w-[calc(100%-80px)] text-5xl font-black uppercase leading-none tracking-tighter text-white sm:text-7xl md:text-[7rem] lg:text-[9rem]">
            {title}<span className="text-white">.</span>
          </h2>

          <div className="mt-10 flex flex-col justify-between gap-8 md:mt-12 md:flex-row md:items-center">
            <div className="flex items-center gap-4">
              <div className="h-px w-16 bg-[#28CC9E]/50 md:w-24" />
              <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-white/50 sm:text-[10px] sm:tracking-[0.5em]">
                Visual History System
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {['ALL', 'GAME', 'WEB', 'APP', 'XR'].map((filter) => (
                <button
                  type="button"
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`border px-4 py-2 text-[11px] uppercase tracking-[0.12em] transition-all sm:px-5 sm:text-[12px] ${activeFilter === filter ? 'border-[#28CC9E] bg-[#28CC9E] font-bold text-black shadow-[0_0_20px_rgba(40,204,158,0.1)]' : 'border-white/20 text-white/40 hover:border-white/40 hover:text-white/80'}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </header>

        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-5 pb-20 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectItem key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectsModal;