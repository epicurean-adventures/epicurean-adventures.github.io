// js/projects.js

// Function to extract the tag from the URL hash
function getTagFromHash() {
    // Expected hash format: "#/category?category=3d-art"
    const hash = window.location.hash; // e.g. "#/category?category=3d-art"
    if (!hash) return null;
    // Remove the part before "?" and create URLSearchParams
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    return params.get('category');
  }
  
  function loadProjects() {
    fetch('projects/all-projects.json')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }
        return response.json();
      })
      .then(projects => {
        const tag = getTagFromHash();
        let filteredProjects = projects;
        if (tag) {
          // Filter projects that include the tag in their tags array (case sensitive)
          filteredProjects = projects.filter(project => project.tags.includes(tag));
        }
        displayProjects(filteredProjects);
      })
      .catch(error => console.error('Error loading projects:', error));
  }
  
  function displayProjects(projects) {
    const container = document.getElementById('projects-container');
    container.innerHTML = ''; // Clear any existing content
  
    if (projects.length === 0) {
      container.innerHTML = '<p>No projects found for this category.</p>';
      return;
    }
  
    projects.forEach(project => {
      // Create a card or a simple div to display project information
      const projectCard = document.createElement('div');
      projectCard.className = 'project-card';
      projectCard.style.border = '1px solid #ccc';
      projectCard.style.padding = '1rem';
      projectCard.style.margin = '1rem 0';
  
      projectCard.innerHTML = `
        <h3>${project.title}</h3>
        <img src="${project.picture}" alt="${project.title}" style="max-width: 200px;">
        <p>${project.description}</p>
        <p><small>Date added: ${project.date_added}</small></p>
        <a href="${project.page_link}">View Project</a>
      `;
      container.appendChild(projectCard);
    });
  }
  
  // Load projects once the DOM is ready
  document.addEventListener('DOMContentLoaded', loadProjects);