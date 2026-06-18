/* THE BIT LIFE — live YouTube + X feeds on media tab */
(function () {
  const ytMount = document.getElementById('yt-latest-rail');
  const xMount = document.getElementById('x-feed-rail');
  if (!ytMount && !xMount) return;

  const CHANNELS = [
    { name: 'Natalie Brunell', id: 'UCru3nlhzHrbgK21x0MdB_eg', url: 'https://www.youtube.com/@nataliebrunell' },
    { name: 'What Bitcoin Did', id: 'UCzv873y61SOt_70zJStsPJg', url: 'https://www.youtube.com/@whatbitcoindid' },
    { name: 'BTC Sessions', id: 'UChzLnWVsl3puKQwc5PoO6Zg', url: 'https://www.youtube.com/@btcsessions' },
    { name: 'aantonop', id: 'UCJWCJCWOxBYSi5DhCieLOLQ', url: 'https://www.youtube.com/@aantonop' },
    { name: 'Stephan Livera', id: 'UCDqPIrJSzHyyJpmH6wnxVxA', url: 'https://www.youtube.com/@StephanLivera' },
    { name: 'Bitcoin Magazine', id: 'UCtOV5M-T3GcsJAq8QKaf0lg', url: 'https://www.youtube.com/@BitcoinMagazine' },
    { name: 'TFTC', id: 'UCtdbWsnfA08KhSUO4amVLaQ', url: 'https://www.youtube.com/@TFTC' },
    { name: 'Citadel Dispatch', id: 'UCoA72saVAuQ8hYCnBO0Lymw', url: 'https://www.youtube.com/@ODELL' },
    { name: 'Lyn Alden', id: 'UC26OTzxt9ixdrr3qdUJrYBQ', url: 'https://www.youtube.com/@LynAldenMedia' },
    { name: 'Jimmy Song', id: 'UCEFJVYNiPp8xeIUyfaPCPQw', url: 'https://www.youtube.com/c/OffChainwithJimmySong' },
  ];

  const X_OGS = [
    { name: 'Michael Saylor', handle: 'saylor', note: 'Strategy · corporate BTC treasury' },
    { name: 'Adam Back', handle: 'adam3us', note: 'Blockstream · Hashcash inventor' },
    { name: 'Matt Odell', handle: 'Matt_odell', note: 'Open-source · privacy · FOSS' },
    { name: 'Marty Bent', handle: 'MartyBent', note: 'TFTC · media & culture' },
    { name: 'Andreas Antonopoulos', handle: 'aantonop', note: 'Education · author' },
    { name: 'Saifedean Ammous', handle: 'saifedean', note: 'The Bitcoin Standard' },
    { name: 'Stephan Livera', handle: 'stephanlivera', note: 'Bitcoin-only podcast' },
    { name: 'Peter McCormack', handle: 'PeterMcCormack', note: 'What Bitcoin Did' },
    { name: 'Lyn Alden', handle: 'LynAldenContact', note: 'Macro · Broken Money' },
    { name: 'Robert Breedlove', handle: 'Breedlove22', note: 'What is Money' },
    { name: 'Jameson Lopp', handle: 'lopp', note: 'Casa · security OG' },
    { name: 'Nic Carter', handle: 'nic__carter', note: 'Castle Island · on-chain' },
    { name: 'Alex Gladstein', handle: 'gladstein', note: 'Human Rights Foundation' },
    { name: 'Jimmy Song', handle: 'jimmysong', note: 'Programming Bitcoin' },
    { name: 'ODELL', handle: 'ODELL', note: 'Citadel Dispatch' },
    { name: 'Natalie Brunell', handle: 'natbrunell', note: 'Coin Stories · author' },
    { name: 'Jack Mallers', handle: 'JackMallers', note: 'Strike · Lightning' },
    { name: 'Jeff Booth', handle: 'JeffBooth', note: 'The Price of Tomorrow' },
    { name: 'Francis Pouliot', handle: 'francispouliot', note: 'Bull Bitcoin · Canada' },
    { name: 'Pierre Rochard', handle: 'BitcoinPierre', note: 'Riot Platforms · economics' },
    { name: 'Eric Voskuil', handle: 'evokoulu', note: 'Bitter Vitter · libbitcoin' },
    { name: 'Pieter Wuille', handle: 'pwuille', note: 'Bitcoin Core · Taproot' },
  ];

  const rssBase = () => {
    const host = location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') return '/api/yt-rss';
    return '/api/yt-rss';
  };

  const YT_NS = 'http://www.youtube.com/xml/schemas/2015';
  const MEDIA_NS = 'http://search.yahoo.com/mrss/';

  function parseFeed(xml) {
    const doc = new DOMParser().parseFromString(xml, 'text/xml');
    if (doc.querySelector('parsererror')) return [];
    return [...doc.querySelectorAll('entry')].slice(0, 3).map((entry) => {
      const id = entry.getElementsByTagNameNS(YT_NS, 'videoId')[0]?.textContent
        || entry.querySelector('id')?.textContent?.split(':').pop()
        || '';
      const title = entry.querySelector('title')?.textContent?.trim() || 'Untitled';
      const thumb = entry.getElementsByTagNameNS(MEDIA_NS, 'thumbnail')[0]?.getAttribute('url')
        || `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
      const published = entry.querySelector('published')?.textContent || '';
      return { id, title, thumb, published, url: `https://www.youtube.com/watch?v=${id}` };
    });
  }

  function relTime(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'today';
    if (days === 1) return '1d ago';
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  }

  function esc(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function channelSkeleton(ch) {
    return `<div class="yt-col" data-channel="${ch.id}">
      <a class="yt-col-head" href="${ch.url}" target="_blank" rel="noopener">${esc(ch.name)}</a>
      <div class="yt-col-vids">
        ${[0, 1, 2].map(() => '<div class="yt-vid-skel"><span class="skel-thumb"></span><span class="skel-line"></span></div>').join('')}
      </div>
    </div>`;
  }

  function channelHtml(ch, videos) {
    const vids = videos.length
      ? videos.map((v) => `
        <a class="yt-vid" href="${v.url}" target="_blank" rel="noopener">
          <img src="${v.thumb}" alt="" loading="lazy" width="160" height="90">
          <span class="yt-vid-title">${esc(v.title)}</span>
          <span class="yt-vid-date">${relTime(v.published)}</span>
        </a>`).join('')
      : `<div class="yt-vid-empty">Feed unavailable — <a href="${ch.url}" target="_blank" rel="noopener">open channel</a></div>`;

    return `<div class="yt-col">
      <a class="yt-col-head" href="${ch.url}" target="_blank" rel="noopener">${esc(ch.name)}</a>
      <div class="yt-col-vids">${vids}</div>
    </div>`;
  }

  async function fetchChannel(ch) {
    try {
      const res = await fetch(`${rssBase()}?channel_id=${ch.id}`);
      if (!res.ok) throw new Error('feed error');
      return parseFeed(await res.text());
    } catch {
      return null;
    }
  }

  async function loadYouTube() {
    if (!ytMount) return;
    ytMount.innerHTML = CHANNELS.map(channelSkeleton).join('');

    const cols = [...ytMount.querySelectorAll('.yt-col')];
    await Promise.all(CHANNELS.map(async (ch, i) => {
      const videos = await fetchChannel(ch);
      if (cols[i]) cols[i].outerHTML = channelHtml(ch, videos || []);
    }));
  }

  function xPanel(og) {
    const src = `https://syndication.twitter.com/srv/timeline-profile/screen-name/${og.handle}?dnt=true&embedId=tw-${og.handle}&frame=false&hideBorder=true&hideFooter=false&hideHeader=false&hideScrollBar=false&lang=en&maxHeight=360&showHeader=true&showReplies=false&theme=dark&transparent=true&widgetsVersion=2615f7e52b7e0%3A1702314776716`;
    return `<div class="x-col">
      <a class="x-col-head" href="https://x.com/${og.handle}" target="_blank" rel="noopener">
        <span class="x-name">${esc(og.name)}</span>
        <span class="x-handle">@${esc(og.handle)}</span>
      </a>
      <div class="x-frame-wrap">
        <iframe title="${esc(og.name)} on X" src="${src}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>
      </div>
      <div class="x-note">${esc(og.note)}</div>
    </div>`;
  }

  function loadX() {
    if (!xMount) return;
    xMount.innerHTML = X_OGS.map(xPanel).join('');
  }

  loadYouTube();
  loadX();
})();