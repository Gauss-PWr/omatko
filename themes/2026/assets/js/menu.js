document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("menu-button");
  const navList = document.querySelector(".nav-list");
  const buttonIcon = document.querySelector(".fa-solid");

  button.addEventListener("click", () => {
    navList.classList.toggle("active-menu");
    buttonIcon.classList.toggle("fa-bars");
    buttonIcon.classList.toggle("fa-xmark");
  });

  document.addEventListener("click", function(event) {
    // Sprawdzamy czy menu jest rozwinięte
    if (navList.classList.contains("active-menu")) {
      // Jeśli kliknięto POZA bąbelkiem i POZA przyciskiem menu
      if (!navList.contains(event.target) && !button.contains(event.target)) {
        // Zatrzymujemy kliknięcie
        event.preventDefault();
        event.stopPropagation();
        // Zwijamy menu
        navList.classList.remove("active-menu");
        buttonIcon.classList.add("fa-bars");
        buttonIcon.classList.remove("fa-xmark");
      }
    }
  }, true); // <-- 'true' włącza fazę przechwytywania (wyłapuje kliknięcie jako pierwsze)

  // zwijanie menu po kliknieciu linku
  const navLinks = document.querySelectorAll('.nav-link[href*="#"]');

  navLinks.forEach(link => {
      link.addEventListener("click", function() {

              navList.classList.remove("active-menu");

              buttonIcon.classList.add("fa-bars");
              buttonIcon.classList.remove("fa-xmark");

      });
  });
});