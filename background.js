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
        periodInMinutes: 2
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

// Lyssna på meddelanden från content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'refreshPage' && sender.tab) {
        chrome.tabs.reload(sender.tab.id);
    }
}); 