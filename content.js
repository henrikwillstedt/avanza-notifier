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
    const UPDATE_INTERVAL = 120000; // Uppdatera var 120:e sekund

    // Funktion som väntar på att ett element ska finnas
    function waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            if (document.querySelector(selector)) {
                return resolve(document.querySelector(selector));
            }

            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve(document.querySelector(selector));
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });

            setTimeout(() => {
                observer.disconnect();
                reject('Timeout waiting for element');
            }, timeout);
        });
    }

    // Funktion för att parsa värdet från Avanza
    function parseAvanzaValue(element) {
        if (!element) {
            console.log('Element not found');
            return null;
        }
        
        // Använd textContent för att få den faktiska texten utan HTML-entiteter
        let rawText = element.textContent.trim();
        console.log('Raw text from element:', rawText);
        
        // Ta bort "kr", "kronor", mellanslag och hantera minustecken
        const valueText = rawText
            .replace(/kr|kronor/g, '')
            .replace(/\s+/g, '')  // Ta bort alla typer av whitespace
            .replace(/−/g, '-')   // Unicode minus
            .replace(/\u2212/g, '-'); // Annat unicode minus
        
        console.log('Processed text:', valueText);
        const parsedValue = parseInt(valueText, 10);
        console.log('Parsed value:', parsedValue);
        
        return parsedValue;
    }

    // Funktion för att kontrollera om det är en ny dag
    function isNewDay(lastCheckTime) {
        if (!lastCheckTime) return true;
        const lastCheck = new Date(lastCheckTime);
        const now = new Date();
        const isNew = lastCheck.getDate() !== now.getDate() ||
               lastCheck.getMonth() !== now.getMonth() ||
               lastCheck.getFullYear() !== now.getFullYear();
        
        // Nollställ dagshögsta om det är en ny dag
        if (isNew) {
            chrome.storage.local.set({ dailyHigh: 0 });
        }
        
        return isNew;
    }

    // Funktion för att spara state
    function saveState(currentValue, timestamp) {
        console.log('Saving state with value:', currentValue);
        
        chrome.storage.local.set({
            lastCheckedValue: currentValue,
            lastCheckTime: timestamp,
            currentValue: currentValue
        }, () => {
            // Uppdatera dagshögsta separat
            chrome.storage.local.get(['dailyHigh'], (result) => {
                const dailyHigh = result.dailyHigh || 0;
                if (currentValue > dailyHigh) {
                    console.log('New daily high:', currentValue);
                    chrome.storage.local.set({ dailyHigh: currentValue });
                }
            });
        });
    }

    // Funktion för att spela upp ljud
    function playNotificationSound() {
        const audio = new Audio(chrome.runtime.getURL(selectedSound));
        audio.play();
    }

    // Huvudfunktion som kollar värdet
    async function checkValue() {
        console.log('Checking value...');
        
        try {
            const element = await waitForElement('[data-e2e="development-card-amount"]');
            console.log('Found element:', element);

            const currentValue = parseAvanzaValue(element);
            if (isNaN(currentValue)) {
                console.log('Failed to parse value');
                return;
            }

            console.log('Current value:', currentValue);

            // Hämta tidigare state
            chrome.storage.local.get(['lastCheckTime', 'lastCheckedValue', 'lastNotifiedLevel'], (result) => {
                const now = Date.now();
                const lastValue = result.lastCheckedValue || 0;
                const lastNotifiedLevel = result.lastNotifiedLevel || 0;
                
                // Kontrollera om det är en ny dag
                if (isNewDay(result.lastCheckTime)) {
                    console.log('New day detected, resetting values');
                    chrome.storage.local.set({ 
                        dailyHigh: 0,
                        lastNotifiedLevel: 0 
                    });
                }

                // Beräkna hur många hela notifieringsnivåer vi har uppnått
                const currentLevel = Math.floor(currentValue / notificationLevel);
                const previousLevel = Math.floor(lastValue / notificationLevel);

                // Om vi har nått en ny nivå (eller flera), spela ljud
                if (currentLevel > previousLevel && currentLevel > 0) {
                    console.log(`Ding! Nått ny nivå: ${currentLevel * notificationLevel} kr`);
                    playNotificationSound();
                }

                // Spara det exakta värdet och den senaste nivån vi har notifierat om
                saveState(currentValue, now);
            });
        } catch (error) {
            console.log('Error finding element:', error);
        }
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

    // Funktion för att uppdatera sidan
    function refreshPage() {
        console.log('Uppdaterar sidan för att hämta färska värden...');
        chrome.runtime.sendMessage({ action: 'refreshPage' });
    }

    // Testfunktion för att simulera värden
    window.testAvanzaNotifier = {
        // Simulera ett nytt värde
        setValue: function(value) {
            console.log('Simulerar värde:', value);
            const now = Date.now();
            
            // Hämta tidigare värde för nivåjämförelse
            chrome.storage.local.get(['lastCheckedValue'], (result) => {
                const lastValue = result.lastCheckedValue || 0;
                
                // Beräkna hur många hela notifieringsnivåer vi har uppnått
                const currentLevel = Math.floor(value / notificationLevel);
                const previousLevel = Math.floor(lastValue / notificationLevel);

                // Om vi har nått en ny nivå (eller flera), spela ljud
                if (currentLevel > previousLevel && currentLevel > 0) {
                    console.log(`Ding! Nått ny nivå: ${currentLevel * notificationLevel} kr`);
                    playNotificationSound();
                }

                // Spara det simulerade värdet
                saveState(value, now);
            });
        },

        // Nollställ dagens värden
        reset: function() {
            console.log('Nollställer alla värden...');
            chrome.storage.local.set({
                lastCheckedValue: 0,
                currentValue: 0,
                dailyHigh: 0,
                lastCheckTime: Date.now()
            }, () => {
                console.log('Alla värden nollställda!');
            });
        },

        // Visa nuvarande värden
        showValues: function() {
            chrome.storage.local.get(['currentValue', 'dailyHigh', 'lastCheckedValue'], (result) => {
                console.log('Aktuella värden:', {
                    currentValue: result.currentValue || 0,
                    dailyHigh: result.dailyHigh || 0,
                    lastCheckedValue: result.lastCheckedValue || 0
                });
            });
        }
    };

    console.log('Avanza Notifier testfunktioner laddade! Använd följande kommandon i konsolen:');
    console.log('window.testAvanzaNotifier.setValue(1234) - Simulera ett nytt värde');
    console.log('window.testAvanzaNotifier.reset() - Nollställ alla värden');
    console.log('window.testAvanzaNotifier.showValues() - Visa nuvarande värden');

    // Starta övervakningen
    console.log('Starting Avanza Notifier...');
    let checkInterval = setInterval(checkValue, UPDATE_INTERVAL);
    checkValue(); // Kör en första koll direkt

    // Hantera när fliken blir synlig/osynlig
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            console.log('Fliken aktiv igen, uppdaterar värden...');
            checkValue(); // Kolla värdet direkt när fliken blir aktiv
            
            // Starta om intervallet om det behövs
            if (!checkInterval) {
                checkInterval = setInterval(checkValue, UPDATE_INTERVAL);
            }
        }
    });

    // Uppdatera sidan med samma intervall som checkValue
    let refreshInterval = setInterval(refreshPage, UPDATE_INTERVAL);

    // Hantera uppdatering av sidan när fliken blir synlig/osynlig
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            // Starta om refresh-intervallet om det behövs
            if (!refreshInterval) {
                refreshInterval = setInterval(refreshPage, UPDATE_INTERVAL);
            }
        }
    });
}
