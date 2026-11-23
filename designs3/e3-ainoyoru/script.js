/* E3 藍夜と白金 — メニューブック。内容はすべて SITE_DATA から描画 */
(function () {
  "use strict";
  var N = window.Neko, el = N.el, S = N.shop;
  var book = N.$("#book"), toc = N.$("#toc");
  var chapters = [];   // {id, key, title, node}

  var KEY = { lunch: "昼", dinner: "夜", special: "特" };

  /* ---------- 小さな部品 ---------- */
  function svgNS(html, cls) {
    var d = el("span", cls || "svgwrap");
    d.setAttribute("aria-hidden", "true");
    d.innerHTML = html;      // 自作の固定SVGのみ（データは入れない）
    return d;
  }
  function paw(cls) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("class", cls || "paw"); s.setAttribute("aria-hidden", "true");
    var u = document.createElementNS("http://www.w3.org/2000/svg", "use");
    u.setAttribute("href", "#paw"); s.appendChild(u); return s;
  }
  /* 足跡の点を結ぶ小さな星座（章の区切り） */
  function trail() {
    var pts = [[20, 40], [70, 18], [124, 44], [176, 22], [228, 46]];
    var h = '<svg viewBox="0 0 250 64" class="trail-svg" focusable="false"><polyline points="' +
      pts.map(function (p) { return p.join(","); }).join(" ") +
      '" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="2 5" stroke-linecap="round"/>';
    pts.forEach(function (p, i) {
      h += '<g transform="translate(' + (p[0] - 7) + ' ' + (p[1] - 7) + ') rotate(' + (i % 2 ? 12 : -12) + ' 7 7)">' +
        '<use href="#paw" width="14" height="14"/></g>';
    });
    return svgNS(h + "</svg>", "trail reveal");
  }
  function leader(name, value, cls) {
    var r = el("div", "lead-row " + (cls || ""));
    r.appendChild(el("span", "lr-name", name));
    if (value) { r.appendChild(el("span", "lr-dots")); r.appendChild(el("span", "lr-val", value)); }
    return r;
  }
  function rich(tag, cls, text) { var e = el(tag, cls); N.rich(e, text); return e; }

  function chapter(id, key, title, sub) {
    var sec = el("section", "chap"); sec.id = id;
    sec.setAttribute("aria-labelledby", "h-" + id);
    var head = el("header", "chap-head");
    var no = el("span", "chap-no"); no.setAttribute("aria-hidden", "true");
    head.appendChild(no);
    head.appendChild(el("span", "chap-key", key));
    var h = el("h2", "chap-title", title); h.id = "h-" + id; head.appendChild(h);
    if (sub) head.appendChild(el("p", "chap-sub", sub));
    sec.appendChild(head);
    chapters.push({ id: id, key: key, title: title, node: sec, no: no });
    return sec;
  }

  /* ---------- 猫のシルエット（月を見上げる） ---------- */
  var CAT = '<svg viewBox="0 0 420 380" class="moon-cat" focusable="false">' +
    '<defs><mask id="crs"><rect width="420" height="380" fill="#fff"/><circle cx="318" cy="96" r="58" fill="#000"/></mask>' +
    '<radialGradient id="halo"><stop offset="0" stop-color="#cfd6e4" stop-opacity=".22"/><stop offset="1" stop-color="#cfd6e4" stop-opacity="0"/></radialGradient></defs>' +
    '<circle cx="290" cy="110" r="105" fill="url(#halo)"/>' +
    '<circle cx="290" cy="110" r="64" fill="#eef1f7" mask="url(#crs)"/>' +
    '<g fill="#eef1f7"><circle cx="372" cy="52" r="2.2"/><circle cx="214" cy="40" r="1.8"/><circle cx="392" cy="170" r="1.6"/><circle cx="170" cy="96" r="1.4"/></g>' +
    '<path d="M214 40 L290 110 M290 110 L372 52 M290 110 L392 170" stroke="#9aa5bd" stroke-width=".8" stroke-dasharray="2 5" fill="none" opacity=".6"/>' +
    '<path d="M30 338 L390 338" stroke="#5b6784" stroke-width="1"/>' +
    '<g fill="#060914" stroke="#cfd6e4" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round">' +
      '<path d="M96 336 C82 336 74 300 84 262 C94 226 126 204 152 198 L196 198 C224 210 240 250 236 298 C234 326 226 336 206 336 Z"/>' +
      '<path d="M92 328 C46 340 22 296 44 266 C56 250 78 256 74 272" fill="none" stroke-width="13" stroke="#cfd6e4"/>' +
      '<path d="M92 328 C46 340 22 296 44 266 C56 250 78 256 74 272" fill="none" stroke-width="10" stroke="#060914"/>' +
      '<path d="M140 178 C140 150 160 132 184 134 C204 135 218 150 220 170 C221 190 206 206 182 206 C158 206 140 196 140 178 Z" transform="rotate(-28 180 172)"/>' +
      '<path d="M150 150 L146 106 L178 134 Z" transform="rotate(-10 170 140)"/>' +
      '<path d="M190 130 L214 100 L218 146 Z" transform="rotate(-10 200 140)"/>' +
      '<path d="M210 168 L232 160 L224 182 Z"/>' +
    '</g>' +
    '<g fill="none" stroke="#cfd6e4" stroke-width="1" stroke-linecap="round" opacity=".7"><path d="M226 168 L262 156 M226 174 L264 176"/></g>' +
    '<g class="trail-on-ledge" color="#9aa5bd" fill="currentColor">' +
      '<use href="#paw" x="258" y="318" width="14" height="14" transform="rotate(14 265 325)"/>' +
      '<use href="#paw" x="296" y="322" width="14" height="14" transform="rotate(-10 303 329)" opacity=".7"/>' +
      '<use href="#paw" x="336" y="318" width="14" height="14" transform="rotate(12 343 325)" opacity=".45"/>' +
    '</g></svg>';

  /* ---------- 序 ---------- */
  function buildOpening() {
    var I = S.intro || {};
    var sec = chapter("top", "序", "猫");
    sec.classList.add("opening");
    sec.removeChild(sec.firstChild);        // 通常見出しは使わず専用構成
    var hero = el("div", "hero");
    var h1 = el("h1", "mega", "猫"); h1.id = "h-top";
    var left = el("div", "hero-text");
    left.appendChild(el("p", "eyebrow", "完全予約制 ・ ご紹介のみ"));
    left.appendChild(h1);
    if (I.label) left.appendChild(el("p", "label", I.label));
    hero.appendChild(left);
    var cat = svgNS(CAT, "hero-art"); cat.setAttribute("role", "img");
    cat.removeAttribute("aria-hidden"); cat.setAttribute("aria-label", "月を見上げる猫のシルエット");
    hero.appendChild(cat);
    sec.appendChild(hero);

    var body = el("div", "page intro reveal");
    if (I.catch) body.appendChild(rich("p", "catch", I.catch));
    if (I.lead) body.appendChild(rich("p", "para", I.lead));
    (I.lines || []).forEach(function (t) { body.appendChild(rich("p", "para", t)); });
    if (I.small) body.appendChild(rich("p", "para soft", I.small));
    sec.appendChild(body);

    var ph = N.photos();
    if (ph.length) {
      var row = el("div", "moons reveal");
      ph.forEach(function (p) {
        var f = el("figure", "moon-frame"); var im = el("img");
        im.src = p.src; im.alt = p.alt; im.loading = "lazy"; f.appendChild(im); row.appendChild(f);
      });
      sec.appendChild(row);
    }
    return sec;
  }

  /* ---------- お知らせ ---------- */
  function buildNews() {
    var list = N.news(); if (!list.length) return null;
    var sec = chapter("news", "報", "お知らせ");
    var ul = el("ul", "news-list");
    list.forEach(function (n) {
      var li = el("li", "news-item reveal");
      li.appendChild(el("time", "nw-date", N.date(n.date)));
      var b = el("div", "nw-main");
      b.appendChild(el("strong", "nw-title", n.title));
      if (n.body) b.appendChild(rich("p", "nw-body", n.body));
      li.appendChild(b); ul.appendChild(li);
    });
    sec.appendChild(ul);
    return sec;
  }

  /* ---------- 思い・工夫 ---------- */
  function buildTenets(id, key, data) {
    if (!data || !(data.items || []).length) return null;
    var sec = chapter(id, key, data.title || key);
    var ol = el("ol", "tenets");
    data.items.forEach(function (t) {
      var li = el("li", "tenet reveal");
      li.appendChild(paw("paw"));
      var d = el("div");
      d.appendChild(el("h3", "", t.title));
      if (t.body) d.appendChild(rich("p", "", t.body));
      li.appendChild(d); ol.appendChild(li);
    });
    sec.appendChild(ol);
    return sec;
  }

  /* ---------- コース（見開き） ---------- */
  function dishParts(lines) {
    var out = [];
    lines.forEach(function (l) {
      String(l).split("・").forEach(function (p) { p = p.replace(/^\s+|\s+$/g, ""); if (p) out.push(p); });
    });
    return out;
  }
  function spread(it) {
    var a = el("article", "spread reveal"); a.id = "c-" + it.num;
    var L = el("div", "pg pg-l");
    L.appendChild(el("p", "sp-no", it.kanji));
    if (it.ribbon) L.appendChild(el("p", "sp-ribbon", it.ribbon));
    L.appendChild(el("h3", "sp-name", it.name));
    if (it.nameNote) L.appendChild(el("p", "sp-namenote", it.nameNote));
    if (it.tag) L.appendChild(el("p", "sp-tag", it.tag));
    if (it.priceText) {
      var pr = el("p", "sp-price"); pr.appendChild(el("span", "yen", "¥")); pr.appendChild(document.createTextNode(it.priceText));
      L.appendChild(pr);
    }
    if (it.note) L.appendChild(el("p", "sp-note", it.note));
    var R = el("div", "pg pg-r");
    if (it.photoUrl) {
      var f = el("figure", "sp-photo"); var im = el("img"); im.src = it.photoUrl; im.alt = it.name; im.loading = "lazy";
      f.appendChild(im); R.appendChild(f);
    }
    var parts = dishParts(it.lines);
    if (parts.length) {
      var ul = el("ul", "dishes" + (parts.length > 8 ? " many" : "") + (it.wide ? " wide" : ""));
      parts.forEach(function (p) { ul.appendChild(el("li", "", p)); });
      R.appendChild(ul);
    }
    a.appendChild(L); a.appendChild(R);
    return a;
  }
  function buildSection(s) {
    var key = KEY[s.id] || (s.title || "").charAt(0);
    var sub = [s.subtitle].filter(Boolean).join("");
    var sec = chapter("s-" + s.id, key, s.title, sub);
    if (s.lead) sec.appendChild(rich("p", "chap-lead reveal", s.lead));
    if (s.leadSmall) sec.appendChild(rich("p", "chap-small reveal", s.leadSmall));
    if (s.badge) { var b = el("p", "badge reveal"); b.appendChild(paw("paw")); N.rich(b, s.badge); sec.appendChild(b); }

    /* お品書き（点線リーダー） */
    var menu = el("div", "oshina reveal");
    menu.appendChild(el("p", "oshina-h", "お品書き"));
    s.items.forEach(function (it) {
      var a = el("a", "oshina-row"); a.href = "#c-" + it.num;
      a.appendChild(leader(it.name + (it.nameNote ? "" : ""), it.priceText ? "¥" + it.priceText : ""));
      menu.appendChild(a);
    });
    sec.appendChild(menu);
    s.items.forEach(function (it) { sec.appendChild(spread(it)); });
    return sec;
  }

  /* ---------- アラカルト ---------- */
  function buildAlacarte() {
    var a = N.alacarte(); if (!a) return null;
    var sec = chapter("alacarte", "品", a.title, a.subtitle);
    if (a.lead) sec.appendChild(el("p", "chap-lead reveal", a.lead));
    var wall = el("div", "plates");
    a.items.forEach(function (p) {
      var f = el("figure", "plate reveal"); var im = el("img");
      im.src = p.src; im.alt = p.alt; im.loading = "lazy"; f.appendChild(im);
      if (p.name) f.appendChild(el("figcaption", "", p.name));
      wall.appendChild(f);
    });
    sec.appendChild(wall);
    return sec;
  }

  /* ---------- ご予約 ---------- */
  function buildReserve() {
    var R = S.reserve || {}, H = N.hours();
    var sec = chapter("reserve", "約", R.title || "ご予約について");
    var grid = el("div", "yaku");

    var left = el("div", "page");
    var hrs = [];
    if (H.lunch) hrs.push(["ランチ", H.lunch]);
    if (H.dinner) hrs.push(["ディナー", H.dinner]);
    if (H.regular) hrs.push(["定休日", H.regular]);
    if (hrs.length) {
      var box = el("div", "hours reveal");
      box.appendChild(el("p", "oshina-h", "営業時間"));
      hrs.forEach(function (r) { box.appendChild(leader(r[0], r[1], "big")); });
      left.appendChild(box);
    }
    var cl = N.closures();
    if (cl.length) {
      var cb = el("div", "closures reveal");
      cb.appendChild(el("p", "oshina-h", "臨時休業"));
      cl.forEach(function (c) { cb.appendChild(el("p", "closure", N.closureText(c))); });
      left.appendChild(cb);
    }
    var notes = S.notes || [];
    if (notes.length) {
      var ul = el("ul", "notes reveal");
      notes.forEach(function (t) { ul.appendChild(rich("li", "", t)); });
      left.appendChild(ul);
    }
    var right = el("div", "page");
    if (R.lead) right.appendChild(rich("p", "para reveal", R.lead));
    if ((R.items || []).length) {
      var ol = el("ol", "ask reveal");
      R.items.forEach(function (t) { ol.appendChild(rich("li", "", t)); });
      right.appendChild(ol);
    }
    var btn = el("a", "btn reveal", (R.button || "ご予約・お問い合わせ"));
    btn.href = N.reserveUrl(); btn.target = "_blank"; btn.rel = "noopener noreferrer";
    right.appendChild(btn);
    if (R.thanks) right.appendChild(el("p", "thanks reveal", R.thanks));
    grid.appendChild(left); grid.appendChild(right);
    sec.appendChild(grid);
    return sec;
  }

  /* ---------- 組み立て ---------- */
  function build() {
    var secs = N.sections(); N.courses();            // 通し番号を付与
    var nodes = [buildOpening(), buildNews(), buildTenets("omoi", "想", S.omoi), buildTenets("kufu", "工", S.kufu)];
    var menu = secs.map(buildSection);
    var ala = buildAlacarte();
    if (ala) {
      var at = -1;
      secs.forEach(function (s, i) { if (s.id === "dinner") at = i; });
      if (at < 0) { secs.forEach(function (s, i) { if (s.id === "special" && at < 0) at = i - 1; }); }
      if (at < 0 && secs.length) at = secs.length - 1;
      menu.splice(at + 1, 0, ala);
    }
    nodes = nodes.concat(menu, [buildReserve()]);

    /* chapters 配列を表示順に並べ替え（chapter() は生成順に積むため） */
    var order = nodes.filter(Boolean);
    chapters.sort(function (a, b) { return order.indexOf(a.node) - order.indexOf(b.node); });
    order.forEach(function (n, i) {
      book.appendChild(n);
      if (i < order.length - 1) book.appendChild(trail());
    });
    chapters.forEach(function (c, i) {
      c.n = i + 1;
      c.no.textContent = N.kanji(i + 1);
    });
    var foot = el("footer", "foot");
    foot.appendChild(el("p", "draft", S.draftNote || ""));
    if (!S.draftNote) foot.removeChild(foot.firstChild);
    book.appendChild(foot);
  }

  /* ---------- 目次 ---------- */
  function buildToc() {
    var top = el("a", "toc-mark"); top.href = "#top"; top.setAttribute("aria-label", "先頭へ");
    top.appendChild(el("span", "", "猫")); top.appendChild(paw("paw"));
    toc.appendChild(top);

    var wrap = el("div", "toc-body");
    var prog = el("div", "prog"); prog.setAttribute("aria-hidden", "true");
    var bar = el("i"); prog.appendChild(bar); wrap.appendChild(prog);
    var ol = el("ol", "toc-list");
    chapters.forEach(function (c) {
      var li = el("li"); var a = el("a"); a.href = "#" + c.id; a.setAttribute("data-id", c.id);
      a.appendChild(el("span", "t-no", N.kanji(c.n)));
      a.appendChild(el("span", "t-title", c.title));
      li.appendChild(a); ol.appendChild(li);
    });
    wrap.appendChild(ol); toc.appendChild(wrap);

    var jump = el("div", "toc-jump");
    jump.appendChild(el("span", "tj-label", "頁"));
    ["lunch", "dinner", "alacarte", "special", "reserve"].forEach(function (k) {
      var id = (k === "alacarte" || k === "reserve") ? k : "s-" + k;
      var c = chapters.filter(function (x) { return x.id === id; })[0];
      if (!c) return;
      var a = el("a", "", c.key); a.href = "#" + id; a.setAttribute("aria-label", c.title + "へ");
      jump.appendChild(a);
    });
    toc.appendChild(jump);
    var res = el("a", "toc-res", (S.reserve || {}).button || "ご予約");
    res.href = N.reserveUrl(); res.target = "_blank"; res.rel = "noopener noreferrer";
    toc.appendChild(res);

    var links = N.$$(".toc-list a", toc);
    function onScroll() {
      var h = document.documentElement, max = h.scrollHeight - window.innerHeight;
      var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      bar.style.setProperty("--p", (p * 100).toFixed(2) + "%");
      var cur = chapters[0].id, line = window.innerHeight * 0.35;
      chapters.forEach(function (c) { if (c.node.getBoundingClientRect().top <= line) cur = c.id; });
      links.forEach(function (a) {
        var on = a.getAttribute("data-id") === cur;
        a.classList.toggle("on", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      N.$$(".toc-jump a", toc).forEach(function (a) { a.classList.toggle("on", a.getAttribute("href") === "#" + cur); });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
  }

  /* ---------- 背景の星座（足跡の点を結ぶ） ---------- */
  function sky() {
    var P = [[80, 120], [190, 70], [300, 160], [250, 290], [120, 330],
             [700, 60], [820, 130], [930, 80], [900, 240], [760, 300],
             [140, 560], [260, 640], [180, 780], [60, 900],
             [640, 520], [780, 600], [900, 540], [860, 720], [700, 800], [560, 940], [380, 880]];
    var L = [[0,1],[1,2],[2,3],[3,4],[5,6],[6,7],[7,8],[8,9],[10,11],[11,12],[12,13],[14,15],[15,16],[15,17],[17,18],[18,19],[19,20]];
    var h = '<svg viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" focusable="false">';
    L.forEach(function (l) {
      h += '<line x1="' + P[l[0]][0] + '" y1="' + P[l[0]][1] + '" x2="' + P[l[1]][0] + '" y2="' + P[l[1]][1] + '" stroke="#cfd6e4" stroke-opacity=".16" stroke-width="1" stroke-dasharray="2 6"/>';
    });
    P.forEach(function (p, i) {
      if (i % 4 === 0) h += '<g fill="#cfd6e4" fill-opacity=".3" transform="translate(' + (p[0] - 9) + ' ' + (p[1] - 9) + ') rotate(' + (i * 9 % 40 - 20) + ' 9 9)"><use href="#paw" width="18" height="18"/></g>';
      else h += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + (1.6 + (i % 3) * .5) + '" fill="#cfd6e4" fill-opacity=".45"/>';
    });
    N.$("#sky").innerHTML = h + "</svg>";
  }

  N.ready(function () {
    sky();
    build();
    buildToc();
    N.reveal(".reveal");
  });
})();
