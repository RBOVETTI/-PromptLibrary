// ========================================
// Global State
// ========================================
let promptLibrary = null;
let modifiedPrompts = new Map();
let currentPrompt = null;
let originalPrompt = null;
let searchQuery = '';
let activeCategory = 'all';

// ========================================
// Initialize App
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadPromptLibrary();
    initializeEventListeners();
    initializeDarkMode();
});

// ========================================
// Load Prompt Library
// ========================================
async function loadPromptLibrary() {
    try {
        console.log('Loading prompt library...');

        // Show loading state
        document.getElementById('totalPrompts').textContent = 'Loading...';
        document.getElementById('categoriesCount').textContent = 'Please wait';

        const response = await fetch('./prompt-library-complete.json');
        console.log('Fetch response:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        promptLibrary = await response.json();
        console.log('Prompt library loaded:', promptLibrary.totalPrompts, 'prompts');

        // Update header
        document.getElementById('version').textContent = `v${promptLibrary.version}`;
        document.getElementById('totalPrompts').textContent = `${promptLibrary.totalPrompts} prompts`;
        document.getElementById('categoriesCount').textContent = `${promptLibrary.categories.length} categories`;

        // Render UI
        renderCategoryFilter();
        renderCategories();

        showToast(`✅ Loaded ${promptLibrary.totalPrompts} prompts successfully!`, true);
    } catch (error) {
        console.error('Error loading prompt library:', error);

        // Show detailed error
        const errorMsg = `Failed to load prompt library: ${error.message}`;
        document.getElementById('totalPrompts').textContent = 'Error loading data';
        document.getElementById('categoriesCount').textContent = 'See console';

        // Show error message in the main area
        const container = document.getElementById('categoriesGrid');
        container.innerHTML = `
            <div style="padding: 40px; text-align: center; background: var(--bg-primary); border-radius: var(--radius-lg); border: 2px solid #ef4444;">
                <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                <h2 style="color: #ef4444; margin-bottom: 12px;">Error Loading Prompt Library</h2>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">${errorMsg}</p>
                <details style="text-align: left; background: var(--bg-secondary); padding: 16px; border-radius: 8px; margin-top: 20px;">
                    <summary style="cursor: pointer; font-weight: 600; margin-bottom: 8px;">Technical Details</summary>
                    <pre style="font-size: 12px; overflow-x: auto; color: var(--text-secondary);">${error.stack || error.message}</pre>
                </details>
                <p style="margin-top: 20px; font-size: 14px; color: var(--text-tertiary);">
                    Make sure <code>prompt-library-complete.json</code> is accessible at the root of your deployment.
                </p>
            </div>
        `;

        showToast('❌ ' + errorMsg, false);
    }
}

// ========================================
// Event Listeners
// ========================================
function initializeEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    const clearSearch = document.getElementById('clearSearch');

    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        clearSearch.style.display = searchQuery ? 'block' : 'none';
        filterAndRender();
    });

    clearSearch.addEventListener('click', () => {
        searchInput.value = '';
        searchQuery = '';
        clearSearch.style.display = 'none';
        filterAndRender();
    });

    // Modal
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('modalOverlay').addEventListener('click', closeModal);

    // Modal actions
    document.getElementById('copyBtn').addEventListener('click', copyPrompt);
    document.getElementById('editBtn').addEventListener('click', startEditing);
    document.getElementById('saveBtn').addEventListener('click', saveEdit);
    document.getElementById('cancelBtn').addEventListener('click', cancelEdit);
    document.getElementById('resetBtn').addEventListener('click', resetPrompt);

    // Export
    document.getElementById('exportBtn').addEventListener('click', exportModified);

    // Dark mode
    document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// ========================================
// Dark Mode
// ========================================
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateDarkModeIcon(savedTheme);
}

function toggleDarkMode() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateDarkModeIcon(newTheme);
}

function updateDarkModeIcon(theme) {
    const icon = document.querySelector('#darkModeToggle .icon');
    icon.textContent = theme === 'light' ? '🌙' : '☀️';
}

// ========================================
// Render Category Filter
// ========================================
function renderCategoryFilter() {
    const container = document.getElementById('categoryFilter');

    const allButton = createCategoryChip(
        'all',
        '🌐',
        'All Categories',
        promptLibrary.totalPrompts || 0
    );
    container.appendChild(allButton);

    promptLibrary.categories.forEach(category => {
        const categoryName = category.category || 'Uncategorized';
        const categoryIcon = category.icon || '📁';
        const promptsCount = category.prompts?.length || 0;

        const chip = createCategoryChip(
            categoryName,
            categoryIcon,
            categoryName,
            promptsCount
        );
        container.appendChild(chip);
    });
}

