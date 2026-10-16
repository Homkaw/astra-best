
document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 1. ELEMENTS
  // ==========================================

  const header = document.querySelector(".career-header");
  const menu = document.querySelector(".career-nav");
  const menuButton = document.querySelector(".career-menu-btn");
  const topButton = document.querySelector(".career-top");
  const year = document.querySelector("#year");

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  // ==========================================
  // 2. MOBILE MENU
  // ==========================================

  function closeMenu() {
    if (!menu || !menuButton) return;

    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Открыть меню");
  }

  if (menu && menuButton) {

    menuButton.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");

      menuButton.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuButton.setAttribute(
        "aria-label",
        isOpen ? "Закрыть меню" : "Открыть меню"
      );
    });

    menu.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") closeMenu();
    });

    document.addEventListener("click", event => {
      if (
        menu.classList.contains("is-open") &&
        !header.contains(event.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 800) closeMenu();
    });
  }


  // ==========================================
  // 3. HEADER & BACK TO TOP
  // ==========================================

  function updateScrollUI() {
    const position = window.scrollY;

    if (header) {
      header.classList.toggle(
        "is-scrolled",
        position > 30
      );
    }

    if (topButton) {
      const visible = position > 450;

      topButton.classList.toggle("is-visible", visible);
      topButton.tabIndex = visible ? 0 : -1;
    }
  }

  updateScrollUI();

  window.addEventListener("scroll", updateScrollUI, {
    passive: true
  });


  // ==========================================
  // 4. REVEAL ANIMATIONS
  // ==========================================

  const revealElements = [
    ...document.querySelectorAll("[data-reveal]")
  ];

  const animationsEnabled =
    !reducedMotion &&
    "IntersectionObserver" in window;

  let revealObserver = null;
  let returningToTop = false;
  let returnTimer = null;

  if (animationsEnabled) {

    // Последовательное появление элементов Hero
    document.querySelectorAll(
      ".career-hero__content [data-reveal]"
    ).forEach((item, index) => {
      item.style.setProperty(
        "--reveal-delay",
        `${index * 130}ms`
      );
    });

    // Последовательное появление преимуществ
    document.querySelectorAll(
      ".career-benefit"
    ).forEach((item, index) => {
      item.style.setProperty(
        "--reveal-delay",
        `${index * 110}ms`
      );
    });

    // Этапы начала карьеры
    document.querySelectorAll(
      ".career-start__item"
    ).forEach((item, index) => {
      item.style.setProperty(
        "--reveal-delay",
        `${index * 100}ms`
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
        threshold: 0.08,
        rootMargin: "0px 0px -25px 0px"
      }
    );

    document.body.classList.add("career-motion");

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  }


  // ==========================================
  // 5. REPLAY ANIMATIONS
  // ==========================================

  function resetAnimations() {
    if (!returningToTop) return;

    returningToTop = false;

    if (returnTimer !== null) {
      clearTimeout(returnTimer);
      returnTimer = null;
    }

    if (!animationsEnabled) return;

    revealObserver.disconnect();

    revealElements.forEach(element => {
      element.classList.remove("is-visible");
    });

    // Применяем начальное состояние
    void document.body.offsetHeight;

    requestAnimationFrame(() => {
      revealElements.forEach(element => {
        revealObserver.observe(element);
      });
    });
  }


  // ==========================================
  // 6. BACK TO TOP
  // ==========================================

  if (topButton) {

    topButton.addEventListener("click", () => {
      if (returningToTop) return;

      closeMenu();
      returningToTop = true;

      if (revealObserver) {
        revealObserver.disconnect();
      }

      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth"
      });

      if (window.scrollY <= 3) {
        resetAnimations();
        return;
      }

      // Если плавную прокрутку прервали,
      // возвращаем работу анимаций.
      returnTimer = setTimeout(() => {
        if (window.scrollY <= 10) {
          resetAnimations();
        } else {
          returningToTop = false;

          if (revealObserver) {
            revealElements.forEach(element => {
              if (!element.classList.contains("is-visible")) {
                revealObserver.observe(element);
              }
            });
          }
        }
      }, 5000);
    });

    window.addEventListener("scroll", () => {
      if (returningToTop && window.scrollY <= 3) {
        resetAnimations();
      }
    }, {
      passive: true
    });
  }

});
