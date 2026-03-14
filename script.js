let allIssues = [];
let currentIssues = [];
let selectedIssueId = null;

// DOM Elements
const statusFilter = document.getElementById('status-filter');
const severityFilter = document.getElementById('severity-filter');
const issueListEl = document.getElementById('issue-list');
const issueCountEl = document.getElementById('issue-count');
const emptyStateEl = document.getElementById('empty-state');
const issueDetailEl = document.getElementById('issue-detail');
const searchInput = document.getElementById('search-input');
const highSeverityToggle = document.getElementById('high-severity-toggle');

// Initialize Dashboard
async function init() {
    statusFilter.addEventListener('change', filterIssues);
    severityFilter.addEventListener('change', filterIssues);
    searchInput.addEventListener('input', filterIssues);
    highSeverityToggle.addEventListener('change', filterIssues);
    await fetchIssues();
}

async function fetchIssues() {
    try {
        const response = await fetch('/api/issues');
        if (!response.ok) throw new Error('Failed to fetch issues');
        allIssues = await response.json();
        filterIssues();
    } catch (error) {
        console.error('Error fetching issues:', error);
        issueListEl.innerHTML = `<div class="list-empty-state"><p>Error connecting to API</p></div>`;
    }
}

// Function to filter issues by dropdown matches
function filterIssues() {
    const status = statusFilter.value;
    const severity = severityFilter.value;
    const query = searchInput.value.toLowerCase();
    const highSeverityOnly = highSeverityToggle.checked;

    currentIssues = allIssues.filter(issue => {
        const matchStatus = status === 'All' || issue.status === status;
        const matchSeverity = severity === 'All' || issue.severity === severity;
        const matchSearch = issue.title.toLowerCase().includes(query) || 
                            issue.description.toLowerCase().includes(query) ||
                            issue.id.toLowerCase().includes(query);
        
        const matchHighSeverityToggle = !highSeverityOnly || (issue.severity === 'High' || issue.severity === 'Critical');

        return matchStatus && matchSeverity && matchSearch && matchHighSeverityToggle;
    });

    const isSelectedStillVisible = currentIssues.find(i => i.id === selectedIssueId);

    if (!isSelectedStillVisible) {
        if (currentIssues.length > 0) {
            // Auto-select first element if currently selected element is filtered out
            selectIssue(currentIssues[0].id);
            return; // selectIssue handles rendering
        } else {
            // No issues match the filters
            selectedIssueId = null;
            emptyStateEl.style.display = 'flex';
            emptyStateEl.innerHTML = `
                <div class="empty-icon" style="opacity: 0.5;">🚫</div>
                <p>No issues match the selected filters</p>
            `;
            issueDetailEl.classList.add('hidden');
        }
    } else {
        // Restore standard empty state text just in case
        emptyStateEl.innerHTML = `
            <div class="empty-icon">📂</div>
            <p>Select an issue to view details</p>
        `;
    }

    renderList();
}

// Function to render the side issue-list
function renderList() {
    issueListEl.innerHTML = '';
    issueCountEl.textContent = currentIssues.length;

    if (currentIssues.length === 0) {
        issueListEl.innerHTML = `
            <div class="list-empty-state">
                <div class="empty-icon">🔍</div>
                <p>No issues found</p>
                <span>Try adjusting your filters or search</span>
            </div>
        `;
        return;
    }

    currentIssues.forEach(issue => {
        const card = document.createElement('div');
        card.className = `issue-card ${selectedIssueId === issue.id ? 'active' : ''}`;
        card.onclick = () => selectIssue(issue.id);

        const statusClass = `status-${issue.status.replace(' ', '').toLowerCase()}`;
        const severityClass = `severity-${issue.severity.toLowerCase()}`;

        card.innerHTML = `
            <div class="card-top">
                <span class="issue-id">${issue.id}</span>
                <span class="issue-date">${issue.date}</span>
            </div>
            <h3 class="card-title">${issue.title}</h3>
            <div class="card-badges">
                <span class="badge ${severityClass}">${issue.severity}</span>
                <span class="badge ${statusClass}">${issue.status}</span>
            </div>
        `;

        issueListEl.appendChild(card);
    });
}

// Handler for when an item from the list is clicked
function selectIssue(id) {
    selectedIssueId = id;
    renderList(); // Re-render to highlight active item
    
    const issue = allIssues.find(i => i.id === id);
    if (issue) {
        renderDetail(issue);
    }
}

// Function to inject detailed content to the right side
function renderDetail(issue) {
    emptyStateEl.style.display = 'none';
    issueDetailEl.classList.remove('hidden');

    const statusClass = `status-${issue.status.replace(' ', '').toLowerCase()}`;
    const severityClass = `severity-${issue.severity.toLowerCase()}`;

    // Reset animation to retrigger for UX delight
    issueDetailEl.style.animation = 'none';
    issueDetailEl.offsetHeight; /* trigger browser reflow */
    issueDetailEl.style.animation = null;

    issueDetailEl.innerHTML = `
        <div class="detail-header">
            <div class="detail-top">
                <span class="detail-id">${issue.id}</span>
                <div class="card-badges">
                    <span class="badge ${severityClass}">${issue.severity}</span>
                    <span class="badge ${statusClass}">${issue.status}</span>
                </div>
            </div>
            <h2 class="detail-title">${issue.title}</h2>
            <div class="detail-meta">
                <div class="meta-item">
                    <span>👤</span>
                    <span>${issue.reporter}</span>
                </div>
                <div class="meta-item">
                    <span>📅</span>
                    <span>${issue.date}</span>
                </div>
            </div>
        </div>
        <div class="detail-body">
            <h3>Description</h3>
            <div class="detail-description">${issue.description}</div>
        </div>
    `;
}

// Boot application
init();
