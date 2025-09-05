// ===== 메뉴 sticky 상태 감지 (붙으면 스타일 살짝 변경)
(function(){
  const heroBrand = document.querySelector('.hero-brand');
  const mainMenu  = document.querySelector('.menu-slot.in-hero .menu');
  const slot      = document.querySelector('.menu-slot.in-hero');
  const flyBrandWrap = document.querySelector('.fly-brand');
  const flyMenuWrap  = document.querySelector('.fly-menu');

  if (!heroBrand || !mainMenu || !slot || !flyBrandWrap || !flyMenuWrap) return;

  // 복제 (복제본은 숨김 룰에서 제외)
  if (flyBrandWrap.childElementCount === 0) {
    const cloned = heroBrand.cloneNode(true);
    cloned.classList.add('in-flybar');
    flyBrandWrap.appendChild(cloned);
  }
  if (flyMenuWrap.childElementCount === 0) {
    flyMenuWrap.appendChild(mainMenu.cloneNode(true));
  }

  // ▲▼ 스크롤: slot의 "아래쪽"이 화면 상단을 지나면 compact ON
  const onScroll = () => {
    const bottom = slot.getBoundingClientRect().bottom;
    const stuck  = bottom <= 12;                // 12px 여유 (필요시 조절)
    document.body.classList.toggle('compact', stuck);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

// ===== 탭 필터
(function(){
  const tabs = document.querySelectorAll('.tab');
  const cards = document.querySelectorAll('.card');
  function filter(cat){
    cards.forEach(c=>{
      const show = (cat==='all') || c.dataset.cat===cat;
      c.style.display = show ? '' : 'none';
    });
  }
  tabs.forEach(t=>{
    t.addEventListener('click',()=>{
      tabs.forEach(x=>x.classList.remove('is-active'));
      t.classList.add('is-active');
      filter(t.dataset.cat);
    });
  });
  filter('all');
})();

// ===== 카드 썸네일 세팅 (data-thumb -> .thumb 배경)
(function(){
  const cards = document.querySelectorAll('.card');

  cards.forEach(card=>{
    const thumbURL = card.dataset.thumb;
    const el = card.querySelector('.thumb');
    if (!el) return;

    if (thumbURL){
      // URL 안전 처리
      const safe = encodeURI(thumbURL);
      el.style.backgroundImage = `url("${safe}")`;
      el.style.backgroundRepeat = "no-repeat";

      // 깨질 때 폴백
      const test = new Image();
      test.onerror = ()=>{ el.style.background = "#eef1f5"; };
      test.src = safe;
    } else {
      el.style.background = "#eef1f5"; // 폴백 색
    }
  });
})();


// ===== 모달: 썸네일 주입 + 상세 렌더(확장자 자동 판별)
(function(){
  const cards = document.querySelectorAll('.card');
  const modal = document.getElementById('modal');
  const content = document.getElementById('modal-content');
  const closeBtn = document.getElementById('closeBtn');

  const parseList = (str='') => str.split(',').map(s=>s.trim()).filter(Boolean);
  const guessType = (src) => {
    const s = src.toLowerCase();
    if (s.endsWith('.mp4') || s.endsWith('.webm') || s.endsWith('.ogg')) return 'video';
    if (s.endsWith('.jpg') || s.endsWith('.jpeg') || s.endsWith('.png') || s.endsWith('.gif') || s.endsWith('.webp')) return 'image';
    if (s.startsWith('http') || s.includes('youtube.com') || s.includes('youtu.be') || s.includes('figma.com')) return 'iframe';
    return 'image';
  };

  function openModal(srcs){
    content.innerHTML = '';
    if (!srcs.length){
      const p = document.createElement('p');
      p.className = 'modal-warning';
      p.textContent = '컨텐츠가 준비되지 않았습니다.';
      content.appendChild(p);
    } else {
      srcs.forEach((src, i)=>{
        const t = guessType(src);
        if (t === 'image'){
          const img = new Image();
          img.src = src; img.alt = 'detail image'; img.loading = 'lazy';
          content.appendChild(img);
        } else if (t === 'video'){
          const video = document.createElement('video');
          video.src = src; video.controls = true; video.playsInline = true;
          // 자동재생 원하면 ↓
          // video.autoplay = true; video.muted = true;
          content.appendChild(video);
        } else if (t === 'iframe'){
          const iframe = document.createElement('iframe');
          iframe.src = src; iframe.width = '100%'; iframe.height = '480'; iframe.loading = 'lazy';
          iframe.style.border = '0'; iframe.allowFullscreen = true;
          content.appendChild(iframe);
        }
      });
    }
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('scroll_hidden');
    closeBtn.style.display = 'flex';

    requestAnimationFrame(() => {
      modal.scrollTop = 0;
      content.scrollTop = 0;
    });
  }

  function closeModal(){
    if (!modal) return;

  // 영상/오디오 재생 중지 + 초기화
  content.querySelectorAll('video').forEach(v => {
    try { v.pause(); v.currentTime = 0; } catch {}
  });
  content.querySelectorAll('audio').forEach(a => {
    try { a.pause(); a.currentTime = 0; } catch {}
  });

  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
  document.body.classList.remove('scroll_hidden');
  if (closeBtn) closeBtn.style.display = 'none';
  content.innerHTML = '';

  modal.scrollTop = 0;
  content.scrollTop = 0;


  }

  // 카드 클릭 → data-modal-src 콤마 리스트로 렌더
  cards.forEach(card=>{
    card.addEventListener('click', ()=>{
      const srcs = parseList(card.dataset.modalSrc || '');
      openModal(srcs);
    });
  });

  // 닫기 버튼 / 배경 클릭 / ESC
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e)=>{
    if (e.target === modal) closeModal();
  });
  window.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape') closeModal();
  });

  // 전역에서 쓸 수 있게(선택)
  window.closeModal = closeModal;
})();

