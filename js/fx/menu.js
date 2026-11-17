/* #13 menu — menu em tela cheia (<960px) animado. Gancho FX.hooks.menu(open) chamado pelo main.js,
   que continua dono de aria-expanded, rótulo, foco preso e Esc.
   Abrir: remove [hidden] ANTES de tocar (o CSS tem [hidden]{display:none!important}), painel desce
   (yPercent -100→0, 0,5 s power2.inOut) e os itens sobem (yPercent 60→0 + opacity, stagger .06).
   Fechar: reverse() mais rápido; [hidden] volta no onReverseComplete.
   ADAPTADO: a receita usava clipPath; trocado por transform (regra: só transform/opacity).
   Itens usam opacity (não autoAlpha) para o foco do main.js funcionar já no 1º quadro. */
(window.FX = window.FX || {}).add('menu', {
  order: 61,
  init: function (els) {
    var FX = window.FX, menu = els[0];
    var items = menu.querySelectorAll('.menu-list li');
    var foot = menu.querySelector('.menu-foot');
    var tl = gsap.timeline({
      paused: true,
      defaults: { ease: 'power3.out', duration: 0.45 },
      onReverseComplete: function () { menu.hidden = true; }
    });
    tl.fromTo(menu, { yPercent: -100 }, { yPercent: 0, duration: 0.5, ease: 'power2.inOut' })
      .fromTo(items, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.06 }, '-=0.2');
    if (foot) tl.fromTo(foot, { opacity: 0 }, { opacity: 1, duration: 0.3 }, '-=0.25');

    FX.hooks.menu = function (open) {
      if (open) {
        if (menu.hidden) { menu.hidden = false; tl.progress(0); }
        tl.timeScale(1).play();
      } else {
        if (menu.hidden) return;
        if (tl.progress() === 0) { menu.hidden = true; return; }
        tl.timeScale(1.5).reverse();
      }
    };

    return function () {
      delete FX.hooks.menu;
      tl.kill();
      gsap.set([menu, items, foot].filter(Boolean), { clearProps: 'transform,opacity' });
    };
  }
});
