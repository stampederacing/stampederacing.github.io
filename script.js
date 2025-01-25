let startTime = null;
let running = false;
let lightsOn = false;
let sequenceActive = false; // Nueva variable para controlar si la secuencia está activa
times = [];
let bestTime = Infinity;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startLightsSequence() {
    const lights = document.querySelectorAll('.light');
    lightsOn = true;
    sequenceActive = true; // La secuencia está activa

    // Reset all lights before starting
    lights.forEach(light => {
        light.style.background = '#222';
        light.style.transition = 'background 0.5s ease'; // Smooth transition only for turning on
    });

    // Turn on the lights sequentially
    for (let i = 0; i < lights.length; i++) {
        lights[i].style.background = 'red';
        await sleep(1000);
        // If an early click occurred, stop the sequence
        if (!lightsOn) return;
    }

    // Random delay between 2 to 4 seconds
    const randomDelay = Math.random() * 2000 + 2000;
    await sleep(randomDelay);

    // Turn off all lights immediately (no ease)
    lights.forEach(light => {
        light.style.transition = 'none'; // Remove ease for instant light-off
        light.style.background = '#222';
    });

    running = true;
    lightsOn = false;
    sequenceActive = false; // La secuencia deja de estar activa
    startTime = performance.now(); // High-precision start time
}

function updateTimerDisplay(time) {
    document.getElementById('timer-display').textContent = time.toFixed(3);
}

function updateBestTime() {
    document.getElementById('best-time').textContent = bestTime.toFixed(3);
}

function updateTable() {
    const tableBody = document.getElementById('time-table');
    const averageTime = document.getElementById('average-time');
    tableBody.innerHTML = '';

    times.forEach((time, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td><td>${time === 'Inicio Falso' ? time : time.toFixed(3)}</td>`;
        tableBody.appendChild(row);
    });

    const validTimes = times.filter(time => typeof time === 'number');
    const average = validTimes.reduce((a, b) => a + b, 0) / validTimes.length || 0;
    averageTime.textContent = average.toFixed(3);
}

function handleReaction() {
    const lights = document.querySelectorAll('.light');
    const activeLights = Array.from(lights).filter(light => light.style.background === 'red');

    if (activeLights.length > 0 && sequenceActive) {
        // False start: Register "Inicio Falso" and stop the light sequence
        times.push('Inicio Falso');
        updateTable();

        lightsOn = false; // Stop the sequence
        running = false;
        sequenceActive = false; // Detenemos la secuencia
    } else if (running) {
        // Calculate reaction time accurately
        const endTime = performance.now();
        const elapsedTime = (endTime - startTime) / 1000;
        times.push(elapsedTime);

        if (elapsedTime < bestTime) {
            bestTime = elapsedTime;
        }

        updateBestTime();
        updateTable();
        updateTimerDisplay(elapsedTime);

        running = false;
    } else if (!lightsOn && !sequenceActive) {
        // Start the light sequence if no sequence is active
        startLightsSequence().catch(console.error);
    }
}

// Attach event listeners
document.body.addEventListener('click', handleReaction);
document.body.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        handleReaction();
    }
});

// Store and retrieve the best time from localStorage
function saveBestTime() {
    localStorage.setItem('bestTime', bestTime);
}

function loadBestTime() {
    const savedBestTime = localStorage.getItem('bestTime');
    if (savedBestTime) {
        bestTime = parseFloat(savedBestTime);
        updateBestTime();
    }
}

window.addEventListener('beforeunload', saveBestTime);
window.addEventListener('load', loadBestTime);
