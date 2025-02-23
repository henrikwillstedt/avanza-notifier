📢 Avanza Notifier - Chrome Extension

# 🚀 Installation
Denna guide hjälper dig att installera Avanza Notifier i Chrome, steg för steg. Inga kodkunskaper krävs!

## 📥 Steg 1: Ladda ner filerna
1. Klicka på den gröna "Code" knappen högst upp på denna sida
2. Välj "Download ZIP" från menyn
3. När filen har laddats ner, högerklicka på den och välj "Extrahera" eller "Packa upp"
4. Kom ihåg var du sparade den uppackade mappen

## 🔧 Steg 2: Installera i Chrome
1. Öppna Chrome webbläsaren
2. Skriv in `chrome://extensions` i adressfältet och tryck Enter
3. Hitta reglaget för "Programmerarläge" eller "Developer mode" (uppe till höger) och aktivera det
4. Klicka på knappen "Läs in okomprimerat tillägg" eller "Load unpacked"
5. Leta upp och välj mappen du packade upp i Steg 1
6. Nu ska du se "Avanza Notifier" bland dina tillägg!

## ✅ Steg 3: Verifiera installationen
1. Titta efter en ny ikon i Chrome's tilläggsfält (uppe till höger)
2. Klicka på ikonen för att se inställningarna
3. Följ länken till Avanza
4. Klicka på ikonen för att se inställningarna
5. Välj önskad notifieringsnivå och ljudeffekt
6. Klicka på "Spara inställningar"


## ❓ Vanliga frågor

### Varför ser jag inte tillägget?
- Kontrollera att du har aktiverat "Programmerarläge"
- Prova att ladda om Chrome
- Säkerställ att du valde rätt mapp vid installationen

### Hur uppdaterar jag tillägget?
1. Ladda ner den nya versionen
2. Gå till `chrome://extensions`
3. Ta bort den gamla versionen
4. Följ installationsstegen ovan igen

### Hur tar jag bort tillägget?
1. Gå till `chrome://extensions`
2. Hitta "Avanza Notifier"
3. Klicka på "Ta bort" eller papperskorgen

### Behöver du hjälp?
Kontakta [@Appmakarn](https://x.com/Appmakarn) på X (Twitter).

---



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
- [x] 3.1 Implementera huvudlogik i content.js:
  - [x] 3.1.1 Hitta rätt HTML-selektor för Avanza
  - [x] 3.1.2 Implementera värdeövervakning
  - [x] 3.1.3 Lägg till ljuduppspelning
  - [x] 3.1.4 Sätt upp intervalluppdatering

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
- [x] 6.1 Testa installation
- [x] 6.2 Verifiera att värdeavläsning fungerar
- [x] 6.3 Testa ljudnotifieringar
- [x] 6.4 Verifiera att nivåändring fungerar
- [x] 6.5 Testa uppdateringsintervall

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

## 🔮 Framtida TODO
- [ ] Lägg till stöd för Nordnet
- [ ] Om man är på annan sajt, länk till Avanza