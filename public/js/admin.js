// Admin dashboard functionality
document.addEventListener('DOMContentLoaded', function() {
    let applicants = [];
    let filteredApplicants = [];
    
    // DOM elements
    const searchInput = document.getElementById('search-input');
    const positionFilter = document.getElementById('position-filter');
    const departmentFilter = document.getElementById('department-filter');
    const applicationsTableBody = document.getElementById('applications-table-body');
    const applicationsContainer = document.getElementById('applications-container');
    const noApplicationsDiv = document.getElementById('no-applications');
    const filteredCountSpan = document.getElementById('filtered-count');
    const tableDescription = document.getElementById('table-description');
    
    // Stats elements
    const totalCountSpan = document.getElementById('total-count');
    const internCountSpan = document.getElementById('intern-count');
    const volunteerCountSpan = document.getElementById('volunteer-count');
    
    // Initialize dashboard
    init();
    
    async function init() {
        await loadStats();
        await loadApplicants();
        await loadDepartments();
        setupEventListeners();
    }
    
    // Load statistics
    async function loadStats() {
        try {
            const response = await fetch('/api/stats');
            const stats = await response.json();
            
            totalCountSpan.textContent = stats.total || 0;
            internCountSpan.textContent = stats.interns || 0;
            volunteerCountSpan.textContent = stats.volunteers || 0;
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }
    
    // Load all applicants
    async function loadApplicants() {
        try {
            const response = await fetch('/api/applicants');
            applicants = await response.json();
            filteredApplicants = [...applicants];
            
            renderApplicants();
            updateUI();
        } catch (error) {
            console.error('Error loading applicants:', error);
            showError('Failed to load applications');
        }
    }
    
    // Load departments for filter
    async function loadDepartments() {
        try {
            const response = await fetch('/api/departments');
            const departments = await response.json();
            
            // Clear existing options (except "All Departments")
            departmentFilter.innerHTML = '<option value="all">All Departments</option>';
            
            // Add department options
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = utils.capitalize(dept.replace('-', ' '));
                departmentFilter.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading departments:', error);
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Search functionality with debounce
        searchInput.addEventListener('input', utils.debounce(filterApplicants, 300));
        
        // Filter functionality
        positionFilter.addEventListener('change', filterApplicants);
        departmentFilter.addEventListener('change', filterApplicants);
    }
    
    // Filter applicants based on search and filters
    function filterApplicants() {
        const searchTerm = searchInput.value.toLowerCase();
        const positionType = positionFilter.value;
        const department = departmentFilter.value;
        
        filteredApplicants = applicants.filter(applicant => {
            const matchesSearch = 
                applicant.name.toLowerCase().includes(searchTerm) ||
                applicant.email.toLowerCase().includes(searchTerm) ||
                applicant.department.toLowerCase().includes(searchTerm);
            
            const matchesPosition = positionType === 'all' || applicant.position_type === positionType;
            const matchesDepartment = department === 'all' || applicant.department === department;
            
            return matchesSearch && matchesPosition && matchesDepartment;
        });
        
        renderApplicants();
        updateUI();
    }
    
    // Render applicants table
    function renderApplicants() {
        applicationsTableBody.innerHTML = '';
        
        if (filteredApplicants.length === 0) {
            return;
        }
        
        filteredApplicants.forEach(applicant => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.innerHTML = `
                <td style="font-weight: 500;">${escapeHtml(applicant.name)}</td>
                <td>${escapeHtml(applicant.email)}</td>
                <td>
                    <span class="badge ${applicant.position_type === 'intern' ? 'badge-primary' : 'badge-secondary'}">
                        ${utils.capitalize(applicant.position_type)}
                    </span>
                </td>
                <td style="text-transform: capitalize;">${escapeHtml(applicant.department.replace('-', ' '))}</td>
                <td>${utils.formatDate(applicant.submitted_at)}</td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="viewApplicant(${applicant.id})">
                        <i class="fas fa-eye"></i>
                        View
                    </button>
                </td>
            `;
            
            // Add click handler for row
            row.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    viewApplicant(applicant.id);
                }
            });
            
            applicationsTableBody.appendChild(row);
        });
    }
    
    // Update UI based on current state
    function updateUI() {
        filteredCountSpan.textContent = filteredApplicants.length;
        
        if (applicants.length === 0) {
            utils.hide(applicationsContainer);
            utils.show(noApplicationsDiv);
            noApplicationsDiv.textContent = 'No applications submitted yet.';
            tableDescription.textContent = '';
        } else if (filteredApplicants.length === 0) {
            utils.hide(applicationsContainer);
            utils.show(noApplicationsDiv);
            noApplicationsDiv.textContent = 'No applications match your current filters.';
            tableDescription.textContent = 'No applications match your current filters.';
        } else {
            utils.show(applicationsContainer);
            utils.hide(noApplicationsDiv);
            tableDescription.textContent = 'Click on any row to view detailed information.';
        }
    }
    
    // View applicant details
    window.viewApplicant = function(id) {
        const applicant = applicants.find(a => a.id === id);
        if (!applicant) {
            showError('Applicant not found');
            return;
        }
        
        showApplicantModal(applicant);
    };
    
    // Show applicant modal
    function showApplicantModal(applicant) {
        const modalBodyContent = document.getElementById('modal-body-content');
        
        modalBodyContent.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <h4 style="margin-bottom: 0.25rem;">Name</h4>
                    <p>${escapeHtml(applicant.name)}</p>
                </div>
                <div>
                    <h4 style="margin-bottom: 0.25rem;">Position Type</h4>
                    <span class="badge ${applicant.position_type === 'intern' ? 'badge-primary' : 'badge-secondary'}">
                        ${utils.capitalize(applicant.position_type)}
                    </span>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <h4 style="margin-bottom: 0.25rem; display: flex; align-items: center;">
                        <i class="fas fa-envelope" style="margin-right: 0.25rem;"></i>
                        Email
                    </h4>
                    <p>${escapeHtml(applicant.email)}</p>
                </div>
                <div>
                    <h4 style="margin-bottom: 0.25rem; display: flex; align-items: center;">
                        <i class="fas fa-phone" style="margin-right: 0.25rem;"></i>
                        Phone
                    </h4>
                    <p>${applicant.phone ? escapeHtml(applicant.phone) : 'Not provided'}</p>
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <h4 style="margin-bottom: 0.25rem;">Department</h4>
                <p style="text-transform: capitalize;">${escapeHtml(applicant.department.replace('-', ' '))}</p>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <h4 style="margin-bottom: 0.25rem;">Experience</h4>
                <div style="background-color: var(--secondary-color); padding: 0.75rem; border-radius: var(--border-radius); font-size: 0.875rem;">
                    ${applicant.experience ? escapeHtml(applicant.experience) : 'No experience provided'}
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <h4 style="margin-bottom: 0.25rem;">Motivation</h4>
                <div style="background-color: var(--secondary-color); padding: 0.75rem; border-radius: var(--border-radius); font-size: 0.875rem;">
                    ${applicant.motivation ? escapeHtml(applicant.motivation) : 'No motivation provided'}
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <h4 style="margin-bottom: 0.25rem;">Availability</h4>
                <div style="background-color: var(--secondary-color); padding: 0.75rem; border-radius: var(--border-radius); font-size: 0.875rem;">
                    ${applicant.availability ? escapeHtml(applicant.availability) : 'No availability information provided'}
                </div>
            </div>
            
            <div>
                <h4 style="margin-bottom: 0.25rem; display: flex; align-items: center;">
                    <i class="fas fa-calendar" style="margin-right: 0.25rem;"></i>
                    Submitted
                </h4>
                <p>${utils.formatDate(applicant.submitted_at)}</p>
            </div>
        `;
        
        const modal = document.getElementById('application-modal');
        modal.classList.add('show');
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
    
    // Close modal
    window.closeModal = function() {
        const modal = document.getElementById('application-modal');
        modal.classList.remove('show');
    };
    
    // Handle escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // Show error message
    function showError(message) {
        console.error(message);
        // You could implement a toast notification system here
        alert(message);
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, function(m) { return map[m]; });
    }
    
    // Auto-refresh data every 30 seconds
    setInterval(async () => {
        await loadStats();
        await loadApplicants();
    }, 30000);
});