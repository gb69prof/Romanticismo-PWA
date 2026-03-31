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
  if (!box) return;
  const page = document.body.dataset.page || 'pagina';
  const title = document.body.dataset.title || page;
  const storageKey = 'foscolo-notes::' + page;
  const textarea = box.querySelector('textarea');
  const saveLocalBtn = box.querySelector('[data-action="save-local"]');
  const downloadBtn = box.querySelector('[data-action="download-notes"]');
  const clearBtn = box.querySelector('[data-action="clear-notes"]');
  const status = box.querySelector('[data-notes-status]');
  const saved = localStorage.getItem(storageKey);
  if (saved) textarea.value = saved;
  const setStatus = (msg) => {
    if (!status) return;
    status.textContent = msg;
    status.classList.add('show');
    window.clearTimeout(setStatus._t);
    setStatus._t = window.setTimeout(() => status.classList.remove('show'), 2200);
  };
  saveLocalBtn?.addEventListener('click', () => {
    localStorage.setItem(storageKey, textarea.value);
    setStatus('Appunti salvati nel dispositivo');
  });
  downloadBtn?.addEventListener('click', () => {
    const content = `Titolo: ${title}\nFile: ${page}\n\n${textarea.value}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const href = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = href;
    a.download = page.replace(/\.html$/,'') + '-appunti.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(href), 1000);
    setStatus('File appunti scaricato');
  });
  clearBtn?.addEventListener('click', () => {
    textarea.value = '';
    localStorage.removeItem(storageKey);
    setStatus('Appunti cancellati');
  });
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
    <div class="snapshot-subtitle">Nodi rapidi</div>
    <ul class="snapshot-links">${highlights}</ul>`;
  aside.insertBefore(quick, aside.firstChild);
}

function addFocusToggle() {
  document.querySelectorAll('[data-focus-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.classList.toggle('focus-mode');
      btn.textContent = document.body.classList.contains('focus-mode') ? 'Esci dalla concentrazione' : 'Modalità concentrazione';
    });
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
