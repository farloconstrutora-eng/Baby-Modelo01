/* FAWÉ — js/fx/fx.js (etapa 3): carregador de efeitos.
   É o ÚNICO script de efeito que a página pede (com defer). Ele olha os ganchos data-fx da página
   e injeta, na ordem certa, só as bibliotecas (js/vendor) e os efeitos (js/fx) que ela usa.
   Com prefers-reduced-motion: reduce não baixa NADA (a página fica no estado final da etapa 2).
   ScrollSmoother só com (hover:hover) and (pointer:fine). Tudo script clássico: abre por file://.
   Cada efeito se registra com FX.add(nome, {order, init}); o init roda dentro de UM gsap.matchMedia()
   com as duas condições obrigatórias (reduceMotion / motionOk). Sem GSAP o site segue igual. */
(function () {
  'use strict';
  var FX = window.FX = window.FX || {};
  var d = document, root = d.documentElement;
  FX.effects = FX.effects || {};
  FX.hooks = FX.hooks || {};      // pontos de encaixe usados por main.js (menu, filtro)
  FX.state = FX.state || {};
  FX.add = function (name, def) { FX.effects[name] = def; };

  var MQ_OK = '(prefers-reduced-motion: no-preference)';
  var MQ_FINE = '(hover: hover) and (pointer: fine)';
  function mq(q) { try { return window.matchMedia(q).matches; } catch (e) { return false; } }

  function store(kind, key, val) {
    try {
      var s = window[kind];
      if (val === undefined) return s.getItem(key);
      if (val === null) s.removeItem(key); else s.setItem(key, val);
    } catch (e) { return null; }
    return null;
  }
  FX.session = function (key, val) { return store('sessionStorage', key, val); };

  /* Cortina: o script inline do <head> já pôs html.fx-cover (cortina fechada desde o 1º quadro)
     quando a página chega de um clique com transição ou quando a intro da Home vai tocar.
     Aqui o controle passa para o estilo inline (o GSAP assume depois) e a classe sai. */
  var curtain = d.querySelector('.page-curtain');
  FX.state.curtain = curtain;
  var motionOk = mq(MQ_OK);
  if (curtain && motionOk && FX.session('fx-curtain') === '1') {
    FX.session('fx-curtain', null);
    curtain.style.transform = 'scaleY(1)';
    FX.state.arrivedCovered = true;
  } else if (curtain && root.classList.contains('fx-cover')) {
    curtain.style.transform = 'scaleY(1)';   // intro da Home (intro.js abre)
  }
  root.classList.remove('fx-cover');
  function ready() { root.classList.remove('fx-pre'); }   // ver css: título da 1ª dobra liberado
  /* rede de segurança: a cortina nunca fica presa sobre a página */
  FX.uncover = function () {
    if (!curtain) return;
    if (window.gsap) { gsap.killTweensOf(curtain); gsap.set(curtain, { scaleY: 0, transformOrigin: '50% 0%', pointerEvents: 'none' }); }
    else { curtain.style.transform = 'scaleY(0)'; curtain.style.pointerEvents = 'none'; }
  };
  setTimeout(function () {
    if (curtain && !FX.state.leaving && !(window.gsap && gsap.isTweening(curtain))) FX.uncover();
  }, 2500);

  if (!motionOk) { FX.uncover(); ready(); return; }   // movimento reduzido: nada é baixado

  /* ---------- o que esta página precisa ---------- */
  var fine = mq(MQ_FINE);
  var used = {};
  [].forEach.call(d.querySelectorAll('[data-fx]'), function (el) {
    el.getAttribute('data-fx').split(/\s+/).forEach(function (n) { if (n) used[n] = true; });
  });
  function belowFold(sel) {   // algum título dividido fora da 1ª dobra? (mesma regra de split.js)
    var vh = window.innerHeight, scrolled = (window.scrollY || 0) >= 10;
    return [].some.call(d.querySelectorAll(sel), function (el) { return scrolled || el.getBoundingClientRect().top >= vh * 0.85; });
  }
  /* efeito -> [arquivos js/fx em ordem, bibliotecas]; null = não se aplica neste aparelho */
  var MAP = {
    smooth: fine ? [['smooth'], ['ScrollTrigger', 'ScrollSmoother']] : null,
    page: [['page'], []],
    intro: [['intro'], []],
    split: [['split'], ['SplitText']],
    reveal: [['reveal'], ['ScrollTrigger']],
    'reveal-batch': [['reveal'], ['ScrollTrigger']],
    'pin-scrub': [['reveal', 'pin-scrub'], ['ScrollTrigger']],
    hscroll: [['hscroll'], ['ScrollTrigger']],
    'roster-filter': [['roster-filter'], ['Flip']],
    magnetic: fine ? [['magnetic'], []] : null,
    menu: [['menu'], []]
  };
  var FX_ORDER = ['smooth', 'page', 'intro', 'split', 'reveal', 'pin-scrub', 'hscroll', 'roster-filter', 'magnetic', 'menu'];
  var VENDOR_ORDER = ['gsap', 'ScrollTrigger', 'ScrollSmoother', 'SplitText', 'Flip'];
  var wantFx = {}, wantLib = {};
  Object.keys(used).forEach(function (n) {
    var m = MAP[n];
    if (!m) return;
    m[0].forEach(function (f) { wantFx[f] = true; });
    m[1].forEach(function (l) { wantLib[l] = true; });
  });
  if (used.split && belowFold('[data-fx~="split"]')) wantLib.ScrollTrigger = true;   // títulos com gatilho
  var fxFiles = FX_ORDER.filter(function (f) { return wantFx[f]; });
  /* scroll-behavior:smooth sai ANTES de o ScrollTrigger carregar: ele lê o valor calculado na 1ª vez
     que acessa a rolagem e depois o devolve como estilo inline a cada refresh */
  if (wantFx.smooth) root.classList.add('fx-smooth');
  if (!fxFiles.length) { ready(); return; }
  wantLib.gsap = true;
  var libs = VENDOR_ORDER.filter(function (l) { return wantLib[l]; });

  var me = d.currentScript && d.currentScript.src;
  var base = me ? me.replace(/[^\/]*$/, '') : 'js/fx/';   // .../js/fx/
  var urls = libs.map(function (l) { return base + '../vendor/' + l + '.min.js'; })
    .concat(fxFiles.map(function (f) { return base + f + '.js'; }));
  FX.loaded = urls.map(function (u) { return u.replace(/^.*\/js\//, 'js/'); });

  /* injeta em ordem (async=false mantém a ordem de execução); boot quando o último terminar */
  var pending = urls.length;
  function done() { if (--pending === 0) boot(); }
  urls.forEach(function (u) {
    var s = d.createElement('script');
    s.src = u; s.async = false;
    s.onload = done;
    s.onerror = function () { console.warn('[fx] não carregou: ' + u); done(); };
    d.head.appendChild(s);
  });

  function sortByDom() {
    if (!window.ScrollTrigger) return;
    ScrollTrigger.sort(function (a, b) {
      var ta = a.trigger, tb = b.trigger;
      if (!ta || !tb || ta === tb) return (a.vars.refreshPriority || 0) - (b.vars.refreshPriority || 0);
      return (ta.compareDocumentPosition(tb) & 4) ? -1 : 1;   // ordem do documento = ordem de refresh
    });
  }
  var refreshTimer;
  FX.refresh = function () {
    if (!window.ScrollTrigger) return;
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(function () { sortByDom(); ScrollTrigger.refresh(); }, 60);
  };

  function boot() {
    if (!window.gsap) { FX.uncover(); ready(); root.classList.remove('fx-smooth'); return; }
    var plugins = [window.ScrollTrigger, window.ScrollSmoother, window.SplitText, window.Flip].filter(Boolean);
    if (plugins.length) gsap.registerPlugin.apply(gsap, plugins);
    if (!window.ScrollSmoother) root.classList.remove('fx-smooth');
    if (window.ScrollTrigger) ScrollTrigger.config({ ignoreMobileResize: true });

    var names = Object.keys(FX.effects).sort(function (a, b) {
      return (FX.effects[a].order || 50) - (FX.effects[b].order || 50);
    });

    FX.mm = gsap.matchMedia();
    FX.mm.add({
      reduceMotion: '(prefers-reduced-motion: reduce)',
      motionOk: MQ_OK,
      desktop: '(min-width: 960px)',
      fine: MQ_FINE
    }, function (ctx) {
      var c = ctx.conditions, cleanups = [];
      FX.cond = c;
      if (c.reduceMotion) { FX.uncover(); return; }   // estado final estático, nada animado
      names.forEach(function (name) {
        var def = FX.effects[name];
        var els = [].slice.call(d.querySelectorAll('[data-fx~="' + name + '"]'));
        if (!els.length) return;
        try {
          var undo = def.init(els, c);
          if (typeof undo === 'function') cleanups.push(undo);
        } catch (e) { console.warn('[fx:' + name + ']', e); }
      });
      sortByDom();
      ready();
      return function () {
        cleanups.reverse().forEach(function (f) { try { f(); } catch (e) { /* segue */ } });
      };
    });

    if (d.fonts && d.fonts.ready) d.fonts.ready.then(FX.refresh);
    if (d.readyState === 'complete') FX.refresh(); else window.addEventListener('load', FX.refresh);

    /* voltar/avançar do navegador (bfcache): a página volta congelada com a cortina fechada */
    window.addEventListener('pageshow', function (e) { if (e.persisted) FX.uncover(); });
  }
})();
