/* Tote 3D (FAWÉ). Carga sob demanda: nada baixa até a seção chegar perto da tela.
   - Hospedado (http/https): carrega assets/3d/fawe-tote.glb direto (sem o data URI).
   - file:// (duplo clique): o Chrome bloqueia fetch local, então usa o GLB embutido em fawe-tote-data.js.
   Sem WebGL/JS: fica o poster. Sem rotação automática (respeita prefers-reduced-motion). */
(function () {
  var box = document.getElementById('tote3d');
  if (!box) return;
  var started = false;
  var HOT = [
    { id: 'patch', pos: '0.088m 0.140m 0.092m',      nor: '0m 0m 1m',  t: 'Patch da marca',  d: 'Script FAWÉ e assinatura, com costura em volta.' },
    { id: 'alca',  pos: '-0.105m 0.325m 0.088m', nor: '0m 0m 1m',  t: 'Alça reforçada',  d: 'Fita de sarja com debrum manteiga e costura em caixa com X.' },
    { id: 'boca',  pos: '0.14m 0.397m 0.075m',   nor: '0m 0m 1m',  t: 'Debrum manteiga', d: 'Acabamento da boca com costura dupla.' },
    { id: 'etiq',  pos: '0m 0.325m -0.092m',     nor: '0m 0m -1m', t: 'Etiqueta tecida', d: 'Etiqueta FAWÉ. com @faweone, nas costas.' }
  ];
  function load(src) {
    return new Promise(function (ok, fail) {
      var s = document.createElement('script');
      s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s);
    });
  }
  function hasWebGL() {
    try { var c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); }
    catch (e) { return false; }
  }
  function hotspot(h) {
    var b = document.createElement('button');
    b.className = 'hs'; b.slot = 'hotspot-' + h.id; b.type = 'button';
    b.setAttribute('data-position', h.pos); b.setAttribute('data-normal', h.nor);
    b.setAttribute('data-visibility-attribute', 'visible');
    b.setAttribute('aria-label', h.t + '. ' + h.d);
    b.innerHTML = '<span class="hs__dot" aria-hidden="true"></span><span class="hs__tip"><strong>' + h.t + '</strong>' + h.d + '</span>';
    return b;
  }
  function start() {
    if (started) return; started = true;
    if (!hasWebGL()) return;
    var local = location.protocol === 'file:';
    var jobs = [load('js/vendor/model-viewer-umd.min.js')];
    if (local) jobs.push(load('assets/3d/fawe-tote-data.js'));
    Promise.all(jobs).then(function () {
      var mv = document.createElement('model-viewer');
      mv.setAttribute('src', local ? window.FAWE_TOTE_GLB : 'assets/3d/fawe-tote.glb');
      mv.setAttribute('alt', 'Tote FAWÉ em 3D: gire para ver a frente, as costas e os detalhes');
      mv.setAttribute('camera-controls', '');
      mv.setAttribute('disable-zoom', '');   // a roda do mouse continua rolando a página
      mv.setAttribute('touch-action', 'pan-y');
      mv.setAttribute('shadow-intensity', '1');
      mv.setAttribute('shadow-softness', '0.9');
      mv.setAttribute('exposure', '0.95');
      mv.setAttribute('environment-image', 'neutral');
      mv.setAttribute('camera-orbit', '28deg 80deg auto');
      mv.setAttribute('min-camera-orbit', 'auto 20deg 0.4m');
      mv.setAttribute('max-camera-orbit', 'auto 100deg 1.6m');
      mv.setAttribute('field-of-view', '28deg');
      mv.setAttribute('interaction-prompt', 'none');
      mv.setAttribute('ar', ''); mv.setAttribute('ar-modes', 'webxr scene-viewer quick-look');
      mv.style.cssText = 'width:100%;height:100%;background:transparent;--poster-color:transparent';
      HOT.forEach(function (h) { mv.appendChild(hotspot(h)); });
      mv.addEventListener('load', function () { box.classList.add('is-3d'); });
      box.appendChild(mv);
    }).catch(function () { /* mantém o poster */ });
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (e) {
      if (e[0].isIntersecting) { io.disconnect(); start(); }
    }, { rootMargin: '200px' });
    io.observe(box);
  } else { start(); }
})();
