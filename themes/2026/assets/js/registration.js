document.addEventListener("DOMContentLoaded", function() {
  const blocks = document.querySelectorAll('.js-reg-block');

  blocks.forEach(block => {
    const url = block.getAttribute('data-url');
    if (!url) return;

    const openStr = block.getAttribute('data-open');
    const closeStr = block.getAttribute('data-close');
    const manualClose = block.getAttribute('data-manual-close') === 'true';
    const btnColor = block.getAttribute('data-btn-color');

    const btnContainer = block.querySelector('.js-btn-container');
    const termElement = block.querySelector('.js-term');

    const now = new Date();
    const openDate = new Date(openStr);
    const closeDate = new Date(closeStr);

    closeDate.setHours(23, 59, 59, 999);

    const formatDate = (date) => {
      return date.toLocaleDateString('pl-PL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

    let state = "open";

    if (manualClose) {
      state = "manually-closed";
    } else if (now > closeDate) {
      state = "closed";
    } else if (now < openDate) {
      state = "before";
    }

    if (state === "open") {
      btnContainer.innerHTML = `<a class="${btnColor}" href="${url}">Zapisz się!</a>`;
      termElement.textContent = `Termin: ${formatDate(closeDate)}`;
    } else if (state === "before") {
      btnContainer.innerHTML = `<a class="gray" aria-disabled="true">Zapisz się!</a>`;
      termElement.textContent = `Data otwarcia: ${formatDate(openDate)}`;
    } else if (state === "closed") {
      btnContainer.innerHTML = `<a class="gray" aria-disabled="true">Zapisz się!</a>`;
      termElement.textContent = `Termin zapisów minął`;
    } else if (state === "manually-closed") {
      btnContainer.innerHTML = `<a class="gray" aria-disabled="true">Zapisz się!</a>`;
      termElement.textContent = `Zapisy niedostępne`;
    }
  });
});