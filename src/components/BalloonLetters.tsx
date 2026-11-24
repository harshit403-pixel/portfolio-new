import { useEffect, useRef, type CSSProperties } from "react";

/**
 * Balloon letters: glossy inflated type rendered with WebGL2.
 * Type any word, drag letters to squeeze and swap them, hold on empty space to inflate.
 */

interface Opts { text: string; color: string; onText?: (t: string) => void }
interface Engine { setText(t: string): void; setColor(c: string): void; getText(): string; destroy(): void }
interface Letter { ch: string; tex: WebGLTexture; t: number[]; slot: number[]; p: number[]; v: number[]; g: number; gv: number; k?: number; dying?: boolean }
interface Drag { l: Letter; ox: number; oy: number }

function createBalloons(cv: HTMLCanvasElement, opts: Opts): Engine {
const GW=640,GH=360,TS=288,FT=190,RT=42,INF=1e10;
const gl0=cv.getContext('webgl2');
if(!gl0)return{setText(){},setColor(){},getText:()=>'',destroy(){}};
const gl:WebGL2RenderingContext=gl0;
const ac=new AbortController();let dead=false,raf=0;
gl.getExtension('EXT_color_buffer_float');
const VS=`#version 300 es
layout(location=0) in vec2 a;void main(){gl_Position=vec4(a,0,1);}`;
const FS=`#version 300 es
precision highp float;
uniform sampler2D T;uniform vec2 uRes,uM,uV;uniform float uS,uCy,uT,uSc,uPr,uW;uniform vec3 uC;
out vec4 o;
const float R=42.;
vec2 sm(vec2 p){if(p.x<1.||p.y<1.||p.x>GW-1.||p.y>GH-1.)return vec2(0.);vec2 v=texture(T,p/vec2(GW,GH)).xy;return vec2(5.*log(v.x+1.),min(v.y,1.));}
float bx(vec2 p,vec2 c,vec2 h,float s){vec2 d=abs(p-c)-h;return 1.-smoothstep(0.,s,max(d.x,d.y));}
vec3 env(vec3 r){vec3 e=vec3(.03,.05,.03)+vec3(.12,.16,.1)*smoothstep(-.3,1.,r.y);
 e+=vec3(1.,1.,.95)*3.*bx(r.xy,vec2(-.42,.5),vec2(.2,.26),.18);
 e+=vec3(1.)*2.2*bx(r.xy,vec2(.5,.3),vec2(.07,.4),.12);
 e+=vec3(.9,1.,.8)*1.6*bx(r.xy,vec2(0.,.88),vec2(.5,.05),.12);
 e+=vec3(.5,.7,.3)*.8*bx(r.xy,vec2(.1,-.75),vec2(.5,.06),.2);return e;}
void main(){
 vec2 p=vec2(gl_FragCoord.x-uRes.x*.5,(uRes.y-gl_FragCoord.y)-uCy)/uS+vec2(GW,GH)*.5;
 vec2 c=vec2(GW,GH)*.5;vec2 q=(p-c)/uSc+c;
 vec2 dm=q-uM;float g=exp(-dot(dm,dm)/(2.*45.*45.));
 q-=uV*g*1.6;
 q+=uW*vec2(sin(q.y*.035+uT*8.),cos(q.x*.03+uT*7.))*(.4+g);
 q+=2.5*vec2(sin(uT*.9+q.y*.012),cos(uT*.7+q.x*.014));
 float k=1.-.38*uPr*g;
 float e=1.7;
 vec2 s0=sm(q);float z=s0.x*k;
 float zx=(sm(q+vec2(e,0)).x-sm(q-vec2(e,0)).x)*k/(2.*e),zy=(sm(q+vec2(0,e)).x-sm(q-vec2(0,e)).x)*k/(2.*e);
 float px=(sm(q+vec2(4,0)).y-sm(q-vec2(4,0)).y),py=(sm(q+vec2(0,4)).y-sm(q-vec2(0,4)).y);
 float P=s0.y;
 float a=smoothstep(1.,3.5,z);
 if(a<=0.){o=vec4(0.);return;}
 float ang=atan(py,px);float wr=sin(ang*13.+P*4.)*.5+.5;
 vec3 n=normalize(vec3(-zx,-zy,1.));
 n.xy+=P*.35*vec2(cos(ang+1.57),sin(ang+1.57))*(wr-.5);n=normalize(n);
 float av=(sm(q+vec2(9,0)).x+sm(q-vec2(9,0)).x+sm(q+vec2(0,9)).x+sm(q-vec2(0,9)).x)*.25*k;
 float cav=clamp((av-z)/9.,0.,1.);
 float ao=mix(.4,1.,smoothstep(0.,R*.8,z))*(1.-.65*cav);
 ao*=1.-.8*smoothstep(.5,1.,P)-.35*P*wr;
 vec3 L=normalize(vec3(-.5,.7,.8));
 float df=clamp(dot(n,L)*.6+.5,0.,1.);df=df*df*1.15+.1;
 vec3 col=uC*df*ao;
 col+=uC*.35*pow(1.-n.z,2.)*ao;
 vec3 r=2.*n.z*n-vec3(0,0,1);
 float F=.1+.9*pow(1.-max(n.z,0.),4.);
 col+=env(r)*(F+.12)*mix(.35,1.,ao)*(1.-.5*P);
 vec3 H=normalize(L+vec3(0,0,1));
 col+=vec3(1.)*pow(max(dot(n,H),0.),160.)*1.3*ao;
 col=pow(col,vec3(.92));
  o=vec4(col*a,a);}`;
// compose pass: each letter's height tile is stamped into a shared field (soft-max via exp sum)
const VS2=`#version 300 es
layout(location=0) in vec2 a;uniform vec2 uC,uH;out vec2 wp;
void main(){wp=uC+a*uH*1.5;gl_Position=vec4(wp/vec2(GW,GH)*2.-1.,0,1);}`;
const FS2=`#version 300 es
precision highp float;in vec2 wp;uniform sampler2D tile;uniform float uZ,uSq,uE;uniform vec2 uC,uH,uU;out vec4 o;
void main(){
 vec2 u=length(uU)>.01?normalize(uU):vec2(1.,0.),v=vec2(-u.y,u.x);
 vec2 w=wp-uC;float wu=dot(w,u),wv=dot(w,v);
 float ca=1.-.4*uSq,k=clamp(uE*wv/(uH.y*.9),-1.,1.)*.5+.5,cb=1.+uSq*(.7*k-.1);
 vec2 off=u*(wu/ca)+v*(wv/cb);
 vec2 t=texture(tile,off/uH*.5+.5).xy;
 o=vec4(exp(t.x*uZ*(1.+.18*uSq)/5.)-1.,t.y,0.,0.);}`;
const rep=(s:string)=>s.replace(/GW/g,GW+'.').replace(/GH/g,GH+'.');
function sh(t:number,s:string){const x=gl.createShader(t)!;gl.shaderSource(x,s);gl.compileShader(x);if(!gl.getShaderParameter(x,gl.COMPILE_STATUS))console.error(gl.getShaderInfoLog(x));return x}
function prog(v:string,f:string){const p=gl.createProgram()!;gl.attachShader(p,sh(gl.VERTEX_SHADER,rep(v)));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,rep(f)));gl.linkProgram(p);return p}
const pr=prog(VS,FS),pc=prog(VS2,FS2);
const U:Record<string,WebGLUniformLocation|null>={};['T','uRes','uM','uV','uS','uCy','uT','uSc','uPr','uW','uC'].forEach(n=>U[n]=gl.getUniformLocation(pr,n));
const UC:Record<string,WebGLUniformLocation|null>={};['tile','uZ','uC','uH','uSq','uU','uE'].forEach(n=>UC[n]=gl.getUniformLocation(pc,n));
const bTri=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,bTri);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const bQuad=gl.createBuffer()!;gl.bindBuffer(gl.ARRAY_BUFFER,bQuad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
function setTex(){gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE)}
const fbT=gl.createTexture()!;gl.bindTexture(gl.TEXTURE_2D,fbT);gl.texImage2D(gl.TEXTURE_2D,0,gl.RG16F,GW,GH,0,gl.RG,gl.HALF_FLOAT,null);setTex();
const fb=gl.createFramebuffer()!;gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,fbT,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);

