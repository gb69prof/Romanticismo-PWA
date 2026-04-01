window.FOSCOLO_LESSONS = [{"file": "1-foscolo-biografia.html", "title": "Ugo Foscolo – Biografia essenziale"}, {"file": "2-foscolo-introduzione-poetica.html", "title": "Ugo Foscolo: l&#x27;immagine del mondo e la sua filosofia"}, {"file": "3-foscolo-meccanicismo.html", "title": "La filosofia meccanicista: l’universo come macchina"}, {"file": "4-foscolo-religione-delle-illusioni.html", "title": "Cos’è e perché Foscolo l’ha creata"}, {"file": "5-foscolo-neoclassicismo-e-preromanticismo.html", "title": "Neoclassicismo e Preromanticismo"}, {"file": "6-oscolo-poetica-neoclassico-e-preromantico.html", "title": "Foscolo neoclassico e Foscolo preromantico: l’inquietudine del nulla eterno"}, {"file": "7-foscolo-opere-introduzione.html", "title": "Ugo Foscolo: le opere maggiori"}, {"file": "8-foscolo-jacopo-ortis.html", "title": "Le ultime lettere di Jacopo Ortis"}, {"file": "9-foscolo-temi-jacopo-ortis.html", "title": "Temi principali de Le ultime lettere di Jacopo Ortis"}, {"file": "10-foscolo-ortis-riassunto-per-capitoli.html", "title": "LE ULTIME LETTERE DI JACOPO ORTIS"}, {"file": "11-foscolo-ortis-parini.html", "title": "L&#x27;incontro con Parini"}, {"file": "12-foscolo-dei-sepolcri.html", "title": "Lezione: Ugo Foscolo - Dei Sepolcri"}, {"file": "13-foscolo-religione-sepolcri.html", "title": "Approfondimento: La religione delle illusioni nei Sepolcri di Foscolo"}, {"file": "14-foscolo-grazie.html", "title": "14-foscolo-grazie"}, {"file": "15-foscolo-sonetti.html", "title": "I Sonetti di Ugo Foscolo"}, {"file": "16-foscolo-alla-sera.html", "title": "Lezione su &quot;Alla sera&quot; di Ugo Foscolo"}];

const VISITED_KEY = 'foscolo-visited-pages';

function getVisitedPages() {
  try {
    return JSON.parse(localStorage.getItem(VISITED_KEY) || '[]');
  } catch {
    return [];
  }
}

function setVisitedPage(page) {
  if (!page || page === 'index.html' || page.startsWith('test/')) return;
  const pages = new Set(getVisitedPages());
  pages.add(page);
  localStorage.setItem(VISITED_KEY, JSON.stringify([...pages]));
}

document.addEventListener('DOMContentLoaded', () => {
  markVisitedPage();
  buildLessonDropdown();
  buildToc();
  enhanceZoomableImages();
  setupNotes();
  addReadingProgress();
  enhanceIndexPage();
  enhanceLessonPage();
  decorateVisitedCards();
});

function markVisitedPage() {
  const current = document.body.dataset.page || '';
  setVisitedPage(current);
}

function buildLessonDropdown() {
  const holders = document.querySelectorAll('[data-lesson-dropdown]');
  if (!holders.length || !window.FOSCOLO_LESSONS) return;
  const current = document.body.dataset.page || '';
  holders.forEach(holder => {
    holder.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'lesson-select-wrap';
    const select = document.createElement('select');
    select.className = 'lesson-select';
    select.setAttribute('aria-label', 'Indice delle lezioni');
    const first = document.createElement('option');
    first.value = '';
    first.textContent = 'Indice delle lezioni';
    select.appendChild(first);
    window.FOSCOLO_LESSONS.forEach(item => {
      const opt = document.createElement('option');
      opt.value = item.file;
      opt.textContent = decodeHtml(item.title);
      if (item.file === current) opt.selected = true;
      select.appendChild(opt);
    });
    select.addEventListener('change', () => {
      if (select.value) window.location.href = select.value;
    });
    wrap.appendChild(select);
    holder.appendChild(wrap);
  });
}

