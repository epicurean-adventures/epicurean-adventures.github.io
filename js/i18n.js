// i18n.js - English/Chinese language toggle for the whole site.
//
// How it works:
// - Static HTML: give elements data-i18n="key" (text) or data-i18n-html="key"
//   (markup allowed) and they're swapped on toggle. data-i18n-placeholder sets
//   an input's placeholder.
// - JS pages: use I18N.t('key') for UI strings and I18N.tr(value) for data
//   values that may be bilingual objects {en: "...", zh: "..."}.
// - Language persists in localStorage; ?lang=zh (or en) in a URL overrides it,
//   so links can be shared pre-set to Chinese.
// - Pages that render from JSON listen for the 'langchange' event to re-render.

const I18N = {
    lang: 'en',

    dict: {
        // Navbar & sidebar
        'nav.search': { en: 'Search for...', zh: '搜索…' },
        'sidebar.main': { en: 'Main', zh: '主菜单' },
        'sidebar.home': { en: 'Home', zh: '首页' },
        'sidebar.peaches': { en: 'Peaches', zh: '桃子' },
        'sidebar.about': { en: 'About Us', zh: '关于我们' },
        'sidebar.plants': { en: 'Our Plants', zh: '我们的植物' },
        'sidebar.drinks': { en: 'Drinks', zh: '酒饮' },
        'sidebar.projects': { en: 'Projects', zh: '手作项目' },
        'footer.copyright': { en: '© Epicurean Adventures 2026', zh: '© 饕餮历险记 Epicurean Adventures 2026' },

        // Home
        'home.tagline': { en: 'Plants on every sill, a bar with its own sign, paintings of cats — and the cats themselves.', zh: '窗台上种满植物，小酒馆挂着自己的招牌，画里有猫 —— 猫本猫也在。' },
        'home.supervision': { en: 'everything here is made under close supervision', zh: '本站一切内容均在严格监督下完成' },
        'home.peaches.sub': { en: 'the permanent collection', zh: '常设展' },
        'home.peaches.desc': { en: 'A museum wall for the household calico: gilt frames, placards, and works in the artist’s hand.', zh: '献给家中三花猫的美术馆墙：鎏金画框、展签，还有画手亲绘的作品。' },
        'home.peaches.link': { en: 'visit the gallery', zh: '参观展馆' },
        'home.plants.sub': { en: 'the indoor jungle, 62 strong', zh: '室内丛林，共 62 位成员' },
        'home.plants.desc': { en: 'Every plant with a growing photo timeline, care needs, and an ASPCA cat-safety badge.', zh: '每株植物都有成长照片记录、养护要点，以及 ASPCA 猫咪安全标识。' },
        'home.plants.link1': { en: 'all plants', zh: '全部植物' },
        'home.plants.link2': { en: 'cat-safe only', zh: '只看猫咪安全' },
        'home.plants.link3': { en: 'succulents', zh: '多肉植物' },
        'home.drinks.sub': { en: 'the house drinks ledger', zh: '家庭酒饮档案' },
        'home.drinks.desc': { en: 'Beers and spirits we’ve tried, with tasting notes, brewery marks, and label photos.', zh: '我们喝过的啤酒与烈酒：品鉴笔记、酒厂标志和酒标照片。' },
        'home.drinks.link1': { en: 'all drinks', zh: '全部酒饮' },
        'home.drinks.link2': { en: 'beer', zh: '啤酒' },
        'home.drinks.link3': { en: 'spirits', zh: '烈酒' },
        'home.projects.title': { en: 'Projects', zh: '手作项目' },
        'home.projects.sub': { en: 'things made by hand', zh: '亲手做的东西' },
        'home.projects.desc': { en: 'Watercolors, painted miniatures, and a digital painting series starring Niuniu.', zh: '水彩画、上色的战锤模型，以及以牛牛为主角的数字绘画系列。' },
        'home.projects.link1': { en: 'watercolors', zh: '水彩' },
        'home.projects.link2': { en: 'warhammer', zh: '战锤模型' },
        'home.projects.link3': { en: 'digital paintings', zh: '数字绘画' },
        'home.about.title': { en: 'About Us', zh: '关于我们' },
        'home.about.sub': { en: 'the humans & the management', zh: '人类与管理层' },
        'home.about.desc': { en: 'Spencer, Yunyi, and the three cats who supervise it all: Pookah, Niuniu, and Peaches.', zh: 'Spencer、Yunyi，以及监督一切的三位猫主子：普卡、牛牛和桃子。' },
        'home.about.link': { en: 'meet everyone', zh: '认识大家' },
        'home.plants.title': { en: 'Our Plants', zh: '我们的植物' },

        // Cat names (display)
        'cats.pookah': { en: 'Pookah', zh: '普卡' },
        'cats.niuniu': { en: 'Niuniu', zh: '牛牛' },
        'cats.peaches': { en: 'Peaches', zh: '桃子' },
        'peaches.title': { en: 'Peaches', zh: '桃子' },

        // About
        'about.title': { en: 'About Us', zh: '关于我们' },
        'about.intro': { en: 'The two humans running this website are called <strong>Spencer</strong> and <strong>Yunyi</strong>. We love cats <span class="about-emoji">🐱</span>, seals <span class="about-emoji">🦭</span>, pigs <span class="about-emoji">🐷</span>, and pigeons <span class="about-emoji">🐦</span>. Here we document our plants, drinks, art, and adventures — all under the close supervision of the management team below.', zh: '运营这个网站的两个人类叫 <strong>Spencer</strong> 和 <strong>Yunyi</strong>。我们喜欢猫 <span class="about-emoji">🐱</span>、海豹 <span class="about-emoji">🦭</span>、猪 <span class="about-emoji">🐷</span> 和鸽子 <span class="about-emoji">🐦</span>。在这里我们记录植物、酒饮、画作与生活 —— 一切都由下方的管理层亲自督办。' },
        'about.heading': { en: '<span>🐾</span> The Management <span>🐾</span>', zh: '<span>🐾</span> 管理层 <span>🐾</span>' },
        'about.pookah.role': { en: 'Director of Surveillance', zh: '监察部部长' },
        'about.pookah.fact': { en: 'Those ears miss nothing. Especially not the treat drawer.', zh: '那对耳朵什么都听得见，尤其是零食抽屉的动静。' },
        'about.niuniu.role': { en: 'Resident Muse', zh: '驻场缪斯' },
        'about.niuniu.fact': { en: 'Star of an entire <a href="projects.html#digital-paintings">digital painting series</a>. Loafs professionally.', zh: '整个<a href="projects.html#digital-paintings">数字绘画系列</a>的主角，专业趴窝选手。' },
        'about.peaches.role': { en: 'Curator, The Permanent Collection', zh: '常设展策展人' },
        'about.peaches.fact': { en: 'Has <a href="peaches.html">her own gallery</a>. Accepts tribute in Churu. Reviews watercolors harshly.', zh: '拥有<a href="peaches.html">自己的美术馆</a>。接受猫条进贡，对水彩画评审十分严格。' },
        'about.signoff': { en: 'This page was reviewed and approved by all three cats. 🐾', zh: '本页面已经三位猫主子审阅并批准。🐾' },

        // Peaches gallery
        'peaches.subtitle': { en: 'The Permanent Collection — works devoted to one very good calico.', zh: '常设展 —— 献给一只特别乖的三花猫。' },
        'peaches.divider': { en: 'In the Artist’s Hand', zh: '画手亲绘' },
        'peaches.credits': { en: 'Frames: Sailko (CC BY 3.0), Hubert Robert (PD), Samuel Stanesby (PD) — via Wikimedia Commons.', zh: '画框素材：Sailko（CC BY 3.0）、Hubert Robert（公有领域）、Samuel Stanesby（公有领域）—— 来自维基共享资源。' },
        'peaches.p1.title': { en: 'Repose with Paws Extended', zh: '《伸爪而眠》' },
        'peaches.p1.meta': { en: '2026 · Digital photograph', zh: '2026 · 数码摄影' },
        'peaches.p2.title': { en: 'Vigil at the Curtain', zh: '《帘边守望》' },
        'peaches.p2.meta': { en: '2026 · Digital photograph', zh: '2026 · 数码摄影' },
        'peaches.p3.title': { en: 'Odalisque on the Sofa Arm', zh: '《沙发扶手上的贵妃》' },
        'peaches.p3.meta': { en: '2026 · Digital photograph', zh: '2026 · 数码摄影' },
        'peaches.p4.title': { en: 'Tribute, Being Received', zh: '《受贡图》' },
        'peaches.p4.meta': { en: '2026 · Digital photograph', zh: '2026 · 数码摄影' },
        'peaches.p5.title': { en: 'Toe Beans in Repose', zh: '《静卧肉垫》' },
        'peaches.p5.meta': { en: '2026 · Digital photograph', zh: '2026 · 数码摄影' },
        'peaches.p6.title': { en: 'Peaches, Selling Peaches', zh: '《桃子卖桃图》' },
        'peaches.p6.meta': { en: '2026 · Detail from <a href="projects.html#watercolors">Cat Market</a>', zh: '2026 · 《猫咪市集》局部 · <a href="projects.html#watercolors">看原作</a>' },
        'peaches.p7.title': { en: 'Studies of a Calico (with Critic)', zh: '《三花猫习作（附评审）》' },
        'peaches.p7.meta': { en: '2026 · Watercolor · <a href="projects.html#watercolors">see all art</a>', zh: '2026 · 水彩 · <a href="projects.html#watercolors">看全部画作</a>' },

        // Plants page
        'plants.title': { en: 'Our Plants', zh: '我们的植物' },
        'plants.intro': { en: 'The indoor (and porch) jungle. Every plant gets a photo timeline so we can watch it grow — click any card for its full story and care needs.', zh: '室内（和阳台）小丛林。每株植物都有照片时间线，记录它慢慢长大 —— 点击卡片查看它的故事和养护要点。' },
        'plants.loading': { en: 'Loading the jungle...', zh: '丛林加载中…' },
        'plants.search': { en: 'Search plants...', zh: '搜索植物…' },
        'plants.f.all': { en: 'All', zh: '全部' },
        'plants.f.catsafe': { en: 'Cat-safe', zh: '猫咪安全' },
        'plants.f.succulent': { en: 'Succulents & cacti', zh: '多肉与仙人掌' },
        'plants.f.foliage': { en: 'Foliage', zh: '观叶' },
        'plants.f.flowering': { en: 'Flowering', zh: '开花' },
        'plants.f.herb': { en: 'Herbs & edibles', zh: '香草食用' },
        'plants.f.hanging': { en: 'Hanging', zh: '垂吊' },
        'plants.f.mystery': { en: 'Mysteries', zh: '谜之植物' },
        'plants.count': { en: '{n} of {total} plants', zh: '共 {total} 株，显示 {n} 株' },
        'plants.photos': { en: 'photos', zh: '张照片' },
        'plants.latest': { en: 'latest', zh: '最近' },
        'plants.care': { en: 'Care', zh: '养护' },
        'plants.water': { en: 'Water', zh: '浇水' },
        'plants.humidity': { en: 'Humidity', zh: '湿度' },
        'plants.light': { en: 'Light', zh: '光照' },
        'plants.timeline': { en: 'Growth timeline', zh: '成长记录' },
        'plants.lineage': { en: 'Lineage', zh: '族谱' },
        'plants.noParent': { en: 'No recorded parent - an original member of the jungle.', zh: '没有记录的母株 —— 丛林的元老成员。' },
        'plants.parentIs': { en: 'Propagated from', zh: '繁殖自' },
        'plants.offspring': { en: 'Offspring:', zh: '后代：' },
        'plants.catOK': { en: 'Cat-safe', zh: '猫咪安全' },
        'plants.catOKShort': { en: 'OK', zh: '安全' },
        'plants.catToxic': { en: 'Toxic to cats', zh: '对猫有毒' },
        'plants.catToxicShort': { en: 'Toxic', zh: '有毒' },
        'plants.idGuess': { en: 'ID: best guess', zh: '鉴定：大概是' },
        'plants.idLikely': { en: 'ID: likely', zh: '鉴定：很可能' },
        'diff.easy': { en: 'easy', zh: '好养' },
        'diff.moderate': { en: 'moderate', zh: '一般' },
        'diff.fussy': { en: 'fussy', zh: '娇气' },

        // Plant tags
        'tag.succulent': { en: 'succulent', zh: '多肉' },
        'tag.cactus': { en: 'cactus', zh: '仙人掌' },
        'tag.mesemb': { en: 'mesemb', zh: '番杏' },
        'tag.foliage': { en: 'foliage', zh: '观叶' },
        'tag.flowering': { en: 'flowering', zh: '开花' },
        'tag.herb': { en: 'herb', zh: '香草' },
        'tag.vegetable': { en: 'vegetable', zh: '蔬果' },
        'tag.hanging': { en: 'hanging', zh: '垂吊' },
        'tag.porch': { en: 'porch', zh: '阳台' },
        'tag.tree': { en: 'tree', zh: '树木' },
        'tag.bonsai': { en: 'bonsai', zh: '盆景' },
        'tag.conifer': { en: 'conifer', zh: '针叶' },
        'tag.perennial': { en: 'perennial', zh: '多年生' },
        'tag.annual': { en: 'annual', zh: '一年生' },
        'tag.bulb': { en: 'bulb', zh: '球根' },
        'tag.seedling': { en: 'seedling', zh: '小苗' },
        'tag.mystery': { en: 'mystery', zh: '谜' },
        'tag.propagation': { en: 'propagation', zh: '扦插' },
        'tag.vine': { en: 'vine', zh: '藤蔓' },

        // Drinks page
        'drinks.title': { en: "Spencer's Bar", zh: 'Spencer 的小酒馆' },
        'drinks.tagline': { en: 'The house drinks ledger — beers, spirits, and whatever else makes it past the bottle opener. Click a card for photos and tasting notes.', zh: '家庭酒饮档案 —— 啤酒、烈酒，以及一切通过开瓶器考验的东西。点击卡片查看照片和品鉴笔记。' },
        'drinks.loading': { en: 'Opening the bar...', zh: '酒馆开门中…' },
        'drinks.search': { en: 'Search drinks...', zh: '搜索酒饮…' },
        'drinks.all': { en: 'All', zh: '全部' },
        'drinks.count': { en: '{n} of {total} drinks', zh: '共 {total} 款，显示 {n} 款' },
        'drinks.photos': { en: 'photos', zh: '张照片' },
        'drinks.photosHeading': { en: 'Photos', zh: '照片' },
        'drinks.firstTried': { en: 'First tried', zh: '初次品尝于' },
        'drinks.allOf': { en: 'All {cat}', zh: '全部{cat}' },
        'cat.beer': { en: 'Beer', zh: '啤酒' },
        'cat.spirits': { en: 'Spirits', zh: '烈酒' },
        'cat.wine': { en: 'Wine', zh: '葡萄酒' },
        'cat.cocktail': { en: 'Cocktail', zh: '鸡尾酒' },
        'sub.IPA': { en: 'IPA', zh: 'IPA' },
        'sub.Pale Ale': { en: 'Pale Ale', zh: '淡色艾尔' },
        'sub.Gin': { en: 'Gin', zh: '金酒' },

        // Projects page
        'projects.title': { en: 'Projects', zh: '手作项目' },
        'projects.added': { en: 'Added:', zh: '添加于：' },
        'projects.none': { en: 'No projects found.', zh: '没有找到相关项目。' },
    },

    t(key) {
        const entry = this.dict[key];
        if (!entry) return key;
        return entry[this.lang] || entry.en;
    },

    // Bilingual data value: {en, zh} object or plain string
    tr(value) {
        if (value == null) return value;
        if (typeof value === 'object') return value[this.lang] || value.en || '';
        return value;
    },

    // For search: every language's text of a value
    all(value) {
        if (value == null) return '';
        if (typeof value === 'object') return Object.values(value).join(' ');
        return String(value);
    },

    dateLocale() {
        return this.lang === 'zh' ? 'zh-CN' : 'en-US';
    },

    set(lang) {
        this.lang = lang === 'zh' ? 'zh' : 'en';
        try { localStorage.setItem('site-lang', this.lang); } catch (e) { /* private mode */ }
        document.documentElement.lang = this.lang === 'zh' ? 'zh-CN' : 'en';
        this.apply();
        document.dispatchEvent(new CustomEvent('langchange'));
    },

    toggle() {
        this.set(this.lang === 'zh' ? 'en' : 'zh');
    },

    apply() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            el.textContent = this.t(el.dataset.i18n);
        });
        document.querySelectorAll('[data-i18n-html]').forEach(el => {
            el.innerHTML = this.t(el.dataset.i18nHtml);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            el.placeholder = this.t(el.dataset.i18nPlaceholder);
        });
        const btn = document.getElementById('lang-toggle');
        if (btn) {
            btn.textContent = this.lang === 'zh' ? 'EN' : '中文';
            btn.title = this.lang === 'zh' ? 'Switch to English' : '切换到中文';
        }
    },

    init() {
        let lang = null;
        try { lang = localStorage.getItem('site-lang'); } catch (e) { /* private mode */ }
        const param = new URLSearchParams(window.location.search).get('lang');
        if (param === 'zh' || param === 'en') lang = param;
        this.lang = lang === 'zh' ? 'zh' : 'en';
        document.documentElement.lang = this.lang === 'zh' ? 'zh-CN' : 'en';
    },
};

I18N.init();

// The toggle button lives in the fetched navbar, so listen at document level
document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('#lang-toggle')) {
        e.preventDefault();
        I18N.toggle();
    }
});

document.addEventListener('DOMContentLoaded', () => I18N.apply());
