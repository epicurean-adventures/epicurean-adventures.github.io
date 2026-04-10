// projects.js — loads and displays projects from all-projects.json.
// Supports category filtering via ?category=TAG URL param and text search via SearchManager.

let allProjects = [];
let currentSearchQuery = '';

function getCategoryFromUrl() {
    return new URLSearchParams(window.location.search).get('category');
}

async function loadProjects() {
    const container = document.getElementById('projects-container');
    try {
        const response = await fetch('projects/all-projects.json');
        if (!response.ok) throw new Error(response.statusText);
        allProjects = await response.json();
        applyFilters();
    } catch (error) {
        container.innerHTML =
            `<div class="alert alert-danger" role="alert">
                Failed to load projects: ${error.message}
            </div>`;
    }
}

function applyFilters() {
    const category = getCategoryFromUrl();
    let filtered = allProjects;

    if (category) {
        filtered = filtered.filter(p => p.tags.includes(category));
    }
    if (currentSearchQuery) {
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(currentSearchQuery) ||
            p.description.toLowerCase().includes(currentSearchQuery) ||
            p.tags.some(t => t.includes(currentSearchQuery))
        );
    }

    displayProjects(filtered, category);
}

function displayProjects(projects, category) {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';

    const heading = document.createElement('h2');
    heading.className = 'projects-heading';
    heading.textContent = category
        ? `Category: ${category.replace(/-/g, ' ')}`
        : 'All Projects';
    container.appendChild(heading);

    if (projects.length === 0) {
        container.innerHTML += '<p class="text-muted">No projects found.</p>';
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'projects-grid';

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.innerHTML = `
            <img src="${project.picture}" alt="${project.title}" class="project-card-img">
            <div class="project-card-body">
                <h3 class="project-card-title">${project.title}</h3>
                <p class="project-card-desc">${project.description}</p>
                <p class="project-card-date"><small>Added: ${project.date_added}</small></p>
                ${project.page_link
                    ? `<a href="${project.page_link}" class="btn btn-sm btn-primary">View Project</a>`
                    : ''}
            </div>
        `;
        grid.appendChild(card);
    });

    container.appendChild(grid);
}

// Register with SearchManager so the projects grid responds to navbar search
if (typeof SearchManager !== 'undefined') {
    SearchManager.register(query => {
        currentSearchQuery = query;
        applyFilters();
    });
}

document.addEventListener('DOMContentLoaded', loadProjects);
