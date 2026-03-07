function isExtensionValid() {
  return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
}

try {
  if (isExtensionValid()) {
    localStorage.setItem('bookmark_extension_id', chrome.runtime.id);
  }
} catch (e) {
  console.error("Extension ID kaydetme hatası:", e);
}

function syncToWebLocalStorage() {
  if (!isExtensionValid()) return;
  chrome.storage.local.get(['twitter_bookmarks'], (result) => {
    if (typeof chrome === 'undefined' || !chrome.runtime || chrome.runtime.lastError || !result) return;
    if (result.twitter_bookmarks && result.twitter_bookmarks.length > 0) {
      try {
        const isPlayableVideoUrl = (url) => {
          if (!url || typeof url !== 'string' || url.startsWith('blob:')) return false;
          return /(\.m3u8|\.mp4|\.webm|\.ogg|video\.twimg\.com|v\.redd\.it|\/ext_tw_video\/)/i.test(url);
        };

        const extensionData = result.twitter_bookmarks;
        let newBookmarks = [];

        extensionData.forEach(extItem => {
          const parsedMediaUrls = Array.isArray(extItem.mediaUrls)
            ? extItem.mediaUrls
            : (extItem.mediaUrls ? String(extItem.mediaUrls).split(',') : []);
          const normalizedMediaUrls = [...new Set(parsedMediaUrls.map(u => String(u || '').trim()).filter(Boolean))];
          const hasPlayableVideo = normalizedMediaUrls.some(isPlayableVideoUrl);
          const normalizedMediaType = extItem.mediaType === 'video' ? 'video' : 'image';

          const formattedBookmark = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            tweetId: extItem.id,
            url: extItem.url,
            folder: extItem.folder || 'Gelen Kutusu',
            tags: extItem.tags || [],
            description: extItem.note || '',
            date: new Date(extItem.savedAt).toLocaleDateString('tr-TR'),
            timestamp: extItem.savedAt || Date.now(),

            authorName: extItem.authorName || '',
            authorHandle: extItem.authorHandle || '',
            profileImg: extItem.authorPic || '',
            tweetText: extItem.tweetText || '',
            mediaUrls: normalizedMediaUrls.join(','),
            mediaType: normalizedMediaType,
            hasPlayableVideo: hasPlayableVideo,
            posterUrl: extItem.posterUrl || ''
          };
          newBookmarks.push(formattedBookmark);
        });

        if (newBookmarks.length > 0) {
          let pending = [];
          try {
            let rawPending = localStorage.getItem('pending_twitter_sync');
            pending = rawPending ? JSON.parse(rawPending) : [];
            if (!Array.isArray(pending)) pending = [];
          } catch (e) { pending = []; }

          // Merge by tweetId so repeated sync ticks cannot create duplicates.
          const dedupMap = new Map();
          [...pending, ...newBookmarks].forEach(item => {
            const key = String(item?.tweetId || '');
            if (!key) return;
            dedupMap.set(key, item);
          });
          localStorage.setItem('pending_twitter_sync', JSON.stringify(Array.from(dedupMap.values())));

          if (isExtensionValid()) {
            chrome.storage.local.set({ twitter_bookmarks: [] }, () => {
              window.dispatchEvent(new CustomEvent('twitter-bookmarks-synced'));
            });
          }
        }
      } catch (error) {
        console.error("Sync Hatası:", error);
      }
    }
  });
}

function syncUpdatesToWebLocalStorage() {
  if (!isExtensionValid()) return;
  chrome.storage.local.get(['twitter_updates'], (result) => {
    if (typeof chrome === 'undefined' || !chrome.runtime || chrome.runtime.lastError || !result) return;
    if (result.twitter_updates && result.twitter_updates.length > 0) {
      try {
        let pendingUpdates = [];
        try {
          let rawUpdates = localStorage.getItem('pending_twitter_updates');
          pendingUpdates = rawUpdates ? JSON.parse(rawUpdates) : [];
          if (!Array.isArray(pendingUpdates)) pendingUpdates = [];
        } catch (e) { pendingUpdates = []; }

        localStorage.setItem('pending_twitter_updates', JSON.stringify([...pendingUpdates, ...result.twitter_updates]));

        if (isExtensionValid()) {
          chrome.storage.local.set({ twitter_updates: [] }, () => {
            window.dispatchEvent(new CustomEvent('twitter-bookmarks-synced'));
          });
        }
      } catch (e) { }
    }
  });
}

function feedAppTagsToExtension() {
  try {
    if (window.indexedDB.databases) {
      window.indexedDB.databases().then(dbs => {
        if (!dbs || !dbs.some(db => db.name === 'TweetmarkDB')) return;
        executeFeed();
      }).catch(() => executeFeed());
    } else {
      executeFeed();
    }
  } catch (e) { console.error(e); }
}

function executeFeed() {
  try {
    const request = window.indexedDB.open('TweetmarkDB');
    request.onsuccess = (event) => {
      const db = event.target.result;
      if (!db || !db.objectStoreNames.contains('folders') || !db.objectStoreNames.contains('tags')) {
        return;
      }

      const transaction = db.transaction(['folders', 'tags'], 'readonly');
      const folderStore = transaction.objectStore('folders');
      const tagStore = transaction.objectStore('tags');

      const folderReq = folderStore.getAll();
      const tagReq = tagStore.getAll();

      folderReq.onsuccess = () => {
        tagReq.onsuccess = () => {
          if (isExtensionValid()) {
            chrome.storage.local.set({
              ext_cached_folders: (folderReq.result || []).map(f => f.name),
              ext_cached_tags: (tagReq.result || []).map(t => t.name)
            });
          }
        };
      };
    };
  } catch (e) {
    console.error("Dexie DB Sync error:", e);
  }
}

feedAppTagsToExtension();
syncToWebLocalStorage();
syncUpdatesToWebLocalStorage();

window.addEventListener('tweetmark-data-changed', feedAppTagsToExtension);

if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
  chrome.storage.onChanged.addListener((changes, ns) => {
    if (ns === 'local' && isExtensionValid()) {
      syncToWebLocalStorage();
      syncUpdatesToWebLocalStorage();
    }
  });
}
