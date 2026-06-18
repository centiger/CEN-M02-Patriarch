let DATA=null, current=null;
const $=id=>document.getElementById(id);
function qs(){return new URLSearchParams(location.search)}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
async function init(){
  const res=await fetch('./data/hubs.json?v=20260618-m02-v31',{cache:'no-store'});
  DATA=await res.json();
  const slug=qs().get('hub')||DATA.defaultHub||'abraham';
  render(slug);
}
function find(slug){return DATA.hubs.find(h=>h.slug===slug||h.id===slug)||DATA.hubs[0]}
function nl2br(s){return esc(s).replace(/\n/g,'<br>')}
function renderExplore(items){return (items||[]).map(x=>{if(typeof x==='string')return `<span class="chip">${esc(x)}</span>`;return `<div class="exploreCard"><b>${esc(x.title||'')}</b><p>${nl2br(x.text||'')}</p></div>`}).join('')}
function scrollToHash(){
  const targetId = location.hash.replace('#','').split('&')[0];
  if(!targetId) return;

  setTimeout(()=>{
    const target = document.getElementById(targetId);
    if(target){
      target.scrollIntoView({behavior:'smooth', block:'start'});
    }
  },300);
}
function render(slug){
  const h=find(slug); current=h;
  if(!h.ready){renderPending(h);return}
  $('title').textContent=`${h.icon||''} ${h.title}`;
  $('subtitle').textContent=h.subtitle||'';
  $('verse').textContent=h.verse||h.message||'';
  $('map').src=(h.map||'')+'?v=20260618-m02-v31';
  $('caption').innerHTML=nl2br(h.mapCaption||'');
  $('events').innerHTML=(h.events||[]).map(x=>`<div class="item"><b>${esc(x.title||'')}</b>${esc(x.text||x)}</div>`).join('');
  $('meanings').innerHTML=(h.meanings||[]).map(x=>`<li>${esc(x)}</li>`).join('');
  const connEl=$('connectionsList')||$('connections');connEl.innerHTML=renderExplore(h.connections||[]);const intEl=$('integrationList');if(intEl)intEl.innerHTML=renderExplore(h.integration||[]);
  $('references').innerHTML=(h.references||[]).map(x=>`<span class="bible-ref" data-ref="${esc(x.ref||'')}">${esc(x.label||x)}</span>`).join('');
  $('message').innerHTML=nl2br(h.message||'');
  bindRefs();
  const n=h.next?find(h.next):null; const btn=$('nextBtn');
  if(n){btn.style.display='block';btn.textContent=`다음: ${n.title} →`;btn.onclick=()=>go(n.slug||n.id)}
  else if(h.nextUrl){btn.style.display='block';btn.textContent=(h.nextLabel||'다음 시대로 이동')+' →';btn.onclick=()=>{location.href=h.nextUrl}}
  else{btn.style.display='none'}
  const hash = location.hash || '';
history.replaceState(null,'',`?hub=${h.slug||h.id}&v=20260618-m02-v31${hash}`);scrollToHash();
}
function renderPending(h){
  $('title').textContent=`${h.icon||''} ${h.title}`;
  $('subtitle').textContent=h.subtitle||'제작 예정';
  $('verse').textContent='이 허브는 다음 단계에서 제작할 예정입니다.';
  $('map').src='assets/maps/abraham-hub-map.png?v=20260618-m02-v31';
  $('caption').textContent='족장시대 허브 구조에 맞춰 PNG 교체형 지도 영역을 유지합니다.';
  $('events').innerHTML='<div class="item"><b>제작 예정</b>내용 추가 예정입니다.</div>';
  $('meanings').innerHTML='<li>내용 추가 예정</li>';
  const connEl=$('connectionsList')||$('connections');connEl.innerHTML='<span class="chip">준비중</span>';const intEl=$('integrationList');if(intEl)intEl.innerHTML='<span class="chip">준비중</span>';
  $('references').innerHTML='<span class="chip">준비중</span>';
  $('message').textContent='다음 제작 단계에서 완성합니다.';
  $('nextBtn').style.display='none';
  const hash = location.hash || '';
history.replaceState(null,'',`?hub=${h.slug||h.id}&v=20260618-m02-v31${hash}`);scrollToHash();
}
function go(slug){history.replaceState(null,'',`?hub=${slug}&v=20260618-m02-v31`);render(slug);window.scrollTo({top:0,behavior:'smooth'})}
function openList(){
  $('hubList').innerHTML=DATA.hubs.map(h=>`<button class="hubOpt" onclick="closeList();go('${h.slug||h.id}')">${h.icon||''} ${h.title}<small>${h.subtitle||''}${h.ready?'':' · 제작 예정'}</small></button>`).join('');
  $('dialog').classList.add('show')
}
function closeList(){$('dialog').classList.remove('show')}
function bindRefs(){document.querySelectorAll('.bible-ref').forEach(el=>{el.onclick=()=>toast('성경본문 팝업 연결을 위해 참조 ID를 미리 심어두었습니다: '+(el.dataset.ref||el.textContent));});}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.__toastTimer);window.__toastTimer=setTimeout(()=>t.classList.remove('show'),2600)}
init().catch(e=>{console.error(e);alert('허브 데이터를 불러오지 못했습니다.')});
