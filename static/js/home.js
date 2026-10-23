
(function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var onHome = true;
    var navObj = null;

    /* assemble email at runtime (keeps the raw address out of the HTML source) */
    document.querySelectorAll('a.email').forEach(function (a) {
        var addr = a.getAttribute('data-user') + '@' + a.getAttribute('data-domain');
        a.setAttribute('href', 'mailto:' + addr);
        if (a.getAttribute('data-show') === 'true') { a.textContent = addr; }
    });

    /* reveal-on-scroll */
    var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: .14 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

    var sections = [].slice.call(document.querySelectorAll('main section[id]'));
    function navLinkFor(id) { return document.querySelector('.nav a[href="#' + id + '"]'); }

    /* nav-item scroll-progress fill + subtle hero parallax */
    var ticking = false;
    var heroImg = document.querySelector('.hero__img');
    function updateNav() {
        var vh = window.innerHeight;
        if (heroImg && !reduce) {
            if (window.innerWidth > 900) {
                var py = Math.min(window.scrollY || 0, vh * 0.6) * 0.24;
                heroImg.style.transform = 'translate3d(0,' + py.toFixed(1) + 'px,0)';
            } else {
                heroImg.style.transform = '';
            }
        }
        sections.forEach(function (sec) {
            var link = navLinkFor(sec.id);
            if (!link) return;
            var r = sec.getBoundingClientRect();
            var p = (vh * 0.82 - r.top) / Math.max(1, r.height * 0.6);
            p = p < 0 ? 0 : (p > 1 ? 1 : p);
            link.style.setProperty('--p', (p * 100).toFixed(1) + '%');
        });
        ticking = false;
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(updateNav); } }
    updateNav();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    /* scroll-spy: active nav item + per-section background color shift */
    var scenes = {
        home: '#0b0b0d', who: '#0c0d12', thinking: '#0d0c10',
        lab: '#0b0e0f', work: '#0e0c0d', personal: '#0d0b11'
    };
    var pops = {
        home: '#3f6fff', who: '#ff5e3a', thinking: '#28e08c',
        lab: '#9d5cff', work: '#3f6fff', personal: '#ff4f87'
    };
    var vivid = ['#3f6fff', '#ff5e3a', '#28e08c', '#9d5cff', '#ff4f87'];
    var vIdx = 0;
    function nextColor() {
        vIdx = (vIdx + 1) % vivid.length;
        document.documentElement.style.setProperty('--pop', vivid[vIdx]);
    }
    var spy = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
            if (e.isIntersecting) {
                document.querySelectorAll('.nav a').forEach(function (a) { a.removeAttribute('aria-current'); });
                var link = navLinkFor(e.target.id);
                if (link) link.setAttribute('aria-current', 'true');
                var sc = scenes[e.target.id];
                if (sc) document.documentElement.style.setProperty('--scene', sc);
                if (e.target.id === 'home') {
                    document.documentElement.style.setProperty('--pop', vivid[vIdx]);
                } else {
                    var pc = pops[e.target.id];
                    if (pc) document.documentElement.style.setProperty('--pop', pc);
                }
                onHome = (e.target.id === 'home');
                if (onHome && navObj) navObj.resetTo("An example status line.");
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });

    /* mobile hamburger menu */
    var toggle = document.querySelector('.navtoggle');
    var sidebar = document.getElementById('primary-nav');
    if (toggle && sidebar) {
        function setMenu(open) {
            sidebar.classList.toggle('open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
            if (open) {
                var first = sidebar.querySelector('a');
                if (first) first.focus();
            }
        }
        toggle.addEventListener('click', function () {
            setMenu(toggle.getAttribute('aria-expanded') !== 'true');
        });
        sidebar.querySelectorAll('a').forEach(function (a) {
            a.addEventListener('click', function () { setMenu(false); });
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
                setMenu(false);
                toggle.focus();
            }
        });
    }

    /* clipped-roll on a shared timer. The headline word rotates continuously;
       the nav status stays static on Home and only rotates off-Home. */
    function makeRoll(rollEl, words) {
        if (!rollEl) return null;
        var track = rollEl.querySelector('.roll__track');
        var items = track.children;
        var i = 0;
        function paint() {
            items[0].textContent = words[i];
            items[1].textContent = words[(i + 1) % words.length];
        }
        paint();
        return {
            advance: function () {
                track.style.transition = 'transform .42s cubic-bezier(.16,.86,.26,1)';
                track.style.transform = 'translateY(-50%)';
                setTimeout(function () {
                    i = (i + 1) % words.length;
                    track.style.transition = 'none';
                    track.style.transform = 'translateY(0)';
                    paint();
                    void track.offsetWidth;
                }, 460);
            },
            resetTo: function (word) {
                var idx = words.indexOf(word);
                if (idx >= 0) { i = idx; }
                track.style.transition = 'none';
                track.style.transform = 'translateY(0)';
                paint();
                void track.offsetWidth;
            }
        };
    }
    navObj = makeRoll(document.getElementById('navroll'), [
        "An example status line.",
        "It’s not a portfolio—it’s a template.",
        "Fork it. Ship it. Make it yours.",
        "Now with 100% more em-dashes.",
        "Swap the words; keep the bones."
    ]);
    var wordObj = makeRoll(document.getElementById('wordroll'), [
        "em-dash", "semicolon", "Oxford comma", "ellipsis", "interrobang"
    ]);
    var rollTimer = null;
    function startRolls() {
        if (!reduce && !rollTimer) {
            rollTimer = setInterval(function () {
                if (wordObj) wordObj.advance();
                if (navObj && !onHome) navObj.advance();
                if (onHome) nextColor();
            }, 3400);
        }
    }
    function stopRolls() { if (rollTimer) { clearInterval(rollTimer); rollTimer = null; } }
    if (!reduce) { setTimeout(startRolls, 1800); }
    if (sidebar) {
        sidebar.addEventListener('mouseenter', stopRolls);
        sidebar.addEventListener('mouseleave', startRolls);
        sidebar.addEventListener('focusin', stopRolls);
        sidebar.addEventListener('focusout', startRolls);
    }
})();

/* فقط در حالت توسعه، با آدرس ?jig */
if (new URLSearchParams(window.location.search).has('jig')) {
    var j = document.createElement('script');
    j.src = window.CROP_JIG_URL;
    document.body.appendChild(j);
}