// ---- distance transform + blur on w*h grids ----
const vv=new Int32Array(1024),zz=new Float32Array(1025),dd=new Float32Array(1024);
function d1(g:Float32Array,o:number,s:number,n:number){let k=0;vv[0]=0;zz[0]=-1e20;zz[1]=1e20;
 for(let q=1;q<n;q++){let t;for(;;){const p=vv[k];t=((g[o+q*s]+q*q)-(g[o+p*s]+p*p))/(2*q-2*p);if(t<=zz[k])k--;else break}k++;vv[k]=q;zz[k]=t;zz[k+1]=1e20}
 k=0;for(let q=0;q<n;q++){while(zz[k+1]<q)k++;const p=vv[k];dd[q]=(q-p)*(q-p)+g[o+p*s]}
 for(let q=0;q<n;q++)g[o+q*s]=dd[q]}
function edt(f:Float32Array,w:number,h:number){for(let x=0;x<w;x++)d1(f,x,w,h);for(let y=0;y<h;y++)d1(f,y*w,1,w);for(let i=0;i<f.length;i++)f[i]=Math.sqrt(f[i])}
function blur(a:Float32Array,w:number,h:number,r:number){const t=new Float32Array(a.length),n=2*r+1;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let s=0;for(let k=-r;k<=r;k++)s+=a[y*w+Math.min(w-1,Math.max(0,x+k))];t[y*w+x]=s/n}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let s=0;for(let k=-r;k<=r;k++)s+=t[Math.min(h-1,Math.max(0,y+k))*w+x];a[y*w+x]=s/n}}

