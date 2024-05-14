document.addEventListener('DOMContentLoaded', function () {
  // Create engine
  var engine = Matter.Engine.create(),
    world = engine.world;

  // Disable gravity
  engine.world.gravity.y = 0;

  // Create renderer
  var canvas = document.getElementById('spinningShapeCanvas');
  var render = Matter.Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      wireframes: false,
      background: '#18181b',
    },
  });

  // Generate simplified random vertices for the shape
  function generateRandomVertices(centerX, centerY, radius, numberOfVertices) {
    let vertices = [];
    for (let i = 0; i < numberOfVertices; i++) {
      let angle = (i / numberOfVertices) * Math.PI * 2; // Equally spaced angles
      let x =
        centerX +
        radius * Math.cos(angle) +
        ((Math.random() - 0.5) * radius) / 2;
      let y =
        centerY +
        radius * Math.sin(angle) +
        ((Math.random() - 0.5) * radius) / 2;
      vertices.push({ x: x, y: y });
    }
    return vertices;
  }

  // Set initial properties for the shape
  function createShape() {
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;
    let radius = Math.min(canvas.width, canvas.height) * 0.3; // Adjust this value for the desired size of the shape
    let numberOfVertices = 6; // Adjust for complexity of shape

    var vertices = generateRandomVertices(
      centerX,
      centerY,
      radius,
      numberOfVertices
    );

    var colors = ['#fc79bc', '#fcec79', '#fafafa'];
    var randomColor = colors[Math.floor(Math.random() * colors.length)];
    try {
      return Matter.Bodies.fromVertices(
        centerX,
        centerY,
        [vertices],
        {
          isStatic: true,
          render: {
            fillStyle: '#18181b', // Fill color
            strokeStyle: randomColor, // Outline color
            lineWidth: 1, // Outline thickness
          },
        },
        true
      );
    } catch (error) {
      console.error('Error creating shape:', error);
      return null;
    }
  }

  var organicShape = createShape();
  if (organicShape) {
    Matter.World.add(world, organicShape);
  }

  // Function to spin the shape
  function spinShape() {
    if (organicShape) {
      Matter.Body.rotate(organicShape, 0.01);
    }
    requestAnimationFrame(spinShape);
  }

  requestAnimationFrame(spinShape);

  // Function to regenerate the shape
  function regenerateShape() {
    if (organicShape) {
      Matter.World.remove(world, organicShape);
    }
    organicShape = createShape();
    if (organicShape) {
      Matter.World.add(world, organicShape);
    }
  }

  // Throttle shape regeneration
  setInterval(regenerateShape, 1000); // Regenerate shape every 5 seconds

  // Run the engine and renderer
  Matter.Engine.run(engine);
  Matter.Render.run(render);

  // Resize canvas on window resize
  window.addEventListener('resize', function () {
    render.canvas.width = render.canvas.clientWidth;
    render.canvas.height = render.canvas.clientHeight;
    render.options.width = render.canvas.clientWidth;
    render.options.height = render.canvas.clientHeight;
    regenerateShape(); // Regenerate shape to adjust to new canvas size
  });

  // Initial canvas size adjustment
  render.canvas.width = render.canvas.clientWidth;
  render.canvas.height = render.canvas.clientHeight;
  render.options.width = render.canvas.clientWidth;
  render.options.height = render.canvas.clientHeight;
  regenerateShape(); // Regenerate shape to ensure it fits the initial canvas size
});
