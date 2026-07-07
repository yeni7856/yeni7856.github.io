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
}

const CylinderRing = forwardRef<CylinderRingHandle, CylinderRingProps>(({ projects, startAnimation, onIndexChange, onProjectClick }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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
  const GAP = isMobile ? 40 : isTablet ? -40 : -10;     // 카드 사이의 간격 보정치
  const SIZEUP = isMobile ? 60 : isTablet ? 180 : 300;   // z축 카메라 시점 뒤로 밀기 (원통 크기 확장 효과)
  
  // 3. 휠/드래그 물리 엔진 상수
  const DAMPING = 0.82;                                  // 마찰력 (속도 감쇄율)
  const SPRING_STRENGTH = 0.02;                          // 제자리 스냅 정렬 자석 강도
  const DRAG_SENSITIVITY = isMobile ? 0.25 : isTablet ? 0.18 : 0.12; // 마우스/터치 궤적 민감도
  const SCROLL_SENSITIVITY = 0.02;                       // 마우스 휠 스크롤 민감도
  
  // 4. 원통형 원형 배치 삼각함수 계산
  const count = projects.length;
  const sliceAngle = 360 / count;                        // 카드 1개당 차지하는 중심각
  // 원주 공식 (2 * PI * r = 원주) 역산으로 반지름(radius) 구하기
  const radius = Math.round(((CARD_WIDTH + GAP) * count) / (2 * Math.PI));

  // 5. 원통 전체의 기본 기울기 패러미터 (3D 원근 뷰 왜곡)
  const ty = isMobile ? -30 : isTablet ? -190 : -300;       // Y축 상하 고도 조정
  const rx = isMobile ? 0 : isTablet ? -12 : -13;          // X축 앞뒤 숙임 각도
  const rz = isMobile ? 0 : isTablet ? 0 : 0;          // Z축 좌우 비틀기 각도

  // 6. 렌더링 루프 밖에서 고속 연산에 쓰이는 물리 상태 저장소 (Ref)
  const state = useRef({
    currentAngle: 0,       // 현재 실시간 회전 각도
    velocity: 0,           // 현재 회전 가속도 (속도)
    isDragging: false,     // 현재 사용자가 잡고 돌리는 중인지 여부
    lastX: 0,              // 드래그 직전 X 좌표
    lastY: 0,              // 드래그 직전 Y 좌표 (모바일 스크롤용)
    targetIndex: -1,       // 외부 명령으로 강제 스크롤할 목적지 인덱스
    introProgress: 0,      // 인트로 시퀀스 진행률 (0 ~ 1)
    introStartTime: 0,     // 인트로가 시작된 고유 타임스탬프
    lastReportedIndex: 0,  // 인덱스 중복 변경 통보 방지용 버퍼
  });

  const rAf = useRef<number | null>(null);

  // 외부(부모) 컴포넌트에서 scrollTo 기능을 트리거할 수 있게 노출 (Imperative API)
  useImperativeHandle(ref, () => ({
    scrollTo: (index: number) => {
      const s = state.current;
      const currentPos = -s.currentAngle / sliceAngle;
      
      // 원형 링 안에서 가장 가까운 최단 거리 회전 경로(방향) 계산
      let distance = index - (currentPos % count);
      if (distance > count / 2) distance -= count;
      if (distance < -count / 2) distance += count;
      
      const targetPos = currentPos + distance;
      const targetAngle = -targetPos * sliceAngle;
      s.targetIndex = index; 
      const angleDiff = targetAngle - s.currentAngle;
      // s.velocity = angleDiff * 0.12; // 목표 각도로 초동 가속도 부여
    }
  }));

  // 탄성 완화 애니메이션 공식 (인트로용)
  const easeOutElastic = (x: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
  };
  
  // 감속 완화 애니메이션 공식 (인트로 각도용)
  const easeOutCubic = (x: number): number => {
    return 1 - Math.pow(1 - x, 3);
  };

  // 7. 매 프레임 초고속 드로잉을 처리하는 메인 requestAnimationFrame 루프
  useEffect(() => {
    const loop = (time: number) => {
      const s = state.current;

      // [시퀀스 A] 최초 인트로 로딩 애니메이션 (720도 회전하며 날아와 꽂히는 연산)
      if (startAnimation) {
        if (s.introStartTime === 0) s.introStartTime = time;
        const elapsed = time - s.introStartTime;
        const duration = 3500; // 인트로 총 지속시간 (2.5초)
        s.introProgress = Math.min(elapsed / duration, 1);
        
        if (s.introProgress < 1) {
          s.currentAngle = (1 - easeOutCubic(s.introProgress)) * 720; // 720도에서 0도로 스무스하게 수렴
        } else if (s.introProgress === 1 && s.introStartTime !== -1) {
          s.currentAngle = 0;
          s.introStartTime = -1;
        }
      }

      // [시퀀스 B] 인트로가 어느 정도 끝난 시점(60% 이상)부터 물리 마찰력 및 정렬 연산 활성화
      if (s.introProgress > 0.6) { 
          if (!s.isDragging) { // 드래그 중이 아닐 때 자동 복귀 로직
              if (s.targetIndex !== -1) {
                  // 특정 카드로 스크롤 자동 이동 중일 때의 자석 물리
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
                      s.targetIndex = -1; // 정렬 완료 시 목적지 해제
                  }
              } else {
                  // 일상적인 관성 흐름 및 가장 가까운 카드에 정밀 스냅 타겟팅
                  s.velocity *= DAMPING; // 매 프레임 속도 감속
                  if (Math.abs(s.velocity) < 0.5) { // 속도가 충분히 느려지면 정렬 자석 발동
                      const currentPos = -s.currentAngle / sliceAngle;
                      const nearestPos = Math.round(currentPos);
                      const targetAngle = -nearestPos * sliceAngle;
                      const dist = targetAngle - s.currentAngle;
                      
                      s.velocity += dist * SPRING_STRENGTH;
                      s.velocity *= 0.90; 
                      if (Math.abs(dist) < 0.02 && Math.abs(s.velocity) < 0.01) {
                         s.velocity = 0;
                         s.currentAngle = targetAngle; // 완전히 멈추면 각도 강제 고정
                      }
                  }
              }
              s.currentAngle += s.velocity;
          } else {
              // 드래그 중일 때는 타겟 정렬을 끄고 마찰 감속 강도를 높여 손가락에 밀착시킴
              s.targetIndex = -1;
              s.velocity *= 0.7;
          }
      }

      // [시퀀스 C] 현재 중앙에 위치한 activeIndex 상태 추적 및 인덱스 동기화 통보
      if (onIndexChange) {
          const currentPos = -s.currentAngle / sliceAngle;
          const rawIndex = Math.round(currentPos);
          const normalizedIndex = ((rawIndex % count) + count) % count; // 음수 방지 순환 공식
          if (normalizedIndex !== s.lastReportedIndex) {
              s.lastReportedIndex = normalizedIndex;
              onIndexChange(normalizedIndex);
              setActiveIndex(normalizedIndex); // 배경 블러 이미지를 교체하기 위한 React State 변경 트리거
          }
      }

      // [시퀀스 D] 계산된 가속도를 바탕으로 실제 DOM 컴포넌트에 CSS 3D Matrix 변환 주입
      if (ringRef.current) {
          // 실시간 원통 전체 축 회전 및 고도 배치
          ringRef.current.style.transform = `translateZ(-${radius + SIZEUP}px) translateY(${ty}px) rotateX(${rx}deg) rotateZ(${rz}deg) rotateY(${s.currentAngle}deg)`;
          
          const children = ringRef.current.children;
          
          if (s.introProgress < 1) {
              // 인트로 상태: 개별 카드들이 사방에서 날아와 순차적으로 정렬되는 트랙킹 좌표 연산
              for (let i = 0; i < children.length; i++) {
                  const child = children[i] as HTMLElement;
                  const cardProgress = Math.max(0, Math.min(1, (s.introProgress - i * 0.05) * 2.8)); // 순차 딜레이
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
               // 일반 작동 상태: 실시간 원통 회전 각도에 따른 개별 카드의 원거리 뎁스 투명도(Depth Opacity) 처리
               for (let i = 0; i < children.length; i++) {
                  const child = children[i] as HTMLElement;
                  const angle = (360 / count) * i;
                  let globalY = (s.currentAngle + angle) % 360;
                  if (globalY > 180) globalY -= 360;
                  if (globalY < -180) globalY += 360;
                  
                  const absAngle = Math.abs(globalY);
                  let depthOpacity = 1;
                  const safeZone = isMobile ? 40 : isTablet ? 50 : 55; // 정면 시야각 한계선
                  
                  // 정면 영역(safeZone)을 벗어나 원통 뒤쪽으로 돌아가는 카드는 흐리게 페이드아웃
                  if (absAngle > safeZone) {
                      depthOpacity = Math.max(0.4, 1 - ((absAngle - safeZone) / 80));
                  }
                  
                  // 앞쪽 카드가 뒤쪽 카드를 완벽히 가리도록 실시간 Z-Index 레이어 스왑핑 계산
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
    if (state.current.introProgress < 0.8) return; // 오프닝 연출 중에는 조작 잠금
    state.current.isDragging = true;
    state.current.lastX = clientX;
    state.current.targetIndex = -1;
  };

  const handleMove = (clientX: number, clientY?: number, isTouch?: boolean) => {
    if (!state.current.isDragging) return;
    const s = state.current;
    
    // 모바일 환경에서 터치 드래그 방향 분기 처리 (가로/세로 축 전환 대응)
    const delta = ((isMobile || isTablet) && isTouch && clientY !== undefined) 
      ? (s.lastY - clientY) 
      : (clientX - s.lastX);

    s.lastX = clientX;
    if (clientY !== undefined) s.lastY = clientY;

    const angularMove = delta * DRAG_SENSITIVITY;
    s.currentAngle += angularMove; // 실시간 회전 각도에 누적
    s.velocity = angularMove;      // 던지기(튕기기) 효과 구현용 순간 가속도 주입
  };

  const handleUp = () => { state.current.isDragging = false; };

  // 마우스 휠 스크롤 감지 핸들러
  const handleWheel = (e: React.WheelEvent) => {
    if (state.current.isDragging) return;
    const delta = e.deltaY;
    state.current.targetIndex = -1;
    state.current.velocity -= delta * SCROLL_SENSITIVITY; // 스크롤 방향에 맞춰 순간 가속도 차감
  };

  return (
    <div 
      className="w-full h-full flex items-center justify-center overflow-hidden perspective-container select-none relative bg-black"
      style={{
        perspective: '2000px',
        cursor: (isMobile || isTablet) ? 'default' : 'none' }} 
      onMouseDown={(e) => handleDown(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleUp}
      onMouseLeave={handleUp}
      onTouchStart={(e) => {
        state.current.isDragging = true;
        state.current.lastX = e.touches[0].clientX;
        state.current.lastY = e.touches[0].clientY;
        state.current.targetIndex = -1;
      }}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY, true)}
      onTouchEnd={handleUp}
      onWheel={handleWheel}
      ref={containerRef}
    >
      {/* 9. [배경 레이어] 현재 활성화된 카드의 원본 이미지를 받아 뒷배경에 부드러운 블러 페이드 연출 */}
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