// ---- one balloon-letter height tile per character (cached) ----
const mc=document.createElement('canvas');mc.width=mc.height=TS;const mx=mc.getContext('2d',{willReadFrequently:true})!;
const FONT='900 FSpx "Arial Black","Arial Rounded MT Bold",Impact,"Helvetica Neue",Arial,sans-serif';
const tiles:Record<string,WebGLTexture>={};
function getTile(ch:string):WebGLTexture{if(tiles[ch])return tiles[ch];
 const N=TS*TS;mx.clearRect(0,0,TS,TS);mx.font=FONT.replace('FS',String(FT));mx.textAlign='center';mx.lineJoin='round';mx.lineWidth=FT*.22;
 mx.fillText(ch,TS/2,TS/2+.36*FT);
 const d0=mx.getImageData(0,0,TS,TS).data;
 mx.strokeText(ch,TS/2,TS/2+.36*FT);
 const dt=mx.getImageData(0,0,TS,TS).data,s=new Uint8Array(N),th=new Uint8Array(N);
 for(let i=0;i<N;i++){s[i]=dt[i*4+3]>110?1:0;th[i]=d0[i*4+3]>110?1:0}
 // keep the narrow gaps of the plain glyph (E/F arms, inner corners) as creases so fat letters stay readable
 const slit=new Uint8Array(N);
 {const RC=22,a=new Float32Array(N),b=new Float32Array(N);
  for(let i=0;i<N;i++)a[i]=th[i]?0:INF;edt(a,TS,TS);
  for(let i=0;i<N;i++)b[i]=a[i]<=RC?INF:0;edt(b,TS,TS);
  const ro=new Uint8Array(N),st2=new Int32Array(N);let p2=0;
  const pu=(i:number)=>{if(!th[i]&&!ro[i]){ro[i]=1;st2[p2++]=i}};
  for(let x=0;x<TS;x++){pu(x);pu((TS-1)*TS+x)}for(let y=0;y<TS;y++){pu(y*TS);pu(y*TS+TS-1)}
  while(p2){const i=st2[--p2],x=i%TS;if(x>0)pu(i-1);if(x<TS-1)pu(i+1);if(i>=TS)pu(i-TS);if(i<N-TS)pu(i+TS)}
  const nt=new Uint8Array(N),sn=new Uint8Array(N);
  for(let i=0;i<N;i++)nt[i]=(!th[i]&&ro[i]&&b[i]>RC)?1:0;
  for(let i0=0;i0<N;i0++){if(!nt[i0]||sn[i0])continue;
   const comp:number[]=[i0];sn[i0]=1;let dm=0;
   for(let k=0;k<comp.length;k++){const i=comp[k];if(a[i]>dm)dm=a[i];const x=i%TS;
    for(const j of [x>0?i-1:-1,x<TS-1?i+1:-1,i>=TS?i-TS:-1,i<N-TS?i+TS:-1])if(j>=0&&nt[j]&&!sn[j]){sn[j]=1;comp.push(j)}}
   if(dm>=9.5&&comp.length>150)for(const i of comp)if(a[i]>=dm-4.5)slit[i]=1}}
 for(let i=0;i<N;i++)if(slit[i])s[i]=0;
 const reach=new Uint8Array(N),st=new Int32Array(N);let sp=0;
 const push=(i:number)=>{if(!s[i]&&!reach[i]){reach[i]=1;st[sp++]=i}};
 for(let x=0;x<TS;x++){push(x);push((TS-1)*TS+x)}for(let y=0;y<TS;y++){push(y*TS);push(y*TS+TS-1)}
 while(sp){const i=st[--sp],x=i%TS;if(x>0)push(i-1);if(x<TS-1)push(i+1);if(i>=TS)push(i-TS);if(i<N-TS)push(i+TS)}
 const f=new Float32Array(N),hf=new Float32Array(N),Z=new Float32Array(N),P=new Float32Array(N);let nh=0;
 const hole=new Uint8Array(N),dh=new Float32Array(N);
 for(let i=0;i<N;i++){const h=!s[i]&&!reach[i]&&!slit[i];if(h)nh++;hole[i]=h?1:0;dh[i]=h?INF:0;f[i]=(s[i]||h)?INF:0;hf[i]=INF}
 edt(f,TS,TS);
 if(nh){edt(dh,TS,TS);const seen=new Uint8Array(N);
  for(let i0=0;i0<N;i0++){if(!hole[i0]||seen[i0])continue;
   const comp:number[]=[i0];seen[i0]=1;let dm=0;
   for(let a=0;a<comp.length;a++){const i=comp[a];if(dh[i]>dm)dm=dh[i];const x=i%TS;
    for(const j of [x>0?i-1:-1,x<TS-1?i+1:-1,i>=TS?i-TS:-1,i<N-TS?i+TS:-1])if(j>=0&&hole[j]&&!seen[j]){seen[j]=1;comp.push(j)}}
   for(const i of comp)if(dh[i]>=dm-2.5)hf[i]=0}
  edt(hf,TS,TS)}
 for(let i=0;i<N;i++){const d=f[i];if(d<=0)continue;
  const t=Math.min(d/RT,1);let z=RT*Math.sqrt(1-(1-t)*(1-t))+.45*Math.max(d-RT,0);
  if(nh){const p=Math.exp(-hf[i]/(RT*.22));z*=1-.8*p;P[i]=p}Z[i]=z}
 blur(Z,TS,TS,2);blur(Z,TS,TS,2);blur(Z,TS,TS,2);blur(Z,TS,TS,2);blur(P,TS,TS,2);blur(P,TS,TS,2);
 const out=new Float32Array(N*2);for(let i=0;i<N;i++){out[i*2]=Z[i];out[i*2+1]=Math.min(1,P[i]*1.1)}
 const tx=gl.createTexture()!;gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,tx);gl.pixelStorei(gl.UNPACK_ALIGNMENT,1);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RG16F,TS,TS,0,gl.RG,gl.FLOAT,out);setTex();
 return tiles[ch]=tx}

