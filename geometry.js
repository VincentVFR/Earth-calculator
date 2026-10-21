/* Spherical great-circle geometry; coordinates are [longitude, latitude]. */
(function(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GlobeMath = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function() {
  'use strict';
  const R = 6371.0088, rad = Math.PI / 180, deg = 180 / Math.PI;
  function validate(p) {
    if (!Array.isArray(p) || p.length !== 2 || !p.every(Number.isFinite) || Math.abs(p[0]) > 180 || Math.abs(p[1]) > 90)
      throw new RangeError('Coordonnées invalides : longitude −180…180, latitude −90…90.');
    return p;
  }
  const vector = p => { validate(p); const a=p[0]*rad,b=p[1]*rad; return [Math.cos(b)*Math.cos(a),Math.cos(b)*Math.sin(a),Math.sin(b)]; };
  const dot = (a,b) => a.reduce((s,x,i)=>s+x*b[i],0);
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const norm = a => Math.hypot(...a);
  function angle(a,b) { const u=vector(a),v=vector(b); return Math.atan2(norm(cross(u,v)),dot(u,v)); }
  function distance(a,b) { return R*angle(a,b); }
  function greatCircle(a,b,steps=180) {
    if (!Number.isInteger(steps) || steps<2 || steps>3600) throw new RangeError('Résolution invalide.');
    const u=vector(a),v=vector(b),theta=angle(a,b);
    if(theta<1e-12) return [a.slice(),b.slice()];
    let axis=cross(u,v);
    // Exact antipodes have infinitely many shortest arcs: choose one reproducibly.
    if(norm(axis)<1e-12) axis=cross(u,Math.abs(u[2])<0.9?[0,0,1]:[0,1,0]);
    const n=norm(axis); axis=axis.map(x=>x/n);
    const tangent=cross(axis,u);
    return Array.from({length:steps+1},(_,i)=>{
      if(i===0)return a.slice(); if(i===steps)return b.slice();
      const t=theta*i/steps,p=u.map((x,j)=>x*Math.cos(t)+tangent[j]*Math.sin(t));
      return [Math.atan2(p[1],p[0])*deg,Math.atan2(p[2],Math.hypot(p[0],p[1]))*deg];
    });
  }
  // Unwrap longitudes for a continuous Mapbox line and tight antimeridian bounds.
  function unwrap(points) {
    let previous;
    return points.map(p=>{ let x=p[0]; if(previous!==undefined){while(x-previous>180)x-=360;while(x-previous < -180)x+=360;} previous=x;return[x,p[1]]; });
  }
  function bounds(points) { const p=unwrap(points);return [[Math.min(...p.map(x=>x[0])),Math.min(...p.map(x=>x[1]))],[Math.max(...p.map(x=>x[0])),Math.max(...p.map(x=>x[1]))]]; }
  function midpoint(a,b) { const p=greatCircle(a,b,2); return p[Math.floor(p.length/2)]; }
  return {R,validate,distance,greatCircle,unwrap,bounds,midpoint};
});
