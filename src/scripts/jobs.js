document.addEventListener('DOMContentLoaded', function () {
  const jobsList = document.querySelector('.jobs');

  fetch('../src/jobs.json') // Ensure the path to your JSON file is correct
    .then((response) => response.json())
    .then((data) => {
      const jobElements = []; // To store references to all job elements

      data.forEach((job) => {
        const jobElement = document.createElement('li');
        jobElement.innerHTML = `
        <div class="job" style="cursor: pointer;">
          <div class="job-bar">
            <div class="job_head">
              <img class="company-icon" src="${job.CompanyIcon}">
                <div class="job-info">
                  <p>${job.Company}</p>
                  <p class="gray-text">${job.DateRange}</p>
                  <p class="phone-only gray-text">${job.JobRole}</p>
                </div>
            </div>
            <p class="desktop-only gray-text">${job.JobRole}</p>
          </div>
          <div class="job-description" style="display: none;">
            ${job.JobDescription}
          </div>
        </div>
        `;
        jobsList.appendChild(jobElement);
        jobElements.push(jobElement); // Add to the array of job elements

        // Find the job bar and description in this jobElement and attach a click event
        const jobBar = jobElement.querySelector('.job');
        const description = jobElement.querySelector('.job-description');

        jobBar.addEventListener('click', () => {
          const isOpen = description.style.display === 'block';

          // Close all job descriptions
          jobElements.forEach((el) => {
            el.querySelector('.job-description').style.display = 'none';
            el.querySelector('.job').classList.remove('outlined');
          });

          // Toggle visibility and scroll if closing
          if (!isOpen) {
            description.style.display = 'block';
            jobBar.classList.add('outlined');
          } else {
            jobBar.classList.remove('outlined');
            if (isElementOutOfView(jobElement)) {
              scrollToElement(jobElement);
            }
          }
        });
      });
    })
    .catch((error) => console.error('Error loading job data:', error));
});

function scrollToElement(element) {
  const topPos = element.getBoundingClientRect().top + window.pageYOffset;
  window.scrollTo({
    top: topPos,
    behavior: 'smooth',
  });
}

function isElementOutOfView(elem) {
  const rect = elem.getBoundingClientRect();
  return rect.top < 0 || rect.bottom < 0;
}
