function syncToWebLocalStorage() {
  chrome.storage.local.get(['twitter_bookmarks'], (result) => {
    if (result.twitter_bookmarks && result.twitter_bookmarks.length > 0) {
      try {
        const extensionData = result.twitter_bookmarks;
        let newBookmarks = [];

        extensionData.forEach(extItem => {
          const formattedBookmark = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            tweetId: extItem.id,
            url: extItem.url,
            folder: extItem.folder || 'Gelen Kutusu',
            tags: extItem.tags || [],
            description: extItem.note || '',
            date: new Date(extItem.savedAt).toLocaleDateString('tr-TR'),

            authorName: extItem.authorName || '',
            authorHandle: extItem.authorHandle || '',
            profileImg: extItem.authorPic || '',
            tweetText: extItem.tweetText || '',
            mediaUrls: Array.isArray(extItem.mediaUrls) ? extItem.mediaUrls.join(',') : extItem.mediaUrls,
            mediaType: extItem.mediaType || 'image',
            posterUrl: extItem.posterUrl || ''
          };
          newBookmarks.push(formattedBookmark);
        });

        if (newBookmarks.length > 0) {
          // Kuyruğa ekliyoruz (app.jsx IndexedDB'ye alacak)
          const pending = JSON.parse(localStorage.getItem('pending_twitter_sync') || '[]');
          localStorage.setItem('pending_twitter_sync', JSON.stringify([...pending, ...newBookmarks]));

          chrome.storage.local.set({ twitter_bookmarks: [] }, () => {
            // Sitede (React) yakalanması için event fırlat (Sayfa yenilemeyi kaldırıyoruz)
            window.dispatchEvent(new CustomEvent('twitter-bookmarks-synced'));
          });
        }
      } catch (error) {
        console.error("Sync Hatası:", error);
      }
    }
  });
}

function syncUpdatesToWebLocalStorage() {
  chrome.storage.local.get(['twitter_updates'], (result) => {
    if (result.twitter_updates && result.twitter_updates.length > 0) {
      try {
        const pendingUpdates = JSON.parse(localStorage.getItem('pending_twitter_updates') || '[]');
        localStorage.setItem('pending_twitter_updates', JSON.stringify([...pendingUpdates, ...result.twitter_updates]));

        chrome.storage.local.set({ twitter_updates: [] }, () => {
          window.dispatchEvent(new CustomEvent('twitter-bookmarks-synced'));
        });
      } catch (e) { }
    }
  });
}

function feedAppTagsToExtension() {
  // Sitenin kendi cache'indeki Dexie verisi veya localStorage içinden tag listesi oku:
  try {
    const customFolders = JSON.parse(localStorage.getItem('tweetFolders_v2') || '[]');
    const customTags = JSON.parse(localStorage.getItem('tweetTags_v1') || '[]');

    // Bu verileri Content Scriptin (X com üzerindeki) de görebilmesi için
    // ortak chrome storage'a yollayalım ki eklentiniz (Popup) oradan okusun:
    chrome.storage.local.set({
      ext_cached_folders: customFolders.map(f => f.name),
      ext_cached_tags: customTags.map(t => t.name)
    });
  } catch (e) { }
}

feedAppTagsToExtension();
syncToWebLocalStorage();
syncUpdatesToWebLocalStorage();
chrome.storage.onChanged.addListener((changes, ns) => {
  if (ns === 'local') {
    syncToWebLocalStorage();
    syncUpdatesToWebLocalStorage();
  }
});