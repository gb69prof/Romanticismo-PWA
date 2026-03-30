window.FOSCOLO_LESSONS = [{"file": "1-foscolo-biografia.html", "title": "Ugo Foscolo – Biografia essenziale"}, {"file": "2-foscolo-introduzione-poetica.html", "title": "Ugo Foscolo: l&#x27;immagine del mondo e la sua filosofia"}, {"file": "3-foscolo-meccanicismo.html", "title": "La filosofia meccanicista: l’universo come macchina"}, {"file": "4-foscolo-religione-delle-illusioni.html", "title": "Cos’è e perché Foscolo l’ha creata"}, {"file": "5-foscolo-neoclassicismo-e-preromanticismo.html", "title": "Neoclassicismo e Preromanticismo"}, {"file": "6-oscolo-poetica-neoclassico-e-preromantico.html", "title": "Foscolo neoclassico e Foscolo preromantico: l’inquietudine del nulla eterno"}, {"file": "7-foscolo-opere-introduzione.html", "title": "Ugo Foscolo: le opere maggiori"}, {"file": "8-foscolo-jacopo-ortis.html", "title": "Le ultime lettere di Jacopo Ortis"}, {"file": "9-foscolo-temi-jacopo-ortis.html", "title": "Temi principali de Le ultime lettere di Jacopo Ortis"}, {"file": "10-foscolo-ortis-riassunto-per-capitoli.html", "title": "LE ULTIME LETTERE DI JACOPO ORTIS"}, {"file": "11-foscolo-ortis-parini.html", "title": "L&#x27;incontro con Parini"}, {"file": "12-foscolo-dei-sepolcri.html", "title": "Lezione: Ugo Foscolo - Dei Sepolcri"}, {"file": "13-foscolo-religione-sepolcri.html", "title": "Approfondimento: La religione delle illusioni nei Sepolcri di Foscolo"}, {"file": "14-foscolo-grazie.html", "title": "14-foscolo-grazie"}, {"file": "15-foscolo-sonetti.html", "title": "I Sonetti di Ugo Foscolo"}, {"file": "16-foscolo-alla-sera.html", "title": "Lezione su &quot;Alla sera&quot; di Ugo Foscolo"}];
document.addEventListener('DOMContentLoaded', () => {
  buildLessonDropdown();
  buildToc();
  enhanceZoomableImages();
  setupNotes();
});

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
      opt.textContent = item.title;
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
