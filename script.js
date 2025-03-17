
let filteredJobs = [];
let currentJobType = 'fulltime'; // Track the current job type
let jobTypes = new Set();
let locations = new Set();

document.addEventListener("DOMContentLoaded", function () {
    // Select the sidebar links
    const fulltimeJobsLink = document.getElementById("fulltime-jobs-link");
    const otherJobsLink = document.getElementById("other-jobs-link");
    
    // Select search elements
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const clearSearchButton = document.getElementById("clear-search");
    
    // Select filter elements
    const jobTypeFilter = document.getElementById("job-type-filter");
    const locationFilter = document.getElementById("location-filter");
    const salaryFilter = document.getElementById("salary-filter");
    const remoteFilter = document.getElementById("remote-filter");
    const clearFiltersButton = document.getElementById("clear-filters");
    const activeFiltersContainer = document.getElementById("active-filters");
    const resultsCountContainer = document.getElementById("results-count");

    // Function to update active link styling
    function updateActiveLink(activeLink) {
        // Reset all links to inactive state
        [fulltimeJobsLink, otherJobsLink].forEach(link => {
            link.classList.remove("text-blue-600", "bg-gray-100");
            link.classList.add("text-gray-600", "hover:text-gray-900", "hover:bg-gray-50");

            // Also update SVG color
            const svg = link.querySelector("svg");
            if (svg) {
                svg.classList.remove("text-blue-600");
                svg.classList.add("text-gray-400", "group-hover:text-gray-500");
            }
        });

        // Set active link
        activeLink.classList.remove("text-gray-600", "hover:text-gray-900", "hover:bg-gray-50");
        activeLink.classList.add("text-blue-600", "bg-gray-100");

        // Update SVG color for active link
        const activeSvg = activeLink.querySelector("svg");
        if (activeSvg) {
            activeSvg.classList.remove("text-gray-400", "group-hover:text-gray-500");
            activeSvg.classList.add("text-blue-600");
        }
    }

    // Add event listeners to the links
    if (fulltimeJobsLink) {
        fulltimeJobsLink.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default link behavior
            updateActiveLink(fulltimeJobsLink);
            currentJobType = 'fulltime';
            resetFilters();
            fetchFullTimeJobs();
        });
    }

    if (otherJobsLink) {
        otherJobsLink.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default link behavior
            updateActiveLink(otherJobsLink);
            currentJobType = 'other';
            resetFilters();
            fetchOtherJobs();
        });
    }

    // Fetch fulltime jobs on page load and set it as active by default
    fetchFullTimeJobs();
    updateActiveLink(fulltimeJobsLink);

    // Function to fetch fulltime jobs
    async function fetchFullTimeJobs() {
        try {
            const response = await fetch("/jobs/fulltime");
            const jobs = await response.json();
            currentJobs = jobs; // Store the current jobs
            filteredJobs = [...jobs]; // Initial filtered jobs is all jobs
            populateFilterOptions(jobs);
            displayJobs(jobs);
            updateResultsCount(jobs.length);
        } catch (error) {
            console.error("Error fetching fulltime jobs:", error);
            const jobListingsContainer = document.getElementById("job-listings");
            jobListingsContainer.innerHTML = "<p>Error loading jobs. Please try again later.</p>";
        }
    }

    // Function to fetch other jobs
    async function fetchOtherJobs() {
        try {
            const response = await fetch("/jobs/othertime");
            const jobs = await response.json();
            currentJobs = jobs; // Store the current jobs
            filteredJobs = [...jobs]; // Initial filtered jobs is all jobs
            populateFilterOptions(jobs);
            displayJobs(jobs);
            updateResultsCount(jobs.length);
        } catch (error) {
            console.error("Error fetching other jobs:", error);
            const jobListingsContainer = document.getElementById("job-listings");
            jobListingsContainer.innerHTML = "<p>Error loading jobs. Please try again later.</p>";
        }
    }

    // Function to populate filter options
    function populateFilterOptions(jobs) {
        // Clear existing options but keep the default "All" option
        jobTypeFilter.innerHTML = '<option value="">All Types</option>';
        locationFilter.innerHTML = '<option value="">All Locations</option>';
        
        // Reset our sets
        jobTypes = new Set();
        locations = new Set();
        
        // Collect unique values
        jobs.forEach(job => {
            if (job.type) jobTypes.add(job.type);
            if (job.location) locations.add(job.location);
        });
        
        // Add job type options
        jobTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            jobTypeFilter.appendChild(option);
        });
        
        // Add location options
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationFilter.appendChild(option);
        });
    }

    // Add search functionality
    searchButton.addEventListener("click", applyFilters);
    
    // Enable search on pressing Enter key
    searchInput.addEventListener("keyup", function(event) {
        if (event.key === "Enter") {
            applyFilters();
        }
    });
    
    // Clear search results
    clearSearchButton.addEventListener("click", function() {
        searchInput.value = "";
        applyFilters();
    });
    
    // Add event listeners for filters
    jobTypeFilter.addEventListener("change", applyFilters);
    locationFilter.addEventListener("change", applyFilters);
    salaryFilter.addEventListener("change", applyFilters);
    remoteFilter.addEventListener("change", applyFilters);
    
    // Clear all filters
    clearFiltersButton.addEventListener("click", resetFilters);
    
    // Function to reset all filters
    function resetFilters() {
        searchInput.value = "";
        jobTypeFilter.value = "";
        locationFilter.value = "";
        salaryFilter.value = "";
        remoteFilter.checked = false;
        
        // Clear active filters display
        activeFiltersContainer.innerHTML = "";
        activeFiltersContainer.classList.add("hidden");
        
        // Apply filters (which will now show all jobs)
        filteredJobs = [...currentJobs];
        displayJobs(filteredJobs);
        updateResultsCount(filteredJobs.length);
    }
    
    // Function to apply filters
    function applyFilters() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const jobType = jobTypeFilter.value;
        const location = locationFilter.value;
        const salaryRange = salaryFilter.value;
        const remoteOnly = remoteFilter.checked;
        
        // Filter jobs based on all criteria
        filteredJobs = currentJobs.filter(job => {
            // Search term filter
            const matchesSearch = searchTerm === "" || 
                (job.title && job.title.toLowerCase().includes(searchTerm)) ||
                (job.company && job.company.toLowerCase().includes(searchTerm)) ||
                (job.description && job.description.toLowerCase().includes(searchTerm)) ||
                (job.location && job.location.toLowerCase().includes(searchTerm)) ||
                (job.type && job.type.toLowerCase().includes(searchTerm));
            
            // Job type filter
            const matchesType = jobType === "" || (job.type === jobType);
            
            // Location filter
            const matchesLocation = location === "" || (job.location === location);
            
            // Remote filter
            const matchesRemote = !remoteOnly || (job.location && job.location.toLowerCase() === "remote");
            
            // Salary range filter
            let matchesSalary = true;
            if (salaryRange !== "") {
                const jobSalary = parseSalary(job.salary_range);
                if (jobSalary !== null) {
                    // Parse the selected salary range
                    if (salaryRange === "0-7.99") {
                        matchesSalary = jobSalary <= 7.99;
                    } else if (salaryRange === "8-12") {
                        matchesSalary = jobSalary > 8 && jobSalary <= 12;
                    } else if (salaryRange === "12-15") {
                        matchesSalary = jobSalary > 12 && jobSalary <= 15;
                    } else if (salaryRange === "15+") {
                        matchesSalary = jobSalary > 15;
                    }
                }
            }
            
            return matchesSearch && matchesType && matchesLocation && matchesRemote && matchesSalary;
        });
        
        // Update active filters display
        updateActiveFilters(searchTerm, jobType, location, salaryRange, remoteOnly);
        
        // Display filtered jobs
        displayJobs(filteredJobs);
        updateResultsCount(filteredJobs.length);
    }
    
    // Function to parse salary from string
    function parseSalary(salaryString) {
        if (!salaryString) return null;
    
        // Extract numbers from the string
        const numbers = salaryString.match(/\d+[,\d]*/g);
        if (!numbers || numbers.length === 0) return null;
    
        // If there's a range, use the average
        if (numbers.length >= 2) {
            const min = parseInt(numbers[0].replace(/,/g, ''));
            const max = parseInt(numbers[1].replace(/,/g, ''));
            return (min + max) / 2;
        } else {
            // If there's just one number, use that
            return parseInt(numbers[0].replace(/,/g, ''));
        }
    }
        
        // Function to update active filters display
        function updateActiveFilters(searchTerm, jobType, location, salaryRange, remoteOnly) {
            activeFiltersContainer.innerHTML = "";
            let hasActiveFilters = false;
            
            // Add filter tags for each active filter
            if (searchTerm) {
                addFilterTag(`Search: ${searchTerm}`);
                hasActiveFilters = true;
            }
            
            if (jobType) {
                addFilterTag(`Type: ${jobType}`);
                hasActiveFilters = true;
            }
            
            if (location) {
                addFilterTag(`Location: ${location}`);
                hasActiveFilters = true;
            }
            
            if (salaryRange) {
                let salaryText;
                switch(salaryRange) {
                    case "0-7.99": salaryText = "Under 8 Lpa"; break;
                    case "8-12": salaryText = "$8-12 Lpa"; break;
                    case "12-15": salaryText = "$12-15 Lpa"; break;
                    case "15+": salaryText = "15 Lpa +"; break;
                }
                addFilterTag(`Salary: ${salaryText}`);
                hasActiveFilters = true;
            }
            
            if (remoteOnly) {
                addFilterTag("Remote Only");
                hasActiveFilters = true;
            }
            
            // Show or hide the active filters container
            if (hasActiveFilters) {
                activeFiltersContainer.classList.remove("hidden");
            } else {
                activeFiltersContainer.classList.add("hidden");
            }
        }
        
        // Function to add a filter tag
        function addFilterTag(text) {
            const tag = document.createElement("span");
            tag.className = "inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full";
            tag.innerHTML = `
                ${text}
                <button type="button" class="ml-1 inline-flex items-center p-0.5 text-blue-400 hover:text-blue-900 rounded-full hover:bg-blue-200">
                    <svg aria-hidden="true" class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            `;
            
            // Add click event to remove this specific filter
            const removeButton = tag.querySelector("button");
            removeButton.addEventListener("click", () => {
                // Reset the corresponding filter
                if (text.startsWith("Search:")) {
                    searchInput.value = "";
                } else if (text.startsWith("Type:")) {
                    jobTypeFilter.value = "";
                } else if (text.startsWith("Location:")) {
                    locationFilter.value = "";
                } else if (text.startsWith("Salary:")) {
                    salaryFilter.value = "";
                } else if (text === "Remote Only") {
                    remoteFilter.checked = false;
                }
                
                // Reapply filters
                applyFilters();
            });
            
            activeFiltersContainer.appendChild(tag);
        }
        
        // Function to update results count
        function updateResultsCount(count) {
            resultsCountContainer.textContent = `Showing ${count} ${count === 1 ? 'job' : 'jobs'}`;
        }

        // Function to display jobs
        function displayJobs(jobs) {
            const jobListingsContainer = document.getElementById("job-listings");
            jobListingsContainer.innerHTML = ""; // Clear previous jobs

            if (jobs.length === 0) {
                jobListingsContainer.innerHTML = "<p class='text-center py-4'>No jobs found matching your criteria.</p>";
                return;
            }

            jobs.forEach(job => {
                const jobCard = document.createElement("div");
                jobCard.className = "p-4 border rounded-md shadow-md bg-white relative mb-4";

                // Add a badge for remote jobs if applicable
                const remoteBadge = job.location && job.location.toLowerCase() === "remote" ?
                    `<span class="absolute top-4 right-20 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Remote</span>` : '';

                jobCard.innerHTML = `
            <!-- Apply Button (Top Right Corner) -->
            <a href="${job.company_link}" target="_blank" class="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">
                Apply
            </a>
            ${remoteBadge}

            <!-- Company Name and Job Title -->
            <div class="flex items-start mb-3">
                <div>
                    <h2 class="text-xl font-semibold">${job.title}</h2>
                    <p class="text-gray-700 font-medium">${job.company || 'Company'}</p>
                </div>
            </div>

            <!-- Job Description -->
            <p class="text-gray-600 mb-3">${job.description}</p>

            <!-- Job Metadata -->
            <div class="flex flex-wrap gap-2 mb-3">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ${job.type}
                </span>
            </div>

            <!-- Salary and Location (Side by Side) -->
            <div class="flex justify-between items-center mt-4 text-gray-700 border-t pt-3">
                <span class="flex items-center">
                    <svg class="w-5 h-5 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    ${job.salary_range}
                </span>
                <span class="flex items-center">
                    <svg class="w-5 h-5 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    ${job.location}
                </span>
            </div>

            <!-- View Details Link -->
            <div class="mt-3">
                <a href="${job.link}" class="text-blue-600 hover:text-blue-800 font-medium">
                    View Details
                    <svg class="w-4 h-4 inline-block ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </a>
            </div>
        `;

                jobListingsContainer.appendChild(jobCard);
            });
        }
    });