/* お店の更新ページ（デモ版）
   ・GitHubにはつながりません。変更はこのブラウザの中だけに保存されます。
   ・本番では「まとめて保存」でGitHubに書き込みます。 */
(function () {
  "use strict";

  var KEY = "shop-admin-demo-v3";
  var $ = function (s) { return document.querySelector(s); };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function yen(p) {
    if (p === "" || p == null) return "";
    var n = Number(p);
    return isNaN(n) ? esc(p) : "¥" + n.toLocaleString("ja-JP");
  }
  function src(s) { return /^(data:|https?:)/.test(s) ? s : "../" + s; }
  function today() { return new Date().toISOString().slice(0, 10); }
  function uid() { return "x" + Math.random().toString(36).slice(2, 8); }

  /* ---------- 状態 ---------- */
  function seed() {
    // menu-data.js は const で定義されているため window.SITE_DATA ではなく直接参照する
    var src0 = (typeof SITE_DATA !== "undefined") ? SITE_DATA : { photos: [], sections: [] };
    var d = JSON.parse(JSON.stringify(src0));
    d.sections.forEach(function (s) { s.items.forEach(function (it) { it.visible = true; it.photo = it.photo || ""; it._id = uid(); }); });
    d.photos.forEach(function (p) { p._id = uid(); });
    var shop = (src0.shop || {});
    d.news = (shop.news || []).map(function (n) { return { _id: uid(), date: n.date, title: n.title, body: n.body, visible: n.visible !== false }; });
    var h = shop.hours || {};
    d.hours = {
      lunch: h.lunch || "", dinner: h.dinner || "", regular: h.regular || "",
      closures: (h.closures || []).map(function (c) { return { _id: uid(), from: c.from, to: c.to, reason: c.reason || "" }; })
    };
    d.alacarte = d.alacarte || { title: "アラカルト", subtitle: "季節ごとに変わります", lead: "", items: [] };
    d.alacarte.items.forEach(function (a) { a._id = uid(); if (a.visible === undefined) a.visible = true; });
    return d;
  }
  var S;
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
  if (!S) S = seed();
  var dirty = false, tab = "menu";

  function touch() { dirty = true; $("#savebar").hidden = false; }
  function save() {
    localStorage.setItem(KEY, JSON.stringify(S));
    dirty = false; $("#savebar").hidden = true;
    toast("保存しました（デモ：本番ではここでGitHubに保存されます）");
  }
  function toast(msg) {
    var t = $("#toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ---------- 写真選択（縮小＋位置情報の除去） ---------- */
  function pickImage(cb) {
    var f = $("#file"); f.value = "";
    f.onchange = function () {
      var file = f.files[0]; if (!file) return;
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        var max = 900, r = Math.min(1, max / Math.max(img.width, img.height));
        var c = document.createElement("canvas");
        c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        cb(c.toDataURL("image/jpeg", 0.8)); // 再描画するので撮影場所などの情報は残らない
      };
      img.src = url;
    };
    f.click();
  }

  /* ---------- 並べ替え ---------- */
  function move(arr, i, d) {
    var j = i + d; if (j < 0 || j >= arr.length) return;
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  function mvBtns(kind, i, n, extra) {
    return '<div class="mv">' +
      '<button data-act="up" data-k="' + kind + '" data-i="' + i + '" ' + (extra || "") + (i === 0 ? " disabled" : "") + '>▲</button>' +
      '<button data-act="down" data-k="' + kind + '" data-i="' + i + '" ' + (extra || "") + (i === n - 1 ? " disabled" : "") + '>▼</button></div>';
  }
  function sw(act, attrs, on) {
    return '<label class="sw"><input type="checkbox" data-act="' + act + '" ' + attrs + (on ? " checked" : "") + '><span></span></label>';
  }


  /* 本番で GitHub に書き込む menu-data.js の中身を組み立てる（内部用の _id は除く） */
  function buildDataJs() {
    var out = JSON.parse(JSON.stringify(S));
    (function strip(o) {
      if (Array.isArray(o)) o.forEach(strip);
      else if (o && typeof o === "object") { delete o._id; Object.keys(o).forEach(function (k) { strip(o[k]); }); }
    })(out);
    // 管理画面で編集しない項目（紹介文など）は元の menu-data.js のものを引き継ぐ
    var base = (typeof SITE_DATA !== "undefined") ? JSON.parse(JSON.stringify(SITE_DATA)) : { shop: {} };
    var shop = base.shop || {};
    shop.news = out.news.map(function (n) { return { date: n.date, title: n.title, body: n.body, visible: n.visible }; });
    shop.hours = { regular: out.hours.regular, lunch: out.hours.lunch, dinner: out.hours.dinner, closures: out.hours.closures };
    var data = { photos: out.photos, shop: shop, alacarte: out.alacarte, sections: out.sections };
    return "const SITE_DATA = " + JSON.stringify(data, null, 2) + ";\n";
  }

  /* ---------- 画面 ---------- */
  function render() {
    document.querySelectorAll(".tabs button").forEach(function (b) { b.classList.toggle("on", b.dataset.tab === tab); });
    var h = "";
    if (tab === "menu") h = vMenu();
    if (tab === "photos") h = vPhotos();
    if (tab === "dishes") h = vDishes();
    if (tab === "news") h = vNews();
    if (tab === "hours") h = vHours();
    $("#view").innerHTML = h;
    window.scrollTo(0, 0);
  }
  function keepScroll() { var y = window.scrollY; render(); window.scrollTo(0, y); }

  function vMenu() {
    var h = '<p class="lead">料理をタップして編集。スイッチで表示・非表示、▲▼で並べ替えができます。</p>';
    S.sections.forEach(function (sec, si) {
      h += '<h2 class="sec"><span>' + esc(sec.icon) + " " + esc(sec.title) + '</span>' +
        '<button class="btn small primary" data-act="item-add" data-s="' + si + '">＋ 追加</button></h2>';
      if (!sec.items.length) h += '<div class="empty">まだ料理がありません</div>';
      sec.items.forEach(function (it, ii) {
        h += '<div class="card' + (it.visible ? "" : " off") + '">' +
          (it.photo ? '<img class="thumb" src="' + esc(src(it.photo)) + '" alt="">' : '<div class="thumb">🍽</div>') +
          '<div class="main" data-act="item-edit" data-s="' + si + '" data-i="' + ii + '" style="cursor:pointer">' +
          '<div class="name">' + (it.visible ? "" : '<span class="tag">非表示</span>') + esc(it.name) + '</div>' +
          '<div class="price">' + (yen(it.price) || "価格なし") + '</div>' +
          '<div class="sub">' + esc((it.lines || []).join(" ")) + '</div></div>' +
          '<div class="side">' + sw("item-vis", 'data-s="' + si + '" data-i="' + ii + '"', it.visible) +
          mvBtns("item", ii, sec.items.length, 'data-s="' + si + '"') + '</div></div>';
      });
    });
    return h + '<button class="reset" data-act="show-data">保存される内容を見る（開発者向け）</button><button class="reset" data-act="reset">デモを最初の状態に戻す</button>';
  }

  function vPhotos() {
    var h = '<h2 class="sec"><span>トップの写真</span><button class="btn small primary" data-act="photo-add">＋ 追加</button></h2>' +
      '<p class="lead">スマホの写真を選ぶと、自動で小さくして保存します。</p>';
    if (!S.photos.length) h += '<div class="empty">写真がありません</div>';
    h += '<div class="grid">';
    S.photos.forEach(function (p, i) {
      h += '<div class="pcard"><img src="' + esc(src(p.src)) + '" alt="">' +
        '<div class="pb"><div class="alt">' + esc(p.alt || "（説明なし）") + '</div>' +
        '<div class="row"><button class="btn small" data-act="photo-edit" data-i="' + i + '">編集</button>' +
        mvBtns("photo", i, S.photos.length) + '</div></div></div>';
    });
    return h + "</div>";
  }


  function vDishes() {
    var A = S.alacarte;
    var h = '<h2 class="sec"><span>アラカルトの写真</span><button class="btn small primary" data-act="dish-add">＋ 追加</button></h2>' +
      '<p class="lead">ディナーの一品料理の写真です。季節ごとに入れ替えてください。</p>';
    if (!A.items.length) h += '<div class="empty">写真がありません（欄ごと表示されなくなります）</div>';
    h += '<div class="grid">';
    A.items.forEach(function (p, i) {
      h += '<div class="pcard' + (p.visible ? "" : " off") + '"><img src="' + esc(src(p.src)) + '" alt="">' +
        '<div class="pb"><div class="alt">' + (p.visible ? "" : '<span class="tag">非表示</span>') + esc(p.name || p.alt || "（説明なし）") + '</div>' +
        '<div class="row"><button class="btn small" data-act="dish-edit" data-i="' + i + '">編集</button>' +
        mvBtns("dish", i, A.items.length) + '</div></div></div>';
    });
    return h + "</div>";
  }

  function vNews() {
    var h = '<h2 class="sec"><span>お知らせ</span><button class="btn small primary" data-act="news-add">＋ 新規</button></h2>';
    if (!S.news.length) h += '<div class="empty">お知らせはありません</div>';
    S.news.forEach(function (n, i) {
      h += '<div class="card' + (n.visible ? "" : " off") + '">' +
        '<div class="main" data-act="news-edit" data-i="' + i + '" style="cursor:pointer">' +
        '<div class="sub"><span class="tag' + (n.visible ? " pub" : "") + '">' + (n.visible ? "公開中" : "非公開") + "</span>" + esc(n.date) + '</div>' +
        '<div class="name">' + esc(n.title) + '</div>' +
        '<div class="sub">' + esc(n.body) + '</div></div>' +
        '<div class="side">' + sw("news-vis", 'data-i="' + i + '"', n.visible) + '</div></div>';
    });
    return h;
  }

  function vHours() {
    var H = S.hours;
    var h = '<h2 class="sec"><span>営業時間</span></h2>' +
      '<div class="hrow"><label>ランチ</label><input type="text" data-f="lunch" value="' + esc(H.lunch) + '"></div>' +
      '<div class="hrow"><label>ディナー</label><input type="text" data-f="dinner" value="' + esc(H.dinner) + '"></div>' +
      '<div class="hrow"><label>定休日</label><input type="text" data-f="regular" value="' + esc(H.regular) + '"></div>' +
      '<h2 class="sec"><span>臨時休業</span><button class="btn small primary" data-act="closure-add">＋ 追加</button></h2>' +
      '<p class="lead">期間が過ぎたら、自動で表示されなくなります。</p>';
    if (!H.closures.length) h += '<div class="empty">予定されている休業はありません</div>';
    H.closures.forEach(function (c, i) {
      var past = c.to < today();
      h += '<div class="hrow closure"' + (past ? ' style="opacity:.5"' : "") + '><div>' +
        '<div class="d">' + esc(c.from) + (c.to !== c.from ? " 〜 " + esc(c.to) : "") + (past ? "（終了）" : "") + '</div>' +
        '<div class="r">' + esc(c.reason) + '</div></div>' +
        '<button class="btn small danger" data-act="closure-del" data-i="' + i + '">削除</button></div>';
    });
    return h;
  }

  /* ---------- 編集シート ---------- */
  function openSheet(title, html) {
    $("#sheet-title").textContent = title;
    $("#sheet-body").innerHTML = '<div class="form">' + html + "</div>";
    $("#sheet").hidden = false;
  }
  function closeSheet() { $("#sheet").hidden = true; }
  function val(n) { return $("#sheet-body [name=" + n + "]").value; }
  function chk(n) { return $("#sheet-body [name=" + n + "]").checked; }
  var pending = "";
  function pickBlock(url, label) {
    return '<div class="pick">' + (url ? '<img id="pv" src="' + esc(src(url)) + '" alt="">' : '<div class="noimg" id="pv">写真なし</div>') +
      '<button class="btn" data-act="pick-img">' + label + "</button></div>";
  }
  function setPv(url) {
    pending = url;
    var pv = $("#pv"); if (!pv) return;
    var n = document.createElement("img"); n.id = "pv"; n.src = url; n.alt = "";
    pv.replaceWith(n);
  }

  function itemForm(it, isNew) {
    pending = it.photo || "";
    return '<label>料理の名前</label><input type="text" name="name" value="' + esc(it.name) + '">' +
      '<label>価格（円） <span class="opt">数字だけ</span></label><input type="number" name="price" inputmode="numeric" value="' + esc(it.price) + '">' +
      '<label>内容 <span class="opt">1行に1つ</span></label><textarea name="lines">' + esc((it.lines || []).join("\n")) + "</textarea>" +
      "<label>写真</label>" + pickBlock(it.photo, "写真を選ぶ") +
      '<div class="inline"><b>ホームページに表示する</b>' + sw("noop", 'name="visible"', it.visible) + "</div>" +
      '<details><summary>くわしい設定</summary>' +
      '<label>名前の横の小さい文字 <span class="opt">任意</span></label><input type="text" name="nameNote" value="' + esc(it.nameNote) + '">' +
      '<label>上部の札 <span class="opt">任意</span></label><input type="text" name="tag" value="' + esc(it.tag) + '">' +
      '<label>リボン <span class="opt">任意</span></label><input type="text" name="ribbon" value="' + esc(it.ribbon) + '">' +
      '<label>注意書き <span class="opt">任意</span></label><input type="text" name="note" value="' + esc(it.note) + '">' +
      '<div class="inline"><b>横長の大きいカードにする</b>' + sw("noop", 'name="wide"', it.wide) + "</div></details>" +
      '<div class="actions">' + (isNew ? "" : '<button class="btn danger" data-act="item-del">削除</button>') +
      '<button class="btn primary" data-act="item-ok">決定</button></div>';
  }
  function readItem(it) {
    it.name = val("name").trim() || "（名前なし）";
    it.price = val("price") === "" ? "" : Number(val("price"));
    it.lines = val("lines").split("\n").map(function (x) { return x.trim(); }).filter(Boolean);
    it.photo = pending; it.visible = chk("visible");
    it.nameNote = val("nameNote"); it.tag = val("tag"); it.ribbon = val("ribbon"); it.note = val("note");
    it.wide = chk("wide");
  }

  var ctx = {};

  /* ---------- クリック処理 ---------- */
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-act],[data-tab]"); if (!t) return;
    if (t.dataset.tab) { tab = t.dataset.tab; render(); return; }
    var a = t.dataset.act, s = +t.dataset.s, i = +t.dataset.i;
    if (t.type === "checkbox") return;

    switch (a) {
      case "save": save(); break;
      case "sheet-close": closeSheet(); break;
      case "reset":
        if (confirm("デモの内容を最初の状態に戻します。よろしいですか？")) { localStorage.removeItem(KEY); S = seed(); dirty = false; $("#savebar").hidden = true; render(); }
        break;
      case "up": case "down":
        var d = a === "up" ? -1 : 1;
        if (t.dataset.k === "item") move(S.sections[s].items, i, d);
        if (t.dataset.k === "photo") move(S.photos, i, d);
        if (t.dataset.k === "dish") move(S.alacarte.items, i, d);
        touch(); keepScroll(); break;
      case "pick-img": pickImage(setPv); break;

      case "item-add":
        ctx = { s: s, it: { _id: uid(), name: "", price: "", lines: [], photo: "", visible: true, nameNote: "", tag: "", ribbon: "", note: "", wide: false }, isNew: true };
        openSheet("料理を追加", itemForm(ctx.it, true)); break;
      case "item-edit":
        ctx = { s: s, i: i, it: S.sections[s].items[i], isNew: false };
        openSheet("料理を編集", itemForm(ctx.it, false)); break;
      case "item-ok":
        readItem(ctx.it);
        if (ctx.isNew) S.sections[ctx.s].items.push(ctx.it);
        touch(); closeSheet(); render(); break;
      case "item-del":
        if (confirm("「" + ctx.it.name + "」を削除します。よろしいですか？")) {
          S.sections[ctx.s].items.splice(ctx.i, 1); touch(); closeSheet(); keepScroll();
        } break;

      case "photo-add":
        pickImage(function (url) { S.photos.push({ _id: uid(), src: url, alt: "" }); touch(); render(); }); break;
      case "photo-edit":
        ctx = { i: i }; pending = S.photos[i].src;
        openSheet("写真を編集",
          pickBlock(S.photos[i].src, "写真を差し替える") +
          '<label>写真の説明 <span class="opt">読み上げ用</span></label><input type="text" name="alt" value="' + esc(S.photos[i].alt) + '">' +
          '<div class="actions"><button class="btn danger" data-act="photo-del">削除</button><button class="btn primary" data-act="photo-ok">決定</button></div>');
        break;
      case "photo-ok":
        S.photos[ctx.i].src = pending; S.photos[ctx.i].alt = val("alt"); touch(); closeSheet(); render(); break;
      case "photo-del":
        if (confirm("この写真を削除します。よろしいですか？")) { S.photos.splice(ctx.i, 1); touch(); closeSheet(); render(); } break;

      case "dish-add":
        pickImage(function (url) { S.alacarte.items.push({ _id: uid(), src: url, alt: "", name: "", visible: true }); touch(); render(); }); break;
      case "dish-edit":
        var dp = S.alacarte.items[i]; ctx = { i: i }; pending = dp.src;
        openSheet("料理写真を編集",
          pickBlock(dp.src, "写真を差し替える") +
          '<label>料理名 <span class="opt">写真の下に表示・任意</span></label><input type="text" name="name" value="' + esc(dp.name) + '">' +
          '<label>写真の説明 <span class="opt">読み上げ用</span></label><input type="text" name="alt" value="' + esc(dp.alt) + '">' +
          '<div class="inline"><b>ホームページに表示する</b>' + sw("noop", 'name="visible"', dp.visible) + "</div>" +
          '<div class="actions"><button class="btn danger" data-act="dish-del">削除</button><button class="btn primary" data-act="dish-ok">決定</button></div>');
        break;
      case "dish-ok":
        var dq = S.alacarte.items[ctx.i];
        dq.src = pending; dq.name = val("name"); dq.alt = val("alt"); dq.visible = chk("visible");
        touch(); closeSheet(); render(); break;
      case "dish-del":
        if (confirm("この写真を削除します。よろしいですか？")) { S.alacarte.items.splice(ctx.i, 1); touch(); closeSheet(); render(); } break;
      case "show-data":
        openSheet("保存される内容（開発者向け）", '<textarea readonly style="min-height:50vh;font-family:monospace;font-size:12px">' + esc(buildDataJs()) + "</textarea>"); break;

      case "news-add":
        ctx = { n: { _id: uid(), date: today(), title: "", body: "", visible: true }, isNew: true };
        openSheet("お知らせを投稿", newsForm(ctx.n, true)); break;
      case "news-edit":
        ctx = { i: i, n: S.news[i], isNew: false };
        openSheet("お知らせを編集", newsForm(ctx.n, false)); break;
      case "news-ok":
        ctx.n.date = val("date"); ctx.n.title = val("title").trim() || "（題名なし）";
        ctx.n.body = val("body"); ctx.n.visible = chk("visible");
        if (ctx.isNew) S.news.unshift(ctx.n);
        touch(); closeSheet(); render(); break;
      case "news-del":
        if (confirm("このお知らせを削除します。よろしいですか？")) { S.news.splice(ctx.i, 1); touch(); closeSheet(); render(); } break;

      case "closure-add":
        openSheet("臨時休業を追加",
          '<label>はじまり</label><input type="date" name="from" value="' + today() + '">' +
          '<label>おわり</label><input type="date" name="to" value="' + today() + '">' +
          '<label>理由 <span class="opt">任意</span></label><input type="text" name="reason">' +
          '<div class="actions"><button class="btn primary" data-act="closure-ok">決定</button></div>'); break;
      case "closure-ok":
        var f = val("from"), to = val("to") || f;
        if (!f) { toast("日付を入れてください"); break; }
        if (to < f) to = f;
        S.hours.closures.push({ _id: uid(), from: f, to: to, reason: val("reason") });
        S.hours.closures.sort(function (x, y) { return x.from < y.from ? -1 : 1; });
        touch(); closeSheet(); render(); break;
      case "closure-del":
        if (confirm("この休業予定を削除します。よろしいですか？")) { S.hours.closures.splice(i, 1); touch(); render(); } break;
    }
  });

  function newsForm(n, isNew) {
    return '<label>日付</label><input type="date" name="date" value="' + esc(n.date) + '">' +
      '<label>題名</label><input type="text" name="title" value="' + esc(n.title) + '">' +
      '<label>本文</label><textarea name="body">' + esc(n.body) + "</textarea>" +
      '<div class="inline"><b>公開する</b>' + sw("noop", 'name="visible"', n.visible) + "</div>" +
      '<div class="actions">' + (isNew ? "" : '<button class="btn danger" data-act="news-del">削除</button>') +
      '<button class="btn primary" data-act="news-ok">決定</button></div>';
  }

  /* スイッチ・入力欄の変更 */
  document.addEventListener("change", function (e) {
    var t = e.target, a = t.dataset.act;
    if (a === "item-vis") { S.sections[+t.dataset.s].items[+t.dataset.i].visible = t.checked; touch(); keepScroll(); }
    if (a === "news-vis") { S.news[+t.dataset.i].visible = t.checked; touch(); keepScroll(); }
  });
  document.addEventListener("input", function (e) {
    var f = e.target.dataset.f;
    if (f) { S.hours[f] = e.target.value; touch(); }
  });

  window.addEventListener("beforeunload", function (e) { if (dirty) { e.preventDefault(); e.returnValue = ""; } });

  render();
})();