// (function(){
//   document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//     anchor.addEventListener('click', function(e) {
//       e.preventDefault();
//       const target = document.querySelector(this.getAttribute('href'));
//       if (target) {
//         target.scrollIntoView({
//           behavior: 'smooth',
//           block: 'start'
//         });
//       }
//     });
//   });
// })();

(function(){
  const OFFSET_CLICK   = -80;   // 클릭 시 스크롤 오프셋
  const OFFSET_SPY_TOP = 120;   // 스크롤 감지 보정

  const menuLinks = document.querySelectorAll('.menu a');
  const sections  = document.querySelectorAll('section[id], main#home');

  // href 정규화: '#home'이랑 'index.html' 같은 취급
  function isHomeHref(href=''){
    const h = href.trim();
    return h === '#home' || h === 'index.html' || h === './' || h === '/' || h === '';
  }

  function setActive(targetHref){
    const targets = new Set([targetHref]);
    if (targetHref === '#home') {
      ['index.html','./','/',''].forEach(t => targets.add(t));
    }
    menuLinks.forEach(a => {
      const h = (a.getAttribute('href') || '').trim();
      a.classList.toggle('active', targets.has(h));
    });
  }

  function smoothScrollTo(el, yOffset){
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  }

  // 클릭: 스무스 스크롤 + 즉시 active + 해시 동기화
  menuLinks.forEach(link => {
    link.addEventListener('click', e => {
      const href = (link.getAttribute('href') || '').trim();

      // 같은 페이지 앵커
      if (href.startsWith('#')) {
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          setActive(href);
          smoothScrollTo(target, OFFSET_CLICK);
          history.replaceState(null, '', href);
        }
        return;
      }

      // 홈( index.html / ./ / / )을 앵커처럼 처리
      if (isHomeHref(href)) {
        e.preventDefault();
        setActive('#home');
        smoothScrollTo(document.querySelector('main#home') || document.body, OFFSET_CLICK);
        history.replaceState(null, '', '#home');
      }
    });
  });

  // 스크롤 스파이
  function onScroll(){
    const y = window.scrollY + 100; // 헤더 보정

    // 스크롤이 거의 바닥이면 마지막 섹션을 강제로 선택
    const nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

    // DOM 순으로 섹션 정렬
    const ordered = [...sections].sort((a,b)=> a.offsetTop - b.offsetTop);

    let currentId = 'home';
    for (const sec of ordered){
      if (y >= sec.offsetTop) currentId = sec.getAttribute('id') || 'home';
      else break;
    }

    if (nearBottom) {
      // 가장 아래 섹션으로 고정 (보통 contact)
      const last = ordered[ordered.length - 1];
      currentId = last?.getAttribute('id') || currentId;
    }

    setActive(`#${currentId}`);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
  // 초기 로드/뒤로가기 해시 반영
  (function init(){
    const hash = location.hash && location.hash !== '#'
      ? location.hash
      : '#home';
    setActive(isHomeHref(hash) ? '#home' : hash);
    onScroll();
  })();
})();

let currentSlide = 0;
const totalSlides = 3;
let autoSlideInterval;
let isAutoPlaying = true;

const slideList = document.getElementById('slideList');
// const indicators = document.querySelectorAll('.indicator');
// const progressBar = document.querySelector('.progress-bar');
// const sideSlider = document.getElementById('sideSlider');

function updateSlide() {
const translateX = -(currentSlide * (100 / totalSlides));
slideList.style.transform = `translateX(${translateX}%)`;

// 인디케이터 업데이트
// indicators.forEach((indicator, index) => {
//   indicator.classList.toggle('active', index === currentSlide);
//   });
}

