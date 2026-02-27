const saveIconSVG = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18.75px; height: 18.75px; fill: currentColor;"><g><path d="M17.53 7.47l-5-5c-.293-.293-.683-.47-1.03-.47H4C2.895 2 2 2.895 2 4v16c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2V8.5c0-.347-.177-.737-.47-1.03zM10 4.5h4v3h-4v-3zm0 15v-5h4v5h-4zm10 0H4V4h4v4.5c0 .276.224.5.5.5h6c.276 0 .5-.224.5-.5V4.657l4.343 4.343V19.5z"></path></g></svg>`;

const style = document.createElement('style');
style.innerHTML = `
  .tweetmark-toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px); background: #1d9bf0; color: white; padding: 12px 24px; border-radius: 999px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: bold; box-shadow: 0 4px 12px rgba(29,155,240,0.3); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 999999; pointer-events: none; display: flex; align-items: center; gap: 8px; }
  .tweetmark-toast.show { transform: translateX(-50%) translateY(0); }
  .tweetmark-panel { position: fixed; top: 70px; right: 20px; width: 340px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px); border-radius: 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.15); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; z-index: 999999; transform: translateY(-20px) scale(0.95); opacity: 0; pointer-events: none; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(0,0,0,0.08); overflow: visible; }
  @media (prefers-color-scheme: dark) {
    .tweetmark-panel { background: rgba(21, 32, 43, 0.95); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
    .tweetmark-panel-header { color: #fff !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important;}
    .tweetmark-panel-close { color: #8899a6 !important; }
    .tweetmark-panel-close:hover { background: rgba(255,255,255,0.1) !important; color: #fff !important; }
    .tweetmark-input, .tweetmark-textarea { background: rgba(0,0,0,0.2) !important; border-color: rgba(255,255,255,0.1) !important; color: #fff !important; }
    .tweetmark-input:focus, .tweetmark-textarea:focus { border-color: #1d9bf0 !important; background: rgba(0,0,0,0.4) !important; }
    .tm-dropdown-menu { background: #15202b !important; border: 1px solid rgba(255,255,255,0.1) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important; }
    .tm-dropdown-item { color: #fff !important; }
    .tm-dropdown-item:hover, .tm-dropdown-item.selected { background: rgba(255,255,255,0.1) !important; }
  }
  .tweetmark-panel.show { transform: translateY(0) scale(1); opacity: 1; pointer-events: auto; }
  .tweetmark-panel-header { padding: 18px 20px; border-bottom: 1px solid #f7f9f9; font-weight: 800; font-size: 17px; color: #0f1419; display: flex; justify-content: space-between; align-items: center; }
  .tweetmark-panel-close { cursor: pointer; color: #536471; font-size: 22px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s; }
  .tweetmark-panel-close:hover { background: #eff3f4; color: #0f1419; }
  .tweetmark-panel-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
  .tweetmark-input-group { display: flex; flex-direction: column; gap: 8px; position: relative; }
  .tweetmark-label { font-size: 12px; font-weight: 700; color: #536471; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 2px; }
  
  /* Input & Textarea */
  .tweetmark-input { width: 100%; padding: 14px 16px; border: 1px solid #cfd9de; border-radius: 12px; font-size: 15px; color: #0f1419; outline: none; box-sizing: border-box; transition: all 0.2s; background: #fff; cursor: text; }
  .tweetmark-input:focus { border-color: #1d9bf0; box-shadow: 0 0 0 1px #1d9bf0; }
  .tweetmark-textarea { width: 100%; padding: 14px 16px; border: 1px solid #cfd9de; border-radius: 12px; font-size: 15px; color: #0f1419; outline: none; resize: none; box-sizing: border-box; transition: all 0.2s; background: #fff; }
  .tweetmark-textarea:focus { border-color: #1d9bf0; box-shadow: 0 0 0 1px #1d9bf0; }
  
  /* Custom Dropdown */
  .tm-input-wrapper { position: relative; display: block; }
  .tm-dropdown-arrow { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #536471; display: flex; }
  .tm-dropdown-menu { position: absolute; top: calc(100% + 4px); left: 0; width: 100%; max-height: 180px; overflow-y: auto; background: #fff; border: 1px solid #cfd9de; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 10; opacity: 0; pointer-events: none; transform: translateY(-4px); transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
  .tm-dropdown-menu.show { opacity: 1; pointer-events: auto; transform: translateY(0); }
  .tm-dropdown-item { padding: 12px 16px; cursor: pointer; font-size: 15px; color: #0f1419; display: flex; align-items: center; justify-content: space-between; transition: background 0.15s; }
  .tm-dropdown-item:hover, .tm-dropdown-item.selected { background: #f7f9f9; }
  .tm-dropdown-checkbox { width: 18px; height: 18px; border-radius: 4px; border: 2px solid #cfd9de; display: flex; align-items: center; justify-content: center; }
  .tm-dropdown-item.selected .tm-dropdown-checkbox { background: #1d9bf0; border-color: #1d9bf0; }
  .tm-dropdown-item.selected .tm-dropdown-checkbox::after { content: ''; width: 4px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-bottom: 2px; }
  
  .tweetmark-btn { width: 100%; padding: 16px; background: #16a34a; color: white; border: none; border-radius: 999px; font-weight: 800; font-size: 15px; cursor: pointer; transition: transform 0.1s, background 0.2s, box-shadow 0.2s; margin-top: 4px; box-shadow: 0 4px 12px rgba(22,163,74,0.25); }
  .tweetmark-btn:hover { background: #15803d; box-shadow: 0 6px 16px rgba(22,163,74,0.3); }
  .tweetmark-btn:active { transform: scale(0.97); }

  /* Tag Pills */
  .tm-multi-wrapper { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 16px; min-height: 48px; border: 1px solid #cfd9de; border-radius: 12px; background: #fff; align-items: center; transition: all 0.2s; }
  .tm-multi-wrapper:focus-within { border-color: #1d9bf0; box-shadow: 0 0 0 1px #1d9bf0; }
  .tm-multi-input { border: none !important; padding: 0 !important; width: 120px; flex-grow: 1; min-width: 80px; box-shadow: none !important; margin: 0; outline: none !important; background: transparent !important; }
  .tm-tag-pill { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: #fff; border: 1px solid #cfd9de; border-radius: 8px; font-size: 12px; font-weight: 700; color: #0f1419; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
  .tm-tag-pill-close { cursor: pointer; color: #8899a6; display: flex; align-items: center; padding-left: 2px; }
  .tm-tag-pill-close:hover { color: #f4212e; }
`;
document.head.appendChild(style);

