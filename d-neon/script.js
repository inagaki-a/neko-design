/* 任意の演出のみ。JSが無くても全て読めます。 */
(function () {
  var els = document.querySelectorAll('.rv');
  if (!('IntersectionObserver' in window)) {
    els.forEach(function (e) { e.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (list) {
    list.forEach(function (x) {
      if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(function (e) { io.observe(e); });
  // 保険：3秒後に全て表示
  setTimeout(function () { els.forEach(function (e) { e.classList.add('in'); }); }, 4000);
})();
