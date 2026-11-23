/* 猫 — デザイン案 共通ヘルパー（見た目は含みません）
   menu-data.js の SITE_DATA を読み、各デザインが使いやすい形に整えます。
   管理画面(admin/)で更新される内容は、必ずこのヘルパー経由で表示してください。

   使い方（各デザインの index.html）:
     <html lang="ja" data-root="../../">          ← menu-data.js と images/ があるフォルダへの相対パス
     <script src="../../menu-data.js"></script>
     <script src="../shared/neko.js"></script>
     <script src="script.js"></script>
   本番でルート直下に置くときは data-root="" にして、src を menu-data.js / shared/neko.js に直すだけ。
*/
(function () {
  "use strict";
  var D = (typeof SITE_DATA !== "undefined") ? SITE_DATA : { photos: [], sections: [], shop: {} };
  var SHOP = D.shop || {};
  var ROOT = document.documentElement.getAttribute("data-root") || "";

  var N = window.Neko = {};
  N.data = D;
  N.shop = SHOP;

  /* ---- DOM ---- */
  N.el = function (tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null && text !== "") e.textContent = text;
    return e;
  };
  N.$ = function (s, r) { return (r || document).querySelector(s); };
  N.$$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* **太字** だけを安全に反映（HTMLは使えない）。tag を変えると strong 以外にもできる */
  N.rich = function (parent, text, tag) {
    String(text == null ? "" : text).split("**").forEach(function (part, i) {
      if (!part) return;
      if (i % 2) parent.appendChild(N.el(tag || "strong", "", part));
      else parent.appendChild(document.createTextNode(part));
    });
    return parent;
  };
  /* 太字記号を取り除いた素の文字列 */
  N.plain = function (text) { return String(text == null ? "" : text).replace(/\*\*/g, ""); };

  /* 絵文字を除去（データに絵文字が入っていても、デザイン上は出さない） */
  N.noEmoji = function (text) {
    return String(text == null ? "" : text)
      .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, "")
      .replace(/^\s+|\s+$/g, "").replace(/\s{2,}/g, " ");
  };

  /* 画像のパス（admin が保存する data: / http はそのまま、images/... は data-root を前置） */
  N.url = function (p) { return /^(data:|https?:|\/)/.test(p || "") ? p : ROOT + (p || ""); };

  /* ---- 値の整形 ---- */
  N.yen = function (p) {
    if (p === "" || p == null) return null;
    var n = Number(String(p).replace(/[,，円]/g, ""));
    return isNaN(n) ? String(p) : n.toLocaleString("ja-JP");
  };
  var KAN = ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
  N.kanji = function (n) {
    if (n <= 10) return KAN[n];
    if (n < 20) return "十" + KAN[n - 10];
    return String(n);
  };
  N.todayISO = function () {           // 日本時間の今日 YYYY-MM-DD
    var d = new Date(Date.now() + 9 * 3600 * 1000);
    return d.toISOString().slice(0, 10);
  };
  /* 2026-11-05 → 2026.11.05 / 2026年11月5日 / 11.05 */
  N.date = function (iso, style) {
    var m = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(iso || "");
    if (!m) return iso || "";
    var y = m[1], mo = +m[2], d = +m[3], p = function (x) { return (x < 10 ? "0" : "") + x; };
    if (style === "ja") return y + "年" + mo + "月" + d + "日";
    if (style === "short") return p(mo) + "." + p(d);
    return y + "." + p(mo) + "." + p(d);
  };

  /* ---- データ取り出し ---- */
  N.visible = function (arr) { return (arr || []).filter(function (x) { return x && x.visible !== false; }); };

  N.news = function (max) {
    var list = N.visible(SHOP.news).slice().sort(function (a, b) { return a.date < b.date ? 1 : -1; });
    return max ? list.slice(0, max) : list;
  };

  /* 臨時休業：終わった分は出さない */
  N.closures = function () {
    var t = N.todayISO();
    return ((SHOP.hours || {}).closures || []).filter(function (c) { return (c.to || c.from) >= t; });
  };
  /* 「2026年12月31日〜2027年1月3日（年末年始）」 */
  N.closureText = function (c) {
    var s = N.date(c.from, "ja");
    if (c.to && c.to !== c.from) s += "〜" + N.date(c.to, "ja");
    if (c.reason) s += "（" + c.reason + "）";
    return s;
  };
  N.hours = function () { return SHOP.hours || {}; };

  /* 表示するセクション（visible な料理だけ。1品もなければセクションごと除外） */
  N.sections = function () {
    return (D.sections || []).map(function (s) {
      var c = {};
      for (var k in s) c[k] = s[k];
      c.icon = "";                                  // 絵文字アイコンは使わない
      c.badge = N.noEmoji(s.badge);
      c.items = N.visible(s.items).map(function (it) {
        var o = {};
        for (var k2 in it) o[k2] = it[k2];
        o.ribbon = N.noEmoji(it.ribbon);
        o.lines = Array.isArray(it.lines) ? it.lines : (it.lines ? [it.lines] : []);
        o.priceText = N.yen(it.price);
        o.photoUrl = it.photo ? N.url(it.photo) : "";
        return o;
      });
      return c;
    }).filter(function (s) { return s.items.length; });
  };
  N.section = function (id) {
    return N.sections().filter(function (s) { return s.id === id; })[0] || null;
  };
  /* 全コースを通し番号つきで（1〜）。num / kanji が付く */
  N.courses = function () {
    var n = 0, out = [];
    N.sections().forEach(function (s) {
      s.items.forEach(function (it) { n++; it.num = n; it.kanji = N.kanji(n); it.sectionId = s.id; it.sectionTitle = s.title; out.push(it); });
    });
    return out;
  };
  N.alacarte = function () {
    var a = D.alacarte;
    if (!a) return null;
    var items = N.visible(a.items).map(function (it) {
      return { src: N.url(it.src), alt: it.alt || "", name: it.name || "" };
    });
    if (!items.length) return null;
    return { title: a.title || "アラカルト", subtitle: a.subtitle || "", lead: a.lead || "", items: items };
  };
  N.photos = function () {
    return N.visible(D.photos).map(function (p) { return { src: N.url(p.src), alt: p.alt || "" }; });
  };
  N.reserveUrl = function () { return (SHOP.reserve || {}).url || "#"; };

  /* ---- 演出の共通部品 ---- */
  /* .reveal 要素を、画面に入ったら .in にする。動きを減らす設定なら即表示 */
  N.reveal = function (selector, rootMargin) {
    var els = N.$$(selector || ".reveal");
    var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (calm || !("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { rootMargin: rootMargin || "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach(function (e) { io.observe(e); });
  };
  N.ready = function (fn) {
    document.documentElement.classList.add("js");
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn();
  };
})();