function showToast() {
  const toast = document.createElement('div');
  toast.className = 'tweetmark-toast';
  toast.innerHTML = '<span style="font-size: 18px">✅</span> Tweetmark: Başarıyla Kaydedildi!';
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

let currentPanel = null;
function showPanel(tweetId) {
  if (currentPanel) currentPanel.remove();

  chrome.runtime.sendMessage({ type: 'GET_APP_DATA' }, (response) => {
    let allFolders = new Set(['Gelen Kutusu']);
    let allTags = new Set();

    if (response) {
      // Siteden gelen taze verileri kullan
      if (response.folders) response.folders.forEach(f => allFolders.add(f.name));
      if (response.tags) response.tags.forEach(t => allTags.add(t.name));
    }

    // Ayrıca daha synclenmemiş kuyruk verisini ve Webapp'ten gelen Cache'i storage'dan check edelim
    chrome.storage.local.get(['twitter_bookmarks', 'twitter_updates', 'ext_cached_folders', 'ext_cached_tags'], (result) => {

      // Webapp'ten kaydedilen ana tag ve klasör listesini de ekleyelim:
      if (result.ext_cached_folders) {
        result.ext_cached_folders.forEach(f => allFolders.add(f));
      }
      if (result.ext_cached_tags) {
        result.ext_cached_tags.forEach(t => allTags.add(t));
      }

      const scanItems = (items) => {
        if (!items) return;
        items.forEach(b => {
          if (b.folder) allFolders.add(b.folder);
          if (b.tags && Array.isArray(b.tags)) b.tags.forEach(t => allTags.add(t));
        });
      };

      scanItems(result.twitter_bookmarks);
      scanItems(result.twitter_updates);

      const folderOptions = Array.from(allFolders).map(f => `
        <div class="tm-dropdown-item tm-folder-item" data-value="${f}">
          <span>${f}</span>
          <div class="tm-dropdown-checkbox"></div>
        </div>
      `).join('');

      const tagOptions = Array.from(allTags).map(t => `
        <div class="tm-dropdown-item tm-tag-item" data-value="${t}">
          <span>#${t}</span>
          <div class="tm-dropdown-checkbox"></div>
        </div>
      `).join('');

      const chevronIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 20px; height: 20px; fill: currentColor;"><g><path d="M3.543 8.96l1.414-1.42L12 14.59l7.043-7.05 1.414 1.42L12 17.41 3.543 8.96z"></path></g></svg>`;

      const panel = document.createElement('div');
      panel.className = 'tweetmark-panel';
      panel.innerHTML = `
        <div class="tweetmark-panel-header">
          <span>TWEET'İ DÜZENLE</span>
          <span class="tweetmark-panel-close">&times;</span>
        </div>
        <div class="tweetmark-panel-body">
          
          <!-- YENİ KLASÖR SEÇİMİ (CUSTOM DROPDOWN) -->
          <div class="tweetmark-input-group">
             <label class="tweetmark-label">KLASÖR</label>
             <div class="tm-input-wrapper">
               <input type="text" id="tm-folder" class="tweetmark-input" placeholder="Gelen Kutusu" autocomplete="off" value="Gelen Kutusu">
               <div class="tm-dropdown-arrow">${chevronIcon}</div>
               <div class="tm-dropdown-menu" id="tm-folder-menu">
                  ${folderOptions || '<div class="tm-dropdown-item" style="color:#8899a6;">Kayıtlı klasör yok</div>'}
               </div>
             </div>
          </div>

          <!-- YENİ ETİKET SEÇİMİ (CUSTOM MULTI DROPDOWN) -->
          <div class="tweetmark-input-group">
            <label class="tweetmark-label">ETİKETLER</label>
            <div class="tm-input-wrapper tm-multi-wrapper" id="tm-tags-wrapper">
               <div id="tm-tags-container" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
               <input type="text" id="tm-tags" class="tweetmark-input tm-multi-input" placeholder="Etiket seç veya ara..." autocomplete="off">
               <div class="tm-dropdown-arrow" style="right: 10px; top: 14px;">${chevronIcon}</div>
               <div class="tm-dropdown-menu" id="tm-tag-menu" style="top: calc(100% + 4px);">
                  ${tagOptions || '<div class="tm-dropdown-item" style="color:#8899a6;">Kayıtlı etiket yok</div>'}
               </div>
            </div>
          </div>

          <div class="tweetmark-input-group">
             <label class="tweetmark-label">KISA NOT (İSTEĞE BAĞLI)</label>
             <textarea id="tm-note" class="tweetmark-textarea" placeholder="Tweet hakkında detaylar..." rows="2"></textarea>
          </div>

          <button id="tm-save-btn" class="tweetmark-btn">GÜNCELLE</button>
        </div>
      `;
      document.body.appendChild(panel);
      currentPanel = panel;

      setTimeout(() => panel.classList.add('show'), 10);

      // --- CUSTOM DROPDOWN MANTIĞI EKLENİYOR ---
      let selectedTags = [];
      const tagsContainer = panel.querySelector('#tm-tags-container');

      const renderTagPills = () => {
        if (!tagsContainer) return;
        tagsContainer.innerHTML = '';
        selectedTags.forEach(tag => {
          const pill = document.createElement('div');
          pill.className = 'tm-tag-pill';
          pill.innerHTML = `
            <span>${tag}</span>
            <span class="tm-tag-pill-close" data-tag="${tag}"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M13.414 12l5.293-5.293-1.414-1.414L12 10.586 6.707 5.293 5.293 6.707 10.586 12l-5.293 5.293 1.414 1.414L12 13.414l5.293 5.293 1.414-1.414L13.414 12z"></path></svg></span>
          `;
          pill.querySelector('.tm-tag-pill-close').onclick = (e) => {
            e.stopPropagation();
            selectedTags = selectedTags.filter(t => t !== tag);
            renderTagPills();
            const tagInput = panel.querySelector('#tm-tags');
            if (tagInput) {
              tagInput.focus();
              const event = new Event('focus');
              tagInput.dispatchEvent(event);
            }
          };
          tagsContainer.appendChild(pill);
        });
      };

      const setupDropdown = (inputId, menuId, isMulti, wrapperId) => {
        const input = panel.querySelector('#' + inputId);
        const menu = panel.querySelector('#' + menuId);
        const wrapper = wrapperId ? panel.querySelector('#' + wrapperId) : input;
        if (!input || !menu) return;

        const syncSelectedState = () => {
          if (isMulti) {
            menu.querySelectorAll('.tm-dropdown-item').forEach(item => {
              if (!item.hasAttribute('data-value')) return;
              const itemVal = item.getAttribute('data-value').toLowerCase();
              if (selectedTags.map(t => t.toLowerCase()).includes(itemVal)) item.classList.add('selected');
              else item.classList.remove('selected');
            });
            renderTagPills();
          } else {
            const currentVal = input.value.trim().toLowerCase();
            menu.querySelectorAll('.tm-dropdown-item').forEach(item => {
              if (!item.hasAttribute('data-value')) return;
              if (item.getAttribute('data-value').toLowerCase() === currentVal) item.classList.add('selected');
              else item.classList.remove('selected');
            });
          }
        };

        // Input'a tıklandığında menüyü aç
        input.addEventListener('focus', () => { syncSelectedState(); menu.classList.add('show'); });
        if (wrapperId) wrapper.addEventListener('click', () => { input.focus(); menu.classList.add('show'); });
        else input.addEventListener('click', () => { syncSelectedState(); menu.classList.add('show'); });

        // Dışarı tıklanınca menüyü kapat
        document.addEventListener('click', (e) => {
          const container = wrapperId ? wrapper : input.parentElement;
          if (!container.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('show');
          }
        });

        // Seçeneklere tıklandığında
        menu.querySelectorAll('.tm-dropdown-item').forEach(item => {
          if (!item.hasAttribute('data-value')) return; // empty state click skip

          item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // menü kapanmasın diye (özellikle multi için)

            const val = item.getAttribute('data-value');

            if (isMulti) {
              if (selectedTags.includes(val)) {
                selectedTags = selectedTags.filter(t => t !== val);
              } else {
                selectedTags.push(val);
              }
              input.value = ''; // clear search text
              syncSelectedState();
              input.focus();
            } else {
              // Klasör ise Tekli seçim yap
              input.value = val;
              syncSelectedState();
              menu.classList.remove('show'); // seçince kapat
            }
          });
        });

        // Input yazılırken filtreleme yap
        input.addEventListener('input', (e) => {
          menu.classList.add('show');
          const searchVal = e.target.value.toLowerCase().trim(); // multi için pilli kullandığımızdan split yapmaya gerek yok

          // Is exact match? If so, show all.
          let isExactMatch = false;
          if (!isMulti) {
            menu.querySelectorAll('.tm-dropdown-item').forEach(item => {
              if (item.hasAttribute('data-value') && item.getAttribute('data-value').toLowerCase() === searchVal) {
                isExactMatch = true;
              }
            });
          }

          menu.querySelectorAll('.tm-dropdown-item').forEach(item => {
            if (!item.hasAttribute('data-value')) return;
            const text = item.getAttribute('data-value').toLowerCase();

            if (isExactMatch || text.includes(searchVal)) {
              item.style.display = 'flex';
            } else {
              item.style.display = 'none';
            }
          });
        });
      };

      setupDropdown('tm-folder', 'tm-folder-menu', false);
      setupDropdown('tm-tags', 'tm-tag-menu', true, 'tm-tags-wrapper');

      // --- ---

      panel.querySelector('.tweetmark-panel-close').onclick = () => {
        panel.classList.remove('show');
        setTimeout(() => panel.remove(), 300);
        currentPanel = null;
      };

      panel.querySelector('#tm-save-btn').onclick = () => {
        const folder = panel.querySelector('#tm-folder').value.trim();
        const pendingInput = panel.querySelector('#tm-tags').value.trim();
        if (pendingInput && !selectedTags.includes(pendingInput)) {
          selectedTags.push(pendingInput);
        }
        const tags = selectedTags.map(t => t.trim()).filter(t => t);
        const note = panel.querySelector('#tm-note').value.trim();

        chrome.runtime.sendMessage({
          type: 'UPDATE_TWEET',
          payload: { tweetId, folder: folder || 'Gelen Kutusu', tags, note }
        });

        panel.querySelector('#tm-save-btn').innerText = 'GÜNCELLENDİ! ✅';
        panel.querySelector('#tm-save-btn').style.background = '#00ba7c';

        setTimeout(() => {
          panel.classList.remove('show');
          setTimeout(() => panel.remove(), 300);
          currentPanel = null;
        }, 1200);
      };
    });
  });
}

