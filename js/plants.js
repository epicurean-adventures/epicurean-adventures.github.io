// plants.js - renders the "Our Plants" collection from projects/plants.json.
//
// Each plant has a photo timeline (photos[] with dates) so growth can be
// tracked over time, care info (humidity / light / water / cat safety), an
// optional nickname, and a lineage field for future propagation records.
// Text data may be bilingual ({en, zh}) - rendered via I18N.tr(); UI strings
// come from the I18N dictionary and the page re-renders on language toggle.

class PlantsPage {
    constructor() {
        this.plants = [];
        this.filter = 'all';
        this.query = '';
        this.grid = document.getElementById('plants-grid');
        this.countEl = document.getElementById('plant-count');
    }

    async init() {
        try {
            const response = await fetch('projects/plants.json');
            if (!response.ok) throw new Error(`Could not load plants.json (${response.status})`);
            const data = await response.json();
            this.plants = data.plants;
            document.getElementById('loading-message').classList.add('d-none');
            this.attachControls();
            this.render();
            // Deep-linkable filter: plants.html?filter=cat-safe
            const wanted = new URLSearchParams(window.location.search).get('filter');
            if (wanted) {
                const btn = document.querySelector(`#plant-filters button[data-filter="${CSS.escape(wanted)}"]`);
                if (btn) btn.click();
            }
            // Deep link: plants.html#plant-id opens that plant's details
            const hash = decodeURIComponent(window.location.hash.replace('#', ''));
            if (hash && this.plants.some(p => p.id === hash)) this.openModal(hash);
            document.addEventListener('langchange', () => this.render());
        } catch (error) {
            document.getElementById('loading-message').classList.add('d-none');
            const err = document.getElementById('error-message');
            err.classList.remove('d-none');
            document.getElementById('error-text').textContent = error.message;
        }
    }

