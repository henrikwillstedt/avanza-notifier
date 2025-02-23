document.getElementById('redirectButton').addEventListener('click', () => {
    // Öppna exakt rätt Avanza-sida i en ny flik
    chrome.tabs.create({ url: 'https://www.avanza.se/hem/hem.html' });
    // Stäng popup-fönstret
    window.close();
}); 