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
    let lastCheckedValue = 0;
    let notificationLevel = 1000; // Default värde, uppdateras från storage
    let selectedSound = 'mario_bros_famicom_1985.mp3'; // Default värde, uppdateras från storage

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

    // Funktion för att spela upp ljud
    function playNotificationSound() {
        const audio = new Audio(chrome.runtime.getURL(selectedSound));
        audio.play();
    }

    // Huvudfunktion som kollar värdet
    function checkValue() {
        const element = document.querySelector('[data-e2e="development-card-amount"]');
        if (!element) return;

        const currentValue = parseAvanzaValue(element);
        if (isNaN(currentValue)) return;

        // Vi är bara intresserade av positiva värden
        if (currentValue <= 0) {
            lastCheckedValue = 0;
            return;
        }

        // Avrunda till närmaste notifieringsnivå
        const currentLevel = Math.floor(currentValue / notificationLevel) * notificationLevel;
        
        // Om vi nått en ny nivå, spela ljud
        if (currentLevel > lastCheckedValue) {
            console.log(`Ding! Ny nivå nådd: ${currentLevel} kr`);
            lastCheckedValue = currentLevel;
            playNotificationSound();
        }
    }

    // Lyssna efter ändringar i storage (när användaren ändrar inställningar)
    chrome.storage.onChanged.addListener((changes) => {
        if (changes.notificationLevel) {
            notificationLevel = changes.notificationLevel.newValue;
            lastCheckedValue = 0; // Återställ för att hantera nya nivåer korrekt
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

    // Starta övervakningen
    setInterval(checkValue, 1000); // Kolla varje sekund
    checkValue(); // Kör en första koll direkt

    // Uppdatera sidan varje minut för att få färska värden
    setInterval(refreshPage, 60000); // 60000 ms = 1 minut

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
