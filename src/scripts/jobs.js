document.addEventListener('DOMContentLoaded', function () {
  const jobsList = document.querySelector('.jobs');

  fetch('../src/jobs.json') // Make sure the path to your JSON file is correct
    .then((response) => response.json())
    .then((data) => {
      data.forEach((job) => {
        const jobElement = document.createElement('li');
        jobElement.classList.add('job');
        jobElement.innerHTML = `
                    <div class="job_head">
                        <img class="company-icon" src="${job.CompanyIcon}">
                        <div class="job_info">
                            <p>${job.Company}</p>
                            <p class="gray-text">${job.DateRange}</p>
                            <p class="phone-only gray-text">${job.JobRole}</p>
                        </div>
                    </div>
                    <p class="desktop-only gray-text">${job.JobRole}</p>
                `;
        jobsList.appendChild(jobElement);
      });
    })
    .catch((error) => console.error('Error loading job data:', error));
});
