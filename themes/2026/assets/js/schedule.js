document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".day-selector button");
  const slider = document.getElementById("switch-slider");
  const eventDetails = document.querySelectorAll(".event");

  // 1. ZABEZPIECZENIE: Jeśli na stronie nie ma harmonogramu, przerywamy skrypt.
  // Dzięki temu skrypt nie wyrzuci błędu na podstronach bez kalendarza.
  if (buttons.length === 0) return;

  // Dynamicznie ustawiamy szerokość suwaka
  if (slider) {
    slider.style.width = `${100 / buttons.length}%`;
  }

  // 2. Funkcja do zmiany widocznych dni (teraz jest bezpiecznie zamknięta w module)
  function showSchedule(day) {
    document.querySelectorAll(".schedule-day").forEach((el) => {
      el.classList.add("hidden");
      el.classList.remove("active");
    });

    const current = document.getElementById("schedule-" + day);
    if (current) {
      current.classList.remove("hidden");
      current.classList.add("active");
    }
  }

  // 3. Obsługa kliknięcia w przycisk konkretnego dnia
  buttons.forEach((button, index) => {
    button.addEventListener("click", (event) => {
      // Zdejmujemy klasę ze wszystkich i nadajemy klikniętemu
      buttons.forEach((btn) => btn.classList.remove("active-button"));

      // Używamy currentTarget zamiast target, żeby zapobiec błędom,
      // gdyby użytkownik kliknął np. w ikonkę wewnątrz przycisku
      event.currentTarget.classList.add("active-button");

      // Przesuwamy suwak
      if (slider) {
        slider.style.transform = `translateX(${index * 100}%)`;
      }

      // Wywołujemy zmianę harmonogramu!
      // Zakładam, że w HTML masz atrybut np. data-day="day-1"
      const dayTarget = button.dataset.day;
      if (dayTarget) {
        showSchedule(dayTarget);
      }
    });
  });

  // 4. Automatyczne wybieranie dzisiejszego lub najbliższego dnia
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  let wasClicked = false;
  for (const button of buttons) {
    const btnDate = new Date(button.dataset.day);
    btnDate.setHours(0, 0, 0, 0);

    if (btnDate.getTime() >= now.getTime()) {
      button.click(); // To symuluje kliknięcie i odpala całą logikę wyżej!
      wasClicked = true;
      break;
    }
  }

  // Jeśli żaden dzień nie spełniał warunku (wszystkie są w przeszłości), klikamy ostatni
  if (!wasClicked) {
    buttons[buttons.length - 1].click();
  }

  // 5. Obsługa rozwijania abstraktów/szczegółów
  eventDetails.forEach((ele) => {
    // Dodajemy 'e' jako argument funkcji
    ele.addEventListener("click", (e) => {

      // ZABEZPIECZENIE: Jeśli kliknięty element to .event-abstract
      // lub znajduje się w jego wnętrzu, przerywamy funkcję.
      if (e.target.closest(".event-abstract")) {
          return;
      }

      const eventAbstract = ele.querySelector(".event-abstract");
      const faIcon = ele.querySelector(".toggle-abstract i");

      // Upewniamy się, że element istnieje przed próbą modyfikacji klas
      if (eventAbstract && faIcon) {
        eventAbstract.classList.toggle("hidden");
        faIcon.classList.toggle("fa-caret-down");
        faIcon.classList.toggle("fa-caret-up");
      }
    });
  });
});