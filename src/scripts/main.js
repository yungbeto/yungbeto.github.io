document.addEventListener('DOMContentLoaded', function () {
  initHeroAnimation();
  initRandomCaseStudyLink();
  initPortfolioWindows();
  Promise.all([
    loadProjectCards(),
    loadWorkCases(),
    loadJobs(),
    loadMarquee(),
  ]).then(() => {
    initSectionLabelObserver();
    initLightbox();
  });
});

function initRandomCaseStudyLink() {
  const link = document.querySelector('.toc-link--random');
  if (!link) return;
  const cases = ['/olympus', '/revel', '/good-song-club', '/cavnue'];
  link.addEventListener('click', function () {
    this.href = cases[Math.floor(Math.random() * cases.length)];
  });
}

function initHeroAnimation() {
  const hero = document.querySelector('.hero-text');
  if (!hero) return;

  const charSpans = [];
  const nodes = Array.from(hero.childNodes);
  hero.innerHTML = '';

  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      // Normalize whitespace from HTML source formatting
      const text = node.textContent.replace(/\s+/g, ' ');
      splitTextIntoChars(text, hero, charSpans);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Preserve the original element (keeps event listeners) but replace its text with char spans
      const text = node.textContent;
      node.innerHTML = '';
      splitTextIntoChars(text, node, charSpans);
      hero.appendChild(node);
    }
  });

  startScramble(charSpans, () => {
    const tocItems = document.querySelectorAll(
      '.toc .toc-label, .toc .toc-link',
    );
    tocItems.forEach((el, i) => {
      setTimeout(() => el.classList.add('in-view'), i * 80);
    });
  });
}

function splitTextIntoChars(text, container, charSpans) {
  const words = text.split(' ');
  words.forEach((word, wi) => {
    if (!word) return;

    // Wrap each word in an inline-block span so line breaks only happen between words
    const wordSpan = document.createElement('span');
    wordSpan.className = 'hero-word';

    for (const char of word) {
      const outer = document.createElement('span');
      outer.className = 'hero-char';

      const ghost = document.createElement('span');
      ghost.className = 'hero-char-ghost';
      ghost.textContent = char;

      const real = document.createElement('span');
      real.className = 'hero-char-real';
      real.textContent = char;

      const block = document.createElement('span');
      block.className = 'hero-char-block';
      block.textContent = '█';

      outer.appendChild(ghost);
      outer.appendChild(real);
      outer.appendChild(block);
      wordSpan.appendChild(outer);
      charSpans.push({ outer, block });
    }

    container.appendChild(wordSpan);
    if (wi < words.length - 1) {
      container.appendChild(document.createTextNode(' '));
    }
  });
}

function startScramble(
  charSpans,
  onComplete,
  { startDelay = 150, staggerMs = 12 } = {},
) {
  const BLOCKS = ['█', '▓', '▒', '░', '▒', '▓'];
  const CYCLE_MS = 40;
  const START_DELAY = startDelay;
  const STAGGER_MS = staggerMs;

  let frame = 0;
  const timer = setInterval(() => {
    frame++;
    charSpans.forEach(({ outer, block }) => {
      if (!outer.classList.contains('resolved')) {
        block.textContent = BLOCKS[frame % BLOCKS.length];
      }
    });
  }, CYCLE_MS);

  charSpans.forEach(({ outer }, i) => {
    setTimeout(
      () => outer.classList.add('resolved'),
      START_DELAY + i * STAGGER_MS,
    );
  });

  const endTime = START_DELAY + charSpans.length * STAGGER_MS + 400;

  setTimeout(() => {
    clearInterval(timer);
    onComplete?.();
  }, endTime);
}

