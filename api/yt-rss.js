export default async function handler(req, res) {
  const channelId = req.query?.channel_id;
  if (!channelId || !/^UC[\w-]{22}$/.test(channelId)) {
    res.status(400).json({ error: 'Valid channel_id required' });
    return;
  }

  try {
    const upstream = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { headers: { 'User-Agent': 'thebit.life/1.0' } }
    );
    const xml = await upstream.text();
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.status(upstream.ok ? 200 : upstream.status).send(xml);
  } catch {
    res.status(502).json({ error: 'Feed fetch failed' });
  }
}