// ---- layout: target place + size for every letter ----
const lc=document.createElement('canvas').getContext('2d')!;
function layout(text:string):{ch:string;t:number[]}[]{
 text=text.toUpperCase().trim();if(!text)return[];
 let lines=text.split(/\s+/).slice(0,3);
 if(lines.length==1&&text.length>7){const n=Math.ceil(text.length/7),per=Math.ceil(text.length/n);lines=[];for(let i=0;i<n;i++)lines.push(text.slice(i*per,(i+1)*per))}
 lines=lines.map(l=>l.slice(0,7));
 lc.font=FONT.replace('FS','100');
 const W=lines.map(l=>[...l].map(c=>lc.measureText(c).width/100+.07));
 const wmax=Math.max(...W.map(a=>a.reduce((x,y)=>x+y,0)));
 const fs=Math.min(GH*.9/(lines.length*.84+.24),.92*GW/wmax/.85);
 const out:{ch:string;t:number[]}[]=[];
 lines.forEach((l,li)=>{
  const ws=W[li].map(w=>w*fs*.96),tot=ws.reduce((a,b)=>a+b,0);
  const sx=1,f=Math.min(1.1,Math.max(.88,.92*GW/tot)),x0=(GW-tot*f)/2;
  const cy=GH/2+(li-(lines.length-1)/2)*.84*fs;let cum=0;
  [...l].forEach((ch,ci)=>{out.push({ch,t:[x0+(cum+ws[ci]/2)*f,cy,fs/FT,sx]});cum+=ws[ci]})});
 return out}