function initSectionLabelObserver() {
  const labels = document.querySelectorAll('.section-label');
  if (!labels.length || !('IntersectionObserver' in window)) {
    labels.forEach((el) => el.classList.add('in-view'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );
  labels.forEach((el) => observer.observe(el));
}

async function loadProjectCards() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  // Projects Info Box — first card in the grid
  // const infoBox = document.createElement('div');
  // infoBox.className = 'projects-info-box';
  // infoBox.innerHTML = `
  //   <i class="ph ph-code projects-info-icon"></i>
  //   <p>Here is a selection of applications that I've conceived, designed, and developed. <br /><br/>These projects range from personal utilities, small social networks, and solutions to problems I've encountered in the wild.</p>
  // `;
  // grid.appendChild(infoBox);

  try {
    const res = await fetch('src/projects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const projects = await res.json();

    const cardColors = ['#b3b7ff', '#db98ff', '#d0f583', '#ff99ff', '#ffbb68'];

    projects.forEach((project) => {
      const media = project.media?.[0];
      if (!media) return;
      const overlayColor =
        cardColors[Math.floor(Math.random() * cardColors.length)];

      let mediaHtml;
      if (media.type === 'video') {
        mediaHtml = `<video class="projects-card-media" autoplay loop muted playsinline preload="auto">
          <source src="${media.src}" type="video/mp4">
        </video>`;
      } else {
        mediaHtml = `<img class="projects-card-media" src="${media.src}" alt="${project.name}">`;
      }

      const chipsHtml = project.skills
        ? project.skills
            .split(',')
            .map((s) => `<span class="projects-card-chip">${s.trim()}</span>`)
            .join('')
        : '';

      const badgeHtml = project.featureButton
        ? `<a class="projects-card-press-badge" href="${project.featureButton.url}" target="_blank" rel="noopener noreferrer" aria-label="${project.featureButton.text}">
            <span class="projects-card-press-badge-kicker">Featured in</span>
            <span class="projects-card-press-badge-main">DJ Mag!</span>
          </a>`
        : '';

      const card = document.createElement('div');
      card.className = 'projects-card';

      card.innerHTML = `
        ${mediaHtml}
        <div class="projects-card-overlay" style="background: ${overlayColor}"></div>
        <div class="projects-card-label">
          <p class="projects-card-title">${project.name}</p>
          <p class="projects-card-year">${project.year || ''}</p>
        </div>
        ${badgeHtml}
        <button class="projects-card-close" aria-label="Close">
          <i class="ph ph-x"></i>
        </button>
        <div class="projects-card-details">
          <p class="projects-card-desc">${project.description}</p>
          ${chipsHtml ? `<div class="projects-card-chips">${chipsHtml}</div>` : ''}
        </div>
        <a class="projects-card-visit" href="${project.url}" target="_blank" rel="noopener noreferrer">
          Visit <i class="ph ph-arrow-up-right"></i>
        </a>
      `;

      card.addEventListener('click', (e) => {
        if (e.target.closest('a, button')) return;
        card.classList.toggle('is-active');
      });

      const badge = card.querySelector('.projects-card-press-badge');
      if (badge) badge.addEventListener('click', (e) => e.stopPropagation());

      card
        .querySelector('.projects-card-close')
        .addEventListener('click', () => {
          card.classList.remove('is-active');
        });

      card
        .querySelector('.projects-card-visit')
        .addEventListener('click', (e) => {
          e.stopPropagation();
        });

      grid.appendChild(card);
    });

    // Staggered scroll-triggered enter animation
    document.body.classList.add('js-ready');
    grid.querySelectorAll('.projects-card').forEach((card, i) => {
      card.style.transitionDuration = '0.5s';
      card.style.transitionDelay = i * 90 + 'ms';
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            card.classList.add('is-visible');
            obs.disconnect();
            // Restore original hover-speed transition once entry completes
            setTimeout(
              () => {
                card.style.transitionDuration = '';
                card.style.transitionDelay = '';
              },
              500 + i * 90,
            );
          }
        },
        { threshold: 0.1 },
      );
      obs.observe(card);
    });
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
}

