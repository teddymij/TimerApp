'use strict';
// /////////////////////////
// UI Element
const btntabTimer = document.querySelector('.btn-timer');
const btntabStopwatch = document.querySelector('.btn-stopwatch');
const btnStopwatchResume = document.querySelector('.stopwatch-btn-resume');
const btnStopwatchPause = document.querySelector('.stopwatch-btn-pause');
const btnStopwatchRound = document.querySelector('.stopwatch-btn-round');
const btnStopwatchReset = document.querySelector('.stopwatch-btn-reset');

const labelCurrentTime = document.querySelector('.current-time');
const labelCurrentStopwatch = document.querySelector('.current-stopwatch');

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
    duration: '01:08', // 20 minutes
    progress: 0, // Progression initiale
    isRunning: false,
    isPaused: false,
    isStopped: false,
  },
  {
    id: 2,
    name: 'Meditation',
    duration: '02:26', // 15 minutes
    progress: 0,
    isRunning: false,
    isPaused: false,
    isStopped: false,
  },
  {
    id: 3,
    name: 'Pomodoro',
    duration: '01:47', // 25 minutes
    progress: 0,
    isRunning: false,
    isPaused: false,
    isStopped: false,
  },
  // {
  //   id: 4,
  //   name: 'Break',
  //   duration: '00:05', // 5 minutes
  //   progress: 0,
  //   isRunning: false,
  //   isPaused: false,
  //   isStopped: false,
  // },
]; // array of timers objects

const laps = [];
///////////////////////////////////////
// Functions
// utility function
const convertToSeconds = function (duration) {
  const [minutes, seconds] = duration.split(':').map(Number); // map to convert the string to number
  return minutes * 60 + seconds;
};

const reverseDisplay = function (query1, query2) {
  // hide the query1 and show the query2
  document.querySelector(query1).classList.add('hidden');
  document.querySelector(query2).classList.remove('hidden');
};
// *************************
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

// Display the timer
const displayTimers = function () {
  containerListTimers.innerHTML = '';
  timers.forEach(timer => {
    const html = `
      <li class="timer" id="${timer.id}">
              <div class="grid--2-col">
                <div class="progressing-left">
                  <div class="flexbox-2">
                    <h2 class="timer-name">${timer.name}</h2>
                    <h2 class="timer-duration" id = "timer-duration-${timer.id}">${timer.duration}</h2>
                  </div>
                  <div class="progress-container">
                    <div class="progress-bar" id="progress-bar-${timer.id}"></div>
                  </div>
                </div>
                <div class="progressing-right">
                  <button class="btn btn-start" id="btn-start-${timer.id}">
                    <img src="img/icon-play.svg" alt="Close-button" />
                  </button>
                  <button class="btn btn-pause hidden" id="btn-pause-${timer.id}" >
                    <img src="img/icon-pause.svg" alt="Close-button" />
                  </button>
                  <button class="btn btn-stop" id="btn-stop-${timer.id}">
                    <img src="img/icon-stop.svg" alt="stop-button" />
                  </button>
                  <button class="btn btn-close" id="btn-close-${timer.id}"">
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
    // btn start timer

    document
      .querySelector(`#btn-start-${timer.id}`)
      .addEventListener('click', function () {
        playTimer(timer);
      });
    // btn pause timer
    document
      .querySelector(`#btn-pause-${timer.id}`)
      .addEventListener('click', function () {
        pauseTimer(timer);
      });
    // btn stop timer
    document
      .querySelector(`#btn-stop-${timer.id}`)
      .addEventListener('click', function () {
        stopTimer(timer);
      });
    // btn close timer
    document
      .querySelector(`#btn-close-${timer.id}`)
      .addEventListener('click', function () {
        deleteTimer(timer);
      });
  });
};
// *************************
// Logical function timer

