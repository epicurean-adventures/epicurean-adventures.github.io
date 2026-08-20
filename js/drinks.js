// drinks.js - renders the Spencer's Bar drinks ledger from projects/drinks.json.
//
// Each drink groups one or more photos with dates preserved, plus style, ABV,
// tasting notes, and a rating slot. Filters are two levels: category then
// style subcategory, both built from the data. Text data may be bilingual
// ({en, zh}); UI strings come from the I18N dictionary and the page
// re-renders on language toggle.

class DrinksPage {
    constructor() {
        this.drinks = [];
        this.filter = 'all';        // category
        this.subfilter = 'all';     // subcategory within the category
        this.query = '';
        this.grid = document.getElementById('drinks-grid');
        this.countEl = document.getElementById('drink-count');
        this.filtersEl = document.getElementById('drink-filters');
        this.subfiltersEl = document.getElementById('drink-subfilters');
        this.categoryIcons = {
            beer: 'fa-beer-mug-empty',
            spirits: 'fa-martini-glass',
            wine: 'fa-wine-glass',
            cocktail: 'fa-martini-glass-citrus',
            cider: 'fa-apple-whole',
            'non-alcoholic': 'fa-glass-water',
        };
    }

    async init() {
        try {
            const response = await fetch('projects/drinks.json');
            if (!response.ok) throw new Error(`Could not load drinks.json (${response.status})`);
            const data = await response.json();
            this.drinks = data.drinks;
            document.getElementById('loading-message').classList.add('d-none');
            this.buildFilters();
            document.getElementById('drink-search').addEventListener('input', e => {
                this.query = e.target.value.trim().toLowerCase();
                this.render();
            });
            this.render();
            // Deep-linkable filters: drinks.html?cat=beer&style=IPA
            const params = new URLSearchParams(window.location.search);
            if (params.get('cat')) {
                const btn = this.filtersEl.querySelector(`button[data-filter="${CSS.escape(params.get('cat'))}"]`);
                if (btn) btn.click();
                if (params.get('style')) {
                    const sbtn = this.subfiltersEl.querySelector(`button[data-subfilter="${CSS.escape(params.get('style'))}"]`);
                    if (sbtn) sbtn.click();
                }
            }
            // Deep link: drinks.html#drink-id opens that drink's details
            const hash = decodeURIComponent(window.location.hash.replace('#', ''));
            if (hash && this.drinks.some(d => d.id === hash)) this.openModal(hash);
            document.addEventListener('langchange', () => {
                this.buildFilters(true);
                this.render();
            });
        } catch (error) {
            document.getElementById('loading-message').classList.add('d-none');
            const err = document.getElementById('error-message');
            err.classList.remove('d-none');
            document.getElementById('error-text').textContent = error.message;
        }
    }

    catLabel(cat) {
        const key = 'cat.' + cat;
        const label = I18N.t(key);
        return label === key ? this.cap(cat) : label;
    }

    subLabel(sub) {
        const key = 'sub.' + sub;
        const label = I18N.t(key);
        return label === key ? sub : label;
    }

