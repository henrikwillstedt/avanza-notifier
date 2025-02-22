📢 Avanza Notifier - Chrome Extension

## 📌 Övergripande beskrivning
Ett Chrome-tillägg som låter dig höra när du tjänar pengar på Avanza, utan att behöva hålla koll på skärmen.

### 🎯 Huvudfunktioner
- [ ] Automatisk övervakning av portföljvärde
- [ ] Ljudnotifiering vid värdeökning
- [ ] Valbar notifieringsnivå (100kr, 1000kr, 10 000kr, 100 000kr)
- [ ] Valbar ljudeffekt (5 olika alternativ)
- [ ] Uppdatering varje minut
- [ ] Enkel installation via chrome://extensions/

## 📋 Projektchecklista

### 1️⃣ Projektstruktur
- [x] 1.1 Skapa projektmapp: `avanza-notifier`
- [ ] 1.2 Skapa följande filer:
  - [x] 1.2.1 manifest.json
  - [x] 1.2.2 content.js
  - [x] 1.2.3 sound.mp3
  - [x] 1.2.4 icon.png
  - [x] 1.2.5 popup.html
  - [x] 1.2.6 popup.js

### 2️⃣ Manifest Setup
- [x] 2.1 Skapa manifest.json med:
  - [x] 2.1.1 Grundläggande metadata (namn, version, beskrivning)
  - [x] 2.1.2 Nödvändiga permissions
  - [x] 2.1.3 Content script konfiguration
  - [x] 2.1.4 Icon setup

### 3️⃣ Content Script Implementation
- [ ] 3.1 Implementera huvudlogik i content.js:
  - [ ] 3.1.1 Hitta rätt HTML-selektor för Avanza
  - [ ] 3.1.2 Implementera värdeövervakning
  - [ ] 3.1.3 Lägg till ljuduppspelning
  - [ ] 3.1.4 Sätt upp intervalluppdatering

### 4️⃣ Popup Interface
- [x] 4.1 Skapa popup.html med:
  - [x] 4.1.1 Dropdown för nivåval
  - [x] 4.1.2 Dropdown för ljudeffektval
  - [x] 4.1.3 Spara-knapp
- [x] 4.2 Implementera popup.js:
  - [x] 4.2.1 Hantera nivåval
  - [x] 4.2.2 Hantera ljudeffektval
  - [x] 4.2.3 Spara inställningar
  - [x] 4.2.4 Ladda sparade inställningar

### 5️⃣ Assets
- [x] 5.1 Lägg till ljudfiler:
  - [x] 5.1.1 luigis_mansion_2001.mp3 (Luigi's Mansion coin sound)
  - [x] 5.1.2 mario_bros_famicom_1983.mp3 (Classic Mario coin sound)
  - [x] 5.1.3 mario_bros_famicom_1985.mp3 (Super Mario Bros coin sound)
- [x] 5.2 Skapa/lägg till icon.png
  - [x] 5.2.1 16x16px version
  - [x] 5.2.2 48x48px version
  - [x] 5.2.3 128x128px version

### 6️⃣ Testing
- [ ] 6.1 Testa installation
- [ ] 6.2 Verifiera att värdeavläsning fungerar
- [ ] 6.3 Testa ljudnotifieringar
- [ ] 6.4 Verifiera att nivåändring fungerar
- [ ] 6.5 Testa uppdateringsintervall

### 7️⃣ Distribution
- [ ] 7.1 Paketera tillägget som ZIP
- [ ] 7.2 Dokumentera installationsinstruktioner
- [ ] 7.3 Testa installation från ZIP

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