//SHOWCASE 01 - Music Player Showcase
document.addEventListener('DOMContentLoaded', function () {
  const musicPlayerContainer = document.getElementById('musicPlayerShowcase');

  // Dynamically create and append images to the music player showcase
  for (let i = 1; i <= 12; i++) {
    const img = document.createElement('img');
    const imgNumber = i.toString().padStart(2, '0');
    img.src = `media/tablet/musicPlayers/musicPlayer${imgNumber}.png`;
    img.alt = `Music Player ${imgNumber}`;
    musicPlayerContainer.appendChild(img);
  }

  // Clone the images for infinite scroll effect without empty space
  [...musicPlayerContainer.children].forEach((img) => {
    const clone = img.cloneNode(true);
    musicPlayerContainer.appendChild(clone);
  });
});

document.addEventListener('DOMContentLoaded', function () {
  function loadImagesAndEnsureContinuousScroll(containerId, imagePaths) {
    const container = document.getElementById(containerId);
    let imagesLoaded = 0;
    let imagesToLoad = imagePaths.length; // Counter for images loading

    imagePaths.forEach((path) => {
      const img = document.createElement('img');
      img.onload = function () {
        imagesLoaded++;
        if (imagesLoaded === imagesToLoad) {
          // Only clone images after all have loaded
          cloneImagesForContinuousScroll();
        }
      };
      img.src = path;
      img.alt = '';
      container.appendChild(img);
    });

    function cloneImagesForContinuousScroll() {
      // Assuming each image has a rough width, calculate how many clones you need
      const estimatedImageWidth = 200; // This should be adjusted based on your actual images
      const screenWidth = window.innerWidth;
      const totalImages =
        Math.ceil((screenWidth * 2) / estimatedImageWidth) / imagePaths.length;

      for (let i = 0; i < totalImages; i++) {
        imagePaths.forEach((path) => {
          const clone = document.createElement('img');
          clone.src = path;
          clone.alt = '';
          container.appendChild(clone);
        });
      }
    }
  }

  // Define image paths for both showcases
  const diagramPaths = [
    'media/cavnue/diagrams/diagram-01.png',
    'media/cavnue/diagrams/diagram-02.png',
    'media/cavnue/diagrams/diagram-03.png',
    'media/cavnue/diagrams/diagram-04.png',
  ];

  const sketchPaths = [
    'media/cavnue/sketches/Sketch-01.png',
    'media/cavnue/sketches/Sketch-02.png',
    'media/cavnue/sketches/Sketch-03.png',
    'media/cavnue/sketches/Sketch-04.png',
    'media/cavnue/sketches/Sketch-05.png',
    'media/cavnue/sketches/Sketch-06.png',
  ];

  // Load images into their respective containers
  loadImagesAndEnsureContinuousScroll('researchShowcase01', diagramPaths);
  loadImagesAndEnsureContinuousScroll('researchShowcase02', sketchPaths);
});

// FADE UP
document.addEventListener('DOMContentLoaded', function () {
  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          // Optional: Unobserve the target if you only want the animation to play once
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '0px',
      threshold: 0.1, // Adjust based on when you want the animation to start
    }
  );

  // Select and observe each .overviewCard
  document.querySelectorAll('.overviewCard').forEach((card) => {
    observer.observe(card);
  });
});
