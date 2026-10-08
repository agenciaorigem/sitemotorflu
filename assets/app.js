'use strict';
const siteRoot=new URL('../',document.currentScript.src);
const sitePath=path=>new URL(path,siteRoot).href;
const localRoute=path=>path.startsWith(siteRoot.pathname)?'/'+path.slice(siteRoot.pathname.length).replace(/index\.html$/,''):path;
const nav=document.getElementById('navigation');
const menu=document.querySelector('.menu-toggle');
if(menu&&nav){menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}})}
const navLinks=[...document.querySelectorAll('#navigation > a')];
function updateNavigation(){
 const catalogue=document.getElementById('catalogo');
 const currentRoute=localRoute(location.pathname);
 const isHome=currentRoute==='/';
 const productsActive=currentRoute.startsWith('/produtos/')||(isHome&&catalogue&&catalogue.getBoundingClientRect().top<=(document.querySelector('.site-header')?.offsetHeight||86)+30);
 for(const link of navLinks){const url=new URL(link.href);link.removeAttribute('aria-current');
 const active=url.hash==='#catalogo'?productsActive:(localRoute(url.pathname)==='/'?isHome&&!productsActive:localRoute(url.pathname)===currentRoute);
 if(active)link.setAttribute('aria-current',isHome?'location':'page');
 }
}
let navigationFrame=false;
addEventListener('scroll',()=>{if(!navigationFrame){navigationFrame=true;requestAnimationFrame(()=>{updateNavigation();navigationFrame=false})}},{passive:true});
addEventListener('resize',updateNavigation);addEventListener('hashchange',updateNavigation);addEventListener('load',updateNavigation);updateNavigation();
navLinks.forEach(link=>link.addEventListener('click',()=>{nav?.classList.remove('open');menu?.setAttribute('aria-expanded','false')}));
const hero=document.querySelector('.hero'),motor=document.querySelector('.motor-layer'),background=document.querySelector('.hero-bg');
if(hero&&motor&&background&&!matchMedia('(prefers-reduced-motion: reduce)').matches){let pending=false;const update=()=>{const amount=Math.max(0,Math.min(hero.offsetHeight,-hero.getBoundingClientRect().top));const mobile=innerWidth<601;motor.style.transform=`translate3d(0,${-amount*(mobile?.025:.075)}px,0)`;background.style.transform=`translate3d(0,${amount*.12}px,0)`;pending=false};addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);update()}
const grid=document.getElementById('catalog-grid');
if(grid){fetch(sitePath('assets/products.json')).then(r=>{if(!r.ok)throw Error('Catálogo indisponível');return r.json()}).then(products=>{
const search=document.getElementById('product-search'),category=document.getElementById('category-filter'),vehicle=document.getElementById('vehicle-filter'),count=document.getElementById('result-count'),empty=document.getElementById('empty-state'),cards=[...grid.children];
const params=new URLSearchParams(location.search);for(const [select,key] of [[category,'categoria'],[vehicle,'aplicacao']])if([...select.options].some(o=>o.value===params.get(key)))select.value=params.get(key)||'';search.value=params.get('busca')||'';
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function filter(){let total=0;const query=normalize(search.value.trim());products.forEach((p,i)=>{const match=(!category.value||p.category===category.value)&&(!vehicle.value||p.vehicles.includes(vehicle.value))&&(!query||normalize(p.name+' '+p.tagline+' '+p.description+' '+p.application).includes(query));cards[i].hidden=!match;if(match)total++});count.textContent=total+(total===1?' produto':' produtos');empty.hidden=total!==0;document.querySelectorAll('[data-line]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.line===category.value)));const url=new URL(location.href);for(const [key,value]of [['categoria',category.value],['aplicacao',vehicle.value],['busca',search.value]]){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key)}history.replaceState(null,'',url.pathname+url.search+url.hash)}
search.addEventListener('input',filter);category.addEventListener('change',filter);vehicle.addEventListener('change',filter);document.getElementById('reset-filters').addEventListener('click',()=>{search.value='';category.value='';vehicle.value='';filter()});
function selectLine(cat,application){category.value=cat;vehicle.value=application;search.value='';filter();document.getElementById('catalogo')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'})}
document.querySelectorAll('[data-line]').forEach(b=>b.addEventListener('click',()=>selectLine(b.dataset.line,'')));
const slides=[...document.querySelectorAll('.vehicle-slide')];if(slides.length){let current=0,selected=null;const panel=document.getElementById('hotspot-callout'),title=document.getElementById('hotspot-title'),links=document.getElementById('hotspot-products'),categoryBar=document.querySelector('.vehicle-categories');
function close(){panel.hidden=true;document.getElementById('connector-path').setAttribute('d','');selected=null;document.querySelectorAll('.hotspot').forEach(b=>b.setAttribute('aria-expanded','false'))}
function show(i){current=(i+slides.length)%slides.length;slides.forEach((s,n)=>s.hidden=n!==current);document.querySelectorAll('[data-vehicle-tab]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.vehicleTab)===current)));close();categoryBar.replaceChildren();slides[current].querySelectorAll('.hotspot').forEach(point=>{const b=document.createElement('button');b.textContent=point.dataset.category;b.addEventListener('click',()=>openPoint(point));categoryBar.append(b)})}
function drawLine(){if(!selected)return;const stage=document.querySelector('.vehicle-stage');const bounds=stage.getBoundingClientRect(),point=selected.getBoundingClientRect();const px=point.left+point.width/2-bounds.left,py=point.top+point.height/2-bounds.top;
if(innerWidth>700){panel.style.left=px<bounds.width*.55?'64%':'4%';panel.style.top='6%'}else{panel.style.left='';panel.style.top=''}
const box=panel.getBoundingClientRect();const left=box.left-bounds.left,right=box.right-bounds.left,midY=box.top+box.height/2-bounds.top;let endX,bendX;if(px<(left+right)/2){endX=left;bendX=Math.max(8,left-32)}else{endX=right;bendX=Math.min(bounds.width-8,right+32)}
const svg=document.querySelector('.hotspot-connector');svg.setAttribute('viewBox',`0 0 ${bounds.width} ${bounds.height}`);document.getElementById('connector-path').setAttribute('d',`M ${px} ${py} H ${bendX} V ${midY} H ${endX}`)}
function openPoint(point){if(selected===point){close();return}close();selected=point;point.setAttribute('aria-expanded','true');title.textContent=point.dataset.category;links.replaceChildren();const matches=products.filter(p=>p.category===point.dataset.category&&p.vehicles.includes(point.dataset.vehicle));for(const p of matches){const a=document.createElement('a');a.href=sitePath('produtos/'+p.slug+'/');a.textContent=p.name;links.append(a)}panel.hidden=false;drawLine()}
document.querySelectorAll('.hotspot').forEach(b=>b.addEventListener('click',()=>openPoint(b)));document.getElementById('view-line').addEventListener('click',()=>{if(selected)selectLine(selected.dataset.category,selected.dataset.vehicle)});document.querySelectorAll('[data-vehicle-tab]').forEach(b=>b.addEventListener('click',()=>show(Number(b.dataset.vehicleTab))));document.getElementById('vehicle-prev').addEventListener('click',()=>show(current-1));document.getElementById('vehicle-next').addEventListener('click',()=>show(current+1));document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});addEventListener('resize',drawLine);let touchStart=null;const stage=document.querySelector('.vehicle-stage');stage.addEventListener('touchstart',e=>{touchStart=e.touches[0].clientX},{passive:true});stage.addEventListener('touchend',e=>{if(touchStart!==null){const delta=e.changedTouches[0].clientX-touchStart;if(Math.abs(delta)>65)show(current+(delta<0?1:-1));touchStart=null}},{passive:true});show(0)}filter()
}).catch(()=>{document.getElementById('result-count').textContent='Catálogo completo — consulte os produtos abaixo';document.querySelector('.catalog-tools').hidden=true;document.getElementById('reset-filters').hidden=true})}

const banner=document.getElementById('banner-carousel');
if(banner){
 const frames=[...banner.querySelectorAll('.banner-slide')],dots=[...banner.querySelectorAll('[data-banner]')],pause=document.getElementById('banner-pause');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');let index=0,paused=reduced.matches,timer=null,hovered=false;
 function showBanner(next){index=(next+frames.length)%frames.length;frames.forEach((frame,i)=>{frame.classList.toggle('is-active',i===index);frame.setAttribute('aria-hidden',String(i!==index))});dots.forEach((dot,i)=>dot.setAttribute('aria-pressed',String(i===index)))}
 function schedule(){clearInterval(timer);timer=null;if(!paused&&!hovered&&!document.hidden&&!banner.contains(document.activeElement))timer=setInterval(()=>showBanner(index+1),4000)}
 function syncPause(){pause.textContent=paused?'Reproduzir':'Pausar';pause.setAttribute('aria-label',paused?'Reproduzir troca automática':'Pausar troca automática');schedule()}
 document.getElementById('banner-prev').addEventListener('click',()=>{showBanner(index-1);schedule()});document.getElementById('banner-next').addEventListener('click',()=>{showBanner(index+1);schedule()});dots.forEach(dot=>dot.addEventListener('click',()=>{showBanner(Number(dot.dataset.banner));schedule()}));pause.addEventListener('click',()=>{paused=!paused;syncPause()});
 banner.addEventListener('mouseenter',()=>{hovered=true;schedule()});banner.addEventListener('mouseleave',()=>{hovered=false;schedule()});banner.addEventListener('focusin',schedule);banner.addEventListener('focusout',()=>requestAnimationFrame(schedule));document.addEventListener('visibilitychange',schedule);
 reduced.addEventListener('change',()=>{paused=reduced.matches;syncPause()});let start=null;banner.addEventListener('touchstart',event=>{start=event.touches[0].clientX},{passive:true});banner.addEventListener('touchend',event=>{if(start!==null){const delta=event.changedTouches[0].clientX-start;if(Math.abs(delta)>50){showBanner(index+(delta<0?1:-1));schedule()}start=null}},{passive:true});syncPause();
}
