
import React, { useEffect, useRef , useState} from 'react';
import { X, Menu, ArrowLeft } from 'lucide-react';
import SideMenu from './SideMenu';

interface FullscreenModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onNavigate: (section: string) => void;
}

const FullscreenModal: React.FC<FullscreenModalProps> = ({ isOpen, onClose, title, children, onNavigate }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      // 모달이 열리는 순간 스크롤을 맨 위로!
      scrollRef.current.scrollTo(0, 0);
    }
  }, [isOpen]);
  
  return (
    <div className={`fixed inset-0 z-[200] bg-black transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-8 right-8 md:top-12 md:right-12 p-3 bg-white/5 border border-white/10 hover:bg-[#28CC9E] text-white hover:text-black transition-all rounded-full z-[210] group"
      >
        <Menu size={32} strokeWidth={1} />
      </button>
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        onNavigate={(section) => {
          onNavigate(section); // App.tsx의 내비게이션 실행
          setIsMenuOpen(false); // 메뉴 닫기
        }} 
      />
      <div 
      ref={scrollRef}
      className="h-full w-full flex flex-col p-8 md:p-12 lg:p-24 overflow-y-auto custom-scrollbar">
        <header className="mb-24 border-b border-white/5 pb-12">
          <button 
            onClick={onClose}
            className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={24} strokeWidth={1} className="group-hover:-translate-x-2 transition-transform" />
            <span className="font-mono text-xs tracking-[0.3em] uppercase">BACK</span>
          </button>
          {/* <button 
            onClick={onClose}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={28} strokeWidth={2} className="group-hover:-translate-x-2 transition-transform" />
            <span className="text-xs tracking-[0.3em] uppercase">BACK</span>
          </button> */}
          <h2 className="text-5xl sm:text-7xl md:text-[7rem] lg:text-[9rem] font-black text-white tracking-tighter uppercase leading-none">
            {title}<span className="text-white">.</span>
          </h2>
          <div className="flex items-center gap-4 mt-12">
            <div className="h-[1px] w-24 bg-[#28CC9E]/50" />
            <span className="text-white/50 font-mono text-[10px] tracking-[0.5em] uppercase">YEEU KWAK UIUX</span>
          </div>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
};

export default FullscreenModal;
