// favicon-spinner.js

const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
  <path d="M11.4375 3L4.25 4.51515L3 10.5758L9.875 13L13 7.24242L11.4375 3Z" stroke="#fc79bc"/>
</svg>`;
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
const size = 16; // Size of the favicon
canvas.width = size;
canvas.height = size;
let angle = 0;

function updateFavicon() {
  ctx.clearRect(0, 0, size, size); // Clear the canvas
  ctx.save();
  ctx.translate(size / 2, size / 2); // Move to the center of the canvas
  ctx.rotate((angle * Math.PI) / 180); // Rotate the canvas
  ctx.translate(-size / 2, -size / 2); // Move back to the top-left corner

  const img = new Image();
  img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
  img.onload = () => {
    ctx.drawImage(img, 0, 0, size, size); // Draw the SVG onto the canvas
    ctx.restore();

    const favicon = document.getElementById('favicon');
    favicon.href = canvas.toDataURL('image/png'); // Update the favicon link
  };

  angle = (angle + 1) % 360; // Increment the angle for the next frame
  requestAnimationFrame(updateFavicon); // Request the next frame
}

updateFavicon(); // Start the animation
