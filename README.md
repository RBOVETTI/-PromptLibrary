# 🤖 AI Prompt Library - Professional Web Application

Una web application moderna e professionale per gestire, esplorare e modificare una libreria completa di prompt AI organizzati per categoria.

## ✨ Caratteristiche

### 📚 Gestione Prompt
- **500+ Prompt professionali** organizzati in categorie
- **Visualizzazione per categoria** con icone e descrizioni
- **Design card-based** per una facile navigazione
- **Anteprima rapida** del contenuto di ogni prompt

### 🔍 Ricerca e Filtri
- **Ricerca in tempo reale** tra titoli, contenuti e ID
- **Filtro per categoria** con contatore prompt
- **Informazioni sui risultati** con statistiche dinamiche
- **Scorciatoie da tastiera** (Ctrl/Cmd + K per ricerca)

### ✏️ Modifica e Gestione
- **Copia con un click** negli appunti
- **Modifica inline** con editor dedicato
- **Tracciamento modifiche** con indicatore visivo
- **Reset alle versioni originali** disponibile
- **Export JSON** dei prompt modificati

### 🎨 Design Professionale
- **Design moderno e pulito** con UI intuitiva
- **Dark mode** con toggle persistente
- **Completamente responsive** per mobile, tablet e desktop
- **Animazioni fluide** e transizioni eleganti
- **Scrollbar personalizzate** per una UX coerente

### ⌨️ Scorciatoie da Tastiera
- `Ctrl/Cmd + K` - Focus sulla ricerca
- `Esc` - Chiudi modal
- `Ctrl/Cmd + C` - Copia prompt (quando modal è aperto)

## 🚀 Come Usare

### Installazione

1. **Clona o scarica** il repository
2. **Assicurati** che il file `prompt-library-complete.json` sia nella stessa directory
3. **Apri** `index.html` nel browser

> **Nota**: Per evitare problemi CORS, è consigliato usare un server locale:

```bash
# Opzione 1: Python
python -m http.server 8000

# Opzione 2: Node.js (se hai npx)
npx http-server

# Opzione 3: PHP
php -S localhost:8000
```

Poi apri: `http://localhost:8000`

### Utilizzo Base

1. **Esplora le categorie** - Scorri la pagina per vedere tutte le categorie
2. **Filtra per categoria** - Clicca sui chip in alto per filtrare
3. **Cerca prompt** - Usa la barra di ricerca per trovare prompt specifici
4. **Visualizza dettagli** - Clicca su una card per aprire il modal
5. **Copia prompt** - Usa il pulsante "Copy" nel modal
6. **Modifica prompt** - Clicca "Edit", modifica il testo e salva
7. **Export modifiche** - Clicca "Export Modified" per scaricare un JSON con le tue modifiche

## 📁 Struttura File

```
-PromptLibrary/
│
├── index.html                      # Pagina principale
├── styles.css                      # Stilizzazione completa
├── app.js                          # Logica JavaScript
├── prompt-library-complete.json   # Database prompt (500+)
└── README.md                       # Questa guida
```

## 🎯 Funzionalità Avanzate

### Export Modifiche
Quando modifichi dei prompt, l'applicazione:
- Traccia tutte le modifiche in memoria
- Mostra un indicatore visivo (✏️) sulle card modificate
- Permette di esportare un JSON completo con:
  - Tutti i prompt (originali + modificati)
  - Flag `modified: true` sui prompt modificati
  - Data di modifica per ogni prompt
  - Metadati dell'export

### Dark Mode
- Tema chiaro/scuro con toggle
- Preferenza salvata in localStorage
- Transizioni fluide tra i temi
- Palette colori ottimizzata per entrambi i temi

### Responsive Design
- **Desktop** (>768px): Layout a griglia multi-colonna
- **Tablet** (768px): Layout adattivo
- **Mobile** (<768px): Layout single-column
- Touch-friendly su tutti i dispositivi

## 🛠️ Tecnologie Utilizzate

- **HTML5** - Struttura semantica
- **CSS3** - Styling moderno con variabili CSS e Grid/Flexbox
- **Vanilla JavaScript** - Nessuna dipendenza esterna
- **Local Storage** - Persistenza preferenze tema
- **Clipboard API** - Copia negli appunti

## 🎨 Palette Colori

### Light Mode
- Background: #ffffff, #f8f9fa
- Text: #1a1a1a, #4a5568
- Accent: #3b82f6
- Success: #10b981

### Dark Mode
- Background: #1a1a1a, #2d2d2d
- Text: #f8f9fa, #cbd5e0
- Accent: #60a5fa
- Success: #34d399

## 📊 Statistiche

- **500 prompt** professionali
- **15+ categorie** diverse
- **100% responsive** design
- **0 dipendenze** esterne
- **< 100KB** dimensione totale (escluso JSON)

## 🔄 Aggiornamenti Futuri

Possibili miglioramenti:
- [ ] Esportazione in formati multipli (CSV, Markdown)
- [ ] Import di prompt personalizzati
- [ ] Tag system per cross-category search
- [ ] Favorites/bookmarks system
- [ ] Condivisione prompt via URL
- [ ] Versioning delle modifiche
- [ ] API REST per integrazione esterna

## 📝 Note per Sviluppatori

### Modificare Prompt
I prompt modificati sono salvati in una `Map` JavaScript:
```javascript
modifiedPrompts.set(promptId, newContent)
```

### Aggiungere Nuove Categorie
Modifica `prompt-library-complete.json` seguendo la struttura:
```json
{
  "category": "Nome Categoria",
  "icon": "🎯",
  "description": "Descrizione categoria",
  "prompts": [...]
}
```

### Personalizzare Stili
Modifica le variabili CSS in `:root` in `styles.css`:
```css
:root {
  --accent-primary: #your-color;
  --radius-md: 8px;
  /* ... */
}
```

## 📄 Licenza

Questo progetto è fornito "così com'è" per uso personale e professionale.

## 🤝 Contributi

Suggerimenti e miglioramenti sono benvenuti!

---

**Sviluppato con ❤️ per semplificare la gestione dei prompt AI**
