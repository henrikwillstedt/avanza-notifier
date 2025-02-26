// Hämta DOM-element
const notificationLevel = document.getElementById('notificationLevel');
const soundEffect = document.getElementById('soundEffect');
const saveButton = document.getElementById('saveButton');
const testSoundButton = document.getElementById('testSoundButton');
const continuousTestButton = document.getElementById('continuousTestButton');
const stopTestButton = document.getElementById('stopTestButton');
const status = document.getElementById('status');
const dailyHighValue = document.getElementById('dailyHighValue');
const currentValue = document.getElementById('currentValue');

// Håll reda på den kontinuerliga testningen
let continuousTestInterval = null;

// Funktion för att spela testljud
function playTestSound(soundFile) {
    const audio = new Audio();
    
    // Lyssna efter laddningshändelse
    audio.addEventListener('canplaythrough', () => {
        console.log('✅ Testljud laddad och redo att spelas!');
        
        // Försök spela ljudet
        audio.play()
            .then(() => {
                console.log('✅ Testljud spelades upp framgångsrikt!');
                status.textContent = 'Ljudet testas...';
                status.className = 'status success';
            })
            .catch(error => {
                console.error('❌ Kunde inte spela upp testljud:', error);
                status.textContent = 'Ljud blockerades av webbläsaren';
                status.className = 'status success';
            });
    });
    
    // Lyssna efter laddningsfel
    audio.addEventListener('error', () => {
        console.error('❌ Kunde inte ladda ljudfil!');
        status.textContent = 'Kunde inte hitta ljudfil';
        status.className = 'status success';
    });
    
    // Sätt källan till ljudfilen
    audio.src = chrome.runtime.getURL(soundFile);
    audio.load();
    
    // Dölj bekräftelse efter 3 sekunder
    setTimeout(() => {
        status.className = 'status';
    }, 3000);
}

// Funktion för att starta kontinuerlig testning
function startContinuousTest() {
    console.log('Startar kontinuerlig ljudtestning var 3:e sekund');
    
    // Uppdatera UI
    status.textContent = 'Kontinuerlig testning pågår...';
    status.className = 'status success';
    continuousTestButton.style.display = 'none';
    stopTestButton.style.display = 'block';
    
    // Spela direkt första gången
    playTestSound(soundEffect.value);
    
    // Skapa sedan ett intervall för att spela ljudet var 3:e sekund
    continuousTestInterval = setInterval(() => {
        console.log('Spelar ljud från intervalltest');
        playTestSound(soundEffect.value);
    }, 3000);
    
    // Lägg till en event listener för att upptäcka om popup stängs
    window.addEventListener('beforeunload', stopContinuousTest);
}

// Funktion för att stoppa kontinuerlig testning
function stopContinuousTest() {
    console.log('Stoppar kontinuerlig ljudtestning');
    
    // Rensa intervallet
    if (continuousTestInterval) {
        clearInterval(continuousTestInterval);
        continuousTestInterval = null;
    }
    
    // Uppdatera UI
    status.textContent = 'Testning stoppad';
    status.className = 'status success';
    continuousTestButton.style.display = 'block';
    stopTestButton.style.display = 'none';
    
    // Ta bort event listener
    window.removeEventListener('beforeunload', stopContinuousTest);
    
    // Nollställ statusmeddelandet efter en kort stund
    setTimeout(() => {
        status.className = 'status';
    }, 3000);
}

// Ladda sparade inställningar när popup öppnas
document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['notificationLevel', 'soundEffect', 'dailyHigh', 'currentValue'], (result) => {
        if (result.notificationLevel) {
            notificationLevel.value = result.notificationLevel;
        }
        if (result.soundEffect) {
            soundEffect.value = result.soundEffect;
        }
        if (result.dailyHigh) {
            dailyHighValue.textContent = result.dailyHigh;
        }
        if (result.currentValue !== undefined) {
            currentValue.textContent = result.currentValue;
        }
    });
});

// Testa ljud när testknappen klickas
testSoundButton.addEventListener('click', () => {
    playTestSound(soundEffect.value);
});

// Starta kontinuerlig testning när kontinuerlig testknapp klickas
continuousTestButton.addEventListener('click', startContinuousTest);

// Stoppa kontinuerlig testning när stoppknappen klickas
stopTestButton.addEventListener('click', stopContinuousTest);

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
        playTestSound(settings.soundEffect);
    });
});
