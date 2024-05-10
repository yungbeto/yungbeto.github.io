document.addEventListener('DOMContentLoaded', function () {
  const jobsList = document.querySelector('.jobs');

  fetch('../src/jobs.json') // Make sure the path to your JSON file is correct
    .then((response) => response.json())
    .then((data) => {
      data.forEach((job) => {
        const jobElement = document.createElement('li');
        // jobElement.classList.add('job');
        jobElement.innerHTML = `
        <a href="${job.URL}" class="job" target="_blank"> 
        <div class="job_head">
                        <img class="company-icon" src="${job.CompanyIcon}">
                        <div class="job_info">
                            <p>${job.Company}</p>
                            <p class="gray-text">${job.DateRange}</p>
                            <p class="phone-only gray-text">${job.JobRole}</p>
                        </div>
                    </div>
                    <p class="desktop-only gray-text">${job.JobRole}</p>
                    </a>
                `;
        jobsList.appendChild(jobElement);
      });
    })
    .catch((error) => console.error('Error loading job data:', error));
});
