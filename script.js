// Mock data simulating issue representations
const mockIssues = [
    {
        id: 'BUG-101',
        title: 'Application crashes on startup when offline',
        status: 'Open',
        severity: 'Critical',
        date: '2026-03-14',
        reporter: 'Alice Smith',
        description: 'When starting the application without an active internet connection, it crashes immediately with a NullPointerException in the NetworkManager module.\n\nSteps to reproduce:\n1. Disconnect from network.\n2. Launch app.\n3. Observe crash.\n\nExpected behavior: App should show an offline mode message instead of crashing completely.'
    },
    {
        id: 'BUG-102',
        title: 'Dark mode toggle icon does not update',
        status: 'In Progress',
        severity: 'Low',
        date: '2026-03-13',
        reporter: 'Bob Jones',
        description: 'The moon/sun icon on the settings page stays as a moon even when the theme transitions to light mode. It functions correctly but visually is confusing to end-users.'
    },
    {
        id: 'BUG-103',
        title: 'Data export fails for payload > 50MB',
        status: 'Open',
        severity: 'High',
        date: '2026-03-12',
        reporter: 'Charlie Brown',
        description: 'Exporting user analytics data times out if the resulting CSV exceeds 50MB. The server returns a 504 Gateway Timeout.\n\nSuggested fix: Implement chunked streaming for the export endpoint or run it as an async job that returns a download link later via webhook or websockets.'
    },
    {
        id: 'BUG-104',
        title: 'Typo in welcome email',
        status: 'Closed',
        severity: 'Low',
        date: '2026-03-10',
        reporter: 'Dana White',
        description: 'The onboarding email spells "Dashboard" as "Dashbord". This needs to be corrected in the localization and email templates.'
    },
    {
        id: 'BUG-105',
        title: 'Memory leak in real-time graph component',
        status: 'In Progress',
        severity: 'Critical',
        date: '2026-03-14',
        reporter: 'Eve Adams',
        description: 'The real-time metrics graph does not clear old WebGL buffers, causing the browser tab memory to balloon over a few hours until it crashes the tab.\n\nRequires an explicit cleanup on component unmount and taking care of the buffer arrays correctly.'
    },
    {
        id: 'BUG-106',
        title: 'Avatar upload accepts non-image files',
        status: 'Open',
        severity: 'Medium',
        date: '2026-03-14',
        reporter: 'Frank Castle',
        description: 'Users can upload .exe or .pdf files as their profile picture. The client-side validation is missing and server-side just saves it. This is a potential security issue that needs fixing before production release.'
    }
];

let currentIssues = [...mockIssues];
let selectedIssueId = null;

// DOM Elements
const statusFilter = document.getElementById('status-filter');
const severityFilter = document.getElementById('severity-filter');
const issueListEl = document.getElementById('issue-list');
const issueCountEl = document.getElementById('issue-count');
const emptyStateEl = document.getElementById('empty-state');
const issueDetailEl = document.getElementById('issue-detail');
const searchInput = document.getElementById('search-input');

// Initialize Dashboard
function init() {
    statusFilter.addEventListener('change', filterIssues);
    severityFilter.addEventListener('change', filterIssues);
    searchInput.addEventListener('input', filterIssues);
    renderList();
}

// Function to filter issues by dropdown matches
function filterIssues() {
    const status = statusFilter.value;
    const severity = severityFilter.value;
    const query = searchInput.value.toLowerCase();

    currentIssues = mockIssues.filter(issue => {
        const matchStatus = status === 'All' || issue.status === status;
        const matchSeverity = severity === 'All' || issue.severity === severity;
        const matchSearch = issue.title.toLowerCase().includes(query) || 
                            issue.description.toLowerCase().includes(query) ||
                            issue.id.toLowerCase().includes(query);
                            
        return matchStatus && matchSeverity && matchSearch;
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
    
    const issue = mockIssues.find(i => i.id === id);
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
