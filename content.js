// Kontrollera om vi är på Avanza
const isAvanzaPage = window.location.hostname === 'www.avanza.se';

if (!isAvanzaPage) {
    // Om vi inte är på Avanza, visa redirect-sidan
    fetch(chrome.runtime.getURL('redirect.html'))
        .then(response => response.text())
        .then(html => {
            document.body.innerHTML = html;
            document.title = 'Avanza Notifier';
        });
} else {
    // Resten av koden för Avanza-sidan
    // Globala variabler för att hålla koll på state
    let notificationLevel = 1000; // Default värde, uppdateras från storage
    let selectedSound = 'mario_bros_famicom_1985.mp3'; // Default värde, uppdateras från storage
    let lastNotificationTime = 0; // För att hantera cooldown
    const COOLDOWN_PERIOD = 5000; // 5 sekunder mellan notifieringar
    const UPDATE_INTERVAL = 120000; // Uppdatera var 120:e sekund

    // Funktion för att parsa värdet från Avanza
    function parseAvanzaValue(element) {
        if (!element) return null;
        
        // Ta bort "kr", mellanslag och eventuellt minustecken, konvertera till number
        const valueText = element.textContent
            .replace(/kr/g, '')
            .replace(/\s/g, '')
            .replace('−', '-'); // Hantera både vanligt minustecken och "minus"-tecknet från Avanza
        
        return parseInt(valueText, 10);
    }

    // Funktion för att kontrollera om det är en ny dag
    function isNewDay(lastCheckTime) {
        if (!lastCheckTime) return true;
        const lastCheck = new Date(lastCheckTime);
        const now = new Date();
        return lastCheck.getDate() !== now.getDate() ||
               lastCheck.getMonth() !== now.getMonth() ||
               lastCheck.getFullYear() !== now.getFullYear();
    }

    // Funktion för att spara state
    function saveState(value, timestamp) {
        chrome.storage.local.set({
            lastCheckedValue: value,
            lastCheckTime: timestamp
        });
    }

    // Funktion för att spela upp ljud
    function playNotificationSound() {
        const now = Date.now();
        if (now - lastNotificationTime < COOLDOWN_PERIOD) {
            console.log('Cooldown period active, skipping notification');
            return;
        }
        
        const audio = new Audio(chrome.runtime.getURL(selectedSound));
        audio.play();
        lastNotificationTime = now;
    }

    // Huvudfunktion som kollar värdet
    function checkValue() {
        const element = document.querySelector('[data-e2e="development-card-amount"]');
        if (!element) return;

        const currentValue = parseAvanzaValue(element);
        if (isNaN(currentValue)) return;

        // Hämta tidigare state
        chrome.storage.local.get(['lastCheckedValue', 'lastCheckTime'], (result) => {
            const now = Date.now();
            let lastValue = result.lastCheckedValue || 0;
            
            // Kontrollera om det är en ny dag
            if (isNewDay(result.lastCheckTime)) {
                console.log('Ny dag, nollställer värden');
                lastValue = 0;
            }

            // Vi är bara intresserade av positiva värden
            if (currentValue <= 0) {
                saveState(0, now);
                return;
            }

            // Avrunda till närmaste notifieringsnivå
            const currentLevel = Math.floor(currentValue / notificationLevel) * notificationLevel;
            
            // Om vi nått en ny nivå, spela ljud
            if (currentLevel > lastValue) {
                console.log(`Ding! Ny nivå nådd: ${currentLevel} kr`);
                playNotificationSound();
            }

            // Spara det nya värdet
            saveState(currentLevel, now);
        });
    }

    // Lyssna efter ändringar i storage (när användaren ändrar inställningar)
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.notificationLevel) {
            notificationLevel = changes.notificationLevel.newValue;
        }
        if (changes.soundEffect) {
            selectedSound = changes.soundEffect.newValue;
        }
    });

    // Ladda sparade inställningar vid start
    chrome.storage.local.get(['notificationLevel', 'soundEffect'], (result) => {
        if (result.notificationLevel) {
            notificationLevel = parseInt(result.notificationLevel, 10);
        }
        if (result.soundEffect) {
            selectedSound = result.soundEffect;
        }
    });

    // Starta övervakningen med längre intervall
    setInterval(checkValue, UPDATE_INTERVAL); // Kolla var 120:e sekund
    checkValue(); // Kör en första koll direkt

    // Uppdatera sidan med samma intervall som checkValue
    setInterval(refreshPage, UPDATE_INTERVAL); // 120000 ms = 2 minuter

    // Testfunktion för utveckling
    window.testValue = function(value) {
        const element = document.querySelector('[data-e2e="development-card-amount"]');
        if (!element) {
            console.error('Kunde inte hitta elementet');
            return;
        }
        
        // Uppdatera elementets text
        const span = document.createElement('span');
        span.setAttribute('data-e2e', 'development-card-amount');
        span.textContent = `${value} kr`;
        element.replaceWith(span);
        
        // Trigga en check
        checkValue();
        
        console.log(`Värde satt till: ${value} kr`);
    }

    // Meddela att scriptet är laddat
    console.log('Avanza Notifier: Content script laddat och redo för test!');

    // Exempel på användning i konsolen:
    // testValue(950)  // Sätt värde under gränsen
    // testValue(1100) // Sätt värde över gränsen för att trigga ljud

    // Funktion för att uppdatera sidan
    function refreshPage() {
        console.log('Uppdaterar sidan för att hämta färska värden...');
        window.location.reload();
    }
}
