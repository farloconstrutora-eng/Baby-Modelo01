/* #11 smooth — ScrollSmoother (GSAP) no #smooth-wrapper > #smooth-content.
   ADAPTADO: a spec pedia Lenis; usamos ScrollSmoother (mesmo ecossistema, marcação já pronta).
   Só com movimento permitido e ponteiro fino (mouse/trackpad). Toque e reduced motion: rolagem nativa.
   Criado ANTES de qualquer ScrollTrigger (order 0). O fx.js só baixa este arquivo e o
   ScrollSmoother.min.js quando (hover:hover) and (pointer:fine). */
(window.FX = window.FX || {}).add('smooth', {
  order: 0,
  init: function (els, c) {
    if (!c.fine || !window.ScrollSmoother || !window.ScrollTrigger) return;
    var wrapper = els[0], content = document.getElementById('smooth-content');
    if (!content) return;
    /* html{scroll-behavior:smooth} da etapa 2 briga com o smoother: desligado por classe ANTES de
       criar (o ScrollTrigger guarda o valor calculado no 1º refresh e o devolve como estilo inline) */
    var html = document.documentElement;
    html.classList.add('fx-smooth');
    html.style.scrollBehavior = 'auto';
    var smoother = ScrollSmoother.create({
      wrapper: wrapper,
      content: content,
      smooth: 0.9,          // segundos para alcançar a posição (≈ lerp .1 da spec)
      effects: false,
      smoothTouch: false,
      normalizeScroll: false
    });
    FX.smoother = smoother;

    var header = document.querySelector('.site-header');
    function offset() { return 'top ' + ((header ? header.offsetHeight : 72) + 8) + 'px'; }

    /* chegada com âncora (contato.html#marca): alinha a posição suave à nativa */
    if (location.hash.length > 1) {
      var t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (t) requestAnimationFrame(function () { smoother.scrollTo(t, false, offset()); });
    }
    /* âncora na mesma página (link "Pular para o conteúdo"): deixa o navegador mover o foco
       e só corrige a rolagem */
    function onClick(e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.getAttribute('href').length < 2) return;
      var t = document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1)));
      if (t) setTimeout(function () { smoother.scrollTo(t, true, offset()); }, 0);
    }
    document.addEventListener('click', onClick);

    return function () {
      document.removeEventListener('click', onClick);
      if (FX.smoother === smoother) FX.smoother = null;
      html.classList.remove('fx-smooth');
      html.style.removeProperty('scroll-behavior');
      try { smoother.kill(); } catch (e) { /* já revertido */ }
    };
  }
});
