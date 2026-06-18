/* THE BIT LIFE — BIT-SRV block burst → code tunnel (from aggregator surf) */
(function(){
  const trigger = document.getElementById('bitsrv-trigger');
  const shell = document.getElementById('retro-block-shell');
  const stage = document.getElementById('surf-stage');
  const burst = document.getElementById('surf-burst');
  const wrap = document.getElementById('surf-canvas-wrap');
  const sub = document.getElementById('surfSub');
  const lavaAnchor = document.getElementById('lava-tunnel');
  if(!trigger || !stage) return;

  const lines = [
    'w3lc0me 2 da <b>8!T LYPH</b>',
    'welcome 2 da <b>Bit Lyfe</b>',
    'welkum 2 teh <b>BIT LYF3</b>',
    'riding da <b>bit lyf3</b> tube'
  ];
  let li = 0;
  if(sub){
    setInterval(()=>{
      li = (li + 1) % lines.length;
      sub.style.opacity = '0';
      setTimeout(()=>{ sub.innerHTML = lines[li]; sub.style.opacity = '1'; }, 180);
    }, 2400);
  }

  function runBurst(){
    if(!burst || burst.classList.contains('active')) return;
    burst.classList.add('active');
    burst.innerHTML = '';
    const colors = ['#00e5ff','#ff5cf0','#ffd400','#7CFC00','#0a8ea0'];
    for(let i = 0; i < 48; i++){
      const b = document.createElement('span');
      b.className = 'burst-block';
      b.textContent = ['▓','█','##','BLK','0xF1','sha'][i % 6];
      b.style.setProperty('--bx', (Math.random() * 160 - 80) + 'px');
      b.style.setProperty('--by', (-120 - Math.random() * 280) + 'px');
      b.style.setProperty('--br', (Math.random() * 360) + 'deg');
      b.style.setProperty('--bd', (.6 + Math.random() * .9) + 's');
      b.style.color = colors[i % colors.length];
      b.style.animationDelay = (Math.random() * .35) + 's';
      burst.appendChild(b);
    }
    trigger.classList.add('booting');
    if(shell) shell.style.cursor = 'default';
    if(lavaAnchor){
      lavaAnchor.scrollIntoView({ behavior:'smooth', block:'start' });
    }
    setTimeout(()=>{
      stage.classList.add('tunnel-live');
      initSurf();
      setTimeout(()=>{ burst.classList.remove('active'); burst.innerHTML = ''; }, 1200);
    }, 900);
  }

  function boot(e){
    if(e) e.preventDefault();
    runBurst();
  }

  trigger.addEventListener('click', e=>{ e.stopPropagation(); boot(e); });
  trigger.addEventListener('keydown', e=>{
    if(e.key === 'Enter' || e.key === ' ') boot(e);
  });
  if(shell){
    shell.addEventListener('click', e=>{
      if(stage.classList.contains('tunnel-live')) return;
      boot(e);
    });
  }

  function initSurf(){
    if(typeof THREE === 'undefined'){ return setTimeout(initSurf, 200); }
    if(!wrap || wrap.dataset.ready) return;
    wrap.dataset.ready = '1';

    const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
    let W = wrap.clientWidth || 400, H = wrap.clientHeight || 400;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(82, W / H, 0.1, 400);
    const renderer = new THREE.WebGLRenderer({ alpha:true, antialias:true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    wrap.appendChild(renderer.domElement);

    const tc = document.createElement('canvas');
    tc.width = 512; tc.height = 512;
    const tx = tc.getContext('2d');
    const glyphs = '01<>{}[]();=+*$#|xOP_DUP nonce sha256 0xF1 blk hash'.split(' ');
    function drawCode(){
      tx.fillStyle = '#02060a';
      tx.fillRect(0, 0, 512, 512);
      tx.font = '15px JetBrains Mono, monospace';
      tx.textBaseline = 'top';
      for(let y = 0; y < 512; y += 17){
        const wave = (y > 150 && y < 235) || (y > 360 && y < 410);
        for(let x = 0; x < 512; x += 13){
          const c = glyphs[(Math.random() * glyphs.length) | 0];
          if(wave) tx.fillStyle = 'hsl(' + (((x * 1.3 + y * 2) % 360)) + ',95%,62%)';
          else tx.fillStyle = 'rgba(0,229,255,' + (0.18 + Math.random() * 0.45).toFixed(2) + ')';
          tx.fillText(c, x, y);
        }
      }
    }
    drawCode();
    const tex = new THREE.CanvasTexture(tc);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(5, 5);
    const tube = new THREE.Mesh(
      new THREE.CylinderGeometry(7, 7, 200, 44, 1, true),
      new THREE.MeshBasicMaterial({ map:tex, side:THREE.BackSide, transparent:true })
    );
    tube.rotation.x = Math.PI / 2;
    scene.add(tube);

    const N = 420, pg = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for(let i = 0; i < N; i++){
      const a = Math.random() * Math.PI * 2, r = 2 + Math.random() * 5;
      pos[i * 3] = Math.cos(a) * r;
      pos[i * 3 + 1] = Math.sin(a) * r;
      pos[i * 3 + 2] = -Math.random() * 200;
      const c = new THREE.Color().setHSL(0.5 + 0.12 * Math.sin(i), 0.9, 0.62);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    scene.add(new THREE.Points(pg, new THREE.PointsMaterial({ size:0.17, vertexColors:true, transparent:true, opacity:.9 })));

    let t = 0;
    function loop(){
      t += 0.016;
      tex.offset.y -= 0.022;
      tube.rotation.y += 0.005;
      camera.rotation.z = Math.sin(t * 0.6) * 0.28;
      const p = pg.attributes.position.array;
      for(let i = 0; i < N; i++){ p[i * 3 + 2] += 0.5; if(p[i * 3 + 2] > 3) p[i * 3 + 2] = -200; }
      pg.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
      if(!reduce) requestAnimationFrame(loop);
    }
    loop();
    if(!reduce) setInterval(()=>{ drawCode(); tex.needsUpdate = true; }, 850);
    new ResizeObserver(()=>{
      W = wrap.clientWidth; H = wrap.clientHeight;
      if(W && H){ renderer.setSize(W, H); camera.aspect = W / H; camera.updateProjectionMatrix(); }
    }).observe(wrap);
  }
})();