'use strict';

// ========================
// ELEMENTS DOM
// ========================
// Nav tabs
const tabBtns = {
  timer: document.querySelector('.tabs__btn--timer'),
  stopwatch: document.querySelector('.tabs__btn--stopwatch'),
};

// Stopwatch controls
const stopwatchBtns = {
  resume: document.querySelector('.stopwatch__btn--resume'),
  pause: document.querySelector('.stopwatch__btn--pause'),
  round: document.querySelector('.stopwatch__btn--round'),
  reset: document.querySelector('.stopwatch__btn--reset'),
};

// Display elements
const displays = {
  currentTime: document.querySelector('.timer__current-time'),
  stopwatch: document.querySelector('.stopwatch__current-time'),
};

// Containers
const containers = {
  timer: document.querySelector('#timer'),
  stopwatch: document.querySelector('#stopwatch'),
  timerList: document.querySelector('#list-timers'),
  stopwatchList: document.querySelector('#list-stopwatch'),
};

// Modal elements
const modal = {
  container: document.querySelector('.modal'),
  overlay: document.querySelector('.overlay'),
  addBtn: document.querySelector('.modal__btn--add'),
  cancelBtn: document.querySelector('.modal__btn--cancel'),
  inputs: {
    name: document.querySelector('#input-timer'),
    hours: document.querySelector('#input-duration-h'),
    minutes: document.querySelector('#input-duration-min'),
  },
};

const btnAddTimer = document.querySelector('.btn--add-timer');

// ========================
// CONSTANT VALUES
// ========================
const BREAK_DURATION = '00:01';

// ========================
// APP STATE
// ========================
const timers = [
  {
    id: 1,
    name: 'Workout',
    duration: '00:01',
    progress: 0,
    isRunning: false,
    isPaused: false,
    isStopped: false,
  },
  {
    id: 2,
    name: 'Meditation',
    duration: '00:01',
    progress: 0,
    isRunning: false,
    isPaused: false,
    isStopped: false,
  },
  {
    id: 3,
    name: 'Pomodoro',
    duration: '00:01',
    progress: 0,
    isRunning: false,
    isPaused: false,
    isStopped: false,
  },
];

let laps = [];
let timerInterval;
let startTime;
let currentElapsed = 0;
let elapsedTime = 0;

// ========================
// UTILITY FUNCTIONS
// ========================

/**
 * Converts a duration string (MM:SS) to seconds
 * @param {string} duration - Duration in MM:SS format
 * @returns {number} - Duration in seconds
 */
const convertToSeconds = function (duration) {
  const [minutes, seconds] = duration.split(':').map(Number);
  return minutes * 60 + seconds;
};

/**
 * Converts seconds to MM:SS format
 * @param {number} seconds - Seconds to convert
 * @returns {string} - Formatted time MM:SS
 */
const formatTime = function (seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Formats seconds into HH:MM:SS format
 * @param {number} seconds - Seconds to format
 * @returns {string} - Formatted time HH:MM:SS
 */
const formatTimeHMS = function (seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}:${String(secs).padStart(2, '0')}`;
};

/**
 * Toggle visibility of elements
 * @param {string} hideSelector - Selector for element to hide
 * @param {string} showSelector - Selector for element to show
 */
const toggleVisibility = function (hideSelector, showSelector) {
  document.querySelector(hideSelector).classList.add('hidden');
  document.querySelector(showSelector).classList.remove('hidden');
};

/**
 * Play a sound effect
 * @param {string} soundPath - Path to the sound file
 * @param {boolean} loop - Whether to loop the sound
 * @param {number} volume - Volume (0.0 to 1.0)
 * @returns {Audio} - The audio object
 */
const playSound = function (soundPath, loop = false, volume = 0.5) {
  const audio = new Audio(soundPath);
  audio.play();
  audio.loop = loop;
  audio.volume = volume;
  return audio;
};

// ========================
// MODAL FUNCTIONS
// ========================

/**
 * Open the modal
 */
const openModal = function () {
  modal.container.classList.remove('hidden');
  modal.overlay.classList.remove('hidden');
};

/**
 * Close the modal
 */
const closeModal = function () {
  modal.container.classList.add('hidden');
  modal.overlay.classList.add('hidden');
};

// ========================
// TIMER FUNCTIONS
// ========================

/**
 * Display the current time
 */
const displayCurrentTime = function () {
  const date = new Date();
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
  displays.currentTime.textContent = formattedTime;
};

/**
 * Display all timers in the UI
 * @param {boolean} reset - Whether to reset a specific timer
 * @param {Object} timerToReset - The timer to reset
 */
const displayTimers = function (reset = false, timerToReset = null) {
  // Handle reset case for a specific timer
  if (reset && timerToReset) {
    const timerElement = document.querySelector(`#timer-${timerToReset.id}`);
    if (timerElement) {
      timerElement.innerHTML = generateTimerHTML(timerToReset);
      initializeTimerControls(timerToReset);
    }
    return;
  }

  // Otherwise refresh all timers
  containers.timerList.innerHTML = '';
  timers.forEach(timer => {
    containers.timerList.insertAdjacentHTML(
      'afterbegin',
      generateTimerHTML(timer)
    );
    initializeTimerControls(timer);
  });

  // Update add button visibility
  btnAddTimer.classList.toggle('hidden', timers.length >= 4);
};

