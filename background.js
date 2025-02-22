// Lyssna på när någon klickar på ikonen
chrome.action.onClicked.addListener((tab) => {
    // Kolla om vi är på Avanza
    if (tab.url && tab.url.includes('avanza.se')) {
        // På Avanza - visa normala popup
        chrome.action.setPopup({ tabId: tab.id, popup: 'popup.html' });
    } else {
        // Inte på Avanza - visa redirect popup
        chrome.action.setPopup({ tabId: tab.id, popup: 'popup-redirect.html' });
    }
});

// Lyssna på tab updates för att uppdatera popup
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
        // Uppdatera popup baserat på ny URL
        if (changeInfo.url.includes('avanza.se')) {
            chrome.action.setPopup({ tabId: tabId, popup: 'popup.html' });
        } else {
            chrome.action.setPopup({ tabId: tabId, popup: 'popup-redirect.html' });
        }
    }
});

// Skapa en alarm när extension startar
chrome.runtime.onInstalled.addListener(() => {
    // Skapa en alarm som körs var 2:a minut
    chrome.alarms.create('checkAvanza', {
        periodInMinutes: 2
    });
});

// Lyssna på alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'checkAvanza') {
        // Hitta Avanza-fliken
        chrome.tabs.query({ url: 'https://www.avanza.se/*' }, (tabs) => {
            if (tabs.length > 0) {
                // Uppdatera den första Avanza-fliken vi hittar
                chrome.tabs.reload(tabs[0].id);
            }
        });
    }
});

// Lyssna på meddelanden från content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'refreshPage' && sender.tab) {
        // Uppdatera sidan genom att ladda om den aktuella tabben
        chrome.tabs.reload(sender.tab.id);
    }
}); 