
import React, { useState, useEffect, useRef } from 'react';
import CylinderRing, { CylinderRingHandle } from './components/CylinderRing';
import UIOverlay from './components/UIOverlay';
import SideMenu from './components/SideMenu';
import CustomCursor from './components/CustomCursor';
import Pagination from './components/Pagination';
import ProjectsModal from './components/ProjectsModal';
import ProjectDetailModal from './components/ProjectDetailModal';
import FullscreenModal from './components/FullscreenModal';
import AboutContent from './components/AboutContent';
import Background from './components/Background';
import { projects, mainProjects } from './data';
import { Project } from './types';
import { AnimatePresence } from 'framer-motion';
import Preloader from './components/Preloader';
import ContactContent from './components/Contact';


const App: React.FC = () => {
  const getInitialProjectIndex = () => {
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view')?.toLowerCase();

  switch (view) {
    case 'game':
      return 1; // mainProjects에서 대표 게임 프로젝트 위치
    case 'xr':
      return 5; // mainProjects에서 대표 XR 프로젝트 위치
    default:
      return 0;
  }
};

  const initialProjectIndexRef = useRef(getInitialProjectIndex()); //초기값 설정
  const initialProjectIndex = initialProjectIndexRef.current;

  const [loaded, setLoaded] = useState(false);
  const [startAnimation, setStartAnimation] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(initialProjectIndex);
  
  // Modal states
  const [isProjectsOpen, setIsProjectsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const isAnyModalOpen = isProjectsOpen || isAboutOpen || isContactOpen || isDetailOpen;

  const cylinderRef = useRef<CylinderRingHandle>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
      setTimeout(() => setStartAnimation(true), 500);
    }, 1500); 
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
  if (!startAnimation) return;

  const timer = setTimeout(() => {
    cylinderRef.current?.scrollTo(initialProjectIndex);
    setCurrentIndex(initialProjectIndex);
  }, 3000);

  return () => clearTimeout(timer);
}, [startAnimation, initialProjectIndex]);


  const handleProjectChange = (index: number) => {
    if (cylinderRef.current) {
      cylinderRef.current.scrollTo(index);
    }
  };

  const openProjectDetail = (project: Project) => {
    setSelectedProject(project);
    setIsDetailOpen(true);
  };

  const handleNavigation = (section: string) => {
    // 1. 모든 모달과 사이드메뉴 상태를 일단 false(닫힘)로 초기화
    setIsProjectsOpen(false);
    setIsAboutOpen(false);
    setIsContactOpen(false);
    setIsSideMenuOpen(false);
    setIsDetailOpen(false); // 상세 모달이 열려있을 수도 있으니 추가

    // 2. HOME이 아닐 때만 딜레이를 주어 해당 모달을 켬
    // (모달이 내려가는 애니메이션 시간과 겹치지 않게 300ms 정도 딜레이를 줍니다)
    if (section !== 'HOME') {
      setTimeout(() => {
        if (section === 'PROJECTS') setIsProjectsOpen(true);
        if (section === 'ABOUT') setIsAboutOpen(true);
        if (section === 'CONTACT') setIsContactOpen(true);
      }, 300); 
    }
    // section이 'HOME'이면 위 조건에 걸리지 않아 모든 모달이 닫힌 메인 화면만 남습니다.
  };

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden cursor-none">
      {/* Layer 0: Background */}
      <Background  activeProject={mainProjects[currentIndex]} isPaused={isAnyModalOpen} />
      
      {/* Layer 9999: Cursor */}
      <CustomCursor />
      
      {/* Layer 500: Loading Screen */}
      <AnimatePresence>
        {!loaded && (
          <Preloader onComplete={() => setLoaded(true)} />
        )}
      </AnimatePresence>
      {/* <div 
        className={`absolute inset-0 z-[500] bg-black flex items-center justify-center transition-opacity duration-1000 ease-in-out ${loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div className="flex flex-col items-center gap-4">
           <div className="w-12 h-12 border-t-2 border-[#28CC9E] rounded-full animate-spin"></div>
           <span className="text-white text-[10px] tracking-[0.5em] font-mono animate-pulse uppercase">MVMNT Archive System</span>
        </div>
      </div> */}

      {/* Layer 10: Main Content */}
      <div className={`relative z-10 w-full h-full transition-opacity duration-1000 delay-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
        <UIOverlay 
          onOpenProjects={() => setIsProjectsOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
          onOpenContact={() => setIsContactOpen(true)}
          onOpenSideMenu={() => setIsSideMenuOpen(true)}
          onGoHome={() => {
            handleNavigation('HOME');
            setCurrentIndex(0);
            cylinderRef.current?.scrollTo(0);
          }}
        />
        
        {/* Pagination */}
        {!isProjectsOpen && !isAboutOpen && !isContactOpen && !isDetailOpen && (
          <Pagination 
            total={mainProjects.length} 
            current={currentIndex} 
            onChange={handleProjectChange} 
          />
        )}
        
        {/* 3D Scene */}
        <main className={`w-full h-full relative transition-transform duration-1000 ${isDetailOpen ? 'scale-95 blur-md' : 'scale-100 blur-0'}`}>
          <CylinderRing 
            ref={cylinderRef}
            projects={mainProjects}
            startAnimation={startAnimation} 
            onIndexChange={setCurrentIndex}
            onProjectClick={openProjectDetail}
            isPaused={isAnyModalOpen}
          />
        </main>
      </div>

      {/* Side Menu */}
      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={() => setIsSideMenuOpen(false)} 
        onNavigate={handleNavigation}
      />

      {/* Modals */}
      <ProjectsModal 
        isOpen={isProjectsOpen} 
        onClose={() => setIsProjectsOpen(false)} 
        onProjectClick={openProjectDetail}
        onNavigate={handleNavigation}
        title="Projects"
      />

      <ProjectDetailModal 
        project={selectedProject} 
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)} 
        onNavigate={handleNavigation}
      />

      <FullscreenModal 
        isOpen={isAboutOpen} 
        onClose={() => setIsAboutOpen(false)} 
        onNavigate={handleNavigation}
        title="About"
      >
        <AboutContent />
      </FullscreenModal>

      <FullscreenModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
        onNavigate={handleNavigation}
        title="Contact"
      >
        <ContactContent />
      </FullscreenModal>
    </div>
  );
};

export default App;