/**
 * Generate HTML for a timer item
 * @param {Object} timer - The timer object
 * @returns {string} - HTML for the timer
 */
const generateTimerHTML = function (timer) {
  return `
    <li class="timer__item" id="timer-${timer.id}">
      <div class="timer__item-content">
        <div class="progressing-left">
          <div class="flexbox-2">
            <h2 class="timer__name">${timer.name}</h2>
            <h2 class="timer__duration" id="timer-duration-${timer.id}">${timer.duration}</h2>
          </div>
          <div class="progress-container">
            <div class="progress-bar" id="progress-bar-${timer.id}"></div>
          </div>
        </div>
        <div class="timer__controls">
          <button class="btn btn--start" id="btn-start-${timer.id}">
            <img src="img/icon-play.svg" alt="Play button" />
          </button>
          <button class="btn btn--pause hidden" id="btn-pause-${timer.id}">
            <img src="img/icon-pause.svg" alt="Pause button" />
          </button>
          <button class="btn btn--stop" id="btn-stop-${timer.id}">
            <img src="img/icon-stop.svg" alt="Stop button" />
          </button>
          <button class="btn btn--close" id="btn-close-${timer.id}">
            <img src="img/icon-close.svg" alt="Close button" />
          </button>
        </div>
      </div>
    </li>
  `;
};

/**
 * Initialize event listeners for a timer's controls
 * @param {Object} timer - The timer object
 */
const initializeTimerControls = function (timer) {
  // Set initial progress bar to 100%
  const progressBar = document.querySelector(`#progress-bar-${timer.id}`);
  progressBar.style.width = '100%';

  // Add event listeners for all controls
  document
    .querySelector(`#btn-start-${timer.id}`)
    .addEventListener('click', () => playTimer(timer));

  document
    .querySelector(`#btn-pause-${timer.id}`)
    .addEventListener('click', () => pauseTimer(timer));

  document
    .querySelector(`#btn-stop-${timer.id}`)
    .addEventListener('click', () => stopTimer(timer));

  document
    .querySelector(`#btn-close-${timer.id}`)
    .addEventListener('click', () => deleteTimer(timer));
};

/**
 * Start or resume a timer
 * @param {Object} timer - The timer object
 */
