/* FAWÉ — main.js (etapa 2: só JS simples; sem GSAP). Tudo é melhoria: sem JS o site funciona. */
(function () {
  'use strict';
  var d = document;
  var F = window.FAWE || {};
  /* ganchos opcionais da etapa 3 (js/fx/*): sem eles, tudo funciona como antes */
  function fxHook(name) { var X = window.FX; return X && X.hooks && typeof X.hooks[name] === 'function' ? X.hooks[name] : null; }

  /* ano do rodapé */
  d.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* contato: troca o destinatário nos links quando content.js tiver os dados */
  d.querySelectorAll('a[data-contact="whatsapp"]').forEach(function (a) {
    if (F.whatsapp) a.href = a.getAttribute('href').replace('https://wa.me/?', 'https://wa.me/' + F.whatsapp + '?');
  });
  d.querySelectorAll('a[data-contact="email"]').forEach(function (a) {
    if (F.email) a.href = a.getAttribute('href').replace('mailto:?', 'mailto:' + F.email + '?');
  });
  d.querySelectorAll('[data-show="whatsapp"]').forEach(function (el) { if (F.whatsapp) el.textContent = F.whatsapp; });
  d.querySelectorAll('[data-show="email"]').forEach(function (el) { if (F.email) el.textContent = F.email; });
  d.querySelectorAll('[data-show="prazo"]').forEach(function (el) { if (F.prazo) el.textContent = F.prazo; });
  d.querySelectorAll('[data-show="horario"]').forEach(function (el) { if (F.horario) el.textContent = F.horario; });

  /* cabeçalho: fundo sólido depois de 80px */
  var header = d.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 80); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu em tela cheia (abrir/fechar sem animação) */
  var btn = d.querySelector('.menu-btn');
  var menu = d.getElementById('menu');
  if (btn && menu) {
    var label = btn.querySelector('.menu-btn-label');
    var focusables = function () { return [btn].concat([].slice.call(menu.querySelectorAll('a[href]'))); };
    function setMenu(open) {
      var fx = fxHook('menu');            /* etapa 3: animação opcional (js/fx/menu.js) */
      if (fx) fx(open); else menu.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'Fechar' : 'Menu';
      if (open) { var first = menu.querySelector('a[href]'); if (first) first.focus(); } else { btn.focus(); }
    }
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); if (label) label.textContent = 'Menu'; } });
    d.addEventListener('keydown', function (e) {
      if (menu.hidden || btn.getAttribute('aria-expanded') !== 'true') return;
      if (e.key === 'Escape') { setMenu(false); return; }
      if (e.key === 'Tab') {
        var f = focusables(), i = f.indexOf(d.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    window.matchMedia('(min-width: 960px)').addEventListener('change', function (m) { if (m.matches && btn.getAttribute('aria-expanded') === 'true') setMenu(false); });
  }

  /* filtro do roster (Talentos): esconde cartões por data-categoria; estado vazio */
  var roster = d.querySelector('[data-fx="roster-filter"]');
  if (roster) {
    var chips = d.querySelectorAll('.chip[data-filtro]');
    var cards = roster.querySelectorAll('.talent');
    var empty = d.getElementById('roster-vazio');
    function apply(cat) {                 /* etapa 3: o Flip (js/fx/roster-filter.js) envolve run() */
      var fx = fxHook('filter');
      if (fx) fx(function () { run(cat); }, cat); else run(cat);
    }
    function run(cat) {
      var shown = 0;
      cards.forEach(function (c) {
        var ok = cat === 'todos' || c.getAttribute('data-categoria') === cat;
        c.hidden = !ok; if (ok) shown++;
      });
      if (empty) empty.hidden = shown !== 0;
      roster.hidden = shown === 0;
      chips.forEach(function (ch) { ch.setAttribute('aria-pressed', ch.getAttribute('data-filtro') === cat ? 'true' : 'false'); });
    }
    chips.forEach(function (ch) { ch.addEventListener('click', function () { apply(ch.getAttribute('data-filtro')); }); });
    /* links da Home: talentos.html?filtro=modelo (sem animação, só aplica) */
    try {
      var q = new URLSearchParams(window.location.search).get('filtro');
      if (q && d.querySelector('.chip[data-filtro="' + q + '"]')) run(q);
    } catch (e) { /* sem URLSearchParams: segue com "Todos" */ }
  }

  /* formulário "Quero ser agenciado(a)" (Contato): valida, monta a mensagem e abre o WhatsApp */
  var form = d.getElementById('form-agenciamento');
  if (form) {
    var PERFIS = { 'modelo': 'Modelo', 'influencer': 'Influencer', 'creator-ugc': 'Creator/UGC', 'ator-atriz': 'Ator/Atriz', 'artista': 'Artista' };
    var aviso = d.getElementById('form-aviso');
    var okBox = d.getElementById('form-ok');
    function el(id) { return d.getElementById(id); }
    function val(id) { var e = el(id); return e ? e.value.trim() : ''; }
    function setErr(id, msg) {
      var box = el('e-' + id), ctl = el(id);
      if (box) box.textContent = msg || '';
      if (ctl) { if (msg) ctl.setAttribute('aria-invalid', 'true'); else ctl.removeAttribute('aria-invalid'); }
    }
    function perfis() { return [].slice.call(form.querySelectorAll('input[name="perfil"]:checked')).map(function (c) { return c.value; }); }
    function validate() {
      var bad = [];
      function need(id, msg, ok) { var good = ok === undefined ? !!val(id) : ok; setErr(id, good ? '' : msg); if (!good) bad.push(el(id)); }
      var pf = perfis();
      need('f-nome', 'Escreva seu nome.');
      var idade = parseInt(val('f-idade'), 10);
      need('f-idade', 'Informe sua idade em números.', !isNaN(idade) && idade >= 1 && idade <= 120);
      need('f-cidade', 'Informe cidade e estado.');
      var fs = el('f-perfil');
      if (!pf.length) { setErr('f-perfil', 'Marque pelo menos um perfil.'); fs.setAttribute('aria-invalid', 'true'); bad.push(form.querySelector('input[name="perfil"]')); }
      else { setErr('f-perfil', ''); fs.removeAttribute('aria-invalid'); }
      need('f-social', 'Informe seu @ do Instagram e do TikTok.');
      need('f-medidas', 'Para o perfil modelo, informe altura e medidas.', pf.indexOf('modelo') < 0 || !!val('f-medidas'));
      var port = val('f-port');
      need('f-port', 'Cole um link completo, começando com https://', !port || /^https?:\/\/\S+\.\S+/i.test(port));
      var dig = val('f-whats').replace(/\D/g, '');
      need('f-whats', 'Informe um WhatsApp com DDD.', dig.length >= 10 && dig.length <= 13);
      var lg = el('f-lgpd');
      setErr('f-lgpd', lg.checked ? '' : 'Para enviar, é preciso concordar com o uso dos dados.');
      if (!lg.checked) bad.push(lg);
      return bad;
    }
    function message() {
      var L = ['Olá, FAWÉ! Quero ser agenciado(a).', '',
        'Nome: ' + val('f-nome'), 'Idade: ' + val('f-idade'), 'Cidade/estado: ' + val('f-cidade'),
        'Perfil: ' + perfis().map(function (v) { return PERFIS[v] || v; }).join(', '),
        '@ Instagram e TikTok: ' + val('f-social')];
      if (val('f-medidas')) L.push('Altura e medidas: ' + val('f-medidas'));
      if (val('f-exp')) L.push('Experiência anterior: ' + val('f-exp'));
      if (val('f-port')) L.push('Portfólio: ' + val('f-port'));
      L.push('WhatsApp: ' + val('f-whats'));
      L.push('', 'Posso enviar fotos por aqui depois.');
      return L.join('\n');
    }
    function clearOnInput(e) {
      var t = e.target;
      if (t.name === 'perfil') { setErr('f-perfil', ''); el('f-perfil').removeAttribute('aria-invalid'); }
      else if (t.id && el('e-' + t.id)) setErr(t.id, '');
      if (aviso) aviso.hidden = true;
    }
    form.addEventListener('input', clearOnInput);
    form.addEventListener('change', clearOnInput);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (aviso) aviso.hidden = true;
      var bad = validate();
      if (bad.length) { bad[0].focus(); return; }
      if (!F.whatsapp) {
        if (aviso) { aviso.textContent = 'Número de WhatsApp ainda não configurado. O perfil não foi enviado. Por enquanto, fale com a FAWÉ pelo Direct do Instagram (@faweone).'; aviso.hidden = false; }
        return;
      }
      var url = 'https://wa.me/' + F.whatsapp + '?text=' + encodeURIComponent(message());
      window.open(url, '_blank', 'noopener');
      if (okBox) {
        var back = d.createElement('p');
        var link = d.createElement('a');
        link.href = url; link.target = '_blank'; link.rel = 'noopener'; link.textContent = 'O WhatsApp não abriu? Toque aqui.';
        back.appendChild(link); okBox.appendChild(back);
        form.hidden = true; okBox.hidden = false; okBox.focus();
      }
    });
  }

  /* marquee: pausa fora da tela */
  var marquees = d.querySelectorAll('.marquee');
  if ('IntersectionObserver' in window && marquees.length) {
    var mo = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.classList.toggle('is-paused', !e.isIntersecting); });
    });
    marquees.forEach(function (m) { mo.observe(m); });
  }

  /* reveal simples (IntersectionObserver). Sem IO ou com movimento reduzido, tudo aparece */
  var rvs = d.querySelectorAll('.rv');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function showAll() { rvs.forEach(function (el) { el.classList.add('in'); }); }
  if (!rvs.length) return;
  if (reduce || !('IntersectionObserver' in window)) { showAll(); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });
  rvs.forEach(function (el) { io.observe(el); });
})();
