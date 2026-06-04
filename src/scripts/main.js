document.addEventListener('DOMContentLoaded', function () {
  initHeroAnimation();
  initRandomCaseStudyLink();
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
  const cases = ['/olympus', '/revel', '/cavnue'];
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
      const overlayColor = cardColors[Math.floor(Math.random() * cardColors.length)];

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

      card.querySelector('.projects-card-close').addEventListener('click', () => {
        card.classList.remove('is-active');
      });

      card.querySelector('.projects-card-visit').addEventListener('click', (e) => {
        e.stopPropagation();
      });

      grid.appendChild(card);
    });
  } catch (err) {
    console.error('Failed to load projects:', err);
  }
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

      const ctaHtml = c.caseStudy_url
        ? `<div class="work-case-cta-container">
            <a class="work-case-cta" href="${c.caseStudy_url}">
              View Case Study
              <i class="ph ph-arrow-right"></i>
            </a>
          </div>`
        : '';

      block.innerHTML = `
        <div class="work-case-image">
          <img src="${c.caseStudyImage}" alt="${c.company} case study">
        </div>
        <div class="work-case-copy">
          <p class="work-case-title">${c.title}</p>
          <p class="work-case-blurb">${c.blurb}</p>
          ${ctaHtml}
        </div>
      `;

      container.appendChild(block);
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

async function loadJobs() {
  const list = document.getElementById('jobs-list');
  if (!list) return;

  try {
    const res = await fetch('src/jobs.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const jobs = await res.json();

    jobs.forEach((job) => {
      const li = document.createElement('li');
      li.className = 'job-entry';
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
          <div class="job-description-inner">${job.JobDescription}</div>
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
