import React, { useEffect, useRef, useState } from 'react';
import { X, ChevronRight } from 'lucide-react';
import { Project } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
}

/*
  ====================================================
  이미지 직접 핀치 줌 관련 타입
  ====================================================
*/

interface PinchZoomImageProps {
  src: string;
  alt: string;
  loading?: 'eager' | 'lazy';
}

interface ImageTransform {
  scale: number;
  x: number;
  y: number;
}

type GestureMode = 'none' | 'pinch' | 'pan';

/*
  ====================================================
  이미지 직접 핀치 줌 컴포넌트
  ====================================================

  별도의 확대 화면을 열지 않고
  현재 프로젝트 상세 이미지 위에서 직접 확대·축소합니다.

  기본 상태:
  - 한 손가락으로 프로젝트 상세 화면 스크롤
  - 이미지 클릭 동작 없음

  확대 상태:
  - 두 손가락을 벌려 이미지 확대
  - 두 손가락을 모아 이미지 축소
  - 확대 후 한 손가락으로 이미지 이동
  - 배율을 1배까지 줄이면 일반 스크롤로 자동 복귀
*/
const PinchZoomImage: React.FC<PinchZoomImageProps> = ({
  src,
  alt,
  loading = 'lazy',
}) => {
  // 확대 이미지가 표시되는 영역
  const containerRef = useRef<HTMLDivElement>(null);

  // 실제 확대·이동되는 이미지
  const imageRef = useRef<HTMLImageElement>(null);

  /*
    이미지 확대 상태

    scale:
    1 = 기본 크기
    4 = 최대 4배 확대

    x, y:
    확대된 이미지의 이동 위치
  */
  const [transform, setTransform] = useState<ImageTransform>({
    scale: 1,
    x: 0,
    y: 0,
  });

  /*
    터치 중에는 transition을 제거해서
    이미지가 손가락 움직임을 즉시 따라오도록 처리
  */
  const [isInteracting, setIsInteracting] = useState(false);

  /*
    네이티브 터치 이벤트 안에서 항상 최신 값을 읽기 위해
    확대 상태를 Ref에도 동일하게 보관
  */
  const transformRef = useRef<ImageTransform>({
    scale: 1,
    x: 0,
    y: 0,
  });

  /*
    현재 진행 중인 터치 제스처 정보

    pinch:
    두 손가락 확대·축소

    pan:
    확대 상태에서 한 손가락 이미지 이동
  */
  const gestureRef = useRef({
    mode: 'none' as GestureMode,

    startDistance: 0,
    startScale: 1,

    startX: 0,
    startY: 0,

    startTouchX: 0,
    startTouchY: 0,

    startCenterX: 0,
    startCenterY: 0,
  });

  // 최소값과 최대값 사이로 숫자를 제한
  const clamp = (
    value: number,
    min: number,
    max: number,
  ) => {
    return Math.min(Math.max(value, min), max);
  };

  // React State와 Ref의 확대 상태를 동시에 변경
  const applyTransform = (
    nextTransform: ImageTransform,
  ) => {
    transformRef.current = nextTransform;
    setTransform(nextTransform);
  };

  /*
    확대된 이미지가 영역 밖으로 완전히 사라지지 않도록
    이미지의 최대 이동 범위를 계산
  */
  const clampPosition = (
    scale: number,
    x: number,
    y: number,
  ) => {
    const container = containerRef.current;
    const image = imageRef.current;

    if (!container || !image) {
      return {
        x,
        y,
      };
    }

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

    const imageWidth = image.clientWidth;
    const imageHeight = image.clientHeight;

    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    const maxX = Math.max(
      0,
      (scaledWidth - containerWidth) / 2,
    );

    const maxY = Math.max(
      0,
      (scaledHeight - containerHeight) / 2,
    );

    return {
      x: clamp(x, -maxX, maxX),
      y: clamp(y, -maxY, maxY),
    };
  };

  // 이미지를 기본 크기와 기본 위치로 초기화
  const resetTransform = () => {
    gestureRef.current.mode = 'none';

    applyTransform({
      scale: 1,
      x: 0,
      y: 0,
    });
  };

  /*
    네이티브 터치 이벤트 등록

    React 터치 이벤트가 아닌 passive: false 네이티브 이벤트를 사용해서
    모바일 브라우저에서도 두 손가락 핀치 동작을 안정적으로 처리
  */
  useEffect(() => {
    const container = containerRef.current;

    if (!container) return;

    // 두 손가락 사이의 거리 계산
    const getTouchDistance = (touches: TouchList) => {
      if (touches.length < 2) return 0;

      const firstTouch = touches[0];
      const secondTouch = touches[1];

      const deltaX =
        secondTouch.clientX - firstTouch.clientX;

      const deltaY =
        secondTouch.clientY - firstTouch.clientY;

      return Math.sqrt(
        deltaX * deltaX + deltaY * deltaY,
      );
    };

    // 두 손가락 사이의 중앙 좌표 계산
    const getTouchCenter = (touches: TouchList) => {
      if (touches.length < 2) {
        return {
          x: 0,
          y: 0,
        };
      }

      return {
        x:
          (touches[0].clientX +
            touches[1].clientX) /
          2,

        y:
          (touches[0].clientY +
            touches[1].clientY) /
          2,
      };
    };

    /*
      터치 시작

      두 손가락:
      핀치 확대·축소 시작

      한 손가락 + 확대 상태:
      이미지 이동 시작

      한 손가락 + 기본 상태:
      이벤트를 막지 않고 상세 페이지 스크롤 허용
    */
    const handleTouchStart = (event: TouchEvent) => {
      const currentTransform =
        transformRef.current;

      const gesture = gestureRef.current;

      if (event.touches.length === 2) {
        event.preventDefault();

        const distance = getTouchDistance(
          event.touches,
        );

        if (distance <= 0) return;

        const center = getTouchCenter(
          event.touches,
        );

        gesture.mode = 'pinch';
        gesture.startDistance = distance;
        gesture.startScale =
          currentTransform.scale;

        gesture.startX = currentTransform.x;
        gesture.startY = currentTransform.y;

        gesture.startCenterX = center.x;
        gesture.startCenterY = center.y;

        setIsInteracting(true);

        return;
      }

      if (
        event.touches.length === 1 &&
        currentTransform.scale > 1.01
      ) {
        event.preventDefault();

        gesture.mode = 'pan';

        gesture.startTouchX =
          event.touches[0].clientX;

        gesture.startTouchY =
          event.touches[0].clientY;

        gesture.startX = currentTransform.x;
        gesture.startY = currentTransform.y;

        setIsInteracting(true);
      }
    };

    /*
      터치 이동

      두 손가락:
      손가락 사이 거리 변화만큼 이미지 확대·축소

      한 손가락:
      확대된 이미지 위치 이동
    */
    const handleTouchMove = (event: TouchEvent) => {
      const gesture = gestureRef.current;

      /*
        터치 도중 두 번째 손가락이 추가된 경우에도
        바로 핀치 모드로 전환
      */
      if (
        event.touches.length === 2 &&
        gesture.mode !== 'pinch'
      ) {
        event.preventDefault();

        const distance = getTouchDistance(
          event.touches,
        );

        if (distance <= 0) return;

        const center = getTouchCenter(
          event.touches,
        );

        const currentTransform =
          transformRef.current;

        gesture.mode = 'pinch';
        gesture.startDistance = distance;
        gesture.startScale =
          currentTransform.scale;

        gesture.startX = currentTransform.x;
        gesture.startY = currentTransform.y;

        gesture.startCenterX = center.x;
        gesture.startCenterY = center.y;

        setIsInteracting(true);

        return;
      }

      if (
        event.touches.length === 2 &&
        gesture.mode === 'pinch'
      ) {
        event.preventDefault();

        const currentDistance =
          getTouchDistance(event.touches);

        if (
          currentDistance <= 0 ||
          gesture.startDistance <= 0
        ) {
          return;
        }

        const currentCenter =
          getTouchCenter(event.touches);

        const distanceRatio =
          currentDistance /
          gesture.startDistance;

        const nextScale = clamp(
          gesture.startScale * distanceRatio,
          1,
          4,
        );

        /*
          손가락 중앙이 이동한 거리만큼
          확대 이미지도 함께 이동
        */
        const centerDeltaX =
          currentCenter.x -
          gesture.startCenterX;

        const centerDeltaY =
          currentCenter.y -
          gesture.startCenterY;

        const containerRect =
          container.getBoundingClientRect();

        const containerCenterX =
          containerRect.left +
          containerRect.width / 2;

        const containerCenterY =
          containerRect.top +
          containerRect.height / 2;

        /*
          확대 중심을 이미지 중앙이 아니라
          실제 두 손가락 사이 위치에 가깝게 유지
        */
        const pinchOffsetX =
          gesture.startCenterX -
          containerCenterX;

        const pinchOffsetY =
          gesture.startCenterY -
          containerCenterY;

        const scaleRatio =
          nextScale /
          Math.max(
            gesture.startScale,
            0.01,
          );

        const nextX =
          gesture.startX +
          centerDeltaX -
          pinchOffsetX *
            (scaleRatio - 1);

        const nextY =
          gesture.startY +
          centerDeltaY -
          pinchOffsetY *
            (scaleRatio - 1);

        const clampedPosition =
          clampPosition(
            nextScale,
            nextX,
            nextY,
          );

        applyTransform({
          scale: nextScale,
          x: clampedPosition.x,
          y: clampedPosition.y,
        });

        return;
      }

      if (
        event.touches.length === 1 &&
        gesture.mode === 'pan' &&
        transformRef.current.scale > 1.01
      ) {
        event.preventDefault();

        const deltaX =
          event.touches[0].clientX -
          gesture.startTouchX;

        const deltaY =
          event.touches[0].clientY -
          gesture.startTouchY;

        const nextX =
          gesture.startX + deltaX;

        const nextY =
          gesture.startY + deltaY;

        const currentScale =
          transformRef.current.scale;

        const clampedPosition =
          clampPosition(
            currentScale,
            nextX,
            nextY,
          );

        applyTransform({
          scale: currentScale,
          x: clampedPosition.x,
          y: clampedPosition.y,
        });
      }
    };

    /*
      터치 종료

      핀치 이후 손가락 하나가 남으면
      이미지 이동 모드로 자연스럽게 전환

      1배에 가까워지면 위치까지 완전히 초기화
    */
    const handleTouchEnd = (event: TouchEvent) => {
      const currentTransform =
        transformRef.current;

      const gesture = gestureRef.current;

      if (
        event.touches.length === 1 &&
        currentTransform.scale > 1.01
      ) {
        gesture.mode = 'pan';

        gesture.startTouchX =
          event.touches[0].clientX;

        gesture.startTouchY =
          event.touches[0].clientY;

        gesture.startX = currentTransform.x;
        gesture.startY = currentTransform.y;

        setIsInteracting(true);

        return;
      }

      gesture.mode = 'none';
      setIsInteracting(false);

      if (currentTransform.scale <= 1.03) {
        resetTransform();
        return;
      }

      /*
        손가락을 뗀 뒤 이미지 위치가 제한 범위를 벗어나면
        정상 범위 안으로 다시 보정
      */
      const clampedPosition =
        clampPosition(
          currentTransform.scale,
          currentTransform.x,
          currentTransform.y,
        );

      applyTransform({
        scale: currentTransform.scale,
        x: clampedPosition.x,
        y: clampedPosition.y,
      });
    };

    const handleTouchCancel = (
      event: TouchEvent,
    ) => {
      handleTouchEnd(event);
    };

    container.addEventListener(
      'touchstart',
      handleTouchStart,
      {
        passive: false,
      },
    );

    container.addEventListener(
      'touchmove',
      handleTouchMove,
      {
        passive: false,
      },
    );

    container.addEventListener(
      'touchend',
      handleTouchEnd,
      {
        passive: false,
      },
    );

    container.addEventListener(
      'touchcancel',
      handleTouchCancel,
      {
        passive: false,
      },
    );

    return () => {
      container.removeEventListener(
        'touchstart',
        handleTouchStart,
      );

      container.removeEventListener(
        'touchmove',
        handleTouchMove,
      );

      container.removeEventListener(
        'touchend',
        handleTouchEnd,
      );

      container.removeEventListener(
        'touchcancel',
        handleTouchCancel,
      );
    };
  }, []);

  /*
    화면 방향이나 브라우저 크기가 변경되면
    이미지의 확대 위치를 다시 정상 범위로 보정
  */
  useEffect(() => {
    const handleResize = () => {
      const currentTransform =
        transformRef.current;

      if (currentTransform.scale <= 1.03) {
        resetTransform();
        return;
      }

      const clampedPosition =
        clampPosition(
          currentTransform.scale,
          currentTransform.x,
          currentTransform.y,
        );

      applyTransform({
        scale: currentTransform.scale,
        x: clampedPosition.x,
        y: clampedPosition.y,
      });
    };

    window.addEventListener(
      'resize',
      handleResize,
    );

    return () => {
      window.removeEventListener(
        'resize',
        handleResize,
      );
    };
  }, []);

  return (
     <div
      ref={containerRef}
      className="relative w-full overflow-hidden bg-black"
      style={{
        /*
          기본 상태:
          이미지 위에서도 모달 세로 스크롤 허용

          확대 상태:
          브라우저 스크롤을 막고 이미지 이동만 허용
        */
        touchAction:
          transform.scale > 1.01
            ? 'none'
            : 'pan-y',

        /*
          contain을 사용하면 이미지 위에서
          부모 모달로 스크롤이 전달되지 않을 수 있음
        */
        overscrollBehavior: 'auto',
      }}
    >
    <img
      ref={imageRef}
      src={src}
      alt={alt}
      loading={loading}
      draggable={false}
      className="block h-auto w-full select-none object-cover will-change-transform pointer-events-none"
      style={{
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${transform.scale})`,
        transformOrigin: 'center center',
        transition: isInteracting
          ? 'none'
          : 'transform 180ms ease-out',
      }}
    />
  </div>
  );
};

/*
  ====================================================
  프로젝트 상세 모달
  ====================================================
*/
const ProjectDetailModal: React.FC<
  ProjectDetailModalProps
> = ({
  project,
  isOpen,
  onClose,
  onNavigate,
}) => {
  /*
    실제 화면에 표시할 프로젝트 데이터

    모달이 닫힐 때 바로 데이터를 비우지 않고
    닫힘 애니메이션이 끝난 후 제거하기 위해 별도 관리
  */
  const [
    displayProject,
    setDisplayProject,
  ] = useState<Project | null>(null);

  // 프로젝트 상세 모달의 스크롤 영역
  const scrollRef =
    useRef<HTMLDivElement>(null);

  /*
    모달 열림·닫힘 처리

    열릴 때:
    - 선택한 프로젝트 표시
    - 상세 화면 스크롤을 맨 위로 이동

    닫힐 때:
    - 700ms 애니메이션 후 프로젝트 데이터 제거
  */
  useEffect(() => {
    if (isOpen) {
      setDisplayProject(project);

      const timer = window.setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: 0,
          behavior: 'auto',
        });
      }, 10);

      return () => {
        window.clearTimeout(timer);
      };
    }

    const timer = window.setTimeout(() => {
      setDisplayProject(null);
    }, 700);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isOpen, project]);

  /*
    모바일 화면 여부

    768px 미만에서는 상단 프로젝트 목록 버튼 위치를
    모바일 화면에 맞게 변경
  */
  const [isMobile, setIsMobile] =
    useState(() => {
      if (typeof window === 'undefined') {
        return false;
      }

      return window.innerWidth < 768;
    });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(
        window.innerWidth < 768,
      );
    };

    window.addEventListener(
      'resize',
      handleResize,
    );

    return () => {
      window.removeEventListener(
        'resize',
        handleResize,
      );
    };
  }, []);

  return (
    <>
      {/* 닫기 버튼 — 모달 열릴 때만 표시, 스크롤해도 고정 */}
      {isOpen && (
        <button
          type="button"
          onClick={onClose}
          aria-label="프로젝트 상세 닫기"
          className="fixed top-8 z-[400] p-3 bg-[#28CC9E]/60 backdrop-blur-md border border-[#28CC9E]/10 hover:bg-[#28CC9E] text-white hover:text-black transition-all rounded-full group"
          style={{ left: isMobile ? 'auto' : 'calc(50% + 30vw + 16px)', 
            right: isMobile ? '16px' : 'auto',
            top: isMobile ? '16px' : '32px',
          }}
        >
          <X
            strokeWidth={1}
            className="w-[24px] h-[24px] transition-transform group-hover:scale-90"
          />
        </button>
      )}

      {/* 전체 프로젝트 목록으로 이동 */}
      {isOpen && (
        <button
          type="button"
          onClick={() => {
            onClose();

            window.setTimeout(() => {
              onNavigate('PROJECTS');
            }, 300);
          }}
          className="fixed flex items-center gap-3 z-[400] px-3 py-2 text-white hover:text-[#28CC9E] transition-all group"
          style={
            isMobile ? { top: '16px', left: '16px',} : { top: '56px', right: 'calc(50% + 32vw + 16px)',}
          }
        >
          <span className="text-[8px] lg:text-[14.5px] tracking-[0.12em] uppercase font-bold whitespace-nowrap">
            VIEW ALL PROJECTS
          </span>

          <ChevronRight
            size={16}
            className="shrink-0 transition-transform group-hover:-translate-x-1 rounded-full border border-white group-hover:border-[#28CC9E]"
          />
        </button>
      )}

      {/* 배경 오버레이 */}
      <div
        ref={scrollRef}
        className={`fixed inset-0 z-[300] bg-black/40 transition-opacity duration-700 flex items-start justify-center overflow-y-auto custom-scrollbar
          ${
          isOpen
            ? 'opacity-100'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      >
        {/* 콘텐츠 */}
        <div
          className={`w-full md:w-[60vw] md:my-40 transition-transform duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${
            isOpen
              ? 'translate-y-0'
              : 'translate-y-full'
          }`}
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          {displayProject && (
            <div className="flex flex-col w-full">
              {/* 설명 */}
              {displayProject.description && (
                <section className="w-full mb-20 px-6 py-12 sm:px-10 md:px-16 md:py-16 bg-[#080808] border-b border-white/10">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-[#28CC9E] font-mono text-[11px] md:text-[13px] tracking-[0.2em] font-bold uppercase">
                      {
                        displayProject.category
                      }
                    </span>

                    <span className="text-white/30">
                      |
                    </span>

                    <span className="text-white/50 font-mono text-[11px] md:text-[13px] tracking-[0.15em]">
                      {displayProject.year}
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-6">
                    {displayProject.title}
                  </h2>

                  <p className="max-w-3xl text-sm sm:text-base md:text-lg leading-relaxed text-white/60 font-light">
                    {
                      displayProject.description
                    }
                  </p>
                </section>
              )}

              {/* 동영상 */}
              {displayProject.videoUrl?.map(
                (url, idx) => (
                  <video
                    key={`${url}-${idx}`}
                    src={url}
                    muted
                    playsInline
                    controls
                    preload="metadata"
                    className="w-full h-auto mb-20"
                    onMouseEnter={() =>
                      document.documentElement.classList.add(
                        'video-hover',
                      )
                    }
                    onMouseLeave={() =>
                      document.documentElement.classList.remove(
                        'video-hover',
                      )
                    }
                  />
                ),
              )}

              {/*
                설명 이미지들

                이미지를 클릭해서 별도의 확대 화면을 열지 않습니다.

                모바일에서 이미지 위에 두 손가락을 올리고
                바로 벌리거나 모으면 해당 이미지 자체가 확대·축소됩니다.
              */}
              {displayProject.images?.map(
                (img, idx) => (
                  <PinchZoomImage
                    key={`${img}-${idx}`}
                    src={img}
                    alt={`${
                      displayProject.title
                    } 상세 이미지 ${
                      idx + 1
                    }`}
                    loading={
                      idx === 0
                        ? 'eager'
                        : 'lazy'
                    }
                  />
                ),
              )}
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

  아래 코드를 다시 사용할 경우 lucide-react import에
  다음 아이콘을 추가해야 합니다.

  ExternalLink
  Code2
  Palette


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