const savedTweetIds = new Set();

function injectSaveButton() {
  const actionBars = document.querySelectorAll('[role="group"]:not(.bookmark-injected)');

  actionBars.forEach(bar => {
    const article = bar.closest('article');
    if (article) {
      bar.classList.add('bookmark-injected');

      let tweetId = null;
      let tweetUrl = '';
      const timeElement = article.querySelector('time');
      if (timeElement && timeElement.parentElement) {
        tweetUrl = timeElement.parentElement.getAttribute('href');
        tweetId = tweetUrl.split('/').pop();
      }

      if (!tweetId) return;

      const saveBtnContainer = document.createElement('div');
      saveBtnContainer.style.cssText = "display: flex; align-items: center; justify-content: center; width: 34.75px; height: 34.75px; cursor: pointer; border-radius: 9999px; transition: all 0.2s;";
      saveBtnContainer.innerHTML = saveIconSVG;
      saveBtnContainer.className = "custom-save-btn";

      const isAlreadySaved = savedTweetIds.has(tweetId);
      saveBtnContainer.style.color = isAlreadySaved ? "rgb(29, 155, 240)" : "rgb(83, 100, 113)";

      saveBtnContainer.onmouseover = () => {
        if (!savedTweetIds.has(tweetId)) saveBtnContainer.style.backgroundColor = "rgba(29, 155, 240, 0.1)";
      };
      saveBtnContainer.onmouseout = () => saveBtnContainer.style.backgroundColor = "transparent";

      saveBtnContainer.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (savedTweetIds.has(tweetId)) return;

        savedTweetIds.add(tweetId);
        saveBtnContainer.style.color = "rgb(29, 155, 240)";
        saveBtnContainer.style.backgroundColor = "transparent";

        let authorName = '', authorHandle = '', authorPic = '', tweetText = '';

        try {
          const userNameContainer = article.querySelector('[data-testid="User-Name"]');
          if (userNameContainer) {
            const spans = Array.from(userNameContainer.querySelectorAll('span')).map(s => s.textContent).filter(t => t.trim() !== '');
            authorName = spans[0] || '';
            authorHandle = spans.find(t => t.startsWith('@')) || '';
          }
          const avatarContainer = article.querySelector('[data-testid="Tweet-User-Avatar"]');
          if (avatarContainer) authorPic = avatarContainer.querySelector('img')?.src || '';

          const textContainer = article.querySelector('[data-testid="tweetText"]');
          if (textContainer) tweetText = textContainer.textContent || '';
        } catch (e) { }

        // B PLAN (FALLBACK) İÇİN GÖRSEL TOPLAMA
        let fallbackMediaUrls = [];
        let fallbackMediaType = 'image';

        try {
          const videoElement = article.querySelector('video');
          if (videoElement) {
            fallbackMediaType = 'video';
            if (videoElement.poster) fallbackMediaUrls.push(videoElement.poster);
          } else {
            const photos = article.querySelectorAll('[data-testid="tweetPhoto"] img');
            photos.forEach(img => {
              if (img.src && !img.src.includes('emoji')) fallbackMediaUrls.push(img.src);
            });
          }
        } catch (e) { }

        // Veriyi Background.js'ye yolla, asıl işi o yapsın!
        chrome.runtime.sendMessage({
          type: 'SAVE_TWEET',
          payload: {
            id: String(tweetId),
            url: `https://x.com${tweetUrl}`,
            folder: 'Gelen Kutusu',
            tags: [],
            note: '',
            savedAt: Date.now(),
            authorName: String(authorName),
            authorHandle: String(authorHandle),
            authorPic: String(authorPic),
            tweetText: String(tweetText),
            mediaUrls: fallbackMediaUrls,
            mediaType: fallbackMediaType
          }
        });

        showToast();
        showPanel(String(tweetId));
      });

      bar.appendChild(saveBtnContainer);
    }
  });
}

let observerTimeout;
const observer = new MutationObserver(() => {
  if (observerTimeout) return;
  observerTimeout = setTimeout(() => {
    injectSaveButton();
    observerTimeout = null;
  }, 100);
});
observer.observe(document.body, { childList: true, subtree: true });