// ---- live balloons: spring toward targets, new ones inflate and shove the rest ----
let letters:Letter[]=[];
let curText='';let drag:Drag|null=null;
const alive=()=>letters.filter(l=>!l.dying);
function assign(){const B=layout(curText),A=alive();A.forEach((l,i)=>{if(!B[i])return;l.slot=B[i].t;if(!(drag&&drag.l===l))l.t=B[i].t.slice()})}
function setText(text:string){
 drag=null;curText=text.toUpperCase().trim();
 const B=layout(text),A=alive();
 let p=0;while(p<A.length&&p<B.length&&A[p].ch===B[p].ch)p++;
 let q=0;while(q<A.length-p&&q<B.length-p&&A[A.length-1-q].ch===B[B.length-1-q].ch)q++;
 const mid=A.slice(p,A.length-q),old=letters.filter(l=>l.dying);
 mid.forEach(l=>{l.dying=true;l.k=0});
 const news:Letter[]=[];for(let i=p;i<B.length-q;i++){getTile(B[i].ch);news.push({ch:B[i].ch,tex:tiles[B[i].ch],t:B[i].t.slice(),slot:B[i].t,p:B[i].t.slice(),v:[0,0,0,0],g:.03,gv:0})}
 letters=[...A.slice(0,p),...news,...A.slice(A.length-q),...mid,...old];
 assign();
 for(const l of letters)l.tex=getTile(l.ch)}
