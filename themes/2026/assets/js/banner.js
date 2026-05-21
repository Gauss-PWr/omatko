document.addEventListener("DOMContentLoaded", function () {
  const timerContainer = document.getElementById("timer");
  if (!timerContainer) return;

  const targetStr = timerContainer.getAttribute("data-target");
  if (!targetStr) return;

  const targetDate = new Date(targetStr);
  const timerLabel = document.getElementById("timer-label");

  // Pobranie daty zakończenia lub automatyczny "fallback" na +2 dni (łącznie 3 dni konferencji)
  const endStr = timerContainer.getAttribute("data-end");
  let endDate;
  if (endStr && endStr.trim() !== "") {
    endDate = new Date(endStr);
  } else {
    endDate = new Date(targetDate);
    endDate.setDate(targetDate.getDate() + 2);
    endDate.setHours(23, 59, 59, 999); // do końca trzeciego dnia
  }

  const daysEl = timerContainer.querySelector(".js-days");
  const hoursEl = timerContainer.querySelector(".js-hours");
  const minutesEl = timerContainer.querySelector(".js-minutes");
  const secondsEl = timerContainer.querySelector(".js-seconds");

  function updateCountdown() {
    const now = new Date();

    // CASE 1: Konferencja dobiegła końca
    if (now >= endDate) {
      if (timerLabel) timerLabel.style.display = "none";
      timerContainer.innerHTML = `<div class="countdown-end">Do zobaczenia niedługo!</div>`;
      clearInterval(countdownInterval);
      return;
    }

    // CASE 2: Konferencja właśnie trwa
    if (now >= targetDate) {
      if (timerLabel) timerLabel.style.display = "none";

      // Warunek chroni przed ciągłym odświeżaniem drzewa DOM co sekundę
      if (timerContainer.querySelector(".countdown-end") === null) {
        timerContainer.innerHTML = `<div class="countdown-end">Wystartowaliśmy!</div>`;
      }
      return; // Nie czyścimy interwału, aby skrypt doczekał do momentu przejścia w CASE 1
    }

    // CASE 3: Odliczanie (konferencja w przyszłości)
    const timeRemaining = targetDate - now;

    const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  const countdownInterval = setInterval(updateCountdown, 1000);
});