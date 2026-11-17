/* #6 pin-scrub — frase-chave da Home. Desktop (>=960px): seção presa por +150%, scrub 1;
   "câmeras", "construir", "mundo vê" acendem uma a uma (opacity .15→1) e o sublinhado de cada
   uma se desenha (::after com scaleX via --u); por fim o .key-end ("Built to be seen." + ✦),
   único e depois das .fx-line, entra (script: opacity, rotação -14→-8, x; ornamento: opacity).
   Anima só os FILHOS, nunca a seção presa. O texto lido pelo leitor de tela é o h2.sr-only.
   Celular (<960px): sem pin, vira reveal em lote (como #5). */
(window.FX = window.FX || {}).add('pin-scrub', {
  order: 40,
  init: function (els, c) {
    if (!window.ScrollTrigger) return;
    var FX = window.FX, undo = [];
    els.forEach(function (sec) {
      var visual = sec.querySelector('[aria-hidden="true"]');
      if (!visual) return;
      if (!c.desktop) { FX.revealBatch([].slice.call(visual.children)); return; }

      var words = [].slice.call(sec.querySelectorAll('.fx-word'));
      var script = sec.querySelector('.key-end .script');
      sec.classList.add('fx-pin-on');
      /* posição do traço = linha de base + offset do sublinhado original; medido de novo quando as
         fontes chegam e a cada refresh (a métrica da fonte reserva é outra) */
      /* em duas passadas: põe todas as sondas, lê tudo (um só layout), depois escreve tudo */
      function measure() {
        var probes = words.map(function (w) {
          var p = document.createElement('span');
          p.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
          w.appendChild(p);
          return p;
        });
        var vals = words.map(function (w, i) {
          var cs = getComputedStyle(w), fs = parseFloat(cs.fontSize) || 16;
          var off = parseFloat(cs.textUnderlineOffset); if (isNaN(off)) off = 0.12 * fs;
          var th = 0.08 * fs;   // "text-decoration:none" zera a espessura; usa o token (.08em)
          return [probes[i].getBoundingClientRect().top - w.getBoundingClientRect().top + off, th];
        });
        words.forEach(function (w, i) {
          probes[i].remove();
          w.style.setProperty('--u-top', vals[i][0].toFixed(2) + 'px');
          w.style.setProperty('--u-h', Math.max(1, Math.round(vals[i][1])) + 'px');
        });
      }
      measure();
      ScrollTrigger.addEventListener('refresh', measure);
      undo.push(function () { ScrollTrigger.removeEventListener('refresh', measure); });

      var tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: sec, start: 'top top', end: '+=150%', pin: true, scrub: 1, anticipatePin: 1 }
      });
      words.forEach(function (w, i) {
        tl.fromTo(w, { opacity: 0.15 }, { opacity: 1, duration: 1 }, i ? '+=0.15' : 0)
          .fromTo(w, { '--u': 0 }, { '--u': 1, duration: 0.7 }, '<0.3');
      });
      if (script) tl.fromTo(script, { opacity: 0, rotation: -14, x: -20 }, { opacity: 1, rotation: -8, x: 0, duration: 1, ease: 'power2.out' }, '+=0.1');
      var orn = sec.querySelector('.key-end .ornament');
      if (orn) tl.fromTo(orn, { opacity: 0 }, { opacity: 1, duration: 0.5 }, script ? '<0.5' : '+=0.1');
      tl.to({}, { duration: 0.4 });   // respiro antes de soltar a seção

      undo.push(function () {
        sec.classList.remove('fx-pin-on');
        words.forEach(function (w) { w.style.removeProperty('--u-top'); w.style.removeProperty('--u-h'); });
      });
    });
    return function () { undo.forEach(function (f) { f(); }); };
  }
});
