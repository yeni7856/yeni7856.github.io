
import React from 'react';
import { X } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 z-[400] bg-black/80 backdrop-blur-md transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[500px] z-[401] bg-[#050505] border-l border-white/5 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-8 md:p-16 h-full flex flex-col">
          <header className="flex justify-end mb-24">
            <button 
              onClick={onClose}
              className="p-3 border border-white/10 hover:bg-[#28CC9E] text-white hover:text-black transition-all rounded-full group"
            >
              <X size={32} strokeWidth={1} className="group-hover:scale-90 transition-transform" />
            </button>
          </header>

          <nav className="flex-1 flex flex-col gap-8">
            {['HOME', 'PROJECTS', 'ABOUT', 'CONTACT'].map((item, idx) => (
              <button
                key={item}
                onClick={() => {
                  onNavigate(item);
                  onClose();
                }}
                style={{ transitionDelay: `${idx * 50}ms` }}
                className={`text-5xl md:text-6xl font-black tracking-tighter text-white text-left transition-all hover:pl-6 group flex items-center gap-6`}
              >
                <span>{item}</span>
                <div className="h-[2px] w-0 group-hover:w-12 bg-[#28CC9E] transition-all duration-500"></div>
              </button>
            ))}
          </nav>

          <footer className="mt-auto border-t border-white/5 pt-12">
             <div className="flex justify-between items-end">
               <div className="text-white/20 text-[9px] tracking-[0.4em] font-mono uppercase">
                  <p className="mt-2 text-[#28CC9E]/40 tracking-widest">Yeeun kwak ui system</p>
               </div>
               <div className="text-white/20 text-[9px] font-mono text-right">
                  V2.0
               </div>
             </div>
          </footer>
        </div>
      </div>
    </>
  );
};

export default SideMenu;
