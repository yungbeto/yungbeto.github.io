document.addEventListener('DOMContentLoaded', function () {
  const imageContainer = document.querySelector('.imageContainer');

  // Dynamically create and append images
  for (let i = 1; i <= 12; i++) {
    const img = document.createElement('img');
    const imgNumber = i.toString().padStart(2, '0'); // Ensures the format is "01", "02", etc.
    img.src = `media/tablet/musicPlayers/musicPlayer${imgNumber}.png`;
    img.alt = `Music Player ${imgNumber}`;
    imageContainer.appendChild(img);
  }

  // Clone the images for infinite scroll effect without empty space
  const images = [...imageContainer.children];
  images.forEach((img) => {
    const clone = img.cloneNode(true);
    imageContainer.appendChild(clone);
  });
});

// ------ Canvas

// Helper function to generate an "organic" polygon
function createOrganicPolygon(x, y, sides, radius, options) {
  let vertices = [];
  for (let i = 0; i < sides; i++) {
    const angle = ((Math.PI * 2) / sides) * i;
    const length = radius * (0.95 + Math.random() * 0.1); // Randomize the radius slightly for each vertex
    vertices.push({
      x: x + length * Math.cos(angle),
      y: y + length * Math.sin(angle),
    });
  }
  return Bodies.fromVertices(x, y, [vertices], options, true);
}

// Initially create the octagon
let octagon = createOrganicPolygon(
  window.innerWidth / 2,
  window.innerHeight / 2,
  8,
  80,
  {
    isStatic: true,
    render: {
      fillStyle: '#F0F0F0',
      strokeStyle: 'blue',
      lineWidth: 3,
    },
  }
);
World.add(engine.world, [octagon]);

function updateShape() {
  // Remove the old shape
  World.remove(engine.world, octagon);

  // Create a new "organic" shape
  octagon = createOrganicPolygon(
    window.innerWidth / 2,
    window.innerHeight / 2,
    8,
    80,
    {
      isStatic: true,
      render: {
        fillStyle: '#F0F0F0',
        strokeStyle: 'blue',
        lineWidth: 3,
      },
    }
  );

  // Add the new shape to the world
  World.add(engine.world, [octagon]);

  // Programmatically rotate the shape slightly
  Body.rotate(octagon, Math.PI / 180);
}

// Update the shape every second
setInterval(updateShape, 1000);
