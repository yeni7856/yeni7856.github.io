import React, { useRef, useState } from 'react';
import { Award, BadgeCheck, Calendar, Globe, Languages, MapPin, Terminal, Zap } from 'lucide-react';

const TEAL = 'var(--point-color)';
const CORAL = 'var(--accent-cyan)';
const DARK_TEAL = 'var(--secondary-color)';

interface Skill {
  name: string;
  value: number;
  color: string;
}

interface HoveredSkill extends Skill {
  x: number;
  y: number;
}

interface Career {
  date: string;
  role: string;
  company: string;
  color: string;
  desc: string;
}

const skills: Skill[] = [
  { name: 'UI/UX', value: 95, color: TEAL },
  { name: 'FIGMA', value: 92, color: CORAL },
  { name: 'HTML/CSS', value: 88, color: TEAL },
  { name: 'PS / AI', value: 86, color: CORAL },
  { name: 'GAME UI', value: 80, color: TEAL },
  { name: 'UNITY UI', value: 72, color: CORAL },
];

const careers: Career[] = [
  {
    date: '2025.10 - PRESENT',
    role: 'UI/UX Designer & Publisher',
    company: '어빌리티시스템즈',
    color: TEAL,
    desc: '반응형 웹·앱 UI/UX 디자인과 퍼블리싱을 담당하며, 내부 시스템과 외부 고객 시스템 및 제안서 그래픽 디자인을 수행하고 있습니다.',
  },
  {
    date: '2024.06 - 2024.11',
    role: 'UI/UX Designer · Freelance',
    company: '포스코 DX',
    color: CORAL,
    desc: '공통 디자인 시스템을 기반으로 포스코 내부 SCM 시스템과 고객 채널 시스템의 화면 구조 및 UI를 설계했습니다.',
  },
  {
    date: '2021.11 - 2023.12',
    role: 'UI/UX Designer & Publisher',
    company: '에이콘컴퍼니',
    color: TEAL,
    desc: '신규 SI 웹·앱 구축, 반응형 제안 시안, 관리자 페이지와 대시보드, 기존 서비스 유지보수 및 고도화 작업을 수행했습니다.',
  },
  {
    date: '2020.05 - 2021.04',
    role: 'UI Designer',
    company: '로지올',
    color: CORAL,
    desc: '배달대행 시스템과 제휴사업용 폐쇄몰의 화면 구조 및 UI 디자인을 담당했습니다.',
  },
];

