class Accordion {
    static initialize() {
        document.addEventListener('click', (event) => {
            const button = event.target.closest('.accordion-button');

            if (!button) return;

            const targetSelector = button.getAttribute('aria-controls');
            const panel = document.getElementById(targetSelector);

            if (!panel) return;

            if (panel.offsetHeight > 0) {
                panel.style.maxHeight = panel.scrollHeight + 'px';
                requestAnimationFrame(() => {
                    panel.style.maxHeight = '0px';
                });
            } else {
                const parent = panel.parentElement;
                if (parent) {
                    parent.classList.remove('max-h-0');
                    parent.style.maxHeight = null;
                }
                panel.style.maxHeight = panel.scrollHeight + 'px';
            }
        });
    }
}

const STORAGE_KEY = 'timer_data';
const MAX_BALANCE = 359999000;
let state;
let timerId;

const timerDisplay = document.getElementById('timer-display');
const btnEarn = document.getElementById('btn-earn');
const btnUse = document.getElementById('btn-use');
const btnStop = document.getElementById('btn-stop');
const btnUpdate = document.getElementById('btn-update');
const textEarn = document.getElementById('text-earn');
const textUse = document.getElementById('text-use');
const textStop = document.getElementById('text-stop');
const inputH = document.getElementById('input-h');
const inputM = document.getElementById('input-m');
const inputS = document.getElementById('input-s');

function init() {
    state = loadData();

    if (state.mode === 'earning') {
        earning();
    } else if (state.mode === 'using') {
        using();
    } else if (state.mode === 'stopped') {
        render(state.balance);
    }
}

function loadData() {
    const data = localStorage.getItem(STORAGE_KEY);

    if (data) {
        return JSON.parse(data);
    } else {
        return {
            balance: 0,
            lastTimestamp: Date.now(),
            mode: 'stopped'
        }
    }
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function updateBalance() {
    clearInterval(timerId);

    const currentTime = Date.now();
    const elapsed = currentTime - state.lastTimestamp;

    if (state.mode === 'earning') {
        state.balance = Math.min(state.balance + elapsed, MAX_BALANCE);
    } else if (state.mode === 'using') {
        state.balance = Math.max(state.balance - elapsed, 0);
    }
    state.lastTimestamp = currentTime;
}

function earning() {
    updateBalance();

    if (state.balance >= MAX_BALANCE) {
        state.balance = MAX_BALANCE;
        stop();
        return;
    }

    textEarn.textContent = 'Now Earning...';
    textUse.textContent = 'Use';
    state.mode = 'earning';
    saveData();

    timerId = setInterval(() => {
        const elapsed = Date.now() - state.lastTimestamp;
        const currentBalance = state.balance + elapsed;

        if (currentBalance >= MAX_BALANCE) {
            stop();
        } else {
            render(currentBalance);
        }
    }, 100);
}

function using() {
    updateBalance();

    if (state.balance <= 0) {
        state.balance = 0;
        stop();
        return;
    }

    textEarn.textContent = 'Earn';
    textUse.textContent = 'Now Using...';
    state.mode = 'using';
    saveData();

    timerId = setInterval(() => {
        const elapsed = Date.now() - state.lastTimestamp;
        const currentBalance = state.balance - elapsed;

        if (currentBalance <= 0) {
            stop();
        } else {
            render(currentBalance);
        }
    }, 100);
}

function stop() {
    textEarn.textContent = 'Earn';
    textUse.textContent = 'Use';
    updateBalance();
    state.mode = 'stopped';
    saveData();
    render(state.balance);
}

function updateTime() {
    if (window.confirm('Do you really want to change the time?')) {
        const hour = Number(inputH.value) || 0;
        const minute = Number(inputM.value) || 0;
        const second = Number(inputS.value) || 0;
        const newBalance = (hour * 3600 + minute * 60 + second) * 1000;

        state.balance = newBalance;
        stop();
        inputH.value = '';
        inputM.value = '';
        inputS.value = '';
    }
}

function render(balance) {
    balance = Math.max(0, balance);
    const totalSecond = Math.floor(balance / 1000);
    const totalMinute = Math.floor(totalSecond / 60);
    const hour = String(Math.floor(totalSecond / 3600)).padStart(2, '0');
    const minute = String(Math.floor(totalMinute % 60)).padStart(2, '0');
    const second = String(Math.floor(totalSecond % 60)).padStart(2, '0');

    timerDisplay.textContent = hour + ':' + minute + ':' + second;
}

btnEarn.addEventListener('click', earning);
btnUse.addEventListener('click', using);
btnStop.addEventListener('click', stop);
btnUpdate.addEventListener('click', updateTime);

Accordion.initialize();
init();
