var engine, render, homeDiv;
var bodyCount = 0;
var maxBodies = 100; // Adjusted maximum number of bodies

document.addEventListener('DOMContentLoaded', function () {
  // Use desktop background for full-viewport fixed wallpaper, fallback to #home
  homeDiv = document.getElementById('desktop-background') || document.getElementById('home');
  if (!homeDiv) {
    console.error('rocks.js: container not found!');
    return;
  }

  engine = Matter.Engine.create({
    gravity: {
      x: 0,
      y: 0, // Zero gravity for floating effect
    },
  });

  render = Matter.Render.create({
    element: homeDiv,
    engine: engine,
    options: {
      width: homeDiv.clientWidth || window.innerWidth,
      height: homeDiv.clientHeight || window.innerHeight,
      wireframes: false,
      background: 'transparent',
    },
  });

  createWalls(); // Create walls on initialization
  createInitialBody(); // Create the first body immediately

  // Set an interval to create a new body every 2 seconds
  setInterval(function () {
    if (bodyCount < maxBodies) {
      createInitialBody();
    }
  }, 2000);

  Matter.Events.on(engine, 'beforeUpdate', function () {
    applyCursorAttraction(engine);
  });

  setupEventListeners();
  window.addEventListener('resize', function () {
    resizeCanvas();
    createWalls(); // Recreate walls on resize
  });
  window.addEventListener('orientationchange', function () {
    resizeCanvas();
    createWalls(); // Ensure walls are adjusted on orientation change
  });
  Matter.Engine.run(engine);
  Matter.Render.run(render);
});

function setupEventListeners() {
  render.canvas.addEventListener('pointerdown', handlePointerDown);
  render.canvas.addEventListener(
    'touchstart',
    function (e) {
      handlePointerDown(e.touches[0]); // Pass the first touch point to the handler
      e.preventDefault(); // Call preventDefault only if necessary (moved inside handlePointerDown)
    },
    { passive: false },
  );
}

// Throttle function to limit event frequency
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function () {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(
        function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan),
      );
    }
  };
}

function handlePointerDown(event) {
  var rect = render.canvas.getBoundingClientRect();
  var clickX = event.clientX - rect.left;
  var clickY = event.clientY - rect.top;
  // Only prevent default if the interaction is within the canvas area
  if (
    clickX >= 0 &&
    clickX <= render.canvas.width &&
    clickY >= 0 &&
    clickY <= render.canvas.height
  ) {
    event.preventDefault();
    var newBody = createBody(clickX, clickY);
    Matter.World.add(engine.world, newBody);
  }
}

function createBody(x, y) {
  var w = homeDiv.clientWidth || window.innerWidth;
  x = x || Math.random() * w;
  y = y || -300; // Start bodies further above the top edge of the canvas
  var sides = Math.floor(Math.random() * (8 - 4 + 1)) + 4;
  var maxRadius = 40;
  var vertices = [];
  for (var i = 0; i < sides; i++) {
    var angle = ((Math.PI * 2) / sides) * i;
    var radius = Math.random() * maxRadius * 0.5 + maxRadius * 0.5;
    vertices.push({
      x: x + radius * Math.cos(angle),
      y: y + radius * Math.sin(angle),
    });
  }

  var colors = ['#0f0f0f', '#2a2a2a'];
  var strokeColor = ['#a3a3a3', '#737373'];
  var randomColor = colors[Math.floor(Math.random() * colors.length)];
  var randomStrokeColor =
    strokeColor[Math.floor(Math.random() * strokeColor.length)];

  var body = Matter.Bodies.fromVertices(
    x,
    y,
    [vertices],
    {
      frictionAir: 0.05,
      inertia: Infinity,
      render: {
        fillStyle: randomColor,
        strokeStyle: randomStrokeColor,
        lineWidth: 1,
      },
    },
    true,
  );

  // Set a downward initial velocity to simulate dropping
  Matter.Body.setVelocity(body, {
    x: (Math.random() - 0.5) * 0.2, // Reduced x velocity
    y: 2, // Set a positive y-velocity to simulate dropping
  });

  bodyCount++;
  return body;
}

function resizeCanvas() {
  var w = homeDiv.clientWidth || window.innerWidth;
  var h = homeDiv.clientHeight || window.innerHeight;
  render.canvas.width = w;
  render.canvas.height = h;
  render.options.width = w;
  render.options.height = h;
  createWalls();
}

function createWalls() {
  // Instead of clearing the entire world, just remove and recreate the walls
  // Clear only walls
  engine.world.bodies.forEach((body) => {
    if (body.isStatic) {
      Matter.Composite.remove(engine.world, body);
    }
  });

  var wallOptions = {
    isStatic: true,
    render: {
      visible: false,
    },
  };
  var w = homeDiv.clientWidth || window.innerWidth;
  var h = homeDiv.clientHeight || window.innerHeight;
  Matter.World.add(engine.world, [
    Matter.Bodies.rectangle(w / 2, -25, w, 50, wallOptions),
    Matter.Bodies.rectangle(w / 2, h + 25, w, 50, wallOptions),
    Matter.Bodies.rectangle(-25, h / 2, 50, h, wallOptions),
    Matter.Bodies.rectangle(w + 25, h / 2, 50, h, wallOptions),
  ]);
}

var mousePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

document.addEventListener(
  'mousemove',
  throttle(function (event) {
    mousePosition.x = event.clientX;
    mousePosition.y = event.clientY;
  }, 100),
);

document.addEventListener(
  'touchmove',
  throttle(function (event) {
    if (event.touches.length > 0) {
      var touch = event.touches[0];
      mousePosition.x = touch.clientX;
      mousePosition.y = touch.clientY;
    }
  }, 100),
);

function applyCursorAttraction(engine) {
  var bodies = Matter.Composite.allBodies(engine.world);

  bodies.forEach(function (body) {
    var dx = mousePosition.x - body.position.x;
    var dy = mousePosition.y - body.position.y;
    var distance = Math.sqrt(dx * dx + dy * dy);
    var forceMagnitude = 0.00001 * body.mass; // Adjust this value to change the strength of the attraction
    Matter.Body.applyForce(body, body.position, {
      x: (dx / distance) * forceMagnitude,
      y: (dy / distance) * forceMagnitude,
    });
  });
}

function createInitialBody() {
  var w = homeDiv.clientWidth || window.innerWidth;
  var h = homeDiv.clientHeight || window.innerHeight;
  var initialBody = createBody(w / 2, h / 50);
  Matter.World.add(engine.world, initialBody);
}

window.addEventListener('resize', function () {
  var w = homeDiv.clientWidth || window.innerWidth;
  var h = homeDiv.clientHeight || window.innerHeight;
  render.canvas.width = w;
  render.canvas.height = h;
  render.options.width = w;
  render.options.height = h;
  createWalls();
});

// Note: Engine and render are started in DOMContentLoaded
