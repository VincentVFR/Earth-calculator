(function(){
'use strict';
const S=window.SolarModel,$=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const fmt=(n,d=3)=>new Intl.NumberFormat('fr-FR',{maximumFractionDigits:d}).format(n);
const el=(tag,attrs={},text)=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;};
for(const p of S.planets){for(const field of['planet-from','planet-to']){const o=document.createElement('option');o.value=p.id;o.textContent=p.name;$(field).append(o);}const li=document.createElement('li'),name=document.createElement('strong'),data=document.createElement('span');name.textContent=p.name;data.textContent=fmt(p.au)+' UA · '+fmt(p.au*S.AU_KM/1e6,1)+' M km';li.append(name,data);$('planet-reference').append(li);}
$('planet-from').value='earth';$('planet-to').value='mars';
function render(){
 const x=S.compare($('planet-from').value,$('planet-to').value,Number($('planet-angle').value));
 $('angle-value').textContent=fmt(x.angle,0)+'°';$('planet-angle').setAttribute('aria-valuetext',fmt(x.angle,0)+' degrés');
 $('solar-distance').textContent=fmt(x.km/1e6,1);$('solar-au').textContent=fmt(x.au)+' UA';
 $('solar-route').textContent=x.a.name+' → '+x.b.name;
 $('solar-light').textContent=fmt(x.lightSeconds/60,1)+' min';
 $('solar-min').textContent=fmt(x.minAu*S.AU_KM/1e6,1)+' M km';$('solar-max').textContent=fmt(x.maxAu*S.AU_KM/1e6,1)+' M km';
 $('solar-from-radius').textContent=x.a.name+' : '+fmt(x.a.au)+' UA du Soleil dans le modèle.';
 $('solar-to-radius').textContent=x.b.name+' : '+fmt(x.b.au)+' UA du Soleil dans le modèle.';
 $('solar-same').textContent=x.same?'Même planète sélectionnée : distance nulle. L’angle n’est pas appliqué à deux copies du même astre.':'Faites varier l’angle pour comprendre pourquoi la distance entre deux planètes change.';
 $('planet-angle').disabled=x.same;
 const g=$('orbit-drawing');g.replaceChildren();
 const scale=220/Math.max(x.a.au,x.b.au),r1=x.a.au*scale,r2=x.b.au*scale,t=x.angle*Math.PI/180;
 const a=[400+r1,290],b=x.same?a:[400+r2*Math.cos(t),290-r2*Math.sin(t)];
 for(const radius of[r1,r2])g.append(el('circle',{cx:400,cy:290,r:radius,'class':'solar-orbit'}));
 if(!x.same)g.append(el('path',{d:'M400 290L'+a.join(' ')+'M400 290L'+b.join(' '),'class':'solar-rays'}),el('line',{x1:a[0],y1:a[1],x2:b[0],y2:b[1],'class':'planet-connection'}));
 g.append(el('circle',{cx:400,cy:290,r:11,'class':'sun'}),el('text',{x:382,y:315,'text-anchor':'end','class':'sun-label'},'Soleil'));
 g.append(el('circle',{cx:a[0],cy:a[1],r:7,'class':'planet-a'}),el('text',{x:r1<35?450:a[0],y:r1<35?340:a[1]+26,'text-anchor':r1<35?'start':'middle','class':'city-label'},x.a.name));
 if(!x.same)g.append(el('circle',{cx:b[0],cy:b[1],r:7,'class':'planet-b'}),el('text',{x:r2<35?350:b[0],y:r2<35?245:b[1]-18,'text-anchor':r2<35?'end':'middle','class':'city-label'},x.b.name));
 $('orbits-title').textContent=x.a.name+' et '+x.b.name+' : angle relatif '+x.angle+' degrés';
}
for(const field of['planet-from','planet-to','planet-angle'])$(field).addEventListener('input',render);
const tabs=[$('earth-tab'),$('solar-tab')];
function mode(index,focus=false){tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;$(i===0?'earth-view':'solar-view').hidden=i!==index;});document.querySelector('.about-link').href=index===0?'#about':'#solar-about';if(focus)tabs[index].focus();window.dispatchEvent(new Event('resize'));}
tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>mode(i));tab.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();mode(e.key==='Home'?0:e.key==='End'?1:1-i,true);}});});
render();
})();
