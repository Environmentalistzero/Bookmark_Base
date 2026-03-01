const fs = require('fs');
let data = fs.readFileSync('app.jsx', 'utf8');

// Replace states
data = data.replace(
    /const \[isEditingFocus, setIsEditingFocus\] = useState\(false\);[\s\S]*?const \[focusEditFolder, setFocusEditFolder\] = useState\(''\);/,
    "const [isNoteEditing, setIsNoteEditing] = useState(false);"
);

// Replace onClick handler
data = data.replace(
    /onClick=\{\(\) => \{ if \(activeFolder !== 'Trash'\) setFocusedTweet\(b\); \}\}/g,
    "onClick={() => { if (activeFolder !== 'Trash') { setFocusedTweet(b); setInitialFocusedTweet(b); setIsNoteEditing(false); } }}"
);

// Remove startFocusEdit and saveFocusEdit
data = data.replace(
    /const startFocusEdit = \(\) => \{[\s\S]*?setIsEditingFocus\(false\);\s*\};/,
    ""
);

// Replace the Edit/Focus Right Menu
const rightMenuRe = /<div className="w-full md:w-\[350px\] p-5 sm:p-8 border-l border-slate-100 flex flex-col justify-between bg-white overflow-y-auto custom-scrollbar">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)/;

const newRightMenu = `<div className="w-full md:w-[350px] p-5 sm:p-8 border-l border-slate-100 flex flex-col justify-between bg-white overflow-y-auto custom-scrollbar relative">
                                <div onClick={() => { if(activeAddMenu) setActiveAddMenu(null); }}>
                                    <div className="flex justify-end items-start mb-6 gap-2">
                                        {initialFocusedTweet && JSON.stringify({ ...initialFocusedTweet, date: null, timestamp: null }) !== JSON.stringify({ ...focusedTweet, date: null, timestamp: null }) && (
                                            <button onClick={() => {
                                                setFocusedTweet(initialFocusedTweet);
                                                setBookmarks(prev => prev.map(b => b.id === initialFocusedTweet.id ? initialFocusedTweet : b));
                                            }} className="w-8 h-8 flex items-center justify-center hover:bg-orange-50 text-orange-400 rounded-full transition-all" title="Revert Changes"><LucideIcon name="rotate-ccw" className="text-sm" /></button>
                                        )}
                                        <button onClick={() => { setFocusedTweet(null); setIsNoteEditing(false); }} className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded-full transition-all text-slate-400"><LucideIcon name="x" className="text-lg" /></button>
                                    </div>

                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Your Note</h3>
                                    {isNoteEditing ? (
                                        <textarea
                                            autoFocus
                                            value={focusedTweet.description || ''}
                                            onChange={e => {
                                                const val = e.target.value;
                                                const updated = { ...focusedTweet, description: val };
                                                setFocusedTweet(updated);
                                                setBookmarks(prev => prev.map(b => b.id === updated.id ? updated : b));
                                            }}
                                            onBlur={() => setIsNoteEditing(false)}
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:ring-1 focus:ring-blue-400 mb-8"
                                            rows="4"
                                            placeholder="Empty note..."
                                        />
                                    ) : (
                                        <div onClick={(e) => { e.stopPropagation(); setIsNoteEditing(true); }} className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-8 cursor-text hover:bg-slate-100 hover:border-slate-200 transition-colors min-h-[80px]">
                                            <p className="text-slate-800 font-medium leading-relaxed break-words whitespace-pre-wrap">{focusedTweet.description || <span className="text-slate-400 italic">No note added. Click to write...</span>}</p>
                                        </div>
                                    )}

                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Folder</h3>
                                    <div className="flex flex-wrap gap-2 mb-8 relative">
                                        {focusedTweet.folder && focusedTweet.folder !== 'General' && focusedTweet.folder !== 'Unsorted' ? (
                                            <div className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold cursor-pointer hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-200" onClick={() => {
                                                const updated = { ...focusedTweet, folder: 'Unsorted' };
                                                setFocusedTweet(updated);
                                                setBookmarks(prev => prev.map(b => b.id === updated.id ? updated : b));
                                            }}>
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: customFolders.find(f => f.name === focusedTweet.folder)?.color || '#94a3b8' }}></div>
                                                <span>{focusedTweet.folder}</span>
                                                <LucideIcon name="x" className="ml-1 opacity-0 group-hover:opacity-100 w-3 h-3" />
                                            </div>
                                        ) : (
                                            <div className="relative dropdown-container">
                                                <button onClick={(e) => { e.stopPropagation(); setActiveAddMenu(activeAddMenu === 'folder' ? null : 'folder'); }} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-all"><LucideIcon name="plus" size={14} /></button>
                                                {activeAddMenu === 'folder' && (
                                                    <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-2 max-h-48 overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                                                        <div className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1 mt-1">Select Folder</div>
                                                        {[{ name: 'General', color: '#94a3b8' }, ...customFolders].map(f => (
                                                            <div key={f.name} onClick={(e) => {
                                                                e.stopPropagation();
                                                                const updated = { ...focusedTweet, folder: f.name };
                                                                setFocusedTweet(updated);
                                                                setBookmarks(prev => prev.map(b => b.id === updated.id ? updated : b));
                                                                setActiveAddMenu(null);
                                                            }} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-medium text-slate-700">
                                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: f.color }}></div>
                                                                {f.name}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Tags</h3>
                                    <div className="flex flex-wrap gap-2 mb-8 relative dropdown-container">
                                        {(focusedTweet.tags || []).length > 0 && (focusedTweet.tags || []).map(tag => (
                                            <div key={tag} className="group flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full text-xs font-bold cursor-pointer hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-200" onClick={() => {
                                                const newTags = (focusedTweet.tags || []).filter(t => t !== tag);
                                                const updated = { ...focusedTweet, tags: newTags };
                                                setFocusedTweet(updated);
                                                setBookmarks(prev => prev.map(b => b.id === updated.id ? updated : b));
                                            }}>
                                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: customTags.find(t => t.name === tag)?.color || '#64748b' }}></div>
                                                <span>{tag}</span>
                                                <LucideIcon name="x" className="ml-1 opacity-0 group-hover:opacity-100 w-3 h-3" />
                                            </div>
                                        ))}
                                        <div className="relative dropdown-container">
                                            <button onClick={(e) => { e.stopPropagation(); setActiveAddMenu(activeAddMenu === 'tag' ? null : 'tag'); }} className="w-8 h-8 flex items-center justify-center bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-all"><LucideIcon name="plus" size={14} /></button>
                                            {activeAddMenu === 'tag' && (
                                                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-2 max-h-48 overflow-y-auto custom-scrollbar" onClick={(e) => e.stopPropagation()}>
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase px-2 mb-1 mt-1 flex justify-between items-center">
                                                        Select Tag
                                                    </div>
                                                    {customTags.filter(t => !(focusedTweet.tags || []).includes(t.name)).length > 0 ? customTags.filter(t => !(focusedTweet.tags || []).includes(t.name)).map(t => (
                                                        <div key={t.id} onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newTags = [...(focusedTweet.tags || []), t.name];
                                                            const updated = { ...focusedTweet, tags: newTags };
                                                            setFocusedTweet(updated);
                                                            setBookmarks(prev => prev.map(b => b.id === updated.id ? updated : b));
                                                            setActiveAddMenu(null);
                                                        }} className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 rounded-lg cursor-pointer text-sm font-medium text-slate-700">
                                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }}></div>
                                                            {t.name}
                                                        </div>
                                                    )) : <div className="px-3 py-2 text-xs text-slate-400 italic">No more tags</div>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-50 flex items-center gap-3 mt-auto">
                                    <button
                                        onClick={(e) => { handleMoveToTrash(e, focusedTweet.id); setFocusedTweet(null); }}
                                        className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all active:scale-95"
                                        title="Move to Trash"
                                    >
                                        <LucideIcon name="trash-2" size={18} />
                                    </button>
                                    <a href={focusedTweet.url} target="_blank" className="flex-1 flex items-center justify-center gap-2 bg-black text-white px-5 py-3.5 rounded-xl text-xs font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-95">
                                        {focusedTweet.url && focusedTweet.url.includes('reddit.com') ? 'OPEN ON REDDIT' : 'OPEN ON X'} <LucideIcon name="external-link" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                )`;

data = data.replace(rightMenuRe, newRightMenu);

fs.writeFileSync('app.jsx', data);
