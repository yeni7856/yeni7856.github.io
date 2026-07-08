import React from 'react';

interface PaginationProps {
  total: number;
  current: number;
  onChange: (index: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ total, current, onChange }) => {
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-end gap-0.2 sm:gap-1.5 pointer-events-auto mix-blend-difference">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          data-cursor-type="precision"
          className="group relative flex flex-col items-center justify-end py-2 sm:py-3 md:py-4 w-6 sm:w-8 md:w-10 outline-none"
        >
          <span 
            className={`absolute -top-1 sm:-top-1.5 md:-top-2 text-[8px] sm:text-[9px] md:text-[10px] font-mono font-bold tracking-widest text-white transition-all duration-300 ${
              i === current ? 'opacity-100 -translate-y-2' : 'opacity-0 group-hover:opacity-100 group-hover:-translate-y-2'
            }`}
          >
            {String(i + 1).padStart(2, '0')}
          </span>

          <div 
            className={`transition-all duration-500 ease-out rounded-full ${
              i === current 
                ? 'w-[2px] sm:w-[2.5px] md:w-[3px] h-6 sm:h-8 md:h-10 bg-[#28CC9E]' 
                : 'w-[1px] sm:w-[1.2px] md:w-[1.5px] h-2 sm:h-2.5 md:h-3 bg-white/20 group-hover:h-5 sm:group-hover:h-6 md:group-hover:h-8 group-hover:bg-white/50'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default Pagination;