document.addEventListener('DOMContentLoaded', function () {
  initHeroAnimation();
  Promise.all([
    loadProjectCards(),
    loadWorkCases(),
    loadJobs(),
    loadMarquee(),
  ]).then(initSectionLabelObserver);
});

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

  startScramble(charSpans);
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

function startScramble(charSpans) {
  const BLOCKS = ['█', '▓', '▒', '░', '▒', '▓'];
  const CYCLE_MS = 40;
  const START_DELAY = 150;
  const STAGGER_MS = 12;

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

  // Stop cycling once all chars have resolved + transition buffer
  setTimeout(
    () => clearInterval(timer),
    START_DELAY + charSpans.length * STAGGER_MS + 400,
  );
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
  const infoBox = document.createElement('div');
  infoBox.className = 'projects-info-box';
  infoBox.innerHTML = `
    <i class="ph ph-code projects-info-icon"></i>
    <p>Here is a selection of projects that I've conceived, designed, and developed. These examples range from personal utilities, small social networks, and solutions to problems I've encountered in the wild.</p>
  `;
  grid.appendChild(infoBox);

  try {
    const res = await fetch('src/projects.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const projects = await res.json();

    projects.forEach((project) => {
      const media = project.media?.[0];
      if (!media) return;

      let mediaHtml;
      if (media.type === 'video') {
        mediaHtml = `<video autoplay loop muted playsinline preload="auto">
          <source src="${media.src}" type="video/mp4">
        </video>`;
      } else {
        mediaHtml = `<img src="${media.src}" alt="${project.name}">`;
      }

      const card = document.createElement('a');
      card.href = project.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      card.className = 'projects-card';
      const chipsHtml = project.skills
        ? project.skills
            .split(',')
            .map((s) => `<span class="projects-card-chip">${s.trim()}</span>`)
            .join('')
        : '';

      card.innerHTML = `
        <div class="projects-card-thumbnail">${mediaHtml}</div>
        <div class="projects-card-info">
          <p class="projects-card-title">${project.name}</p>
          <p class="projects-card-desc">${project.description}</p>
        </div>
        ${chipsHtml ? `<div class="projects-card-meta">${chipsHtml}</div>` : ''}
      `;

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

      const copyHtml = c.copy.map((p) => `<p>${p}</p>`).join('');

      const mediaHtml = c.media
        .map((m) => {
          if (m.type === 'video') {
            return `<div class="work-case-media-item">
              <video autoplay loop muted playsinline preload="auto">
                <source src="${m.src}" type="video/mp4">
              </video>
            </div>`;
          }
          return `<div class="work-case-media-item">
            <img src="${m.src}" alt="${c.company} work sample">
          </div>`;
        })
        .join('');

      block.innerHTML = `
        <header class="work-case-header">
          <div class="work-case-meta">
            <img class="work-case-icon" src="${c.icon}" alt="${c.company} logo">
            <div>
              <h3 class="work-case-company">${c.company}</h3>
              <p class="work-case-meta-text">${c.dateRange}</p>
              <p class="work-case-meta-text">${c.role}</p>
            </div>
          </div>
          <div class="work-case-copy">${copyHtml}</div>
        </header>
        <div class="work-case-pill-wrapper">
          <div class="work-case-pill" aria-hidden="true">
            <img class="work-case-pill-icon" src="${c.icon}" alt="">
            <span class="work-case-pill-label">${c.company}</span>
          </div>
        </div>
        <div class="work-case-media">${mediaHtml}</div>
      `;

      container.appendChild(block);
    });

    initWorkCasePills();
  } catch (err) {
    console.error('Failed to load work cases:', err);
  }
}

function initWorkCasePills() {
  const cases = document.querySelectorAll('.work-case');
  if (!cases.length) return;

  cases.forEach((workCase) => {
    const meta = workCase.querySelector('.work-case-meta');
    const pill = workCase.querySelector('.work-case-pill');
    if (!meta || !pill) return;

    let caseInView = false;
    let metaInView = false;

    function updatePill() {
      pill.classList.toggle('is-visible', caseInView && !metaInView);
    }

    new IntersectionObserver(
      (entries) => {
        caseInView = entries[0].isIntersecting;
        updatePill();
      },
      { threshold: 0, rootMargin: '-96px 0px 0px 0px' },
    ).observe(workCase);

    new IntersectionObserver(
      (entries) => {
        metaInView = entries[0].isIntersecting;
        updatePill();
      },
      { threshold: 0 },
    ).observe(meta);
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
