/* E2 白磁と墨・縦書きの献立 — SITE_DATA を Neko 経由で描画 */
(function () {
  "use strict";
  var el = Neko.el, shop = Neko.shop;
  var main = Neko.$("#main") || Neko.$("main");

  function add(parent, child) { if (child) parent.appendChild(child); return child; }
  function txt(tag, cls, text) { return text ? el(tag, cls, Neko.plain(text)) : null; }
  function rich(tag, cls, text) { return text ? Neko.rich(el(tag, cls), text) : null; }
  function svgPaw(cls) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("class", cls || "paw"); s.setAttribute("aria-hidden", "true");
    var u = document.createElementNS("http://www.w3.org/2000/svg", "use");
    u.setAttribute("href", "#paw"); s.appendChild(u); return s;
  }
  function seal(ch) { var s = el("span", "seal", ch); s.setAttribute("aria-hidden", "true"); return s; }

  /* 価格：漢数字（縦書き用）。数字でなければそのまま */
  function kanjiNum(n) {
    var d = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
    function four(x) {
      var s = "";
      [[1000, "千"], [100, "百"], [10, "十"]].forEach(function (u) {
        var q = Math.floor(x / u[0]); x = x % u[0];
        if (q) s += (q === 1 ? "" : d[q]) + u[1];
      });
      return s + (x ? d[x] : "");
    }
    if (n <= 0 || n >= 100000000) return String(n);
    var man = Math.floor(n / 10000), rest = n % 10000;
    return (man ? four(man) + "万" : "") + (rest ? four(rest) : "");
  }
  function priceEl(it) {
    if (it.priceText == null) return null;
    var raw = String(it.price).replace(/[,，円]/g, "");
    var p = el("p", "price");
    if (/^\d+$/.test(raw)) {
      var k = el("span", "price-k", kanjiNum(Number(raw)) + "円");
      k.setAttribute("aria-hidden", "true");
      var n = el("span", "price-n", it.priceText + "円");
      p.appendChild(k); p.appendChild(n);
    } else {
      p.appendChild(el("span", "price-n only", it.priceText));
    }
    return p;
  }

  /* 見出し（縦書き）つきの章 */
  function chapter(id, kanji, title, extraCls) {
    var sec = el("section", "sec reveal " + (extraCls || ""));
    if (id) sec.id = id;
    var inner = add(sec, el("div", "sec-in"));
    var head = add(inner, el("div", "s-head"));
    head.appendChild(seal(kanji));
    var h = add(head, el("h2", "s-title", title));
    var hid = "h-" + (id || Math.random().toString(36).slice(2, 7));
    h.id = hid; sec.setAttribute("aria-labelledby", hid);
    var body = add(inner, el("div", "s-body tate"));
    return { sec: sec, body: body };
  }

  function photoFig(p, cls) {
    var f = el("figure", cls || "ph");
    var i = el("img"); i.src = p.src; i.alt = p.alt || ""; i.decoding = "async";
    f.appendChild(i); return f;
  }

  /* ---------- 序 ---------- */
  function hero() {
    var s = el("section", "hero");
    s.setAttribute("aria-labelledby", "h-title");
    var h1 = el("h1", "mega", "猫"); h1.id = "h-title";
    s.appendChild(h1);
    var mid = add(s, el("div", "hero-mid"));
    mid.appendChild(el("p", "eyebrow", "完全予約制　ご紹介のみ"));
    var ic = shop.intro || {};
    add(mid, txt("p", "catch", ic.catch));
    var hk = add(mid, el("span", "hanko"));
    hk.setAttribute("aria-hidden", "true"); hk.appendChild(svgPaw("paw"));
    var c = add(s, el("div", "hero-cat"));
    c.innerHTML =
      '<svg viewBox="0 0 320 230" role="img" aria-label="墨の線で描かれた、香箱座りで目を閉じる猫">' +
      '<rect class="stroke" x="18" y="203" width="284" height="5" fill="#2b3a55" filter="url(#kasure)"/>' +
      '<g fill="none" stroke="#1b1c21" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" filter="url(#brush)">' +
      '<path d="M40 198 C30 150 62 104 118 92 C186 78 256 104 268 166 C272 186 262 198 244 198"/>' +
      '<path d="M52 110 L48 62 L74 82 Q96 74 118 82 L144 62 L142 112 Q138 150 98 152 Q58 150 52 110 Z"/>' +
      '<path d="M72 116 Q81 123 90 116 M108 116 Q117 123 126 116"/>' +
      '<path d="M94 128 L102 128 L98 134 Z"/>' +
      '<path d="M98 134 L98 140 M98 140 Q92 145 87 142 M98 140 Q104 145 109 142"/>' +
      '<path d="M66 130 L34 124 M66 137 L32 142 M132 130 L164 124 M132 137 L166 142"/>' +
      '<path d="M266 176 C300 178 312 140 292 126 C280 118 266 128 274 140"/>' +
      '<path d="M150 198 C162 168 200 160 232 172" opacity=".8"/>' +
      '</g></svg>';
    return s;
  }

  function intro() {
    var ic = shop.intro || {};
    var photos = Neko.photos();
    if (!ic.lead && !ic.label && !ic.lines && !photos.length) return null;
    var sec = el("section", "sec intro reveal");
    sec.setAttribute("aria-label", "店について");
    var inner = add(sec, el("div", "sec-in"));
    var head = add(inner, el("div", "s-head"));
    head.appendChild(seal("序"));
    var body = add(inner, el("div", "s-body tate intro-body"));
    add(body, txt("p", "label", ic.label));
    add(body, rich("p", "lead", ic.lead));
    (ic.lines || []).forEach(function (l) { add(body, rich("p", "para", l)); });
    add(body, rich("p", "para soft", ic.small));
    if (photos.length) { var f = photoFig(photos[0], "ph ph-ink"); inner.appendChild(f); }
    return sec;
  }

  /* ---------- お知らせ ---------- */
  function news() {
    var list = Neko.news();
    if (!list.length) return null;
    var c = chapter("news", "報", "お知らせ", "news");
    var ul = add(c.body, el("ul", "news-cols"));
    list.forEach(function (n) {
      var li = add(ul, el("li"));
      add(li, el("span", "nw-date", Neko.date(n.date, "ja")));
      add(li, txt("strong", "nw-title", n.title));
      add(li, rich("span", "nw-body", n.body));
    });
    return c.sec;
  }

  /* ---------- 思い／工夫 ---------- */
  function tenets(id, kanji, block) {
    if (!block || !block.items || !block.items.length) return null;
    var c = chapter(id, kanji, block.title || "", "tenets-sec");
    var ol = add(c.body, el("ol", "tenets"));
    block.items.forEach(function (t) {
      var li = add(ol, el("li"));
      add(li, txt("h3", "", t.title));
      add(li, rich("p", "", t.body));
    });
    return c.sec;
  }

  /* ---------- 献立帖（横スクロール／スマホは縦積み） ---------- */
  function book(sec, label, panel, kids) {
    var wrap = el("section", "book reveal");
    if (sec) wrap.id = sec;
    wrap.setAttribute("aria-label", label);
    var sc = add(wrap, el("div", "scroller"));
    sc.tabIndex = 0; sc.setAttribute("role", "region"); sc.setAttribute("aria-label", label + "（横にスクロールできます）");
    sc.appendChild(panel);
    kids.forEach(function (k) { sc.appendChild(k); });
    var nav = add(wrap, el("div", "book-nav"));
    var prev = el("button", "bn bn-prev", "← 左へ"); prev.type = "button"; prev.setAttribute("aria-label", "次の頁へ（左へ）");
    var next = el("button", "bn bn-next", "戻る →"); next.type = "button"; next.setAttribute("aria-label", "前の頁へ（右へ）");
    nav.appendChild(next); nav.appendChild(el("span", "bn-hint", "横にめくる")); nav.appendChild(prev);
    function step() { var f = sc.querySelector(".strip, .ph-ala, .panel"); return Math.max(280, (sc.clientWidth || 600) * 0.6); }
    prev.addEventListener("click", function () { sc.scrollBy({ left: -step(), behavior: "smooth" }); });
    next.addEventListener("click", function () { sc.scrollBy({ left: step(), behavior: "smooth" }); });
    function check() {
      var over = sc.scrollWidth > sc.clientWidth + 8 && window.innerWidth > 760;
      wrap.classList.toggle("can-scroll", over);
    }
    book.checks.push(check);
    return wrap;
  }
  book.checks = [];

  var SEAL = { lunch: "昼", dinner: "夜", special: "特" };

  function panelFor(s) {
    var p = el("div", "panel");
    var ph = add(p, el("div", "p-head"));
    ph.appendChild(seal(SEAL[s.id] || Neko.plain(s.title).charAt(0)));
    ph.appendChild(el("h2", "p-title", Neko.plain(s.title)));
    var pb = add(p, el("div", "p-body"));
    add(pb, txt("p", "p-sub", s.subtitle));
    add(pb, rich("p", "p-lead", s.lead));
    add(pb, rich("p", "p-small", s.leadSmall));
    add(pb, rich("p", "p-badge", s.badge));
    return p;
  }

  function strip(it) {
    var a = el("article", "strip");
    var nm = Neko.plain(it.name);
    a.setAttribute("aria-label", nm);
    var sc = add(a, el("div", "st-seal")); sc.appendChild(seal(it.kanji));
    var head = add(a, el("div", "head"));
    var h = el("h3", "name", nm); head.appendChild(h);
    add(head, txt("p", "name-note", it.nameNote));
    add(head, priceEl(it));
    var parts = [];
    it.lines.forEach(function (l) {
      String(l).split("・").forEach(function (x) { if (x.replace(/\s/g, "")) parts.push(x); });
    });
    if (parts.length) {
      var ul = add(a, el("ul", "lines"));
      parts.forEach(function (x) { var li = add(ul, el("li")); Neko.rich(li, x); });
    }
    if (it.ribbon || it.tag || it.note) {
      var meta = add(a, el("div", "meta"));
      add(meta, txt("p", "ribbon", it.ribbon));
      add(meta, txt("p", "tag", it.tag));
      add(meta, txt("p", "note", it.note));
    }
    if (it.photoUrl) {
      var f = add(a, el("figure", "dish-photo"));
      var im = el("img"); im.src = it.photoUrl; im.alt = nm; im.decoding = "async"; f.appendChild(im);
    }
    return a;
  }

  function menuBooks() {
    var out = [], n = 0;
    Neko.sections().forEach(function (s) {
      var items = s.items.map(function (it) {
        n++; it.kanji = Neko.kanji(n); return it;
      });
      out.push(book(s.id, Neko.plain(s.title), panelFor(s), items.map(strip)));
    });
    return out;
  }

  /* ---------- アラカルト ---------- */
  function alacarte() {
    var a = Neko.alacarte();
    if (!a) return null;
    var panel = el("div", "panel");
    var ph = add(panel, el("div", "p-head"));
    ph.appendChild(seal("品"));
    ph.appendChild(el("h2", "p-title", a.title));
    var pb = add(panel, el("div", "p-body"));
    add(pb, txt("p", "p-sub", a.subtitle));
    add(pb, rich("p", "p-lead", a.lead));
    var kids = a.items.map(function (it) {
      var f = el("figure", "ph-ala");
      var im = el("img"); im.src = it.src; im.alt = it.alt; im.decoding = "async"; f.appendChild(im);
      if (it.name) f.appendChild(el("figcaption", "", Neko.plain(it.name)));
      return f;
    });
    var b = book("alacarte", a.title, panel, kids);
    b.classList.add("ala");
    return b;
  }

  /* ---------- 猫（残りの写真） ---------- */
  function gaze() {
    var ps = Neko.photos().slice(1);
    if (!ps.length) return null;
    var s = el("div", "gaze reveal");
    ps.forEach(function (p) { s.appendChild(photoFig(p, "ph ph-ink")); });
    return s;
  }

  /* ---------- ご利用案内 ---------- */
  function info() {
    var h = Neko.hours(), cols = [];
    if (h.regular) cols.push(["営業日", h.regular]);
    if (h.lunch) cols.push(["ランチ", h.lunch]);
    if (h.dinner) cols.push(["ディナー", h.dinner]);
    Neko.closures().forEach(function (c) { cols.push(["臨時休業", Neko.closureText(c), "closure"]); });
    (shop.notes || []).forEach(function (t) { cols.push(["", t]); });
    if (!cols.length) return null;
    var c = chapter("info", "案", "ご利用案内", "info");
    var ul = add(c.body, el("ul", "info-cols"));
    cols.forEach(function (x) {
      var li = add(ul, el("li", x[2] || ""));
      if (x[0]) li.appendChild(el("span", "k", x[0]));
      li.appendChild(Neko.rich(el("span", "v"), x[1]));
    });
    return c.sec;
  }

  /* ---------- ご予約 ---------- */
  function reserve() {
    var r = shop.reserve || {};
    var sec = el("section", "sec reserve reveal"); sec.id = "reserve";
    sec.setAttribute("aria-labelledby", "h-res");
    var inner = add(sec, el("div", "sec-in"));
    var head = add(inner, el("div", "s-head"));
    head.appendChild(seal("約"));
    var h = el("h2", "s-title", r.title || "ご予約"); h.id = "h-res"; head.appendChild(h);
    var body = add(inner, el("div", "s-body tate res-body"));
    add(body, rich("p", "lead2", r.lead));
    if (r.items && r.items.length) {
      var ol = add(body, el("ol", "res-list"));
      r.items.forEach(function (t) { add(ol, txt("li", "", t)); });
    }
    var cta = el("a", "cta", r.button || "ご予約・お問い合わせ");
    cta.href = Neko.reserveUrl();
    body.appendChild(cta);
    add(body, txt("p", "thanks", r.thanks));
    var steps = add(sec, el("div", "steps"));
    steps.setAttribute("aria-hidden", "true");
    for (var i = 1; i <= 4; i++) steps.appendChild(svgPaw("paw p" + i));
    return sec;
  }

  /* ---------- 組み立て ---------- */
  Neko.ready(function () {
    var parts = [hero(), intro(), news(), tenets("omoi", "想", shop.omoi), tenets("kufu", "工", shop.kufu)]
      .concat(menuBooks());
    parts.push(alacarte(), gaze(), info(), reserve());
    parts.forEach(function (p) { if (p) main.appendChild(p); });
    var d = Neko.$("#draft");
    if (d) { if (shop.draftNote) d.textContent = "※ " + shop.draftNote; else d.hidden = true; }

    function checkAll() { book.checks.forEach(function (f) { f(); }); }
    checkAll();
    window.addEventListener("resize", checkAll);
    window.addEventListener("load", checkAll);
    Neko.$$("img").forEach(function (i) { i.addEventListener("load", checkAll); });
    Neko.reveal(".reveal");
  });
})();