function buildToc() {
  const headings = [...document.querySelectorAll('.lesson-body h2, .lesson-body h3')];
  const toc = document.querySelector('.toc');
  if (toc && headings.length) {
    toc.innerHTML = '';
    headings.forEach((h, i) => {
      if (!h.id) h.id = 'sec-' + (i + 1);
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      const li = document.createElement('li');
      li.appendChild(a);
      toc.appendChild(li);
    });
    const links = [...toc.querySelectorAll('a')];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-20% 0px -65% 0px', threshold: 0.01 });
    headings.forEach(h => observer.observe(h));
  }
}

function enhanceZoomableImages() {
  const imgs = [...document.querySelectorAll('img[src*="assets/"]')];
  if (!imgs.length) return;
  let modal = document.getElementById('imageLightbox');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'imageLightbox';
    modal.className = 'lightbox';
    modal.innerHTML = `
      <button class="lightbox-close" type="button" aria-label="Chiudi immagine">×</button>
      <figure class="lightbox-figure">
        <img class="lightbox-image" alt="">
        <figcaption class="lightbox-caption"></figcaption>
      </figure>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('lightbox-close')) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }
  const modalImg = modal.querySelector('.lightbox-image');
  const caption = modal.querySelector('.lightbox-caption');
  function closeModal() {
    modal.classList.remove('open');
    document.body.classList.remove('no-scroll');
  }
  imgs.forEach(img => {
    img.classList.add('zoomable-image');
    img.title = 'Apri a tutto schermo';
    img.addEventListener('click', () => {
      modalImg.src = img.src;
      modalImg.alt = img.alt || '';
      caption.textContent = img.alt || 'Mappa concettuale';
      modal.classList.add('open');
      document.body.classList.add('no-scroll');
    });
  });
}

function setupNotes() {
  const box = document.querySelector('[data-notes-box]');
  if (!box) return null;
  const page = document.body.dataset.page || 'pagina';
  const title = document.body.dataset.title || page;
  const storageKey = 'foscolo-notes::' + page;
  const textarea = box.querySelector('textarea');
  const saveLocalBtn = box.querySelector('[data-action="save-local"]');
  const downloadBtn = box.querySelector('[data-action="download-notes"]');
  const clearBtn = box.querySelector('[data-action="clear-notes"]');
  const status = box.querySelector('[data-notes-status]');
  const saved = localStorage.getItem(storageKey);
  if (saved && textarea) textarea.value = saved;

  const api = {
    storageKey,
    textarea,
    setStatus(msg) {
      if (!status) return;
      status.textContent = msg;
      status.classList.add('show');
      window.clearTimeout(api._t);
      api._t = window.setTimeout(() => status.classList.remove('show'), 2400);
    },
    append(text, meta = {}) {
      const cleaned = String(text || '').replace(/\s+/g, ' ').trim();
      if (!textarea || !cleaned) return;
      const sep = textarea.value.trim() ? '\n\n— — —\n\n' : '';
      textarea.value = `${textarea.value}${sep}${cleaned}`.trim();
      localStorage.setItem(storageKey, textarea.value);
      api.setStatus('Passaggio copiato negli appunti');
    },
    appendMany(items, meta = {}) {
      const cleaned = [...new Set((items || []).map(item => String(item || '').replace(/\s+/g, ' ').trim()).filter(Boolean))];
      if (!textarea || !cleaned.length) return;
      const blocks = cleaned.join('\n\n— — —\n\n');
      const sep = textarea.value.trim() ? '\n\n— — —\n\n' : '';
      textarea.value = `${textarea.value}${sep}${blocks}`.trim();
      localStorage.setItem(storageKey, textarea.value);
      api.setStatus(cleaned.length === 1 ? '1 passaggio copiato negli appunti' : `${cleaned.length} passaggi copiati negli appunti`);
    },
    updatePendingCount(count) {
      document.querySelectorAll('[data-highlights-pending-count]').forEach(el => {
        el.hidden = !count;
        el.textContent = String(count || 0);
      });
      document.querySelectorAll('[data-action="save-highlights-batch"]').forEach(btn => {
        btn.disabled = !count;
        btn.classList.toggle('is-disabled', !count);
      });
    }
  };

  saveLocalBtn?.addEventListener('click', () => {
    localStorage.setItem(storageKey, textarea?.value || '');
    api.setStatus('Appunti salvati nel dispositivo');
  });
  downloadBtn?.addEventListener('click', () => {
    const content = `Titolo: ${decodeHtml(title)}\nFile: ${page}\n\n${textarea?.value || ''}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = page.replace(/\.html$/,'') + '-appunti.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    api.setStatus('File appunti scaricato');
  });
  clearBtn?.addEventListener('click', () => {
    if (textarea) textarea.value = '';
    localStorage.removeItem(storageKey);
    api.setStatus('Appunti cancellati');
  });
  document.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-action="save-highlights-batch"]');
    if (!btn) return;
    window.dispatchEvent(new CustomEvent('foscolo:save-pending-highlights'));
  });

  window.FOSCOLO_NOTES_API = api;
  return api;
}

