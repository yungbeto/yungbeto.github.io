/**
 * Win95-style desktop: icons open draggable windows with cloned section content.
 * Rocks canvas is the fixed background (see rocks.js).
 */
(function () {
  var windowCount = 0;
  var zIndexBase = 100;

  var windowTitles = {
    projects: 'Personal projects',
    'work-history': 'Work History',
    about: 'About me',
  };

  var sectionSelectors = {
    projects: '#side-projects, #projects-root',
    'work-history': '#work-history',
    about: '#about',
  };

  function getContentForWindow(id) {
    var pool = document.getElementById('section-pool');
    if (!pool) return document.createDocumentFragment();
    var selectors = sectionSelectors[id];
    if (!selectors) return document.createDocumentFragment();
    var fragment = document.createDocumentFragment();
    selectors.split(',').forEach(function (sel) {
      var el = pool.querySelector(sel.trim());
      if (el) {
        var clone = el.cloneNode(true);
        clone.removeAttribute('id');
        clearCloneIds(clone);
        fragment.appendChild(clone);
      }
    });
    return fragment;
  }

  function clearCloneIds(node) {
    if (node.id) node.removeAttribute('id');
    var list = node.querySelectorAll('[id]');
    for (var i = 0; i < list.length; i++) list[i].removeAttribute('id');
  }

  function createWindow(id, title) {
    var body = getContentForWindow(id);
    var winEl = document.createElement('div');
    winEl.className = 'win95-window';
    winEl.setAttribute('role', 'dialog');
    winEl.setAttribute('aria-label', title);
    winEl.dataset.windowId = id;
    winEl.style.width = Math.min(560, window.innerWidth - 48) + 'px';
    winEl.style.height = Math.min(420, window.innerHeight - 80) + 'px';
    winEl.style.left = 40 + (windowCount % 3) * 24 + 'px';
    winEl.style.top = 48 + (windowCount % 3) * 24 + 'px';
    winEl.style.zIndex = zIndexBase + windowCount;
    windowCount++;

    winEl.innerHTML =
      '<div class="win95-titlebar" data-drag-handle="">' +
      '<span class="win95-titlebar-text">' + escapeHtml(title) + '</span>' +
      '<div class="win95-titlebar-buttons">' +
      '<button type="button" class="win95-titlebar-btn win95-close" aria-label="Close">×</button>' +
      '</div></div>' +
      '<div class="win95-window-body"></div>';

    var bodyContainer = winEl.querySelector('.win95-window-body');
    while (body.firstChild) bodyContainer.appendChild(body.firstChild);

    // Close button
    winEl.querySelector('.win95-close').addEventListener('click', function () {
      winEl.remove();
    });

    // Drag
    var titlebar = winEl.querySelector('.win95-titlebar');
    titlebar.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return;
      focusWindow(winEl);
      var startX = e.clientX - winEl.offsetLeft;
      var startY = e.clientY - winEl.offsetTop;
      function move(e) {
        var x = e.clientX - startX;
        var y = e.clientY - startY;
        winEl.style.left = Math.max(0, x) + 'px';
        winEl.style.top = Math.max(32, y) + 'px';
      }
      function stop() {
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', stop);
      }
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', stop);
    });

    // Focus on click
    winEl.addEventListener('mousedown', function () {
      focusWindow(winEl);
    });

    return winEl;
  }

  function focusWindow(winEl) {
    var container = document.getElementById('desktop-windows');
    if (!container) return;
    var windows = container.querySelectorAll('.win95-window');
    var maxZ = zIndexBase;
    windows.forEach(function (w) {
      var z = parseInt(w.style.zIndex, 10) || zIndexBase;
      if (z > maxZ) maxZ = z;
    });
    winEl.style.zIndex = maxZ + 1;
    winEl.classList.add('focused');
    windows.forEach(function (w) {
      if (w !== winEl) w.classList.remove('focused');
    });
  }

  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function openWindow(id) {
    var title = windowTitles[id] || id;
    var existing = document.querySelector('.win95-window[data-window-id="' + id + '"]');
    if (existing) {
      focusWindow(existing);
      return;
    }
    var winEl = createWindow(id, title);
    document.getElementById('desktop-windows').appendChild(winEl);
    focusWindow(winEl);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var container = document.getElementById('desktop-windows');
    if (!container) return;

    document.querySelectorAll('.desktop-icon[data-window]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = this.getAttribute('data-window');
        if (id) openWindow(id);
      });
    });
  });
})();
