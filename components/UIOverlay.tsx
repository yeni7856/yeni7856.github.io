
import React from 'react';
import { Menu, Globe, ArrowRight } from 'lucide-react';

interface UIOverlayProps {
  onOpenProjects: () => void;
  onOpenAbout: () => void;
  onOpenContact: () => void;
  onOpenSideMenu: () => void;
  onGoHome: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ onOpenProjects, onOpenAbout, onOpenContact, onOpenSideMenu, onGoHome }) => {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col justify-between p-8 md:p-12">
      <header className="flex justify-between items-start">
        <div className="pointer-events-auto cursor-pointer group" onClick={onGoHome}>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mix-blend-difference">
            YEEUN UI<span>.</span>
          </h1>
          <div className="h-[2px] w-0 group-hover:w-full bg-[#28CC9E] transition-all duration-500 ease-out mt-1"></div>
        </div>

        <nav className="pointer-events-auto">
          <button 
            onClick={onOpenSideMenu}
            className="p-3 border border-white/10 hover:bg-[#28CC9E] text-white hover:text-black transition-all rounded-full group"
          >
            <Menu size={32} strokeWidth={1} />
          </button>
        </nav>
      </header>

      <div className="absolute top-1/2 left-0 w-8 h-[1px] bg-white/20"></div>
      <div className="absolute top-1/2 right-0 w-8 h-[1px] bg-white/20"></div>

      <footer className="flex flex-col md:flex-row justify-between items-end md:items-center">
        <div className="hidden md:flex gap-8 pointer-events-auto">
          {[
            { label: 'PROJECTS', action: onOpenProjects },
            { label: 'ABOUT', action: onOpenAbout },
            { label: 'CONTACT', action: onOpenContact }
          ].map((item) => (
            <button 
              key={item.label}
              onClick={item.action}
              className="cube-btn w-[100px] text-[10px] font-bold tracking-[0.3em] text-white/50 outline-none"
            >
              <div className="cube-inner">
                <div className="cube-face cube-face-front uppercase">{item.label}</div>
                <div className="cube-face cube-face-bottom uppercase">{item.label}</div>
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col items-end gap-2 text-right text-xs font-mono tracking-widest text-white/40">
          <div className="flex items-center gap-2 mb-1">
            <Globe size={12} className="text-[#DDFEE4]" />
            <span>SEOUL [KR]</span>
          </div>
          <p>© 2026 ARCHIVE</p>
          {/* <div className="pointer-events-auto mt-4 md:mt-2 flex items-center gap-2 group cursor-pointer text-white/60 hover:text-white">
            <span className="text-[9px] group-hover:mr-1 transition-all">SCROLL / DRAG</span>
            <ArrowRight size={12} />
          </div> */}
        </div>
      </footer>
    </div>
  );
};

export default UIOverlay;