    attachControls() {
        document.querySelectorAll('#plant-filters button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#plant-filters button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filter = btn.dataset.filter;
                this.render();
            });
        });
        document.getElementById('plant-search').addEventListener('input', e => {
            this.query = e.target.value.trim().toLowerCase();
            this.render();
        });
    }

    matches(plant) {
        if (this.filter === 'cat-safe' && plant.care.catSafe !== true) return false;
        if (this.filter === 'succulent' && !plant.tags.some(t => ['succulent', 'cactus', 'mesemb'].includes(t))) return false;
        if (this.filter === 'herb' && !plant.tags.some(t => ['herb', 'vegetable'].includes(t))) return false;
        if (!['all', 'cat-safe', 'succulent', 'herb'].includes(this.filter) && !plant.tags.includes(this.filter)) return false;
        if (this.query) {
            const hay = [I18N.all(plant.name), plant.scientificName, plant.nickname || '', plant.tags.join(' ')].join(' ').toLowerCase();
            if (!hay.includes(this.query)) return false;
        }
        return true;
    }

    catBadge(plant, long = false) {
        const safe = plant.care.catSafe;
        if (safe === true) return `<span class="badge cat-badge cat-safe" title="${this.esc(I18N.tr(plant.care.catNote) || '')}"><i class="fas fa-cat"></i> ${I18N.t(long ? 'plants.catOK' : 'plants.catOKShort')}</span>`;
        if (safe === false) return `<span class="badge cat-badge cat-toxic" title="${this.esc(I18N.tr(plant.care.catNote) || '')}"><i class="fas fa-cat"></i> ${I18N.t(long ? 'plants.catToxic' : 'plants.catToxicShort')}</span>`;
        return `<span class="badge cat-badge cat-unknown"><i class="fas fa-cat"></i> ?</span>`;
    }

    confidenceBadge(plant) {
        if (plant.idConfidence === 'guess') return `<span class="badge text-bg-warning">${I18N.t('plants.idGuess')}</span>`;
        if (plant.idConfidence === 'likely') return `<span class="badge text-bg-light border">${I18N.t('plants.idLikely')}</span>`;
        return '';
    }

    tagBadge(tag) {
        const label = I18N.lang === 'zh' ? I18N.t('tag.' + tag) : tag;
        return `<span class="badge text-bg-success bg-opacity-75">${this.esc(label)}</span>`;
    }

    render() {
        const visible = this.plants.filter(p => this.matches(p));
        this.countEl.textContent = I18N.t('plants.count').replace('{n}', visible.length).replace('{total}', this.plants.length);
        this.grid.innerHTML = visible.map(plant => this.cardHtml(plant)).join('');
        this.grid.querySelectorAll('[data-plant-id]').forEach(card => {
            card.addEventListener('click', () => this.openModal(card.dataset.plantId));
        });
    }

    cardHtml(plant) {
        const latest = plant.photos[plant.photos.length - 1];
        const nickname = plant.nickname
            ? `<div class="plant-nickname"><i class="fas fa-heart me-1"></i>&ldquo;${this.esc(plant.nickname)}&rdquo;</div>`
            : '';
        const photoInfo = plant.photos.length > 1
            ? `<i class="fas fa-camera me-1"></i>${plant.photos.length} ${I18N.t('plants.photos')} &middot; ${I18N.t('plants.latest')} ${this.fmtDate(latest.date)}`
            : `<i class="fas fa-camera me-1"></i>${this.fmtDate(latest.date)}`;
        return `
            <div class="plant-card" data-plant-id="${plant.id}" role="button" tabindex="0">
                <img src="${latest.thumb}" alt="${this.esc(I18N.tr(plant.name))}" class="plant-card-img" loading="lazy" />
                <div class="plant-card-body">
                    <div class="d-flex justify-content-between align-items-start gap-1">
                        <h2 class="plant-card-title">${this.esc(I18N.tr(plant.name))}</h2>
                        ${this.catBadge(plant)}
                    </div>
                    <div class="scientific-name">${this.esc(plant.scientificName)}</div>
                    ${nickname}
                    <div class="plant-card-date">${photoInfo}</div>
                </div>
            </div>`;
    }

    openModal(id) {
        const plant = this.plants.find(p => p.id === id);
        if (!plant) return;
        const name = I18N.tr(plant.name);
        document.getElementById('plant-modal-title').textContent = plant.nickname ? `${name} - "${plant.nickname}"` : name;
        document.getElementById('plant-modal-sci').textContent = plant.scientificName;
        document.getElementById('plant-modal-body').innerHTML = this.modalHtml(plant);
        history.replaceState(null, '', '#' + plant.id);
        const modalEl = document.getElementById('plant-modal');
        modalEl.addEventListener('hidden.bs.modal', () => history.replaceState(null, '', ' '), { once: true });
        new bootstrap.Modal(modalEl).show();
    }

    modalHtml(plant) {
        const care = plant.care;
        const careRow = (icon, label, value) => value ? `
            <div class="care-row"><i class="fas ${icon} care-icon"></i><div><strong>${label}:</strong> ${this.esc(value)}</div></div>` : '';

        const timeline = plant.photos.map(photo => `
            <figure class="plant-photo-figure">
                <a href="${photo.src}" target="_blank" rel="noopener">
                    <img src="${photo.src}" alt="${this.esc(I18N.tr(plant.name))} ${photo.date}" loading="lazy" />
                </a>
                <figcaption><i class="fas fa-calendar-day me-1"></i>${this.fmtDate(photo.date)} &middot; ${photo.time}</figcaption>
            </figure>`).join('');

        const idNote = I18N.tr(plant.idNote);
        const idNoteHtml = idNote ? `<p class="small text-muted mb-2"><i class="fas fa-magnifying-glass me-1"></i>${this.esc(idNote)}</p>` : '';
        const catLine = care.catNote ? `<div class="care-row"><i class="fas fa-cat care-icon"></i><div>${this.esc(I18N.tr(care.catNote))}</div></div>` : '';
        const difficulty = care.difficulty ? `<span class="badge text-bg-secondary">${I18N.t('diff.' + care.difficulty)}</span>` : '';

        const lineageParent = plant.lineage && plant.lineage.parent
            ? `${I18N.t('plants.parentIs')} <strong>${this.esc(this.nameOf(plant.lineage.parent))}</strong>`
            : I18N.t('plants.noParent');
        const children = this.plants.filter(p => p.lineage && p.lineage.parent === plant.id);
        const lineageChildren = children.length
            ? `<br />${I18N.t('plants.offspring')} ${children.map(c => this.esc(c.nickname || I18N.tr(c.name))).join(', ')}`
            : '';
        const lineageNote = plant.lineage && plant.lineage.propagationNote
            ? `<br /><span class="text-muted">${this.esc(I18N.tr(plant.lineage.propagationNote))}</span>` : '';
        const note = I18N.tr(care.note);

        return `
            <div class="d-flex flex-wrap gap-1 mb-2">${this.catBadge(plant, true)} ${difficulty} ${this.confidenceBadge(plant)}
                ${plant.tags.map(t => this.tagBadge(t)).join(' ')}
            </div>
            ${idNoteHtml}
            <h6 class="mt-3"><i class="fas fa-hand-holding-heart me-1"></i>${I18N.t('plants.care')}</h6>
            ${careRow('fa-droplet', I18N.t('plants.water'), I18N.tr(care.water))}
            ${careRow('fa-cloud-rain', I18N.t('plants.humidity'), I18N.tr(care.humidity))}
            ${careRow('fa-sun', I18N.t('plants.light'), I18N.tr(care.light))}
            ${catLine}
            ${note ? `<p class="small fst-italic text-muted mt-2 mb-0"><i class="fas fa-lightbulb me-1"></i>${this.esc(note)}</p>` : ''}
            <h6 class="mt-4"><i class="fas fa-timeline me-1"></i>${I18N.t('plants.timeline')}</h6>
            <div class="plant-timeline">${timeline}</div>
            <h6 class="mt-4"><i class="fas fa-sitemap me-1"></i>${I18N.t('plants.lineage')}</h6>
            <p class="small mb-0">${lineageParent}${lineageChildren}${lineageNote}</p>`;
    }

    nameOf(id) {
        const plant = this.plants.find(p => p.id === id);
        return plant ? (plant.nickname || I18N.tr(plant.name)) : id;
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
    new PlantsPage().init();
});
