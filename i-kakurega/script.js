(function () {
  var root = document.documentElement;
  root.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var shoji = document.querySelector('.shoji');
  var opened = false;

  function open() {
    if (opened) return;
    opened = true;
    root.classList.add('opened');
    if (shoji) setTimeout(function () { shoji.style.visibility = 'hidden'; }, reduce ? 0 : 1900);
  }

  if (shoji) {
    shoji.addEventListener('click', open);
    window.addEventListener('scroll', function () { if (window.scrollY > 8) open(); }, { passive: true });
    window.addEventListener('wheel', open, { passive: true, once: true });
    window.addEventListener('touchmove', open, { passive: true, once: true });
    window.addEventListener('keydown', open, { once: true });
    // 何も操作しなくても、少し待てば戸は開く
    setTimeout(open, reduce ? 300 : 4500);
    if (location.hash && location.hash !== '#iriguchi') open();
  }

  // 各行が襖のようにするっと現れる
  var rows = document.querySelectorAll('.row, .plan, .spec li, .items li');
  if (!reduce) {
    root.classList.add('reveal-on');
    var list = Array.prototype.slice.call(rows);
    var check = function () {
      var h = window.innerHeight || 800;
      list = list.filter(function (el) {
        if (el.getBoundingClientRect().top < h * 0.95) { el.classList.add('in'); return false; }
        return true;
      });
      if (!list.length) { window.removeEventListener('scroll', check); window.removeEventListener('resize', check); }
    };
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    check();
    setTimeout(function () { list.forEach(function (el) { el.classList.add('in'); }); list = []; }, 20000);
  }

  // 廊下：縦スクロールを横の移動に置き換える（広い画面のみ）。それ以外は縦に並ぶだけ
  var cor = document.getElementById('corridor');
  var stage = cor && cor.querySelector('.stage');
  var track = cor && cor.querySelector('.track');
  var bar = cor && cor.querySelector('.hint .bar i');
  var dist = 0;
  function wantHS() { return !reduce && window.innerWidth >= 981 && window.innerHeight >= 600; }
  function setup() {
    if (!cor) return;
    if (wantHS()) {
      root.classList.add('hs');
      dist = Math.max(0, track.scrollWidth - stage.clientWidth);
      cor.style.height = (dist + window.innerHeight) + 'px';
      move();
    } else {
      root.classList.remove('hs');
      cor.style.height = ''; track.style.transform = '';
    }
  }
  function move() {
    if (!root.classList.contains('hs')) return;
    var p = Math.min(Math.max(-cor.getBoundingClientRect().top, 0), dist);
    track.style.transform = 'translate3d(' + (-p) + 'px,0,0)';
    if (bar) bar.style.width = (dist ? p / dist * 100 : 0) + '%';
  }
  setup();
  window.addEventListener('scroll', move, { passive: true });
  window.addEventListener('resize', setup);
  window.addEventListener('load', setup);
  var links = document.querySelectorAll('a[data-room]');
  Array.prototype.forEach.call(links, function (a) {
    a.addEventListener('click', function (e) {
      if (!root.classList.contains('hs')) return;
      var room = document.getElementById(a.getAttribute('data-room'));
      if (!room) return;
      e.preventDefault();
      var top = cor.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo(0, top + Math.min(room.offsetLeft, dist));
    });
  });
  if (location.hash && /^#ma-/.test(location.hash)) {
    setTimeout(function () { var a = document.querySelector('a[data-room="' + location.hash.slice(1) + '"]'); if (a) a.click(); }, 50);
  }
})();
