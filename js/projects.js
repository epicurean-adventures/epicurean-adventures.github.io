// projects.js — loads all-projects.json and renders it grouped by section
// (Digital Paintings, Watercolors, ...). No categories or tags: sections come
// straight from the data, in the order they first appear. Navbar search still
// filters across everything.

let allProjects = [];
let currentSearchQuery = '';

async function loadProjects() {
    const container = document.getElementById('projects-container');
    try {
        const response = await fetch('projects/all-projects.json');
        if (!response.ok) throw new Error(response.statusText);
        allProjects = await response.json();
        render();
        scrollToHash();
    } catch (error) {
        container.innerHTML =
            `<div class="alert alert-danger" role="alert">
                Failed to load projects: ${error.message}
            </div>`;
    }
}

function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function render() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';

    let projects = allProjects;
    if (currentSearchQuery) {
        projects = projects.filter(p =>
            p.title.toLowerCase().includes(currentSearchQuery) ||
            p.description.toLowerCase().includes(currentSearchQuery) ||
            p.section.toLowerCase().includes(currentSearchQuery)
        );
    }

    if (projects.length === 0) {
        container.innerHTML = '<p class="text-muted">No projects found.</p>';
        return;
    }

    // group by section, preserving first-appearance order
    const sections = [];
    const bySection = new Map();
    projects.forEach(p => {
        if (!bySection.has(p.section)) {
            bySection.set(p.section, []);
            sections.push(p.section);
        }
        bySection.get(p.section).push(p);
    });

    sections.forEach(section => {
        const heading = document.createElement('h2');
        heading.className = 'projects-heading';
        heading.id = slugify(section);
        heading.textContent = section;
        container.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'projects-grid mb-4';
        bySection.get(section).forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            card.innerHTML = `
                <img src="${project.picture}" alt="${project.title}" class="project-card-img" loading="lazy">
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
    });
}

// Support anchors like projects.html#watercolors (content loads after the
// browser's native anchor jump, so scroll manually once rendered)
function scrollToHash() {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const target = document.getElementById(hash);
    if (target) target.scrollIntoView();
}

// Register with SearchManager so the projects grid responds to navbar search
if (typeof SearchManager !== 'undefined') {
    SearchManager.register(query => {
        currentSearchQuery = query;
        render();
    });
}

document.addEventListener('DOMContentLoaded', loadProjects);