function openJobEntry(company) {
  const list = document.getElementById('jobs-list');
  if (!list) return;
  const entry = list.querySelector(`[data-company="${company}"]`);
  if (!entry) return;
  list
    .querySelectorAll('.job-entry')
    .forEach((e) => e.classList.remove('is-open'));
  entry.classList.add('is-open');
  entry.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function loadWorkCases() {
  const container = document.getElementById('work-cases');
  if (!container) return;

  try {
    const res = await fetch('src/work-cases.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const cases = await res.json();

    cases.forEach((c) => {
      const block = document.createElement('article');
      block.className = 'work-case';
      block.id = c.id;

      const seeMoreHtml = c.showJobLink
        ? `<button class="work-case-cta work-case-see-more" data-job-company="${c.company.toLowerCase()}" type="button">
            See more...
            <i class="ph ph-arrow-down"></i>
          </button>`
        : '';

      const visitSiteHtml = c.visitSiteUrl
        ? `<a class="work-case-cta work-case-visit-site" href="${c.visitSiteUrl}" target="_blank" rel="noopener noreferrer">
            Visit live site
            <i class="ph ph-arrow-up-right"></i>
          </a>`
        : '';

      const ctaHtml = c.caseStudy_url
        ? `<div class="work-case-cta-container">
            <a class="work-case-cta" href="${c.caseStudy_url}">
              View Case Study
              <i class="ph ph-arrow-right"></i>
            </a>
            ${seeMoreHtml}
            ${visitSiteHtml}
          </div>`
        : '';

      const imageInner = c.caseStudy_url
        ? `<a href="${c.caseStudy_url}" class="work-case-image-link" aria-label="View ${c.company} case study"><img src="${c.caseStudyImage}" alt="${c.company} case study"></a>`
        : `<img src="${c.caseStudyImage}" alt="${c.company} case study">`;

      block.innerHTML = `
        <div class="work-case-image">
          ${imageInner}
        </div>
        <div class="work-case-copy">
          <p class="work-case-title">${c.title}</p>
          <p class="work-case-blurb">${c.blurb}</p>
          ${ctaHtml}
        </div>
      `;

      container.appendChild(block);

      const seeMoreBtn = block.querySelector('.work-case-see-more');
      if (seeMoreBtn) {
        seeMoreBtn.addEventListener('click', function () {
          openJobEntry(this.dataset.jobCompany);
        });
      }
    });

    // Staggered enter animation — JS adds is-visible, CSS drives the internal stagger
    document.body.classList.add('js-ready');
    container.querySelectorAll('.work-case').forEach((workCase) => {
      const obs = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            workCase.classList.add('is-visible');
            obs.disconnect();
          }
        },
        { threshold: 0.05, rootMargin: '0px 0px -40px 0px' },
      );
      obs.observe(workCase);
    });
  } catch (err) {
    console.error('Failed to load work cases:', err);
  }
}

function initWorkCasePills() {
  const cases = document.querySelectorAll('.work-case');
  if (!cases.length) return;

  // Global state map — only the first eligible case shows its pill at any time
  const state = new Map();

  function updateAllPills() {
    let firstEligible = null;
    cases.forEach((workCase) => {
      const s = state.get(workCase);
      if (s && s.caseInView && !s.metaInView && !firstEligible) {
        firstEligible = workCase;
      }
    });
    cases.forEach((workCase) => {
      const isActive = workCase === firstEligible;
      const pill = workCase.querySelector('.work-case-pill');
      if (pill) pill.classList.toggle('is-visible', isActive);
    });
  }

  cases.forEach((workCase) => {
    const meta = workCase.querySelector('.work-case-meta');
    if (!meta) return;

    state.set(workCase, { caseInView: false, metaInView: false });

    new IntersectionObserver(
      (entries) => {
        state.get(workCase).caseInView = entries[0].isIntersecting;
        updateAllPills();
      },
      { threshold: 0, rootMargin: '-96px 0px 0px 0px' },
    ).observe(workCase);

    new IntersectionObserver(
      (entries) => {
        state.get(workCase).metaInView = entries[0].isIntersecting;
        updateAllPills();
      },
      { threshold: 0 },
    ).observe(meta);
  });
}

