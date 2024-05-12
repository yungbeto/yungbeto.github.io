var engine, render, homeDiv;

document.addEventListener('DOMContentLoaded', function () {
  homeDiv = document.getElementById('home');
  if (!homeDiv) {
    console.error('homeDiv not found!');
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
      width: homeDiv.clientWidth,
      height: homeDiv.clientHeight,
      wireframes: false,
      background: 'transparent',
    },
  });

  createWalls(); // Create walls on initialization
  createInitialBody();

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
  render.canvas.addEventListener('touchstart', function (e) {
    e.preventDefault(); // Prevent scrolling and zooming on touch
    handlePointerDown(e.touches[0]); // Handle the first touch point
  });
}

function handlePointerDown(event) {
  var rect = render.canvas.getBoundingClientRect();
  var clickX = event.clientX - rect.left;
  var clickY = event.clientY - rect.top;
  var newBody = createBody(clickX, clickY);
  Matter.World.add(engine.world, newBody);
}

function createBody(x, y) {
  x = x || Math.random() * homeDiv.clientWidth;
  y = y || Math.random() * homeDiv.clientHeight;
  var sides = Math.floor(Math.random() * (8 - 4 + 1)) + 4;
  var maxRadius = 60;
  var vertices = [];
  for (var i = 0; i < sides; i++) {
    var angle = ((Math.PI * 2) / sides) * i;
    var radius = Math.random() * maxRadius * 0.5 + maxRadius * 0.5;
    vertices.push({
      x: x + radius * Math.cos(angle),
      y: y + radius * Math.sin(angle),
    });
  }

  var colors = ['#fc79bc', '#fcec79', '#f4f4f5'];

  var randomColor = colors[Math.floor(Math.random() * colors.length)];

  var body = Matter.Bodies.fromVertices(
    x,
    y,
    [vertices],
    {
      frictionAir: 0.05,
      inertia: Infinity,
      render: {
        fillStyle: randomColor, // Interior color of the bodies
        strokeStyle: '#3F3F46', // Color of the outline
        lineWidth: 1, // Width of the outline
      },
    },
    true
  );

  Matter.Body.setVelocity(body, {
    x: (Math.random() - 0.5) * 0.5,
    y: (Math.random() - 0.5) * 0.5,
  });

  return body;
}

function resizeCanvas() {
  render.canvas.width = homeDiv.clientWidth;
  render.canvas.height = homeDiv.clientHeight;
  render.options.width = homeDiv.clientWidth;
  render.options.height = homeDiv.clientHeight;
}

function createWalls() {
  // Clear existing walls before creating new ones to match the current canvas size
  Matter.World.clear(engine.world, true); // true to clear all but static bodies, preserving them

  var wallOptions = {
    isStatic: true,
    render: {
      visible: false,
    },
  };
  // Adding walls
  Matter.World.add(engine.world, [
    Matter.Bodies.rectangle(
      homeDiv.clientWidth / 2,
      -25,
      homeDiv.clientWidth,
      50,
      wallOptions
    ), // top
    Matter.Bodies.rectangle(
      homeDiv.clientWidth / 2,
      homeDiv.clientHeight + 25,
      homeDiv.clientWidth,
      50,
      wallOptions
    ), // bottom
    Matter.Bodies.rectangle(
      -25,
      homeDiv.clientHeight / 2,
      50,
      homeDiv.clientHeight,
      wallOptions
    ), // left
    Matter.Bodies.rectangle(
      homeDiv.clientWidth + 25,
      homeDiv.clientHeight / 2,
      50,
      homeDiv.clientHeight,
      wallOptions
    ), // right
  ]);
}

var mousePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

document.addEventListener('mousemove', function (event) {
  mousePosition.x = event.clientX;
  mousePosition.y = event.clientY;
});

document.addEventListener('touchmove', function (event) {
  if (event.touches.length > 0) {
    var touch = event.touches[0];
    mousePosition.x = touch.clientX;
    mousePosition.y = touch.clientY;
  }
});

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
  var initialBody = createBody(
    homeDiv.clientWidth / 2,
    homeDiv.clientHeight / 2
  );
  Matter.World.add(engine.world, initialBody);
}

window.addEventListener('resize', function () {
  render.canvas.width = homeDiv.clientWidth;
  render.canvas.height = homeDiv.clientHeight;
  render.options.width = homeDiv.clientWidth;
  render.options.height = homeDiv.clientHeight;
  console.log(
    'Resized canvas dimensions:',
    render.options.width,
    'x',
    render.options.height
  );
});

Matter.Engine.run(engine);
Matter.Render.run(render);
