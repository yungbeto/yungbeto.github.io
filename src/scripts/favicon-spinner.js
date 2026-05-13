// favicon-spinner.js
(function () {
  const favicon =
    document.getElementById('favicon') ||
    document.querySelector('link[rel~="icon"]') ||
    document.head.appendChild(
      Object.assign(document.createElement('link'), { rel: 'icon' }),
    );

  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const size = 32;
  const path = new Path2D(
    'M22.875 6L8.5 9.0303L6 21.1516L19.75 26L26 14.4848L22.875 6Z',
  );
  let angle = 0;
  let lastTime = performance.now();

  if (!ctx) return;

  canvas.width = size;
  canvas.height = size;

  function draw() {
    ctx.clearRect(0, 0, size, size);
    ctx.save();
    ctx.translate(size / 2, size / 2);
    ctx.rotate((angle * Math.PI) / 180);
    ctx.translate(-size / 2, -size / 2);

    // Double stroke keeps the tiny icon visible on both light and dark browser chrome.
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d4d4d8';
    ctx.stroke(path);
    ctx.lineWidth = 2.25;
    ctx.strokeStyle = '#3f3f46';
    ctx.fillStyle = '#f472b6';
    ctx.fill(path);
    ctx.stroke(path);
    ctx.restore();

    favicon.href = canvas.toDataURL('image/png');
  }

  function tick(now) {
    if (prefersReducedMotion) {
      return;
    }

    const elapsed = now - lastTime;
    lastTime = now;
    angle = (angle + elapsed * 0.05) % 360;
    draw();
    requestAnimationFrame(tick);
  }

  draw();
  if (!prefersReducedMotion) {
    requestAnimationFrame(tick);
  }
})();
