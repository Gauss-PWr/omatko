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
  // Pobieramy wszystkie elementy menu
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        const submenu = item.querySelector('.nav-submenu');

        // Uruchamiamy logikę tylko dla linków, które mają podmenu
        if (submenu && link) {
            link.addEventListener('click', function(e) {
                if (window.innerWidth > 900) {

                    // ZAWSZE blokujemy domyślne działanie linku
                    e.preventDefault();

                    if (item.classList.contains('is-open')) {
                        // DRUGIE KLIKNIĘCIE: Zamknij menu
                        item.classList.remove('is-open');

                        // Zdejmuje focus z linku (wyłącza :focus-within w CSS)
                        link.blur();

                        // Wymusza ukrycie w CSS na wypadek trwającego :hover
                        item.classList.add('is-closed');
                        setTimeout(() => item.classList.remove('is-closed'), 300);

                    } else {
                        // PIERWSZE KLIKNIĘCIE: Otwórz menu
                        item.classList.remove('is-closed'); // Reset

                        document.querySelectorAll('.nav-item.is-open').forEach(el => {
                            el.classList.remove('is-open');
                        });
                        item.classList.add('is-open');
                    }
                }
            });
        }
    });

    // Zamykanie podmenu, gdy użytkownik tapnie/kliknie gdziekolwiek indziej na stronie (poza nawigacją)
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.main-nav')) {
            document.querySelectorAll('.nav-item.is-open').forEach(el => {
                el.classList.remove('is-open');
            });
        }
    });
    // ---------------------------------------------------------
    // NOWE: Zamykanie menu po kliknięciu w jakikolwiek link (kotwicę)
    // ---------------------------------------------------------
    const allNavLinks = document.querySelectorAll('.main-nav a');

    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Sprawdzamy, czy link faktycznie prowadzi do kotwicy (zawiera '#')
            // i nie jest to tylko puste '#' (którego czasami używa się do zaślepek)
            const href = this.getAttribute('href');
            if (href && href.includes('#') && href !== '#') {

                // 1. Zamykamy wszystkie otwarte podmenu (.nav-submenu)
                document.querySelectorAll('.nav-item.is-open').forEach(el => {
                    el.classList.remove('is-open');

                    // Opcjonalnie dokładamy klasę .is-closed z poprzedniego kroku
                    el.classList.add('is-closed');
                    setTimeout(() => el.classList.remove('is-closed'), 300);
                });

                // Zdejmujemy focus, żeby zabić hover z klawiatury
                this.blur();

                // 2. Jeśli masz na mobile otwarte całe menu (klasa .active-menu na .nav-list),
                // to też je zamykamy przy okazji!
                const navList = document.querySelector('.nav-list');
                if (navList && navList.classList.contains('active-menu')) {
                    navList.classList.remove('active-menu');
                }
            }
        });
    });
});