document.addEventListener('DOMContentLoaded', function () {
  const jobsList = document.querySelector('.jobs');

  fetch('../src/jobs.json')
    .then((response) => response.json())
    .then((data) => {
      data.forEach((job) => {
        const jobElement = document.createElement('li');
        jobElement.innerHTML = `
          <div class="job" style="cursor: pointer;" tabindex="0" aria-expanded="false">
            <div class="job-bar">
              <div class="job_head">
                <img class="company-icon" src="${job.CompanyIcon}">
                <div class="job-info">
                  <p class="job-company">${job.Company}</p>
                  <p class="gray-text">${job.DateRange}</p>
                  <p class="phone-only gray-text">${job.JobRole}</p>
                </div>
              </div>
              <p class="desktop-only gray-text">${job.JobRole}</p>
            </div>
            <div class="job-description" style="max-height: 0; overflow: hidden;">
              ${job.JobDescription}
            </div>
          </div>
        `;
        jobsList.appendChild(jobElement);
      });

      jobsList.addEventListener('click', function (event) {
        const job = event.target.closest('.job');
        if (!job) return;

        const description = job.querySelector('.job-description');
        const isOpen = job.getAttribute('aria-expanded') === 'true';

        // Reset all descriptions and job outlines
        jobsList.querySelectorAll('.job-description').forEach((desc) => {
          desc.style.maxHeight = '0';
        });
        jobsList.querySelectorAll('.job').forEach((j) => {
          j.setAttribute('aria-expanded', 'false');
          j.classList.remove('outlined');
        });

        // Expand the clicked one if it was not open
        if (!isOpen) {
          description.style.maxHeight = `${description.scrollHeight}px`;
          job.setAttribute('aria-expanded', 'true');
          job.classList.add('outlined');
        }
      });
    })
    .catch((error) => {
      console.error('Error loading job data:', error);
      jobsList.innerHTML =
        '<p>Failed to load jobs. Please try again later.</p>';
    });
});
