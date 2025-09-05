(function(){
  const form   = document.getElementById('contactForm');
  const state  = document.getElementById('contactState');
  const nameEl = document.getElementById('c_name');
  const mailEl = document.getElementById('c_email');
  const msgEl  = document.getElementById('c_msg');
  if (!form) return;

  const ENDPOINT = 'https://formspree.io/f/mkgvopen';
  let hideTimer = null;

  // === 정규식 & 메시지 ===
  const tripleRepeatRe = /([A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ])\1\1/;
  const emailRe = /^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,24}$/;

  const MSG = {
    name: {
      valueMissing: '이름을 입력해주세요.',
      tooShort: '이름은 최소 2자 이상 입력해주세요.',
      tooLong:  '이름은 최대 20자까지 가능합니다.',
      patternMismatch: '이름은 한글 완성형/영문만 가능해요. 공백·하이픈·중점(·)만 허용됩니다.',
      tripleRepeat: '같은 문자를 3번 이상 반복할 수 없어요 (예: ㅋㅋㅋ, ㄱㄱㄱ).'
    },
    email: {
      valueMissing: '이메일을 입력해주세요.',
      patternMismatch: '올바른 이메일 형식(예: name@domain.com)으로 입력해주세요.'
    },
    message: {
      valueMissing: '문의 내용을 입력해주세요.',
      tooShort: '문의 내용은 최소 10자 이상 입력해주세요.'
    }
  };

  // === 에러 세팅 ===
  function setErr(el, id, text){
    const box = document.getElementById(id);
    if (box) box.textContent = text || '';
    el.classList.toggle('is-invalid', !!text);
  }

  function validateName(){
    const el = nameEl;
    el.setCustomValidity('');
    const v = el.validity;
    if (v.valueMissing) return setErr(el, 'nameErr', MSG.name.valueMissing);
    if (v.tooShort)     return setErr(el, 'nameErr', MSG.name.tooShort);
    if (v.tooLong)      return setErr(el, 'nameErr', MSG.name.tooLong);
    if (v.patternMismatch) return setErr(el, 'nameErr', MSG.name.patternMismatch);
    if (tripleRepeatRe.test(el.value)) return setErr(el, 'nameErr', MSG.name.tripleRepeat);
    setErr(el, 'nameErr', '');
  }

  function validateEmail(){
    const el = mailEl;
    const val = el.value.trim();
    el.setCustomValidity('');
    if (!val) return setErr(el, 'emailErr', MSG.email.valueMissing);

    const patternOk = el.checkValidity() && !el.validity.patternMismatch;
    const regexOk   = emailRe.test(val);
    if (!patternOk || !regexOk){
      el.setCustomValidity('invalid');
      return setErr(el, 'emailErr', MSG.email.patternMismatch);
    }
    setErr(el, 'emailErr', '');
  }

  function validateMsg(){
    const el = msgEl;
    el.setCustomValidity('');
    const trimmed = el.value.trim();
    if (!trimmed) return setErr(el, 'msgErr', MSG.message.valueMissing);
    if (trimmed.length < Math.max(el.minLength, 10))
      return setErr(el, 'msgErr', MSG.message.tooShort);
    setErr(el, 'msgErr', '');
  }

  // === 상태 메시지 헬퍼 ===
  function hideState(){
    if (hideTimer){ clearTimeout(hideTimer); hideTimer = null; }
    if (state){
      state.hidden = true;
      state.className = 'form-state';
      state.textContent = '';
    }
  }
  function showState(kind, text, autoMs=4000){
    if (!state) return;
    if (hideTimer){ clearTimeout(hideTimer); hideTimer = null; }
    state.className = 'form-state' + (kind ? ` ${kind}` : '');
    state.textContent = text || '';
    state.hidden = false;
    if (autoMs > 0){
      hideTimer = setTimeout(hideState, autoMs);
    }
  }

  // === 실시간 검증 ===
  nameEl.addEventListener('input', validateName);
  nameEl.addEventListener('blur',  validateName);
  mailEl.addEventListener('input', validateEmail);
  mailEl.addEventListener('blur',  validateEmail);
  msgEl.addEventListener('input',  validateMsg);
  msgEl.addEventListener('blur',   validateMsg);

  // 입력 시작하면 상태 메시지 숨김
  [nameEl, mailEl, msgEl].forEach(el=>{
    el?.addEventListener('input', hideState);
  });

  // === 제출 ===
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    validateName(); validateEmail(); validateMsg();
    if (document.querySelector('.is-invalid')) return;

    const btn  = form.querySelector('button[type="submit"]');
    const orig = btn.textContent;
    btn.disabled = true; btn.textContent = '보내는 중…';
    hideState();

    // FormData 준비 (Formspree용 name/email/message 키 보정)
    const fd = new FormData(form);
    if (!fd.has('name')    && nameEl) fd.set('name', nameEl.value.trim());
    if (!fd.has('email')   && mailEl) fd.set('email', mailEl.value.trim());
    if (!fd.has('message') && msgEl)  fd.set('message', msgEl.value.trim());

    try{
      const res = await fetch(ENDPOINT, {
        method:'POST',
        headers:{Accept:'application/json'},
        body: fd
      });

      if (res.ok){
        showState('is-success', '보내주셔서 감사합니다! 24시간 이내 회신드릴게요 🙏');
        form.reset();
        ['nameErr','emailErr','msgErr'].forEach(id=>{
          const box = document.getElementById(id); if (box) box.textContent = '';
        });
        [nameEl, mailEl, msgEl].forEach(el=> el?.classList.remove('is-invalid'));
      } else {
        let msg = '전송에 실패했습니다. 잠시 후 다시 시도해 주세요.';
        try{
          const data = await res.json();
          if (data?.errors?.length){
            msg = data.errors.map(e=>e.message).join(' / ');
          }
        }catch{}
        showState('is-error', msg, 6000);
      }
    } catch(err){
      showState('is-error', '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해 주세요.', 6000);
    } finally {
      btn.disabled = false; btn.textContent = orig;
    }
  });
})();