function initCarousels() {
  const GAP = 12; // must match CSS gap

  document.querySelectorAll('.work-case-carousel').forEach((carousel) => {
    const track = carousel.querySelector('.work-case-media');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');

    // Collect real items before any cloning
    const realItems = [...track.querySelectorAll('.work-case-media-item')];
    const N = realItems.length;

    if (!track || N <= 1) {
      prevBtn?.remove();
      nextBtn?.remove();
      if (N === 1) realItems[0].classList.add('is-active');
      return;
    }

    // ── Infinite loop: prepend clone of last, append clone of first ───────
    // DOM order: [headClone | real0 … realN-1 | tailClone]
    // domIndex of realItem[i] = i + 1
    const headClone = realItems[N - 1].cloneNode(true);
    const tailClone = realItems[0].cloneNode(true);
    headClone.setAttribute('aria-hidden', 'true');
    tailClone.setAttribute('aria-hidden', 'true');
    track.prepend(headClone);
    track.appendChild(tailClone);

    const allDomItems = [...track.querySelectorAll('.work-case-media-item')];

    let current = 0; // real index 0..N-1
    let autoTimer = null;
    let jumping = false;

    function stride() {
      return (allDomItems[1]?.offsetWidth ?? 0) + GAP;
    }

    // Mark the active (centred) item and its corresponding clone bright;
    // everything else dims.
    function updateActive() {
      allDomItems.forEach((item, i) => {
        const isActive =
          i === current + 1 || // real item
          (current === 0 && i === N + 1) || // tailClone mirrors first
          (current === N - 1 && i === 0); // headClone mirrors last
        item.classList.toggle('is-active', isActive);
      });
    }

    function goTo(realIndex) {
      // Wrap to valid real index
      current = ((realIndex % N) + N) % N;

      // Choose which DOM index to animate toward
      let domIdx;
      if (realIndex < 0)
        domIdx = 0; // scroll through headClone
      else if (realIndex >= N)
        domIdx = N + 1; // scroll through tailClone
      else domIdx = current + 1;

      track.scrollTo({ left: domIdx * stride(), behavior: 'smooth' });
      updateActive();
    }

    // After each scroll settles, silently jump from clone back to real item
    let scrollSettleTimer;
    track.addEventListener('scroll', () => {
      if (jumping) return;
      clearTimeout(scrollSettleTimer);
      scrollSettleTimer = setTimeout(() => {
        const s = stride();
        if (!s) return;
        const pos = Math.round(track.scrollLeft / s);

        if (pos === 0) {
          // Landed on headClone → jump to real last
          jumping = true;
          track.scrollTo({ left: N * s, behavior: 'instant' });
          current = N - 1;
          requestAnimationFrame(() => {
            jumping = false;
          });
        } else if (pos === N + 1) {
          // Landed on tailClone → jump to real first
          jumping = true;
          track.scrollTo({ left: s, behavior: 'instant' });
          current = 0;
          requestAnimationFrame(() => {
            jumping = false;
          });
        } else {
          current = pos - 1;
        }
        updateActive();
      }, 80);
    });

    function startAutoAdvance() {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(current + 1), 6000);
    }

    prevBtn?.addEventListener('click', () => {
      goTo(current - 1);
      startAutoAdvance();
    });
    nextBtn?.addEventListener('click', () => {
      goTo(current + 1);
      startAutoAdvance();
    });

    // Clicking a non-active (flanking) item advances the carousel instead of
    // opening the lightbox. Capture phase intercepts before the lightbox handler.
    allDomItems.forEach((item, i) => {
      item.addEventListener(
        'click',
        (e) => {
          if (
            item.classList.contains('is-active') &&
            item.getAttribute('aria-hidden') !== 'true'
          )
            return;
          e.stopPropagation();
          if (i <= current) goTo(current - 1);
          else goTo(current + 1);
          startAutoAdvance();
        },
        true,
      );
    });

    // Pause auto-advance while hovered
    carousel.addEventListener('mouseenter', () => clearInterval(autoTimer));
    carousel.addEventListener('mouseleave', startAutoAdvance);

    // Never disable carets — carousel always loops
    if (prevBtn) prevBtn.disabled = false;
    if (nextBtn) nextBtn.disabled = false;

    // Start at real item 0 (domIndex 1) without animation
    requestAnimationFrame(() => {
      track.scrollTo({ left: stride(), behavior: 'instant' });
      updateActive();
      startAutoAdvance();
    });
  });
}

function buildJobGalleryHtml(media, company) {
  if (!media?.length) return '';

  const items = media
    .map((item) => {
      if (item.type === 'video') {
        return `<div class="job-gallery-item" role="button" tabindex="0" aria-label="${company} work sample">
          <video src="${item.src}" autoplay loop muted playsinline preload="metadata"></video>
        </div>`;
      }

      const src = item.srcMobile || item.src;
      return `<div class="job-gallery-item" role="button" tabindex="0" aria-label="${company} work sample">
        <img src="${src}" alt="${company} work sample" loading="lazy">
      </div>`;
    })
    .join('');

  return `
    <div class="job-gallery">
      <div class="job-gallery-track">${items}</div>
    </div>
  `;
}