const AboutContent: React.FC = () => {
  const [hoveredSkill, setHoveredSkill] = useState<HoveredSkill | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // 레이더 차트 마우스 위치 계산
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const screenCTM = svg.getScreenCTM();

    if (!screenCTM) return;

    const point = svg.createSVGPoint();
    point.x = e.clientX;
    point.y = e.clientY;

    const cursor = point.matrixTransform(screenCTM.inverse());
    const dx = cursor.x - 100;
    const dy = cursor.y - 100;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 110) {
      setHoveredSkill(null);
      return;
    }

    let angle = Math.atan2(dy, dx) + Math.PI / 2;

    if (angle < 0) {
      angle += Math.PI * 2;
    }

    const index = Math.round(angle / (Math.PI / 3)) % skills.length;
    const skill = skills[index];
    const skillAngle = (Math.PI / 3) * index - Math.PI / 2;
    const radius = (skill.value / 100) * 80;
    const x = 100 + radius * Math.cos(skillAngle);
    const y = 100 + radius * Math.sin(skillAngle);

    setHoveredSkill({ ...skill, x, y });
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-7xl min-w-0 mx-auto pb-20 overflow-x-hidden animate-in fade-in duration-700">
      {/* 상단 프로필 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-w-0">
        {/* 메인 프로필 카드 */}
        <div className="lg:col-span-7 min-w-0 bg-white/[0.03] border border-white/10 p-5 sm:p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group hover:bg-white/[0.05] transition-all duration-500">
          {/* 배경 장식 아이콘 */}
          <div className="absolute top-0 right-0 p-4 sm:p-8 text-white opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
            <Terminal className="w-[110px] h-[110px] sm:w-[140px] sm:h-[140px]" strokeWidth={1} />
          </div>

          <div className="relative z-10 min-w-0">
            {/* 터미널 심볼 */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-black border flex items-center justify-center mb-8 sm:mb-10 group-hover:shadow-[0_0_20px_rgba(40,204,158,0.2)] transition-shadow" style={{ borderColor: TEAL }}>
              <span className="font-mono text-xl sm:text-2xl animate-pulse" style={{ color: TEAL }}>
                _
              </span>
            </div>

            {/* 이름 */}
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-4 leading-none uppercase break-words">
              Yeeun Kwak
            </h3>

            {/* 직무 */}
            <p className="font-mono text-[10px] sm:text-[12px] md:text-[13px] tracking-[0.06em] sm:tracking-[0.15em] leading-relaxed uppercase mb-8 md:mb-12 break-words" style={{ color: TEAL }}>
              UI/UX Designer · Publisher · Game UI
            </p>

            {/* 자기소개 */}
            <div className="max-w-[38em] space-y-6 sm:space-y-7 text-white/70 text-sm md:text-base leading-relaxed font-light break-words">
              <p>
                안녕하세요. 디자인과 기술을 함께 고민하는 UI/UX 곽예은입니다.
                <br />
                반응형 웹·앱과 내부 시스템 UI를 설계하고, HTML/CSS 퍼블리싱까지 직접 수행해왔습니다.
                기획 의도를 실제로 구현할 수 있는 화면 구조로 구체화하는 데 강점이 있습니다.
              </p>

              <p>
                현재는 기존 웹·앱 실무 경험을 기반으로 Unity 게임 UI와 XR 인터랙션까지 영역을 확장하며,
                UI를 단순한 시각 요소가 아닌 시스템과 사용자를 연결하는 구조로 설계하고 있습니다.
              </p>

              <p className="text-white/40 text-xs md:text-sm leading-relaxed break-words">
                Hi, I&apos;m Yeeun Kwak, a UI/UX designer who bridges visual design and implementation.
                I design responsive web, app, enterprise and game interfaces with a focus on clear structure,
                practical implementation and immersive interaction.
              </p>
            </div>
          </div>
        </div>

        {/* 우측 요약 카드 */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-6 min-w-0">
          {/* 경력 */}
          <div className="min-h-[150px] sm:min-h-[180px] min-w-0 bg-white/[0.03] border border-white/10 p-3 sm:p-6 flex flex-col items-center justify-center text-center group hover:border-[#FF6B6B]/40 transition-all">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-1">
              5<span style={{ color: CORAL }}>+</span>
            </span>

            <span className="text-white/50 text-[8px] sm:text-[9px] tracking-[0.12em] sm:tracking-[0.3em] leading-relaxed font-mono uppercase break-words">
              Years Career
            </span>
          </div>

          {/* 위치 */}
          <div className="min-h-[150px] sm:min-h-[180px] min-w-0 bg-white/[0.03] border border-white/10 p-3 sm:p-6 flex flex-col justify-between group hover:bg-[#28CC9E]/5 transition-all">
            <div className="flex justify-between items-start">
              <MapPin size={18} className="shrink-0" style={{ color: TEAL }} />

              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse shrink-0"
                style={{ backgroundColor: TEAL, boxShadow: `0 0 8px ${TEAL}` }}
              />
            </div>

            <div className="min-w-0">
              <h4 className="text-white text-[15px] sm:text-[18px] md:text-[20px] font-bold mb-1 uppercase tracking-tighter leading-tight break-words">
                Based In
              </h4>

              <p className="text-white/50 text-[8px] sm:text-[11px] md:text-[13px] font-mono uppercase tracking-[0.02em] sm:tracking-widest leading-relaxed break-words">
                Seoul, South Korea
              </p>
            </div>
          </div>

          {/* Language & Certification */}
          <div
            className="col-span-2 sm:col-span-1 min-h-[180px] min-w-0 border p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden group transition-all hover:bg-[#196B69]/20"
            style={{ backgroundColor: 'color-mix(in srgb, var(--secondary-color) 10%, transparent)',
              borderColor: 'color-mix(in srgb, var(--secondary-color) 30%, transparent)', }}
          >
            <div className="flex items-start justify-between gap-2 min-w-0">
              <Award size={18} className="shrink-0" style={{ color: TEAL }} />

              <span className="text-[7px] sm:text-[8px] font-mono tracking-[0.1em] sm:tracking-[0.2em] text-white/25 uppercase break-words text-right">
                Verified
              </span>
            </div>

            <div className="relative z-10 space-y-5 mt-8 min-w-0">
              {/* Language */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-3 min-w-0">
                  <Languages size={14} className="shrink-0" style={{ color: TEAL }} />

                  <span className="text-[8px] tracking-[0.18em] sm:tracking-[0.3em] uppercase font-bold break-words" style={{ color: TEAL }}>
                    Language
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-white font-black text-[15px] md:text-[16px] leading-none">
                    JLPT N2
                  </p>

                  <p className="text-white/55 text-[10px] md:text-[11px] mt-1 leading-relaxed break-words">
                    2026.01 · 일본어능력시험
                  </p>

                  <p className="text-white/30 font-mono text-[7px] sm:text-[8px] tracking-[0.04em] sm:tracking-[0.12em] uppercase mt-1 leading-relaxed break-words [overflow-wrap:anywhere]">
                    Japanese Language Proficiency Test
                  </p>
                </div>
              </div>

              {/* Certification */}
              <div className="pt-4 border-t border-white/10 min-w-0">
                <div className="flex items-center gap-2 mb-3 min-w-0">
                  <BadgeCheck size={14} className="shrink-0" style={{ color: CORAL }} />

                  <span className="text-[8px] tracking-[0.14em] sm:tracking-[0.3em] uppercase font-bold break-words" style={{ color: CORAL }}>
                    Certification
                  </span>
                </div>

                <div className="min-w-0">
                  <p className="text-white font-black text-[13px] sm:text-[15px] md:text-[16px] leading-snug break-words [overflow-wrap:anywhere]">
                    멀티미디어콘텐츠제작전문가
                  </p>

                  <p className="text-white/55 text-[9px] sm:text-[10px] md:text-[11px] mt-1 leading-relaxed break-words">
                    2024.11 · 한국산업인력공단
                  </p>

                  <p className="text-white/30 font-mono text-[7px] sm:text-[8px] tracking-[0.05em] sm:tracking-[0.12em] uppercase mt-1 leading-relaxed break-words">
                    National Certificate
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Core Stack */}
          <div className="col-span-2 sm:col-span-1 min-h-[180px] min-w-0 bg-white/[0.03] border border-white/10 p-4 sm:p-6 flex flex-col justify-between group hover:border-white/20 transition-all">
            <div className="flex items-center gap-2 text-white/40 mb-4 min-w-0">
              <Zap size={16} className="shrink-0" style={{ color: CORAL }} />

              <span className="text-[8px] sm:text-[9px] tracking-[0.14em] sm:tracking-[0.28em] font-bold uppercase text-white/70 break-words">
                Core Stack
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 min-w-0">
              {['Figma', 'HTML/CSS', 'Unity UI', 'React'].map((tech, index) => (
                <div
                  key={tech}
                  className="min-w-0 py-2 sm:py-2.5 px-1 border text-[9px] sm:text-[11px] md:text-[12px] text-center uppercase font-bold tracking-[0.02em] sm:tracking-[0.08em] leading-tight bg-white/[0.02] hover:bg-white/[0.05] transition-all break-words"
                  style={{
                    borderColor: index % 2 === 0 ? `${TEAL}55` : `${CORAL}55`,
                    color: index % 2 === 0 ? TEAL : CORAL,
                  }}
                >
                  {tech}
                </div>
              ))}
            </div>

            <p className="mt-4 text-white/30 text-[7px] sm:text-[9px] font-mono tracking-[0.04em] sm:tracking-[0.16em] uppercase leading-relaxed break-words">
              UI Design · Publishing · Implementation
            </p>
          </div>
        </div>
      </div>

      {/* 하단 스킬 및 경력 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 min-w-0">
        {/* 스킬 매트릭스 */}
        <div className="lg:col-span-6 min-w-0 bg-white/[0.03] border border-white/10 p-5 sm:p-8 md:p-12 relative flex flex-col items-center group overflow-hidden sm:overflow-visible transition-all hover:bg-white/[0.04]">
          <div className="w-full flex justify-between items-center mb-8 sm:mb-12 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <Globe size={18} className="shrink-0" style={{ color: CORAL }} />

              <span className="text-[8px] sm:text-[10px] tracking-[0.12em] sm:tracking-[0.4em] leading-relaxed font-bold uppercase text-white/40 break-words">
                Design & Implementation
              </span>
            </div>
          </div>

          {/* 모바일에서 화면 크기에 맞게 축소 */}
          <div className="relative w-full max-w-[260px] sm:max-w-[320px] aspect-square cursor-crosshair">
            <svg
              ref={svgRef}
              viewBox="-12 -12 224 224"
              className="w-full h-full overflow-visible"
              onMouseMove={handleSvgMouseMove}
              onMouseLeave={() => setHoveredSkill(null)}
            >
              {/* 레이더 배경 그리드 */}
              {[0.2, 0.4, 0.6, 0.8, 1].map((radiusRate, index) => {
                const points = Array.from({ length: skills.length })
                  .map((_, skillIndex) => {
                    const angle = (Math.PI / 3) * skillIndex - Math.PI / 2;

                    return `${100 + 80 * radiusRate * Math.cos(angle)},${100 + 80 * radiusRate * Math.sin(angle)}`;
                  })
                  .join(' ');

                return (
                  <polygon
                    key={index}
                    points={points}
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeOpacity={0.02 + index * 0.01}
                  />
                );
              })}

              {/* 레이더 그래프 컬러 */}
              <defs>
                <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor={TEAL} />
                  <stop offset="100%" stopColor={CORAL} />
                </linearGradient>

                <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={TEAL} stopOpacity="0.2" />
                  <stop offset="100%" stopColor={CORAL} stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* 중앙 배경 빛 */}
              <circle cx="100" cy="100" r="80" fill="url(#radarGlow)" className="animate-pulse" />

              {/* 스킬 데이터 영역 */}
              <polygon
                points={skills
                  .map((skill, index) => {
                    const angle = (Math.PI / 3) * index - Math.PI / 2;
                    const radius = (skill.value / 100) * 80;

                    return `${100 + radius * Math.cos(angle)},${100 + radius * Math.sin(angle)}`;
                  })
                  .join(' ')}
                fill="url(#radarGrad)"
                fillOpacity="0.15"
                stroke="url(#radarGrad)"
                strokeWidth="1.5"
                className="transition-all duration-700 group-hover:fill-opacity-30"
              />

              {/* 스킬 데이터 포인트 */}
              {skills.map((skill, index) => {
                const angle = (Math.PI / 3) * index - Math.PI / 2;
                const radius = (skill.value / 100) * 80;
                const cx = 100 + radius * Math.cos(angle);
                const cy = 100 + radius * Math.sin(angle);
                const isHovered = hoveredSkill?.name === skill.name;

                return (
                  <g key={skill.name} className="pointer-events-none">
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 4 : 2.5}
                      fill={skill.color}
                      className="transition-all duration-300"
                    />

                    {isHovered && (
                      <line
                        x1="100"
                        y1="100"
                        x2={cx}
                        y2={cy}
                        stroke="white"
                        strokeOpacity="0.3"
                        strokeWidth="0.5"
                        strokeDasharray="3 2"
                      />
                    )}
                  </g>
                );
              })}

              {/* 스킬 툴팁 */}
              {hoveredSkill && (
                <g
                  transform={`translate(${Math.min(hoveredSkill.x + 10, 110)}, ${Math.max(hoveredSkill.y - 45, 5)})`}
                  className="pointer-events-none"
                >
                  <rect width="84" height="42" fill="black" stroke="white" strokeOpacity="0.15" rx="2" />

                  <text x="10" y="18" fill="white" fontSize="7" fontWeight="900" className="font-mono uppercase tracking-widest">
                    {hoveredSkill.name}
                  </text>

                  <text x="10" y="30" fill={hoveredSkill.color} fontSize="7" fontWeight="bold" className="font-mono uppercase">
                    LEVEL: {hoveredSkill.value}
                  </text>

                  <line x1="10" y1="22" x2="74" y2="22" stroke="white" strokeOpacity="0.1" strokeWidth="0.5" />
                </g>
              )}

              {/* 스킬 이름 */}
              {skills.map((skill, index) => {
                const angle = (Math.PI / 3) * index - Math.PI / 2;
                const labelX = 100 + 96 * Math.cos(angle);
                const labelY = 100 + 96 * Math.sin(angle);

                return (
                  <text
                    key={skill.name}
                    x={labelX}
                    y={labelY}
                    fill="white"
                    fillOpacity="0.2"
                    fontSize="6.5"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-mono font-black group-hover:fill-opacity-60 transition-opacity pointer-events-none"
                  >
                    {skill.name}
                  </text>
                );
              })}
            </svg>
          </div>

          <p className="mt-8 sm:mt-10 text-[8px] sm:text-[10px] text-white/20 font-mono tracking-[0.06em] sm:tracking-[0.18em] leading-relaxed text-center uppercase break-words">
            Based on practical experience and current focus
          </p>
        </div>

        {/* 경력 타임라인 */}
        <div className="lg:col-span-6 min-w-0 bg-white/[0.03] border border-white/10 p-5 sm:p-8 md:p-12 group hover:border-white/20 transition-all hover:bg-white/[0.04]">
          <div className="flex items-center gap-3 mb-10 sm:mb-14 min-w-0">
            <Calendar size={18} className="shrink-0" style={{ color: CORAL }} />

            <span className="text-[9px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.4em] font-bold uppercase text-white/40 break-words">
              Work Journey
            </span>
          </div>

          <div className="space-y-10 sm:space-y-12 relative">
            {/* 타임라인 세로선 */}
            <div className="absolute left-[5px] top-2 bottom-2 w-[1.5px] bg-white/5" />

            {careers.map((item) => (
              <div key={`${item.company}-${item.date}`} className="pl-8 sm:pl-12 relative group/item min-w-0">
                {/* 타임라인 포인트 */}
                <div
                  className="absolute left-0 top-[6px] w-[11px] h-[11px] rounded-full bg-black border-2 transition-transform duration-300 group-hover/item:scale-125"
                  style={{ borderColor: item.color }}
                />

                {/* 기간 */}
                <span
                  className="font-mono text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.1em] sm:tracking-[0.2em] mb-2 block transition-colors opacity-50 group-hover/item:opacity-100 break-words"
                  style={{ color: item.color }}
                >
                  {item.date}
                </span>

                {/* 직책 */}
                <h4 className="text-lg sm:text-xl md:text-2xl font-black text-white mb-1 uppercase tracking-tighter leading-tight break-words">
                  {item.role}
                </h4>

                {/* 회사 */}
                <p className="text-white/30 text-[9px] md:text-[10px] tracking-[0.1em] sm:tracking-[0.3em] md:tracking-[0.5em] leading-relaxed font-bold mb-4 uppercase break-words">
                  @ {item.company}
                </p>

                {/* 업무 설명 */}
                <p className="text-white/50 text-xs font-light leading-relaxed max-w-md group-hover/item:text-white/70 transition-colors break-words">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutContent;