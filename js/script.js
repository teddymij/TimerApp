'use strict';
// /////////////////////////
// Element
const btntabTimer = document.querySelector('.btn-timer');
const btntabStopwatch = document.querySelector('.btn-stopwatch');

const labelCurrentTime = document.querySelector('.current-time');
const containerTimer = document.querySelector('#timer');
const containerStopwatch = document.querySelector('#stopwatch');

///////////////////////////////////////
// Functions
const displayHours = function () {
  const date = new Date();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart();
  const seconds = date.getSeconds().toString().padStart();

  // Format the time
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // use the 12 hours format
  }).format(date);
  labelCurrentTime.textContent = `${formattedTime}`;
};
displayHours();
let timerInterval = setInterval(displayHours, 1000);

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