async function loadJobs() {
  const list = document.getElementById('jobs-list');
  if (!list) return;

  try {
    const [jobsRes, casesRes] = await Promise.all([
      fetch('src/jobs.json'),
      fetch('src/work-cases.json'),
    ]);
    if (!jobsRes.ok) throw new Error(`HTTP ${jobsRes.status}`);
    const jobs = await jobsRes.json();

    const mediaByCompany = {};
    if (casesRes.ok) {
      const cases = await casesRes.json();
      cases.forEach((workCase) => {
        if (workCase.media?.length) {
          mediaByCompany[workCase.company.toLowerCase()] = workCase.media;
        }
      });
    }

    jobs.forEach((job) => {
      const media =
        job.images ||
        mediaByCompany[job.Company.replace(/\s*\(.*\)$/, '').toLowerCase()];
      const galleryHtml = buildJobGalleryHtml(media, job.Company);

      const li = document.createElement('li');
      li.className = 'job-entry';
      li.dataset.company = job.Company.toLowerCase();
      li.innerHTML = `
        <div class="job-head">
          <div class="job-info-box">
            <div class="job-logo">
              <img src="${job.CompanyIcon}" alt="${job.Company} logo">
            </div>
            <div class="job-info">
              <p class="job-company-name">${job.Company} • ${job.DateRange}</p>
              <p class="job-role">${job.JobRole}</p>
            </div>
          </div>
          <div class="job-caret">
            <i class="ph ph-caret-down"></i>
          </div>
        </div>
        <div class="job-description">
          <div class="job-description-panel">
            <div class="job-description-inner">${job.JobDescription}</div>
            ${galleryHtml}
          </div>
        </div>
      `;

      li.querySelector('.job-head').addEventListener('click', function () {
        const isOpen = li.classList.contains('is-open');
        list
          .querySelectorAll('.job-entry')
          .forEach((e) => e.classList.remove('is-open'));
        if (!isOpen) li.classList.add('is-open');
      });

      list.appendChild(li);
    });
  } catch (err) {
    console.error('Failed to load jobs:', err);
  }
}

async function loadMarquee() {
  const inner = document.getElementById('marquee-inner');
  if (!inner) return;

  try {
    const res = await fetch('src/marquee.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    function buildSet() {
      const frag = document.createDocumentFragment();
      data.strings.forEach((text, i) => {
        const item = document.createElement('span');
        item.className = 'marquee-item';
        item.textContent = text;
        frag.appendChild(item);

        const icons = data.separators[i % data.separators.length];
        const sep = document.createElement('span');
        sep.className = 'marquee-separator';
        icons.forEach((icon) => {
          const el = document.createElement('i');
          el.className = `ph ${icon}`;
          sep.appendChild(el);
        });
        frag.appendChild(sep);
      });
      return frag;
    }

    // Two identical sets for seamless loop (animation moves -50%)
    inner.appendChild(buildSet());
    inner.appendChild(buildSet());
  } catch (err) {
    console.error('Failed to load marquee:', err);
  }
}

