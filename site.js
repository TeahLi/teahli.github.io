/* ============================================================================
   site.js — 渲染 content.js 的内容，并驱动背景的水墨/星空画布
   一般情况下你不需要改这个文件；要改文字请改 content.js。
   ========================================================================== */
(function () {
  'use strict';

  var S = window.SITE;
  if (!S) { console.error('content.js 没有加载'); return; }

  /* ══ 1. 状态 ════════════════════════════════════════════════════════ */
  var st = {
    lang: 'en',        // 'en' | 'zh'
    theme: 'night',    // 'night' | 'day'
    sty: 'a',          // 'a' 长卷 | 'b' 册页
    page: 0,           // 册页当前页 0..5
    motion: 0.35       // 动效强度 0..1
  };

  var root = document.documentElement;
  function apply() {
    root.dataset.l = st.lang;
    root.dataset.t = st.theme;
    root.dataset.sty = st.sty;
    root.dataset.pg = String(st.page);
    root.lang = st.lang === 'zh' ? 'zh-Hans' : 'en';
    document.querySelectorAll('.pg').forEach(function (el) {
      el.classList.toggle('on', +el.dataset.p === st.page);
    });
    document.querySelectorAll('.nv').forEach(function (el) {
      el.setAttribute('aria-current', +el.dataset.n === st.page ? 'true' : 'false');
    });
  }

  /* ══ 2. 小工具 ══════════════════════════════════════════════════════ */
  function bi(o, extra) {                       // 双语片段
    if (!o) return '';
    var en = (o.en || '').trim(), zh = (o.zh || '').trim();
    if (!en && !zh) return '';
    if (!zh || zh === en) return en || zh;
    if (!en) return '<span class="zh ' + (extra || '') + '">' + zh + '</span>';
    return '<span data-lang="en">' + en + '</span>' +
           '<span data-lang="zh" class="zh ' + (extra || '') + '">' + zh + '</span>';
  }
  function bip(o, cls) {                         // 双语段落（<p>）
    if (!o) return '';
    var en = (o.en || '').trim(), zh = (o.zh || '').trim(), c = cls ? ' class="' + cls + '"' : '';
    var out = '';
    if (en) out += '<p data-lang="en"' + c + '>' + en + '</p>';
    if (zh) out += '<p data-lang="zh" class="zh' + (cls ? ' ' + cls : '') + '">' + zh + '</p>';
    return out;
  }
  function link(l, cls) {                        // href 为空 → 不可点的灰字
    var c = cls ? ' class="' + cls + '"' : '';
    return l.href
      ? '<a href="' + l.href + '"' + c + '>' + l.label + '</a>'
      : '<span class="dead' + (cls ? ' ' + cls : '') + '">' + l.label + '</span>';
  }
  var SEAL = '<svg viewBox="0 0 28 16" width="26" height="15" class="mark" aria-hidden="true">' +
    '<path d="M0.6 5.2C4.4 4.1 8.6 5.9 11.9 9.3C14.4 6.1 18.3 3.6 22.4 3.9C19.2 5.3 16.6 7.7 15.1 10.6' +
    'C16.6 11.4 18.4 11.5 20 10.9C18.8 12.6 16.6 13.4 14.6 12.9C13.9 13.6 13.3 14.4 12.8 15.3' +
    'C12.2 14.2 11.4 13.2 10.5 12.3C7.6 9.3 4.2 6.7 0.6 5.2Z"/></svg>';
  var THEME_ICONS =
    '<svg class="ico ico-sun" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="4.3"/><path d="M12 2.8v2.3M12 18.9v2.3M2.8 12h2.3M18.9 12h2.3M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6"/></svg>' +
    '<span class="ico-sep">/</span>' +
    '<svg class="ico ico-moon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M20.2 14.9A8.6 8.6 0 0 1 9.1 3.8a8.6 8.6 0 1 0 11.1 11.1Z"/></svg>';
  var CTL =
    '<button type="button" class="pill" data-act="sty">' + bi({ en: 'STYLE', zh: '风格' }) + '</button>' +
    '<button type="button" class="pill" data-act="lang">EN / 中</button>' +
    '<button type="button" class="pill" data-act="theme" aria-label="theme">' + THEME_ICONS + '</button>';

  /* 全站统一的四个栏目；布局A当作锚点，布局B当作页码 */
  var NAV = [
    { id: 'research', label: { en: 'Research',      zh: '研究' } },
    { id: 'papers',   label: { en: 'Papers',        zh: '论文' } },
    { id: 'talks',    label: { en: 'Talks & notes', zh: '讲座与随笔' } },
    { id: 'contact',  label: { en: 'Contact & CV',  zh: '联系与简历' } }
  ];
  var PAGES = NAV.length + 1;                    // 布局B：首页 + 四个栏目

  function workingCards() {
    return (S.workingPapers || []).map(function (w) {
      return '<div class="wp-card"><h3>' + bi(w.title) + '</h3>' + bip(w.body) +
        '<div class="wp-tag">' + bi(w.tag) + '</div></div>';
    }).join('');
  }

  function span() {                              // 论文年份跨度，如「2025 — 2026」
    var ys = S.papers.map(function (p) { return parseInt(p.year, 10); })
                     .filter(function (n) { return !isNaN(n); });
    if (!ys.length) return '';
    var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
    return lo === hi ? String(lo) : lo + ' — ' + hi;
  }

  /* ══ 3. 渲染布局 A（单页长卷） ══════════════════════════════════════ */
  function renderA() {
    var navItems = NAV.map(function (n) {
      return '<button type="button" class="navlink" data-scroll="' + n.id + '">' +
             bi(n.label) + '</button>';
    }).join('');

    var epi = '<div class="epigraph">' + bi(S.epigraph.text) +
      '<br><span class="src">' + bi(S.epigraph.source) + '</span></div>';

    var portrait = S.portrait
      ? '<div class="portrait"><img src="' + S.portrait + '" alt=""></div>'
      : '<div class="portrait"><span>portrait 3:4</span></div>';

    var research = S.research.map(function (r) {
      return '<div class="res-item"><h3>' + bi(r.title) + '</h3>' + bip(r.body) + '</div>';
    }).join('');

    var papers = S.papers.map(function (p) {
      var right = p.links && p.links.length
        ? '<span class="pub-links">' + p.links.map(function (l) { return link(l); }).join('') + '</span>'
        : (p.status ? '<span class="pub-links dead">' + bi(p.status) + '</span>' : '<span></span>');
      return '<div class="pub-row"><span class="pub-year">' + p.year + '</span>' +
        '<div><div class="pub-title">' + bi(p.title) + '</div>' +
        '<div class="pub-venue">' + bi(p.venue) + '</div></div>' + right + '</div>';
    }).join('');

    var talks = S.talks.map(function (t) {
      return '<div class="talk"><span class="talk-year">' + t.year + '</span><div>' +
        '<div class="talk-title">' + bi(t.title) + '</div>' +
        '<div class="talk-venue">' + bi(t.venue) + '</div></div></div>';
    }).join('');

    var notes = S.notes.map(function (n) {
      var inner = '<span class="note-t">' + bi(n.title) + '</span><span class="note-d">' + n.date + '</span>';
      return n.href ? '<a class="note" href="' + n.href + '">' + inner + '</a>'
                    : '<div class="note">' + inner + '</div>';
    }).join('');

    var wpsA = workingCards();
    var links = S.links.map(function (l) { return link(l); }).join('');

    return '' +
      '<header class="topbar">' +
        '<nav class="topnav">' +
          '<button type="button" class="navlink" data-scroll="top" aria-label="home">' + SEAL + '</button>' + navItems +
        '</nav>' +
        '<div class="topctl">' +
          '<button type="button" class="navlink brand" data-scroll="top">' + bi(S.nameCaps) + '</button>' +
          '<span class="vrule"></span>' + CTL +
        '</div>' +
      '</header>' +

      '<div class="hero">' + epi + '</div>' +

      '<section class="section panel" id="about">' +
        '<div class="about">' +
          '<div class="about-text"><div class="eyebrow">About</div>' +
            S.about.en.map(function (t) { return '<p data-lang="en">' + t + '</p>'; }).join('') +
            S.about.zh.map(function (t) { return '<p data-lang="zh" class="zh">' + t + '</p>'; }).join('') +
          '</div>' +
          '<div class="about-side">' + portrait +
            '<div class="affil">' + bi(S.affiliation) + '</div>' +
          '</div>' +
        '</div>' +
      '</section>' +

      '<section class="section panel" id="research">' +
        '<div class="eyebrow">Research</div><div class="res-grid">' + research + '</div>' +
      '</section>' +

      '<section class="section panel" id="papers">' +
        '<div class="pub-head"><div class="eyebrow">Papers</div>' +
        '<div class="span">' + span() + '</div></div>' +
        papers +
        (wpsA ? '<div class="eyebrow sub">Working papers</div><div class="wp">' + wpsA + '</div>' : '') +
      '</section>' +

      '<section class="section panel two-col" id="talks">' +
        '<div><div class="eyebrow">Talks</div><div class="stack">' + talks + '</div></div>' +
        '<div id="notes"><div class="eyebrow">Notes</div><div class="stack">' + notes + '</div></div>' +
      '</section>' +

      '<footer class="contact" id="contact">' +
        '<div><div class="hello">你好</div><div class="linkrow">' + links + '</div></div>' +
        '<div class="colophon"><div class="yr">' + bi(S.year) + '</div>' + SEAL + '</div>' +
      '</footer>';
  }

  /* ══ 4. 渲染布局 B（册页分页） ══════════════════════════════════════ */
  function renderB() {
    var navLabels = [{ en: 'Home', zh: '首页' }].concat(NAV.map(function (n) { return n.label; }));
    var nav = navLabels.map(function (l, i) {
      return '<button class="nv" type="button" data-n="' + i + '">' + bi(l) + '</button>';
    }).join('');

    var epi = '<div class="epigraph">' + bi(S.epigraph.text) +
      '<br><span class="src">' + bi(S.epigraph.source) + '</span></div>';

    var research = S.research.map(function (r) {
      return '<div class="b-item"><h3>' + bi(r.title) + '</h3>' + bip(r.body) + '</div>';
    }).join('');

    var papers = S.papers.filter(function (p) { return p.year !== 'draft'; }).map(function (p) {
      var right = p.links && p.links.length
        ? '<span class="pub-links">' + p.links.slice(0, 1).map(function (l) { return link(l); }).join('') + '</span>'
        : '<span></span>';
      return '<div class="pub-row"><span class="pub-year">' + p.year + '</span>' +
        '<div><div class="pub-title">' + bi(p.title) + '</div>' +
        '<div class="pub-venue">' + bi(p.venue) + '</div></div>' + right + '</div>';
    }).join('');

    var wps = workingCards();

    var talks = S.talks.map(function (t) {
      return '<div><div class="talk-title">' + bi(t.title) + '</div>' +
        '<div class="talk-venue">' + bi(t.venue) + ' · ' + t.year + '</div></div>';
    }).join('');

    var notes = S.notes.map(function (n) {
      var inner = bi(n.title) + '<span class="note-d">' + n.date + '</span>';
      return n.href ? '<a href="' + n.href + '">' + inner + '</a>' : '<a>' + inner + '</a>';
    }).join('');

    var links = S.links.map(function (l) {
      return link(l, /CV/i.test(l.label) ? 'cta' : '');
    }).join('');

    return '' +
      '<aside class="side">' +
        '<div>' +
          '<button type="button" class="side-brand" data-n="0">' + SEAL +
            '<span>' + bi(S.name) + '</span></button>' +
          '<nav class="nav">' + nav + '</nav>' +
        '</div>' +
        '<div class="side-ctl">' + CTL + '</div>' +
      '</aside>' +
      '<main class="pages">' +
        '<div class="pg pg-home" data-p="0">' + epi + '</div>' +

        '<div class="pg" data-p="1"><div class="eyebrow">Research</div>' +
          '<h2>' + bi({ en: 'Three lines of work', zh: '三条线索' }) + '</h2>' +
          '<div class="b-list">' + research + '</div></div>' +

        '<div class="pg" data-p="2"><div class="eyebrow">Papers</div>' +
          '<h2>' + bi({ en: 'Published &amp; under review', zh: '发表与审阅中' }) + '</h2>' +
          '<div class="b-pub">' + papers + '</div>' +
          (wps ? '<div class="eyebrow sub">' + bi({ en: 'Working papers', zh: '进行中' }) +
                 '</div><div class="wp">' + wps + '</div>' : '') +
        '</div>' +

        '<div class="pg" data-p="3"><div class="two-col">' +
          '<div><div class="eyebrow">Talks</div><div class="stack">' + talks + '</div></div>' +
          '<div class="b-notes"><div class="eyebrow">Notes</div><div class="stack">' + notes + '</div></div>' +
        '</div></div>' +

        '<div class="pg pg-contact" data-p="4"><div class="eyebrow">Contact</div>' +
          '<h2>你好</h2><div class="linkcol">' + links + '</div></div>' +
      '</main>';
  }

  /* ══ 5. 挂载 + 事件 ═════════════════════════════════════════════════ */
  document.getElementById('siteA').innerHTML = renderA();
  document.getElementById('siteB').innerHTML = renderB();

  document.addEventListener('click', function (e) {
    var sc = e.target.closest('[data-scroll]');
    if (sc) {                                    // 栏目导航：平滑滚动到板块
      e.preventDefault();
      var id = sc.dataset.scroll;
      if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
      else {
        var target = document.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      }
      return;
    }
    var b = e.target.closest('[data-act], [data-n]');
    if (!b) return;
    if (b.dataset.act === 'lang')  { st.lang  = st.lang  === 'en' ? 'zh' : 'en'; apply(); }
    if (b.dataset.act === 'theme') { st.theme = st.theme === 'night' ? 'day' : 'night'; apply(); }
    if (b.dataset.act === 'sty') {
      st.sty = st.sty === 'a' ? 'b' : 'a';
      st.page = 0; apply();
      if (scene) scene.resize(true);
      if (st.sty === 'a') window.scrollTo(0, 0);
    }
    if (b.dataset.n !== undefined) { st.page = +b.dataset.n; apply(); }
  });

  apply();

  /* ══ 6. 背景画布 ════════════════════════════════════════════════════
     移植自设计稿：水墨峡谷 + 星野。滚动/翻页时山水溶解为星空。      */

  var rnd = function (s) { return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };
  var STAR_COLS = ['205,222,255', '240,244,255', '255,224,178', '168,238,255'];
  var IMG_W = 736, IMG_H = 1308, IMG_R = IMG_H / IMG_W;   // 水墨原图比例
  var BOAT_TRIM = 3;                                       // 船身俯仰角（度）

  function Scene(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = Math.min(1.6, window.devicePixelRatio || 1);
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.p = 0; this.pT = 0;
    this.mx = -9e3; this.my = -9e3;
    this.parts = []; this.mt = [];
    this.theme = null;
    this.t0 = performance.now(); this.tp = this.t0;
  }

  Scene.prototype.cfg = function () {
    var narrow = window.innerWidth < 900;
    return st.sty === 'a'
      ? { dwMul: 1.00, baseYT: 0.837, cxT: 0.50, boat: [0.47, 0.856, 1.90], gal: [0.70, 0.155, 0.28] }
      : { dwMul: 1.38, baseYT: 0.809, cxT: narrow ? 0.50 : 0.615, boat: [0.56, 0.848, 1.78], gal: [0.79, 0.145, 0.24] };
  };

  Scene.prototype.resize = function (force) {
    var w = this.cv.clientWidth || window.innerWidth,
        h = this.cv.clientHeight || window.innerHeight;
    if (!force && Math.abs(w - this.w) < 2 && Math.abs(h - this.h) < 2) return;
    this.w = w; this.h = h;
    this.cv.width = Math.round(w * this.dpr);
    this.cv.height = Math.round(h * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.build(); this.ink();
  };

  /* 从水墨原图取边缘点，作为「星点回落成山」的目标位置 */
  Scene.prototype.buildSample = function (im) {
    var SW = 128, SH = Math.round(SW * im.height / im.width);
    var cv = document.createElement('canvas'); cv.width = SW; cv.height = SH;
    var c = cv.getContext('2d'); c.drawImage(im, 0, 0, SW, SH);
    var d;
    try { d = c.getImageData(0, 0, SW, SH).data; } catch (e) { this.sample = null; return; }
    var pts = [];
    for (var y = 1; y < SH - 1; y++) for (var x = 1; x < SW - 1; x++) {
      var i = (y * SW + x) * 4;
      var l = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
      var r = d[i + 4] * 0.3 + d[i + 5] * 0.59 + d[i + 6] * 0.11;
      var b = d[i + SW * 4] * 0.3 + d[i + SW * 4 + 1] * 0.59 + d[i + SW * 4 + 2] * 0.11;
      var edge = Math.abs(l - r) + Math.abs(l - b);
      if (edge > 26 || (l < 120 && l > 30 && Math.random() < 0.25)) pts.push([x / SW, y / SH]);
    }
    this.sample = pts;
  };

  Scene.prototype.build = function () {
    var w = this.w, h = this.h, cf = this.cfg(), R = rnd(st.sty.charCodeAt(0) * 7919 + 13);
    /* 关键：以水线为锚点定位画面，宽屏窄屏都不会把水线顶出视口 */
    var dwCover = h * (cf.baseYT / 0.79) / IMG_R;
    var dw = Math.max(w * cf.dwMul, dwCover);
    var dh = dw * IMG_R;
    var dy = h * cf.baseYT - 0.79 * dh;
    var dx = w * cf.cxT - 0.5 * dw;

    this.im = { dx: dx, dy: dy, dw: dw, dh: dh };
    this.cx = w * cf.cxT;
    this.baseY = h * cf.baseYT;
    this.gal = { x: w * cf.gal[0], y: h * cf.gal[1], r: Math.max(w * cf.gal[2], h * 0.18) };

    var uv = (this.sample || []).filter(function (p) {
      var y = dy + p[1] * dh, x = dx + p[0] * dw;
      return y > -20 && y < h + 20 && x > -20 && x < w + 20;
    });
    var n = Math.min(1650, Math.round(w * h / 880));
    this.parts = [];
    var bx0 = this.cx - w * 0.20, by0 = h * 0.02, bx1 = this.cx + w * 0.20, by1 = h * 0.52;
    for (var i = 0; i < n; i++) {
      var ix, iy, sx, sy;
      if (uv.length) {
        var p = uv[Math.floor(R() * uv.length)];
        ix = dx + p[0] * dw + (R() - 0.5) * 5;
        iy = dy + p[1] * dh + (R() - 0.5) * 5;
      } else { ix = R() * w; iy = h * (0.25 + R() * 0.55); }
      if (R() < 0.42) {
        var u = R();
        sx = bx0 + (bx1 - bx0) * u + (R() + R() + R() - 1.5) / 1.5 * w * 0.10;
        sy = by0 + (by1 - by0) * u + (R() + R() + R() - 1.5) / 1.5 * h * 0.07;
      } else { sx = R() * w; sy = Math.pow(R(), 1.2) * h * 0.74; }
      sx = Math.min(w - 2, Math.max(2, sx)); sy = Math.max(4, sy);
      this.parts.push({
        ix: ix, iy: iy, sx: sx, sy: sy, x: ix, y: iy, vx: 0, vy: 0,
        r: 0.7 + Math.pow(R(), 2.4) * 2.1,
        f1: 0.18 + R() * 0.5, f2: 0.16 + R() * 0.5, f3: 0.5 + R() * 2.2, ph: R() * 6.28,
        col: STAR_COLS[Math.floor(Math.pow(R(), 1.5) * 4)],
        dv: 0.35 + R() * 1.15, glint: R() < 0.05, big: R() < 0.028
      });
    }
  };

  /* 预烘焙三张离屏图：水墨层、星野层、星系层 */
  Scene.prototype.ink = function () {
    var night = st.theme === 'night';
    this.theme = st.theme;
    var w = this.w, h = this.h, im = this.im, dpr = this.dpr;

    var o = this.ink0 || (this.ink0 = document.createElement('canvas'));
    o.width = Math.round(w * dpr); o.height = Math.round(h * dpr);
    var c = o.getContext('2d');
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, w, h);
    if (this.artInk) {
      c.save();
      c.filter = night ? 'grayscale(1) contrast(.90) brightness(1.12)'
                       : 'grayscale(1) contrast(.80) brightness(1.10)';
      c.drawImage(this.artInk, im.dx, im.dy, im.dw, im.dh);
      c.filter = 'none';
      c.globalCompositeOperation = 'lighten';
      c.fillStyle = night ? 'rgb(58,64,78)' : 'rgb(102,104,106)';
      c.fillRect(0, 0, w, h);
      c.restore();
    } else {
      c.fillStyle = night ? '#0a1018' : '#f4f0e5';
      c.fillRect(0, 0, w, h);
    }

    var sk = this.sky0 || (this.sky0 = document.createElement('canvas'));
    sk.width = Math.round(w * dpr); sk.height = Math.round(h * dpr);
    var k2 = sk.getContext('2d');
    k2.setTransform(dpr, 0, 0, dpr, 0, 0); k2.clearRect(0, 0, w, h);
    if (night) {
      var Q = rnd(311 + st.sty.charCodeAt(0) * 31), cx = this.cx;
      var bx0 = cx - w * 0.20, by0 = h * 0.01, bx1 = cx + w * 0.22, by1 = h * 0.56;
      var nS = Math.round(w * h / 620);
      for (var i = 0; i < nS; i++) {
        var x2, y2;
        if (Q() < 0.40) {
          var u = Q();
          x2 = bx0 + (bx1 - bx0) * u + (Q() + Q() + Q() - 1.5) / 1.5 * w * 0.075;
          y2 = by0 + (by1 - by0) * u + (Q() + Q() + Q() - 1.5) / 1.5 * h * 0.05;
        } else { x2 = Q() * w; y2 = Math.pow(Q(), 1.1) * h * 0.92; }
        var rr = 0.5 + Math.pow(Q(), 2.4) * 2;
        k2.fillStyle = 'rgba(' + STAR_COLS[Math.floor(Math.pow(Q(), 1.6) * 4)] + ',' +
          (0.18 + Math.pow(Q(), 2) * 0.72).toFixed(3) + ')';
        k2.fillRect(x2 - rr / 2, y2 - rr / 2, rr, rr);
      }
      for (var j = 0; j < 15; j++) {                    // 十字亮星
        var bx = Q() * w, by = Q() * h * 0.6, br = 0.9 + Q() * 1.6;
        var colr = STAR_COLS[Math.floor(Q() * 4)], a2 = 0.55 + Q() * 0.4;
        var g3 = k2.createRadialGradient(bx, by, 0, bx, by, br * 7);
        g3.addColorStop(0, 'rgba(' + colr + ',' + (a2 * 0.5).toFixed(2) + ')');
        g3.addColorStop(1, 'rgba(' + colr + ',0)');
        k2.fillStyle = g3; k2.beginPath(); k2.arc(bx, by, br * 7, 0, 6.3); k2.fill();
        k2.strokeStyle = 'rgba(' + colr + ',' + (a2 * 0.75).toFixed(2) + ')'; k2.lineWidth = 0.75;
        var sp = br * (4.5 + Q() * 4);
        k2.beginPath(); k2.moveTo(bx - sp, by); k2.lineTo(bx + sp, by);
        k2.moveTo(bx, by - sp); k2.lineTo(bx, by + sp); k2.stroke();
        k2.fillStyle = 'rgba(255,255,255,' + a2.toFixed(2) + ')';
        k2.beginPath(); k2.arc(bx, by, br, 0, 6.3); k2.fill();
      }
    }

    var gl = this.gal0 || (this.gal0 = document.createElement('canvas'));
    gl.width = Math.round(this.gal.r * 2 * dpr); gl.height = gl.width;
    var k3 = gl.getContext('2d');
    k3.setTransform(dpr, 0, 0, dpr, 0, 0);
    k3.clearRect(0, 0, this.gal.r * 2, this.gal.r * 2);
    if (night && this.artGal) {
      var R2 = this.gal.r, src = this.artGal, sSide = Math.min(src.width, src.height);
      k3.save();
      k3.filter = 'brightness(1.05) contrast(1.25) saturate(.85)';
      k3.drawImage(src, (src.width - sSide) / 2, src.height * 0.28, sSide, sSide, 0, 0, R2 * 2, R2 * 2);
      k3.restore();
      k3.globalCompositeOperation = 'destination-in';
      var mg = k3.createRadialGradient(R2, R2, 0, R2, R2, R2);
      mg.addColorStop(0, 'rgba(0,0,0,1)'); mg.addColorStop(0.45, 'rgba(0,0,0,.80)');
      mg.addColorStop(0.78, 'rgba(0,0,0,.20)'); mg.addColorStop(1, 'rgba(0,0,0,0)');
      k3.fillStyle = mg; k3.fillRect(0, 0, R2 * 2, R2 * 2);
      k3.globalCompositeOperation = 'source-over';
    }
  };

  /* 原画是连着水面倒影一起画的，这里只留船身，倒影按当前姿态重新投 */
  Scene.prototype.buildBoat = function (src) {
    var SC = 2, CUT = 131, W = src.width * SC, H = CUT * SC;
    var o = document.createElement('canvas'); o.width = W; o.height = H;
    var c = o.getContext('2d');
    c.drawImage(src, 0, 0, src.width * SC, src.height * SC);
    var id = c.getImageData(0, 0, W, H), px = id.data;
    var cxp = 148 * SC, cyp = 84 * SC, rx = 152 * SC, ry = 96 * SC;
    for (var i = 0; i < px.length; i += 4) {
      var p = i >> 2, x = p % W, y = (p - x) / W;
      var lum = 0.3 * px[i] + 0.59 * px[i + 1] + 0.11 * px[i + 2];
      var a = 1 - lum / 206;
      a = a > 0 ? Math.pow(a < 1 ? a : 1, 0.85) : 0;
      var u = (x - cxp) / rx, v = (y - cyp) / ry, dd = Math.sqrt(u * u + v * v);
      if (dd > 1) a = 0; else if (dd > 0.7) a *= 1 - (dd - 0.7) / 0.3;
      if (y > (CUT - 7) * SC) a *= (CUT * SC - y) / (7 * SC);
      px[i] = px[i + 1] = px[i + 2] = 255;
      px[i + 3] = (a * 255) | 0;
    }
    c.putImageData(id, 0, 0);
    function tint(col) {
      var t2 = document.createElement('canvas'); t2.width = W; t2.height = H;
      var k = t2.getContext('2d');
      k.drawImage(o, 0, 0);
      k.globalCompositeOperation = 'source-in';
      k.fillStyle = col; k.fillRect(0, 0, W, H);
      return t2;
    }
    var rim = document.createElement('canvas'); rim.width = W; rim.height = H;
    var rk = rim.getContext('2d');
    rk.drawImage(tint('#c3d4ea'), 0, 0);
    rk.globalCompositeOperation = 'destination-out';
    rk.drawImage(o, 1.2 * SC, 3.2 * SC);
    this.boatArt = { day: tint('#1b2028'), nDark: tint('#465877'), nRim: rim, w: src.width, h: CUT };
  };

  Scene.prototype.boat = function (c, x, y, k, night, M, t) {
    var art = this.boatArt; if (!art) return;
    var f = k * 0.31, trim = -BOAT_TRIM * Math.PI / 180;
    function put(sp, mir) {
      c.save();
      c.translate(x, y);
      if (M) c.translate(0, Math.sin(t * 0.62) * 1.1 * M);
      c.scale(1, mir ? -0.44 : 0.82);
      if (M) c.rotate(Math.sin(t * 0.8) * 0.01 * M);
      c.rotate(trim);
      c.scale(f, f);
      c.translate(-148, -art.h * 0.9);
      c.drawImage(sp, 0, 0, sp.width, sp.height, 0, 0, art.w, art.h);
      c.restore();
    }
    c.save();
    c.filter = 'blur(1.4px)';
    if (night) { c.globalCompositeOperation = 'multiply'; c.globalAlpha *= 0.55; put(art.nDark, true); }
    else { c.globalAlpha *= 0.2; put(art.day, true); }
    c.restore();
    c.save();
    if (night) {
      c.globalCompositeOperation = 'multiply'; put(art.nDark, false);
      c.globalCompositeOperation = 'source-over'; c.globalAlpha *= 0.55; put(art.nRim, false);
    } else put(art.day, false);
    c.restore();
  };

  Scene.prototype.frame = function (t, dt, night, M) {
    var c = this.ctx, w = this.w, h = this.h;
    var p = Math.max(0, Math.min(1, this.p)), e = p * p * (3 - 2 * p);

    var g = c.createLinearGradient(0, 0, 0, h);
    if (night) { g.addColorStop(0, '#0b1120'); g.addColorStop(0.5, '#101a2e'); g.addColorStop(1, '#0d1524'); }
    else { g.addColorStop(0, '#f7f4ea'); g.addColorStop(0.62, '#f3efe4'); g.addColorStop(1, '#ebe6d8'); }
    c.fillStyle = g; c.fillRect(0, 0, w, h);

    if (night) {
      var ng = c.createLinearGradient(w * 0.1, 0, w * 0.85, h * 0.7);
      ng.addColorStop(0, 'rgba(58,80,116,0)');
      ng.addColorStop(0.45, 'rgba(64,88,124,' + (0.05 + 0.10 * e).toFixed(3) + ')');
      ng.addColorStop(1, 'rgba(40,58,88,0)');
      c.fillStyle = ng; c.fillRect(0, 0, w, h);

      if (this.gal0) {
        var dr = 3 * Math.sin(t * 0.05);
        c.save();
        c.globalCompositeOperation = 'screen';
        c.globalAlpha = 0.62 + 0.24 * e;
        c.drawImage(this.gal0, this.gal.x - this.gal.r + dr, this.gal.y - this.gal.r + dr * 0.4,
                    this.gal.r * 2, this.gal.r * 2);
        c.restore();
      }
      if (this.sky0) {
        var off = ((t * (3 + 14 * M)) % w + w) % w;
        c.globalAlpha = 0.6 + 0.4 * e;
        c.drawImage(this.sky0, off, 0, w, h);
        c.drawImage(this.sky0, off - w, 0, w, h);
        c.globalAlpha = 1;
      }
      if (!this.reduced) {                               // 流星
        if (this.mt.length < 3 && Math.random() < dt * (0.10 + M * 0.35)) {
          this.mt.push({
            x: w * (0.08 + Math.random() * 0.84), y: h * Math.random() * 0.30,
            ang: 1.87 + (Math.random() - 0.5) * 0.5, v: 240 + Math.random() * 260,
            len: 70 + Math.random() * 150, life: 0, dur: 0.9 + Math.random() * 0.8
          });
        }
        for (var i = this.mt.length - 1; i >= 0; i--) {
          var m2 = this.mt[i]; m2.life += dt;
          m2.x += Math.cos(m2.ang) * m2.v * dt; m2.y += Math.sin(m2.ang) * m2.v * dt;
          if (m2.life > m2.dur || m2.y > this.baseY - 8) { this.mt.splice(i, 1); continue; }
          var fa = Math.sin(3.14 * m2.life / m2.dur) * (0.65 + 0.3 * e);
          var tx2 = m2.x - Math.cos(m2.ang) * m2.len, ty2 = m2.y - Math.sin(m2.ang) * m2.len;
          var lg = c.createLinearGradient(m2.x, m2.y, tx2, ty2);
          lg.addColorStop(0, 'rgba(235,242,255,' + fa.toFixed(3) + ')');
          lg.addColorStop(1, 'rgba(235,242,255,0)');
          c.strokeStyle = lg; c.lineWidth = 1.4; c.lineCap = 'round';
          c.beginPath(); c.moveTo(m2.x, m2.y); c.lineTo(tx2, ty2); c.stroke();
          c.fillStyle = 'rgba(255,255,255,' + fa.toFixed(3) + ')';
          c.beginPath(); c.arc(m2.x, m2.y, 1.3, 0, 6.3); c.fill();
        }
      }
      var mgl = c.createRadialGradient(this.cx, h * 0.52, 0, this.cx, h * 0.52, w * 0.42);
      mgl.addColorStop(0, 'rgba(150,178,220,' + (0.30 - 0.16 * e).toFixed(3) + ')');
      mgl.addColorStop(0.55, 'rgba(130,158,205,' + (0.14 - 0.07 * e).toFixed(3) + ')');
      mgl.addColorStop(1, 'rgba(120,150,200,0)');
      c.fillStyle = mgl; c.fillRect(0, 0, w, h);
    }

    var inkA = 1 - 0.78 * e;
    c.save();
    c.globalCompositeOperation = 'multiply';
    c.globalAlpha = inkA;
    c.drawImage(this.ink0, 0, 0, w, h);
    c.restore();

    if (night) {
      var air = c.createLinearGradient(0, 0, 0, h);
      air.addColorStop(0, 'rgba(74,100,150,' + (0.10 * inkA).toFixed(3) + ')');
      air.addColorStop(0.55, 'rgba(80,104,152,' + (0.17 * inkA).toFixed(3) + ')');
      air.addColorStop(1, 'rgba(60,84,132,' + (0.09 * inkA).toFixed(3) + ')');
      c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = air; c.fillRect(0, 0, w, h); c.restore();

      var wY = this.baseY;                               // 水面反光
      var glow = c.createLinearGradient(0, wY - h * 0.10, 0, wY + h * 0.05);
      glow.addColorStop(0, 'rgba(150,180,225,0)');
      glow.addColorStop(0.6, 'rgba(150,180,225,' + (0.07 * inkA).toFixed(3) + ')');
      glow.addColorStop(1, 'rgba(150,180,225,0)');
      c.fillStyle = glow; c.fillRect(0, wY - h * 0.10, w, h * 0.15);
      var Rf = rnd(909 + st.sty.charCodeAt(0));
      for (var q = 0; q < 26; q++) {
        var yy = wY + 4 + Math.pow(Rf(), 1.3) * (h - wY) * 0.92;
        var sxx = this.gal.x + (Rf() - 0.5) * (w * 0.10 + (yy - wY) * 0.5);
        var ln = 4 + Rf() * 26, fl = 0.5 + 0.5 * Math.sin(t * (0.5 + Rf() * 1.4) + q);
        c.fillStyle = 'rgba(206,224,250,' + (0.06 + Rf() * 0.16 * fl).toFixed(3) + ')';
        c.fillRect(sxx - ln / 2, yy, ln, 1.1);
      }
    }

    if (inkA > 0.03) {
      var cf = this.cfg();
      c.globalAlpha = Math.min(1, inkA * 1.25);
      this.boat(c, w * cf.boat[0], h * cf.boat[1],
                cf.boat[2] * Math.max(0.7, Math.min(1.6, w / 1180)), night, M, t);
    }
    c.globalAlpha = 1;

    var base = night ? 0.95 : 0.62;
    var drift = night ? t * (5 + 20 * M) : 0;
    for (var n = 0; n < this.parts.length; n++) {
      var o2 = this.parts[n], tsx = o2.sx, tsy = o2.sy;
      if (night) {
        tsx = (o2.sx + drift * o2.dv) % w; if (tsx < 0) tsx += w;
        tsy = o2.sy + Math.sin(t * 0.05 + o2.ph) * 6;
        if (e > 0.5 && Math.abs(tsx - o2.x) > w * 0.5) { o2.x = tsx; o2.vx = 0; }
      }
      var tx = o2.ix + (tsx - o2.ix) * e, ty = o2.iy + (tsy - o2.iy) * e;
      var ddx = o2.x - this.mx, ddy = o2.y - this.my, d2 = ddx * ddx + ddy * ddy;
      if (d2 < 15000) { var d = Math.sqrt(d2) || 1, fq = (1 - d / 122) * 2.6; o2.vx += ddx / d * fq; o2.vy += ddy / d * fq; }
      o2.vx += (tx + Math.sin(t * o2.f1 + o2.ph) * 7 * M - o2.x) * 0.014;
      o2.vy += (ty + Math.cos(t * o2.f2 + o2.ph) * 7 * M - o2.y) * 0.014;
      o2.vx *= 0.9; o2.vy *= 0.9; o2.x += o2.vx; o2.y += o2.vy;
      var tw = 1 - 0.55 * M * (0.5 + 0.5 * Math.sin(t * o2.f3 + o2.ph * 2));
      var a3 = base * tw * (0.6 + 0.4 * e + (night ? 0 : 0.08));
      var rr2 = o2.r * (0.85 + 0.5 * e);
      if (night) {
        c.fillStyle = 'rgba(' + o2.col + ',' + a3.toFixed(3) + ')';
        c.fillRect(o2.x - rr2 / 2, o2.y - rr2 / 2, rr2, rr2);
        if (o2.glint && e > 0.25) {
          c.strokeStyle = 'rgba(' + o2.col + ',' + (a3 * 0.45).toFixed(3) + ')'; c.lineWidth = 0.7;
          var sp2 = rr2 * 3.2 * e;
          c.beginPath(); c.moveTo(o2.x - sp2, o2.y); c.lineTo(o2.x + sp2, o2.y);
          c.moveTo(o2.x, o2.y - sp2); c.lineTo(o2.x, o2.y + sp2); c.stroke();
        }
        if (o2.big) {
          var rg = c.createRadialGradient(o2.x, o2.y, 0, o2.x, o2.y, 7 + 5 * e);
          rg.addColorStop(0, 'rgba(' + o2.col + ',' + (a3 * 0.42).toFixed(3) + ')');
          rg.addColorStop(1, 'rgba(' + o2.col + ',0)');
          c.fillStyle = rg; c.beginPath(); c.arc(o2.x, o2.y, 7 + 5 * e, 0, 6.3); c.fill();
        }
      } else {
        c.fillStyle = 'rgba(34,38,44,' + (a3 * 0.85).toFixed(3) + ')';
        c.fillRect(o2.x - rr2 / 2, o2.y - rr2 / 2, rr2, rr2);
      }
    }
  };

  Scene.prototype.tick = function () {
    var now = performance.now();
    var t = (now - this.t0) / 1000;
    var dt = Math.min(0.05, (now - (this.tp || now)) / 1000) || 0.016;
    this.tp = now;

    if (st.sty === 'a') {
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      this.p = Math.min(1, window.scrollY / max * 1.35);
    } else {
      this.pT = st.page / (PAGES - 1);
      this.p += (this.pT - this.p) * 0.06;
    }

    if (this.theme !== st.theme) this.ink();
    try {
      this.frame(t, dt, st.theme === 'night', this.reduced ? 0 : st.motion);
    } catch (err) {
      if (!this.warned) { this.warned = 1; console.error('[scene]', err); }
    }
    this.raf = requestAnimationFrame(this.tick.bind(this));
  };

  /* ── 启动 ──────────────────────────────────────────────────────── */
  var canvas = document.getElementById('bg');
  var scene = new Scene(canvas);
  scene.resize(true);
  scene.tick();

  function loadImg(src) {
    return new Promise(function (res) {
      var im = new Image();
      im.onload = function () { res(im); };
      im.onerror = function () { console.warn('图片没加载上：' + src); res(null); };
      im.src = src;
    });
  }
  Promise.all([
    loadImg('assets/ink-canyon.jpg'),
    loadImg('assets/galaxy.jpg'),
    loadImg('assets/boat-ink.png')
  ]).then(function (r) {
    scene.artInk = r[0]; scene.artGal = r[1];
    if (r[2]) { try { scene.buildBoat(r[2]); } catch (e) { console.error('[boat]', e); } }
    if (r[0]) scene.buildSample(r[0]);
    scene.resize(true);
    canvas.classList.add('ready');
  });

  var rt;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () { scene.resize(true); }, 120);
  });
  window.addEventListener('pointermove', function (e) {
    scene.mx = e.clientX; scene.my = e.clientY;
  }, { passive: true });
  window.addEventListener('pointerleave', function () { scene.mx = -9e3; scene.my = -9e3; });

  document.addEventListener('keydown', function (e) {          // 册页模式左右翻页
    if (st.sty !== 'b') return;
    if (e.key === 'ArrowRight' && st.page < PAGES - 1) { st.page++; apply(); }
    if (e.key === 'ArrowLeft' && st.page > 0) { st.page--; apply(); }
  });
})();