// dragging: carried balloon squeezes its neighbours; crossing one swaps places and shifts the rest along
function pick(x:number,y:number):Letter|null{let best:Letter|null=null,bd=1e9;for(const l of alive()){const s=l.p[2]*Math.max(l.g,0);if(s<.05)continue;const dx=(x-l.p[0])/(FT*.5*s*l.p[3]),dy=(y-l.p[1])/(FT*.42*s),d=dx*dx+dy*dy;if(d<1&&d<bd){bd=d;best=l}}return best}
function endDrag(){if(!drag)return;drag.l.k=0;drag=null;assign()}
function dragStep(){if(!drag)return;const d=drag.l,A=alive(),i=A.indexOf(d);if(i<0){drag=null;return}
 const s=d.slot[2];
 const hx=.58*FT*s*1.12,hy=.5*FT*s*1.12;
 d.t[0]=Math.max(hx,Math.min(GW-hx,m.x+drag.ox));d.t[1]=Math.max(hy,Math.min(GH-hy,m.y+drag.oy));d.t[2]=s*1.12;
 const T=A.map(o=>o===d?d.t.slice():o.slot.slice()),Dm=.76*FT*s;
 for(let it=0;it<6;it++)for(let a=0;a<A.length;a++)for(let b=a+1;b<A.length;b++){
  const oa=A[a],ob=A[b],pa=T[a],pb=T[b],rest=Math.hypot(oa.slot[0]-ob.slot[0],oa.slot[1]-ob.slot[1]);
  const D=(oa===d||ob===d)?Dm:rest*.95,dx=pb[0]-pa[0],dy=pb[1]-pa[1],dist=Math.hypot(dx,dy)||.01;
  if(dist>=D)continue;
  const push=D-dist,ux=dx/dist,uy=dy/dist,wa=oa===d?0:1,wb=ob===d?0:1,ws=wa+wb;
  pa[0]-=ux*push*wa/ws;pa[1]-=uy*push*wa/ws;pb[0]+=ux*push*wb/ws;pb[1]+=uy*push*wb/ws}
 A.forEach((o,j)=>{if(o===d)return;
  const dx=o.p[0]-d.p[0],dy=o.p[1]-d.p[1],dist=Math.hypot(dx,dy)||1,pen=Math.max(0,Math.min(1,(Dm*1.05-dist)/(Dm*.5))),disp=Math.hypot(T[j][0]-o.slot[0],T[j][1]-o.slot[1])/90,sq=Math.min(1,Math.max(pen,disp*.8));
  const ux=dx/dist,uy=dy/dist,vx=-uy,vy=ux;let esc=0;
  for(const q of A){if(q===o)continue;const rx=q.p[0]-o.p[0],ry=q.p[1]-o.p[1],rd=Math.hypot(rx,ry)||1,w=Math.max(0,1-rd/(1.4*FT*s));esc-=w*(rx*vx+ry*vy)/rd}
  for(const [nx,ny,wd] of [[-1,0,o.p[0]],[1,0,GW-o.p[0]],[0,-1,o.p[1]],[0,1,GH-o.p[1]]]){const w=Math.max(0,1-wd/(1.2*FT*s));esc-=w*(nx*vx+ny*vy)}
  esc=Math.max(-1,Math.min(1,esc*1.3));
  o.t=[Math.max(hx,Math.min(GW-hx,T[j][0]+vx*esc*sq*40)),Math.max(hy,Math.min(GH-hy,T[j][1]+vy*esc*sq*40)),o.slot[2],1,sq,ux,uy,esc]});
 {let sx=0,sy=0,mp=0,wt=0;
  for(let j=0;j<A.length;j++){const o=A[j];if(o===d)continue;
   const dx=d.p[0]-o.p[0],dy=d.p[1]-o.p[1],dist=Math.hypot(dx,dy)||1,pen=Math.max(0,Math.min(1,(Dm*1.05-dist)/(Dm*.5))),disp=Math.hypot(T[j][0]-o.slot[0],T[j][1]-o.slot[1])/90*.8,w=Math.min(1,Math.max(pen,disp));
   if(w>0){sx+=dx/dist*w;sy+=dy/dist*w;wt+=w;if(w>mp)mp=w}}
  const ln=Math.hypot(sx,sy)||1,ux=sx/ln,uy=sy/ln,vx=-uy,vy=ux;let esc=0;
  for(const q of A){if(q===d)continue;const rx=q.p[0]-d.p[0],ry=q.p[1]-d.p[1],rd=Math.hypot(rx,ry)||1,w=Math.max(0,1-rd/(1.4*FT*s));esc-=w*(rx*vx+ry*vy)/rd}
  esc=Math.max(-1,Math.min(1,esc*1.3));
  d.t[3]=1;d.t[4]=mp*.9;d.t[5]=wt?ux:0;d.t[6]=wt?uy:0;d.t[7]=esc}
 const own=Math.hypot(d.p[0]-d.slot[0],d.p[1]-d.slot[1]);let bj=-1,bd=own*.75;
 A.forEach((o,j)=>{if(j===i)return;const dj=Math.hypot(d.p[0]-o.slot[0],d.p[1]-o.slot[1]);if(dj<bd){bd=dj;bj=j}});
 if(bj>=0){A.splice(i,1);A.splice(bj,0,d);letters=[...A,...letters.filter(l=>l.dying)];
  let k=0;curText=curText.replace(/\S/g,c=>k<A.length?A[k++].ch:c);opts.onText?.(curText);assign()}}