const playTimer = function (timer) {
  // Initialize state
  if (!timer.isPaused) timer.currentDuration = timer.duration;
  timer.isRunning = true;
  timer.isPaused = false;
  timer.isStopped = false;

  // Get UI elements
  const progressBar = document.querySelector(`#progress-bar-${timer.id}`);
  const labelDuration = document.querySelector(`#timer-duration-${timer.id}`);

  // Calculate time values
  const initialDurationInSeconds = convertToSeconds(timer.currentDuration);
  let durationMin = initialDurationInSeconds;
  let lastTickTime = Date.now();

  // Update timer display function
  const updateTimerDisplay = () => {
    const min = String(Math.trunc(durationMin / 60)).padStart(2, '0');
    const sec = String(Math.trunc(durationMin % 60)).padStart(2, '0');
    labelDuration.textContent = `${min}:${sec}`;
  };

  // Smooth animation function for progress bar
  const animate = () => {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - lastTickTime) / 1000;

    // Calculate progress percentage
    const percentage =
      ((durationMin - elapsedTime) / initialDurationInSeconds) * 100;

    if (percentage >= 0) {
      progressBar.style.width = `${percentage}%`;
    }

    // Continue animation until next tick if timer is still running
    if (durationMin > 0) {
      timer.animationFrameId = requestAnimationFrame(animate);
    }
  };

  // Main tick function
  const tick = function () {
    // Check if timer has finished
    if (durationMin < 0) {
      clearInterval(timer.timerInterval);
      cancelAnimationFrame(timer.animationFrameId);
      progressBar.style.width = '0%';
      toggleVisibility(`#btn-pause-${timer.id}`, `#btn-start-${timer.id}`);
      playTimeUp(timer);
      return;
    }

    // Update display and animation
    updateTimerDisplay();
    cancelAnimationFrame(timer.animationFrameId);
    lastTickTime = Date.now();
    timer.animationFrameId = requestAnimationFrame(animate);

    // Decrease duration for next tick
    durationMin--;
  };

  // Start the timer
  tick();
  timer.timerInterval = setInterval(tick, 1000);

  // Update UI
  toggleVisibility(`#btn-start-${timer.id}`, `#btn-pause-${timer.id}`);
};

/**
 * Pause a timer
 * @param {Object} timer - The timer object
 */
const pauseTimer = function (timer) {
  // Update state
  timer.isRunning = false;
  timer.isPaused = true;

  // Stop the interval and animation
  clearInterval(timer.timerInterval);
  cancelAnimationFrame(timer.animationFrameId);

  // Update UI
  toggleVisibility(`#btn-pause-${timer.id}`, `#btn-start-${timer.id}`);

  // Save current duration
  const labelDuration = document.querySelector(`#timer-duration-${timer.id}`);
  timer.currentDuration = labelDuration.textContent;
};

/**
 * Stop a timer and reset it
 * @param {Object} timer - The timer object
 */
const stopTimer = function (timer) {
  // Update state
  timer.isRunning = false;
  timer.isPaused = false;
  timer.isStopped = true;

  // Stop the interval and animation
  clearInterval(timer.timerInterval);
  cancelAnimationFrame(timer.animationFrameId);

  // Reset timer display
  const labelDuration = document.querySelector(`#timer-duration-${timer.id}`);
  labelDuration.textContent = timer.duration;
  timer.currentDuration = timer.duration;

  // Reset progress bar
  const progressBar = document.querySelector(`#progress-bar-${timer.id}`);
  progressBar.style.width = '100%';

  // Update UI
  toggleVisibility(`#btn-pause-${timer.id}`, `#btn-start-${timer.id}`);
};

/**
 * Delete a timer
 * @param {Object} timer - The timer object
 */
const deleteTimer = function (timer) {
  const indexToRemove = timers.findIndex(t => t.id === timer.id);

  // Remove from array if found
  if (indexToRemove !== -1) {
    // Clean up timer if it was running
    if (timer.isRunning) {
      clearInterval(timer.timerInterval);
      cancelAnimationFrame(timer.animationFrameId);
    }

    // Stop any active alarms
    if (timer.audioEnd) {
      timer.audioEnd.pause();
      timer.audioEnd = null;
    }

    // Clean up any active break timer
    if (timer.timerIntervalBreak) {
      clearInterval(timer.timerIntervalBreak);
    }

    // Remove from DOM directly without affecting other timers
    const timerElement = document.querySelector(`#timer-${timer.id}`);
    if (timerElement) {
      timerElement.remove();
    }

    // Remove from array
    timers.splice(indexToRemove, 1);

    // Only update the Add Button visibility without redisplaying all timers
    btnAddTimer.classList.toggle('hidden', timers.length >= 4);
  }
};

/**
 * Show the time's up UI for a timer
 * @param {Object} timer - The timer object
 */
