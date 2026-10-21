/* GlobePath: local calculations and schematic globe; optional detailed Mapbox map. */
(function(){
'use strict';
const G=window.GlobeMath,$=id=>document.getElementById(id),NS='http://www.w3.org/2000/svg';
const cities=[
{name:'Paris',country:'France',coords:[2.3522,48.8566]},
{name:'Tokyo',country:'Japon',coords:[139.6917,35.6895]},
{name:'Londres',country:'Royaume-Uni',coords:[-0.1276,51.5072]},
{name:'New York',country:'États-Unis',coords:[-74.006,40.7128]},
{name:'Sydney',country:'Australie',coords:[151.2093,-33.8688]},
{name:'Santiago',country:'Chili',coords:[-70.6693,-33.4489]},
{name:'Mexico',country:'Mexique',coords:[-99.1332,19.4326]},
{name:'Singapour',country:'Singapour',coords:[103.8198,1.3521]},
{name:'Le Cap',country:'Afrique du Sud',coords:[18.4241,-33.9249]},
{name:'Reykjavík',country:'Islande',coords:[-21.9426,64.1466]}
];
const selected={departure:cities[0],destination:cities[1]};
let endpoints={...selected};
let route=G.greatCircle(selected.departure.coords,selected.destination.coords),center=G.midpoint(selected.departure.coords,selected.destination.coords),map=null,mapReady=false,markers=[];
const number=new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0});
const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
cities.forEach(city=>{const o=document.createElement('option');o.value=city.name;$('known-cities').append(o);});
function hint(city){return city.country+' · '+Math.abs(city.coords[1]).toFixed(2).replace('.',',')+'° '+(city.coords[1]>=0?'N':'S')+' / '+Math.abs(city.coords[0]).toFixed(2).replace('.',',')+'° '+(city.coords[0]>=0?'E':'O');}
function setCity(field,city){selected[field]=city;$(field).value=city.name;$(field+'-hint').textContent=hint(city);$(field).removeAttribute('aria-invalid');$(field+'-results').hidden=true;}
for(const field of ['departure','destination']){
 $(field).addEventListener('input',()=>{selected[field]=null;cancelSearch(field);$(field+'-results').hidden=true;$(field).removeAttribute('aria-invalid');$(field+'-hint').textContent='Ville proposée ou latitude, longitude (ex. 48.86, 2.35).';});
 $(field).addEventListener('keydown',event=>{if(event.key==='Escape'){$(field+'-results').hidden=true;cancelSearch(field);}});
 $(field).addEventListener('change',()=>{const city=cities.find(c=>normalize(c.name)===normalize($(field).value));if(city)setCity(field,city);});
}
function el(tag,attrs={},text){const node=document.createElementNS(NS,tag);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,v);if(text!==undefined)node.textContent=text;return node;}
function project(point){const l=(point[0]-center[0])*Math.PI/180,p=point[1]*Math.PI/180,c=center[1]*Math.PI/180;return{x:400+246*Math.cos(p)*Math.sin(l),y:320-246*(Math.cos(c)*Math.sin(p)-Math.sin(c)*Math.cos(p)*Math.cos(l)),visible:Math.sin(c)*Math.sin(p)+Math.cos(c)*Math.cos(p)*Math.cos(l)>=0};}
function path(points,front=true){let d='',active=false;for(const p of points){const q=project(p);if(q.visible!==front){active=false;continue;}d+=(active?'L':'M')+q.x.toFixed(2)+','+q.y.toFixed(2);active=true;}return d;}
function draw(){
 const grid=$('graticule');grid.replaceChildren();
 for(let lon=-180;lon<180;lon+=20){const points=Array.from({length:181},(_,i)=>[lon,i-90]);grid.append(el('path',{d:path(points),'class':'grid-line'}));}
 for(let lat=-80;lat<=80;lat+=20){const points=Array.from({length:361},(_,i)=>[i-180,lat]);grid.append(el('path',{d:path(points),'class':'grid-line'}));}
 $('globe-route').replaceChildren(el('path',{d:path(route,false),'class':'route-line route-back'}),el('path',{d:path(route),'class':'route-line'}));
 const points=$('globe-points');points.replaceChildren();
 for(const field of ['departure','destination']){const city=endpoints[field];if(!city)continue;const p=project(city.coords);if(p.visible){points.append(el('circle',{cx:p.x,cy:p.y,r:5,'class':'endpoint'}),el('text',{x:p.x+11,y:p.y-11,'class':'city-label'},city.name));}}
}
function updateDetailedMap(){
 if(!mapReady)return;
 const coordinates=G.unwrap(route),data={type:'Feature',properties:{},geometry:{type:'LineString',coordinates}};
 if(map.getSource('route'))map.getSource('route').setData(data);
 else{map.addSource('route',{type:'geojson',data});map.addLayer({id:'route',type:'line',source:'route',paint:{'line-color':'#245a44','line-width':3}});}
 markers.forEach(m=>m.remove());markers=['departure','destination'].map(field=>new mapboxgl.Marker({color:'#245a44'}).setLngLat(endpoints[field].coords).addTo(map));
 map.fitBounds(G.bounds(route),{padding:70,maxZoom:5,duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:800});
}
const cache=new Map(),pending={},generation={departure:0,destination:0};let lastRequest=0;
function cancelSearch(field){generation[field]++;pending[field]?.abort();delete pending[field];const b=document.querySelector('[data-search="'+field+'"]');if(b)b.disabled=false;$(field).removeAttribute('aria-busy');}
function coordinates(value){
 const match=value.trim().match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
 if(!match)return null;const coords=[Number(match[2]),Number(match[1])];
 try{G.validate(coords);}catch(_){return null;}
 return {name:coords[1].toFixed(2)+'°, '+coords[0].toFixed(2)+'°',country:'Coordonnées',coords};
}
function results(field,matches){
 const list=$(field+'-results');list.replaceChildren();
 for(const city of matches){const li=document.createElement('li'),b=document.createElement('button');b.type='button';b.textContent=city.name+' · '+city.country;b.addEventListener('click',()=>{cancelSearch(field);setCity(field,city);$(field).focus();$('form-message').textContent='';});li.append(b);list.append(li);}
 list.hidden=!matches.length;return matches.length;
}
async function search(field){
 cancelSearch(field);const ticket=generation[field],query=$(field).value.trim(),key=normalize(query),coord=coordinates(query);
 if(coord){setCity(field,coord);$('form-message').textContent='Coordonnées sélectionnées. Vous pouvez calculer.';return;}
 const matches=cities.filter(c=>normalize(c.name).includes(key));
 if(query.length<2){$('form-message').textContent='Saisissez au moins deux lettres ou une latitude et une longitude.';return;}
 if(matches.length){results(field,matches);$('form-message').textContent=matches.length+' ville(s) proposée(s). Choisissez un résultat.';return;}
 if(cache.has(key)){results(field,cache.get(key));return;}
 const endpoint=window.GlobeConfig?.geocodingEndpoint;
 if(!endpoint){$('form-message').textContent='Ville absente de la liste locale. Saisissez latitude, longitude (ex. 52.52, 13.405).';return;}
 if(query.length>100){$('form-message').textContent='La recherche est trop longue (100 caractères maximum).';return;}
 if(Date.now()-lastRequest<1100){$('form-message').textContent='Patientez une seconde avant une nouvelle recherche.';return;}
 let url;try{url=new URL(endpoint);if(url.protocol!=='https:')throw Error();}catch(_){$('form-message').textContent='Le service de recherche est mal configuré. Les coordonnées restent disponibles.';return;}
 lastRequest=Date.now();const controller=new AbortController();pending[field]=controller;
 const button=document.querySelector('[data-search="'+field+'"]');button.disabled=true;$(field).setAttribute('aria-busy','true');$('form-message').textContent='Recherche en cours…';
 const timeout=setTimeout(()=>controller.abort(),8000);
 try{
 url.searchParams.set('q',query);url.searchParams.set('format','json');url.searchParams.set('limit','5');url.searchParams.set('addressdetails','1');
 const response=await fetch(url,{signal:controller.signal,headers:{Accept:'application/json'}});if(!response.ok)throw Error('service');
 const payload=await response.json();if(!Array.isArray(payload))throw Error('format');
 const found=payload.slice(0,5).flatMap(row=>{const coords=[Number(row.lon),Number(row.lat)];try{G.validate(coords);}catch(_){return [];}return [{name:String(row.display_name||'Lieu').slice(0,180),country:String(row.address?.country||'Résultat cartographique'),coords}];});
 if(ticket!==generation[field])return;
 cache.set(key,found);results(field,found);$('form-message').textContent=found.length?'Choisissez un résultat, puis calculez.':'Aucun lieu trouvé. Essayez les coordonnées.';
 }catch(_){if(ticket===generation[field])$('form-message').textContent='Recherche indisponible. Utilisez une ville proposée ou des coordonnées.';}
 finally{clearTimeout(timeout);button.disabled=false;$(field).removeAttribute('aria-busy');if(pending[field]===controller)delete pending[field];}
}
document.querySelectorAll('[data-search]').forEach(b=>b.addEventListener('click',()=>search(b.dataset.search)));
document.addEventListener('click',event=>{for(const field of ['departure','destination'])if(!$(field).closest('.field').contains(event.target))$(field+'-results').hidden=true;});
function calculate(){
 for(const field of ['departure','destination']){if(!selected[field]){const city=cities.find(c=>normalize(c.name)===normalize($(field).value));if(city)setCity(field,city);else{const coordinate=coordinates($(field).value);if(coordinate)setCity(field,coordinate);}}}
 const missing=['departure','destination'].find(f=>!selected[f]);
 if(missing){$(missing).setAttribute('aria-invalid','true');$('form-message').textContent='Sélectionnez une ville ou des coordonnées valides dans le champ '+(missing==='departure'?'de départ.':'d’arrivée.');$(missing).focus();return;}
 const a=selected.departure,b=selected.destination;endpoints={...selected};route=G.greatCircle(a.coords,b.coords);center=G.midpoint(a.coords,b.coords);
 const distance=G.distance(a.coords,b.coords);$('distance').textContent=number.format(distance);$('route-label').textContent=a.name+' → '+b.name;
 $('route-note').textContent=distance<.001?'Les deux points sont identiques.':Math.abs(distance-Math.PI*G.R)<.001?'Points antipodaux : plusieurs arcs minimaux existent.':'Distance sur une sphère, hors trajet routier.';
 $('form-message').textContent='';$('globe-title').textContent='Arc de grand cercle entre '+a.name+' et '+b.name;draw();updateDetailedMap();
}
$('route-form').addEventListener('submit',e=>{e.preventDefault();calculate();});
$('swap').addEventListener('click',()=>{const a=selected.departure,b=selected.destination;if(!a||!b){$('form-message').textContent='Sélectionnez les deux villes avant de les inverser.';return;}setCity('departure',b);setCity('destination',a);calculate();});
const examples={'paris-tokyo':[0,1],'london-newyork':[2,3],'sydney-santiago':[4,5]};
document.querySelectorAll('[data-example]').forEach(b=>b.addEventListener('click',()=>{const [a,z]=examples[b.dataset.example];setCity('departure',cities[a]);setCity('destination',cities[z]);calculate();}));
$('rotate-left').addEventListener('click',()=>{center[0]-=25;draw();if(mapReady)map.easeTo({bearing:map.getBearing()-25,duration:0});});
$('rotate-right').addEventListener('click',()=>{center[0]+=25;draw();if(mapReady)map.easeTo({bearing:map.getBearing()+25,duration:0});});
$('recenter').addEventListener('click',()=>{if(endpoints.departure&&endpoints.destination){center=G.midpoint(endpoints.departure.coords,endpoints.destination.coords);draw();updateDetailedMap();}});
function fallback(){if(map){map.remove();map=null;}mapReady=false;$('map').hidden=true;$('globe').hidden=false;$('map-mode').textContent='Globe schématique';$('map-status').textContent='Carte détaillée indisponible · calcul et globe schématique disponibles';}
async function detailedMap(){
 const token=window.GlobeConfig?.mapboxToken;if(!token)return;
 try{
 const link=document.createElement('link');link.rel='stylesheet';link.href='https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';document.head.append(link);
 await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';script.onload=resolve;script.onerror=reject;document.head.append(script);});
 $('map').hidden=false;
 map=new mapboxgl.Map({container:'map',accessToken:token,style:'mapbox://styles/mapbox/light-v11',projection:'globe',center,zoom:1.5});
 map.addControl(new mapboxgl.NavigationControl({showCompass:false}),'top-right');
 const loadTimeout=setTimeout(()=>{if(!mapReady)fallback();},12000);
 map.once('load',()=>{clearTimeout(loadTimeout);mapReady=true;$('globe').hidden=true;$('map-mode').textContent='Carte détaillée';$('map-status').textContent='Carte © Mapbox © OpenStreetMap · distance orthodromique';updateDetailedMap();});
 map.on('error',()=>{clearTimeout(loadTimeout);fallback();});
 }catch(_){fallback();}
}
for(const field of ['departure','destination'])setCity(field,selected[field]);
calculate();detailedMap();
window.GlobePath={cities,setCity,calculate};
})();
