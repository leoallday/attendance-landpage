// Global variables
let attendanceFiles = [];
let filteredFiles = [];
let isDarkMode = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
    loadAttendanceFiles();
    setupEventListeners();
});

// Dark Mode Management
function initializeDarkMode() {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('attendance-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    isDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);

    // Apply the theme
    applyTheme(isDarkMode);

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('attendance-theme')) {
            isDarkMode = e.matches;
            applyTheme(isDarkMode);
        }
    });
}

function applyTheme(dark) {
    const root = document.documentElement;
    const toggleButton = document.getElementById('darkModeToggle');
    const toggleIcon = toggleButton?.querySelector('.toggle-icon');
    const toggleText = toggleButton?.querySelector('.toggle-text');

    if (dark) {
        root.setAttribute('data-theme', 'dark');
        if (toggleIcon) toggleIcon.textContent = '☀️';
        if (toggleText) toggleText.textContent = 'Light Mode';
    } else {
        root.removeAttribute('data-theme');
        if (toggleIcon) toggleIcon.textContent = '🌙';
        if (toggleText) toggleText.textContent = 'Dark Mode';
    }

    isDarkMode = dark;

    // Apply dark mode to any currently loaded iframe
    applyDarkModeToIframe();
}

function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('attendance-theme', isDarkMode ? 'dark' : 'light');
    applyTheme(isDarkMode);
}

// Set up event listeners
function setupEventListeners() {
    const attendanceSelect = document.getElementById('attendanceSelect');
    const searchInput = document.getElementById('searchInput');
    const refreshButton = document.getElementById('refreshButton');
    const darkModeToggle = document.getElementById('darkModeToggle');

    attendanceSelect.addEventListener('change', function() {
        const selectedFile = this.value;
        if (selectedFile) {
            loadAttendanceRecord(selectedFile);
        } else {
            showNoSelection();
        }
    });

    searchInput.addEventListener('input', function() {
        filterFiles(this.value);
    });

    refreshButton.addEventListener('click', refreshRecords);

    // Dark mode toggle
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);

        // Keyboard accessibility
        darkModeToggle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDarkMode();
            }
        });
    }
}

// Load and discover attendance files
async function loadAttendanceFiles() {
    try {
        showMessage('Loading available attendance records...', 'info');

        // For GitHub Pages, we'll use a predefined list approach
        // This can be updated by adding files to the attendanceFilesList
        const filesList = await getAttendanceFilesList();

        attendanceFiles = filesList;
        filteredFiles = [...attendanceFiles];

        populateDropdown();
        hideMessage();

        if (attendanceFiles.length === 0) {
            showMessage('No attendance records found. Please add some attendance HTML files to the repository.', 'info');
        }
    } catch (error) {
        console.error('Error loading attendance files:', error);
        showMessage('Error loading attendance files. Please check the console for details.', 'error');
    }
}

// Get list of attendance files
async function getAttendanceFilesList() {
    try {
        // First, try to load from manifest file
        const manifestResponse = await fetch('attendance-manifest.json?v=' + new Date().getTime()); // Prevent caching
        if (manifestResponse.ok) {
            const manifest = await manifestResponse.json();
            return await validateAndFormatManifestFiles(manifest.files);
        }
         throw new Error("Manifest not found");
    } catch (error) {
        console.log('Manifest file not found or invalid, falling back to discovery method');
        return discoverFiles();
    }
}

async function discoverFiles() {
    // Fallback: For GitHub Pages compatibility, check for files using a predefined list
    const potentialFiles = [
        'attendance-2025-07-13.html',
        'attendance-2025-07-12.html',
        'attendance-2025-06-29.html',
        'attendance-2025-06-15.html'
    ];

    const existingFiles = [];

    for (const file of potentialFiles) {
        try {
            const response = await fetch(file, { method: 'HEAD' });
            if (response.ok) {
                existingFiles.push({
                    filename: file,
                    displayName: formatDisplayName(file),
                    date: extractDateFromFilename(file),
                    description: '',
                    category: 'regular'
                });
            }
        } catch (error) {
            // File doesn't exist, skip it
            console.log(`File ${file} not found, skipping...`);
        }
    }

    // Sort by date (newest first)
    existingFiles.sort((a, b) => {
        if (a.date && b.date) {
            return new Date(b.date) - new Date(a.date);
        }
        return a.displayName.localeCompare(b.displayName);
    });

    return existingFiles;
}