function step(){dragStep();
 for(const l of letters){
  for(let i=0;i<8;i++){l.v[i]=(l.v[i]||0)+((l.t[i]||0)-(l.p[i]||0))*(i>3?.12:(l.k||.05));l.v[i]*=i>3?.76:.85;l.p[i]=(l.p[i]||0)+l.v[i]}
  const tg=l.dying?0:1;l.gv+=(tg-l.g)*.1;l.gv*=.84;l.g+=l.gv}
 letters=letters.filter(l=>!(l.dying&&l.g<.02))}
function compose(){
 gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.viewport(0,0,GW,GH);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.useProgram(pc);
 gl.bindBuffer(gl.ARRAY_BUFFER,bQuad);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 gl.activeTexture(gl.TEXTURE1);gl.uniform1i(UC.tile,1);
 for(const l of letters){const g=Math.max(0,l.g),sy=l.p[2]*g;if(sy<.005)continue;
  gl.bindTexture(gl.TEXTURE_2D,l.tex);
  gl.uniform2f(UC.uC,l.p[0],l.p[1]);gl.uniform2f(UC.uH,TS/2*sy*l.p[3],TS/2*sy);gl.uniform1f(UC.uZ,sy);gl.uniform1f(UC.uSq,Math.max(0,Math.min(1.2,l.p[4]||0)));gl.uniform2f(UC.uU,l.p[5]||0,l.p[6]||0);gl.uniform1f(UC.uE,Math.max(-1,Math.min(1,l.p[7]||0)));
  gl.drawArrays(gl.TRIANGLE_STRIP,0,4)}
 gl.disable(gl.BLEND);gl.bindFramebuffer(gl.FRAMEBUFFER,null)}

// ---- interaction ----
let dpr=1,res=[1,1],S=1,Cy=0;
function size(){dpr=Math.min(window.devicePixelRatio||1,2);cv.width=Math.max(1,Math.round((cv.clientWidth||innerWidth)*dpr));cv.height=Math.max(1,Math.round((cv.clientHeight||innerHeight)*dpr));res=[cv.width,cv.height];
 S=Math.min(res[0]/GW,res[1]*.92/GH);Cy=res[1]*.5}
const ro=new ResizeObserver(size);ro.observe(cv);size();
const m={x:-999,y:-999,vx:0,vy:0,down:0,w:0,pr:0,pv:0,sc:1,sv:0,seen:0};
function toTex(e:PointerEvent):[number,number]{const r=cv.getBoundingClientRect();return[(((e.clientX-r.left)*dpr-res[0]/2)/S+GW/2),(((e.clientY-r.top)*dpr-Cy)/S+GH/2)]}
cv.addEventListener('pointermove',e=>{const[x,y]=toTex(e);if(m.seen){const dx=x-m.x,dy=y-m.y;m.vx=m.vx*.7+dx*.3;m.vy=m.vy*.7+dy*.3;m.w=Math.min(5,m.w+Math.hypot(dx,dy)*.04)}m.x=x;m.y=y;m.seen=1;if(drag){m.vx=m.vy=0;m.w=0}},{signal:ac.signal});
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);const[x,y]=toTex(e);m.x=x;m.y=y;m.seen=1;const l=pick(x,y);
 if(l){drag={l,ox:l.p[0]-x,oy:l.p[1]-y};l.k=.22;m.down=0;m.vx=m.vy=0}else m.down=1},{signal:ac.signal});