function initPortfolioWindows() {
  if (window.innerWidth <= 768) return;

  const WINDOWS = [
    {
      title: 'Cavnue Mobile Dashboard',
      icon: 'ph-taxi',
      src: 'src/img/windowImg/Window%20Img%20%2001.png',
      width: 280,
      imgHeight: 400,
      linkUrl: '/cavnue',
    },
    {
      title: 'Revel Dispatch App',
      icon: 'ph-map-pin-simple',
      src: 'src/img/windowImg/Window%20Img%20%2002.png',
      width: 400,
      imgHeight: 284,
      linkUrl: 'job:revel',
    },
    {
      title: 'Olympus AI Search',
      icon: 'ph-sparkle',
      src: 'src/img/windowImg/Window%20Img%20%2003.png',
      width: 400,
      imgHeight: 222,
      linkUrl: '/olympus',
    },
    {
      title: 'Revel Passenger App',
      icon: 'ph-devices',
      src: 'src/img/windowImg/Window%20Img%20%2004.png',
      width: 280,
      imgHeight: 280,
      linkUrl: '/revel',
    },
    {
      title: 'Revel Driver App',
      icon: 'ph-map-pin',
      src: 'src/img/windowImg/Window%20Img%20%2005.png',
      width: 400,
      imgHeight: 284,
      linkUrl: 'job:revel',
    },
    {
      title: 'Digthis.club Playlist Builder',
      icon: 'ph-music-notes',
      src: 'src/img/windowImg/Window%20Img%20%2006.mp4',
      width: 400,
      imgHeight: 284,
      linkUrl: 'https://digthis.club',
    },
  ];

  // Broad zones covering distinct quadrants — position is fully random within each zone
  const ZONES = [
    { x: [0.0, 0.32], y: [0.08, 0.52] }, // left side
    { x: [0.52, 0.92], y: [0.04, 0.44] }, // top-right
    { x: [0.04, 0.38], y: [0.46, 0.82] }, // bottom-left
    { x: [0.5, 0.9], y: [0.4, 0.82] }, // bottom-right
    { x: [0.2, 0.72], y: [0.08, 0.6] }, // center wildcard
    { x: [0.3, 0.7], y: [0.3, 0.75] }, // mid-screen
  ];

  // Shuffle so the window-to-zone pairing changes every page load
  const shuffledZones = [...ZONES].sort(() => Math.random() - 0.5);

  const stage = document.createElement('div');
  stage.id = 'portfolio-windows';
  document.body.appendChild(stage);

  const about = document.querySelector('.about-section');
  if (about) {
    const obs = new IntersectionObserver(
      (entries) => {
        stage.style.opacity = entries[0].isIntersecting ? '' : '0';
        stage.style.pointerEvents = entries[0].isIntersecting ? '' : 'none';
      },
      { threshold: 0.05 },
    );
    obs.observe(about);
  }

  let zTop = 1;

  function spawnWindow(data, zone, delay, onClose) {
    setTimeout(() => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const winW = Math.round(
        Math.max(200, Math.min(data.width * (vw / 1440), data.width * 1.75)),
      );
      const scale = winW / data.width;
      const winH = 24 + Math.round(data.imgHeight * scale);

      const rx = zone.x[0] + Math.random() * (zone.x[1] - zone.x[0]);
      const ry = zone.y[0] + Math.random() * (zone.y[1] - zone.y[0]);
      const left = Math.max(8, Math.min(vw - winW - 8, rx * vw));
      const top = Math.max(100, Math.min(vh - winH - 8, ry * vh));

      const win = document.createElement('div');
      win.className = 'portfolio-window';
      win.style.cssText = `left:${left}px;top:${top}px;width:${winW}px`;

      const isVideo = data.src.endsWith('.mp4');
      const mediaHtml = isVideo
        ? `<video class="portfolio-window-img" autoplay muted loop playsinline width="${winW}" height="${winH - 24}"><source src="${data.src}" type="video/mp4"></video>`
        : `<img class="portfolio-window-img" src="${data.src}" alt="${data.title}" loading="lazy" width="${winW}" height="${winH - 24}">`;

      const isJobLink = data.linkUrl?.startsWith('job:');
      const jobCompany = isJobLink ? data.linkUrl.slice(4) : null;
      const linkHtml = isJobLink
        ? `<button class="portfolio-window-btn" type="button">See more... <i class="ph ph-arrow-down"></i></button>`
        : `<a class="portfolio-window-btn" href="${data.linkUrl}" ${data.linkUrl.startsWith('/') ? '' : 'target="_blank" rel="noopener noreferrer"'}>View project <i class="ph ph-arrow-right"></i></a>`;

      win.innerHTML = `
        <div class="portfolio-window-header">
          <div class="portfolio-window-title">
            <i class="ph ${data.icon}"></i>
            <span>${data.title}</span>
          </div>
          <button class="portfolio-window-close" type="button" aria-label="Close">
            <i class="ph ph-x"></i>
          </button>
        </div>
        ${mediaHtml}
        ${linkHtml}
      `;

      win
        .querySelector('.portfolio-window-close')
        .addEventListener('click', () => {
          win.classList.remove('is-visible');
          setTimeout(() => {
            win.remove();
            onClose?.();
          }, 400);
        });

      if (isJobLink) {
        win
          .querySelector('.portfolio-window-btn')
          .addEventListener('click', () => {
            openJobEntry(jobCompany);
          });
      }

      win.addEventListener('mousedown', (e) => {
        if (e.target.closest('a, button')) return;
        e.preventDefault();
        win.style.zIndex = ++zTop;
        const ox = e.clientX - win.offsetLeft;
        const oy = e.clientY - win.offsetTop;

        function onMove(e) {
          win.style.left =
            Math.max(
              0,
              Math.min(window.innerWidth - win.offsetWidth, e.clientX - ox),
            ) + 'px';
          win.style.top =
            Math.max(
              0,
              Math.min(window.innerHeight - win.offsetHeight, e.clientY - oy),
            ) + 'px';
        }
        function onUp() {
          document.removeEventListener('mousemove', onMove);
          document.removeEventListener('mouseup', onUp);
        }
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
      });

      stage.appendChild(win);
      requestAnimationFrame(() =>
        requestAnimationFrame(() => win.classList.add('is-visible')),
      );
    }, delay);
  }

  // ── Bulk-action toggle (Tidy / Close All / Relaunch) ──────────────────────

  const toggle = document.createElement('div');
  toggle.id = 'windows-toggle';
  toggle.className = 'windows-toggle';
  toggle.innerHTML = `
    <button class="windows-toggle-btn windows-toggle-tidy" type="button" data-tooltip="Tidy">
      <i class="ph ph-dots-nine"></i>
    </button>
    <button class="windows-toggle-btn windows-toggle-close-all" type="button" data-tooltip="Close all">
      <i class="ph ph-x"></i>
    </button>
    <button class="windows-toggle-btn windows-toggle-relaunch" type="button" data-tooltip="See Windows">
      <i class="ph ph-squares-four"></i>
    </button>
  `;
  stage.appendChild(toggle);
  setTimeout(() => toggle.classList.add('is-visible'), 2500);

  const tooltip = document.createElement('div');
  tooltip.className = 'windows-toggle-tooltip';
  tooltip.setAttribute('aria-hidden', 'true');
  toggle.appendChild(tooltip);

  toggle.querySelectorAll('.windows-toggle-btn').forEach((btn) => {
    btn.addEventListener('mouseenter', () => {
      const text = btn.dataset.tooltip;
      if (!text) return;
      tooltip.textContent = text;
      const btnRect = btn.getBoundingClientRect();
      const toggleRect = toggle.getBoundingClientRect();
      tooltip.style.left =
        btnRect.left - toggleRect.left + btnRect.width / 2 + 'px';
      tooltip.classList.add('is-visible');
    });
    btn.addEventListener('mouseleave', () =>
      tooltip.classList.remove('is-visible'),
    );
  });

  function checkEmpty() {
    if (stage.querySelectorAll('.portfolio-window').length === 0) {
      toggle.classList.add('is-closed');
    }
  }

  // Tidy: cascade all open windows from top-left
  toggle.querySelector('.windows-toggle-tidy').addEventListener('click', () => {
    const wins = Array.from(stage.querySelectorAll('.portfolio-window'));
    const easing =
      'left 0.5s cubic-bezier(0.16,1,0.3,1), top 0.5s cubic-bezier(0.16,1,0.3,1)';
    wins.forEach((win, i) => {
      win.style.transition = easing;
      win.style.left =
        Math.min(80 + i * 32, window.innerWidth - win.offsetWidth - 16) + 'px';
      win.style.top =
        Math.min(80 + i * 32, window.innerHeight - win.offsetHeight - 16) +
        'px';
      win.style.zIndex = i + 1;
      setTimeout(() => {
        win.style.transition = '';
      }, 600);
    });
    zTop = wins.length + 1;
  });

  // Close All: staggered CRT-reverse close
  toggle
    .querySelector('.windows-toggle-close-all')
    .addEventListener('click', () => {
      const wins = Array.from(stage.querySelectorAll('.portfolio-window'));
      wins.forEach((win, i) => {
        setTimeout(() => {
          win.classList.remove('is-visible');
          setTimeout(() => {
            win.remove();
            checkEmpty();
          }, 400);
        }, i * 60);
      });
    });

  // Relaunch: re-shuffle zones and re-spawn all windows
  toggle
    .querySelector('.windows-toggle-relaunch')
    .addEventListener('click', () => {
      toggle.classList.remove('is-closed');
      zTop = 1;
      const newZones = [...ZONES].sort(() => Math.random() - 0.5);
      WINDOWS.forEach((data, i) =>
        spawnWindow(data, newZones[i], i * 380, checkEmpty),
      );
    });

  WINDOWS.forEach((data, i) =>
    spawnWindow(data, shuffledZones[i], 2500 + i * 420, checkEmpty),
  );
}
