// Hämta DOM-element
const notificationLevel = document.getElementById('notificationLevel');
const soundEffect = document.getElementById('soundEffect');
const saveButton = document.getElementById('saveButton');
const status = document.getElementById('status');

// Ladda sparade inställningar när popup öppnas
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['notificationLevel', 'soundEffect'], (result) => {
        if (result.notificationLevel) {
            notificationLevel.value = result.notificationLevel;
        }
        if (result.soundEffect) {
            soundEffect.value = result.soundEffect;
        }
    });
});

// Spara inställningar när användaren klickar på spara
saveButton.addEventListener('click', () => {
    const settings = {
        notificationLevel: notificationLevel.value,
        soundEffect: soundEffect.value
    };

    chrome.storage.local.set(settings, () => {
        // Visa bekräftelse
        status.textContent = 'Inställningar sparade!';
        status.className = 'status success';

        // Spela upp vald ljudeffekt som demo
        const audio = new Audio(chrome.runtime.getURL(settings.soundEffect));
        audio.play();

        // Dölj bekräftelse efter 2 sekunder
        setTimeout(() => {
            status.className = 'status';
        }, 2000);
    });
});
