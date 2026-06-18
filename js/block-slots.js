/* THE BIT LIFE — sidebar HTML block slots + Iris intro flow */
(function () {
  const LEFT_COUNT = 6;
  const RIGHT_COUNT = 11;
  const BENTO_MSG = 'We discourage bento boxes here — we prefer blocks to show more quality effort.';
  const TW_TEXT = "human typing this, hello! Share your content, there's a github repo too or push to iris";
  const STORAGE_KEY = 'tbl_block_intro_seen';

  const leftMount = document.getElementById('block-slots-left');
  const rightMount = document.getElementById('block-slots-right');
  if (!leftMount || !rightMount) return;

  const overlay = document.getElementById('iris-intro-overlay');
  const continueBtn = document.getElementById('iris-intro-continue');
  const irisGo = document.getElementById('iris-intro-go');
  const anchor = document.getElementById('nav-iris-anchor');
  const twPanel = document.getElementById('block-typewriter');
  const twBody = document.getElementById('tw-body');
  const twCursor = document.getElementById('tw-cursor');
  const twGithub = document.getElementById('tw-github');
  const twMinHint = document.getElementById('tw-min-hint');

  let introSeen = sessionStorage.getItem(STORAGE_KEY) === '1';
  let flowActive = false;
  let twTimer = null;
  let twIndex = 0;
  let twSpeed = 42;
  let twDone = false;
  let twMinimized = false;
  let hoverCount = 0;

  function blockHtml(i, total) {
    const opacity = Math.max(0.32, 0.58 - i * (0.22 / Math.max(total - 1, 1)));
    return `<button type="button" class="html-block-slot" data-block="${i}" style="--slot-opacity:${opacity}">
      <span class="block-label" style="opacity:${opacity}">your html block here</span>
      <span class="block-hint" style="opacity:${opacity * 0.82}">you can add your content to this block — click to learn how</span>
    </button>`;
  }

  leftMount.innerHTML = Array.from({ length: LEFT_COUNT }, (_, i) => blockHtml(i, LEFT_COUNT)).join('');
  rightMount.innerHTML = Array.from({ length: RIGHT_COUNT }, (_, i) => blockHtml(i, RIGHT_COUNT)).join('');

  const allSlots = () => [...document.querySelectorAll('.html-block-slot')];

  function showBentoToast(slot) {
    slot.classList.add('is-toast');
    slot.querySelector('.block-label').textContent = BENTO_MSG;
    const hint = slot.querySelector('.block-hint');
    if (hint) hint.style.display = 'none';
  }

  function resetSlots() {
    allSlots().forEach((slot) => {
      slot.classList.remove('is-toast');
      const opacity = slot.style.getPropertyValue('--slot-opacity') || '0.5';
      const label = slot.querySelector('.block-label');
      const hint = slot.querySelector('.block-hint');
      if (label) {
        label.textContent = 'your html block here';
        label.style.opacity = opacity;
      }
      if (hint) {
        hint.style.display = '';
        hint.style.opacity = String(parseFloat(opacity) * 0.82);
      }
    });
  }

  function scrollToIris() {
    anchor?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openIntroFlow() {
    flowActive = true;
    document.body.classList.add('iris-flow-active');
    overlay?.classList.add('open');
    overlay?.setAttribute('aria-hidden', 'false');
  }

  function closeIntroFlow(markSeen) {
    flowActive = false;
    document.body.classList.remove('iris-flow-active');
    overlay?.classList.remove('open');
    overlay?.setAttribute('aria-hidden', 'true');
    resetSlots();
    if (markSeen) {
      introSeen = true;
      sessionStorage.setItem(STORAGE_KEY, '1');
    }
  }

  function onBlockClick(e) {
    const slot = e.currentTarget;
    if (flowActive || slot.classList.contains('is-toast')) return;

    showBentoToast(slot);
    flowActive = true;

    setTimeout(() => {
      scrollToIris();
      setTimeout(openIntroFlow, 650);
    }, 1300);
  }

  allSlots().forEach((slot) => slot.addEventListener('click', onBlockClick));
  continueBtn?.addEventListener('click', () => closeIntroFlow(true));
  irisGo?.addEventListener('click', () => closeIntroFlow(true));
  overlay?.querySelector('.iris-intro-veil')?.addEventListener('click', () => closeIntroFlow(true));

  function clearTypewriter() {
    if (twTimer) clearTimeout(twTimer);
    twTimer = null;
    twIndex = 0;
    twSpeed = 42;
    twDone = false;
    if (twBody) twBody.textContent = '';
    if (twCursor) twCursor.style.display = '';
    if (twGithub) twGithub.hidden = true;
    if (twMinHint) twMinHint.hidden = true;
  }

  function finishTypewriter() {
    twDone = true;
    if (twCursor) twCursor.style.display = 'none';
    if (twGithub) twGithub.hidden = false;
    if (twMinHint) twMinHint.hidden = false;
  }

  function typeNextChar() {
    if (!twBody || twIndex >= TW_TEXT.length) {
      finishTypewriter();
      return;
    }
    twBody.textContent += TW_TEXT[twIndex++];
    twTimer = setTimeout(typeNextChar, twSpeed);
  }

  function startTypewriter() {
    if (!introSeen || !twPanel) return;
    if (twMinimized) {
      twPanel.classList.add('visible');
      return;
    }
    clearTypewriter();
    twPanel.classList.add('visible');
    twPanel.classList.remove('minimized');
    typeNextChar();
  }

  function stopTypewriter() {
    if (twMinimized) return;
    twPanel?.classList.remove('visible');
    clearTypewriter();
  }

  allSlots().forEach((slot) => {
    slot.addEventListener('mouseenter', () => {
      if (!introSeen) return;
      hoverCount++;
      startTypewriter();
    });
    slot.addEventListener('mouseleave', () => {
      hoverCount = Math.max(0, hoverCount - 1);
      if (hoverCount === 0) stopTypewriter();
    });
  });

  let scrollBoostTimer = null;
  window.addEventListener('scroll', () => {
    if (!twPanel?.classList.contains('visible') || twMinimized || twDone) return;
    twSpeed = 6;
    clearTimeout(scrollBoostTimer);
    scrollBoostTimer = setTimeout(() => { twSpeed = 42; }, 500);
  }, { passive: true });

  twPanel?.addEventListener('click', () => {
    if (!twDone || !twPanel.classList.contains('visible')) return;
    twMinimized = true;
    twPanel.classList.add('minimized');
    if (twBody) twBody.textContent = '… human typing this, hello!';
    if (twGithub) twGithub.hidden = true;
    if (twMinHint) twMinHint.hidden = true;
    if (twCursor) twCursor.style.display = 'none';
    if (twTimer) clearTimeout(twTimer);
  });

  allSlots().forEach((slot) => {
    slot.addEventListener('mouseenter', () => {
      if (twMinimized && introSeen) {
        twMinimized = false;
        twPanel?.classList.remove('minimized');
        startTypewriter();
      }
    });
  });
})();