const playTimeUp = function (timer) {
  // Update UI to show time's up state
  document.querySelector(`#timer-${timer.id}`).innerHTML = `
    <li class="timer__item" id="timer-timeup-${timer.id}">
      <div class="timer__item-content timer__item-content--timeup">
        <h2 class="timer__name">Time's up !</h2>
        <button class="btn btn--red" id="btn-timeup-${timer.id}">Start Break</button>
      </div>
    </li>`;

  // Play sound alert and store it in the timer object
  timer.audioEnd = playSound('audio/chime-fast-twinkle.mp3', true, 0.5);

  // Add event listener for break button
  document
    .querySelector(`#btn-timeup-${timer.id}`)
    .addEventListener('click', function () {
      timer.audioEnd.pause();
      playBreak(timer);
    });
};

/**
 * Start a break timer
 * @param {Object} timer - The timer object
 */
const playBreak = function (timer) {
  // Show break UI
  document.querySelector(`#timer-${timer.id}`).innerHTML = `
    <li class="timer__item" id="timer-break-${timer.id}">
      <div class="timer__item-content timer__item-content--break">
        <div class="timer__break-left">
          <div class="timer__break-info">
            <h2 class="timer__name">Break</h2>
            <h2 class="timer__duration" id="timer-duration-break-${timer.id}">${BREAK_DURATION}</h2>
          </div>
        </div>
        <div class="timer__break-progress">
          <div class="timer__break-bar"></div>
        </div>
      </div>
    </li>`;

  // Get UI element
  const labelDurationBreak = document.querySelector(
    `#timer-duration-break-${timer.id}`
  );

  // Set up break timer
  let durationMin = convertToSeconds(BREAK_DURATION);

  // Update timer display function
  const updateTimerDisplay = () => {
    labelDurationBreak.textContent = formatTime(durationMin);
  };

  // Main tick function
  const tick = function () {
    // Check if break has finished
    if (durationMin < 0) {
      clearInterval(timer.timerIntervalBreak);
      playBreakEnd(timer);
      return;
    }

    // Update display
    updateTimerDisplay();

    // Decrease duration
    durationMin--;
  };

  // Start the break timer
  tick();
  timer.timerIntervalBreak = setInterval(tick, 1000);
};

/**
 * Show the break end UI
 * @param {Object} timer - The timer object
 */
const playBreakEnd = function (timer) {
  document.querySelector(`#timer-${timer.id}`).innerHTML = `
    <li class="timer__item" id="timer-breakend-${timer.id}">
      <div class="timer__item-content timer__item-content--breakend">
        <h2 class="timer__name">Break end</h2>
        <div class="timer__controls">
          <button class="btn btn--reset" id="btn-reset-breakend-${timer.id}">
            <img src="img/icon-close.svg" alt="Reset-button" />
          </button>
        </div>
      </div>
    </li>`;

  // Add event listener for reset button
  document
    .querySelector(`#btn-reset-breakend-${timer.id}`)
    .addEventListener('click', function () {
      // Réinitialiser seulement ce timer spécifique sans appeler displayTimers
      const timerElement = document.querySelector(`#timer-${timer.id}`);
      if (timerElement) {
        timerElement.innerHTML = generateTimerHTML(timer);
        initializeTimerControls(timer);
      }
    });
};

/**
 * Add a new timer
 * @param {Event} e - The event object
 */
const addTimer = function (e) {
  e.preventDefault();

  // Check if all inputs have values
  if (
    modal.inputs.name.value !== '' &&
    modal.inputs.hours.value !== '' &&
    modal.inputs.minutes.value !== ''
  ) {
    // Create new timer object
    const newTimer = {
      id: timers.length + 1,
      name: modal.inputs.name.value,
      duration: `${modal.inputs.hours.value.padStart(
        2,
        '0'
      )}:${modal.inputs.minutes.value.padStart(2, '0')}`,
      progress: 0,
      isRunning: false,
      isPaused: false,
      isStopped: false,
    };

    // Add to timers array
    timers.push(newTimer);

    // Add just the new timer to DOM without refreshing all timers
    containers.timerList.insertAdjacentHTML(
      'afterbegin',
      generateTimerHTML(newTimer)
    );
    initializeTimerControls(newTimer);

    // Update add button visibility
    btnAddTimer.classList.toggle('hidden', timers.length >= 4);

    // Close modal
    closeModal();
  }
};

// ========================
// STOPWATCH FUNCTIONS
// ========================

/**
 * Start the stopwatch
 */
