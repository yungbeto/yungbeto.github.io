var engine, render, homeDiv;
var popEffects = [];

document.addEventListener('DOMContentLoaded', function () {
  homeDiv = document.getElementById('hero-rocks');
  if (!homeDiv) {
    console.warn('rocks.js: #hero-rocks container not found');
    return;
  }

  engine = Matter.Engine.create({
    gravity: { x: 0, y: 1 },
  });

  render = Matter.Render.create({
    element: homeDiv,
    engine: engine,
    options: {
      width: homeDiv.clientWidth,
      height: homeDiv.clientHeight,
      wireframes: false,
      background: 'transparent',
    },
  });

  render.canvas.style.position = 'absolute';
  render.canvas.style.inset = '0';
  render.canvas.style.zIndex = '0';
  render.canvas.style.pointerEvents = 'none';

  Matter.Events.on(render, 'afterRender', function () {
    if (popEffects.length === 0) return;
    var ctx = render.canvas.getContext('2d');
    var now = performance.now();
    var duration = 320;
    popEffects = popEffects.filter(function (pop) {
      var t = (now - pop.start) / duration;
      if (t >= 1) return false;
      var dotPhase = 0.18;
      var burstT = Math.max((t - dotPhase) / (1 - dotPhase), 0);
      var easeOut = 1 - Math.pow(1 - burstT, 3);
      var fade = 0.52 * (1 - burstT);
      ctx.save();
      ctx.globalAlpha = fade;
      ctx.strokeStyle = '#52525b';
      ctx.fillStyle = '#52525b';
      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      if (t < dotPhase) {
        var dotT = t / dotPhase;
        var dotRadius = 1.25 - dotT * 0.5;
        ctx.beginPath();
        ctx.arc(pop.x, pop.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      for (var i = 0; i < 6; i++) {
        var angle = ((Math.PI * 2) / 6) * i;
        var cx = Math.cos(angle);
        var cy = Math.sin(angle);
        var startDist = 1 + easeOut * 16;
        var length = 8 * (1 - burstT);
        if (length <= 0) continue;
        ctx.beginPath();
        ctx.moveTo(pop.x + cx * startDist, pop.y + cy * startDist);
        ctx.lineTo(
          pop.x + cx * (startDist + length),
          pop.y + cy * (startDist + length),
        );
        ctx.stroke();
      }
      ctx.restore();
      return true;
    });
  });

  createWalls();
  scheduleNextDrop();

  // Click anywhere in the hero section to drop a rock at that point
  homeDiv.addEventListener('click', function (event) {
    var rect = homeDiv.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    popEffects.push({ x: x, y: y, start: performance.now() });
    dropBody(x, y);
  });

  window.addEventListener('resize', function () {
    resizeCanvas();
    createWalls();
  });

  Matter.Engine.run(engine);
  Matter.Render.run(render);
});

// Drop one rock, then wait for it to settle before dropping the next
function scheduleNextDrop() {
  var w = homeDiv.clientWidth;
  // Spawn near top-center with a small random horizontal offset, like an hourglass neck
  var x = w / 2 + (Math.random() - 0.5) * 40;
  var body = dropBody(x, -60);

  var settled = false;
  var maxWait = setTimeout(function () {
    if (!settled) {
      settled = true;
      scheduleNextDrop();
    }
  }, 6000); // fallback: next drop after 6s regardless

  var checkInterval = setInterval(function () {
    var spd = Math.sqrt(
      body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y,
    );
    if (spd < 0.15) {
      clearInterval(checkInterval);
      clearTimeout(maxWait);
      if (!settled) {
        settled = true;
        // Small pause between rocks so it feels deliberate
        setTimeout(scheduleNextDrop, 400);
      }
    }
  }, 100);
}

function dropBody(x, y) {
  var sides = Math.floor(Math.random() * 5) + 4; // 4–8 sides
  var maxRadius = 32;
  var vertices = [];
  for (var i = 0; i < sides; i++) {
    var angle = ((Math.PI * 2) / sides) * i;
    var radius = Math.random() * maxRadius * 0.5 + maxRadius * 0.5;
    vertices.push({
      x: x + radius * Math.cos(angle),
      y: y + radius * Math.sin(angle),
    });
  }

  var fills = ['#e4e4e7', '#d4d4d8', '#cacaca'];
  var fill = fills[Math.floor(Math.random() * fills.length)];

  var body = Matter.Bodies.fromVertices(
    x,
    y,
    [vertices],
    {
      frictionAir: 0.008,
      friction: 0.8,
      frictionStatic: 0.5,
      restitution: 0.05,
      render: {
        fillStyle: fill,
        strokeStyle: '#3f3f46',
        lineWidth: 1,
      },
    },
    true,
  );

  // Tiny random horizontal nudge so they don't all stack perfectly
  Matter.Body.setVelocity(body, {
    x: (Math.random() - 0.5) * 0.5,
    y: 0,
  });

  Matter.World.add(engine.world, body);
  return body;
}

function resizeCanvas() {
  var w = homeDiv.clientWidth;
  var h = homeDiv.clientHeight;
  render.canvas.width = w;
  render.canvas.height = h;
  render.options.width = w;
  render.options.height = h;
}

function createWalls() {
  engine.world.bodies.forEach(function (body) {
    if (body.isStatic) Matter.Composite.remove(engine.world, body);
  });

  var wallOptions = { isStatic: true, render: { visible: false } };
  var w = homeDiv.clientWidth;
  var h = homeDiv.clientHeight;

  Matter.World.add(engine.world, [
    // floor
    Matter.Bodies.rectangle(w / 2, h + 25, w, 50, wallOptions),
    // left wall
    Matter.Bodies.rectangle(-25, h / 2, 50, h, wallOptions),
    // right wall
    Matter.Bodies.rectangle(w + 25, h / 2, 50, h, wallOptions),
    // no ceiling — rocks fall in from the top
  ]);
}
