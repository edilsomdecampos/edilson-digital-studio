(() => {
    'use strict';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = document.querySelector('#art');
    const ctx = canvas.getContext('2d', { alpha: false });
    let W = 0, H = 0, D = 1, frame = 0, pointer = { x: .66, y: .5 };
    let points = [];
    function setup() { const rect = canvas.getBoundingClientRect(); W = Math.max(1, rect.width); H = Math.max(1, rect.height); D = Math.min(window.devicePixelRatio || 1, 1.6); canvas.width = Math.round(W * D); canvas.height = Math.round(H * D); ctx.setTransform(D, 0, 0, D, 0, 0); const n = Math.min(1300, Math.max(480, Math.floor(W * H / 870))); points = Array.from({ length: n }, (_, i) => ({ phi: Math.acos(1 - 2 * (i + .5) / n), theta: Math.PI * (3 - Math.sqrt(5)) * i, twist: Math.random() * Math.PI * 2, s: .35 + Math.random() * 1.2 })); if (reduced)
        draw(0); }
    function draw(t) {
        frame = t * .00025;
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#0a1110');
        bg.addColorStop(.52, '#0b1514');
        bg.addColorStop(1, '#101717');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        const x = W * (W < 700 ? .69 : .73), y = H * .52;
        let r = Math.min(W * .32, H * .49);
        if (W < 700)
            r = Math.min(W * .47, H * .38);
        let halo = ctx.createRadialGradient(x, y, 0, x, y, r * 1.8);
        halo.addColorStop(0, 'rgba(154,222,90,.16)');
        halo.addColorStop(.48, 'rgba(110,170,88,.06)');
        halo.addColorStop(1, 'rgba(8,16,13,0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
        ctx.fill();
        const rot = frame * .48 + (pointer.x - .5) * .6;
        const tilt = .22 + (pointer.y - .5) * .24;
        let projected = [];
        for (const p of points) {
            const a = p.phi, b = p.theta + rot + Math.sin(p.phi * 3 + frame) * .12;
            let xx = Math.sin(a) * Math.cos(b), zz = Math.sin(a) * Math.sin(b), yy = Math.cos(a);
            let X = xx * Math.cos(tilt) - yy * Math.sin(tilt), Y = xx * Math.sin(tilt) + yy * Math.cos(tilt);
            const warped = 1 + .11 * Math.sin(3 * b + 4 * a + frame * 1.7) + .065 * Math.sin(8 * a - 5 * b + frame * .6);
            let depth = 2.9 - zz * .62;
            const scale = 2.9 / depth;
            projected.push({ x: x + X * r * warped * scale, y: y + Y * r * warped * scale, z: zz, alpha: Math.max(.06, (zz + 1) * .45) * (.45 + .5 * Math.sin(a * 4 + b * 3 + frame) ** 2), size: p.s * scale });
        }
        for (let i = 0; i < projected.length; i++) {
            const p = projected[i];
            ctx.fillStyle = `rgba(${p.z > .05 ? '210,250,116' : '119,155,117'},${p.alpha * .88})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-.52 + rot * .15);
        ctx.strokeStyle = 'rgba(210,250,114,.17)';
        ctx.lineWidth = .8;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.45, r * .47, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(210,250,114,.10)';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.15, r * .66, Math.PI / 2.5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        for (let i = 0; i < 30; i++) {
            const nx = ((i * 37.17) % 101) / 101, ny = ((i * 79.47) % 97) / 97;
            let px = nx * W + Math.sin(frame * .3 + i) * 12, py = ny * H;
            ctx.fillStyle = 'rgba(200,230,191,.12)';
            ctx.fillRect(px, py, 1, 1);
        }
    }
    let raf;
    function loop(t) { draw(t); raf = requestAnimationFrame(loop); }
    setup();
    if (!reduced)
        raf = requestAnimationFrame(loop);
    let rt;
    addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(setup, 130); }, { passive: true });
    window.addEventListener('pointermove', e => { pointer.x = e.clientX / innerWidth; pointer.y = e.clientY / innerHeight; }, { passive: true });
    const halo = document.querySelector('.cursor-halo');
    window.addEventListener('pointermove', e => { halo.style.left = e.clientX + 'px'; halo.style.top = e.clientY + 'px'; halo.style.opacity = '1'; }, { passive: true });
    const bar = document.querySelector('.progress');
    let scrolling = false;
    function onScroll() { if (scrolling)
        return; scrolling = true; requestAnimationFrame(() => { let max = document.documentElement.scrollHeight - innerHeight; bar.style.width = (max > 0 ? scrollY / max * 100 : 0) + '%'; scrolling = false; }); }
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
    } }), { threshold: .12 });
    document.querySelectorAll('.reveal').forEach(el => { if (reduced)
        el.classList.add('in');
    else
        io.observe(el); });
    const toggle = document.querySelector('.menu-toggle'), links = document.querySelector('.nav-links');
    toggle.addEventListener('click', () => { let open = links.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(open)); });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }));
    const date = document.querySelector('input[name="data"]');
    const local = new Date();
    let yy = local.getFullYear(), mm = String(local.getMonth() + 1).padStart(2, '0'), dd = String(local.getDate()).padStart(2, '0');
    date.min = `${yy}-${mm}-${dd}`;
    const form = document.querySelector('#booking-form');
    form.addEventListener('submit', event => { event.preventDefault(); const error = form.querySelector('.form-error'); error.textContent = ''; if (!form.checkValidity()) {
        form.reportValidity();
        error.textContent = 'Preencha os campos obrigatórios para continuar.';
        return;
    } const f = new FormData(form); if (String(f.get('data')) < date.min) {
        error.textContent = 'Escolha uma data de hoje em diante.';
        return;
    } const msg = `Olá, Edilson! Gostaria de solicitar uma conversa sobre um projeto.\n\nNome: ${f.get('nome')}\nEmpresa/projeto: ${f.get('empresa') || 'Não informado'}\nData preferida: ${f.get('data')}\nHorário preferido: ${f.get('hora')}\nIdeia: ${f.get('projeto')}\n\nPodemos confirmar a disponibilidade?`; const url = 'https://wa.me/5515991644818?text=' + encodeURIComponent(msg); const popup = window.open(url, '_blank', 'noopener,noreferrer'); if (!popup) {
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.click();
    } });
})();

