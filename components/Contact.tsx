import React from 'react';

const ContactContent: React.FC = () => {
  return (
    <div className="space-y-12">
      <div className="group cursor-pointer">
        <span className="text-white/40 text-[12px] uppercase mb-4 block">
          BUSINESS
        </span>
         <a
          href="mailto:yeeunkwakui@gmail.com"
          aria-label="yeeunkwakui@gmail.com으로 이메일 보내기"
          className="inline-block text-3xl md:text-6xl text-white group-hover:text-[#28CC9E] transition-colors tracking-tighter font-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#28CC9E] focus-visible:ring-offset-4 focus-visible:ring-offset-black"
        >
          yeeunkwakui@gmail.com
        </a>
      </div>
      
      <div className="flex flex-col md:flex-row gap-12 mt-20">
        <div className="group cursor-pointer">
          <span className="text-white/40 text-[12px] uppercase mb-4 block">
            Studio Location
          </span>
          <p className="text-xl text-white hover:text-[#28CC9E] transition-colors font-bold ">
            SEOUL
          </p>
        </div>
        
        <div className="group cursor-pointer">
          <span className="text-white/40 text-[12px] uppercase mb-4 block">
            Global Connectivity
          </span>
          <p className="text-xl text-white hover:text-[#28CC9E] font-bold">
            NATIVE KR / JP
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContactContent;