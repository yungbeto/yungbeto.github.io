document.addEventListener('DOMContentLoaded', function () {
  const projectsRoot = document.getElementById('projects-root');
  if (!projectsRoot) return;

  fetch('src/projects.json')
    .then((response) => response.json())
    .then((projects) => {
      projects.forEach((project) => {
        const mediaHtml = project.media
          .map((m) => {
            if (m.type === 'video') {
              return `<video class="project-video" autoplay loop muted playsinline preload="auto">
            <source src="${m.src}" type="video/mp4">
            Your browser does not support the video tag.
          </video>`;
            }
            return `<img class="project-video" src="${m.src}" alt="${project.name}">`;
          })
          .join('\n');

        const featureButtonHtml = project.featureButton
          ? `<a href="${project.featureButton.url}" target="_blank" class="feature-button">
        <img src="/src/img/icons/star.svg">
        ${project.featureButton.text}
      </a>`
          : '';

        const container = document.createElement('div');
        container.className = 'container';
        container.id = project.id;
        container.innerHTML = `
          <div class="inner-container project-container">
            <div class="sideProjects">
              <div class="sideProjectList">
                <div class="project">
                  <div class="project-body">
                    <div class="project-title">
                      <a href="${project.url}" target="_blank" class="project-name">
                        <h4>${project.name}</h4>
                        <img src="src/img/icons/external.svg" alt="">
                      </a>
                      <a href="${project.url}" target="_blank" class="url">${project.url}</a>
                      <p class="gray-text">${project.year}</p>
                    </div>
                    <p>${project.description}</p>
                    ${featureButtonHtml}
                  </div>
                  <div class="project-head">
                    <a href="${project.url}" target="_blank">
                      ${mediaHtml}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        projectsRoot.appendChild(container);
      });
    })
    .catch((error) => {
      console.error('Error loading projects:', error);
      projectsRoot.innerHTML =
        '<div class="inner-container"><p>Failed to load projects. Please try again later.</p></div>';
    });
});
