function isPlayableVideoUrl(url) {
  if (!url || typeof url !== 'string' || url.startsWith('blob:')) return false;
  return /(\.m3u8|\.mp4|\.webm|\.ogg|video\.twimg\.com|v\.redd\.it|\/ext_tw_video\/)/i.test(url);
}

function parseMediaUrls(value) {
  if (Array.isArray(value)) return value.map(v => String(v || '').trim()).filter(Boolean);
  if (typeof value === 'string') return value.split(',').map(v => String(v || '').trim()).filter(Boolean);
  return [];
}

function extractTweetIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/status\/(\d+)/);
  return match && match[1] ? match[1] : null;
}

function scoreVideoUrl(url) {
  const val = String(url || '').toLowerCase();
  let score = 0;

  // 1. Format Önceliği (MP4 her zaman ilk tercihimiz)
  if (/\.mp4(\?|$)/i.test(val)) score += 10000000;
  else if (/\.m3u8(\?|$)/i.test(val)) score += 5000000;
  else if (/\.(webm|ogg)(\?|$)/i.test(val)) score += 4000000;

  // 2. Çözünürlük Analizi (URL içindeki örn: /720x1280/ değerini yakalayıp alanı hesaplar)
  const resMatch = val.match(/\/(\d+)x(\d+)\//);
  if (resMatch) {
    const width = parseInt(resMatch[1], 10);
    const height = parseInt(resMatch[2], 10);
    // Piksel sayısını puana ekle (Örn: 1080x1920 = 2.073.600 puan ekler)
    score += (width * height);
  }

  // 3. Orijinal Twitter CDN Önceliği
  if (/video\.twimg\.com/i.test(val)) score += 10000;
  if (/\/amplify_video\/|\/ext_tw_video\//i.test(val)) score += 5000;

  return score;
}

// 1. ÇÖZÜM: Twitter Syndication Token Algoritması
function getSyndicationToken(tweetId) {
  return ((Number(tweetId) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '').slice(0, 8);
}

async function enrichTwitterVideoPayload(payload) {
  try {
    const tweetId = String(payload.id || extractTweetIdFromUrl(payload.url) || '').trim();
    if (!tweetId) return payload;

    const candidateUrls = [];
    const pushCandidate = (url) => {
      const clean = String(url || '').trim();
      if (isPlayableVideoUrl(clean)) candidateUrls.push(clean);
    };

    const collectVariants = (variants) => {
      if (!Array.isArray(variants)) return;
      variants.forEach(v => {
        if (!v || typeof v !== 'object') return;
        pushCandidate(v.url);
      });
    };

    // ADIM 1: Token destekli Orijinal Syndication API
    try {
      const token = getSyndicationToken(tweetId);
      const endpoint = `https://cdn.syndication.twimg.com/tweet-result?id=${encodeURIComponent(tweetId)}&lang=en&token=${token}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(endpoint, { signal: controller.signal, cache: 'no-store' });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          if (data.video && typeof data.video === 'object') {
            pushCandidate(data.video.url);
            collectVariants(data.video.variants);
            if (!payload.posterUrl && typeof data.video.poster === 'string') payload.posterUrl = data.video.poster;
          }

          if (Array.isArray(data.mediaDetails)) {
            data.mediaDetails.forEach(m => {
              if (!m || typeof m !== 'object') return;
              pushCandidate(m.url);
              if (m.video_info && typeof m.video_info === 'object') {
                collectVariants(m.video_info.variants);
              }
              if (!payload.posterUrl && typeof m.media_url_https === 'string') payload.posterUrl = m.media_url_https;
            });
          }
        }
      }
    } catch (e) {
      console.warn("Syndication Fetch Hatası:", e);
    }

    // Seçenekleri toparla ve kalıcı .mp4 dosyalarını öne al
    const existingMedia = parseMediaUrls(payload.mediaUrls);
    const merged = [...new Set([...candidateUrls, ...existingMedia])];

    const playable = merged.filter(isPlayableVideoUrl).sort((a, b) => scoreVideoUrl(b) - scoreVideoUrl(a));

    if (playable.length > 0) {
      payload.mediaType = 'video';
      payload.mediaUrls = [...new Set([...playable, ...merged])];
    } else if (payload.mediaType === 'video') {
      payload.mediaUrls = merged;
    }

  } catch (e) {
    console.error("Payload zenginleştirme hatası:", e);
  }
  return payload;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (!request || !request.type || !request.payload) return;

  if (request.type === 'SAVE_TWEET') {
    const payload = request.payload;
    if (!payload.id || !payload.url) {
      sendResponse({ status: 'error', message: 'Missing id or url' });
      return;
    }

    if (payload.url && payload.url.includes('reddit.com')) {
      enqueueSave(payload);
      sendResponse({ status: 'ok' });
      return;
    }

    enrichTwitterVideoPayload(payload)
      .then((enriched) => {
        enqueueSave(enriched || payload);
      })
      .catch(() => {
        enqueueSave(payload);
      });

    // Tweet kaydetme işlemi asenkron zenginleştirme içerse de, kullanıcıya hemen "ekleme alındı" diyebiliriz
    sendResponse({ status: 'queued' });

  } else if (request.type === 'UPDATE_TWEET') {
    const updatePayload = request.payload;
    if (!updatePayload.tweetId) {
      sendResponse({ status: 'error', message: 'Missing tweetId' });
      return;
    }

    // Reply immediately; perform storage update in background to avoid async message-channel closures.
    sendResponse({ status: 'queued' });
    chrome.storage.local.get(['twitter_bookmarks', 'twitter_updates'], (result) => {
      let bookmarks = result.twitter_bookmarks || [];
      let exists = false;
      for (let b of bookmarks) {
        if (b.id === updatePayload.tweetId) {
          b.folder = updatePayload.folder;
          b.tags = updatePayload.tags;
          b.note = updatePayload.note;
          exists = true;
        }
      }
      if (exists) {
        chrome.storage.local.set({ twitter_bookmarks: bookmarks });
      } else {
        let updates = result.twitter_updates || [];
        updates.push(updatePayload);
        if (updates.length > 500) updates = updates.slice(updates.length - 500);
        chrome.storage.local.set({ twitter_updates: updates });
      }
    });
  } else if (request.type === 'GET_APP_DATA') {
    sendResponse({ status: 'ok' });
  }
});

let isSaving = false;
let saveQueue = [];

function enqueueSave(newBookmark) {
  saveQueue.push(newBookmark);
  if (saveQueue.length > 500) saveQueue = saveQueue.slice(saveQueue.length - 500);
  processSaveQueue();
}

function processSaveQueue() {
  if (isSaving || saveQueue.length === 0) return;
  isSaving = true;

  chrome.storage.local.get(['twitter_bookmarks'], (result) => {
    let bookmarks = result.twitter_bookmarks || [];
    let modified = false;

    while (saveQueue.length > 0) {
      const itemToSave = saveQueue.shift();
      if (!bookmarks.find(b => b.id === itemToSave.id)) {
        bookmarks.push(itemToSave);
        modified = true;
      }
    }

    if (modified) {
      if (bookmarks.length > 500) bookmarks = bookmarks.slice(bookmarks.length - 500);
      chrome.storage.local.set({ twitter_bookmarks: bookmarks }, () => {
        isSaving = false;
      });
    } else {
      isSaving = false;
    }
  });
}


