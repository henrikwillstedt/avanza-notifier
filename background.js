// Lyssna på tab updates för att uppdatera popup
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        // Visa normal popup ENDAST på exakt rätt URL
        if (changeInfo.url === 'https://www.avanza.se/hem/hem.html') {
            chrome.action.setPopup({ tabId: tabId, popup: 'popup.html' });
        } else {
            // På ALLA andra URLs, visa redirect-popup
            chrome.action.setPopup({ tabId: tabId, popup: 'popup-redirect.html' });
        }
    }
});

// Skapa en alarm när extension startar
chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('checkAvanza', {
        periodInMinutes: 0.1667 // ~10 sekunder (för debugging)
    });
});

// Lyssna på alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkAvanza') {
        // Hitta Avanza-fliken och uppdatera den
        chrome.tabs.query({ url: 'https://www.avanza.se/*' }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.reload(tabs[0].id);
            }
        });
    }
});

// NYTT: Ljudspelare som kan spela ljud från background script
// En fördel med att spela ljud från bakgrundsskriptet är att det inte påverkas
// av webbläsarens begränsningar för automatisk ljuduppspelning
let notificationAudio = null;

// Funktion för att förbereda ljuduppspelning
function prepareSound(soundFile) {
    // Skapa ett nytt Audio-objekt
    notificationAudio = new Audio(soundFile);
    // Förladda ljudet för att minska fördröjning
    notificationAudio.load();
    console.log('Ljud förberett:', soundFile);
}

// Funktion för att spela det förberedda ljudet
function playSound() {
    if (notificationAudio) {
        // Starta om ljudet om det redan spelas
        notificationAudio.currentTime = 0;
        
        // Försök spela ljudet
        const playPromise = notificationAudio.play();
        
        // Hantera fel
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('Ljuduppspelning startad');
            }).catch(error => {
                console.error('Ljuduppspelning misslyckades:', error);
                // Om ljuduppspelning misslyckas, visa åtminstone en notifiering
                showNotification('Avanza Notifier', 'Ny nivå uppnådd! (Ljud kunde inte spelas)');
            });
        }
    } else {
        console.error('Inget ljud förberett');
        // Visa en notifiering som fallback
        showNotification('Avanza Notifier', 'Ny nivå uppnådd! (Inget ljud förberett)');
    }
}

// Funktion för att visa en systemnotifiering
function showNotification(title, message) {
    chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: title,
        message: message,
        priority: 2,
        silent: true // Stäng av inbyggt notifieringsljud eftersom vi spelar vårt eget
    });
}

// Lyssna på meddelanden från content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'refreshPage' && sender.tab) {
        chrome.tabs.reload(sender.tab.id);
    }
    
    // NYTT: Hantera förfrågan om att spela ljud
    if (message.action === 'playSound') {
        console.log('Fick förfrågan att spela ljud:', message.soundFile);
        
        // Förbered ljudet först om det är ett nytt ljud
        if (!notificationAudio || message.soundFile) {
            prepareSound(message.soundFile);
        }
        
        // Spela ljudet
        playSound();
        
        // Visa också en systemnotifiering
        showNotification('Avanza Notifier', message.message || 'Ny nivå uppnådd!');
        
        // Svara att ljudet spelas
        sendResponse({ success: true });
        return true; // Indikerar att vi kommer att skicka ett asynkront svar
    }

    // NYTT: Hantera testljud för popup
    if (message.action === 'testSound') {
        console.log('Testar ljud:', message.soundFile);
        
        // Förbered ljudet
        prepareSound(message.soundFile);
        
        // Spela ljudet
        playSound();
        
        // Svara att ljudet spelas
        sendResponse({ success: true });
        return true; // Indikerar att vi kommer att skicka ett asynkront svar
    }
}); 