chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'SAVE_TWEET') {
    const payload = request.payload;

    fetch(`https://api.vxtwitter.com/i/status/${payload.id}`)
      .then(response => {
        if (!response.ok) throw new Error(`API Hatası: ${response.status}`);
        return response.json();
      })
      .then(data => {
        if (data && data.text) {
          payload.tweetText = data.text;
        }
        if (data && data.media_extended && data.media_extended.length > 0) {
          const videoMedia = data.media_extended.find(m => m.type === 'video' || m.type === 'gif');
          if (videoMedia && videoMedia.url) {
            payload.mediaType = 'video';
            payload.mediaUrls = [videoMedia.url];
            // Sitenin beklediği poster (kapak) bilgisini API'den alıyoruz
            payload.posterUrl = videoMedia.thumbnail_url || payload.posterUrl;
          }
        }
        enqueueSave(payload);
      })
      .catch(error => {
        console.warn("A Planı başarısız, B Planı (Fallback) kaydediliyor. Sebep:", error.message);
        enqueueSave(payload);
      });
  } else if (request.type === 'UPDATE_TWEET') {
    const updatePayload = request.payload;
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
        chrome.storage.local.set({ twitter_updates: updates });
      }
    });
  } else if (request.type === 'GET_APP_DATA') {
    // Sitenizden bir API ucu olmadığı için, geçici olarak sadece eklentide birikmiş veriyi döner.
    // İleriki aşamalarda Native Messaging veya Fetch ile asıl DB'den de veri okunabilir.
    chrome.storage.local.get(['twitter_bookmarks', 'twitter_updates'], (result) => {
      sendResponse({ status: 'ok' });
    });
    return true; // Asynchronous callback için
  }
});
let isSaving = false;
let saveQueue = [];

function enqueueSave(newBookmark) {
  saveQueue.push(newBookmark);
  processSaveQueue();
}

function processSaveQueue() {
  if (isSaving || saveQueue.length === 0) return;
  isSaving = true;

  chrome.storage.local.get(['twitter_bookmarks'], (result) => {
    let bookmarks = result.twitter_bookmarks || [];
    const itemToSave = saveQueue.shift();

    if (!bookmarks.find(b => b.id === itemToSave.id)) {
      bookmarks.push(itemToSave);
      chrome.storage.local.set({ twitter_bookmarks: bookmarks }, () => {
        isSaving = false;
        processSaveQueue();
      });
    } else {
      isSaving = false;
      processSaveQueue();
    }
  });
}