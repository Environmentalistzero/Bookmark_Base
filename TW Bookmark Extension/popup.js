function updateStats() {
    chrome.storage.local.get(['twitter_bookmarks', 'twitter_updates'], (result) => {
        const pendingCount = result.twitter_bookmarks ? result.twitter_bookmarks.length : 0;
        const updateCount = result.twitter_updates ? result.twitter_updates.length : 0;

        document.getElementById('pending-count').textContent = pendingCount;
        document.getElementById('update-count').textContent = updateCount;
    });
}

document.getElementById('open-dashboard').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://bookmarkbase.online/' });
});

document.getElementById('sync-now').addEventListener('click', () => {
    // Open dashboard and let webapp-sync.js flush queued changes.
    chrome.tabs.create({ url: 'https://bookmarkbase.online/' });
});

// Initial load
updateStats();

// Listen for storage changes to update stats in real-time if popup is open
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && (changes.twitter_bookmarks || changes.twitter_updates)) {
        updateStats();
    }
});


