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