const startStopwatch = function () {
  startTime = new Date();
  timerInterval = setInterval(updateStopwatch, 1000);

  // Update UI
  toggleVisibility('.stopwatch__btn--resume', '.stopwatch__btn--pause');
  toggleVisibility('.stopwatch__btn--reset', '.stopwatch__btn--round');
};

/**
 * Stop the stopwatch
 */
const stopStopwatch = function () {
  clearInterval(timerInterval);

  // Update UI
  toggleVisibility('.stopwatch__btn--pause', '.stopwatch__btn--resume');
  toggleVisibility('.stopwatch__btn--round', '.stopwatch__btn--reset');

  // Store current elapsed time
  currentElapsed = elapsedTime;
};

/**
 * Add a lap to the stopwatch
 */
const addLap = function () {
  const newLap = {
    id: laps.length + 1,
    name: `Lap ${laps.length + 1}`,
    duration: displays.stopwatch.textContent,
  };

  laps.push(newLap);
  displayLaps();
};

/**
 * Update the stopwatch display
 */
const updateStopwatch = function () {
  const currentTime = new Date();

  // Calculate elapsed time in seconds
  elapsedTime = Math.floor((currentTime - startTime) / 1000) + currentElapsed;

  // Update display
  displays.stopwatch.textContent = formatTimeHMS(elapsedTime);
};

/**
 * Reset the stopwatch
 */
const resetStopwatch = function () {
  clearInterval(timerInterval);

  // Update UI
  toggleVisibility('.stopwatch__btn--pause', '.stopwatch__btn--resume');
  toggleVisibility('.stopwatch__btn--round', '.stopwatch__btn--reset');

  // Reset values
  currentElapsed = 0;
  elapsedTime = 0;
  displays.stopwatch.textContent = '00:00:00';

  // Clear laps
  containers.stopwatchList.innerHTML = '';
  laps = [];
};

/**
 * Display all laps
 */
const displayLaps = function () {
  containers.stopwatchList.innerHTML = '';

  laps.forEach(lap => {
    const html = `
    <li class="stopwatch__lap" id="lap-${lap.id}">
      <h2 class="stopwatch__lap-name">${lap.name}</h2>
      <h2 class="stopwatch__lap-time">${lap.duration}</h2>
    </li>
    `;
    containers.stopwatchList.insertAdjacentHTML('afterbegin', html);
  });
};

// ========================
// INITIALIZATION
// ========================

// Initialize the application
const init = function () {
  // Display current time and timers
  displayCurrentTime();
  setInterval(displayCurrentTime, 1000);
  displayTimers();

  // ========================
  // EVENT LISTENERS
  // ========================

  // Timer tab button
  tabBtns.timer.addEventListener('click', function () {
    // Show timer container, hide stopwatch
    toggleVisibility('#stopwatch', '#timer');

    // Update tab styling
    tabBtns.timer.classList.add('tabs__btn--active');
    tabBtns.timer.classList.remove('tabs__btn--inactive');
    tabBtns.stopwatch.classList.remove('tabs__btn--active');
    tabBtns.stopwatch.classList.add('tabs__btn--inactive');
  });

  // Stopwatch tab button
  tabBtns.stopwatch.addEventListener('click', function () {
    // Show stopwatch container, hide timer
    toggleVisibility('#timer', '#stopwatch');

    // Update tab styling
    tabBtns.timer.classList.remove('tabs__btn--active');
    tabBtns.timer.classList.add('tabs__btn--inactive');
    tabBtns.stopwatch.classList.add('tabs__btn--active');
    tabBtns.stopwatch.classList.remove('tabs__btn--inactive');
  });

  // Stopwatch controls
  stopwatchBtns.resume.addEventListener('click', startStopwatch);
  stopwatchBtns.round.addEventListener('click', addLap);
  stopwatchBtns.reset.addEventListener('click', resetStopwatch);
  stopwatchBtns.pause.addEventListener('click', stopStopwatch);

  // Modal controls
  btnAddTimer.addEventListener('click', openModal);
  modal.addBtn.addEventListener('click', addTimer);
  modal.cancelBtn.addEventListener('click', closeModal);
  modal.overlay.addEventListener('click', closeModal);
};

// Initialize the app
init();
