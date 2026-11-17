/* #12 magnetic — botão "Quero ser agenciado(a)" da chamada final (Home). O <span data-fx="magnetic">
   é a área; o <a> de dentro segue o mouse (até 30% da distância ao centro, quickTo 0,45 s power3.out)
   e volta com elastic.out(1, .4). Só (hover: hover) e (pointer: fine); sem cursor customizado.
   Desempenho: o retângulo da área é lido no mouseenter (e de novo depois de refresh/rolagem/resize),
   nunca a cada mousemove. */
(window.FX = window.FX || {}).add('magnetic', {
  order: 60,
  init: function (els, c) {
    if (!c.fine) return;
    var off = [];
    els.forEach(function (wrap) {
      var btn = wrap.firstElementChild || wrap;
      var k = parseFloat(wrap.getAttribute('data-fx-strength')) || 0.3;
      var xTo = null, yTo = null, rect = null;
      function measure() { rect = wrap.getBoundingClientRect(); }
      function stale() { rect = null; }
      function enter() {
        measure();
        gsap.killTweensOf(btn, 'x,y');
        xTo = gsap.quickTo(btn, 'x', { duration: 0.45, ease: 'power3.out' });
        yTo = gsap.quickTo(btn, 'y', { duration: 0.45, ease: 'power3.out' });
      }
      function move(e) {
        if (!xTo) enter();
        if (!rect) measure();
        xTo((e.clientX - (rect.left + rect.width / 2)) * k);
        yTo((e.clientY - (rect.top + rect.height / 2)) * k);
      }
      function leave() {
        xTo = yTo = null; rect = null;
        gsap.killTweensOf(btn, 'x,y');
        gsap.to(btn, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      }
      wrap.addEventListener('mouseenter', enter);
      wrap.addEventListener('mousemove', move);
      wrap.addEventListener('mouseleave', leave);
      window.addEventListener('scroll', stale, { passive: true });
      window.addEventListener('resize', stale);
      if (window.ScrollTrigger) { ScrollTrigger.addEventListener('refresh', stale); ScrollTrigger.addEventListener('scrollEnd', stale); }
      off.push(function () {
        wrap.removeEventListener('mouseenter', enter);
        wrap.removeEventListener('mousemove', move);
        wrap.removeEventListener('mouseleave', leave);
        window.removeEventListener('scroll', stale);
        window.removeEventListener('resize', stale);
        if (window.ScrollTrigger) { ScrollTrigger.removeEventListener('refresh', stale); ScrollTrigger.removeEventListener('scrollEnd', stale); }
        gsap.killTweensOf(btn); gsap.set(btn, { clearProps: 'transform' });
      });
    });
    return function () { off.forEach(function (f) { f(); }); };
  }
});
