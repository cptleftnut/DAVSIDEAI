# DAVSIDE AI 🏠

**Din intelligente AI-boligagent** – en Tauri-mobilapp til det danske boligmarked.

## Funktioner

| Funktion | Beskrivelse |
|---|---|
| 🔍 **Boligsøgning** | Søg boliger i hele Danmark med AI-scoring og filtrering |
| 🤝 **Forhandlingsagent** | AI-drevet forhandlingsstrategi med markedsdata og taktikker |
| 📄 **Kontrakt-tjek** | Analysér lejekontrakten for ulovlige klausuler og problemer |
| 📷 **Virtual Staging** | Transformér boligbilleder med AI-styling (6 stilarter) |

## Tech Stack

- **Frontend**: Svelte 5 + TypeScript + Vite + TailwindCSS
- **Backend**: Rust + Tauri
- **AI**: Grok (xAI) API til analyse og staging

## Kom i gang

```bash
# Installer afhængigheder
cd frontend && npm install

# Start dev server
npm run dev

# Byg til produktion
npm run build
```

## Konfiguration

Tilføj din Grok API-nøgle via Setup Wizard (første gang) eller Indstillinger (⚙️).

## Standalone Web Version

En komplet standalone HTML-version uden afhængigheder findes i `frontend/dist/index.html`.
Åbn den direkte i en browser eller server den med en simpel HTTP-server:

```bash
cd frontend/dist && python3 -m http.server 8080
```