function createCategoryChip(id, icon, name, count) {
    const chip = document.createElement('div');
    chip.className = `category-chip ${activeCategory === id ? 'active' : ''}`;
    chip.innerHTML = `
        <span>${icon || '📁'}</span>
        <span>${name || 'Unknown'}</span>
        <span class="count">${count || 0}</span>
    `;

    chip.addEventListener('click', () => {
        activeCategory = id;
        updateCategoryFilter();
        filterAndRender();
    });

    return chip;
}

function updateCategoryFilter() {
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// ========================================
// Filter and Render
// ========================================
function filterAndRender() {
    const filtered = filterCategories();
    renderCategories(filtered);
    updateResultsInfo(filtered);
}

function filterCategories() {
    if (!searchQuery && activeCategory === 'all') {
        return promptLibrary.categories;
    }

    let filtered = promptLibrary.categories;

    // Filter by category
    if (activeCategory !== 'all') {
        filtered = filtered.filter(cat => cat.category === activeCategory);
    }

    // Filter by search
    if (searchQuery) {
        filtered = filtered.map(category => {
            const matchingPrompts = category.prompts.filter(prompt => {
                return (
                    prompt.title.toLowerCase().includes(searchQuery) ||
                    prompt.prompt.toLowerCase().includes(searchQuery) ||
                    prompt.id.toLowerCase().includes(searchQuery)
                );
            });

            return matchingPrompts.length > 0 ? {
                ...category,
                prompts: matchingPrompts
            } : null;
        }).filter(cat => cat !== null);
    }

    return filtered;
}

function updateResultsInfo(filtered) {
    const resultsInfo = document.getElementById('resultsInfo');
    const noResults = document.getElementById('noResults');

    const totalPrompts = filtered.reduce((sum, cat) => sum + cat.prompts.length, 0);

    if (searchQuery || activeCategory !== 'all') {
        if (totalPrompts > 0) {
            resultsInfo.textContent = `Found ${totalPrompts} prompt${totalPrompts !== 1 ? 's' : ''} in ${filtered.length} categor${filtered.length !== 1 ? 'ies' : 'y'}`;
            resultsInfo.style.display = 'block';
            noResults.style.display = 'none';
        } else {
            resultsInfo.style.display = 'none';
            noResults.style.display = 'block';
        }
    } else {
        resultsInfo.style.display = 'none';
        noResults.style.display = 'none';
    }
}

// ========================================
// Render Categories
// ========================================
function renderCategories(categories = promptLibrary.categories) {
    const container = document.getElementById('categoriesGrid');
    container.innerHTML = '';

    categories.forEach(category => {
        const section = document.createElement('div');
        section.className = 'category-section';

        const categoryName = category.category || 'Uncategorized';
        const categoryIcon = category.icon || '📁';
        const categoryDescription = category.description || 'No description available';
        const promptsCount = category.prompts?.length || 0;

        section.innerHTML = `
            <div class="category-header">
                <div class="category-icon">${categoryIcon}</div>
                <div class="category-info">
                    <h2>${categoryName}</h2>
                    <div class="category-description">${categoryDescription}</div>
                </div>
                <div class="category-meta">${promptsCount} prompts</div>
            </div>
            <div class="prompts-grid" id="prompts-${categoryName.replace(/\s+/g, '-')}"></div>
        `;

        container.appendChild(section);

        const promptsGrid = section.querySelector('.prompts-grid');
        if (category.prompts && Array.isArray(category.prompts)) {
            category.prompts.forEach(prompt => {
                const card = createPromptCard(prompt, categoryName);
                promptsGrid.appendChild(card);
            });
        }
    });
}

function createPromptCard(prompt, categoryName) {
    const card = document.createElement('div');
    const isModified = modifiedPrompts.has(prompt.id);

    card.className = `prompt-card ${isModified ? 'modified' : ''}`;

    const promptText = prompt.prompt || 'No content available';
    const preview = promptText.substring(0, 150) + (promptText.length > 150 ? '...' : '');
    const promptId = prompt.id || 'unknown';
    const promptTitle = prompt.title || 'Untitled Prompt';

    card.innerHTML = `
        <div class="prompt-header">
            <div class="prompt-id">${promptId}</div>
            <h3 class="prompt-title">${promptTitle}</h3>
        </div>
        <div class="prompt-preview">${preview}</div>
    `;

    card.addEventListener('click', () => openModal(prompt, categoryName));

    return card;
}

// ========================================
// Modal Functions
// ========================================
function openModal(prompt, categoryName) {
    currentPrompt = prompt;
    originalPrompt = prompt.prompt || 'No content available';

    const modal = document.getElementById('promptModal');
    document.getElementById('modalTitle').textContent = prompt.title || 'Untitled Prompt';
    document.getElementById('modalId').textContent = `${prompt.id || 'unknown'} • ${categoryName || 'Unknown'}`;

    const displayText = modifiedPrompts.get(prompt.id) || prompt.prompt || 'No content available';
    document.getElementById('promptDisplay').textContent = displayText;

    // Show/hide reset button if modified
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.style.display = modifiedPrompts.has(prompt.id) ? 'inline-flex' : 'none';

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('promptModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';

    // Reset editing state
    if (document.getElementById('promptEditor').style.display !== 'none') {
        cancelEdit();
    }
}

// ========================================
// Copy Function
// ========================================
async function copyPrompt() {
    const text = modifiedPrompts.get(currentPrompt.id) || currentPrompt.prompt;

    try {
        await navigator.clipboard.writeText(text);
        showToast('✅ Copied to clipboard!', true);
    } catch (error) {
        // Fallback method
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('✅ Copied to clipboard!', true);
    }
}

// ========================================
// Edit Functions
// ========================================
function startEditing() {
    const display = document.getElementById('promptDisplay');
    const editor = document.getElementById('promptEditor');
    const editBtn = document.getElementById('editBtn');
    const copyBtn = document.getElementById('copyBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    const currentText = modifiedPrompts.get(currentPrompt.id) || currentPrompt.prompt;
    editor.value = currentText;

    display.style.display = 'none';
    editor.style.display = 'block';
    editBtn.style.display = 'none';
    copyBtn.style.display = 'none';
    saveBtn.style.display = 'inline-flex';
    cancelBtn.style.display = 'inline-flex';

    editor.focus();
}

function saveEdit() {
    const editor = document.getElementById('promptEditor');
    const newText = editor.value;

    if (newText !== currentPrompt.prompt) {
        modifiedPrompts.set(currentPrompt.id, newText);
    } else {
        modifiedPrompts.delete(currentPrompt.id);
    }

    document.getElementById('promptDisplay').textContent = newText;

    exitEditMode();
    renderCategories(filterCategories());
    showToast('✅ Changes saved!', true);

    // Update reset button visibility
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.style.display = modifiedPrompts.has(currentPrompt.id) ? 'inline-flex' : 'none';
}

function cancelEdit() {
    exitEditMode();
}

function exitEditMode() {
    const display = document.getElementById('promptDisplay');
    const editor = document.getElementById('promptEditor');
    const editBtn = document.getElementById('editBtn');
    const copyBtn = document.getElementById('copyBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');

    display.style.display = 'block';
    editor.style.display = 'none';
    editBtn.style.display = 'inline-flex';
    copyBtn.style.display = 'inline-flex';
    saveBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
}

function resetPrompt() {
    if (confirm('Are you sure you want to reset this prompt to its original version?')) {
        modifiedPrompts.delete(currentPrompt.id);
        document.getElementById('promptDisplay').textContent = currentPrompt.prompt;
        document.getElementById('resetBtn').style.display = 'none';
        renderCategories(filterCategories());
        showToast('✅ Prompt reset to original!', true);
    }
}

// ========================================
// Export Modified Prompts
// ========================================
function exportModified() {
    if (modifiedPrompts.size === 0) {
        showToast('No modified prompts to export', false);
        return;
    }

    // Create a copy of the library with modified prompts
    const exportData = JSON.parse(JSON.stringify(promptLibrary));

    exportData.categories.forEach(category => {
        category.prompts.forEach(prompt => {
            if (modifiedPrompts.has(prompt.id)) {
                prompt.prompt = modifiedPrompts.get(prompt.id);
                prompt.modified = true;
                prompt.modifiedDate = new Date().toISOString();
            }
        });
    });

    exportData.exportInfo = {
        exportDate: new Date().toISOString(),
        modifiedPromptsCount: modifiedPrompts.size,
        originalVersion: promptLibrary.version
    };

    // Download as JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prompt-library-modified-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast(`✅ Exported ${modifiedPrompts.size} modified prompts!`, true);
}

// ========================================
// Keyboard Shortcuts
// ========================================
function handleKeyboardShortcuts(e) {
    const modal = document.getElementById('promptModal');

    // Escape to close modal
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }

    // Ctrl/Cmd + K to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }

    // Ctrl/Cmd + C to copy (when modal is open)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && modal.classList.contains('active')) {
        const editor = document.getElementById('promptEditor');
        if (editor.style.display === 'none') {
            e.preventDefault();
            copyPrompt();
        }
    }
}

// ========================================
// Toast Notification
// ========================================
function showToast(message, isSuccess = true) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${isSuccess ? 'success' : ''}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