    // Top-level category chips (All, Beer, Spirits, ...), built from the data.
    // keepSelection preserves the active filter across a language re-render.
    buildFilters(keepSelection = false) {
        const selected = keepSelection ? this.filter : 'all';
        const categories = [...new Set(this.drinks.map(d => d.category))].sort();
        const chip = cat => {
            const icon = this.categoryIcons[cat] ? `<i class="fas ${this.categoryIcons[cat]} me-1"></i>` : '';
            return `<button type="button" class="btn btn-outline-warning btn-sm${cat === selected ? ' active' : ''}" data-filter="${cat}">${icon}${this.catLabel(cat)}</button>`;
        };
        this.filtersEl.innerHTML =
            `<button type="button" class="btn btn-outline-warning btn-sm${selected === 'all' ? ' active' : ''}" data-filter="all">${I18N.t('drinks.all')}</button>` +
            categories.map(chip).join('');
        this.filtersEl.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.filtersEl.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filter = btn.dataset.filter;
                this.subfilter = 'all';
                this.buildSubfilters();
                this.render();
            });
        });
        this.filter = selected;
        this.buildSubfilters(keepSelection);
    }

    // Second-level style chips (IPA, Pale Ale, ...) for the selected category
    buildSubfilters(keepSelection = false) {
        const selected = keepSelection ? this.subfilter : 'all';
        this.subfilter = selected;
        if (this.filter === 'all') {
            this.subfiltersEl.classList.add('d-none');
            this.subfiltersEl.innerHTML = '';
            return;
        }
        const subs = [...new Set(this.drinks
            .filter(d => d.category === this.filter)
            .map(d => d.subcategory)
            .filter(Boolean))].sort();
        if (subs.length < 2) {
            this.subfiltersEl.classList.add('d-none');
            this.subfiltersEl.innerHTML = '';
            return;
        }
        this.subfiltersEl.classList.remove('d-none');
        this.subfiltersEl.innerHTML =
            `<button type="button" class="btn btn-outline-secondary btn-sm${selected === 'all' ? ' active' : ''}" data-subfilter="all">${I18N.t('drinks.allOf').replace('{cat}', this.catLabel(this.filter))}</button>` +
            subs.map(s => `<button type="button" class="btn btn-outline-secondary btn-sm${s === selected ? ' active' : ''}" data-subfilter="${this.esc(s)}">${this.esc(this.subLabel(s))}</button>`).join('');
        this.subfiltersEl.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.subfiltersEl.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.subfilter = btn.dataset.subfilter;
                this.render();
            });
        });
    }

    matches(drink) {
        if (this.filter !== 'all' && drink.category !== this.filter) return false;
        if (this.subfilter !== 'all' && drink.subcategory !== this.subfilter) return false;
        if (this.query) {
            const hay = [drink.name, drink.maker, I18N.all(drink.makerLocation), I18N.all(drink.style), drink.subcategory, drink.tags.join(' ')].join(' ').toLowerCase();
            if (!hay.includes(this.query)) return false;
        }
        return true;
    }

    ratingHtml(drink) {
        if (drink.rating == null) return '';
        const full = Math.round(drink.rating);
        let stars = '';
        for (let i = 1; i <= 5; i++) stars += `<i class="fa${i <= full ? 's' : 'r'} fa-star"></i>`;
        return `<span class="drink-rating" title="${drink.rating}/5">${stars}</span>`;
    }

    // Brewery/distillery block: logo (or monogram fallback) + name, location below
    makerHtml(drink) {
        const mark = drink.makerLogo
            ? `<img src="${drink.makerLogo}" alt="${this.esc(drink.maker)}" class="drink-maker-logo" loading="lazy" />`
            : `<span class="drink-maker-monogram">${this.esc(this.monogram(drink.maker))}</span>`;
        return `
            <div class="drink-maker-row">
                ${mark}
                <div>
                    <div class="drink-maker-name">${this.esc(drink.maker)}</div>
                    <div class="drink-maker-loc"><i class="fas fa-location-dot me-1"></i>${this.esc(I18N.tr(drink.makerLocation) || '')}</div>
                </div>
            </div>`;
    }

    monogram(maker) {
        const skip = new Set(['brewing', 'brew', 'brewery', 'co', 'co.', 'company', 'spirits', 'distillery', '/', '&', 'the']);
        const initials = maker.split(/[\s/]+/)
            .filter(w => w && !skip.has(w.toLowerCase()))
            .map(w => w[0].toUpperCase());
        return initials.slice(0, 3).join('');
    }

    render() {
        const visible = this.drinks.filter(d => this.matches(d));
        this.countEl.textContent = I18N.t('drinks.count').replace('{n}', visible.length).replace('{total}', this.drinks.length);
        this.grid.innerHTML = visible.map(drink => this.cardHtml(drink)).join('');
        this.grid.querySelectorAll('[data-drink-id]').forEach(card => {
            card.addEventListener('click', () => this.openModal(card.dataset.drinkId));
        });
    }

    cardHtml(drink) {
        const cover = drink.photos[0];
        return `
            <div class="plant-card" data-drink-id="${drink.id}" role="button" tabindex="0">
                <img src="${cover.thumb}" alt="${this.esc(drink.name)}" class="plant-card-img" loading="lazy" />
                <div class="plant-card-body">
                    <div class="d-flex justify-content-between align-items-start gap-1">
                        <h2 class="plant-card-title">${this.esc(drink.name)}</h2>
                        <span class="badge drink-abv">${this.esc(drink.abv)}</span>
                    </div>
                    <div class="drink-style">${this.esc(I18N.tr(drink.style))} ${this.ratingHtml(drink)}</div>
                    ${this.makerHtml(drink)}
                    <div class="plant-card-date"><i class="fas fa-calendar-day me-1"></i>${this.fmtDate(drink.dateTried)}
                        ${drink.photos.length > 1 ? `&middot; <i class="fas fa-camera me-1"></i>${drink.photos.length} ${I18N.t('drinks.photos')}` : ''}
                    </div>
                </div>
            </div>`;
    }

    openModal(id) {
        const drink = this.drinks.find(d => d.id === id);
        if (!drink) return;
        document.getElementById('drink-modal-title').textContent = drink.name;
        document.getElementById('drink-modal-maker').innerHTML = this.makerHtml(drink);
        document.getElementById('drink-modal-body').innerHTML = this.modalHtml(drink);
        history.replaceState(null, '', '#' + drink.id);
        const modalEl = document.getElementById('drink-modal');
        modalEl.addEventListener('hidden.bs.modal', () => history.replaceState(null, '', ' '), { once: true });
        new bootstrap.Modal(modalEl).show();
    }

    modalHtml(drink) {
        const gallery = drink.photos.map(photo => `
            <figure class="plant-photo-figure">
                <a href="${photo.src}" target="_blank" rel="noopener">
                    <img src="${photo.src}" alt="${this.esc(drink.name)}" loading="lazy" />
                </a>
                <figcaption><i class="fas fa-calendar-day me-1"></i>${this.fmtDate(photo.date)} &middot; ${photo.time}</figcaption>
            </figure>`).join('');
        const notes = I18N.tr(drink.notes);

        return `
            <div class="d-flex flex-wrap gap-1 mb-2 align-items-center">
                <span class="badge text-bg-warning">${this.catLabel(drink.category)}${drink.subcategory ? ' &middot; ' + this.esc(this.subLabel(drink.subcategory)) : ''}</span>
                <span class="badge text-bg-light border">${this.esc(I18N.tr(drink.style))}</span>
                <span class="badge drink-abv">${this.esc(drink.abv)}</span>
                ${this.ratingHtml(drink)}
            </div>
            ${notes ? `<p class="mb-1">${this.esc(notes)}</p>` : ''}
            <p class="small text-muted"><i class="fas fa-calendar-day me-1"></i>${I18N.t('drinks.firstTried')} ${this.fmtDate(drink.dateTried)}</p>
            <h6 class="mt-3"><i class="fas fa-images me-1"></i>${I18N.t('drinks.photosHeading')}</h6>
            <div class="plant-timeline">${gallery}</div>`;
    }

    cap(s) {
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    }

    fmtDate(iso) {
        const [y, m, d] = iso.split('-').map(Number);
        return new Date(y, m - 1, d).toLocaleDateString(I18N.dateLocale(), { year: 'numeric', month: 'short', day: 'numeric' });
    }

    esc(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : text;
        return div.innerHTML;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DrinksPage().init();
});
