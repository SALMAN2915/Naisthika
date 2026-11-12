
$(function(){
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ignoreMobileResize:true});
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
$('#yr').text(new Date().getFullYear());

/* Lenis is the only smoothing layer; ScrollTrigger scrubs 1:1 against it */
let lenis=null;
if(!reduce){
  lenis=new Lenis({lerp:.075,wheelMultiplier:.9,smoothWheel:true});
  lenis.on('scroll',ScrollTrigger.update);
  gsap.ticker.add(t=>lenis.raf(t*1000));
  gsap.ticker.lagSmoothing(0);
}
const goTo=(t,o)=>lenis?lenis.scrollTo(t,o||{offset:0,duration:1.6}):(t===0?window.scrollTo(0,0):document.querySelector(t)?.scrollIntoView());
$('a[href^="#"]').on('click',function(e){const h=this.getAttribute('href');if(h.length>1&&document.querySelector(h)){e.preventDefault();$('#menu').removeClass('open');$('#burger').removeClass('on');goTo(h);}});
$('#burger').on('click',function(){$(this).toggleClass('on');$('#menu').toggleClass('open');});
$('#top').on('click',()=>goTo(0));

/* helpers */
function split(el,type){const t=el.textContent.trim();el.setAttribute('aria-label',t);
  el.innerHTML=type==='c'?[...t].map(c=>`<span class="ch" aria-hidden="true">${c===' '?'&nbsp;':c}</span>`).join(''):t.split(/\s+/).map(w=>`<span class="w" aria-hidden="true">${w}</span>`).join(' ');
  return el.children;}

/* FAQ */
const ans='We offer a comprehensive suite of IT consulting services, including strategic planning, cloud solutions, network security, software development, and ongoing IT support.';
['What IT consulting services does Naisthika-Tech offer?','How does the IT consulting process work with Naisthika-Tech?','Do you offer cloud migration services?','What IT consulting services does Naisthika-Tech offer?'].forEach(q=>{
  $('#fqs').append(`<div class="fq"><button aria-expanded="false">${q}<i></i></button><div class="a"><p>${ans}</p></div></div>`);});
$('#fqs').on('click','button',function(){const f=$(this).parent(),open=f.hasClass('on');
  $('.fq.on').each(function(){gsap.to($(this).find('.a'),{height:0,duration:.5,ease:'power3.inOut'});$(this).removeClass('on').find('button').attr('aria-expanded','false');});
  if(!open){f.addClass('on');$(this).attr('aria-expanded','true');gsap.to(f.find('.a'),{height:'auto',duration:.6,ease:'power3.out',onComplete:()=>ScrollTrigger.refresh()});}});

/* nav */
ScrollTrigger.create({start:80,onUpdate:s=>$('#nav').toggleClass('solid',s.scroll()>80)});
ScrollTrigger.create({start:600,onUpdate:s=>$('#top').toggleClass('show',s.scroll()>600)});

/* Swiper */
new Swiper('.sw',{loop:false,speed:900,grabCursor:true,pagination:{el:'.swiper-pagination',clickable:true},autoplay:false});

/* contact form */
$('#fs').on('change',function(){$(this).toggleClass('has',!!this.value)});
$('#cf').on('submit',function(e){e.preventDefault();let ok=true;
  const rules={fn:v=>v.trim().length>1,fe:v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),fp:v=>/^\+?[\d\s-]{10,14}$/.test(v.trim()),fs:v=>!!v,fm:v=>v.trim().length>=10};
  Object.keys(rules).forEach(id=>{const good=rules[id]($('#'+id).val());$('#'+id).closest('.field').toggleClass('bad',!good);if(!good)ok=false;});
  if(ok){$('#ok').slideDown();this.reset();$('#fs').removeClass('has');}
  else gsap.fromTo('.field.bad',{x:-8},{x:0,duration:.5,ease:'elastic.out(1,.3)'});});

/* ---------- SCROLL-SCRUBBED SCENES ---------- */
const mm=gsap.matchMedia();
const heroChars=split(document.getElementById('htitle'),'c');
const sc=(trigger,extra)=>Object.assign({trigger,scrub:true},extra);