function addReadingProgress() {
  const article = document.querySelector('.lesson-body');
  if (!article) return;
  const bar = document.createElement('div');
  bar.className = 'reading-progress';
  bar.innerHTML = '<span></span>';
  document.body.appendChild(bar);
  const inner = bar.querySelector('span');
  const update = () => {
    const rect = article.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const total = Math.max(article.offsetHeight - vh * 0.35, 1);
    const read = Math.min(Math.max(-rect.top + vh * 0.18, 0), total);
    inner.style.width = `${(read / total) * 100}%`;
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

function enhanceIndexPage() {
  const grid = document.querySelector('.lesson-grid');
  if (!grid) return;
  const sectionHead = document.querySelector('.section-head');
  const wrap = document.createElement('div');
  wrap.className = 'library-tools';
  wrap.innerHTML = `
    <div class="card library-bar">
      <div>
        <div class="library-title">Orientamento rapido</div>
        <p>Filtra le lezioni e riprendi da dove eri rimasto.</p>
      </div>
      <div class="library-actions">
        <input type="search" class="library-search" placeholder="Cerca una lezione per titolo o tema..." aria-label="Cerca una lezione">
        <div class="library-count" data-library-count></div>
      </div>
    </div>`;
  sectionHead?.insertAdjacentElement('afterend', wrap);

  const search = wrap.querySelector('.library-search');
  const count = wrap.querySelector('[data-library-count]');
  const cards = [...grid.querySelectorAll('.lesson-card')];
  const update = () => {
    const q = (search.value || '').trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      const show = !q || text.includes(q);
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });
    count.textContent = `${visible} lezione${visible === 1 ? '' : 'i'} visibile${visible === 1 ? '' : 'i'}`;
  };
  search.addEventListener('input', update);
  update();
}

function enhanceLessonPage() {
  const article = document.querySelector('.lesson-body');
  if (!article) return;

  wrapSemanticSections(article);
  addStudySnapshot(article);
  addFocusToggle();
  initStudyHighlighter(article);
}

function wrapSemanticSections(article) {
  const nodes = [...article.childNodes];
  let currentSection = null;

  nodes.forEach(node => {
    if (node.nodeType === 1 && /^H2$/i.test(node.tagName)) {
      currentSection = document.createElement('section');
      currentSection.className = 'lesson-section';
      currentSection.dataset.sectionType = detectSectionType(node.textContent);
      article.appendChild(currentSection);
      currentSection.appendChild(node);
    } else if (currentSection) {
      currentSection.appendChild(node);
    }
  });

  article.querySelectorAll('.lesson-section').forEach(section => {
    const type = section.dataset.sectionType;
    if (type === 'vocab') transformDefinitionSection(section);
    if (type === 'saperi') transformBulletSection(section);
    if (type === 'summary') section.classList.add('summary-section');
  });
}

function transformDefinitionSection(section) {
  const paras = [...section.querySelectorAll(':scope > p')];
  if (!paras.length) return;
  const dl = document.createElement('dl');
  dl.className = 'definition-grid';
  paras.forEach(p => {
    const text = p.textContent.trim();
    const idx = text.indexOf(':');
    if (idx > 0) {
      const dt = document.createElement('dt');
      dt.textContent = text.slice(0, idx).trim();
      const dd = document.createElement('dd');
      dd.textContent = text.slice(idx + 1).trim();
      dl.append(dt, dd);
    } else {
      const dd = document.createElement('dd');
      dd.textContent = text;
      dl.append(dd);
    }
    p.remove();
  });
  section.appendChild(dl);
}