// Validate and format files from manifest
async function validateAndFormatManifestFiles(manifestFiles) {
    const validFiles = [];

    for (const fileInfo of manifestFiles) {
        try {
            // Check if file actually exists
            const response = await fetch(fileInfo.filename, { method: 'HEAD' });
            if (response.ok) {
                validFiles.push({
                    filename: fileInfo.filename,
                    displayName: fileInfo.title || formatDisplayName(fileInfo.filename),
                    date: fileInfo.date,
                    description: fileInfo.description || '',
                    category: fileInfo.category || 'regular'
                });
            } else {
                console.warn(`File listed in manifest but not found: ${fileInfo.filename}`);
            }
        } catch (error) {
            console.warn(`Error checking file ${fileInfo.filename}:`, error);
        }
    }

    // Sort by date (newest first)
    validFiles.sort((a, b) => {
        if (a.date && b.date) {
            return new Date(b.date) - new Date(a.date);
        }
        return a.displayName.localeCompare(b.displayName);
    });

    return validFiles;
}

// Format filename for display
function formatDisplayName(filename) {
    // Remove .html extension
    let name = filename.replace('.html', '');

    // Handle date format (attendance-YYYY-MM-DD)
    const dateMatch = name.match(/attendance-(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
        const date = new Date(dateMatch[1]);
        // Add a day to the date to fix timezone issues
        date.setDate(date.getDate() + 1);
        return `Attendance - ${date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        })}`;
    }

    // Handle session format (attendance-session-XX)
    const sessionMatch = name.match(/attendance-session-(\d+)/);
    if (sessionMatch) {
        return `Attendance Session ${sessionMatch[1]}`;
    }

    // Default formatting
    return name.replace(/attendance-/i, 'Attendance - ')
              .replace(/-/g, ' ')
              .replace(/\b\w/g, l => l.toUpperCase());
}

// Extract date from filename for sorting
function extractDateFromFilename(filename) {
    const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/);
    return dateMatch ? dateMatch[1] : null;
}

// Populate the dropdown with files
function populateDropdown() {
    const select = document.getElementById('attendanceSelect');

    // Clear existing options except the first one
    while (select.children.length > 1) {
        select.removeChild(select.lastChild);
    }

    // Add filtered files
    filteredFiles.forEach(file => {
        const option = document.createElement('option');
        option.value = file.filename;
        option.textContent = file.displayName;
        select.appendChild(option);
    });
}

// Filter files based on search input
function filterFiles(searchTerm) {
    if (!searchTerm.trim()) {
        filteredFiles = [...attendanceFiles];
    } else {
        const term = searchTerm.toLowerCase();
        filteredFiles = attendanceFiles.filter(file =>
            file.displayName.toLowerCase().includes(term) ||
            file.filename.toLowerCase().includes(term)
        );
    }

    populateDropdown();

    // Reset selection if current selection is not in filtered results
    const select = document.getElementById('attendanceSelect');
    const currentValue = select.value;
    if (currentValue && !filteredFiles.some(f => f.filename === currentValue)) {
        select.value = '';
        showNoSelection();
    }
}

// Load and display selected attendance record
function loadAttendanceRecord(filename) {
    showLoading();

    const iframe = document.getElementById('attendanceFrame');
    iframe.src = filename;

    iframe.onload = function() {
        showAttendanceFrame();
        // Apply dark mode to the loaded iframe content
        setTimeout(() => applyDarkModeToIframe(), 100);
    };

    iframe.onerror = function() {
        showMessage(`Error loading attendance record: ${filename}`, 'error');
    };
}