/* ONE context, triggers created strictly in PAGE ORDER so pin spacing is always calculated correctly */
mm.add({motion:'(prefers-reduced-motion: no-preference)',desktop:'(min-width: 992px)'},(ctx)=>{
  const {motion,desktop}=ctx.conditions;
  if(!motion)return;
  if(desktop)document.documentElement.classList.add('h-on');

  /* horizontal scroller used by Services, Services (2nd) + Projects */
  const hScroll=(id)=>{
    const sec=document.querySelector(id),tr=sec.querySelector('.track'),dist=()=>tr.scrollWidth-innerWidth;
    const tw=gsap.to(tr,{x:()=>-dist(),ease:'none',scrollTrigger:{trigger:sec,pin:true,anticipatePin:1,scrub:true,end:()=>'+='+dist(),invalidateOnRefresh:true}});
    sec.querySelectorAll('.pic').forEach(pic=>{
      const p=pic.parentElement;
      gsap.fromTo(pic,{scale:1.5,rotate:id==='#projects'?4:-5},{scale:1,rotate:0,ease:'none',scrollTrigger:{trigger:p,containerAnimation:tw,start:'left 95%',end:'center 40%',scrub:true}});});
    sec.querySelectorAll('.panel h3,.proj h3').forEach(h=>gsap.from(h,{xPercent:40,opacity:0,ease:'none',scrollTrigger:{trigger:h,containerAnimation:tw,start:'left 98%',end:'left 55%',scrub:true}}));
    sec.querySelectorAll('.ico *').forEach(n=>gsap.to(n,{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:n.closest('.panel')||n,containerAnimation:tw,start:'left 90%',end:'left 40%',scrub:true}}));
    const it=sec.querySelector('.intro h2');gsap.to(it,{scale:.7,xPercent:-10,opacity:.4,ease:'none',scrollTrigger:{trigger:sec,start:'top top',end:()=>'+='+innerWidth,scrub:true}});
  };

  /* mobile / tablet fallback: simple zoom-in on each panel image */
  const mobilePics=(id)=>gsap.utils.toArray(id+' .pic').forEach(p=>gsap.fromTo(p,{scale:1.3},{scale:1,ease:'none',scrollTrigger:sc(p.parentElement,{start:'top bottom',end:'top 30%'})}));

  /* vertical scroll-through for the 2nd Services section (no pin, no horizontal track) */
  const vertScroll=(id)=>{
    const sec=document.querySelector(id);
    gsap.from(sec.querySelector('.intro h2'),{y:80,opacity:0,ease:'none',scrollTrigger:sc(sec,{start:'top 90%',end:'top 40%'})});
    sec.querySelectorAll('.panel').forEach(p=>{
      gsap.fromTo(p.querySelector('.pic'),{scale:1.4,rotate:-4},{scale:1,rotate:0,ease:'none',scrollTrigger:sc(p,{start:'top bottom',end:'center 40%'})});
      gsap.from(p.querySelector('h3'),{xPercent:20,opacity:0,ease:'none',scrollTrigger:sc(p,{start:'top 80%',end:'top 35%'})});
      p.querySelectorAll('.ico *').forEach(n=>gsap.to(n,{strokeDashoffset:0,ease:'none',scrollTrigger:sc(p,{start:'top 80%',end:'top 35%'})}));
    });
  };

  /* 1. Hero */
  gsap.timeline({defaults:{ease:'power4.out'}})
    .from(heroChars,{yPercent:110,rotateX:-80,opacity:0,stagger:.04,duration:1.1},0)
    .from('#hsub',{y:30,opacity:0,duration:1},'-=.6')
    .from('.obj',{scale:0,opacity:0,stagger:.12,duration:1.2},'-=1');
  gsap.to('.hbg',{scale:2.4,ease:'none',scrollTrigger:sc('#hero',{start:'top top',end:'bottom top'})});
  // gsap.to('.hc',{scale:2.2,opacity:0,ease:'none',scrollTrigger:sc('#hero',{start:'20% top',end:'bottom top'})});
  gsap.to('.hc',{scale:1.15,ease:'none',
  scrollTrigger:sc('#hero',{start:'top top',end:'bottom top'})});
  gsap.utils.toArray('.obj').forEach(o=>gsap.to(o,{y:+o.dataset.s,rotate:90,ease:'none',scrollTrigger:sc('#hero',{start:'top top',end:'bottom top'})}));
  gsap.to('.scrollhint',{opacity:0,ease:'none',scrollTrigger:sc('#hero',{start:'top top',end:'15% top'})});

  /* 2. About (pinned) */
  const aw=split(document.getElementById('abh'),'w');
  gsap.set(aw,{opacity:0,y:40});
  gsap.timeline({scrollTrigger:{trigger:'#about',pin:true,anticipatePin:1,scrub:true,start:'top top',end:'+=220%'}})
    .fromTo('.ab-img .main',{scale:.5,rotate:-8},{scale:1.7,rotate:0,duration:3,ease:'none'},0)
    .fromTo('.ab-img .l2',{y:200,rotate:10},{y:-120,rotate:-6,duration:3,ease:'none'},0)
    .fromTo('.ab-img .l3',{x:-200},{x:100,duration:3,ease:'none'},0)
    .to('.ab-img .main',{opacity:.25,duration:1},1.5)
    .to('.ab-c',{opacity:1,duration:.4},1)
    .to(aw,{opacity:1,y:0,stagger:.12,duration:.5},1.1)
    .from('.ab-c p,.ab-c .stats b,.ab-c .btn-x',{opacity:0,y:30,stagger:.15,duration:.5},1.9);
  if(!desktop)gsap.set('.ab-c',{opacity:1});

  /* 3. Services (horizontal pin on desktop) */
  if(desktop)hScroll('#services');
  else mobilePics('#services');

  /* 4. Why (pinned stacking cards) */
  const wEl=document.getElementById('whyh'),ww=split(wEl,'w');wEl.classList.add('dim');
  gsap.to(ww,{opacity:1,stagger:.1,ease:'none',scrollTrigger:sc(wEl,{start:'top 85%',end:'bottom 45%'})});
  const cs=gsap.utils.toArray('.card-s');gsap.set(cs.slice(1),{yPercent:120,rotate:6});
  const wt=gsap.timeline({scrollTrigger:{trigger:'#why',pin:true,anticipatePin:1,scrub:true,start:'top top',end:'+=260%'}});
  cs.slice(1).forEach((c,i)=>wt.to(c,{yPercent:0,rotate:0,ease:'none',duration:1},i));
  wt.to(cs,{x:i=>(i-1.5)*34,y:i=>(i-1.5)*-26,rotate:i=>(i-1.5)*3,duration:1,ease:'none'},3);
  gsap.utils.toArray('.shape').forEach((s,i)=>gsap.to(s,{rotate:i?-120:180,y:i?-160:200,ease:'none',scrollTrigger:sc('#why',{start:'top bottom',end:'bottom top'})}));

  /* 4b. NEW Services copy, directly after Why (vertical scroll-through) */
  vertScroll('#services2');

  /* 5. Projects (horizontal pin on desktop) */
  if(desktop)hScroll('#projects');
  else mobilePics('#projects');

  /* 6. Reviews */
  gsap.fromTo('#ghost',{xPercent:20},{xPercent:-40,ease:'none',scrollTrigger:sc('#reviews',{start:'top bottom',end:'bottom top'})});
  gsap.from('.qm',{scale:.3,rotate:-40,opacity:0,ease:'none',scrollTrigger:sc('#reviews',{start:'top 80%',end:'top 35%'})});

  /* 7. Founder */
  gsap.to('#fframe',{clipPath:'inset(0 0% 0 0)',ease:'none',scrollTrigger:sc('#founder',{start:'top 70%',end:'top top'})});
  gsap.from('.ftext h2,.ftext h3',{opacity:.1,x:60,ease:'none',scrollTrigger:sc('.ftext',{start:'top 80%',end:'top 40%'})});

  /* 8. Contact */
  gsap.to('#contact',{clipPath:'circle(150% at 50% 0%)',ease:'none',scrollTrigger:sc('#contact',{start:'top 100%',end:'top 10%'})});

  /* 9. Team */
  gsap.utils.toArray('#team [data-speed]').forEach(c=>gsap.fromTo(c,{y:+c.dataset.speed},{y:-c.dataset.speed,ease:'none',scrollTrigger:sc('#team',{start:'top bottom',end:'bottom top'})}));

  /* 10. FAQ */
  gsap.utils.toArray('#faq .fq').forEach(f=>gsap.from(f,{opacity:0,x:80,ease:'none',scrollTrigger:sc(f,{start:'top 95%',end:'top 70%'})}));

  /* 11. Blog */
  gsap.utils.toArray('.post').forEach(p=>{
    gsap.to(p.querySelector('.im'),{clipPath:'inset(0 0 0% 0)',ease:'none',scrollTrigger:sc(p,{start:'top 85%',end:'top 35%'})});
    gsap.fromTo(p.querySelector('.im div'),{scale:1.7},{scale:1,ease:'none',scrollTrigger:sc(p,{start:'top 85%',end:'bottom 30%'})});
    gsap.from(p.querySelector('h3'),{xPercent:12,opacity:0,ease:'none',scrollTrigger:sc(p,{start:'top 75%',end:'top 40%'})});});

  /* 12. Footer */
  gsap.fromTo('#fbig',{xPercent:25},{xPercent:-8,ease:'none',scrollTrigger:sc('#foot',{start:'top bottom',end:'bottom bottom'})});
  gsap.from('#foot .row>div',{y:80,opacity:0,stagger:.15,ease:'none',scrollTrigger:sc('#foot',{start:'top 95%',end:'top 50%'})});

  return()=>document.documentElement.classList.remove('h-on');
});
mm.add('(prefers-reduced-motion: reduce)',()=>{
  $('#about,#why').css({height:'auto',padding:'12vh 0'});$('.ab-c').css('opacity',1);
  $('.card-s').css({position:'relative',marginBottom:'1rem',minHeight:'200px'});$('.stackbox').css('height','auto');
  $('.ab-img').hide();
});

/* re-measure once images and fonts finish loading so pins never drift */
let rt;const rf=()=>{clearTimeout(rt);rt=setTimeout(()=>ScrollTrigger.refresh(),150)};
document.querySelectorAll('img').forEach(i=>{if(!i.complete)i.addEventListener('load',rf,{once:true})});
if(document.fonts)document.fonts.ready.then(rf);
window.addEventListener('load',rf);
});