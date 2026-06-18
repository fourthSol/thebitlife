/* ============================================================
   THE BIT LIFE — Shared JavaScript
   Theme toggle · Nav press · Site wall · Scroll reveal
   ============================================================ */

/* ---------- THEME ---------- */
(function initTheme(){
  const saved = localStorage.getItem('tbl-theme');
  if(saved){
    document.documentElement.setAttribute('data-theme', saved);
  }
  // Auto-switch to light after 5s if user hasn't manually set it
  if(!saved){
    setTimeout(()=>{
      if(!localStorage.getItem('tbl-theme-touched')){
        setTheme('light');
      }
    }, 5000);
  }
})();

function setTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('tbl-theme', t);
  localStorage.setItem('tbl-theme-touched', '1');
  const track = document.getElementById('toggle-track');
  if(track){ t === 'light' ? track.classList.add('on') : track.classList.remove('on'); }
  document.querySelectorAll('.icon-sun').forEach(el => el.style.opacity = t === 'light' ? '1' : '.35');
  document.querySelectorAll('.icon-moon').forEach(el => el.style.opacity = t === 'dark' ? '1' : '.35');
}

function initThemeToggle(){
  const track = document.getElementById('toggle-track');
  if(!track) return;
  const cur = document.documentElement.getAttribute('data-theme') || 'dark';
  if(cur === 'light') track.classList.add('on');
  track.addEventListener('click', ()=>{
    const now = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(now === 'dark' ? 'light' : 'dark');
  });
}

/* ---------- NAV PRESS EFFECT ---------- */
function initNavPress(){
  document.querySelectorAll('.nav-pill').forEach(pill => {
    pill.addEventListener('click', function(e){
      const href = this.getAttribute('href');
      if(!href || href === '#' || href.startsWith('javascript')) return;
      e.preventDefault();
      this.classList.add('pressing');
      setTimeout(()=>{
        this.classList.remove('pressing');
        window.location.href = href;
      }, 200);
    });
  });
  // Mark active page
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-pill').forEach(p => {
    const href = p.getAttribute('href') || '';
    if(href === path || (path === '' && href === 'index.html')){
      p.classList.add('active-page');
    }
  });
}

/* ---------- SITE WALL (Bitcoiner chips) ---------- */
const SITES=[
  {n:'sovereign.io',u:'https://sovereign.io'},{n:'River',u:'https://river.com'},{n:'Strike',u:'https://strike.me'},
  {n:'Swan Bitcoin',u:'https://swanbitcoin.com'},{n:'Cash App',u:'https://cash.app'},{n:'Fold',u:'https://foldapp.com'},
  {n:'Bitrefill',u:'https://bitrefill.com'},{n:'Relai',u:'https://relai.app'},{n:'Pocket BTC',u:'https://pocketbitcoin.com'},
  {n:'Unchained',u:'https://unchained.com'},{n:'Casa',u:'https://casa.io'},{n:'Nunchuk',u:'https://nunchuk.io'},
  {n:'Sparrow',u:'https://sparrowwallet.com'},{n:'BlueWallet',u:'https://bluewallet.io'},{n:'Phoenix',u:'https://phoenix.acinq.co'},
  {n:'Breez',u:'https://breez.technology'},{n:'Zeus LN',u:'https://zeusln.com'},{n:'Alby',u:'https://getalby.com'},
  {n:'Electrum',u:'https://electrum.org'},{n:'Wasabi',u:'https://wasabiwallet.io'},{n:'mempool.space',u:'https://mempool.space'},
  {n:'Blockstream',u:'https://blockstream.com'},{n:'Voltage',u:'https://voltage.cloud'},{n:'Amboss',u:'https://amboss.space'},
  {n:'Lightning Labs',u:'https://lightning.engineering'},{n:'ACINQ',u:'https://acinq.co'},{n:'Spiral BTC',u:'https://spiral.xyz'},
  {n:'Umbrel',u:'https://umbrel.com'},{n:'Start9',u:'https://start9.com'},{n:'MyNode',u:'https://mynodebtc.com'},
  {n:'RaspiBlitz',u:'https://raspiblitz.dev'},{n:'Coldcard',u:'https://coldcard.com'},{n:'Trezor',u:'https://trezor.io'},
  {n:'BitBox02',u:'https://bitbox.swiss'},{n:'Foundation',u:'https://foundationdevices.com'},{n:'SeedSigner',u:'https://seedsigner.com'},
  {n:'Keystone',u:'https://keyst.one'},{n:'Jade',u:'https://blockstream.com/jade'},{n:'SoloSatoshi',u:'https://solosatoshi.com'},
  {n:'Public Pool',u:'https://public-pool.io'},{n:'NerdMiner',u:'https://nerdminer.org'},{n:'Braiins',u:'https://braiins.com'},
  {n:'FutureBit',u:'https://futurebit.io'},{n:'256 Foundation',u:'https://256foundation.org'},{n:'bitcoin.org',u:'https://bitcoin.org'},
  {n:'Bitcoin Magazine',u:'https://bitcoinmagazine.com'},{n:'TFTC',u:'https://tftc.io'},{n:'Stacker News',u:'https://stacker.news'},
  {n:'Primal',u:'https://primal.net'},{n:'Damus',u:'https://damus.io'},{n:'Snort',u:'https://snort.social'},
  {n:'Lopp.net',u:'https://lopp.net'},{n:'Saifedean',u:'https://saifedean.com'},{n:'OpenSats',u:'https://opensats.org'},
  {n:'Brink',u:'https://brink.dev'},{n:'HRF',u:'https://hrf.org'},{n:'Clark Moody',u:'https://bitcoin.clarkmoody.com'},
  {n:'Iris.to',u:'https://iris.to'},{n:'Nostr.com',u:'https://nostr.com'},{n:'Primal.net',u:'https://primal.net'},
];

