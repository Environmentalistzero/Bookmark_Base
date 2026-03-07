const saveIconSVG = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18.75px; height: 18.75px; fill: currentColor;"><g><path d="M17.53 7.47l-5-5c-.293-.293-.683-.47-1.03-.47H4C2.895 2 2 2.895 2 4v16c0 1.105.895 2 2 2h16c1.105 0 2-.895 2-2V8.5c0-.347-.177-.737-.47-1.03zM10 4.5h4v3h-4v-3zm0 15v-5h4v5h-4zm10 0H4V4h4v4.5c0 .276.224.5.5.5h6c.276 0 .5-.224.5-.5V4.657l4.343 4.343V19.5z"></path></g></svg>`;

const style = document.createElement('style');
style.innerHTML = `
  .tweetmark-toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(100px); background: #ff4500; color: white; padding: 12px 24px; border-radius: 999px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: bold; box-shadow: 0 4px 12px rgba(255,69,0,0.3); transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); z-index: 999999; pointer-events: none; display: flex; align-items: center; gap: 8px; }
  .tweetmark-toast.show { transform: translateX(-50%) translateY(0); }
  .tweetmark-panel { position: fixed; top: 70px; right: 20px; width: 340px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(16px); border-radius: 20px; box-shadow: 0 12px 40px rgba(0,0,0,0.15); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; z-index: 999999; transform: translateY(-20px) scale(0.95); opacity: 0; pointer-events: auto; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); border: 1px solid rgba(0,0,0,0.08); overflow: visible; }
  
  @media (prefers-color-scheme: dark) {
    .tweetmark-panel { background: rgba(21, 32, 43, 0.95); border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
    .tweetmark-panel-header { color: #fff !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important;}
    .tweetmark-panel-close { color: #8899a6 !important; }
    .tweetmark-panel-close:hover { background: rgba(255,255,255,0.1) !important; color: #fff !important; }
    .tweetmark-input, .tweetmark-textarea { background: rgba(0,0,0,0.2) !important; border-color: rgba(255,255,255,0.1) !important; color: #fff !important; }
    .tweetmark-input:focus, .tweetmark-textarea:focus { border-color: #ff4500 !important; background: rgba(0,0,0,0.4) !important; }
    .tm-dropdown-menu { background: #15202b !important; border: 1px solid rgba(255,255,255,0.1) !important; box-shadow: 0 8px 24px rgba(0,0,0,0.5) !important; }
    .tm-dropdown-item { color: #fff !important; }
    .tm-dropdown-item:hover, .tm-dropdown-item.selected { background: rgba(255,255,255,0.1) !important; }
    .tm-tag-pill { background: rgba(255,255,255,0.05) !important; border-color: rgba(255,255,255,0.1) !important; color: #fff !important; }
  }

  .tweetmark-panel.show { transform: translateY(0) scale(1); opacity: 1; pointer-events: auto; }
  .tweetmark-panel-header { padding: 18px 20px; border-bottom: 1px solid #f7f9f9; font-weight: 800; font-size: 17px; color: #0f1419; display: flex; justify-content: space-between; align-items: center; }
  .tweetmark-panel-close { cursor: pointer; color: #536471; font-size: 22px; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s; }
  .tweetmark-panel-close:hover { background: #eff3f4; color: #0f1419; }
  .tweetmark-panel-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
  .tweetmark-input-group { display: flex; flex-direction: column; gap: 8px; position: relative; }
  .tweetmark-label { font-size: 12px; font-weight: 700; color: #536471; text-transform: uppercase; letter-spacing: 0.5px; margin-left: 2px; }
  
  .tweetmark-input { width: 100%; padding: 14px 16px; border: 1px solid #cfd9de; border-radius: 12px; font-size: 15px; color: #0f1419; outline: none; box-sizing: border-box; transition: all 0.2s; background: #fff; cursor: text; }
  .tweetmark-input:focus { border-color: #ff4500; box-shadow: 0 0 0 1px #ff4500; }
  .tweetmark-textarea { width: 100%; padding: 14px 16px; border: 1px solid #cfd9de; border-radius: 12px; font-size: 15px; color: #0f1419; outline: none; resize: none; box-sizing: border-box; transition: all 0.2s; background: #fff; }
  .tweetmark-textarea:focus { border-color: #ff4500; box-shadow: 0 0 0 1px #ff4500; }
  
  .tm-input-wrapper { position: relative; display: block; }
  .tm-dropdown-arrow { position: absolute; right: 14px; top: 50%; transform: translateY(-50%); pointer-events: none; color: #536471; display: flex; }
  .tm-dropdown-menu { position: absolute; top: calc(100% + 4px); left: 0; width: 100%; max-height: 180px; overflow-y: auto; background: #fff; border: 1px solid #cfd9de; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 1000000; opacity: 0; pointer-events: none; transform: translateY(-4px); transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); }
  .tm-dropdown-menu.show { opacity: 1; pointer-events: auto; transform: translateY(0); }
  .tm-dropdown-item { padding: 12px 16px; cursor: pointer; font-size: 15px; color: #0f1419; display: flex; align-items: center; justify-content: space-between; transition: background 0.15s; }
  .tm-dropdown-item:hover, .tm-dropdown-item.selected { background: #f7f9f9; }
  .tm-dropdown-checkbox { width: 18px; height: 18px; border-radius: 4px; border: 2px solid #cfd9de; display: flex; align-items: center; justify-content: center; }
  .tm-dropdown-item.selected .tm-dropdown-checkbox { background: #ff4500; border-color: #ff4500; }
  .tm-dropdown-item.selected .tm-dropdown-checkbox::after { content: ''; width: 4px; height: 8px; border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg); margin-bottom: 2px; }
  
  .tweetmark-btn { width: 100%; padding: 16px; background: #ff4500; color: white; border: none; border-radius: 999px; font-weight: 800; font-size: 15px; cursor: pointer; transition: transform 0.1s, background 0.2s, box-shadow 0.2s; margin-top: 4px; box-shadow: 0 4px 12px rgba(255,69,0,0.25); }
  .tweetmark-btn:hover { background: #e03c00; box-shadow: 0 6px 16px rgba(255,69,0,0.3); }
  .tweetmark-btn:active { transform: scale(0.97); }

  .tm-multi-wrapper { display: flex; flex-wrap: wrap; gap: 6px; padding: 6px 16px; min-height: 48px; border: 1px solid #cfd9de; border-radius: 12px; background: #fff; align-items: center; transition: all 0.2s; }
  .tm-multi-wrapper:focus-within { border-color: #ff4500; box-shadow: 0 0 0 1px #ff4500; }
  .tm-multi-input { border: none !important; padding: 0 !important; width: 120px; flex-grow: 1; min-width: 80px; box-shadow: none !important; margin: 0; outline: none !important; background: transparent !important; }
  .tm-tag-pill { display: flex; align-items: center; gap: 4px; padding: 4px 10px; background: #eff3f4; border: 1px solid transparent; border-radius: 8px; font-size: 12px; font-weight: 700; color: #0f1419; }
  .tm-tag-pill-close { cursor: pointer; color: #536471; display: flex; align-items: center; padding-left: 2px; }
  .tm-tag-pill-close:hover { color: #f4212e; }
`;
document.head.appendChild(style);

