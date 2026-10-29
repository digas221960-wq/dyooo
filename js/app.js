/* =========================================================
   Dyo — LÓGICA DO SITE
   Feito por: MRJGodzilla
   Ano: 2026

   Esse arquivo monta as seções a partir do conteúdo que
   está em js/content.js e cuida do menu, filtros,
   carrossel e animações.

   Pra trocar textos, vídeos ou links, edite o
   js/content.js — você não precisa mexer aqui.
   ========================================================= */

(function () {
  "use strict";

  const content = window.SITE_CONTENT || {};
  const projects = content.projects || [];
  const testimonials = content.testimonials || [];
  const contactLinks = content.contactLinks || {};

  /* ---------- Funções auxiliares ---------- */
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) =>
    Array.from(scope.querySelectorAll(selector));

  // Cria um elemento HTML já com classe e texto
  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  // Pega as iniciais do nome (ex: "João Silva" vira "JS")
  function getInitials(name) {
    if (!name) return "?";
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  }

  // Imagens locais passam pelo otimizador da Netlify (menores e em WebP).
  // Abrindo o index.html direto do computador, usa o arquivo original.
  const useImageCdn = /^https?:$/.test(window.location.protocol);
  function imageUrl(path, width) {
    if (!useImageCdn || /^(https?:)?\/\//.test(path)) return path;
    const url = "/" + path.replace(/^\.?\//, "");
    return `/.netlify/images?url=${encodeURIComponent(url)}&w=${width}&fm=webp`;
  }

  /* ---------- Imagens: se o otimizador falhar, usa o arquivo original ---------- */
  function initImageFallbacks() {
    qsa("img[data-fallback]").forEach((img) => {
      const useFallback = () => {
        if (img.dataset.fallbackUsed) return;
        img.dataset.fallbackUsed = "true";
        img.removeAttribute("srcset");
        img.src = img.dataset.fallback;
      };
      if (!useImageCdn) return useFallback();
      img.addEventListener("error", useFallback);
      if (img.complete && img.naturalWidth === 0) useFallback();
    });
  }

  /* ---------- Navegação (header + menu do celular) ---------- */
  function initNavigation() {
    const header = qs("#site-header");
    const toggle = qs("#nav-toggle");
    const nav = qs("#site-nav");

    // Escurece o header quando rola a página
    if (header) {
      const onScroll = () => {
        header.classList.toggle("is-scrolled", window.scrollY > 10);
      };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    if (!toggle || !nav) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };

    toggle.addEventListener("click", () => {
      setOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    // Fecha o menu ao clicar em um link
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setOpen(false);
    });

    // Fecha com a tecla ESC
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
      if (event.key === "Tab" && nav.classList.contains("is-open")) {
        const controls = [...qsa("a", nav), toggle];
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    // Fecha se a tela aumentar (virar computador)
    window.addEventListener("resize", () => {
      if (window.innerWidth > 1280) setOpen(false);
    });
  }

  /* ---------- Animações de entrada (reveal) ---------- */
  function initRevealAnimations() {
    const elements = qsa(".reveal");
    if (!elements.length) return;

    // Navegadores antigos: mostra tudo
    if (!("IntersectionObserver" in window)) {
      elements.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* ---------- Informações opcionais escritas pelo dono do site ---------- */
  // Campos vazios não criam títulos, promessas ou espaços em branco.
  function hasText(value) {
    return typeof value === "string" && value.trim().length > 0;
  }

  function createDetailList(items) {
    if (!Array.isArray(items)) return null;
    const valid = items.filter((item) => item && hasText(item.label) && hasText(item.text));
    if (!valid.length) return null;
    const list = createEl("dl", "detail-list");
    valid.forEach((item) => {
      const row = createEl("div", "detail-row");
      row.appendChild(createEl("dt", null, item.label));
      row.appendChild(createEl("dd", null, item.text));
      list.appendChild(row);
    });
    return list;
  }

  function appendDetails(container, items) {
    const list = createDetailList(items);
    if (list) container.appendChild(list);
  }

  function initProfileDetails() {
    const container = qs("#profile-details");
    if (!container) return;
    appendDetails(container, content.profileDetails);
    container.hidden = !container.childElementCount;
  }

  // As demonstrações usam o mesmo player leve e sem reprodução automática.
  function createVideoFigure(clip) {
    if (!clip || !hasText(clip.caption) || !/^[\w-]{11}$/.test(clip.youtubeId || "")) return null;
    const figure = createEl("figure", "project-evidence-clip");
    if (clip.format === "vertical") figure.classList.add("is-vertical");
    const media = createEl("div", "project-media");
    const wrapper = createEl("div", "video-embed");
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${clip.youtubeId}?rel=0&modestbranding=1`;
    iframe.title = clip.caption;
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    wrapper.appendChild(iframe);
    media.appendChild(wrapper);
    figure.appendChild(media);
    figure.appendChild(createEl("figcaption", null, clip.caption));
    return figure;
  }

  function appendProjectEvidence(article, project) {
    const evidence = createEl("div", "project-evidence");
    if (Array.isArray(project.demonstrations)) {
      project.demonstrations.forEach((clip) => {
        const figure = createVideoFigure(clip);
        if (figure) evidence.appendChild(figure);
      });
    }
    const comparison = project.comparison;
    // Só publica o par completo, com legendas e autorização explícita.
    if (comparison && comparison.authorized === true) {
      const before = createVideoFigure(comparison.before);
      const after = createVideoFigure(comparison.after);
      if (before && after) {
        const pair = createEl("div", "project-comparison");
        pair.appendChild(before);
        pair.appendChild(after);
        evidence.appendChild(pair);
      }
    }
    if (evidence.childElementCount) article.appendChild(evidence);
  }

  /* ---------- Portfólio ---------- */
  function renderProjectPreview(project, media) {
    const thumbnail = document.createElement("img");
    thumbnail.src = `https://i.ytimg.com/vi/${encodeURIComponent(project.youtubeId)}/hqdefault.jpg`;
    thumbnail.alt = `Prévia do vídeo ${project.title}`;
    thumbnail.loading = "lazy";
    thumbnail.decoding = "async";
    media.replaceChildren(thumbnail);

    const playButton = createEl("button", "video-play-button");
    playButton.type = "button";
    playButton.setAttribute("aria-label", `Reproduzir ${project.title}`);
    playButton.innerHTML = '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m9 6 10 6-10 6z" /></svg>';
    playButton.addEventListener("click", () => createProjectPlayer(project));
    media.appendChild(playButton);
  }

  function restoreProjectPreview(card) {
    if (!card || !qs("iframe", card)) return;
    renderProjectPreview({
      youtubeId: card.dataset.youtubeId,
      title: qs(".project-title", card).textContent,
    }, qs(".project-media", card));
  }

  function createProjectPlayer(project) {
    const dialog = qs("#video-dialog");
    const player = qs("#video-dialog-player", dialog);
    const wrapper = createEl("div", "video-embed");
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${project.youtubeId}?rel=0&autoplay=1&playsinline=1`;
    iframe.title = project.title;
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    wrapper.appendChild(iframe);
    player.replaceChildren(wrapper);
    dialog.showModal();
  }

  function initVideoDialog() {
    const dialog = qs("#video-dialog");
    if (!dialog) return;

    const player = qs("#video-dialog-player", dialog);
    const closeButton = qs(".video-dialog-close", dialog);
    if (!player || !closeButton) return;

    closeButton.addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => player.replaceChildren());
  }

  function createProjectCard(project) {
    const article = createEl("article", "project-card reveal");
    if (project.format) article.classList.add(`format-${project.format}`);

    const media = createEl("div", "project-media");

    if (project.youtubeId) {
      article.dataset.youtubeId = project.youtubeId;
      renderProjectPreview(project, media);
    } else if (project.poster) {
      // Se algum dia quiser usar imagem no lugar do vídeo
      const img = document.createElement("img");
      img.src = imageUrl(project.poster, 900);
      img.alt = `Prévia do projeto ${project.title}`;
      img.loading = "lazy";
      img.decoding = "async";
      media.appendChild(img);
    }

    const body = createEl("div", "project-body");
    if (project.category) {
      const tagClass = getProjectType(project) === "video" ? "tag" : "tag tag-yellow";
      body.appendChild(createEl("span", tagClass, project.category));
    }
    body.appendChild(createEl("h3", "project-title", project.title));
    if (project.description) {
      body.appendChild(createEl("p", "project-description", project.description));
    }

    // A autoria nunca é deduzida: aparece somente com o texto informado.
    if (hasText(project.authorship)) {
      body.appendChild(createEl("p", "project-authorship", project.authorship));
    }
    appendDetails(body, project.details);
    if (Array.isArray(project.techniques)) {
      const techniques = project.techniques.filter(hasText);
      if (techniques.length) {
        const list = createEl("ul", "project-techniques");
        techniques.forEach((text) => list.appendChild(createEl("li", null, text)));
        body.appendChild(list);
      }
    }

    article.appendChild(media);
    article.appendChild(body);
    appendProjectEvidence(article, project);
    return article;
  }

  // Descobre a categoria do projeto (se "type" não for informado,
  // usa o formato: vertical = Short, horizontal = Vídeo)
  function getProjectType(project) {
    if (project.type) return project.type;
    return project.format === "vertical" ? "short" : "video";
  }

  function initPortfolio() {
    const featuredContainer = qs("#portfolio-featured");
    if (!featuredContainer) return;

    const priorityOf = (project) => Number.isFinite(project.priority) ? project.priority : 0;
    const orderedProjects = [...projects].sort((a, b) => priorityOf(b) - priorityOf(a));
    const cards = orderedProjects.map((project) => {
      const type = getProjectType(project);
      const card = createProjectCard(project);
      card.dataset.type = type;
      featuredContainer.appendChild(card);
      return card;
    });

    initPortfolioFilters(cards, featuredContainer);
  }

  /* ---------- Filtros do portfólio ---------- */
  function initPortfolioFilters(cards, featuredContainer) {
    const buttons = qsa("#portfolio-filters .filter-btn");
    const emptyMsg = qs("#portfolio-empty");
    const prevBtn = qs('[data-portfolio-carousel="prev"]');
    const nextBtn = qs('[data-portfolio-carousel="next"]');
    if (!buttons.length) return;

    let activeIndex = 0;
    let visibleCards = [];

    const updateCarousel = () => {
      if (!visibleCards.length) {
        featuredContainer.style.height = "";
        if (prevBtn) prevBtn.hidden = true;
        if (nextBtn) nextBtn.hidden = true;
        return;
      }

      activeIndex = (activeIndex + visibleCards.length) % visibleCards.length;
      const previousIndex = (activeIndex - 1 + visibleCards.length) % visibleCards.length;
      const nextIndex = (activeIndex + 1) % visibleCards.length;
      visibleCards.forEach((card, index) => {
        const active = index === activeIndex;
        card.classList.toggle("is-active", active);
        card.classList.toggle("is-prev", visibleCards.length > 2 && index === previousIndex);
        card.classList.toggle("is-next", index === nextIndex && !active);
        card.setAttribute("aria-hidden", active ? "false" : "true");
        card.inert = !active;
      });

      const activeCard = visibleCards[activeIndex];
      featuredContainer.style.height = `${activeCard.offsetHeight}px`;
      const hasNeighbors = visibleCards.length > 1;
      if (prevBtn) prevBtn.hidden = !hasNeighbors;
      if (nextBtn) nextBtn.hidden = !hasNeighbors;
    };

    const move = (step) => {
      if (visibleCards.length < 2) return;
      restoreProjectPreview(visibleCards[activeIndex]);
      activeIndex += step;
      updateCarousel();
    };

    if (prevBtn) prevBtn.addEventListener("click", () => move(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => move(1));

    featuredContainer.closest(".portfolio-carousel").addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") move(-1);
      if (event.key === "ArrowRight") move(1);
    });

    let touchStartX = 0;
    featuredContainer.addEventListener("touchstart", (event) => {
      touchStartX = event.touches[0].clientX;
    }, { passive: true });
    featuredContainer.addEventListener("touchend", (event) => {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1);
    }, { passive: true });

    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(updateCarousel, 150);
    });

    const applyFilter = (filter) => {
      if (visibleCards.length) restoreProjectPreview(visibleCards[activeIndex]);
      buttons.forEach((btn) => {
        const active = btn.dataset.filter === filter;
        btn.classList.toggle("is-active", active);
        btn.setAttribute("aria-selected", active ? "true" : "false");
      });

      let visibleCount = 0;
      cards.forEach((card) => {
        const show = card.dataset.type === filter;
        card.hidden = !show;
        card.inert = !show;
        card.setAttribute("aria-hidden", show ? "false" : "true");
        if (!show) card.classList.remove("is-active", "is-prev", "is-next");
        if (show) {
          visibleCount++;
          card.classList.add("is-visible");
        }
      });

      visibleCards = cards.filter((card) => card.dataset.type === filter);
      activeIndex = 0;
      updateCarousel();
      if (emptyMsg) emptyMsg.hidden = visibleCount > 0;
    };

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => applyFilter(btn.dataset.filter));
    });

    const initial = qs("#portfolio-filters .filter-btn.is-active") || buttons[0];
    applyFilter(initial.dataset.filter);
  }

  /* ---------- Depoimentos (carrossel) ---------- */
  function createTestimonialCard(testimonial) {
    const article = createEl("article", "testimonial-card");

    article.appendChild(createEl("p", "testimonial-quote", testimonial.quote));

    const author = createEl("div", "testimonial-author");
    const avatar = createEl("div", "testimonial-avatar");

    if (testimonial.avatar) {
      const img = document.createElement("img");
      img.src = imageUrl(testimonial.avatar, 120);
      img.alt = `Foto de ${testimonial.name}`;
      img.width = 48;
      img.height = 48;
      img.loading = "lazy";
      img.decoding = "async";
      // Se a foto falhar, tenta o arquivo original e depois as iniciais
      img.onerror = () => {
        if (img.src.indexOf("/.netlify/images") !== -1) {
          img.src = testimonial.avatar;
          return;
        }
        img.remove();
        avatar.textContent = getInitials(testimonial.name);
      };
      avatar.appendChild(img);
    } else {
      avatar.textContent = getInitials(testimonial.name);
    }

    const info = createEl("div", "testimonial-author-info");
    info.appendChild(createEl("span", "testimonial-name", testimonial.name));
    if (testimonial.handle) {
      info.appendChild(createEl("span", "testimonial-handle", testimonial.handle));
    }

    author.appendChild(avatar);
    author.appendChild(info);
    article.appendChild(author);

    return article;
  }

  function initTestimonials() {
    const track = qs("#testimonials-track");
    const controls = qs("#testimonials-controls");
    const prevBtn = qs('[data-carousel="prev"]');
    const nextBtn = qs('[data-carousel="next"]');
    const dotsContainer = qs("#carousel-dots");

    if (!track) return;

    testimonials.forEach((testimonial) => {
      track.appendChild(createTestimonialCard(testimonial));
    });

    if (!testimonials.length) {
      if (controls) controls.hidden = true;
      return;
    }

    let index = 0;

    // Quantos cards cabem na tela
    function getPerView() {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getMaxIndex() {
      return Math.max(0, testimonials.length - getPerView());
    }

    // Cria as bolinhas de navegação
    function renderDots() {
      const max = getMaxIndex();
      // Se todos os depoimentos cabem na tela, não precisa de controles
      track.classList.toggle("is-static", max === 0);
      if (controls) controls.hidden = max === 0;

      if (!dotsContainer) return;
      dotsContainer.innerHTML = "";
      for (let i = 0; i <= max; i++) {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel-dot";
        dot.setAttribute("aria-label", `Ir para depoimento ${i + 1}`);
        dot.setAttribute("role", "tab");
        dot.addEventListener("click", () => {
          index = i;
          update();
        });
        dotsContainer.appendChild(dot);
      }
    }

    // Move o carrossel pra posição certa
    function update() {
      const max = getMaxIndex();
      index = Math.min(Math.max(index, 0), max);

      const card = track.querySelector(".testimonial-card");
      if (!card) return;

      const cardWidth = card.getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).gap) || 20;
      track.style.transform = index ? `translateX(-${index * (cardWidth + gap)}px)` : "";

      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index >= max;

      if (dotsContainer) {
        qsa(".carousel-dot", dotsContainer).forEach((dot, i) => {
          const active = i === index;
          dot.classList.toggle("is-active", active);
          dot.setAttribute("aria-selected", active ? "true" : "false");
        });
      }
    }

    const move = (step) => {
      index += step;
      update();
    };

    if (prevBtn) prevBtn.addEventListener("click", () => move(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => move(1));

    // Navegação por teclado (acessibilidade)
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") move(-1);
      else if (e.key === "ArrowRight") move(1);
    });

    // Recalcula ao redimensionar a tela
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        renderDots();
        update();
      }, 150);
    });

    // Arrastar com o dedo no celular
    let touchStartX = 0;
    track.addEventListener(
      "touchstart",
      (event) => {
        touchStartX = event.touches[0].clientX;
      },
      { passive: true }
    );
    track.addEventListener(
      "touchend",
      (event) => {
        const delta = event.changedTouches[0].clientX - touchStartX;
        if (Math.abs(delta) > 40) move(delta < 0 ? 1 : -1);
      },
      { passive: true }
    );

    renderDots();
    update();
  }

  /* ---------- Contato ---------- */
  function initContact() {
    qsa("[data-contact]").forEach((el) => {
      const key = el.getAttribute("data-contact");
      const link = contactLinks[key];
      if (!link) return;

      el.setAttribute("href", link);

      // Abre em nova aba (menos o botão principal)
      if (key !== "primary") {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      }
    });
  }

  /* ---------- Ano no rodapé ---------- */
  function initFooter() {
    const yearEl = qs("#footer-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Inicia tudo ---------- */
  function init() {
    initImageFallbacks();
    initNavigation();
    initPortfolio();
    initVideoDialog();
    initProfileDetails();
    initTestimonials();
    initContact();
    initFooter();
    initRevealAnimations();
  }

  // Espera o HTML carregar antes de rodar
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
