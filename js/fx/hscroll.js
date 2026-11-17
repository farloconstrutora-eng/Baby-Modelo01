/* #7 hscroll — "the edit" (Home). Só >=960px: a seção fica presa e o trilho .fx-track anda em x
   conforme a rolagem vertical (ease "none", scrub 1, end = largura do trilho que sobra).
   Liga com overflow visível e sem scroll-snap (inline, desfeito ao reverter). Abaixo de 960px fica
   a grade de 2 colunas da etapa 2; sem JS, o trilho rola na horizontal nativamente. */
(window.FX = window.FX || {}).add('hscroll', {
  order: 41,
  init: function (els, c) {
    if (!c.desktop || !window.ScrollTrigger) return;
    var off = [];
    els.forEach(function (sec) {
      var track = sec.querySelector('.fx-track');
      if (!track) return;
      gsap.set(track, { overflow: 'visible', scrollSnapType: 'none' });
      function dist() { return Math.max(0, track.scrollWidth - track.clientWidth); }
      if (dist() < 8) return;   // cabe na tela: nada a fazer
      var tween = gsap.to(track, {
        x: function () { return -dist(); },
        ease: 'none',
        scrollTrigger: {
          trigger: sec,
          start: 'top top',
          end: function () { return '+=' + dist(); },
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      /* teclado: ao focar um cartão fora da tela na horizontal, rola até ele ficar no centro */
      function onFocus(e) {
        var p = e.target.closest && e.target.closest('.fx-panel'), st = tween.scrollTrigger, d = dist();
        if (!p || !st || !d) return;
        var want = gsap.utils.clamp(0, d, (p.offsetLeft - track.offsetLeft) + p.offsetWidth / 2 - track.clientWidth / 2);
        var y = st.start + (want / d) * (st.end - st.start);
        // depois do ajuste vertical que o ScrollSmoother faz no foco
        requestAnimationFrame(function () {
          if (window.FX.smoother) window.FX.smoother.scrollTo(y, true); else window.scrollTo(0, y);
        });
      }
      track.addEventListener('focusin', onFocus);
      off.push(function () { track.removeEventListener('focusin', onFocus); });
    });
    return function () { off.forEach(function (f) { f(); }); };
  }
});
