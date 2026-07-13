import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Project } from '../types';
import ProjectCard from './ProjectCard';

export interface CylinderRingHandle {
  scrollTo: (index: number) => void;
}

interface CylinderRingProps {
  projects: Project[];
  startAnimation: boolean;
  onIndexChange?: (index: number) => void;
  onProjectClick: (project: Project) => void;
  isPaused?: boolean; //추가
}

const CylinderRing = forwardRef<CylinderRingHandle, CylinderRingProps>(({ projects, startAnimation, onIndexChange, onProjectClick, isPaused }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);


   // 추가: isPaused를 ref로도 들고 있어서 loop()의 클로저 안에서
  // 항상 최신값을 읽을 수 있도록 함 (loop는 useEffect가 처음 실행될 때
  // 만들어진 클로저라 props 변화를 직접 못 읽음)
  const isPausedRef = useRef(false);
    useEffect(() => {
      isPausedRef.current = !!isPaused;
    }, [isPaused]);

  // 1. 디바이스 해상도별 미디어 쿼리 상태 관리
  const [screenSize, setScreenSize] = useState(() => {
    if (typeof window === 'undefined') return { isMobile: false, isTablet: false };
    const width = window.innerWidth;
    return {
      isMobile: width < 768,
      isTablet: width >= 768 && width < 1280
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1280
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { isMobile, isTablet } = screenSize;

  // 2. 디바이스별 3D 배치 레이아웃 상수 정의
  const CARD_WIDTH = isMobile ? 320 : isTablet ? 700 : 1100;
  const CARD_HEIGHT = isMobile ? 480 : isTablet ? 500 : 620;
  const GAP = isMobile ? 40 : isTablet ? -40 : -10;
  const SIZEUP = isMobile ? 60 : isTablet ? 180 : 300;

  // 3. 휠/드래그 물리 엔진 상수
  const DAMPING = 0.82;
  const SPRING_STRENGTH = 0.02;
  const DRAG_SENSITIVITY = isMobile ? 0.25 : isTablet ? 0.18 : 0.12;
  const SCROLL_SENSITIVITY = 0.02;

  // 4. 원통형 원형 배치 삼각함수 계산
  const count = projects.length;
  const sliceAngle = 360 / count;
  const radius = Math.round(((CARD_WIDTH + GAP) * count) / (2 * Math.PI));

  // 5. 원통 전체의 기본 기울기 패러미터
  const ty = isMobile ? -30 : isTablet ? -190 : -300;
  const rx = isMobile ? 0 : isTablet ? -12 : -13;
  const rz = isMobile ? 0 : isTablet ? 0 : 0;

  // 6. 렌더링 루프 밖에서 고속 연산에 쓰이는 물리 상태 저장소 (Ref)
  const state = useRef({
    currentAngle: 0,
    velocity: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    targetIndex: -1,
    introProgress: 0,
    introStartTime: 0,
    lastReportedIndex: -1, // ★ 수정: 0 → -1. 초기 인덱스 0도 반드시 통보되도록
  });

  const rAf = useRef<number | null>(null);

  useImperativeHandle(ref, () => ({
    scrollTo: (index: number) => {
      const s = state.current;
      const currentPos = -s.currentAngle / sliceAngle;

      let distance = index - (currentPos % count);
      if (distance > count / 2) distance -= count;
      if (distance < -count / 2) distance += count;

      const targetPos = currentPos + distance;
      const targetAngle = -targetPos * sliceAngle;
      s.targetIndex = index;
      const angleDiff = targetAngle - s.currentAngle;
      // s.velocity = angleDiff * 0.12;
    }
  }));

  const easeOutElastic = (x: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  };

  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
  };

  // 7. 매 프레임 초고속 드로잉을 처리하는 메인 requestAnimationFrame 루프
  useEffect(() => {
    const loop = (time: number) => {
      const s = state.current;

      // 모달이 열려 화면에 안 보일 때는 무거운 연산/DOM 갱신을 건너뜀
      if (isPausedRef.current) {
        rAf.current = requestAnimationFrame((t) => loop(t));
        return;
      }

      if (startAnimation) {
        if (s.introStartTime === 0) s.introStartTime = time;
        const elapsed = time - s.introStartTime;
        const duration = 3500;
        s.introProgress = Math.min(elapsed / duration, 1);

        if (s.introProgress < 1) {
          s.currentAngle = (1 - easeOutCubic(s.introProgress)) * 720;
        } else if (s.introProgress === 1 && s.introStartTime !== -1) {
          s.currentAngle = 0;
          s.introStartTime = -1;
        }
      }

      if (s.introProgress > 0.6) {
          if (!s.isDragging) {
              if (s.targetIndex !== -1) {
                  const currentPos = -s.currentAngle / sliceAngle;
                  const k = Math.round((currentPos - s.targetIndex) / count);
                  const targetPos = s.targetIndex + k * count;
                  const targetAngle = -targetPos * sliceAngle;
                  const dist = targetAngle - s.currentAngle;

                  s.velocity += dist * 0.15;
                  s.velocity *= 0.6;
                  if (Math.abs(dist) < 0.1 && Math.abs(s.velocity) < 0.1) {
                      s.velocity = 0;
                      s.currentAngle = targetAngle;
                      s.targetIndex = -1;
                  }
              } else {
                  s.velocity *= DAMPING;
                  if (Math.abs(s.velocity) < 0.5) {
                      const currentPos = -s.currentAngle / sliceAngle;
                      const nearestPos = Math.round(currentPos);
                      const targetAngle = -nearestPos * sliceAngle;
                      const dist = targetAngle - s.currentAngle;

                      s.velocity += dist * SPRING_STRENGTH;
                      s.velocity *= 0.90;
                      if (Math.abs(dist) < 0.02 && Math.abs(s.velocity) < 0.01) {
                         s.velocity = 0;
                         s.currentAngle = targetAngle;
                      }
                  }
              }
              s.currentAngle += s.velocity;
          } else {
              s.targetIndex = -1;
              s.velocity *= 0.7;
          }
      }

      if (onIndexChange) {
          const currentPos = -s.currentAngle / sliceAngle;
          const rawIndex = Math.round(currentPos);
          const normalizedIndex = ((rawIndex % count) + count) % count;
          if (normalizedIndex !== s.lastReportedIndex) {
              s.lastReportedIndex = normalizedIndex;
              onIndexChange(normalizedIndex);
              setActiveIndex(normalizedIndex);
          }
      }

      if (ringRef.current) {
          ringRef.current.style.transform = `translateZ(-${radius + SIZEUP}px) translateY(${ty}px) rotateX(${rx}deg) rotateZ(${rz}deg) rotateY(${s.currentAngle}deg)`;

          const children = ringRef.current.children;

          if (s.introProgress < 1) {
              for (let i = 0; i < children.length; i++) {
                  const child = children[i] as HTMLElement;
                  const cardProgress = Math.max(0, Math.min(1, (s.introProgress - i * 0.05) * 2.8));
                  const elasticVal = easeOutElastic(cardProgress);
                  const trajectoryVal = easeOutCubic(cardProgress);

                  const startX = (isMobile || isTablet) ? 0 : 2500;
                  const startY = -1500;
                  const startZ = -3000;
                  const currentX = startX * (1 - trajectoryVal);
                  const currentY = startY * (1 - trajectoryVal);
                  const currentZ = startZ * (1 - trajectoryVal);
                  const currentScale = 0.3 + (0.7 * elasticVal);
                  const rotateZ = (isMobile || isTablet ? 0 : 90) * (1 - trajectoryVal);
                  const angle = (360 / count) * i;

                  child.style.transform = `rotateY(${angle}deg) translateZ(${radius + SIZEUP}px) translate3d(${currentX}px, ${currentY}px, ${currentZ}px) rotateZ(${rotateZ}deg) scale(${currentScale})`;
                  child.style.opacity = trajectoryVal.toString();
              }
          } else if (s.introProgress === 1) {
               for (let i = 0; i < children.length; i++) {
                  const child = children[i] as HTMLElement;
                  const angle = (360 / count) * i;
                  let globalY = (s.currentAngle + angle) % 360;
                  if (globalY > 180) globalY -= 360;
                  if (globalY < -180) globalY += 360;

                  const absAngle = Math.abs(globalY);
                  let depthOpacity = 1;
                  const safeZone = isMobile ? 40 : isTablet ? 50 : 55;

                  if (absAngle > safeZone) {
                      depthOpacity = Math.max(0.4, 1 - ((absAngle - safeZone) / 80));
                  }

                  const depthZIndex = Math.round(100 - absAngle);
                  child.style.transform = `rotateY(${angle}deg) translateZ(${radius + SIZEUP}px)`;
                  child.style.opacity = depthOpacity.toString();
                  child.style.zIndex = depthZIndex.toString();
               }
               if (s.introStartTime > 0) s.introStartTime = -1;
          }
      }
      rAf.current = requestAnimationFrame((t) => loop(t));
    };

    rAf.current = requestAnimationFrame((t) => loop(t));
    return () => { if (rAf.current) cancelAnimationFrame(rAf.current); };
  }, [radius, count, startAnimation, sliceAngle, onIndexChange, isMobile, isTablet, SIZEUP, ty, rx, rz]);

  // 8. 마우스 및 터치 인터랙션 이벤트 핸들러
  const handleDown = (clientX: number) => {
    if (state.current.introProgress < 0.8) return;
    state.current.isDragging = true;
    state.current.lastX = clientX;
    state.current.targetIndex = -1;
  };

  // ★ 수정: 모바일/데스크탑 모두 가로(X) 델타 기준으로 통일
  const handleMove = (clientX: number, clientY?: number) => {
    if (!state.current.isDragging) return;
    const s = state.current;

    const delta = clientX - s.lastX;

    s.lastX = clientX;
    if (clientY !== undefined) s.lastY = clientY;

    const angularMove = delta * DRAG_SENSITIVITY;
    s.currentAngle += angularMove;
    s.velocity = angularMove;
  };

  const handleUp = () => { state.current.isDragging = false; };

  const handleWheel = (e: React.WheelEvent) => {
    if (state.current.isDragging) return;
    const delta = e.deltaY;
    state.current.targetIndex = -1;
    state.current.velocity -= delta * SCROLL_SENSITIVITY;
  };

  // ★ 추가: touchmove를 passive: false로 네이티브 등록해서 preventDefault가 확실히 먹히게 함
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchMove = (e: TouchEvent) => {
      if (!state.current.isDragging) return;
      e.preventDefault(); // 브라우저 기본 세로 스크롤/바운스 차단
      const touch = e.touches[0];
      handleMove(touch.clientX, touch.clientY);
    };

    el.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => el.removeEventListener('touchmove', onTouchMove);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="w-full h-full flex items-center justify-center overflow-hidden perspective-container select-none relative bg-black"
      style={{
        perspective: '2000px',
        touchAction: 'none',        // ★ 추가: 브라우저 기본 스크롤/줌 제스처 차단
        overscrollBehavior: 'none', // ★ 추가: 당겨서 새로고침/바운스 방지
        cursor: (isMobile || isTablet) ? 'default' : 'none'
      }}
      onMouseDown={(e) => handleDown(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      onTouchStart={(e) => {
        if (state.current.introProgress < 0.8) return; // ★ 수정: 인트로 중 조작 잠금 (마우스와 동일하게)
        state.current.isDragging = true;
        state.current.lastX = e.touches[0].clientX;
        state.current.lastY = e.touches[0].clientY;
        state.current.targetIndex = -1;
      }}
      // onTouchMove는 위 useEffect에서 네이티브로 처리하므로 JSX에는 붙이지 않음
      onTouchEnd={handleUp}
      onWheel={handleWheel}
      ref={containerRef}
    >
      {/* 9. [배경 레이어] */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        {projects.map((project, index) => {
          const isCurrent = index === activeIndex;
          return (
            <img
              key={`bg-img-${project.id}-${index}`}
              src={project.imageUrl}
              className={`absolute inset-0 w-full h-full object-cover blur-[6px] transition-opacity duration-1000 ease-in-out
                ${isCurrent ? 'opacity-50 scale-110' : 'opacity-0'}`}
              alt="background"
            />
          );
        })}
      </div>

      {/* 10. [3D 실물 원통 컨테이너] */}
      <div
        ref={ringRef}
        className="relative preserve-3d will-change-transform z-10"
        style={{
          width: '0px',
          height: '0px'
        }}
      >
        {projects.map((project, index) => {
          const angle = (360 / count) * index;
          const transform = `rotateY(${angle}deg) translateZ(${radius + SIZEUP}px)`;
          return (
            <ProjectCard
              key={`${project.id}-${index}`}
              project={project}
              width={CARD_WIDTH}
              height={CARD_HEIGHT}
              transform={transform}
              isActive={index === activeIndex}
              onClick={onProjectClick}
            />
          );
        })}
      </div>
    </div>
  );
});

CylinderRing.displayName = 'CylinderRing';
export default CylinderRing;