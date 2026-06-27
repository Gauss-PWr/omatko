document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("menu-button");
  const navList = document.querySelector(".nav-list");
  const buttonIcon = button.querySelector("i");

  // Funkcja pomocnicza do zamykania menu
  const closeMenu = () => {
    navList.classList.remove("active-menu");
    buttonIcon.classList.add("fa-bars");
    buttonIcon.classList.remove("fa-xmark");

    // Czyścimy style inline, aby CSS mógł płynnie zwinąć menu do 0
    navList.style.maxWidth = null;
    navList.style.maxHeight = null;
  };

// Obsługa kliknięcia w przycisk Hamburgera
  button.addEventListener("click", () => {
    const isActive = navList.classList.toggle("active-menu");
    buttonIcon.classList.toggle("fa-bars");
    buttonIcon.classList.toggle("fa-xmark");

    if (isActive) {
      // 1. Resetujemy tymczasowo max-width, aby tekst rozwinął się do naturalnej szerokości
      navList.style.maxWidth = "max-content";

      // 2. Pobieramy idealną, pełną szerokość i wysokość
      const correctWidth = navList.scrollWidth;
      const correctHeight = navList.scrollHeight;

      // 3. Przywracamy na moment 0, żeby przeglądarka wiedziała, skąd zacząć animację
      navList.style.maxWidth = "0px";

      // 4. Wymuszamy tzw. reflow (przeliczenie stylów przez przeglądarkę)
      navList.offsetHeight;

      // 5. Ustalamy finalne wartości, które CSS płynnie zaanimuje
      navList.style.maxWidth = correctWidth + "px";
      navList.style.maxHeight = correctHeight + "px";
    } else {
      // Zwijanie (czyszczenie wymiarów)
      navList.style.maxWidth = null;
      navList.style.maxHeight = null;
    }
  });

  document.addEventListener("click", function(event) {
    // Sprawdzamy czy menu jest rozwinięte
    if (navList.classList.contains("active-menu")) {
      // Jeśli kliknięto POZA bąbelkiem i POZA przyciskiem menu
      if (!navList.contains(event.target) && !button.contains(event.target)) {
        // Zatrzymujemy kliknięcie
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
      }
    }
  }, true);

  // zwijanie menu po kliknieciu linku
  const navLinks = document.querySelectorAll('.nav-link[href*="#"]');

  navLinks.forEach(link => {
      link.addEventListener("click", closeMenu);
  });
});