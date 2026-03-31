(function(){
  const body=document.body;
  const sidebar=document.getElementById('sidebar');
  const overlay=document.querySelector('.overlay');
  const openSidebar=()=>{sidebar?.classList.add('open');overlay?.classList.add('show');body.classList.add('menu-open');};
  const closeSidebar=()=>{sidebar?.classList.remove('open');overlay?.classList.remove('show');body.classList.remove('menu-open');};
  document.querySelectorAll('[data-open-sidebar]').forEach(btn=>btn.addEventListener('click',openSidebar));
  document.querySelectorAll('[data-close-sidebar]').forEach(btn=>btn.addEventListener('click',closeSidebar));

  // media tabs
  document.querySelectorAll('.media-tab').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const target=btn.dataset.tabTarget;
      btn.parentElement.querySelectorAll('.media-tab').forEach(b=>b.classList.remove('active'));
      document.querySelectorAll('.tab-pane').forEach(pane=>pane.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(target)?.classList.add('active');
    });
  });

  // stato pagina
  const notesPanel=document.getElementById('notesPanel');
  const notesArea=document.getElementById('notesArea');
  const lessonArticle=document.querySelector('.lesson-article');
  const pageKey=document.body.dataset.page || 'pagina';
  const notesStorageKey='eco-leopardi-notes-v3-' + pageKey;
  const legacyNotesStorageKey='eco-leopardi-notes-v2-' + pageKey;
  const pendingHighlightsKey='eco-leopardi-pending-highlights-v3-' + pageKey;
  const savedHighlightsKey='eco-leopardi-saved-highlights-v3-' + pageKey;
  const legacyPendingHighlightsKey='eco-leopardi-pending-highlights-' + pageKey;
  const legacySavedHighlightsKey='eco-leopardi-saved-highlights-' + pageKey;

  function safeParse(value, fallback){
    try{ return JSON.parse(value); }catch(_){ return fallback; }
  }
  function normalizeText(str){ return String(str||'').replace(/\s+/g,' ').trim(); }
  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function uid(){ return `hl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`; }

  function ensureHighlightObject(item){
    if(!item) return null;
    if(typeof item === 'string'){
      const text=normalizeText(item);
      if(!text) return null;
      return { id: uid(), text, anchor: null };
    }
    const text=normalizeText(item.text || item.snippet || '');
    if(!text) return null;
    const anchor=item.anchor && item.anchor.startPath && item.anchor.endPath ? {
      startPath: item.anchor.startPath,
      startOffset: Number(item.anchor.startOffset)||0,
      endPath: item.anchor.endPath,
      endOffset: Number(item.anchor.endOffset)||0
    } : null;
    return { id: item.id || uid(), text, anchor };
  }

  function dedupeHighlights(items){
    const map=new Map();
    (items||[]).forEach(raw=>{
      const item=ensureHighlightObject(raw);
      if(!item) return;
      const key=item.anchor
        ? `${item.anchor.startPath}|${item.anchor.startOffset}|${item.anchor.endPath}|${item.anchor.endOffset}`
        : `text|${item.text}`;
      if(!map.has(key)) map.set(key, item);
    });
    return [...map.values()];
  }

  function loadNotesState(){
    const current=safeParse(localStorage.getItem(notesStorageKey), null);
    if(current && typeof current === 'object'){
      return {
        freeText: typeof current.freeText === 'string' ? current.freeText : '',
        savedHighlights: dedupeHighlights(current.savedHighlights)
      };
    }
    const legacy=safeParse(localStorage.getItem(legacyNotesStorageKey), {freeText:'', savedHighlights:[]});
    return {
      freeText: typeof legacy.freeText === 'string' ? legacy.freeText : '',
      savedHighlights: dedupeHighlights(legacy.savedHighlights)
    };
  }

  function loadPendingHighlights(){
    const current=safeParse(localStorage.getItem(pendingHighlightsKey), null);
    if(Array.isArray(current)) return dedupeHighlights(current);
    return dedupeHighlights(safeParse(localStorage.getItem(legacyPendingHighlightsKey), []));
  }

  let notesState=loadNotesState();
  let pendingHighlights=loadPendingHighlights();

  if(notesArea) notesArea.value=notesState.freeText;

  function persistNotes(){
    if(notesArea) notesState.freeText=notesArea.value;
    const payload={freeText: notesState.freeText, savedHighlights: notesState.savedHighlights};
    localStorage.setItem(notesStorageKey, JSON.stringify(payload));
    localStorage.setItem(savedHighlightsKey, JSON.stringify(notesState.savedHighlights));
    localStorage.setItem(pendingHighlightsKey, JSON.stringify(pendingHighlights));
  }

  function exportNotes(){
    const sections=[];
    const free=(notesArea?.value || '').trim();
    if(free) sections.push('APPUNTI PERSONALI\n\n' + free);
    if(notesState.savedHighlights.length){
      sections.push('PASSAGGI SALVATI\n\n' + notesState.savedHighlights.map((item,i)=>`${i+1}. ${item.text}`).join('\n\n'));
    }
    return sections.join('\n\n--------------------\n\n') || 'Nessun appunto salvato.';
  }

  function openNotesPanel(){ notesPanel?.classList.add('show'); }
  function closeNotesPanel(){ notesPanel?.classList.remove('show'); }
  document.querySelectorAll('#openNotes').forEach(btn=>btn.addEventListener('click',openNotesPanel));
  document.getElementById('closeNotes')?.addEventListener('click',closeNotesPanel);
  document.getElementById('saveNotes')?.addEventListener('click',()=>{
    persistNotes();
    const blob=new Blob([exportNotes()],{type:'text/plain;charset=utf-8'});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=(pageKey || 'appunti') + '.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  });
  notesArea?.addEventListener('input',persistNotes);

  if(notesPanel && !document.getElementById('savedHighlightsPanel')){
    const savedBox=document.createElement('section');
    savedBox.className='saved-highlights-box';
    savedBox.innerHTML=`
      <div class="saved-head">
        <strong>Passaggi evidenziati</strong>
        <div class="saved-head-actions">
          <button class="pill-btn primary small" id="savePendingHighlights" type="button">Salva evidenziazioni</button>
          <button class="pill-btn small" id="clearAllHighlights" type="button">Azzera</button>
        </div>
      </div>
      <p class="notes-hint compact">Puoi leggere, evidenziare più brani e salvarli tutti insieme solo alla fine.</p>
      <p class="notes-hint compact highlight-tech-note">Le evidenziazioni vengono ancorate alla posizione reale del testo, non solo alla frase.</p>
      <div id="savedHighlightsPanel" class="saved-highlights-list"></div>
    `;
    notesPanel.appendChild(savedBox);
  }

  function renderSavedHighlights(){
    const panel=document.getElementById('savedHighlightsPanel');
    if(!panel) return;
    const items=[
      ...pendingHighlights.map(item=>({...item, status:'pending'})),
      ...notesState.savedHighlights.map(item=>({...item, status:'saved'}))
    ];
    if(!items.length){
      panel.innerHTML='<p class="notes-empty">Nessun passaggio raccolto per questa pagina.</p>';
      return;
    }
    panel.innerHTML=items.map(item=>`
      <article class="saved-highlight-card ${item.status}">
        <div class="saved-highlight-meta">${item.status==='pending' ? 'In attesa di salvataggio' : 'Salvato negli appunti'}</div>
        <p>${escapeHtml(item.text)}</p>
        <button class="text-btn" type="button" data-remove-highlight-id="${item.id}" data-status="${item.status}">Rimuovi</button>
      </article>
    `).join('');
  }

  function removeHighlightById(id, status){
    if(status==='pending') pendingHighlights=pendingHighlights.filter(item=>item.id!==id);
    else notesState.savedHighlights=notesState.savedHighlights.filter(item=>item.id!==id);
    persistNotes();
    renderSavedHighlights();
    reapplyHighlights();
  }

  notesPanel?.addEventListener('click',e=>{
    const removeBtn=e.target.closest('[data-remove-highlight-id]');
    if(removeBtn){
      removeHighlightById(removeBtn.dataset.removeHighlightId, removeBtn.dataset.status);
      return;
    }
    if(e.target.closest('#savePendingHighlights')){
      if(pendingHighlights.length){
        notesState.savedHighlights=dedupeHighlights([...notesState.savedHighlights, ...pendingHighlights]);
        pendingHighlights=[];
        persistNotes();
        renderSavedHighlights();
        reapplyHighlights();
      }
      return;
    }
    if(e.target.closest('#clearAllHighlights')){
      pendingHighlights=[];
      notesState.savedHighlights=[];
      persistNotes();
      renderSavedHighlights();
      reapplyHighlights();
    }
  });

  renderSavedHighlights();

  // draggable notes
  if(notesPanel){
    const header=notesPanel.querySelector('.notes-header');
    let drag=false, startX=0, startY=0, initialX=0, initialY=0;
    header?.addEventListener('pointerdown',e=>{
      drag=true;
      const rect=notesPanel.getBoundingClientRect();
      startX=e.clientX; startY=e.clientY; initialX=rect.left; initialY=rect.top;
      notesPanel.style.left=rect.left+'px';
      notesPanel.style.top=rect.top+'px';
      notesPanel.style.right='auto';
      notesPanel.style.bottom='auto';
      header.setPointerCapture?.(e.pointerId);
    });
    header?.addEventListener('pointermove',e=>{
      if(!drag) return;
      notesPanel.style.left=Math.max(8, initialX + (e.clientX-startX))+'px';
      notesPanel.style.top=Math.max(8, initialY + (e.clientY-startY))+'px';
    });
    header?.addEventListener('pointerup',()=>{ drag=false; });
  }

  // completion tracker
  const lessons=(window.LESSON_ORDER||[]).map(x=>x.file);
  if(lessons.includes(pageKey + '.html')) localStorage.setItem('eco-leopardi-complete-' + pageKey, '1');
  const completed=lessons.filter(f=>localStorage.getItem('eco-leopardi-complete-' + f.replace('.html',''))==='1').length;
  const progress=document.getElementById('courseProgress');
  const progressText=document.getElementById('courseProgressText');
  if(progress) progress.style.width=(lessons.length ? (completed/lessons.length*100) : 0)+'%';
  if(progressText) progressText.textContent=`${completed} di ${lessons.length} lezioni visitate`;

  // image modal
  const imageModal=document.getElementById('imageModal');
  const imageModalImg=document.getElementById('imageModalImg');
  const imageModalCaption=document.getElementById('imageModalCaption');
  document.querySelectorAll('.zoomable').forEach(img=>{
    img.addEventListener('click',()=>{
      if(!imageModal) return;
      imageModalImg.src=img.currentSrc || img.src;
      imageModalImg.alt=img.alt || '';
      imageModalCaption.textContent=img.closest('figure')?.querySelector('figcaption')?.textContent || img.alt || '';
      imageModal.classList.add('show');
    });
  });
  document.querySelectorAll('[data-close-image]').forEach(btn=>btn.addEventListener('click',()=>imageModal?.classList.remove('show')));
  imageModal?.addEventListener('click',e=>{ if(e.target===imageModal) imageModal.classList.remove('show'); });

  // glossary
  const glossary=window.LEOPARDI_GLOSSARY || {};
  let currentTerm=null;
  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }
  function wrapTerms(root){
    if(!root || !Object.keys(glossary).length) return;
    const terms=Object.keys(glossary).sort((a,b)=>b.length-a.length);
    const walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if(!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent=node.parentElement;
        if(parent && parent.closest('script,style,textarea,a,button,h1,h2,h3,h4,h5,h6,.glossary-term')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes=[];
    while(walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node=>{
      let replaced=node.nodeValue;
      let changed=false;
      terms.forEach(term=>{
        const re=new RegExp(`(^|[^\\p{L}])(${escapeRegExp(term)})(?=[^\\p{L}]|$)`,'giu');
        if(re.test(replaced)){
          replaced=replaced.replace(re, (_,prefix,match)=>`${prefix}<span class="glossary-term" data-term="${term}">${match}</span>`);
          changed=true;
        }
      });
      if(changed){
        const span=document.createElement('span');
        span.innerHTML=replaced;
        node.replaceWith(...span.childNodes);
      }
    });
  }
  wrapTerms(lessonArticle);

  const glossaryModal=document.getElementById('glossaryModal');
  const glossaryTitle=document.getElementById('glossaryTitle');
  const glossaryDef=document.getElementById('glossaryDef');
  const glossaryQuote=document.getElementById('glossaryQuote');
  const glossaryLinks=document.getElementById('glossaryLinks');
  lessonArticle?.addEventListener('click',e=>{
    const termEl=e.target.closest('.glossary-term');
    if(!termEl) return;
    currentTerm=termEl.dataset.term;
    const item=glossary[currentTerm];
    if(!item || !glossaryModal) return;
    glossaryTitle.textContent=currentTerm;
    glossaryDef.textContent=item.def;
    glossaryQuote.textContent=item.quote;
    glossaryLinks.innerHTML='';
    (item.links||[]).forEach(link=>{
      const a=document.createElement('a');
      a.href=link;
      const found=(window.LESSON_ORDER||[]).find(x=>x.file===link);
      a.textContent=found ? found.title : link.replace('.html','');
      glossaryLinks.appendChild(a);
    });
    glossaryModal.classList.add('show');
  });
  document.getElementById('closeGlossary')?.addEventListener('click',()=>glossaryModal?.classList.remove('show'));
  glossaryModal?.addEventListener('click',e=>{ if(e.target===glossaryModal) glossaryModal.classList.remove('show'); });
  document.getElementById('highlightOccurrences')?.addEventListener('click',()=>{
    if(!lessonArticle || !currentTerm) return;
    lessonArticle.querySelectorAll('.highlighted-occurrence').forEach(x=>x.classList.remove('highlighted-occurrence'));
    lessonArticle.querySelectorAll('.glossary-term').forEach(x=>{ if(x.dataset.term===currentTerm) x.classList.add('highlighted-occurrence'); });
    lessonArticle.querySelector('.highlighted-occurrence')?.scrollIntoView({behavior:'smooth', block:'center'});
    glossaryModal?.classList.remove('show');
  });

  // evidenziazioni robuste: ancorate al range reale
  function unwrapMarks(root){
    if(!root) return;
    root.querySelectorAll('mark.user-highlight-pending, mark.user-highlight-saved').forEach(mark=>{
      const parent=mark.parentNode;
      if(!parent) return;
      while(mark.firstChild) parent.insertBefore(mark.firstChild, mark);
      parent.removeChild(mark);
      parent.normalize();
    });
  }

  function getTextNodes(root){
    const walker=document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent=node.parentElement;
        if(parent && parent.closest('script,style,textarea,button,a,.notes-panel,.modal')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes=[];
    while(walker.nextNode()) nodes.push(walker.currentNode);
    return nodes;
  }

  function getNodePath(root, node){
    const path=[];
    let current=node;
    while(current && current!==root){
      const parent=current.parentNode;
      if(!parent) return null;
      path.unshift(Array.prototype.indexOf.call(parent.childNodes, current));
      current=parent;
    }
    return current===root ? path.join('.') : null;
  }

  function getNodeFromPath(root, path){
    if(path===null || path===undefined || path==='') return root;
    const indexes=String(path).split('.').map(n=>Number(n)).filter(n=>Number.isInteger(n));
    let current=root;
    for(const index of indexes){
      if(!current?.childNodes || index<0 || index>=current.childNodes.length) return null;
      current=current.childNodes[index];
    }
    return current;
  }

  function rangeToAnchor(range){
    if(!lessonArticle || !range) return null;
    const startNode=range.startContainer;
    const endNode=range.endContainer;
    const startPath=getNodePath(lessonArticle, startNode);
    const endPath=getNodePath(lessonArticle, endNode);
    if(startPath===null || endPath===null) return null;
    return {
      startPath,
      startOffset: range.startOffset,
      endPath,
      endOffset: range.endOffset
    };
  }

  function anchorToRange(anchor){
    if(!lessonArticle || !anchor) return null;
    const startNode=getNodeFromPath(lessonArticle, anchor.startPath);
    const endNode=getNodeFromPath(lessonArticle, anchor.endPath);
    if(!startNode || !endNode) return null;
    const range=document.createRange();
    try{
      const maxStart=startNode.nodeType===Node.TEXT_NODE ? startNode.nodeValue.length : startNode.childNodes.length;
      const maxEnd=endNode.nodeType===Node.TEXT_NODE ? endNode.nodeValue.length : endNode.childNodes.length;
      range.setStart(startNode, Math.max(0, Math.min(anchor.startOffset, maxStart)));
      range.setEnd(endNode, Math.max(0, Math.min(anchor.endOffset, maxEnd)));
      return range.collapsed ? null : range;
    }catch(_){
      return null;
    }
  }

  function findSnippetRange(root, snippet){
    const target=normalizeText(snippet);
    if(!root || !target) return null;
    const nodes=getTextNodes(root);
    const segments=[];
    let full='';
    nodes.forEach(node=>{
      const value=node.nodeValue;
      let normalized='';
      const map=[];
      let prevSpace=true;
      for(let i=0;i<value.length;i++){
        const ch=value[i];
        const isSpace=/\s/.test(ch);
        if(isSpace){
          if(!prevSpace && normalized.length){ normalized+=' '; map.push(i); }
          prevSpace=true;
        }else{
          normalized+=ch;
          map.push(i);
          prevSpace=false;
        }
      }
      normalized=normalized.trimEnd();
      if(!normalized) return;
      const startFull=full.length;
      full+=normalized;
      segments.push({node, normalized, map, startFull, endFull:full.length});
      full+=' ';
    });
    const idx=full.indexOf(target);
    if(idx===-1) return null;
    const endIdx=idx + target.length;
    let startSeg=null;
    let endSeg=null;
    for(const seg of segments){
      if(startSeg===null && idx >= seg.startFull && idx < seg.endFull) startSeg=seg;
      if(endIdx > seg.startFull && endIdx <= seg.endFull + 1){ endSeg=seg; break; }
    }
    if(!startSeg || !endSeg) return null;
    const startInNorm=idx - startSeg.startFull;
    const endInNorm=Math.min(endIdx - endSeg.startFull, endSeg.normalized.length) - 1;
    const startOffset=startSeg.map[Math.max(0,startInNorm)] || 0;
    const endOffset=(endSeg.map[Math.max(0,endInNorm)] || 0) + 1;
    const range=document.createRange();
    range.setStart(startSeg.node, startOffset);
    range.setEnd(endSeg.node, endOffset);
    return range;
  }

  function rangesIntersect(r1, r2){
    return r1.compareBoundaryPoints(Range.END_TO_START, r2) < 0 && r1.compareBoundaryPoints(Range.START_TO_END, r2) > 0;
  }

  function getAppliedRanges(){
    return [...lessonArticle.querySelectorAll('mark.user-highlight-pending, mark.user-highlight-saved')].map(mark=>{
      const range=document.createRange();
      range.selectNodeContents(mark);
      return range;
    });
  }

  function applyMark(highlight, status){
    if(!lessonArticle) return false;
    let range=highlight.anchor ? anchorToRange(highlight.anchor) : null;
    if(!range && highlight.text) range=findSnippetRange(lessonArticle, highlight.text);
    if(!range || range.collapsed) return false;

    const overlaps=getAppliedRanges().some(existing=>rangesIntersect(existing, range));
    if(overlaps) return false;

    const selectedText=normalizeText(range.toString());
    if(!selectedText) return false;
    highlight.text=selectedText;
    if(!highlight.anchor) highlight.anchor=rangeToAnchor(range);

    const mark=document.createElement('mark');
    mark.className=status==='saved' ? 'user-highlight-saved' : 'user-highlight-pending';
    mark.dataset.highlightId=highlight.id;
    mark.dataset.highlightText=selectedText;
    try{
      range.surroundContents(mark);
      return true;
    }catch(_){
      try{
        const frag=range.extractContents();
        mark.appendChild(frag);
        range.insertNode(mark);
        return true;
      }catch(__){
        return false;
      }
    }
  }

  function reapplyHighlights(){
    if(!lessonArticle) return;
    unwrapMarks(lessonArticle);
    pendingHighlights=pendingHighlights.filter(item=>applyMark(item, 'pending'));
    notesState.savedHighlights=notesState.savedHighlights.filter(item=>applyMark(item, 'saved'));
    persistNotes();
    renderSavedHighlights();
  }

  function isSameHighlight(a, b){
    if(!a || !b) return false;
    if(a.anchor && b.anchor){
      return a.anchor.startPath===b.anchor.startPath && a.anchor.startOffset===b.anchor.startOffset && a.anchor.endPath===b.anchor.endPath && a.anchor.endOffset===b.anchor.endOffset;
    }
    return a.text===b.text;
  }

  function selectionInsideValidArea(range){
    const common=range.commonAncestorContainer.nodeType===1 ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
    if(!common || !lessonArticle?.contains(common)) return false;
    if(common.closest('.glossary-term, .notes-panel, .modal, button, a')) return false;
    return true;
  }

  function createSelectionToolbar(){
    if(!lessonArticle || document.getElementById('selectionToolbar')) return;
    const toolbar=document.createElement('div');
    toolbar.id='selectionToolbar';
    toolbar.className='selection-toolbar';
    toolbar.innerHTML='<button type="button" class="pill-btn primary small" id="markSelectionBtn">Evidenzia</button><button type="button" class="pill-btn small" id="cancelSelectionBtn">Annulla</button>';
    document.body.appendChild(toolbar);

    function hideToolbar(){
      toolbar.classList.remove('show');
      toolbar.style.left='-9999px';
      toolbar.style.top='-9999px';
    }

    function getValidSelection(){
      const sel=window.getSelection();
      if(!sel || sel.rangeCount===0 || sel.isCollapsed) return null;
      const range=sel.getRangeAt(0).cloneRange();
      if(!selectionInsideValidArea(range)) return null;
      const text=normalizeText(sel.toString());
      if(!text || text.length < 2) return null;
      const anchor=rangeToAnchor(range);
      if(!anchor) return null;
      return { sel, range, text, anchor };
    }

    function placeToolbar(){
      const data=getValidSelection();
      if(!data){ hideToolbar(); return; }
      const rect=data.range.getBoundingClientRect();
      toolbar.style.left=Math.max(12, rect.left + window.scrollX)+'px';
      toolbar.style.top=Math.max(12, rect.top + window.scrollY - 54)+'px';
      toolbar.classList.add('show');
    }

    document.addEventListener('selectionchange',()=>window.requestAnimationFrame(placeToolbar));
    window.addEventListener('scroll',()=>{ if(toolbar.classList.contains('show')) placeToolbar(); }, {passive:true});
    window.addEventListener('resize',()=>{ if(toolbar.classList.contains('show')) placeToolbar(); });
    document.getElementById('cancelSelectionBtn')?.addEventListener('click',()=>{ window.getSelection()?.removeAllRanges(); hideToolbar(); });
    document.getElementById('markSelectionBtn')?.addEventListener('click',()=>{
      const data=getValidSelection();
      if(!data) return;
      const candidate={ id: uid(), text: data.text, anchor: data.anchor };
      const all=[...pendingHighlights, ...notesState.savedHighlights];
      if(!all.some(item=>isSameHighlight(item, candidate))){
        pendingHighlights.push(candidate);
        persistNotes();
        reapplyHighlights();
      }
      data.sel.removeAllRanges();
      hideToolbar();
      openNotesPanel();
    });
  }

  reapplyHighlights();
  createSelectionToolbar();

  // modalità concentrazione
  const focusKey='eco-leopardi-focus-mode';
  const topbarRight=document.querySelector('.topbar-right');
  if(topbarRight && !document.getElementById('toggleFocusMode')){
    const btn=document.createElement('button');
    btn.className='icon-btn ghost';
    btn.id='toggleFocusMode';
    btn.type='button';
    btn.setAttribute('aria-label','Attiva modalità concentrazione');
    btn.textContent='◐';
    topbarRight.prepend(btn);
  }
  function setFocusMode(enabled){
    document.body.classList.toggle('focus-mode', !!enabled);
    localStorage.setItem(focusKey, enabled ? '1' : '0');
  }
  if(localStorage.getItem(focusKey)==='1') setFocusMode(true);
  document.getElementById('toggleFocusMode')?.addEventListener('click',()=>setFocusMode(!document.body.classList.contains('focus-mode')));
  document.addEventListener('keydown',e=>{ if(e.key==='Escape' && document.body.classList.contains('focus-mode')) setFocusMode(false); });

  // home intro switch
  document.getElementById('playIntro')?.addEventListener('click',()=>{
    const cover=document.getElementById('coverBox');
    if(!cover) return;
    cover.innerHTML=`<div class="media-frame video-frame"><iframe width="560" height="315" src="https://www.youtube.com/embed/iN_rSsKyAQc?si=saT8Hkunlpt6uKHv" title="Video introduttivo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>`;
  });

  // service worker
  if('serviceWorker' in navigator){
    window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
  }
})();
