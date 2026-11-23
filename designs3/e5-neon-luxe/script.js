(function () {
  "use strict";
  var el = Neko.el, shop = Neko.shop;

  var DOOR = { lunch: "昼", dinner: "夜", special: "特" };

  function paw(cls) {
    var s = el("span", "pawwrap " + (cls || ""));
    s.setAttribute("aria-hidden", "true");
    s.innerHTML = '<svg class="paw" aria-hidden="true"><use href="#paw"/></svg>';
    return s;
  }
  function reveal(node) { node.classList.add("reveal"); return node; }
  function rule() { return reveal(el("hr", "rule")); }

  /* 章扉 */
  function door(id, kanji, title, time) {
    var d = el("section", "screen part");
    if (id) d.id = id;
    var h = el("h2", "part-title reveal", title);
    h.id = "h-" + (id || kanji);
    d.setAttribute("aria-labelledby", h.id);
    var inner = el("div", "inner narrow");
    var k = el("p", "part-kanji reveal"); k.setAttribute("aria-hidden", "true");
    k.appendChild(el("span", "neon-k", kanji));
    inner.appendChild(k); inner.appendChild(h);
    if (time) inner.appendChild(reveal(el("p", "time", time)));
    inner.appendChild(rule());
    d.appendChild(inner);
    return { sec: d, inner: inner };
  }

  function para(text, cls) {
    var p = reveal(el("p", cls || "body"));
    Neko.rich(p, text);
    return p;
  }

  function tenets(list) {
    var ol = reveal(el("ol", "tenets"));
    (list || []).forEach(function (t) {
      var li = el("li");
      li.appendChild(el("h3", "", t.title));
      if (t.body) li.appendChild(el("p", "", t.body));
      ol.appendChild(li);
    });
    return ol;
  }

  function course(c) {
    var a = el("article", "course");
    var hid = "c" + c.num;
    a.setAttribute("aria-labelledby", hid);
    var num = el("p", "num", c.kanji); num.setAttribute("aria-hidden", "true");
    a.appendChild(num);
    var col = el("div", "body-col");
    var lab = [c.sectionTitle, c.ribbon, c.tag].filter(Boolean).join(" ・ ");
    col.appendChild(reveal(el("p", "label", lab)));
    var h = reveal(el("h3", "name", c.name)); h.id = hid;
    if (c.nameNote) h.appendChild(el("small", "", c.nameNote));
    col.appendChild(h);
    if (c.priceText) {
      var p = reveal(el("p", "price"));
      p.appendChild(el("span", "", c.priceText)); p.appendChild(document.createTextNode("円"));
      col.appendChild(p);
    }
    if (c.note) col.appendChild(reveal(el("p", "small", c.note)));
    if (c.photoUrl) {
      var f = reveal(el("figure", "dish-photo"));
      var im = el("img"); im.src = c.photoUrl; im.alt = c.name; im.loading = "lazy";
      f.appendChild(im); col.appendChild(f);
    }
    var items = [];
    c.lines.forEach(function (ln) {
      String(ln).split("・").forEach(function (x) { x = x.trim(); if (x) items.push(x); });
    });
    if (items.length) {
      var ul = reveal(el("ul", "items" + (items.length > 4 ? " many" : "")));
      items.forEach(function (x) { var li = el("li"); Neko.rich(li, x); ul.appendChild(li); });
      col.appendChild(ul);
    }
    a.appendChild(col);
    return a;
  }

  function gaze(ph, i) {
    var f = reveal(el("figure", "gaze g" + (i % 2)));
    var im = el("img"); im.src = ph.src; im.alt = ph.alt; im.loading = "lazy";
    f.appendChild(im);
    return f;
  }

  function build() {
    var root = Neko.$("#root");
    var intro = shop.intro || {};

    var cat = Neko.$("#catch");
    if (intro.catch) cat.textContent = intro.catch; else cat.hidden = true;

    /* 店について */
    var st = el("section", "screen statement"); st.setAttribute("aria-label", "店について");
    var si = el("div", "inner narrow");
    if (intro.label) si.appendChild(reveal(el("p", "label", intro.label)));
    if (intro.lead) si.appendChild(para(intro.lead));
    (intro.lines || []).forEach(function (t) { si.appendChild(para(t)); });
    if (intro.small) si.appendChild(para(intro.small, "body soft"));
    st.appendChild(si); root.appendChild(st);

    /* お知らせ */
    var news = Neko.news();
    if (news.length) {
      var n = door("news", "報", "お知らせ");
      var ul = reveal(el("ul", "info-list news-list"));
      news.forEach(function (x) {
        var li = el("li");
        li.appendChild(el("span", "nw-date", Neko.date(x.date)));
        li.appendChild(el("strong", "", x.title));
        if (x.body) li.appendChild(el("span", "nw-body", x.body));
        ul.appendChild(li);
      });
      n.inner.appendChild(ul); root.appendChild(n.sec);
    }

    /* 思い・工夫 */
    [["omoi", "想", shop.omoi], ["kufu", "工", shop.kufu]].forEach(function (a) {
      var o = a[2];
      if (!o || !(o.items || []).length) return;
      var d = door(a[0], a[1], o.title || "");
      d.inner.appendChild(tenets(o.items));
      root.appendChild(d.sec);
    });

    /* コース */
    var courses = Neko.courses(), photos = Neko.photos(), pi = 0;
    Neko.sections().forEach(function (s, idx) {
      var d = door(s.id, DOOR[s.id] || "品", s.title, s.subtitle);
      if (s.lead) d.inner.appendChild(para(s.lead));
      if (s.leadSmall) d.inner.appendChild(para(s.leadSmall, "small"));
      if (s.badge) {
        var b = reveal(el("p", "service"));
        b.appendChild(paw()); b.appendChild(document.createTextNode(" "));
        Neko.rich(b, s.badge);
        d.inner.appendChild(b);
      }
      root.appendChild(d.sec);
      courses.filter(function (c) { return c.sectionId === s.id; }).forEach(function (c) { root.appendChild(course(c)); });
      if (pi < photos.length && idx < 2) { root.appendChild(gaze(photos[pi], pi)); pi++; }
    });
    while (pi < photos.length) { root.appendChild(gaze(photos[pi], pi)); pi++; }

    /* アラカルト */
    var ala = Neko.alacarte();
    if (ala) {
      var ad = door("alacarte", "品", ala.title, ala.subtitle);
      if (ala.lead) ad.inner.appendChild(para(ala.lead));
      root.appendChild(ad.sec);
      var g = el("div", "ala-gallery");
      ala.items.forEach(function (it) {
        var f = reveal(el("figure"));
        var im = el("img"); im.src = it.src; im.alt = it.alt; im.loading = "lazy";
        f.appendChild(im);
        if (it.name) f.appendChild(el("figcaption", "", it.name));
        g.appendChild(f);
      });
      root.appendChild(g);
    }

    /* ご利用案内 */
    var H = Neko.hours(), cl = Neko.closures(), rows = [];
    if (H.regular) rows.push(["定休", H.regular]);
    if (H.lunch) rows.push(["ランチ", H.lunch]);
    if (H.dinner) rows.push(["ディナー", H.dinner]);
    cl.forEach(function (c) { rows.push(["臨時休業", Neko.closureText(c)]); });
    var notes = shop.notes || [];
    if (rows.length || notes.length) {
      var iD = door("info", "案", "ご利用案内");
      if (rows.length) {
        var dl = reveal(el("dl", "hours"));
        rows.forEach(function (r) {
          var w = el("div", r[0] === "臨時休業" ? "closure" : "");
          w.appendChild(el("dt", "", r[0])); w.appendChild(el("dd", "", r[1]));
          dl.appendChild(w);
        });
        iD.inner.appendChild(dl);
      }
      if (notes.length) {
        var nl = reveal(el("ul", "info-list notes"));
        notes.forEach(function (t) { var li = el("li"); Neko.rich(li, t); nl.appendChild(li); });
        iD.inner.appendChild(nl);
      }
      root.appendChild(iD.sec);
    }

    /* ご予約 */
    var R = shop.reserve || {};
    var rd = door("reserve", "約", R.title || "ご予約");
    rd.sec.classList.add("reserve");
    if (R.lead) rd.inner.appendChild(para(R.lead));
    if ((R.items || []).length) {
      var ol = reveal(el("ol", "res-list"));
      R.items.forEach(function (t) { ol.appendChild(el("li", "", t)); });
      rd.inner.appendChild(ol);
    }
    var cta = reveal(el("a", "cta", R.button || "ご予約"));
    cta.href = Neko.reserveUrl(); cta.target = "_blank"; cta.rel = "noopener";
    rd.inner.appendChild(cta);
    if (R.thanks) rd.inner.appendChild(reveal(el("p", "thanks", R.thanks)));
    var steps = reveal(el("div", "steps")); steps.setAttribute("aria-hidden", "true");
    for (var i = 1; i <= 4; i++) steps.appendChild(paw("p" + i));
    rd.inner.appendChild(steps);
    root.appendChild(rd.sec);

    /* フッター */
    var f = Neko.$("#foot");
    f.appendChild(el("p", "", "© 猫"));
    if (shop.draftNote) f.appendChild(el("p", "draft", "※ " + shop.draftNote));

    Neko.reveal(".reveal");
  }

  Neko.ready(build);
})();
