const root = document.documentElement;
root.classList.add('js');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;

// ---- Frases do hero: troca lenta, com o "i" em itálico.
const phrases = [...document.querySelectorAll('.phrase')];
phrases.forEach(p => { p.innerHTML = p.textContent.replace(/i/g, '<em>i</em>'); });
let cur = 0;
if (!reduce) setInterval(() => {
  const prev = phrases[cur]; cur = (cur + 1) % phrases.length; const next = phrases[cur];
  prev.classList.remove('is-on'); prev.classList.add('is-off');
  next.classList.remove('is-off'); next.classList.add('is-on');
  setTimeout(() => prev.classList.remove('is-off'), 1300);
}, 4200);

// ---- Manifesto: linhas fixas, cada uma com uma máscara que desliza ao entrar na tela.
const manifesto = document.getElementById('manifesto-text');
manifesto.setAttribute('aria-label', manifesto.textContent.trim());
manifesto.innerHTML = manifesto.dataset.lines.split('|').map(l =>
  `<span class="line" aria-hidden="true"><span class="content"><span>${l}</span><span class="mask"></span></span></span>`).join('');

// ---- Entradas por visibilidade (revelações, marcas, linhas do manifesto).
const seen = new IntersectionObserver((es) => {
  es.filter(e => e.isIntersecting).forEach((e, i) => {
    if (e.target.classList.contains('line')) e.target.style.transitionDelay = (i * 0.09) + 's';
    if (e.target.id === 'brands') [...e.target.querySelectorAll('.word')].forEach((w, k) => { w.style.transitionDelay = (k * 0.12) + 's'; });
    e.target.classList.add('in'); seen.unobserve(e.target);
  });
}, { rootMargin: '0px 0px -20% 0px', threshold: 0 });
document.querySelectorAll('.reveal,.fade,.brands,.manifesto .line').forEach(el => seen.observe(el));

// ---- Rolagem suave (Lenis) + distorção por velocidade.
let lenis = null, velocity = 0;
if (!reduce && window.Lenis) {
  lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 });
  let sk = 0;
  lenis.on('scroll', ({ velocity: v }) => {
    velocity = v;
    sk += (Math.max(-5, Math.min(5, v * 0.35)) - sk) * 0.4;
    root.style.setProperty('--sk', sk.toFixed(3));
    root.style.setProperty('--st', (Math.abs(sk) * 0.012).toFixed(4));
  });
  setInterval(() => { if (Math.abs(lenis.velocity) < 0.05) { velocity = 0; root.style.setProperty('--sk', 0); root.style.setProperty('--st', 0); } }, 120);
  document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href')); if (t) { e.preventDefault(); lenis.scrollTo(t, { duration: 1.6 }); }
  }));
}

// ---- Parallax por elemento (data-speed: positivo atrasa, negativo adianta).
const para = [...document.querySelectorAll('[data-speed]')].map(el => ({ el, speed: parseFloat(el.dataset.speed), mid: 0 }));
const measure = () => para.forEach(p => { p.el.style.transform = 'none'; const r = p.el.getBoundingClientRect(); p.mid = r.top + scrollY + r.height / 2; });
measure(); addEventListener('load', measure); addEventListener('resize', measure);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);

// ---- Marquee: anda sozinho e acelera com a rolagem (e inverte com ela).
const track = document.querySelector('.marquee__track');
let off = 0, half = 0;
const measureMarquee = () => { half = track ? track.scrollWidth / 2 : 0; };
measureMarquee(); addEventListener('resize', measureMarquee); addEventListener('load', measureMarquee);

// ---- Frase do hero some e sobe com a rolagem.
const phrasesEl = document.querySelector('.hero__phrases');

// ---- Cursor: ponto pequeno; vira círculo com seta sobre links/projetos; estica na direção do movimento.
const cursorEl = document.querySelector('.cursor');
let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
if (cursorEl && fine) {
  addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY; cursorEl.classList.add('is-on');
    cursorEl.classList.toggle('is-big', !!e.target.closest('a,.work,.btn'));
  }, { passive: true });
  document.addEventListener('pointerleave', () => cursorEl.classList.remove('is-on'));
}

let last = performance.now();
const frame = now => {
  const dt = Math.min(50, now - last) / 16.7; last = now;
  const y = scrollY;
  if (!reduce) {
    para.forEach(p => { p.el.style.transform = `translate3d(0,${((y - (p.mid - innerHeight / 2)) * p.speed * 0.12).toFixed(1)}px,0)`; });
    if (track && half) { off += (0.5 + velocity * 0.7) * dt; track.style.transform = `translate3d(${-(((off % half) + half) % half)}px,0,0)`; }
    const k = Math.min(1, y / (innerHeight * 0.6));
    phrasesEl.style.opacity = 1 - k; phrasesEl.style.transform = `translateY(${k * -40}px)`;
  }
  if (cursorEl && fine) {
    const dx = tx - cx, dy = ty - cy; cx += dx * 0.2 * dt; cy += dy * 0.2 * dt;
    const sp = Math.min(Math.hypot(dx, dy) * 0.012, 0.6);
    cursorEl.style.transform = `translate3d(${cx}px,${cy}px,0) scale(${1 + sp * 0.6},${1 - sp * 0.25})`;
  }
  requestAnimationFrame(frame);
};
requestAnimationFrame(frame);
