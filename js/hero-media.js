/* THE BIT LIFE — hero YouTube rail + scroll-gated pause + mute */
(function(){
  const rail = document.getElementById('hero-video-rail');
  const viewport = document.getElementById('hero-video-viewport');
  const mount = document.getElementById('hero-yt-mount');
  const pauseBtn = document.getElementById('video-pause');
  const muteBtn = document.getElementById('video-mute');
  if(!rail || !viewport || !mount) return;

  const VID = 't3TGDX7yc8A';
  let player = null;
  let tourComplete = false;
  let userPaused = false;
  let muted = true;

  function scrollProgress(){
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    return Math.min(1, window.scrollY / max);
  }

  function updateRail(){
    const p = scrollProgress();
    const h = 200 + p * (window.innerHeight * 0.92);
    viewport.style.height = h + 'px';
    viewport.style.opacity = String(0.14 + p * 0.2);
    rail.style.setProperty('--reveal', String(p));

    if(p >= 0.985 && !tourComplete){
      tourComplete = true;
      if(pauseBtn){
        pauseBtn.disabled = false;
        pauseBtn.classList.add('unlocked');
        pauseBtn.title = 'Pause background video';
      }
    }
  }

  function loadYT(){
    if(window.YT && window.YT.Player){ initPlayer(); return; }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = initPlayer;
  }

  function initPlayer(){
    if(player) return;
    player = new YT.Player(mount, {
      videoId: VID,
      playerVars:{
        autoplay:1, controls:0, disablekb:1, fs:0, modestbranding:1,
        playsinline:1, rel:0, mute:1, loop:1, playlist:VID, iv_load_policy:3
      },
      events:{
        onReady(e){
          e.target.mute();
          e.target.setVolume(18);
          e.target.playVideo();
        },
        onStateChange(e){
          if(e.data === YT.PlayerState.PAUSED && (!tourComplete || !userPaused)){
            setTimeout(()=>{ if(player && (!tourComplete || !userPaused)) player.playVideo(); }, 80);
          }
        }
      }
    });
  }

  const ICON_MUTED = '<svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true"><rect x="4" y="12" width="6" height="8" fill="currentColor"/><path d="M12 11 L20 6 V26 L12 21 Z" fill="currentColor"/><path d="M23 12 L29 20 M29 12 L23 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"/></svg>';
  const ICON_SOUND = '<svg viewBox="0 0 32 32" width="24" height="24" aria-hidden="true"><rect x="4" y="12" width="6" height="8" fill="currentColor"/><path d="M12 11 L20 6 V26 L12 21 Z" fill="currentColor"/><rect x="23" y="13" width="3" height="6" fill="currentColor"/><rect x="27" y="10" width="3" height="12" fill="currentColor"/></svg>';

  function setMuteIcon(){
    if(!muteBtn) return;
    muteBtn.innerHTML = muted ? ICON_MUTED : ICON_SOUND;
    muteBtn.setAttribute('aria-label', muted ? 'Unmute background video' : 'Mute background video');
  }

  if(muteBtn){
    setMuteIcon();
    muteBtn.addEventListener('click', ()=>{
      if(!player) return;
      muted = !muted;
      if(muted) player.mute(); else { player.unMute(); player.setVolume(18); }
      setMuteIcon();
    });
  }

  if(pauseBtn){
    pauseBtn.addEventListener('click', ()=>{
      if(!player || !tourComplete) return;
      userPaused = !userPaused;
      if(userPaused){
        player.pauseVideo();
        pauseBtn.classList.add('paused');
        pauseBtn.innerHTML = '<svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true"><path d="M11 8 L24 16 L11 24 Z" fill="currentColor"/></svg>';
        pauseBtn.title = 'Resume background video';
      } else {
        player.playVideo();
        pauseBtn.classList.remove('paused');
        pauseBtn.innerHTML = '<svg viewBox="0 0 32 32" width="22" height="22" aria-hidden="true"><rect x="9" y="8" width="5" height="16" fill="currentColor"/><rect x="18" y="8" width="5" height="16" fill="currentColor"/></svg>';
        pauseBtn.title = 'Pause background video';
      }
    });
  }

  window.addEventListener('scroll', updateRail, {passive:true});
  window.addEventListener('resize', updateRail);
  updateRail();
  loadYT();
})();