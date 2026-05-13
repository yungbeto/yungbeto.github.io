(function () {
  const EMAIL = 'hello@robysaavedra.com';

  function renderNavbar(root) {
    const homeBehavior = root.dataset.homeBehavior || 'link';
    const nameMarkup =
      homeBehavior === 'scroll'
        ? '<span class="nav-name" role="button" style="cursor:pointer;">Roby Saavedra</span>'
        : '<a href="/" class="nav-name" style="text-decoration:none; color:inherit;">Roby Saavedra</a>';

    root.outerHTML = `
      <nav class="navbar">
        ${nameMarkup}
        <div class="nav-icons">
          <a href="https://www.linkedin.com/in/roberto-saavedra/" target="_blank" rel="noopener noreferrer" class="nav-icon" aria-label="LinkedIn" data-tooltip="LinkedIn">in</a>
          <a href="/cv" class="nav-icon" aria-label="CV" data-tooltip="CV"><i class="ph ph-read-cv-logo"></i></a>
          <a href="https://github.com/yungbeto/" target="_blank" rel="noopener noreferrer" class="nav-icon" aria-label="GitHub" data-tooltip="GitHub"><i class="ph ph-github-logo"></i></a>
          <a href="https://signmyguestbook.net/" target="_blank" rel="noopener noreferrer" class="nav-icon" aria-label="Sign my guestbook" data-tooltip="Sign my guestbook"><i class="ph ph-book-open"></i></a>
          <a href="mailto:${EMAIL}" class="nav-icon" aria-label="Email" data-tooltip="Send email"><i class="ph ph-envelope"></i></a>
        </div>
      </nav>
    `;

    if (homeBehavior === 'scroll') {
      const navName = document.querySelector('.navbar .nav-name');
      navName?.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  function renderFooter(root) {
    root.outerHTML = `
      <footer class="site-footer">
        <div class="footer-body">
          <p class="footer-name">Roby<br>Saavedra</p>
          <p class="footer-quote">"A pleasant person to work with"</p>
        </div>
        <div class="footer-bar">
          <div class="footer-contact">
            <button class="copy-btn" id="copy-btn" aria-label="Copy email address">
              <span class="copy-btn-label">
                <span class="copy-btn-text" id="footer-email">${EMAIL}</span>
              </span>
              <i class="ph ph-copy"></i>
            </button>
          </div>
          <div class="footer-secondary">
            <a href="https://www.linkedin.com/in/roberto-saavedra/" target="_blank" rel="noopener noreferrer" class="footer-secondary-link">LinkedIn</a>
            <a href="https://github.com/yungbeto/" target="_blank" rel="noopener noreferrer" class="footer-secondary-link">GitHub</a>
            <a href="/cv" class="footer-secondary-link">CV</a>
            <a href="https://signmyguestbook.net/" target="_blank" rel="noopener noreferrer" class="footer-secondary-link">Guestbook</a>
            <span>© <span id="footer-year"></span></span>
          </div>
        </div>
      </footer>
    `;
  }

  function initFooter() {
    const year = document.getElementById('footer-year');
    const copyBtn = document.getElementById('copy-btn');
    const label = document.getElementById('footer-email');

    if (year) year.textContent = new Date().getFullYear();
    if (!copyBtn || !label) return;

    copyBtn.addEventListener('click', function () {
      const icon = copyBtn.querySelector('i');
      if (!icon) return;

      navigator.clipboard.writeText(EMAIL).then(function () {
        const DURATION = 240;

        function swapText(newText) {
          label.classList.add('copy-state-exit');
          setTimeout(function () {
            label.textContent = newText;
            label.classList.remove('copy-state-exit');
            label.classList.add('copy-state-enter');
            requestAnimationFrame(function () {
              requestAnimationFrame(function () {
                label.classList.remove('copy-state-enter');
              });
            });
          }, DURATION);
        }

        icon.className = 'ph ph-check copy-icon-success';
        setTimeout(function () {
          icon.classList.remove('copy-icon-success');
        }, 400);
        swapText('Email copied to clipboard');

        setTimeout(function () {
          swapText(EMAIL);
          icon.className = 'ph ph-copy';
        }, 1400);
      }).catch(function () {
        icon.className = 'ph ph-warning';
      });
    });
  }

  function initFooterNameAnimation() {
    const el = document.querySelector('.footer-name');
    if (!el) return;

    const charSpans = [];
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';

    nodes.forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent.replace(/\s+/g, ' ').trim();
        if (text) splitTextIntoChars(text, el, charSpans);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const text = node.textContent;
        node.innerHTML = '';
        if (text) splitTextIntoChars(text, node, charSpans);
        el.appendChild(node);
      }
    });

    if (!('IntersectionObserver' in window)) {
      startScramble(charSpans, undefined, { startDelay: 100, staggerMs: 35 });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        observer.disconnect();
        startScramble(charSpans, undefined, { startDelay: 100, staggerMs: 35 });
      }
    }, { threshold: 0.4 });

    observer.observe(el);
  }

  function splitTextIntoChars(text, container, charSpans) {
    const words = text.split(' ');
    words.forEach(function (word, wi) {
      if (!word) return;

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

  function startScramble(charSpans, onComplete, { startDelay = 150, staggerMs = 12 } = {}) {
    const blocks = ['█', '▓', '▒', '░', '▒', '▓'];
    const cycleMs = 40;
    let frame = 0;

    const timer = setInterval(function () {
      frame++;
      charSpans.forEach(function ({ outer, block }) {
        if (!outer.classList.contains('resolved')) {
          block.textContent = blocks[frame % blocks.length];
        }
      });
    }, cycleMs);

    charSpans.forEach(function ({ outer }, i) {
      setTimeout(function () {
        outer.classList.add('resolved');
      }, startDelay + i * staggerMs);
    });

    setTimeout(function () {
      clearInterval(timer);
      onComplete?.();
    }, startDelay + charSpans.length * staggerMs + 400);
  }

  document.querySelectorAll('[data-site-navbar]').forEach(renderNavbar);
  document.querySelectorAll('[data-site-footer]').forEach(renderFooter);
  initFooter();
  initFooterNameAnimation();
})();
