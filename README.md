# DAVSIDEAI – Workflow Fix Pakke

Denne pakke retter alle problemer der får GitHub Actions workflow `android-build.yml` til at fejle i [cptleftnut/DAVSIDEAI](https://github.com/cptleftnut/DAVSIDEAI).

## Hvad var galt

1. **`src-tauri/tauri.conf.json` var ugyldig JSON** – manglede ydre `{}`, kommaer mellem sektioner, og indeholdt to duplikerede `"build"`-blokke. Tauri kunne ikke parse filen.
2. **Manglende `src-tauri/capabilities/default.json`** – konfigurationen refererer `"capabilities": ["default"]`, men filen fandtes ikke. Tauri v2 kræver den for at bygge.
3. **Manglende `src-tauri/icons/`** – Tauri kræver mindst ét ikon for at bygge en Android APK.
4. **Workflow rettelser**:
   - Tilføjet npm cache (hurtigere builds).
   - NDK installeres nu eksplicit via `setup-android` packages, og `NDK_HOME`/`ANDROID_NDK_HOME` eksporteres (Tauri Android kræver det).
   - Auto-genererer alle ikon-størrelser via `cargo tauri icon` før `android init`.
   - `cargo tauri android build` bruger nu `--apk` flag (ellers laver den AAB by default).
   - Upload-path bruger glob så både debug og release-varianter findes.

## Sådan installerer du fixet

Kopiér disse filer ind i dit repo (overskriv eksisterende):

```
.github/workflows/android-build.yml
src-tauri/tauri.conf.json
src-tauri/capabilities/default.json    ← NY
src-tauri/icons/icon.png                ← NY (placeholder, udskift med dit eget)
```

Commit og push til `main`. Workflow burde nu køre igennem.

## Bemærk

- `icon.png` er et placeholder-ikon. Udskift det med dit endelige logo (1024×1024 PNG). Workflow'en kører `cargo tauri icon` der auto-genererer alle størrelser.
- Hvis du vil signere release-APK'en skal du tilføje `KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD` som GitHub secrets og udvide workflow.
- `XAI_API_KEY` secret bruges allerede ved build (forudsat din Rust-kode læser den via `env!` eller runtime).
