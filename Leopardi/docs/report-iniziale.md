# Report iniziale rapido

## File analizzati
- `manifest.json`
- `service-worker.js`
- `package.json` (assente)
- `capacitor.config.json` / `capacitor.config.ts` (assenti)
- struttura file web nella root del repository

## Punti deboli individuati

### 1) Caching fragile (service worker)
- C'è una singola cache (`eco-leopardi-v2`) usata per tutto: shell, pagine, runtime.
- La lista `APP_SHELL` è molto lunga e hardcoded: ogni nuova pagina/asset richiede modifica manuale.
- Strategia fetch non separa asset e HTML.
- Fallback offline sempre su `index.html`, anche per richieste non HTML.

### 2) Configurazione Capacitor incompleta
- Non esiste `capacitor.config.*`.
- Mancano script npm per `cap sync`, `cap open android`, `cap open ios`.
- Assenza di `package.json` impedisce un flusso standard di setup.

### 3) Script mancanti
- Nessun controllo automatico minimo su file critici PWA.
- Nessun comando standardizzato per avvio locale o validazione base.

## Impatto attuale
- Il sito statico può funzionare su GitHub Pages, ma la robustezza offline è limitata.
- Ogni evoluzione dei contenuti rischia di rompere il caching per dimenticanza di aggiornare la lista hardcoded.
- La base Capacitor non è realmente pronta all'uso.
