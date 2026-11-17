/* #4 reveal-batch e #5 reveal — entrada ao rolar (opacity 0→1, y 40→0, 0,9 s, power3.out, "top 85%", uma vez).
   O estado escondido é aplicado aqui (gsap.set, ramo motionOk), nunca no CSS.
   Usa opacity (não autoAlpha) para que links e botões continuem alcançáveis pelo Tab antes de aparecer.
   #6 no celular: a frase-chave (pin-scrub) também entra como reveal, ver pin-scrub.js. */
(function () {
  var FX = window.FX = window.FX || {};
  var V = { y: 40, dur: 0.9, ease: 'power3.out', stagger: 0.08, start: 'top 85%' };
  FX.revealBatch = function (items) {
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: V.y });
    ScrollTrigger.batch(items, {
      start: V.start,
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, { opacity: 1, y: 0, duration: V.dur, ease: V.ease, stagger: V.stagger, overwrite: true, clearProps: 'transform' });
      }
    });
  };

  FX.add('reveal-batch', {
    order: 30,
    init: function (els) {
      if (!window.ScrollTrigger) return;
      els.forEach(function (el) { FX.revealBatch([].slice.call(el.children)); });
    }
  });

  FX.add('reveal', {
    order: 31,
    init: function (els) {
      if (!window.ScrollTrigger) return;
      els.forEach(function (el) {
        gsap.fromTo(el, { opacity: 0, y: V.y }, {
          opacity: 1, y: 0, duration: V.dur, ease: V.ease, clearProps: 'transform',
          scrollTrigger: { trigger: el, start: V.start, once: true }
        });
      });
    }
  });
})();
