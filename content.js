// Kolla om vi är på rätt sida för att köra övervakningen
if (window.location.href === 'https://www.avanza.se/hem/hem.html') {
    // Globala variabler för att hålla koll på state
    let notificationLevel = 1000; // Default värde, uppdateras från storage
    let selectedSound = 'mario_bros_famicom_1985.mp3'; // Default värde, uppdateras från storage
    const UPDATE_INTERVAL = 10000; // Uppdatera var 10:e sekund (för debugging)
    let compareWithLastChecked = true; // Ny variabel för notifieringsmetod (true = jämför med senast avlästa, false = jämför med senast notifierade)

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
        
        chrome.storage.local.get(['lastCheckedValue', 'dailyHigh', 'lastNotifiedValue'], (result) => {
            const lastCheckedValue = result.lastCheckedValue || 0;
            const lastNotifiedValue = result.lastNotifiedValue || 0;
            const dailyHigh = result.dailyHigh || 0;
            
            console.log('Föregående avläst värde:', lastCheckedValue);
            console.log('Senaste notifierade värde:', lastNotifiedValue);
            console.log('Nuvarande värde:', currentValue);
            
            // LÄGE 1: Jämför med senast avlästa värde (new)
            if (compareWithLastChecked) {
                console.log('Läge: Jämför med senast avlästa värde');
                console.log('Skillnad sedan senast avläst:', currentValue - lastCheckedValue);
                
                // Beräkna om vi ska notifiera (nu baserat på skillnad sedan SENASTE AVLÄSNING)
                if (currentValue >= lastCheckedValue + notificationLevel) {
                    console.log(`Ding! Värdet har ökat med minst ${notificationLevel} kr sedan senaste avläsningen!`);
                    playNotificationSound();
                    
                    // Uppdatera lastNotifiedValue för konsekvens mellan båda lägena
                    chrome.storage.local.set({ lastNotifiedValue: currentValue });
                }
            } 
            // LÄGE 2: Jämför med senast notifierade värde (original)
            else {
                console.log('Läge: Jämför med senast notifierade värde');
                console.log('Skillnad sedan senast notifierad:', currentValue - lastNotifiedValue);
                
                // Kör bara notifiering om värdet ökar dagshögsta OCH uppnår notifieringsnivån
                if (currentValue > dailyHigh && currentValue >= lastNotifiedValue + notificationLevel) {
                    console.log(`Ding! Värdet har ökat med minst ${notificationLevel} kr sedan senaste notifiering!`);
                    playNotificationSound();
                    
                    // Uppdatera senaste notifierade värde
                    chrome.storage.local.set({ lastNotifiedValue: currentValue });
                }
            }
            
            // Alltid uppdatera dagshögsta om det behövs
            if (currentValue > dailyHigh) {
                console.log('New daily high:', currentValue);
                chrome.storage.local.set({ dailyHigh: currentValue });
            }
            
            // Spara det nuvarande värdet som det senaste avlästa
            chrome.storage.local.set({
                lastCheckedValue: currentValue,
                lastCheckTime: timestamp,
                currentValue: currentValue
            });
        });
    }

    // Ny metod för att spela ljud genom bakgrundsskriptet
    function playNotificationSound() {
        console.log('📢 Skickar förfrågan om ljuduppspelning till bakgrundsskript:', selectedSound);
        
        try {
            // Visa full URL för felsökning
            const fullUrl = chrome.runtime.getURL(selectedSound);
            console.log('📢 Full ljudfilsökväg:', fullUrl);
            
            // Hämta aktuellt värde för meddelandet
            chrome.storage.local.get(['currentValue'], (result) => {
                const currentValue = result.currentValue || 0;
                
                // Skicka meddelande till bakgrundsskriptet för att spela ljud
                chrome.runtime.sendMessage({
                    action: 'playSound',
                    soundFile: fullUrl,
                    message: `Ny nivå uppnådd: ${currentValue} kr!`
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Fel vid kommunikation med bakgrundsskript:', chrome.runtime.lastError);
                        // Återfall till visuell notifiering
                        showVisualNotification();
                    } else if (response && response.success) {
                        console.log('✅ Bakgrundsskriptet spelar ljud!');
                    } else {
                        console.error('❌ Bakgrundsskriptet kunde inte spela ljud');
                        // Återfall till visuell notifiering
                        showVisualNotification();
                    }
                });
            });
            
        } catch (e) {
            console.error('❌ OVÄNTAT LJUDFEL:', e);
            showVisualNotification();
        }
    }

    // Förbättrad visuell notifiering med ljudknapp
    function showVisualNotification() {
        // Skapa notifieringselement
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background-color: #00C281;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s forwards;
        `;
        
        // Lägg till animationer
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes fadeOut {
                from { opacity: 1; }
                to { opacity: 0; }
            }
            .avanza-notifier-play-button {
                background-color: #ffffff;
                color: #00A06A;
                border: none;
                border-radius: 4px;
                padding: 5px 10px;
                margin-top: 8px;
                cursor: pointer;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 5px;
                font-size: 12px;
            }
            .avanza-notifier-play-button:hover {
                background-color: #f0f0f0;
            }
        `;
        document.head.appendChild(style);
        
        // Skapa en knapp som användaren kan klicka på för att spela ljudet manuellt
        const playButton = document.createElement('button');
        playButton.className = 'avanza-notifier-play-button';
        playButton.innerHTML = '<span style="font-size: 14px;">🔊</span> Spela ljud';
        playButton.onclick = function(e) {
            e.stopPropagation(); // Hindra att klicket påverkar andra element
            console.log('📢 Användaren klickade på spela ljud-knappen');
            window.testAvanzaNotifier.playSound();
        };
        
        // Sätt innehåll
        notification.innerHTML = `
            <div style="display: flex; align-items: center;">
                <span style="font-size: 20px; margin-right: 10px;">🔔</span>
                <div>
                    <div>Ny nivå uppnådd!</div>
                    <div style="font-size: 12px; opacity: 0.8; margin-top: 3px;">
                        Vi kunde inte spela ljudet automatiskt.
                    </div>
                </div>
            </div>
        `;
        
        // Lägg till knappen i notifieringen
        notification.appendChild(playButton);
        
        // Lägg till stängknapp
        const closeButton = document.createElement('div');
        closeButton.style.cssText = `
            position: absolute;
            top: 8px;
            right: 8px;
            cursor: pointer;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.7);
        `;
        closeButton.innerHTML = '✕';
        closeButton.onclick = function(e) {
            e.stopPropagation();
            document.body.removeChild(notification);
        };
        notification.appendChild(closeButton);
        
        // Lägg till på sidan
        document.body.appendChild(notification);
        
        // Ta bort efter 10 sekunder
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'fadeOut 0.3s forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 10000);
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
            chrome.storage.local.get(['lastCheckTime', 'lastCheckedValue'], (result) => {
                const now = Date.now();
                
                // Kontrollera om det är en ny dag
                if (isNewDay(result.lastCheckTime)) {
                    console.log('New day detected, resetting values');
                    chrome.storage.local.set({ 
                        dailyHigh: 0,
                        lastNotifiedValue: 0 
                    });
                }

                // Spara det exakta värdet
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
            
            // Spara det simulerade värdet - logiken för notifieringar hanteras i saveState
            saveState(value, now);
        },

        // Nollställ dagens värden
        reset: function() {
            console.log('Nollställer alla värden...');
            chrome.storage.local.set({
                lastCheckedValue: 0,
                currentValue: 0,
                dailyHigh: 0,
                lastNotifiedValue: 0,
                lastCheckTime: Date.now()
            }, () => {
                console.log('Alla värden nollställda!');
            });
        },

        // Visa nuvarande värden
        showValues: function() {
            chrome.storage.local.get(['currentValue', 'dailyHigh', 'lastCheckedValue', 'lastNotifiedValue'], (result) => {
                console.log('Aktuella värden:', {
                    currentValue: result.currentValue || 0,
                    dailyHigh: result.dailyHigh || 0,
                    lastCheckedValue: result.lastCheckedValue || 0,
                    lastNotifiedValue: result.lastNotifiedValue || 0
                });
            });
        },
        
        // Uppdaterad ljudtest med bakgrundsskriptet
        playSound: function() {
            console.log('📢 TESTLJUD: Kör direkt ljudtest via bakgrundsskriptet...');
            
            // Gör en tydlig feedback i konsolen för att lättare spåra vad som händer
            console.log('----------------------------------------');
            console.log('📢 TESTLJUD START: ' + new Date().toLocaleTimeString());
            console.log('----------------------------------------');
            
            try {
                const fullUrl = chrome.runtime.getURL(selectedSound);
                
                chrome.runtime.sendMessage({
                    action: 'testSound',
                    soundFile: fullUrl
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Fel vid kommunikation med bakgrundsskript:', chrome.runtime.lastError);
                        return 'Fel vid kommunikation med bakgrundsskript';
                    } else if (response && response.success) {
                        console.log('✅ Bakgrundsskriptet spelar testljud!');
                        return 'Bakgrundsskriptet spelar testljud!';
                    } else {
                        console.error('❌ Bakgrundsskriptet kunde inte spela testljud');
                        return 'Bakgrundsskriptet kunde inte spela testljud';
                    }
                });
                
                return 'Testljud skickat till bakgrundsskript';
            } catch (e) {
                console.error('❌ Fel vid testljud:', e);
                return 'Fel vid testljud: ' + e.message;
            }
        },
        
        // Forcera visning av visuell notifiering för test
        showVisualNotification: function() {
            console.log('📢 TESTNOTIFIERING: Visar visuell notifiering');
            showVisualNotification();
            return 'Visuell notifiering visad';
        },
        
        // Uppdaterar testSpecificSound för att använda bakgrundsskriptet
        testSpecificSound: function(soundFile) {
            if (!soundFile) {
                console.log('📢 TESTLJUD: Testar alla tillgängliga ljudfiler:');
                console.log('📢 Testa med: window.testAvanzaNotifier.testSpecificSound("mario_bros_famicom_1985.mp3")');
                console.log('📢 Testa med: window.testAvanzaNotifier.testSpecificSound("mario_bros_famicom_1983.mp3")');
                console.log('📢 Testa med: window.testAvanzaNotifier.testSpecificSound("luigis_mansion_2001.mp3")');
                return 'Ange en specifik ljudfil att testa';
            }
            
            console.log(`📢 TESTLJUD: Testar specifik ljudfil via bakgrundsskript: ${soundFile}`);
            
            try {
                const fullUrl = chrome.runtime.getURL(soundFile);
                
                chrome.runtime.sendMessage({
                    action: 'testSound',
                    soundFile: fullUrl
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error('❌ Fel vid kommunikation med bakgrundsskript:', chrome.runtime.lastError);
                    } else if (response && response.success) {
                        console.log('✅ Bakgrundsskriptet spelar testljud!');
                    } else {
                        console.error('❌ Bakgrundsskriptet kunde inte spela testljud');
                    }
                });
                
                return `Testar ljudfil via bakgrundsskript: ${soundFile}`;
            } catch (e) {
                console.error('❌ Fel vid testljud:', e);
                return 'Fel vid testljud: ' + e.message;
            }
        },
        
        // Växla mellan notifieringsmetoder
        toggleNotificationMode: function() {
            compareWithLastChecked = !compareWithLastChecked;
            console.log(`Notifieringsläge ändrat till: ${compareWithLastChecked ? 'Jämför med senaste avläsning' : 'Jämför med senaste notifiering'}`);
            return `Aktuellt läge: ${compareWithLastChecked ? 'Jämför med senaste avläsning (NEW)' : 'Jämför med senaste notifiering (ORIGINAL)'}`;
        },
        
        // Visa aktuellt notifieringsläge
        getNotificationMode: function() {
            return `Aktuellt läge: ${compareWithLastChecked ? 'Jämför med senaste avläsning (NEW)' : 'Jämför med senaste notifiering (ORIGINAL)'}`;
        }
    };

    // Uppdaterade konsolloggar för testfunktioner
    console.log('Avanza Notifier testfunktioner laddade! Använd följande kommandon i konsolen:');
    console.log('window.testAvanzaNotifier.setValue(1234) - Simulera ett nytt värde');
    console.log('window.testAvanzaNotifier.reset() - Nollställ alla värden');
    console.log('window.testAvanzaNotifier.showValues() - Visa nuvarande värden (inklusive senaste notis)');
    console.log('window.testAvanzaNotifier.playSound() - Testa ljuduppspelning direkt');
    console.log('window.testAvanzaNotifier.showVisualNotification() - Testa visuell notifiering');
    console.log('window.testAvanzaNotifier.testSpecificSound("ljudfilnamn") - Testa specifik ljudfil');
    console.log('window.testAvanzaNotifier.toggleNotificationMode() - Växla notifieringsmetod');
    console.log('window.testAvanzaNotifier.getNotificationMode() - Visa aktuell notifieringsmetod');

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
