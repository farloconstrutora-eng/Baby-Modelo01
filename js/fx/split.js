/* #2 split — títulos entram por linha (SplitText, máscara por linha) e o sublinhado se desenha.
   O sublinhado da etapa 2 é text-decoration no .title; com o texto dividido ele vira um traço por
   PALAVRA (::after em .fx-w, ligado pela classe .fx-split-on, só neste ramo motionOk), esticado
   sobre o espaço até a palavra seguinte, para ficar igual ao original: contínuo na linha e com
   falha embaixo do script e da pílula (inline-block: o text-decoration original não passa por eles).
   O <em class="script"> e a <em class="pill"> não são divididos (ignore): entram inteiros.
   Acessibilidade: SplitText põe aria-label no título e aria-hidden nas partes.
   Fontes: autoSplit re-divide quando as fontes terminam de carregar ou a largura muda.
   Desempenho: a 1ª dobra é lida de uma vez antes de dividir; as medidas do traço são feitas em
   lote (todas as escritas, depois todas as leituras, depois todas as escritas) num microtask. */
(window.FX = window.FX || {}).add('split', {
  order: 20,
  init: function (els) {
    if (!window.SplitText) return;
    var FX = window.FX, splits = [];
    var SKIP = '.script, .pill';

    function px(v, fs, dflt) { var n = parseFloat(v); return isNaN(n) ? dflt * fs : n; }

    /* ---- medida do traço em lote ---- */
    var queue = [], queued = false;
    function schedule(el, self) {
      queue = queue.filter(function (q) { return q.el !== el; });
      queue.push({ el: el, self: self });
      if (!queued) { queued = true; Promise.resolve().then(flush); }
    }
    function flush() {
      queued = false;
      var jobs = queue.filter(function (q) { return q.self.words[0] && q.el.isConnected; });
      queue = [];
      if (!jobs.length) return;
      // 1) escrita: uma sonda na linha de base da 1ª palavra de cada título
      jobs.forEach(function (j) {
        j.probe = document.createElement('span');
        j.probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
        j.self.words[0].appendChild(j.probe);
      });
      // 2) leitura: tudo o que depende do layout (um único cálculo de layout)
      jobs.forEach(function (j) {
        var cs = getComputedStyle(j.el), fs = parseFloat(cs.fontSize) || 16, w0 = j.self.words[0];
        j.off = px(cs.textUnderlineOffset, fs, 0.12);
        j.th = px(cs.textDecorationThickness, fs, 0.08);
        j.base = j.probe.getBoundingClientRect().top - w0.getBoundingClientRect().top;
        j.gaps = [];
        j.self.lines.forEach(function (line) {
          var kids = [].slice.call(line.querySelectorAll('.fx-w, ' + SKIP)).filter(function (k) {
            return k.classList.contains('fx-w') ? !k.parentNode.closest(SKIP) : true;
          });
          var box = kids.map(function (k) { return { k: k, w: k.classList.contains('fx-w'), l: k.offsetLeft, r: k.offsetLeft + k.offsetWidth }; });
          box.forEach(function (b, i) {
            if (!b.w) return;
            var next = box[i + 1], prev = box[i - 1], r = 0, l = 0;
            if (next) r = next.l - b.r + (next.w ? 1 : 0);   // +1px: sem fresta entre traços
            if (prev && !prev.w) l = b.l - prev.r;          // o espaço depois do script/pílula também é sublinhado
            j.gaps.push([b.k, Math.max(0, r), Math.max(0, l)]);
          });
        });
      });
      // 3) escrita: remove as sondas e grava as variáveis
      jobs.forEach(function (j) {
        j.probe.remove();
        j.el.style.setProperty('--u-top', (j.base + j.off).toFixed(2) + 'px');
        j.el.style.setProperty('--u-h', Math.max(1, Math.round(j.th)) + 'px');   // o navegador arredonda a espessura
        j.gaps.forEach(function (g) {
          g[0].style.setProperty('--u-r', g[1].toFixed(2) + 'px');
          g[0].style.setProperty('--u-l', g[2].toFixed(2) + 'px');
        });
      });
    }

    /* 1ª dobra de TODOS os títulos lida antes de qualquer divisão (sem leitura depois de escrita) */
    var vh = window.innerHeight, atTop = window.scrollY < 10, hasST = !!window.ScrollTrigger;
    var first = els.map(function (el) {
      return !hasST || !!el.closest('[data-fx~="intro"]') || (atTop && el.getBoundingClientRect().top < vh * 0.85);
    });

    els.forEach(function (el, idx) {
      var firstScreen = first[idx];
      el.classList.add('fx-split-on');
      var split = SplitText.create(el, {
        type: 'lines,words',
        linesClass: 'fxline',      // a máscara recebe 'fxline-mask'
        wordsClass: 'fx-w',
        mask: 'lines',
        ignore: SKIP,
        tag: 'span',               // palavras ficam inline: o text-wrap:balance da etapa 2 decide as quebras
        reduceWhiteSpace: false,   // mantém o &nbsp; ("A&nbsp;gente" não se separa)
        autoSplit: true,
        onSplit: function (self) {
          schedule(el, self);
          var vars = { onComplete: function () { el.classList.add('fx-split-done'); } };
          if (firstScreen) vars.delay = FX.state.enterDelay || 0.05;   // topo: toca na chegada
          else vars.scrollTrigger = { trigger: el, start: 'top 85%', once: true };
          var tl = gsap.timeline(vars);
          tl.from(self.lines, { yPercent: 150, duration: 0.9, ease: 'power3.out', stagger: 0.08 });
          if (self.words.length) tl.fromTo(self.words, { '--u': 0 }, { '--u': 1, duration: 0.6, ease: 'power2.inOut', stagger: 0.03 }, '-=0.4');
          var script = el.querySelectorAll('.script');
          /* acima da dobra parte de 0.01 (não de 0): o elemento já conta como pintado para o LCP */
          if (script.length) tl.from(script, { opacity: firstScreen ? 0.01 : 0, rotation: -14, x: -20, duration: 0.7, ease: 'power2.out' }, self.words.length ? '-=0.6' : '-=0.5');
          return tl;
        }
      });
      splits.push({ el: el, split: split });
    });

    return function () {
      queue = [];
      splits.forEach(function (s) {
        try { s.split.revert(); } catch (e) { /* já revertido pelo contexto */ }
        s.el.classList.remove('fx-split-on', 'fx-split-done');
        ['--u-top', '--u-h'].forEach(function (p) { s.el.style.removeProperty(p); });
      });
    };
  }
});
