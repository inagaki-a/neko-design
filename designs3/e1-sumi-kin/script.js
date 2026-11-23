/* 猫 E1 墨と金 — 内容はすべて Neko（menu-data.js）から描画 */
(function () {
  "use strict";
  var el = Neko.el, shop = Neko.shop;

  function paw(cls) {
    var s = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    s.setAttribute("class", "paw " + (cls || "")); s.setAttribute("aria-hidden", "true");
    var u = document.createElementNS("http://www.w3.org/2000/svg", "use");
    u.setAttribute("href", "#paw"); s.appendChild(u); return s;
  }
  function rule(extra) { return el("hr", "rule reveal " + (extra || "")); }
  function rv(tag, cls, text) { return el(tag, (cls || "") + " reveal", text); }
  function sec(cls, id, label) {
    var s = el("section", cls); if (id) s.id = id; if (label) s.setAttribute("aria-label", label); return s;
  }
  function inner(parent, wide) { var d = el("div", "inner" + (wide ? " wide" : "")); parent.appendChild(d); return d; }
  function two(n) { return (n < 10 ? "0" : "") + n; }

  /* 章扉（縦書き） */
  function door(s, idx) {
    var d = sec("door", "ch-" + s.id, s.title);
    var box = inner(d);
    box.appendChild(rv("p", "door-no", "第" + Neko.kanji(idx + 1) + "章"));
    var h = rv("h2", "door-title", s.title); h.id = "h-" + s.id; box.appendChild(h);
    box.appendChild(rule("v"));
    if (s.subtitle) box.appendChild(rv("p", "door-time", s.subtitle));
    if (s.lead) box.appendChild(Neko.rich(rv("p", "door-lead"), s.lead));
    if (s.leadSmall) box.appendChild(Neko.rich(rv("p", "door-small"), s.leadSmall));
    if (s.badge) { var b = rv("p", "door-badge"); b.appendChild(paw()); Neko.rich(b, s.badge); box.appendChild(b); }
    return d;
  }

  /* 一画面一コース */
  function course(it) {
    var a = el("article", "course"); a.setAttribute("aria-labelledby", "c" + it.num);
    var nm = el("p", "num", two(it.num)); nm.setAttribute("aria-hidden", "true"); a.appendChild(nm);
    var col = el("div", "col");
    var meta = [];
    if (it.ribbon) meta.push(it.ribbon);
    if (it.tag) meta.push(it.tag);
    if (meta.length) col.appendChild(rv("p", "tag", meta.join("　／　")));
    var h = rv("h3", "name"); h.id = "c" + it.num;
    h.appendChild(document.createTextNode(Neko.plain(it.name)));
    if (it.nameNote) h.appendChild(el("small", "", it.nameNote));
    col.appendChild(h);
    if (it.priceText) {
      var p = rv("p", "price"); p.appendChild(el("span", "", it.priceText)); p.appendChild(el("i", "", "円")); col.appendChild(p);
    }
    var parts = [];
    it.lines.forEach(function (ln) {
      String(ln).split("・").forEach(function (x) { x = x.replace(/^\s+|\s+$/g, ""); if (x) parts.push(x); });
    });
    if (parts.length) {
      col.appendChild(rule());
      var ul = rv("ul", "items" + (parts.length > 6 ? " many" : ""));
      parts.forEach(function (x) { Neko.rich(ul.appendChild(el("li")), x); });
      col.appendChild(ul);
    }
    if (it.note) col.appendChild(Neko.rich(rv("p", "note"), it.note));
    a.appendChild(col);
    if (it.photoUrl) {
      var f = rv("figure", "dish"), im = el("img");
      im.src = it.photoUrl; im.alt = Neko.plain(it.name); im.loading = "lazy";
      f.appendChild(im); a.appendChild(f);
    }
    return a;
  }

  function gaze(p) {
    var f = el("figure", "gaze reveal"), m = el("div", "mat"), i = el("img");
    i.src = p.src; i.alt = p.alt; i.loading = "lazy"; m.appendChild(i); f.appendChild(m); return f;
  }

  function build() {
    var app = Neko.$("#app"), intro = shop.intro || {};
    var secs = Neko.sections(), n = 0;
    secs.forEach(function (s) { s.items.forEach(function (it) { it.num = ++n; }); });
    var photos = Neko.photos(), pi = 0, nav = [];

    if (intro.catch) Neko.$("#opening-sub").textContent = Neko.plain(intro.catch);

    /* 序 */
    if (intro.catch || intro.lead) {
      var s = sec("screen statement", "about", "店について"), b = inner(s);
      if (intro.label) b.appendChild(rv("p", "label", intro.label));
      if (intro.catch) b.appendChild(rv("p", "line-lg", intro.catch));
      b.appendChild(rule());
      if (intro.lead) b.appendChild(Neko.rich(rv("p", "body"), intro.lead));
      (intro.lines || []).forEach(function (t) { b.appendChild(Neko.rich(rv("p", "body"), t)); });
      if (intro.small) b.appendChild(Neko.rich(rv("p", "body soft"), intro.small));
      app.appendChild(s);
    }

    /* お知らせ */
    var news = Neko.news();
    if (news.length) {
      var ns = sec("screen info news", "news", "お知らせ"), nb = inner(ns);
      nb.appendChild(rv("p", "kicker", "News"));
      nb.appendChild(rv("h2", "part-title", "お知らせ"));
      nb.appendChild(rule());
      var nl = rv("ul", "rows");
      news.forEach(function (x) {
        var li = el("li");
        li.appendChild(el("time", "d", Neko.date(x.date)));
        var d = el("div"); d.appendChild(el("strong", "", x.title));
        if (x.body) d.appendChild(Neko.rich(el("span", "sub"), x.body));
        li.appendChild(d); nl.appendChild(li);
      });
      nb.appendChild(nl); app.appendChild(ns);
    }

    /* 思い・工夫 */
    [["omoi", "思い", "Thought"], ["kufu", "工夫", "Craft"]].forEach(function (k) {
      var d = shop[k[0]]; if (!d || !d.items || !d.items.length) return;
      var s = sec("screen part", k[0], d.title || k[1]), b = inner(s);
      b.appendChild(rv("p", "kicker", k[2]));
      b.appendChild(rv("h2", "part-title", d.title || k[1]));
      b.appendChild(rule());
      var ol = rv("ol", "tenets");
      d.items.forEach(function (t) {
        var li = el("li"); li.appendChild(el("h3", "", Neko.plain(t.title)));
        if (t.body) li.appendChild(Neko.rich(el("p"), t.body));
        ol.appendChild(li);
      });
      b.appendChild(ol); app.appendChild(s);
    });

    /* コース（章扉 + 一画面一コース） */
    secs.forEach(function (s, i) {
      app.appendChild(door(s, i)); nav.push([s.title, "#ch-" + s.id]);
      s.items.forEach(function (it) { app.appendChild(course(it)); });
      if (pi < photos.length) app.appendChild(gaze(photos[pi++]));
    });
    while (pi < photos.length) app.appendChild(gaze(photos[pi++]));

    /* アラカルト */
    var ala = Neko.alacarte();
    if (ala) {
      var as = sec("screen part ala", "alacarte", ala.title), ab = inner(as, true);
      ab.appendChild(rv("p", "kicker", "A la carte"));
      ab.appendChild(rv("h2", "part-title", ala.title));
      if (ala.subtitle) ab.appendChild(rv("p", "door-time", ala.subtitle));
      ab.appendChild(rule());
      if (ala.lead) ab.appendChild(Neko.rich(rv("p", "body"), ala.lead));
      var g = el("div", "ala-grid");
      ala.items.forEach(function (it) {
        var f = el("figure", "reveal"), m = el("div", "mat"), im = el("img");
        im.src = it.src; im.alt = it.alt; im.loading = "lazy"; m.appendChild(im); f.appendChild(m);
        if (it.name) f.appendChild(el("figcaption", "", it.name));
        g.appendChild(f);
      });
      ab.appendChild(g); app.appendChild(as); nav.push([ala.title, "#alacarte"]);
    }

    /* ご利用案内 */
    var H = Neko.hours(), rows = [];
    if (H.regular) rows.push(["定休", H.regular]);
    if (H.lunch) rows.push(["ランチ", H.lunch]);
    if (H.dinner) rows.push(["ディナー", H.dinner]);
    Neko.closures().forEach(function (c, i) { rows.push([i ? "" : "臨時休業", Neko.closureText(c)]); });
    var notes = shop.notes || [];
    if (rows.length || notes.length) {
      var is = sec("screen info", "info", "ご利用案内"), ib = inner(is);
      ib.appendChild(rv("p", "kicker", "Information"));
      ib.appendChild(rv("h2", "part-title", "ご利用案内"));
      ib.appendChild(rule());
      if (rows.length) {
        var dl = rv("dl", "hours");
        rows.forEach(function (r) { var w = el("div"); w.appendChild(el("dt", "", r[0])); w.appendChild(el("dd", "", r[1])); dl.appendChild(w); });
        ib.appendChild(dl);
      }
      if (notes.length) {
        var nu = rv("ul", "notes-list");
        notes.forEach(function (t) { Neko.rich(nu.appendChild(el("li")), t); });
        ib.appendChild(nu);
      }
      app.appendChild(is);
    }

    /* ご予約 */
    var r = shop.reserve || {};
    var rs = sec("screen reserve", "reserve", "ご予約"), rb = inner(rs);
    rb.appendChild(rv("p", "kicker", "Reservation"));
    rb.appendChild(rv("h2", "part-title", r.title || "ご予約について"));
    rb.appendChild(rule());
    if (r.lead) rb.appendChild(rv("p", "body", r.lead));
    if (r.items && r.items.length) {
      var ol2 = rv("ol", "res-list");
      r.items.forEach(function (t) { ol2.appendChild(el("li", "", t)); });
      rb.appendChild(ol2);
    }
    var cta = rv("a", "cta", r.button || "ご予約・お問い合わせ"); cta.href = Neko.reserveUrl();
    rb.appendChild(cta);
    if (r.thanks) rb.appendChild(rv("p", "thanks", r.thanks));
    var st = el("div", "steps"); st.setAttribute("aria-hidden", "true");
    for (var i = 1; i <= 4; i++) st.appendChild(paw("p" + i));
    rb.appendChild(st); app.appendChild(rs);

    /* ナビ */
    var bn = Neko.$("#bar-nav");
    nav.forEach(function (x) { var a = el("a", "", x[0]); a.href = x[1]; bn.appendChild(a); });

    /* フッター */
    var f = Neko.$("#foot");
    f.appendChild(el("p", "", "© 猫"));
    if (shop.draftNote) f.appendChild(el("p", "draft", "※ " + shop.draftNote));
  }

  Neko.ready(function () { build(); Neko.reveal(".reveal", "0px 0px -6% 0px"); });
})();