// Apply dark mode styles to iframe content
function applyDarkModeToIframe() {
    const iframe = document.getElementById('attendanceFrame');
    if (!iframe || !iframe.contentDocument) return;

    try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        const existingDarkModeStyle = iframeDoc.getElementById('injected-dark-mode-styles');

        // Remove existing dark mode styles
        if (existingDarkModeStyle) {
            existingDarkModeStyle.remove();
        }

        // Only inject dark mode styles if dark mode is enabled
        if (!isDarkMode) return;

        // Create comprehensive dark mode CSS for iframe content
        const darkModeCSS = `
            /* Dark mode override styles for attendance files */
            body {
                background-color: #1e1e1e !important;
                color: #e0e0e0 !important;
                transition: background-color 0.3s ease, color 0.3s ease !important;
            }

            /* Headers and containers */
            .header, .stats, .meeting-info, .session-info {
                background-color: #2a2a2a !important;
                color: #e0e0e0 !important;
                border-color: #404040 !important;
            }

            /* Tables */
            table {
                background-color: #2a2a2a !important;
                color: #e0e0e0 !important;
                border-color: #404040 !important;
            }

            th {
                background-color: #66bb6a !important;
                color: #ffffff !important;
                border-color: #404040 !important;
            }

            td {
                border-color: #404040 !important;
                background-color: #2a2a2a !important;
                color: #e0e0e0 !important;
            }

            tr:nth-child(even) {
                background-color: #333333 !important;
            }

            tr:hover {
                background-color: #3a3a3a !important;
            }

            /* Cards and containers */
            .info-card, .stat-card, .metric-card, .attendee-card, .participant-card {
                background-color: #2a2a2a !important;
                color: #e0e0e0 !important;
                border-color: #404040 !important;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
            }

            /* Status indicators */
            .present {
                color: #81c784 !important;
            }

            .absent {
                color: #e57373 !important;
            }

            .late, .not-signed {
                color: #ffb74d !important;
            }

            /* Status badges */
            .status.present, .status-badge.present {
                background-color: #2e7d32 !important;
                color: #c8e6c9 !important;
            }

            .status.absent, .status-badge.absent {
                background-color: #c62828 !important;
                color: #ffcdd2 !important;
            }

            .status.late {
                background-color: #f57c00 !important;
                color: #ffe0b2 !important;
            }

            /* Specific background overrides */
            .stats, .info-grid, .metrics, .participants-section {
                background-color: transparent !important;
            }

            /* Text colors */
            h1, h2, h3, h4, h5, h6 {
                color: #e0e0e0 !important;
            }

            p, span, div {
                color: #e0e0e0 !important;
            }

            /* Links */
            a {
                color: #81c784 !important;
            }

            a:hover {
                color: #a5d6a7 !important;
            }

            /* Form elements if any */
            input, select, textarea {
                background-color: #2a2a2a !important;
                color: #e0e0e0 !important;
                border-color: #404040 !important;
            }

            /* Buttons */
            button, .btn {
                background-color: #66bb6a !important;
                color: #ffffff !important;
                border-color: #66bb6a !important;
            }

            button:hover, .btn:hover {
                background-color: #5cb85c !important;
            }

            /* Shadows and borders */
            * {
                box-shadow: none !important;
            }

            .container, .header, .stats, .info-card, .stat-card, .metric-card,
            .attendee-card, .participant-card, .meeting-info, .session-info {
                box-shadow: 0 2px 4px rgba(0,0,0,0.3) !important;
            }

            /* Override any white backgrounds */
            [style*="background-color: white"], [style*="background-color: #fff"],
            [style*="background-color: #ffffff"], [style*="background: white"],
            [style*="background: #fff"], [style*="background: #ffffff"] {
                background-color: #2a2a2a !important;
            }

            /* Override any black text */
            [style*="color: black"], [style*="color: #000"],
            [style*="color: #000000"] {
                color: #e0e0e0 !important;
            }
        `;

        // Create and inject the style element
        const styleElement = iframeDoc.createElement('style');
        styleElement.id = 'injected-dark-mode-styles';
        styleElement.textContent = darkModeCSS;

        // Insert at the end of head to ensure it overrides existing styles
        const head = iframeDoc.head || iframeDoc.getElementsByTagName('head')[0];
        if (head) {
            head.appendChild(styleElement);
        }

    } catch (error) {
        console.warn('Could not apply dark mode to iframe (likely due to CORS restrictions):', error);
    }
}

// Show/hide different content states
function showNoSelection() {
    document.getElementById('noSelection').style.display = 'block';
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('attendanceFrame').style.display = 'none';
    hideMessage();
}

function showLoading() {
    document.getElementById('noSelection').style.display = 'none';
    document.getElementById('loadingMessage').style.display = 'block';
    document.getElementById('attendanceFrame').style.display = 'none';
    hideMessage();
}

function showAttendanceFrame() {
    document.getElementById('noSelection').style.display = 'none';
    document.getElementById('loadingMessage').style.display = 'none';
    document.getElementById('attendanceFrame').style.display = 'block';
    hideMessage();
}

// Message display functions
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('messageDisplay');
    if (!messageContainer) return;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `<strong>${type.charAt(0).toUpperCase() + type.slice(1)}:</strong> ${message}`;
    
    // Clear previous messages
    messageContainer.innerHTML = '';
    messageContainer.appendChild(messageDiv);
    messageContainer.style.display = 'block';
}

function hideMessage() {
    const messageContainer = document.getElementById('messageDisplay');
    if (messageContainer) {
        messageContainer.innerHTML = '';
        messageContainer.style.display = 'none';
    }
}

// Refresh records function
function refreshRecords() {
    const select = document.getElementById('attendanceSelect');
    const searchInput = document.getElementById('searchInput');

    // Reset UI
    select.value = '';
    searchInput.value = '';
    showNoSelection();

    // Reload files
    loadAttendanceFiles();
}
