'use strict';
// /////////////////////////
// UI Element
const btntabTimer = document.querySelector('.btn-timer');
const btntabStopwatch = document.querySelector('.btn-stopwatch');

const labelCurrentTime = document.querySelector('.current-time');
const containerTimer = document.querySelector('#timer');
const containerStopwatch = document.querySelector('#stopwatch');

const containerListTimers = document.querySelector('#list-timers');
const containerListStopwatch = document.querySelector('#list-stopwatch');
// /////////////////////////
// Variable
const timers = [
  {
    id: 1,
    name: 'Workout',
    duration: '20:00', // 20 minutes
    progress: 0, // Progression initiale
    isRunning: false,
    isPaused: false,
    isStopped: false,
  },
  {
    id: 2,
    name: 'Meditation',
    duration: '15:00', // 15 minutes
    progress: 0,
    isRunning: false,
    isPaused: false,
    isStopped: false,
  },
  {
    id: 3,
    name: 'Pomodoro',
    duration: '25:00', // 25 minutes
    progress: 0,
    isRunning: false,
    isPaused: false,
    isStopped: false,
  },
  {
    id: 4,
    name: 'Break',
    duration: '5:00', // 5 minutes
    progress: 0,
    isRunning: false,
    isPaused: false,
    isStopped: false,
  },
]; // array of timers objects

///////////////////////////////////////
// Functions
// Display the current time
const displayHours = function () {
  const date = new Date();

  // Format the time
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // use the 12 hours format
  }).format(date);
  labelCurrentTime.textContent = `${formattedTime}`;
};

// Display the timers
const displayTimers = function () {
  timers.forEach(timer => {
    const html = `
      <li class="timer" id="${timer.id}">
              <div class="grid--2-col">
                <div class="progressing-left">
                  <div class="flexbox-2">
                    <h2 class="timer-name">${timer.name}</h2>
                    <h2 class="timer-duration">${timer.duration}</h2>
                  </div>
                  <div class="progress-container">
                    <div class="progress-bar" id="progress-bar-${timer.id}"></div>
                  </div>
                </div>
                <div class="progressing-right">
                  <button class="btn btn-start">
                    <img src="img/icon-play.svg" alt="Close-button" />
                  </button>
                  <button class="btn btn-stop">
                    <img src="img/icon-stop.svg" alt="Close-button" />
                  </button>
                  <button class="btn btn-close" id="delete-timer-1">
                    <img src="img/icon-close.svg" alt="Close-button" />
                  </button>
                </div>
              </div>
            </li>
    `;
    containerListTimers.insertAdjacentHTML('afterbegin', html);
    // Find the progress bar and set it to 100%
    const progressBar = document.querySelector(`#progress-bar-${timer.id}`);
    progressBar.style.width = `100%`; // set the progress bar to 100%
  });
};

displayHours();
let timerInterval = setInterval(displayHours, 1000);
displayTimers();

///////////////////////////////////////
// Event handlers
// navtab timer btn
btntabTimer.addEventListener('click', function () {
  // show timer container and hide stopwatch container
  containerTimer.classList.remove('hidden');
  containerStopwatch.classList.add('hidden');
  timerInterval = setInterval(displayHours, 1000);
});
// navtab stopwatch btn
btntabStopwatch.addEventListener('click', function () {
  // show stopwatch container and hide timer container
  containerStopwatch.classList.remove('hidden');
  containerTimer.classList.add('hidden');
  // clear the timer interval
  clearInterval(timerInterval);
});
