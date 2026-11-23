(function () {
  "use strict";
  var N = window.Neko, S = N.shop, el = N.el;
  var SVGNS = "http://www.w3.org/2000/svg";

  function use(id, cls) {
    var s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("aria-hidden", "true");
    if (cls) s.setAttribute("class", cls);
    var u = document.createElementNS(SVGNS, "use");
    u.setAttribute("href", "#" + id);
    s.appendChild(u);
    return s;
  }
  function rev(e) { e.classList.add("reveal"); return e; }
  function add(p, c) { p.appendChild(c); return c; }

  /* 写真プール（料理写真。無ければ写真なしで成立させる） */
  var ala = N.alacarte();
  var pool = ala ? ala.items.slice() : [];
  var cats = N.photos();
  var pi = 0;
  function nextPhoto() {
    if (pool.length) { var p = pool[pi % pool.length]; pi++; return p; }
    return null;
  }

  /* 額装：真鍮の二重枠＋階段状の角 */
  function framed(p, cls) {
    var f = el("figure", "frame " + (cls || ""));
    var inner = add(f, el("div", "frame-in"));
    var img = add(inner, el("img"));
    img.src = p.src; img.alt = p.alt || ""; img.loading = "lazy";
    img.addEventListener("error", function () { f.style.display = "none"; });
    add(f, use("step", "corner c1")); add(f, use("step", "corner c2"));
    add(f, use("step", "corner c3")); add(f, use("step", "corner c4"));
    return f;
  }

  /* 写真帯：全幅の写真に章タイトルを重ねる */
  function band(no, title, sub, p, id) {
    var b = el("section", "band" + (p ? "" : " nophoto"));
    if (id) b.id = id;
    if (p) {
      var img = add(b, el("img", "band-img"));
      img.src = p.src; img.alt = ""; img.loading = "lazy";
      img.addEventListener("error", function () { b.classList.add("nophoto"); img.remove(); });
    }
    add(b, use("fan", "band-fan"));
    var plate = add(b, el("div", "plate"));
    add(plate, el("p", "chap", "第" + no + "章"));
    add(plate, el("h2", "band-title", title));
    if (sub) add(plate, el("p", "band-sub", sub));
    rev(plate);
    return b;
  }

  function heading(parent, no, title, sub) {
    var w = rev(add(parent, el("div", "head")));
    if (no) add(w, el("p", "chap", "第" + no + "章"));
    add(w, el("h2", "h2", title));
    if (sub) add(w, el("p", "sub", sub));
    add(w, use("divider", "divider"));
    return w;
  }

  var main = N.$("main");
  var chapter = 0, navItems = [];
  function nextChap() { chapter++; return N.kanji(chapter); }
  function reg(label, id) { navItems.push([label, id]); }

  N.ready(function () {
    /* ---------- 序 ---------- */
    var op = add(main, el("section", "opening"));
    add(op, use("fan", "op-fan"));
    var opText = add(op, el("div", "op-text"));
    add(opText, el("p", "eyebrow", "完全予約制 ・ ご紹介のみ"));
    add(opText, el("h1", "mega", "猫"));
    if (S.intro && S.intro.catch) add(opText, el("p", "catch", S.intro.catch));
    add(opText, use("divider", "divider"));
    var opArt = add(op, el("div", "op-art"));
    var first = nextPhoto() || cats[0] || null;
    if (first) add(opArt, framed(first, "tall"));
    opArt.appendChild(catSvg());

    /* ---------- 店について ---------- */
    if (S.intro && (S.intro.label || S.intro.lead || (S.intro.lines || []).length || S.intro.small)) {
      var st = add(main, el("section", "statement"));
      var si = add(st, el("div", "narrow"));
      if (S.intro.label) rev(add(si, el("p", "label", S.intro.label)));
      if (S.intro.lead) N.rich(rev(add(si, el("p", "body lead"))), S.intro.lead);
      (S.intro.lines || []).forEach(function (l) { N.rich(rev(add(si, el("p", "body"))), l); });
      if (S.intro.small) rev(add(si, el("p", "body soft", S.intro.small)));
    }

    /* ---------- お知らせ（0件なら出さない） ---------- */
    var news = N.news();
    if (news.length) {
      var ns = add(main, el("section", "block"));
      ns.id = "news";
      var ni = add(ns, el("div", "narrow"));
      heading(ni, "", "お知らせ", "");
      var ul = rev(add(ni, el("ul", "news")));
      news.forEach(function (n) {
        var li = add(ul, el("li"));
        add(li, el("span", "nw-date", N.date(n.date)));
        add(li, el("strong", "", n.title));
        if (n.body) add(li, el("span", "nw-body", n.body));
      });
      reg("お知らせ", "news");
    }

    /* ---------- 思い・工夫 ---------- */
    [S.omoi, S.kufu].forEach(function (blk, i) {
      if (!blk || !(blk.items || []).length) return;
      var id = i ? "kufu" : "omoi";
      var title = blk.title || (i ? "工夫" : "思い");
      var sec = add(main, el("section", "block tenets-block"));
      sec.id = id;
      var wrap = add(sec, el("div", "wide"));
      heading(wrap, nextChap(), title, "");
      var ol = rev(add(wrap, el("ol", "tenets")));
      blk.items.forEach(function (t, k) {
        var li = add(ol, el("li"));
        add(li, el("span", "tn", N.kanji(k + 1)));
        add(li, el("h3", "", t.title));
        if (t.body) add(li, el("p", "", t.body));
      });
      reg(title, id);
    });

    /* ---------- メニュー章 ---------- */
    var num = 0, flip = false;
    N.sections().forEach(function (sec) {
      main.appendChild(band(nextChap(), sec.title, sec.subtitle, nextPhoto(), sec.id));
      reg(sec.title, sec.id);

      var blk = add(main, el("section", "menu"));
      var wrap = add(blk, el("div", "split" + (flip ? " flip" : "")));
      flip = !flip;
      var sp = nextPhoto();
      if (sp) {
        var side = add(wrap, el("div", "side"));
        add(side, rev(framed(sp)));
      } else { wrap.classList.add("solo"); }
      var col = add(wrap, el("div", "col"));
      if (sec.badge) N.rich(rev(add(col, el("p", "badge"))), sec.badge);
      if (sec.lead) rev(add(col, el("p", "body", sec.lead)));
      if (sec.leadSmall) rev(add(col, el("p", "small", sec.leadSmall)));
      var list = add(col, el("div", "courses"));
      sec.items.forEach(function (it) {
        num++;
        var a = rev(add(list, el("article", "course" + (it.photoUrl ? " has-photo" : ""))));
        if (it.photoUrl) add(a, framed({ src: it.photoUrl, alt: it.name }, "mini"));
        var meta = add(a, el("div", "meta"));
        var top = add(meta, el("p", "cn"));
        add(top, el("span", "cnum", N.kanji(num)));
        if (it.tag) add(top, el("span", "tag", it.tag));
        if (it.ribbon) add(top, el("span", "ribbon", it.ribbon));
        var nm = add(meta, el("h3", "name", it.name));
        if (it.nameNote) add(nm, el("small", "", it.nameNote));
        if (it.priceText) {
          var pr = add(meta, el("p", "price"));
          add(pr, el("span", "", it.priceText));
          pr.appendChild(document.createTextNode("円"));
        }
        if (it.note) add(meta, el("p", "small", it.note));
        if (it.lines.length) {
          var ul2 = add(a, el("ul", "items" + (it.lines.length === 1 ? " one" : "")));
          it.lines.forEach(function (l) { N.rich(add(ul2, el("li")), l); });
        }
      });
    });

    /* ---------- アラカルト：横レール（手動スクロール） ---------- */
    if (ala) {
      var as = add(main, el("section", "rail-sec"));
      as.id = "alacarte";
      var ah = add(as, el("div", "narrow"));
      heading(ah, nextChap(), ala.title, ala.subtitle);
      if (ala.lead) rev(add(ah, el("p", "body", ala.lead)));
      var rail = add(as, el("div", "rail"));
      rail.tabIndex = 0;
      rail.setAttribute("role", "region");
      rail.setAttribute("aria-label", ala.title + "の写真（横にスクロール）");
      ala.items.forEach(function (p) {
        var f = add(rail, el("figure", "slide"));
        add(f, framed(p));
        if (p.name) add(f, el("figcaption", "", p.name));
      });
      var ctl = add(as, el("div", "rail-ctl"));
      var prev = add(ctl, el("button", "rbtn", "‹"));
      prev.type = "button"; prev.setAttribute("aria-label", "前の写真");
      var nxt = add(ctl, el("button", "rbtn", "›"));
      nxt.type = "button"; nxt.setAttribute("aria-label", "次の写真");
      var step = function (d) {
        var s = N.$(".slide", rail);
        var w = s ? s.getBoundingClientRect().width + 20 : 300;
        var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
        rail.scrollBy({ left: d * w, behavior: calm ? "auto" : "smooth" });
      };
      prev.addEventListener("click", function () { step(-1); });
      nxt.addEventListener("click", function () { step(1); });
      rail.addEventListener("keydown", function (e) {
        if (e.key === "ArrowRight") { step(1); e.preventDefault(); }
        if (e.key === "ArrowLeft") { step(-1); e.preventDefault(); }
      });
      reg(ala.title, "alacarte");
    }

    /* ---------- ご利用案内 ---------- */
    var H = N.hours(), info = [];
    if (H.regular) info.push(["定休", H.regular]);
    if (H.lunch) info.push(["ランチ", H.lunch]);
    if (H.dinner) info.push(["ディナー", H.dinner]);
    var cl = N.closures();
    var notes = S.notes || [];
    if (info.length || cl.length || notes.length) {
      var is = add(main, el("section", "block info"));
      is.id = "info";
      var ii = add(is, el("div", "narrow"));
      heading(ii, nextChap(), "ご利用案内", "");
      if (info.length) {
        var dl = rev(add(ii, el("dl", "hours")));
        info.forEach(function (r) { add(dl, el("dt", "", r[0])); add(dl, el("dd", "", r[1])); });
      }
      if (cl.length) {
        var cb = rev(add(ii, el("div", "closures")));
        add(cb, el("p", "label", "臨時休業"));
        var cu = add(cb, el("ul"));
        cl.forEach(function (c) { add(cu, el("li", "", N.closureText(c))); });
      }
      if (notes.length) {
        var nu = rev(add(ii, el("ul", "notes")));
        notes.forEach(function (t) { N.rich(add(nu, el("li")), t); });
      }
      reg("ご案内", "info");
    }

    /* ---------- ご予約 ---------- */
    var R = S.reserve || {};
    var rs = add(main, el("section", "block reserve"));
    rs.id = "reserve";
    var ri = add(rs, el("div", "narrow"));
    heading(ri, nextChap(), R.title || "ご予約", "");
    if (R.lead) rev(add(ri, el("p", "body", R.lead)));
    if ((R.items || []).length) {
      var rl = rev(add(ri, el("ol", "res-list")));
      R.items.forEach(function (t) { add(rl, el("li", "", t)); });
    }
    var cta = rev(add(ri, el("a", "cta", R.button || "ご予約")));
    cta.href = N.reserveUrl();
    cta.rel = "noopener";
    if (R.thanks) rev(add(ri, el("p", "thanks", R.thanks)));
    var steps = add(ri, el("div", "steps"));
    steps.setAttribute("aria-hidden", "true");
    for (var k = 1; k <= 4; k++) add(steps, use("paw", "paw p" + k));

    /* ---------- ナビ・フッター ---------- */
    var nav = N.$("#nav");
    navItems.slice(0, 8).forEach(function (n) {
      var a = add(nav, el("a", "", n[0]));
      a.href = "#" + n[1];
    });
    N.$("#draft").textContent = S.draftNote ? "※ " + S.draftNote : "";

    N.reveal(".reveal");
  });

  /* 真鍮の置物の猫（線画・階段状の台座つき） */
  function catSvg() {
    var s = document.createElementNS(SVGNS, "svg");
    s.setAttribute("viewBox", "0 0 240 290");
    s.setAttribute("class", "figurine");
    s.setAttribute("role", "img");
    s.setAttribute("aria-label", "真鍮の線で描かれた、座る猫の置物");
    s.innerHTML =
      '<g fill="none" stroke="#c9a35a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M84 74 L90 30 L116 52 Q120 51 124 52 L150 30 L156 74 Q164 100 120 108 Q76 100 84 74 Z"/>' +
      '<path d="M96 112 C70 150 62 200 70 238 L170 238 C178 200 170 150 144 112"/>' +
      '<path d="M170 232 C214 232 220 184 196 170 C182 162 168 172 178 188"/>' +
      '<path d="M100 76 Q107 82 114 76 M126 76 Q133 82 140 76"/>' +
      '<path d="M116 88 L124 88 L120 93 Z M120 93 V97 M120 97 Q114 101 110 98 M120 97 Q126 101 130 98"/>' +
      '<path d="M96 88 L66 82 M96 94 L64 98 M144 88 L174 82 M144 94 L176 98"/>' +
      '<path d="M104 238 V196 M136 238 V196"/>' +
      '<path d="M50 238 H190 V250 H40 Z M34 250 H206 V262 H28 Z M22 262 H218 V274 H16 Z"/>' +
      '</g>';
    return s;
  }
})();