function changeSlide(direction) {
  currentSlide += direction;

  if (currentSlide >= totalSlides) {
    currentSlide = 0;
  } else if (currentSlide < 0) {
    currentSlide = totalSlides - 1;
  }

  updateSlide();
  resetAutoSlide();
}

function goToSlide(slideIndex) {
  currentSlide = slideIndex;
  updateSlide();
  resetAutoSlide();
}

function startAutoSlide() {
if (isAutoPlaying) {
  autoSlideInterval = setInterval(() => {
      changeSlide(1);
  }, 2000);
}
}

function stopAutoSlide() {
  clearInterval(autoSlideInterval);
}

function resetAutoSlide() {
  stopAutoSlide();
  startAutoSlide();
}
// 터치 이벤트
let startX = 0;
let endX = 0;

sideSlider.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
});

sideSlider.addEventListener('touchend', (e) => {
endX = e.changedTouches[0].clientX;
const difference = startX - endX;

  if (Math.abs(difference) > 30) {
    if (difference > 0) {
        changeSlide(1);
    } else {
        changeSlide(-1);
    }
  }

});
// 초기화
document.addEventListener('DOMContentLoaded', () => {
  updateSlide();
  startAutoSlide();
});

// ================================
// Reveal: IntersectionObserver
// ================================
(function(){
  const els = document.querySelectorAll('.reveal-item');

  // 접근성: 모션 줄임 선호면 즉시 노출
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    els.forEach(el => el.classList.add('is-in'));
    return;
  }

  // 히어로/최상단은 초기 진입 시 바로 노출되도록
  document.querySelectorAll('[data-anim="hero"], [data-anim="blob"]').forEach(el=>{
    el.classList.add('is-in');
  });

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -10% 0px'
  });

  els.forEach(el => {
    // 이미 붙여준 건 스킵
    if (!el.classList.contains('is-in')) io.observe(el);
  });
})();

// ===== 섹션 도착 시 아래→위 리빌
(function(){
  const groups = document.querySelectorAll('.reveal-up');
  if (!groups.length) return;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      const box = entry.target;
      if (!entry.isIntersecting) return;

      // 스태거 계산
      const kids = [...box.children];
      const base = parseFloat(getComputedStyle(box).getPropertyValue('--stagger')) || 0.08;
      kids.forEach((el, i)=>{
        el.style.setProperty('--_delay', `${i * base}s`);
      });

      box.classList.add('is-in');
      io.unobserve(box); // 한 번만
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });

  groups.forEach(g=>io.observe(g));
})();

(function(){
  // 1) hero가 보이면 .hero-copy 슬라이드-인
  const heroWrap = document.querySelector('.hero-wrap.reveal-item[data-anim="hero"]');
  const heroCopy = document.querySelector('.hero-copy');
  const heroH1   = document.querySelector('.hero-copy h1');

  if (!heroWrap || !heroCopy || !heroH1) return;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting){
        // hero reveal 이 이미 진행 중이라면 살짝 지연(블롭 애니 끝난 뒤 보여주고 싶을 때)
        const delay = 350; // ms, 필요하면 0~700 사이로 조절
        setTimeout(()=>{
          heroCopy.classList.add('is-in');
          startTyping(heroH1);  // 타자 효과 시작(한 번만)
        }, delay);

        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  io.observe(heroWrap);

  // 2) 타자치는 효과 (줄바꿈 유지, 한 번만 실행)
  function startTyping(h1){
    if (h1.dataset.typed === '1') return;
    h1.dataset.typed = '1';

    // 원래 텍스트/줄바꿈 저장
    const original = h1.innerHTML
      .replace(/<br\s*\/?>/gi, '\n')   // <br> → 개행
      .replace(/\s+$/,'');             // 끝 공백 정리

    h1.innerHTML = ''; // 비우고 타이핑 시작
    const span = document.createElement('span');
    span.className = 'typing';
    h1.appendChild(span);

    // 속도 조절 (숫자 낮출수록 빨라짐)
    const speed = 28;      // ms per char
    const pausePerLine = 120; // 줄바꿈 후 약간의 멈춤

    let i = 0;
    (function type(){
      if (i > original.length){
        // 끝나면 커서 멈추고 테두리 제거하고 싶으면 아래 두 줄:
        // span.style.borderRightColor = 'transparent';
        // span.style.animation = 'none';
        return;
      }
      const sliced = original.slice(0, i)
        .replace(/\n/g, '<br>'); // 다시 <br>로 복원

      span.innerHTML = sliced;

      const ch = original.charAt(i);
      const wait = (ch === '\n') ? pausePerLine : speed;

      i++;
      setTimeout(type, wait);
    })();
  }
})();