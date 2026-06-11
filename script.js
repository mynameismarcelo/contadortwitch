const zones = [
    { id: '1 - 1', req: 'Lv01', diff: 'NORMAL', color: 'green' },
    { id: '1 - 4', req: 'Lv02', diff: 'NORMAL', color: 'green' },
    { id: '1 - 8', req: 'Lv03', diff: 'NORMAL', color: 'green' },
    { id: '2 - 3', req: 'Lv15', diff: 'NORMAL', color: 'green' },
    { id: '2 - 8', req: 'Lv20', diff: 'NORMAL', color: 'green' },
    { id: '3 - 8', req: 'Lv30', diff: 'NORMAL', color: 'green' },
    { id: '1 - 9', req: 'Lv40', diff: 'PESADELO', color: 'purple' },
    { id: '3 - 5', req: 'Lv50', diff: 'PESADELO', color: 'purple' },
    { id: '2 - 5', req: 'Lv65', diff: 'INFERNO', color: 'orange' },
    { id: '1 - 3', req: 'Lv80', diff: 'TORMENTO', color: 'red' },
];

const TIMER_DURATION = 12 * 60; // 12 minutes in seconds
const timers = {}; // To store the end time of each zone
let intervals = {}; // To store the interval IDs

const container = document.getElementById('zones-container');

function init() {
    // Load saved timers from localStorage if they exist
    const savedTimers = localStorage.getItem('taskbarHeroTimers');
    if (savedTimers) {
        Object.assign(timers, JSON.parse(savedTimers));
    }

    renderZones();
    startGlobalTick();
}

function renderZones() {
    container.innerHTML = '';
    
    zones.forEach(zone => {
        const card = document.createElement('div');
        card.className = 'zone-card';
        card.id = `card-${zone.id}`;
        card.onclick = () => startTimer(zone.id);
        
        const diffClass = `diff-${zone.diff.toLowerCase()}`;
        
        card.innerHTML = `
            <div class="card-header">
                <span class="zone-name">Fase ${zone.id}</span>
                <i class="fa-solid fa-skull skull-icon skull-${zone.color}"></i>
            </div>
            <div class="card-details">
                <span>${zone.req}</span>
                <span class="difficulty-badge ${diffClass}">${zone.diff}</span>
            </div>
            <div class="timer-display" id="timer-${zone.id}" style="display: none;">12:00</div>
            <div class="progress-bar-container">
                <div class="progress-bar" id="progress-${zone.id}"></div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function startTimer(zoneId) {
    const endTime = Date.now() + TIMER_DURATION * 1000;
    timers[zoneId] = endTime;
    saveTimers();
    updateUI(zoneId);
}

function saveTimers() {
    localStorage.setItem('taskbarHeroTimers', JSON.stringify(timers));
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

function updateUI(zoneId) {
    const display = document.getElementById(`timer-${zoneId}`);
    const progress = document.getElementById(`progress-${zoneId}`);
    const card = document.getElementById(`card-${zoneId}`);
    
    if (!display || !progress || !card) return;
    
    const endTime = timers[zoneId];
    if (!endTime) {
        display.style.display = 'none';
        display.textContent = '12:00';
        display.className = 'timer-display';
        progress.style.width = '0%';
        progress.className = 'progress-bar';
        card.className = 'zone-card';
        return;
    }
    
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
    
    if (remaining > 0) {
        display.style.display = 'block';
        display.textContent = formatTime(remaining);
        display.className = 'timer-display active';
        
        const percent = ((TIMER_DURATION - remaining) / TIMER_DURATION) * 100;
        progress.style.width = `${percent}%`;
        progress.className = 'progress-bar';
        card.className = 'zone-card cooldown';
    } else {
        display.style.display = 'block';
        display.textContent = 'DROP!';
        display.className = 'timer-display ready';
        progress.style.width = '100%';
        progress.className = 'progress-bar ready';
        card.className = 'zone-card ready';
    }
}

function startGlobalTick() {
    setInterval(() => {
        zones.forEach(zone => {
            if (timers[zone.id]) {
                updateUI(zone.id);
            }
        });
    }, 1000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);
