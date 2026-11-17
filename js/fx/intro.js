/* #1 intro — abertura da Home, 1 vez por sessão (sessionStorage em try/catch).
   Cortina vermelha sai para cima, o logo do header (.brand) entra, a tagline sobe, botões entram.
   O h1 (data-fx="split") entra junto, com o atraso FX.state.enterDelay (0,12 s). Total ≈ 1 s.
   A cortina já está fechada desde o 1º quadro (html.fx-cover, script inline do <head>).
   Acima da dobra nada parte de opacity 0 (parte de 0.01: o LCP conta o elemento desde o início).
   Não trava a rolagem (a cortina não recebe clique). */
(window.FX = window.FX || {}).add('intro', {
  order: 3,
  init: function (els) {
    var FX = window.FX, hero = els[0];
    if (FX.session('fx-intro') === '1' && !FX.state.introRunning) return;
    FX.session('fx-intro', '1');
    FX.state.introRunning = true;
    FX.state.introOwnsCurtain = true;
    FX.state.arrivedCovered = false;
    FX.state.enterDelay = 0.12;

    var curtain = FX.state.curtain;
    var brand = document.querySelector('.site-header .brand');
    var tag = hero.querySelector('.hero-tag');
    var btns = hero.querySelectorAll('.btn-row > *');

    var tl = gsap.timeline({
      defaults: { ease: 'power3.out', duration: 0.5 },
      onComplete: function () { FX.state.introRunning = false; }
    });
    if (curtain) tl.fromTo(curtain, { scaleY: 1 }, { scaleY: 0, transformOrigin: '50% 0%', ease: 'power2.inOut' }, 0);
    if (brand) tl.from(brand, { opacity: 0.01, scale: 0.9 }, '<0.1');
    if (tag) tl.from(tag, { yPercent: 100, opacity: 0.01 }, '-=0.3');
    if (btns.length) tl.from(btns, { y: 20, opacity: 0.01, stagger: 0.08, duration: 0.45 }, '<0.1');

    return function () { FX.state.introRunning = false; };
  }
});
