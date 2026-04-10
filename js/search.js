// search.js — modular search manager
//
// Usage:
//   SearchManager.register(provider)  — register a search handler for the current page.
//     provider(query: string) is called whenever the user types or submits a search.
//     Register from any page script to make that page searchable.
//
//   SearchManager.attachToNavbar()    — called by includes.js after navbar loads.
//     Wires up the search input/button in the navbar to SearchManager.search().
//
// To add a new searchable page, call SearchManager.register() in that page's script.

const SearchManager = (() => {
    const providers = [];

    return {
        register(provider) {
            providers.push(provider);
        },

        search(query) {
            const q = (query || '').trim().toLowerCase();
            providers.forEach(p => p(q));
        },

        attachToNavbar() {
            const input = document.getElementById('navbar-search-input');
            const btn = document.getElementById('btnNavbarSearch');
            if (!input) return;

            input.addEventListener('input', () => this.search(input.value));
            input.addEventListener('keydown', e => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.search(input.value);
                }
            });
            if (btn) {
                btn.addEventListener('click', () => this.search(input.value));
            }
        }
    };
})();
