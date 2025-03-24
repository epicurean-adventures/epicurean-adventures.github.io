function loadComponent(selector, url, callback) {
  fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error fetching ${url}: ${response.statusText}`);
        }
        return response.text();
    })
    .then(html => {
        document.querySelector(selector).innerHTML = html;
        if (callback) {
            callback();
        }
    })
    .catch(error => console.error('Error loading component:', error));
}

// Load the navbar and attach the toggle event listener once it's loaded.
loadComponent("#navbar-placeholder", "navbar.html", function() {
  // Now that the navbar is in the DOM, attach the sidebar toggle listener.
  var sidebarToggle = document.getElementById("sidebarToggle");
  if (sidebarToggle) {
      sidebarToggle.addEventListener("click", function(e) {
          e.preventDefault();
          document.body.classList.toggle("sb-sidenav-toggled");
      });
  }
});

// Load the sidebar and footer normally.
loadComponent("#sidebar-placeholder", "sidebar.html");
loadComponent("#footer-placeholder", "footer.html");