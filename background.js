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