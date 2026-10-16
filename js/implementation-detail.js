
document.addEventListener("DOMContentLoaded", () => {

  // ========================================
  // ELEMENTS
  // ========================================

  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const menuButton = document.querySelector(".menu-toggle");

  const progressBar = document.querySelector(".reading-progress");
  const topButton = document.querySelector(".back-to-top");
  const year = document.querySelector("#year");

  const timeline = document.querySelector("[data-timeline]");
  const timelineItems = timeline
    ? [...timeline.querySelectorAll(".timeline__item")]
    : [];

  const graphicLine = document.querySelector(
    ".detail-hero__graphic-line"
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  // ========================================
  // MOBILE MENU
  // ========================================

  function closeMenu() {
    if (!nav || !menuButton) return;

    nav.classList.remove("is-open");
    menuButton.classList.remove("is-open");

    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Открыть меню");
  }

  if (nav && menuButton) {

    menuButton.addEventListener("click", () => {

      const opened = nav.classList.toggle("is-open");

      menuButton.classList.toggle("is-open", opened);

      menuButton.setAttribute(
        "aria-expanded",
        String(opened)
      );

      menuButton.setAttribute(
        "aria-label",
        opened ? "Закрыть меню" : "Открыть меню"
      );

    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", event => {
      if (
        nav.classList.contains("is-open") &&
        header &&
        !header.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) {
        closeMenu();
      }
    });

  }


  // ========================================
  // SCROLL REVEAL
  // ========================================

  const revealElements = [
    ...document.querySelectorAll("[data-reveal]")
  ];

  const canAnimate =
    !reducedMotion &&
    "IntersectionObserver" in window;

  let revealObserver = null;
  let returningToTop = false;
  let fallbackTimer = null;

  if (canAnimate) {

    // Последовательность появления Hero
    document.querySelectorAll(
      ".detail-hero__content [data-reveal]"
    ).forEach((element, index) => {

      element.style.setProperty(
        "--reveal-delay",
        `${index * 125}ms`
      );

    });

    // Плавное появление результатов
    document.querySelectorAll(
      ".outcomes-grid .outcome"
    ).forEach((element, index) => {

      element.style.setProperty(
        "--reveal-delay",
        `${index % 2 * 100}ms`
      );

    });

    revealObserver = new IntersectionObserver(
      (entries, observer) => {

        if (returningToTop) return;

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);

        });

      },
      {
        threshold: 0.06,
        rootMargin: "0px 0px -20px 0px"
      }
    );

    document.body.classList.add("motion-ready");

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });

  }


  // ========================================
  // TIMELINE SCROLL PROGRESS
  // ========================================

  function updateTimeline() {
    if (!timeline) return;

    const rect = timeline.getBoundingClientRect();
    const marker = window.innerHeight * 0.63;

    const maxHeight = Math.max(
      0,
      timeline.offsetHeight - 78
    );

    const filled = Math.max(
      0,
      Math.min(
        maxHeight,
        marker - rect.top - 23
      )
    );

    timeline.style.setProperty(
      "--line-progress",
      `${filled}px`
    );

    // Подсвечиваем этап, который сейчас читают
    let activeIndex = -1;

    timelineItems.forEach((item, index) => {
      if (item.getBoundingClientRect().top <= marker) {
        activeIndex = index;
      }
    });

    timelineItems.forEach((item, index) => {
      item.classList.toggle(
        "is-current",
        index === activeIndex
      );
    });
  }


  // ========================================
  // HEADER, PROGRESS, BACK TO TOP
  // ========================================

  let scrollFrame = null;

  function updateScroll() {

    const scrollY = window.scrollY;

    header?.classList.toggle(
      "is-scrolled",
      scrollY > 25
    );

    if (topButton) {

      const visible = scrollY > 450;

      topButton.classList.toggle(
        "is-visible",
        visible
      );

      topButton.tabIndex = visible ? 0 : -1;
    }

    if (progressBar) {

      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight -
        window.innerHeight
      );

      const progress = Math.min(
        1,
        Math.max(0, scrollY / maxScroll)
      );

      progressBar.style.transform =
        `scaleX(${progress})`;
    }

    updateTimeline();

    scrollFrame = null;
  }

  function requestScrollUpdate() {

    if (scrollFrame !== null) return;

    scrollFrame = requestAnimationFrame(updateScroll);
  }

  window.addEventListener(
    "scroll",
    requestScrollUpdate,
    { passive: true }
  );

  window.addEventListener(
    "resize",
    requestScrollUpdate
  );


  // ========================================
  // RESTART HERO EFFECT
  // ========================================

  function restartGraphic() {

    if (reducedMotion || !graphicLine) return;

    graphicLine.style.animation = "none";

    void graphicLine.offsetHeight;

    graphicLine.style.removeProperty("animation");
  }


  // ========================================
  // REPLAY ANIMATIONS AT TOP
  // ========================================

  function finishReturn() {

    if (!returningToTop) return;

    returningToTop = false;

    if (fallbackTimer !== null) {
      clearTimeout(fallbackTimer);
      fallbackTimer = null;
    }

    restartGraphic();

    if (!revealObserver) {
      updateScroll();
      return;
    }

    revealObserver.disconnect();

    revealElements.forEach(element => {
      element.classList.remove("is-visible");
    });

    // Применяем начальное состояние анимаций
    void document.body.offsetHeight;

    requestAnimationFrame(() => {

      revealElements.forEach(element => {
        revealObserver.observe(element);
      });

    });

    updateScroll();
  }


  // ========================================
  // BACK TO TOP
  // ========================================

  if (topButton) {

    topButton.addEventListener("click", () => {

      if (returningToTop) return;

      closeMenu();

      returningToTop = true;

      revealObserver?.disconnect();

      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth"
      });

      if (window.scrollY <= 3) {
        finishReturn();
        return;
      }

      // Если пользователь прервал прокрутку,
      // возвращаем наблюдение за элементами
      fallbackTimer = setTimeout(() => {

        if (!returningToTop) return;

        if (window.scrollY <= 10) {
          finishReturn();
          return;
        }

        returningToTop = false;

        if (revealObserver) {
          revealElements.forEach(element => {

            if (!element.classList.contains("is-visible")) {
              revealObserver.observe(element);
            }

          });
        }

      }, 5000);

    });

    window.addEventListener("scroll", () => {

      if (
        returningToTop &&
        window.scrollY <= 3
      ) {
        finishReturn();
      }

    }, { passive: true });

  }


  // ========================================
  // INITIAL
  // ========================================

  updateScroll();

  window.addEventListener("load", updateScroll);

});
