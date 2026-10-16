
document.addEventListener("DOMContentLoaded", () => {

  // ==========================================
  // 1. ОСНОВНЫЕ ЭЛЕМЕНТЫ
  // ==========================================

  const header = document.querySelector(".header");
  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector("#site-nav");
  const backToTop = document.querySelector(".back-to-top");
  const year = document.querySelector("#year");

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const animationsEnabled =
    !reduceMotion &&
    "IntersectionObserver" in window;

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

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  // ==========================================
  // 3. АВТОМАТИЧЕСКИЙ ГОД
  // ==========================================

  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // ==========================================
  // 4. ЭЛЕМЕНТЫ С АНИМАЦИЯМИ
  // ==========================================

  // Обычные блоки сайта
  const revealItems = [
    ...document.querySelectorAll(
      ".section-heading, " +
      ".solution-card, " +
      ".image-card, " +
      ".case-card, " +
      ".step"
    )
  ];

  // Вертикальный процесс работы
  const workflow = document.querySelector(".workflow");

  const workflowItems = [
    ...document.querySelectorAll(".workflow__item")
  ];

  // Контактная секция и старая версия процесса,
  // если она ещё используется на странице
  const animatedSections = [
    ...document.querySelectorAll(
      ".project-contact, .process-section"
    )
  ];

  // Элементы Hero с CSS-анимациями
  const heroAnimations = [
    ...document.querySelectorAll(
      ".hero-reveal, " +
      ".hero-robot, " +
      ".hero-halo, " +
      ".hero-pulse, " +
      ".scroll-indicator span"
    )
  ];

  const scrollItems = [
    ...new Set([
      ...revealItems,
      ...workflowItems,
      ...animatedSections
    ])
  ];

  let observer = null;
  let returningToTop = false;
  let returnFallback = null;

  // ==========================================
  // 5. ПОДГОТОВКА АНИМАЦИЙ
  // ==========================================

  if (animationsEnabled) {

    revealItems.forEach(item => {
      item.classList.add("reveal");
    });

    if (workflow) {
      workflow.classList.add("is-animated");
    }

    animatedSections.forEach(section => {
      section.classList.add("has-motion");
    });

  }

  // ==========================================
  // 6. НАБЛЮДАТЕЛЬ ЗА ПРОКРУТКОЙ
  // ==========================================

  function startScrollAnimations() {

    if (!animationsEnabled) return;

    // Отключаем предыдущего наблюдателя
    if (observer) {
      observer.disconnect();
    }

    observer = new IntersectionObserver(
      (entries, currentObserver) => {

        if (returningToTop) return;

        entries.forEach(entry => {

          if (!entry.isIntersecting) return;

          entry.target.classList.add("is-visible");

          // Элемент уже появился,
          // больше за ним не наблюдаем
          currentObserver.unobserve(entry.target);

        });

      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -30px 0px"
      }
    );

    scrollItems.forEach(item => {
      observer.observe(item);
    });

  }

  // ==========================================
  // 7. СБРОС АНИМАЦИЙ СЕКЦИЙ
  // ==========================================

  function resetScrollAnimations() {

    if (!animationsEnabled) return;

    if (observer) {
      observer.disconnect();
    }

    scrollItems.forEach(item => {
      item.classList.remove("is-visible");
    });

    // Снова запускаем наблюдение
    startScrollAnimations();

  }

  // ==========================================
  // 8. ПЕРЕЗАПУСК HERO
  // ==========================================

  function restartHeroAnimations() {

    if (reduceMotion) return;

    // Временно отключаем CSS-анимации
    heroAnimations.forEach(element => {
      element.style.animation = "none";
    });

    // Принудительно фиксируем сброс стилей
    void document.documentElement.offsetWidth;

    // Удаляем временное отключение
    // CSS запускает анимации с начала
    heroAnimations.forEach(element => {
      element.style.removeProperty("animation");
    });

  }

  // ==========================================
  // 9. ПОЛНЫЙ ПЕРЕЗАПУСК ПОСЛЕ ВОЗВРАТА
  // ==========================================

  function finishReturnToTop() {

    if (!returningToTop) return;

    returningToTop = false;

    if (returnFallback !== null) {
      clearTimeout(returnFallback);
      returnFallback = null;
    }

    // Сначала возвращаем исходное
    // состояние элементов при прокрутке
    resetScrollAnimations();

    // Затем воспроизводим Hero заново
    restartHeroAnimations();

    // Возвращаем шапку в начальное состояние
    updateHeader();

    // Закрываем мобильное меню
    closeMenu();

  }

  // ==========================================
  // 10. ШАПКА И КНОПКА НАВЕРХ
  // ==========================================

  function updateHeader() {

    const scrollPosition = window.scrollY;

    if (header) {
      header.classList.toggle(
        "is-scrolled",
        scrollPosition > 30
      );
    }

    if (backToTop) {

      const visible = scrollPosition > 450;

      backToTop.classList.toggle(
        "is-visible",
        visible
      );

      backToTop.tabIndex = visible ? 0 : -1;

    }

  }

  function handleScroll() {

    updateHeader();

    // Когда прокрутка добралась до Hero,
    // запускаем полный сброс
    if (returningToTop && window.scrollY <= 2) {
      finishReturnToTop();
    }

  }

  window.addEventListener("scroll", handleScroll, {
    passive: true
  });

  // ==========================================
  // 11. КНОПКА НАВЕРХ — REPLAY
  // ==========================================

  if (backToTop) {

    backToTop.addEventListener("click", () => {

      if (returningToTop) return;

      returningToTop = true;

      // Пока едем вверх, не запускаем
      // анимации встречных секций
      if (observer) {
        observer.disconnect();
      }

      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "instant" : "smooth"
      });

      // Если страница уже наверху
      if (window.scrollY <= 2) {
        finishReturnToTop();
      }

      // Резерв на случай прерывания
      // плавной прокрутки пользователем
      if (returningToTop) {
        returnFallback = setTimeout(() => {
          finishReturnToTop();
        }, 3000);
      }

    });

  }

  // ==========================================
  // 12. ПЕРВОНАЧАЛЬНЫЙ ЗАПУСК
  // ==========================================

  updateHeader();
  startScrollAnimations();

});