function transformBulletSection(section) {
  const paras = [...section.querySelectorAll(':scope > p')];
  if (!paras.length) return;
  const ul = document.createElement('ul');
  ul.className = 'bullet-grid';
  paras.forEach(p => {
    const li = document.createElement('li');
    li.textContent = p.textContent.trim();
    ul.appendChild(li);
    p.remove();
  });
  section.appendChild(ul);
}

function addStudySnapshot(article) {
  const aside = document.querySelector('.aside-stack');
  if (!aside) return;
  const text = article.innerText || '';
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(wordCount / 180));
  const sections = [...article.querySelectorAll('.lesson-section > h2')].map(h => ({
    id: h.id || '',
    label: h.textContent.trim(),
    type: detectSectionType(h.textContent)
  }));
  const highlights = sections.slice(0, 5).map(s => `<li><a href="#${s.id}">${escapeHtml(s.label)}</a></li>`).join('');
  const quick = document.createElement('section');
  quick.className = 'card panel snapshot-card';
  quick.innerHTML = `
    <div class="snapshot-top">
      <div>
        <div class="snapshot-kicker">Scheda di studio</div>
        <h3>Colpo d’occhio</h3>
      </div>
      <button class="btn secondary compact-btn" type="button" data-focus-toggle>Modalità concentrazione</button>
    </div>
    <div class="snapshot-stats">
      <div><strong>${minutes} min</strong><span>tempo medio</span></div>
      <div><strong>${sections.length}</strong><span>sezioni</span></div>
      <div><strong>${wordCount}</strong><span>parole circa</span></div>
    </div>
    <div class="snapshot-subtitle">Strumenti di studio</div>
    <div class="study-action-stack">
      <button class="btn" type="button" data-action="highlight-selection">Evidenzia selezione</button>
      <button class="btn secondary" type="button" data-action="save-highlights-batch">Salva evidenziazioni negli appunti <span class="notes-badge" data-highlights-pending-count hidden>0</span></button>
    </div>
    <p class="study-help">Su iPad: seleziona il testo con il menu del browser, poi premi “Evidenzia selezione”.</p>
    <div class="snapshot-subtitle">Nodi rapidi</div>
    <ul class="snapshot-links">${highlights}</ul>`;
  aside.insertBefore(quick, aside.firstChild);

  const mobileBar = document.createElement('div');
  mobileBar.className = 'study-mobile-bar';
  mobileBar.innerHTML = `
    <button class="btn" type="button" data-action="highlight-selection">Evidenzia selezione</button>
    <button class="btn secondary" type="button" data-action="save-highlights-batch">Salva negli appunti <span class="notes-badge" data-highlights-pending-count hidden>0</span></button>`;
  document.body.appendChild(mobileBar);
}

function addFocusToggle() {
  const storageKey = 'foscolo-focus-mode';
  const setState = (active) => {
    document.body.classList.toggle('focus-mode', active);
    localStorage.setItem(storageKey, active ? '1' : '0');
    document.querySelectorAll('[data-focus-toggle]').forEach(btn => {
      btn.textContent = active ? 'Esci dalla modalità concentrazione' : 'Modalità concentrazione';
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  };

  setState(localStorage.getItem(storageKey) === '1');
  document.querySelectorAll('[data-focus-toggle]').forEach(btn => {
    if (btn.dataset.focusReady === '1') return;
    btn.dataset.focusReady = '1';
    btn.addEventListener('click', () => setState(!document.body.classList.contains('focus-mode')));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && document.body.classList.contains('focus-mode')) setState(false);
  });
}

function decorateVisitedCards() {
  const visited = new Set(getVisitedPages());
  document.querySelectorAll('.lesson-card[href]').forEach(card => {
    const href = card.getAttribute('href');
    if (visited.has(href)) {
      let badge = card.querySelector('.visited-badge');
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'visited-badge';
        badge.textContent = 'Visitata';
        card.appendChild(badge);
      }
    }
  });
}



