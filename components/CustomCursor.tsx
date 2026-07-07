import React, { useEffect, useRef, useState } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringLink, setIsHoveringLink] = useState(false);
  const [isPrecision, setIsPrecision] = useState(false);

  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      targetPos.current.x = e.clientX;
      targetPos.current.y = e.clientY;

      const target = e.target as HTMLElement;

      // 비디오 위에서는 커스텀 커서 숨기기
      const isVideo = target.tagName === 'VIDEO' || !!target.closest('video');
      if (isVideo) {
        setIsVisible(false);
        setIsHoveringLink(false);
        setIsPrecision(false);
        return;
      }

      setIsVisible(true);

      // Precision 타겟 체크 (페이지네이션 등 작은 클릭 영역)
      const precisionTarget = target.closest('[data-cursor-type="precision"]');
      const isPrecisionTarget = !!precisionTarget;
      setIsPrecision(isPrecisionTarget);

      // 일반 링크/버튼 호버 체크
      const isLink = !isPrecisionTarget && (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT' ||
        target.classList.contains('cursor-pointer') ||
        !!target.closest('button') ||
        !!target.closest('a') ||
        !!target.closest('.cursor-pointer')
      );

      setIsHoveringLink(isLink);
    };

    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove);
    document.body.addEventListener('mouseleave', onMouseLeave);
    document.body.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.body.removeEventListener('mouseleave', onMouseLeave);
      document.body.removeEventListener('mouseenter', onMouseEnter);
    };
  }, []);

  useEffect(() => {
    let rAf: number;

    const loop = () => {
      const ease = 0.15;
      currentPos.current.x += (targetPos.current.x - currentPos.current.x) * ease;
      currentPos.current.y += (targetPos.current.y - currentPos.current.y) * ease;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      rAf = requestAnimationFrame(loop);
    };

    loop();
    return () => cancelAnimationFrame(rAf);
  }, []);

  const scaleClass = isPrecision ? 'scale-[0.3]' : isHoveringLink ? 'scale-[2.5]' : 'scale-100';

  return (
    <div
      ref={cursorRef}
      className={`fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      style={{ willChange: 'transform' }}
    >
      <div
        className={`bg-white rounded-full transition-transform duration-300 ease-[cubic-bezier(0.19,1,0.22,1)] ${scaleClass}`}
        style={{ width: '32px', height: '32px' }}
      />
    </div>
  );
};

export default CustomCursor;