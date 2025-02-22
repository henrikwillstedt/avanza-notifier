document.getElementById('redirectButton').addEventListener('click', () => {
    // Öppna Avanza i en ny flik
    chrome.tabs.create({ url: 'https://www.avanza.se' });
    // Stäng popup-fönstret
    window.close();
}); 