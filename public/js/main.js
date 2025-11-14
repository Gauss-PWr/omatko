(() => {
  // <stdin>
  window.timeDiffText = (distance) => {
    const days = Math.floor(distance / (1e3 * 60 * 60 * 24));
    const hours = Math.floor(
      distance % (1e3 * 60 * 60 * 24) / (1e3 * 60 * 60)
    );
    const minutes = Math.floor(distance % (1e3 * 60 * 60) / (1e3 * 60));
    const seconds = Math.floor(distance % (1e3 * 60) / 1e3);
    return [
      days.toString().padStart(2, "0"),
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      seconds.toString().padStart(2, "0")
    ];
  };
  window.countdownToDate = (targetDate, elementId, postTimerText = "", interval = null) => {
    const timer = document.getElementById(elementId);
    if (!timer) {
      console.error(`Timer element ${elementId} not found`);
      return;
    }
    function updateTimer() {
      const now = /* @__PURE__ */ new Date();
      const distance = targetDate - now;
      if (distance < 0) {
        clearInterval(interval);
        timer.innerHTML = `<div class='countdown-end'>${postTimerText}</div>`;
        return;
      }
      const formattedValues = timeDiffText(distance);
      timer.querySelectorAll(".countdown-number").forEach((ele, i) => {
        ele.textContent = formattedValues[i];
      });
    }
    updateTimer();
    interval = setInterval(updateTimer, 1e3);
  };
})();
