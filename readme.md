📢 Avanza Notifier - Chrome Extension

## 📌 Övergripande beskrivning
Ett Chrome-tillägg som låter dig höra när du tjänar pengar på Avanza, utan att behöva hålla koll på skärmen.

### 🎯 Huvudfunktioner
- [ ] Automatisk övervakning av portföljvärde
- [ ] Ljudnotifiering vid värdeökning
- [ ] Valbar notifieringsnivå (100kr, 1000kr, 10 000kr, 100 000kr)
- [ ] Uppdatering varje minut
- [ ] Enkel installation via chrome://extensions/

## 📋 Projektchecklista

### 1️⃣ Projektstruktur
- [ ] Skapa projektmapp: `avanza-notifier`
- [ ] Skapa följande filer:
  - [ ] manifest.json
  - [ ] content.js
  - [ ] sound.mp3
  - [ ] icon.png
  - [ ] popup.html
  - [ ] popup.js

### 2️⃣ Manifest Setup
- [ ] Skapa manifest.json med:
  - [ ] Grundläggande metadata (namn, version, beskrivning)
  - [ ] Nödvändiga permissions
  - [ ] Content script konfiguration
  - [ ] Icon setup

### 3️⃣ Content Script Implementation
- [ ] Implementera huvudlogik i content.js:
  - [ ] Hitta rätt HTML-selektor för Avanza
  - [ ] Implementera värdeövervakning
  - [ ] Lägg till ljuduppspelning
  - [ ] Sätt upp intervalluppdatering

### 4️⃣ Popup Interface
- [ ] Skapa popup.html med:
  - [ ] Dropdown för nivåval
  - [ ] Spara-knapp
- [ ] Implementera popup.js:
  - [ ] Hantera nivåval
  - [ ] Spara inställningar
  - [ ] Ladda sparade inställningar

### 5️⃣ Assets
- [ ] Lägg till ljudfil (sound.mp3)
- [ ] Skapa/lägg till icon.png
  - [ ] 16x16px version
  - [ ] 48x48px version
  - [ ] 128x128px version

### 6️⃣ Testing
- [ ] Testa installation
- [ ] Verifiera att värdeavläsning fungerar
- [ ] Testa ljudnotifieringar
- [ ] Verifiera att nivåändring fungerar
- [ ] Testa uppdateringsintervall

### 7️⃣ Distribution
- [ ] Paketera tillägget som ZIP
- [ ] Dokumentera installationsinstruktioner
- [ ] Testa installation från ZIP

## 🔧 Tekniska Detaljer

### Manifest.json Template
```json
{
  "manifest_version": 3,
  "name": "Avanza Notifier",
  "version": "1.0",
  "description": "Spelar upp ett ljud när din intjäning ökar med valbart belopp.",
  "permissions": ["activeTab", "storage"],
  "host_permissions": ["https://www.avanza.se/*"],
  "content_scripts": [
    {
      "matches": ["https://www.avanza.se/*"],
      "js": ["content.js"],
      "run_at": "document_idle"
    }
  ],
  "action": {
    "default_icon": {
      "16": "icon.png",
      "48": "icon.png",
      "128": "icon.png"
    }
  }
}
```

## 📝 Anteckningar
- Använd Chrome DevTools för att hitta rätt HTML-selektor på Avanza
- Testa med olika värdenivåer
- Säkerställ att ljudfilen är lämplig för ändamålet

## 🚀 Installation
1. Öppna Chrome och gå till chrome://extensions/
2. Aktivera Developer Mode
3. Klicka på "Ladda upp okomprimerat tillägg"
4. Välj projektmappen