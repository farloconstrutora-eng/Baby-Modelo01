/* #10 roster-filter — Talentos. Envolve a função apply() do main.js (gancho FX.hooks.filter):
   1) quem vai sair some (opacity + scale .95, 0,25 s) ainda no lugar;
   2) Flip.getState → main.js aplica o filtro (hidden, aria-pressed, estado vazio) → Flip.from
      reposiciona quem ficou (0,45 s, power2.inOut) e quem entra aparece (onEnter).
   ADAPTADO: absolute:false (com absolute:true a grade inteira fica absoluta durante o Flip e a
   página abaixo dá um salto). A lógica de filtro continua sendo só a do main.js. */
(window.FX = window.FX || {}).add('roster-filter', {
  order: 50,
  init: function (els) {
    if (!window.Flip) return;
    var FX = window.FX, roster = els[0];
    var cards = [].slice.call(roster.querySelectorAll('.talent'));
    var empty = document.getElementById('roster-vazio');
    var active = null;   // animação em curso (clique rápido: termina a anterior)

    function shows(card, cat) { return cat === 'todos' || card.getAttribute('data-categoria') === cat; }

    FX.hooks.filter = function (run, cat) {
      var guard = 0;
      while (active && guard++ < 4) { var a = active; active = null; a.progress(1); }   // fase 1 → fase 2 → fim
      var leaving = cards.filter(function (c) { return !c.hidden && !roster.hidden && !shows(c, cat); });
      var emptyBefore = empty ? !empty.hidden : false;

      function phase2() {
        var state = Flip.getState(cards);
        run();
        if (leaving.length) gsap.set(leaving, { clearProps: 'opacity,transform' });
        active = Flip.from(state, {
          duration: 0.45,
          ease: 'power2.inOut',
          absolute: false,
          onEnter: function (els) {
            return gsap.fromTo(els, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'power2.out', delay: 0.1 });
          },
          onComplete: function () { active = null; }
        });
        if (empty && !empty.hidden && !emptyBefore) gsap.from(empty, { opacity: 0, y: 20, duration: 0.45, ease: 'power3.out' });
      }

      if (leaving.length) {
        active = gsap.to(leaving, { opacity: 0, scale: 0.95, duration: 0.25, ease: 'power2.in', onComplete: function () { active = null; phase2(); } });
        /* progress(1) num clique rápido dispara o onComplete e completa a fase 1 na hora */
      } else {
        phase2();
      }
    };

    return function () {
      var guard = 0;
      while (active && guard++ < 4) { var a = active; active = null; a.progress(1); }
      delete FX.hooks.filter;
      gsap.set(cards, { clearProps: 'opacity,transform' });
    };
  }
});