const up=()=>{m.down=0;endDrag()};window.addEventListener('pointerup',up,{signal:ac.signal});window.addEventListener('pointercancel',up,{signal:ac.signal});
cv.addEventListener('pointerleave',()=>{if(!m.down){m.x=m.y=-999;m.seen=0}},{signal:ac.signal});
let hex=[.608,.773,.239];
function setColor(v:string){hex=[1,3,5].map(i=>parseInt(v.substr(i,2),16)/255)}
setColor(opts.color);setText(opts.text);
const t0=performance.now();
function frame(now:number){
 if(dead)return;
 const t=(now-t0)/1000;
 m.vx*=.9;m.vy*=.9;m.w*=.96;
 m.pv+=(m.down-m.pr)*.2;m.pv*=.78;m.pr+=m.pv;
 const tgt=m.down?1.07:1;m.sv+=(tgt-m.sc)*.12;m.sv*=.8;m.sc+=m.sv;
 step();compose();
 gl.viewport(0,0,res[0],res[1]);gl.useProgram(pr);
 gl.bindBuffer(gl.ARRAY_BUFFER,bTri);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
 gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,fbT);
 gl.uniform1i(U.T,0);gl.uniform2f(U.uRes,res[0],res[1]);gl.uniform2f(U.uM,m.x,m.y);
 gl.uniform2f(U.uV,Math.max(-40,Math.min(40,m.vx)),Math.max(-40,Math.min(40,m.vy)));
 gl.uniform1f(U.uS,S);gl.uniform1f(U.uCy,Cy);gl.uniform1f(U.uT,t);gl.uniform1f(U.uSc,m.sc);gl.uniform1f(U.uPr,m.pr);gl.uniform1f(U.uW,m.w);
 gl.uniform3f(U.uC,hex[0],hex[1],hex[2]);
 gl.drawArrays(gl.TRIANGLES,0,3);raf=requestAnimationFrame(frame)}
raf=requestAnimationFrame(frame);
return{setText,setColor,getText:()=>curText,destroy(){dead=true;cancelAnimationFrame(raf);ac.abort();ro.disconnect();gl.getExtension('WEBGL_lose_context')?.loseContext()}};
}

export interface BalloonLettersProps {
  /** The word(s) to show. Spaces start a new line (max 3 lines, 7 letters each). */
  text?: string;
  /** Balloon color as a #rrggbb hex string. */
  color?: string;
  /** Called when the user drags letters into a new order. */
  onTextChange?: (text: string) => void;
  className?: string;
  style?: CSSProperties;
}

export default function BalloonLetters({ text = "portfolio", color = "#9bc53d", onTextChange, className, style }: BalloonLettersProps) {
  const ref = useRef<HTMLCanvasElement>(null);
  const eng = useRef<Engine | null>(null);
  const cb = useRef(onTextChange);
  cb.current = onTextChange;

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const e = createBalloons(c, { text, color, onText: (t) => cb.current?.(t) });
    eng.current = e;
    return () => { e.destroy(); eng.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const e = eng.current;
    if (e && e.getText() !== text.toUpperCase().trim()) e.setText(text);
  }, [text]);

  useEffect(() => { eng.current?.setColor(color); }, [color]);

  return (
    <canvas
      ref={ref}
      className={className}
      style={{ width: "100%", height: "100%", display: "block", touchAction: "none", background: "var(--bg)", ...style }}
    />
  );
}
