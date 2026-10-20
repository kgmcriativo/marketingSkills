// Hero: fluido iridescente em WebGL (fbm com domain warping) + lente de vidro, reativo ao mouse e à rolagem.
(function () {
  const hero = document.querySelector('.hero');
  const canvas = document.getElementById('hero-gl');
  if (!hero || !canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'high-performance' });
  if (!gl) return;

  const vs = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  const fs = `
precision highp float;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uScroll;
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<4;i++){v+=a*noise(p);p=m*p;a*=.5;}return v;}
vec3 field(vec2 p,float t){
  vec2 q=vec2(fbm(p+t*.07),fbm(p+vec2(5.2,1.3)-t*.05));
  vec2 r=vec2(fbm(p+2.2*q+vec2(1.7,9.2)+t*.09),fbm(p+2.2*q+vec2(8.3,2.8)-t*.07));
  float f=fbm(p+2.2*r);
  vec3 ink=vec3(.015,.025,.015),moss=vec3(.17,.24,.15),olive=vec3(.40,.46,.34),tan=vec3(.80,.60,.32),cream=vec3(.92,.90,.80);
  vec3 c=mix(ink,moss,smoothstep(.15,.65,f));
  c=mix(c,olive,smoothstep(.45,.9,length(q))*.7);
  c=mix(c,tan,smoothstep(.4,1.,r.x)*.9);
  c=mix(c,cream,smoothstep(.62,1.05,f+r.y*.35)*.7);
  return c*(.6+f*1.15);
}
void main(){
  vec2 uv=gl_FragCoord.xy/uRes; float asp=uRes.x/uRes.y;
  vec2 pos=vec2(uv.x*asp,uv.y);
  vec2 p=(uv-.5)*vec2(asp,1.)*1.7; p.y+=uScroll*.35;
  vec2 m=(uMouse-.5)*vec2(asp,1.)*1.7; vec2 dm=p-m; float md=dot(dm,dm);
  float w=exp(-md*2.2); p+=dm*w*.28+vec2(-dm.y,dm.x)*w*.45;
  vec2 ctr=vec2(1.007*asp,1.167); vec2 dv=pos-ctr; float d=length(dv); float k=d/1.0;
  float t=uTime;
  vec3 col;
  if(k<1.){
    vec2 dir=normalize(dv); float bend=pow(k,3.);
    vec2 p2=p*.86-dir*bend*.22; col=field(p2+vec2(.6,-.3),t*1.15)*1.12;
    col+=vec3(.9,.72,.42)*smoothstep(.93,1.,k)*(.55+.45*sin(atan(dv.y,dv.x)*2.+t*.3));
    col*=1.-smoothstep(.985,1.,k)*.7;
  } else {
    col=field(p,t); col*=mix(.45,1.,smoothstep(1.,1.09,k));
  }
  col*=mix(.8,1.,smoothstep(0.,.5,1.-uv.y));
  col+=(hash(gl_FragCoord.xy+fract(t)*91.7)-.5)*.08;
  gl_FragColor=vec4(pow(max(col,0.),vec3(.95)),1.);
}`;
  const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const v = mk(gl.VERTEX_SHADER, vs), f = mk(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) return;
  const prog = gl.createProgram(); gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = n => gl.getUniformLocation(prog, n);
  const uRes = U('uRes'), uTime = U('uTime'), uMouse = U('uMouse'), uScroll = U('uScroll');

  const scale = 0.7;
  const resize = () => {
    canvas.width = Math.max(2, Math.round(hero.clientWidth * scale));
    canvas.height = Math.max(2, Math.round(hero.clientHeight * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize(); addEventListener('resize', resize);
  hero.classList.add('gl-on');

  const mouse = { x: .5, y: .5, tx: .5, ty: .5 };
  addEventListener('pointermove', e => {
    const r = hero.getBoundingClientRect();
    mouse.tx = (e.clientX - r.left) / r.width; mouse.ty = 1 - (e.clientY - r.top) / r.height;
  }, { passive: true });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let visible = true, t0 = performance.now();
  new IntersectionObserver(es => { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(hero);
  const frame = now => {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    mouse.x += (mouse.tx - mouse.x) * 0.05; mouse.y += (mouse.ty - mouse.y) * 0.05;
    const sc = Math.min(1, Math.max(0, scrollY / innerHeight));
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, reduce ? 4 : (now - t0) / 1000 + 4);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uScroll, sc);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  requestAnimationFrame(frame);
})();
