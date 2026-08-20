// projects.js — loads all-projects.json and renders it grouped by section
// (Watercolors, Warhammer Miniatures, Digital Paintings). Sections, titles,
// and descriptions may be bilingual ({en, zh}); grouping and anchors always
// use the English name so links stay stable across languages. Navbar search
// still filters across everything, and the page re-renders on language toggle.

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
        document.addEventListener('langchange', render);
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

function sectionKey(section) {
    return typeof section === 'object' ? section.en : section;
}

function render() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';

    let projects = allProjects;
    if (currentSearchQuery) {
        projects = projects.filter(p =>
            I18N.all(p.title).toLowerCase().includes(currentSearchQuery) ||
            I18N.all(p.description).toLowerCase().includes(currentSearchQuery) ||
            I18N.all(p.section).toLowerCase().includes(currentSearchQuery)
        );
    }

    if (projects.length === 0) {
        container.innerHTML = `<p class="text-muted">${I18N.t('projects.none')}</p>`;
        return;
    }

    // group by section, preserving first-appearance order
    const sections = [];
    const bySection = new Map();
    projects.forEach(p => {
        const key = sectionKey(p.section);
        if (!bySection.has(key)) {
            bySection.set(key, { label: p.section, items: [] });
            sections.push(key);
        }
        bySection.get(key).items.push(p);
    });

    sections.forEach(key => {
        const group = bySection.get(key);
        const heading = document.createElement('h2');
        heading.className = 'projects-heading';
        heading.id = slugify(key);
        heading.textContent = I18N.tr(group.label);
        container.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'projects-grid mb-4';
        group.items.forEach(project => {
            const card = document.createElement('div');
            card.className = 'project-card';
            const title = I18N.tr(project.title);
            card.innerHTML = `
                <img src="${project.picture}" alt="${title}" class="project-card-img" loading="lazy">
                <div class="project-card-body">
                    <h3 class="project-card-title">${title}</h3>
                    <p class="project-card-desc">${I18N.tr(project.description)}</p>
                    <p class="project-card-date"><small>${I18N.t('projects.added')} ${project.date_added}</small></p>
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
