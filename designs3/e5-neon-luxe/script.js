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

  /* ---- ネオン管の猫たち（自作・線画）。t=本体の管 / f=顔の管 / p=桃色の管 ---- */
  var CATS = {
    loaf: { vb: "0 0 160 100", // 香箱座り
      t: ["M28 90 C22 62 46 46 84 46 C122 46 142 64 138 90", "M26 60 L28 34 L42 44 Q52 41 62 44 L76 34 L78 60 Q78 80 52 82 Q26 80 26 60 Z", "M138 86 C154 86 158 72 150 64"],
      f: ["M38 62 Q43 66 48 62 M58 62 Q63 66 68 62"], p: ["M49 70 L57 70 L53 75 Z"], g: "M8 92 L152 92" },
    sleep: { vb: "0 0 160 100", // 丸くなって眠る
      t: ["M24 86 C14 52 52 30 94 34 C136 38 152 70 132 86 C108 94 50 94 24 86 Z", "M22 78 C18 58 34 48 48 54 C60 60 58 80 44 84 C32 86 24 84 22 78 Z", "M26 56 L24 42 L36 50 M44 52 L52 42 L56 58", "M56 88 C90 94 130 92 144 76"],
      f: ["M30 70 Q35 74 40 70", "M112 18 L124 18 L112 30 L124 30 M132 8 L140 8 L132 16 L140 16"], p: [], g: "M8 96 L152 96" },
    walk: { vb: "0 0 200 100", // しっぽを立てて歩く
      t: ["M58 54 C58 40 96 36 128 38 C150 40 156 52 150 62 C140 68 74 68 62 62 C58 60 58 56 58 54 Z", "M70 66 L68 90 M88 67 L90 90 M130 66 L128 90 M146 62 L152 88", "M46 44 L42 22 L56 30 Q64 28 72 32 L84 22 L86 44 Q84 60 64 60 Q44 58 46 44 Z", "M150 48 C176 44 180 20 168 10 C164 6 158 10 163 16"],
      f: ["M54 42 Q58 46 62 42 M70 42 Q74 46 78 42", "M46 50 L32 46 M46 54 L32 56"], p: ["M60 50 L68 50 L64 55 Z"], g: "M8 92 L192 92" },
    back: { vb: "0 0 130 130", // 後ろ姿
      t: ["M36 40 L40 12 L56 26 Q68 23 80 26 L96 12 L100 40 Q102 62 68 66 Q34 62 36 40 Z", "M48 64 C24 84 20 112 32 120 L104 120 C116 112 112 84 88 64", "M104 118 C128 116 132 92 116 82"],
      f: [], p: [], g: "M6 122 L114 122" },
    peek: { vb: "0 0 160 60", // のぞき見
      t: ["M30 58 L32 20 L50 34 Q80 28 110 34 L128 20 L130 58", "M56 58 Q56 50 64 50 Q72 50 72 58 M88 58 Q88 50 96 50 Q104 50 104 58"],
      f: ["M52 40 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0 M98 40 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0", "M44 46 L24 42 M44 50 L24 52 M116 46 L136 42 M116 50 L136 52"], p: ["M76 46 L84 46 L80 51 Z"], g: "M10 58 L150 58" },
    wave: { vb: "0 0 200 240", // 招き猫
      t: ["M58 62 L64 22 Q67 18 72 22 L92 40 Q104 37 116 40 L136 22 Q141 18 144 22 L150 62 Q156 96 124 106 Q100 112 78 106 Q52 96 58 62 Z", "M82 110 C46 150 36 196 46 220 C50 232 66 234 82 234 L130 234 C148 234 160 230 160 218 C158 190 150 148 120 110", "M134 160 C160 152 168 124 158 108 C153 100 144 104 146 114", "M158 222 C186 222 192 190 176 176"],
      f: ["M72 70 Q82 80 92 70 M110 70 Q120 80 130 70", "M102 94 L102 98 M102 98 Q96 103 90 100 M102 98 Q108 103 114 100", "M80 88 L50 82 M80 94 L48 98 M124 88 L154 82 M124 94 L156 98"], p: ["M96 86 L108 86 L102 94 Z"], g: "M20 236 L180 236" },
    fish: { vb: "0 0 90 40", // 魚
      t: ["M8 20 Q34 2 62 20 Q34 38 8 20 Z", "M62 20 L84 6 L79 20 L84 34 Z"], f: ["M20 17 a1.6 1.6 0 1 0 .1 0"], p: [], g: "" }
  };

  /* 猫のSVGを作る。cls = 大きさ・向きのクラス（c-loaf など / flip） */
  function cat(key, cls) {
    var c = CATS[key], NS = "http://www.w3.org/2000/svg";
    var wrap = reveal(el("span", "cat-wrap " + (cls || "")));
    wrap.setAttribute("aria-hidden", "true");
    var h = '<svg class="cat" viewBox="' + c.vb + '" focusable="false"><g class="tubes" fill="none" stroke-linecap="round" stroke-linejoin="round">';
    c.t.forEach(function (d) { h += '<path class="t" d="' + d + '"/>'; });
    if (c.g) h += '<path class="t t4" d="' + c.g + '"/>';
    h += '</g><g class="tubes face" fill="none" stroke-linecap="round" stroke-linejoin="round">';
    c.f.forEach(function (d) { h += '<path class="t" d="' + d + '"/>'; });
    c.p.forEach(function (d) { h += '<path class="t peach" d="' + d + '"/>'; });
    h += "</g></svg>";
    wrap.innerHTML = h;
    return wrap;
  }
  /* コースの間の「魚をくわえにゆく猫」 */
  function stroll() {
    var d = reveal(el("div", "interlude")); d.setAttribute("aria-hidden", "true");
    d.appendChild(cat("fish", "c-fish"));
    d.appendChild(cat("walk", "c-walk"));
    var tr = el("span", "trail");
    for (var i = 0; i < 3; i++) tr.appendChild(paw("tp" + i));
    d.appendChild(tr);
    return d;
  }
  function peek() { var d = el("div", "peek-div"); d.appendChild(cat("peek", "c-peek")); return d; }

  /* 章扉 */
  function door(id, kanji, title, time, catKey, catCls) {
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
    if (catKey) inner.appendChild(cat(catKey, "door-cat " + (catCls || ""))); else inner.appendChild(rule());
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

    var catchEl = Neko.$("#catch");
    if (intro.catch) catchEl.textContent = intro.catch; else catchEl.hidden = true;

    /* 店について */
    var st = el("section", "screen statement"); st.setAttribute("aria-label", "店について");
    var si = el("div", "inner narrow");
    if (intro.label) si.appendChild(reveal(el("p", "label", intro.label)));
    if (intro.lead) si.appendChild(para(intro.lead));
    (intro.lines || []).forEach(function (t) { si.appendChild(para(t)); });
    if (intro.small) si.appendChild(para(intro.small, "body soft"));
    si.appendChild(cat("sleep", "c-sleep stmt"));
    st.appendChild(si); root.appendChild(st);

    /* お知らせ */
    var news = Neko.news();
    if (news.length) {
      var n = door("news", "報", "お知らせ", "", "back", "c-back");
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
      var d = door(a[0], a[1], o.title || "", "", a[0] === "omoi" ? "loaf" : "walk", a[0] === "omoi" ? "c-loaf" : "c-walk flip");
      d.inner.appendChild(tenets(o.items));
      root.appendChild(d.sec);
    });

    /* コース */
    var courses = Neko.courses(), photos = Neko.photos(), pi = 0;
    Neko.sections().forEach(function (s, idx) {
      var DC = { lunch: ["sleep", "c-sleep"], dinner: ["back", "c-back flip"], special: ["wave", "c-wave"] }[s.id] || ["loaf", "c-loaf flip"];
      var d = door(s.id, DOOR[s.id] || "品", s.title, s.subtitle, DC[0], DC[1]);
      if (s.lead) d.inner.appendChild(para(s.lead));
      if (s.leadSmall) d.inner.appendChild(para(s.leadSmall, "small"));
      if (s.badge) {
        var b = reveal(el("p", "service"));
        b.appendChild(paw()); b.appendChild(document.createTextNode(" "));
        Neko.rich(b, s.badge);
        d.inner.appendChild(b);
      }
      root.appendChild(d.sec);
      courses.filter(function (c) { return c.sectionId === s.id; }).forEach(function (c, k) {
        if (k > 0) { if (c.num % 3 === 2) root.appendChild(peek()); else if (c.num % 3 === 0) root.appendChild(stroll()); }
        root.appendChild(course(c));
      });
      if (pi < photos.length && idx < 2) { root.appendChild(gaze(photos[pi], pi)); pi++; }
    });
    while (pi < photos.length) { root.appendChild(gaze(photos[pi], pi)); pi++; }

    /* アラカルト */
    var ala = Neko.alacarte();
    if (ala) {
      var ad = door("alacarte", "品", ala.title, ala.subtitle, "peek", "c-peek");
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
      var iD = door("info", "案", "ご利用案内", "", "loaf", "c-loaf flip");
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
    var rd = door("reserve", "約", R.title || "ご予約", "", "wave", "c-wave big");
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
    f.appendChild(cat("loaf", "c-loaf foot-cat"));
    f.appendChild(el("p", "", "© 猫"));
    if (shop.draftNote) f.appendChild(el("p", "draft", "※ " + shop.draftNote));

    Neko.reveal(".reveal");
  }

  Neko.ready(build);
})();
