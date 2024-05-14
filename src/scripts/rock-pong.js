document.addEventListener('DOMContentLoaded', function () {
  function createFloatingShape(divId) {
    // Create engine
    let engine = Matter.Engine.create();
    let world = engine.world;

    // Disable gravity
    engine.world.gravity.y = 0;

    // Create renderer
    let targetDiv = document.getElementById(divId);
    if (!targetDiv) {
      console.error(`${divId} not found!`);
      return;
    }

    let canvas = document.createElement('canvas');
    canvas.id = `${divId}-floatingShapeCanvas`;
    targetDiv.appendChild(canvas);

    let render = Matter.Render.create({
      canvas: canvas,
      engine: engine,
      options: {
        width: targetDiv.clientWidth,
        height: targetDiv.clientHeight,
        wireframes: false,
        background: '#fcec79',
      },
    });

    // Function to create walls
    function createWalls() {
      let wallOptions = {
        isStatic: true,
        restitution: 1, // High restitution for bounciness
        render: {
          visible: false,
        },
      };

      Matter.World.add(world, [
        Matter.Bodies.rectangle(
          targetDiv.clientWidth / 2,
          -25,
          targetDiv.clientWidth,
          50,
          wallOptions
        ), // top
        Matter.Bodies.rectangle(
          targetDiv.clientWidth / 2,
          targetDiv.clientHeight + 25,
          targetDiv.clientWidth,
          50,
          wallOptions
        ), // bottom
        Matter.Bodies.rectangle(
          -25,
          targetDiv.clientHeight / 2,
          50,
          targetDiv.clientHeight,
          wallOptions
        ), // left
        Matter.Bodies.rectangle(
          targetDiv.clientWidth + 25,
          targetDiv.clientHeight / 2,
          50,
          targetDiv.clientHeight,
          wallOptions
        ), // right
      ]);
    }

    // Generate simplified random vertices for the shape
    function generateRandomVertices(
      centerX,
      centerY,
      radius,
      numberOfVertices
    ) {
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
      let radius = Math.min(canvas.width, canvas.height) * 0.2; // Adjust this value for the desired size of the shape
      let numberOfVertices = 6; // Adjust for complexity of shape

      let vertices = generateRandomVertices(
        centerX,
        centerY,
        radius,
        numberOfVertices
      );

      try {
        return Matter.Bodies.fromVertices(
          centerX,
          centerY,
          [vertices],
          {
            frictionAir: 0,
            restitution: 1, // High restitution for bounciness
            render: {
              fillStyle: '#fcec79', // Fill color
              strokeStyle: 'rgba(0,0,0,.2)', // Outline color
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

    // Create walls and the floating shape
    createWalls();
    let floatingShape = createShape();
    if (floatingShape) {
      Matter.World.add(world, floatingShape);
    }

    // Function to keep the shape moving smoothly
    let angle = 0;
    function applySmoothForce(body) {
      angle += 0.02;
      let forceMagnitude = 0.0005;
      let forceX = Math.cos(angle) * forceMagnitude;
      let forceY = Math.sin(angle) * forceMagnitude;
      Matter.Body.applyForce(body, body.position, { x: forceX, y: forceY });
    }

    setInterval(function () {
      if (floatingShape) {
        applySmoothForce(floatingShape);
      }
    }, 16); // Apply force roughly every frame for smoother motion

    // Run the engine and renderer
    Matter.Engine.run(engine);
    Matter.Render.run(render);

    // Function to resize the canvas and regenerate walls
    function resizeCanvas() {
      render.canvas.width = targetDiv.clientWidth;
      render.canvas.height = targetDiv.clientHeight;
      render.options.width = targetDiv.clientWidth;
      render.options.height = targetDiv.clientHeight;
      createWalls();
    }

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('orientationchange', resizeCanvas);

    resizeCanvas(); // Initial resize to set up the canvas dimensions
  }

  // Initialize the floating shapes in both divs
  createFloatingShape('work');
  createFloatingShape('side-projects');
});
