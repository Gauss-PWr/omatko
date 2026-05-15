document.addEventListener("DOMContentLoaded", function () {
  const targetDate = new Date(2026, 11, 11, 13, 30, 0);
  countdownToDate(targetDate, "timer", "Wystartowaliśmy!");

  const timerLabel = document.getElementById("timer-label");
  const timeRemaining = targetDate.getTime() - new Date().getTime();
  if (timerLabel) {
    if (timeRemaining <= 0) {
      timerLabel.style.display = "none";
    } else {
      setTimeout(() => {
        timerLabel.style.display = "none";
      }, timeRemaining);
    }
  }
});