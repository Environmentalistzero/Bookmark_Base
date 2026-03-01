const { useState, useEffect, useMemo, useRef, useCallback } = React;
const LucideIcon = ({ name, className = "", style = {}, size, strokeWidth = 2 }) => {
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (ref.current && window.lucide) {
      ref.current.innerHTML = "";
      const i = document.createElement("i");
      i.setAttribute("data-lucide", name);
      ref.current.appendChild(i);
      window.lucide.createIcons({
        root: ref.current,
        attrs: {
          "stroke-width": strokeWidth,
          width: size || "1em",
          height: size || "1em"
        }
      });
    }
  }, [name, size, strokeWidth]);
  return /* @__PURE__ */ React.createElement("span", { ref, className: `inline-flex items-center justify-center ${className}`, style: { ...style, verticalAlign: "middle", lineHeight: "1" } });
};
const TAG_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"];
const getRandomColor = () => TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  try {
    const d = new Date(Number(dateStr) || dateStr);
    if (!isNaN(d.getTime())) {
      return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
    }
    const parts = dateStr.split(/[-/.]/);
    if (parts.length === 3) {
      if (parts[0].length === 4) return `${parts[2].padStart(2, "0")}.${parts[1].padStart(2, "0")}.${parts[0]}`;
      if (dateStr.includes("/")) return `${parts[1].padStart(2, "0")}.${parts[0].padStart(2, "0")}.${parts[2]}`;
      return `${parts[0].padStart(2, "0")}.${parts[1].padStart(2, "0")}.${parts[2]}`;
    }
    return dateStr;
  } catch {
    return dateStr;
  }
};
const safeDecode = (str) => {
  if (!str) return "";
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str;
  }
};
const sanitizeUrl = (url) => {
  if (!url) return "#";
  const trimmed = url.trim();
  return trimmed.startsWith("http") ? trimmed : "https://" + trimmed;
};
const extractTweetId = (url) => {
  if (!url || typeof url !== "string") return null;
  if (url.includes("reddit.com")) {
    const match2 = url.match(/comments\/([a-zA-Z0-9]+)/);
    return match2 ? match2[1] : null;
  }
  const match = url.match(/status\/(\d+)/);
  return match && /^\d+$/.test(match[1]) ? match[1] : null;
};
const extractHandle = (url) => {
  if (!url || typeof url !== "string") return "@user";
  if (url.includes("reddit.com")) {
    const match2 = url.match(/r\/([a-zA-Z0-9_]+)/);
    return match2 ? `r/${match2[1]}` : "Reddit User";
  }
  const match = url.match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/);
  return match ? `@${match[1]}` : "@user";
};
const getHighResUrl = (url) => {
  if (!url) return "";
  if (url.match(/\.(mp4|webm|ogg|m3u8)/i)) return url;
  if (url.includes("name=")) return url.replace(/name=[a-zA-Z0-9_]+/, "name=orig");
  if (url.includes("pbs.twimg.com")) return url + (url.includes("?") ? "&" : "?") + "name=orig";
  return url;
};
const handleDownload = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "bookmark_base_media";
    a.click();
  } catch (err) {
    window.open(url, "_blank");
  }
};
const HlsVideoPlayer = ({ src, poster, className, controls, autoPlay, muted }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    let hls;
    if (src.includes(".m3u8") && window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls();
      hls.loadSource(src);
      hls.attachMedia(video);
      if (autoPlay) hls.on(window.Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {
      }));
    } else {
      video.src = src;
      if (autoPlay) video.play().catch(() => {
      });
    }
    return () => hls && hls.destroy();
  }, [src, autoPlay]);
  return /* @__PURE__ */ React.createElement("video", { ref: videoRef, className, controls, muted, poster, playsInline: true, preload: "metadata" });
};
const TweetEmbed = ({ tweetId }) => {
  const containerRef = useRef(null);
  useEffect(() => {
    if (window.twttr && tweetId && containerRef.current) {
      containerRef.current.innerHTML = "";
      window.twttr.widgets.createTweet(tweetId, containerRef.current, { theme: "light", align: "center", dnt: true });
    }
  }, [tweetId]);
  return /* @__PURE__ */ React.createElement("div", { ref: containerRef, className: "w-full min-h-[150px] flex items-center justify-center bg-slate-50 rounded-xl" });
};
const RedditEmbed = React.memo(({ url }) => {
  let embedUrl = "";
  try {
    const path = new URL(url).pathname;
    embedUrl = `https://www.redditmedia.com${path}?ref_source=embed&ref=share&embed=true`;
  } catch (e) {
    embedUrl = url;
  }
  return /* @__PURE__ */ React.createElement("div", { className: "w-full bg-slate-50 flex justify-center rounded-xl overflow-hidden", style: { minHeight: "300px" } }, /* @__PURE__ */ React.createElement(
    "iframe",
    {
      src: embedUrl,
      sandbox: "allow-scripts allow-same-origin allow-popups",
      style: { border: "none", width: "100%", height: "400px" },
      scrolling: "yes"
    }
  ));
});
const renderFormattedText = (text) => {
  if (!text) return "";
  const regex = /(\[[^\]]+\]\(https?:\/\/[^\s\)]+\)|https?:\/\/[^\s]+|#\w+|@\w+)/g;
  const lines = String(text).split("\n");
  return lines.map((line, i, arr) => {
    const parts = line.split(regex);
    const lineContent = parts.map((part, j) => {
      if (!part) return part;
      const mdMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)$/);
      if (mdMatch) {
        return /* @__PURE__ */ React.createElement("a", { key: j, href: mdMatch[2], target: "_blank", rel: "noopener noreferrer", className: "text-blue-500 hover:underline break-all", onClick: (e) => e.stopPropagation() }, mdMatch[1]);
      } else if (/^https?:\/\//.test(part)) {
        return /* @__PURE__ */ React.createElement("a", { key: j, href: part, target: "_blank", rel: "noopener noreferrer", className: "text-blue-500 hover:underline break-all", onClick: (e) => e.stopPropagation() }, part.replace(/^https?:\/\/(www\.)?/, ""));
      } else if (part.startsWith("#")) {
        return /* @__PURE__ */ React.createElement("a", { key: j, href: `https://x.com/hashtag/${part.substring(1)}`, target: "_blank", rel: "noopener noreferrer", className: "text-blue-500 hover:underline", onClick: (e) => e.stopPropagation() }, part);
      } else if (part.startsWith("@")) {
        return /* @__PURE__ */ React.createElement("a", { key: j, href: `https://x.com/${part.substring(1)}`, target: "_blank", rel: "noopener noreferrer", className: "text-blue-500 hover:underline", onClick: (e) => e.stopPropagation() }, part);
      }
      return part;
    });
    return /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, lineContent, i !== arr.length - 1 && /* @__PURE__ */ React.createElement("br", null));
  });
};
const CustomTweetCard = React.memo(({ bookmark, onImageClick }) => {
  const handle = bookmark.authorHandle || extractHandle(bookmark.url);
  const name = bookmark.authorName || handle;
  const avatar = bookmark.profileImg || (bookmark.url && bookmark.url.includes("reddit.com") ? "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_1.png" : "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png");
  const medias = bookmark.mediaUrls ? String(bookmark.mediaUrls).split(",").filter(Boolean) : [];
  const isVideo = bookmark.mediaType === "video" || medias.some((m) => String(m).match(/\.(mp4|webm|ogg|m3u8)/i));
  const isReddit = bookmark.url && bookmark.url.includes("reddit.com");
  return /* @__PURE__ */ React.createElement("div", { className: "text-left w-full" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-3 px-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 overflow-hidden pr-2" }, /* @__PURE__ */ React.createElement("img", { src: avatar, alt: name, className: "w-10 h-10 rounded-full object-cover border border-slate-100 shrink-0" }), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col overflow-hidden" }, /* @__PURE__ */ React.createElement("span", { className: "font-bold text-slate-900 text-[15px] leading-tight truncate" }, name), /* @__PURE__ */ React.createElement("span", { className: "text-slate-500 text-xs truncate" }, handle)))), /* @__PURE__ */ React.createElement("p", { className: "text-slate-800 text-[17px] leading-relaxed whitespace-pre-wrap mb-3 px-1 break-words overflow-hidden" }, renderFormattedText(bookmark.tweetText)), medias.length > 0 && /* @__PURE__ */ React.createElement("div", { className: `rounded-2xl overflow-hidden border border-slate-100 bg-transparent ${medias.length > 1 && !isVideo ? "grid grid-cols-2 gap-1 aspect-square md:aspect-video" : ""}` }, isVideo ? /* @__PURE__ */ React.createElement(
    "a",
    {
      href: getHighResUrl(medias[0]),
      target: "_blank",
      rel: "noopener noreferrer",
      className: "relative w-full bg-black flex items-center justify-center aspect-video cursor-pointer hover:opacity-90 transition-opacity",
      onClick: (e) => {
        e.preventDefault();
        e.stopPropagation();
        onImageClick(medias, 0, "video", bookmark.posterUrl);
      }
    },
    /* @__PURE__ */ React.createElement("video", { src: medias[0], className: "w-full h-full object-cover opacity-70 pointer-events-none", muted: true, playsInline: true }),
    /* @__PURE__ */ React.createElement("div", { className: "absolute w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center z-10 pointer-events-none" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "play", className: "text-white text-xl ml-1" }))
  ) : medias.map((url, idx) => {
    let itemClass = "w-full h-full object-cover cursor-pointer hover:opacity-95 bg-slate-100 transition-all active:scale-[0.98]";
    let wrapperClass = "relative";
    if (medias.length === 3 && idx === 0) wrapperClass = "row-span-2 h-full";
    return /* @__PURE__ */ React.createElement(
      "a",
      {
        key: idx,
        href: getHighResUrl(url),
        target: "_blank",
        rel: "noopener noreferrer",
        className: wrapperClass,
        onClick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          onImageClick(medias, idx, "image");
        }
      },
      /* @__PURE__ */ React.createElement("img", { src: url, alt: "Media", className: `${itemClass} pointer-events-none` })
    );
  })));
});
const CustomDropdown = ({ value, onChange, options, isMulti }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  let tags = [];
  let currentInput = value || "";
  if (isMulti) {
    const parts = (value || "").split(",");
    if (parts.length > 1) {
      tags = parts.slice(0, -1).map((t) => t.trim()).filter(Boolean);
      currentInput = parts[parts.length - 1].trimStart();
    } else {
      tags = [];
      currentInput = value || "";
    }
  }
  const handleInputChange = (e) => {
    if (isMulti) {
      const newText = e.target.value;
      const prefix = tags.length > 0 ? tags.join(", ") + ", " : "";
      onChange(prefix + newText);
    } else {
      onChange(e.target.value);
    }
    setIsOpen(true);
  };
  const handleRemoveTag = (e, tagToRemove) => {
    e.preventDefault();
    e.stopPropagation();
    const newTags = tags.filter((t) => t !== tagToRemove);
    const prefix = newTags.length > 0 ? newTags.join(", ") + ", " : "";
    onChange(prefix + currentInput);
  };
  const handleOptionSelect = (e, optValue) => {
    e.preventDefault();
    e.stopPropagation();
    if (isMulti) {
      const optTarget = optValue.toLowerCase();
      if (tags.includes(optTarget)) {
        const newTags = tags.filter((t) => t !== optTarget);
        const prefix = newTags.length > 0 ? newTags.join(", ") + ", " : "";
        onChange(prefix + currentInput);
      } else {
        const newTags = [...tags, optTarget];
        onChange(newTags.join(", ") + ", ");
      }
    } else {
      onChange(optValue);
      setIsOpen(false);
    }
  };
  const isOptionSelected = (optValue) => {
    if (!value) return false;
    if (!isMulti) return value.toLowerCase().trim() === optValue.toLowerCase().trim();
    return tags.includes(optValue.toLowerCase());
  };
  const searchVal = isMulti ? currentInput.trim().toLowerCase() : (value || "").trim().toLowerCase();
  const exactMatch = !isMulti ? options.some((opt) => opt.name.toLowerCase() === searchVal) : false;
  const filteredOptions = exactMatch ? options : options.filter((opt) => opt.name.toLowerCase().includes(searchVal));
  const allOptions = options.map((opt) => ({ ...opt }));
  return /* @__PURE__ */ React.createElement("div", { className: `tm-input-wrapper ${isOpen ? "open" : ""}`, ref: wrapperRef }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `w-full p-1.5 bg-slate-50 border border-slate-100 rounded-xl text-sm focus-within:ring-1 focus-within:ring-black transition-all flex items-center min-h-[46px] ${isMulti ? "flex-wrap gap-1.5" : ""}`,
      onClick: () => setIsOpen(true)
    },
    isMulti && tags.map((tag, idx) => {
      const tagObj = options.find((o) => o.name === tag);
      const bgColor = tagObj ? tagObj.color : "#cbd5e1";
      return /* @__PURE__ */ React.createElement("span", { key: `${tag}-${idx}`, className: "flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 shadow-sm rounded-lg text-[13px] font-bold text-slate-700" }, /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 rounded-full shrink-0", style: { backgroundColor: bgColor } }), tag, /* @__PURE__ */ React.createElement("button", { onClick: (e) => handleRemoveTag(e, tag), className: "ml-0.5 text-slate-400 hover:text-red-500 font-bold focus:outline-none" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "x", className: "text-[11px]" })));
    }),
    /* @__PURE__ */ React.createElement(
      "input",
      {
        type: "text",
        value: isMulti ? currentInput : value,
        onChange: handleInputChange,
        onFocus: () => setIsOpen(true),
        placeholder: isMulti ? tags.length === 0 ? "Etiket ara veya virg\xFClle ay\u0131r..." : "" : "Klas\xF6r ara veya se\xE7...",
        className: "flex-1 min-w-[120px] bg-transparent outline-none py-1 px-2"
      }
    )
  ), /* @__PURE__ */ React.createElement("div", { className: "tm-dropdown-arrow mr-2" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "chevron-down", className: "text-xs" })), /* @__PURE__ */ React.createElement("div", { className: `tm-dropdown-menu custom-scrollbar ${isOpen ? "show" : ""}` }, (isOpen ? filteredOptions : allOptions).length > 0 ? (isOpen ? filteredOptions : allOptions).map((opt) => {
    const selected = isOptionSelected(opt.name);
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: opt.id || opt.name,
        className: `tm-dropdown-item ${selected ? "selected" : ""}`,
        onClick: (e) => handleOptionSelect(e, opt.name)
      },
      /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: "w-2 h-2 rounded-full shrink-0", style: { backgroundColor: opt.color || "#cbd5e1" } }), isMulti ? `#${opt.name}` : opt.name),
      /* @__PURE__ */ React.createElement("div", { className: "tm-dropdown-checkbox" })
    );
  }) : /* @__PURE__ */ React.createElement("div", { className: "tm-dropdown-item", style: { color: "#94a3b8", justifyContent: "center" } }, "Sonu\xE7 bulunamad\u0131")));
};
const db = new window.Dexie("TweetmarkDB");
db.version(1).stores({
  bookmarks: "id",
  folders: "id",
  tags: "id",
  trash: "id"
});
const firebaseConfig = {
  apiKey: "AIzaSyDustCH0f1DYc8kkFG3qLMRrIooVp7s8Sw",
  authDomain: "bookmark-base.firebaseapp.com",
  projectId: "bookmark-base",
  storageBucket: "bookmark-base.firebasestorage.app",
  messagingSenderId: "760543001497",
  appId: "1:760543001497:web:e1914fb0ef9b03b52d7108"
};
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const fdb = firebase.firestore();
function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const [customFolders, setCustomFolders] = useState([]);
  const [customTags, setCustomTags] = useState([]);
  const [trash, setTrash] = useState([]);
  const [user, setUser] = useState(null);
  const [isDbLoaded, setIsDbLoaded] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [initialFocusedTweet, setInitialFocusedTweet] = useState(null);
  const [activeAddMenu, setActiveAddMenu] = useState(null);
  const [activeFilters, setActiveFilters] = useState(["All"]);
  const toggleFilter = (filter) => {
    setActiveFilters((prev) => {
      if (filter === "Trash") return ["Trash"];
      if (filter === "All" || filter === "AllTags") return ["All"];
      let next = prev.filter((f) => f !== "Trash" && f !== "All" && f !== "AllTags");
      if (next.includes(filter)) {
        next = next.filter((f) => f !== filter);
      } else {
        next.push(filter);
      }
      return next.length === 0 ? ["All"] : next;
    });
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [gridCols, setGridCols] = useState(() => parseInt(localStorage.getItem("tweetGridCols")) || 3);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);
  const [focusedTweet, setFocusedTweet] = useState(null);
  const [previewState, setPreviewState] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState([]);
  const [storageInfo, setStorageInfo] = useState({ used: 0, quota: 0 });
  useEffect(() => {
    try {
      const dataToMeasure = { bookmarks, customFolders, customTags, trash };
      const jsonString = JSON.stringify(dataToMeasure);
      const byteSize = new Blob([jsonString]).size;
      setStorageInfo({
        used: byteSize,
        quota: 100 * 1024 * 1024
        // Fixed 100MB Quota
      });
    } catch (err) {
      console.error("Failed to calculate archive size:", err);
    }
  }, [bookmarks, customFolders, customTags, trash]);
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);
  const lastLoadedUid = useRef(null);
  const isCloudUpdateActive = useRef(false);
  const saveQueueRef = useRef(Promise.resolve());
  const prevSyncStateRef = useRef(null);
  useEffect(() => {
    if (user && isDbLoaded && lastLoadedUid.current !== user.uid) {
      lastLoadedUid.current = user.uid;
      loadFromFirestore(user.uid);
    } else if (!user) {
      lastLoadedUid.current = null;
    }
  }, [user, isDbLoaded]);
  const handleLogin = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
      showToast("Logged in successfully!", "success");
    } catch (error) {
      console.error("Login Error:", error);
      showToast("Login failed. Check browser popup settings.", "error");
    }
  };
  const handleLogout = () => {
    auth.signOut();
    showToast("Logged out.", "info");
  };
  const isItemEqual = (a, b) => {
    if (a === b) return true;
    if (!a || !b) return false;
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    for (let key of keysA) {
      if (a[key] !== b[key]) {
        if (Array.isArray(a[key]) && Array.isArray(b[key])) {
          if (a[key].length !== b[key].length) return false;
          for (let i = 0; i < a[key].length; i++) {
            if (a[key][i] !== b[key][i]) return false;
          }
        } else {
          return false;
        }
      }
    }
    return true;
  };
  const loadFromFirestore = async (uid) => {
    if (!isDbLoaded) return;
    setIsSyncing(true);
    try {
      const metaDoc = await fdb.collection("users").doc(uid).collection("meta").doc("state").get();
      let cloudTime = 0;
      let isMigrated = false;
      let forceMigration = false;
      let oldData = null;
      if (metaDoc.exists) {
        const mData = metaDoc.data();
        cloudTime = typeof mData.lastUpdated === "number" ? mData.lastUpdated : mData.lastUpdated?.toMillis?.() || 0;
        isMigrated = mData.schemaVersion >= 2;
      } else {
        const oldDoc = await fdb.collection("users").doc(uid).get();
        if (oldDoc.exists) {
          oldData = oldDoc.data();
          cloudTime = typeof oldData.lastUpdated === "number" ? oldData.lastUpdated : oldData.lastUpdated?.toMillis?.() || 0;
          forceMigration = true;
        }
      }
      const localTime = parseInt(localStorage.getItem("tweetLastLocalUpdate")) || 0;
      if (forceMigration || cloudTime > localTime + 2e3 || bookmarks.length === 0 && customFolders.length === 0 && customTags.length === 0) {
        isCloudUpdateActive.current = true;
        let data = { bookmarks: [], folders: [], tags: [], trash: [] };
        if (forceMigration) {
          showToast("Upgrading data sync. Do not close...", "info");
          data.bookmarks = oldData.bookmarks || [];
          data.folders = oldData.folders || [];
          data.tags = oldData.tags || [];
          data.trash = oldData.trash || [];
          prevSyncStateRef.current = null;
          await saveToFirestore(uid, true, data);
          showToast("Upgraded to new Cloud Sync Architecture.", "success");
        } else if (isMigrated) {
          const [bSnap, fSnap, tSnap, trSnap] = await Promise.all([
            fdb.collection("users").doc(uid).collection("bookmarks").get(),
            fdb.collection("users").doc(uid).collection("folders").get(),
            fdb.collection("users").doc(uid).collection("tags").get(),
            fdb.collection("users").doc(uid).collection("trash").get()
          ]);
          data.bookmarks = bSnap.empty ? [] : bSnap.docs.map((d) => d.data());
          data.folders = fSnap.empty ? [] : fSnap.docs.map((d) => d.data());
          data.tags = tSnap.empty ? [] : tSnap.docs.map((d) => d.data());
          data.trash = trSnap.empty ? [] : trSnap.docs.map((d) => d.data());
        }
        setBookmarks(data.bookmarks);
        setCustomFolders(data.folders);
        setCustomTags(data.tags);
        setTrash(data.trash);
        prevSyncStateRef.current = data;
        localStorage.setItem("tweetLastLocalUpdate", cloudTime.toString());
        showToast("Cloud sync complete!", "success");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            isCloudUpdateActive.current = false;
          });
        });
      } else if (localTime > cloudTime + 2e3) {
        prevSyncStateRef.current = null;
        await saveToFirestore(uid, true);
      } else {
        prevSyncStateRef.current = { bookmarks, folders: customFolders, tags: customTags, trash };
      }
    } catch (err) {
      console.error("Cloud Load Error:", err);
      showToast("Cloud load failed. Please check your connection.", "error");
    } finally {
      setIsSyncing(false);
    }
  };
  const saveToFirestore = async (uid, force = false, explicitData = null) => {
    if (!uid || !isDbLoaded) return;
    const currentBookmarks = explicitData ? explicitData.bookmarks : bookmarks;
    const currentFolders = explicitData ? explicitData.folders : customFolders;
    const currentTags = explicitData ? explicitData.tags : customTags;
    const currentTrash = explicitData ? explicitData.trash : trash;
    if (!force && currentBookmarks.length === 0 && currentFolders.length === 0 && currentTags.length === 0) return;
    const saveTask = async () => {
      try {
        const prevState = prevSyncStateRef.current;
        let batch = fdb.batch();
        let opsCount = 0;
        const commitBatch = async () => {
          if (opsCount > 0) {
            try {
              await batch.commit();
            } catch (commitErr) {
              console.error("Batch commit failed:", commitErr);
              throw commitErr;
            }
            batch = fdb.batch();
            opsCount = 0;
          }
        };
        const applyDiff = async (collectionName, currentItems, prevItems) => {
          if (!prevItems) {
            for (const item of currentItems) {
              const itemId = item.id || item.name;
              if (itemId == null) continue;
              const id = String(itemId);
              const ref = fdb.collection("users").doc(uid).collection(collectionName).doc(id);
              batch.set(ref, item);
              opsCount++;
              if (opsCount >= 490) await commitBatch();
            }
            return;
          }
          const prevMap = new Map((prevItems || []).map((i) => [String(i.id || i.name), i]));
          const currMap = new Map((currentItems || []).map((i) => [String(i.id || i.name), i]));
          for (const [id, item] of currMap.entries()) {
            if (id === "undefined" || id === "null") continue;
            const prevItem = prevMap.get(id);
            if (!prevItem || !isItemEqual(prevItem, item)) {
              const ref = fdb.collection("users").doc(uid).collection(collectionName).doc(id);
              batch.set(ref, item);
              opsCount++;
              if (opsCount >= 490) await commitBatch();
            }
          }
          for (const id of prevMap.keys()) {
            if (!currMap.has(id)) {
              const ref = fdb.collection("users").doc(uid).collection(collectionName).doc(id);
              batch.delete(ref);
              opsCount++;
              if (opsCount >= 490) await commitBatch();
            }
          }
        };
        await applyDiff("bookmarks", currentBookmarks, prevState?.bookmarks);
        await applyDiff("folders", currentFolders, prevState?.folders);
        await applyDiff("tags", currentTags, prevState?.tags);
        await applyDiff("trash", currentTrash, prevState?.trash);
        await commitBatch();
        await fdb.collection("users").doc(uid).collection("meta").doc("state").set({
          lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
          schemaVersion: 2
        });
        if (force && !prevState) {
          try {
            const rootDoc = await fdb.collection("users").doc(uid).get();
            if (rootDoc.exists && rootDoc.data().bookmarks) {
              await fdb.collection("users").doc(uid).update({
                bookmarks: firebase.firestore.FieldValue.delete(),
                folders: firebase.firestore.FieldValue.delete(),
                tags: firebase.firestore.FieldValue.delete(),
                trash: firebase.firestore.FieldValue.delete()
              });
            }
          } catch (e) {
            console.warn("Failed to clean up old root doc fields.", e);
          }
        }
        localStorage.setItem("tweetLastLocalUpdate", Date.now().toString());
        prevSyncStateRef.current = { bookmarks: currentBookmarks, folders: currentFolders, tags: currentTags, trash: currentTrash };
      } catch (err) {
        console.error("Cloud Sync Error:", err);
        if (force) showToast("Failed to save to cloud. Will retry later.", "error");
        throw err;
      }
    };
    const executeTask = saveQueueRef.current.then(saveTask);
    saveQueueRef.current = executeTask.catch((e) => {
      console.error("Queue boundary recovered from error", e);
    });
    return executeTask;
  };
  const [dragOverFolderId, setDragOverFolderId] = useState(null);
  const dragItemRef = useRef(null);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const observerTarget = useRef(null);
  const handleImageClick = React.useCallback((medias, idx, type, poster) => {
    setPreviewState({ medias, currentIndex: idx, mediaType: type, poster });
  }, []);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderNameInput, setFolderNameInput] = useState("");
  const [folderColorInput, setFolderColorInput] = useState("#3b82f6");
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagNameInput, setTagNameInput] = useState("");
  const [tagColorInput, setTagColorInput] = useState("#64748b");
  const [isTagsExpanded, setIsTagsExpanded] = useState(true);
  const [isNoteEditing, setIsNoteEditing] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem("tweetAccentColor") || "#000000");
  const [theme, setTheme] = useState(() => localStorage.getItem("tweetTheme") || "light");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [autoBackup, setAutoBackup] = useState(() => localStorage.getItem("tweetAutoBackup") === "true");
  const [lastBackup, setLastBackup] = useState(() => parseInt(localStorage.getItem("tweetLastBackup")) || 0);
  const [showBrandLines, setShowBrandLines] = useState(() => localStorage.getItem("tweetShowBrandLines") !== "false");
  const [brandLineStyle, setBrandLineStyle] = useState(() => localStorage.getItem("tweetBrandLineStyle") || "bar");
  useEffect(() => {
    localStorage.setItem("tweetShowBrandLines", showBrandLines);
  }, [showBrandLines]);
  useEffect(() => {
    localStorage.setItem("tweetBrandLineStyle", brandLineStyle);
  }, [brandLineStyle]);
  useEffect(() => {
    localStorage.setItem("tweetTheme", theme);
  }, [theme]);
  useEffect(() => {
    localStorage.setItem("tweetAutoBackup", autoBackup);
  }, [autoBackup]);
  useEffect(() => {
    if (!autoBackup || !isDbLoaded) return;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1e3;
    if (now - lastBackup > oneDay) {
      const timer = setTimeout(() => {
        handleExportJSON(true);
        const timestamp = Date.now();
        setLastBackup(timestamp);
        localStorage.setItem("tweetLastBackup", timestamp);
        showToast("Automatic backup completed", "success");
      }, 5e3);
      return () => clearTimeout(timer);
    }
  }, [autoBackup, isDbLoaded, bookmarks.length]);
  const [toasts, setToasts] = useState([]);
  const toastIdRef = useRef(0);
  const showToast = useCallback((message, type = "info", undoAction = null, duration = 4e3) => {
    const id = ++toastIdRef.current;
    setToasts((prev) => [...prev, { id, message, type, undoAction }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
    return id;
  }, []);
  const dismissToast = useCallback((id) => setToasts((prev) => prev.filter((t) => t.id !== id)), []);
  useEffect(() => {
    const loadDb = async () => {
      try {
        const bCount = await db.bookmarks.count();
        const fCount = await db.folders.count();
        const tCount = await db.tags.count();
        if (bCount === 0 && fCount === 0 && tCount === 0) {
          const safeParse = (key) => {
            try {
              const d = localStorage.getItem(key);
              return d ? JSON.parse(d) : [];
            } catch (e) {
              return [];
            }
          };
          const oldB = safeParse("tweetBookmarks_v1");
          const oldF = safeParse("tweetFolders_v2");
          const oldT = safeParse("tweetTags_v1");
          const oldTr = safeParse("tweetTrash_v1");
          setBookmarks(oldB);
          setCustomFolders(oldF);
          setCustomTags(oldT);
          setTrash(oldTr);
        } else {
          const b = await db.bookmarks.toArray();
          const f = await db.folders.toArray();
          const t = await db.tags.toArray();
          const tr = await db.trash.toArray();
          setBookmarks(b);
          setCustomFolders(f);
          setCustomTags(t);
          setTrash(tr);
        }
      } catch (err) {
        console.error("Dexie Load Error", err);
      } finally {
        setIsDbLoaded(true);
      }
    };
    loadDb();
  }, []);
  useEffect(() => {
    const handleExternalMessage = (request, sender, sendResponse) => {
      if (request.type === "GET_APP_DATA") {
        sendResponse({
          folders: customFolders,
          tags: customTags
        });
      }
      return true;
    };
    if (window.chrome && chrome.runtime && chrome.runtime.onMessageExternal) {
      chrome.runtime.onMessageExternal.addListener(handleExternalMessage);
    }
    return () => {
      if (window.chrome && chrome.runtime && chrome.runtime.onMessageExternal) {
        chrome.runtime.onMessageExternal.removeListener(handleExternalMessage);
      }
    };
  }, [customFolders, customTags]);
  useEffect(() => {
    const checkPendingSync = () => {
      if (!isDbLoaded) return;
      try {
        const pendingStr = localStorage.getItem("pending_twitter_sync");
        if (pendingStr) {
          const pendingBookmarks = JSON.parse(pendingStr);
          if (pendingBookmarks && pendingBookmarks.length > 0) {
            setBookmarks((prev) => {
              const existingTweetIds = new Set(prev.map((b) => b.tweetId));
              const uniquePending = pendingBookmarks.filter((b) => !existingTweetIds.has(String(b.tweetId)));
              return uniquePending.length > 0 ? [...uniquePending, ...prev] : prev;
            });
            localStorage.removeItem("pending_twitter_sync");
          }
        }
        const pendingUpdatesStr = localStorage.getItem("pending_twitter_updates");
        if (pendingUpdatesStr) {
          const updates = JSON.parse(pendingUpdatesStr);
          if (updates && updates.length > 0) {
            setBookmarks((prev) => {
              let newPrev = [...prev];
              updates.forEach((upd) => {
                const idx = newPrev.findIndex((b) => b.tweetId === String(upd.tweetId));
                if (idx !== -1) {
                  newPrev[idx] = { ...newPrev[idx], folder: upd.folder, tags: upd.tags, description: upd.note };
                }
              });
              return newPrev;
            });
            const tagsFromUpdates = updates.flatMap((u) => u.tags || []);
            if (tagsFromUpdates.length > 0) {
              setCustomTags((prevTags) => {
                const newTagsList = [...prevTags];
                let tagsChanged = false;
                tagsFromUpdates.forEach((tag) => {
                  if (tag && !newTagsList.some((t) => t.name === tag)) {
                    newTagsList.push({ id: "t_" + Math.random().toString(36).substr(2, 9), name: tag, color: getRandomColor() });
                    tagsChanged = true;
                  }
                });
                return tagsChanged ? newTagsList : prevTags;
              });
            }
            localStorage.removeItem("pending_twitter_updates");
          }
        }
      } catch (err) {
        console.error("Sync error:", err);
      }
    };
    checkPendingSync();
    window.addEventListener("twitter-bookmarks-synced", checkPendingSync);
    return () => window.removeEventListener("twitter-bookmarks-synced", checkPendingSync);
  }, [isDbLoaded]);
  useEffect(() => {
    if (!isDbLoaded) return;
    const handler = setTimeout(() => {
      const syncDB = async () => {
        try {
          await db.transaction("rw", db.bookmarks, db.folders, db.tags, db.trash, async () => {
            const doIncrementalSync = async (table, items) => {
              const existingIds = new Set(await table.toCollection().primaryKeys());
              const currentIds = new Set(items.map((item) => item.id));
              const toDelete = [...existingIds].filter((id) => !currentIds.has(id));
              if (toDelete.length) await table.bulkDelete(toDelete);
              if (items.length) await table.bulkPut(items);
            };
            await doIncrementalSync(db.bookmarks, bookmarks);
            await doIncrementalSync(db.folders, customFolders);
            await doIncrementalSync(db.tags, customTags);
            await doIncrementalSync(db.trash, trash);
          });
          if (user && isDbLoaded && !isCloudUpdateActive.current) {
            saveToFirestore(user.uid);
          }
          window.dispatchEvent(new CustomEvent("tweetmark-data-changed"));
        } catch (err) {
          console.error("Dexie sync error:", err);
        }
      };
      syncDB();
    }, 3e3);
    return () => clearTimeout(handler);
  }, [bookmarks, customFolders, customTags, trash, isDbLoaded, user]);
  useEffect(() => {
    localStorage.setItem("tweetGridCols", gridCols.toString());
    localStorage.setItem("tweetAccentColor", accentColor);
  }, [gridCols, accentColor]);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);
  useEffect(() => {
    setVisibleCount(20);
  }, [activeFolder, debouncedSearchQuery, gridCols]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((prev) => prev + 20);
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (!window.twttr) {
      const script = document.createElement("script");
      script.src = "https://platform.twitter.com/widgets.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
  useEffect(() => {
    if (previewState && previewState.medias && previewState.mediaType !== "video") {
      previewState.medias.forEach((url) => {
        const img = new Image();
        img.src = getHighResUrl(url);
      });
    }
  }, [previewState?.medias]);
  const handleExportJSON = (isAuto = false) => {
    try {
      const payload = {
        bookmarks,
        customFolders,
        customTags,
        trash,
        exportDate: (/* @__PURE__ */ new Date()).toISOString(),
        version: "2.0"
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = (/* @__PURE__ */ new Date()).toLocaleDateString().replace(/\//g, "-");
      a.download = isAuto ? `bookmark_base_auto_backup_${dateStr}.json` : `bookmark_base_manual_backup_${dateStr}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error("Backup failed:", err);
      showToast("Backup failed. Check console for details.", "error");
    }
  };
  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.size + storageInfo.used >= 100 * 1024 * 1024) {
      showToast("Archive Limit (100 MB) reached. Please delete some items first.", "error");
      event.target.value = null;
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        let valid = true;
        if (data.bookmarks && !Array.isArray(data.bookmarks)) valid = false;
        if (data.customFolders && !Array.isArray(data.customFolders)) valid = false;
        if (data.customTags && !Array.isArray(data.customTags)) valid = false;
        if (data.trash && !Array.isArray(data.trash)) valid = false;
        if (data.bookmarks && valid) {
          const hasInvalidBookmark = data.bookmarks.some((b) => typeof b !== "object" || !b.id || !b.tweetId);
          if (hasInvalidBookmark) valid = false;
        }
        if (!valid) {
          showToast("Invalid or corrupted JSON file. Operation cancelled.", "error");
          return;
        }
        if (data.bookmarks && Array.isArray(data.bookmarks)) setBookmarks(data.bookmarks);
        if (data.customFolders && Array.isArray(data.customFolders)) setCustomFolders(data.customFolders);
        if (data.customTags && Array.isArray(data.customTags)) setCustomTags(data.customTags);
        if (data.trash && Array.isArray(data.trash)) setTrash(data.trash);
        showToast("Backup loaded successfully!", "success");
      } catch (err) {
        showToast("JSON parse error! Make sure the file is not corrupted.", "error");
        console.error("Import JSON Error:", err);
      }
    };
    reader.readAsText(file);
  };
  const handleAddBookmark = (e) => {
    e.preventDefault();
    if (storageInfo.used >= 100 * 1024 * 1024) {
      return showToast("Archive Limit Reached (100 MB). Please delete items to free up space.", "error");
    }
    const tweetId = extractTweetId(newUrl);
    if (!tweetId) return showToast("Please enter a valid Twitter or Reddit link.", "error");
    const tagsArray = newTags.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    const newTagsList = [...customTags];
    let tagsChanged = false;
    tagsArray.forEach((tag) => {
      if (!newTagsList.some((t) => t.name === tag)) {
        newTagsList.push({ id: "t_" + Math.random().toString(36).substr(2, 9), name: tag, color: getRandomColor() });
        tagsChanged = true;
      }
    });
    if (tagsChanged) setCustomTags(newTagsList);
    const now = /* @__PURE__ */ new Date();
    const dateStr = now.toLocaleDateString("tr-TR");
    const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    const newBtn = {
      id: Date.now().toString(),
      tweetId,
      url: sanitizeUrl(newUrl),
      folder: newFolder.trim() || "General",
      tags: tagsArray,
      description: newDesc.trim(),
      date: `${dateStr} ${timeStr}`,
      timestamp: now.getTime()
    };
    setBookmarks([newBtn, ...bookmarks]);
    setIsModalOpen(false);
    setNewUrl("");
    setNewFolder("");
    setNewTags("");
    setNewDesc("");
  };
  const handleMoveToTrash = (e, id) => {
    if (e) e.stopPropagation();
    const item = bookmarks.find((b) => b.id === id);
    if (item) {
      setTrash((prev) => [{ ...item, deletedAt: Date.now() }, ...prev]);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      if (focusedTweet && focusedTweet.id === id) setFocusedTweet(null);
      showToast("Moved to trash", "info", () => {
        setTrash((prev) => prev.filter((t) => t.id !== id));
        setBookmarks((prev) => [item, ...prev]);
      });
    }
  };
  const handleRestoreFromTrash = (e, id) => {
    e.stopPropagation();
    const item = trash.find((t) => t.id === id);
    if (item) {
      const { deletedAt, ...rest } = item;
      setBookmarks((prev) => [rest, ...prev]);
      setTrash((prev) => prev.filter((t) => t.id !== id));
    }
  };
  const handlePermanentDelete = (e, id) => {
    e.stopPropagation();
    const item = trash.find((t) => t.id === id);
    setTrash((prev) => prev.filter((t) => t.id !== id));
    showToast("Permanently deleted", "info", () => {
      if (item) setTrash((prev) => [item, ...prev]);
    });
  };
  const handleClearTrash = () => {
    if (trash.length === 0) return;
    const oldTrash = [...trash];
    setTrash([]);
    showToast(`${oldTrash.length} item(s) permanently deleted`, "info", () => {
      setTrash(oldTrash);
    });
  };
  useEffect(() => {
    if (trash.length === 0) return;
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1e3;
    const expired = trash.filter((t) => t.deletedAt && t.deletedAt < thirtyDaysAgo);
    if (expired.length > 0) {
      setTrash((prev) => prev.filter((t) => !t.deletedAt || t.deletedAt >= thirtyDaysAgo));
      console.log(`Auto-cleaned ${expired.length} expired trash item(s)`);
    }
  }, [trash.length]);
  const handleSaveFolder = (e) => {
    e.preventDefault();
    const name = folderNameInput.trim();
    if (!name) return;
    if (!editingFolder && customFolders.some((f) => f.name.toLowerCase() === name.toLowerCase())) {
      showToast("Folder already exists!", "error");
      return;
    }
    if (editingFolder) {
      setCustomFolders(customFolders.map((f) => f.id === editingFolder.id ? { ...f, name, color: folderColorInput } : f));
      setBookmarks(bookmarks.map((b) => b.folder === editingFolder.name ? { ...b, folder: name } : b));
    } else {
      setCustomFolders([...customFolders, { id: "f_" + Date.now(), name, color: folderColorInput, parentId: null, isPinned: false }]);
    }
    setIsFolderModalOpen(false);
    setEditingFolder(null);
  };
  const handleSaveTag = (e) => {
    e.preventDefault();
    const name = tagNameInput.trim().toLowerCase();
    if (!name) return;
    if (!editingTag && customTags.some((t) => t.name.toLowerCase() === name.toLowerCase())) {
      showToast("Tag already exists!", "error");
      return;
    }
    if (editingTag) {
      setCustomTags(customTags.map((t) => t.id === editingTag.id ? { ...t, name, color: tagColorInput } : t));
      setBookmarks(bookmarks.map((b) => ({
        ...b,
        tags: (b.tags || []).map((tag) => tag === editingTag.name ? name : tag)
      })));
    } else {
      setCustomTags([...customTags, { id: "t_" + Date.now(), name, color: tagColorInput }]);
    }
    setIsTagModalOpen(false);
    setEditingTag(null);
  };
  const getFolderAndDescendants = (folderId, list) => {
    let names = [list.find((f) => f.id === folderId).name];
    list.filter((f) => f.parentId === folderId).forEach((c) => {
      names = names.concat(getFolderAndDescendants(c.id, list));
    });
    return names.filter(Boolean);
  };
  const selectFolderFilter = (folderName) => {
    const nextFolder = folderName || "Unsorted";
    setActiveFolder(nextFolder);
    if (!folderName || folderName === "Unsorted" || folderName === "General" || folderName === "Genel") {
      return;
    }
    const targetFolder = customFolders.find((f) => f.name === folderName);
    if (!targetFolder) return;
    const parentIds = [];
    let currentParentId = targetFolder.parentId;
    while (currentParentId) {
      parentIds.push(currentParentId);
      const parentFolder = customFolders.find((f) => f.id === currentParentId);
      currentParentId = parentFolder?.parentId || null;
    }
    if (parentIds.length > 0) {
      setExpandedFolders((prev) => [.../* @__PURE__ */ new Set([...prev, ...parentIds])]);
    }
  };
  const selectTagFilter = (tagName) => {
    setActiveFolder(`tag:${tagName}`);
    setIsTagsExpanded(true);
  };
  const topLevelFolders = useMemo(() => customFolders.filter((f) => !f.parentId), [customFolders]);
  const folderCounts = useMemo(() => {
    const directCounts = {};
    bookmarks.forEach((b) => {
      const fName = b.folder || "General";
      directCounts[fName] = (directCounts[fName] || 0) + 1;
    });
    const childrenMap = {};
    const folderById = {};
    customFolders.forEach((f) => {
      folderById[f.id] = f;
      childrenMap[f.id] = [];
    });
    customFolders.forEach((f) => {
      if (f.parentId && childrenMap[f.parentId]) {
        childrenMap[f.parentId].push(f.id);
      }
    });
    const counts = {};
    const getCount = (fId) => {
      if (counts[fId] !== void 0) return counts[fId];
      const folder = folderById[fId];
      if (!folder) return 0;
      let total = directCounts[folder.name] || 0;
      if (childrenMap[fId]) {
        childrenMap[fId].forEach((childId) => {
          total += getCount(childId);
        });
      }
      counts[fId] = total;
      return total;
    };
    customFolders.forEach((f) => {
      counts[f.id] = getCount(f.id);
    });
    return counts;
  }, [bookmarks, customFolders]);
  const tagCounts = useMemo(() => {
    const ObjectCounts = {};
    bookmarks.forEach((b) => {
      (b.tags || []).forEach((t) => {
        ObjectCounts[t] = (ObjectCounts[t] || 0) + 1;
      });
    });
    return ObjectCounts;
  }, [bookmarks]);
  const getCumulativeCount = (fId) => folderCounts[fId] || 0;
  const unsortedCount = useMemo(() => bookmarks.filter((b) => !b.folder || b.folder === "General" || b.folder === "Genel").length, [bookmarks]);
  const filteredBookmarks = useMemo(() => {
    const source = activeFilters.includes("Trash") ? trash : bookmarks;
    const filtered = source.filter((b) => {
      let mF = false;
      if (activeFilters.includes("All") || activeFilters.includes("Trash") || activeFilters.length === 0) {
        mF = true;
      } else {
        mF = activeFilters.some((filter) => {
          if (filter === "Unsorted") return !b.folder || b.folder === "General" || b.folder === "Genel";
          if (filter.startsWith("tag:")) {
            const tagName = filter.split(":")[1];
            return (b.tags || []).includes(tagName);
          }
          const f = customFolders.find((f2) => f2.name === filter);
          return f ? getFolderAndDescendants(f.id, customFolders).includes(b.folder) : b.folder === filter;
        });
      }
      const s = debouncedSearchQuery.toLowerCase();
      return mF && (!s || (b.tags || []).some((t) => t.includes(s)) || (b.description || "").toLowerCase().includes(s) || (b.tweetText || "").toLowerCase().includes(s) || (b.authorName || "").toLowerCase().includes(s));
    });
    return filtered.sort((a, b) => {
      const aTime = a.timestamp || parseInt(a.id) || 0;
      const bTime = b.timestamp || parseInt(b.id) || 0;
      return bTime - aTime;
    });
  }, [bookmarks, trash, activeFilters, debouncedSearchQuery, customFolders]);
  const isDescendantOf = (targetId, folderId) => {
    const children = customFolders.filter((f) => f.parentId === folderId);
    for (const child of children) {
      if (child.id === targetId) return true;
      if (isDescendantOf(targetId, child.id)) return true;
    }
    return false;
  };
  const FolderItem = ({ folder, depth = 0 }) => {
    const children = customFolders.filter((f) => f.parentId === folder.id);
    const isExpanded = expandedFolders.includes(folder.id);
    const isActive = activeFilters.includes(folder.name);
    const isDragOver = dragOverFolderId === folder.id;
    return /* @__PURE__ */ React.createElement("div", { className: "w-full" }, /* @__PURE__ */ React.createElement(
      "div",
      {
        draggable: true,
        onDragStart: (e) => {
          e.stopPropagation();
          dragItemRef.current = { type: "folder", id: folder.id };
        },
        onDragOver: (e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOverFolderId(folder.id);
        },
        onDragLeave: (e) => {
          e.stopPropagation();
          if (dragOverFolderId === folder.id) setDragOverFolderId(null);
        },
        onDrop: (e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragOverFolderId(null);
          const data = dragItemRef.current;
          if (!data) return;
          if (data.type === "folder") {
            if (data.id === folder.id) return;
            if (isDescendantOf(folder.id, data.id)) return;
            setCustomFolders((prev) => prev.map((f) => f.id === data.id ? { ...f, parentId: folder.id } : f));
          } else if (data.type === "tweet") {
            setBookmarks((prev) => prev.map((b) => data.ids.includes(b.id) ? { ...b, folder: folder.name } : b));
          }
          dragItemRef.current = null;
        },
        className: `group flex items-center rounded-xl transition-all cursor-pointer ${isActive ? "text-white" : "text-slate-600 hover:bg-slate-100"} ${isDragOver ? "ring-2 ring-blue-400 ring-inset bg-blue-50/70" : ""}`,
        style: { marginLeft: `${depth * 1}rem`, padding: "0.3rem 0", ...isActive && !isDragOver ? { backgroundColor: accentColor } : {} }
      },
      /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
        e.stopPropagation();
        setExpandedFolders((prev) => prev.includes(folder.id) ? prev.filter((x) => x !== folder.id) : [...prev, folder.id]);
      }, className: `w-5 h-5 ml-1 flex items-center justify-center ${children.length === 0 ? "invisible" : ""}` }, /* @__PURE__ */ React.createElement(LucideIcon, { name: isExpanded ? "chevron-down" : "chevron-right", size: 10 })),
      /* @__PURE__ */ React.createElement("button", { onClick: () => toggleFilter(folder.name), className: "flex-1 flex items-center gap-2 text-[15px] font-medium truncate py-1.5 pl-1 text-left" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "folder", className: "text-[14px]", style: { color: isActive ? "#fff" : folder.color } }), " ", /* @__PURE__ */ React.createElement("span", null, folder.name)),
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center w-8 justify-center pr-2 shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold opacity-60 group-hover:hidden" }, getCumulativeCount(folder.id)), /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
        e.stopPropagation();
        setEditingFolder(folder);
        setFolderNameInput(folder.name);
        setFolderColorInput(folder.color);
        setIsFolderModalOpen(true);
      }, className: "hidden group-hover:block text-slate-400 hover:text-blue-500" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "pen", className: "text-[10px]" })))
    ), isExpanded && children.map((c) => /* @__PURE__ */ React.createElement(FolderItem, { key: c.id, folder: c, depth: depth + 1 })));
  };
  const [windowWidthState, setWindowWidthState] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWindowWidthState(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const effectiveCols = useMemo(() => {
    const w = windowWidthState || window.innerWidth;
    if (w < 640) return 1;
    if (w < 1024) return Math.min(2, gridCols || 1);
    if (w < 1280) return Math.min(3, gridCols || 1);
    if (w < 1536) return Math.min(4, gridCols || 1);
    return gridCols || 1;
  }, [windowWidthState, gridCols]);
  const bookmarkColumns = useMemo(() => {
    const cols = Array.from({ length: effectiveCols }, () => []);
    if (filteredBookmarks && Array.isArray(filteredBookmarks)) {
      filteredBookmarks.slice(0, visibleCount).forEach((b, i) => {
        cols[i % effectiveCols].push(b);
      });
    }
    return cols;
  }, [filteredBookmarks, visibleCount, effectiveCols]);
  const gridConfig = {
    1: { padding: "max-w-3xl" },
    2: { padding: "max-w-5xl" },
    3: { padding: "max-w-6xl" },
    4: { padding: "max-w-[90rem]" },
    5: { padding: "max-w-[120rem]" }
  }[gridCols] || { padding: "max-w-6xl" };
  if (!isDbLoaded) {
    return /* @__PURE__ */ React.createElement("div", { className: "flex h-screen w-full items-center justify-center bg-slate-50 flex-col gap-4" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "loader", className: "fa-spin text-4xl text-slate-300" }), /* @__PURE__ */ React.createElement("p", { className: "font-bold text-slate-500 uppercase tracking-widest text-sm" }, "Loading Database..."));
  }
  return /* @__PURE__ */ React.createElement("div", { className: `flex h-screen w-full bg-slate-50 text-slate-800 font-sans overflow-hidden theme-${theme}` }, isSidebarOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 z-[80] sm:hidden" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-slate-900/50 backdrop-blur-sm", onClick: () => setIsSidebarOpen(false) }), /* @__PURE__ */ React.createElement("aside", { className: "relative w-72 h-full bg-white shadow-2xl flex flex-col animate-slide-in-left" }, /* @__PURE__ */ React.createElement("div", { className: "p-5 flex items-center justify-between border-b border-slate-50" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-[5px]" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "bookmark", className: "shrink-0 -translate-y-[1px]", style: { color: theme === "dark" ? "#fff" : "#000" }, size: 45, strokeWidth: 2.5 }), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-start" }, /* @__PURE__ */ React.createElement("h1", { className: "text-[28px] tracking-wide leading-[0.85] mb-1 whitespace-nowrap", style: { fontFamily: '"Londrina Solid", sans-serif', fontWeight: 900, letterSpacing: "0.5px" } }, "Bookmark Base"), /* @__PURE__ */ React.createElement("span", { className: "text-[15px] text-slate-500 leading-none", style: { fontFamily: '"Londrina Solid", sans-serif', fontWeight: 400, letterSpacing: "0.2px" } }, "Save Your Feed"))), /* @__PURE__ */ React.createElement("button", { onClick: () => setIsSidebarOpen(false), className: "w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "x", className: "text-slate-400" }))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto py-6 px-5 space-y-6 custom-scrollbar" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-0.5" }, /* @__PURE__ */ React.createElement("div", { onClick: () => {
    setActiveFolder("All");
    setIsSidebarOpen(false);
  }, className: `flex items-center rounded-xl transition-all cursor-pointer ${activeFolder === "All" ? "text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`, style: activeFolder === "All" ? { backgroundColor: accentColor } : {} }, /* @__PURE__ */ React.createElement("button", { className: "flex-1 flex items-center gap-3 px-3 py-2 text-[15px] font-medium text-left" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "layers", size: 18 }), " All Bookmarks"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center w-8 justify-center pr-2 shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold opacity-60" }, bookmarks.length))), /* @__PURE__ */ React.createElement("div", { onClick: () => {
    setActiveFolder("Unsorted");
    setIsSidebarOpen(false);
  }, className: `flex items-center rounded-xl transition-all cursor-pointer ${activeFolder === "Unsorted" ? "text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`, style: activeFolder === "Unsorted" ? { backgroundColor: accentColor } : {} }, /* @__PURE__ */ React.createElement("button", { className: "flex-1 flex items-center gap-3 px-3 py-2 text-[15px] font-medium text-left" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "inbox", size: 18 }), " Unsorted"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center w-8 justify-center pr-2 shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold opacity-60" }, unsortedCount)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-3 px-2" }, /* @__PURE__ */ React.createElement("h2", { className: "text-xs font-bold text-slate-600 uppercase tracking-wider" }, "Folders"), /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
    e.stopPropagation();
    setEditingFolder(null);
    setFolderNameInput("");
    setFolderColorInput("#3b82f6");
    setIsFolderModalOpen(true);
  }, className: "w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center hover:text-black" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "plus", size: 12 }))), /* @__PURE__ */ React.createElement("div", { className: "space-y-0.5" }, customFolders.filter((f) => !f.parentId).map((f) => /* @__PURE__ */ React.createElement(FolderItem, { key: f.id, folder: f })))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "group flex justify-between items-center mb-3 px-2 cursor-pointer tag-header transition-all py-1", onClick: () => setIsTagsExpanded(!isTagsExpanded) }, /* @__PURE__ */ React.createElement("h2", { className: "text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: isTagsExpanded ? "chevron-down" : "chevron-right", size: 10 }), " Tags"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
    e.stopPropagation();
    setActiveFolder("AllTags");
    setIsSidebarOpen(false);
  }, className: "w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-black transition-all", title: "View all tags" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "eye", className: "text-[10px]" })), /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
    e.stopPropagation();
    setEditingTag(null);
    setTagNameInput("");
    setTagColorInput("#64748b");
    setIsTagModalOpen(true);
  }, className: "w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center hover:text-black" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "plus", size: 12 })))), isTagsExpanded && /* @__PURE__ */ React.createElement("div", { className: "space-y-0.5" }, customTags.map((tag) => {
    return /* @__PURE__ */ React.createElement("div", { key: tag.id, onClick: () => {
      setActiveFolder(`tag:${tag.name}`);
      setIsSidebarOpen(false);
    }, className: `flex items-center cursor-pointer rounded-xl transition-all px-3 py-2 ${activeFolder === `tag:${tag.name}` ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"}` }, /* @__PURE__ */ React.createElement("span", { className: "font-black mr-1.5", style: { color: tag.color } }, "#"), /* @__PURE__ */ React.createElement("span", { className: "text-[14px] font-medium" }, tag.name), /* @__PURE__ */ React.createElement("span", { className: "ml-auto text-[11px] font-bold opacity-50" }, tagCounts[tag.name] || 0));
  })))), /* @__PURE__ */ React.createElement("div", { className: "p-4 border-t border-slate-100 space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: `p-3 rounded-2xl border transition-all ${user ? "bg-blue-50/50 border-blue-100" : "bg-slate-50 border-slate-100"}` }, user ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("img", { src: user.photoURL, alt: "User", className: "w-8 h-8 rounded-full border border-white shadow-sm" }), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[13px] font-bold text-slate-800 truncate" }, user.displayName || "User"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none" }, isSyncing ? "Syncing..." : "Online")), /* @__PURE__ */ React.createElement("button", { onClick: handleLogout, className: "text-slate-400 hover:text-red-500 transition-colors", title: "Logout" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "log-out", size: 14 }))) : /* @__PURE__ */ React.createElement("button", { onClick: handleLogin, className: "w-full flex items-center justify-center gap-2 py-2 text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "cloud", size: 16 }), " Cloud Login")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setActiveFolder("Trash");
    setIsSidebarOpen(false);
  }, className: `flex-1 flex items-center gap-2 px-3 py-2 text-[13px] font-bold rounded-xl ${activeFolder === "Trash" ? "bg-red-50 text-red-500" : "text-slate-400 hover:bg-slate-50"}` }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "trash-2", size: 18 }), " Trash"), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setIsSettingsOpen(true);
    setIsSidebarOpen(false);
  }, className: "w-9 h-9 flex items-center justify-center text-slate-400 hover:bg-slate-100 rounded-xl" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "settings", size: 18 })))))), /* @__PURE__ */ React.createElement("aside", { className: "w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-sm hidden sm:flex" }, /* @__PURE__ */ React.createElement("div", { className: "p-6 flex items-center gap-[5px] border-b border-slate-50" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "bookmark", className: "shrink-0 -translate-y-[1px]", style: { color: theme === "dark" ? "#fff" : "#000" }, size: 45, strokeWidth: 2.5 }), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-start" }, /* @__PURE__ */ React.createElement("h1", { className: "text-[28px] tracking-wide leading-[0.85] mb-1 whitespace-nowrap", style: { fontFamily: '"Londrina Solid", sans-serif', fontWeight: 900, letterSpacing: "0.5px" } }, "Bookmark Base"), /* @__PURE__ */ React.createElement("span", { className: "text-[15px] text-slate-500 leading-none", style: { fontFamily: '"Londrina Solid", sans-serif', fontWeight: 400, letterSpacing: "0.2px" } }, "Save Your Feed"))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto py-6 px-5 space-y-6 custom-scrollbar" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-0.5" }, /* @__PURE__ */ React.createElement("div", { onClick: () => setActiveFolder("All"), className: `flex items-center rounded-xl transition-all cursor-pointer ${activeFolder === "All" ? "text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`, style: activeFolder === "All" ? { backgroundColor: accentColor } : {} }, /* @__PURE__ */ React.createElement("button", { className: "flex-1 flex items-center gap-3 px-3 py-2 text-[15px] font-medium text-left" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "layers", size: 18 }), " All Bookmarks"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center w-8 justify-center pr-2 shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold opacity-60" }, bookmarks.length))), /* @__PURE__ */ React.createElement("div", { onClick: () => setActiveFolder("Unsorted"), className: `flex items-center rounded-xl transition-all cursor-pointer ${activeFolder === "Unsorted" ? "text-white shadow-md" : "text-slate-600 hover:bg-slate-100"}`, style: activeFolder === "Unsorted" ? { backgroundColor: accentColor } : {} }, /* @__PURE__ */ React.createElement("button", { className: "flex-1 flex items-center gap-3 px-3 py-2 text-[15px] font-medium text-left" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "inbox", size: 18 }), " Unsorted"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center w-8 justify-center pr-2 shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold opacity-60" }, unsortedCount)))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `flex justify-between items-center mb-2 px-2 rounded-lg transition-all ${dragOverFolderId === "root" ? "bg-blue-50 ring-2 ring-blue-400 ring-dashed py-1" : ""}`,
      onDragOver: (e) => {
        e.preventDefault();
        setDragOverFolderId("root");
      },
      onDragLeave: () => {
        if (dragOverFolderId === "root") setDragOverFolderId(null);
      },
      onDrop: (e) => {
        e.preventDefault();
        setDragOverFolderId(null);
        const data = dragItemRef.current;
        if (!data) return;
        if (data.type === "folder") {
          setCustomFolders((prev) => prev.map((f) => f.id === data.id ? { ...f, parentId: null } : f));
        }
        dragItemRef.current = null;
      }
    },
    /* @__PURE__ */ React.createElement("h2", { className: "text-xs font-bold text-slate-600 uppercase tracking-wider" }, "Folders"),
    /* @__PURE__ */ React.createElement("button", { onClick: () => {
      setEditingFolder(null);
      setFolderNameInput("");
      setFolderColorInput("#3b82f6");
      setIsFolderModalOpen(true);
    }, className: "w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center hover:text-black" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "plus", size: 12 }))
  ), /* @__PURE__ */ React.createElement("div", { className: "space-y-0" }, topLevelFolders.map((f) => /* @__PURE__ */ React.createElement(FolderItem, { key: f.id, folder: f })))), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "group flex justify-between items-center mb-3 px-2 cursor-pointer tag-header transition-all py-1", onClick: () => setIsTagsExpanded(!isTagsExpanded) }, /* @__PURE__ */ React.createElement("h2", { className: "text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: isTagsExpanded ? "chevron-down" : "chevron-right", size: 10 }), " Tags"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
    e.stopPropagation();
    toggleFilter("AllTags");
  }, className: "w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 hover:text-black opacity-0 group-hover:opacity-100 transition-all", title: "View all tags" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "eye", className: "text-[10px]" })), /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
    e.stopPropagation();
    setEditingTag(null);
    setTagNameInput("");
    setTagColorInput("#64748b");
    setIsTagModalOpen(true);
  }, className: "w-6 h-6 bg-slate-100 rounded-lg flex items-center justify-center hover:text-black" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "plus", size: 12 })))), isTagsExpanded && /* @__PURE__ */ React.createElement("div", { className: "space-y-0.5 mt-1" }, customTags.length > 0 ? customTags.map((tag) => {
    const isActive = activeFilters.includes(`tag:${tag.name}`);
    return /* @__PURE__ */ React.createElement("div", { key: tag.id, className: `group flex items-center rounded-xl transition-all cursor-pointer ${isActive ? "text-white shadow-sm" : "hover:bg-slate-100"}`, style: isActive ? { backgroundColor: accentColor } : {} }, /* @__PURE__ */ React.createElement("button", { onClick: () => toggleFilter(`tag:${tag.name}`), className: "flex-1 flex items-center gap-2 px-3 py-1.5 text-[14px] font-medium truncate text-left" }, /* @__PURE__ */ React.createElement("span", { className: "font-black text-[13px] shrink-0", style: { color: isActive ? "#fff" : tag.color } }, "#"), " ", tag.name), /* @__PURE__ */ React.createElement("div", { className: "flex items-center w-8 justify-center pr-2 shrink-0" }, /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold opacity-60 group-hover:hidden" }, tagCounts[tag.name] || 0), /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
      e.stopPropagation();
      setEditingTag(tag);
      setTagNameInput(tag.name);
      setTagColorInput(tag.color);
      setIsTagModalOpen(true);
    }, className: "hidden group-hover:block text-slate-400 hover:text-blue-500" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "pen", className: "text-[9px]" }))));
  }) : /* @__PURE__ */ React.createElement("div", { className: "px-3 py-2 text-[11px] text-slate-400 italic" }, "No tags yet")))), /* @__PURE__ */ React.createElement("div", { className: "p-4 border-t border-slate-100 space-y-3" }, /* @__PURE__ */ React.createElement("div", { className: `p-3 rounded-2xl border transition-all ${user ? "bg-blue-50/50 border-blue-100" : "bg-slate-50 border-slate-100"}` }, user ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, user.photoURL && /* @__PURE__ */ React.createElement("img", { src: user.photoURL, alt: "User", className: "w-8 h-8 rounded-full border border-white shadow-sm" }), /* @__PURE__ */ React.createElement("div", { className: "flex-1 min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: "text-[13px] font-bold text-slate-800 truncate" }, user.displayName || "User"), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none" }, isSyncing ? "Syncing..." : "Online")), /* @__PURE__ */ React.createElement("button", { onClick: handleLogout, className: "text-slate-400 hover:text-red-500 transition-colors", title: "Logout" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "log-out", size: 14 }))) : /* @__PURE__ */ React.createElement("button", { onClick: handleLogin, className: "w-full flex items-center justify-center gap-2 py-2 text-[13px] font-bold text-blue-600 hover:text-blue-700 transition-colors" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "cloud", size: 16 }), " Cloud Sync Login")), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("button", { onClick: handleExportJSON, className: "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "download", className: "text-[14px]" }), " Save"), /* @__PURE__ */ React.createElement("label", { className: "flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "upload", className: "text-[14px]" }), " Load", /* @__PURE__ */ React.createElement("input", { type: "file", accept: ".json", className: "hidden", onChange: handleImportJSON }))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("button", { onClick: () => toggleFilter("Trash"), className: `flex-1 flex items-center gap-3 px-3 py-2 rounded-xl text-[15px] font-medium transition-all ${activeFilters.includes("Trash") ? "bg-red-50 text-red-600" : "text-slate-500 hover:bg-red-50"}` }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "trash-2", size: 18 }), " Trash"), /* @__PURE__ */ React.createElement("button", { onClick: () => setIsSettingsOpen(true), className: "w-9 h-9 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all shrink-0" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "settings", size: 18, className: "text-sm" }))))), /* @__PURE__ */ React.createElement("main", { className: "flex-1 flex flex-col h-screen min-w-0 bg-slate-50/50" }, /* @__PURE__ */ React.createElement("header", { className: "h-16 sm:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 z-40 shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 sm:gap-4 min-w-0" }, /* @__PURE__ */ React.createElement("button", { className: "sm:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0", onClick: () => setIsSidebarOpen(true) }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "menu" })), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap items-center gap-2 sm:gap-3" }, activeFilters.includes("All") || activeFilters.includes("AllTags") || activeFilters.includes("Trash") ? /* @__PURE__ */ React.createElement("h2", { className: "text-base sm:text-lg font-bold text-slate-900 capitalize truncate" }, activeFilters.includes("AllTags") ? "All Tags" : activeFilters.includes("Trash") ? "Trash" : "All Bookmarks") : activeFilters.map((filter) => /* @__PURE__ */ React.createElement("div", { key: filter, className: "group flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-sm font-bold cursor-pointer hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-200", onClick: () => toggleFilter(filter) }, filter.startsWith("tag:") ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: customTags.find((t) => t.name === filter.split(":")[1])?.color || "#64748b" } }), /* @__PURE__ */ React.createElement("span", null, "#", filter.split(":")[1])) : filter === "Unsorted" ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "w-3 h-3 rounded-full bg-slate-400" }), /* @__PURE__ */ React.createElement("span", null, "Unsorted")) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "w-3 h-3 rounded-full", style: { backgroundColor: customFolders.find((f) => f.name === filter)?.color || "#94a3b8" } }), /* @__PURE__ */ React.createElement("span", null, filter)), /* @__PURE__ */ React.createElement(LucideIcon, { name: "x", className: "ml-1 opacity-0 group-hover:opacity-100 w-3 h-3" }))), !activeFilters.includes("Trash") && !activeFilters.includes("AllTags") && /* @__PURE__ */ React.createElement("div", { className: "relative dropdown-container" }, /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
    e.stopPropagation();
    setActiveAddMenu(activeAddMenu === "headerFilter" ? null : "headerFilter");
  }, className: "w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-all shadow-sm shrink-0" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "plus", size: 14 })), activeAddMenu === "headerFilter" && /* @__PURE__ */ React.createElement("div", { className: "absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 z-[100] p-2 max-h-72 overflow-y-auto custom-scrollbar", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold text-slate-400 uppercase px-2 mb-1 mt-1" }, "Folders"), !activeFilters.includes("All") && /* @__PURE__ */ React.createElement("div", { onClick: (e) => {
    e.stopPropagation();
    toggleFilter("All");
    setActiveAddMenu(null);
  }, className: "flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-medium text-slate-700" }, "All Bookmarks"), !activeFilters.includes("Unsorted") && /* @__PURE__ */ React.createElement("div", { onClick: (e) => {
    e.stopPropagation();
    toggleFilter("Unsorted");
    setActiveAddMenu(null);
  }, className: "flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-medium text-slate-700" }, /* @__PURE__ */ React.createElement("div", { className: "w-2.5 h-2.5 rounded-full bg-slate-400" }), " Unsorted"), customFolders.filter((f) => !activeFilters.includes(f.name)).map((f) => /* @__PURE__ */ React.createElement("div", { key: f.name, onClick: (e) => {
    e.stopPropagation();
    toggleFilter(f.name);
    setActiveAddMenu(null);
  }, className: "flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-medium text-slate-700" }, /* @__PURE__ */ React.createElement("div", { className: "w-2.5 h-2.5 rounded-full", style: { backgroundColor: f.color } }), f.name)), customTags.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold text-slate-400 uppercase px-2 mb-1 mt-3 border-t border-slate-100 pt-2" }, "Tags"), customTags.filter((t) => !activeFilters.includes(`tag:${t.name}`)).map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, onClick: (e) => {
    e.stopPropagation();
    toggleFilter(`tag:${t.name}`);
    setActiveAddMenu(null);
  }, className: "flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-medium text-slate-700" }, /* @__PURE__ */ React.createElement("div", { className: "w-2.5 h-2.5 rounded-full", style: { backgroundColor: t.color } }), t.name)))))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 sm:gap-4" }, /* @__PURE__ */ React.createElement("div", { className: "relative hidden md:block" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "search", className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400", size: 14 }), /* @__PURE__ */ React.createElement("input", { type: "text", placeholder: "Search...", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), className: "pl-11 pr-4 py-2.5 bg-slate-100 border-transparent rounded-full text-sm w-48 focus:w-80 focus:bg-white focus:border-slate-200 focus:ring-4 focus:ring-slate-50 outline-none transition-all" })), /* @__PURE__ */ React.createElement("div", { className: "h-8 w-[1px] bg-slate-100 mx-1 hidden md:block" }), /* @__PURE__ */ React.createElement("div", { className: "relative", tabIndex: "0", onBlur: (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) setIsGridMenuOpen(false);
  } }, /* @__PURE__ */ React.createElement("button", { onClick: () => setIsGridMenuOpen(!isGridMenuOpen), className: "flex items-center gap-2 bg-slate-100 px-3 sm:px-4 py-2 rounded-full text-xs font-bold text-slate-600 hover:bg-slate-200 focus:outline-none transition-colors" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "columns" }), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, " ", gridCols, " Column")), isGridMenuOpen && /* @__PURE__ */ React.createElement("div", { className: "absolute right-0 top-full mt-2 w-32 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-[60]" }, [1, 2, 3, 4, 5].map((n) => /* @__PURE__ */ React.createElement("button", { key: n, onClick: () => {
    setGridCols(n);
    setIsGridMenuOpen(false);
  }, className: `w-full text-left px-4 py-2.5 text-xs font-bold ${gridCols === n ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"}` }, n, " Column")))), activeFilters.includes("Trash") ? /* @__PURE__ */ React.createElement("button", { onClick: handleClearTrash, className: "text-white bg-red-500 px-5 py-2.5 rounded-full text-xs font-bold hover:bg-red-600 transition-all shadow-md active:scale-95 flex items-center" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "trash-2", size: 18, className: "mr-2" }), " CLEAR ALL") : /* @__PURE__ */ React.createElement("button", { onClick: () => setIsModalOpen(true), className: "text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-bold hover:opacity-90 transition-all shadow-md active:scale-95 flex items-center", style: { backgroundColor: accentColor } }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "plus", className: "sm:mr-2" }), /* @__PURE__ */ React.createElement("span", { className: "hidden sm:inline" }, " NEW")))), /* @__PURE__ */ React.createElement("div", { className: "flex-1 overflow-y-auto p-3 sm:p-4 md:p-8 custom-scrollbar" }, activeFilters.includes("AllTags") ? /* @__PURE__ */ React.createElement("div", { className: "mx-auto max-w-4xl" }, /* @__PURE__ */ React.createElement("div", { className: "mb-8" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3 mb-2" }, /* @__PURE__ */ React.createElement("div", { className: "w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "tags", className: "text-slate-500" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: "text-xl font-bold text-slate-900" }, "Tag Collection"), /* @__PURE__ */ React.createElement("p", { className: "text-sm text-slate-400 font-medium" }, customTags.length, " tag", customTags.length !== 1 ? "s" : "", " in your archive")))), customTags.length > 0 ? /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-3" }, customTags.map((tag) => {
    const count = tagCounts[tag.name] || 0;
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: tag.id,
        onClick: () => toggleFilter(`tag:${tag.name}`),
        className: "group flex items-center gap-2.5 px-5 py-3 rounded-2xl text-[14px] font-bold transition-all active:scale-95 border bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
      },
      /* @__PURE__ */ React.createElement("span", { className: "font-black text-[16px]", style: { color: tag.color } }, "#"),
      /* @__PURE__ */ React.createElement("span", null, tag.name),
      /* @__PURE__ */ React.createElement("span", { className: "text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-400 ml-1" }, count)
    );
  })) : /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-20 opacity-30" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "tags", className: "text-4xl mb-4" }), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold uppercase tracking-widest" }, "No Tags Yet"), /* @__PURE__ */ React.createElement("p", { className: "text-xs mt-2" }, "Tags will appear here as you add them to your bookmarks"))) : /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: `mx-auto ${gridConfig.padding}` }, /* @__PURE__ */ React.createElement("div", { className: "flex gap-3 sm:gap-6 items-start justify-center" }, bookmarkColumns.map((col, colIdx) => /* @__PURE__ */ React.createElement("div", { key: colIdx, className: "flex-1 flex flex-col gap-3 sm:gap-6 min-w-0" }, col.map((b) => /* @__PURE__ */ React.createElement("div", { key: b.id, draggable: true, onDragStart: (e) => {
    e.stopPropagation();
    dragItemRef.current = { type: "tweet", ids: [b.id] };
  }, onClick: () => {
    if (!activeFilters.includes("Trash")) {
      setFocusedTweet(b);
      setInitialFocusedTweet(b);
      setIsNoteEditing(false);
    }
  }, className: `group bg-white rounded-[1.25rem] sm:rounded-[1.5rem] border ${showBrandLines && brandLineStyle === "border" ? b.url && b.url.includes("reddit.com") ? "border-[#ff4500]" : "border-[#1da1f2]" : "border-slate-200"} shadow-sm overflow-hidden relative w-full transition-all duration-300 ${activeFilters.includes("Trash") ? "opacity-70" : ""} hover:border-slate-400 p-3 sm:p-4` }, /* @__PURE__ */ React.createElement("div", { className: "w-full" }, b.tweetText ? /* @__PURE__ */ React.createElement(CustomTweetCard, { bookmark: b, onImageClick: handleImageClick }) : b.url && b.url.includes("reddit.com") ? /* @__PURE__ */ React.createElement(RedditEmbed, { url: b.url }) : /* @__PURE__ */ React.createElement(TweetEmbed, { tweetId: b.tweetId })), /* @__PURE__ */ React.createElement("div", { className: "mt-4 space-y-3" }, b.description && /* @__PURE__ */ React.createElement("div", { className: "bg-slate-50/50 border border-slate-100 p-3 rounded-2xl" }, /* @__PURE__ */ React.createElement("p", { className: "text-[13px] font-medium text-slate-700 leading-relaxed line-clamp-3 break-words" }, b.description)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-1.5 flex-1 min-w-0" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: (e) => {
        e.stopPropagation();
        toggleFilter(b.folder || "Unsorted");
      },
      className: "inline-flex items-center px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap hover:bg-slate-200 transition-colors"
    },
    /* @__PURE__ */ React.createElement(LucideIcon, { name: "folder", className: "mr-1", size: 12, style: { color: customFolders.find((f) => f.name === b.folder)?.color || "#94a3b8" } }),
    " ",
    b.folder || "Unsorted"
  ), (b.tags || []).map((tag) => {
    const tO = customTags.find((t) => t.name === tag);
    return /* @__PURE__ */ React.createElement(
      "button",
      {
        key: tag,
        onClick: (e) => {
          e.stopPropagation();
          toggleFilter(`tag:${tag}`);
        },
        className: "flex items-center gap-1 px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 rounded-lg text-[10px] font-semibold truncate hover:bg-slate-100 transition-colors"
      },
      /* @__PURE__ */ React.createElement("span", { className: "font-black", style: { color: tO?.color || "#64748b" } }, "#"),
      tag
    );
  })), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 shrink-0" }, activeFilters.includes("Trash") ? /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement("button", { onClick: (e) => handleRestoreFromTrash(e, b.id), className: "text-green-500 hover:text-green-600" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "rotate-ccw" })), /* @__PURE__ */ React.createElement("button", { onClick: (e) => handlePermanentDelete(e, b.id), className: "text-red-500 hover:text-red-700" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "trash-2", size: 18 }))) : /* @__PURE__ */ React.createElement("button", { onClick: (e) => handleMoveToTrash(e, b.id), className: "opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-600 transition-all p-1" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "trash-2", size: 18, className: "text-[13px]" })), /* @__PURE__ */ React.createElement("a", { href: b.url, target: "_blank", onClick: (e) => e.stopPropagation(), className: "w-7 h-7 flex items-center justify-center bg-white border border-slate-200 shadow-sm text-slate-400 hover:text-black rounded-lg transition-all" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "external-link", size: 12 }))))), showBrandLines && brandLineStyle === "bar" && /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-0 left-0 right-0 h-[6px]", style: { backgroundColor: b.url && b.url.includes("reddit.com") ? "#ff4500" : "#1da1f2" } }))))))), filteredBookmarks.length > visibleCount && /* @__PURE__ */ React.createElement("div", { ref: observerTarget, className: "h-10 w-full" }), filteredBookmarks.length === 0 && /* @__PURE__ */ React.createElement("div", { className: "flex flex-col items-center justify-center py-20 opacity-30" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "layers", size: 18, className: "text-4xl mb-4" }), /* @__PURE__ */ React.createElement("p", { className: "text-sm font-bold uppercase tracking-widest" }, "No Content Found"))))), focusedTweet && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-2 sm:p-4 md:p-8 overflow-y-auto", onClick: () => setFocusedTweet(null) }, /* @__PURE__ */ React.createElement("div", { className: "bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden modal-enter flex flex-col md:flex-row h-fit max-h-[95vh]", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "flex-1 bg-slate-100 p-4 sm:p-8 md:p-12 lg:p-16 overflow-y-auto custom-scrollbar flex items-start justify-center min-h-[200px] sm:min-h-[400px]" }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-5" }, focusedTweet.tweetText ? /* @__PURE__ */ React.createElement(CustomTweetCard, { bookmark: focusedTweet, onImageClick: (medias, idx, type, poster) => setPreviewState({ medias, currentIndex: idx, mediaType: type || focusedTweet.mediaType, poster }) }) : focusedTweet.url && focusedTweet.url.includes("reddit.com") ? /* @__PURE__ */ React.createElement(RedditEmbed, { url: focusedTweet.url }) : /* @__PURE__ */ React.createElement(TweetEmbed, { tweetId: focusedTweet.tweetId, key: `focus-${focusedTweet.id}` }))), /* @__PURE__ */ React.createElement("div", { className: "w-full md:w-[350px] p-5 sm:p-8 border-l border-slate-100 flex flex-col justify-between bg-white overflow-y-auto custom-scrollbar relative" }, /* @__PURE__ */ React.createElement("div", { onClick: () => {
    if (activeAddMenu) setActiveAddMenu(null);
  } }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-4 border-b border-slate-50 pb-3" }, /* @__PURE__ */ React.createElement("div", null, focusedTweet.date && /* @__PURE__ */ React.createElement("span", { className: "text-[11px] text-slate-400 font-medium flex items-center" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "calendar", className: "mr-1.5", size: 12 }), formatDate(focusedTweet.date))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-1.5" }, initialFocusedTweet && JSON.stringify({ ...initialFocusedTweet, date: null, timestamp: null }) !== JSON.stringify({ ...focusedTweet, date: null, timestamp: null }) && /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setFocusedTweet(initialFocusedTweet);
    setBookmarks((prev) => prev.map((b) => b.id === initialFocusedTweet.id ? initialFocusedTweet : b));
  }, className: "w-8 h-8 flex items-center justify-center hover:bg-orange-50 text-orange-400 rounded-full transition-all", title: "Revert Changes" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "rotate-ccw", className: "text-[16px]" })), /* @__PURE__ */ React.createElement("button", { onClick: () => {
    setFocusedTweet(null);
    setIsNoteEditing(false);
  }, className: "w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all text-slate-400" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "x", className: "text-xl" })))), /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest mb-4" }, "Your Note"), isNoteEditing ? /* @__PURE__ */ React.createElement(
    "textarea",
    {
      autoFocus: true,
      value: focusedTweet.description || "",
      onChange: (e) => {
        const val = e.target.value;
        const updated = { ...focusedTweet, description: val };
        setFocusedTweet(updated);
        setBookmarks((prev) => prev.map((b) => b.id === updated.id ? updated : b));
      },
      onBlur: () => setIsNoteEditing(false),
      className: "w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:ring-1 focus:ring-blue-400 mb-5",
      rows: "4",
      placeholder: "Empty note..."
    }
  ) : /* @__PURE__ */ React.createElement("div", { onClick: (e) => {
    e.stopPropagation();
    setIsNoteEditing(true);
  }, className: "bg-slate-50 p-4 rounded-xl border border-slate-100 mb-5 cursor-text hover:bg-slate-100 hover:border-slate-200 transition-colors min-h-[80px]" }, /* @__PURE__ */ React.createElement("p", { className: "text-slate-800 font-medium leading-relaxed break-words whitespace-pre-wrap" }, focusedTweet.description || /* @__PURE__ */ React.createElement("span", { className: "text-slate-400 italic" }, "No note added. Click to write..."))), /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest mb-3" }, "Folder"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 mb-5 relative" }, focusedTweet.folder && focusedTweet.folder !== "General" && focusedTweet.folder !== "Unsorted" ? /* @__PURE__ */ React.createElement("div", { className: "group flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold cursor-pointer hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-200", onClick: () => {
    const updated = { ...focusedTweet, folder: "Unsorted" };
    setFocusedTweet(updated);
    setBookmarks((prev) => prev.map((b) => b.id === updated.id ? updated : b));
  } }, /* @__PURE__ */ React.createElement("div", { className: "w-2.5 h-2.5 rounded-full", style: { backgroundColor: customFolders.find((f) => f.name === focusedTweet.folder)?.color || "#94a3b8" } }), /* @__PURE__ */ React.createElement("span", null, focusedTweet.folder), /* @__PURE__ */ React.createElement(LucideIcon, { name: "x", className: "ml-1 opacity-0 group-hover:opacity-100 w-3 h-3" })) : /* @__PURE__ */ React.createElement("div", { className: "relative dropdown-container" }, /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
    e.stopPropagation();
    setActiveAddMenu(activeAddMenu === "folder" ? null : "folder");
  }, className: "w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-all" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "plus", size: 14 })), activeAddMenu === "folder" && /* @__PURE__ */ React.createElement("div", { className: "absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-2 max-h-48 overflow-y-auto custom-scrollbar", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold text-slate-400 uppercase px-2 mb-1 mt-1" }, "Select Folder"), customFolders.length > 0 ? customFolders.map((f) => /* @__PURE__ */ React.createElement("div", { key: f.name, onClick: (e) => {
    e.stopPropagation();
    const updated = { ...focusedTweet, folder: f.name };
    setFocusedTweet(updated);
    setBookmarks((prev) => prev.map((b) => b.id === updated.id ? updated : b));
    setActiveAddMenu(null);
  }, className: "flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-medium text-slate-700" }, /* @__PURE__ */ React.createElement("div", { className: "w-2.5 h-2.5 rounded-full", style: { backgroundColor: f.color } }), f.name)) : /* @__PURE__ */ React.createElement("div", { className: "px-3 py-2 text-xs text-slate-400 italic" }, "No custom folders.")))), /* @__PURE__ */ React.createElement("h3", { className: "text-xs font-bold text-slate-400 uppercase tracking-widest mb-3" }, "Tags"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 mb-5 relative dropdown-container" }, (focusedTweet.tags || []).length > 0 && (focusedTweet.tags || []).map((tag) => /* @__PURE__ */ React.createElement("div", { key: tag, className: "group flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold cursor-pointer hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-200", onClick: () => {
    const newTags2 = (focusedTweet.tags || []).filter((t) => t !== tag);
    const updated = { ...focusedTweet, tags: newTags2 };
    setFocusedTweet(updated);
    setBookmarks((prev) => prev.map((b) => b.id === updated.id ? updated : b));
  } }, /* @__PURE__ */ React.createElement("div", { className: "w-2.5 h-2.5 rounded-full", style: { backgroundColor: customTags.find((t) => t.name === tag)?.color || "#64748b" } }), /* @__PURE__ */ React.createElement("span", null, tag), /* @__PURE__ */ React.createElement(LucideIcon, { name: "x", className: "ml-1 opacity-0 group-hover:opacity-100 w-3 h-3" }))), /* @__PURE__ */ React.createElement("div", { className: "relative dropdown-container" }, /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
    e.stopPropagation();
    setActiveAddMenu(activeAddMenu === "tag" ? null : "tag");
  }, className: "w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-all" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "plus", size: 14 })), activeAddMenu === "tag" && /* @__PURE__ */ React.createElement("div", { className: "absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-2 max-h-48 overflow-y-auto custom-scrollbar", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "text-[10px] font-bold text-slate-400 uppercase px-2 mb-1 mt-1 flex justify-between items-center" }, "Select Tag"), customTags.filter((t) => !(focusedTweet.tags || []).includes(t.name)).length > 0 ? customTags.filter((t) => !(focusedTweet.tags || []).includes(t.name)).map((t) => /* @__PURE__ */ React.createElement("div", { key: t.id, onClick: (e) => {
    e.stopPropagation();
    const newTags2 = [...focusedTweet.tags || [], t.name];
    const updated = { ...focusedTweet, tags: newTags2 };
    setFocusedTweet(updated);
    setBookmarks((prev) => prev.map((b) => b.id === updated.id ? updated : b));
    setActiveAddMenu(null);
  }, className: "flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-medium text-slate-700" }, /* @__PURE__ */ React.createElement("div", { className: "w-2.5 h-2.5 rounded-full", style: { backgroundColor: t.color } }), t.name)) : /* @__PURE__ */ React.createElement("div", { className: "px-3 py-2 text-xs text-slate-400 italic" }, "No more tags"))))), /* @__PURE__ */ React.createElement("div", { className: "pt-5 border-t border-slate-50 flex items-center gap-3 mt-auto" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: (e) => {
        handleMoveToTrash(e, focusedTweet.id);
        setFocusedTweet(null);
      },
      className: "w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-95 shrink-0",
      title: "Move to Trash"
    },
    /* @__PURE__ */ React.createElement(LucideIcon, { name: "trash-2", size: 17 })
  ), /* @__PURE__ */ React.createElement("a", { href: focusedTweet.url, target: "_blank", className: "flex-1 flex items-center justify-center gap-2 bg-black text-white px-4 py-3 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95" }, focusedTweet.url && focusedTweet.url.includes("reddit.com") ? "OPEN ON REDDIT" : "OPEN ON X", " ", /* @__PURE__ */ React.createElement(LucideIcon, { name: "external-link", size: 14 })))))), isTagModalOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4", onClick: () => setIsTagModalOpen(false) }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl modal-enter", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "p-6 border-b border-gray-50 flex justify-between items-center" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-900" }, editingTag ? "Edit Tag" : "New Tag"), /* @__PURE__ */ React.createElement("button", { onClick: () => setIsTagModalOpen(false), className: "w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "x", className: "text-slate-400" }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSaveTag, className: "p-6 space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1" }, "Tag Name"), /* @__PURE__ */ React.createElement("input", { type: "text", required: true, value: tagNameInput, onChange: (e) => setTagNameInput(e.target.value), className: "w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white outline-none transition-all" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1" }, "Pick a Color"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("input", { type: "color", value: tagColorInput, onChange: (e) => setTagColorInput(e.target.value), className: "w-12 h-12 p-1 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer shadow-sm" }), " ", /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium text-slate-600 uppercase font-mono" }, tagColorInput))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 pt-4" }, /* @__PURE__ */ React.createElement("button", { type: "submit", className: "flex-1 bg-green-600 text-white py-3.5 rounded-xl font-bold text-xs shadow-md shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95" }, "SAVE"), editingTag && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    if (window.confirm("Delete this tag?")) {
      setCustomTags((prev) => prev.filter((t) => t.id !== editingTag.id));
      setBookmarks((prev) => prev.map((b) => ({ ...b, tags: (b.tags || []).filter((tag) => tag !== editingTag.name) })));
      setIsTagModalOpen(false);
    }
  }, className: "flex-1 bg-red-50 text-red-500 py-3.5 rounded-xl font-bold text-xs hover:bg-red-100 transition-all active:scale-95" }, "DELETE"))))), isModalOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl modal-enter" }, /* @__PURE__ */ React.createElement("div", { className: "p-6 border-b border-gray-50 flex justify-between items-center" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-900" }, "Add New Bookmark"), /* @__PURE__ */ React.createElement("button", { onClick: () => setIsModalOpen(false), className: "w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "x", className: "text-slate-400" }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleAddBookmark, className: "p-6 space-y-4" }, /* @__PURE__ */ React.createElement("input", { type: "url", required: true, placeholder: "Tweet URL (https://x.com/...)", value: newUrl, onChange: (e) => setNewUrl(e.target.value), className: "w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white outline-none transition-all" }), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement(CustomDropdown, { value: newFolder, onChange: setNewFolder, options: [{ name: "General", color: "#94a3b8" }, ...customFolders], isMulti: false }), /* @__PURE__ */ React.createElement(CustomDropdown, { value: newTags, onChange: setNewTags, options: customTags, isMulti: true })), /* @__PURE__ */ React.createElement("textarea", { placeholder: "Your Note...", rows: "3", value: newDesc, onChange: (e) => setNewDesc(e.target.value), className: "w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white outline-none resize-none transition-all" }), /* @__PURE__ */ React.createElement("button", { type: "submit", className: "w-full bg-green-600 text-white py-4 rounded-xl font-bold text-sm shadow-md shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95" }, "Add to Collection")))), previewState && /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[200] flex items-center justify-center p-4 cursor-zoom-out modal-enter",
      onClick: () => setPreviewState(null),
      onKeyDown: (e) => {
        if (e.key === "ArrowRight" && previewState.medias.length > 1) {
          e.stopPropagation();
          setPreviewState((prev) => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.medias.length }));
        }
        if (e.key === "ArrowLeft" && previewState.medias.length > 1) {
          e.stopPropagation();
          setPreviewState((prev) => ({ ...prev, currentIndex: (prev.currentIndex - 1 + prev.medias.length) % prev.medias.length }));
        }
        if (e.key === "Escape") setPreviewState(null);
      },
      tabIndex: 0,
      ref: (el) => el && el.focus()
    },
    previewState.medias.length > 1 && /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
      e.stopPropagation();
      setPreviewState((prev) => ({ ...prev, currentIndex: (prev.currentIndex - 1 + prev.medias.length) % prev.medias.length }));
    }, className: "absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/25 text-white rounded-full transition-all backdrop-blur-sm z-10" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "chevron-left", className: "text-lg" })),
    previewState.mediaType === "video" ? /* @__PURE__ */ React.createElement(HlsVideoPlayer, { src: previewState.medias[previewState.currentIndex], poster: previewState.poster, controls: true, autoPlay: true, className: "max-w-full max-h-[90vh] rounded-lg shadow-2xl outline-none", onClick: (e) => e.stopPropagation() }) : /* @__PURE__ */ React.createElement("img", { src: getHighResUrl(previewState.medias[previewState.currentIndex]), className: "max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl", onClick: (e) => e.stopPropagation() }),
    previewState.medias.length > 1 && /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
      e.stopPropagation();
      setPreviewState((prev) => ({ ...prev, currentIndex: (prev.currentIndex + 1) % prev.medias.length }));
    }, className: "absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/25 text-white rounded-full transition-all backdrop-blur-sm z-10" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "chevron-right", className: "text-lg" })),
    previewState.medias.length > 1 && /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full" }, previewState.currentIndex + 1, " / ", previewState.medias.length),
    /* @__PURE__ */ React.createElement("button", { onClick: (e) => {
      e.stopPropagation();
      handleDownload(getHighResUrl(previewState.medias[previewState.currentIndex]));
    }, className: "absolute top-6 right-20 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/30 text-white rounded-full transition-colors" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "download" })),
    /* @__PURE__ */ React.createElement("button", { onClick: () => setPreviewState(null), className: "absolute top-6 right-6 w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/30 text-white rounded-full transition-colors" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "x", className: "text-xl" }))
  ), isFolderModalOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4", onClick: () => setIsFolderModalOpen(false) }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl modal-enter", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "p-6 border-b border-gray-50 flex justify-between items-center" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-900" }, editingFolder ? "Edit Folder" : "New Folder"), /* @__PURE__ */ React.createElement("button", { onClick: () => setIsFolderModalOpen(false), className: "w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "x", className: "text-slate-400" }))), /* @__PURE__ */ React.createElement("form", { onSubmit: handleSaveFolder, className: "p-6 space-y-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1" }, "Name"), /* @__PURE__ */ React.createElement("input", { type: "text", required: true, value: folderNameInput, onChange: (e) => setFolderNameInput(e.target.value), className: "w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm focus:bg-white outline-none transition-all" })), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1" }, "Color"), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("input", { type: "color", value: folderColorInput, onChange: (e) => setFolderColorInput(e.target.value), className: "w-12 h-12 p-1 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer shadow-sm" }), " ", /* @__PURE__ */ React.createElement("span", { className: "text-sm font-medium uppercase" }, folderColorInput))), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2 pt-4" }, /* @__PURE__ */ React.createElement("button", { type: "submit", className: "flex-1 bg-green-600 text-white py-3.5 rounded-xl font-bold text-xs shadow-md shadow-green-600/20 hover:bg-green-700 transition-all active:scale-95" }, "SAVE"), editingFolder && /* @__PURE__ */ React.createElement("button", { type: "button", onClick: () => {
    if (window.confirm("Delete this folder?")) {
      setCustomFolders((prev) => prev.filter((f) => f.id !== editingFolder.id));
      setBookmarks((prev) => prev.map((b) => b.folder === editingFolder.name ? { ...b, folder: "Unsorted" } : b));
      setIsFolderModalOpen(false);
    }
  }, className: "flex-1 bg-red-50 text-red-500 py-3.5 rounded-xl font-bold text-xs hover:bg-red-100 transition-all active:scale-95" }, "DELETE"))))), isSettingsOpen && /* @__PURE__ */ React.createElement("div", { className: "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4", onClick: () => setIsSettingsOpen(false) }, /* @__PURE__ */ React.createElement("div", { className: "bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl modal-enter", onClick: (e) => e.stopPropagation() }, /* @__PURE__ */ React.createElement("div", { className: "p-6 border-b border-gray-50 flex justify-between items-center" }, /* @__PURE__ */ React.createElement("h3", { className: "font-bold text-slate-900 text-lg" }, "Settings"), /* @__PURE__ */ React.createElement("button", { onClick: () => setIsSettingsOpen(false), className: "w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "x", className: "text-slate-400" }))), /* @__PURE__ */ React.createElement("div", { className: "p-6 space-y-6" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-3" }, "Accent Color"), /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2 mb-4" }, ["#000000", "#3b82f6", "#8b5cf6", "#ec4899", "#ef4444", "#f97316", "#10b981", "#06b6d4"].map((color) => /* @__PURE__ */ React.createElement("button", { key: color, onClick: () => setAccentColor(color), className: `w-9 h-9 rounded-xl transition-all shadow-sm hover:scale-110 ${accentColor === color ? "ring-2 ring-offset-2 ring-slate-400 scale-110" : ""}`, style: { backgroundColor: color } }))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("input", { type: "color", value: accentColor, onChange: (e) => setAccentColor(e.target.value), className: "w-10 h-10 p-1 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer shadow-sm" }), /* @__PURE__ */ React.createElement("input", { type: "text", value: accentColor, onChange: (e) => {
    if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value)) setAccentColor(e.target.value);
  }, onBlur: (e) => {
    if (!/^#[0-9a-fA-F]{6}$/i.test(accentColor) && !/^#[0-9a-fA-F]{3}$/i.test(accentColor)) setAccentColor("#000000");
  }, className: "flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-mono uppercase outline-none focus:bg-white transition-all" }))), /* @__PURE__ */ React.createElement("div", { className: "pt-6 border-t border-slate-50" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4" }, "Display Theme"), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-3 gap-3" }, [
    { id: "light", name: "Light", bg: "#f8fafc", text: "#0f172a", border: "#e2e8f0" },
    { id: "dark", name: "Classic Dark", bg: "#15202b", text: "#ffffff", border: "#38444d" },
    { id: "oldschool", name: "Old School", bg: "#000000", text: "#d9d9d9", border: "#2f3336" }
  ].map((t) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: t.id,
      onClick: () => setTheme(t.id),
      className: `relative overflow-hidden group p-3 rounded-2xl border-2 transition-all flex flex-col gap-2 items-center ${theme === t.id ? "border-blue-500 bg-blue-50/10" : "border-slate-100 bg-slate-50 hover:border-slate-200"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: "w-full h-8 rounded-lg shadow-inner flex items-center justify-center text-[10px] font-bold", style: { backgroundColor: t.bg, color: t.text, border: `1px solid ${t.border}` } }, "Aa"),
    /* @__PURE__ */ React.createElement("span", { className: `text-[11px] font-bold ${theme === t.id ? "text-blue-600" : "text-slate-500"}` }, t.name),
    theme === t.id && /* @__PURE__ */ React.createElement("div", { className: "absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow-sm" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "check", className: "text-[8px] text-white" }))
  )))), /* @__PURE__ */ React.createElement("div", { className: "pt-6 border-t border-slate-50" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center mb-4" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest block" }, "Storage Usage (IndexedDB)"), /* @__PURE__ */ React.createElement("span", { className: `text-[9px] font-black px-2 py-0.5 rounded-full ${storageInfo.used / (1024 * 1024) < 80 ? "bg-green-100 text-green-600" : storageInfo.used / (1024 * 1024) < 90 ? "bg-yellow-100 text-yellow-600" : "bg-red-100 text-red-600"}` }, storageInfo.used / (1024 * 1024) < 80 ? "OPTIMIZED" : storageInfo.used / (1024 * 1024) < 90 ? "HEAVY" : "CRITICAL")), /* @__PURE__ */ React.createElement("div", { className: "bg-slate-50 border border-slate-100 rounded-2xl p-4" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-end mb-2" }, /* @__PURE__ */ React.createElement("span", { className: "text-xs font-bold text-slate-700" }, "Archive Size"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] font-bold text-slate-400" }, (storageInfo.used / (1024 * 1024)).toFixed(2), " MB / 100 MB")), /* @__PURE__ */ React.createElement("div", { className: "w-full h-1.5 bg-slate-200 rounded-full overflow-hidden" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `h-full transition-all duration-700 ${storageInfo.used / (1024 * 1024) < 80 ? "bg-green-500" : storageInfo.used / (1024 * 1024) < 90 ? "bg-yellow-500" : "bg-red-500"}`,
      style: { width: `${Math.min(storageInfo.used / (1024 * 1024 * 100) * 100, 100) || 0}%` }
    }
  )), /* @__PURE__ */ React.createElement("p", { className: "mt-3 text-[10px] font-medium text-slate-400 leading-relaxed italic" }, "Performance starts to degrade after 100MB due to memory constraints."))), /* @__PURE__ */ React.createElement("div", { className: "pt-6 border-t border-slate-50 font-sans" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest block" }, "Marka \xC7izgisi Ekleme"), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowBrandLines(!showBrandLines), className: `w-10 h-5 rounded-full transition-all relative ${showBrandLines ? "bg-blue-500" : "bg-slate-200"}` }, /* @__PURE__ */ React.createElement("div", { className: `absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showBrandLines ? "right-1" : "left-1"}` }))), showBrandLines && /* @__PURE__ */ React.createElement("div", { className: "mb-4" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2" }, "\xC7izgi Stili"), /* @__PURE__ */ React.createElement("div", { className: "flex gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setBrandLineStyle("bar"),
      className: `flex-1 py-2 px-3 rounded-xl text-[11px] font-bold transition-all border ${brandLineStyle === "bar" ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-slate-50 border-slate-100 text-slate-500"}`
    },
    "Alt \xC7izgi"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setBrandLineStyle("border"),
      className: `flex-1 py-2 px-3 rounded-xl text-[11px] font-bold transition-all border ${brandLineStyle === "border" ? "bg-blue-50 border-blue-200 text-blue-600" : "bg-slate-50 border-slate-100 text-slate-500"}`
    },
    "Kenarl\u0131k"
  ))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center justify-between mb-2" }, /* @__PURE__ */ React.createElement("label", { className: "text-[10px] font-bold text-slate-400 uppercase tracking-widest block" }, "Automatic Backup"), /* @__PURE__ */ React.createElement(
    "div",
    {
      onClick: () => setAutoBackup(!autoBackup),
      className: `w-10 h-5 rounded-full relative cursor-pointer transition-all duration-300 ${autoBackup ? "bg-green-500" : "bg-slate-200"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: `absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${autoBackup ? "left-5.5" : "left-0.5"}`, style: { left: autoBackup ? "22px" : "2px" } })
  )), /* @__PURE__ */ React.createElement("p", { className: "text-[10px] text-slate-400 font-medium leading-relaxed italic pr-8" }, "Automatically creates a JSON backup file once a day when you open the app."), /* @__PURE__ */ React.createElement("div", { className: "mt-4 flex gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        handleExportJSON();
      },
      className: "flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl text-[11px] font-bold transition-all active:scale-95"
    },
    "MANUAL EXPORT"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        if (window.confirm("Clear all archived data? THIS CANNOT BE UNDONE!")) {
          db.bookmarks.clear();
          db.folders.clear();
          db.tags.clear();
          db.trash.clear();
          window.location.reload();
        }
      },
      className: "flex-1 bg-red-50 hover:bg-red-100 text-red-500 py-3 rounded-xl text-[11px] font-bold transition-all active:scale-95"
    },
    "WIPE DATABASE"
  )))))), toasts.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 sm:bottom-6 z-[300] flex flex-col gap-2.5 pointer-events-none w-[calc(100%-2rem)] sm:w-auto" }, toasts.map((toast) => /* @__PURE__ */ React.createElement("div", { key: toast.id, className: "pointer-events-auto flex items-center gap-3 px-5 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-xl text-sm font-semibold text-slate-700 animate-slide-in-right min-w-[280px] max-w-[400px]" }, /* @__PURE__ */ React.createElement("i", { className: `text-xs ${toast.type === "success" ? "fa-solid fa-check-circle text-green-500" : toast.type === "error" ? "fa-solid fa-exclamation-circle text-red-500" : "fa-solid fa-info-circle text-blue-500"}` }), /* @__PURE__ */ React.createElement("span", { className: "flex-1" }, toast.message), toast.undoAction && /* @__PURE__ */ React.createElement("button", { onClick: () => {
    toast.undoAction();
    dismissToast(toast.id);
  }, className: "text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider shrink-0 px-2 py-1 hover:bg-blue-50 rounded-lg transition-all" }, "Undo"), /* @__PURE__ */ React.createElement("button", { onClick: () => dismissToast(toast.id), className: "text-slate-300 hover:text-slate-500 transition-colors ml-1" }, /* @__PURE__ */ React.createElement(LucideIcon, { name: "x", className: "text-xs" }))))));
}
try {
  const rootElement = document.getElementById("root");
  if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(/* @__PURE__ */ React.createElement(App, null));
  }
} catch (e) {
  console.error("Failed to render App:", e);
}
