(function(){
  window.__nekoOK = true;
  var root=document.documentElement, cat=document.getElementById('railCat'), label=document.getElementById('railLabel');
  var secs=[].slice.call(document.querySelectorAll('[data-chapter]'));
  var timer=null, reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function update(){
    var h=root.scrollHeight-window.innerHeight, p=h>0?Math.min(1,Math.max(0,window.scrollY/h)):0;
    root.style.setProperty('--p',p.toFixed(4));
    var cur=secs[0];
    secs.forEach(function(s){ if(s.getBoundingClientRect().top<window.innerHeight*0.4) cur=s; });
    if(cur && label.textContent!==cur.getAttribute('data-chapter')) label.textContent=cur.getAttribute('data-chapter');
  }
  window.addEventListener('scroll',function(){
    update();
    if(!reduce){ cat.classList.add('walking'); clearTimeout(timer); timer=setTimeout(function(){cat.classList.remove('walking');},160); }
  },{passive:true});
  window.addEventListener('resize',update);
  update();
  var rv=[].slice.call(document.querySelectorAll('.rv'));
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:0.15,rootMargin:'0px 0px -5% 0px'});
    rv.forEach(function(el){io.observe(el);});
  } else { rv.forEach(function(el){el.classList.add('in');}); }
})();
