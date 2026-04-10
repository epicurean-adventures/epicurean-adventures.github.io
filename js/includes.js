// includes.js — loads shared HTML components (navbar, sidebar, footer) in parallel.

async function loadComponent(selector, url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
        document.querySelector(selector).innerHTML = await response.text();
    } catch (error) {
        console.error(`Failed to load component (${url}):`, error);
        document.querySelector(selector).innerHTML =
            `<div class="alert alert-warning m-2" role="alert">
                Could not load component: <code>${url}</code>
            </div>`;
    }
}

Promise.all([
    // Navbar: after it loads, wire up sidebar toggle and search
    loadComponent('#navbar-placeholder', 'navbar.html').then(() => {
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', e => {
                e.preventDefault();
                document.body.classList.toggle('sb-sidenav-toggled');
            });
        }
        if (typeof SearchManager !== 'undefined') {
            SearchManager.attachToNavbar();
        }
    }),
    loadComponent('#sidebar-placeholder', 'sidebar.html'),
    loadComponent('#footer-placeholder', 'footer.html'),
]);
