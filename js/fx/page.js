/* #14 page — cortina vermelha entre páginas (sem Barba; funciona em file://).
   Saída: no clique em link interno a cortina sobe de baixo (scaleY 0→1) e então navega.
   Entrada: se a página anterior saiu com a cortina, ela chega fechada desde o 1º quadro
   (html.fx-cover, script inline do <head>; fx.js passa para estilo inline) e se abre para cima.
   Ignora: Ctrl/Cmd/Shift/Alt, botão do meio, target, download, "#", mailto/tel/wa.me e outros domínios.
   Voltar do navegador (bfcache): fx.js trata em "pageshow". */
(window.FX = window.FX || {}).add('page', {
  order: 5,
  init: function (els) {
    var FX = window.FX, curtain = els[0], DUR = 0.6, EASE = 'power2.inOut';

    /* entrada (a intro da Home assume a cortina quando ela vai tocar) */
    if (FX.state.arrivedCovered && !FX.state.introOwnsCurtain) {
      FX.state.arrivedCovered = false;
      FX.state.enterDelay = 0.2;
      gsap.fromTo(curtain, { scaleY: 1 }, { scaleY: 0, transformOrigin: '50% 0%', duration: DUR, ease: EASE, delay: 0.05 });
    }

    function internal(a, e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
      if (a.hasAttribute('download') || (a.getAttribute('target') || '') !== '') return false;
      var raw = a.getAttribute('href') || '';
      if (!raw || raw.charAt(0) === '#') return false;
      if (a.protocol !== location.protocol || a.host !== location.host) return false;   // externos, mailto:, tel:
      if (a.pathname === location.pathname && a.search === location.search) return false; // mesma página (com ou sem #)
      return true;
    }

    function onClick(e) {
      var a = e.target.closest && e.target.closest('a[href]');
      if (!a || FX.state.leaving || !internal(a, e)) return;
      e.preventDefault();
      FX.state.leaving = true;
      var href = a.href;
      gsap.set(curtain, { pointerEvents: 'auto' });
      gsap.fromTo(curtain, { scaleY: 0 }, {
        scaleY: 1, transformOrigin: '50% 100%', duration: DUR, ease: EASE, overwrite: true,
        onComplete: function () {
          FX.session('fx-curtain', '1');
          FX.state.leaving = false;
          location.href = href;
        }
      });
    }
    document.addEventListener('click', onClick);

    return function () { document.removeEventListener('click', onClick); };
  }
});
