document.addEventListener("DOMContentLoaded", function () {
  const glightbox = GLightbox({
    loop: false,
    skin: 'omtk',
    plyr: {
      config: {
        ratio: "9:16",
        muted: false,
        hideControls: true,
        loop: { active: true },
      },
    },
  });
});