function initStudyHighlighter(root) {
  if (!root || root.dataset.highlighterReady === '1') return;
  root.dataset.highlighterReady = '1';

  const page = document.body.dataset.page || location.pathname.split('/').pop() || 'pagina';
  const storageKey = `foscolo-highlights::${page}`;
  let statusTimer = null;

  const status = (msg) => {
    const api = window.FOSCOLO_NOTES_API;
    if (api?.setStatus) {
      api.setStatus(msg);
      return;
    }
    let box = document.querySelector('.selection-status');
    if (!box) {
      box = document.createElement('div');
      box.className = 'selection-status';
      document.body.appendChild(box);
    }
    box.textContent = msg;
    box.classList.add('show');
    clearTimeout(statusTimer);
    statusTimer = setTimeout(() => box.classList.remove('show'), 2200);
  };

  const loadHighlights = () => {
    try {
      const items = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  };

  const saveHighlights = (items) => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  };

  const textSignature = (text) => String(text || '').replace(/\s+/g, ' ').trim();

  const getBlockText = (block) => textSignature(block.innerText || block.textContent || '');

  const getStudyBlocks = () => {
    const blocks = [...root.querySelectorAll('p, li, blockquote, h1, h2, h3, dt, dd')]
      .filter(el => !el.closest('.notes-card, .snapshot-card, .panel, .study-mobile-bar'));
    blocks.forEach((block, index) => {
      if (!block.dataset.studyBlockId) block.dataset.studyBlockId = `b-${index + 1}`;
    });
    return blocks;
  };

  const updatePendingUI = (items = loadHighlights()) => {
    const pending = items.filter(item => !item.savedToNotes).length;
    window.FOSCOLO_NOTES_API?.updatePendingCount?.(pending);
  };

  const textNodeWalker = (block) => document.createTreeWalker(block, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      if (node.parentElement?.closest('mark.study-highlight')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const findRangeByText = (block, selectedText) => {
    const wanted = textSignature(selectedText);
    if (!wanted) return null;
    const walker = textNodeWalker(block);
    let node;
    while ((node = walker.nextNode())) {
      const raw = node.nodeValue;
      const idx = raw.indexOf(selectedText);
      if (idx !== -1) {
        const range = document.createRange();
        range.setStart(node, idx);
        range.setEnd(node, idx + selectedText.length);
        return range;
      }
    }

    const blockText = getBlockText(block);
    const pos = blockText.indexOf(wanted);
    if (pos === -1) return null;

    const nodes = [];
    const walker2 = textNodeWalker(block);
    let n;
    while ((n = walker2.nextNode())) nodes.push(n);
    let total = 0;
    let startNode = null, endNode = null, startOffset = 0, endOffset = 0;

    for (const node of nodes) {
      const compact = textSignature(node.nodeValue);
      const next = total + compact.length;
      if (!startNode && pos >= total && pos <= next) {
        startNode = node;
        const local = pos - total;
        const source = node.nodeValue;
        let count = 0;
        for (let i = 0; i < source.length; i++) {
          if (/\s/.test(source[i])) continue;
          if (count === local) { startOffset = i; break; }
          count++;
        }
      }
      const endPos = pos + wanted.length;
      if (!endNode && endPos >= total && endPos <= next) {
        endNode = node;
        const localEnd = endPos - total;
        const source = node.nodeValue;
        let count = 0;
        endOffset = source.length;
        for (let i = 0; i < source.length; i++) {
          if (/\s/.test(source[i])) continue;
          count++;
          if (count >= localEnd) { endOffset = i + 1; break; }
        }
      }
      total = next;
    }

    if (!startNode || !endNode) return null;
    const range = document.createRange();
    range.setStart(startNode, startOffset);
    range.setEnd(endNode, endOffset);
    return range;
  };

  const clearHighlightsInDom = () => {
    root.querySelectorAll('mark.study-highlight').forEach(mark => {
      mark.replaceWith(document.createTextNode(mark.textContent));
    });
    root.normalize();
  };

  const wrapRange = (range, item) => {
    if (!range || range.collapsed) return false;
    const mark = document.createElement('mark');
    mark.className = 'study-highlight';
    if (item.savedToNotes) mark.classList.add('saved-to-notes');
    mark.dataset.highlightId = item.id;
    mark.dataset.blockId = item.blockId;
    try {
      range.surroundContents(mark);
      return true;
    } catch {
      try {
        const frag = range.extractContents();
        mark.appendChild(frag);
        range.insertNode(mark);
        return true;
      } catch {
        return false;
      }
    }
  };

  const rerender = () => {
    const items = loadHighlights();
    clearHighlightsInDom();
    const blocks = getStudyBlocks();
    items.forEach(item => {
      const block = blocks.find(b => b.dataset.studyBlockId === item.blockId) || blocks.find(b => getBlockText(b) === item.blockText);
      if (!block) return;
      const range = findRangeByText(block, item.text);
      if (!range) return;
      wrapRange(range, item);
    });
    updatePendingUI(items);
  };

  const getSelectedPieces = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return [];
    const range = sel.getRangeAt(0).cloneRange();
    const blocks = getStudyBlocks();
    const selectedBlocks = blocks.filter(block => {
      try { return range.intersectsNode(block); } catch { return false; }
    });
    const pieces = [];
    selectedBlocks.forEach(block => {
      const blockRange = document.createRange();
      blockRange.selectNodeContents(block);
      const intersection = range.cloneRange();
      if (intersection.compareBoundaryPoints(Range.START_TO_START, blockRange) < 0) {
        intersection.setStart(blockRange.startContainer, blockRange.startOffset);
      }
      if (intersection.compareBoundaryPoints(Range.END_TO_END, blockRange) > 0) {
        intersection.setEnd(blockRange.endContainer, blockRange.endOffset);
      }
      const text = textSignature(intersection.toString());
      if (!text) return;
      pieces.push({
        id: `hl-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
        blockId: block.dataset.studyBlockId,
        blockText: getBlockText(block),
        text,
        savedToNotes: false,
        savedAt: null,
        createdAt: Date.now()
      });
    });
    return pieces;
  };

  const addHighlightFromSelection = () => {
    const pieces = getSelectedPieces();
    if (!pieces.length) {
      status('Prima seleziona un passaggio del testo');
      return;
    }
    const items = loadHighlights();
    let added = 0;
    pieces.forEach(piece => {
      const duplicate = items.some(item => item.blockId === piece.blockId && item.text === piece.text);
      if (duplicate) return;
      items.push(piece);
      added += 1;
    });
    if (!added) {
      status('Questa selezione è già evidenziata');
      return;
    }
    saveHighlights(items);
    rerender();
    status(added === 1 ? 'Passaggio evidenziato' : `${added} passaggi evidenziati`);
    try { window.getSelection()?.removeAllRanges(); } catch {}
  };

  const savePendingHighlights = () => {
    const items = loadHighlights();
    const pending = items.filter(item => !item.savedToNotes);
    if (!pending.length) {
      status('Non ci sono nuove evidenziazioni da salvare');
      updatePendingUI(items);
      return;
    }
    window.FOSCOLO_NOTES_API?.appendMany?.(pending.map(item => item.text));
    const now = Date.now();
    pending.forEach(item => {
      item.savedToNotes = true;
      item.savedAt = now;
    });
    saveHighlights(items);
    rerender();
    status(pending.length === 1 ? '1 evidenziazione salvata negli appunti' : `${pending.length} evidenziazioni salvate negli appunti`);
  };

  document.addEventListener('click', (event) => {
    const actionBtn = event.target.closest('[data-action="highlight-selection"]');
    if (actionBtn) {
      event.preventDefault();
      addHighlightFromSelection();
      return;
    }
    const saveBtn = event.target.closest('[data-action="save-highlights-batch"]');
    if (saveBtn) {
      event.preventDefault();
      savePendingHighlights();
      return;
    }
    const mark = event.target.closest('mark.study-highlight');
    if (mark) {
      const items = loadHighlights();
      const next = items.filter(item => item.id !== mark.dataset.highlightId);
      if (next.length !== items.length) {
        saveHighlights(next);
        rerender();
        status('Evidenziazione rimossa');
      }
    }
  });

  window.addEventListener('foscolo:save-pending-highlights', savePendingHighlights);
  rerender();
}

function detectSectionType(text) {
  const t = (text || '').toLowerCase();
  if (t.includes('vocabolario')) return 'vocab';
  if (t.includes('saperi') || t.includes('irrinunciabili')) return 'saperi';
  if (t.includes('riassuntiva') || t.includes('minimi')) return 'summary';
  return 'default';
}

function decodeHtml(value) {
  const txt = document.createElement('textarea');
  txt.innerHTML = value;
  return txt.value;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
