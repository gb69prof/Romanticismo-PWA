# PWA Foscolo

Apri `index.html` tramite server locale, non con doppio clic puro, se vuoi testare service worker e installazione.

## Test in locale
Puoi usare uno di questi:
- Python: `python -m http.server 8000`
- Node: `npx serve .`

Poi apri:
- `http://localhost:8000/`

## Test su GitHub Pages
Carica il contenuto della cartella nella root del repository pubblicato con GitHub Pages.
Esempio URL:
- `https://TUO-USERNAME.github.io/NOME-REPO/`

Controlli da fare:
1. L’URL apre `index.html`
2. In DevTools > Application vedi `manifest.json` e `service-worker.js`
3. Il browser propone installazione / Aggiungi a Home
4. Apri almeno una o due lezioni, poi prova offline: la shell e le pagine visitate restano disponibili