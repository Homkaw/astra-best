
document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#site-nav');
  const header = document.querySelector('.site-header');
  const topButton = document.querySelector('.back-top');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const year = document.querySelector('#year');

  if (year) year.textContent = new Date().getFullYear();

  // Мобильное меню
  const closeMenu = () => {
    if (!menu || !menuButton) return;
    menu.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Открыть меню');
  };

  if (menuButton && menu) {
    menuButton.addEventListener('click', () => {
      const opened = menu.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(opened));
      menuButton.setAttribute('aria-label', opened ? 'Закрыть меню' : 'Открыть меню');
    });

    menu.querySelectorAll('a').forEach(link =>
      link.addEventListener('click', closeMenu)
    );

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeMenu();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 800) closeMenu();
    });
  }

  // Шапка и кнопка наверх
  const updateScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 24);

    if (topButton) {
      const visible = window.scrollY > 450;
      topButton.classList.toggle('visible', visible);
      topButton.tabIndex = visible ? 0 : -1;
    }
  };

  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  let replayRequested = false;
  let revealObserver = null;

  const restartScrollEffects = () => {
    replayRequested = false;
    if (!revealObserver) return;

    revealObserver.disconnect();

    document.querySelectorAll('[data-reveal]').forEach(element => {
      element.classList.remove('shown');
      revealObserver.observe(element);
    });
  };

  topButton?.addEventListener('click', () => {
    replayRequested = true;

    window.scrollTo({
      top: 0,
      behavior: reducedMotion ? 'auto' : 'smooth'
    });

    if (window.scrollY <= 2) restartScrollEffects();
  });

  window.addEventListener('scroll', () => {
    if (replayRequested && window.scrollY <= 2) {
      restartScrollEffects();
    }
  }, { passive: true });

  
  // ==========================================
  // ИСТОРИЯ КОМПАНИИ — ПРОГРЕСС ЛИНИИ
  // ==========================================

  const historyTimeline = document.querySelector(
    ".company-history__timeline"
  );

  if (historyTimeline && !reducedMotion) {

    let historyFrameRequested = false;

    function updateHistoryProgress() {

      const rect = historyTimeline.getBoundingClientRect();

      // Полная длина линии
      const maxHeight = Math.max(
        0,
        historyTimeline.offsetHeight - 48
      );

      // Точка экрана, до которой заполняем линию
      const activePosition = window.innerHeight * 0.64;

      // Рассчитываем заполненную длину
      const progress = Math.max(
        0,
        Math.min(
          maxHeight,
          activePosition - rect.top - 20
        )
      );

      historyTimeline.style.setProperty(
        "--history-line-height",
        `${progress}px`
      );

      historyFrameRequested = false;
    }

    function requestHistoryUpdate() {

      if (historyFrameRequested) return;

      historyFrameRequested = true;

      requestAnimationFrame(updateHistoryProgress);
    }

    window.addEventListener(
      "scroll",
      requestHistoryUpdate,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      requestHistoryUpdate
    );

    updateHistoryProgress();
  }


  const historyButtons = document.querySelectorAll('.history-year');
  const yearLabel = document.querySelector('#history-year-label');
  const historyNumber = document.querySelector('#history-number');
  const historyTitle = document.querySelector('#history-title');
  const historyDescription = document.querySelector('#history-description');

  historyButtons.forEach(button => button.addEventListener('click', () => {
    const key = button.dataset.history;
    if (!history[key]) return;

    historyButtons.forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    yearLabel.textContent = key;
    historyNumber.textContent = key;
    historyTitle.textContent = history[key][0];
    historyDescription.textContent = history[key][1];
  }));

  // Плавное появление блоков
  const blocks = document.querySelectorAll(
    '.mission-grid, .section-header, .recognition-grid, .career-inner'
  );

  if (!reducedMotion && 'IntersectionObserver' in window) {
    blocks.forEach(el => el.setAttribute('data-reveal', ''));
    document.body.classList.add('js-motion');

    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add('shown');
        revealObserver.unobserve(entry.target);
      });
    }, {
      threshold: .06,
      rootMargin: '0px 0px 35px 0px'
    });

    blocks.forEach(el => revealObserver.observe(el));
  }
});



// ============================================
// ABOUT PAGE — SCROLL ANIMATIONS
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Не скрываем элементы, если анимации
  // отключены или Observer недоступен
  if (
    reduceMotion ||
    !("IntersectionObserver" in window)
  ) return;


  // ==========================================
  // 1. ЭЛЕМЕНТЫ ДЛЯ АНИМАЦИИ
  // ==========================================

  const selectors = [
    ".hero-text .overline",
    ".hero-text h1",
    ".hero-text > p",
    ".about-hero-controls",
    ".system-art",

    ".fact-grid .fact",

    ".mission-grid > div",

    ".company-history__intro",
    ".company-history__event",

    ".expertise .section-header",
    ".service-list .service",

    ".approach-grid > div",

    ".recognition .section-header",
    ".recognition-grid article",

    ".best-team__content",
    ".best-team__aside",

    ".best-project__content",
    ".best-project__action"
  ];

  const elements = [
    ...document.querySelectorAll(selectors.join(","))
  ];

  // Помечаем элементы, которыми управляет
  // именно новая анимационная система

  elements.forEach(element => {
    element.setAttribute("data-about-animate", "");
  });


  // ==========================================
  // 2. ЗАДЕРЖКИ ПОЯВЛЕНИЯ
  // ==========================================

  function setDelays(selector, delay) {

    const items = document.querySelectorAll(selector);

    items.forEach((item, index) => {
      item.style.setProperty(
        "--about-delay",
        `${index * delay}ms`
      );
    });

  }

  // Первый экран
  setDelays(
    ".hero-text .overline, .hero-text h1, " +
    ".hero-text > p, .about-hero-controls",
    120
  );

  // Цифры компании
  setDelays(".fact-grid .fact", 90);

  // Услуги
  setDelays(".service-list .service", 65);

  // Достижения
  setDelays(".recognition-grid article", 100);

  // Контактный блок
  setDelays(
    ".best-project__content, .best-project__action",
    130
  );


  // ==========================================
  // 3. OBSERVER
  // ==========================================

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {

      entries.forEach(entry => {

        if (!entry.isIntersecting) return;

        entry.target.classList.add("about-in-view");

        // Не наблюдаем за элементом после появления
        currentObserver.unobserve(entry.target);

      });

    },
    {
      threshold: 0.08,
      rootMargin: "0px 0px 40px 0px"
    }
  );

  // Сначала включаем управление анимациями,
  // затем запускаем наблюдатель
  document.documentElement.classList.add(
    "about-motion-ready"
  );

  elements.forEach(element => {
    observer.observe(element);
  });


  // ==========================================
  // 4. ПОВТОР АНИМАЦИЙ ПО КНОПКЕ НАВЕРХ
  // ==========================================

  const topButton = document.querySelector(
    ".back-top"
  );

  let replayRequested = false;

  function replayAnimations() {

    replayRequested = false;

    observer.disconnect();

    elements.forEach(element => {
      element.classList.remove("about-in-view");
    });

    // Даём браузеру применить начальные состояния
    requestAnimationFrame(() => {

      elements.forEach(element => {
        observer.observe(element);
      });

    });
  }

  if (topButton) {

    topButton.addEventListener("click", () => {

      replayRequested = true;

      // Если пользователь уже наверху
      if (window.scrollY <= 3) {
        replayAnimations();
      }

    });

    window.addEventListener("scroll", () => {

      if (
        replayRequested &&
        window.scrollY <= 3
      ) {
        replayAnimations();
      }

    }, { passive: true });

  }

});
