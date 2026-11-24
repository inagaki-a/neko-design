/* 文字サイズ切り替え（小・標準・大・特大）。JS無効の場合は標準サイズのまま全文読めます。 */
(function () {
  var LEVELS = [
    { key: "s", label: "小", scale: 0.9 },
    { key: "m", label: "標準", scale: 1 },
    { key: "l", label: "大", scale: 1.2 },
    { key: "xl", label: "特大", scale: 1.45 }
  ];
  var KEY = "neko-fontsize";
  var cur = "m";
  try { cur = localStorage.getItem(KEY) || "m"; } catch (e) {}
  if (!LEVELS.some(function (l) { return l.key === cur; })) cur = "m";

  function scaleOf(k) { return LEVELS.filter(function (l) { return l.key === k; })[0].scale; }

  var style = document.createElement("style");
  style.textContent =
    "html{font-size:calc(100% * var(--neko-fs,1))}" +
    ".nfs{position:fixed;right:10px;bottom:10px;z-index:2147483000;display:flex;align-items:center;gap:2px;" +
    "background-color:#111;border:2px solid #fff;border-radius:999px;padding:3px 4px 3px 10px;" +
    "box-shadow:0 2px 10px rgba(0,0,0,.5);font:700 13px/1 'Yu Gothic UI','Yu Gothic','Meiryo',sans-serif;letter-spacing:0}" +
    ".nfs span{color:#fff;font-size:12px;margin-right:4px;font-weight:700}" +
    ".nfs button{all:unset;box-sizing:border-box;cursor:pointer;color:#fff;font:700 13px/1 'Yu Gothic UI','Yu Gothic','Meiryo',sans-serif;" +
    "padding:8px 9px;min-width:34px;text-align:center;border-radius:999px;letter-spacing:0}" +
    ".nfs button[aria-pressed=true]{background-color:#fff;color:#111}" +
    ".nfs button:focus-visible{outline:2px solid #ffd54a;outline-offset:1px}" +
    "@media print{.nfs{display:none}}";
  document.head.appendChild(style);

  function apply() {
    var s = scaleOf(cur);
    document.documentElement.style.setProperty("--neko-fs", s);
    var b = document.body;
    if (!b) return;
    b.style.fontSize = "";
    if (s !== 1) {
      var base = parseFloat(getComputedStyle(b).fontSize);
      if (base) b.style.fontSize = (base * s) + "px";
    }
    var btns = document.querySelectorAll(".nfs button");
    for (var i = 0; i < btns.length; i++) btns[i].setAttribute("aria-pressed", btns[i].getAttribute("data-k") === cur ? "true" : "false");
  }

  function build() {
    var box = document.createElement("div");
    box.className = "nfs";
    box.setAttribute("role", "group");
    box.setAttribute("aria-label", "文字の大きさ");
    var t = document.createElement("span");
    t.textContent = "文字";
    box.appendChild(t);
    LEVELS.forEach(function (l) {
      var bt = document.createElement("button");
      bt.type = "button";
      bt.textContent = l.label;
      bt.setAttribute("data-k", l.key);
      bt.onclick = function () {
        cur = l.key;
        try { localStorage.setItem(KEY, cur); } catch (e) {}
        apply();
      };
      box.appendChild(bt);
    });
    document.body.appendChild(box);
    apply();
    var timer;
    window.addEventListener("resize", function () { clearTimeout(timer); timer = setTimeout(apply, 150); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
