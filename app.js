'use strict';
const $=s=>document.querySelector(s),cfg=INVITACION,audio=$('#audio'),date=new Date(cfg.fecha);
const format=options=>new Intl.DateTimeFormat('es-AR',{timeZone:'America/Argentina/Buenos_Aires',...options}).format(date);
const longDate=format({day:'numeric',month:'long',year:'numeric'}),shortDate=format({day:'2-digit',month:'2-digit',year:'numeric'}),time=format({hour:'2-digit',minute:'2-digit',hourCycle:'h23'})+' h';
const fill=(s,v)=>document.querySelectorAll(s).forEach(el=>el.textContent=v);
fill('[data-name]',cfg.nombre);fill('[data-initial]',Array.from(cfg.nombre)[0] || 'S');fill('[data-date]',longDate);fill('[data-short-date]',shortDate);fill('[data-time]',time);
$('#vitral-trigger').setAttribute('aria-label','Abrir el vitral de '+cfg.nombre);
document.title=cfg.nombre+' · Nuestra boda | Víspera';$('#venue').textContent=cfg.salon;$('#address').textContent=cfg.direccion;$('#deadline').textContent=cfg.confirmarAntes;$('#dress-code').textContent=cfg.vestimenta;$('#dress-note').textContent=cfg.notaVestimenta;
if(!cfg.demo){$('.demo-label').textContent='NUESTRA BODA';$('#demo-footer').textContent='Diseñado por Víspera Invitaciones.';$('#venue-note').hidden=true;$('#rsvp-help').textContent='Se abrirá WhatsApp con tu mensaje listo para enviar.';}
const iso=v=>new Date(v).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');
$('#calendar').href='https://calendar.google.com/calendar/render?'+new URLSearchParams({action:'TEMPLATE',text:'Casamiento de '+cfg.nombre,dates:iso(cfg.fecha)+'/'+iso(cfg.fin),location:cfg.salon+', '+cfg.direccion,details:cfg.demo?'Evento ficticio de muestra de Víspera.':'¡Los esperamos para celebrar nuestro casamiento!',ctz:'America/Argentina/Buenos_Aires'});
$('#directions').href='https://www.google.com/maps/dir/?api=1&destination='+encodeURIComponent(cfg.direccion);
cfg.momentos.forEach(m=>{const card=document.createElement('article');[['span',m.icono],['time',m.hora+' h'],['h3',m.titulo],['p',m.texto]].forEach(([tag,value])=>{const el=document.createElement(tag);el.textContent=value;card.append(el);});$('#timeline').append(card);});
function countdown(){const n=Math.max(0,Math.floor((date-Date.now())/1000));const values=[Math.floor(n/86400),Math.floor(n/3600)%24,Math.floor(n/60)%60,n%60];['days','hours','minutes','seconds'].forEach((id,i)=>{const el=$('#'+id),v=String(values[i]).padStart(2,'0');if(el.textContent!==v){el.textContent=v;el.classList.remove('tick');void el.offsetWidth;el.classList.add('tick');}});if(n===0)$('#count-status').textContent='¡Llegó nuestro gran día!';}countdown();setInterval(countdown,1000);
audio.volume=.3;function musicState(){const on=!audio.paused;$('#music-button').setAttribute('aria-pressed',String(on));$('#music-button').setAttribute('aria-label',on?'Pausar música':'Reproducir música');$('#music-button span').textContent=on?'Pausar':'Música';}audio.addEventListener('play',musicState);audio.addEventListener('pause',musicState);
async function play(){try{await audio.play();$('#audio-error').textContent='';}catch{$('#audio-error').textContent='Tocá Música para activar el sonido.';}musicState();}
$('#music-button').addEventListener('click',()=>audio.paused?play():audio.pause());
const observer='IntersectionObserver' in window?new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.remove('pending');observer.unobserve(e.target);}}),{threshold:.08}):null;
let openingTimer=null, opening=false;
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
function showInvitation(){
 openingTimer=null; $('#cover').hidden=true; $('#invitation').hidden=false; $('#music-button').hidden=false;
 $('#invitation').classList.add('letter-unfold');
 if(!$('#map').getAttribute('src'))$('#map').src='https://maps.google.com/maps?q='+encodeURIComponent(cfg.direccion)+'&z=13&output=embed';
 if(observer)document.querySelectorAll('.reveal').forEach(el=>{el.classList.add('pending');observer.observe(el);});
 const heading=$('.hero h2');heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
}
function open(sound){
 if(opening)return; opening=true;
 $('#vitral-trigger').setAttribute('aria-expanded','true');
 ['#vitral-trigger','#open','#open-silent'].forEach(s=>$(s).disabled=true);
 if(sound)play();
 $('#cover').classList.add('is-opening');$('#opening-status').textContent='Se abren las puertas de nuestra historia…';
 openingTimer=setTimeout(showInvitation,reducedMotion.matches?100:3000);
}
$('#open').addEventListener('click',()=>open(true));$('#vitral-trigger').addEventListener('click',()=>open(true));$('#open-silent').addEventListener('click',()=>open(false));
function replay(){
 clearTimeout(openingTimer);openingTimer=null;opening=false;audio.pause();
 $('#cover').hidden=false;$('#cover').classList.remove('is-opening');$('#invitation').hidden=true;$('#invitation').classList.remove('letter-unfold');
 $('#music-button').hidden=true;$('#audio-error').textContent='';$('#opening-status').textContent='';
 $('#vitral-trigger').setAttribute('aria-expanded','false');['#vitral-trigger','#open','#open-silent'].forEach(s=>$(s).disabled=false);
 $('#vitral-trigger').focus({preventScroll:true});window.scrollTo({top:0,behavior:'instant'});
}
$('#replay').addEventListener('click',replay);$('header a').addEventListener('click',e=>{e.preventDefault();replay();});
function send(message,feedback){if(cfg.demo||!/^\d{8,15}$/.test(cfg.whatsapp)){feedback.hidden=false;feedback.textContent='Vista previa · no se envía ningún mensaje\n\n'+message;return;}window.location.href='https://wa.me/'+cfg.whatsapp+'?text='+encodeURIComponent(message);}
function value(input){const text=input.value.trim();input.setCustomValidity(text?'':'Completá este campo.');if(!text)input.reportValidity();return text;}
$('#rsvp-form').addEventListener('submit',e=>{e.preventDefault();const name=value($('#guest'));if(!name)return;send(`Hola, soy ${name}. ${$('#answer').value==='yes'?'Confirmo mi asistencia':'No voy a poder asistir'} al casamiento de ${cfg.nombre}, el ${longDate}. ¡Gracias por la invitación!`,$('#rsvp-feedback'));});
$('#song-form').addEventListener('submit',e=>{e.preventDefault();const song=value($('#song'));if(song)send(`¡Hola! Paral casamiento de ${cfg.nombre}, recomiendo esta canción: ${song}.`,$('#song-feedback'));});
['#guest','#song'].forEach(s=>$(s).addEventListener('input',()=>$(s).setCustomValidity('')));
