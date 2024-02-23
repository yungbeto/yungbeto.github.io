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
