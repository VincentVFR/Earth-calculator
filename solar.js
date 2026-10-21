/* Classroom circular, coplanar orbit model; not live positions or ephemerides.
 * Rounded radii adapted from JPL J2000 semimajor axes (Earth simplified to 1 AU):
 * https://ssd.jpl.nasa.gov/planets/approx_pos.html
 * AU: IAU 2012 B2. Speed of light: SI defining constant. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.SolarModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';const AU_KM=149597870.7,C_KM_S=299792.458;
 const planets=[
 {id:'mercury',name:'Mercure',au:.387},{id:'venus',name:'Vénus',au:.723},{id:'earth',name:'Terre',au:1},{id:'mars',name:'Mars',au:1.524},
 {id:'jupiter',name:'Jupiter',au:5.203},{id:'saturn',name:'Saturne',au:9.537},{id:'uranus',name:'Uranus',au:19.189},{id:'neptune',name:'Neptune',au:30.070}
 ];
 function compare(from,to,angle){
 const a=planets.find(p=>p.id===from),b=planets.find(p=>p.id===to);
 if(!a||!b||!Number.isFinite(angle)||angle<0||angle>180)throw new RangeError('Planète ou angle invalide.');
 const t=angle*Math.PI/180,same=a.id===b.id,au=same?0:Math.hypot(a.au-b.au*Math.cos(t),b.au*Math.sin(t)),km=au*AU_KM;
 return {a,b,angle,au,km,lightSeconds:km/C_KM_S,minAu:same?0:Math.abs(a.au-b.au),maxAu:same?0:a.au+b.au,same};
 }
 return{planets,compare,AU_KM,C_KM_S};
});