function buildSiteWall(wallId){
  const wall = document.getElementById(wallId || 'sitewall');
  if(!wall) return;
  wall.innerHTML = '';
  const ROWS = 6, data = Array.from({length:ROWS}, ()=>[]);
  SITES.forEach((s,i) => data[i%ROWS].push(s));
  const rows = [];
  data.forEach((list, ri)=>{
    const row = document.createElement('div');
    row.className = 'siterow';
    const cells = list.map(s=>`<a class="chip" href="${s.u}" target="_blank" rel="noopener"><span class="cd"></span><b>${s.n}</b></a>`).join('');
    row.innerHTML = cells + cells;
    wall.appendChild(row);
    rows.push({el:row, dir:ri%2===0?-1:1, base:1.4+(ri%4)*0.4, off:0, half:0});
  });
  function measure(){ rows.forEach(r=>{ r.half = r.el.scrollWidth/2; if(r.dir>0 && r.off===0) r.off=-r.half; }); }
  measure();
  window.addEventListener('resize', ()=>setTimeout(measure,80));
  const mouse = {x:0, y:0, active:false};
  wall.addEventListener('mousemove', e=>{ mouse.x=e.clientX; mouse.y=e.clientY; mouse.active=true; });
  wall.addEventListener('mouseleave', ()=>{ mouse.active=false; wall.querySelectorAll('.chip.hot').forEach(c=>c.classList.remove('hot')); });
  const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
  let hot = [];
  (function frame(){
    let nearest=null, nd=1e9;
    rows.forEach(r=>{
      let slow=1;
      if(mouse.active){
        const rect=r.el.getBoundingClientRect(), cy=rect.top+rect.height/2, dy=Math.abs(mouse.y-cy);
        slow = 1-0.84*Math.max(0,1-dy/64);
        if(dy<nd){ nd=dy; nearest=r; }
      }
      if(!reduce){
        r.off += r.base*r.dir*slow;
        if(r.dir<0 && r.off<=-r.half) r.off+=r.half;
        if(r.dir>0 && r.off>=0) r.off-=r.half;
        r.el.style.transform = 'translateX('+r.off+'px)';
      }
    });
    hot.forEach(c=>c.classList.remove('hot')); hot=[];
    if(mouse.active && nearest && nd<56){
      nearest.el.querySelectorAll('.chip').forEach(c=>{
        const rc=c.getBoundingClientRect();
        if(Math.hypot(rc.left+rc.width/2-mouse.x, rc.top+rc.height/2-mouse.y)<88){ c.classList.add('hot'); hot.push(c); }
      });
    }
    requestAnimationFrame(frame);
  })();
}

/* ---------- SCROLL REVEAL ---------- */
function initReveal(){
  const io = new IntersectionObserver(es=>{
    es.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:.1});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
}

/* ---------- INIT ON DOM READY ---------- */
document.addEventListener('DOMContentLoaded', ()=>{
  initThemeToggle();
  initNavPress();
  buildSiteWall('sitewall');
  initReveal();
});