function showToast() {
    const toast = document.createElement('div');
    toast.className = 'tweetmark-toast';
    toast.innerHTML = '<span style="font-size: 18px">✨</span> Bookmark Base: Added to Archive!';
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

let currentPanel = null;
function showPanel(tweetId) {
    if (currentPanel) {
        if (currentPanel.cleanups) currentPanel.cleanups.forEach(c => c());
        currentPanel.remove();
    }

    const encodeHTML = (str) => {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    };

    let allFolders = new Set(['Gelen Kutusu']);
    let allTags = new Set();

    chrome.storage.local.get(['twitter_bookmarks', 'twitter_updates', 'ext_cached_folders', 'ext_cached_tags'], (result) => {
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
        <div class="tm-dropdown-item tm-folder-item" data-value="${encodeHTML(f)}">
          <span>${encodeHTML(f)}</span>
          <div class="tm-dropdown-checkbox"></div>
        </div>
      `).join('');

        const tagOptions = Array.from(allTags).map(t => `
        <div class="tm-dropdown-item tm-tag-item" data-value="${encodeHTML(t)}">
          <span>#${encodeHTML(t)}</span>
          <div class="tm-dropdown-checkbox"></div>
        </div>
      `).join('');

        const chevronIcon = `<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 20px; height: 20px; fill: currentColor;"><g><path d="M3.543 8.96l1.414-1.42L12 14.59l7.043-7.05 1.414 1.42L12 17.41 3.543 8.96z"></path></g></svg>`;

        const panel = document.createElement('div');
        panel.className = 'tweetmark-panel';
        panel.innerHTML = `
        <div class="tweetmark-panel-header">
          <span>EDIT BOOKMARK</span>
          <span class="tweetmark-panel-close">&times;</span>
        </div>
        <div class="tweetmark-panel-body">
          <div class="tweetmark-input-group">
             <label class="tweetmark-label">FOLDER</label>
             <div class="tm-input-wrapper">
               <input type="text" id="tm-folder" class="tweetmark-input" placeholder="Inbox" autocomplete="off" value="Inbox">
               <div class="tm-dropdown-arrow">${chevronIcon}</div>
               <div class="tm-dropdown-menu" id="tm-folder-menu">
                  ${folderOptions || '<div class="tm-dropdown-item" style="color:#8899a6;">No folders</div>'}
               </div>
             </div>
          </div>
          <div class="tweetmark-input-group">
            <label class="tweetmark-label">TAGS</label>
            <div class="tm-input-wrapper tm-multi-wrapper" id="tm-tags-wrapper">
               <div id="tm-tags-container" style="display:flex; flex-wrap:wrap; gap:6px;"></div>
               <input type="text" id="tm-tags" class="tweetmark-input tm-multi-input" placeholder="Search or add tags..." autocomplete="off">
               <div class="tm-dropdown-arrow" style="right: 10px; top: 14px;">${chevronIcon}</div>
               <div class="tm-dropdown-menu" id="tm-tag-menu" style="top: calc(100% + 4px);">
                  ${tagOptions || '<div class="tm-dropdown-item" style="color:#8899a6;">No tags</div>'}
               </div>
            </div>
          </div>
          <div class="tweetmark-input-group">
             <label class="tweetmark-label">NOTE (OPTIONAL)</label>
             <textarea id="tm-note" class="tweetmark-textarea" placeholder="Add a note..." rows="2"></textarea>
          </div>
          <button id="tm-save-btn" class="tweetmark-btn">UPDATE</button>
        </div>
      `;
        document.body.appendChild(panel);
        currentPanel = panel;

        setTimeout(() => panel.classList.add('show'), 10);

        let selectedTags = [];
        const tagsContainer = panel.querySelector('#tm-tags-container');

        const renderTagPills = () => {
            if (!tagsContainer) return;
            tagsContainer.innerHTML = '';
            selectedTags.forEach(tag => {
                const pill = document.createElement('div');
                pill.className = 'tm-tag-pill';
                pill.innerHTML = `
            <span>${encodeHTML(tag)}</span>
            <span class="tm-tag-pill-close" data-tag="${encodeHTML(tag)}"><svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M13.414 12l5.293-5.293-1.414-1.414L12 10.586 6.707 5.293 5.293 6.707 10.586 12l-5.293 5.293 1.414 1.414L12 13.414l5.293 5.293 1.414-1.414L13.414 12z"></path></svg></span>
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

            input.addEventListener('focus', () => { syncSelectedState(); menu.classList.add('show'); });
            if (wrapperId) wrapper.addEventListener('click', () => { input.focus(); menu.classList.add('show'); });
            else input.addEventListener('click', () => {
                // Folder field: clear current selection on click so typing starts from empty input.
                if (!isMulti && input.value.trim()) {
                    input.value = '';
                }
                syncSelectedState();
                menu.classList.add('show');
            });

            const documentClickHandler = (e) => {
                const container = wrapperId ? wrapper : input.parentElement;
                if (!container.contains(e.target) && !menu.contains(e.target)) {
                    menu.classList.remove('show');
                }
            };
            document.addEventListener('click', documentClickHandler);
            panel.cleanups = panel.cleanups || [];
            panel.cleanups.push(() => document.removeEventListener('click', documentClickHandler));

            menu.querySelectorAll('.tm-dropdown-item').forEach(item => {
                if (!item.hasAttribute('data-value')) return;

                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    const val = item.getAttribute('data-value');

                    if (isMulti) {
                        if (selectedTags.includes(val)) {
                            selectedTags = selectedTags.filter(t => t !== val);
                        } else {
                            selectedTags.push(val);
                        }
                        input.value = '';
                        syncSelectedState();
                        input.focus();
                    } else {
                        input.value = val;
                        syncSelectedState();
                        menu.classList.remove('show');
                    }
                });
            });

            input.addEventListener('input', (e) => {
                menu.classList.add('show');
                const searchVal = e.target.value.toLowerCase().trim();

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

        panel.querySelector('.tweetmark-panel-close').onclick = () => {
            panel.classList.remove('show');
            if (panel.cleanups) {
                panel.cleanups.forEach(cleanup => cleanup());
            }
            setTimeout(() => panel.remove(), 300);
            currentPanel = null;
        };

        panel.querySelector('#tm-save-btn').onclick = () => {
            const pendingInput = panel.querySelector('#tm-tags').value.trim();
            if (pendingInput && !selectedTags.includes(pendingInput)) {
                selectedTags.push(pendingInput);
            }
            const currentFolder = panel.querySelector('#tm-folder').value.trim();
            const currentNote = panel.querySelector('#tm-note').value;

            chrome.runtime.sendMessage({
                type: 'UPDATE_TWEET',
                payload: { tweetId: tweetId, folder: currentFolder, tags: selectedTags, note: currentNote }
            }, () => {
                if (panel.cleanups) {
                    panel.cleanups.forEach(cleanup => cleanup());
                }
                panel.classList.remove('show');
                setTimeout(() => panel.remove(), 300);
                currentPanel = null;
            });
        };
    });
}

const savedPostIds = new Set();

function injectRedditSaveButton() {
    const posts = document.querySelectorAll('shreddit-post:not(.bookmark-injected)');

    posts.forEach(post => {
        post.classList.add('bookmark-injected');

        const postIdAttr = post.getAttribute('id') || '';
        const permalink = post.getAttribute('permalink');
        if (!permalink) return;

        const permalinkIdMatch = permalink.match(/\/comments\/([a-z0-9]+)\//i);
        const postId = permalinkIdMatch?.[1] || postIdAttr.replace(/^t3_/, '').trim();
        if (!postId) return;

        const canonicalUrl = /^https?:\/\//i.test(permalink)
            ? permalink
            : `https://www.reddit.com${permalink.startsWith('/') ? '' : '/'}${permalink}`;

        let saveBtnContainer = document.createElement('div');
        saveBtnContainer.style.cssText = "position: absolute; top: 12px; right: 12px; z-index: 10; display: flex; align-items: center; justify-content: center; width: 34.75px; height: 34.75px; cursor: pointer; border-radius: 9999px; transition: all 0.2s; background: rgba(0,0,0,0.5); color: white;";
        saveBtnContainer.innerHTML = saveIconSVG;
        saveBtnContainer.className = "custom-save-btn";

        // Absolute position to easily float top right in the Reddit post
        post.style.position = 'relative';

        const isAlreadySaved = savedPostIds.has(postId);
        if (isAlreadySaved) {
            saveBtnContainer.style.color = "rgb(255, 69, 0)";
        }

        saveBtnContainer.onmouseover = () => {
            saveBtnContainer.style.backgroundColor = "rgba(0,0,0,0.8)";
        };
        saveBtnContainer.onmouseout = () => {
            saveBtnContainer.style.backgroundColor = "rgba(0,0,0,0.5)";
        };

        saveBtnContainer.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (savedPostIds.has(postId)) return;
            savedPostIds.add(postId);
            saveBtnContainer.style.color = "rgb(255, 69, 0)";

            let authorName = post.getAttribute('author') || '';
            let title = post.getAttribute('post-title') || '';
            let subreddit = '';

            const rMatch = permalink.match(/\/r\/([^\/]+)/);
            if (rMatch) subreddit = `r/${rMatch[1]}`;
            else subreddit = authorName;

            let tweetText = title;
            let bodyElem = post.querySelector('div[id^="t3_"][id$="-post-rtjson-content"]');
            if (!bodyElem) {
                // Fallback: Post içeriğini başka sınıflardan veya data-test-id'lerden aramayı dene
                bodyElem = post.querySelector('.text-neutral-content, .md, [data-test-id="post-content"], shreddit-post > div[slot="text-body"]');
            }

            if (bodyElem) {
                const clone = bodyElem.cloneNode(true);

                // Linkleri düzenle (Markdown formatına sok)
                const links = clone.querySelectorAll('a');
                links.forEach(a => {
                    const href = a.href || a.getAttribute('href');
                    let absoluteHref = href;
                    if (absoluteHref && absoluteHref.startsWith('/')) {
                        absoluteHref = 'https://www.reddit.com' + absoluteHref;
                    }

                    if (absoluteHref && absoluteHref.startsWith('http')) {
                        const innerStr = a.innerText.trim();
                        if (innerStr) {
                            const cleanHref = absoluteHref.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
                            const cleanText = innerStr.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');

                            // Eğer link metni zaten URL'nin bir versiyonuysa, doğrudan URL'yi koy
                            if (cleanText === cleanHref || cleanHref.startsWith(cleanText.replace(/\.\.\.$/, ''))) {
                                a.innerText = absoluteHref;
                            } else {
                                a.innerText = `[${innerStr}](${absoluteHref})`;
                            }
                        }
                    }
                });

                // Metni temiz bir şekilde almak için geçici olarak DOM'a ekliyoruz (Görünürlüğü sıfır)
                const hiddenWrapper = document.createElement('div');
                hiddenWrapper.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none;z-index:-999;width:800px;line-height:normal;';
                hiddenWrapper.appendChild(clone);
                document.body.appendChild(hiddenWrapper);

                let textContent = clone.innerText;
                document.body.removeChild(hiddenWrapper);

                if (textContent) {
                    // Satır bazlı temizlik: Her satırın başındaki ve sonundaki boşlukları sil
                    textContent = textContent.split('\n')
                        .map(line => line.trim())
                        .filter((line, index, arr) => line !== '' || (index > 0 && arr[index - 1] !== '')) // Üst üste boş satırları engelle
                        .join('\n')
                        .replace(/\n{3,}/g, '\n\n') // 3+ satırı 2'ye indir
                        .trim();

                    tweetText += "\n\n" + textContent;
                }
            }

            // Subreddit veya Kullanıcı Profil Resmini Çek
            let authorPic = 'https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png';
            const iconImg = post.querySelector('img[src*="community_icon"], faceplate-img[src*="community_icon"], a[href*="/r/"] img, a[href*="/u/"] img');
            if (iconImg) {
                authorPic = iconImg.getAttribute('src') || iconImg.getAttribute('url') || authorPic;
            }

            let fallbackMediaUrls = [];
            let fallbackMediaType = 'image';

            Array.from(post.querySelectorAll('img, faceplate-img')).forEach(img => {
                const src = img.getAttribute('src') || img.getAttribute('url');
                if (src && (src.includes('preview.redd.it') || src.includes('i.redd.it'))) {
                    // Aynı görselin farklı çözünürlüklerini veya kopyalarını temizlemek için:
                    // URL içindeki parametreleri temizleyip kontrol edelim
                    const cleanUrl = src.split('?')[0];
                    if (!fallbackMediaUrls.some(existing => existing.split('?')[0] === cleanUrl)) {
                        fallbackMediaUrls.push(src);
                    }
                }
            });

            // Eğer tek bir görsel varsa ama galeride değilse, en iyisini seçelim
            const isGallery = post.querySelector('shreddit-gallery, .gallery-content');
            if (!isGallery && fallbackMediaUrls.length > 1) {
                // Önizlemeler yerine genellikle i.redd.it olanlar daha iyidir
                const bestImage = fallbackMediaUrls.find(url => url.includes('i.redd.it')) || fallbackMediaUrls[0];
                fallbackMediaUrls = [bestImage];
            }

            const isPlayableVideoUrl = (url) => {
                if (!url || typeof url !== 'string' || url.startsWith('blob:')) return false;
                return /(\.m3u8|\.mp4|\.webm|\.ogg|video\.twimg\.com|v\.redd\.it|\/ext_tw_video\/)/i.test(url);
            };

            let posterUrl = '';
            const video = post.querySelector('video') || post.querySelector('shreddit-player');
            if (video) {
                let src = video.getAttribute('src');
                if (video.tagName && video.tagName.toLowerCase() === 'shreddit-player') src = video.getAttribute('src');
                if (isPlayableVideoUrl(src) && !fallbackMediaUrls.includes(src)) {
                    fallbackMediaType = 'video';
                    fallbackMediaUrls = [src];
                } else {
                    fallbackMediaType = 'image';
                }

                let poster = video.getAttribute('poster');
                if (poster) posterUrl = poster;
            }

            const numericId = String(postId);

            chrome.runtime.sendMessage({
                type: 'SAVE_TWEET',
                payload: {
                    id: numericId,
                    url: canonicalUrl,
                    folder: 'Gelen Kutusu',
                    tags: [],
                    note: '',
                    savedAt: Date.now(),
                    authorName: subreddit,
                    authorHandle: `u/${authorName}`,
                    authorPic: authorPic,
                    tweetText: String(tweetText),
                    mediaUrls: fallbackMediaUrls,
                    mediaType: fallbackMediaType,
                    posterUrl: posterUrl
                }
            }, (response) => {
                const hasRuntimeError = !!(chrome.runtime && chrome.runtime.lastError);
                const isAccepted = !!response && (response.status === 'ok' || response.status === 'queued');

                if (hasRuntimeError || !isAccepted) {
                    savedPostIds.delete(postId);
                    saveBtnContainer.style.color = "white";
                    console.error("Reddit bookmark save failed:", chrome.runtime?.lastError?.message || response);
                    return;
                }

                showToast();
                showPanel(numericId);
            });
        });

        post.appendChild(saveBtnContainer);
    });
}

let observerTimeout;
const observer = new MutationObserver((mutations) => {
    if (observerTimeout) return;
    observerTimeout = setTimeout(() => {
        injectRedditSaveButton();
        observerTimeout = null;
    }, 300); // Throttling arttırıldı CPU rahatlıyor
});
observer.observe(document.body, { childList: true, subtree: true });


