/* THE BIT LIFE — sidebar HTML block slots + Iris intro flow */
(function () {
  const LEFT_COUNT = 8;
  const RIGHT_COUNT = 12;
  const BENTO_MSG = 'We discourage bento boxes here — we prefer blocks to show more quality effort.';
  const TW_TEXT = "human typing this, hello! Share your content, there's a github repo too or push to iris";
  const STORAGE_KEY = 'tbl_block_intro_seen';
  const IRIS_URL = 'https://git.iris.to/#/npub1e0atv85zpjtuk5h890y5vjyqvnjjv4p0xgfncch398k45d9c75gqtutnha/thebit.life';
  const GITHUB_URL = 'https://github.com/fourthSol/thebitlife';
  const GITHUB_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>';

  const SLOT_LABELS = ['// Your block', '// Open slot', '// Add content', '// HTML slot'];
  const HERO_LINES = [
    'your HTML<br>living standard<br>below here',
    'your code<br>goes here',
    'any markup<br>you want',
    'push HTML · CSS · JS<br>on this side',
  ];
  const HINTS = [
    'Add any content you want — click Iris or GitHub to contribute.',
    'This site is open source. Drop your block in via PR or Iris push.',
    'Replace this placeholder with your own HTML living standard.',
    'Anyone can contribute — sovereign git on Nostr or GitHub PRs.',
  ];

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
    const label = SLOT_LABELS[i % SLOT_LABELS.length];
    const hero = HERO_LINES[i % HERO_LINES.length];
    const hint = HINTS[i % HINTS.length];
    return `<div class="html-block-slot widget reveal" data-block="${i}" tabindex="0" role="button" aria-label="Open HTML block slot — click to learn how to contribute">
      <div class="widget-header"><span class="widget-label">${label}</span></div>
      <p class="block-slot-hero">${hero}</p>
      <span class="block-hint">${hint}</span>
      <div class="block-slot-links">
        <a href="${IRIS_URL}" target="_blank" rel="noopener" class="block-slot-link block-slot-iris" data-block-link="iris">
          ⚡ git.iris.to/thebit.life →
        </a>
        <a href="${GITHUB_URL}" target="_blank" rel="noopener" class="block-slot-link block-slot-github" data-block-link="github">
          ${GITHUB_SVG}
          github.com/fourthSol/thebitlife · PRs →
        </a>
      </div>
    </div>`;
  }

  leftMount.innerHTML = Array.from({ length: LEFT_COUNT }, (_, i) => blockHtml(i, LEFT_COUNT)).join('');
  rightMount.innerHTML = Array.from({ length: RIGHT_COUNT }, (_, i) => blockHtml(i, RIGHT_COUNT)).join('');

  const allSlots = () => [...document.querySelectorAll('.html-block-slot')];

  function showBentoToast(slot) {
    slot.classList.add('is-toast');
    const hero = slot.querySelector('.block-slot-hero');
    if (hero) hero.innerHTML = BENTO_MSG;
  }

  function resetSlots() {
    allSlots().forEach((slot, i) => {
      slot.classList.remove('is-toast');
      const hero = slot.querySelector('.block-slot-hero');
      const hint = slot.querySelector('.block-hint');
      if (hero) hero.innerHTML = HERO_LINES[i % HERO_LINES.length];
      if (hint) {
        hint.style.display = '';
        hint.textContent = HINTS[i % HINTS.length];
      }
      const links = slot.querySelector('.block-slot-links');
      if (links) links.style.display = '';
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
    if (e.target.closest('[data-block-link]')) return;
    const slot = e.currentTarget;
    if (flowActive || slot.classList.contains('is-toast')) return;

    showBentoToast(slot);
    flowActive = true;

    setTimeout(() => {
      scrollToIris();
      setTimeout(openIntroFlow, 650);
    }, 1300);
  }

  function onBlockKeydown(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    onBlockClick(e);
  }

  allSlots().forEach((slot) => {
    slot.addEventListener('click', onBlockClick);
    slot.addEventListener('keydown', onBlockKeydown);
    slot.querySelectorAll('[data-block-link]').forEach((link) => {
      link.addEventListener('click', (ev) => ev.stopPropagation());
    });
  });

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