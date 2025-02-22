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
