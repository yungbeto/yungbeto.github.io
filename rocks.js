var engine, render, homeDiv;
var bodyCount = 0;

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
  createInitialBody(); // Create the first body immediately

  // Set an interval to create a new body every 2 seconds
  setInterval(function () {
    if (bodyCount < 200) {
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
    { passive: false }
  );
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
  x = x || Math.random() * homeDiv.clientWidth;
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
        fillStyle: randomColor,
        strokeStyle: '#3F3F46',
        lineWidth: 1,
      },
    },
    true
  );

  // Set a downward initial velocity to simulate dropping
  Matter.Body.setVelocity(body, {
    x: (Math.random() - 0.5) * 0.2, // Reduced x velocity
    y: 2, // Set a positive y-velocity to simulate dropping
  });

  return body;
}

function resizeCanvas() {
  render.canvas.width = homeDiv.clientWidth;
  render.canvas.height = homeDiv.clientHeight;
  render.options.width = homeDiv.clientWidth;
  render.options.height = homeDiv.clientHeight;
  // Update the walls to adjust to the new canvas size
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
    homeDiv.clientHeight / 50
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
