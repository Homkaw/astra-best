
document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 1. ОСНОВНЫЕ ЭЛЕМЕНТЫ
  // ==========================================

  const header = document.querySelector(".dec-header");
  const menu = document.querySelector(".dec-nav");
  const menuButton = document.querySelector(".dec-menu-btn");

  const topButton = document.querySelector(".dec-back-top");
  const progressBar = document.querySelector(".dec-reading-progress");
  const year = document.querySelector("#year");

  const catalog = document.querySelector(".dec-catalog");
  const catalogSections = [
    ...document.querySelectorAll(".dec-solution")
  ];

  const catalogLinks = [
    ...document.querySelectorAll(".dec-sidebar__nav a")
  ];

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const animationEnabled =
    !reducedMotion &&
    "IntersectionObserver" in window;

  if (year) {
    year.textContent = new Date().getFullYear();
  }


  // ==========================================
  // 2. МОБИЛЬНОЕ МЕНЮ
  // ==========================================

  function closeMenu() {
    if (!menu || !menuButton) return;

    menu.classList.remove("is-open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Открыть меню");
  }

  if (menu && menuButton) {

    menuButton.addEventListener("click", () => {
      const opened = menu.classList.toggle("is-open");

      menuButton.setAttribute(
        "aria-expanded",
        String(opened)
      );

      menuButton.setAttribute(
        "aria-label",
        opened ? "Закрыть меню" : "Открыть меню"
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
  // 3. АКТИВНОЕ НАПРАВЛЕНИЕ
  // ==========================================

  function updateActiveSection() {

    if (!catalogSections.length) return;

    // Положение активной зоны экрана
    const headerHeight = header?.offsetHeight || 82;
    const mobileOffset = window.innerWidth <= 800 ? 100 : 50;
    const marker = headerHeight + mobileOffset;

    let activeId = catalogSections[0].id;

    catalogSections.forEach(section => {

      const rect = section.getBoundingClientRect();

      if (rect.top <= marker) {
        activeId = section.id;
      }

    });

    catalogLinks.forEach(link => {

      const isActive =
        link.getAttribute("href") === `#${activeId}`;

      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }

    });
  }


  // ==========================================
  // 4. ШАПКА И ИНДИКАТОР ПРОКРУТКИ
  // ==========================================

  function updateScrollUI() {

    const scrollY = window.scrollY;

    // Фон шапки
    if (header) {
      header.classList.toggle(
        "is-scrolled",
        scrollY > 30
      );
    }

    // Кнопка наверх
    if (topButton) {

      const visible = scrollY > 450;

      topButton.classList.toggle(
        "is-visible",
        visible
      );

      topButton.tabIndex = visible ? 0 : -1;
    }

    // Красная линия прогресса в шапке
    if (progressBar) {

      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight -
        window.innerHeight
      );

      const progress = Math.max(
        0,
        Math.min(1, scrollY / maxScroll)
      );

      progressBar.style.transform =
        `scaleX(${progress})`;
    }

    updateActiveSection();
  }

  // Один обработчик для прокрутки
  window.addEventListener("scroll", updateScrollUI, {
    passive: true
  });

  window.addEventListener("resize", updateScrollUI);


  // ==========================================
  // 5. ЭЛЕМЕНТЫ ДЛЯ АНИМАЦИЙ
  // ==========================================

  const revealElements = [
    ...document.querySelectorAll("[data-dec-reveal]")
  ];

  // Добавляем последовательность первому экрану
  document.querySelectorAll(
    ".dec-hero__content [data-dec-reveal]"
  ).forEach((element, index) => {

    element.style.setProperty(
      "--dec-delay",
      `${index * 120}ms`
    );

  });

  let revealObserver = null;

  let returningToTop = false;
  let returnTimer = null;


  // ==========================================
  // 6. ЗАПУСК АНИМАЦИЙ
  // ==========================================

  if (animationEnabled) {

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

    document.body.classList.add("dec-motion");

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });

  }


  // ==========================================
  // 7. ПЕРЕЗАПУСК ДЕКОРАТИВНОЙ СХЕМЫ
  // ==========================================

  function restartHeroEffects() {

    if (reducedMotion) return;

    const tracks = document.querySelectorAll(
      ".dec-system__track span"
    );

    tracks.forEach(track => {
      track.style.animation = "none";
    });

    // Применяем временный сброс
    void document.body.offsetHeight;

    tracks.forEach(track => {
      track.style.removeProperty("animation");
    });

  }


  // ==========================================
  // 8. СБРОС АНИМАЦИЙ СТРАНИЦЫ
  // ==========================================

  function resetAnimations() {

    if (!returningToTop) return;

    returningToTop = false;

    if (returnTimer !== null) {
      clearTimeout(returnTimer);
      returnTimer = null;
    }

    // Перезапуск схемы Hero
    restartHeroEffects();

    if (!animationEnabled) return;

    revealObserver.disconnect();

    // Удаляем классы появления
    revealElements.forEach(element => {
      element.classList.remove("is-visible");
    });

    // Применяем исходное состояние
    void document.body.offsetHeight;

    // Снова наблюдаем за секциями
    requestAnimationFrame(() => {

      revealElements.forEach(element => {
        revealObserver.observe(element);
      });

    });

  }


  // ==========================================
  // 9. КНОПКА НАВЕРХ
  // ==========================================

  if (topButton) {

    topButton.addEventListener("click", () => {

      if (returningToTop) return;

      closeMenu();

      returningToTop = true;

      // Не воспроизводим эффекты на пути наверх
      if (revealObserver) {
        revealObserver.disconnect();
      }

      window.scrollTo({
        top: 0,
        behavior: reducedMotion ? "auto" : "smooth"
      });

      // Если уже на первом экране
      if (window.scrollY <= 3) {
        resetAnimations();
        updateScrollUI();
        return;
      }

      // Резервный механизм при прерывании прокрутки
      returnTimer = setTimeout(() => {

        if (!returningToTop) return;

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


    // Проверяем момент завершения возврата
    window.addEventListener("scroll", () => {

      if (returningToTop && window.scrollY <= 3) {
        resetAnimations();
      }

    }, {
      passive: true
    });

  }


  // ==========================================
  // 10. ПЕРВОНАЧАЛЬНАЯ ЗАГРУЗКА
  // ==========================================

  updateScrollUI();

  // Пересчитываем позиции после загрузки ресурсов
  window.addEventListener("load", updateScrollUI);

});
