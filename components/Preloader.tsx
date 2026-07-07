import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PreloaderProps {
  onComplete: () => void;
}

const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const words = Array(12).fill("YEEUNUI");

  // 1. 카운트업 로직 (부드럽게 올라가도록 설정)
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 1;
        return Math.min(prev + increment, 100);
      });
    }, 40);
    return () => clearInterval(timer);
  }, []);

  // 2. 100% 도달 후 완료 처리
  useEffect(() => {
    if (progress === 100) {
      // 애니메이션 시퀀스를 감상할 수 있도록 약간의 딜레이 후 종료
      const timeout = setTimeout(() => onComplete(), 1200);
      return () => clearTimeout(timeout);
    }
  }, [progress, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ 
        opacity: 0,
        transition: { duration: 0.8, delay: 0.2 } 
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center" style={{ perspective: '1500px' }}>
        
        {/* 3D Rotating 텍스트 원기둥 */}
        <motion.div
          className="w-[400px] h-[400px] relative"
          style={{ transformStyle: 'preserve-3d' }}
          animate={progress < 100 
            ? { rotateY: 360,
                z: 0,
                opacity: 1
             } 
            : { 
                rotateY: 0, 
                z: 1000, // 유저 쪽으로 돌진
                scale: 2,
                opacity: 0 
              }
          }
          transition={progress < 100 
            ? { rotateY: { repeat: Infinity, ease: "linear", duration: 10 } }
            : { duration: 0.99, ease: [0.16, 1, 0.3, 1] }
          }
        >
          {words.map((word, i) => {
            const angle = (360 / words.length) * i;
            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(250px)`,
                  backfaceVisibility: 'hidden',
                }}
              >
                <span className={`text-2xl font-bold tracking-tighter transition-colors duration-500 ${
                  progress === 100 ? 'text-gray-800' : 'text-gray-500'
                }`}>
                  {word}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* 하단 프로그레스 영역 */}
        <div className="absolute bottom-20 flex flex-col items-center">
          {/* 프로그레스 바 라인 */}
          <div className="h-[1px] w-64 bg-white/10 overflow-hidden mb-6 relative">
            <motion.div 
              className="h-full bg-[#28CC9E] shadow-[0_0_10px_#28CC9E]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "circOut" }}
            />
          </div>
          
          {/* 퍼센트 숫자 */}
          <motion.span 
            className="text-7xl md:text-9xl font-black text-white tracking-tighter"
            animate={progress === 100 ? { y: -20, opacity: 0 } : { y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {progress}<span className="text-3xl ml-2 text-[#28CC9E]">%</span>
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};

export default Preloader;