// Play the timer
const playTimer = function (timer) {
  console.log(timer.isPaused);
  if (!timer.isPaused) timer.currentDuration = timer.duration; // set the current duration to the duration
  timer.isRunning = true;
  timer.isPaused = false;
  timer.isStopped = false;
  // Convert duration to seconds+
  const initialDurationInSeconds = convertToSeconds(timer.currentDuration);
  let durationMin = initialDurationInSeconds;

  const progressBar = document.querySelector(`#progress-bar-${timer.id}`);
  const labelDuration = document.querySelector(`#timer-duration-${timer.id}`);
  let lastTickTime = Date.now();

  // Function to update the timer display (minutes and seconds)
  const updateTimerDisplay = () => {
    const min = String(Math.trunc(durationMin / 60)).padStart(2, '0');
    const sec = String(Math.trunc(durationMin % 60)).padStart(2, '0');
    labelDuration.textContent = `${min}:${sec}`;
  };

  // Function to update the progress bar smoothly
  const animate = () => {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - lastTickTime) / 1000; // in seconds  or second ++
    // Calculate current percentage based on elapsed time
    const percentage =
      ((durationMin - elapsedTime) / initialDurationInSeconds) * 100;
    if (percentage >= 0) {
      progressBar.style.width = `${percentage}%`;
    }
    // Continue animation until next tick
    if (durationMin > 0) {
      timer.animationFrameId = requestAnimationFrame(animate);
    }
  };

  // Main tick function that runs every second
  const tick = function () {
    // When 0 seconds, stop timer and animation
    if (durationMin < 0) {
      clearInterval(timer.timerInterval);
      cancelAnimationFrame(timer.animationFrameId);
      progressBar.style.width = '0%';
      reverseDisplay(`#btn-pause-${timer.id}`, `#btn-start-${timer.id}`);
      return;
    }
    // Update timer display
    updateTimerDisplay();
    // Reset animation frame
    cancelAnimationFrame(timer.animationFrameId);
    lastTickTime = Date.now();
    timer.animationFrameId = requestAnimationFrame(animate);
    // Decrease duration for next tick
    durationMin--;
  };

  // Start initial tick
  tick();
  timer.timerInterval = setInterval(tick, 1000);
  // hide the start button and show the pause button
  reverseDisplay(`#btn-start-${timer.id}`, `#btn-pause-${timer.id}`);
};
// Pause the timer
const pauseTimer = function (timer) {
  // Update the timer status
  timer.isRunning = false;
  timer.isPaused = true;
  // Pause the timer
  clearInterval(timer.timerInterval);
  reverseDisplay(`#btn-pause-${timer.id}`, `#btn-start-${timer.id}`);
  cancelAnimationFrame(timer.animationFrameId);
  // Update the timer display
  const labelDuration = document.querySelector(`#timer-duration-${timer.id}`);
  timer.currentDuration = labelDuration.textContent;
};
// stop the timer
const stopTimer = function (timer) {
  // Update the timer status
  timer.isRunning = false;
  timer.isPaused = false;
  timer.isStopped = true;
  // Stop the timer
  clearInterval(timer.timerInterval);
  cancelAnimationFrame(timer.animationFrameId);
  // Update the timer display
  const labelDuration = document.querySelector(`#timer-duration-${timer.id}`);
  labelDuration.textContent = timer.duration;
  timer.currentDuration = timer.duration;
  // Update the progress bar
  const progressBar = document.querySelector(`#progress-bar-${timer.id}`);
  progressBar.style.width = '100%';
  reverseDisplay(`#btn-pause-${timer.id}`, `#btn-start-${timer.id}`);
};
// delete the timer
const deleteTimer = function (timer) {
  const indexToRemove = timers.findIndex(index => index.id === timer.id);
  timers.splice(indexToRemove, 1);
  clearInterval(timer.timerInterval);
  displayTimers();
  // Update the progress bar
};

// :::::::::::::::::::::
// Display the laps
const displayLaps = function () {
  containerListStopwatch.innerHTML = '';
  laps.forEach(lap => {
    const html = `
    <li class="lap flexbox-2" id="${lap.id}">
      <h2 class="lap-name">${lap.name}</h2>
      <h2 class="lap-time">${lap.duration}</h2>
    </li>
    `;
    containerListStopwatch.insertAdjacentHTML('afterbegin', html);
  });
};

// Logical function stopwatch
// Start stopwatch
let startTime;
let timerInterval;
let currentElapsed = 0;
let elapsedTime;
const startStopwatch = function () {
  startTime = new Date(); //save the startTime (0)
  timerInterval = setInterval(updateStopwatch, 1000);
  reverseDisplay('.stopwatch-btn-resume', '.stopwatch-btn-pause');
  reverseDisplay('.stopwatch-btn-reset', '.stopwatch-btn-round');
};
// Stop stopwatch
const stopStopwatch = function () {
  clearInterval(timerInterval);
  reverseDisplay('.stopwatch-btn-pause', '.stopwatch-btn-resume');
  reverseDisplay('.stopwatch-btn-round', '.stopwatch-btn-reset');
  currentElapsed = elapsedTime;
};
// Round stopwatch
const roundStopwatch = function () {
  const newLap = {
    id: 1,
    name: `Lap ${laps.length + 1}`,
    duration: labelCurrentStopwatch.textContent, // 20 minutes
  };
  laps.push(newLap);
  displayLaps();
};
const updateStopwatch = function () {
  const currentTime = new Date(); //get the current time (secondes++)

  elapsedTime = Math.floor((currentTime - startTime) / 1000) + currentElapsed;

  const seconds = String(elapsedTime % 60).padStart(2, '0');
  const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, '0');
  const hours = String(Math.floor(elapsedTime / 3600)).padStart(2, '0');

  labelCurrentStopwatch.textContent = `${hours}:${minutes}:${seconds}`;
};

const resetStopwatch = function () {
  clearInterval(timerInterval);
  reverseDisplay('.stopwatch-btn-pause', '.stopwatch-btn-resume');
  reverseDisplay('.stopwatch-btn-round', '.stopwatch-btn-reset');
  currentElapsed = 0;
  elapsedTime = 0;
  labelCurrentStopwatch.textContent = '00:00:00';
};
// *************************
//Event stopwatch
// Run stopwatch
btnStopwatchResume.addEventListener('click', function () {
  startStopwatch();
});
// add round
btnStopwatchRound.addEventListener('click', function () {
  roundStopwatch();
});

// reset
btnStopwatchReset.addEventListener('click', function () {
  resetStopwatch();
});

// pause
btnStopwatchPause.addEventListener('click', function () {
  stopStopwatch();
});
// resume
displayHours();
setInterval(displayHours, 1000);
displayTimers();

///////////////////////////////////////
// GENERAL Event handlers
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
