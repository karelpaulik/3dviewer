(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();const rc="182",po={ROTATE:0,DOLLY:1,PAN:2},ao={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},s_=0,Vd=1,r_=2,Ml=1,o_=2,oa=3,As=0,$n=1,Jn=2,Es=0,mo=1,Gd=2,Wd=3,Xd=4,a_=5,_r=100,l_=101,c_=102,h_=103,u_=104,d_=200,f_=201,p_=202,m_=203,Eh=204,Th=205,g_=206,__=207,x_=208,y_=209,v_=210,b_=211,S_=212,M_=213,w_=214,Ah=0,Rh=1,Ch=2,So=3,Ph=4,Ih=5,Lh=6,Dh=7,Wu=0,E_=1,T_=2,ts=0,Zp=1,Kp=2,Qp=3,Xu=4,Jp=5,em=6,tm=7,jd="attached",A_="detached",nm=300,Cr=301,Mo=302,Nh=303,Uh=304,oc=306,Pr=1e3,Oi=1001,Ma=1002,fn=1003,ju=1004,lo=1005,pn=1006,pa=1007,Zi=1008,di=1009,im=1010,sm=1011,wa=1012,Yu=1013,os=1014,Ai=1015,Rs=1016,$u=1017,qu=1018,Ea=1020,rm=35902,om=35899,am=1021,lm=1022,pi=1023,Cs=1026,vr=1027,Zu=1028,Ku=1029,wo=1030,Qu=1031,Ju=1033,wl=33776,El=33777,Tl=33778,Al=33779,Fh=35840,Oh=35841,kh=35842,Bh=35843,zh=36196,Hh=37492,Vh=37496,Gh=37488,Wh=37489,Xh=37490,jh=37491,Yh=37808,$h=37809,qh=37810,Zh=37811,Kh=37812,Qh=37813,Jh=37814,eu=37815,tu=37816,nu=37817,iu=37818,su=37819,ru=37820,ou=37821,au=36492,lu=36494,cu=36495,hu=36283,uu=36284,du=36285,fu=36286,Eo=2300,To=2301,vc=2302,Yd=2400,$d=2401,qd=2402,R_=2500,C_=0,cm=1,pu=2,P_=3200,ed=0,I_=1,bs="",Qt="srgb",kn="srgb-linear",Ul="linear",Dt="srgb",Hr=7680,Zd=519,L_=512,D_=513,N_=514,td=515,U_=516,F_=517,nd=518,O_=519,mu=35044,Kd="300 es",Ki=2e3,Fl=2001;function hm(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function k_(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Ta(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function B_(){const s=Ta("canvas");return s.style.display="block",s}const Qd={};function Ol(...s){const e="THREE."+s.shift();console.log(e,...s)}function Oe(...s){const e="THREE."+s.shift();console.warn(e,...s)}function Ke(...s){const e="THREE."+s.shift();console.error(e,...s)}function Aa(...s){const e=s.join(" ");e in Qd||(Qd[e]=!0,Oe(...s))}function z_(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}class Nr{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const i=n[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,e);e.target=null}}}const In=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Jd=1234567;const ma=Math.PI/180,Ao=180/Math.PI;function Bi(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(In[s&255]+In[s>>8&255]+In[s>>16&255]+In[s>>24&255]+"-"+In[e&255]+In[e>>8&255]+"-"+In[e>>16&15|64]+In[e>>24&255]+"-"+In[t&63|128]+In[t>>8&255]+"-"+In[t>>16&255]+In[t>>24&255]+In[n&255]+In[n>>8&255]+In[n>>16&255]+In[n>>24&255]).toLowerCase()}function dt(s,e,t){return Math.max(e,Math.min(t,s))}function id(s,e){return(s%e+e)%e}function H_(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function V_(s,e,t){return s!==e?(t-s)/(e-s):0}function ga(s,e,t){return(1-t)*s+t*e}function G_(s,e,t,n){return ga(s,e,1-Math.exp(-t*n))}function W_(s,e=1){return e-Math.abs(id(s,e*2)-e)}function X_(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function j_(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function Y_(s,e){return s+Math.floor(Math.random()*(e-s+1))}function $_(s,e){return s+Math.random()*(e-s)}function q_(s){return s*(.5-Math.random())}function Z_(s){s!==void 0&&(Jd=s);let e=Jd+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function K_(s){return s*ma}function Q_(s){return s*Ao}function J_(s){return(s&s-1)===0&&s!==0}function e0(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function t0(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function n0(s,e,t,n,i){const r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),h=o((e+n)/2),u=r((e-n)/2),d=o((e-n)/2),f=r((n-e)/2),g=o((n-e)/2);switch(i){case"XYX":s.set(a*h,l*u,l*d,a*c);break;case"YZY":s.set(l*d,a*h,l*u,a*c);break;case"ZXZ":s.set(l*u,l*d,a*h,a*c);break;case"XZX":s.set(a*h,l*g,l*f,a*c);break;case"YXY":s.set(l*f,a*h,l*g,a*c);break;case"ZYZ":s.set(l*g,l*f,a*h,a*c);break;default:Oe("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function Ui(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function Nt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const Ro={DEG2RAD:ma,RAD2DEG:Ao,generateUUID:Bi,clamp:dt,euclideanModulo:id,mapLinear:H_,inverseLerp:V_,lerp:ga,damp:G_,pingpong:W_,smoothstep:X_,smootherstep:j_,randInt:Y_,randFloat:$_,randFloatSpread:q_,seededRandom:Z_,degToRad:K_,radToDeg:Q_,isPowerOfTwo:J_,ceilPowerOfTwo:e0,floorPowerOfTwo:t0,setQuaternionFromProperEuler:n0,normalize:Nt,denormalize:Ui};class Ne{constructor(e=0,t=0){Ne.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=dt(this.x,e.x,t.x),this.y=dt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=dt(this.x,e,t),this.y=dt(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(dt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(dt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*i+e.x,this.y=r*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ut{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,o,a){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3],d=r[o+0],f=r[o+1],g=r[o+2],_=r[o+3];if(a<=0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a>=1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=_;return}if(u!==_||l!==d||c!==f||h!==g){let m=l*d+c*f+h*g+u*_;m<0&&(d=-d,f=-f,g=-g,_=-_,m=-m);let p=1-a;if(m<.9995){const y=Math.acos(m),b=Math.sin(y);p=Math.sin(p*y)/b,a=Math.sin(a*y)/b,l=l*p+d*a,c=c*p+f*a,h=h*p+g*a,u=u*p+_*a}else{l=l*p+d*a,c=c*p+f*a,h=h*p+g*a,u=u*p+_*a;const y=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=y,c*=y,h*=y,u*=y}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,o){const a=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+h*u+l*f-c*d,e[t+1]=l*g+h*d+c*u-a*f,e[t+2]=c*g+h*f+a*d-l*u,e[t+3]=h*g-a*u-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(i/2),u=a(r/2),d=l(n/2),f=l(i/2),g=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"YZX":this._x=d*h*u+c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u-d*f*g;break;case"XZY":this._x=d*h*u-c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u+d*f*g;break;default:Oe("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+a+u;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-i)*f}else if(n>a&&n>u){const f=2*Math.sqrt(1+n-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(r+c)/f}else if(a>u){const f=2*Math.sqrt(1+a-n-u);this._w=(r-c)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-n-a);this._w=(o-i)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(dt(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+i*c-r*l,this._y=i*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-i*a,this._w=o*h-n*a-i*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let n=e._x,i=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,i=-i,r=-r,o=-o,a=-a);let l=1-t;if(a<.9995){const c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+i*t,this._z=this._z*l+r*t,this._w=this._w*l+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class D{constructor(e=0,t=0,n=0){D.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ef.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ef.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*i-a*n),h=2*(a*t-r*i),u=2*(r*n-o*t);return this.x=t+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=i+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=dt(this.x,e.x,t.x),this.y=dt(this.y,e.y,t.y),this.z=dt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=dt(this.x,e,t),this.y=dt(this.y,e,t),this.z=dt(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(dt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=i*l-r*a,this.y=r*o-n*l,this.z=n*a-i*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return bc.copy(this).projectOnVector(e),this.sub(bc)}reflect(e){return this.sub(bc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(dt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const bc=new D,ef=new Ut;class ot{constructor(e,t,n,i,r,o,a,l,c){ot.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,l,c)}set(e,t,n,i,r,o,a,l,c){const h=this.elements;return h[0]=e,h[1]=i,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],_=i[0],m=i[3],p=i[6],y=i[1],b=i[4],v=i[7],M=i[2],E=i[5],A=i[8];return r[0]=o*_+a*y+l*M,r[3]=o*m+a*b+l*E,r[6]=o*p+a*v+l*A,r[1]=c*_+h*y+u*M,r[4]=c*m+h*b+u*E,r[7]=c*p+h*v+u*A,r[2]=d*_+f*y+g*M,r[5]=d*m+f*b+g*E,r[8]=d*p+f*v+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*r*h+n*a*l+i*r*c-i*o*l}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,g=t*u+n*d+i*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=u*_,e[1]=(i*c-h*n)*_,e[2]=(a*n-i*o)*_,e[3]=d*_,e[4]=(h*t-i*l)*_,e[5]=(i*r-a*t)*_,e[6]=f*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*r)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-i*c,i*l,-i*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Sc.makeScale(e,t)),this}rotate(e){return this.premultiply(Sc.makeRotation(-e)),this}translate(e,t){return this.premultiply(Sc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Sc=new ot,tf=new ot().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),nf=new ot().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function i0(){const s={enabled:!0,workingColorSpace:kn,spaces:{},convert:function(i,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Dt&&(i.r=Ts(i.r),i.g=Ts(i.g),i.b=Ts(i.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Dt&&(i.r=go(i.r),i.g=go(i.g),i.b=go(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===bs?Ul:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,o){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return Aa("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return Aa("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[kn]:{primaries:e,whitePoint:n,transfer:Ul,toXYZ:tf,fromXYZ:nf,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Qt},outputColorSpaceConfig:{drawingBufferColorSpace:Qt}},[Qt]:{primaries:e,whitePoint:n,transfer:Dt,toXYZ:tf,fromXYZ:nf,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Qt}}}),s}const xt=i0();function Ts(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function go(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let Vr;class um{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Vr===void 0&&(Vr=Ta("canvas")),Vr.width=e.width,Vr.height=e.height;const i=Vr.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=Vr}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Ta("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=Ts(r[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Ts(t[n]/255)*255):t[n]=Ts(t[n]);return{data:t,width:e.width,height:e.height}}else return Oe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let s0=0;class ac{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:s0++}),this.uuid=Bi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(Mc(i[o].image)):r.push(Mc(i[o]))}else r=Mc(i);n.url=r}return t||(e.images[this.uuid]=n),n}}function Mc(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?um.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(Oe("Texture: Unable to serialize Texture."),{})}let r0=0;const wc=new D;class yn extends Nr{constructor(e=yn.DEFAULT_IMAGE,t=yn.DEFAULT_MAPPING,n=Oi,i=Oi,r=pn,o=Zi,a=pi,l=di,c=yn.DEFAULT_ANISOTROPY,h=bs){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:r0++}),this.uuid=Bi(),this.name="",this.source=new ac(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Ne(0,0),this.repeat=new Ne(1,1),this.center=new Ne(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ot,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(wc).x}get height(){return this.source.getSize(wc).y}get depth(){return this.source.getSize(wc).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Oe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){Oe(`Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==nm)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Pr:e.x=e.x-Math.floor(e.x);break;case Oi:e.x=e.x<0?0:1;break;case Ma:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Pr:e.y=e.y-Math.floor(e.y);break;case Oi:e.y=e.y<0?0:1;break;case Ma:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}yn.DEFAULT_IMAGE=null;yn.DEFAULT_MAPPING=nm;yn.DEFAULT_ANISOTROPY=1;class Yt{constructor(e=0,t=0,n=0,i=1){Yt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const b=(c+1)/2,v=(f+1)/2,M=(p+1)/2,E=(h+d)/4,A=(u+_)/4,P=(g+m)/4;return b>v&&b>M?b<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(b),i=E/n,r=A/n):v>M?v<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(v),n=E/i,r=P/i):M<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(M),n=A/r,i=P/r),this.set(n,i,r,t),this}let y=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(u-_)/y,this.z=(d-h)/y,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=dt(this.x,e.x,t.x),this.y=dt(this.y,e.y,t.y),this.z=dt(this.z,e.z,t.z),this.w=dt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=dt(this.x,e,t),this.y=dt(this.y,e,t),this.z=dt(this.z,e,t),this.w=dt(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(dt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class o0 extends Nr{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:pn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Yt(0,0,e,t),this.scissorTest=!1,this.viewport=new Yt(0,0,e,t);const i={width:e,height:t,depth:n.depth},r=new yn(i);this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:pn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const i=Object.assign({},e.textures[t].image);this.textures[t].source=new ac(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ns extends o0{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class dm extends yn{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=fn,this.minFilter=fn,this.wrapR=Oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class a0 extends yn{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=fn,this.minFilter=fn,this.wrapR=Oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class qn{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Li.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Li.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Li.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Li):Li.fromBufferAttribute(r,o),Li.applyMatrix4(e.matrixWorld),this.expandByPoint(Li);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Ga.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ga.copy(n.boundingBox)),Ga.applyMatrix4(e.matrixWorld),this.union(Ga)}const i=e.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Li),Li.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Yo),Wa.subVectors(this.max,Yo),Gr.subVectors(e.a,Yo),Wr.subVectors(e.b,Yo),Xr.subVectors(e.c,Yo),Ds.subVectors(Wr,Gr),Ns.subVectors(Xr,Wr),rr.subVectors(Gr,Xr);let t=[0,-Ds.z,Ds.y,0,-Ns.z,Ns.y,0,-rr.z,rr.y,Ds.z,0,-Ds.x,Ns.z,0,-Ns.x,rr.z,0,-rr.x,-Ds.y,Ds.x,0,-Ns.y,Ns.x,0,-rr.y,rr.x,0];return!Ec(t,Gr,Wr,Xr,Wa)||(t=[1,0,0,0,1,0,0,0,1],!Ec(t,Gr,Wr,Xr,Wa))?!1:(Xa.crossVectors(Ds,Ns),t=[Xa.x,Xa.y,Xa.z],Ec(t,Gr,Wr,Xr,Wa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Li).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Li).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ds[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ds[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ds[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ds[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ds[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ds[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ds[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ds[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ds),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const ds=[new D,new D,new D,new D,new D,new D,new D,new D],Li=new D,Ga=new qn,Gr=new D,Wr=new D,Xr=new D,Ds=new D,Ns=new D,rr=new D,Yo=new D,Wa=new D,Xa=new D,or=new D;function Ec(s,e,t,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){or.fromArray(s,r);const a=i.x*Math.abs(or.x)+i.y*Math.abs(or.y)+i.z*Math.abs(or.z),l=e.dot(or),c=t.dot(or),h=n.dot(or);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const l0=new qn,$o=new D,Tc=new D;class cs{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):l0.setFromPoints(e).getCenter(n);let i=0;for(let r=0,o=e.length;r<o;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;$o.subVectors(e,this.center);const t=$o.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector($o,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Tc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint($o.copy(e.center).add(Tc)),this.expandByPoint($o.copy(e.center).sub(Tc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const fs=new D,Ac=new D,ja=new D,Us=new D,Rc=new D,Ya=new D,Cc=new D;class Bo{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,fs)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=fs.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(fs.copy(this.origin).addScaledVector(this.direction,t),fs.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){Ac.copy(e).add(t).multiplyScalar(.5),ja.copy(t).sub(e).normalize(),Us.copy(this.origin).sub(Ac);const r=e.distanceTo(t)*.5,o=-this.direction.dot(ja),a=Us.dot(this.direction),l=-Us.dot(ja),c=Us.lengthSq(),h=Math.abs(1-o*o);let u,d,f,g;if(h>0)if(u=o*l-a,d=o*a-l,g=r*h,u>=0)if(d>=-g)if(d<=g){const _=1/h;u*=_,d*=_,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(Ac).addScaledVector(ja,d),f}intersectSphere(e,t){fs.subVectors(e.center,this.origin);const n=fs.dot(this.direction),i=fs.dot(fs)-n*n,r=e.radius*e.radius;if(i>r)return null;const o=Math.sqrt(r-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,i=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,i=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,o=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,o=(e.min.y-d.y)*h),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),u>=0?(a=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(a=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,fs)!==null}intersectTriangle(e,t,n,i,r){Rc.subVectors(t,e),Ya.subVectors(n,e),Cc.crossVectors(Rc,Ya);let o=this.direction.dot(Cc),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Us.subVectors(this.origin,e);const l=a*this.direction.dot(Ya.crossVectors(Us,Ya));if(l<0)return null;const c=a*this.direction.dot(Rc.cross(Us));if(c<0||l+c>o)return null;const h=-a*Us.dot(Cc);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ye{constructor(e,t,n,i,r,o,a,l,c,h,u,d,f,g,_,m){Ye.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,l,c,h,u,d,f,g,_,m)}set(e,t,n,i,r,o,a,l,c,h,u,d,f,g,_,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ye().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinant()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinant()===0)return this.identity();const t=this.elements,n=e.elements,i=1/jr.setFromMatrixColumn(e,0).length(),r=1/jr.setFromMatrixColumn(e,1).length(),o=1/jr.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const d=o*h,f=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+g*c,t[5]=d-_*c,t[9]=-a*l,t[2]=_-d*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const d=l*h,f=l*u,g=c*h,_=c*u;t[0]=d+_*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=_+d*a,t[10]=o*l}else if(e.order==="ZXY"){const d=l*h,f=l*u,g=c*h,_=c*u;t[0]=d-_*a,t[4]=-o*u,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=_-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const d=o*h,f=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=g*c-f,t[8]=d*c+_,t[1]=l*u,t[5]=_*c+d,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const d=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=_-d*u,t[8]=g*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*u+g,t[10]=d-_*u}else if(e.order==="XZY"){const d=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+_,t[5]=o*h,t[9]=f*u-g,t[2]=g*u-f,t[6]=a*h,t[10]=_*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(c0,e,h0)}lookAt(e,t,n){const i=this.elements;return li.subVectors(e,t),li.lengthSq()===0&&(li.z=1),li.normalize(),Fs.crossVectors(n,li),Fs.lengthSq()===0&&(Math.abs(n.z)===1?li.x+=1e-4:li.z+=1e-4,li.normalize(),Fs.crossVectors(n,li)),Fs.normalize(),$a.crossVectors(li,Fs),i[0]=Fs.x,i[4]=$a.x,i[8]=li.x,i[1]=Fs.y,i[5]=$a.y,i[9]=li.y,i[2]=Fs.z,i[6]=$a.z,i[10]=li.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],_=n[6],m=n[10],p=n[14],y=n[3],b=n[7],v=n[11],M=n[15],E=i[0],A=i[4],P=i[8],S=i[12],T=i[1],L=i[5],k=i[9],H=i[13],Y=i[2],W=i[6],j=i[10],V=i[14],q=i[3],he=i[7],ue=i[11],de=i[15];return r[0]=o*E+a*T+l*Y+c*q,r[4]=o*A+a*L+l*W+c*he,r[8]=o*P+a*k+l*j+c*ue,r[12]=o*S+a*H+l*V+c*de,r[1]=h*E+u*T+d*Y+f*q,r[5]=h*A+u*L+d*W+f*he,r[9]=h*P+u*k+d*j+f*ue,r[13]=h*S+u*H+d*V+f*de,r[2]=g*E+_*T+m*Y+p*q,r[6]=g*A+_*L+m*W+p*he,r[10]=g*P+_*k+m*j+p*ue,r[14]=g*S+_*H+m*V+p*de,r[3]=y*E+b*T+v*Y+M*q,r[7]=y*A+b*L+v*W+M*he,r[11]=y*P+b*k+v*j+M*ue,r[15]=y*S+b*H+v*V+M*de,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],f=e[14],g=e[3],_=e[7],m=e[11],p=e[15],y=l*f-c*d,b=a*f-c*u,v=a*d-l*u,M=o*f-c*h,E=o*d-l*h,A=o*u-a*h;return t*(_*y-m*b+p*v)-n*(g*y-m*M+p*E)+i*(g*b-_*M+p*A)-r*(g*v-_*E+m*A)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],f=e[11],g=e[12],_=e[13],m=e[14],p=e[15],y=u*m*c-_*d*c+_*l*f-a*m*f-u*l*p+a*d*p,b=g*d*c-h*m*c-g*l*f+o*m*f+h*l*p-o*d*p,v=h*_*c-g*u*c+g*a*f-o*_*f-h*a*p+o*u*p,M=g*u*l-h*_*l-g*a*d+o*_*d+h*a*m-o*u*m,E=t*y+n*b+i*v+r*M;if(E===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/E;return e[0]=y*A,e[1]=(_*d*r-u*m*r-_*i*f+n*m*f+u*i*p-n*d*p)*A,e[2]=(a*m*r-_*l*r+_*i*c-n*m*c-a*i*p+n*l*p)*A,e[3]=(u*l*r-a*d*r-u*i*c+n*d*c+a*i*f-n*l*f)*A,e[4]=b*A,e[5]=(h*m*r-g*d*r+g*i*f-t*m*f-h*i*p+t*d*p)*A,e[6]=(g*l*r-o*m*r-g*i*c+t*m*c+o*i*p-t*l*p)*A,e[7]=(o*d*r-h*l*r+h*i*c-t*d*c-o*i*f+t*l*f)*A,e[8]=v*A,e[9]=(g*u*r-h*_*r-g*n*f+t*_*f+h*n*p-t*u*p)*A,e[10]=(o*_*r-g*a*r+g*n*c-t*_*c-o*n*p+t*a*p)*A,e[11]=(h*a*r-o*u*r-h*n*c+t*u*c+o*n*f-t*a*f)*A,e[12]=M*A,e[13]=(h*_*i-g*u*i+g*n*d-t*_*d-h*n*m+t*u*m)*A,e[14]=(g*a*i-o*_*i-g*n*l+t*_*l+o*n*m-t*a*m)*A,e[15]=(o*u*i-h*a*i+h*n*l-t*u*l-o*n*d+t*a*d)*A,this}scale(e){const t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,h*a+n,h*l-i*o,0,c*l-i*a,h*l+i*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,o){return this.set(1,n,r,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,g=r*u,_=o*h,m=o*u,p=a*u,y=l*c,b=l*h,v=l*u,M=n.x,E=n.y,A=n.z;return i[0]=(1-(_+p))*M,i[1]=(f+v)*M,i[2]=(g-b)*M,i[3]=0,i[4]=(f-v)*E,i[5]=(1-(d+p))*E,i[6]=(m+y)*E,i[7]=0,i[8]=(g+b)*A,i[9]=(m-y)*A,i[10]=(1-(d+_))*A,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;if(e.x=i[12],e.y=i[13],e.z=i[14],this.determinant()===0)return n.set(1,1,1),t.identity(),this;let r=jr.set(i[0],i[1],i[2]).length();const o=jr.set(i[4],i[5],i[6]).length(),a=jr.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),Di.copy(this);const c=1/r,h=1/o,u=1/a;return Di.elements[0]*=c,Di.elements[1]*=c,Di.elements[2]*=c,Di.elements[4]*=h,Di.elements[5]*=h,Di.elements[6]*=h,Di.elements[8]*=u,Di.elements[9]*=u,Di.elements[10]*=u,t.setFromRotationMatrix(Di),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,i,r,o,a=Ki,l=!1){const c=this.elements,h=2*r/(t-e),u=2*r/(n-i),d=(t+e)/(t-e),f=(n+i)/(n-i);let g,_;if(l)g=r/(o-r),_=o*r/(o-r);else if(a===Ki)g=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===Fl)g=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,r,o,a=Ki,l=!1){const c=this.elements,h=2/(t-e),u=2/(n-i),d=-(t+e)/(t-e),f=-(n+i)/(n-i);let g,_;if(l)g=1/(o-r),_=o/(o-r);else if(a===Ki)g=-2/(o-r),_=-(o+r)/(o-r);else if(a===Fl)g=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const jr=new D,Di=new Ye,c0=new D(0,0,0),h0=new D(1,1,1),Fs=new D,$a=new D,li=new D,sf=new Ye,rf=new Ut;class Ii{constructor(e=0,t=0,n=0,i=Ii.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,r=i[0],o=i[4],a=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(dt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-dt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(dt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-dt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(dt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-dt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Oe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return sf.makeRotationFromQuaternion(e),this.setFromRotationMatrix(sf,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return rf.setFromEuler(this),this.setFromQuaternion(rf,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Ii.DEFAULT_ORDER="XYZ";class sd{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let u0=0;const of=new D,Yr=new Ut,ps=new Ye,qa=new D,qo=new D,d0=new D,f0=new Ut,af=new D(1,0,0),lf=new D(0,1,0),cf=new D(0,0,1),hf={type:"added"},p0={type:"removed"},$r={type:"childadded",child:null},Pc={type:"childremoved",child:null};class Ft extends Nr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:u0++}),this.uuid=Bi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Ft.DEFAULT_UP.clone();const e=new D,t=new Ii,n=new Ut,i=new D(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Ye},normalMatrix:{value:new ot}}),this.matrix=new Ye,this.matrixWorld=new Ye,this.matrixAutoUpdate=Ft.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new sd,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Yr.setFromAxisAngle(e,t),this.quaternion.multiply(Yr),this}rotateOnWorldAxis(e,t){return Yr.setFromAxisAngle(e,t),this.quaternion.premultiply(Yr),this}rotateX(e){return this.rotateOnAxis(af,e)}rotateY(e){return this.rotateOnAxis(lf,e)}rotateZ(e){return this.rotateOnAxis(cf,e)}translateOnAxis(e,t){return of.copy(e).applyQuaternion(this.quaternion),this.position.add(of.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(af,e)}translateY(e){return this.translateOnAxis(lf,e)}translateZ(e){return this.translateOnAxis(cf,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(ps.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?qa.copy(e):qa.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),qo.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ps.lookAt(qo,qa,this.up):ps.lookAt(qa,qo,this.up),this.quaternion.setFromRotationMatrix(ps),i&&(ps.extractRotation(i.matrixWorld),Yr.setFromRotationMatrix(ps),this.quaternion.premultiply(Yr.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ke("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(hf),$r.child=e,this.dispatchEvent($r),$r.child=null):Ke("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(p0),Pc.child=e,this.dispatchEvent(Pc),Pc.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),ps.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),ps.multiply(e.parent.matrixWorld)),e.applyMatrix4(ps),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(hf),$r.child=e,this.dispatchEvent($r),$r.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qo,e,d0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(qo,f0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(a=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));i.material=a}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];i.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}Ft.DEFAULT_UP=new D(0,1,0);Ft.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ni=new D,ms=new D,Ic=new D,gs=new D,qr=new D,Zr=new D,uf=new D,Lc=new D,Dc=new D,Nc=new D,Uc=new Yt,Fc=new Yt,Oc=new Yt;class Fi{constructor(e=new D,t=new D,n=new D){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),Ni.subVectors(e,t),i.cross(Ni);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){Ni.subVectors(i,t),ms.subVectors(n,t),Ic.subVectors(e,t);const o=Ni.dot(Ni),a=Ni.dot(ms),l=Ni.dot(Ic),c=ms.dot(ms),h=ms.dot(Ic),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;const d=1/u,f=(c*l-a*h)*d,g=(o*h-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,gs)===null?!1:gs.x>=0&&gs.y>=0&&gs.x+gs.y<=1}static getInterpolation(e,t,n,i,r,o,a,l){return this.getBarycoord(e,t,n,i,gs)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,gs.x),l.addScaledVector(o,gs.y),l.addScaledVector(a,gs.z),l)}static getInterpolatedAttribute(e,t,n,i,r,o){return Uc.setScalar(0),Fc.setScalar(0),Oc.setScalar(0),Uc.fromBufferAttribute(e,t),Fc.fromBufferAttribute(e,n),Oc.fromBufferAttribute(e,i),o.setScalar(0),o.addScaledVector(Uc,r.x),o.addScaledVector(Fc,r.y),o.addScaledVector(Oc,r.z),o}static isFrontFacing(e,t,n,i){return Ni.subVectors(n,t),ms.subVectors(e,t),Ni.cross(ms).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Ni.subVectors(this.c,this.b),ms.subVectors(this.a,this.b),Ni.cross(ms).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Fi.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Fi.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return Fi.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return Fi.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Fi.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,r=this.c;let o,a;qr.subVectors(i,n),Zr.subVectors(r,n),Lc.subVectors(e,n);const l=qr.dot(Lc),c=Zr.dot(Lc);if(l<=0&&c<=0)return t.copy(n);Dc.subVectors(e,i);const h=qr.dot(Dc),u=Zr.dot(Dc);if(h>=0&&u<=h)return t.copy(i);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(qr,o);Nc.subVectors(e,r);const f=qr.dot(Nc),g=Zr.dot(Nc);if(g>=0&&f<=g)return t.copy(r);const _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(Zr,a);const m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return uf.subVectors(r,i),a=(u-h)/(u-h+(f-g)),t.copy(i).addScaledVector(uf,a);const p=1/(m+_+d);return o=_*p,a=d*p,t.copy(n).addScaledVector(qr,o).addScaledVector(Zr,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const fm={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Os={h:0,s:0,l:0},Za={h:0,s:0,l:0};function kc(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class ke{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Qt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,xt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=xt.workingColorSpace){return this.r=e,this.g=t,this.b=n,xt.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=xt.workingColorSpace){if(e=id(e,1),t=dt(t,0,1),n=dt(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=kc(o,r,e+1/3),this.g=kc(o,r,e),this.b=kc(o,r,e-1/3)}return xt.colorSpaceToWorking(this,i),this}setStyle(e,t=Qt){function n(r){r!==void 0&&parseFloat(r)<1&&Oe("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Oe("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Oe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Qt){const n=fm[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Oe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ts(e.r),this.g=Ts(e.g),this.b=Ts(e.b),this}copyLinearToSRGB(e){return this.r=go(e.r),this.g=go(e.g),this.b=go(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Qt){return xt.workingToColorSpace(Ln.copy(this),e),Math.round(dt(Ln.r*255,0,255))*65536+Math.round(dt(Ln.g*255,0,255))*256+Math.round(dt(Ln.b*255,0,255))}getHexString(e=Qt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=xt.workingColorSpace){xt.workingToColorSpace(Ln.copy(this),t);const n=Ln.r,i=Ln.g,r=Ln.b,o=Math.max(n,i,r),a=Math.min(n,i,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=xt.workingColorSpace){return xt.workingToColorSpace(Ln.copy(this),t),e.r=Ln.r,e.g=Ln.g,e.b=Ln.b,e}getStyle(e=Qt){xt.workingToColorSpace(Ln.copy(this),e);const t=Ln.r,n=Ln.g,i=Ln.b;return e!==Qt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Os),this.setHSL(Os.h+e,Os.s+t,Os.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Os),e.getHSL(Za);const n=ga(Os.h,Za.h,t),i=ga(Os.s,Za.s,t),r=ga(Os.l,Za.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ln=new ke;ke.NAMES=fm;let m0=0;class zi extends Nr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:m0++}),this.uuid=Bi(),this.name="",this.type="Material",this.blending=mo,this.side=As,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Eh,this.blendDst=Th,this.blendEquation=_r,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ke(0,0,0),this.blendAlpha=0,this.depthFunc=So,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Zd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Hr,this.stencilZFail=Hr,this.stencilZPass=Hr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Oe(`Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){Oe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==mo&&(n.blending=this.blending),this.side!==As&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Eh&&(n.blendSrc=this.blendSrc),this.blendDst!==Th&&(n.blendDst=this.blendDst),this.blendEquation!==_r&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==So&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Zd&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Hr&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Hr&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Hr&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.allowOverride===!1&&(n.allowOverride=!1),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=i(e.textures),o=i(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class ki extends zi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ii,this.combine=Wu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const hn=new D,Ka=new Ne;let g0=0;class Et{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:g0++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=mu,this.updateRanges=[],this.gpuType=Ai,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ka.fromBufferAttribute(this,t),Ka.applyMatrix3(e),this.setXY(t,Ka.x,Ka.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)hn.fromBufferAttribute(this,t),hn.applyMatrix3(e),this.setXYZ(t,hn.x,hn.y,hn.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)hn.fromBufferAttribute(this,t),hn.applyMatrix4(e),this.setXYZ(t,hn.x,hn.y,hn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)hn.fromBufferAttribute(this,t),hn.applyNormalMatrix(e),this.setXYZ(t,hn.x,hn.y,hn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)hn.fromBufferAttribute(this,t),hn.transformDirection(e),this.setXYZ(t,hn.x,hn.y,hn.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Ui(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Nt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ui(t,this.array)),t}setX(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ui(t,this.array)),t}setY(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ui(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ui(t,this.array)),t}setW(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Nt(t,this.array),n=Nt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=Nt(t,this.array),n=Nt(n,this.array),i=Nt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=Nt(t,this.array),n=Nt(n,this.array),i=Nt(i,this.array),r=Nt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==mu&&(e.usage=this.usage),e}}class pm extends Et{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class mm extends Et{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Ct extends Et{constructor(e,t,n){super(new Float32Array(e),t,n)}}let _0=0;const Si=new Ye,Bc=new Ft,Kr=new D,ci=new qn,Zo=new qn,En=new D;class zt extends Nr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:_0++}),this.uuid=Bi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(hm(e)?mm:pm)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new ot().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Si.makeRotationFromQuaternion(e),this.applyMatrix4(Si),this}rotateX(e){return Si.makeRotationX(e),this.applyMatrix4(Si),this}rotateY(e){return Si.makeRotationY(e),this.applyMatrix4(Si),this}rotateZ(e){return Si.makeRotationZ(e),this.applyMatrix4(Si),this}translate(e,t,n){return Si.makeTranslation(e,t,n),this.applyMatrix4(Si),this}scale(e,t,n){return Si.makeScale(e,t,n),this.applyMatrix4(Si),this}lookAt(e){return Bc.lookAt(e),Bc.updateMatrix(),this.applyMatrix4(Bc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Kr).negate(),this.translate(Kr.x,Kr.y,Kr.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,r=e.length;i<r;i++){const o=e[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ct(n,3))}else{const n=Math.min(e.length,t.count);for(let i=0;i<n;i++){const r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&Oe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new qn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ke("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const r=t[n];ci.setFromBufferAttribute(r),this.morphTargetsRelative?(En.addVectors(this.boundingBox.min,ci.min),this.boundingBox.expandByPoint(En),En.addVectors(this.boundingBox.max,ci.max),this.boundingBox.expandByPoint(En)):(this.boundingBox.expandByPoint(ci.min),this.boundingBox.expandByPoint(ci.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ke('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new cs);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ke("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){const n=this.boundingSphere.center;if(ci.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Zo.setFromBufferAttribute(a),this.morphTargetsRelative?(En.addVectors(ci.min,Zo.min),ci.expandByPoint(En),En.addVectors(ci.max,Zo.max),ci.expandByPoint(En)):(ci.expandByPoint(Zo.min),ci.expandByPoint(Zo.max))}ci.getCenter(n);let i=0;for(let r=0,o=e.count;r<o;r++)En.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(En));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)En.fromBufferAttribute(a,c),l&&(Kr.fromBufferAttribute(e,c),En.add(Kr)),i=Math.max(i,n.distanceToSquared(En))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&Ke('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ke("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Et(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let P=0;P<n.count;P++)a[P]=new D,l[P]=new D;const c=new D,h=new D,u=new D,d=new Ne,f=new Ne,g=new Ne,_=new D,m=new D;function p(P,S,T){c.fromBufferAttribute(n,P),h.fromBufferAttribute(n,S),u.fromBufferAttribute(n,T),d.fromBufferAttribute(r,P),f.fromBufferAttribute(r,S),g.fromBufferAttribute(r,T),h.sub(c),u.sub(c),f.sub(d),g.sub(d);const L=1/(f.x*g.y-g.x*f.y);isFinite(L)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(L),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(L),a[P].add(_),a[S].add(_),a[T].add(_),l[P].add(m),l[S].add(m),l[T].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let P=0,S=y.length;P<S;++P){const T=y[P],L=T.start,k=T.count;for(let H=L,Y=L+k;H<Y;H+=3)p(e.getX(H+0),e.getX(H+1),e.getX(H+2))}const b=new D,v=new D,M=new D,E=new D;function A(P){M.fromBufferAttribute(i,P),E.copy(M);const S=a[P];b.copy(S),b.sub(M.multiplyScalar(M.dot(S))).normalize(),v.crossVectors(E,S);const L=v.dot(l[P])<0?-1:1;o.setXYZW(P,b.x,b.y,b.z,L)}for(let P=0,S=y.length;P<S;++P){const T=y[P],L=T.start,k=T.count;for(let H=L,Y=L+k;H<Y;H+=3)A(e.getX(H+0)),A(e.getX(H+1)),A(e.getX(H+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Et(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const i=new D,r=new D,o=new D,a=new D,l=new D,c=new D,h=new D,u=new D;if(e)for(let d=0,f=e.count;d<f;d+=3){const g=e.getX(d+0),_=e.getX(d+1),m=e.getX(d+2);i.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)i.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)En.fromBufferAttribute(e,t),En.normalize(),e.setXYZ(t,En.x,En.y,En.z)}toNonIndexed(){function e(a,l){const c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h);let f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*h;for(let p=0;p<h;p++)d[g++]=c[f++]}return new Et(d,h,u)}if(this.index===null)return Oe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new zt,n=this.index.array,i=this.attributes;for(const a in i){const l=i[a],c=e(l,n);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){const d=c[h],f=e(d,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(i[l]=h,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const i=e.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const df=new Ye,ar=new Bo,Qa=new cs,ff=new D,Ja=new D,el=new D,tl=new D,zc=new D,nl=new D,pf=new D,il=new D;class ve extends Ft{constructor(e=new zt,t=new ki){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const a=this.morphTargetInfluences;if(r&&a){nl.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],u=r[l];h!==0&&(zc.fromBufferAttribute(u,e),o?nl.addScaledVector(zc,h):nl.addScaledVector(zc.sub(t),h))}t.add(nl)}return t}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Qa.copy(n.boundingSphere),Qa.applyMatrix4(r),ar.copy(e.ray).recast(e.near),!(Qa.containsPoint(ar.origin)===!1&&(ar.intersectSphere(Qa,ff)===null||ar.origin.distanceToSquared(ff)>(e.far-e.near)**2))&&(df.copy(r).invert(),ar.copy(e.ray).applyMatrix4(df),!(n.boundingBox!==null&&ar.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ar)))}_computeIntersections(e,t,n){let i;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const m=d[g],p=o[m.materialIndex],y=Math.max(m.start,f.start),b=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let v=y,M=b;v<M;v+=3){const E=a.getX(v),A=a.getX(v+1),P=a.getX(v+2);i=sl(this,p,e,n,c,h,u,E,A,P),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){const y=a.getX(m),b=a.getX(m+1),v=a.getX(m+2);i=sl(this,o,e,n,c,h,u,y,b,v),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const m=d[g],p=o[m.materialIndex],y=Math.max(m.start,f.start),b=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let v=y,M=b;v<M;v+=3){const E=v,A=v+1,P=v+2;i=sl(this,p,e,n,c,h,u,E,A,P),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){const y=m,b=m+1,v=m+2;i=sl(this,o,e,n,c,h,u,y,b,v),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}}}function x0(s,e,t,n,i,r,o,a){let l;if(e.side===$n?l=n.intersectTriangle(o,r,i,!0,a):l=n.intersectTriangle(i,r,o,e.side===As,a),l===null)return null;il.copy(a),il.applyMatrix4(s.matrixWorld);const c=t.ray.origin.distanceTo(il);return c<t.near||c>t.far?null:{distance:c,point:il.clone(),object:s}}function sl(s,e,t,n,i,r,o,a,l,c){s.getVertexPosition(a,Ja),s.getVertexPosition(l,el),s.getVertexPosition(c,tl);const h=x0(s,e,t,n,Ja,el,tl,pf);if(h){const u=new D;Fi.getBarycoord(pf,Ja,el,tl,u),i&&(h.uv=Fi.getInterpolatedAttribute(i,a,l,c,u,new Ne)),r&&(h.uv1=Fi.getInterpolatedAttribute(r,a,l,c,u,new Ne)),o&&(h.normal=Fi.getInterpolatedAttribute(o,a,l,c,u,new D),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a,b:l,c,normal:new D,materialIndex:0};Fi.getNormal(Ja,el,tl,d.normal),h.face=d,h.barycoord=u}return h}class un extends zt{constructor(e=1,t=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};const a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],u=[];let d=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,i,o,2),g("x","z","y",1,-1,e,n,-t,i,o,3),g("x","y","z",1,-1,e,t,n,i,r,4),g("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new Ct(c,3)),this.setAttribute("normal",new Ct(h,3)),this.setAttribute("uv",new Ct(u,2));function g(_,m,p,y,b,v,M,E,A,P,S){const T=v/A,L=M/P,k=v/2,H=M/2,Y=E/2,W=A+1,j=P+1;let V=0,q=0;const he=new D;for(let ue=0;ue<j;ue++){const de=ue*L-H;for(let ze=0;ze<W;ze++){const Je=ze*T-k;he[_]=Je*y,he[m]=de*b,he[p]=Y,c.push(he.x,he.y,he.z),he[_]=0,he[m]=0,he[p]=E>0?1:-1,h.push(he.x,he.y,he.z),u.push(ze/A),u.push(1-ue/P),V+=1}}for(let ue=0;ue<P;ue++)for(let de=0;de<A;de++){const ze=d+de+W*ue,Je=d+de+W*(ue+1),ht=d+(de+1)+W*(ue+1),_t=d+(de+1)+W*ue;l.push(ze,Je,_t),l.push(Je,ht,_t),q+=6}a.addGroup(f,q,S),f+=q,d+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new un(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Co(s){const e={};for(const t in s){e[t]={};for(const n in s[t]){const i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(Oe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function Hn(s){const e={};for(let t=0;t<s.length;t++){const n=Co(s[t]);for(const i in n)e[i]=n[i]}return e}function y0(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function gm(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:xt.workingColorSpace}const v0={clone:Co,merge:Hn};var b0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,S0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class as extends zi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=b0,this.fragmentShader=S0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Co(e.uniforms),this.uniformsGroups=y0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class _m extends Ft{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ye,this.projectionMatrix=new Ye,this.projectionMatrixInverse=new Ye,this.coordinateSystem=Ki,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const ks=new D,mf=new Ne,gf=new Ne;class Wn extends _m{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ao*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(ma*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ao*2*Math.atan(Math.tan(ma*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ks.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ks.x,ks.y).multiplyScalar(-e/ks.z),ks.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ks.x,ks.y).multiplyScalar(-e/ks.z)}getViewSize(e,t){return this.getViewBounds(e,mf,gf),t.subVectors(gf,mf)}setViewOffset(e,t,n,i,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(ma*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*i/l,t-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Qr=-90,Jr=1;class M0 extends Ft{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Wn(Qr,Jr,e,t);i.layers=this.layers,this.add(i);const r=new Wn(Qr,Jr,e,t);r.layers=this.layers,this.add(r);const o=new Wn(Qr,Jr,e,t);o.layers=this.layers,this.add(o);const a=new Wn(Qr,Jr,e,t);a.layers=this.layers,this.add(a);const l=new Wn(Qr,Jr,e,t);l.layers=this.layers,this.add(l);const c=new Wn(Qr,Jr,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===Ki)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Fl)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,r),e.setRenderTarget(n,1,i),e.render(t,o),e.setRenderTarget(n,2,i),e.render(t,a),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class xm extends yn{constructor(e=[],t=Cr,n,i,r,o,a,l,c,h){super(e,t,n,i,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class ym extends ns{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new xm(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new un(5,5,5),r=new as({name:"CubemapFromEquirect",uniforms:Co(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:$n,blending:Es});r.uniforms.tEquirect.value=t;const o=new ve(i,r),a=t.minFilter;return t.minFilter===Zi&&(t.minFilter=pn),new M0(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(r)}}class Qi extends Ft{constructor(){super(),this.isGroup=!0,this.type="Group"}}const w0={type:"move"};class Hc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Qi,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Qi,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Qi,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(w0)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Qi;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class gu extends Ft{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ii,this.environmentIntensity=1,this.environmentRotation=new Ii,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class vm{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=mu,this.updateRanges=[],this.version=0,this.uuid=Bi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Bi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Bi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const zn=new D;class lc{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)zn.fromBufferAttribute(this,t),zn.applyMatrix4(e),this.setXYZ(t,zn.x,zn.y,zn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)zn.fromBufferAttribute(this,t),zn.applyNormalMatrix(e),this.setXYZ(t,zn.x,zn.y,zn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)zn.fromBufferAttribute(this,t),zn.transformDirection(e),this.setXYZ(t,zn.x,zn.y,zn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Ui(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Nt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Ui(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Ui(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Ui(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Ui(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Nt(t,this.array),n=Nt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=Nt(t,this.array),n=Nt(n,this.array),i=Nt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Nt(t,this.array),n=Nt(n,this.array),i=Nt(i,this.array),r=Nt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Ol("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new Et(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new lc(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Ol("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const _f=new D,xf=new Yt,yf=new Yt,E0=new D,vf=new Ye,rl=new D,Vc=new cs,bf=new Ye,Gc=new Bo;class T0 extends ve{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=jd,this.bindMatrix=new Ye,this.bindMatrixInverse=new Ye,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new qn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,rl),this.boundingBox.expandByPoint(rl)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new cs),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,rl),this.boundingSphere.expandByPoint(rl)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Vc.copy(this.boundingSphere),Vc.applyMatrix4(i),e.ray.intersectsSphere(Vc)!==!1&&(bf.copy(i).invert(),Gc.copy(e.ray).applyMatrix4(bf),!(this.boundingBox!==null&&Gc.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Gc)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new Yt,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===jd?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===A_?this.bindMatrixInverse.copy(this.bindMatrix).invert():Oe("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;xf.fromBufferAttribute(i.attributes.skinIndex,e),yf.fromBufferAttribute(i.attributes.skinWeight,e),_f.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const o=yf.getComponent(r);if(o!==0){const a=xf.getComponent(r);vf.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(E0.copy(_f).applyMatrix4(vf),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class bm extends Ft{constructor(){super(),this.isBone=!0,this.type="Bone"}}class rd extends yn{constructor(e=null,t=1,n=1,i,r,o,a,l,c=fn,h=fn,u,d){super(null,o,a,l,c,h,i,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Sf=new Ye,A0=new Ye;class od{constructor(e=[],t=[]){this.uuid=Bi(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Oe("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Ye)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Ye;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,o=e.length;r<o;r++){const a=e[r]?e[r].matrixWorld:A0;Sf.multiplyMatrices(a,t[r]),Sf.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new od(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new rd(t,e,e,pi,Ai);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const r=e.bones[n];let o=t[r];o===void 0&&(Oe("Skeleton: No bone found with UUID:",r),o=new bm),this.bones.push(o),this.boneInverses.push(new Ye().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){const o=t[i];e.bones.push(o.uuid);const a=n[i];e.boneInverses.push(a.toArray())}return e}}class _u extends Et{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const eo=new Ye,Mf=new Ye,ol=[],wf=new qn,R0=new Ye,Ko=new ve,Qo=new cs;class C0 extends ve{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new _u(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,R0)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new qn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,eo),wf.copy(e.boundingBox).applyMatrix4(eo),this.boundingBox.union(wf)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new cs),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,eo),Qo.copy(e.boundingSphere).applyMatrix4(eo),this.boundingSphere.union(Qo)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(Ko.geometry=this.geometry,Ko.material=this.material,Ko.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Qo.copy(this.boundingSphere),Qo.applyMatrix4(n),e.ray.intersectsSphere(Qo)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,eo),Mf.multiplyMatrices(n,eo),Ko.matrixWorld=Mf,Ko.raycast(e,ol);for(let o=0,a=ol.length;o<a;o++){const l=ol[o];l.instanceId=r,l.object=this,t.push(l)}ol.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new _u(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new rd(new Float32Array(i*this.count),i,this.count,Zu,Ai));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=i*e;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Wc=new D,P0=new D,I0=new ot;class Ti{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=Wc.subVectors(n,t).cross(P0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Wc),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||I0.getNormalMatrix(e),i=this.coplanarPoint(Wc).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const lr=new cs,L0=new Ne(.5,.5),al=new D;class ad{constructor(e=new Ti,t=new Ti,n=new Ti,i=new Ti,r=new Ti,o=new Ti){this.planes=[e,t,n,i,r,o]}set(e,t,n,i,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Ki,n=!1){const i=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],g=r[8],_=r[9],m=r[10],p=r[11],y=r[12],b=r[13],v=r[14],M=r[15];if(i[0].setComponents(c-o,f-h,p-g,M-y).normalize(),i[1].setComponents(c+o,f+h,p+g,M+y).normalize(),i[2].setComponents(c+a,f+u,p+_,M+b).normalize(),i[3].setComponents(c-a,f-u,p-_,M-b).normalize(),n)i[4].setComponents(l,d,m,v).normalize(),i[5].setComponents(c-l,f-d,p-m,M-v).normalize();else if(i[4].setComponents(c-l,f-d,p-m,M-v).normalize(),t===Ki)i[5].setComponents(c+l,f+d,p+m,M+v).normalize();else if(t===Fl)i[5].setComponents(l,d,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),lr.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),lr.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(lr)}intersectsSprite(e){lr.center.set(0,0,0);const t=L0.distanceTo(e.center);return lr.radius=.7071067811865476+t,lr.applyMatrix4(e.matrixWorld),this.intersectsSphere(lr)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(al.x=i.normal.x>0?e.max.x:e.min.x,al.y=i.normal.y>0?e.max.y:e.min.y,al.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(al)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Ls extends zi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ke(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const kl=new D,Bl=new D,Ef=new Ye,Jo=new Bo,ll=new cs,Xc=new D,Tf=new D;class Ei extends Ft{constructor(e=new zt,t=new Ls){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)kl.fromBufferAttribute(t,i-1),Bl.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=kl.distanceTo(Bl);e.setAttribute("lineDistance",new Ct(n,1))}else Oe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ll.copy(n.boundingSphere),ll.applyMatrix4(i),ll.radius+=r,e.ray.intersectsSphere(ll)===!1)return;Ef.copy(i).invert(),Jo.copy(e.ray).applyMatrix4(Ef);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const p=h.getX(_),y=h.getX(_+1),b=cl(this,e,Jo,l,p,y,_);b&&t.push(b)}if(this.isLineLoop){const _=h.getX(g-1),m=h.getX(f),p=cl(this,e,Jo,l,_,m,g-1);p&&t.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const p=cl(this,e,Jo,l,_,_+1,_);p&&t.push(p)}if(this.isLineLoop){const _=cl(this,e,Jo,l,g-1,f,g-1);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function cl(s,e,t,n,i,r,o){const a=s.geometry.attributes.position;if(kl.fromBufferAttribute(a,i),Bl.fromBufferAttribute(a,r),t.distanceSqToSegment(kl,Bl,Xc,Tf)>n)return;Xc.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(Xc);if(!(c<e.near||c>e.far))return{distance:c,point:Tf.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}const Af=new D,Rf=new D;class zo extends Ei{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Af.fromBufferAttribute(t,i),Rf.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Af.distanceTo(Rf);e.setAttribute("lineDistance",new Ct(n,1))}else Oe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class D0 extends Ei{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Sm extends zi{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new ke(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Cf=new Ye,xu=new Bo,hl=new cs,ul=new D;class N0 extends Ft{constructor(e=new zt,t=new Sm){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),hl.copy(n.boundingSphere),hl.applyMatrix4(i),hl.radius+=r,e.ray.intersectsSphere(hl)===!1)return;Cf.copy(i).invert(),xu.copy(e.ray).applyMatrix4(Cf);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,u=n.attributes.position;if(c!==null){const d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=d,_=f;g<_;g++){const m=c.getX(g);ul.fromBufferAttribute(u,m),Pf(ul,m,l,i,e,t,this)}}else{const d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=d,_=f;g<_;g++)ul.fromBufferAttribute(u,g),Pf(ul,g,l,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Pf(s,e,t,n,i,r,o){const a=xu.distanceSqToPoint(s);if(a<t){const l=new D;xu.closestPointToPoint(s,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class jc extends yn{constructor(e,t,n,i,r,o,a,l,c,h,u,d){super(null,o,a,l,c,h,i,r,u,d),this.isCompressedTexture=!0,this.image={width:t,height:n},this.mipmaps=e,this.flipY=!1,this.generateMipmaps=!1}}class Ra extends yn{constructor(e,t,n=os,i,r,o,a=fn,l=fn,c,h=Cs,u=1){if(h!==Cs&&h!==vr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:u};super(d,i,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ac(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class U0 extends Ra{constructor(e,t=os,n=Cr,i,r,o=fn,a=fn,l,c=Cs){const h={width:e,height:e,depth:1},u=[h,h,h,h,h,h];super(e,e,t,n,i,r,o,a,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class Mm extends yn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Cn extends zt{constructor(e=1,t=1,n=1,i=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;i=Math.floor(i),r=Math.floor(r);const h=[],u=[],d=[],f=[];let g=0;const _=[],m=n/2;let p=0;y(),o===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(h),this.setAttribute("position",new Ct(u,3)),this.setAttribute("normal",new Ct(d,3)),this.setAttribute("uv",new Ct(f,2));function y(){const v=new D,M=new D;let E=0;const A=(t-e)/n;for(let P=0;P<=r;P++){const S=[],T=P/r,L=T*(t-e)+e;for(let k=0;k<=i;k++){const H=k/i,Y=H*l+a,W=Math.sin(Y),j=Math.cos(Y);M.x=L*W,M.y=-T*n+m,M.z=L*j,u.push(M.x,M.y,M.z),v.set(W,A,j).normalize(),d.push(v.x,v.y,v.z),f.push(H,1-T),S.push(g++)}_.push(S)}for(let P=0;P<i;P++)for(let S=0;S<r;S++){const T=_[S][P],L=_[S+1][P],k=_[S+1][P+1],H=_[S][P+1];(e>0||S!==0)&&(h.push(T,L,H),E+=3),(t>0||S!==r-1)&&(h.push(L,k,H),E+=3)}c.addGroup(p,E,0),p+=E}function b(v){const M=g,E=new Ne,A=new D;let P=0;const S=v===!0?e:t,T=v===!0?1:-1;for(let k=1;k<=i;k++)u.push(0,m*T,0),d.push(0,T,0),f.push(.5,.5),g++;const L=g;for(let k=0;k<=i;k++){const Y=k/i*l+a,W=Math.cos(Y),j=Math.sin(Y);A.x=S*j,A.y=m*T,A.z=S*W,u.push(A.x,A.y,A.z),d.push(0,T,0),E.x=W*.5+.5,E.y=j*.5*T+.5,f.push(E.x,E.y),g++}for(let k=0;k<i;k++){const H=M+k,Y=L+k;v===!0?h.push(Y,Y+1,H):h.push(Y+1,Y,H),P+=3}c.addGroup(p,P,v===!0?1:2),p+=P}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Cn(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ld extends Cn{constructor(e=1,t=1,n=32,i=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,i,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new ld(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class cd extends zt{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};const r=[],o=[];a(i),c(n),h(),this.setAttribute("position",new Ct(r,3)),this.setAttribute("normal",new Ct(r.slice(),3)),this.setAttribute("uv",new Ct(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(y){const b=new D,v=new D,M=new D;for(let E=0;E<t.length;E+=3)f(t[E+0],b),f(t[E+1],v),f(t[E+2],M),l(b,v,M,y)}function l(y,b,v,M){const E=M+1,A=[];for(let P=0;P<=E;P++){A[P]=[];const S=y.clone().lerp(v,P/E),T=b.clone().lerp(v,P/E),L=E-P;for(let k=0;k<=L;k++)k===0&&P===E?A[P][k]=S:A[P][k]=S.clone().lerp(T,k/L)}for(let P=0;P<E;P++)for(let S=0;S<2*(E-P)-1;S++){const T=Math.floor(S/2);S%2===0?(d(A[P][T+1]),d(A[P+1][T]),d(A[P][T])):(d(A[P][T+1]),d(A[P+1][T+1]),d(A[P+1][T]))}}function c(y){const b=new D;for(let v=0;v<r.length;v+=3)b.x=r[v+0],b.y=r[v+1],b.z=r[v+2],b.normalize().multiplyScalar(y),r[v+0]=b.x,r[v+1]=b.y,r[v+2]=b.z}function h(){const y=new D;for(let b=0;b<r.length;b+=3){y.x=r[b+0],y.y=r[b+1],y.z=r[b+2];const v=m(y)/2/Math.PI+.5,M=p(y)/Math.PI+.5;o.push(v,1-M)}g(),u()}function u(){for(let y=0;y<o.length;y+=6){const b=o[y+0],v=o[y+2],M=o[y+4],E=Math.max(b,v,M),A=Math.min(b,v,M);E>.9&&A<.1&&(b<.2&&(o[y+0]+=1),v<.2&&(o[y+2]+=1),M<.2&&(o[y+4]+=1))}}function d(y){r.push(y.x,y.y,y.z)}function f(y,b){const v=y*3;b.x=e[v+0],b.y=e[v+1],b.z=e[v+2]}function g(){const y=new D,b=new D,v=new D,M=new D,E=new Ne,A=new Ne,P=new Ne;for(let S=0,T=0;S<r.length;S+=9,T+=6){y.set(r[S+0],r[S+1],r[S+2]),b.set(r[S+3],r[S+4],r[S+5]),v.set(r[S+6],r[S+7],r[S+8]),E.set(o[T+0],o[T+1]),A.set(o[T+2],o[T+3]),P.set(o[T+4],o[T+5]),M.copy(y).add(b).add(v).divideScalar(3);const L=m(M);_(E,T+0,y,L),_(A,T+2,b,L),_(P,T+4,v,L)}}function _(y,b,v,M){M<0&&y.x===1&&(o[b]=y.x-1),v.x===0&&v.z===0&&(o[b]=M/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function p(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new cd(e.vertices,e.indices,e.radius,e.detail)}}class co extends cd{constructor(e=1,t=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new co(e.radius,e.detail)}}class ka extends zt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(i),c=a+1,h=l+1,u=e/a,d=t/l,f=[],g=[],_=[],m=[];for(let p=0;p<h;p++){const y=p*d-o;for(let b=0;b<c;b++){const v=b*u-r;g.push(v,-y,0),_.push(0,0,1),m.push(b/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let y=0;y<a;y++){const b=y+c*p,v=y+c*(p+1),M=y+1+c*(p+1),E=y+1+c*p;f.push(b,v,E),f.push(v,M,E)}this.setIndex(f),this.setAttribute("position",new Ct(g,3)),this.setAttribute("normal",new Ct(_,3)),this.setAttribute("uv",new Ct(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ka(e.width,e.height,e.widthSegments,e.heightSegments)}}class hd extends zt{constructor(e=1,t=32,n=16,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const h=[],u=new D,d=new D,f=[],g=[],_=[],m=[];for(let p=0;p<=n;p++){const y=[],b=p/n;let v=0;p===0&&o===0?v=.5/t:p===n&&l===Math.PI&&(v=-.5/t);for(let M=0;M<=t;M++){const E=M/t;u.x=-e*Math.cos(i+E*r)*Math.sin(o+b*a),u.y=e*Math.cos(o+b*a),u.z=e*Math.sin(i+E*r)*Math.sin(o+b*a),g.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),m.push(E+v,1-b),y.push(c++)}h.push(y)}for(let p=0;p<n;p++)for(let y=0;y<t;y++){const b=h[p][y+1],v=h[p][y],M=h[p+1][y],E=h[p+1][y+1];(p!==0||o>0)&&f.push(b,v,E),(p!==n-1||l<Math.PI)&&f.push(v,M,E)}this.setIndex(f),this.setAttribute("position",new Ct(g,3)),this.setAttribute("normal",new Ct(_,3)),this.setAttribute("uv",new Ct(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new hd(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class xr extends zt{constructor(e=1,t=.4,n=12,i=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);const o=[],a=[],l=[],c=[],h=new D,u=new D,d=new D;for(let f=0;f<=n;f++)for(let g=0;g<=i;g++){const _=g/i*r,m=f/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(_),u.y=(e+t*Math.cos(m))*Math.sin(_),u.z=t*Math.sin(m),a.push(u.x,u.y,u.z),h.x=e*Math.cos(_),h.y=e*Math.sin(_),d.subVectors(u,h).normalize(),l.push(d.x,d.y,d.z),c.push(g/i),c.push(f/n)}for(let f=1;f<=n;f++)for(let g=1;g<=i;g++){const _=(i+1)*f+g-1,m=(i+1)*(f-1)+g-1,p=(i+1)*(f-1)+g,y=(i+1)*f+g;o.push(_,m,y),o.push(m,p,y)}this.setIndex(o),this.setAttribute("position",new Ct(a,3)),this.setAttribute("normal",new Ct(l,3)),this.setAttribute("uv",new Ct(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xr(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class F0 extends as{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class ud extends zi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ke(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ed,this.normalScale=new Ne(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ii,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class hs extends ud{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Ne(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return dt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new ke(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ke(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ke(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class O0 extends zi{constructor(e){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new ke(16777215),this.specular=new ke(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ed,this.normalScale=new Ne(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ii,this.combine=Wu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.specular.copy(e.specular),this.shininess=e.shininess,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class k0 extends zi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=P_,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class B0 extends zi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function dl(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function z0(s){function e(i,r){return s[i]-s[r]}const t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function If(s,e,t){const n=s.length,i=new s.constructor(n);for(let r=0,o=0;o!==n;++r){const a=t[r]*e;for(let l=0;l!==e;++l)i[o++]=s[a+l]}return i}function wm(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=s[i++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=s[i++];while(r!==void 0)}class Ba{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let o;n:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=t[++n],e<i)break t}o=t.length;break n}if(!(e>=r)){const a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=t[--n-1],e>=r)break t}o=n,n=0;break n}break e}for(;n<o;){const a=n+o>>>1;e<t[a]?o=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let o=0;o!==i;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class H0 extends Ba{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Yd,endingEnd:Yd}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,o=e+1,a=i[r],l=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case $d:r=e,a=2*t-n;break;case qd:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case $d:o=e,l=2*n-t;break;case qd:o=1,l=n+i[1]-i[0];break;default:o=e-1,l=t}const c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(i-t),_=g*g,m=_*g,p=-d*m+2*d*_-d*g,y=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*g+1,b=(-1-f)*m+(1.5+f)*_+.5*g,v=f*m-f*_;for(let M=0;M!==a;++M)r[M]=p*o[h+M]+y*o[c+M]+b*o[l+M]+v*o[u+M];return r}}class V0 extends Ba{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(n-t)/(i-t),u=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*u+o[l+d]*h;return r}}class G0 extends Ba{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class Hi{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=dl(t,this.TimeBufferType),this.values=dl(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:dl(e.times,Array),values:dl(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new G0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new V0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new H0(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Eo:t=this.InterpolantFactoryMethodDiscrete;break;case To:t=this.InterpolantFactoryMethodLinear;break;case vc:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Oe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Eo;case this.InterpolantFactoryMethodLinear:return To;case this.InterpolantFactoryMethodSmooth:return vc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let r=0,o=i-1;for(;r!==i&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(Ke("KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(Ke("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const l=n[a];if(typeof l=="number"&&isNaN(l)){Ke("KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){Ke("KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(i!==void 0&&k_(i))for(let a=0,l=i.length;a!==l;++a){const c=i[a];if(isNaN(c)){Ke("KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===vc,r=e.length-1;let o=1;for(let a=1;a<r;++a){let l=!1;const c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(i)l=!0;else{const u=a*n,d=u-n,f=u+n;for(let g=0;g!==n;++g){const _=t[u+g];if(_!==t[d+g]||_!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const u=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}Hi.prototype.ValueTypeName="";Hi.prototype.TimeBufferType=Float32Array;Hi.prototype.ValueBufferType=Float32Array;Hi.prototype.DefaultInterpolation=To;class Ho extends Hi{constructor(e,t,n){super(e,t,n)}}Ho.prototype.ValueTypeName="bool";Ho.prototype.ValueBufferType=Array;Ho.prototype.DefaultInterpolation=Eo;Ho.prototype.InterpolantFactoryMethodLinear=void 0;Ho.prototype.InterpolantFactoryMethodSmooth=void 0;class Em extends Hi{constructor(e,t,n,i){super(e,t,n,i)}}Em.prototype.ValueTypeName="color";class Po extends Hi{constructor(e,t,n,i){super(e,t,n,i)}}Po.prototype.ValueTypeName="number";class W0 extends Ba{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(i-t);let c=e*a;for(let h=c+a;c!==h;c+=4)Ut.slerpFlat(r,0,o,c-a,o,c,l);return r}}class Io extends Hi{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new W0(this.times,this.values,this.getValueSize(),e)}}Io.prototype.ValueTypeName="quaternion";Io.prototype.InterpolantFactoryMethodSmooth=void 0;class Vo extends Hi{constructor(e,t,n){super(e,t,n)}}Vo.prototype.ValueTypeName="string";Vo.prototype.ValueBufferType=Array;Vo.prototype.DefaultInterpolation=Eo;Vo.prototype.InterpolantFactoryMethodLinear=void 0;Vo.prototype.InterpolantFactoryMethodSmooth=void 0;class Lo extends Hi{constructor(e,t,n,i){super(e,t,n,i)}}Lo.prototype.ValueTypeName="vector";class X0{constructor(e="",t=-1,n=[],i=R_){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=Bi(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(Y0(n[o]).scale(i));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=n.length;r!==o;++r)t.push(Hi.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);const h=z0(l);l=If(l,1,h),c=If(c,1,h),!i&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new Po(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],h=c.name.match(r);if(h&&h.length>1){const u=h[1];let d=i[u];d||(i[u]=d=[]),d.push(c)}}const o=[];for(const a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return o}static parseAnimation(e,t){if(Oe("AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return Ke("AnimationClip: No animation in JSONLoader data."),null;const n=function(u,d,f,g,_){if(f.length!==0){const m=[],p=[];wm(f,m,p,g),m.length!==0&&_.push(new u(d,m,p))}},i=[],r=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const d=c[u].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const f={};let g;for(g=0;g<d.length;g++)if(d[g].morphTargets)for(let _=0;_<d[g].morphTargets.length;_++)f[d[g].morphTargets[_]]=-1;for(const _ in f){const m=[],p=[];for(let y=0;y!==d[g].morphTargets.length;++y){const b=d[g];m.push(b.time),p.push(b.morphTarget===_?1:0)}i.push(new Po(".morphTargetInfluence["+_+"]",m,p))}l=f.length*o}else{const f=".bones["+t[u].name+"]";n(Lo,f+".position",d,"pos",i),n(Io,f+".quaternion",d,"rot",i),n(Lo,f+".scale",d,"scl",i)}}return i.length===0?null:new this(r,l,i,a)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function j0(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Po;case"vector":case"vector2":case"vector3":case"vector4":return Lo;case"color":return Em;case"quaternion":return Io;case"bool":case"boolean":return Ho;case"string":return Vo}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function Y0(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=j0(s.type);if(s.times===void 0){const t=[],n=[];wm(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}const ws={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class $0{constructor(e,t,n){const i=this;let r=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){a++,r===!1&&i.onStart!==void 0&&i.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,i.onProgress!==void 0&&i.onProgress(h,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){const f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const q0=new $0;class tr{constructor(e){this.manager=e!==void 0?e:q0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}tr.DEFAULT_MATERIAL_NAME="__DEFAULT";const _s={};class Z0 extends Error{constructor(e,t){super(e),this.response=t}}class Ca extends tr{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=ws.get(`file:${e}`);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(_s[e]!==void 0){_s[e].push({onLoad:t,onProgress:n,onError:i});return}_s[e]=[],_s[e].push({onLoad:t,onProgress:n,onError:i});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&Oe("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=_s[e],u=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0;let _=0;const m=new ReadableStream({start(p){y();function y(){u.read().then(({done:b,value:v})=>{if(b)p.close();else{_+=v.byteLength;const M=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:f});for(let E=0,A=h.length;E<A;E++){const P=h[E];P.onProgress&&P.onProgress(M)}p.enqueue(v),y()}},b=>{p.error(b)})}}});return new Response(m)}else throw new Z0(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a==="")return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(a),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{ws.add(`file:${e}`,c);const h=_s[e];delete _s[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{const h=_s[e];if(h===void 0)throw this.manager.itemError(e),c;delete _s[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const to=new WeakMap;class K0 extends tr{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=ws.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let u=to.get(o);u===void 0&&(u=[],to.set(o,u)),u.push({onLoad:t,onError:i})}return o}const a=Ta("img");function l(){h(),t&&t(this);const u=to.get(this)||[];for(let d=0;d<u.length;d++){const f=u[d];f.onLoad&&f.onLoad(this)}to.delete(this),r.manager.itemEnd(e)}function c(u){h(),i&&i(u),ws.remove(`image:${e}`);const d=to.get(this)||[];for(let f=0;f<d.length;f++){const g=d[f];g.onError&&g.onError(u)}to.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),ws.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}}class Q0 extends tr{constructor(e){super(e)}load(e,t,n,i){const r=new yn,o=new K0(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}}class cc extends Ft{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ke(e),this.intensity=t}dispose(){this.dispatchEvent({type:"dispose"})}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class J0 extends cc{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ft.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ke(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const Yc=new Ye,Lf=new D,Df=new D;class dd{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ne(512,512),this.mapType=di,this.map=null,this.mapPass=null,this.matrix=new Ye,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ad,this._frameExtents=new Ne(1,1),this._viewportCount=1,this._viewports=[new Yt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Lf.setFromMatrixPosition(e.matrixWorld),t.position.copy(Lf),Df.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Df),t.updateMatrixWorld(),Yc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Yc,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Yc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class ex extends dd{constructor(){super(new Wn(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=Ao*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class tx extends cc{constructor(e,t,n=0,i=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Ft.DEFAULT_UP),this.updateMatrix(),this.target=new Ft,this.distance=n,this.angle=i,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new ex}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}}class nx extends dd{constructor(){super(new Wn(90,1,.5,500)),this.isPointLightShadow=!0}}class ix extends cc{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new nx}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class za extends _m{constructor(e=-1,t=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=i+t,l=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class sx extends dd{constructor(){super(new za(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class fd extends cc{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ft.DEFAULT_UP),this.updateMatrix(),this.target=new Ft,this.shadow=new sx}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class _a{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const $c=new WeakMap;class rx extends tr{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&Oe("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&Oe("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=ws.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{if($c.has(o)===!0)i&&i($c.get(o)),r.manager.itemError(e),r.manager.itemEnd(e);else return t&&t(c),r.manager.itemEnd(e),c});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;const l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return ws.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){i&&i(c),$c.set(l,c),ws.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});ws.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class ox extends Wn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}const pd="\\[\\]\\.:\\/",ax=new RegExp("["+pd+"]","g"),md="[^"+pd+"]",lx="[^"+pd.replace("\\.","")+"]",cx=/((?:WC+[\/:])*)/.source.replace("WC",md),hx=/(WCOD+)?/.source.replace("WCOD",lx),ux=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",md),dx=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",md),fx=new RegExp("^"+cx+hx+ux+dx+"$"),px=["material","materials","bones","map"];class mx{constructor(e,t,n){const i=n||Tt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class Tt{constructor(e,t,n){this.path=t,this.parsedPath=n||Tt.parseTrackName(t),this.node=Tt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new Tt.Composite(e,t,n):new Tt(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(ax,"")}static parseTrackName(e){const t=fx.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);px.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===t||a.uuid===t)return a;const l=n(a.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let r=t.propertyIndex;if(e||(e=Tt.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Oe("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ke("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ke("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ke("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Ke("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Ke("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[i];if(o===void 0){const c=t.nodeName;Ke("PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){Ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Tt.Composite=mx;Tt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Tt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Tt.prototype.GetterByBindingType=[Tt.prototype._getValue_direct,Tt.prototype._getValue_array,Tt.prototype._getValue_arrayElement,Tt.prototype._getValue_toArray];Tt.prototype.SetterByBindingTypeAndVersioning=[[Tt.prototype._setValue_direct,Tt.prototype._setValue_direct_setNeedsUpdate,Tt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Tt.prototype._setValue_array,Tt.prototype._setValue_array_setNeedsUpdate,Tt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Tt.prototype._setValue_arrayElement,Tt.prototype._setValue_arrayElement_setNeedsUpdate,Tt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Tt.prototype._setValue_fromArray,Tt.prototype._setValue_fromArray_setNeedsUpdate,Tt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];const Nf=new Ye;class Tm{constructor(e,t,n=0,i=1/0){this.ray=new Bo(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new sd,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Ke("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Nf.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Nf),this}intersectObject(e,t=!0,n=[]){return yu(e,this,n,t),n.sort(Uf),n}intersectObjects(e,t=!0,n=[]){for(let i=0,r=e.length;i<r;i++)yu(e[i],this,n,t);return n.sort(Uf),n}}function Uf(s,e){return s.distance-e.distance}function yu(s,e,t,n){let i=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){const r=s.children;for(let o=0,a=r.length;o<a;o++)yu(r[o],e,t,!0)}}class Ff{constructor(e=1,t=0,n=0){this.radius=e,this.phi=t,this.theta=n}set(e,t,n){return this.radius=e,this.phi=t,this.theta=n,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=dt(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,n){return this.radius=Math.sqrt(e*e+t*t+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,n),this.phi=Math.acos(dt(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}const fl=new qn;class gx extends zo{constructor(e,t=16776960){const n=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),i=new Float32Array(24),r=new zt;r.setIndex(new Et(n,1)),r.setAttribute("position",new Et(i,3)),super(r,new Ls({color:t,toneMapped:!1})),this.object=e,this.type="BoxHelper",this.matrixAutoUpdate=!1,this.update()}update(){if(this.object!==void 0&&fl.setFromObject(this.object),fl.isEmpty())return;const e=fl.min,t=fl.max,n=this.geometry.attributes.position,i=n.array;i[0]=t.x,i[1]=t.y,i[2]=t.z,i[3]=e.x,i[4]=t.y,i[5]=t.z,i[6]=e.x,i[7]=e.y,i[8]=t.z,i[9]=t.x,i[10]=e.y,i[11]=t.z,i[12]=t.x,i[13]=t.y,i[14]=e.z,i[15]=e.x,i[16]=t.y,i[17]=e.z,i[18]=e.x,i[19]=e.y,i[20]=e.z,i[21]=t.x,i[22]=e.y,i[23]=e.z,n.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(e){return this.object=e,this.update(),this}copy(e,t){return super.copy(e,t),this.object=e.object,this}dispose(){this.geometry.dispose(),this.material.dispose()}}const Of=new D;let pl,qc;class _x extends Ft{constructor(e=new D(0,0,1),t=new D(0,0,0),n=1,i=16776960,r=n*.2,o=r*.2){super(),this.type="ArrowHelper",pl===void 0&&(pl=new zt,pl.setAttribute("position",new Ct([0,0,0,0,1,0],3)),qc=new ld(.5,1,5,1),qc.translate(0,-.5,0)),this.position.copy(t),this.line=new Ei(pl,new Ls({color:i,toneMapped:!1})),this.line.matrixAutoUpdate=!1,this.add(this.line),this.cone=new ve(qc,new ki({color:i,toneMapped:!1})),this.cone.matrixAutoUpdate=!1,this.add(this.cone),this.setDirection(e),this.setLength(n,r,o)}setDirection(e){if(e.y>.99999)this.quaternion.set(0,0,0,1);else if(e.y<-.99999)this.quaternion.set(1,0,0,0);else{Of.set(e.z,0,-e.x).normalize();const t=Math.acos(e.y);this.quaternion.setFromAxisAngle(Of,t)}}setLength(e,t=e*.2,n=t*.2){this.line.scale.set(1,Math.max(1e-4,e-t),1),this.line.updateMatrix(),this.cone.scale.set(n,t,n),this.cone.position.y=e,this.cone.updateMatrix()}setColor(e){this.line.material.color.set(e),this.cone.material.color.set(e)}copy(e){return super.copy(e,!1),this.line.copy(e.line),this.cone.copy(e.cone),this}dispose(){this.line.geometry.dispose(),this.line.material.dispose(),this.cone.geometry.dispose(),this.cone.material.dispose()}}class xx extends zo{constructor(e=1){const t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],n=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],i=new zt;i.setAttribute("position",new Ct(t,3)),i.setAttribute("color",new Ct(n,3));const r=new Ls({vertexColors:!0,toneMapped:!1});super(i,r),this.type="AxesHelper"}setColors(e,t,n){const i=new ke,r=this.geometry.attributes.color.array;return i.set(e),i.toArray(r,0),i.toArray(r,3),i.set(t),i.toArray(r,6),i.toArray(r,9),i.set(n),i.toArray(r,12),i.toArray(r,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){this.geometry.dispose(),this.material.dispose()}}class Am extends Nr{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){if(e===void 0){Oe("Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}}function kf(s,e,t,n){const i=yx(n);switch(t){case am:return s*e;case Zu:return s*e/i.components*i.byteLength;case Ku:return s*e/i.components*i.byteLength;case wo:return s*e*2/i.components*i.byteLength;case Qu:return s*e*2/i.components*i.byteLength;case lm:return s*e*3/i.components*i.byteLength;case pi:return s*e*4/i.components*i.byteLength;case Ju:return s*e*4/i.components*i.byteLength;case wl:case El:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Tl:case Al:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Oh:case Bh:return Math.max(s,16)*Math.max(e,8)/4;case Fh:case kh:return Math.max(s,8)*Math.max(e,8)/2;case zh:case Hh:case Gh:case Wh:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Vh:case Xh:case jh:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Yh:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case $h:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case qh:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case Zh:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case Kh:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case Qh:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Jh:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case eu:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case tu:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case nu:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case iu:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case su:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case ru:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case ou:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case au:case lu:case cu:return Math.ceil(s/4)*Math.ceil(e/4)*16;case hu:case uu:return Math.ceil(s/4)*Math.ceil(e/4)*8;case du:case fu:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function yx(s){switch(s){case di:case im:return{byteLength:1,components:1};case wa:case sm:case Rs:return{byteLength:2,components:1};case $u:case qu:return{byteLength:2,components:4};case os:case Yu:case Ai:return{byteLength:4,components:1};case rm:case om:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:rc}}));typeof window<"u"&&(window.__THREE__?Oe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=rc);function Rm(){let s=null,e=!1,t=null,n=null;function i(r,o){t(r,o),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function vx(s){const e=new WeakMap;function t(a,l){const c=a.array,h=a.usage,u=c.byteLength,d=s.createBuffer();s.bindBuffer(l,d),s.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=s.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){const h=l.array,u=l.updateRanges;if(s.bindBuffer(c,a),u.length===0)s.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){const g=u[d],_=u[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,u[d]=_)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){const _=u[f];s.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(s.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:i,remove:r,update:o}}var bx=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Sx=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Mx=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,wx=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ex=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Tx=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ax=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Rx=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Cx=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Px=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ix=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Lx=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Dx=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Nx=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Ux=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Fx=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Ox=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,kx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Bx=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,zx=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Hx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Vx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Gx=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Wx=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Xx=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,jx=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Yx=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,$x=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,qx=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Zx=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Kx="gl_FragColor = linearToOutputTexel( gl_FragColor );",Qx=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Jx=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,ey=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,ty=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,ny=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,iy=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,sy=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,ry=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,oy=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,ay=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ly=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,cy=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,hy=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,uy=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,dy=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,fy=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,py=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,my=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,gy=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,_y=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,xy=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,yy=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return v;
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( vec3( 1.0 ) - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,vy=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,by=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Sy=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,My=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,wy=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ey=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ty=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Ay=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ry=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Cy=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Py=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Iy=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ly=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Dy=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Ny=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Uy=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fy=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Oy=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ky=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,By=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,zy=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Hy=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Vy=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Gy=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Wy=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Xy=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,jy=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Yy=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,$y=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,qy=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Zy=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ky=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Qy=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Jy=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ev=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,tv=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,nv=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * 6.28318530718;
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 0, 5, phi ).x + bitangent * vogelDiskSample( 0, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 1, 5, phi ).x + bitangent * vogelDiskSample( 1, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 2, 5, phi ).x + bitangent * vogelDiskSample( 2, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 3, 5, phi ).x + bitangent * vogelDiskSample( 3, 5, phi ).y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * vogelDiskSample( 4, 5, phi ).x + bitangent * vogelDiskSample( 4, 5, phi ).y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadow = step( depth, dp );
			#else
				shadow = step( dp, depth );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,iv=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,sv=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,rv=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,ov=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,av=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,lv=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,cv=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,hv=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,uv=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,dv=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,fv=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,pv=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,mv=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,gv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,_v=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,xv=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,yv=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const vv=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,bv=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Sv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Mv=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ev=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tv=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Av=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Rv=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Cv=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Pv=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Iv=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lv=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Dv=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Nv=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Uv=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fv=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ov=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,kv=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Bv=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zv=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Hv=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Vv=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Gv=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wv=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Xv=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jv=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Yv=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,$v=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,qv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Zv=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Kv=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Qv=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Jv=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,lt={alphahash_fragment:bx,alphahash_pars_fragment:Sx,alphamap_fragment:Mx,alphamap_pars_fragment:wx,alphatest_fragment:Ex,alphatest_pars_fragment:Tx,aomap_fragment:Ax,aomap_pars_fragment:Rx,batching_pars_vertex:Cx,batching_vertex:Px,begin_vertex:Ix,beginnormal_vertex:Lx,bsdfs:Dx,iridescence_fragment:Nx,bumpmap_pars_fragment:Ux,clipping_planes_fragment:Fx,clipping_planes_pars_fragment:Ox,clipping_planes_pars_vertex:kx,clipping_planes_vertex:Bx,color_fragment:zx,color_pars_fragment:Hx,color_pars_vertex:Vx,color_vertex:Gx,common:Wx,cube_uv_reflection_fragment:Xx,defaultnormal_vertex:jx,displacementmap_pars_vertex:Yx,displacementmap_vertex:$x,emissivemap_fragment:qx,emissivemap_pars_fragment:Zx,colorspace_fragment:Kx,colorspace_pars_fragment:Qx,envmap_fragment:Jx,envmap_common_pars_fragment:ey,envmap_pars_fragment:ty,envmap_pars_vertex:ny,envmap_physical_pars_fragment:fy,envmap_vertex:iy,fog_vertex:sy,fog_pars_vertex:ry,fog_fragment:oy,fog_pars_fragment:ay,gradientmap_pars_fragment:ly,lightmap_pars_fragment:cy,lights_lambert_fragment:hy,lights_lambert_pars_fragment:uy,lights_pars_begin:dy,lights_toon_fragment:py,lights_toon_pars_fragment:my,lights_phong_fragment:gy,lights_phong_pars_fragment:_y,lights_physical_fragment:xy,lights_physical_pars_fragment:yy,lights_fragment_begin:vy,lights_fragment_maps:by,lights_fragment_end:Sy,logdepthbuf_fragment:My,logdepthbuf_pars_fragment:wy,logdepthbuf_pars_vertex:Ey,logdepthbuf_vertex:Ty,map_fragment:Ay,map_pars_fragment:Ry,map_particle_fragment:Cy,map_particle_pars_fragment:Py,metalnessmap_fragment:Iy,metalnessmap_pars_fragment:Ly,morphinstance_vertex:Dy,morphcolor_vertex:Ny,morphnormal_vertex:Uy,morphtarget_pars_vertex:Fy,morphtarget_vertex:Oy,normal_fragment_begin:ky,normal_fragment_maps:By,normal_pars_fragment:zy,normal_pars_vertex:Hy,normal_vertex:Vy,normalmap_pars_fragment:Gy,clearcoat_normal_fragment_begin:Wy,clearcoat_normal_fragment_maps:Xy,clearcoat_pars_fragment:jy,iridescence_pars_fragment:Yy,opaque_fragment:$y,packing:qy,premultiplied_alpha_fragment:Zy,project_vertex:Ky,dithering_fragment:Qy,dithering_pars_fragment:Jy,roughnessmap_fragment:ev,roughnessmap_pars_fragment:tv,shadowmap_pars_fragment:nv,shadowmap_pars_vertex:iv,shadowmap_vertex:sv,shadowmask_pars_fragment:rv,skinbase_vertex:ov,skinning_pars_vertex:av,skinning_vertex:lv,skinnormal_vertex:cv,specularmap_fragment:hv,specularmap_pars_fragment:uv,tonemapping_fragment:dv,tonemapping_pars_fragment:fv,transmission_fragment:pv,transmission_pars_fragment:mv,uv_pars_fragment:gv,uv_pars_vertex:_v,uv_vertex:xv,worldpos_vertex:yv,background_vert:vv,background_frag:bv,backgroundCube_vert:Sv,backgroundCube_frag:Mv,cube_vert:wv,cube_frag:Ev,depth_vert:Tv,depth_frag:Av,distance_vert:Rv,distance_frag:Cv,equirect_vert:Pv,equirect_frag:Iv,linedashed_vert:Lv,linedashed_frag:Dv,meshbasic_vert:Nv,meshbasic_frag:Uv,meshlambert_vert:Fv,meshlambert_frag:Ov,meshmatcap_vert:kv,meshmatcap_frag:Bv,meshnormal_vert:zv,meshnormal_frag:Hv,meshphong_vert:Vv,meshphong_frag:Gv,meshphysical_vert:Wv,meshphysical_frag:Xv,meshtoon_vert:jv,meshtoon_frag:Yv,points_vert:$v,points_frag:qv,shadow_vert:Zv,shadow_frag:Kv,sprite_vert:Qv,sprite_frag:Jv},be={common:{diffuse:{value:new ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ot},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ot}},envmap:{envMap:{value:null},envMapRotation:{value:new ot},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ot}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ot}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ot},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ot},normalScale:{value:new Ne(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ot},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ot}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ot}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ot}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0},uvTransform:{value:new ot}},sprite:{diffuse:{value:new ke(16777215)},opacity:{value:1},center:{value:new Ne(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ot},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0}}},Yi={basic:{uniforms:Hn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.fog]),vertexShader:lt.meshbasic_vert,fragmentShader:lt.meshbasic_frag},lambert:{uniforms:Hn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new ke(0)}}]),vertexShader:lt.meshlambert_vert,fragmentShader:lt.meshlambert_frag},phong:{uniforms:Hn([be.common,be.specularmap,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.fog,be.lights,{emissive:{value:new ke(0)},specular:{value:new ke(1118481)},shininess:{value:30}}]),vertexShader:lt.meshphong_vert,fragmentShader:lt.meshphong_frag},standard:{uniforms:Hn([be.common,be.envmap,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.roughnessmap,be.metalnessmap,be.fog,be.lights,{emissive:{value:new ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag},toon:{uniforms:Hn([be.common,be.aomap,be.lightmap,be.emissivemap,be.bumpmap,be.normalmap,be.displacementmap,be.gradientmap,be.fog,be.lights,{emissive:{value:new ke(0)}}]),vertexShader:lt.meshtoon_vert,fragmentShader:lt.meshtoon_frag},matcap:{uniforms:Hn([be.common,be.bumpmap,be.normalmap,be.displacementmap,be.fog,{matcap:{value:null}}]),vertexShader:lt.meshmatcap_vert,fragmentShader:lt.meshmatcap_frag},points:{uniforms:Hn([be.points,be.fog]),vertexShader:lt.points_vert,fragmentShader:lt.points_frag},dashed:{uniforms:Hn([be.common,be.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:lt.linedashed_vert,fragmentShader:lt.linedashed_frag},depth:{uniforms:Hn([be.common,be.displacementmap]),vertexShader:lt.depth_vert,fragmentShader:lt.depth_frag},normal:{uniforms:Hn([be.common,be.bumpmap,be.normalmap,be.displacementmap,{opacity:{value:1}}]),vertexShader:lt.meshnormal_vert,fragmentShader:lt.meshnormal_frag},sprite:{uniforms:Hn([be.sprite,be.fog]),vertexShader:lt.sprite_vert,fragmentShader:lt.sprite_frag},background:{uniforms:{uvTransform:{value:new ot},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:lt.background_vert,fragmentShader:lt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ot}},vertexShader:lt.backgroundCube_vert,fragmentShader:lt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:lt.cube_vert,fragmentShader:lt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:lt.equirect_vert,fragmentShader:lt.equirect_frag},distance:{uniforms:Hn([be.common,be.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:lt.distance_vert,fragmentShader:lt.distance_frag},shadow:{uniforms:Hn([be.lights,be.fog,{color:{value:new ke(0)},opacity:{value:1}}]),vertexShader:lt.shadow_vert,fragmentShader:lt.shadow_frag}};Yi.physical={uniforms:Hn([Yi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ot},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ot},clearcoatNormalScale:{value:new Ne(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ot},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ot},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ot},sheen:{value:0},sheenColor:{value:new ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ot},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ot},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ot},transmissionSamplerSize:{value:new Ne},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ot},attenuationDistance:{value:0},attenuationColor:{value:new ke(0)},specularColor:{value:new ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ot},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ot},anisotropyVector:{value:new Ne},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ot}}]),vertexShader:lt.meshphysical_vert,fragmentShader:lt.meshphysical_frag};const ml={r:0,b:0,g:0},cr=new Ii,eb=new Ye;function tb(s,e,t,n,i,r,o){const a=new ke(0);let l=r===!0?0:1,c,h,u=null,d=0,f=null;function g(b){let v=b.isScene===!0?b.background:null;return v&&v.isTexture&&(v=(b.backgroundBlurriness>0?t:e).get(v)),v}function _(b){let v=!1;const M=g(b);M===null?p(a,l):M&&M.isColor&&(p(M,1),v=!0);const E=s.xr.getEnvironmentBlendMode();E==="additive"?n.buffers.color.setClear(0,0,0,1,o):E==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(s.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function m(b,v){const M=g(v);M&&(M.isCubeTexture||M.mapping===oc)?(h===void 0&&(h=new ve(new un(1,1,1),new as({name:"BackgroundCubeMaterial",uniforms:Co(Yi.backgroundCube.uniforms),vertexShader:Yi.backgroundCube.vertexShader,fragmentShader:Yi.backgroundCube.fragmentShader,side:$n,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(E,A,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),cr.copy(v.backgroundRotation),cr.x*=-1,cr.y*=-1,cr.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(cr.y*=-1,cr.z*=-1),h.material.uniforms.envMap.value=M,h.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(eb.makeRotationFromEuler(cr)),h.material.toneMapped=xt.getTransfer(M.colorSpace)!==Dt,(u!==M||d!==M.version||f!==s.toneMapping)&&(h.material.needsUpdate=!0,u=M,d=M.version,f=s.toneMapping),h.layers.enableAll(),b.unshift(h,h.geometry,h.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new ve(new ka(2,2),new as({name:"BackgroundMaterial",uniforms:Co(Yi.background.uniforms),vertexShader:Yi.background.vertexShader,fragmentShader:Yi.background.fragmentShader,side:As,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=xt.getTransfer(M.colorSpace)!==Dt,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(u!==M||d!==M.version||f!==s.toneMapping)&&(c.material.needsUpdate=!0,u=M,d=M.version,f=s.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null))}function p(b,v){b.getRGB(ml,gm(s)),n.buffers.color.setClear(ml.r,ml.g,ml.b,v,o)}function y(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(b,v=1){a.set(b),l=v,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(b){l=b,p(a,l)},render:_,addToRenderList:m,dispose:y}}function nb(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=d(null);let r=i,o=!1;function a(T,L,k,H,Y){let W=!1;const j=u(H,k,L);r!==j&&(r=j,c(r.object)),W=f(T,H,k,Y),W&&g(T,H,k,Y),Y!==null&&e.update(Y,s.ELEMENT_ARRAY_BUFFER),(W||o)&&(o=!1,v(T,L,k,H),Y!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(Y).buffer))}function l(){return s.createVertexArray()}function c(T){return s.bindVertexArray(T)}function h(T){return s.deleteVertexArray(T)}function u(T,L,k){const H=k.wireframe===!0;let Y=n[T.id];Y===void 0&&(Y={},n[T.id]=Y);let W=Y[L.id];W===void 0&&(W={},Y[L.id]=W);let j=W[H];return j===void 0&&(j=d(l()),W[H]=j),j}function d(T){const L=[],k=[],H=[];for(let Y=0;Y<t;Y++)L[Y]=0,k[Y]=0,H[Y]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:k,attributeDivisors:H,object:T,attributes:{},index:null}}function f(T,L,k,H){const Y=r.attributes,W=L.attributes;let j=0;const V=k.getAttributes();for(const q in V)if(V[q].location>=0){const ue=Y[q];let de=W[q];if(de===void 0&&(q==="instanceMatrix"&&T.instanceMatrix&&(de=T.instanceMatrix),q==="instanceColor"&&T.instanceColor&&(de=T.instanceColor)),ue===void 0||ue.attribute!==de||de&&ue.data!==de.data)return!0;j++}return r.attributesNum!==j||r.index!==H}function g(T,L,k,H){const Y={},W=L.attributes;let j=0;const V=k.getAttributes();for(const q in V)if(V[q].location>=0){let ue=W[q];ue===void 0&&(q==="instanceMatrix"&&T.instanceMatrix&&(ue=T.instanceMatrix),q==="instanceColor"&&T.instanceColor&&(ue=T.instanceColor));const de={};de.attribute=ue,ue&&ue.data&&(de.data=ue.data),Y[q]=de,j++}r.attributes=Y,r.attributesNum=j,r.index=H}function _(){const T=r.newAttributes;for(let L=0,k=T.length;L<k;L++)T[L]=0}function m(T){p(T,0)}function p(T,L){const k=r.newAttributes,H=r.enabledAttributes,Y=r.attributeDivisors;k[T]=1,H[T]===0&&(s.enableVertexAttribArray(T),H[T]=1),Y[T]!==L&&(s.vertexAttribDivisor(T,L),Y[T]=L)}function y(){const T=r.newAttributes,L=r.enabledAttributes;for(let k=0,H=L.length;k<H;k++)L[k]!==T[k]&&(s.disableVertexAttribArray(k),L[k]=0)}function b(T,L,k,H,Y,W,j){j===!0?s.vertexAttribIPointer(T,L,k,Y,W):s.vertexAttribPointer(T,L,k,H,Y,W)}function v(T,L,k,H){_();const Y=H.attributes,W=k.getAttributes(),j=L.defaultAttributeValues;for(const V in W){const q=W[V];if(q.location>=0){let he=Y[V];if(he===void 0&&(V==="instanceMatrix"&&T.instanceMatrix&&(he=T.instanceMatrix),V==="instanceColor"&&T.instanceColor&&(he=T.instanceColor)),he!==void 0){const ue=he.normalized,de=he.itemSize,ze=e.get(he);if(ze===void 0)continue;const Je=ze.buffer,ht=ze.type,_t=ze.bytesPerElement,se=ht===s.INT||ht===s.UNSIGNED_INT||he.gpuType===Yu;if(he.isInterleavedBufferAttribute){const ae=he.data,we=ae.stride,tt=he.offset;if(ae.isInstancedInterleavedBuffer){for(let Ae=0;Ae<q.locationSize;Ae++)p(q.location+Ae,ae.meshPerAttribute);T.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let Ae=0;Ae<q.locationSize;Ae++)m(q.location+Ae);s.bindBuffer(s.ARRAY_BUFFER,Je);for(let Ae=0;Ae<q.locationSize;Ae++)b(q.location+Ae,de/q.locationSize,ht,ue,we*_t,(tt+de/q.locationSize*Ae)*_t,se)}else{if(he.isInstancedBufferAttribute){for(let ae=0;ae<q.locationSize;ae++)p(q.location+ae,he.meshPerAttribute);T.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=he.meshPerAttribute*he.count)}else for(let ae=0;ae<q.locationSize;ae++)m(q.location+ae);s.bindBuffer(s.ARRAY_BUFFER,Je);for(let ae=0;ae<q.locationSize;ae++)b(q.location+ae,de/q.locationSize,ht,ue,de*_t,de/q.locationSize*ae*_t,se)}}else if(j!==void 0){const ue=j[V];if(ue!==void 0)switch(ue.length){case 2:s.vertexAttrib2fv(q.location,ue);break;case 3:s.vertexAttrib3fv(q.location,ue);break;case 4:s.vertexAttrib4fv(q.location,ue);break;default:s.vertexAttrib1fv(q.location,ue)}}}}y()}function M(){P();for(const T in n){const L=n[T];for(const k in L){const H=L[k];for(const Y in H)h(H[Y].object),delete H[Y];delete L[k]}delete n[T]}}function E(T){if(n[T.id]===void 0)return;const L=n[T.id];for(const k in L){const H=L[k];for(const Y in H)h(H[Y].object),delete H[Y];delete L[k]}delete n[T.id]}function A(T){for(const L in n){const k=n[L];if(k[T.id]===void 0)continue;const H=k[T.id];for(const Y in H)h(H[Y].object),delete H[Y];delete k[T.id]}}function P(){S(),o=!0,r!==i&&(r=i,c(r.object))}function S(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:P,resetDefaultState:S,dispose:M,releaseStatesOfGeometry:E,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:m,disableUnusedAttributes:y}}function ib(s,e,t){let n;function i(c){n=c}function r(c,h){s.drawArrays(n,c,h),t.update(h,n,1)}function o(c,h,u){u!==0&&(s.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let f=0;for(let g=0;g<u;g++)f+=h[g];t.update(f,n,1)}function l(c,h,u,d){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],h[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_]*d[_];t.update(g,n,1)}}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function sb(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(A){return!(A!==pi&&n.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){const P=A===Rs&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==di&&n.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==Ai&&!P)}function l(A){if(A==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(Oe("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),y=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),b=s.getParameter(s.MAX_VARYING_VECTORS),v=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),M=s.getParameter(s.MAX_SAMPLES),E=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:y,maxVaryings:b,maxFragmentUniforms:v,maxSamples:M,samples:E}}function rb(s){const e=this;let t=null,n=0,i=!1,r=!1;const o=new Ti,a=new ot,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){const g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,p=s.get(u);if(!i||g===null||g.length===0||r&&!m)r?h(null):c();else{const y=r?0:n,b=y*4;let v=p.clippingState||null;l.value=v,v=h(g,d,b,f);for(let M=0;M!==b;++M)v[M]=t[M];p.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,g){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const p=f+_*4,y=d.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<p)&&(m=new Float32Array(p));for(let b=0,v=f;b!==_;++b,v+=4)o.copy(u[b]).applyMatrix4(y,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function ob(s){let e=new WeakMap;function t(o,a){return a===Nh?o.mapping=Cr:a===Uh&&(o.mapping=Mo),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Nh||a===Uh)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new ym(l.height);return c.fromEquirectangularTexture(s,o),e.set(o,c),o.addEventListener("dispose",i),t(c.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}const Gs=4,Bf=[.125,.215,.35,.446,.526,.582],yr=20,ab=256,ea=new za,zf=new ke;let Zc=null,Kc=0,Qc=0,Jc=!1;const lb=new D;class Hf{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,i=100,r={}){const{size:o=256,position:a=lb}=r;Zc=this._renderer.getRenderTarget(),Kc=this._renderer.getActiveCubeFace(),Qc=this._renderer.getActiveMipmapLevel(),Jc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,i,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Wf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Gf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Zc,Kc,Qc),this._renderer.xr.enabled=Jc,e.scissorTest=!1,no(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Cr||e.mapping===Mo?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Zc=this._renderer.getRenderTarget(),Kc=this._renderer.getActiveCubeFace(),Qc=this._renderer.getActiveMipmapLevel(),Jc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:pn,minFilter:pn,generateMipmaps:!1,type:Rs,format:pi,colorSpace:kn,depthBuffer:!1},i=Vf(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Vf(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=cb(r)),this._blurMaterial=ub(r,e,t),this._ggxMaterial=hb(r,e,t)}return i}_compileMaterial(e){const t=new ve(new zt,e);this._renderer.compile(t,ea)}_sceneToCubeUV(e,t,n,i,r){const l=new Wn(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(zf),u.toneMapping=ts,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(i),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ve(new un,new ki({name:"PMREM.Background",side:$n,depthWrite:!1,depthTest:!1})));const _=this._backgroundBox,m=_.material;let p=!1;const y=e.background;y?y.isColor&&(m.color.copy(y),e.background=null,p=!0):(m.color.copy(zf),p=!0);for(let b=0;b<6;b++){const v=b%3;v===0?(l.up.set(0,c[b],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[b],r.y,r.z)):v===1?(l.up.set(0,0,c[b]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[b],r.z)):(l.up.set(0,c[b],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[b]));const M=this._cubeSize;no(i,v*M,b>2?M:0,M,M),u.setRenderTarget(i),p&&u.render(_,l),u.render(e,l)}u.toneMapping=f,u.autoClear=d,e.background=y}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===Cr||e.mapping===Mo;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Wf()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Gf());const r=i?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;const a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;no(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,ea)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodMeshes.length;for(let r=1;r<i;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const i=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;const l=o.uniforms,c=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=0+c*1.25,f=u*d,{_lodMax:g}=this,_=this._sizeLods[n],m=3*_*(n>g-Gs?n-g+Gs:0),p=4*(this._cubeSize-_);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=g-t,no(r,m,p,3*_,2*_),i.setRenderTarget(r),i.render(a,ea),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,no(e,m,p,3*_,2*_),i.setRenderTarget(e),i.render(a,ea)}_blur(e,t,n,i,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,i,"latitudinal",r),this._halfBlur(o,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&Ke("blur direction must be either latitudinal or longitudinal!");const h=3,u=this._lodMeshes[i];u.material=c;const d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*yr-1),_=r/g,m=isFinite(r)?1+Math.floor(h*_):yr;m>yr&&Oe(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${yr}`);const p=[];let y=0;for(let A=0;A<yr;++A){const P=A/_,S=Math.exp(-P*P/2);p.push(S),A===0?y+=S:A<m&&(y+=2*S)}for(let A=0;A<p.length;A++)p[A]=p[A]/y;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:b}=this;d.dTheta.value=g,d.mipInt.value=b-n;const v=this._sizeLods[i],M=3*v*(i>b-Gs?i-b+Gs:0),E=4*(this._cubeSize-v);no(t,M,E,3*v,2*v),l.setRenderTarget(t),l.render(u,ea)}}function cb(s){const e=[],t=[],n=[];let i=s;const r=s-Gs+1+Bf.length;for(let o=0;o<r;o++){const a=Math.pow(2,i);e.push(a);let l=1/a;o>s-Gs?l=Bf[o-s+Gs-1]:o===0&&(l=0),t.push(l);const c=1/(a-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,_=3,m=2,p=1,y=new Float32Array(_*g*f),b=new Float32Array(m*g*f),v=new Float32Array(p*g*f);for(let E=0;E<f;E++){const A=E%3*2/3-1,P=E>2?0:-1,S=[A,P,0,A+2/3,P,0,A+2/3,P+1,0,A,P,0,A+2/3,P+1,0,A,P+1,0];y.set(S,_*g*E),b.set(d,m*g*E);const T=[E,E,E,E,E,E];v.set(T,p*g*E)}const M=new zt;M.setAttribute("position",new Et(y,_)),M.setAttribute("uv",new Et(b,m)),M.setAttribute("faceIndex",new Et(v,p)),n.push(new ve(M,null)),i>Gs&&i--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function Vf(s,e,t){const n=new ns(s,e,t);return n.texture.mapping=oc,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function no(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function hb(s,e,t){return new as({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:ab,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:hc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Es,depthTest:!1,depthWrite:!1})}function ub(s,e,t){const n=new Float32Array(yr),i=new D(0,1,0);return new as({name:"SphericalGaussianBlur",defines:{n:yr,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:hc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Es,depthTest:!1,depthWrite:!1})}function Gf(){return new as({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:hc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Es,depthTest:!1,depthWrite:!1})}function Wf(){return new as({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:hc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Es,depthTest:!1,depthWrite:!1})}function hc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function db(s){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Nh||l===Uh,h=l===Cr||l===Mo;if(c||h){let u=e.get(a);const d=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new Hf(s)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const f=a.image;return c&&f&&f.height>0||h&&f&&i(f)?(t===null&&(t=new Hf(s)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function i(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function fb(s){const e={};function t(n){if(e[n]!==void 0)return e[n];const i=s.getExtension(n);return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&Aa("WebGLRenderer: "+n+" extension not supported."),i}}}function pb(s,e,t,n){const i={},r=new WeakMap;function o(u){const d=u.target;d.index!==null&&e.remove(d.index);for(const g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete i[d.id];const f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(u,d){return i[d.id]===!0||(d.addEventListener("dispose",o),i[d.id]=!0,t.memory.geometries++),d}function l(u){const d=u.attributes;for(const f in d)e.update(d[f],s.ARRAY_BUFFER)}function c(u){const d=[],f=u.index,g=u.attributes.position;let _=0;if(f!==null){const y=f.array;_=f.version;for(let b=0,v=y.length;b<v;b+=3){const M=y[b+0],E=y[b+1],A=y[b+2];d.push(M,E,E,A,A,M)}}else if(g!==void 0){const y=g.array;_=g.version;for(let b=0,v=y.length/3-1;b<v;b+=3){const M=b+0,E=b+1,A=b+2;d.push(M,E,E,A,A,M)}}else return;const m=new(hm(d)?mm:pm)(d,1);m.version=_;const p=r.get(u);p&&e.remove(p),r.set(u,m)}function h(u){const d=r.get(u);if(d){const f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function mb(s,e,t){let n;function i(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,f){s.drawElements(n,f,r,d*o),t.update(f,n,1)}function c(d,f,g){g!==0&&(s.drawElementsInstanced(n,f,r,d*o,g),t.update(f,n,g))}function h(d,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}function u(d,f,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)c(d[p]/o,f[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,_,0,g);let p=0;for(let y=0;y<g;y++)p+=f[y]*_[y];t.update(p,n,1)}}this.setMode=i,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function gb(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case s.TRIANGLES:t.triangles+=a*(r/3);break;case s.LINES:t.lines+=a*(r/2);break;case s.LINE_STRIP:t.lines+=a*(r-1);break;case s.LINE_LOOP:t.lines+=a*r;break;case s.POINTS:t.points+=a*r;break;default:Ke("WebGLInfo: Unknown draw mode:",o);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function _b(s,e,t){const n=new WeakMap,i=new Yt;function r(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(a);if(d===void 0||d.count!==u){let T=function(){P.dispose(),n.delete(a),a.removeEventListener("dispose",T)};var f=T;d!==void 0&&d.texture.dispose();const g=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],y=a.morphAttributes.normal||[],b=a.morphAttributes.color||[];let v=0;g===!0&&(v=1),_===!0&&(v=2),m===!0&&(v=3);let M=a.attributes.position.count*v,E=1;M>e.maxTextureSize&&(E=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);const A=new Float32Array(M*E*4*u),P=new dm(A,M,E,u);P.type=Ai,P.needsUpdate=!0;const S=v*4;for(let L=0;L<u;L++){const k=p[L],H=y[L],Y=b[L],W=M*E*4*L;for(let j=0;j<k.count;j++){const V=j*S;g===!0&&(i.fromBufferAttribute(k,j),A[W+V+0]=i.x,A[W+V+1]=i.y,A[W+V+2]=i.z,A[W+V+3]=0),_===!0&&(i.fromBufferAttribute(H,j),A[W+V+4]=i.x,A[W+V+5]=i.y,A[W+V+6]=i.z,A[W+V+7]=0),m===!0&&(i.fromBufferAttribute(Y,j),A[W+V+8]=i.x,A[W+V+9]=i.y,A[W+V+10]=i.z,A[W+V+11]=Y.itemSize===4?i.w:1)}}d={count:u,texture:P,size:new Ne(M,E)},n.set(a,d),a.addEventListener("dispose",T)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,t);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const _=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(s,"morphTargetBaseInfluence",_),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function xb(s,e,t,n){let i=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);if(i.get(u)!==c&&(e.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),i.get(l)!==c&&(t.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,s.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;i.get(d)!==c&&(d.update(),i.set(d,c))}return u}function o(){i=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}const yb={[Zp]:"LINEAR_TONE_MAPPING",[Kp]:"REINHARD_TONE_MAPPING",[Qp]:"CINEON_TONE_MAPPING",[Xu]:"ACES_FILMIC_TONE_MAPPING",[em]:"AGX_TONE_MAPPING",[tm]:"NEUTRAL_TONE_MAPPING",[Jp]:"CUSTOM_TONE_MAPPING"};function vb(s,e,t,n,i){const r=new ns(e,t,{type:s,depthBuffer:n,stencilBuffer:i}),o=new ns(e,t,{type:Rs,depthBuffer:!1,stencilBuffer:!1}),a=new zt;a.setAttribute("position",new Ct([-1,3,0,-1,-1,0,3,-1,0],3)),a.setAttribute("uv",new Ct([0,2,0,0,2,0],2));const l=new F0({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),c=new ve(a,l),h=new za(-1,1,1,-1,0,1);let u=null,d=null,f=!1,g,_=null,m=[],p=!1;this.setSize=function(y,b){r.setSize(y,b),o.setSize(y,b);for(let v=0;v<m.length;v++){const M=m[v];M.setSize&&M.setSize(y,b)}},this.setEffects=function(y){m=y,p=m.length>0&&m[0].isRenderPass===!0;const b=r.width,v=r.height;for(let M=0;M<m.length;M++){const E=m[M];E.setSize&&E.setSize(b,v)}},this.begin=function(y,b){if(f||y.toneMapping===ts&&m.length===0)return!1;if(_=b,b!==null){const v=b.width,M=b.height;(r.width!==v||r.height!==M)&&this.setSize(v,M)}return p===!1&&y.setRenderTarget(r),g=y.toneMapping,y.toneMapping=ts,!0},this.hasRenderPass=function(){return p},this.end=function(y,b){y.toneMapping=g,f=!0;let v=r,M=o;for(let E=0;E<m.length;E++){const A=m[E];if(A.enabled!==!1&&(A.render(y,M,v,b),A.needsSwap!==!1)){const P=v;v=M,M=P}}if(u!==y.outputColorSpace||d!==y.toneMapping){u=y.outputColorSpace,d=y.toneMapping,l.defines={},xt.getTransfer(u)===Dt&&(l.defines.SRGB_TRANSFER="");const E=yb[d];E&&(l.defines[E]=""),l.needsUpdate=!0}l.uniforms.tDiffuse.value=v.texture,y.setRenderTarget(_),y.render(c,h),_=null,f=!1},this.isCompositing=function(){return f},this.dispose=function(){r.dispose(),o.dispose(),a.dispose(),l.dispose()}}const Cm=new yn,vu=new Ra(1,1),Pm=new dm,Im=new a0,Lm=new xm,Xf=[],jf=[],Yf=new Float32Array(16),$f=new Float32Array(9),qf=new Float32Array(4);function Go(s,e,t){const n=s[0];if(n<=0||n>0)return s;const i=e*t;let r=Xf[i];if(r===void 0&&(r=new Float32Array(i),Xf[i]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,s[o].toArray(r,a)}return r}function vn(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function bn(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function uc(s,e){let t=jf[e];t===void 0&&(t=new Int32Array(e),jf[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function bb(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function Sb(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(vn(t,e))return;s.uniform2fv(this.addr,e),bn(t,e)}}function Mb(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(vn(t,e))return;s.uniform3fv(this.addr,e),bn(t,e)}}function wb(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(vn(t,e))return;s.uniform4fv(this.addr,e),bn(t,e)}}function Eb(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(vn(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),bn(t,e)}else{if(vn(t,n))return;qf.set(n),s.uniformMatrix2fv(this.addr,!1,qf),bn(t,n)}}function Tb(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(vn(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),bn(t,e)}else{if(vn(t,n))return;$f.set(n),s.uniformMatrix3fv(this.addr,!1,$f),bn(t,n)}}function Ab(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(vn(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),bn(t,e)}else{if(vn(t,n))return;Yf.set(n),s.uniformMatrix4fv(this.addr,!1,Yf),bn(t,n)}}function Rb(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function Cb(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(vn(t,e))return;s.uniform2iv(this.addr,e),bn(t,e)}}function Pb(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(vn(t,e))return;s.uniform3iv(this.addr,e),bn(t,e)}}function Ib(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(vn(t,e))return;s.uniform4iv(this.addr,e),bn(t,e)}}function Lb(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function Db(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(vn(t,e))return;s.uniform2uiv(this.addr,e),bn(t,e)}}function Nb(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(vn(t,e))return;s.uniform3uiv(this.addr,e),bn(t,e)}}function Ub(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(vn(t,e))return;s.uniform4uiv(this.addr,e),bn(t,e)}}function Fb(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(vu.compareFunction=t.isReversedDepthBuffer()?nd:td,r=vu):r=Cm,t.setTexture2D(e||r,i)}function Ob(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||Im,i)}function kb(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Lm,i)}function Bb(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||Pm,i)}function zb(s){switch(s){case 5126:return bb;case 35664:return Sb;case 35665:return Mb;case 35666:return wb;case 35674:return Eb;case 35675:return Tb;case 35676:return Ab;case 5124:case 35670:return Rb;case 35667:case 35671:return Cb;case 35668:case 35672:return Pb;case 35669:case 35673:return Ib;case 5125:return Lb;case 36294:return Db;case 36295:return Nb;case 36296:return Ub;case 35678:case 36198:case 36298:case 36306:case 35682:return Fb;case 35679:case 36299:case 36307:return Ob;case 35680:case 36300:case 36308:case 36293:return kb;case 36289:case 36303:case 36311:case 36292:return Bb}}function Hb(s,e){s.uniform1fv(this.addr,e)}function Vb(s,e){const t=Go(e,this.size,2);s.uniform2fv(this.addr,t)}function Gb(s,e){const t=Go(e,this.size,3);s.uniform3fv(this.addr,t)}function Wb(s,e){const t=Go(e,this.size,4);s.uniform4fv(this.addr,t)}function Xb(s,e){const t=Go(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function jb(s,e){const t=Go(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function Yb(s,e){const t=Go(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function $b(s,e){s.uniform1iv(this.addr,e)}function qb(s,e){s.uniform2iv(this.addr,e)}function Zb(s,e){s.uniform3iv(this.addr,e)}function Kb(s,e){s.uniform4iv(this.addr,e)}function Qb(s,e){s.uniform1uiv(this.addr,e)}function Jb(s,e){s.uniform2uiv(this.addr,e)}function eS(s,e){s.uniform3uiv(this.addr,e)}function tS(s,e){s.uniform4uiv(this.addr,e)}function nS(s,e,t){const n=this.cache,i=e.length,r=uc(t,i);vn(n,r)||(s.uniform1iv(this.addr,r),bn(n,r));let o;this.type===s.SAMPLER_2D_SHADOW?o=vu:o=Cm;for(let a=0;a!==i;++a)t.setTexture2D(e[a]||o,r[a])}function iS(s,e,t){const n=this.cache,i=e.length,r=uc(t,i);vn(n,r)||(s.uniform1iv(this.addr,r),bn(n,r));for(let o=0;o!==i;++o)t.setTexture3D(e[o]||Im,r[o])}function sS(s,e,t){const n=this.cache,i=e.length,r=uc(t,i);vn(n,r)||(s.uniform1iv(this.addr,r),bn(n,r));for(let o=0;o!==i;++o)t.setTextureCube(e[o]||Lm,r[o])}function rS(s,e,t){const n=this.cache,i=e.length,r=uc(t,i);vn(n,r)||(s.uniform1iv(this.addr,r),bn(n,r));for(let o=0;o!==i;++o)t.setTexture2DArray(e[o]||Pm,r[o])}function oS(s){switch(s){case 5126:return Hb;case 35664:return Vb;case 35665:return Gb;case 35666:return Wb;case 35674:return Xb;case 35675:return jb;case 35676:return Yb;case 5124:case 35670:return $b;case 35667:case 35671:return qb;case 35668:case 35672:return Zb;case 35669:case 35673:return Kb;case 5125:return Qb;case 36294:return Jb;case 36295:return eS;case 36296:return tS;case 35678:case 36198:case 36298:case 36306:case 35682:return nS;case 35679:case 36299:case 36307:return iS;case 35680:case 36300:case 36308:case 36293:return sS;case 36289:case 36303:case 36311:case 36292:return rS}}class aS{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=zb(t.type)}}class lS{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=oS(t.type)}}class cS{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let r=0,o=i.length;r!==o;++r){const a=i[r];a.setValue(e,t[a.id],n)}}}const eh=/(\w+)(\])?(\[|\.)?/g;function Zf(s,e){s.seq.push(e),s.map[e.id]=e}function hS(s,e,t){const n=s.name,i=n.length;for(eh.lastIndex=0;;){const r=eh.exec(n),o=eh.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){Zf(t,c===void 0?new aS(a,s,e):new lS(a,s,e));break}else{let u=t.map[a];u===void 0&&(u=new cS(a),Zf(t,u)),t=u}}}class Rl{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){const a=e.getActiveUniform(t,o),l=e.getUniformLocation(t,a.name);hS(a,l,this)}const i=[],r=[];for(const o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?i.push(o):r.push(o);i.length>0&&(this.seq=i.concat(r))}setValue(e,t,n,i){const r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,r=e.length;i!==r;++i){const o=e[i];o.id in t&&n.push(o)}return n}}function Kf(s,e,t){const n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}const uS=37297;let dS=0;function fS(s,e){const t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=i;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const Qf=new ot;function pS(s){xt._getMatrix(Qf,xt.workingColorSpace,s);const e=`mat3( ${Qf.elements.map(t=>t.toFixed(4))} )`;switch(xt.getTransfer(s)){case Ul:return[e,"LinearTransferOETF"];case Dt:return[e,"sRGBTransferOETF"];default:return Oe("WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function Jf(s,e,t){const n=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+fS(s.getShaderSource(e),a)}else return r}function mS(s,e){const t=pS(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const gS={[Zp]:"Linear",[Kp]:"Reinhard",[Qp]:"Cineon",[Xu]:"ACESFilmic",[em]:"AgX",[tm]:"Neutral",[Jp]:"Custom"};function _S(s,e){const t=gS[e];return t===void 0?(Oe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const gl=new D;function xS(){xt.getLuminanceCoefficients(gl);const s=gl.x.toFixed(4),e=gl.y.toFixed(4),t=gl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function yS(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(aa).join(`
`)}function vS(s){const e=[];for(const t in s){const n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function bS(s,e){const t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(e,i),o=r.name;let a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:s.getAttribLocation(e,o),locationSize:a}}return t}function aa(s){return s!==""}function ep(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function tp(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const SS=/^[ \t]*#include +<([\w\d./]+)>/gm;function bu(s){return s.replace(SS,wS)}const MS=new Map;function wS(s,e){let t=lt[e];if(t===void 0){const n=MS.get(e);if(n!==void 0)t=lt[n],Oe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return bu(t)}const ES=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function np(s){return s.replace(ES,TS)}function TS(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function ip(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const AS={[Ml]:"SHADOWMAP_TYPE_PCF",[oa]:"SHADOWMAP_TYPE_VSM"};function RS(s){return AS[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const CS={[Cr]:"ENVMAP_TYPE_CUBE",[Mo]:"ENVMAP_TYPE_CUBE",[oc]:"ENVMAP_TYPE_CUBE_UV"};function PS(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":CS[s.envMapMode]||"ENVMAP_TYPE_CUBE"}const IS={[Mo]:"ENVMAP_MODE_REFRACTION"};function LS(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":IS[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}const DS={[Wu]:"ENVMAP_BLENDING_MULTIPLY",[E_]:"ENVMAP_BLENDING_MIX",[T_]:"ENVMAP_BLENDING_ADD"};function NS(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":DS[s.combine]||"ENVMAP_BLENDING_NONE"}function US(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function FS(s,e,t,n){const i=s.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=RS(t),c=PS(t),h=LS(t),u=NS(t),d=US(t),f=yS(t),g=vS(r),_=i.createProgram();let m,p,y=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(aa).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(aa).join(`
`),p.length>0&&(p+=`
`)):(m=[ip(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(aa).join(`
`),p=[ip(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ts?"#define TONE_MAPPING":"",t.toneMapping!==ts?lt.tonemapping_pars_fragment:"",t.toneMapping!==ts?_S("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",lt.colorspace_pars_fragment,mS("linearToOutputTexel",t.outputColorSpace),xS(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(aa).join(`
`)),o=bu(o),o=ep(o,t),o=tp(o,t),a=bu(a),a=ep(a,t),a=tp(a,t),o=np(o),a=np(a),t.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===Kd?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Kd?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const b=y+m+o,v=y+p+a,M=Kf(i,i.VERTEX_SHADER,b),E=Kf(i,i.FRAGMENT_SHADER,v);i.attachShader(_,M),i.attachShader(_,E),t.index0AttributeName!==void 0?i.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(_,0,"position"),i.linkProgram(_);function A(L){if(s.debug.checkShaderErrors){const k=i.getProgramInfoLog(_)||"",H=i.getShaderInfoLog(M)||"",Y=i.getShaderInfoLog(E)||"",W=k.trim(),j=H.trim(),V=Y.trim();let q=!0,he=!0;if(i.getProgramParameter(_,i.LINK_STATUS)===!1)if(q=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,_,M,E);else{const ue=Jf(i,M,"vertex"),de=Jf(i,E,"fragment");Ke("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(_,i.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+W+`
`+ue+`
`+de)}else W!==""?Oe("WebGLProgram: Program Info Log:",W):(j===""||V==="")&&(he=!1);he&&(L.diagnostics={runnable:q,programLog:W,vertexShader:{log:j,prefix:m},fragmentShader:{log:V,prefix:p}})}i.deleteShader(M),i.deleteShader(E),P=new Rl(i,_),S=bS(i,_)}let P;this.getUniforms=function(){return P===void 0&&A(this),P};let S;this.getAttributes=function(){return S===void 0&&A(this),S};let T=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(_,uS)),T},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=dS++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=M,this.fragmentShader=E,this}let OS=0;class kS{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new BS(e),t.set(e,n)),n}}class BS{constructor(e){this.id=OS++,this.code=e,this.usedTimes=0}}function zS(s,e,t,n,i,r,o){const a=new sd,l=new kS,c=new Set,h=[],u=new Map,d=i.logarithmicDepthBuffer;let f=i.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,T,L,k,H){const Y=k.fog,W=H.geometry,j=S.isMeshStandardMaterial?k.environment:null,V=(S.isMeshStandardMaterial?t:e).get(S.envMap||j),q=V&&V.mapping===oc?V.image.height:null,he=g[S.type];S.precision!==null&&(f=i.getMaxPrecision(S.precision),f!==S.precision&&Oe("WebGLProgram.getParameters:",S.precision,"not supported, using",f,"instead."));const ue=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,de=ue!==void 0?ue.length:0;let ze=0;W.morphAttributes.position!==void 0&&(ze=1),W.morphAttributes.normal!==void 0&&(ze=2),W.morphAttributes.color!==void 0&&(ze=3);let Je,ht,_t,se;if(he){const Re=Yi[he];Je=Re.vertexShader,ht=Re.fragmentShader}else Je=S.vertexShader,ht=S.fragmentShader,l.update(S),_t=l.getVertexShaderID(S),se=l.getFragmentShaderID(S);const ae=s.getRenderTarget(),we=s.state.buffers.depth.getReversed(),tt=H.isInstancedMesh===!0,Ae=H.isBatchedMesh===!0,st=!!S.map,cn=!!S.matcap,yt=!!V,Rt=!!S.aoMap,Pt=!!S.lightMap,et=!!S.bumpMap,en=!!S.normalMap,F=!!S.displacementMap,tn=!!S.emissiveMap,Mt=!!S.metalnessMap,Ot=!!S.roughnessMap,Le=S.anisotropy>0,I=S.clearcoat>0,w=S.dispersion>0,G=S.iridescence>0,ne=S.sheen>0,oe=S.transmission>0,te=Le&&!!S.anisotropyMap,De=I&&!!S.clearcoatMap,fe=I&&!!S.clearcoatNormalMap,Pe=I&&!!S.clearcoatRoughnessMap,Ge=G&&!!S.iridescenceMap,le=G&&!!S.iridescenceThicknessMap,_e=ne&&!!S.sheenColorMap,Te=ne&&!!S.sheenRoughnessMap,Ie=!!S.specularMap,pe=!!S.specularColorMap,rt=!!S.specularIntensityMap,z=oe&&!!S.transmissionMap,C=oe&&!!S.thicknessMap,N=!!S.gradientMap,x=!!S.alphaMap,B=S.alphaTest>0,O=!!S.alphaHash,U=!!S.extensions;let re=ts;S.toneMapped&&(ae===null||ae.isXRRenderTarget===!0)&&(re=s.toneMapping);const ie={shaderID:he,shaderType:S.type,shaderName:S.name,vertexShader:Je,fragmentShader:ht,defines:S.defines,customVertexShaderID:_t,customFragmentShaderID:se,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:f,batching:Ae,batchingColor:Ae&&H._colorsTexture!==null,instancing:tt,instancingColor:tt&&H.instanceColor!==null,instancingMorph:tt&&H.morphTexture!==null,outputColorSpace:ae===null?s.outputColorSpace:ae.isXRRenderTarget===!0?ae.texture.colorSpace:kn,alphaToCoverage:!!S.alphaToCoverage,map:st,matcap:cn,envMap:yt,envMapMode:yt&&V.mapping,envMapCubeUVHeight:q,aoMap:Rt,lightMap:Pt,bumpMap:et,normalMap:en,displacementMap:F,emissiveMap:tn,normalMapObjectSpace:en&&S.normalMapType===I_,normalMapTangentSpace:en&&S.normalMapType===ed,metalnessMap:Mt,roughnessMap:Ot,anisotropy:Le,anisotropyMap:te,clearcoat:I,clearcoatMap:De,clearcoatNormalMap:fe,clearcoatRoughnessMap:Pe,dispersion:w,iridescence:G,iridescenceMap:Ge,iridescenceThicknessMap:le,sheen:ne,sheenColorMap:_e,sheenRoughnessMap:Te,specularMap:Ie,specularColorMap:pe,specularIntensityMap:rt,transmission:oe,transmissionMap:z,thicknessMap:C,gradientMap:N,opaque:S.transparent===!1&&S.blending===mo&&S.alphaToCoverage===!1,alphaMap:x,alphaTest:B,alphaHash:O,combine:S.combine,mapUv:st&&_(S.map.channel),aoMapUv:Rt&&_(S.aoMap.channel),lightMapUv:Pt&&_(S.lightMap.channel),bumpMapUv:et&&_(S.bumpMap.channel),normalMapUv:en&&_(S.normalMap.channel),displacementMapUv:F&&_(S.displacementMap.channel),emissiveMapUv:tn&&_(S.emissiveMap.channel),metalnessMapUv:Mt&&_(S.metalnessMap.channel),roughnessMapUv:Ot&&_(S.roughnessMap.channel),anisotropyMapUv:te&&_(S.anisotropyMap.channel),clearcoatMapUv:De&&_(S.clearcoatMap.channel),clearcoatNormalMapUv:fe&&_(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Pe&&_(S.clearcoatRoughnessMap.channel),iridescenceMapUv:Ge&&_(S.iridescenceMap.channel),iridescenceThicknessMapUv:le&&_(S.iridescenceThicknessMap.channel),sheenColorMapUv:_e&&_(S.sheenColorMap.channel),sheenRoughnessMapUv:Te&&_(S.sheenRoughnessMap.channel),specularMapUv:Ie&&_(S.specularMap.channel),specularColorMapUv:pe&&_(S.specularColorMap.channel),specularIntensityMapUv:rt&&_(S.specularIntensityMap.channel),transmissionMapUv:z&&_(S.transmissionMap.channel),thicknessMapUv:C&&_(S.thicknessMap.channel),alphaMapUv:x&&_(S.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(en||Le),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!W.attributes.uv&&(st||x),fog:!!Y,useFog:S.fog===!0,fogExp2:!!Y&&Y.isFogExp2,flatShading:S.flatShading===!0&&S.wireframe===!1,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:we,skinning:H.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:de,morphTextureStride:ze,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:s.shadowMap.enabled&&L.length>0,shadowMapType:s.shadowMap.type,toneMapping:re,decodeVideoTexture:st&&S.map.isVideoTexture===!0&&xt.getTransfer(S.map.colorSpace)===Dt,decodeVideoTextureEmissive:tn&&S.emissiveMap.isVideoTexture===!0&&xt.getTransfer(S.emissiveMap.colorSpace)===Dt,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===Jn,flipSided:S.side===$n,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:U&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(U&&S.extensions.multiDraw===!0||Ae)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return ie.vertexUv1s=c.has(1),ie.vertexUv2s=c.has(2),ie.vertexUv3s=c.has(3),c.clear(),ie}function p(S){const T=[];if(S.shaderID?T.push(S.shaderID):(T.push(S.customVertexShaderID),T.push(S.customFragmentShaderID)),S.defines!==void 0)for(const L in S.defines)T.push(L),T.push(S.defines[L]);return S.isRawShaderMaterial===!1&&(y(T,S),b(T,S),T.push(s.outputColorSpace)),T.push(S.customProgramCacheKey),T.join()}function y(S,T){S.push(T.precision),S.push(T.outputColorSpace),S.push(T.envMapMode),S.push(T.envMapCubeUVHeight),S.push(T.mapUv),S.push(T.alphaMapUv),S.push(T.lightMapUv),S.push(T.aoMapUv),S.push(T.bumpMapUv),S.push(T.normalMapUv),S.push(T.displacementMapUv),S.push(T.emissiveMapUv),S.push(T.metalnessMapUv),S.push(T.roughnessMapUv),S.push(T.anisotropyMapUv),S.push(T.clearcoatMapUv),S.push(T.clearcoatNormalMapUv),S.push(T.clearcoatRoughnessMapUv),S.push(T.iridescenceMapUv),S.push(T.iridescenceThicknessMapUv),S.push(T.sheenColorMapUv),S.push(T.sheenRoughnessMapUv),S.push(T.specularMapUv),S.push(T.specularColorMapUv),S.push(T.specularIntensityMapUv),S.push(T.transmissionMapUv),S.push(T.thicknessMapUv),S.push(T.combine),S.push(T.fogExp2),S.push(T.sizeAttenuation),S.push(T.morphTargetsCount),S.push(T.morphAttributeCount),S.push(T.numDirLights),S.push(T.numPointLights),S.push(T.numSpotLights),S.push(T.numSpotLightMaps),S.push(T.numHemiLights),S.push(T.numRectAreaLights),S.push(T.numDirLightShadows),S.push(T.numPointLightShadows),S.push(T.numSpotLightShadows),S.push(T.numSpotLightShadowsWithMaps),S.push(T.numLightProbes),S.push(T.shadowMapType),S.push(T.toneMapping),S.push(T.numClippingPlanes),S.push(T.numClipIntersection),S.push(T.depthPacking)}function b(S,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),S.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),S.push(a.mask)}function v(S){const T=g[S.type];let L;if(T){const k=Yi[T];L=v0.clone(k.uniforms)}else L=S.uniforms;return L}function M(S,T){let L=u.get(T);return L!==void 0?++L.usedTimes:(L=new FS(s,T,S,r),h.push(L),u.set(T,L)),L}function E(S){if(--S.usedTimes===0){const T=h.indexOf(S);h[T]=h[h.length-1],h.pop(),u.delete(S.cacheKey),S.destroy()}}function A(S){l.remove(S)}function P(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:v,acquireProgram:M,releaseProgram:E,releaseShaderCache:A,programs:h,dispose:P}}function HS(){let s=new WeakMap;function e(o){return s.has(o)}function t(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function VS(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function sp(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function rp(){const s=[];let e=0;const t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function o(u,d,f,g,_,m){let p=s[e];return p===void 0?(p={id:u.id,object:u,geometry:d,material:f,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},s[e]=p):(p.id=u.id,p.object=u,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=_,p.group=m),e++,p}function a(u,d,f,g,_,m){const p=o(u,d,f,g,_,m);f.transmission>0?n.push(p):f.transparent===!0?i.push(p):t.push(p)}function l(u,d,f,g,_,m){const p=o(u,d,f,g,_,m);f.transmission>0?n.unshift(p):f.transparent===!0?i.unshift(p):t.unshift(p)}function c(u,d){t.length>1&&t.sort(u||VS),n.length>1&&n.sort(d||sp),i.length>1&&i.sort(d||sp)}function h(){for(let u=e,d=s.length;u<d;u++){const f=s[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:a,unshift:l,finish:h,sort:c}}function GS(){let s=new WeakMap;function e(n,i){const r=s.get(n);let o;return r===void 0?(o=new rp,s.set(n,[o])):i>=r.length?(o=new rp,r.push(o)):o=r[i],o}function t(){s=new WeakMap}return{get:e,dispose:t}}function WS(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new D,color:new ke};break;case"SpotLight":t={position:new D,direction:new D,color:new ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new ke,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new ke,groundColor:new ke};break;case"RectAreaLight":t={color:new ke,position:new D,halfWidth:new D,halfHeight:new D};break}return s[e.id]=t,t}}}function XS(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ne};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ne};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ne,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let jS=0;function YS(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function $S(s){const e=new WS,t=XS(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new D);const i=new D,r=new Ye,o=new Ye;function a(c){let h=0,u=0,d=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let f=0,g=0,_=0,m=0,p=0,y=0,b=0,v=0,M=0,E=0,A=0;c.sort(YS);for(let S=0,T=c.length;S<T;S++){const L=c[S],k=L.color,H=L.intensity,Y=L.distance;let W=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===wo?W=L.shadow.map.texture:W=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)h+=k.r*H,u+=k.g*H,d+=k.b*H;else if(L.isLightProbe){for(let j=0;j<9;j++)n.probe[j].addScaledVector(L.sh.coefficients[j],H);A++}else if(L.isDirectionalLight){const j=e.get(L);if(j.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const V=L.shadow,q=t.get(L);q.shadowIntensity=V.intensity,q.shadowBias=V.bias,q.shadowNormalBias=V.normalBias,q.shadowRadius=V.radius,q.shadowMapSize=V.mapSize,n.directionalShadow[f]=q,n.directionalShadowMap[f]=W,n.directionalShadowMatrix[f]=L.shadow.matrix,y++}n.directional[f]=j,f++}else if(L.isSpotLight){const j=e.get(L);j.position.setFromMatrixPosition(L.matrixWorld),j.color.copy(k).multiplyScalar(H),j.distance=Y,j.coneCos=Math.cos(L.angle),j.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),j.decay=L.decay,n.spot[_]=j;const V=L.shadow;if(L.map&&(n.spotLightMap[M]=L.map,M++,V.updateMatrices(L),L.castShadow&&E++),n.spotLightMatrix[_]=V.matrix,L.castShadow){const q=t.get(L);q.shadowIntensity=V.intensity,q.shadowBias=V.bias,q.shadowNormalBias=V.normalBias,q.shadowRadius=V.radius,q.shadowMapSize=V.mapSize,n.spotShadow[_]=q,n.spotShadowMap[_]=W,v++}_++}else if(L.isRectAreaLight){const j=e.get(L);j.color.copy(k).multiplyScalar(H),j.halfWidth.set(L.width*.5,0,0),j.halfHeight.set(0,L.height*.5,0),n.rectArea[m]=j,m++}else if(L.isPointLight){const j=e.get(L);if(j.color.copy(L.color).multiplyScalar(L.intensity),j.distance=L.distance,j.decay=L.decay,L.castShadow){const V=L.shadow,q=t.get(L);q.shadowIntensity=V.intensity,q.shadowBias=V.bias,q.shadowNormalBias=V.normalBias,q.shadowRadius=V.radius,q.shadowMapSize=V.mapSize,q.shadowCameraNear=V.camera.near,q.shadowCameraFar=V.camera.far,n.pointShadow[g]=q,n.pointShadowMap[g]=W,n.pointShadowMatrix[g]=L.shadow.matrix,b++}n.point[g]=j,g++}else if(L.isHemisphereLight){const j=e.get(L);j.skyColor.copy(L.color).multiplyScalar(H),j.groundColor.copy(L.groundColor).multiplyScalar(H),n.hemi[p]=j,p++}}m>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=be.LTC_FLOAT_1,n.rectAreaLTC2=be.LTC_FLOAT_2):(n.rectAreaLTC1=be.LTC_HALF_1,n.rectAreaLTC2=be.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const P=n.hash;(P.directionalLength!==f||P.pointLength!==g||P.spotLength!==_||P.rectAreaLength!==m||P.hemiLength!==p||P.numDirectionalShadows!==y||P.numPointShadows!==b||P.numSpotShadows!==v||P.numSpotMaps!==M||P.numLightProbes!==A)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=y,n.directionalShadowMap.length=y,n.pointShadow.length=b,n.pointShadowMap.length=b,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=y,n.pointShadowMatrix.length=b,n.spotLightMatrix.length=v+M-E,n.spotLightMap.length=M,n.numSpotLightShadowsWithMaps=E,n.numLightProbes=A,P.directionalLength=f,P.pointLength=g,P.spotLength=_,P.rectAreaLength=m,P.hemiLength=p,P.numDirectionalShadows=y,P.numPointShadows=b,P.numSpotShadows=v,P.numSpotMaps=M,P.numLightProbes=A,n.version=jS++)}function l(c,h){let u=0,d=0,f=0,g=0,_=0;const m=h.matrixWorldInverse;for(let p=0,y=c.length;p<y;p++){const b=c[p];if(b.isDirectionalLight){const v=n.directional[u];v.direction.setFromMatrixPosition(b.matrixWorld),i.setFromMatrixPosition(b.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),u++}else if(b.isSpotLight){const v=n.spot[f];v.position.setFromMatrixPosition(b.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(b.matrixWorld),i.setFromMatrixPosition(b.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),f++}else if(b.isRectAreaLight){const v=n.rectArea[g];v.position.setFromMatrixPosition(b.matrixWorld),v.position.applyMatrix4(m),o.identity(),r.copy(b.matrixWorld),r.premultiply(m),o.extractRotation(r),v.halfWidth.set(b.width*.5,0,0),v.halfHeight.set(0,b.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(b.isPointLight){const v=n.point[d];v.position.setFromMatrixPosition(b.matrixWorld),v.position.applyMatrix4(m),d++}else if(b.isHemisphereLight){const v=n.hemi[_];v.direction.setFromMatrixPosition(b.matrixWorld),v.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:n}}function op(s){const e=new $S(s),t=[],n=[];function i(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function qS(s){let e=new WeakMap;function t(i,r=0){const o=e.get(i);let a;return o===void 0?(a=new op(s),e.set(i,[a])):r>=o.length?(a=new op(s),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}const ZS=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,KS=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,QS=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],JS=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],ap=new Ye,ta=new D,th=new D;function eM(s,e,t){let n=new ad;const i=new Ne,r=new Ne,o=new Yt,a=new k0,l=new B0,c={},h=t.maxTextureSize,u={[As]:$n,[$n]:As,[Jn]:Jn},d=new as({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ne},radius:{value:4}},vertexShader:ZS,fragmentShader:KS}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new zt;g.setAttribute("position",new Et(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new ve(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ml;let p=this.type;this.render=function(E,A,P){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;E.type===o_&&(Oe("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),E.type=Ml);const S=s.getRenderTarget(),T=s.getActiveCubeFace(),L=s.getActiveMipmapLevel(),k=s.state;k.setBlending(Es),k.buffers.depth.getReversed()===!0?k.buffers.color.setClear(0,0,0,0):k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);const H=p!==this.type;H&&A.traverse(function(Y){Y.material&&(Array.isArray(Y.material)?Y.material.forEach(W=>W.needsUpdate=!0):Y.material.needsUpdate=!0)});for(let Y=0,W=E.length;Y<W;Y++){const j=E[Y],V=j.shadow;if(V===void 0){Oe("WebGLShadowMap:",j,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;i.copy(V.mapSize);const q=V.getFrameExtents();if(i.multiply(q),r.copy(V.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/q.x),i.x=r.x*q.x,V.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/q.y),i.y=r.y*q.y,V.mapSize.y=r.y)),V.map===null||H===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===oa){if(j.isPointLight){Oe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new ns(i.x,i.y,{format:wo,type:Rs,minFilter:pn,magFilter:pn,generateMipmaps:!1}),V.map.texture.name=j.name+".shadowMap",V.map.depthTexture=new Ra(i.x,i.y,Ai),V.map.depthTexture.name=j.name+".shadowMapDepth",V.map.depthTexture.format=Cs,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=fn,V.map.depthTexture.magFilter=fn}else{j.isPointLight?(V.map=new ym(i.x),V.map.depthTexture=new U0(i.x,os)):(V.map=new ns(i.x,i.y),V.map.depthTexture=new Ra(i.x,i.y,os)),V.map.depthTexture.name=j.name+".shadowMap",V.map.depthTexture.format=Cs;const ue=s.state.buffers.depth.getReversed();this.type===Ml?(V.map.depthTexture.compareFunction=ue?nd:td,V.map.depthTexture.minFilter=pn,V.map.depthTexture.magFilter=pn):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=fn,V.map.depthTexture.magFilter=fn)}V.camera.updateProjectionMatrix()}const he=V.map.isWebGLCubeRenderTarget?6:1;for(let ue=0;ue<he;ue++){if(V.map.isWebGLCubeRenderTarget)s.setRenderTarget(V.map,ue),s.clear();else{ue===0&&(s.setRenderTarget(V.map),s.clear());const de=V.getViewport(ue);o.set(r.x*de.x,r.y*de.y,r.x*de.z,r.y*de.w),k.viewport(o)}if(j.isPointLight){const de=V.camera,ze=V.matrix,Je=j.distance||de.far;Je!==de.far&&(de.far=Je,de.updateProjectionMatrix()),ta.setFromMatrixPosition(j.matrixWorld),de.position.copy(ta),th.copy(de.position),th.add(QS[ue]),de.up.copy(JS[ue]),de.lookAt(th),de.updateMatrixWorld(),ze.makeTranslation(-ta.x,-ta.y,-ta.z),ap.multiplyMatrices(de.projectionMatrix,de.matrixWorldInverse),V._frustum.setFromProjectionMatrix(ap,de.coordinateSystem,de.reversedDepth)}else V.updateMatrices(j);n=V.getFrustum(),v(A,P,V.camera,j,this.type)}V.isPointLightShadow!==!0&&this.type===oa&&y(V,P),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,s.setRenderTarget(S,T,L)};function y(E,A){const P=e.update(_);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null&&(E.mapPass=new ns(i.x,i.y,{format:wo,type:Rs})),d.uniforms.shadow_pass.value=E.map.depthTexture,d.uniforms.resolution.value=E.mapSize,d.uniforms.radius.value=E.radius,s.setRenderTarget(E.mapPass),s.clear(),s.renderBufferDirect(A,null,P,d,_,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value=E.mapSize,f.uniforms.radius.value=E.radius,s.setRenderTarget(E.map),s.clear(),s.renderBufferDirect(A,null,P,f,_,null)}function b(E,A,P,S){let T=null;const L=P.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(L!==void 0)T=L;else if(T=P.isPointLight===!0?l:a,s.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){const k=T.uuid,H=A.uuid;let Y=c[k];Y===void 0&&(Y={},c[k]=Y);let W=Y[H];W===void 0&&(W=T.clone(),Y[H]=W,A.addEventListener("dispose",M)),T=W}if(T.visible=A.visible,T.wireframe=A.wireframe,S===oa?T.side=A.shadowSide!==null?A.shadowSide:A.side:T.side=A.shadowSide!==null?A.shadowSide:u[A.side],T.alphaMap=A.alphaMap,T.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,T.map=A.map,T.clipShadows=A.clipShadows,T.clippingPlanes=A.clippingPlanes,T.clipIntersection=A.clipIntersection,T.displacementMap=A.displacementMap,T.displacementScale=A.displacementScale,T.displacementBias=A.displacementBias,T.wireframeLinewidth=A.wireframeLinewidth,T.linewidth=A.linewidth,P.isPointLight===!0&&T.isMeshDistanceMaterial===!0){const k=s.properties.get(T);k.light=P}return T}function v(E,A,P,S,T){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&T===oa)&&(!E.frustumCulled||n.intersectsObject(E))){E.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,E.matrixWorld);const H=e.update(E),Y=E.material;if(Array.isArray(Y)){const W=H.groups;for(let j=0,V=W.length;j<V;j++){const q=W[j],he=Y[q.materialIndex];if(he&&he.visible){const ue=b(E,he,S,T);E.onBeforeShadow(s,E,A,P,H,ue,q),s.renderBufferDirect(P,null,H,ue,E,q),E.onAfterShadow(s,E,A,P,H,ue,q)}}}else if(Y.visible){const W=b(E,Y,S,T);E.onBeforeShadow(s,E,A,P,H,W,null),s.renderBufferDirect(P,null,H,W,E,null),E.onAfterShadow(s,E,A,P,H,W,null)}}const k=E.children;for(let H=0,Y=k.length;H<Y;H++)v(k[H],A,P,S,T)}function M(E){E.target.removeEventListener("dispose",M);for(const P in c){const S=c[P],T=E.target.uuid;T in S&&(S[T].dispose(),delete S[T])}}}const tM={[Ah]:Rh,[Ch]:Lh,[Ph]:Dh,[So]:Ih,[Rh]:Ah,[Lh]:Ch,[Dh]:Ph,[Ih]:So};function nM(s,e){function t(){let z=!1;const C=new Yt;let N=null;const x=new Yt(0,0,0,0);return{setMask:function(B){N!==B&&!z&&(s.colorMask(B,B,B,B),N=B)},setLocked:function(B){z=B},setClear:function(B,O,U,re,ie){ie===!0&&(B*=re,O*=re,U*=re),C.set(B,O,U,re),x.equals(C)===!1&&(s.clearColor(B,O,U,re),x.copy(C))},reset:function(){z=!1,N=null,x.set(-1,0,0,0)}}}function n(){let z=!1,C=!1,N=null,x=null,B=null;return{setReversed:function(O){if(C!==O){const U=e.get("EXT_clip_control");O?U.clipControlEXT(U.LOWER_LEFT_EXT,U.ZERO_TO_ONE_EXT):U.clipControlEXT(U.LOWER_LEFT_EXT,U.NEGATIVE_ONE_TO_ONE_EXT),C=O;const re=B;B=null,this.setClear(re)}},getReversed:function(){return C},setTest:function(O){O?ae(s.DEPTH_TEST):we(s.DEPTH_TEST)},setMask:function(O){N!==O&&!z&&(s.depthMask(O),N=O)},setFunc:function(O){if(C&&(O=tM[O]),x!==O){switch(O){case Ah:s.depthFunc(s.NEVER);break;case Rh:s.depthFunc(s.ALWAYS);break;case Ch:s.depthFunc(s.LESS);break;case So:s.depthFunc(s.LEQUAL);break;case Ph:s.depthFunc(s.EQUAL);break;case Ih:s.depthFunc(s.GEQUAL);break;case Lh:s.depthFunc(s.GREATER);break;case Dh:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}x=O}},setLocked:function(O){z=O},setClear:function(O){B!==O&&(C&&(O=1-O),s.clearDepth(O),B=O)},reset:function(){z=!1,N=null,x=null,B=null,C=!1}}}function i(){let z=!1,C=null,N=null,x=null,B=null,O=null,U=null,re=null,ie=null;return{setTest:function(Re){z||(Re?ae(s.STENCIL_TEST):we(s.STENCIL_TEST))},setMask:function(Re){C!==Re&&!z&&(s.stencilMask(Re),C=Re)},setFunc:function(Re,Q,ee){(N!==Re||x!==Q||B!==ee)&&(s.stencilFunc(Re,Q,ee),N=Re,x=Q,B=ee)},setOp:function(Re,Q,ee){(O!==Re||U!==Q||re!==ee)&&(s.stencilOp(Re,Q,ee),O=Re,U=Q,re=ee)},setLocked:function(Re){z=Re},setClear:function(Re){ie!==Re&&(s.clearStencil(Re),ie=Re)},reset:function(){z=!1,C=null,N=null,x=null,B=null,O=null,U=null,re=null,ie=null}}}const r=new t,o=new n,a=new i,l=new WeakMap,c=new WeakMap;let h={},u={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,y=null,b=null,v=null,M=null,E=null,A=new ke(0,0,0),P=0,S=!1,T=null,L=null,k=null,H=null,Y=null;const W=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let j=!1,V=0;const q=s.getParameter(s.VERSION);q.indexOf("WebGL")!==-1?(V=parseFloat(/^WebGL (\d)/.exec(q)[1]),j=V>=1):q.indexOf("OpenGL ES")!==-1&&(V=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),j=V>=2);let he=null,ue={};const de=s.getParameter(s.SCISSOR_BOX),ze=s.getParameter(s.VIEWPORT),Je=new Yt().fromArray(de),ht=new Yt().fromArray(ze);function _t(z,C,N,x){const B=new Uint8Array(4),O=s.createTexture();s.bindTexture(z,O),s.texParameteri(z,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(z,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let U=0;U<N;U++)z===s.TEXTURE_3D||z===s.TEXTURE_2D_ARRAY?s.texImage3D(C,0,s.RGBA,1,1,x,0,s.RGBA,s.UNSIGNED_BYTE,B):s.texImage2D(C+U,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,B);return O}const se={};se[s.TEXTURE_2D]=_t(s.TEXTURE_2D,s.TEXTURE_2D,1),se[s.TEXTURE_CUBE_MAP]=_t(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),se[s.TEXTURE_2D_ARRAY]=_t(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),se[s.TEXTURE_3D]=_t(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ae(s.DEPTH_TEST),o.setFunc(So),et(!1),en(Vd),ae(s.CULL_FACE),Rt(Es);function ae(z){h[z]!==!0&&(s.enable(z),h[z]=!0)}function we(z){h[z]!==!1&&(s.disable(z),h[z]=!1)}function tt(z,C){return u[z]!==C?(s.bindFramebuffer(z,C),u[z]=C,z===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=C),z===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=C),!0):!1}function Ae(z,C){let N=f,x=!1;if(z){N=d.get(C),N===void 0&&(N=[],d.set(C,N));const B=z.textures;if(N.length!==B.length||N[0]!==s.COLOR_ATTACHMENT0){for(let O=0,U=B.length;O<U;O++)N[O]=s.COLOR_ATTACHMENT0+O;N.length=B.length,x=!0}}else N[0]!==s.BACK&&(N[0]=s.BACK,x=!0);x&&s.drawBuffers(N)}function st(z){return g!==z?(s.useProgram(z),g=z,!0):!1}const cn={[_r]:s.FUNC_ADD,[l_]:s.FUNC_SUBTRACT,[c_]:s.FUNC_REVERSE_SUBTRACT};cn[h_]=s.MIN,cn[u_]=s.MAX;const yt={[d_]:s.ZERO,[f_]:s.ONE,[p_]:s.SRC_COLOR,[Eh]:s.SRC_ALPHA,[v_]:s.SRC_ALPHA_SATURATE,[x_]:s.DST_COLOR,[g_]:s.DST_ALPHA,[m_]:s.ONE_MINUS_SRC_COLOR,[Th]:s.ONE_MINUS_SRC_ALPHA,[y_]:s.ONE_MINUS_DST_COLOR,[__]:s.ONE_MINUS_DST_ALPHA,[b_]:s.CONSTANT_COLOR,[S_]:s.ONE_MINUS_CONSTANT_COLOR,[M_]:s.CONSTANT_ALPHA,[w_]:s.ONE_MINUS_CONSTANT_ALPHA};function Rt(z,C,N,x,B,O,U,re,ie,Re){if(z===Es){_===!0&&(we(s.BLEND),_=!1);return}if(_===!1&&(ae(s.BLEND),_=!0),z!==a_){if(z!==m||Re!==S){if((p!==_r||v!==_r)&&(s.blendEquation(s.FUNC_ADD),p=_r,v=_r),Re)switch(z){case mo:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Gd:s.blendFunc(s.ONE,s.ONE);break;case Wd:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Xd:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:Ke("WebGLState: Invalid blending: ",z);break}else switch(z){case mo:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Gd:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case Wd:Ke("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Xd:Ke("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ke("WebGLState: Invalid blending: ",z);break}y=null,b=null,M=null,E=null,A.set(0,0,0),P=0,m=z,S=Re}return}B=B||C,O=O||N,U=U||x,(C!==p||B!==v)&&(s.blendEquationSeparate(cn[C],cn[B]),p=C,v=B),(N!==y||x!==b||O!==M||U!==E)&&(s.blendFuncSeparate(yt[N],yt[x],yt[O],yt[U]),y=N,b=x,M=O,E=U),(re.equals(A)===!1||ie!==P)&&(s.blendColor(re.r,re.g,re.b,ie),A.copy(re),P=ie),m=z,S=!1}function Pt(z,C){z.side===Jn?we(s.CULL_FACE):ae(s.CULL_FACE);let N=z.side===$n;C&&(N=!N),et(N),z.blending===mo&&z.transparent===!1?Rt(Es):Rt(z.blending,z.blendEquation,z.blendSrc,z.blendDst,z.blendEquationAlpha,z.blendSrcAlpha,z.blendDstAlpha,z.blendColor,z.blendAlpha,z.premultipliedAlpha),o.setFunc(z.depthFunc),o.setTest(z.depthTest),o.setMask(z.depthWrite),r.setMask(z.colorWrite);const x=z.stencilWrite;a.setTest(x),x&&(a.setMask(z.stencilWriteMask),a.setFunc(z.stencilFunc,z.stencilRef,z.stencilFuncMask),a.setOp(z.stencilFail,z.stencilZFail,z.stencilZPass)),tn(z.polygonOffset,z.polygonOffsetFactor,z.polygonOffsetUnits),z.alphaToCoverage===!0?ae(s.SAMPLE_ALPHA_TO_COVERAGE):we(s.SAMPLE_ALPHA_TO_COVERAGE)}function et(z){T!==z&&(z?s.frontFace(s.CW):s.frontFace(s.CCW),T=z)}function en(z){z!==s_?(ae(s.CULL_FACE),z!==L&&(z===Vd?s.cullFace(s.BACK):z===r_?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):we(s.CULL_FACE),L=z}function F(z){z!==k&&(j&&s.lineWidth(z),k=z)}function tn(z,C,N){z?(ae(s.POLYGON_OFFSET_FILL),(H!==C||Y!==N)&&(s.polygonOffset(C,N),H=C,Y=N)):we(s.POLYGON_OFFSET_FILL)}function Mt(z){z?ae(s.SCISSOR_TEST):we(s.SCISSOR_TEST)}function Ot(z){z===void 0&&(z=s.TEXTURE0+W-1),he!==z&&(s.activeTexture(z),he=z)}function Le(z,C,N){N===void 0&&(he===null?N=s.TEXTURE0+W-1:N=he);let x=ue[N];x===void 0&&(x={type:void 0,texture:void 0},ue[N]=x),(x.type!==z||x.texture!==C)&&(he!==N&&(s.activeTexture(N),he=N),s.bindTexture(z,C||se[z]),x.type=z,x.texture=C)}function I(){const z=ue[he];z!==void 0&&z.type!==void 0&&(s.bindTexture(z.type,null),z.type=void 0,z.texture=void 0)}function w(){try{s.compressedTexImage2D(...arguments)}catch(z){Ke("WebGLState:",z)}}function G(){try{s.compressedTexImage3D(...arguments)}catch(z){Ke("WebGLState:",z)}}function ne(){try{s.texSubImage2D(...arguments)}catch(z){Ke("WebGLState:",z)}}function oe(){try{s.texSubImage3D(...arguments)}catch(z){Ke("WebGLState:",z)}}function te(){try{s.compressedTexSubImage2D(...arguments)}catch(z){Ke("WebGLState:",z)}}function De(){try{s.compressedTexSubImage3D(...arguments)}catch(z){Ke("WebGLState:",z)}}function fe(){try{s.texStorage2D(...arguments)}catch(z){Ke("WebGLState:",z)}}function Pe(){try{s.texStorage3D(...arguments)}catch(z){Ke("WebGLState:",z)}}function Ge(){try{s.texImage2D(...arguments)}catch(z){Ke("WebGLState:",z)}}function le(){try{s.texImage3D(...arguments)}catch(z){Ke("WebGLState:",z)}}function _e(z){Je.equals(z)===!1&&(s.scissor(z.x,z.y,z.z,z.w),Je.copy(z))}function Te(z){ht.equals(z)===!1&&(s.viewport(z.x,z.y,z.z,z.w),ht.copy(z))}function Ie(z,C){let N=c.get(C);N===void 0&&(N=new WeakMap,c.set(C,N));let x=N.get(z);x===void 0&&(x=s.getUniformBlockIndex(C,z.name),N.set(z,x))}function pe(z,C){const x=c.get(C).get(z);l.get(C)!==x&&(s.uniformBlockBinding(C,x,z.__bindingPointIndex),l.set(C,x))}function rt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},he=null,ue={},u={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,y=null,b=null,v=null,M=null,E=null,A=new ke(0,0,0),P=0,S=!1,T=null,L=null,k=null,H=null,Y=null,Je.set(0,0,s.canvas.width,s.canvas.height),ht.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ae,disable:we,bindFramebuffer:tt,drawBuffers:Ae,useProgram:st,setBlending:Rt,setMaterial:Pt,setFlipSided:et,setCullFace:en,setLineWidth:F,setPolygonOffset:tn,setScissorTest:Mt,activeTexture:Ot,bindTexture:Le,unbindTexture:I,compressedTexImage2D:w,compressedTexImage3D:G,texImage2D:Ge,texImage3D:le,updateUBOMapping:Ie,uniformBlockBinding:pe,texStorage2D:fe,texStorage3D:Pe,texSubImage2D:ne,texSubImage3D:oe,compressedTexSubImage2D:te,compressedTexSubImage3D:De,scissor:_e,viewport:Te,reset:rt}}function iM(s,e,t,n,i,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ne,h=new WeakMap;let u;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(I,w){return f?new OffscreenCanvas(I,w):Ta("canvas")}function _(I,w,G){let ne=1;const oe=Le(I);if((oe.width>G||oe.height>G)&&(ne=G/Math.max(oe.width,oe.height)),ne<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){const te=Math.floor(ne*oe.width),De=Math.floor(ne*oe.height);u===void 0&&(u=g(te,De));const fe=w?g(te,De):u;return fe.width=te,fe.height=De,fe.getContext("2d").drawImage(I,0,0,te,De),Oe("WebGLRenderer: Texture has been resized from ("+oe.width+"x"+oe.height+") to ("+te+"x"+De+")."),fe}else return"data"in I&&Oe("WebGLRenderer: Image in DataTexture is too big ("+oe.width+"x"+oe.height+")."),I;return I}function m(I){return I.generateMipmaps}function p(I){s.generateMipmap(I)}function y(I){return I.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:I.isWebGL3DRenderTarget?s.TEXTURE_3D:I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function b(I,w,G,ne,oe=!1){if(I!==null){if(s[I]!==void 0)return s[I];Oe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let te=w;if(w===s.RED&&(G===s.FLOAT&&(te=s.R32F),G===s.HALF_FLOAT&&(te=s.R16F),G===s.UNSIGNED_BYTE&&(te=s.R8)),w===s.RED_INTEGER&&(G===s.UNSIGNED_BYTE&&(te=s.R8UI),G===s.UNSIGNED_SHORT&&(te=s.R16UI),G===s.UNSIGNED_INT&&(te=s.R32UI),G===s.BYTE&&(te=s.R8I),G===s.SHORT&&(te=s.R16I),G===s.INT&&(te=s.R32I)),w===s.RG&&(G===s.FLOAT&&(te=s.RG32F),G===s.HALF_FLOAT&&(te=s.RG16F),G===s.UNSIGNED_BYTE&&(te=s.RG8)),w===s.RG_INTEGER&&(G===s.UNSIGNED_BYTE&&(te=s.RG8UI),G===s.UNSIGNED_SHORT&&(te=s.RG16UI),G===s.UNSIGNED_INT&&(te=s.RG32UI),G===s.BYTE&&(te=s.RG8I),G===s.SHORT&&(te=s.RG16I),G===s.INT&&(te=s.RG32I)),w===s.RGB_INTEGER&&(G===s.UNSIGNED_BYTE&&(te=s.RGB8UI),G===s.UNSIGNED_SHORT&&(te=s.RGB16UI),G===s.UNSIGNED_INT&&(te=s.RGB32UI),G===s.BYTE&&(te=s.RGB8I),G===s.SHORT&&(te=s.RGB16I),G===s.INT&&(te=s.RGB32I)),w===s.RGBA_INTEGER&&(G===s.UNSIGNED_BYTE&&(te=s.RGBA8UI),G===s.UNSIGNED_SHORT&&(te=s.RGBA16UI),G===s.UNSIGNED_INT&&(te=s.RGBA32UI),G===s.BYTE&&(te=s.RGBA8I),G===s.SHORT&&(te=s.RGBA16I),G===s.INT&&(te=s.RGBA32I)),w===s.RGB&&(G===s.UNSIGNED_INT_5_9_9_9_REV&&(te=s.RGB9_E5),G===s.UNSIGNED_INT_10F_11F_11F_REV&&(te=s.R11F_G11F_B10F)),w===s.RGBA){const De=oe?Ul:xt.getTransfer(ne);G===s.FLOAT&&(te=s.RGBA32F),G===s.HALF_FLOAT&&(te=s.RGBA16F),G===s.UNSIGNED_BYTE&&(te=De===Dt?s.SRGB8_ALPHA8:s.RGBA8),G===s.UNSIGNED_SHORT_4_4_4_4&&(te=s.RGBA4),G===s.UNSIGNED_SHORT_5_5_5_1&&(te=s.RGB5_A1)}return(te===s.R16F||te===s.R32F||te===s.RG16F||te===s.RG32F||te===s.RGBA16F||te===s.RGBA32F)&&e.get("EXT_color_buffer_float"),te}function v(I,w){let G;return I?w===null||w===os||w===Ea?G=s.DEPTH24_STENCIL8:w===Ai?G=s.DEPTH32F_STENCIL8:w===wa&&(G=s.DEPTH24_STENCIL8,Oe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===os||w===Ea?G=s.DEPTH_COMPONENT24:w===Ai?G=s.DEPTH_COMPONENT32F:w===wa&&(G=s.DEPTH_COMPONENT16),G}function M(I,w){return m(I)===!0||I.isFramebufferTexture&&I.minFilter!==fn&&I.minFilter!==pn?Math.log2(Math.max(w.width,w.height))+1:I.mipmaps!==void 0&&I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?w.mipmaps.length:1}function E(I){const w=I.target;w.removeEventListener("dispose",E),P(w),w.isVideoTexture&&h.delete(w)}function A(I){const w=I.target;w.removeEventListener("dispose",A),T(w)}function P(I){const w=n.get(I);if(w.__webglInit===void 0)return;const G=I.source,ne=d.get(G);if(ne){const oe=ne[w.__cacheKey];oe.usedTimes--,oe.usedTimes===0&&S(I),Object.keys(ne).length===0&&d.delete(G)}n.remove(I)}function S(I){const w=n.get(I);s.deleteTexture(w.__webglTexture);const G=I.source,ne=d.get(G);delete ne[w.__cacheKey],o.memory.textures--}function T(I){const w=n.get(I);if(I.depthTexture&&(I.depthTexture.dispose(),n.remove(I.depthTexture)),I.isWebGLCubeRenderTarget)for(let ne=0;ne<6;ne++){if(Array.isArray(w.__webglFramebuffer[ne]))for(let oe=0;oe<w.__webglFramebuffer[ne].length;oe++)s.deleteFramebuffer(w.__webglFramebuffer[ne][oe]);else s.deleteFramebuffer(w.__webglFramebuffer[ne]);w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer[ne])}else{if(Array.isArray(w.__webglFramebuffer))for(let ne=0;ne<w.__webglFramebuffer.length;ne++)s.deleteFramebuffer(w.__webglFramebuffer[ne]);else s.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&s.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let ne=0;ne<w.__webglColorRenderbuffer.length;ne++)w.__webglColorRenderbuffer[ne]&&s.deleteRenderbuffer(w.__webglColorRenderbuffer[ne]);w.__webglDepthRenderbuffer&&s.deleteRenderbuffer(w.__webglDepthRenderbuffer)}const G=I.textures;for(let ne=0,oe=G.length;ne<oe;ne++){const te=n.get(G[ne]);te.__webglTexture&&(s.deleteTexture(te.__webglTexture),o.memory.textures--),n.remove(G[ne])}n.remove(I)}let L=0;function k(){L=0}function H(){const I=L;return I>=i.maxTextures&&Oe("WebGLTextures: Trying to use "+I+" texture units while this GPU supports only "+i.maxTextures),L+=1,I}function Y(I){const w=[];return w.push(I.wrapS),w.push(I.wrapT),w.push(I.wrapR||0),w.push(I.magFilter),w.push(I.minFilter),w.push(I.anisotropy),w.push(I.internalFormat),w.push(I.format),w.push(I.type),w.push(I.generateMipmaps),w.push(I.premultiplyAlpha),w.push(I.flipY),w.push(I.unpackAlignment),w.push(I.colorSpace),w.join()}function W(I,w){const G=n.get(I);if(I.isVideoTexture&&Mt(I),I.isRenderTargetTexture===!1&&I.isExternalTexture!==!0&&I.version>0&&G.__version!==I.version){const ne=I.image;if(ne===null)Oe("WebGLRenderer: Texture marked for update but no image data found.");else if(ne.complete===!1)Oe("WebGLRenderer: Texture marked for update but image is incomplete");else{se(G,I,w);return}}else I.isExternalTexture&&(G.__webglTexture=I.sourceTexture?I.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,G.__webglTexture,s.TEXTURE0+w)}function j(I,w){const G=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&G.__version!==I.version){se(G,I,w);return}else I.isExternalTexture&&(G.__webglTexture=I.sourceTexture?I.sourceTexture:null);t.bindTexture(s.TEXTURE_2D_ARRAY,G.__webglTexture,s.TEXTURE0+w)}function V(I,w){const G=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&G.__version!==I.version){se(G,I,w);return}t.bindTexture(s.TEXTURE_3D,G.__webglTexture,s.TEXTURE0+w)}function q(I,w){const G=n.get(I);if(I.isCubeDepthTexture!==!0&&I.version>0&&G.__version!==I.version){ae(G,I,w);return}t.bindTexture(s.TEXTURE_CUBE_MAP,G.__webglTexture,s.TEXTURE0+w)}const he={[Pr]:s.REPEAT,[Oi]:s.CLAMP_TO_EDGE,[Ma]:s.MIRRORED_REPEAT},ue={[fn]:s.NEAREST,[ju]:s.NEAREST_MIPMAP_NEAREST,[lo]:s.NEAREST_MIPMAP_LINEAR,[pn]:s.LINEAR,[pa]:s.LINEAR_MIPMAP_NEAREST,[Zi]:s.LINEAR_MIPMAP_LINEAR},de={[L_]:s.NEVER,[O_]:s.ALWAYS,[D_]:s.LESS,[td]:s.LEQUAL,[N_]:s.EQUAL,[nd]:s.GEQUAL,[U_]:s.GREATER,[F_]:s.NOTEQUAL};function ze(I,w){if(w.type===Ai&&e.has("OES_texture_float_linear")===!1&&(w.magFilter===pn||w.magFilter===pa||w.magFilter===lo||w.magFilter===Zi||w.minFilter===pn||w.minFilter===pa||w.minFilter===lo||w.minFilter===Zi)&&Oe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(I,s.TEXTURE_WRAP_S,he[w.wrapS]),s.texParameteri(I,s.TEXTURE_WRAP_T,he[w.wrapT]),(I===s.TEXTURE_3D||I===s.TEXTURE_2D_ARRAY)&&s.texParameteri(I,s.TEXTURE_WRAP_R,he[w.wrapR]),s.texParameteri(I,s.TEXTURE_MAG_FILTER,ue[w.magFilter]),s.texParameteri(I,s.TEXTURE_MIN_FILTER,ue[w.minFilter]),w.compareFunction&&(s.texParameteri(I,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(I,s.TEXTURE_COMPARE_FUNC,de[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===fn||w.minFilter!==lo&&w.minFilter!==Zi||w.type===Ai&&e.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||n.get(w).__currentAnisotropy){const G=e.get("EXT_texture_filter_anisotropic");s.texParameterf(I,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,i.getMaxAnisotropy())),n.get(w).__currentAnisotropy=w.anisotropy}}}function Je(I,w){let G=!1;I.__webglInit===void 0&&(I.__webglInit=!0,w.addEventListener("dispose",E));const ne=w.source;let oe=d.get(ne);oe===void 0&&(oe={},d.set(ne,oe));const te=Y(w);if(te!==I.__cacheKey){oe[te]===void 0&&(oe[te]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,G=!0),oe[te].usedTimes++;const De=oe[I.__cacheKey];De!==void 0&&(oe[I.__cacheKey].usedTimes--,De.usedTimes===0&&S(w)),I.__cacheKey=te,I.__webglTexture=oe[te].texture}return G}function ht(I,w,G){return Math.floor(Math.floor(I/G)/w)}function _t(I,w,G,ne){const te=I.updateRanges;if(te.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,w.width,w.height,G,ne,w.data);else{te.sort((le,_e)=>le.start-_e.start);let De=0;for(let le=1;le<te.length;le++){const _e=te[De],Te=te[le],Ie=_e.start+_e.count,pe=ht(Te.start,w.width,4),rt=ht(_e.start,w.width,4);Te.start<=Ie+1&&pe===rt&&ht(Te.start+Te.count-1,w.width,4)===pe?_e.count=Math.max(_e.count,Te.start+Te.count-_e.start):(++De,te[De]=Te)}te.length=De+1;const fe=s.getParameter(s.UNPACK_ROW_LENGTH),Pe=s.getParameter(s.UNPACK_SKIP_PIXELS),Ge=s.getParameter(s.UNPACK_SKIP_ROWS);s.pixelStorei(s.UNPACK_ROW_LENGTH,w.width);for(let le=0,_e=te.length;le<_e;le++){const Te=te[le],Ie=Math.floor(Te.start/4),pe=Math.ceil(Te.count/4),rt=Ie%w.width,z=Math.floor(Ie/w.width),C=pe,N=1;s.pixelStorei(s.UNPACK_SKIP_PIXELS,rt),s.pixelStorei(s.UNPACK_SKIP_ROWS,z),t.texSubImage2D(s.TEXTURE_2D,0,rt,z,C,N,G,ne,w.data)}I.clearUpdateRanges(),s.pixelStorei(s.UNPACK_ROW_LENGTH,fe),s.pixelStorei(s.UNPACK_SKIP_PIXELS,Pe),s.pixelStorei(s.UNPACK_SKIP_ROWS,Ge)}}function se(I,w,G){let ne=s.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(ne=s.TEXTURE_2D_ARRAY),w.isData3DTexture&&(ne=s.TEXTURE_3D);const oe=Je(I,w),te=w.source;t.bindTexture(ne,I.__webglTexture,s.TEXTURE0+G);const De=n.get(te);if(te.version!==De.__version||oe===!0){t.activeTexture(s.TEXTURE0+G);const fe=xt.getPrimaries(xt.workingColorSpace),Pe=w.colorSpace===bs?null:xt.getPrimaries(w.colorSpace),Ge=w.colorSpace===bs||fe===Pe?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ge);let le=_(w.image,!1,i.maxTextureSize);le=Ot(w,le);const _e=r.convert(w.format,w.colorSpace),Te=r.convert(w.type);let Ie=b(w.internalFormat,_e,Te,w.colorSpace,w.isVideoTexture);ze(ne,w);let pe;const rt=w.mipmaps,z=w.isVideoTexture!==!0,C=De.__version===void 0||oe===!0,N=te.dataReady,x=M(w,le);if(w.isDepthTexture)Ie=v(w.format===vr,w.type),C&&(z?t.texStorage2D(s.TEXTURE_2D,1,Ie,le.width,le.height):t.texImage2D(s.TEXTURE_2D,0,Ie,le.width,le.height,0,_e,Te,null));else if(w.isDataTexture)if(rt.length>0){z&&C&&t.texStorage2D(s.TEXTURE_2D,x,Ie,rt[0].width,rt[0].height);for(let B=0,O=rt.length;B<O;B++)pe=rt[B],z?N&&t.texSubImage2D(s.TEXTURE_2D,B,0,0,pe.width,pe.height,_e,Te,pe.data):t.texImage2D(s.TEXTURE_2D,B,Ie,pe.width,pe.height,0,_e,Te,pe.data);w.generateMipmaps=!1}else z?(C&&t.texStorage2D(s.TEXTURE_2D,x,Ie,le.width,le.height),N&&_t(w,le,_e,Te)):t.texImage2D(s.TEXTURE_2D,0,Ie,le.width,le.height,0,_e,Te,le.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){z&&C&&t.texStorage3D(s.TEXTURE_2D_ARRAY,x,Ie,rt[0].width,rt[0].height,le.depth);for(let B=0,O=rt.length;B<O;B++)if(pe=rt[B],w.format!==pi)if(_e!==null)if(z){if(N)if(w.layerUpdates.size>0){const U=kf(pe.width,pe.height,w.format,w.type);for(const re of w.layerUpdates){const ie=pe.data.subarray(re*U/pe.data.BYTES_PER_ELEMENT,(re+1)*U/pe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,B,0,0,re,pe.width,pe.height,1,_e,ie)}w.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,B,0,0,0,pe.width,pe.height,le.depth,_e,pe.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,B,Ie,pe.width,pe.height,le.depth,0,pe.data,0,0);else Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else z?N&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,B,0,0,0,pe.width,pe.height,le.depth,_e,Te,pe.data):t.texImage3D(s.TEXTURE_2D_ARRAY,B,Ie,pe.width,pe.height,le.depth,0,_e,Te,pe.data)}else{z&&C&&t.texStorage2D(s.TEXTURE_2D,x,Ie,rt[0].width,rt[0].height);for(let B=0,O=rt.length;B<O;B++)pe=rt[B],w.format!==pi?_e!==null?z?N&&t.compressedTexSubImage2D(s.TEXTURE_2D,B,0,0,pe.width,pe.height,_e,pe.data):t.compressedTexImage2D(s.TEXTURE_2D,B,Ie,pe.width,pe.height,0,pe.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):z?N&&t.texSubImage2D(s.TEXTURE_2D,B,0,0,pe.width,pe.height,_e,Te,pe.data):t.texImage2D(s.TEXTURE_2D,B,Ie,pe.width,pe.height,0,_e,Te,pe.data)}else if(w.isDataArrayTexture)if(z){if(C&&t.texStorage3D(s.TEXTURE_2D_ARRAY,x,Ie,le.width,le.height,le.depth),N)if(w.layerUpdates.size>0){const B=kf(le.width,le.height,w.format,w.type);for(const O of w.layerUpdates){const U=le.data.subarray(O*B/le.data.BYTES_PER_ELEMENT,(O+1)*B/le.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,O,le.width,le.height,1,_e,Te,U)}w.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,le.width,le.height,le.depth,_e,Te,le.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,Ie,le.width,le.height,le.depth,0,_e,Te,le.data);else if(w.isData3DTexture)z?(C&&t.texStorage3D(s.TEXTURE_3D,x,Ie,le.width,le.height,le.depth),N&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,le.width,le.height,le.depth,_e,Te,le.data)):t.texImage3D(s.TEXTURE_3D,0,Ie,le.width,le.height,le.depth,0,_e,Te,le.data);else if(w.isFramebufferTexture){if(C)if(z)t.texStorage2D(s.TEXTURE_2D,x,Ie,le.width,le.height);else{let B=le.width,O=le.height;for(let U=0;U<x;U++)t.texImage2D(s.TEXTURE_2D,U,Ie,B,O,0,_e,Te,null),B>>=1,O>>=1}}else if(rt.length>0){if(z&&C){const B=Le(rt[0]);t.texStorage2D(s.TEXTURE_2D,x,Ie,B.width,B.height)}for(let B=0,O=rt.length;B<O;B++)pe=rt[B],z?N&&t.texSubImage2D(s.TEXTURE_2D,B,0,0,_e,Te,pe):t.texImage2D(s.TEXTURE_2D,B,Ie,_e,Te,pe);w.generateMipmaps=!1}else if(z){if(C){const B=Le(le);t.texStorage2D(s.TEXTURE_2D,x,Ie,B.width,B.height)}N&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,_e,Te,le)}else t.texImage2D(s.TEXTURE_2D,0,Ie,_e,Te,le);m(w)&&p(ne),De.__version=te.version,w.onUpdate&&w.onUpdate(w)}I.__version=w.version}function ae(I,w,G){if(w.image.length!==6)return;const ne=Je(I,w),oe=w.source;t.bindTexture(s.TEXTURE_CUBE_MAP,I.__webglTexture,s.TEXTURE0+G);const te=n.get(oe);if(oe.version!==te.__version||ne===!0){t.activeTexture(s.TEXTURE0+G);const De=xt.getPrimaries(xt.workingColorSpace),fe=w.colorSpace===bs?null:xt.getPrimaries(w.colorSpace),Pe=w.colorSpace===bs||De===fe?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Pe);const Ge=w.isCompressedTexture||w.image[0].isCompressedTexture,le=w.image[0]&&w.image[0].isDataTexture,_e=[];for(let O=0;O<6;O++)!Ge&&!le?_e[O]=_(w.image[O],!0,i.maxCubemapSize):_e[O]=le?w.image[O].image:w.image[O],_e[O]=Ot(w,_e[O]);const Te=_e[0],Ie=r.convert(w.format,w.colorSpace),pe=r.convert(w.type),rt=b(w.internalFormat,Ie,pe,w.colorSpace),z=w.isVideoTexture!==!0,C=te.__version===void 0||ne===!0,N=oe.dataReady;let x=M(w,Te);ze(s.TEXTURE_CUBE_MAP,w);let B;if(Ge){z&&C&&t.texStorage2D(s.TEXTURE_CUBE_MAP,x,rt,Te.width,Te.height);for(let O=0;O<6;O++){B=_e[O].mipmaps;for(let U=0;U<B.length;U++){const re=B[U];w.format!==pi?Ie!==null?z?N&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+O,U,0,0,re.width,re.height,Ie,re.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+O,U,rt,re.width,re.height,0,re.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):z?N&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+O,U,0,0,re.width,re.height,Ie,pe,re.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+O,U,rt,re.width,re.height,0,Ie,pe,re.data)}}}else{if(B=w.mipmaps,z&&C){B.length>0&&x++;const O=Le(_e[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,x,rt,O.width,O.height)}for(let O=0;O<6;O++)if(le){z?N&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+O,0,0,0,_e[O].width,_e[O].height,Ie,pe,_e[O].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+O,0,rt,_e[O].width,_e[O].height,0,Ie,pe,_e[O].data);for(let U=0;U<B.length;U++){const ie=B[U].image[O].image;z?N&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+O,U+1,0,0,ie.width,ie.height,Ie,pe,ie.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+O,U+1,rt,ie.width,ie.height,0,Ie,pe,ie.data)}}else{z?N&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+O,0,0,0,Ie,pe,_e[O]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+O,0,rt,Ie,pe,_e[O]);for(let U=0;U<B.length;U++){const re=B[U];z?N&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+O,U+1,0,0,Ie,pe,re.image[O]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+O,U+1,rt,Ie,pe,re.image[O])}}}m(w)&&p(s.TEXTURE_CUBE_MAP),te.__version=oe.version,w.onUpdate&&w.onUpdate(w)}I.__version=w.version}function we(I,w,G,ne,oe,te){const De=r.convert(G.format,G.colorSpace),fe=r.convert(G.type),Pe=b(G.internalFormat,De,fe,G.colorSpace),Ge=n.get(w),le=n.get(G);if(le.__renderTarget=w,!Ge.__hasExternalTextures){const _e=Math.max(1,w.width>>te),Te=Math.max(1,w.height>>te);oe===s.TEXTURE_3D||oe===s.TEXTURE_2D_ARRAY?t.texImage3D(oe,te,Pe,_e,Te,w.depth,0,De,fe,null):t.texImage2D(oe,te,Pe,_e,Te,0,De,fe,null)}t.bindFramebuffer(s.FRAMEBUFFER,I),tn(w)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ne,oe,le.__webglTexture,0,F(w)):(oe===s.TEXTURE_2D||oe>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&oe<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,ne,oe,le.__webglTexture,te),t.bindFramebuffer(s.FRAMEBUFFER,null)}function tt(I,w,G){if(s.bindRenderbuffer(s.RENDERBUFFER,I),w.depthBuffer){const ne=w.depthTexture,oe=ne&&ne.isDepthTexture?ne.type:null,te=v(w.stencilBuffer,oe),De=w.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;tn(w)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,F(w),te,w.width,w.height):G?s.renderbufferStorageMultisample(s.RENDERBUFFER,F(w),te,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,te,w.width,w.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,De,s.RENDERBUFFER,I)}else{const ne=w.textures;for(let oe=0;oe<ne.length;oe++){const te=ne[oe],De=r.convert(te.format,te.colorSpace),fe=r.convert(te.type),Pe=b(te.internalFormat,De,fe,te.colorSpace);tn(w)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,F(w),Pe,w.width,w.height):G?s.renderbufferStorageMultisample(s.RENDERBUFFER,F(w),Pe,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,Pe,w.width,w.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Ae(I,w,G){const ne=w.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(s.FRAMEBUFFER,I),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const oe=n.get(w.depthTexture);if(oe.__renderTarget=w,(!oe.__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),ne){if(oe.__webglInit===void 0&&(oe.__webglInit=!0,w.depthTexture.addEventListener("dispose",E)),oe.__webglTexture===void 0){oe.__webglTexture=s.createTexture(),t.bindTexture(s.TEXTURE_CUBE_MAP,oe.__webglTexture),ze(s.TEXTURE_CUBE_MAP,w.depthTexture);const Ge=r.convert(w.depthTexture.format),le=r.convert(w.depthTexture.type);let _e;w.depthTexture.format===Cs?_e=s.DEPTH_COMPONENT24:w.depthTexture.format===vr&&(_e=s.DEPTH24_STENCIL8);for(let Te=0;Te<6;Te++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Te,0,_e,w.width,w.height,0,Ge,le,null)}}else W(w.depthTexture,0);const te=oe.__webglTexture,De=F(w),fe=ne?s.TEXTURE_CUBE_MAP_POSITIVE_X+G:s.TEXTURE_2D,Pe=w.depthTexture.format===vr?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(w.depthTexture.format===Cs)tn(w)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Pe,fe,te,0,De):s.framebufferTexture2D(s.FRAMEBUFFER,Pe,fe,te,0);else if(w.depthTexture.format===vr)tn(w)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Pe,fe,te,0,De):s.framebufferTexture2D(s.FRAMEBUFFER,Pe,fe,te,0);else throw new Error("Unknown depthTexture format")}function st(I){const w=n.get(I),G=I.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==I.depthTexture){const ne=I.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),ne){const oe=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,ne.removeEventListener("dispose",oe)};ne.addEventListener("dispose",oe),w.__depthDisposeCallback=oe}w.__boundDepthTexture=ne}if(I.depthTexture&&!w.__autoAllocateDepthBuffer)if(G)for(let ne=0;ne<6;ne++)Ae(w.__webglFramebuffer[ne],I,ne);else{const ne=I.texture.mipmaps;ne&&ne.length>0?Ae(w.__webglFramebuffer[0],I,0):Ae(w.__webglFramebuffer,I,0)}else if(G){w.__webglDepthbuffer=[];for(let ne=0;ne<6;ne++)if(t.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer[ne]),w.__webglDepthbuffer[ne]===void 0)w.__webglDepthbuffer[ne]=s.createRenderbuffer(),tt(w.__webglDepthbuffer[ne],I,!1);else{const oe=I.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,te=w.__webglDepthbuffer[ne];s.bindRenderbuffer(s.RENDERBUFFER,te),s.framebufferRenderbuffer(s.FRAMEBUFFER,oe,s.RENDERBUFFER,te)}}else{const ne=I.texture.mipmaps;if(ne&&ne.length>0?t.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=s.createRenderbuffer(),tt(w.__webglDepthbuffer,I,!1);else{const oe=I.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,te=w.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,te),s.framebufferRenderbuffer(s.FRAMEBUFFER,oe,s.RENDERBUFFER,te)}}t.bindFramebuffer(s.FRAMEBUFFER,null)}function cn(I,w,G){const ne=n.get(I);w!==void 0&&we(ne.__webglFramebuffer,I,I.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),G!==void 0&&st(I)}function yt(I){const w=I.texture,G=n.get(I),ne=n.get(w);I.addEventListener("dispose",A);const oe=I.textures,te=I.isWebGLCubeRenderTarget===!0,De=oe.length>1;if(De||(ne.__webglTexture===void 0&&(ne.__webglTexture=s.createTexture()),ne.__version=w.version,o.memory.textures++),te){G.__webglFramebuffer=[];for(let fe=0;fe<6;fe++)if(w.mipmaps&&w.mipmaps.length>0){G.__webglFramebuffer[fe]=[];for(let Pe=0;Pe<w.mipmaps.length;Pe++)G.__webglFramebuffer[fe][Pe]=s.createFramebuffer()}else G.__webglFramebuffer[fe]=s.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){G.__webglFramebuffer=[];for(let fe=0;fe<w.mipmaps.length;fe++)G.__webglFramebuffer[fe]=s.createFramebuffer()}else G.__webglFramebuffer=s.createFramebuffer();if(De)for(let fe=0,Pe=oe.length;fe<Pe;fe++){const Ge=n.get(oe[fe]);Ge.__webglTexture===void 0&&(Ge.__webglTexture=s.createTexture(),o.memory.textures++)}if(I.samples>0&&tn(I)===!1){G.__webglMultisampledFramebuffer=s.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let fe=0;fe<oe.length;fe++){const Pe=oe[fe];G.__webglColorRenderbuffer[fe]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,G.__webglColorRenderbuffer[fe]);const Ge=r.convert(Pe.format,Pe.colorSpace),le=r.convert(Pe.type),_e=b(Pe.internalFormat,Ge,le,Pe.colorSpace,I.isXRRenderTarget===!0),Te=F(I);s.renderbufferStorageMultisample(s.RENDERBUFFER,Te,_e,I.width,I.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+fe,s.RENDERBUFFER,G.__webglColorRenderbuffer[fe])}s.bindRenderbuffer(s.RENDERBUFFER,null),I.depthBuffer&&(G.__webglDepthRenderbuffer=s.createRenderbuffer(),tt(G.__webglDepthRenderbuffer,I,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(te){t.bindTexture(s.TEXTURE_CUBE_MAP,ne.__webglTexture),ze(s.TEXTURE_CUBE_MAP,w);for(let fe=0;fe<6;fe++)if(w.mipmaps&&w.mipmaps.length>0)for(let Pe=0;Pe<w.mipmaps.length;Pe++)we(G.__webglFramebuffer[fe][Pe],I,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,Pe);else we(G.__webglFramebuffer[fe],I,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0);m(w)&&p(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(De){for(let fe=0,Pe=oe.length;fe<Pe;fe++){const Ge=oe[fe],le=n.get(Ge);let _e=s.TEXTURE_2D;(I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(_e=I.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(_e,le.__webglTexture),ze(_e,Ge),we(G.__webglFramebuffer,I,Ge,s.COLOR_ATTACHMENT0+fe,_e,0),m(Ge)&&p(_e)}t.unbindTexture()}else{let fe=s.TEXTURE_2D;if((I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(fe=I.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(fe,ne.__webglTexture),ze(fe,w),w.mipmaps&&w.mipmaps.length>0)for(let Pe=0;Pe<w.mipmaps.length;Pe++)we(G.__webglFramebuffer[Pe],I,w,s.COLOR_ATTACHMENT0,fe,Pe);else we(G.__webglFramebuffer,I,w,s.COLOR_ATTACHMENT0,fe,0);m(w)&&p(fe),t.unbindTexture()}I.depthBuffer&&st(I)}function Rt(I){const w=I.textures;for(let G=0,ne=w.length;G<ne;G++){const oe=w[G];if(m(oe)){const te=y(I),De=n.get(oe).__webglTexture;t.bindTexture(te,De),p(te),t.unbindTexture()}}}const Pt=[],et=[];function en(I){if(I.samples>0){if(tn(I)===!1){const w=I.textures,G=I.width,ne=I.height;let oe=s.COLOR_BUFFER_BIT;const te=I.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,De=n.get(I),fe=w.length>1;if(fe)for(let Ge=0;Ge<w.length;Ge++)t.bindFramebuffer(s.FRAMEBUFFER,De.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ge,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,De.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ge,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,De.__webglMultisampledFramebuffer);const Pe=I.texture.mipmaps;Pe&&Pe.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,De.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,De.__webglFramebuffer);for(let Ge=0;Ge<w.length;Ge++){if(I.resolveDepthBuffer&&(I.depthBuffer&&(oe|=s.DEPTH_BUFFER_BIT),I.stencilBuffer&&I.resolveStencilBuffer&&(oe|=s.STENCIL_BUFFER_BIT)),fe){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,De.__webglColorRenderbuffer[Ge]);const le=n.get(w[Ge]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,le,0)}s.blitFramebuffer(0,0,G,ne,0,0,G,ne,oe,s.NEAREST),l===!0&&(Pt.length=0,et.length=0,Pt.push(s.COLOR_ATTACHMENT0+Ge),I.depthBuffer&&I.resolveDepthBuffer===!1&&(Pt.push(te),et.push(te),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,et)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,Pt))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),fe)for(let Ge=0;Ge<w.length;Ge++){t.bindFramebuffer(s.FRAMEBUFFER,De.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ge,s.RENDERBUFFER,De.__webglColorRenderbuffer[Ge]);const le=n.get(w[Ge]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,De.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ge,s.TEXTURE_2D,le,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,De.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.resolveDepthBuffer===!1&&l){const w=I.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[w])}}}function F(I){return Math.min(i.maxSamples,I.samples)}function tn(I){const w=n.get(I);return I.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function Mt(I){const w=o.render.frame;h.get(I)!==w&&(h.set(I,w),I.update())}function Ot(I,w){const G=I.colorSpace,ne=I.format,oe=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||G!==kn&&G!==bs&&(xt.getTransfer(G)===Dt?(ne!==pi||oe!==di)&&Oe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ke("WebGLTextures: Unsupported texture color space:",G)),w}function Le(I){return typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement?(c.width=I.naturalWidth||I.width,c.height=I.naturalHeight||I.height):typeof VideoFrame<"u"&&I instanceof VideoFrame?(c.width=I.displayWidth,c.height=I.displayHeight):(c.width=I.width,c.height=I.height),c}this.allocateTextureUnit=H,this.resetTextureUnits=k,this.setTexture2D=W,this.setTexture2DArray=j,this.setTexture3D=V,this.setTextureCube=q,this.rebindTextures=cn,this.setupRenderTarget=yt,this.updateRenderTargetMipmap=Rt,this.updateMultisampleRenderTarget=en,this.setupDepthRenderbuffer=st,this.setupFrameBufferTexture=we,this.useMultisampledRTT=tn,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function sM(s,e){function t(n,i=bs){let r;const o=xt.getTransfer(i);if(n===di)return s.UNSIGNED_BYTE;if(n===$u)return s.UNSIGNED_SHORT_4_4_4_4;if(n===qu)return s.UNSIGNED_SHORT_5_5_5_1;if(n===rm)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===om)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===im)return s.BYTE;if(n===sm)return s.SHORT;if(n===wa)return s.UNSIGNED_SHORT;if(n===Yu)return s.INT;if(n===os)return s.UNSIGNED_INT;if(n===Ai)return s.FLOAT;if(n===Rs)return s.HALF_FLOAT;if(n===am)return s.ALPHA;if(n===lm)return s.RGB;if(n===pi)return s.RGBA;if(n===Cs)return s.DEPTH_COMPONENT;if(n===vr)return s.DEPTH_STENCIL;if(n===Zu)return s.RED;if(n===Ku)return s.RED_INTEGER;if(n===wo)return s.RG;if(n===Qu)return s.RG_INTEGER;if(n===Ju)return s.RGBA_INTEGER;if(n===wl||n===El||n===Tl||n===Al)if(o===Dt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===wl)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===El)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Tl)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Al)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===wl)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===El)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Tl)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Al)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Fh||n===Oh||n===kh||n===Bh)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Fh)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Oh)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===kh)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Bh)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===zh||n===Hh||n===Vh||n===Gh||n===Wh||n===Xh||n===jh)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===zh||n===Hh)return o===Dt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Vh)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Gh)return r.COMPRESSED_R11_EAC;if(n===Wh)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Xh)return r.COMPRESSED_RG11_EAC;if(n===jh)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Yh||n===$h||n===qh||n===Zh||n===Kh||n===Qh||n===Jh||n===eu||n===tu||n===nu||n===iu||n===su||n===ru||n===ou)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Yh)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===$h)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===qh)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Zh)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Kh)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Qh)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Jh)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===eu)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===tu)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===nu)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===iu)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===su)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ru)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ou)return o===Dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===au||n===lu||n===cu)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===au)return o===Dt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===lu)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===cu)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===hu||n===uu||n===du||n===fu)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===hu)return r.COMPRESSED_RED_RGTC1_EXT;if(n===uu)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===du)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===fu)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ea?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}const rM=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,oM=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class aM{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new Mm(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new as({vertexShader:rM,fragmentShader:oM,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ve(new ka(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class lM extends Nr{constructor(e,t){super();const n=this;let i=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,g=null;const _=typeof XRWebGLBinding<"u",m=new aM,p={},y=t.getContextAttributes();let b=null,v=null;const M=[],E=[],A=new Ne;let P=null;const S=new Wn;S.viewport=new Yt;const T=new Wn;T.viewport=new Yt;const L=[S,T],k=new ox;let H=null,Y=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(se){let ae=M[se];return ae===void 0&&(ae=new Hc,M[se]=ae),ae.getTargetRaySpace()},this.getControllerGrip=function(se){let ae=M[se];return ae===void 0&&(ae=new Hc,M[se]=ae),ae.getGripSpace()},this.getHand=function(se){let ae=M[se];return ae===void 0&&(ae=new Hc,M[se]=ae),ae.getHandSpace()};function W(se){const ae=E.indexOf(se.inputSource);if(ae===-1)return;const we=M[ae];we!==void 0&&(we.update(se.inputSource,se.frame,c||o),we.dispatchEvent({type:se.type,data:se.inputSource}))}function j(){i.removeEventListener("select",W),i.removeEventListener("selectstart",W),i.removeEventListener("selectend",W),i.removeEventListener("squeeze",W),i.removeEventListener("squeezestart",W),i.removeEventListener("squeezeend",W),i.removeEventListener("end",j),i.removeEventListener("inputsourceschange",V);for(let se=0;se<M.length;se++){const ae=E[se];ae!==null&&(E[se]=null,M[se].disconnect(ae))}H=null,Y=null,m.reset();for(const se in p)delete p[se];e.setRenderTarget(b),f=null,d=null,u=null,i=null,v=null,_t.stop(),n.isPresenting=!1,e.setPixelRatio(P),e.setSize(A.width,A.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(se){r=se,n.isPresenting===!0&&Oe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(se){a=se,n.isPresenting===!0&&Oe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(se){c=se},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(i,t)),u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(se){if(i=se,i!==null){if(b=e.getRenderTarget(),i.addEventListener("select",W),i.addEventListener("selectstart",W),i.addEventListener("selectend",W),i.addEventListener("squeeze",W),i.addEventListener("squeezestart",W),i.addEventListener("squeezeend",W),i.addEventListener("end",j),i.addEventListener("inputsourceschange",V),y.xrCompatible!==!0&&await t.makeXRCompatible(),P=e.getPixelRatio(),e.getSize(A),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let we=null,tt=null,Ae=null;y.depth&&(Ae=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,we=y.stencil?vr:Cs,tt=y.stencil?Ea:os);const st={colorFormat:t.RGBA8,depthFormat:Ae,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(st),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),v=new ns(d.textureWidth,d.textureHeight,{format:pi,type:di,depthTexture:new Ra(d.textureWidth,d.textureHeight,tt,void 0,void 0,void 0,void 0,void 0,void 0,we),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const we={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,t,we),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new ns(f.framebufferWidth,f.framebufferHeight,{format:pi,type:di,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),_t.setContext(i),_t.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function V(se){for(let ae=0;ae<se.removed.length;ae++){const we=se.removed[ae],tt=E.indexOf(we);tt>=0&&(E[tt]=null,M[tt].disconnect(we))}for(let ae=0;ae<se.added.length;ae++){const we=se.added[ae];let tt=E.indexOf(we);if(tt===-1){for(let st=0;st<M.length;st++)if(st>=E.length){E.push(we),tt=st;break}else if(E[st]===null){E[st]=we,tt=st;break}if(tt===-1)break}const Ae=M[tt];Ae&&Ae.connect(we)}}const q=new D,he=new D;function ue(se,ae,we){q.setFromMatrixPosition(ae.matrixWorld),he.setFromMatrixPosition(we.matrixWorld);const tt=q.distanceTo(he),Ae=ae.projectionMatrix.elements,st=we.projectionMatrix.elements,cn=Ae[14]/(Ae[10]-1),yt=Ae[14]/(Ae[10]+1),Rt=(Ae[9]+1)/Ae[5],Pt=(Ae[9]-1)/Ae[5],et=(Ae[8]-1)/Ae[0],en=(st[8]+1)/st[0],F=cn*et,tn=cn*en,Mt=tt/(-et+en),Ot=Mt*-et;if(ae.matrixWorld.decompose(se.position,se.quaternion,se.scale),se.translateX(Ot),se.translateZ(Mt),se.matrixWorld.compose(se.position,se.quaternion,se.scale),se.matrixWorldInverse.copy(se.matrixWorld).invert(),Ae[10]===-1)se.projectionMatrix.copy(ae.projectionMatrix),se.projectionMatrixInverse.copy(ae.projectionMatrixInverse);else{const Le=cn+Mt,I=yt+Mt,w=F-Ot,G=tn+(tt-Ot),ne=Rt*yt/I*Le,oe=Pt*yt/I*Le;se.projectionMatrix.makePerspective(w,G,ne,oe,Le,I),se.projectionMatrixInverse.copy(se.projectionMatrix).invert()}}function de(se,ae){ae===null?se.matrixWorld.copy(se.matrix):se.matrixWorld.multiplyMatrices(ae.matrixWorld,se.matrix),se.matrixWorldInverse.copy(se.matrixWorld).invert()}this.updateCamera=function(se){if(i===null)return;let ae=se.near,we=se.far;m.texture!==null&&(m.depthNear>0&&(ae=m.depthNear),m.depthFar>0&&(we=m.depthFar)),k.near=T.near=S.near=ae,k.far=T.far=S.far=we,(H!==k.near||Y!==k.far)&&(i.updateRenderState({depthNear:k.near,depthFar:k.far}),H=k.near,Y=k.far),k.layers.mask=se.layers.mask|6,S.layers.mask=k.layers.mask&3,T.layers.mask=k.layers.mask&5;const tt=se.parent,Ae=k.cameras;de(k,tt);for(let st=0;st<Ae.length;st++)de(Ae[st],tt);Ae.length===2?ue(k,S,T):k.projectionMatrix.copy(S.projectionMatrix),ze(se,k,tt)};function ze(se,ae,we){we===null?se.matrix.copy(ae.matrixWorld):(se.matrix.copy(we.matrixWorld),se.matrix.invert(),se.matrix.multiply(ae.matrixWorld)),se.matrix.decompose(se.position,se.quaternion,se.scale),se.updateMatrixWorld(!0),se.projectionMatrix.copy(ae.projectionMatrix),se.projectionMatrixInverse.copy(ae.projectionMatrixInverse),se.isPerspectiveCamera&&(se.fov=Ao*2*Math.atan(1/se.projectionMatrix.elements[5]),se.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(se){l=se,d!==null&&(d.fixedFoveation=se),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=se)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(k)},this.getCameraTexture=function(se){return p[se]};let Je=null;function ht(se,ae){if(h=ae.getViewerPose(c||o),g=ae,h!==null){const we=h.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let tt=!1;we.length!==k.cameras.length&&(k.cameras.length=0,tt=!0);for(let yt=0;yt<we.length;yt++){const Rt=we[yt];let Pt=null;if(f!==null)Pt=f.getViewport(Rt);else{const en=u.getViewSubImage(d,Rt);Pt=en.viewport,yt===0&&(e.setRenderTargetTextures(v,en.colorTexture,en.depthStencilTexture),e.setRenderTarget(v))}let et=L[yt];et===void 0&&(et=new Wn,et.layers.enable(yt),et.viewport=new Yt,L[yt]=et),et.matrix.fromArray(Rt.transform.matrix),et.matrix.decompose(et.position,et.quaternion,et.scale),et.projectionMatrix.fromArray(Rt.projectionMatrix),et.projectionMatrixInverse.copy(et.projectionMatrix).invert(),et.viewport.set(Pt.x,Pt.y,Pt.width,Pt.height),yt===0&&(k.matrix.copy(et.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),tt===!0&&k.cameras.push(et)}const Ae=i.enabledFeatures;if(Ae&&Ae.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&_){u=n.getBinding();const yt=u.getDepthInformation(we[0]);yt&&yt.isValid&&yt.texture&&m.init(yt,i.renderState)}if(Ae&&Ae.includes("camera-access")&&_){e.state.unbindTexture(),u=n.getBinding();for(let yt=0;yt<we.length;yt++){const Rt=we[yt].camera;if(Rt){let Pt=p[Rt];Pt||(Pt=new Mm,p[Rt]=Pt);const et=u.getCameraImage(Rt);Pt.sourceTexture=et}}}}for(let we=0;we<M.length;we++){const tt=E[we],Ae=M[we];tt!==null&&Ae!==void 0&&Ae.update(tt,ae,c||o)}Je&&Je(se,ae),ae.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ae}),g=null}const _t=new Rm;_t.setAnimationLoop(ht),this.setAnimationLoop=function(se){Je=se},this.dispose=function(){}}}const hr=new Ii,cM=new Ye;function hM(s,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,gm(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function i(m,p,y,b,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,v)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,y,b):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===$n&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===$n&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const y=e.get(p),b=y.envMap,v=y.envMapRotation;b&&(m.envMap.value=b,hr.copy(v),hr.x*=-1,hr.y*=-1,hr.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(hr.y*=-1,hr.z*=-1),m.envMapRotation.value.setFromMatrix4(cM.makeRotationFromEuler(hr)),m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,y,b){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*y,m.scale.value=b*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,y){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===$n&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){const y=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function uM(s,e,t,n){let i={},r={},o=[];const a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,b){const v=b.program;n.uniformBlockBinding(y,v)}function c(y,b){let v=i[y.id];v===void 0&&(g(y),v=h(y),i[y.id]=v,y.addEventListener("dispose",m));const M=b.program;n.updateUBOMapping(y,M);const E=e.render.frame;r[y.id]!==E&&(d(y),r[y.id]=E)}function h(y){const b=u();y.__bindingPointIndex=b;const v=s.createBuffer(),M=y.__size,E=y.usage;return s.bindBuffer(s.UNIFORM_BUFFER,v),s.bufferData(s.UNIFORM_BUFFER,M,E),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,b,v),v}function u(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return Ke("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){const b=i[y.id],v=y.uniforms,M=y.__cache;s.bindBuffer(s.UNIFORM_BUFFER,b);for(let E=0,A=v.length;E<A;E++){const P=Array.isArray(v[E])?v[E]:[v[E]];for(let S=0,T=P.length;S<T;S++){const L=P[S];if(f(L,E,S,M)===!0){const k=L.__offset,H=Array.isArray(L.value)?L.value:[L.value];let Y=0;for(let W=0;W<H.length;W++){const j=H[W],V=_(j);typeof j=="number"||typeof j=="boolean"?(L.__data[0]=j,s.bufferSubData(s.UNIFORM_BUFFER,k+Y,L.__data)):j.isMatrix3?(L.__data[0]=j.elements[0],L.__data[1]=j.elements[1],L.__data[2]=j.elements[2],L.__data[3]=0,L.__data[4]=j.elements[3],L.__data[5]=j.elements[4],L.__data[6]=j.elements[5],L.__data[7]=0,L.__data[8]=j.elements[6],L.__data[9]=j.elements[7],L.__data[10]=j.elements[8],L.__data[11]=0):(j.toArray(L.__data,Y),Y+=V.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,k,L.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(y,b,v,M){const E=y.value,A=b+"_"+v;if(M[A]===void 0)return typeof E=="number"||typeof E=="boolean"?M[A]=E:M[A]=E.clone(),!0;{const P=M[A];if(typeof E=="number"||typeof E=="boolean"){if(P!==E)return M[A]=E,!0}else if(P.equals(E)===!1)return P.copy(E),!0}return!1}function g(y){const b=y.uniforms;let v=0;const M=16;for(let A=0,P=b.length;A<P;A++){const S=Array.isArray(b[A])?b[A]:[b[A]];for(let T=0,L=S.length;T<L;T++){const k=S[T],H=Array.isArray(k.value)?k.value:[k.value];for(let Y=0,W=H.length;Y<W;Y++){const j=H[Y],V=_(j),q=v%M,he=q%V.boundary,ue=q+he;v+=he,ue!==0&&M-ue<V.storage&&(v+=M-ue),k.__data=new Float32Array(V.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=v,v+=V.storage}}}const E=v%M;return E>0&&(v+=M-E),y.__size=v,y.__cache={},this}function _(y){const b={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(b.boundary=4,b.storage=4):y.isVector2?(b.boundary=8,b.storage=8):y.isVector3||y.isColor?(b.boundary=16,b.storage=12):y.isVector4?(b.boundary=16,b.storage=16):y.isMatrix3?(b.boundary=48,b.storage=48):y.isMatrix4?(b.boundary=64,b.storage=64):y.isTexture?Oe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):Oe("WebGLRenderer: Unsupported uniform value type.",y),b}function m(y){const b=y.target;b.removeEventListener("dispose",m);const v=o.indexOf(b.__bindingPointIndex);o.splice(v,1),s.deleteBuffer(i[b.id]),delete i[b.id],delete r[b.id]}function p(){for(const y in i)s.deleteBuffer(i[y]);o=[],i={},r={}}return{bind:l,update:c,dispose:p}}const dM=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Vi=null;function fM(){return Vi===null&&(Vi=new rd(dM,16,16,wo,Rs),Vi.name="DFG_LUT",Vi.minFilter=pn,Vi.magFilter=pn,Vi.wrapS=Oi,Vi.wrapT=Oi,Vi.generateMipmaps=!1,Vi.needsUpdate=!0),Vi}class pM{constructor(e={}){const{canvas:t=B_(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=di}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;const _=f,m=new Set([Ju,Qu,Ku]),p=new Set([di,os,wa,Ea,$u,qu]),y=new Uint32Array(4),b=new Int32Array(4);let v=null,M=null;const E=[],A=[];let P=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ts,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const S=this;let T=!1;this._outputColorSpace=Qt;let L=0,k=0,H=null,Y=-1,W=null;const j=new Yt,V=new Yt;let q=null;const he=new ke(0);let ue=0,de=t.width,ze=t.height,Je=1,ht=null,_t=null;const se=new Yt(0,0,de,ze),ae=new Yt(0,0,de,ze);let we=!1;const tt=new ad;let Ae=!1,st=!1;const cn=new Ye,yt=new D,Rt=new Yt,Pt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let et=!1;function en(){return H===null?Je:1}let F=n;function tn(R,X){return t.getContext(R,X)}try{const R={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${rc}`),t.addEventListener("webglcontextlost",re,!1),t.addEventListener("webglcontextrestored",ie,!1),t.addEventListener("webglcontextcreationerror",Re,!1),F===null){const X="webgl2";if(F=tn(X,R),F===null)throw tn(X)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(R){throw Ke("WebGLRenderer: "+R.message),R}let Mt,Ot,Le,I,w,G,ne,oe,te,De,fe,Pe,Ge,le,_e,Te,Ie,pe,rt,z,C,N,x,B;function O(){Mt=new fb(F),Mt.init(),N=new sM(F,Mt),Ot=new sb(F,Mt,e,N),Le=new nM(F,Mt),Ot.reversedDepthBuffer&&d&&Le.buffers.depth.setReversed(!0),I=new gb(F),w=new HS,G=new iM(F,Mt,Le,w,Ot,N,I),ne=new ob(S),oe=new db(S),te=new vx(F),x=new nb(F,te),De=new pb(F,te,I,x),fe=new xb(F,De,te,I),rt=new _b(F,Ot,G),Te=new rb(w),Pe=new zS(S,ne,oe,Mt,Ot,x,Te),Ge=new hM(S,w),le=new GS,_e=new qS(Mt),pe=new tb(S,ne,oe,Le,fe,g,l),Ie=new eM(S,fe,Ot),B=new uM(F,I,Ot,Le),z=new ib(F,Mt,I),C=new mb(F,Mt,I),I.programs=Pe.programs,S.capabilities=Ot,S.extensions=Mt,S.properties=w,S.renderLists=le,S.shadowMap=Ie,S.state=Le,S.info=I}O(),_!==di&&(P=new vb(_,t.width,t.height,i,r));const U=new lM(S,F);this.xr=U,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){const R=Mt.get("WEBGL_lose_context");R&&R.loseContext()},this.forceContextRestore=function(){const R=Mt.get("WEBGL_lose_context");R&&R.restoreContext()},this.getPixelRatio=function(){return Je},this.setPixelRatio=function(R){R!==void 0&&(Je=R,this.setSize(de,ze,!1))},this.getSize=function(R){return R.set(de,ze)},this.setSize=function(R,X,J=!0){if(U.isPresenting){Oe("WebGLRenderer: Can't change size while VR device is presenting.");return}de=R,ze=X,t.width=Math.floor(R*Je),t.height=Math.floor(X*Je),J===!0&&(t.style.width=R+"px",t.style.height=X+"px"),P!==null&&P.setSize(t.width,t.height),this.setViewport(0,0,R,X)},this.getDrawingBufferSize=function(R){return R.set(de*Je,ze*Je).floor()},this.setDrawingBufferSize=function(R,X,J){de=R,ze=X,Je=J,t.width=Math.floor(R*J),t.height=Math.floor(X*J),this.setViewport(0,0,R,X)},this.setEffects=function(R){if(_===di){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(R){for(let X=0;X<R.length;X++)if(R[X].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}P.setEffects(R||[])},this.getCurrentViewport=function(R){return R.copy(j)},this.getViewport=function(R){return R.copy(se)},this.setViewport=function(R,X,J,K){R.isVector4?se.set(R.x,R.y,R.z,R.w):se.set(R,X,J,K),Le.viewport(j.copy(se).multiplyScalar(Je).round())},this.getScissor=function(R){return R.copy(ae)},this.setScissor=function(R,X,J,K){R.isVector4?ae.set(R.x,R.y,R.z,R.w):ae.set(R,X,J,K),Le.scissor(V.copy(ae).multiplyScalar(Je).round())},this.getScissorTest=function(){return we},this.setScissorTest=function(R){Le.setScissorTest(we=R)},this.setOpaqueSort=function(R){ht=R},this.setTransparentSort=function(R){_t=R},this.getClearColor=function(R){return R.copy(pe.getClearColor())},this.setClearColor=function(){pe.setClearColor(...arguments)},this.getClearAlpha=function(){return pe.getClearAlpha()},this.setClearAlpha=function(){pe.setClearAlpha(...arguments)},this.clear=function(R=!0,X=!0,J=!0){let K=0;if(R){let $=!1;if(H!==null){const ye=H.texture.format;$=m.has(ye)}if($){const ye=H.texture.type,Ee=p.has(ye),Se=pe.getClearColor(),Ce=pe.getClearAlpha(),Fe=Se.r,Qe=Se.g,We=Se.b;Ee?(y[0]=Fe,y[1]=Qe,y[2]=We,y[3]=Ce,F.clearBufferuiv(F.COLOR,0,y)):(b[0]=Fe,b[1]=Qe,b[2]=We,b[3]=Ce,F.clearBufferiv(F.COLOR,0,b))}else K|=F.COLOR_BUFFER_BIT}X&&(K|=F.DEPTH_BUFFER_BIT),J&&(K|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),F.clear(K)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",re,!1),t.removeEventListener("webglcontextrestored",ie,!1),t.removeEventListener("webglcontextcreationerror",Re,!1),pe.dispose(),le.dispose(),_e.dispose(),w.dispose(),ne.dispose(),oe.dispose(),fe.dispose(),x.dispose(),B.dispose(),Pe.dispose(),U.dispose(),U.removeEventListener("sessionstart",vt),U.removeEventListener("sessionend",He),pt.stop()};function re(R){R.preventDefault(),Ol("WebGLRenderer: Context Lost."),T=!0}function ie(){Ol("WebGLRenderer: Context Restored."),T=!1;const R=I.autoReset,X=Ie.enabled,J=Ie.autoUpdate,K=Ie.needsUpdate,$=Ie.type;O(),I.autoReset=R,Ie.enabled=X,Ie.autoUpdate=J,Ie.needsUpdate=K,Ie.type=$}function Re(R){Ke("WebGLRenderer: A WebGL context could not be created. Reason: ",R.statusMessage)}function Q(R){const X=R.target;X.removeEventListener("dispose",Q),ee(X)}function ee(R){Mn(R),w.remove(R)}function Mn(R){const X=w.get(R).programs;X!==void 0&&(X.forEach(function(J){Pe.releaseProgram(J)}),R.isShaderMaterial&&Pe.releaseShaderCache(R))}this.renderBufferDirect=function(R,X,J,K,$,ye){X===null&&(X=Pt);const Ee=$.isMesh&&$.matrixWorld.determinant()<0,Se=at(R,X,J,K,$);Le.setMaterial(K,Ee);let Ce=J.index,Fe=1;if(K.wireframe===!0){if(Ce=De.getWireframeAttribute(J),Ce===void 0)return;Fe=2}const Qe=J.drawRange,We=J.attributes.position;let ft=Qe.start*Fe,kt=(Qe.start+Qe.count)*Fe;ye!==null&&(ft=Math.max(ft,ye.start*Fe),kt=Math.min(kt,(ye.start+ye.count)*Fe)),Ce!==null?(ft=Math.max(ft,0),kt=Math.min(kt,Ce.count)):We!=null&&(ft=Math.max(ft,0),kt=Math.min(kt,We.count));const nn=kt-ft;if(nn<0||nn===1/0)return;x.setup($,K,Se,J,Ce);let sn,Ht=z;if(Ce!==null&&(sn=te.get(Ce),Ht=C,Ht.setIndex(sn)),$.isMesh)K.wireframe===!0?(Le.setLineWidth(K.wireframeLinewidth*en()),Ht.setMode(F.LINES)):Ht.setMode(F.TRIANGLES);else if($.isLine){let Xe=K.linewidth;Xe===void 0&&(Xe=1),Le.setLineWidth(Xe*en()),$.isLineSegments?Ht.setMode(F.LINES):$.isLineLoop?Ht.setMode(F.LINE_LOOP):Ht.setMode(F.LINE_STRIP)}else $.isPoints?Ht.setMode(F.POINTS):$.isSprite&&Ht.setMode(F.TRIANGLES);if($.isBatchedMesh)if($._multiDrawInstances!==null)Aa("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),Ht.renderMultiDrawInstances($._multiDrawStarts,$._multiDrawCounts,$._multiDrawCount,$._multiDrawInstances);else if(Mt.get("WEBGL_multi_draw"))Ht.renderMultiDraw($._multiDrawStarts,$._multiDrawCounts,$._multiDrawCount);else{const Xe=$._multiDrawStarts,Lt=$._multiDrawCounts,At=$._multiDrawCount,oi=Ce?te.get(Ce).bytesPerElement:1,zr=w.get(K).currentProgram.getUniforms();for(let ai=0;ai<At;ai++)zr.setValue(F,"_gl_DrawID",ai),Ht.render(Xe[ai]/oi,Lt[ai])}else if($.isInstancedMesh)Ht.renderInstances(ft,nn,$.count);else if(J.isInstancedBufferGeometry){const Xe=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,Lt=Math.min(J.instanceCount,Xe);Ht.renderInstances(ft,nn,Lt)}else Ht.render(ft,nn)};function je(R,X,J){R.transparent===!0&&R.side===Jn&&R.forceSinglePass===!1?(R.side=$n,R.needsUpdate=!0,bt(R,X,J),R.side=As,R.needsUpdate=!0,bt(R,X,J),R.side=Jn):bt(R,X,J)}this.compile=function(R,X,J=null){J===null&&(J=R),M=_e.get(J),M.init(X),A.push(M),J.traverseVisible(function($){$.isLight&&$.layers.test(X.layers)&&(M.pushLight($),$.castShadow&&M.pushShadow($))}),R!==J&&R.traverseVisible(function($){$.isLight&&$.layers.test(X.layers)&&(M.pushLight($),$.castShadow&&M.pushShadow($))}),M.setupLights();const K=new Set;return R.traverse(function($){if(!($.isMesh||$.isPoints||$.isLine||$.isSprite))return;const ye=$.material;if(ye)if(Array.isArray(ye))for(let Ee=0;Ee<ye.length;Ee++){const Se=ye[Ee];je(Se,J,$),K.add(Se)}else je(ye,J,$),K.add(ye)}),M=A.pop(),K},this.compileAsync=function(R,X,J=null){const K=this.compile(R,X,J);return new Promise($=>{function ye(){if(K.forEach(function(Ee){w.get(Ee).currentProgram.isReady()&&K.delete(Ee)}),K.size===0){$(R);return}setTimeout(ye,10)}Mt.get("KHR_parallel_shader_compile")!==null?ye():setTimeout(ye,10)})};let ce=null;function wn(R){ce&&ce(R)}function vt(){pt.stop()}function He(){pt.start()}const pt=new Rm;pt.setAnimationLoop(wn),typeof self<"u"&&pt.setContext(self),this.setAnimationLoop=function(R){ce=R,U.setAnimationLoop(R),R===null?pt.stop():pt.start()},U.addEventListener("sessionstart",vt),U.addEventListener("sessionend",He),this.render=function(R,X){if(X!==void 0&&X.isCamera!==!0){Ke("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(T===!0)return;const J=U.enabled===!0&&U.isPresenting===!0,K=P!==null&&(H===null||J)&&P.begin(S,H);if(R.matrixWorldAutoUpdate===!0&&R.updateMatrixWorld(),X.parent===null&&X.matrixWorldAutoUpdate===!0&&X.updateMatrixWorld(),U.enabled===!0&&U.isPresenting===!0&&(P===null||P.isCompositing()===!1)&&(U.cameraAutoUpdate===!0&&U.updateCamera(X),X=U.getCamera()),R.isScene===!0&&R.onBeforeRender(S,R,X,H),M=_e.get(R,A.length),M.init(X),A.push(M),cn.multiplyMatrices(X.projectionMatrix,X.matrixWorldInverse),tt.setFromProjectionMatrix(cn,Ki,X.reversedDepth),st=this.localClippingEnabled,Ae=Te.init(this.clippingPlanes,st),v=le.get(R,E.length),v.init(),E.push(v),U.enabled===!0&&U.isPresenting===!0){const Ee=S.xr.getDepthSensingMesh();Ee!==null&&nt(Ee,X,-1/0,S.sortObjects)}nt(R,X,0,S.sortObjects),v.finish(),S.sortObjects===!0&&v.sort(ht,_t),et=U.enabled===!1||U.isPresenting===!1||U.hasDepthSensing()===!1,et&&pe.addToRenderList(v,R),this.info.render.frame++,Ae===!0&&Te.beginShadows();const $=M.state.shadowsArray;if(Ie.render($,R,X),Ae===!0&&Te.endShadows(),this.info.autoReset===!0&&this.info.reset(),(K&&P.hasRenderPass())===!1){const Ee=v.opaque,Se=v.transmissive;if(M.setupLights(),X.isArrayCamera){const Ce=X.cameras;if(Se.length>0)for(let Fe=0,Qe=Ce.length;Fe<Qe;Fe++){const We=Ce[Fe];ut(Ee,Se,R,We)}et&&pe.render(R);for(let Fe=0,Qe=Ce.length;Fe<Qe;Fe++){const We=Ce[Fe];xe(v,R,We,We.viewport)}}else Se.length>0&&ut(Ee,Se,R,X),et&&pe.render(R),xe(v,R,X)}H!==null&&k===0&&(G.updateMultisampleRenderTarget(H),G.updateRenderTargetMipmap(H)),K&&P.end(S),R.isScene===!0&&R.onAfterRender(S,R,X),x.resetDefaultState(),Y=-1,W=null,A.pop(),A.length>0?(M=A[A.length-1],Ae===!0&&Te.setGlobalState(S.clippingPlanes,M.state.camera)):M=null,E.pop(),E.length>0?v=E[E.length-1]:v=null};function nt(R,X,J,K){if(R.visible===!1)return;if(R.layers.test(X.layers)){if(R.isGroup)J=R.renderOrder;else if(R.isLOD)R.autoUpdate===!0&&R.update(X);else if(R.isLight)M.pushLight(R),R.castShadow&&M.pushShadow(R);else if(R.isSprite){if(!R.frustumCulled||tt.intersectsSprite(R)){K&&Rt.setFromMatrixPosition(R.matrixWorld).applyMatrix4(cn);const Ee=fe.update(R),Se=R.material;Se.visible&&v.push(R,Ee,Se,J,Rt.z,null)}}else if((R.isMesh||R.isLine||R.isPoints)&&(!R.frustumCulled||tt.intersectsObject(R))){const Ee=fe.update(R),Se=R.material;if(K&&(R.boundingSphere!==void 0?(R.boundingSphere===null&&R.computeBoundingSphere(),Rt.copy(R.boundingSphere.center)):(Ee.boundingSphere===null&&Ee.computeBoundingSphere(),Rt.copy(Ee.boundingSphere.center)),Rt.applyMatrix4(R.matrixWorld).applyMatrix4(cn)),Array.isArray(Se)){const Ce=Ee.groups;for(let Fe=0,Qe=Ce.length;Fe<Qe;Fe++){const We=Ce[Fe],ft=Se[We.materialIndex];ft&&ft.visible&&v.push(R,Ee,ft,J,Rt.z,We)}}else Se.visible&&v.push(R,Ee,Se,J,Rt.z,null)}}const ye=R.children;for(let Ee=0,Se=ye.length;Ee<Se;Ee++)nt(ye[Ee],X,J,K)}function xe(R,X,J,K){const{opaque:$,transmissive:ye,transparent:Ee}=R;M.setupLightsView(J),Ae===!0&&Te.setGlobalState(S.clippingPlanes,J),K&&Le.viewport(j.copy(K)),$.length>0&&It($,X,J),ye.length>0&&It(ye,X,J),Ee.length>0&&It(Ee,X,J),Le.buffers.depth.setTest(!0),Le.buffers.depth.setMask(!0),Le.buffers.color.setMask(!0),Le.setPolygonOffset(!1)}function ut(R,X,J,K){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;if(M.state.transmissionRenderTarget[K.id]===void 0){const ft=Mt.has("EXT_color_buffer_half_float")||Mt.has("EXT_color_buffer_float");M.state.transmissionRenderTarget[K.id]=new ns(1,1,{generateMipmaps:!0,type:ft?Rs:di,minFilter:Zi,samples:Ot.samples,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:xt.workingColorSpace})}const ye=M.state.transmissionRenderTarget[K.id],Ee=K.viewport||j;ye.setSize(Ee.z*S.transmissionResolutionScale,Ee.w*S.transmissionResolutionScale);const Se=S.getRenderTarget(),Ce=S.getActiveCubeFace(),Fe=S.getActiveMipmapLevel();S.setRenderTarget(ye),S.getClearColor(he),ue=S.getClearAlpha(),ue<1&&S.setClearColor(16777215,.5),S.clear(),et&&pe.render(J);const Qe=S.toneMapping;S.toneMapping=ts;const We=K.viewport;if(K.viewport!==void 0&&(K.viewport=void 0),M.setupLightsView(K),Ae===!0&&Te.setGlobalState(S.clippingPlanes,K),It(R,J,K),G.updateMultisampleRenderTarget(ye),G.updateRenderTargetMipmap(ye),Mt.has("WEBGL_multisampled_render_to_texture")===!1){let ft=!1;for(let kt=0,nn=X.length;kt<nn;kt++){const sn=X[kt],{object:Ht,geometry:Xe,material:Lt,group:At}=sn;if(Lt.side===Jn&&Ht.layers.test(K.layers)){const oi=Lt.side;Lt.side=$n,Lt.needsUpdate=!0,Ue(Ht,J,K,Xe,Lt,At),Lt.side=oi,Lt.needsUpdate=!0,ft=!0}}ft===!0&&(G.updateMultisampleRenderTarget(ye),G.updateRenderTargetMipmap(ye))}S.setRenderTarget(Se,Ce,Fe),S.setClearColor(he,ue),We!==void 0&&(K.viewport=We),S.toneMapping=Qe}function It(R,X,J){const K=X.isScene===!0?X.overrideMaterial:null;for(let $=0,ye=R.length;$<ye;$++){const Ee=R[$],{object:Se,geometry:Ce,group:Fe}=Ee;let Qe=Ee.material;Qe.allowOverride===!0&&K!==null&&(Qe=K),Se.layers.test(J.layers)&&Ue(Se,X,J,Ce,Qe,Fe)}}function Ue(R,X,J,K,$,ye){R.onBeforeRender(S,X,J,K,$,ye),R.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,R.matrixWorld),R.normalMatrix.getNormalMatrix(R.modelViewMatrix),$.onBeforeRender(S,X,J,K,R,ye),$.transparent===!0&&$.side===Jn&&$.forceSinglePass===!1?($.side=$n,$.needsUpdate=!0,S.renderBufferDirect(J,X,K,$,R,ye),$.side=As,$.needsUpdate=!0,S.renderBufferDirect(J,X,K,$,R,ye),$.side=Jn):S.renderBufferDirect(J,X,K,$,R,ye),R.onAfterRender(S,X,J,K,$,ye)}function bt(R,X,J){X.isScene!==!0&&(X=Pt);const K=w.get(R),$=M.state.lights,ye=M.state.shadowsArray,Ee=$.state.version,Se=Pe.getParameters(R,$.state,ye,X,J),Ce=Pe.getProgramCacheKey(Se);let Fe=K.programs;K.environment=R.isMeshStandardMaterial?X.environment:null,K.fog=X.fog,K.envMap=(R.isMeshStandardMaterial?oe:ne).get(R.envMap||K.environment),K.envMapRotation=K.environment!==null&&R.envMap===null?X.environmentRotation:R.envMapRotation,Fe===void 0&&(R.addEventListener("dispose",Q),Fe=new Map,K.programs=Fe);let Qe=Fe.get(Ce);if(Qe!==void 0){if(K.currentProgram===Qe&&K.lightsStateVersion===Ee)return $e(R,Se),Qe}else Se.uniforms=Pe.getUniforms(R),R.onBeforeCompile(Se,S),Qe=Pe.acquireProgram(Se,Ce),Fe.set(Ce,Qe),K.uniforms=Se.uniforms;const We=K.uniforms;return(!R.isShaderMaterial&&!R.isRawShaderMaterial||R.clipping===!0)&&(We.clippingPlanes=Te.uniform),$e(R,Se),K.needsLights=ir(R),K.lightsStateVersion=Ee,K.needsLights&&(We.ambientLightColor.value=$.state.ambient,We.lightProbe.value=$.state.probe,We.directionalLights.value=$.state.directional,We.directionalLightShadows.value=$.state.directionalShadow,We.spotLights.value=$.state.spot,We.spotLightShadows.value=$.state.spotShadow,We.rectAreaLights.value=$.state.rectArea,We.ltc_1.value=$.state.rectAreaLTC1,We.ltc_2.value=$.state.rectAreaLTC2,We.pointLights.value=$.state.point,We.pointLightShadows.value=$.state.pointShadow,We.hemisphereLights.value=$.state.hemi,We.directionalShadowMap.value=$.state.directionalShadowMap,We.directionalShadowMatrix.value=$.state.directionalShadowMatrix,We.spotShadowMap.value=$.state.spotShadowMap,We.spotLightMatrix.value=$.state.spotLightMatrix,We.spotLightMap.value=$.state.spotLightMap,We.pointShadowMap.value=$.state.pointShadowMap,We.pointShadowMatrix.value=$.state.pointShadowMatrix),K.currentProgram=Qe,K.uniformsList=null,Qe}function it(R){if(R.uniformsList===null){const X=R.currentProgram.getUniforms();R.uniformsList=Rl.seqWithValue(X.seq,R.uniforms)}return R.uniformsList}function $e(R,X){const J=w.get(R);J.outputColorSpace=X.outputColorSpace,J.batching=X.batching,J.batchingColor=X.batchingColor,J.instancing=X.instancing,J.instancingColor=X.instancingColor,J.instancingMorph=X.instancingMorph,J.skinning=X.skinning,J.morphTargets=X.morphTargets,J.morphNormals=X.morphNormals,J.morphColors=X.morphColors,J.morphTargetsCount=X.morphTargetsCount,J.numClippingPlanes=X.numClippingPlanes,J.numIntersection=X.numClipIntersection,J.vertexAlphas=X.vertexAlphas,J.vertexTangents=X.vertexTangents,J.toneMapping=X.toneMapping}function at(R,X,J,K,$){X.isScene!==!0&&(X=Pt),G.resetTextureUnits();const ye=X.fog,Ee=K.isMeshStandardMaterial?X.environment:null,Se=H===null?S.outputColorSpace:H.isXRRenderTarget===!0?H.texture.colorSpace:kn,Ce=(K.isMeshStandardMaterial?oe:ne).get(K.envMap||Ee),Fe=K.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,Qe=!!J.attributes.tangent&&(!!K.normalMap||K.anisotropy>0),We=!!J.morphAttributes.position,ft=!!J.morphAttributes.normal,kt=!!J.morphAttributes.color;let nn=ts;K.toneMapped&&(H===null||H.isXRRenderTarget===!0)&&(nn=S.toneMapping);const sn=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,Ht=sn!==void 0?sn.length:0,Xe=w.get(K),Lt=M.state.lights;if(Ae===!0&&(st===!0||R!==W)){const Bn=R===W&&K.id===Y;Te.setState(K,R,Bn)}let At=!1;K.version===Xe.__version?(Xe.needsLights&&Xe.lightsStateVersion!==Lt.state.version||Xe.outputColorSpace!==Se||$.isBatchedMesh&&Xe.batching===!1||!$.isBatchedMesh&&Xe.batching===!0||$.isBatchedMesh&&Xe.batchingColor===!0&&$.colorTexture===null||$.isBatchedMesh&&Xe.batchingColor===!1&&$.colorTexture!==null||$.isInstancedMesh&&Xe.instancing===!1||!$.isInstancedMesh&&Xe.instancing===!0||$.isSkinnedMesh&&Xe.skinning===!1||!$.isSkinnedMesh&&Xe.skinning===!0||$.isInstancedMesh&&Xe.instancingColor===!0&&$.instanceColor===null||$.isInstancedMesh&&Xe.instancingColor===!1&&$.instanceColor!==null||$.isInstancedMesh&&Xe.instancingMorph===!0&&$.morphTexture===null||$.isInstancedMesh&&Xe.instancingMorph===!1&&$.morphTexture!==null||Xe.envMap!==Ce||K.fog===!0&&Xe.fog!==ye||Xe.numClippingPlanes!==void 0&&(Xe.numClippingPlanes!==Te.numPlanes||Xe.numIntersection!==Te.numIntersection)||Xe.vertexAlphas!==Fe||Xe.vertexTangents!==Qe||Xe.morphTargets!==We||Xe.morphNormals!==ft||Xe.morphColors!==kt||Xe.toneMapping!==nn||Xe.morphTargetsCount!==Ht)&&(At=!0):(At=!0,Xe.__version=K.version);let oi=Xe.currentProgram;At===!0&&(oi=bt(K,X,$));let zr=!1,ai=!1,jo=!1;const Xt=oi.getUniforms(),Zn=Xe.uniforms;if(Le.useProgram(oi.program)&&(zr=!0,ai=!0,jo=!0),K.id!==Y&&(Y=K.id,ai=!0),zr||W!==R){Le.buffers.depth.getReversed()&&R.reversedDepth!==!0&&(R._reversedDepth=!0,R.updateProjectionMatrix()),Xt.setValue(F,"projectionMatrix",R.projectionMatrix),Xt.setValue(F,"viewMatrix",R.matrixWorldInverse);const Kn=Xt.map.cameraPosition;Kn!==void 0&&Kn.setValue(F,yt.setFromMatrixPosition(R.matrixWorld)),Ot.logarithmicDepthBuffer&&Xt.setValue(F,"logDepthBufFC",2/(Math.log(R.far+1)/Math.LN2)),(K.isMeshPhongMaterial||K.isMeshToonMaterial||K.isMeshLambertMaterial||K.isMeshBasicMaterial||K.isMeshStandardMaterial||K.isShaderMaterial)&&Xt.setValue(F,"isOrthographic",R.isOrthographicCamera===!0),W!==R&&(W=R,ai=!0,jo=!0)}if(Xe.needsLights&&(Lt.state.directionalShadowMap.length>0&&Xt.setValue(F,"directionalShadowMap",Lt.state.directionalShadowMap,G),Lt.state.spotShadowMap.length>0&&Xt.setValue(F,"spotShadowMap",Lt.state.spotShadowMap,G),Lt.state.pointShadowMap.length>0&&Xt.setValue(F,"pointShadowMap",Lt.state.pointShadowMap,G)),$.isSkinnedMesh){Xt.setOptional(F,$,"bindMatrix"),Xt.setOptional(F,$,"bindMatrixInverse");const Bn=$.skeleton;Bn&&(Bn.boneTexture===null&&Bn.computeBoneTexture(),Xt.setValue(F,"boneTexture",Bn.boneTexture,G))}$.isBatchedMesh&&(Xt.setOptional(F,$,"batchingTexture"),Xt.setValue(F,"batchingTexture",$._matricesTexture,G),Xt.setOptional(F,$,"batchingIdTexture"),Xt.setValue(F,"batchingIdTexture",$._indirectTexture,G),Xt.setOptional(F,$,"batchingColorTexture"),$._colorsTexture!==null&&Xt.setValue(F,"batchingColorTexture",$._colorsTexture,G));const bi=J.morphAttributes;if((bi.position!==void 0||bi.normal!==void 0||bi.color!==void 0)&&rt.update($,J,oi),(ai||Xe.receiveShadow!==$.receiveShadow)&&(Xe.receiveShadow=$.receiveShadow,Xt.setValue(F,"receiveShadow",$.receiveShadow)),K.isMeshGouraudMaterial&&K.envMap!==null&&(Zn.envMap.value=Ce,Zn.flipEnvMap.value=Ce.isCubeTexture&&Ce.isRenderTargetTexture===!1?-1:1),K.isMeshStandardMaterial&&K.envMap===null&&X.environment!==null&&(Zn.envMapIntensity.value=X.environmentIntensity),Zn.dfgLUT!==void 0&&(Zn.dfgLUT.value=fM()),ai&&(Xt.setValue(F,"toneMappingExposure",S.toneMappingExposure),Xe.needsLights&&Rn(Zn,jo),ye&&K.fog===!0&&Ge.refreshFogUniforms(Zn,ye),Ge.refreshMaterialUniforms(Zn,K,Je,ze,M.state.transmissionRenderTarget[R.id]),Rl.upload(F,it(Xe),Zn,G)),K.isShaderMaterial&&K.uniformsNeedUpdate===!0&&(Rl.upload(F,it(Xe),Zn,G),K.uniformsNeedUpdate=!1),K.isSpriteMaterial&&Xt.setValue(F,"center",$.center),Xt.setValue(F,"modelViewMatrix",$.modelViewMatrix),Xt.setValue(F,"normalMatrix",$.normalMatrix),Xt.setValue(F,"modelMatrix",$.matrixWorld),K.isShaderMaterial||K.isRawShaderMaterial){const Bn=K.uniformsGroups;for(let Kn=0,yc=Bn.length;Kn<yc;Kn++){const sr=Bn[Kn];B.update(sr,oi),B.bind(sr,oi)}}return oi}function Rn(R,X){R.ambientLightColor.needsUpdate=X,R.lightProbe.needsUpdate=X,R.directionalLights.needsUpdate=X,R.directionalLightShadows.needsUpdate=X,R.pointLights.needsUpdate=X,R.pointLightShadows.needsUpdate=X,R.spotLights.needsUpdate=X,R.spotLightShadows.needsUpdate=X,R.rectAreaLights.needsUpdate=X,R.hemisphereLights.needsUpdate=X}function ir(R){return R.isMeshLambertMaterial||R.isMeshToonMaterial||R.isMeshPhongMaterial||R.isMeshStandardMaterial||R.isShadowMaterial||R.isShaderMaterial&&R.lights===!0}this.getActiveCubeFace=function(){return L},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return H},this.setRenderTargetTextures=function(R,X,J){const K=w.get(R);K.__autoAllocateDepthBuffer=R.resolveDepthBuffer===!1,K.__autoAllocateDepthBuffer===!1&&(K.__useRenderToTexture=!1),w.get(R.texture).__webglTexture=X,w.get(R.depthTexture).__webglTexture=K.__autoAllocateDepthBuffer?void 0:J,K.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(R,X){const J=w.get(R);J.__webglFramebuffer=X,J.__useDefaultFramebuffer=X===void 0};const Or=F.createFramebuffer();this.setRenderTarget=function(R,X=0,J=0){H=R,L=X,k=J;let K=null,$=!1,ye=!1;if(R){const Se=w.get(R);if(Se.__useDefaultFramebuffer!==void 0){Le.bindFramebuffer(F.FRAMEBUFFER,Se.__webglFramebuffer),j.copy(R.viewport),V.copy(R.scissor),q=R.scissorTest,Le.viewport(j),Le.scissor(V),Le.setScissorTest(q),Y=-1;return}else if(Se.__webglFramebuffer===void 0)G.setupRenderTarget(R);else if(Se.__hasExternalTextures)G.rebindTextures(R,w.get(R.texture).__webglTexture,w.get(R.depthTexture).__webglTexture);else if(R.depthBuffer){const Qe=R.depthTexture;if(Se.__boundDepthTexture!==Qe){if(Qe!==null&&w.has(Qe)&&(R.width!==Qe.image.width||R.height!==Qe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");G.setupDepthRenderbuffer(R)}}const Ce=R.texture;(Ce.isData3DTexture||Ce.isDataArrayTexture||Ce.isCompressedArrayTexture)&&(ye=!0);const Fe=w.get(R).__webglFramebuffer;R.isWebGLCubeRenderTarget?(Array.isArray(Fe[X])?K=Fe[X][J]:K=Fe[X],$=!0):R.samples>0&&G.useMultisampledRTT(R)===!1?K=w.get(R).__webglMultisampledFramebuffer:Array.isArray(Fe)?K=Fe[J]:K=Fe,j.copy(R.viewport),V.copy(R.scissor),q=R.scissorTest}else j.copy(se).multiplyScalar(Je).floor(),V.copy(ae).multiplyScalar(Je).floor(),q=we;if(J!==0&&(K=Or),Le.bindFramebuffer(F.FRAMEBUFFER,K)&&Le.drawBuffers(R,K),Le.viewport(j),Le.scissor(V),Le.setScissorTest(q),$){const Se=w.get(R.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+X,Se.__webglTexture,J)}else if(ye){const Se=X;for(let Ce=0;Ce<R.textures.length;Ce++){const Fe=w.get(R.textures[Ce]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+Ce,Fe.__webglTexture,J,Se)}}else if(R!==null&&J!==0){const Se=w.get(R.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Se.__webglTexture,J)}Y=-1},this.readRenderTargetPixels=function(R,X,J,K,$,ye,Ee,Se=0){if(!(R&&R.isWebGLRenderTarget)){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ce=w.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Ee!==void 0&&(Ce=Ce[Ee]),Ce){Le.bindFramebuffer(F.FRAMEBUFFER,Ce);try{const Fe=R.textures[Se],Qe=Fe.format,We=Fe.type;if(!Ot.textureFormatReadable(Qe)){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ot.textureTypeReadable(We)){Ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}X>=0&&X<=R.width-K&&J>=0&&J<=R.height-$&&(R.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+Se),F.readPixels(X,J,K,$,N.convert(Qe),N.convert(We),ye))}finally{const Fe=H!==null?w.get(H).__webglFramebuffer:null;Le.bindFramebuffer(F.FRAMEBUFFER,Fe)}}},this.readRenderTargetPixelsAsync=async function(R,X,J,K,$,ye,Ee,Se=0){if(!(R&&R.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ce=w.get(R).__webglFramebuffer;if(R.isWebGLCubeRenderTarget&&Ee!==void 0&&(Ce=Ce[Ee]),Ce)if(X>=0&&X<=R.width-K&&J>=0&&J<=R.height-$){Le.bindFramebuffer(F.FRAMEBUFFER,Ce);const Fe=R.textures[Se],Qe=Fe.format,We=Fe.type;if(!Ot.textureFormatReadable(Qe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ot.textureTypeReadable(We))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ft=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,ft),F.bufferData(F.PIXEL_PACK_BUFFER,ye.byteLength,F.STREAM_READ),R.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+Se),F.readPixels(X,J,K,$,N.convert(Qe),N.convert(We),0);const kt=H!==null?w.get(H).__webglFramebuffer:null;Le.bindFramebuffer(F.FRAMEBUFFER,kt);const nn=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await z_(F,nn,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,ft),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,ye),F.deleteBuffer(ft),F.deleteSync(nn),ye}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(R,X=null,J=0){const K=Math.pow(2,-J),$=Math.floor(R.image.width*K),ye=Math.floor(R.image.height*K),Ee=X!==null?X.x:0,Se=X!==null?X.y:0;G.setTexture2D(R,0),F.copyTexSubImage2D(F.TEXTURE_2D,J,0,0,Ee,Se,$,ye),Le.unbindTexture()};const kr=F.createFramebuffer(),Br=F.createFramebuffer();this.copyTextureToTexture=function(R,X,J=null,K=null,$=0,ye=null){ye===null&&($!==0?(Aa("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ye=$,$=0):ye=0);let Ee,Se,Ce,Fe,Qe,We,ft,kt,nn;const sn=R.isCompressedTexture?R.mipmaps[ye]:R.image;if(J!==null)Ee=J.max.x-J.min.x,Se=J.max.y-J.min.y,Ce=J.isBox3?J.max.z-J.min.z:1,Fe=J.min.x,Qe=J.min.y,We=J.isBox3?J.min.z:0;else{const bi=Math.pow(2,-$);Ee=Math.floor(sn.width*bi),Se=Math.floor(sn.height*bi),R.isDataArrayTexture?Ce=sn.depth:R.isData3DTexture?Ce=Math.floor(sn.depth*bi):Ce=1,Fe=0,Qe=0,We=0}K!==null?(ft=K.x,kt=K.y,nn=K.z):(ft=0,kt=0,nn=0);const Ht=N.convert(X.format),Xe=N.convert(X.type);let Lt;X.isData3DTexture?(G.setTexture3D(X,0),Lt=F.TEXTURE_3D):X.isDataArrayTexture||X.isCompressedArrayTexture?(G.setTexture2DArray(X,0),Lt=F.TEXTURE_2D_ARRAY):(G.setTexture2D(X,0),Lt=F.TEXTURE_2D),F.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,X.flipY),F.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,X.premultiplyAlpha),F.pixelStorei(F.UNPACK_ALIGNMENT,X.unpackAlignment);const At=F.getParameter(F.UNPACK_ROW_LENGTH),oi=F.getParameter(F.UNPACK_IMAGE_HEIGHT),zr=F.getParameter(F.UNPACK_SKIP_PIXELS),ai=F.getParameter(F.UNPACK_SKIP_ROWS),jo=F.getParameter(F.UNPACK_SKIP_IMAGES);F.pixelStorei(F.UNPACK_ROW_LENGTH,sn.width),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,sn.height),F.pixelStorei(F.UNPACK_SKIP_PIXELS,Fe),F.pixelStorei(F.UNPACK_SKIP_ROWS,Qe),F.pixelStorei(F.UNPACK_SKIP_IMAGES,We);const Xt=R.isDataArrayTexture||R.isData3DTexture,Zn=X.isDataArrayTexture||X.isData3DTexture;if(R.isDepthTexture){const bi=w.get(R),Bn=w.get(X),Kn=w.get(bi.__renderTarget),yc=w.get(Bn.__renderTarget);Le.bindFramebuffer(F.READ_FRAMEBUFFER,Kn.__webglFramebuffer),Le.bindFramebuffer(F.DRAW_FRAMEBUFFER,yc.__webglFramebuffer);for(let sr=0;sr<Ce;sr++)Xt&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,w.get(R).__webglTexture,$,We+sr),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,w.get(X).__webglTexture,ye,nn+sr)),F.blitFramebuffer(Fe,Qe,Ee,Se,ft,kt,Ee,Se,F.DEPTH_BUFFER_BIT,F.NEAREST);Le.bindFramebuffer(F.READ_FRAMEBUFFER,null),Le.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if($!==0||R.isRenderTargetTexture||w.has(R)){const bi=w.get(R),Bn=w.get(X);Le.bindFramebuffer(F.READ_FRAMEBUFFER,kr),Le.bindFramebuffer(F.DRAW_FRAMEBUFFER,Br);for(let Kn=0;Kn<Ce;Kn++)Xt?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,bi.__webglTexture,$,We+Kn):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,bi.__webglTexture,$),Zn?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Bn.__webglTexture,ye,nn+Kn):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Bn.__webglTexture,ye),$!==0?F.blitFramebuffer(Fe,Qe,Ee,Se,ft,kt,Ee,Se,F.COLOR_BUFFER_BIT,F.NEAREST):Zn?F.copyTexSubImage3D(Lt,ye,ft,kt,nn+Kn,Fe,Qe,Ee,Se):F.copyTexSubImage2D(Lt,ye,ft,kt,Fe,Qe,Ee,Se);Le.bindFramebuffer(F.READ_FRAMEBUFFER,null),Le.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else Zn?R.isDataTexture||R.isData3DTexture?F.texSubImage3D(Lt,ye,ft,kt,nn,Ee,Se,Ce,Ht,Xe,sn.data):X.isCompressedArrayTexture?F.compressedTexSubImage3D(Lt,ye,ft,kt,nn,Ee,Se,Ce,Ht,sn.data):F.texSubImage3D(Lt,ye,ft,kt,nn,Ee,Se,Ce,Ht,Xe,sn):R.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,ye,ft,kt,Ee,Se,Ht,Xe,sn.data):R.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,ye,ft,kt,sn.width,sn.height,Ht,sn.data):F.texSubImage2D(F.TEXTURE_2D,ye,ft,kt,Ee,Se,Ht,Xe,sn);F.pixelStorei(F.UNPACK_ROW_LENGTH,At),F.pixelStorei(F.UNPACK_IMAGE_HEIGHT,oi),F.pixelStorei(F.UNPACK_SKIP_PIXELS,zr),F.pixelStorei(F.UNPACK_SKIP_ROWS,ai),F.pixelStorei(F.UNPACK_SKIP_IMAGES,jo),ye===0&&X.generateMipmaps&&F.generateMipmap(Lt),Le.unbindTexture()},this.initRenderTarget=function(R){w.get(R).__webglFramebuffer===void 0&&G.setupRenderTarget(R)},this.initTexture=function(R){R.isCubeTexture?G.setTextureCube(R,0):R.isData3DTexture?G.setTexture3D(R,0):R.isDataArrayTexture||R.isCompressedArrayTexture?G.setTexture2DArray(R,0):G.setTexture2D(R,0),Le.unbindTexture()},this.resetState=function(){L=0,k=0,H=null,Le.reset(),x.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ki}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=xt._getDrawingBufferColorSpace(e),t.unpackColorSpace=xt._getUnpackColorSpace()}}function xs(s){if(s===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return s}function Dm(s,e){s.prototype=Object.create(e.prototype),s.prototype.constructor=s,s.__proto__=e}var xi={autoSleep:120,force3D:"auto",nullTargetWarn:1,units:{lineHeight:""}},Do={duration:.5,overwrite:!1,delay:0},gd,Pn,qt,Ri=1e8,Wt=1/Ri,Su=Math.PI*2,mM=Su/4,gM=0,Nm=Math.sqrt,_M=Math.cos,xM=Math.sin,An=function(e){return typeof e=="string"},rn=function(e){return typeof e=="function"},Ps=function(e){return typeof e=="number"},_d=function(e){return typeof e>"u"},ls=function(e){return typeof e=="object"},ei=function(e){return e!==!1},xd=function(){return typeof window<"u"},_l=function(e){return rn(e)||An(e)},Um=typeof ArrayBuffer=="function"&&ArrayBuffer.isView||function(){},Fn=Array.isArray,yM=/random\([^)]+\)/g,vM=/,\s*/g,lp=/(?:-?\.?\d|\.)+/gi,Fm=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,ho=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,nh=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,Om=/[+-]=-?[.\d]+/,bM=/[^,'"\[\]\s]+/gi,SM=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,Kt,ji,Mu,yd,yi={},zl={},km,Bm=function(e){return(zl=No(e,yi))&&ri},vd=function(e,t){return console.warn("Invalid property",e,"set to",t,"Missing plugin? gsap.registerPlugin()")},Pa=function(e,t){return!t&&console.warn(e)},zm=function(e,t){return e&&(yi[e]=t)&&zl&&(zl[e]=t)||yi},Ia=function(){return 0},MM={suppressEvents:!0,isStart:!0,kill:!1},Cl={suppressEvents:!0,kill:!1},wM={suppressEvents:!0},bd={},Ys=[],wu={},Hm,ui={},ih={},cp=30,Pl=[],Sd="",Md=function(e){var t=e[0],n,i;if(ls(t)||rn(t)||(e=[e]),!(n=(t._gsap||{}).harness)){for(i=Pl.length;i--&&!Pl[i].targetTest(t););n=Pl[i]}for(i=e.length;i--;)e[i]&&(e[i]._gsap||(e[i]._gsap=new ug(e[i],n)))||e.splice(i,1);return e},Er=function(e){return e._gsap||Md(Ci(e))[0]._gsap},Vm=function(e,t,n){return(n=e[t])&&rn(n)?e[t]():_d(n)&&e.getAttribute&&e.getAttribute(t)||n},ti=function(e,t){return(e=e.split(",")).forEach(t)||e},an=function(e){return Math.round(e*1e5)/1e5||0},Zt=function(e){return Math.round(e*1e7)/1e7||0},_o=function(e,t){var n=t.charAt(0),i=parseFloat(t.substr(2));return e=parseFloat(e),n==="+"?e+i:n==="-"?e-i:n==="*"?e*i:e/i},EM=function(e,t){for(var n=t.length,i=0;e.indexOf(t[i])<0&&++i<n;);return i<n},Hl=function(){var e=Ys.length,t=Ys.slice(0),n,i;for(wu={},Ys.length=0,n=0;n<e;n++)i=t[n],i&&i._lazy&&(i.render(i._lazy[0],i._lazy[1],!0)._lazy=0)},wd=function(e){return!!(e._initted||e._startAt||e.add)},Gm=function(e,t,n,i){Ys.length&&!Pn&&Hl(),e.render(t,n,!!(Pn&&t<0&&wd(e))),Ys.length&&!Pn&&Hl()},Wm=function(e){var t=parseFloat(e);return(t||t===0)&&(e+"").match(bM).length<2?t:An(e)?e.trim():e},Xm=function(e){return e},vi=function(e,t){for(var n in t)n in e||(e[n]=t[n]);return e},TM=function(e){return function(t,n){for(var i in n)i in t||i==="duration"&&e||i==="ease"||(t[i]=n[i])}},No=function(e,t){for(var n in t)e[n]=t[n];return e},hp=function s(e,t){for(var n in t)n!=="__proto__"&&n!=="constructor"&&n!=="prototype"&&(e[n]=ls(t[n])?s(e[n]||(e[n]={}),t[n]):t[n]);return e},Vl=function(e,t){var n={},i;for(i in e)i in t||(n[i]=e[i]);return n},xa=function(e){var t=e.parent||Kt,n=e.keyframes?TM(Fn(e.keyframes)):vi;if(ei(e.inherit))for(;t;)n(e,t.vars.defaults),t=t.parent||t._dp;return e},AM=function(e,t){for(var n=e.length,i=n===t.length;i&&n--&&e[n]===t[n];);return n<0},jm=function(e,t,n,i,r){var o=e[i],a;if(r)for(a=t[r];o&&o[r]>a;)o=o._prev;return o?(t._next=o._next,o._next=t):(t._next=e[n],e[n]=t),t._next?t._next._prev=t:e[i]=t,t._prev=o,t.parent=t._dp=e,t},dc=function(e,t,n,i){n===void 0&&(n="_first"),i===void 0&&(i="_last");var r=t._prev,o=t._next;r?r._next=o:e[n]===t&&(e[n]=o),o?o._prev=r:e[i]===t&&(e[i]=r),t._next=t._prev=t.parent=null},Zs=function(e,t){e.parent&&(!t||e.parent.autoRemoveChildren)&&e.parent.remove&&e.parent.remove(e),e._act=0},Tr=function(e,t){if(e&&(!t||t._end>e._dur||t._start<0))for(var n=e;n;)n._dirty=1,n=n.parent;return e},RM=function(e){for(var t=e.parent;t&&t.parent;)t._dirty=1,t.totalDuration(),t=t.parent;return e},Eu=function(e,t,n,i){return e._startAt&&(Pn?e._startAt.revert(Cl):e.vars.immediateRender&&!e.vars.autoRevert||e._startAt.render(t,!0,i))},CM=function s(e){return!e||e._ts&&s(e.parent)},up=function(e){return e._repeat?Uo(e._tTime,e=e.duration()+e._rDelay)*e:0},Uo=function(e,t){var n=Math.floor(e=Zt(e/t));return e&&n===e?n-1:n},Gl=function(e,t){return(e-t._start)*t._ts+(t._ts>=0?0:t._dirty?t.totalDuration():t._tDur)},fc=function(e){return e._end=Zt(e._start+(e._tDur/Math.abs(e._ts||e._rts||Wt)||0))},pc=function(e,t){var n=e._dp;return n&&n.smoothChildTiming&&e._ts&&(e._start=Zt(n._time-(e._ts>0?t/e._ts:((e._dirty?e.totalDuration():e._tDur)-t)/-e._ts)),fc(e),n._dirty||Tr(n,e)),e},Ym=function(e,t){var n;if((t._time||!t._dur&&t._initted||t._start<e._time&&(t._dur||!t.add))&&(n=Gl(e.rawTime(),t),(!t._dur||Ha(0,t.totalDuration(),n)-t._tTime>Wt)&&t.render(n,!0)),Tr(e,t)._dp&&e._initted&&e._time>=e._dur&&e._ts){if(e._dur<e.duration())for(n=e;n._dp;)n.rawTime()>=0&&n.totalTime(n._tTime),n=n._dp;e._zTime=-Wt}},qi=function(e,t,n,i){return t.parent&&Zs(t),t._start=Zt((Ps(n)?n:n||e!==Kt?Mi(e,n,t):e._time)+t._delay),t._end=Zt(t._start+(t.totalDuration()/Math.abs(t.timeScale())||0)),jm(e,t,"_first","_last",e._sort?"_start":0),Tu(t)||(e._recent=t),i||Ym(e,t),e._ts<0&&pc(e,e._tTime),e},$m=function(e,t){return(yi.ScrollTrigger||vd("scrollTrigger",t))&&yi.ScrollTrigger.create(t,e)},qm=function(e,t,n,i,r){if(Td(e,t,r),!e._initted)return 1;if(!n&&e._pt&&!Pn&&(e._dur&&e.vars.lazy!==!1||!e._dur&&e.vars.lazy)&&Hm!==fi.frame)return Ys.push(e),e._lazy=[r,i],1},PM=function s(e){var t=e.parent;return t&&t._ts&&t._initted&&!t._lock&&(t.rawTime()<0||s(t))},Tu=function(e){var t=e.data;return t==="isFromStart"||t==="isStart"},IM=function(e,t,n,i){var r=e.ratio,o=t<0||!t&&(!e._start&&PM(e)&&!(!e._initted&&Tu(e))||(e._ts<0||e._dp._ts<0)&&!Tu(e))?0:1,a=e._rDelay,l=0,c,h,u;if(a&&e._repeat&&(l=Ha(0,e._tDur,t),h=Uo(l,a),e._yoyo&&h&1&&(o=1-o),h!==Uo(e._tTime,a)&&(r=1-o,e.vars.repeatRefresh&&e._initted&&e.invalidate())),o!==r||Pn||i||e._zTime===Wt||!t&&e._zTime){if(!e._initted&&qm(e,t,i,n,l))return;for(u=e._zTime,e._zTime=t||(n?Wt:0),n||(n=t&&!u),e.ratio=o,e._from&&(o=1-o),e._time=0,e._tTime=l,c=e._pt;c;)c.r(o,c.d),c=c._next;t<0&&Eu(e,t,n,!0),e._onUpdate&&!n&&mi(e,"onUpdate"),l&&e._repeat&&!n&&e.parent&&mi(e,"onRepeat"),(t>=e._tDur||t<0)&&e.ratio===o&&(o&&Zs(e,1),!n&&!Pn&&(mi(e,o?"onComplete":"onReverseComplete",!0),e._prom&&e._prom()))}else e._zTime||(e._zTime=t)},LM=function(e,t,n){var i;if(n>t)for(i=e._first;i&&i._start<=n;){if(i.data==="isPause"&&i._start>t)return i;i=i._next}else for(i=e._last;i&&i._start>=n;){if(i.data==="isPause"&&i._start<t)return i;i=i._prev}},Fo=function(e,t,n,i){var r=e._repeat,o=Zt(t)||0,a=e._tTime/e._tDur;return a&&!i&&(e._time*=o/e._dur),e._dur=o,e._tDur=r?r<0?1e10:Zt(o*(r+1)+e._rDelay*r):o,a>0&&!i&&pc(e,e._tTime=e._tDur*a),e.parent&&fc(e),n||Tr(e.parent,e),e},dp=function(e){return e instanceof Yn?Tr(e):Fo(e,e._dur)},DM={_start:0,endTime:Ia,totalDuration:Ia},Mi=function s(e,t,n){var i=e.labels,r=e._recent||DM,o=e.duration()>=Ri?r.endTime(!1):e._dur,a,l,c;return An(t)&&(isNaN(t)||t in i)?(l=t.charAt(0),c=t.substr(-1)==="%",a=t.indexOf("="),l==="<"||l===">"?(a>=0&&(t=t.replace(/=/,"")),(l==="<"?r._start:r.endTime(r._repeat>=0))+(parseFloat(t.substr(1))||0)*(c?(a<0?r:n).totalDuration()/100:1)):a<0?(t in i||(i[t]=o),i[t]):(l=parseFloat(t.charAt(a-1)+t.substr(a+1)),c&&n&&(l=l/100*(Fn(n)?n[0]:n).totalDuration()),a>1?s(e,t.substr(0,a-1),n)+l:o+l)):t==null?o:+t},ya=function(e,t,n){var i=Ps(t[1]),r=(i?2:1)+(e<2?0:1),o=t[r],a,l;if(i&&(o.duration=t[1]),o.parent=n,e){for(a=o,l=n;l&&!("immediateRender"in a);)a=l.vars.defaults||{},l=ei(l.vars.inherit)&&l.parent;o.immediateRender=ei(a.immediateRender),e<2?o.runBackwards=1:o.startAt=t[r-1]}return new dn(t[0],o,t[r+1])},nr=function(e,t){return e||e===0?t(e):t},Ha=function(e,t,n){return n<e?e:n>t?t:n},Un=function(e,t){return!An(e)||!(t=SM.exec(e))?"":t[1]},NM=function(e,t,n){return nr(n,function(i){return Ha(e,t,i)})},Au=[].slice,Zm=function(e,t){return e&&ls(e)&&"length"in e&&(!t&&!e.length||e.length-1 in e&&ls(e[0]))&&!e.nodeType&&e!==ji},UM=function(e,t,n){return n===void 0&&(n=[]),e.forEach(function(i){var r;return An(i)&&!t||Zm(i,1)?(r=n).push.apply(r,Ci(i)):n.push(i)})||n},Ci=function(e,t,n){return qt&&!t&&qt.selector?qt.selector(e):An(e)&&!n&&(Mu||!Oo())?Au.call((t||yd).querySelectorAll(e),0):Fn(e)?UM(e,n):Zm(e)?Au.call(e,0):e?[e]:[]},Ru=function(e){return e=Ci(e)[0]||Pa("Invalid scope")||{},function(t){var n=e.current||e.nativeElement||e;return Ci(t,n.querySelectorAll?n:n===e?Pa("Invalid scope")||yd.createElement("div"):e)}},Km=function(e){return e.sort(function(){return .5-Math.random()})},Qm=function(e){if(rn(e))return e;var t=ls(e)?e:{each:e},n=Ar(t.ease),i=t.from||0,r=parseFloat(t.base)||0,o={},a=i>0&&i<1,l=isNaN(i)||a,c=t.axis,h=i,u=i;return An(i)?h=u={center:.5,edges:.5,end:1}[i]||0:!a&&l&&(h=i[0],u=i[1]),function(d,f,g){var _=(g||t).length,m=o[_],p,y,b,v,M,E,A,P,S;if(!m){if(S=t.grid==="auto"?0:(t.grid||[1,Ri])[1],!S){for(A=-Ri;A<(A=g[S++].getBoundingClientRect().left)&&S<_;);S<_&&S--}for(m=o[_]=[],p=l?Math.min(S,_)*h-.5:i%S,y=S===Ri?0:l?_*u/S-.5:i/S|0,A=0,P=Ri,E=0;E<_;E++)b=E%S-p,v=y-(E/S|0),m[E]=M=c?Math.abs(c==="y"?v:b):Nm(b*b+v*v),M>A&&(A=M),M<P&&(P=M);i==="random"&&Km(m),m.max=A-P,m.min=P,m.v=_=(parseFloat(t.amount)||parseFloat(t.each)*(S>_?_-1:c?c==="y"?_/S:S:Math.max(S,_/S))||0)*(i==="edges"?-1:1),m.b=_<0?r-_:r,m.u=Un(t.amount||t.each)||0,n=n&&_<0?lg(n):n}return _=(m[d]-m.min)/m.max||0,Zt(m.b+(n?n(_):_)*m.v)+m.u}},Cu=function(e){var t=Math.pow(10,((e+"").split(".")[1]||"").length);return function(n){var i=Zt(Math.round(parseFloat(n)/e)*e*t);return(i-i%1)/t+(Ps(n)?0:Un(n))}},Jm=function(e,t){var n=Fn(e),i,r;return!n&&ls(e)&&(i=n=e.radius||Ri,e.values?(e=Ci(e.values),(r=!Ps(e[0]))&&(i*=i)):e=Cu(e.increment)),nr(t,n?rn(e)?function(o){return r=e(o),Math.abs(r-o)<=i?r:o}:function(o){for(var a=parseFloat(r?o.x:o),l=parseFloat(r?o.y:0),c=Ri,h=0,u=e.length,d,f;u--;)r?(d=e[u].x-a,f=e[u].y-l,d=d*d+f*f):d=Math.abs(e[u]-a),d<c&&(c=d,h=u);return h=!i||c<=i?e[h]:o,r||h===o||Ps(o)?h:h+Un(o)}:Cu(e))},eg=function(e,t,n,i){return nr(Fn(e)?!t:n===!0?!!(n=0):!i,function(){return Fn(e)?e[~~(Math.random()*e.length)]:(n=n||1e-5)&&(i=n<1?Math.pow(10,(n+"").length-2):1)&&Math.floor(Math.round((e-n/2+Math.random()*(t-e+n*.99))/n)*n*i)/i})},FM=function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];return function(i){return t.reduce(function(r,o){return o(r)},i)}},OM=function(e,t){return function(n){return e(parseFloat(n))+(t||Un(n))}},kM=function(e,t,n){return ng(e,t,0,1,n)},tg=function(e,t,n){return nr(n,function(i){return e[~~t(i)]})},BM=function s(e,t,n){var i=t-e;return Fn(e)?tg(e,s(0,e.length),t):nr(n,function(r){return(i+(r-e)%i)%i+e})},zM=function s(e,t,n){var i=t-e,r=i*2;return Fn(e)?tg(e,s(0,e.length-1),t):nr(n,function(o){return o=(r+(o-e)%r)%r||0,e+(o>i?r-o:o)})},La=function(e){return e.replace(yM,function(t){var n=t.indexOf("[")+1,i=t.substring(n||7,n?t.indexOf("]"):t.length-1).split(vM);return eg(n?i:+i[0],n?0:+i[1],+i[2]||1e-5)})},ng=function(e,t,n,i,r){var o=t-e,a=i-n;return nr(r,function(l){return n+((l-e)/o*a||0)})},HM=function s(e,t,n,i){var r=isNaN(e+t)?0:function(f){return(1-f)*e+f*t};if(!r){var o=An(e),a={},l,c,h,u,d;if(n===!0&&(i=1)&&(n=null),o)e={p:e},t={p:t};else if(Fn(e)&&!Fn(t)){for(h=[],u=e.length,d=u-2,c=1;c<u;c++)h.push(s(e[c-1],e[c]));u--,r=function(g){g*=u;var _=Math.min(d,~~g);return h[_](g-_)},n=t}else i||(e=No(Fn(e)?[]:{},e));if(!h){for(l in t)Ed.call(a,e,l,"get",t[l]);r=function(g){return Cd(g,a)||(o?e.p:e)}}}return nr(n,r)},fp=function(e,t,n){var i=e.labels,r=Ri,o,a,l;for(o in i)a=i[o]-t,a<0==!!n&&a&&r>(a=Math.abs(a))&&(l=o,r=a);return l},mi=function(e,t,n){var i=e.vars,r=i[t],o=qt,a=e._ctx,l,c,h;if(r)return l=i[t+"Params"],c=i.callbackScope||e,n&&Ys.length&&Hl(),a&&(qt=a),h=l?r.apply(c,l):r.call(c),qt=o,h},la=function(e){return Zs(e),e.scrollTrigger&&e.scrollTrigger.kill(!!Pn),e.progress()<1&&mi(e,"onInterrupt"),e},uo,ig=[],sg=function(e){if(e)if(e=!e.name&&e.default||e,xd()||e.headless){var t=e.name,n=rn(e),i=t&&!n&&e.init?function(){this._props=[]}:e,r={init:Ia,render:Cd,add:Ed,kill:iw,modifier:nw,rawVars:0},o={targetTest:0,get:0,getSetter:Rd,aliases:{},register:0};if(Oo(),e!==i){if(ui[t])return;vi(i,vi(Vl(e,r),o)),No(i.prototype,No(r,Vl(e,o))),ui[i.prop=t]=i,e.targetTest&&(Pl.push(i),bd[t]=1),t=(t==="css"?"CSS":t.charAt(0).toUpperCase()+t.substr(1))+"Plugin"}zm(t,i),e.register&&e.register(ri,i,ni)}else ig.push(e)},Gt=255,ca={aqua:[0,Gt,Gt],lime:[0,Gt,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,Gt],navy:[0,0,128],white:[Gt,Gt,Gt],olive:[128,128,0],yellow:[Gt,Gt,0],orange:[Gt,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[Gt,0,0],pink:[Gt,192,203],cyan:[0,Gt,Gt],transparent:[Gt,Gt,Gt,0]},sh=function(e,t,n){return e+=e<0?1:e>1?-1:0,(e*6<1?t+(n-t)*e*6:e<.5?n:e*3<2?t+(n-t)*(2/3-e)*6:t)*Gt+.5|0},rg=function(e,t,n){var i=e?Ps(e)?[e>>16,e>>8&Gt,e&Gt]:0:ca.black,r,o,a,l,c,h,u,d,f,g;if(!i){if(e.substr(-1)===","&&(e=e.substr(0,e.length-1)),ca[e])i=ca[e];else if(e.charAt(0)==="#"){if(e.length<6&&(r=e.charAt(1),o=e.charAt(2),a=e.charAt(3),e="#"+r+r+o+o+a+a+(e.length===5?e.charAt(4)+e.charAt(4):"")),e.length===9)return i=parseInt(e.substr(1,6),16),[i>>16,i>>8&Gt,i&Gt,parseInt(e.substr(7),16)/255];e=parseInt(e.substr(1),16),i=[e>>16,e>>8&Gt,e&Gt]}else if(e.substr(0,3)==="hsl"){if(i=g=e.match(lp),!t)l=+i[0]%360/360,c=+i[1]/100,h=+i[2]/100,o=h<=.5?h*(c+1):h+c-h*c,r=h*2-o,i.length>3&&(i[3]*=1),i[0]=sh(l+1/3,r,o),i[1]=sh(l,r,o),i[2]=sh(l-1/3,r,o);else if(~e.indexOf("="))return i=e.match(Fm),n&&i.length<4&&(i[3]=1),i}else i=e.match(lp)||ca.transparent;i=i.map(Number)}return t&&!g&&(r=i[0]/Gt,o=i[1]/Gt,a=i[2]/Gt,u=Math.max(r,o,a),d=Math.min(r,o,a),h=(u+d)/2,u===d?l=c=0:(f=u-d,c=h>.5?f/(2-u-d):f/(u+d),l=u===r?(o-a)/f+(o<a?6:0):u===o?(a-r)/f+2:(r-o)/f+4,l*=60),i[0]=~~(l+.5),i[1]=~~(c*100+.5),i[2]=~~(h*100+.5)),n&&i.length<4&&(i[3]=1),i},og=function(e){var t=[],n=[],i=-1;return e.split($s).forEach(function(r){var o=r.match(ho)||[];t.push.apply(t,o),n.push(i+=o.length+1)}),t.c=n,t},pp=function(e,t,n){var i="",r=(e+i).match($s),o=t?"hsla(":"rgba(",a=0,l,c,h,u;if(!r)return e;if(r=r.map(function(d){return(d=rg(d,t,1))&&o+(t?d[0]+","+d[1]+"%,"+d[2]+"%,"+d[3]:d.join(","))+")"}),n&&(h=og(e),l=n.c,l.join(i)!==h.c.join(i)))for(c=e.replace($s,"1").split(ho),u=c.length-1;a<u;a++)i+=c[a]+(~l.indexOf(a)?r.shift()||o+"0,0,0,0)":(h.length?h:r.length?r:n).shift());if(!c)for(c=e.split($s),u=c.length-1;a<u;a++)i+=c[a]+r[a];return i+c[u]},$s=(function(){var s="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",e;for(e in ca)s+="|"+e+"\\b";return new RegExp(s+")","gi")})(),VM=/hsl[a]?\(/,ag=function(e){var t=e.join(" "),n;if($s.lastIndex=0,$s.test(t))return n=VM.test(t),e[1]=pp(e[1],n),e[0]=pp(e[0],n,og(e[1])),!0},Da,fi=(function(){var s=Date.now,e=500,t=33,n=s(),i=n,r=1e3/240,o=r,a=[],l,c,h,u,d,f,g=function _(m){var p=s()-i,y=m===!0,b,v,M,E;if((p>e||p<0)&&(n+=p-t),i+=p,M=i-n,b=M-o,(b>0||y)&&(E=++u.frame,d=M-u.time*1e3,u.time=M=M/1e3,o+=b+(b>=r?4:r-b),v=1),y||(l=c(_)),v)for(f=0;f<a.length;f++)a[f](M,d,E,m)};return u={time:0,frame:0,tick:function(){g(!0)},deltaRatio:function(m){return d/(1e3/(m||60))},wake:function(){km&&(!Mu&&xd()&&(ji=Mu=window,yd=ji.document||{},yi.gsap=ri,(ji.gsapVersions||(ji.gsapVersions=[])).push(ri.version),Bm(zl||ji.GreenSockGlobals||!ji.gsap&&ji||{}),ig.forEach(sg)),h=typeof requestAnimationFrame<"u"&&requestAnimationFrame,l&&u.sleep(),c=h||function(m){return setTimeout(m,o-u.time*1e3+1|0)},Da=1,g(2))},sleep:function(){(h?cancelAnimationFrame:clearTimeout)(l),Da=0,c=Ia},lagSmoothing:function(m,p){e=m||1/0,t=Math.min(p||33,e)},fps:function(m){r=1e3/(m||240),o=u.time*1e3+r},add:function(m,p,y){var b=p?function(v,M,E,A){m(v,M,E,A),u.remove(b)}:m;return u.remove(m),a[y?"unshift":"push"](b),Oo(),b},remove:function(m,p){~(p=a.indexOf(m))&&a.splice(p,1)&&f>=p&&f--},_listeners:a},u})(),Oo=function(){return!Da&&fi.wake()},St={},GM=/^[\d.\-M][\d.\-,\s]/,WM=/["']/g,XM=function(e){for(var t={},n=e.substr(1,e.length-3).split(":"),i=n[0],r=1,o=n.length,a,l,c;r<o;r++)l=n[r],a=r!==o-1?l.lastIndexOf(","):l.length,c=l.substr(0,a),t[i]=isNaN(c)?c.replace(WM,"").trim():+c,i=l.substr(a+1).trim();return t},jM=function(e){var t=e.indexOf("(")+1,n=e.indexOf(")"),i=e.indexOf("(",t);return e.substring(t,~i&&i<n?e.indexOf(")",n+1):n)},YM=function(e){var t=(e+"").split("("),n=St[t[0]];return n&&t.length>1&&n.config?n.config.apply(null,~e.indexOf("{")?[XM(t[1])]:jM(e).split(",").map(Wm)):St._CE&&GM.test(e)?St._CE("",e):n},lg=function(e){return function(t){return 1-e(1-t)}},cg=function s(e,t){for(var n=e._first,i;n;)n instanceof Yn?s(n,t):n.vars.yoyoEase&&(!n._yoyo||!n._repeat)&&n._yoyo!==t&&(n.timeline?s(n.timeline,t):(i=n._ease,n._ease=n._yEase,n._yEase=i,n._yoyo=t)),n=n._next},Ar=function(e,t){return e&&(rn(e)?e:St[e]||YM(e))||t},Ur=function(e,t,n,i){n===void 0&&(n=function(l){return 1-t(1-l)}),i===void 0&&(i=function(l){return l<.5?t(l*2)/2:1-t((1-l)*2)/2});var r={easeIn:t,easeOut:n,easeInOut:i},o;return ti(e,function(a){St[a]=yi[a]=r,St[o=a.toLowerCase()]=n;for(var l in r)St[o+(l==="easeIn"?".in":l==="easeOut"?".out":".inOut")]=St[a+"."+l]=r[l]}),r},hg=function(e){return function(t){return t<.5?(1-e(1-t*2))/2:.5+e((t-.5)*2)/2}},rh=function s(e,t,n){var i=t>=1?t:1,r=(n||(e?.3:.45))/(t<1?t:1),o=r/Su*(Math.asin(1/i)||0),a=function(h){return h===1?1:i*Math.pow(2,-10*h)*xM((h-o)*r)+1},l=e==="out"?a:e==="in"?function(c){return 1-a(1-c)}:hg(a);return r=Su/r,l.config=function(c,h){return s(e,c,h)},l},oh=function s(e,t){t===void 0&&(t=1.70158);var n=function(o){return o?--o*o*((t+1)*o+t)+1:0},i=e==="out"?n:e==="in"?function(r){return 1-n(1-r)}:hg(n);return i.config=function(r){return s(e,r)},i};ti("Linear,Quad,Cubic,Quart,Quint,Strong",function(s,e){var t=e<5?e+1:e;Ur(s+",Power"+(t-1),e?function(n){return Math.pow(n,t)}:function(n){return n},function(n){return 1-Math.pow(1-n,t)},function(n){return n<.5?Math.pow(n*2,t)/2:1-Math.pow((1-n)*2,t)/2})});St.Linear.easeNone=St.none=St.Linear.easeIn;Ur("Elastic",rh("in"),rh("out"),rh());(function(s,e){var t=1/e,n=2*t,i=2.5*t,r=function(a){return a<t?s*a*a:a<n?s*Math.pow(a-1.5/e,2)+.75:a<i?s*(a-=2.25/e)*a+.9375:s*Math.pow(a-2.625/e,2)+.984375};Ur("Bounce",function(o){return 1-r(1-o)},r)})(7.5625,2.75);Ur("Expo",function(s){return Math.pow(2,10*(s-1))*s+s*s*s*s*s*s*(1-s)});Ur("Circ",function(s){return-(Nm(1-s*s)-1)});Ur("Sine",function(s){return s===1?1:-_M(s*mM)+1});Ur("Back",oh("in"),oh("out"),oh());St.SteppedEase=St.steps=yi.SteppedEase={config:function(e,t){e===void 0&&(e=1);var n=1/e,i=e+(t?0:1),r=t?1:0,o=1-Wt;return function(a){return((i*Ha(0,o,a)|0)+r)*n}}};Do.ease=St["quad.out"];ti("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",function(s){return Sd+=s+","+s+"Params,"});var ug=function(e,t){this.id=gM++,e._gsap=this,this.target=e,this.harness=t,this.get=t?t.get:Vm,this.set=t?t.getSetter:Rd},Na=(function(){function s(t){this.vars=t,this._delay=+t.delay||0,(this._repeat=t.repeat===1/0?-2:t.repeat||0)&&(this._rDelay=t.repeatDelay||0,this._yoyo=!!t.yoyo||!!t.yoyoEase),this._ts=1,Fo(this,+t.duration,1,1),this.data=t.data,qt&&(this._ctx=qt,qt.data.push(this)),Da||fi.wake()}var e=s.prototype;return e.delay=function(n){return n||n===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+n-this._delay),this._delay=n,this):this._delay},e.duration=function(n){return arguments.length?this.totalDuration(this._repeat>0?n+(n+this._rDelay)*this._repeat:n):this.totalDuration()&&this._dur},e.totalDuration=function(n){return arguments.length?(this._dirty=0,Fo(this,this._repeat<0?n:(n-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},e.totalTime=function(n,i){if(Oo(),!arguments.length)return this._tTime;var r=this._dp;if(r&&r.smoothChildTiming&&this._ts){for(pc(this,n),!r._dp||r.parent||Ym(r,this);r&&r.parent;)r.parent._time!==r._start+(r._ts>=0?r._tTime/r._ts:(r.totalDuration()-r._tTime)/-r._ts)&&r.totalTime(r._tTime,!0),r=r.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&n<this._tDur||this._ts<0&&n>0||!this._tDur&&!n)&&qi(this._dp,this,this._start-this._delay)}return(this._tTime!==n||!this._dur&&!i||this._initted&&Math.abs(this._zTime)===Wt||!this._initted&&this._dur&&n||!n&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=n),Gm(this,n,i)),this},e.time=function(n,i){return arguments.length?this.totalTime(Math.min(this.totalDuration(),n+up(this))%(this._dur+this._rDelay)||(n?this._dur:0),i):this._time},e.totalProgress=function(n,i){return arguments.length?this.totalTime(this.totalDuration()*n,i):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>=0&&this._initted?1:0},e.progress=function(n,i){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-n:n)+up(this),i):this.duration()?Math.min(1,this._time/this._dur):this.rawTime()>0?1:0},e.iteration=function(n,i){var r=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(n-1)*r,i):this._repeat?Uo(this._tTime,r)+1:1},e.timeScale=function(n,i){if(!arguments.length)return this._rts===-Wt?0:this._rts;if(this._rts===n)return this;var r=this.parent&&this._ts?Gl(this.parent._time,this):this._tTime;return this._rts=+n||0,this._ts=this._ps||n===-Wt?0:this._rts,this.totalTime(Ha(-Math.abs(this._delay),this.totalDuration(),r),i!==!1),fc(this),RM(this)},e.paused=function(n){return arguments.length?(this._ps!==n&&(this._ps=n,n?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(Oo(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,this.progress()===1&&Math.abs(this._zTime)!==Wt&&(this._tTime-=Wt)))),this):this._ps},e.startTime=function(n){if(arguments.length){this._start=Zt(n);var i=this.parent||this._dp;return i&&(i._sort||!this.parent)&&qi(i,this,this._start-this._delay),this}return this._start},e.endTime=function(n){return this._start+(ei(n)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},e.rawTime=function(n){var i=this.parent||this._dp;return i?n&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?Gl(i.rawTime(n),this):this._tTime:this._tTime},e.revert=function(n){n===void 0&&(n=wM);var i=Pn;return Pn=n,wd(this)&&(this.timeline&&this.timeline.revert(n),this.totalTime(-.01,n.suppressEvents)),this.data!=="nested"&&n.kill!==!1&&this.kill(),Pn=i,this},e.globalTime=function(n){for(var i=this,r=arguments.length?n:i.rawTime();i;)r=i._start+r/(Math.abs(i._ts)||1),i=i._dp;return!this.parent&&this._sat?this._sat.globalTime(n):r},e.repeat=function(n){return arguments.length?(this._repeat=n===1/0?-2:n,dp(this)):this._repeat===-2?1/0:this._repeat},e.repeatDelay=function(n){if(arguments.length){var i=this._time;return this._rDelay=n,dp(this),i?this.time(i):this}return this._rDelay},e.yoyo=function(n){return arguments.length?(this._yoyo=n,this):this._yoyo},e.seek=function(n,i){return this.totalTime(Mi(this,n),ei(i))},e.restart=function(n,i){return this.play().totalTime(n?-this._delay:0,ei(i)),this._dur||(this._zTime=-Wt),this},e.play=function(n,i){return n!=null&&this.seek(n,i),this.reversed(!1).paused(!1)},e.reverse=function(n,i){return n!=null&&this.seek(n||this.totalDuration(),i),this.reversed(!0).paused(!1)},e.pause=function(n,i){return n!=null&&this.seek(n,i),this.paused(!0)},e.resume=function(){return this.paused(!1)},e.reversed=function(n){return arguments.length?(!!n!==this.reversed()&&this.timeScale(-this._rts||(n?-Wt:0)),this):this._rts<0},e.invalidate=function(){return this._initted=this._act=0,this._zTime=-Wt,this},e.isActive=function(){var n=this.parent||this._dp,i=this._start,r;return!!(!n||this._ts&&this._initted&&n.isActive()&&(r=n.rawTime(!0))>=i&&r<this.endTime(!0)-Wt)},e.eventCallback=function(n,i,r){var o=this.vars;return arguments.length>1?(i?(o[n]=i,r&&(o[n+"Params"]=r),n==="onUpdate"&&(this._onUpdate=i)):delete o[n],this):o[n]},e.then=function(n){var i=this,r=i._prom;return new Promise(function(o){var a=rn(n)?n:Xm,l=function(){var h=i.then;i.then=null,r&&r(),rn(a)&&(a=a(i))&&(a.then||a===i)&&(i.then=h),o(a),i.then=h};i._initted&&i.totalProgress()===1&&i._ts>=0||!i._tTime&&i._ts<0?l():i._prom=l})},e.kill=function(){la(this)},s})();vi(Na.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-Wt,_prom:0,_ps:!1,_rts:1});var Yn=(function(s){Dm(e,s);function e(n,i){var r;return n===void 0&&(n={}),r=s.call(this,n)||this,r.labels={},r.smoothChildTiming=!!n.smoothChildTiming,r.autoRemoveChildren=!!n.autoRemoveChildren,r._sort=ei(n.sortChildren),Kt&&qi(n.parent||Kt,xs(r),i),n.reversed&&r.reverse(),n.paused&&r.paused(!0),n.scrollTrigger&&$m(xs(r),n.scrollTrigger),r}var t=e.prototype;return t.to=function(i,r,o){return ya(0,arguments,this),this},t.from=function(i,r,o){return ya(1,arguments,this),this},t.fromTo=function(i,r,o,a){return ya(2,arguments,this),this},t.set=function(i,r,o){return r.duration=0,r.parent=this,xa(r).repeatDelay||(r.repeat=0),r.immediateRender=!!r.immediateRender,new dn(i,r,Mi(this,o),1),this},t.call=function(i,r,o){return qi(this,dn.delayedCall(0,i,r),o)},t.staggerTo=function(i,r,o,a,l,c,h){return o.duration=r,o.stagger=o.stagger||a,o.onComplete=c,o.onCompleteParams=h,o.parent=this,new dn(i,o,Mi(this,l)),this},t.staggerFrom=function(i,r,o,a,l,c,h){return o.runBackwards=1,xa(o).immediateRender=ei(o.immediateRender),this.staggerTo(i,r,o,a,l,c,h)},t.staggerFromTo=function(i,r,o,a,l,c,h,u){return a.startAt=o,xa(a).immediateRender=ei(a.immediateRender),this.staggerTo(i,r,a,l,c,h,u)},t.render=function(i,r,o){var a=this._time,l=this._dirty?this.totalDuration():this._tDur,c=this._dur,h=i<=0?0:Zt(i),u=this._zTime<0!=i<0&&(this._initted||!c),d,f,g,_,m,p,y,b,v,M,E,A;if(this!==Kt&&h>l&&i>=0&&(h=l),h!==this._tTime||o||u){if(a!==this._time&&c&&(h+=this._time-a,i+=this._time-a),d=h,v=this._start,b=this._ts,p=!b,u&&(c||(a=this._zTime),(i||!r)&&(this._zTime=i)),this._repeat){if(E=this._yoyo,m=c+this._rDelay,this._repeat<-1&&i<0)return this.totalTime(m*100+i,r,o);if(d=Zt(h%m),h===l?(_=this._repeat,d=c):(M=Zt(h/m),_=~~M,_&&_===M&&(d=c,_--),d>c&&(d=c)),M=Uo(this._tTime,m),!a&&this._tTime&&M!==_&&this._tTime-M*m-this._dur<=0&&(M=_),E&&_&1&&(d=c-d,A=1),_!==M&&!this._lock){var P=E&&M&1,S=P===(E&&_&1);if(_<M&&(P=!P),a=P?0:h%c?c:h,this._lock=1,this.render(a||(A?0:Zt(_*m)),r,!c)._lock=0,this._tTime=h,!r&&this.parent&&mi(this,"onRepeat"),this.vars.repeatRefresh&&!A&&(this.invalidate()._lock=1,M=_),a&&a!==this._time||p!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act)return this;if(c=this._dur,l=this._tDur,S&&(this._lock=2,a=P?c:-1e-4,this.render(a,!0),this.vars.repeatRefresh&&!A&&this.invalidate()),this._lock=0,!this._ts&&!p)return this;cg(this,A)}}if(this._hasPause&&!this._forcing&&this._lock<2&&(y=LM(this,Zt(a),Zt(d)),y&&(h-=d-(d=y._start))),this._tTime=h,this._time=d,this._act=!b,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=i,a=0),!a&&h&&c&&!r&&!M&&(mi(this,"onStart"),this._tTime!==h))return this;if(d>=a&&i>=0)for(f=this._first;f;){if(g=f._next,(f._act||d>=f._start)&&f._ts&&y!==f){if(f.parent!==this)return this.render(i,r,o);if(f.render(f._ts>0?(d-f._start)*f._ts:(f._dirty?f.totalDuration():f._tDur)+(d-f._start)*f._ts,r,o),d!==this._time||!this._ts&&!p){y=0,g&&(h+=this._zTime=-Wt);break}}f=g}else{f=this._last;for(var T=i<0?i:d;f;){if(g=f._prev,(f._act||T<=f._end)&&f._ts&&y!==f){if(f.parent!==this)return this.render(i,r,o);if(f.render(f._ts>0?(T-f._start)*f._ts:(f._dirty?f.totalDuration():f._tDur)+(T-f._start)*f._ts,r,o||Pn&&wd(f)),d!==this._time||!this._ts&&!p){y=0,g&&(h+=this._zTime=T?-Wt:Wt);break}}f=g}}if(y&&!r&&(this.pause(),y.render(d>=a?0:-Wt)._zTime=d>=a?1:-1,this._ts))return this._start=v,fc(this),this.render(i,r,o);this._onUpdate&&!r&&mi(this,"onUpdate",!0),(h===l&&this._tTime>=this.totalDuration()||!h&&a)&&(v===this._start||Math.abs(b)!==Math.abs(this._ts))&&(this._lock||((i||!c)&&(h===l&&this._ts>0||!h&&this._ts<0)&&Zs(this,1),!r&&!(i<0&&!a)&&(h||a||!l)&&(mi(this,h===l&&i>=0?"onComplete":"onReverseComplete",!0),this._prom&&!(h<l&&this.timeScale()>0)&&this._prom())))}return this},t.add=function(i,r){var o=this;if(Ps(r)||(r=Mi(this,r,i)),!(i instanceof Na)){if(Fn(i))return i.forEach(function(a){return o.add(a,r)}),this;if(An(i))return this.addLabel(i,r);if(rn(i))i=dn.delayedCall(0,i);else return this}return this!==i?qi(this,i,r):this},t.getChildren=function(i,r,o,a){i===void 0&&(i=!0),r===void 0&&(r=!0),o===void 0&&(o=!0),a===void 0&&(a=-Ri);for(var l=[],c=this._first;c;)c._start>=a&&(c instanceof dn?r&&l.push(c):(o&&l.push(c),i&&l.push.apply(l,c.getChildren(!0,r,o)))),c=c._next;return l},t.getById=function(i){for(var r=this.getChildren(1,1,1),o=r.length;o--;)if(r[o].vars.id===i)return r[o]},t.remove=function(i){return An(i)?this.removeLabel(i):rn(i)?this.killTweensOf(i):(i.parent===this&&dc(this,i),i===this._recent&&(this._recent=this._last),Tr(this))},t.totalTime=function(i,r){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=Zt(fi.time-(this._ts>0?i/this._ts:(this.totalDuration()-i)/-this._ts))),s.prototype.totalTime.call(this,i,r),this._forcing=0,this):this._tTime},t.addLabel=function(i,r){return this.labels[i]=Mi(this,r),this},t.removeLabel=function(i){return delete this.labels[i],this},t.addPause=function(i,r,o){var a=dn.delayedCall(0,r||Ia,o);return a.data="isPause",this._hasPause=1,qi(this,a,Mi(this,i))},t.removePause=function(i){var r=this._first;for(i=Mi(this,i);r;)r._start===i&&r.data==="isPause"&&Zs(r),r=r._next},t.killTweensOf=function(i,r,o){for(var a=this.getTweensOf(i,o),l=a.length;l--;)Ws!==a[l]&&a[l].kill(i,r);return this},t.getTweensOf=function(i,r){for(var o=[],a=Ci(i),l=this._first,c=Ps(r),h;l;)l instanceof dn?EM(l._targets,a)&&(c?(!Ws||l._initted&&l._ts)&&l.globalTime(0)<=r&&l.globalTime(l.totalDuration())>r:!r||l.isActive())&&o.push(l):(h=l.getTweensOf(a,r)).length&&o.push.apply(o,h),l=l._next;return o},t.tweenTo=function(i,r){r=r||{};var o=this,a=Mi(o,i),l=r,c=l.startAt,h=l.onStart,u=l.onStartParams,d=l.immediateRender,f,g=dn.to(o,vi({ease:r.ease||"none",lazy:!1,immediateRender:!1,time:a,overwrite:"auto",duration:r.duration||Math.abs((a-(c&&"time"in c?c.time:o._time))/o.timeScale())||Wt,onStart:function(){if(o.pause(),!f){var m=r.duration||Math.abs((a-(c&&"time"in c?c.time:o._time))/o.timeScale());g._dur!==m&&Fo(g,m,0,1).render(g._time,!0,!0),f=1}h&&h.apply(g,u||[])}},r));return d?g.render(0):g},t.tweenFromTo=function(i,r,o){return this.tweenTo(r,vi({startAt:{time:Mi(this,i)}},o))},t.recent=function(){return this._recent},t.nextLabel=function(i){return i===void 0&&(i=this._time),fp(this,Mi(this,i))},t.previousLabel=function(i){return i===void 0&&(i=this._time),fp(this,Mi(this,i),1)},t.currentLabel=function(i){return arguments.length?this.seek(i,!0):this.previousLabel(this._time+Wt)},t.shiftChildren=function(i,r,o){o===void 0&&(o=0);var a=this._first,l=this.labels,c;for(i=Zt(i);a;)a._start>=o&&(a._start+=i,a._end+=i),a=a._next;if(r)for(c in l)l[c]>=o&&(l[c]+=i);return Tr(this)},t.invalidate=function(i){var r=this._first;for(this._lock=0;r;)r.invalidate(i),r=r._next;return s.prototype.invalidate.call(this,i)},t.clear=function(i){i===void 0&&(i=!0);for(var r=this._first,o;r;)o=r._next,this.remove(r),r=o;return this._dp&&(this._time=this._tTime=this._pTime=0),i&&(this.labels={}),Tr(this)},t.totalDuration=function(i){var r=0,o=this,a=o._last,l=Ri,c,h,u;if(arguments.length)return o.timeScale((o._repeat<0?o.duration():o.totalDuration())/(o.reversed()?-i:i));if(o._dirty){for(u=o.parent;a;)c=a._prev,a._dirty&&a.totalDuration(),h=a._start,h>l&&o._sort&&a._ts&&!o._lock?(o._lock=1,qi(o,a,h-a._delay,1)._lock=0):l=h,h<0&&a._ts&&(r-=h,(!u&&!o._dp||u&&u.smoothChildTiming)&&(o._start+=Zt(h/o._ts),o._time-=h,o._tTime-=h),o.shiftChildren(-h,!1,-1/0),l=0),a._end>r&&a._ts&&(r=a._end),a=c;Fo(o,o===Kt&&o._time>r?o._time:r,1,1),o._dirty=0}return o._tDur},e.updateRoot=function(i){if(Kt._ts&&(Gm(Kt,Gl(i,Kt)),Hm=fi.frame),fi.frame>=cp){cp+=xi.autoSleep||120;var r=Kt._first;if((!r||!r._ts)&&xi.autoSleep&&fi._listeners.length<2){for(;r&&!r._ts;)r=r._next;r||fi.sleep()}}},e})(Na);vi(Yn.prototype,{_lock:0,_hasPause:0,_forcing:0});var $M=function(e,t,n,i,r,o,a){var l=new ni(this._pt,e,t,0,1,_g,null,r),c=0,h=0,u,d,f,g,_,m,p,y;for(l.b=n,l.e=i,n+="",i+="",(p=~i.indexOf("random("))&&(i=La(i)),o&&(y=[n,i],o(y,e,t),n=y[0],i=y[1]),d=n.match(nh)||[];u=nh.exec(i);)g=u[0],_=i.substring(c,u.index),f?f=(f+1)%5:_.substr(-5)==="rgba("&&(f=1),g!==d[h++]&&(m=parseFloat(d[h-1])||0,l._pt={_next:l._pt,p:_||h===1?_:",",s:m,c:g.charAt(1)==="="?_o(m,g)-m:parseFloat(g)-m,m:f&&f<4?Math.round:0},c=nh.lastIndex);return l.c=c<i.length?i.substring(c,i.length):"",l.fp=a,(Om.test(i)||p)&&(l.e=0),this._pt=l,l},Ed=function(e,t,n,i,r,o,a,l,c,h){rn(i)&&(i=i(r||0,e,o));var u=e[t],d=n!=="get"?n:rn(u)?c?e[t.indexOf("set")||!rn(e["get"+t.substr(3)])?t:"get"+t.substr(3)](c):e[t]():u,f=rn(u)?c?JM:mg:Ad,g;if(An(i)&&(~i.indexOf("random(")&&(i=La(i)),i.charAt(1)==="="&&(g=_o(d,i)+(Un(d)||0),(g||g===0)&&(i=g))),!h||d!==i||Pu)return!isNaN(d*i)&&i!==""?(g=new ni(this._pt,e,t,+d||0,i-(d||0),typeof u=="boolean"?tw:gg,0,f),c&&(g.fp=c),a&&g.modifier(a,this,e),this._pt=g):(!u&&!(t in e)&&vd(t,i),$M.call(this,e,t,d,i,f,l||xi.stringFilter,c))},qM=function(e,t,n,i,r){if(rn(e)&&(e=va(e,r,t,n,i)),!ls(e)||e.style&&e.nodeType||Fn(e)||Um(e))return An(e)?va(e,r,t,n,i):e;var o={},a;for(a in e)o[a]=va(e[a],r,t,n,i);return o},dg=function(e,t,n,i,r,o){var a,l,c,h;if(ui[e]&&(a=new ui[e]).init(r,a.rawVars?t[e]:qM(t[e],i,r,o,n),n,i,o)!==!1&&(n._pt=l=new ni(n._pt,r,e,0,1,a.render,a,0,a.priority),n!==uo))for(c=n._ptLookup[n._targets.indexOf(r)],h=a._props.length;h--;)c[a._props[h]]=l;return a},Ws,Pu,Td=function s(e,t,n){var i=e.vars,r=i.ease,o=i.startAt,a=i.immediateRender,l=i.lazy,c=i.onUpdate,h=i.runBackwards,u=i.yoyoEase,d=i.keyframes,f=i.autoRevert,g=e._dur,_=e._startAt,m=e._targets,p=e.parent,y=p&&p.data==="nested"?p.vars.targets:m,b=e._overwrite==="auto"&&!gd,v=e.timeline,M,E,A,P,S,T,L,k,H,Y,W,j,V;if(v&&(!d||!r)&&(r="none"),e._ease=Ar(r,Do.ease),e._yEase=u?lg(Ar(u===!0?r:u,Do.ease)):0,u&&e._yoyo&&!e._repeat&&(u=e._yEase,e._yEase=e._ease,e._ease=u),e._from=!v&&!!i.runBackwards,!v||d&&!i.stagger){if(k=m[0]?Er(m[0]).harness:0,j=k&&i[k.prop],M=Vl(i,bd),_&&(_._zTime<0&&_.progress(1),t<0&&h&&a&&!f?_.render(-1,!0):_.revert(h&&g?Cl:MM),_._lazy=0),o){if(Zs(e._startAt=dn.set(m,vi({data:"isStart",overwrite:!1,parent:p,immediateRender:!0,lazy:!_&&ei(l),startAt:null,delay:0,onUpdate:c&&function(){return mi(e,"onUpdate")},stagger:0},o))),e._startAt._dp=0,e._startAt._sat=e,t<0&&(Pn||!a&&!f)&&e._startAt.revert(Cl),a&&g&&t<=0&&n<=0){t&&(e._zTime=t);return}}else if(h&&g&&!_){if(t&&(a=!1),A=vi({overwrite:!1,data:"isFromStart",lazy:a&&!_&&ei(l),immediateRender:a,stagger:0,parent:p},M),j&&(A[k.prop]=j),Zs(e._startAt=dn.set(m,A)),e._startAt._dp=0,e._startAt._sat=e,t<0&&(Pn?e._startAt.revert(Cl):e._startAt.render(-1,!0)),e._zTime=t,!a)s(e._startAt,Wt,Wt);else if(!t)return}for(e._pt=e._ptCache=0,l=g&&ei(l)||l&&!g,E=0;E<m.length;E++){if(S=m[E],L=S._gsap||Md(m)[E]._gsap,e._ptLookup[E]=Y={},wu[L.id]&&Ys.length&&Hl(),W=y===m?E:y.indexOf(S),k&&(H=new k).init(S,j||M,e,W,y)!==!1&&(e._pt=P=new ni(e._pt,S,H.name,0,1,H.render,H,0,H.priority),H._props.forEach(function(q){Y[q]=P}),H.priority&&(T=1)),!k||j)for(A in M)ui[A]&&(H=dg(A,M,e,W,S,y))?H.priority&&(T=1):Y[A]=P=Ed.call(e,S,A,"get",M[A],W,y,0,i.stringFilter);e._op&&e._op[E]&&e.kill(S,e._op[E]),b&&e._pt&&(Ws=e,Kt.killTweensOf(S,Y,e.globalTime(t)),V=!e.parent,Ws=0),e._pt&&l&&(wu[L.id]=1)}T&&xg(e),e._onInit&&e._onInit(e)}e._onUpdate=c,e._initted=(!e._op||e._pt)&&!V,d&&t<=0&&v.render(Ri,!0,!0)},ZM=function(e,t,n,i,r,o,a,l){var c=(e._pt&&e._ptCache||(e._ptCache={}))[t],h,u,d,f;if(!c)for(c=e._ptCache[t]=[],d=e._ptLookup,f=e._targets.length;f--;){if(h=d[f][t],h&&h.d&&h.d._pt)for(h=h.d._pt;h&&h.p!==t&&h.fp!==t;)h=h._next;if(!h)return Pu=1,e.vars[t]="+=0",Td(e,a),Pu=0,l?Pa(t+" not eligible for reset"):1;c.push(h)}for(f=c.length;f--;)u=c[f],h=u._pt||u,h.s=(i||i===0)&&!r?i:h.s+(i||0)+o*h.c,h.c=n-h.s,u.e&&(u.e=an(n)+Un(u.e)),u.b&&(u.b=h.s+Un(u.b))},KM=function(e,t){var n=e[0]?Er(e[0]).harness:0,i=n&&n.aliases,r,o,a,l;if(!i)return t;r=No({},t);for(o in i)if(o in r)for(l=i[o].split(","),a=l.length;a--;)r[l[a]]=r[o];return r},QM=function(e,t,n,i){var r=t.ease||i||"power1.inOut",o,a;if(Fn(t))a=n[e]||(n[e]=[]),t.forEach(function(l,c){return a.push({t:c/(t.length-1)*100,v:l,e:r})});else for(o in t)a=n[o]||(n[o]=[]),o==="ease"||a.push({t:parseFloat(e),v:t[o],e:r})},va=function(e,t,n,i,r){return rn(e)?e.call(t,n,i,r):An(e)&&~e.indexOf("random(")?La(e):e},fg=Sd+"repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert",pg={};ti(fg+",id,stagger,delay,duration,paused,scrollTrigger",function(s){return pg[s]=1});var dn=(function(s){Dm(e,s);function e(n,i,r,o){var a;typeof i=="number"&&(r.duration=i,i=r,r=null),a=s.call(this,o?i:xa(i))||this;var l=a.vars,c=l.duration,h=l.delay,u=l.immediateRender,d=l.stagger,f=l.overwrite,g=l.keyframes,_=l.defaults,m=l.scrollTrigger,p=l.yoyoEase,y=i.parent||Kt,b=(Fn(n)||Um(n)?Ps(n[0]):"length"in i)?[n]:Ci(n),v,M,E,A,P,S,T,L;if(a._targets=b.length?Md(b):Pa("GSAP target "+n+" not found. https://gsap.com",!xi.nullTargetWarn)||[],a._ptLookup=[],a._overwrite=f,g||d||_l(c)||_l(h)){if(i=a.vars,v=a.timeline=new Yn({data:"nested",defaults:_||{},targets:y&&y.data==="nested"?y.vars.targets:b}),v.kill(),v.parent=v._dp=xs(a),v._start=0,d||_l(c)||_l(h)){if(A=b.length,T=d&&Qm(d),ls(d))for(P in d)~fg.indexOf(P)&&(L||(L={}),L[P]=d[P]);for(M=0;M<A;M++)E=Vl(i,pg),E.stagger=0,p&&(E.yoyoEase=p),L&&No(E,L),S=b[M],E.duration=+va(c,xs(a),M,S,b),E.delay=(+va(h,xs(a),M,S,b)||0)-a._delay,!d&&A===1&&E.delay&&(a._delay=h=E.delay,a._start+=h,E.delay=0),v.to(S,E,T?T(M,S,b):0),v._ease=St.none;v.duration()?c=h=0:a.timeline=0}else if(g){xa(vi(v.vars.defaults,{ease:"none"})),v._ease=Ar(g.ease||i.ease||"none");var k=0,H,Y,W;if(Fn(g))g.forEach(function(j){return v.to(b,j,">")}),v.duration();else{E={};for(P in g)P==="ease"||P==="easeEach"||QM(P,g[P],E,g.easeEach);for(P in E)for(H=E[P].sort(function(j,V){return j.t-V.t}),k=0,M=0;M<H.length;M++)Y=H[M],W={ease:Y.e,duration:(Y.t-(M?H[M-1].t:0))/100*c},W[P]=Y.v,v.to(b,W,k),k+=W.duration;v.duration()<c&&v.to({},{duration:c-v.duration()})}}c||a.duration(c=v.duration())}else a.timeline=0;return f===!0&&!gd&&(Ws=xs(a),Kt.killTweensOf(b),Ws=0),qi(y,xs(a),r),i.reversed&&a.reverse(),i.paused&&a.paused(!0),(u||!c&&!g&&a._start===Zt(y._time)&&ei(u)&&CM(xs(a))&&y.data!=="nested")&&(a._tTime=-Wt,a.render(Math.max(0,-h)||0)),m&&$m(xs(a),m),a}var t=e.prototype;return t.render=function(i,r,o){var a=this._time,l=this._tDur,c=this._dur,h=i<0,u=i>l-Wt&&!h?l:i<Wt?0:i,d,f,g,_,m,p,y,b,v;if(!c)IM(this,i,r,o);else if(u!==this._tTime||!i||o||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==h||this._lazy){if(d=u,b=this.timeline,this._repeat){if(_=c+this._rDelay,this._repeat<-1&&h)return this.totalTime(_*100+i,r,o);if(d=Zt(u%_),u===l?(g=this._repeat,d=c):(m=Zt(u/_),g=~~m,g&&g===m?(d=c,g--):d>c&&(d=c)),p=this._yoyo&&g&1,p&&(v=this._yEase,d=c-d),m=Uo(this._tTime,_),d===a&&!o&&this._initted&&g===m)return this._tTime=u,this;g!==m&&(b&&this._yEase&&cg(b,p),this.vars.repeatRefresh&&!p&&!this._lock&&d!==_&&this._initted&&(this._lock=o=1,this.render(Zt(_*g),!0).invalidate()._lock=0))}if(!this._initted){if(qm(this,h?i:d,o,r,u))return this._tTime=0,this;if(a!==this._time&&!(o&&this.vars.repeatRefresh&&g!==m))return this;if(c!==this._dur)return this.render(i,r,o)}if(this._tTime=u,this._time=d,!this._act&&this._ts&&(this._act=1,this._lazy=0),this.ratio=y=(v||this._ease)(d/c),this._from&&(this.ratio=y=1-y),!a&&u&&!r&&!m&&(mi(this,"onStart"),this._tTime!==u))return this;for(f=this._pt;f;)f.r(y,f.d),f=f._next;b&&b.render(i<0?i:b._dur*b._ease(d/this._dur),r,o)||this._startAt&&(this._zTime=i),this._onUpdate&&!r&&(h&&Eu(this,i,r,o),mi(this,"onUpdate")),this._repeat&&g!==m&&this.vars.onRepeat&&!r&&this.parent&&mi(this,"onRepeat"),(u===this._tDur||!u)&&this._tTime===u&&(h&&!this._onUpdate&&Eu(this,i,!0,!0),(i||!c)&&(u===this._tDur&&this._ts>0||!u&&this._ts<0)&&Zs(this,1),!r&&!(h&&!a)&&(u||a||p)&&(mi(this,u===l?"onComplete":"onReverseComplete",!0),this._prom&&!(u<l&&this.timeScale()>0)&&this._prom()))}return this},t.targets=function(){return this._targets},t.invalidate=function(i){return(!i||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(i),s.prototype.invalidate.call(this,i)},t.resetTo=function(i,r,o,a,l){Da||fi.wake(),this._ts||this.play();var c=Math.min(this._dur,(this._dp._time-this._start)*this._ts),h;return this._initted||Td(this,c),h=this._ease(c/this._dur),ZM(this,i,r,o,a,h,c,l)?this.resetTo(i,r,o,a,1):(pc(this,0),this.parent||jm(this._dp,this,"_first","_last",this._dp._sort?"_start":0),this.render(0))},t.kill=function(i,r){if(r===void 0&&(r="all"),!i&&(!r||r==="all"))return this._lazy=this._pt=0,this.parent?la(this):this.scrollTrigger&&this.scrollTrigger.kill(!!Pn),this;if(this.timeline){var o=this.timeline.totalDuration();return this.timeline.killTweensOf(i,r,Ws&&Ws.vars.overwrite!==!0)._first||la(this),this.parent&&o!==this.timeline.totalDuration()&&Fo(this,this._dur*this.timeline._tDur/o,0,1),this}var a=this._targets,l=i?Ci(i):a,c=this._ptLookup,h=this._pt,u,d,f,g,_,m,p;if((!r||r==="all")&&AM(a,l))return r==="all"&&(this._pt=0),la(this);for(u=this._op=this._op||[],r!=="all"&&(An(r)&&(_={},ti(r,function(y){return _[y]=1}),r=_),r=KM(a,r)),p=a.length;p--;)if(~l.indexOf(a[p])){d=c[p],r==="all"?(u[p]=r,g=d,f={}):(f=u[p]=u[p]||{},g=r);for(_ in g)m=d&&d[_],m&&((!("kill"in m.d)||m.d.kill(_)===!0)&&dc(this,m,"_pt"),delete d[_]),f!=="all"&&(f[_]=1)}return this._initted&&!this._pt&&h&&la(this),this},e.to=function(i,r){return new e(i,r,arguments[2])},e.from=function(i,r){return ya(1,arguments)},e.delayedCall=function(i,r,o,a){return new e(r,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:i,onComplete:r,onReverseComplete:r,onCompleteParams:o,onReverseCompleteParams:o,callbackScope:a})},e.fromTo=function(i,r,o){return ya(2,arguments)},e.set=function(i,r){return r.duration=0,r.repeatDelay||(r.repeat=0),new e(i,r)},e.killTweensOf=function(i,r,o){return Kt.killTweensOf(i,r,o)},e})(Na);vi(dn.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0});ti("staggerTo,staggerFrom,staggerFromTo",function(s){dn[s]=function(){var e=new Yn,t=Au.call(arguments,0);return t.splice(s==="staggerFromTo"?5:4,0,0),e[s].apply(e,t)}});var Ad=function(e,t,n){return e[t]=n},mg=function(e,t,n){return e[t](n)},JM=function(e,t,n,i){return e[t](i.fp,n)},ew=function(e,t,n){return e.setAttribute(t,n)},Rd=function(e,t){return rn(e[t])?mg:_d(e[t])&&e.setAttribute?ew:Ad},gg=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e6)/1e6,t)},tw=function(e,t){return t.set(t.t,t.p,!!(t.s+t.c*e),t)},_g=function(e,t){var n=t._pt,i="";if(!e&&t.b)i=t.b;else if(e===1&&t.e)i=t.e;else{for(;n;)i=n.p+(n.m?n.m(n.s+n.c*e):Math.round((n.s+n.c*e)*1e4)/1e4)+i,n=n._next;i+=t.c}t.set(t.t,t.p,i,t)},Cd=function(e,t){for(var n=t._pt;n;)n.r(e,n.d),n=n._next},nw=function(e,t,n,i){for(var r=this._pt,o;r;)o=r._next,r.p===i&&r.modifier(e,t,n),r=o},iw=function(e){for(var t=this._pt,n,i;t;)i=t._next,t.p===e&&!t.op||t.op===e?dc(this,t,"_pt"):t.dep||(n=1),t=i;return!n},sw=function(e,t,n,i){i.mSet(e,t,i.m.call(i.tween,n,i.mt),i)},xg=function(e){for(var t=e._pt,n,i,r,o;t;){for(n=t._next,i=r;i&&i.pr>t.pr;)i=i._next;(t._prev=i?i._prev:o)?t._prev._next=t:r=t,(t._next=i)?i._prev=t:o=t,t=n}e._pt=r},ni=(function(){function s(t,n,i,r,o,a,l,c,h){this.t=n,this.s=r,this.c=o,this.p=i,this.r=a||gg,this.d=l||this,this.set=c||Ad,this.pr=h||0,this._next=t,t&&(t._prev=this)}var e=s.prototype;return e.modifier=function(n,i,r){this.mSet=this.mSet||this.set,this.set=sw,this.m=n,this.mt=r,this.tween=i},s})();ti(Sd+"parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger",function(s){return bd[s]=1});yi.TweenMax=yi.TweenLite=dn;yi.TimelineLite=yi.TimelineMax=Yn;Kt=new Yn({sortChildren:!1,defaults:Do,autoRemoveChildren:!0,id:"root",smoothChildTiming:!0});xi.stringFilter=ag;var Rr=[],Il={},rw=[],mp=0,ow=0,ah=function(e){return(Il[e]||rw).map(function(t){return t()})},Iu=function(){var e=Date.now(),t=[];e-mp>2&&(ah("matchMediaInit"),Rr.forEach(function(n){var i=n.queries,r=n.conditions,o,a,l,c;for(a in i)o=ji.matchMedia(i[a]).matches,o&&(l=1),o!==r[a]&&(r[a]=o,c=1);c&&(n.revert(),l&&t.push(n))}),ah("matchMediaRevert"),t.forEach(function(n){return n.onMatch(n,function(i){return n.add(null,i)})}),mp=e,ah("matchMedia"))},yg=(function(){function s(t,n){this.selector=n&&Ru(n),this.data=[],this._r=[],this.isReverted=!1,this.id=ow++,t&&this.add(t)}var e=s.prototype;return e.add=function(n,i,r){rn(n)&&(r=i,i=n,n=rn);var o=this,a=function(){var c=qt,h=o.selector,u;return c&&c!==o&&c.data.push(o),r&&(o.selector=Ru(r)),qt=o,u=i.apply(o,arguments),rn(u)&&o._r.push(u),qt=c,o.selector=h,o.isReverted=!1,u};return o.last=a,n===rn?a(o,function(l){return o.add(null,l)}):n?o[n]=a:a},e.ignore=function(n){var i=qt;qt=null,n(this),qt=i},e.getTweens=function(){var n=[];return this.data.forEach(function(i){return i instanceof s?n.push.apply(n,i.getTweens()):i instanceof dn&&!(i.parent&&i.parent.data==="nested")&&n.push(i)}),n},e.clear=function(){this._r.length=this.data.length=0},e.kill=function(n,i){var r=this;if(n?(function(){for(var a=r.getTweens(),l=r.data.length,c;l--;)c=r.data[l],c.data==="isFlip"&&(c.revert(),c.getChildren(!0,!0,!1).forEach(function(h){return a.splice(a.indexOf(h),1)}));for(a.map(function(h){return{g:h._dur||h._delay||h._sat&&!h._sat.vars.immediateRender?h.globalTime(0):-1/0,t:h}}).sort(function(h,u){return u.g-h.g||-1/0}).forEach(function(h){return h.t.revert(n)}),l=r.data.length;l--;)c=r.data[l],c instanceof Yn?c.data!=="nested"&&(c.scrollTrigger&&c.scrollTrigger.revert(),c.kill()):!(c instanceof dn)&&c.revert&&c.revert(n);r._r.forEach(function(h){return h(n,r)}),r.isReverted=!0})():this.data.forEach(function(a){return a.kill&&a.kill()}),this.clear(),i)for(var o=Rr.length;o--;)Rr[o].id===this.id&&Rr.splice(o,1)},e.revert=function(n){this.kill(n||{})},s})(),aw=(function(){function s(t){this.contexts=[],this.scope=t,qt&&qt.data.push(this)}var e=s.prototype;return e.add=function(n,i,r){ls(n)||(n={matches:n});var o=new yg(0,r||this.scope),a=o.conditions={},l,c,h;qt&&!o.selector&&(o.selector=qt.selector),this.contexts.push(o),i=o.add("onMatch",i),o.queries=n;for(c in n)c==="all"?h=1:(l=ji.matchMedia(n[c]),l&&(Rr.indexOf(o)<0&&Rr.push(o),(a[c]=l.matches)&&(h=1),l.addListener?l.addListener(Iu):l.addEventListener("change",Iu)));return h&&i(o,function(u){return o.add(null,u)}),this},e.revert=function(n){this.kill(n||{})},e.kill=function(n){this.contexts.forEach(function(i){return i.kill(n,!0)})},s})(),Wl={registerPlugin:function(){for(var e=arguments.length,t=new Array(e),n=0;n<e;n++)t[n]=arguments[n];t.forEach(function(i){return sg(i)})},timeline:function(e){return new Yn(e)},getTweensOf:function(e,t){return Kt.getTweensOf(e,t)},getProperty:function(e,t,n,i){An(e)&&(e=Ci(e)[0]);var r=Er(e||{}).get,o=n?Xm:Wm;return n==="native"&&(n=""),e&&(t?o((ui[t]&&ui[t].get||r)(e,t,n,i)):function(a,l,c){return o((ui[a]&&ui[a].get||r)(e,a,l,c))})},quickSetter:function(e,t,n){if(e=Ci(e),e.length>1){var i=e.map(function(h){return ri.quickSetter(h,t,n)}),r=i.length;return function(h){for(var u=r;u--;)i[u](h)}}e=e[0]||{};var o=ui[t],a=Er(e),l=a.harness&&(a.harness.aliases||{})[t]||t,c=o?function(h){var u=new o;uo._pt=0,u.init(e,n?h+n:h,uo,0,[e]),u.render(1,u),uo._pt&&Cd(1,uo)}:a.set(e,l);return o?c:function(h){return c(e,l,n?h+n:h,a,1)}},quickTo:function(e,t,n){var i,r=ri.to(e,vi((i={},i[t]="+=0.1",i.paused=!0,i.stagger=0,i),n||{})),o=function(l,c,h){return r.resetTo(t,l,c,h)};return o.tween=r,o},isTweening:function(e){return Kt.getTweensOf(e,!0).length>0},defaults:function(e){return e&&e.ease&&(e.ease=Ar(e.ease,Do.ease)),hp(Do,e||{})},config:function(e){return hp(xi,e||{})},registerEffect:function(e){var t=e.name,n=e.effect,i=e.plugins,r=e.defaults,o=e.extendTimeline;(i||"").split(",").forEach(function(a){return a&&!ui[a]&&!yi[a]&&Pa(t+" effect requires "+a+" plugin.")}),ih[t]=function(a,l,c){return n(Ci(a),vi(l||{},r),c)},o&&(Yn.prototype[t]=function(a,l,c){return this.add(ih[t](a,ls(l)?l:(c=l)&&{},this),c)})},registerEase:function(e,t){St[e]=Ar(t)},parseEase:function(e,t){return arguments.length?Ar(e,t):St},getById:function(e){return Kt.getById(e)},exportRoot:function(e,t){e===void 0&&(e={});var n=new Yn(e),i,r;for(n.smoothChildTiming=ei(e.smoothChildTiming),Kt.remove(n),n._dp=0,n._time=n._tTime=Kt._time,i=Kt._first;i;)r=i._next,(t||!(!i._dur&&i instanceof dn&&i.vars.onComplete===i._targets[0]))&&qi(n,i,i._start-i._delay),i=r;return qi(Kt,n,0),n},context:function(e,t){return e?new yg(e,t):qt},matchMedia:function(e){return new aw(e)},matchMediaRefresh:function(){return Rr.forEach(function(e){var t=e.conditions,n,i;for(i in t)t[i]&&(t[i]=!1,n=1);n&&e.revert()})||Iu()},addEventListener:function(e,t){var n=Il[e]||(Il[e]=[]);~n.indexOf(t)||n.push(t)},removeEventListener:function(e,t){var n=Il[e],i=n&&n.indexOf(t);i>=0&&n.splice(i,1)},utils:{wrap:BM,wrapYoyo:zM,distribute:Qm,random:eg,snap:Jm,normalize:kM,getUnit:Un,clamp:NM,splitColor:rg,toArray:Ci,selector:Ru,mapRange:ng,pipe:FM,unitize:OM,interpolate:HM,shuffle:Km},install:Bm,effects:ih,ticker:fi,updateRoot:Yn.updateRoot,plugins:ui,globalTimeline:Kt,core:{PropTween:ni,globals:zm,Tween:dn,Timeline:Yn,Animation:Na,getCache:Er,_removeLinkedListItem:dc,reverting:function(){return Pn},context:function(e){return e&&qt&&(qt.data.push(e),e._ctx=qt),qt},suppressOverwrites:function(e){return gd=e}}};ti("to,from,fromTo,delayedCall,set,killTweensOf",function(s){return Wl[s]=dn[s]});fi.add(Yn.updateRoot);uo=Wl.to({},{duration:0});var lw=function(e,t){for(var n=e._pt;n&&n.p!==t&&n.op!==t&&n.fp!==t;)n=n._next;return n},cw=function(e,t){var n=e._targets,i,r,o;for(i in t)for(r=n.length;r--;)o=e._ptLookup[r][i],o&&(o=o.d)&&(o._pt&&(o=lw(o,i)),o&&o.modifier&&o.modifier(t[i],e,n[r],i))},lh=function(e,t){return{name:e,headless:1,rawVars:1,init:function(i,r,o){o._onInit=function(a){var l,c;if(An(r)&&(l={},ti(r,function(h){return l[h]=1}),r=l),t){l={};for(c in r)l[c]=t(r[c]);r=l}cw(a,r)}}}},ri=Wl.registerPlugin({name:"attr",init:function(e,t,n,i,r){var o,a,l;this.tween=n;for(o in t)l=e.getAttribute(o)||"",a=this.add(e,"setAttribute",(l||0)+"",t[o],i,r,0,0,o),a.op=o,a.b=l,this._props.push(o)},render:function(e,t){for(var n=t._pt;n;)Pn?n.set(n.t,n.p,n.b,n):n.r(e,n.d),n=n._next}},{name:"endArray",headless:1,init:function(e,t){for(var n=t.length;n--;)this.add(e,n,e[n]||0,t[n],0,0,0,0,0,1)}},lh("roundProps",Cu),lh("modifiers"),lh("snap",Jm))||Wl;dn.version=Yn.version=ri.version="3.14.2";km=1;xd()&&Oo();St.Power0;St.Power1;St.Power2;St.Power3;St.Power4;St.Linear;St.Quad;St.Cubic;St.Quart;St.Quint;St.Strong;St.Elastic;St.Back;St.SteppedEase;St.Bounce;St.Sine;St.Expo;St.Circ;var gp,Xs,xo,Pd,br,_p,Id,hw=function(){return typeof window<"u"},Is={},mr=180/Math.PI,yo=Math.PI/180,io=Math.atan2,xp=1e8,Ld=/([A-Z])/g,uw=/(left|right|width|margin|padding|x)/i,dw=/[\s,\(]\S/,Ji={autoAlpha:"opacity,visibility",scale:"scaleX,scaleY",alpha:"opacity"},Lu=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},fw=function(e,t){return t.set(t.t,t.p,e===1?t.e:Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},pw=function(e,t){return t.set(t.t,t.p,e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},mw=function(e,t){return t.set(t.t,t.p,e===1?t.e:e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},gw=function(e,t){var n=t.s+t.c*e;t.set(t.t,t.p,~~(n+(n<0?-.5:.5))+t.u,t)},vg=function(e,t){return t.set(t.t,t.p,e?t.e:t.b,t)},bg=function(e,t){return t.set(t.t,t.p,e!==1?t.b:t.e,t)},_w=function(e,t,n){return e.style[t]=n},xw=function(e,t,n){return e.style.setProperty(t,n)},yw=function(e,t,n){return e._gsap[t]=n},vw=function(e,t,n){return e._gsap.scaleX=e._gsap.scaleY=n},bw=function(e,t,n,i,r){var o=e._gsap;o.scaleX=o.scaleY=n,o.renderTransform(r,o)},Sw=function(e,t,n,i,r){var o=e._gsap;o[t]=n,o.renderTransform(r,o)},Jt="transform",ii=Jt+"Origin",Mw=function s(e,t){var n=this,i=this.target,r=i.style,o=i._gsap;if(e in Is&&r){if(this.tfm=this.tfm||{},e!=="transform")e=Ji[e]||e,~e.indexOf(",")?e.split(",").forEach(function(a){return n.tfm[a]=ys(i,a)}):this.tfm[e]=o.x?o[e]:ys(i,e),e===ii&&(this.tfm.zOrigin=o.zOrigin);else return Ji.transform.split(",").forEach(function(a){return s.call(n,a,t)});if(this.props.indexOf(Jt)>=0)return;o.svg&&(this.svgo=i.getAttribute("data-svg-origin"),this.props.push(ii,t,"")),e=Jt}(r||t)&&this.props.push(e,t,r[e])},Sg=function(e){e.translate&&(e.removeProperty("translate"),e.removeProperty("scale"),e.removeProperty("rotate"))},ww=function(){var e=this.props,t=this.target,n=t.style,i=t._gsap,r,o;for(r=0;r<e.length;r+=3)e[r+1]?e[r+1]===2?t[e[r]](e[r+2]):t[e[r]]=e[r+2]:e[r+2]?n[e[r]]=e[r+2]:n.removeProperty(e[r].substr(0,2)==="--"?e[r]:e[r].replace(Ld,"-$1").toLowerCase());if(this.tfm){for(o in this.tfm)i[o]=this.tfm[o];i.svg&&(i.renderTransform(),t.setAttribute("data-svg-origin",this.svgo||"")),r=Id(),(!r||!r.isStart)&&!n[Jt]&&(Sg(n),i.zOrigin&&n[ii]&&(n[ii]+=" "+i.zOrigin+"px",i.zOrigin=0,i.renderTransform()),i.uncache=1)}},Mg=function(e,t){var n={target:e,props:[],revert:ww,save:Mw};return e._gsap||ri.core.getCache(e),t&&e.style&&e.nodeType&&t.split(",").forEach(function(i){return n.save(i)}),n},wg,Du=function(e,t){var n=Xs.createElementNS?Xs.createElementNS((t||"http://www.w3.org/1999/xhtml").replace(/^https/,"http"),e):Xs.createElement(e);return n&&n.style?n:Xs.createElement(e)},gi=function s(e,t,n){var i=getComputedStyle(e);return i[t]||i.getPropertyValue(t.replace(Ld,"-$1").toLowerCase())||i.getPropertyValue(t)||!n&&s(e,ko(t)||t,1)||""},yp="O,Moz,ms,Ms,Webkit".split(","),ko=function(e,t,n){var i=t||br,r=i.style,o=5;if(e in r&&!n)return e;for(e=e.charAt(0).toUpperCase()+e.substr(1);o--&&!(yp[o]+e in r););return o<0?null:(o===3?"ms":o>=0?yp[o]:"")+e},Nu=function(){hw()&&window.document&&(gp=window,Xs=gp.document,xo=Xs.documentElement,br=Du("div")||{style:{}},Du("div"),Jt=ko(Jt),ii=Jt+"Origin",br.style.cssText="border-width:0;line-height:0;position:absolute;padding:0",wg=!!ko("perspective"),Id=ri.core.reverting,Pd=1)},vp=function(e){var t=e.ownerSVGElement,n=Du("svg",t&&t.getAttribute("xmlns")||"http://www.w3.org/2000/svg"),i=e.cloneNode(!0),r;i.style.display="block",n.appendChild(i),xo.appendChild(n);try{r=i.getBBox()}catch{}return n.removeChild(i),xo.removeChild(n),r},bp=function(e,t){for(var n=t.length;n--;)if(e.hasAttribute(t[n]))return e.getAttribute(t[n])},Eg=function(e){var t,n;try{t=e.getBBox()}catch{t=vp(e),n=1}return t&&(t.width||t.height)||n||(t=vp(e)),t&&!t.width&&!t.x&&!t.y?{x:+bp(e,["x","cx","x1"])||0,y:+bp(e,["y","cy","y1"])||0,width:0,height:0}:t},Tg=function(e){return!!(e.getCTM&&(!e.parentNode||e.ownerSVGElement)&&Eg(e))},Ks=function(e,t){if(t){var n=e.style,i;t in Is&&t!==ii&&(t=Jt),n.removeProperty?(i=t.substr(0,2),(i==="ms"||t.substr(0,6)==="webkit")&&(t="-"+t),n.removeProperty(i==="--"?t:t.replace(Ld,"-$1").toLowerCase())):n.removeAttribute(t)}},js=function(e,t,n,i,r,o){var a=new ni(e._pt,t,n,0,1,o?bg:vg);return e._pt=a,a.b=i,a.e=r,e._props.push(n),a},Sp={deg:1,rad:1,turn:1},Ew={grid:1,flex:1},Qs=function s(e,t,n,i){var r=parseFloat(n)||0,o=(n+"").trim().substr((r+"").length)||"px",a=br.style,l=uw.test(t),c=e.tagName.toLowerCase()==="svg",h=(c?"client":"offset")+(l?"Width":"Height"),u=100,d=i==="px",f=i==="%",g,_,m,p;if(i===o||!r||Sp[i]||Sp[o])return r;if(o!=="px"&&!d&&(r=s(e,t,n,"px")),p=e.getCTM&&Tg(e),(f||o==="%")&&(Is[t]||~t.indexOf("adius")))return g=p?e.getBBox()[l?"width":"height"]:e[h],an(f?r/g*u:r/100*g);if(a[l?"width":"height"]=u+(d?o:i),_=i!=="rem"&&~t.indexOf("adius")||i==="em"&&e.appendChild&&!c?e:e.parentNode,p&&(_=(e.ownerSVGElement||{}).parentNode),(!_||_===Xs||!_.appendChild)&&(_=Xs.body),m=_._gsap,m&&f&&m.width&&l&&m.time===fi.time&&!m.uncache)return an(r/m.width*u);if(f&&(t==="height"||t==="width")){var y=e.style[t];e.style[t]=u+i,g=e[h],y?e.style[t]=y:Ks(e,t)}else(f||o==="%")&&!Ew[gi(_,"display")]&&(a.position=gi(e,"position")),_===e&&(a.position="static"),_.appendChild(br),g=br[h],_.removeChild(br),a.position="absolute";return l&&f&&(m=Er(_),m.time=fi.time,m.width=_[h]),an(d?g*r/u:g&&r?u/g*r:0)},ys=function(e,t,n,i){var r;return Pd||Nu(),t in Ji&&t!=="transform"&&(t=Ji[t],~t.indexOf(",")&&(t=t.split(",")[0])),Is[t]&&t!=="transform"?(r=Fa(e,i),r=t!=="transformOrigin"?r[t]:r.svg?r.origin:jl(gi(e,ii))+" "+r.zOrigin+"px"):(r=e.style[t],(!r||r==="auto"||i||~(r+"").indexOf("calc("))&&(r=Xl[t]&&Xl[t](e,t,n)||gi(e,t)||Vm(e,t)||(t==="opacity"?1:0))),n&&!~(r+"").trim().indexOf(" ")?Qs(e,t,r,n)+n:r},Tw=function(e,t,n,i){if(!n||n==="none"){var r=ko(t,e,1),o=r&&gi(e,r,1);o&&o!==n?(t=r,n=o):t==="borderColor"&&(n=gi(e,"borderTopColor"))}var a=new ni(this._pt,e.style,t,0,1,_g),l=0,c=0,h,u,d,f,g,_,m,p,y,b,v,M;if(a.b=n,a.e=i,n+="",i+="",i.substring(0,6)==="var(--"&&(i=gi(e,i.substring(4,i.indexOf(")")))),i==="auto"&&(_=e.style[t],e.style[t]=i,i=gi(e,t)||i,_?e.style[t]=_:Ks(e,t)),h=[n,i],ag(h),n=h[0],i=h[1],d=n.match(ho)||[],M=i.match(ho)||[],M.length){for(;u=ho.exec(i);)m=u[0],y=i.substring(l,u.index),g?g=(g+1)%5:(y.substr(-5)==="rgba("||y.substr(-5)==="hsla(")&&(g=1),m!==(_=d[c++]||"")&&(f=parseFloat(_)||0,v=_.substr((f+"").length),m.charAt(1)==="="&&(m=_o(f,m)+v),p=parseFloat(m),b=m.substr((p+"").length),l=ho.lastIndex-b.length,b||(b=b||xi.units[t]||v,l===i.length&&(i+=b,a.e+=b)),v!==b&&(f=Qs(e,t,_,b)||0),a._pt={_next:a._pt,p:y||c===1?y:",",s:f,c:p-f,m:g&&g<4||t==="zIndex"?Math.round:0});a.c=l<i.length?i.substring(l,i.length):""}else a.r=t==="display"&&i==="none"?bg:vg;return Om.test(i)&&(a.e=0),this._pt=a,a},Mp={top:"0%",bottom:"100%",left:"0%",right:"100%",center:"50%"},Aw=function(e){var t=e.split(" "),n=t[0],i=t[1]||"50%";return(n==="top"||n==="bottom"||i==="left"||i==="right")&&(e=n,n=i,i=e),t[0]=Mp[n]||n,t[1]=Mp[i]||i,t.join(" ")},Rw=function(e,t){if(t.tween&&t.tween._time===t.tween._dur){var n=t.t,i=n.style,r=t.u,o=n._gsap,a,l,c;if(r==="all"||r===!0)i.cssText="",l=1;else for(r=r.split(","),c=r.length;--c>-1;)a=r[c],Is[a]&&(l=1,a=a==="transformOrigin"?ii:Jt),Ks(n,a);l&&(Ks(n,Jt),o&&(o.svg&&n.removeAttribute("transform"),i.scale=i.rotate=i.translate="none",Fa(n,1),o.uncache=1,Sg(i)))}},Xl={clearProps:function(e,t,n,i,r){if(r.data!=="isFromStart"){var o=e._pt=new ni(e._pt,t,n,0,0,Rw);return o.u=i,o.pr=-10,o.tween=r,e._props.push(n),1}}},Ua=[1,0,0,1,0,0],Ag={},Rg=function(e){return e==="matrix(1, 0, 0, 1, 0, 0)"||e==="none"||!e},wp=function(e){var t=gi(e,Jt);return Rg(t)?Ua:t.substr(7).match(Fm).map(an)},Dd=function(e,t){var n=e._gsap||Er(e),i=e.style,r=wp(e),o,a,l,c;return n.svg&&e.getAttribute("transform")?(l=e.transform.baseVal.consolidate().matrix,r=[l.a,l.b,l.c,l.d,l.e,l.f],r.join(",")==="1,0,0,1,0,0"?Ua:r):(r===Ua&&!e.offsetParent&&e!==xo&&!n.svg&&(l=i.display,i.display="block",o=e.parentNode,(!o||!e.offsetParent&&!e.getBoundingClientRect().width)&&(c=1,a=e.nextElementSibling,xo.appendChild(e)),r=wp(e),l?i.display=l:Ks(e,"display"),c&&(a?o.insertBefore(e,a):o?o.appendChild(e):xo.removeChild(e))),t&&r.length>6?[r[0],r[1],r[4],r[5],r[12],r[13]]:r)},Uu=function(e,t,n,i,r,o){var a=e._gsap,l=r||Dd(e,!0),c=a.xOrigin||0,h=a.yOrigin||0,u=a.xOffset||0,d=a.yOffset||0,f=l[0],g=l[1],_=l[2],m=l[3],p=l[4],y=l[5],b=t.split(" "),v=parseFloat(b[0])||0,M=parseFloat(b[1])||0,E,A,P,S;n?l!==Ua&&(A=f*m-g*_)&&(P=v*(m/A)+M*(-_/A)+(_*y-m*p)/A,S=v*(-g/A)+M*(f/A)-(f*y-g*p)/A,v=P,M=S):(E=Eg(e),v=E.x+(~b[0].indexOf("%")?v/100*E.width:v),M=E.y+(~(b[1]||b[0]).indexOf("%")?M/100*E.height:M)),i||i!==!1&&a.smooth?(p=v-c,y=M-h,a.xOffset=u+(p*f+y*_)-p,a.yOffset=d+(p*g+y*m)-y):a.xOffset=a.yOffset=0,a.xOrigin=v,a.yOrigin=M,a.smooth=!!i,a.origin=t,a.originIsAbsolute=!!n,e.style[ii]="0px 0px",o&&(js(o,a,"xOrigin",c,v),js(o,a,"yOrigin",h,M),js(o,a,"xOffset",u,a.xOffset),js(o,a,"yOffset",d,a.yOffset)),e.setAttribute("data-svg-origin",v+" "+M)},Fa=function(e,t){var n=e._gsap||new ug(e);if("x"in n&&!t&&!n.uncache)return n;var i=e.style,r=n.scaleX<0,o="px",a="deg",l=getComputedStyle(e),c=gi(e,ii)||"0",h,u,d,f,g,_,m,p,y,b,v,M,E,A,P,S,T,L,k,H,Y,W,j,V,q,he,ue,de,ze,Je,ht,_t;return h=u=d=_=m=p=y=b=v=0,f=g=1,n.svg=!!(e.getCTM&&Tg(e)),l.translate&&((l.translate!=="none"||l.scale!=="none"||l.rotate!=="none")&&(i[Jt]=(l.translate!=="none"?"translate3d("+(l.translate+" 0 0").split(" ").slice(0,3).join(", ")+") ":"")+(l.rotate!=="none"?"rotate("+l.rotate+") ":"")+(l.scale!=="none"?"scale("+l.scale.split(" ").join(",")+") ":"")+(l[Jt]!=="none"?l[Jt]:"")),i.scale=i.rotate=i.translate="none"),A=Dd(e,n.svg),n.svg&&(n.uncache?(q=e.getBBox(),c=n.xOrigin-q.x+"px "+(n.yOrigin-q.y)+"px",V=""):V=!t&&e.getAttribute("data-svg-origin"),Uu(e,V||c,!!V||n.originIsAbsolute,n.smooth!==!1,A)),M=n.xOrigin||0,E=n.yOrigin||0,A!==Ua&&(L=A[0],k=A[1],H=A[2],Y=A[3],h=W=A[4],u=j=A[5],A.length===6?(f=Math.sqrt(L*L+k*k),g=Math.sqrt(Y*Y+H*H),_=L||k?io(k,L)*mr:0,y=H||Y?io(H,Y)*mr+_:0,y&&(g*=Math.abs(Math.cos(y*yo))),n.svg&&(h-=M-(M*L+E*H),u-=E-(M*k+E*Y))):(_t=A[6],Je=A[7],ue=A[8],de=A[9],ze=A[10],ht=A[11],h=A[12],u=A[13],d=A[14],P=io(_t,ze),m=P*mr,P&&(S=Math.cos(-P),T=Math.sin(-P),V=W*S+ue*T,q=j*S+de*T,he=_t*S+ze*T,ue=W*-T+ue*S,de=j*-T+de*S,ze=_t*-T+ze*S,ht=Je*-T+ht*S,W=V,j=q,_t=he),P=io(-H,ze),p=P*mr,P&&(S=Math.cos(-P),T=Math.sin(-P),V=L*S-ue*T,q=k*S-de*T,he=H*S-ze*T,ht=Y*T+ht*S,L=V,k=q,H=he),P=io(k,L),_=P*mr,P&&(S=Math.cos(P),T=Math.sin(P),V=L*S+k*T,q=W*S+j*T,k=k*S-L*T,j=j*S-W*T,L=V,W=q),m&&Math.abs(m)+Math.abs(_)>359.9&&(m=_=0,p=180-p),f=an(Math.sqrt(L*L+k*k+H*H)),g=an(Math.sqrt(j*j+_t*_t)),P=io(W,j),y=Math.abs(P)>2e-4?P*mr:0,v=ht?1/(ht<0?-ht:ht):0),n.svg&&(V=e.getAttribute("transform"),n.forceCSS=e.setAttribute("transform","")||!Rg(gi(e,Jt)),V&&e.setAttribute("transform",V))),Math.abs(y)>90&&Math.abs(y)<270&&(r?(f*=-1,y+=_<=0?180:-180,_+=_<=0?180:-180):(g*=-1,y+=y<=0?180:-180)),t=t||n.uncache,n.x=h-((n.xPercent=h&&(!t&&n.xPercent||(Math.round(e.offsetWidth/2)===Math.round(-h)?-50:0)))?e.offsetWidth*n.xPercent/100:0)+o,n.y=u-((n.yPercent=u&&(!t&&n.yPercent||(Math.round(e.offsetHeight/2)===Math.round(-u)?-50:0)))?e.offsetHeight*n.yPercent/100:0)+o,n.z=d+o,n.scaleX=an(f),n.scaleY=an(g),n.rotation=an(_)+a,n.rotationX=an(m)+a,n.rotationY=an(p)+a,n.skewX=y+a,n.skewY=b+a,n.transformPerspective=v+o,(n.zOrigin=parseFloat(c.split(" ")[2])||!t&&n.zOrigin||0)&&(i[ii]=jl(c)),n.xOffset=n.yOffset=0,n.force3D=xi.force3D,n.renderTransform=n.svg?Pw:wg?Cg:Cw,n.uncache=0,n},jl=function(e){return(e=e.split(" "))[0]+" "+e[1]},ch=function(e,t,n){var i=Un(t);return an(parseFloat(t)+parseFloat(Qs(e,"x",n+"px",i)))+i},Cw=function(e,t){t.z="0px",t.rotationY=t.rotationX="0deg",t.force3D=0,Cg(e,t)},ur="0deg",na="0px",dr=") ",Cg=function(e,t){var n=t||this,i=n.xPercent,r=n.yPercent,o=n.x,a=n.y,l=n.z,c=n.rotation,h=n.rotationY,u=n.rotationX,d=n.skewX,f=n.skewY,g=n.scaleX,_=n.scaleY,m=n.transformPerspective,p=n.force3D,y=n.target,b=n.zOrigin,v="",M=p==="auto"&&e&&e!==1||p===!0;if(b&&(u!==ur||h!==ur)){var E=parseFloat(h)*yo,A=Math.sin(E),P=Math.cos(E),S;E=parseFloat(u)*yo,S=Math.cos(E),o=ch(y,o,A*S*-b),a=ch(y,a,-Math.sin(E)*-b),l=ch(y,l,P*S*-b+b)}m!==na&&(v+="perspective("+m+dr),(i||r)&&(v+="translate("+i+"%, "+r+"%) "),(M||o!==na||a!==na||l!==na)&&(v+=l!==na||M?"translate3d("+o+", "+a+", "+l+") ":"translate("+o+", "+a+dr),c!==ur&&(v+="rotate("+c+dr),h!==ur&&(v+="rotateY("+h+dr),u!==ur&&(v+="rotateX("+u+dr),(d!==ur||f!==ur)&&(v+="skew("+d+", "+f+dr),(g!==1||_!==1)&&(v+="scale("+g+", "+_+dr),y.style[Jt]=v||"translate(0, 0)"},Pw=function(e,t){var n=t||this,i=n.xPercent,r=n.yPercent,o=n.x,a=n.y,l=n.rotation,c=n.skewX,h=n.skewY,u=n.scaleX,d=n.scaleY,f=n.target,g=n.xOrigin,_=n.yOrigin,m=n.xOffset,p=n.yOffset,y=n.forceCSS,b=parseFloat(o),v=parseFloat(a),M,E,A,P,S;l=parseFloat(l),c=parseFloat(c),h=parseFloat(h),h&&(h=parseFloat(h),c+=h,l+=h),l||c?(l*=yo,c*=yo,M=Math.cos(l)*u,E=Math.sin(l)*u,A=Math.sin(l-c)*-d,P=Math.cos(l-c)*d,c&&(h*=yo,S=Math.tan(c-h),S=Math.sqrt(1+S*S),A*=S,P*=S,h&&(S=Math.tan(h),S=Math.sqrt(1+S*S),M*=S,E*=S)),M=an(M),E=an(E),A=an(A),P=an(P)):(M=u,P=d,E=A=0),(b&&!~(o+"").indexOf("px")||v&&!~(a+"").indexOf("px"))&&(b=Qs(f,"x",o,"px"),v=Qs(f,"y",a,"px")),(g||_||m||p)&&(b=an(b+g-(g*M+_*A)+m),v=an(v+_-(g*E+_*P)+p)),(i||r)&&(S=f.getBBox(),b=an(b+i/100*S.width),v=an(v+r/100*S.height)),S="matrix("+M+","+E+","+A+","+P+","+b+","+v+")",f.setAttribute("transform",S),y&&(f.style[Jt]=S)},Iw=function(e,t,n,i,r){var o=360,a=An(r),l=parseFloat(r)*(a&&~r.indexOf("rad")?mr:1),c=l-i,h=i+c+"deg",u,d;return a&&(u=r.split("_")[1],u==="short"&&(c%=o,c!==c%(o/2)&&(c+=c<0?o:-o)),u==="cw"&&c<0?c=(c+o*xp)%o-~~(c/o)*o:u==="ccw"&&c>0&&(c=(c-o*xp)%o-~~(c/o)*o)),e._pt=d=new ni(e._pt,t,n,i,c,fw),d.e=h,d.u="deg",e._props.push(n),d},Ep=function(e,t){for(var n in t)e[n]=t[n];return e},Lw=function(e,t,n){var i=Ep({},n._gsap),r="perspective,force3D,transformOrigin,svgOrigin",o=n.style,a,l,c,h,u,d,f,g;i.svg?(c=n.getAttribute("transform"),n.setAttribute("transform",""),o[Jt]=t,a=Fa(n,1),Ks(n,Jt),n.setAttribute("transform",c)):(c=getComputedStyle(n)[Jt],o[Jt]=t,a=Fa(n,1),o[Jt]=c);for(l in Is)c=i[l],h=a[l],c!==h&&r.indexOf(l)<0&&(f=Un(c),g=Un(h),u=f!==g?Qs(n,l,c,g):parseFloat(c),d=parseFloat(h),e._pt=new ni(e._pt,a,l,u,d-u,Lu),e._pt.u=g||0,e._props.push(l));Ep(a,i)};ti("padding,margin,Width,Radius",function(s,e){var t="Top",n="Right",i="Bottom",r="Left",o=(e<3?[t,n,i,r]:[t+r,t+n,i+n,i+r]).map(function(a){return e<2?s+a:"border"+a+s});Xl[e>1?"border"+s:s]=function(a,l,c,h,u){var d,f;if(arguments.length<4)return d=o.map(function(g){return ys(a,g,c)}),f=d.join(" "),f.split(d[0]).length===5?d[0]:f;d=(h+"").split(" "),f={},o.forEach(function(g,_){return f[g]=d[_]=d[_]||d[(_-1)/2|0]}),a.init(l,f,u)}});var Pg={name:"css",register:Nu,targetTest:function(e){return e.style&&e.nodeType},init:function(e,t,n,i,r){var o=this._props,a=e.style,l=n.vars.startAt,c,h,u,d,f,g,_,m,p,y,b,v,M,E,A,P,S;Pd||Nu(),this.styles=this.styles||Mg(e),P=this.styles.props,this.tween=n;for(_ in t)if(_!=="autoRound"&&(h=t[_],!(ui[_]&&dg(_,t,n,i,e,r)))){if(f=typeof h,g=Xl[_],f==="function"&&(h=h.call(n,i,e,r),f=typeof h),f==="string"&&~h.indexOf("random(")&&(h=La(h)),g)g(this,e,_,h,n)&&(A=1);else if(_.substr(0,2)==="--")c=(getComputedStyle(e).getPropertyValue(_)+"").trim(),h+="",$s.lastIndex=0,$s.test(c)||(m=Un(c),p=Un(h),p?m!==p&&(c=Qs(e,_,c,p)+p):m&&(h+=m)),this.add(a,"setProperty",c,h,i,r,0,0,_),o.push(_),P.push(_,0,a[_]);else if(f!=="undefined"){if(l&&_ in l?(c=typeof l[_]=="function"?l[_].call(n,i,e,r):l[_],An(c)&&~c.indexOf("random(")&&(c=La(c)),Un(c+"")||c==="auto"||(c+=xi.units[_]||Un(ys(e,_))||""),(c+"").charAt(1)==="="&&(c=ys(e,_))):c=ys(e,_),d=parseFloat(c),y=f==="string"&&h.charAt(1)==="="&&h.substr(0,2),y&&(h=h.substr(2)),u=parseFloat(h),_ in Ji&&(_==="autoAlpha"&&(d===1&&ys(e,"visibility")==="hidden"&&u&&(d=0),P.push("visibility",0,a.visibility),js(this,a,"visibility",d?"inherit":"hidden",u?"inherit":"hidden",!u)),_!=="scale"&&_!=="transform"&&(_=Ji[_],~_.indexOf(",")&&(_=_.split(",")[0]))),b=_ in Is,b){if(this.styles.save(_),S=h,f==="string"&&h.substring(0,6)==="var(--"){if(h=gi(e,h.substring(4,h.indexOf(")"))),h.substring(0,5)==="calc("){var T=e.style.perspective;e.style.perspective=h,h=gi(e,"perspective"),T?e.style.perspective=T:Ks(e,"perspective")}u=parseFloat(h)}if(v||(M=e._gsap,M.renderTransform&&!t.parseTransform||Fa(e,t.parseTransform),E=t.smoothOrigin!==!1&&M.smooth,v=this._pt=new ni(this._pt,a,Jt,0,1,M.renderTransform,M,0,-1),v.dep=1),_==="scale")this._pt=new ni(this._pt,M,"scaleY",M.scaleY,(y?_o(M.scaleY,y+u):u)-M.scaleY||0,Lu),this._pt.u=0,o.push("scaleY",_),_+="X";else if(_==="transformOrigin"){P.push(ii,0,a[ii]),h=Aw(h),M.svg?Uu(e,h,0,E,0,this):(p=parseFloat(h.split(" ")[2])||0,p!==M.zOrigin&&js(this,M,"zOrigin",M.zOrigin,p),js(this,a,_,jl(c),jl(h)));continue}else if(_==="svgOrigin"){Uu(e,h,1,E,0,this);continue}else if(_ in Ag){Iw(this,M,_,d,y?_o(d,y+h):h);continue}else if(_==="smoothOrigin"){js(this,M,"smooth",M.smooth,h);continue}else if(_==="force3D"){M[_]=h;continue}else if(_==="transform"){Lw(this,h,e);continue}}else _ in a||(_=ko(_)||_);if(b||(u||u===0)&&(d||d===0)&&!dw.test(h)&&_ in a)m=(c+"").substr((d+"").length),u||(u=0),p=Un(h)||(_ in xi.units?xi.units[_]:m),m!==p&&(d=Qs(e,_,c,p)),this._pt=new ni(this._pt,b?M:a,_,d,(y?_o(d,y+u):u)-d,!b&&(p==="px"||_==="zIndex")&&t.autoRound!==!1?gw:Lu),this._pt.u=p||0,b&&S!==h?(this._pt.b=c,this._pt.e=S,this._pt.r=mw):m!==p&&p!=="%"&&(this._pt.b=c,this._pt.r=pw);else if(_ in a)Tw.call(this,e,_,c,y?y+h:h);else if(_ in e)this.add(e,_,c||e[_],y?y+h:h,i,r);else if(_!=="parseTransform"){vd(_,h);continue}b||(_ in a?P.push(_,0,a[_]):typeof e[_]=="function"?P.push(_,2,e[_]()):P.push(_,1,c||e[_])),o.push(_)}}A&&xg(this)},render:function(e,t){if(t.tween._time||!Id())for(var n=t._pt;n;)n.r(e,n.d),n=n._next;else t.styles.revert()},get:ys,aliases:Ji,getSetter:function(e,t,n){var i=Ji[t];return i&&i.indexOf(",")<0&&(t=i),t in Is&&t!==ii&&(e._gsap.x||ys(e,"x"))?n&&_p===n?t==="scale"?vw:yw:(_p=n||{})&&(t==="scale"?bw:Sw):e.style&&!_d(e.style[t])?_w:~t.indexOf("-")?xw:Rd(e,t)},core:{_removeProperty:Ks,_getMatrix:Dd}};ri.utils.checkPrefix=ko;ri.core.getStyleSaver=Mg;(function(s,e,t,n){var i=ti(s+","+e+","+t,function(r){Is[r]=1});ti(e,function(r){xi.units[r]="deg",Ag[r]=1}),Ji[i[13]]=s+","+e,ti(n,function(r){var o=r.split(":");Ji[o[1]]=i[o[0]]})})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent","rotation,rotationX,rotationY,skewX,skewY","transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective","0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");ti("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective",function(s){xi.units[s]="px"});ri.registerPlugin(Pg);var Yl=ri.registerPlugin(Pg)||ri;Yl.core.Tween;class Dw extends tr{constructor(e){super(e)}load(e,t,n,i){const r=this,o=new Ca(this.manager);o.setPath(this.path),o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,function(a){try{t(r.parse(a))}catch(l){i?i(l):console.error(l),r.manager.itemError(e)}},n,i)}parse(e){function t(c){const h=new DataView(c),u=32/8*3+32/8*3*3+16/8,d=h.getUint32(80,!0);if(80+32/8+d*u===h.byteLength)return!0;const g=[115,111,108,105,100];for(let _=0;_<5;_++)if(n(g,h,_))return!1;return!0}function n(c,h,u){for(let d=0,f=c.length;d<f;d++)if(c[d]!==h.getUint8(u+d))return!1;return!0}function i(c){const h=new DataView(c),u=h.getUint32(80,!0);let d,f,g,_=!1,m,p,y,b,v;for(let L=0;L<70;L++)h.getUint32(L,!1)==1129270351&&h.getUint8(L+4)==82&&h.getUint8(L+5)==61&&(_=!0,m=new Float32Array(u*3*3),p=h.getUint8(L+6)/255,y=h.getUint8(L+7)/255,b=h.getUint8(L+8)/255,v=h.getUint8(L+9)/255);const M=84,E=50,A=new zt,P=new Float32Array(u*3*3),S=new Float32Array(u*3*3),T=new ke;for(let L=0;L<u;L++){const k=M+L*E,H=h.getFloat32(k,!0),Y=h.getFloat32(k+4,!0),W=h.getFloat32(k+8,!0);if(_){const j=h.getUint16(k+48,!0);(j&32768)===0?(d=(j&31)/31,f=(j>>5&31)/31,g=(j>>10&31)/31):(d=p,f=y,g=b)}for(let j=1;j<=3;j++){const V=k+j*12,q=L*3*3+(j-1)*3;P[q]=h.getFloat32(V,!0),P[q+1]=h.getFloat32(V+4,!0),P[q+2]=h.getFloat32(V+8,!0),S[q]=H,S[q+1]=Y,S[q+2]=W,_&&(T.setRGB(d,f,g,Qt),m[q]=T.r,m[q+1]=T.g,m[q+2]=T.b)}}return A.setAttribute("position",new Et(P,3)),A.setAttribute("normal",new Et(S,3)),_&&(A.setAttribute("color",new Et(m,3)),A.hasColors=!0,A.alpha=v),A}function r(c){const h=new zt,u=/solid([\s\S]*?)endsolid/g,d=/facet([\s\S]*?)endfacet/g,f=/solid\s(.+)/;let g=0;const _=/[\s]+([+-]?(?:\d*)(?:\.\d*)?(?:[eE][+-]?\d+)?)/.source,m=new RegExp("vertex"+_+_+_,"g"),p=new RegExp("normal"+_+_+_,"g"),y=[],b=[],v=[],M=new D;let E,A=0,P=0,S=0;for(;(E=u.exec(c))!==null;){P=S;const T=E[0],L=(E=f.exec(T))!==null?E[1]:"";for(v.push(L);(E=d.exec(T))!==null;){let Y=0,W=0;const j=E[0];for(;(E=p.exec(j))!==null;)M.x=parseFloat(E[1]),M.y=parseFloat(E[2]),M.z=parseFloat(E[3]),W++;for(;(E=m.exec(j))!==null;)y.push(parseFloat(E[1]),parseFloat(E[2]),parseFloat(E[3])),b.push(M.x,M.y,M.z),Y++,S++;W!==1&&console.error("THREE.STLLoader: Something isn't right with the normal of face number "+g),Y!==3&&console.error("THREE.STLLoader: Something isn't right with the vertices of face number "+g),g++}const k=P,H=S-P;h.userData.groupNames=v,h.addGroup(k,H,A),A++}return h.setAttribute("position",new Ct(y,3)),h.setAttribute("normal",new Ct(b,3)),h}function o(c){return typeof c!="string"?new TextDecoder().decode(c):c}function a(c){if(typeof c=="string"){const h=new Uint8Array(c.length);for(let u=0;u<c.length;u++)h[u]=c.charCodeAt(u)&255;return h.buffer||h}else return c}const l=a(e);return t(l)?i(l):r(o(e))}}function Tp(s,e){if(e===C_)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===pu||e===cm){let t=s.getIndex();if(t===null){const o=[],a=s.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);s.setIndex(o),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}const n=t.count-2,i=[];if(e===pu)for(let o=1;o<=n;o++)i.push(t.getX(0)),i.push(t.getX(o)),i.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(i.push(t.getX(o)),i.push(t.getX(o+1)),i.push(t.getX(o+2))):(i.push(t.getX(o+2)),i.push(t.getX(o+1)),i.push(t.getX(o)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=s.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}class Nw extends tr{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Bw(t)}),this.register(function(t){return new zw(t)}),this.register(function(t){return new qw(t)}),this.register(function(t){return new Zw(t)}),this.register(function(t){return new Kw(t)}),this.register(function(t){return new Vw(t)}),this.register(function(t){return new Gw(t)}),this.register(function(t){return new Ww(t)}),this.register(function(t){return new Xw(t)}),this.register(function(t){return new kw(t)}),this.register(function(t){return new jw(t)}),this.register(function(t){return new Hw(t)}),this.register(function(t){return new $w(t)}),this.register(function(t){return new Yw(t)}),this.register(function(t){return new Fw(t)}),this.register(function(t){return new Qw(t)}),this.register(function(t){return new Jw(t)})}load(e,t,n,i){const r=this;let o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){const c=_a.extractUrlBase(e);o=_a.resolveURL(c,this.path)}else o=_a.extractUrlBase(e);this.manager.itemStart(e);const a=function(c){i?i(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new Ca(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,o,function(h){t(h),r.manager.itemEnd(e)},a)}catch(h){a(h)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r;const o={},a={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Ig){try{o[gt.KHR_BINARY_GLTF]=new eE(e)}catch(u){i&&i(u);return}r=JSON.parse(o[gt.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new fE(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[u.name]=u,o[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){const u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case gt.KHR_MATERIALS_UNLIT:o[u]=new Ow;break;case gt.KHR_DRACO_MESH_COMPRESSION:o[u]=new tE(r,this.dracoLoader);break;case gt.KHR_TEXTURE_TRANSFORM:o[u]=new nE;break;case gt.KHR_MESH_QUANTIZATION:o[u]=new iE;break;default:d.indexOf(u)>=0&&a[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}}function Uw(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}const gt={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class Fw{constructor(e){this.parser=e,this.name=gt.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let c;const h=new ke(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],kn);const u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new fd(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new ix(h),c.distance=u;break;case"spot":c=new tx(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),Xi(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),i=Promise.resolve(c),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}}let Ow=class{constructor(){this.name=gt.KHR_MATERIALS_UNLIT}getMaterialType(){return ki}extendParams(e,t,n){const i=[];e.color=new ke(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],kn),e.opacity=o[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,Qt))}return Promise.all(i)}},kw=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}},Bw=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:hs}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){const a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Ne(a,a)}return Promise.all(r)}},zw=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:hs}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}},Hw=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:hs}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}},Vw=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:hs}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new ke(0,0,0),t.sheenRoughness=0,t.sheen=1;const o=i.extensions[this.name];if(o.sheenColorFactor!==void 0){const a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],kn)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,Qt)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}},Gw=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:hs}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}},Ww=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:hs}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;const a=o.attenuationColor||[1,1,1];return t.attenuationColor=new ke().setRGB(a[0],a[1],a[2],kn),Promise.all(r)}},Xw=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:hs}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}},jw=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:hs}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));const a=o.specularColorFactor||[1,1,1];return t.specularColor=new ke().setRGB(a[0],a[1],a[2],kn),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,Qt)),Promise.all(r)}},Yw=class{constructor(e){this.parser=e,this.name=gt.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:hs}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}},$w=class{constructor(e){this.parser=e,this.name=gt.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:hs}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}};class qw{constructor(e){this.parser=e,this.name=gt.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const r=i.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}}class Zw{constructor(e){this.parser=e,this.name=gt.EXT_TEXTURE_WEBP}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=i.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}}class Kw{constructor(e){this.parser=e,this.name=gt.EXT_TEXTURE_AVIF}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=i.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}}class Qw{constructor(e){this.name=gt.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){const l=i.byteOffset||0,c=i.byteLength||0,h=i.count,u=i.byteStride,d=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(h,u,d,i.mode,i.filter).then(function(f){return f.buffer}):o.ready.then(function(){const f=new ArrayBuffer(h*u);return o.decodeGltfBuffer(new Uint8Array(f),h,u,d,i.mode,i.filter),f})})}else return null}}let Jw=class{constructor(e){this.name=gt.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const c of i.primitives)if(c.mode!==wi.TRIANGLES&&c.mode!==wi.TRIANGLE_STRIP&&c.mode!==wi.TRIANGLE_FAN&&c.mode!==void 0)return null;const o=n.extensions[this.name].attributes,a=[],l={};for(const c in o)a.push(this.parser.getDependency("accessor",o[c]).then(h=>(l[c]=h,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{const h=c.pop(),u=h.isGroup?h.children:[h],d=c[0].count,f=[];for(const g of u){const _=new Ye,m=new D,p=new Ut,y=new D(1,1,1),b=new C0(g.geometry,g.material,d);for(let v=0;v<d;v++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,v),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,v),l.SCALE&&y.fromBufferAttribute(l.SCALE,v),b.setMatrixAt(v,_.compose(m,p,y));for(const v in l)if(v==="_COLOR_0"){const M=l[v];b.instanceColor=new _u(M.array,M.itemSize,M.normalized)}else v!=="TRANSLATION"&&v!=="ROTATION"&&v!=="SCALE"&&g.geometry.setAttribute(v,l[v]);Ft.prototype.copy.call(b,g),this.parser.assignFinalMaterial(b),f.push(b)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}};const Ig="glTF",ia=12,Ap={JSON:1313821514,BIN:5130562};class eE{constructor(e){this.name=gt.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,ia),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Ig)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-ia,r=new DataView(e,ia);let o=0;for(;o<i;){const a=r.getUint32(o,!0);o+=4;const l=r.getUint32(o,!0);if(o+=4,l===Ap.JSON){const c=new Uint8Array(e,ia+o,a);this.content=n.decode(c)}else if(l===Ap.BIN){const c=ia+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class tE{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=gt.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(const h in o){const u=Fu[h]||h.toLowerCase();a[u]=o[h]}for(const h in e.attributes){const u=Fu[h]||h.toLowerCase();if(o[h]!==void 0){const d=n.accessors[e.attributes[h]],f=vo[d.componentType];c[u]=f.name,l[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){i.decodeDracoFile(h,function(f){for(const g in f.attributes){const _=f.attributes[g],m=l[g];m!==void 0&&(_.normalized=m)}u(f)},a,c,kn,d)})})}}class nE{constructor(){this.name=gt.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class iE{constructor(){this.name=gt.KHR_MESH_QUANTIZATION}}class Lg extends Ba{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let o=0;o!==i;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,h=i-t,u=(n-t)/h,d=u*u,f=d*u,g=e*c,_=g-c,m=-2*f+3*d,p=f-d,y=1-m,b=p-d+u;for(let v=0;v!==a;v++){const M=o[_+v+a],E=o[_+v+l]*h,A=o[g+v+a],P=o[g+v]*h;r[v]=y*M+b*E+m*A+p*P}return r}}const sE=new Ut;class rE extends Lg{interpolate_(e,t,n,i){const r=super.interpolate_(e,t,n,i);return sE.fromArray(r).normalize().toArray(r),r}}const wi={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},vo={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Rp={9728:fn,9729:pn,9984:ju,9985:pa,9986:lo,9987:Zi},Cp={33071:Oi,33648:Ma,10497:Pr},hh={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Fu={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Bs={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},oE={CUBICSPLINE:void 0,LINEAR:To,STEP:Eo},uh={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function aE(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new ud({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:As})),s.DefaultMaterial}function fr(s,e,t){for(const n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Xi(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function lE(s,e,t){let n=!1,i=!1,r=!1;for(let c=0,h=e.length;c<h;c++){const u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);const o=[],a=[],l=[];for(let c=0,h=e.length;c<h;c++){const u=e[c];if(n){const d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):s.attributes.position;o.push(d)}if(i){const d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):s.attributes.normal;a.push(d)}if(r){const d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):s.attributes.color;l.push(d)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){const h=c[0],u=c[1],d=c[2];return n&&(s.morphAttributes.position=h),i&&(s.morphAttributes.normal=u),r&&(s.morphAttributes.color=d),s.morphTargetsRelative=!0,s})}function cE(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function hE(s){let e;const t=s.extensions&&s.extensions[gt.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+dh(t.attributes):e=s.indices+":"+dh(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+dh(s.targets[n]);return e}function dh(s){let e="";const t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function Ou(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function uE(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const dE=new Ye;class fE{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new Uw,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,o=-1;if(typeof navigator<"u"){const a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;const l=a.match(/Version\/(\d+)/);i=n&&l?parseInt(l[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&o<98?this.textureLoader=new Q0(this.options.manager):this.textureLoader=new rx(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Ca(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){const a={scene:o[0][i.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:i.asset,parser:n,userData:{}};return fr(r,a,i),Xi(a,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(const l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){const o=t[i].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let i=0,r=e.length;i<r;i++){const o=e[i];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),r=(o,a)=>{const l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(const[c,h]of o.children.entries())r(h,a.children[c])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[gt.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(r,o){n.load(_a.resolveURL(t.uri,i.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const o=hh[i.type],a=vo[i.componentType],l=i.normalized===!0,c=new a(i.count*o);return Promise.resolve(new Et(c,o,l))}const r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(o){const a=o[0],l=hh[i.type],c=vo[i.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,d=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,g=i.normalized===!0;let _,m;if(f&&f!==u){const p=Math.floor(d/f),y="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count;let b=t.cache.get(y);b||(_=new c(a,p*f,i.count*f/h),b=new vm(_,f/h),t.cache.add(y,b)),m=new lc(b,l,d%f/h,g)}else a===null?_=new c(i.count*l):_=new c(a,d,i.count*l),m=new Et(_,l,g);if(i.sparse!==void 0){const p=hh.SCALAR,y=vo[i.sparse.indices.componentType],b=i.sparse.indices.byteOffset||0,v=i.sparse.values.byteOffset||0,M=new y(o[1],b,i.sparse.count*p),E=new c(o[2],v,i.sparse.count*l);a!==null&&(m=new Et(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let A=0,P=M.length;A<P;A++){const S=M[A];if(m.setX(S,E[A*l]),l>=2&&m.setY(S,E[A*l+1]),l>=3&&m.setZ(S,E[A*l+2]),l>=4&&m.setW(S,E[A*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r];let a=this.textureLoader;if(o.uri){const l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){const i=this,r=this.json,o=r.textures[e],a=r.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=o.name||a.name||"",h.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(h.name=a.uri);const d=(r.samplers||{})[o.sampler]||{};return h.magFilter=Rp[d.magFilter]||pn,h.minFilter=Rp[d.minFilter]||Zi,h.wrapS=Cp[d.wrapS]||Pr,h.wrapT=Cp[d.wrapT]||Pr,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==fn&&h.minFilter!==pn,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){const n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());const o=i.images[e],a=self.URL||self.webkitURL;let l=o.uri||"",c=!1;if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(u){c=!0;const d=new Blob([u],{type:o.mimeType});return l=a.createObjectURL(d),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const h=Promise.resolve(l).then(function(u){return new Promise(function(d,f){let g=d;t.isImageBitmapLoader===!0&&(g=function(_){const m=new yn(_);m.needsUpdate=!0,d(m)}),t.load(_a.resolveURL(u,r.path),g,void 0,f)})}).then(function(u){return c===!0&&a.revokeObjectURL(l),Xi(u,o),u.userData.mimeType=o.mimeType||uE(o.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){const r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[gt.KHR_TEXTURE_TRANSFORM]){const a=n.extensions!==void 0?n.extensions[gt.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const l=r.associations.get(o);o=r.extensions[gt.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,l)}}return i!==void 0&&(o.colorSpace=i),e[t]=o,o})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){const a="PointsMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new Sm,zi.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){const a="LineBasicMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new Ls,zi.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(i||r||o){let a="ClonedMaterial:"+n.uuid+":";i&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return ud}loadMaterial(e){const t=this,n=this.json,i=this.extensions,r=n.materials[e];let o;const a={},l=r.extensions||{},c=[];if(l[gt.KHR_MATERIALS_UNLIT]){const u=i[gt.KHR_MATERIALS_UNLIT];o=u.getMaterialType(),c.push(u.extendParams(a,r,t))}else{const u=r.pbrMetallicRoughness||{};if(a.color=new ke(1,1,1),a.opacity=1,Array.isArray(u.baseColorFactor)){const d=u.baseColorFactor;a.color.setRGB(d[0],d[1],d[2],kn),a.opacity=d[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",u.baseColorTexture,Qt)),a.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,a.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",u.metallicRoughnessTexture))),o=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=Jn);const h=r.alphaMode||uh.OPAQUE;if(h===uh.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,h===uh.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==ki&&(c.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new Ne(1,1),r.normalTexture.scale!==void 0)){const u=r.normalTexture.scale;a.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&o!==ki&&(c.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==ki){const u=r.emissiveFactor;a.emissive=new ke().setRGB(u[0],u[1],u[2],kn)}return r.emissiveTexture!==void 0&&o!==ki&&c.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,Qt)),Promise.all(c).then(function(){const u=new o(a);return r.name&&(u.name=r.name),Xi(u,r),t.associations.set(u,{materials:e}),r.extensions&&fr(i,u,r),u})}createUniqueName(e){const t=Tt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function r(a){return n[gt.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return Pp(l,a,t)})}const o=[];for(let a=0,l=e.length;a<l;a++){const c=e[a],h=hE(c),u=i[h];if(u)o.push(u.promise);else{let d;c.extensions&&c.extensions[gt.KHR_DRACO_MESH_COMPRESSION]?d=r(c):d=Pp(new zt,c,t),i[h]={primitive:c,promise:d},o.push(d)}}return Promise.all(o)}loadMesh(e){const t=this,n=this.json,i=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let l=0,c=o.length;l<c;l++){const h=o[l].material===void 0?aE(this.cache):this.getDependency("material",o[l].material);a.push(h)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(l){const c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let f=0,g=h.length;f<g;f++){const _=h[f],m=o[f];let p;const y=c[f];if(m.mode===wi.TRIANGLES||m.mode===wi.TRIANGLE_STRIP||m.mode===wi.TRIANGLE_FAN||m.mode===void 0)p=r.isSkinnedMesh===!0?new T0(_,y):new ve(_,y),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===wi.TRIANGLE_STRIP?p.geometry=Tp(p.geometry,cm):m.mode===wi.TRIANGLE_FAN&&(p.geometry=Tp(p.geometry,pu));else if(m.mode===wi.LINES)p=new zo(_,y);else if(m.mode===wi.LINE_STRIP)p=new Ei(_,y);else if(m.mode===wi.LINE_LOOP)p=new D0(_,y);else if(m.mode===wi.POINTS)p=new N0(_,y);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&cE(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),Xi(p,r),m.extensions&&fr(i,p,m),t.assignFinalMaterial(p),u.push(p)}for(let f=0,g=u.length;f<g;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return r.extensions&&fr(i,u[0],r),u[0];const d=new Qi;r.extensions&&fr(i,d,r),t.associations.set(d,{meshes:e});for(let f=0,g=u.length;f<g;f++)d.add(u[f]);return d})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Wn(Ro.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new za(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Xi(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const r=i.pop(),o=i,a=[],l=[];for(let c=0,h=o.length;c<h;c++){const u=o[c];if(u){a.push(u);const d=new Ye;r!==null&&d.fromArray(r.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new od(a,l)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,o=[],a=[],l=[],c=[],h=[];for(let u=0,d=i.channels.length;u<d;u++){const f=i.channels[u],g=i.samplers[f.sampler],_=f.target,m=_.node,p=i.parameters!==void 0?i.parameters[g.input]:g.input,y=i.parameters!==void 0?i.parameters[g.output]:g.output;_.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",y)),c.push(g),h.push(_))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){const d=u[0],f=u[1],g=u[2],_=u[3],m=u[4],p=[];for(let b=0,v=d.length;b<v;b++){const M=d[b],E=f[b],A=g[b],P=_[b],S=m[b];if(M===void 0)continue;M.updateMatrix&&M.updateMatrix();const T=n._createAnimationTracks(M,E,A,P,S);if(T)for(let L=0;L<T.length;L++)p.push(T[L])}const y=new X0(r,void 0,p);return Xi(y,i),y})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){const o=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=i.weights.length;l<c;l++)a.morphTargetInfluences[l]=i.weights[l]}),o})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=i.children||[];for(let c=0,h=a.length;c<h;c++)o.push(n.getDependency("node",a[c]));const l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(o),l]).then(function(c){const h=c[0],u=c[1],d=c[2];d!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(d,dE)});for(let f=0,g=u.length;f<g;f++)h.add(u[f]);return h})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],o=r.name?i.createUniqueName(r.name):"",a=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),r.camera!==void 0&&a.push(i.getDependency("camera",r.camera).then(function(c){return i._getNodeRef(i.cameraCache,r.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let h;if(r.isBone===!0?h=new bm:c.length>1?h=new Qi:c.length===1?h=c[0]:h=new Ft,h!==c[0])for(let u=0,d=c.length;u<d;u++)h.add(c[u]);if(r.name&&(h.userData.name=r.name,h.name=o),Xi(h,r),r.extensions&&fr(n,h,r),r.matrix!==void 0){const u=new Ye;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!i.associations.has(h))i.associations.set(h,{});else if(r.mesh!==void 0&&i.meshCache.refs[r.mesh]>1){const u=i.associations.get(h);i.associations.set(h,{...u})}return i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,r=new Qi;n.name&&(r.name=i.createUniqueName(n.name)),Xi(r,n),n.extensions&&fr(t,r,n);const o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(i.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let h=0,u=l.length;h<u;h++)r.add(l[h]);const c=h=>{const u=new Map;for(const[d,f]of i.associations)(d instanceof zi||d instanceof yn)&&u.set(d,f);return h.traverse(d=>{const f=i.associations.get(d);f!=null&&u.set(d,f)}),u};return i.associations=c(r),r})}_createAnimationTracks(e,t,n,i,r){const o=[],a=e.name?e.name:e.uuid,l=[];Bs[r.path]===Bs.weights?e.traverse(function(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}):l.push(a);let c;switch(Bs[r.path]){case Bs.weights:c=Po;break;case Bs.rotation:c=Io;break;case Bs.translation:case Bs.scale:c=Lo;break;default:n.itemSize===1?c=Po:c=Lo;break}const h=i.interpolation!==void 0?oE[i.interpolation]:To,u=this._getArrayFromAccessor(n);for(let d=0,f=l.length;d<f;d++){const g=new c(l[d]+"."+Bs[r.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=Ou(t.constructor),i=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof Io?rE:Lg;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function pE(s,e,t){const n=e.attributes,i=new qn;if(n.POSITION!==void 0){const a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(i.set(new D(l[0],l[1],l[2]),new D(c[0],c[1],c[2])),a.normalized){const h=Ou(vo[a.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const a=new D,l=new D;for(let c=0,h=r.length;c<h;c++){const u=r[c];if(u.POSITION!==void 0){const d=t.json.accessors[u.POSITION],f=d.min,g=d.max;if(f!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),d.normalized){const _=Ou(vo[d.componentType]);l.multiplyScalar(_)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(a)}s.boundingBox=i;const o=new cs;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=o}function Pp(s,e,t){const n=e.attributes,i=[];function r(o,a){return t.getDependency("accessor",o).then(function(l){s.setAttribute(a,l)})}for(const o in n){const a=Fu[o]||o.toLowerCase();a in s.attributes||i.push(r(n[o],a))}if(e.indices!==void 0&&!s.index){const o=t.getDependency("accessor",e.indices).then(function(a){s.setIndex(a)});i.push(o)}return xt.workingColorSpace!==kn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${xt.workingColorSpace}" not supported.`),Xi(s,e),pE(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?lE(s,e.targets,t):s})}const fh=new WeakMap;class mE extends tr{constructor(e){super(e),this.decoderPath="",this.decoderConfig={},this.decoderBinary=null,this.decoderPending=null,this.workerLimit=4,this.workerPool=[],this.workerNextTaskID=1,this.workerSourceURL="",this.defaultAttributeIDs={position:"POSITION",normal:"NORMAL",color:"COLOR",uv:"TEX_COORD"},this.defaultAttributeTypes={position:"Float32Array",normal:"Float32Array",color:"Float32Array",uv:"Float32Array"}}setDecoderPath(e){return this.decoderPath=e,this}setDecoderConfig(e){return this.decoderConfig=e,this}setWorkerLimit(e){return this.workerLimit=e,this}load(e,t,n,i){const r=new Ca(this.manager);r.setPath(this.path),r.setResponseType("arraybuffer"),r.setRequestHeader(this.requestHeader),r.setWithCredentials(this.withCredentials),r.load(e,o=>{this.parse(o,t,i)},n,i)}parse(e,t,n=()=>{}){this.decodeDracoFile(e,t,null,null,Qt,n).catch(n)}decodeDracoFile(e,t,n,i,r=kn,o=()=>{}){const a={attributeIDs:n||this.defaultAttributeIDs,attributeTypes:i||this.defaultAttributeTypes,useUniqueIDs:!!n,vertexColorSpace:r};return this.decodeGeometry(e,a).then(t).catch(o)}decodeGeometry(e,t){const n=JSON.stringify(t);if(fh.has(e)){const l=fh.get(e);if(l.key===n)return l.promise;if(e.byteLength===0)throw new Error("THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.")}let i;const r=this.workerNextTaskID++,o=e.byteLength,a=this._getWorker(r,o).then(l=>(i=l,new Promise((c,h)=>{i._callbacks[r]={resolve:c,reject:h},i.postMessage({type:"decode",id:r,taskConfig:t,buffer:e},[e])}))).then(l=>this._createGeometry(l.geometry));return a.catch(()=>!0).then(()=>{i&&r&&this._releaseTask(i,r)}),fh.set(e,{key:n,promise:a}),a}_createGeometry(e){const t=new zt;e.index&&t.setIndex(new Et(e.index.array,1));for(let n=0;n<e.attributes.length;n++){const{name:i,array:r,itemSize:o,stride:a,vertexColorSpace:l}=e.attributes[n];let c;if(o===a)c=new Et(r,o);else{const h=new vm(r,a);c=new lc(h,o,0)}i==="color"&&(this._assignVertexColorSpace(c,l),c.normalized=!(r instanceof Float32Array)),t.setAttribute(i,c)}return t}_assignVertexColorSpace(e,t){if(t!==Qt)return;const n=new ke;for(let i=0,r=e.count;i<r;i++)n.fromBufferAttribute(e,i),xt.colorSpaceToWorking(n,Qt),e.setXYZ(i,n.r,n.g,n.b)}_loadLibrary(e,t){const n=new Ca(this.manager);return n.setPath(this.decoderPath),n.setResponseType(t),n.setWithCredentials(this.withCredentials),new Promise((i,r)=>{n.load(e,i,void 0,r)})}preload(){return this._initDecoder(),this}_initDecoder(){if(this.decoderPending)return this.decoderPending;const e=typeof WebAssembly!="object"||this.decoderConfig.type==="js",t=[];return e?t.push(this._loadLibrary("draco_decoder.js","text")):(t.push(this._loadLibrary("draco_wasm_wrapper.js","text")),t.push(this._loadLibrary("draco_decoder.wasm","arraybuffer"))),this.decoderPending=Promise.all(t).then(n=>{const i=n[0];e||(this.decoderConfig.wasmBinary=n[1]);const r=gE.toString(),o=["/* draco decoder */",i,"","/* worker */",r.substring(r.indexOf("{")+1,r.lastIndexOf("}"))].join(`
`);this.workerSourceURL=URL.createObjectURL(new Blob([o]))}),this.decoderPending}_getWorker(e,t){return this._initDecoder().then(()=>{if(this.workerPool.length<this.workerLimit){const i=new Worker(this.workerSourceURL);i._callbacks={},i._taskCosts={},i._taskLoad=0,i.postMessage({type:"init",decoderConfig:this.decoderConfig}),i.onmessage=function(r){const o=r.data;switch(o.type){case"decode":i._callbacks[o.id].resolve(o);break;case"error":i._callbacks[o.id].reject(o);break;default:console.error('THREE.DRACOLoader: Unexpected message, "'+o.type+'"')}},this.workerPool.push(i)}else this.workerPool.sort(function(i,r){return i._taskLoad>r._taskLoad?-1:1});const n=this.workerPool[this.workerPool.length-1];return n._taskCosts[e]=t,n._taskLoad+=t,n})}_releaseTask(e,t){e._taskLoad-=e._taskCosts[t],delete e._callbacks[t],delete e._taskCosts[t]}debug(){console.log("Task load: ",this.workerPool.map(e=>e._taskLoad))}dispose(){for(let e=0;e<this.workerPool.length;++e)this.workerPool[e].terminate();return this.workerPool.length=0,this.workerSourceURL!==""&&URL.revokeObjectURL(this.workerSourceURL),this}}function gE(){let s,e;onmessage=function(o){const a=o.data;switch(a.type){case"init":s=a.decoderConfig,e=new Promise(function(h){s.onModuleLoaded=function(u){h({draco:u})},DracoDecoderModule(s)});break;case"decode":const l=a.buffer,c=a.taskConfig;e.then(h=>{const u=h.draco,d=new u.Decoder;try{const f=t(u,d,new Int8Array(l),c),g=f.attributes.map(_=>_.array.buffer);f.index&&g.push(f.index.array.buffer),self.postMessage({type:"decode",id:a.id,geometry:f},g)}catch(f){console.error(f),self.postMessage({type:"error",id:a.id,error:f.message})}finally{u.destroy(d)}});break}};function t(o,a,l,c){const h=c.attributeIDs,u=c.attributeTypes;let d,f;const g=a.GetEncodedGeometryType(l);if(g===o.TRIANGULAR_MESH)d=new o.Mesh,f=a.DecodeArrayToMesh(l,l.byteLength,d);else if(g===o.POINT_CLOUD)d=new o.PointCloud,f=a.DecodeArrayToPointCloud(l,l.byteLength,d);else throw new Error("THREE.DRACOLoader: Unexpected geometry type.");if(!f.ok()||d.ptr===0)throw new Error("THREE.DRACOLoader: Decoding failed: "+f.error_msg());const _={index:null,attributes:[]};for(const m in h){const p=self[u[m]];let y,b;if(c.useUniqueIDs)b=h[m],y=a.GetAttributeByUniqueId(d,b);else{if(b=a.GetAttributeId(d,o[h[m]]),b===-1)continue;y=a.GetAttribute(d,b)}const v=i(o,a,d,m,p,y);m==="color"&&(v.vertexColorSpace=c.vertexColorSpace),_.attributes.push(v)}return g===o.TRIANGULAR_MESH&&(_.index=n(o,a,d)),o.destroy(d),_}function n(o,a,l){const h=l.num_faces()*3,u=h*4,d=o._malloc(u);a.GetTrianglesUInt32Array(l,u,d);const f=new Uint32Array(o.HEAPF32.buffer,d,h).slice();return o._free(d),{array:f,itemSize:1}}function i(o,a,l,c,h,u){const d=l.num_points(),f=u.num_components(),g=r(o,h),_=f*h.BYTES_PER_ELEMENT,m=Math.ceil(_/4)*4,p=m/h.BYTES_PER_ELEMENT,y=d*_,b=d*m,v=o._malloc(y);a.GetAttributeDataArrayForAllPoints(l,u,g,y,v);const M=new h(o.HEAPF32.buffer,v,y/h.BYTES_PER_ELEMENT);let E;if(_===m)E=M.slice();else{E=new h(b/h.BYTES_PER_ELEMENT);let A=0;for(let P=0,S=M.length;P<S;P++){for(let T=0;T<f;T++)E[A+T]=M[P*f+T];A+=p}}return o._free(v),{name:c,count:d,itemSize:f,array:E,stride:p}}function r(o,a){switch(a){case Float32Array:return o.DT_FLOAT32;case Int8Array:return o.DT_INT8;case Int16Array:return o.DT_INT16;case Int32Array:return o.DT_INT32;case Uint8Array:return o.DT_UINT8;case Uint16Array:return o.DT_UINT16;case Uint32Array:return o.DT_UINT32}}}const Ip={type:"change"},Nd={type:"start"},Dg={type:"end"},xl=new Bo,Lp=new Ti,_E=Math.cos(70*Ro.DEG2RAD),mn=new D,Qn=2*Math.PI,Bt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},ph=1e-6;class xE extends Am{constructor(e,t=null){super(e,t),this.state=Bt.NONE,this.target=new D,this.cursor=new D,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:po.ROTATE,MIDDLE:po.DOLLY,RIGHT:po.PAN},this.touches={ONE:ao.ROTATE,TWO:ao.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new D,this._lastQuaternion=new Ut,this._lastTargetPosition=new D,this._quat=new Ut().setFromUnitVectors(e.up,new D(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Ff,this._sphericalDelta=new Ff,this._scale=1,this._panOffset=new D,this._rotateStart=new Ne,this._rotateEnd=new Ne,this._rotateDelta=new Ne,this._panStart=new Ne,this._panEnd=new Ne,this._panDelta=new Ne,this._dollyStart=new Ne,this._dollyEnd=new Ne,this._dollyDelta=new Ne,this._dollyDirection=new D,this._mouse=new Ne,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=vE.bind(this),this._onPointerDown=yE.bind(this),this._onPointerUp=bE.bind(this),this._onContextMenu=RE.bind(this),this._onMouseWheel=wE.bind(this),this._onKeyDown=EE.bind(this),this._onTouchStart=TE.bind(this),this._onTouchMove=AE.bind(this),this._onMouseDown=SE.bind(this),this._onMouseMove=ME.bind(this),this._interceptControlDown=CE.bind(this),this._interceptControlUp=PE.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Ip),this.update(),this.state=Bt.NONE}update(e=null){const t=this.object.position;mn.copy(t).sub(this.target),mn.applyQuaternion(this._quat),this._spherical.setFromVector3(mn),this.autoRotate&&this.state===Bt.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,i=this.maxAzimuthAngle;isFinite(n)&&isFinite(i)&&(n<-Math.PI?n+=Qn:n>Math.PI&&(n-=Qn),i<-Math.PI?i+=Qn:i>Math.PI&&(i-=Qn),n<=i?this._spherical.theta=Math.max(n,Math.min(i,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+i)/2?Math.max(n,this._spherical.theta):Math.min(i,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(mn.setFromSpherical(this._spherical),mn.applyQuaternion(this._quatInverse),t.copy(this.target).add(mn),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=mn.length();o=this._clampDistance(a*this._scale);const l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){const a=new D(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;const c=new D(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=mn.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(xl.origin.copy(this.object.position),xl.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(xl.direction))<_E?this.object.lookAt(this.target):(Lp.setFromNormalAndCoplanarPoint(this.object.up,this.target),xl.intersectPlane(Lp,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>ph||8*(1-this._lastQuaternion.dot(this.object.quaternion))>ph||this._lastTargetPosition.distanceToSquared(this.target)>ph?(this.dispatchEvent(Ip),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?Qn/60*this.autoRotateSpeed*e:Qn/60/60*this.autoRotateSpeed}_getZoomScale(e){const t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){mn.setFromMatrixColumn(t,0),mn.multiplyScalar(-e),this._panOffset.add(mn)}_panUp(e,t){this.screenSpacePanning===!0?mn.setFromMatrixColumn(t,1):(mn.setFromMatrixColumn(t,0),mn.crossVectors(this.object.up,mn)),mn.multiplyScalar(e),this._panOffset.add(mn)}_pan(e,t){const n=this.domElement;if(this.object.isPerspectiveCamera){const i=this.object.position;mn.copy(i).sub(this.target);let r=mn.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/n.clientHeight,this.object.matrix),this._panUp(2*t*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),i=e-n.left,r=t-n.top,o=n.width,a=n.height;this._mouse.x=i/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Qn*this._rotateDelta.x/t.clientHeight),this._rotateUp(Qn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(Qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-Qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(Qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-Qn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._rotateStart.set(n,i)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._panStart.set(n,i)}}_handleTouchStartDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,i=e.pageY-t.y,r=Math.sqrt(n*n+i*i);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{const n=this._getSecondPointerPosition(e),i=.5*(e.pageX+n.x),r=.5*(e.pageY+n.y);this._rotateEnd.set(i,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const t=this.domElement;this._rotateLeft(Qn*this._rotateDelta.x/t.clientHeight),this._rotateUp(Qn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{const t=this._getSecondPointerPosition(e),n=.5*(e.pageX+t.x),i=.5*(e.pageY+t.y);this._panEnd.set(n,i)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){const t=this._getSecondPointerPosition(e),n=e.pageX-t.x,i=e.pageY-t.y,r=Math.sqrt(n*n+i*i);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(e.pageX+t.x)*.5,a=(e.pageY+t.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Ne,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){const t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){const t=e.deltaMode,n={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function yE(s){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(s.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(s)&&(this._addPointer(s),s.pointerType==="touch"?this._onTouchStart(s):this._onMouseDown(s)))}function vE(s){this.enabled!==!1&&(s.pointerType==="touch"?this._onTouchMove(s):this._onMouseMove(s))}function bE(s){switch(this._removePointer(s),this._pointers.length){case 0:this.domElement.releasePointerCapture(s.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Dg),this.state=Bt.NONE;break;case 1:const e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function SE(s){let e;switch(s.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case po.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(s),this.state=Bt.DOLLY;break;case po.ROTATE:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=Bt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=Bt.ROTATE}break;case po.PAN:if(s.ctrlKey||s.metaKey||s.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(s),this.state=Bt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(s),this.state=Bt.PAN}break;default:this.state=Bt.NONE}this.state!==Bt.NONE&&this.dispatchEvent(Nd)}function ME(s){switch(this.state){case Bt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(s);break;case Bt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(s);break;case Bt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(s);break}}function wE(s){this.enabled===!1||this.enableZoom===!1||this.state!==Bt.NONE||(s.preventDefault(),this.dispatchEvent(Nd),this._handleMouseWheel(this._customWheelEvent(s)),this.dispatchEvent(Dg))}function EE(s){this.enabled!==!1&&this._handleKeyDown(s)}function TE(s){switch(this._trackPointer(s),this._pointers.length){case 1:switch(this.touches.ONE){case ao.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(s),this.state=Bt.TOUCH_ROTATE;break;case ao.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(s),this.state=Bt.TOUCH_PAN;break;default:this.state=Bt.NONE}break;case 2:switch(this.touches.TWO){case ao.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(s),this.state=Bt.TOUCH_DOLLY_PAN;break;case ao.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(s),this.state=Bt.TOUCH_DOLLY_ROTATE;break;default:this.state=Bt.NONE}break;default:this.state=Bt.NONE}this.state!==Bt.NONE&&this.dispatchEvent(Nd)}function AE(s){switch(this._trackPointer(s),this.state){case Bt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(s),this.update();break;case Bt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(s),this.update();break;case Bt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(s),this.update();break;case Bt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(s),this.update();break;default:this.state=Bt.NONE}}function RE(s){this.enabled!==!1&&s.preventDefault()}function CE(s){s.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function PE(s){s.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const pr=new Tm,Nn=new D,zs=new D,$t=new Ut,Dp={X:new D(1,0,0),Y:new D(0,1,0),Z:new D(0,0,1)},mh={type:"change"},Np={type:"mouseDown",mode:null},Up={type:"mouseUp",mode:null},Fp={type:"objectChange"};class IE extends Am{constructor(e,t=null){super(void 0,t);const n=new OE(this);this._root=n;const i=new kE;this._gizmo=i,n.add(i);const r=new BE;this._plane=r,n.add(r);const o=this;function a(b,v){let M=v;Object.defineProperty(o,b,{get:function(){return M!==void 0?M:v},set:function(E){M!==E&&(M=E,r[b]=E,i[b]=E,o.dispatchEvent({type:b+"-changed",value:E}),o.dispatchEvent(mh))}}),o[b]=v,r[b]=v,i[b]=v}a("camera",e),a("object",void 0),a("enabled",!0),a("axis",null),a("mode","translate"),a("translationSnap",null),a("rotationSnap",null),a("scaleSnap",null),a("space","world"),a("size",1),a("dragging",!1),a("showX",!0),a("showY",!0),a("showZ",!0),a("minX",-1/0),a("maxX",1/0),a("minY",-1/0),a("maxY",1/0),a("minZ",-1/0),a("maxZ",1/0);const l=new D,c=new D,h=new Ut,u=new Ut,d=new D,f=new Ut,g=new D,_=new D,m=new D,p=0,y=new D;a("worldPosition",l),a("worldPositionStart",c),a("worldQuaternion",h),a("worldQuaternionStart",u),a("cameraPosition",d),a("cameraQuaternion",f),a("pointStart",g),a("pointEnd",_),a("rotationAxis",m),a("rotationAngle",p),a("eye",y),this._offset=new D,this._startNorm=new D,this._endNorm=new D,this._cameraScale=new D,this._parentPosition=new D,this._parentQuaternion=new Ut,this._parentQuaternionInv=new Ut,this._parentScale=new D,this._worldScaleStart=new D,this._worldQuaternionInv=new Ut,this._worldScale=new D,this._positionStart=new D,this._quaternionStart=new Ut,this._scaleStart=new D,this._getPointer=LE.bind(this),this._onPointerDown=NE.bind(this),this._onPointerHover=DE.bind(this),this._onPointerMove=UE.bind(this),this._onPointerUp=FE.bind(this),t!==null&&this.connect(t)}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointermove",this._onPointerHover),this.domElement.addEventListener("pointerup",this._onPointerUp),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerHover),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.style.touchAction="auto"}getHelper(){return this._root}pointerHover(e){if(this.object===void 0||this.dragging===!0)return;e!==null&&pr.setFromCamera(e,this.camera);const t=gh(this._gizmo.picker[this.mode],pr);t?this.axis=t.object.name:this.axis=null}pointerDown(e){if(!(this.object===void 0||this.dragging===!0||e!=null&&e.button!==0)&&this.axis!==null){e!==null&&pr.setFromCamera(e,this.camera);const t=gh(this._plane,pr,!0);t&&(this.object.updateMatrixWorld(),this.object.parent.updateMatrixWorld(),this._positionStart.copy(this.object.position),this._quaternionStart.copy(this.object.quaternion),this._scaleStart.copy(this.object.scale),this.object.matrixWorld.decompose(this.worldPositionStart,this.worldQuaternionStart,this._worldScaleStart),this.pointStart.copy(t.point).sub(this.worldPositionStart)),this.dragging=!0,Np.mode=this.mode,this.dispatchEvent(Np)}}pointerMove(e){const t=this.axis,n=this.mode,i=this.object;let r=this.space;if(n==="scale"?r="local":(t==="E"||t==="XYZE"||t==="XYZ")&&(r="world"),i===void 0||t===null||this.dragging===!1||e!==null&&e.button!==-1)return;e!==null&&pr.setFromCamera(e,this.camera);const o=gh(this._plane,pr,!0);if(o){if(this.pointEnd.copy(o.point).sub(this.worldPositionStart),n==="translate")this._offset.copy(this.pointEnd).sub(this.pointStart),r==="local"&&t!=="XYZ"&&this._offset.applyQuaternion(this._worldQuaternionInv),t.indexOf("X")===-1&&(this._offset.x=0),t.indexOf("Y")===-1&&(this._offset.y=0),t.indexOf("Z")===-1&&(this._offset.z=0),r==="local"&&t!=="XYZ"?this._offset.applyQuaternion(this._quaternionStart).divide(this._parentScale):this._offset.applyQuaternion(this._parentQuaternionInv).divide(this._parentScale),i.position.copy(this._offset).add(this._positionStart),this.translationSnap&&(r==="local"&&(i.position.applyQuaternion($t.copy(this._quaternionStart).invert()),t.search("X")!==-1&&(i.position.x=Math.round(i.position.x/this.translationSnap)*this.translationSnap),t.search("Y")!==-1&&(i.position.y=Math.round(i.position.y/this.translationSnap)*this.translationSnap),t.search("Z")!==-1&&(i.position.z=Math.round(i.position.z/this.translationSnap)*this.translationSnap),i.position.applyQuaternion(this._quaternionStart)),r==="world"&&(i.parent&&i.position.add(Nn.setFromMatrixPosition(i.parent.matrixWorld)),t.search("X")!==-1&&(i.position.x=Math.round(i.position.x/this.translationSnap)*this.translationSnap),t.search("Y")!==-1&&(i.position.y=Math.round(i.position.y/this.translationSnap)*this.translationSnap),t.search("Z")!==-1&&(i.position.z=Math.round(i.position.z/this.translationSnap)*this.translationSnap),i.parent&&i.position.sub(Nn.setFromMatrixPosition(i.parent.matrixWorld)))),i.position.x=Math.max(this.minX,Math.min(this.maxX,i.position.x)),i.position.y=Math.max(this.minY,Math.min(this.maxY,i.position.y)),i.position.z=Math.max(this.minZ,Math.min(this.maxZ,i.position.z));else if(n==="scale"){if(t.search("XYZ")!==-1){let a=this.pointEnd.length()/this.pointStart.length();this.pointEnd.dot(this.pointStart)<0&&(a*=-1),zs.set(a,a,a)}else Nn.copy(this.pointStart),zs.copy(this.pointEnd),Nn.applyQuaternion(this._worldQuaternionInv),zs.applyQuaternion(this._worldQuaternionInv),zs.divide(Nn),t.search("X")===-1&&(zs.x=1),t.search("Y")===-1&&(zs.y=1),t.search("Z")===-1&&(zs.z=1);i.scale.copy(this._scaleStart).multiply(zs),this.scaleSnap&&(t.search("X")!==-1&&(i.scale.x=Math.round(i.scale.x/this.scaleSnap)*this.scaleSnap||this.scaleSnap),t.search("Y")!==-1&&(i.scale.y=Math.round(i.scale.y/this.scaleSnap)*this.scaleSnap||this.scaleSnap),t.search("Z")!==-1&&(i.scale.z=Math.round(i.scale.z/this.scaleSnap)*this.scaleSnap||this.scaleSnap))}else if(n==="rotate"){this._offset.copy(this.pointEnd).sub(this.pointStart);const a=20/this.worldPosition.distanceTo(Nn.setFromMatrixPosition(this.camera.matrixWorld));let l=!1;t==="XYZE"?(this.rotationAxis.copy(this._offset).cross(this.eye).normalize(),this.rotationAngle=this._offset.dot(Nn.copy(this.rotationAxis).cross(this.eye))*a):(t==="X"||t==="Y"||t==="Z")&&(this.rotationAxis.copy(Dp[t]),Nn.copy(Dp[t]),r==="local"&&Nn.applyQuaternion(this.worldQuaternion),Nn.cross(this.eye),Nn.length()===0?l=!0:this.rotationAngle=this._offset.dot(Nn.normalize())*a),(t==="E"||l)&&(this.rotationAxis.copy(this.eye),this.rotationAngle=this.pointEnd.angleTo(this.pointStart),this._startNorm.copy(this.pointStart).normalize(),this._endNorm.copy(this.pointEnd).normalize(),this.rotationAngle*=this._endNorm.cross(this._startNorm).dot(this.eye)<0?1:-1),this.rotationSnap&&(this.rotationAngle=Math.round(this.rotationAngle/this.rotationSnap)*this.rotationSnap),r==="local"&&t!=="E"&&t!=="XYZE"?(i.quaternion.copy(this._quaternionStart),i.quaternion.multiply($t.setFromAxisAngle(this.rotationAxis,this.rotationAngle)).normalize()):(this.rotationAxis.applyQuaternion(this._parentQuaternionInv),i.quaternion.copy($t.setFromAxisAngle(this.rotationAxis,this.rotationAngle)),i.quaternion.multiply(this._quaternionStart).normalize())}this.dispatchEvent(mh),this.dispatchEvent(Fp)}}pointerUp(e){e!==null&&e.button!==0||(this.dragging&&this.axis!==null&&(Up.mode=this.mode,this.dispatchEvent(Up)),this.dragging=!1,this.axis=null)}dispose(){this.disconnect(),this._root.dispose()}attach(e){return this.object=e,this._root.visible=!0,this}detach(){return this.object=void 0,this.axis=null,this._root.visible=!1,this}reset(){this.enabled&&this.dragging&&(this.object.position.copy(this._positionStart),this.object.quaternion.copy(this._quaternionStart),this.object.scale.copy(this._scaleStart),this.dispatchEvent(mh),this.dispatchEvent(Fp),this.pointStart.copy(this.pointEnd))}getRaycaster(){return pr}getMode(){return this.mode}setMode(e){this.mode=e}setTranslationSnap(e){this.translationSnap=e}setRotationSnap(e){this.rotationSnap=e}setScaleSnap(e){this.scaleSnap=e}setSize(e){this.size=e}setSpace(e){this.space=e}setColors(e,t,n,i){const r=this._gizmo.materialLib;r.xAxis.color.set(e),r.yAxis.color.set(t),r.zAxis.color.set(n),r.active.color.set(i),r.xAxisTransparent.color.set(e),r.yAxisTransparent.color.set(t),r.zAxisTransparent.color.set(n),r.activeTransparent.color.set(i),r.xAxis._color&&r.xAxis._color.set(e),r.yAxis._color&&r.yAxis._color.set(t),r.zAxis._color&&r.zAxis._color.set(n),r.active._color&&r.active._color.set(i),r.xAxisTransparent._color&&r.xAxisTransparent._color.set(e),r.yAxisTransparent._color&&r.yAxisTransparent._color.set(t),r.zAxisTransparent._color&&r.zAxisTransparent._color.set(n),r.activeTransparent._color&&r.activeTransparent._color.set(i)}}function LE(s){if(this.domElement.ownerDocument.pointerLockElement)return{x:0,y:0,button:s.button};{const e=this.domElement.getBoundingClientRect();return{x:(s.clientX-e.left)/e.width*2-1,y:-(s.clientY-e.top)/e.height*2+1,button:s.button}}}function DE(s){if(this.enabled)switch(s.pointerType){case"mouse":case"pen":this.pointerHover(this._getPointer(s));break}}function NE(s){this.enabled&&(document.pointerLockElement||this.domElement.setPointerCapture(s.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.pointerHover(this._getPointer(s)),this.pointerDown(this._getPointer(s)))}function UE(s){this.enabled&&this.pointerMove(this._getPointer(s))}function FE(s){this.enabled&&(this.domElement.releasePointerCapture(s.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.pointerUp(this._getPointer(s)))}function gh(s,e,t){const n=e.intersectObject(s,!0);for(let i=0;i<n.length;i++)if(n[i].object.visible||t)return n[i];return!1}const yl=new Ii,Vt=new D(0,1,0),Op=new D(0,0,0),kp=new Ye,vl=new Ut,Ll=new Ut,Gi=new D,Bp=new Ye,ha=new D(1,0,0),gr=new D(0,1,0),ua=new D(0,0,1),bl=new D,sa=new D,ra=new D;class OE extends Ft{constructor(e){super(),this.isTransformControlsRoot=!0,this.controls=e,this.visible=!1}updateMatrixWorld(e){const t=this.controls;t.object!==void 0&&(t.object.updateMatrixWorld(),t.object.parent===null?console.error("TransformControls: The attached 3D object must be a part of the scene graph."):t.object.parent.matrixWorld.decompose(t._parentPosition,t._parentQuaternion,t._parentScale),t.object.matrixWorld.decompose(t.worldPosition,t.worldQuaternion,t._worldScale),t._parentQuaternionInv.copy(t._parentQuaternion).invert(),t._worldQuaternionInv.copy(t.worldQuaternion).invert()),t.camera.updateMatrixWorld(),t.camera.matrixWorld.decompose(t.cameraPosition,t.cameraQuaternion,t._cameraScale),t.camera.isOrthographicCamera?t.camera.getWorldDirection(t.eye).negate():t.eye.copy(t.cameraPosition).sub(t.worldPosition).normalize(),super.updateMatrixWorld(e)}dispose(){this.traverse(function(e){e.geometry&&e.geometry.dispose(),e.material&&e.material.dispose()})}}class kE extends Ft{constructor(){super(),this.isTransformControlsGizmo=!0,this.type="TransformControlsGizmo";const e=new ki({depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1,transparent:!0}),t=new Ls({depthTest:!1,depthWrite:!1,fog:!1,toneMapped:!1,transparent:!0}),n=e.clone();n.opacity=.15;const i=t.clone();i.opacity=.5;const r=e.clone();r.color.setHex(16711680);const o=e.clone();o.color.setHex(65280);const a=e.clone();a.color.setHex(255);const l=e.clone();l.color.setHex(16711680),l.opacity=.5;const c=e.clone();c.color.setHex(65280),c.opacity=.5;const h=e.clone();h.color.setHex(255),h.opacity=.5;const u=e.clone();u.opacity=.25;const d=e.clone();d.color.setHex(16776960),d.opacity=.25;const f=e.clone();f.color.setHex(16776960);const g=e.clone();g.color.setHex(7895160),this.materialLib={xAxis:r,yAxis:o,zAxis:a,active:f,xAxisTransparent:l,yAxisTransparent:c,zAxisTransparent:h,activeTransparent:d};const _=new Cn(0,.04,.1,12);_.translate(0,.05,0);const m=new un(.08,.08,.08);m.translate(0,.04,0);const p=new zt;p.setAttribute("position",new Ct([0,0,0,1,0,0],3));const y=new Cn(.0075,.0075,.5,3);y.translate(0,.25,0);function b(W,j){const V=new xr(W,.0075,3,64,j*Math.PI*2);return V.rotateY(Math.PI/2),V.rotateX(Math.PI/2),V}function v(){const W=new zt;return W.setAttribute("position",new Ct([0,0,0,1,1,1],3)),W}const M={X:[[new ve(_,r),[.5,0,0],[0,0,-Math.PI/2]],[new ve(_,r),[-.5,0,0],[0,0,Math.PI/2]],[new ve(y,r),[0,0,0],[0,0,-Math.PI/2]]],Y:[[new ve(_,o),[0,.5,0]],[new ve(_,o),[0,-.5,0],[Math.PI,0,0]],[new ve(y,o)]],Z:[[new ve(_,a),[0,0,.5],[Math.PI/2,0,0]],[new ve(_,a),[0,0,-.5],[-Math.PI/2,0,0]],[new ve(y,a),null,[Math.PI/2,0,0]]],XYZ:[[new ve(new co(.1,0),u),[0,0,0]]],XY:[[new ve(new un(.15,.15,.01),h),[.15,.15,0]]],YZ:[[new ve(new un(.15,.15,.01),l),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new ve(new un(.15,.15,.01),c),[.15,0,.15],[-Math.PI/2,0,0]]]},E={X:[[new ve(new Cn(.2,0,.6,4),n),[.3,0,0],[0,0,-Math.PI/2]],[new ve(new Cn(.2,0,.6,4),n),[-.3,0,0],[0,0,Math.PI/2]]],Y:[[new ve(new Cn(.2,0,.6,4),n),[0,.3,0]],[new ve(new Cn(.2,0,.6,4),n),[0,-.3,0],[0,0,Math.PI]]],Z:[[new ve(new Cn(.2,0,.6,4),n),[0,0,.3],[Math.PI/2,0,0]],[new ve(new Cn(.2,0,.6,4),n),[0,0,-.3],[-Math.PI/2,0,0]]],XYZ:[[new ve(new co(.2,0),n)]],XY:[[new ve(new un(.2,.2,.01),n),[.15,.15,0]]],YZ:[[new ve(new un(.2,.2,.01),n),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new ve(new un(.2,.2,.01),n),[.15,0,.15],[-Math.PI/2,0,0]]]},A={START:[[new ve(new co(.01,2),i),null,null,null,"helper"]],END:[[new ve(new co(.01,2),i),null,null,null,"helper"]],DELTA:[[new Ei(v(),i),null,null,null,"helper"]],X:[[new Ei(p,i),[-1e3,0,0],null,[1e6,1,1],"helper"]],Y:[[new Ei(p,i),[0,-1e3,0],[0,0,Math.PI/2],[1e6,1,1],"helper"]],Z:[[new Ei(p,i),[0,0,-1e3],[0,-Math.PI/2,0],[1e6,1,1],"helper"]]},P={XYZE:[[new ve(b(.5,1),g),null,[0,Math.PI/2,0]]],X:[[new ve(b(.5,.5),r)]],Y:[[new ve(b(.5,.5),o),null,[0,0,-Math.PI/2]]],Z:[[new ve(b(.5,.5),a),null,[0,Math.PI/2,0]]],E:[[new ve(b(.75,1),d),null,[0,Math.PI/2,0]]]},S={AXIS:[[new Ei(p,i),[-1e3,0,0],null,[1e6,1,1],"helper"]]},T={XYZE:[[new ve(new hd(.25,10,8),n)]],X:[[new ve(new xr(.5,.1,4,24),n),[0,0,0],[0,-Math.PI/2,-Math.PI/2]]],Y:[[new ve(new xr(.5,.1,4,24),n),[0,0,0],[Math.PI/2,0,0]]],Z:[[new ve(new xr(.5,.1,4,24),n),[0,0,0],[0,0,-Math.PI/2]]],E:[[new ve(new xr(.75,.1,2,24),n)]]},L={X:[[new ve(m,r),[.5,0,0],[0,0,-Math.PI/2]],[new ve(y,r),[0,0,0],[0,0,-Math.PI/2]],[new ve(m,r),[-.5,0,0],[0,0,Math.PI/2]]],Y:[[new ve(m,o),[0,.5,0]],[new ve(y,o)],[new ve(m,o),[0,-.5,0],[0,0,Math.PI]]],Z:[[new ve(m,a),[0,0,.5],[Math.PI/2,0,0]],[new ve(y,a),[0,0,0],[Math.PI/2,0,0]],[new ve(m,a),[0,0,-.5],[-Math.PI/2,0,0]]],XY:[[new ve(new un(.15,.15,.01),h),[.15,.15,0]]],YZ:[[new ve(new un(.15,.15,.01),l),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new ve(new un(.15,.15,.01),c),[.15,0,.15],[-Math.PI/2,0,0]]],XYZ:[[new ve(new un(.1,.1,.1),u)]]},k={X:[[new ve(new Cn(.2,0,.6,4),n),[.3,0,0],[0,0,-Math.PI/2]],[new ve(new Cn(.2,0,.6,4),n),[-.3,0,0],[0,0,Math.PI/2]]],Y:[[new ve(new Cn(.2,0,.6,4),n),[0,.3,0]],[new ve(new Cn(.2,0,.6,4),n),[0,-.3,0],[0,0,Math.PI]]],Z:[[new ve(new Cn(.2,0,.6,4),n),[0,0,.3],[Math.PI/2,0,0]],[new ve(new Cn(.2,0,.6,4),n),[0,0,-.3],[-Math.PI/2,0,0]]],XY:[[new ve(new un(.2,.2,.01),n),[.15,.15,0]]],YZ:[[new ve(new un(.2,.2,.01),n),[0,.15,.15],[0,Math.PI/2,0]]],XZ:[[new ve(new un(.2,.2,.01),n),[.15,0,.15],[-Math.PI/2,0,0]]],XYZ:[[new ve(new un(.2,.2,.2),n),[0,0,0]]]},H={X:[[new Ei(p,i),[-1e3,0,0],null,[1e6,1,1],"helper"]],Y:[[new Ei(p,i),[0,-1e3,0],[0,0,Math.PI/2],[1e6,1,1],"helper"]],Z:[[new Ei(p,i),[0,0,-1e3],[0,-Math.PI/2,0],[1e6,1,1],"helper"]]};function Y(W){const j=new Ft;for(const V in W)for(let q=W[V].length;q--;){const he=W[V][q][0].clone(),ue=W[V][q][1],de=W[V][q][2],ze=W[V][q][3],Je=W[V][q][4];he.name=V,he.tag=Je,ue&&he.position.set(ue[0],ue[1],ue[2]),de&&he.rotation.set(de[0],de[1],de[2]),ze&&he.scale.set(ze[0],ze[1],ze[2]),he.updateMatrix();const ht=he.geometry.clone();ht.applyMatrix4(he.matrix),he.geometry=ht,he.renderOrder=1/0,he.position.set(0,0,0),he.rotation.set(0,0,0),he.scale.set(1,1,1),j.add(he)}return j}this.gizmo={},this.picker={},this.helper={},this.add(this.gizmo.translate=Y(M)),this.add(this.gizmo.rotate=Y(P)),this.add(this.gizmo.scale=Y(L)),this.add(this.picker.translate=Y(E)),this.add(this.picker.rotate=Y(T)),this.add(this.picker.scale=Y(k)),this.add(this.helper.translate=Y(A)),this.add(this.helper.rotate=Y(S)),this.add(this.helper.scale=Y(H)),this.picker.translate.visible=!1,this.picker.rotate.visible=!1,this.picker.scale.visible=!1}updateMatrixWorld(e){const n=(this.mode==="scale"?"local":this.space)==="local"?this.worldQuaternion:Ll;this.gizmo.translate.visible=this.mode==="translate",this.gizmo.rotate.visible=this.mode==="rotate",this.gizmo.scale.visible=this.mode==="scale",this.helper.translate.visible=this.mode==="translate",this.helper.rotate.visible=this.mode==="rotate",this.helper.scale.visible=this.mode==="scale";let i=[];i=i.concat(this.picker[this.mode].children),i=i.concat(this.gizmo[this.mode].children),i=i.concat(this.helper[this.mode].children);for(let r=0;r<i.length;r++){const o=i[r];o.visible=!0,o.rotation.set(0,0,0),o.position.copy(this.worldPosition);let a;if(this.camera.isOrthographicCamera?a=(this.camera.top-this.camera.bottom)/this.camera.zoom:a=this.worldPosition.distanceTo(this.cameraPosition)*Math.min(1.9*Math.tan(Math.PI*this.camera.fov/360)/this.camera.zoom,7),o.scale.set(1,1,1).multiplyScalar(a*this.size/4),o.tag==="helper"){o.visible=!1,o.name==="AXIS"?(o.visible=!!this.axis,this.axis==="X"&&($t.setFromEuler(yl.set(0,0,0)),o.quaternion.copy(n).multiply($t),Math.abs(Vt.copy(ha).applyQuaternion(n).dot(this.eye))>.9&&(o.visible=!1)),this.axis==="Y"&&($t.setFromEuler(yl.set(0,0,Math.PI/2)),o.quaternion.copy(n).multiply($t),Math.abs(Vt.copy(gr).applyQuaternion(n).dot(this.eye))>.9&&(o.visible=!1)),this.axis==="Z"&&($t.setFromEuler(yl.set(0,Math.PI/2,0)),o.quaternion.copy(n).multiply($t),Math.abs(Vt.copy(ua).applyQuaternion(n).dot(this.eye))>.9&&(o.visible=!1)),this.axis==="XYZE"&&($t.setFromEuler(yl.set(0,Math.PI/2,0)),Vt.copy(this.rotationAxis),o.quaternion.setFromRotationMatrix(kp.lookAt(Op,Vt,gr)),o.quaternion.multiply($t),o.visible=this.dragging),this.axis==="E"&&(o.visible=!1)):o.name==="START"?(o.position.copy(this.worldPositionStart),o.visible=this.dragging):o.name==="END"?(o.position.copy(this.worldPosition),o.visible=this.dragging):o.name==="DELTA"?(o.position.copy(this.worldPositionStart),o.quaternion.copy(this.worldQuaternionStart),Nn.set(1e-10,1e-10,1e-10).add(this.worldPositionStart).sub(this.worldPosition).multiplyScalar(-1),Nn.applyQuaternion(this.worldQuaternionStart.clone().invert()),o.scale.copy(Nn),o.visible=this.dragging):(o.quaternion.copy(n),this.dragging?o.position.copy(this.worldPositionStart):o.position.copy(this.worldPosition),this.axis&&(o.visible=this.axis.search(o.name)!==-1));continue}o.quaternion.copy(n),this.mode==="translate"||this.mode==="scale"?(o.name==="X"&&Math.abs(Vt.copy(ha).applyQuaternion(n).dot(this.eye))>.99&&(o.scale.set(1e-10,1e-10,1e-10),o.visible=!1),o.name==="Y"&&Math.abs(Vt.copy(gr).applyQuaternion(n).dot(this.eye))>.99&&(o.scale.set(1e-10,1e-10,1e-10),o.visible=!1),o.name==="Z"&&Math.abs(Vt.copy(ua).applyQuaternion(n).dot(this.eye))>.99&&(o.scale.set(1e-10,1e-10,1e-10),o.visible=!1),o.name==="XY"&&Math.abs(Vt.copy(ua).applyQuaternion(n).dot(this.eye))<.2&&(o.scale.set(1e-10,1e-10,1e-10),o.visible=!1),o.name==="YZ"&&Math.abs(Vt.copy(ha).applyQuaternion(n).dot(this.eye))<.2&&(o.scale.set(1e-10,1e-10,1e-10),o.visible=!1),o.name==="XZ"&&Math.abs(Vt.copy(gr).applyQuaternion(n).dot(this.eye))<.2&&(o.scale.set(1e-10,1e-10,1e-10),o.visible=!1)):this.mode==="rotate"&&(vl.copy(n),Vt.copy(this.eye).applyQuaternion($t.copy(n).invert()),o.name.search("E")!==-1&&o.quaternion.setFromRotationMatrix(kp.lookAt(this.eye,Op,gr)),o.name==="X"&&($t.setFromAxisAngle(ha,Math.atan2(-Vt.y,Vt.z)),$t.multiplyQuaternions(vl,$t),o.quaternion.copy($t)),o.name==="Y"&&($t.setFromAxisAngle(gr,Math.atan2(Vt.x,Vt.z)),$t.multiplyQuaternions(vl,$t),o.quaternion.copy($t)),o.name==="Z"&&($t.setFromAxisAngle(ua,Math.atan2(Vt.y,Vt.x)),$t.multiplyQuaternions(vl,$t),o.quaternion.copy($t))),o.visible=o.visible&&(o.name.indexOf("X")===-1||this.showX),o.visible=o.visible&&(o.name.indexOf("Y")===-1||this.showY),o.visible=o.visible&&(o.name.indexOf("Z")===-1||this.showZ),o.visible=o.visible&&(o.name.indexOf("E")===-1||this.showX&&this.showY&&this.showZ),o.material._color=o.material._color||o.material.color.clone(),o.material._opacity=o.material._opacity||o.material.opacity,o.material.color.copy(o.material._color),o.material.opacity=o.material._opacity,this.enabled&&this.axis&&(o.name===this.axis?(o.material.color.copy(this.materialLib.active.color),o.material.opacity=1):this.axis.split("").some(function(l){return o.name===l})&&(o.material.color.copy(this.materialLib.active.color),o.material.opacity=1))}super.updateMatrixWorld(e)}}class BE extends ve{constructor(){super(new ka(1e5,1e5,2,2),new ki({visible:!1,wireframe:!0,side:Jn,transparent:!0,opacity:.1,toneMapped:!1})),this.isTransformControlsPlane=!0,this.type="TransformControlsPlane"}updateMatrixWorld(e){let t=this.space;switch(this.position.copy(this.worldPosition),this.mode==="scale"&&(t="local"),bl.copy(ha).applyQuaternion(t==="local"?this.worldQuaternion:Ll),sa.copy(gr).applyQuaternion(t==="local"?this.worldQuaternion:Ll),ra.copy(ua).applyQuaternion(t==="local"?this.worldQuaternion:Ll),Vt.copy(sa),this.mode){case"translate":case"scale":switch(this.axis){case"X":Vt.copy(this.eye).cross(bl),Gi.copy(bl).cross(Vt);break;case"Y":Vt.copy(this.eye).cross(sa),Gi.copy(sa).cross(Vt);break;case"Z":Vt.copy(this.eye).cross(ra),Gi.copy(ra).cross(Vt);break;case"XY":Gi.copy(ra);break;case"YZ":Gi.copy(bl);break;case"XZ":Vt.copy(ra),Gi.copy(sa);break;case"XYZ":case"E":Gi.set(0,0,0);break}break;default:Gi.set(0,0,0)}Gi.length()===0?this.quaternion.copy(this.cameraQuaternion):(Bp.lookAt(Nn.set(0,0,0),Gi,Vt),this.quaternion.setFromRotationMatrix(Bp)),super.updateMatrixWorld(e)}}const zp={POSITION:["byte","byte normalized","unsigned byte","unsigned byte normalized","short","short normalized","unsigned short","unsigned short normalized"],NORMAL:["byte normalized","short normalized"],TANGENT:["byte normalized","short normalized"],TEXCOORD:["byte","byte normalized","unsigned byte","short","short normalized","unsigned short"]};class Ir{constructor(){this.textureUtils=null,this.pluginCallbacks=[],this.register(function(e){return new ZE(e)}),this.register(function(e){return new KE(e)}),this.register(function(e){return new tT(e)}),this.register(function(e){return new nT(e)}),this.register(function(e){return new iT(e)}),this.register(function(e){return new sT(e)}),this.register(function(e){return new QE(e)}),this.register(function(e){return new JE(e)}),this.register(function(e){return new eT(e)}),this.register(function(e){return new rT(e)}),this.register(function(e){return new oT(e)}),this.register(function(e){return new aT(e)}),this.register(function(e){return new lT(e)}),this.register(function(e){return new cT(e)})}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}setTextureUtils(e){return this.textureUtils=e,this}parse(e,t,n,i){const r=new qE,o=[];for(let a=0,l=this.pluginCallbacks.length;a<l;a++)o.push(this.pluginCallbacks[a](r));r.setPlugins(o),r.setTextureUtils(this.textureUtils),r.writeAsync(e,t,i).catch(n)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,i,r,t)})}}const mt={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,BYTE:5120,UNSIGNED_BYTE:5121,SHORT:5122,UNSIGNED_SHORT:5123,INT:5124,UNSIGNED_INT:5125,FLOAT:5126,ARRAY_BUFFER:34962,ELEMENT_ARRAY_BUFFER:34963,NEAREST:9728,LINEAR:9729,NEAREST_MIPMAP_NEAREST:9984,LINEAR_MIPMAP_NEAREST:9985,NEAREST_MIPMAP_LINEAR:9986,LINEAR_MIPMAP_LINEAR:9987,CLAMP_TO_EDGE:33071,MIRRORED_REPEAT:33648,REPEAT:10497},_h="KHR_mesh_quantization",_i={};_i[fn]=mt.NEAREST;_i[ju]=mt.NEAREST_MIPMAP_NEAREST;_i[lo]=mt.NEAREST_MIPMAP_LINEAR;_i[pn]=mt.LINEAR;_i[pa]=mt.LINEAR_MIPMAP_NEAREST;_i[Zi]=mt.LINEAR_MIPMAP_LINEAR;_i[Oi]=mt.CLAMP_TO_EDGE;_i[Pr]=mt.REPEAT;_i[Ma]=mt.MIRRORED_REPEAT;const Hp={scale:"scale",position:"translation",quaternion:"rotation",morphTargetInfluences:"weights"},zE=new ke,Vp=12,HE=1179937895,VE=2,Gp=8,GE=1313821514,WE=5130562;function da(s,e){return s.length===e.length&&s.every(function(t,n){return t===e[n]})}function XE(s){return new TextEncoder().encode(s).buffer}function jE(s){return da(s.elements,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1])}function YE(s,e,t){const n={min:new Array(s.itemSize).fill(Number.POSITIVE_INFINITY),max:new Array(s.itemSize).fill(Number.NEGATIVE_INFINITY)};for(let i=e;i<e+t;i++)for(let r=0;r<s.itemSize;r++){let o;s.itemSize>4?o=s.array[i*s.itemSize+r]:(r===0?o=s.getX(i):r===1?o=s.getY(i):r===2?o=s.getZ(i):r===3&&(o=s.getW(i)),s.normalized===!0&&(o=Ro.normalize(o,s.array))),n.min[r]=Math.min(n.min[r],o),n.max[r]=Math.max(n.max[r],o)}return n}function Ng(s){return Math.ceil(s/4)*4}function xh(s,e=0){const t=Ng(s.byteLength);if(t!==s.byteLength){const n=new Uint8Array(t);if(n.set(new Uint8Array(s)),e!==0)for(let i=s.byteLength;i<t;i++)n[i]=e;return n.buffer}return s}function Wp(){return typeof document>"u"&&typeof OffscreenCanvas<"u"?new OffscreenCanvas(1,1):document.createElement("canvas")}function $E(s,e){if(typeof OffscreenCanvas<"u"&&s instanceof OffscreenCanvas){let t;return e==="image/jpeg"?t=.92:e==="image/webp"&&(t=.8),s.convertToBlob({type:e,quality:t})}else return new Promise(t=>s.toBlob(t,e))}class qE{constructor(){this.plugins=[],this.options={},this.pending=[],this.buffers=[],this.byteOffset=0,this.buffers=[],this.nodeMap=new Map,this.skins=[],this.extensionsUsed={},this.extensionsRequired={},this.uids=new Map,this.uid=0,this.json={asset:{version:"2.0",generator:"THREE.GLTFExporter r"+rc}},this.cache={meshes:new Map,attributes:new Map,attributesNormalized:new Map,materials:new Map,textures:new Map,images:new Map},this.textureUtils=null}setPlugins(e){this.plugins=e}setTextureUtils(e){this.textureUtils=e}async writeAsync(e,t,n={}){this.options=Object.assign({binary:!1,trs:!1,onlyVisible:!0,maxTextureSize:1/0,animations:[],includeCustomExtensions:!1},n),this.options.animations.length>0&&(this.options.trs=!0),await this.processInputAsync(e),await Promise.all(this.pending);const i=this,r=i.buffers,o=i.json;n=i.options;const a=i.extensionsUsed,l=i.extensionsRequired,c=new Blob(r,{type:"application/octet-stream"}),h=Object.keys(a),u=Object.keys(l);if(h.length>0&&(o.extensionsUsed=h),u.length>0&&(o.extensionsRequired=u),o.buffers&&o.buffers.length>0&&(o.buffers[0].byteLength=c.size),n.binary===!0){const d=new FileReader;d.readAsArrayBuffer(c),d.onloadend=function(){const f=xh(d.result),g=new DataView(new ArrayBuffer(Gp));g.setUint32(0,f.byteLength,!0),g.setUint32(4,WE,!0);const _=xh(XE(JSON.stringify(o)),32),m=new DataView(new ArrayBuffer(Gp));m.setUint32(0,_.byteLength,!0),m.setUint32(4,GE,!0);const p=new ArrayBuffer(Vp),y=new DataView(p);y.setUint32(0,HE,!0),y.setUint32(4,VE,!0);const b=Vp+m.byteLength+_.byteLength+g.byteLength+f.byteLength;y.setUint32(8,b,!0);const v=new Blob([p,m,_,g,f],{type:"application/octet-stream"}),M=new FileReader;M.readAsArrayBuffer(v),M.onloadend=function(){t(M.result)}}}else if(o.buffers&&o.buffers.length>0){const d=new FileReader;d.readAsDataURL(c),d.onloadend=function(){const f=d.result;o.buffers[0].uri=f,t(o)}}else t(o)}serializeUserData(e,t){if(Object.keys(e.userData).length===0)return;const n=this.options,i=this.extensionsUsed;try{const r=JSON.parse(JSON.stringify(e.userData));if(n.includeCustomExtensions&&r.gltfExtensions){t.extensions===void 0&&(t.extensions={});for(const o in r.gltfExtensions)t.extensions[o]=r.gltfExtensions[o],i[o]=!0;delete r.gltfExtensions}Object.keys(r).length>0&&(t.extras=r)}catch(r){console.warn("THREE.GLTFExporter: userData of '"+e.name+"' won't be serialized because of JSON.stringify error - "+r.message)}}getUID(e,t=!1){if(this.uids.has(e)===!1){const i=new Map;i.set(!0,this.uid++),i.set(!1,this.uid++),this.uids.set(e,i)}return this.uids.get(e).get(t)}isNormalizedNormalAttribute(e){if(this.cache.attributesNormalized.has(e))return!1;const n=new D;for(let i=0,r=e.count;i<r;i++)if(Math.abs(n.fromBufferAttribute(e,i).length()-1)>5e-4)return!1;return!0}createNormalizedNormalAttribute(e){const t=this.cache;if(t.attributesNormalized.has(e))return t.attributesNormalized.get(e);const n=e.clone(),i=new D;for(let r=0,o=n.count;r<o;r++)i.fromBufferAttribute(n,r),i.x===0&&i.y===0&&i.z===0?i.setX(1):i.normalize(),n.setXYZ(r,i.x,i.y,i.z);return t.attributesNormalized.set(e,n),n}applyTextureTransform(e,t){let n=!1;const i={};(t.offset.x!==0||t.offset.y!==0)&&(i.offset=t.offset.toArray(),n=!0),t.rotation!==0&&(i.rotation=t.rotation,n=!0),(t.repeat.x!==1||t.repeat.y!==1)&&(i.scale=t.repeat.toArray(),n=!0),n&&(e.extensions=e.extensions||{},e.extensions.KHR_texture_transform=i,this.extensionsUsed.KHR_texture_transform=!0)}async buildMetalRoughTextureAsync(e,t){if(e===t)return e;function n(f){return f.colorSpace===Qt?function(_){return _<.04045?_*.0773993808:Math.pow(_*.9478672986+.0521327014,2.4)}:function(_){return _}}e instanceof jc&&(e=await this.decompressTextureAsync(e)),t instanceof jc&&(t=await this.decompressTextureAsync(t));const i=e?e.image:null,r=t?t.image:null,o=Math.max(i?i.width:0,r?r.width:0),a=Math.max(i?i.height:0,r?r.height:0),l=Wp();l.width=o,l.height=a;const c=l.getContext("2d",{willReadFrequently:!0});c.fillStyle="#00ffff",c.fillRect(0,0,o,a);const h=c.getImageData(0,0,o,a);if(i){c.drawImage(i,0,0,o,a);const f=n(e),g=c.getImageData(0,0,o,a).data;for(let _=2;_<g.length;_+=4)h.data[_]=f(g[_]/256)*256}if(r){c.drawImage(r,0,0,o,a);const f=n(t),g=c.getImageData(0,0,o,a).data;for(let _=1;_<g.length;_+=4)h.data[_]=f(g[_]/256)*256}c.putImageData(h,0,0);const d=(e||t).clone();return d.source=new ac(l),d.colorSpace=bs,d.channel=(e||t).channel,e&&t&&e.channel!==t.channel&&console.warn("THREE.GLTFExporter: UV channels for metalnessMap and roughnessMap textures must match."),console.warn("THREE.GLTFExporter: Merged metalnessMap and roughnessMap textures."),d}async decompressTextureAsync(e,t=1/0){if(this.textureUtils===null)throw new Error("THREE.GLTFExporter: setTextureUtils() must be called to process compressed textures.");return await this.textureUtils.decompress(e,t)}processBuffer(e){const t=this.json,n=this.buffers;return t.buffers||(t.buffers=[{byteLength:0}]),n.push(e),0}processBufferView(e,t,n,i,r){const o=this.json;o.bufferViews||(o.bufferViews=[]);let a;switch(t){case mt.BYTE:case mt.UNSIGNED_BYTE:a=1;break;case mt.SHORT:case mt.UNSIGNED_SHORT:a=2;break;default:a=4}let l=e.itemSize*a;r===mt.ARRAY_BUFFER&&(l=Math.ceil(l/4)*4);const c=Ng(i*l),h=new DataView(new ArrayBuffer(c));let u=0;for(let g=n;g<n+i;g++){for(let _=0;_<e.itemSize;_++){let m;e.itemSize>4?m=e.array[g*e.itemSize+_]:(_===0?m=e.getX(g):_===1?m=e.getY(g):_===2?m=e.getZ(g):_===3&&(m=e.getW(g)),e.normalized===!0&&(m=Ro.normalize(m,e.array))),t===mt.FLOAT?h.setFloat32(u,m,!0):t===mt.INT?h.setInt32(u,m,!0):t===mt.UNSIGNED_INT?h.setUint32(u,m,!0):t===mt.SHORT?h.setInt16(u,m,!0):t===mt.UNSIGNED_SHORT?h.setUint16(u,m,!0):t===mt.BYTE?h.setInt8(u,m):t===mt.UNSIGNED_BYTE&&h.setUint8(u,m),u+=a}u%l!==0&&(u+=l-u%l)}const d={buffer:this.processBuffer(h.buffer),byteOffset:this.byteOffset,byteLength:c};return r!==void 0&&(d.target=r),r===mt.ARRAY_BUFFER&&(d.byteStride=l),this.byteOffset+=c,o.bufferViews.push(d),{id:o.bufferViews.length-1,byteLength:0}}processBufferViewImage(e){const t=this,n=t.json;return n.bufferViews||(n.bufferViews=[]),new Promise(function(i){const r=new FileReader;r.readAsArrayBuffer(e),r.onloadend=function(){const o=xh(r.result),a={buffer:t.processBuffer(o),byteOffset:t.byteOffset,byteLength:o.byteLength};t.byteOffset+=o.byteLength,i(n.bufferViews.push(a)-1)}})}processAccessor(e,t,n,i){const r=this.json,o={1:"SCALAR",2:"VEC2",3:"VEC3",4:"VEC4",9:"MAT3",16:"MAT4"};let a;if(e.array.constructor===Float32Array)a=mt.FLOAT;else if(e.array.constructor===Int32Array)a=mt.INT;else if(e.array.constructor===Uint32Array)a=mt.UNSIGNED_INT;else if(e.array.constructor===Int16Array)a=mt.SHORT;else if(e.array.constructor===Uint16Array)a=mt.UNSIGNED_SHORT;else if(e.array.constructor===Int8Array)a=mt.BYTE;else if(e.array.constructor===Uint8Array)a=mt.UNSIGNED_BYTE;else throw new Error("THREE.GLTFExporter: Unsupported bufferAttribute component type: "+e.array.constructor.name);if(n===void 0&&(n=0),(i===void 0||i===1/0)&&(i=e.count),i===0)return null;const l=YE(e,n,i);let c;t!==void 0&&(c=e===t.index?mt.ELEMENT_ARRAY_BUFFER:mt.ARRAY_BUFFER);const h=this.processBufferView(e,a,n,i,c),u={bufferView:h.id,byteOffset:h.byteOffset,componentType:a,count:i,max:l.max,min:l.min,type:o[e.itemSize]};return e.normalized===!0&&(u.normalized=!0),r.accessors||(r.accessors=[]),r.accessors.push(u)-1}processImage(e,t,n,i="image/png"){if(e!==null){const r=this,o=r.cache,a=r.json,l=r.options,c=r.pending;o.images.has(e)||o.images.set(e,{});const h=o.images.get(e),u=i+":flipY/"+n.toString();if(h[u]!==void 0)return h[u];a.images||(a.images=[]);const d={mimeType:i},f=Wp();f.width=Math.min(e.width,l.maxTextureSize),f.height=Math.min(e.height,l.maxTextureSize);const g=f.getContext("2d",{willReadFrequently:!0});if(n===!0&&(g.translate(0,f.height),g.scale(1,-1)),e.data!==void 0){t!==pi&&console.error("GLTFExporter: Only RGBAFormat is supported.",t),(e.width>l.maxTextureSize||e.height>l.maxTextureSize)&&console.warn("GLTFExporter: Image size is bigger than maxTextureSize",e);const m=new Uint8ClampedArray(e.height*e.width*4);for(let p=0;p<m.length;p+=4)m[p+0]=e.data[p+0],m[p+1]=e.data[p+1],m[p+2]=e.data[p+2],m[p+3]=e.data[p+3];g.putImageData(new ImageData(m,e.width,e.height),0,0)}else if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap||typeof OffscreenCanvas<"u"&&e instanceof OffscreenCanvas)g.drawImage(e,0,0,f.width,f.height);else throw new Error("THREE.GLTFExporter: Invalid image type. Use HTMLImageElement, HTMLCanvasElement, ImageBitmap or OffscreenCanvas.");l.binary===!0?c.push($E(f,i).then(m=>r.processBufferViewImage(m)).then(m=>{d.bufferView=m})):d.uri=um.getDataURL(f,i);const _=a.images.push(d)-1;return h[u]=_,_}else throw new Error("THREE.GLTFExporter: No valid image data found. Unable to process texture.")}processSampler(e){const t=this.json;t.samplers||(t.samplers=[]);const n={magFilter:_i[e.magFilter],minFilter:_i[e.minFilter],wrapS:_i[e.wrapS],wrapT:_i[e.wrapT]};return t.samplers.push(n)-1}async processTextureAsync(e){const n=this.options,i=this.cache,r=this.json;if(i.textures.has(e))return i.textures.get(e);r.textures||(r.textures=[]),e instanceof jc&&(e=await this.decompressTextureAsync(e,n.maxTextureSize));let o=e.userData.mimeType;o==="image/webp"&&(o="image/png");const a={sampler:this.processSampler(e),source:this.processImage(e.image,e.format,e.flipY,o)};e.name&&(a.name=e.name),await this._invokeAllAsync(async function(c){c.writeTexture&&await c.writeTexture(e,a)});const l=r.textures.push(a)-1;return i.textures.set(e,l),l}async processMaterialAsync(e){const t=this.cache,n=this.json;if(t.materials.has(e))return t.materials.get(e);if(e.isShaderMaterial)return console.warn("GLTFExporter: THREE.ShaderMaterial not supported."),null;n.materials||(n.materials=[]);const i={pbrMetallicRoughness:{}};e.isMeshStandardMaterial!==!0&&e.isMeshBasicMaterial!==!0&&console.warn("GLTFExporter: Use MeshStandardMaterial or MeshBasicMaterial for best results.");const r=e.color.toArray().concat([e.opacity]);if(da(r,[1,1,1,1])||(i.pbrMetallicRoughness.baseColorFactor=r),e.isMeshStandardMaterial?(i.pbrMetallicRoughness.metallicFactor=e.metalness,i.pbrMetallicRoughness.roughnessFactor=e.roughness):(i.pbrMetallicRoughness.metallicFactor=0,i.pbrMetallicRoughness.roughnessFactor=1),e.metalnessMap||e.roughnessMap){const a=await this.buildMetalRoughTextureAsync(e.metalnessMap,e.roughnessMap),l={index:await this.processTextureAsync(a),texCoord:a.channel};this.applyTextureTransform(l,a),i.pbrMetallicRoughness.metallicRoughnessTexture=l}if(e.map){const a={index:await this.processTextureAsync(e.map),texCoord:e.map.channel};this.applyTextureTransform(a,e.map),i.pbrMetallicRoughness.baseColorTexture=a}if(e.emissive){const a=e.emissive;if(Math.max(a.r,a.g,a.b)>0&&(i.emissiveFactor=e.emissive.toArray()),e.emissiveMap){const c={index:await this.processTextureAsync(e.emissiveMap),texCoord:e.emissiveMap.channel};this.applyTextureTransform(c,e.emissiveMap),i.emissiveTexture=c}}if(e.normalMap){const a={index:await this.processTextureAsync(e.normalMap),texCoord:e.normalMap.channel};e.normalScale&&e.normalScale.x!==1&&(a.scale=e.normalScale.x),this.applyTextureTransform(a,e.normalMap),i.normalTexture=a}if(e.aoMap){const a={index:await this.processTextureAsync(e.aoMap),texCoord:e.aoMap.channel};e.aoMapIntensity!==1&&(a.strength=e.aoMapIntensity),this.applyTextureTransform(a,e.aoMap),i.occlusionTexture=a}e.transparent?i.alphaMode="BLEND":e.alphaTest>0&&(i.alphaMode="MASK",i.alphaCutoff=e.alphaTest),e.side===Jn&&(i.doubleSided=!0),e.name!==""&&(i.name=e.name),this.serializeUserData(e,i),await this._invokeAllAsync(async function(a){a.writeMaterialAsync&&await a.writeMaterialAsync(e,i)});const o=n.materials.push(i)-1;return t.materials.set(e,o),o}async processMeshAsync(e){const t=this.cache,n=this.json,i=[e.geometry.uuid];if(Array.isArray(e.material))for(let v=0,M=e.material.length;v<M;v++)i.push(e.material[v].uuid);else i.push(e.material.uuid);const r=i.join(":");if(t.meshes.has(r))return t.meshes.get(r);const o=e.geometry;let a;e.isLineSegments?a=mt.LINES:e.isLineLoop?a=mt.LINE_LOOP:e.isLine?a=mt.LINE_STRIP:e.isPoints?a=mt.POINTS:a=e.material.wireframe?mt.LINES:mt.TRIANGLES;const l={},c={},h=[],u=[],d={uv:"TEXCOORD_0",uv1:"TEXCOORD_1",uv2:"TEXCOORD_2",uv3:"TEXCOORD_3",color:"COLOR_0",skinWeight:"WEIGHTS_0",skinIndex:"JOINTS_0"},f=o.getAttribute("normal");f!==void 0&&!this.isNormalizedNormalAttribute(f)&&(console.warn("THREE.GLTFExporter: Creating normalized normal attribute from the non-normalized one."),o.setAttribute("normal",this.createNormalizedNormalAttribute(f)));let g=null;for(let v in o.attributes){if(v.slice(0,5)==="morph")continue;const M=o.attributes[v];if(v=d[v]||v.toUpperCase(),/^(POSITION|NORMAL|TANGENT|TEXCOORD_\d+|COLOR_\d+|JOINTS_\d+|WEIGHTS_\d+)$/.test(v)||(v="_"+v),t.attributes.has(this.getUID(M))){c[v]=t.attributes.get(this.getUID(M));continue}g=null;const A=M.array;v==="JOINTS_0"&&!(A instanceof Uint16Array)&&!(A instanceof Uint8Array)?(console.warn('GLTFExporter: Attribute "skinIndex" converted to type UNSIGNED_SHORT.'),g=new Et(new Uint16Array(A),M.itemSize,M.normalized)):(A instanceof Uint32Array||A instanceof Int32Array)&&!v.startsWith("_")&&(console.warn(`GLTFExporter: Attribute "${v}" converted to type FLOAT.`),g=Ir.Utils.toFloat32BufferAttribute(M));const P=this.processAccessor(g||M,o);P!==null&&(v.startsWith("_")||this.detectMeshQuantization(v,M),c[v]=P,t.attributes.set(this.getUID(M),P))}if(f!==void 0&&o.setAttribute("normal",f),Object.keys(c).length===0)return null;if(e.morphTargetInfluences!==void 0&&e.morphTargetInfluences.length>0){const v=[],M=[],E={};if(e.morphTargetDictionary!==void 0)for(const A in e.morphTargetDictionary)E[e.morphTargetDictionary[A]]=A;for(let A=0;A<e.morphTargetInfluences.length;++A){const P={};let S=!1;for(const T in o.morphAttributes){if(T!=="position"&&T!=="normal"){S||(console.warn("GLTFExporter: Only POSITION and NORMAL morph are supported."),S=!0);continue}const L=o.morphAttributes[T][A],k=T.toUpperCase(),H=o.attributes[T];if(t.attributes.has(this.getUID(L,!0))){P[k]=t.attributes.get(this.getUID(L,!0));continue}const Y=L.clone();if(!o.morphTargetsRelative)for(let W=0,j=L.count;W<j;W++)for(let V=0;V<L.itemSize;V++)V===0&&Y.setX(W,L.getX(W)-H.getX(W)),V===1&&Y.setY(W,L.getY(W)-H.getY(W)),V===2&&Y.setZ(W,L.getZ(W)-H.getZ(W)),V===3&&Y.setW(W,L.getW(W)-H.getW(W));P[k]=this.processAccessor(Y,o),t.attributes.set(this.getUID(H,!0),P[k])}u.push(P),v.push(e.morphTargetInfluences[A]),e.morphTargetDictionary!==void 0&&M.push(E[A])}l.weights=v,M.length>0&&(l.extras={},l.extras.targetNames=M)}const _=Array.isArray(e.material);if(_&&o.groups.length===0)return null;let m=!1;if(_&&o.index===null){const v=[];for(let M=0,E=o.attributes.position.count;M<E;M++)v[M]=M;o.setIndex(v),m=!0}const p=_?e.material:[e.material],y=_?o.groups:[{materialIndex:0,start:void 0,count:void 0}];for(let v=0,M=y.length;v<M;v++){const E={mode:a,attributes:c};if(this.serializeUserData(o,E),u.length>0&&(E.targets=u),o.index!==null){let P=this.getUID(o.index);(y[v].start!==void 0||y[v].count!==void 0)&&(P+=":"+y[v].start+":"+y[v].count),t.attributes.has(P)?E.indices=t.attributes.get(P):(E.indices=this.processAccessor(o.index,o,y[v].start,y[v].count),t.attributes.set(P,E.indices)),E.indices===null&&delete E.indices}const A=await this.processMaterialAsync(p[y[v].materialIndex]);A!==null&&(E.material=A),h.push(E)}m===!0&&o.setIndex(null),l.primitives=h,n.meshes||(n.meshes=[]),await this._invokeAllAsync(function(v){v.writeMesh&&v.writeMesh(e,l)});const b=n.meshes.push(l)-1;return t.meshes.set(r,b),b}detectMeshQuantization(e,t){if(this.extensionsUsed[_h])return;let n;switch(t.array.constructor){case Int8Array:n="byte";break;case Uint8Array:n="unsigned byte";break;case Int16Array:n="short";break;case Uint16Array:n="unsigned short";break;default:return}t.normalized&&(n+=" normalized");const i=e.split("_",1)[0];zp[i]&&zp[i].includes(n)&&(this.extensionsUsed[_h]=!0,this.extensionsRequired[_h]=!0)}processCamera(e){const t=this.json;t.cameras||(t.cameras=[]);const n=e.isOrthographicCamera,i={type:n?"orthographic":"perspective"};return n?i.orthographic={xmag:e.right*2,ymag:e.top*2,zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near}:i.perspective={aspectRatio:e.aspect,yfov:Ro.degToRad(e.fov),zfar:e.far<=0?.001:e.far,znear:e.near<0?0:e.near},e.name!==""&&(i.name=e.type),t.cameras.push(i)-1}processAnimation(e,t){const n=this.json,i=this.nodeMap;n.animations||(n.animations=[]),e=Ir.Utils.mergeMorphTargetTracks(e.clone(),t);const r=e.tracks,o=[],a=[];for(let c=0;c<r.length;++c){const h=r[c],u=Tt.parseTrackName(h.name);let d=Tt.findNode(t,u.nodeName);const f=Hp[u.propertyName];if(u.objectName==="bones"&&(d.isSkinnedMesh===!0?d=d.skeleton.getBoneByName(u.objectIndex):d=void 0),!d||!f){console.warn('THREE.GLTFExporter: Could not export animation track "%s".',h.name);continue}const g=1;let _=h.values.length/h.times.length;f===Hp.morphTargetInfluences&&(_/=d.morphTargetInfluences.length);let m;h.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline===!0?(m="CUBICSPLINE",_/=3):h.getInterpolation()===Eo?m="STEP":m="LINEAR",a.push({input:this.processAccessor(new Et(h.times,g)),output:this.processAccessor(new Et(h.values,_)),interpolation:m}),o.push({sampler:a.length-1,target:{node:i.get(d),path:f}})}const l={name:e.name||"clip_"+n.animations.length,samplers:a,channels:o};return this.serializeUserData(e,l),n.animations.push(l),n.animations.length-1}processSkin(e){const t=this.json,n=this.nodeMap,i=t.nodes[n.get(e)],r=e.skeleton;if(r===void 0)return null;const o=e.skeleton.bones[0];if(o===void 0)return null;const a=[],l=new Float32Array(r.bones.length*16),c=new Ye;for(let u=0;u<r.bones.length;++u)a.push(n.get(r.bones[u])),c.copy(r.boneInverses[u]),c.multiply(e.bindMatrix).toArray(l,u*16);return t.skins===void 0&&(t.skins=[]),t.skins.push({inverseBindMatrices:this.processAccessor(new Et(l,16)),joints:a,skeleton:n.get(o)}),i.skin=t.skins.length-1}async processNodeAsync(e){const t=this.json,n=this.options,i=this.nodeMap;t.nodes||(t.nodes=[]);const r={};if(n.trs){const a=e.quaternion.toArray(),l=e.position.toArray(),c=e.scale.toArray();da(a,[0,0,0,1])||(r.rotation=a),da(l,[0,0,0])||(r.translation=l),da(c,[1,1,1])||(r.scale=c)}else e.matrixAutoUpdate&&e.updateMatrix(),jE(e.matrix)===!1&&(r.matrix=e.matrix.elements);if(e.name!==""&&(r.name=String(e.name)),this.serializeUserData(e,r),e.isMesh||e.isLine||e.isPoints){const a=await this.processMeshAsync(e);a!==null&&(r.mesh=a)}else e.isCamera&&(r.camera=this.processCamera(e));e.isSkinnedMesh&&this.skins.push(e);const o=t.nodes.push(r)-1;if(i.set(e,o),e.children.length>0){const a=[];for(let l=0,c=e.children.length;l<c;l++){const h=e.children[l];if(h.visible||n.onlyVisible===!1){const u=await this.processNodeAsync(h);u!==null&&a.push(u)}}a.length>0&&(r.children=a)}return await this._invokeAllAsync(function(a){a.writeNode&&a.writeNode(e,r)}),o}async processSceneAsync(e){const t=this.json,n=this.options;t.scenes||(t.scenes=[],t.scene=0);const i={};e.name!==""&&(i.name=e.name),t.scenes.push(i);const r=[];for(let o=0,a=e.children.length;o<a;o++){const l=e.children[o];if(l.visible||n.onlyVisible===!1){const c=await this.processNodeAsync(l);c!==null&&r.push(c)}}r.length>0&&(i.nodes=r),this.serializeUserData(e,i)}async processObjectsAsync(e){const t=new gu;t.name="AuxScene";for(let n=0;n<e.length;n++)t.children.push(e[n]);await this.processSceneAsync(t)}async processInputAsync(e){const t=this.options;e=e instanceof Array?e:[e],await this._invokeAllAsync(function(i){i.beforeParse&&i.beforeParse(e)});const n=[];for(let i=0;i<e.length;i++)e[i]instanceof gu?await this.processSceneAsync(e[i]):n.push(e[i]);n.length>0&&await this.processObjectsAsync(n);for(let i=0;i<this.skins.length;++i)this.processSkin(this.skins[i]);for(let i=0;i<t.animations.length;++i)this.processAnimation(t.animations[i],e[0]);await this._invokeAllAsync(function(i){i.afterParse&&i.afterParse(e)})}async _invokeAllAsync(e){for(let t=0,n=this.plugins.length;t<n;t++)await e(this.plugins[t])}}class ZE{constructor(e){this.writer=e,this.name="KHR_lights_punctual"}writeNode(e,t){if(!e.isLight)return;if(!e.isDirectionalLight&&!e.isPointLight&&!e.isSpotLight){console.warn("THREE.GLTFExporter: Only directional, point, and spot lights are supported.",e);return}const n=this.writer,i=n.json,r=n.extensionsUsed,o={};e.name&&(o.name=e.name),o.color=e.color.toArray(),o.intensity=e.intensity,e.isDirectionalLight?o.type="directional":e.isPointLight?(o.type="point",e.distance>0&&(o.range=e.distance)):e.isSpotLight&&(o.type="spot",e.distance>0&&(o.range=e.distance),o.spot={},o.spot.innerConeAngle=(1-e.penumbra)*e.angle,o.spot.outerConeAngle=e.angle),e.decay!==void 0&&e.decay!==2&&console.warn("THREE.GLTFExporter: Light decay may be lost. glTF is physically-based, and expects light.decay=2."),e.target&&(e.target.parent!==e||e.target.position.x!==0||e.target.position.y!==0||e.target.position.z!==-1)&&console.warn("THREE.GLTFExporter: Light direction may be lost. For best results, make light.target a child of the light with position 0,0,-1."),r[this.name]||(i.extensions=i.extensions||{},i.extensions[this.name]={lights:[]},r[this.name]=!0);const a=i.extensions[this.name].lights;a.push(o),t.extensions=t.extensions||{},t.extensions[this.name]={light:a.length-1}}}class KE{constructor(e){this.writer=e,this.name="KHR_materials_unlit"}async writeMaterialAsync(e,t){if(!e.isMeshBasicMaterial)return;const i=this.writer.extensionsUsed;t.extensions=t.extensions||{},t.extensions[this.name]={},i[this.name]=!0,t.pbrMetallicRoughness.metallicFactor=0,t.pbrMetallicRoughness.roughnessFactor=.9}}class QE{constructor(e){this.writer=e,this.name="KHR_materials_clearcoat"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.clearcoat===0)return;const n=this.writer,i=n.extensionsUsed,r={};if(r.clearcoatFactor=e.clearcoat,e.clearcoatMap){const o={index:await n.processTextureAsync(e.clearcoatMap),texCoord:e.clearcoatMap.channel};n.applyTextureTransform(o,e.clearcoatMap),r.clearcoatTexture=o}if(r.clearcoatRoughnessFactor=e.clearcoatRoughness,e.clearcoatRoughnessMap){const o={index:await n.processTextureAsync(e.clearcoatRoughnessMap),texCoord:e.clearcoatRoughnessMap.channel};n.applyTextureTransform(o,e.clearcoatRoughnessMap),r.clearcoatRoughnessTexture=o}if(e.clearcoatNormalMap){const o={index:await n.processTextureAsync(e.clearcoatNormalMap),texCoord:e.clearcoatNormalMap.channel};e.clearcoatNormalScale.x!==1&&(o.scale=e.clearcoatNormalScale.x),n.applyTextureTransform(o,e.clearcoatNormalMap),r.clearcoatNormalTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class JE{constructor(e){this.writer=e,this.name="KHR_materials_dispersion"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.dispersion===0)return;const i=this.writer.extensionsUsed,r={};r.dispersion=e.dispersion,t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class eT{constructor(e){this.writer=e,this.name="KHR_materials_iridescence"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.iridescence===0)return;const n=this.writer,i=n.extensionsUsed,r={};if(r.iridescenceFactor=e.iridescence,e.iridescenceMap){const o={index:await n.processTextureAsync(e.iridescenceMap),texCoord:e.iridescenceMap.channel};n.applyTextureTransform(o,e.iridescenceMap),r.iridescenceTexture=o}if(r.iridescenceIor=e.iridescenceIOR,r.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],r.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1],e.iridescenceThicknessMap){const o={index:await n.processTextureAsync(e.iridescenceThicknessMap),texCoord:e.iridescenceThicknessMap.channel};n.applyTextureTransform(o,e.iridescenceThicknessMap),r.iridescenceThicknessTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class tT{constructor(e){this.writer=e,this.name="KHR_materials_transmission"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;const n=this.writer,i=n.extensionsUsed,r={};if(r.transmissionFactor=e.transmission,e.transmissionMap){const o={index:await n.processTextureAsync(e.transmissionMap),texCoord:e.transmissionMap.channel};n.applyTextureTransform(o,e.transmissionMap),r.transmissionTexture=o}t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class nT{constructor(e){this.writer=e,this.name="KHR_materials_volume"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.transmission===0)return;const n=this.writer,i=n.extensionsUsed,r={};if(r.thicknessFactor=e.thickness,e.thicknessMap){const o={index:await n.processTextureAsync(e.thicknessMap),texCoord:e.thicknessMap.channel};n.applyTextureTransform(o,e.thicknessMap),r.thicknessTexture=o}e.attenuationDistance!==1/0&&(r.attenuationDistance=e.attenuationDistance),r.attenuationColor=e.attenuationColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class iT{constructor(e){this.writer=e,this.name="KHR_materials_ior"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.ior===1.5)return;const i=this.writer.extensionsUsed,r={};r.ior=e.ior,t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class sT{constructor(e){this.writer=e,this.name="KHR_materials_specular"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.specularIntensity===1&&e.specularColor.equals(zE)&&!e.specularIntensityMap&&!e.specularColorMap)return;const n=this.writer,i=n.extensionsUsed,r={};if(e.specularIntensityMap){const o={index:await n.processTextureAsync(e.specularIntensityMap),texCoord:e.specularIntensityMap.channel};n.applyTextureTransform(o,e.specularIntensityMap),r.specularTexture=o}if(e.specularColorMap){const o={index:await n.processTextureAsync(e.specularColorMap),texCoord:e.specularColorMap.channel};n.applyTextureTransform(o,e.specularColorMap),r.specularColorTexture=o}r.specularFactor=e.specularIntensity,r.specularColorFactor=e.specularColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class rT{constructor(e){this.writer=e,this.name="KHR_materials_sheen"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.sheen==0)return;const n=this.writer,i=n.extensionsUsed,r={};if(e.sheenRoughnessMap){const o={index:await n.processTextureAsync(e.sheenRoughnessMap),texCoord:e.sheenRoughnessMap.channel};n.applyTextureTransform(o,e.sheenRoughnessMap),r.sheenRoughnessTexture=o}if(e.sheenColorMap){const o={index:await n.processTextureAsync(e.sheenColorMap),texCoord:e.sheenColorMap.channel};n.applyTextureTransform(o,e.sheenColorMap),r.sheenColorTexture=o}r.sheenRoughnessFactor=e.sheenRoughness,r.sheenColorFactor=e.sheenColor.toArray(),t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class oT{constructor(e){this.writer=e,this.name="KHR_materials_anisotropy"}async writeMaterialAsync(e,t){if(!e.isMeshPhysicalMaterial||e.anisotropy==0)return;const n=this.writer,i=n.extensionsUsed,r={};if(e.anisotropyMap){const o={index:await n.processTextureAsync(e.anisotropyMap)};n.applyTextureTransform(o,e.anisotropyMap),r.anisotropyTexture=o}r.anisotropyStrength=e.anisotropy,r.anisotropyRotation=e.anisotropyRotation,t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class aT{constructor(e){this.writer=e,this.name="KHR_materials_emissive_strength"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.emissiveIntensity===1)return;const i=this.writer.extensionsUsed,r={};r.emissiveStrength=e.emissiveIntensity,t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class lT{constructor(e){this.writer=e,this.name="EXT_materials_bump"}async writeMaterialAsync(e,t){if(!e.isMeshStandardMaterial||e.bumpScale===1&&!e.bumpMap)return;const n=this.writer,i=n.extensionsUsed,r={};if(e.bumpMap){const o={index:await n.processTextureAsync(e.bumpMap),texCoord:e.bumpMap.channel};n.applyTextureTransform(o,e.bumpMap),r.bumpTexture=o}r.bumpFactor=e.bumpScale,t.extensions=t.extensions||{},t.extensions[this.name]=r,i[this.name]=!0}}class cT{constructor(e){this.writer=e,this.name="EXT_mesh_gpu_instancing"}writeNode(e,t){if(!e.isInstancedMesh)return;const n=this.writer,i=e,r=new Float32Array(i.count*3),o=new Float32Array(i.count*4),a=new Float32Array(i.count*3),l=new Ye,c=new D,h=new Ut,u=new D;for(let f=0;f<i.count;f++)i.getMatrixAt(f,l),l.decompose(c,h,u),c.toArray(r,f*3),h.toArray(o,f*4),u.toArray(a,f*3);const d={TRANSLATION:n.processAccessor(new Et(r,3)),ROTATION:n.processAccessor(new Et(o,4)),SCALE:n.processAccessor(new Et(a,3))};i.instanceColor&&(d._COLOR_0=n.processAccessor(i.instanceColor)),t.extensions=t.extensions||{},t.extensions[this.name]={attributes:d},n.extensionsUsed[this.name]=!0,n.extensionsRequired[this.name]=!0}}Ir.Utils={insertKeyframe:function(s,e){const n=s.getValueSize(),i=new s.TimeBufferType(s.times.length+1),r=new s.ValueBufferType(s.values.length+n),o=s.createInterpolant(new s.ValueBufferType(n));let a;if(s.times.length===0){i[0]=e;for(let l=0;l<n;l++)r[l]=0;a=0}else if(e<s.times[0]){if(Math.abs(s.times[0]-e)<.001)return 0;i[0]=e,i.set(s.times,1),r.set(o.evaluate(e),0),r.set(s.values,n),a=0}else if(e>s.times[s.times.length-1]){if(Math.abs(s.times[s.times.length-1]-e)<.001)return s.times.length-1;i[i.length-1]=e,i.set(s.times,0),r.set(s.values,0),r.set(o.evaluate(e),s.values.length),a=i.length-1}else for(let l=0;l<s.times.length;l++){if(Math.abs(s.times[l]-e)<.001)return l;if(s.times[l]<e&&s.times[l+1]>e){i.set(s.times.slice(0,l+1),0),i[l+1]=e,i.set(s.times.slice(l+1),l+2),r.set(s.values.slice(0,(l+1)*n),0),r.set(o.evaluate(e),(l+1)*n),r.set(s.values.slice((l+1)*n),(l+2)*n),a=l+1;break}}return s.times=i,s.values=r,a},mergeMorphTargetTracks:function(s,e){const t=[],n={},i=s.tracks;for(let r=0;r<i.length;++r){let o=i[r];const a=Tt.parseTrackName(o.name),l=Tt.findNode(e,a.nodeName);if(a.propertyName!=="morphTargetInfluences"||a.propertyIndex===void 0){t.push(o);continue}if(o.createInterpolant!==o.InterpolantFactoryMethodDiscrete&&o.createInterpolant!==o.InterpolantFactoryMethodLinear){if(o.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline)throw new Error("THREE.GLTFExporter: Cannot merge tracks with glTF CUBICSPLINE interpolation.");console.warn("THREE.GLTFExporter: Morph target interpolation mode not yet supported. Using LINEAR instead."),o=o.clone(),o.setInterpolation(To)}const c=l.morphTargetInfluences.length,h=l.morphTargetDictionary[a.propertyIndex];if(h===void 0)throw new Error("THREE.GLTFExporter: Morph target name not found: "+a.propertyIndex);let u;if(n[l.uuid]===void 0){u=o.clone();const f=new u.ValueBufferType(c*u.times.length);for(let g=0;g<u.times.length;g++)f[g*c+h]=u.values[g];u.name=(a.nodeName||"")+".morphTargetInfluences",u.values=f,n[l.uuid]=u,t.push(u);continue}const d=o.createInterpolant(new o.ValueBufferType(1));u=n[l.uuid];for(let f=0;f<u.times.length;f++)u.values[f*c+h]=d.evaluate(u.times[f]);for(let f=0;f<o.times.length;f++){const g=this.insertKeyframe(u,o.times[f]);u.values[g*c+h]=o.values[f]}}return s.tracks=t,s},toFloat32BufferAttribute:function(s){const e=new Et(new Float32Array(s.count*s.itemSize),s.itemSize,!1);if(!s.normalized&&!s.isInterleavedBufferAttribute)return e.array.set(s.array),e;for(let t=0,n=s.count;t<n;t++)for(let i=0;i<s.itemSize;i++)e.setComponent(t,i,s.getComponent(t,i));return e}};class is{constructor(e,t,n,i,r="div"){this.parent=e,this.object=t,this.property=n,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(r),this.domElement.classList.add("lil-controller"),this.domElement.classList.add(i),this.$name=document.createElement("div"),this.$name.classList.add("lil-name"),is.nextNameID=is.nextNameID||0,this.$name.id=`lil-gui-name-${++is.nextNameID}`,this.$widget=document.createElement("div"),this.$widget.classList.add("lil-widget"),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener("keydown",o=>o.stopPropagation()),this.domElement.addEventListener("keyup",o=>o.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(n)}name(e){return this._name=e,this.$name.textContent=e,this}onChange(e){return this._onChange=e,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(e=!0){return this.disable(!e)}disable(e=!0){return e===this._disabled?this:(this._disabled=e,this.domElement.classList.toggle("lil-disabled",e),this.$disable.toggleAttribute("disabled",e),this)}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}options(e){const t=this.parent.add(this.object,this.property,e);return t.name(this._name),this.destroy(),t}min(e){return this}max(e){return this}step(e){return this}decimals(e){return this}listen(e=!0){return this._listening=e,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);const e=this.save();e!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=e}getValue(){return this.object[this.property]}setValue(e){return this.getValue()!==e&&(this.object[this.property]=e,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(e){return this.setValue(e),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}}class hT extends is{constructor(e,t,n){super(e,t,n,"lil-boolean","label"),this.$input=document.createElement("input"),this.$input.setAttribute("type","checkbox"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener("change",()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}}function ku(s){let e,t;return(e=s.match(/(#|0x)?([a-f0-9]{6})/i))?t=e[2]:(e=s.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?t=parseInt(e[1]).toString(16).padStart(2,0)+parseInt(e[2]).toString(16).padStart(2,0)+parseInt(e[3]).toString(16).padStart(2,0):(e=s.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(t=e[1]+e[1]+e[2]+e[2]+e[3]+e[3]),t?"#"+t:!1}const uT={isPrimitive:!0,match:s=>typeof s=="string",fromHexString:ku,toHexString:ku},Oa={isPrimitive:!0,match:s=>typeof s=="number",fromHexString:s=>parseInt(s.substring(1),16),toHexString:s=>"#"+s.toString(16).padStart(6,0)},dT={isPrimitive:!1,match:s=>Array.isArray(s)||ArrayBuffer.isView(s),fromHexString(s,e,t=1){const n=Oa.fromHexString(s);e[0]=(n>>16&255)/255*t,e[1]=(n>>8&255)/255*t,e[2]=(n&255)/255*t},toHexString([s,e,t],n=1){n=255/n;const i=s*n<<16^e*n<<8^t*n<<0;return Oa.toHexString(i)}},fT={isPrimitive:!1,match:s=>Object(s)===s,fromHexString(s,e,t=1){const n=Oa.fromHexString(s);e.r=(n>>16&255)/255*t,e.g=(n>>8&255)/255*t,e.b=(n&255)/255*t},toHexString({r:s,g:e,b:t},n=1){n=255/n;const i=s*n<<16^e*n<<8^t*n<<0;return Oa.toHexString(i)}},pT=[uT,Oa,dT,fT];function mT(s){return pT.find(e=>e.match(s))}class gT extends is{constructor(e,t,n,i){super(e,t,n,"lil-color"),this.$input=document.createElement("input"),this.$input.setAttribute("type","color"),this.$input.setAttribute("tabindex",-1),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$text=document.createElement("input"),this.$text.setAttribute("type","text"),this.$text.setAttribute("spellcheck","false"),this.$text.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("lil-display"),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=mT(this.initialValue),this._rgbScale=i,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener("input",()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$text.addEventListener("input",()=>{const r=ku(this.$text.value);r&&this._setValueFromHexString(r)}),this.$text.addEventListener("focus",()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener("blur",()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(e){if(this._format.isPrimitive){const t=this._format.fromHexString(e);this.setValue(t)}else this._format.fromHexString(e,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(e){return this._setValueFromHexString(e),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}}class yh extends is{constructor(e,t,n){super(e,t,n,"lil-function"),this.$button=document.createElement("button"),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener("click",i=>{i.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener("touchstart",()=>{},{passive:!0}),this.$disable=this.$button}}class _T extends is{constructor(e,t,n,i,r,o){super(e,t,n,"lil-number"),this._initInput(),this.min(i),this.max(r);const a=o!==void 0;this.step(a?o:this._getImplicitStep(),a),this.updateDisplay()}decimals(e){return this._decimals=e,this.updateDisplay(),this}min(e){return this._min=e,this._onUpdateMinMax(),this}max(e){return this._max=e,this._onUpdateMinMax(),this}step(e,t=!0){return this._step=e,this._stepExplicit=t,this}updateDisplay(){const e=this.getValue();if(this._hasSlider){let t=(e-this._min)/(this._max-this._min);t=Math.max(0,Math.min(t,1)),this.$fill.style.width=t*100+"%"}return this._inputFocused||(this.$input.value=this._decimals===void 0?e:e.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("aria-labelledby",this.$name.id),window.matchMedia("(pointer: coarse)").matches&&(this.$input.setAttribute("type","number"),this.$input.setAttribute("step","any")),this.$widget.appendChild(this.$input),this.$disable=this.$input;const t=()=>{let y=parseFloat(this.$input.value);isNaN(y)||(this._stepExplicit&&(y=this._snap(y)),this.setValue(this._clamp(y)))},n=y=>{const b=parseFloat(this.$input.value);isNaN(b)||(this._snapClampSetValue(b+y),this.$input.value=this.getValue())},i=y=>{y.key==="Enter"&&this.$input.blur(),y.code==="ArrowUp"&&(y.preventDefault(),n(this._step*this._arrowKeyMultiplier(y))),y.code==="ArrowDown"&&(y.preventDefault(),n(this._step*this._arrowKeyMultiplier(y)*-1))},r=y=>{this._inputFocused&&(y.preventDefault(),n(this._step*this._normalizeMouseWheel(y)))};let o=!1,a,l,c,h,u;const d=5,f=y=>{a=y.clientX,l=c=y.clientY,o=!0,h=this.getValue(),u=0,window.addEventListener("mousemove",g),window.addEventListener("mouseup",_)},g=y=>{if(o){const b=y.clientX-a,v=y.clientY-l;Math.abs(v)>d?(y.preventDefault(),this.$input.blur(),o=!1,this._setDraggingStyle(!0,"vertical")):Math.abs(b)>d&&_()}if(!o){const b=y.clientY-c;u-=b*this._step*this._arrowKeyMultiplier(y),h+u>this._max?u=this._max-h:h+u<this._min&&(u=this._min-h),this._snapClampSetValue(h+u)}c=y.clientY},_=()=>{this._setDraggingStyle(!1,"vertical"),this._callOnFinishChange(),window.removeEventListener("mousemove",g),window.removeEventListener("mouseup",_)},m=()=>{this._inputFocused=!0},p=()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()};this.$input.addEventListener("input",t),this.$input.addEventListener("keydown",i),this.$input.addEventListener("wheel",r,{passive:!1}),this.$input.addEventListener("mousedown",f),this.$input.addEventListener("focus",m),this.$input.addEventListener("blur",p)}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement("div"),this.$slider.classList.add("lil-slider"),this.$fill=document.createElement("div"),this.$fill.classList.add("lil-fill"),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add("lil-has-slider");const e=(p,y,b,v,M)=>(p-y)/(b-y)*(M-v)+v,t=p=>{const y=this.$slider.getBoundingClientRect();let b=e(p,y.left,y.right,this._min,this._max);this._snapClampSetValue(b)},n=p=>{this._setDraggingStyle(!0),t(p.clientX),window.addEventListener("mousemove",i),window.addEventListener("mouseup",r)},i=p=>{t(p.clientX)},r=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("mousemove",i),window.removeEventListener("mouseup",r)};let o=!1,a,l;const c=p=>{p.preventDefault(),this._setDraggingStyle(!0),t(p.touches[0].clientX),o=!1},h=p=>{p.touches.length>1||(this._hasScrollBar?(a=p.touches[0].clientX,l=p.touches[0].clientY,o=!0):c(p),window.addEventListener("touchmove",u,{passive:!1}),window.addEventListener("touchend",d))},u=p=>{if(o){const y=p.touches[0].clientX-a,b=p.touches[0].clientY-l;Math.abs(y)>Math.abs(b)?c(p):(window.removeEventListener("touchmove",u),window.removeEventListener("touchend",d))}else p.preventDefault(),t(p.touches[0].clientX)},d=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("touchmove",u),window.removeEventListener("touchend",d)},f=this._callOnFinishChange.bind(this),g=400;let _;const m=p=>{if(Math.abs(p.deltaX)<Math.abs(p.deltaY)&&this._hasScrollBar)return;p.preventDefault();const b=this._normalizeMouseWheel(p)*this._step;this._snapClampSetValue(this.getValue()+b),this.$input.value=this.getValue(),clearTimeout(_),_=setTimeout(f,g)};this.$slider.addEventListener("mousedown",n),this.$slider.addEventListener("touchstart",h,{passive:!1}),this.$slider.addEventListener("wheel",m,{passive:!1})}_setDraggingStyle(e,t="horizontal"){this.$slider&&this.$slider.classList.toggle("lil-active",e),document.body.classList.toggle("lil-dragging",e),document.body.classList.toggle(`lil-${t}`,e)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(e){let{deltaX:t,deltaY:n}=e;return Math.floor(e.deltaY)!==e.deltaY&&e.wheelDelta&&(t=0,n=-e.wheelDelta/120,n*=this._stepExplicit?1:10),t+-n}_arrowKeyMultiplier(e){let t=this._stepExplicit?1:10;return e.shiftKey?t*=10:e.altKey&&(t/=10),t}_snap(e){let t=0;return this._hasMin?t=this._min:this._hasMax&&(t=this._max),e-=t,e=Math.round(e/this._step)*this._step,e+=t,e=parseFloat(e.toPrecision(15)),e}_clamp(e){return e<this._min&&(e=this._min),e>this._max&&(e=this._max),e}_snapClampSetValue(e){this.setValue(this._clamp(this._snap(e)))}get _hasScrollBar(){const e=this.parent.root.$children;return e.scrollHeight>e.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}}class xT extends is{constructor(e,t,n,i){super(e,t,n,"lil-option"),this.$select=document.createElement("select"),this.$select.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("lil-display"),this.$select.addEventListener("change",()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener("focus",()=>{this.$display.classList.add("lil-focus")}),this.$select.addEventListener("blur",()=>{this.$display.classList.remove("lil-focus")}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(i)}options(e){return this._values=Array.isArray(e)?e:Object.values(e),this._names=Array.isArray(e)?e:Object.keys(e),this.$select.replaceChildren(),this._names.forEach(t=>{const n=document.createElement("option");n.textContent=t,this.$select.appendChild(n)}),this.updateDisplay(),this}updateDisplay(){const e=this.getValue(),t=this._values.indexOf(e);return this.$select.selectedIndex=t,this.$display.textContent=t===-1?e:this._names[t],this}}class yT extends is{constructor(e,t,n){super(e,t,n,"lil-string"),this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("spellcheck","false"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$input.addEventListener("input",()=>{this.setValue(this.$input.value)}),this.$input.addEventListener("keydown",i=>{i.code==="Enter"&&this.$input.blur()}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}}var vT=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.lil-root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.lil-root > .lil-children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.lil-allow-touch-styles, .lil-gui.lil-allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.lil-force-touch-styles, .lil-gui.lil-force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.lil-auto-place, .lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-controller.lil-disabled {
  opacity: 0.5;
}
.lil-controller.lil-disabled, .lil-controller.lil-disabled * {
  pointer-events: none !important;
}
.lil-controller > .lil-name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-controller .lil-widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-controller.lil-string input {
  color: var(--string-color);
}
.lil-controller.lil-boolean {
  cursor: pointer;
}
.lil-controller.lil-color .lil-display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-controller.lil-color .lil-display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-controller.lil-color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-controller.lil-color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-controller.lil-option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-controller.lil-option .lil-display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-display.lil-focus {
    background: var(--focus-color);
  }
}
.lil-controller.lil-option .lil-display.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-option .lil-display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-controller.lil-option .lil-widget,
.lil-controller.lil-option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-widget:hover .lil-display {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number input {
  color: var(--number-color);
}
.lil-controller.lil-number.lil-has-slider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-controller.lil-number .lil-slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-controller.lil-number .lil-slider:hover {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number .lil-slider.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-number .lil-slider.lil-active .lil-fill {
  opacity: 0.95;
}
.lil-controller.lil-number .lil-fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-dragging * {
  cursor: ew-resize !important;
}
.lil-dragging.lil-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .lil-title {
  height: var(--title-height);
  font-weight: 600;
  padding: 0 var(--padding);
  width: 100%;
  text-align: left;
  background: none;
  text-decoration-skip: objects;
}
.lil-gui .lil-title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .lil-title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-dragging) .lil-gui .lil-title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .lil-title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.lil-root > .lil-title:focus {
  text-decoration: none !important;
}
.lil-gui.lil-closed > .lil-title:before {
  content: "▸";
}
.lil-gui.lil-closed > .lil-children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.lil-closed:not(.lil-transition) > .lil-children {
  display: none;
}
.lil-gui.lil-transition > .lil-children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .lil-children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.lil-root > .lil-children > .lil-gui > .lil-title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.lil-root > .lil-children > .lil-gui.lil-closed > .lil-title {
  border-bottom-color: transparent;
}
.lil-gui + .lil-controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .lil-title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .lil-children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .lil-controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  border: none;
}
.lil-gui .lil-controller button {
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
}
@media (hover: hover) {
  .lil-gui .lil-controller button:hover {
    background: var(--hover-color);
  }
  .lil-gui .lil-controller button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui .lil-controller button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff2;charset=utf-8;base64,d09GMgABAAAAAALkAAsAAAAABtQAAAKVAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqBBIEbATYCJAMUCwwABCAFhAoHgQQbHAbIDiUFEYVARAAAYQTVWNmz9MxhEgodq49wYRUFKE8GWNiUBxI2LBRaVnc51U83Gmhs0Q7JXWMiz5eteLwrKwuxHO8VFxUX9UpZBs6pa5ABRwHA+t3UxUnH20EvVknRerzQgX6xC/GH6ZUvTcAjAv122dF28OTqCXrPuyaDER30YBA1xnkVutDDo4oCi71Ca7rrV9xS8dZHbPHefsuwIyCpmT7j+MnjAH5X3984UZoFFuJ0yiZ4XEJFxjagEBeqs+e1iyK8Xf/nOuwF+vVK0ur765+vf7txotUi0m3N0m/84RGSrBCNrh8Ee5GjODjF4gnWP+dJrH/Lk9k4oT6d+gr6g/wssA2j64JJGP6cmx554vUZnpZfn6ZfX2bMwPPrlANsB86/DiHjhl0OP+c87+gaJo/gY084s3HoYL/ZkWHTRfBXvvoHnnkHvngKun4KBE/ede7tvq3/vQOxDXB1/fdNz6XbPdcr0Vhpojj9dG+owuSKFsslCi1tgEjirjXdwMiov2EioadxmqTHUCIwo8NgQaeIasAi0fTYSPTbSmwbMOFduyh9wvBrESGY0MtgRjtgQR8Q1bRPohn2UoCRZf9wyYANMXFeJTysqAe0I4mrherOekFdKMrYvJjLvOIUM9SuwYB5DVZUwwVjJJOaUnZCmcEkIZZrKqNvRGRMvmFZsmhP4VMKCSXBhSqUBxgMS7h0cZvEd71AWkEhGWaeMFcNnpqyJkyXgYL7PQ1MoSq0wDAkRtJIijkZSmqYTiSImfLiSWXIZwhRh3Rug2X0kk1Dgj+Iu43u5p98ghopcpSo0Uyc8SnjlYX59WUeaMoDqmVD2TOWD9a4pCRAzf2ECgwGcrHjPOWY9bNxq/OL3I/QjwEAAAA=") format("woff2");
}`;function bT(s){const e=document.createElement("style");e.innerHTML=s;const t=document.querySelector("head link[rel=stylesheet], head style");t?document.head.insertBefore(e,t):document.head.appendChild(e)}let Xp=!1;class Ud{constructor({parent:e,autoPlace:t=e===void 0,container:n,width:i,title:r="Controls",closeFolders:o=!1,injectStyles:a=!0,touchStyles:l=!0}={}){if(this.parent=e,this.root=e?e.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement("div"),this.domElement.classList.add("lil-gui"),this.$title=document.createElement("button"),this.$title.classList.add("lil-title"),this.$title.setAttribute("aria-expanded",!0),this.$title.addEventListener("click",()=>this.openAnimated(this._closed)),this.$title.addEventListener("touchstart",()=>{},{passive:!0}),this.$children=document.createElement("div"),this.$children.classList.add("lil-children"),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(r),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add("lil-root"),l&&this.domElement.classList.add("lil-allow-touch-styles"),!Xp&&a&&(bT(vT),Xp=!0),n?n.appendChild(this.domElement):t&&(this.domElement.classList.add("lil-auto-place","autoPlace"),document.body.appendChild(this.domElement)),i&&this.domElement.style.setProperty("--width",i+"px"),this._closeFolders=o}add(e,t,n,i,r){if(Object(n)===n)return new xT(this,e,t,n);const o=e[t];switch(typeof o){case"number":return new _T(this,e,t,n,i,r);case"boolean":return new hT(this,e,t);case"string":return new yT(this,e,t);case"function":return new yh(this,e,t)}console.error(`gui.add failed
	property:`,t,`
	object:`,e,`
	value:`,o)}addColor(e,t,n=1){return new gT(this,e,t,n)}addFolder(e){const t=new Ud({parent:this,title:e});return this.root._closeFolders&&t.close(),t}load(e,t=!0){return e.controllers&&this.controllers.forEach(n=>{n instanceof yh||n._name in e.controllers&&n.load(e.controllers[n._name])}),t&&e.folders&&this.folders.forEach(n=>{n._title in e.folders&&n.load(e.folders[n._title])}),this}save(e=!0){const t={controllers:{},folders:{}};return this.controllers.forEach(n=>{if(!(n instanceof yh)){if(n._name in t.controllers)throw new Error(`Cannot save GUI with duplicate property "${n._name}"`);t.controllers[n._name]=n.save()}}),e&&this.folders.forEach(n=>{if(n._title in t.folders)throw new Error(`Cannot save GUI with duplicate folder "${n._title}"`);t.folders[n._title]=n.save()}),t}open(e=!0){return this._setClosed(!e),this.$title.setAttribute("aria-expanded",!this._closed),this.domElement.classList.toggle("lil-closed",this._closed),this}close(){return this.open(!1)}_setClosed(e){this._closed!==e&&(this._closed=e,this._callOnOpenClose(this))}show(e=!0){return this._hidden=!e,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}openAnimated(e=!0){return this._setClosed(!e),this.$title.setAttribute("aria-expanded",!this._closed),requestAnimationFrame(()=>{const t=this.$children.clientHeight;this.$children.style.height=t+"px",this.domElement.classList.add("lil-transition");const n=r=>{r.target===this.$children&&(this.$children.style.height="",this.domElement.classList.remove("lil-transition"),this.$children.removeEventListener("transitionend",n))};this.$children.addEventListener("transitionend",n);const i=e?this.$children.scrollHeight:0;this.domElement.classList.toggle("lil-closed",!e),requestAnimationFrame(()=>{this.$children.style.height=i+"px"})}),this}title(e){return this._title=e,this.$title.textContent=e,this}reset(e=!0){return(e?this.controllersRecursive():this.controllers).forEach(n=>n.reset()),this}onChange(e){return this._onChange=e,this}_callOnChange(e){this.parent&&this.parent._callOnChange(e),this._onChange!==void 0&&this._onChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onFinishChange(e){return this._onFinishChange=e,this}_callOnFinishChange(e){this.parent&&this.parent._callOnFinishChange(e),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:e.object,property:e.property,value:e.getValue(),controller:e})}onOpenClose(e){return this._onOpenClose=e,this}_callOnOpenClose(e){this.parent&&this.parent._callOnOpenClose(e),this._onOpenClose!==void 0&&this._onOpenClose.call(this,e)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(e=>e.destroy())}controllersRecursive(){let e=Array.from(this.controllers);return this.folders.forEach(t=>{e=e.concat(t.controllersRecursive())}),e}foldersRecursive(){let e=Array.from(this.folders);return this.folders.forEach(t=>{e=e.concat(t.foldersRecursive())}),e}}var ST=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{},Bu={exports:{}};(function(s,e){(function(t,n){n(e)})(ST,(function(t){var n=(C,N,x,B)=>{let O=65535&C|0,U=C>>>16&65535|0,re=0;for(;x!==0;){re=x>2e3?2e3:x,x-=re;do O=O+N[B++]|0,U=U+O|0;while(--re);O%=65521,U%=65521}return O|U<<16|0};const i=new Uint32Array((()=>{let C,N=[];for(var x=0;x<256;x++){C=x;for(var B=0;B<8;B++)C=1&C?3988292384^C>>>1:C>>>1;N[x]=C}return N})());var r=(C,N,x,B)=>{const O=i,U=B+x;C^=-1;for(let re=B;re<U;re++)C=C>>>8^O[255&(C^N[re])];return-1^C};const o=16209;var a=function(C,N){let x,B,O,U,re,ie,Re,Q,ee,Mn,je,ce,wn,vt,He,pt,nt,xe,ut,It,Ue,bt,it,$e;const at=C.state;x=C.next_in,it=C.input,B=x+(C.avail_in-5),O=C.next_out,$e=C.output,U=O-(N-C.avail_out),re=O+(C.avail_out-257),ie=at.dmax,Re=at.wsize,Q=at.whave,ee=at.wnext,Mn=at.window,je=at.hold,ce=at.bits,wn=at.lencode,vt=at.distcode,He=(1<<at.lenbits)-1,pt=(1<<at.distbits)-1;e:do{ce<15&&(je+=it[x++]<<ce,ce+=8,je+=it[x++]<<ce,ce+=8),nt=wn[je&He];t:for(;;){if(xe=nt>>>24,je>>>=xe,ce-=xe,xe=nt>>>16&255,xe===0)$e[O++]=65535&nt;else{if(!(16&xe)){if((64&xe)==0){nt=wn[(65535&nt)+(je&(1<<xe)-1)];continue t}if(32&xe){at.mode=16191;break e}C.msg="invalid literal/length code",at.mode=o;break e}ut=65535&nt,xe&=15,xe&&(ce<xe&&(je+=it[x++]<<ce,ce+=8),ut+=je&(1<<xe)-1,je>>>=xe,ce-=xe),ce<15&&(je+=it[x++]<<ce,ce+=8,je+=it[x++]<<ce,ce+=8),nt=vt[je&pt];n:for(;;){if(xe=nt>>>24,je>>>=xe,ce-=xe,xe=nt>>>16&255,!(16&xe)){if((64&xe)==0){nt=vt[(65535&nt)+(je&(1<<xe)-1)];continue n}C.msg="invalid distance code",at.mode=o;break e}if(It=65535&nt,xe&=15,ce<xe&&(je+=it[x++]<<ce,ce+=8,ce<xe&&(je+=it[x++]<<ce,ce+=8)),It+=je&(1<<xe)-1,It>ie){C.msg="invalid distance too far back",at.mode=o;break e}if(je>>>=xe,ce-=xe,xe=O-U,It>xe){if(xe=It-xe,xe>Q&&at.sane){C.msg="invalid distance too far back",at.mode=o;break e}if(Ue=0,bt=Mn,ee===0){if(Ue+=Re-xe,xe<ut){ut-=xe;do $e[O++]=Mn[Ue++];while(--xe);Ue=O-It,bt=$e}}else if(ee<xe){if(Ue+=Re+ee-xe,xe-=ee,xe<ut){ut-=xe;do $e[O++]=Mn[Ue++];while(--xe);if(Ue=0,ee<ut){xe=ee,ut-=xe;do $e[O++]=Mn[Ue++];while(--xe);Ue=O-It,bt=$e}}}else if(Ue+=ee-xe,xe<ut){ut-=xe;do $e[O++]=Mn[Ue++];while(--xe);Ue=O-It,bt=$e}for(;ut>2;)$e[O++]=bt[Ue++],$e[O++]=bt[Ue++],$e[O++]=bt[Ue++],ut-=3;ut&&($e[O++]=bt[Ue++],ut>1&&($e[O++]=bt[Ue++]))}else{Ue=O-It;do $e[O++]=$e[Ue++],$e[O++]=$e[Ue++],$e[O++]=$e[Ue++],ut-=3;while(ut>2);ut&&($e[O++]=$e[Ue++],ut>1&&($e[O++]=$e[Ue++]))}break}}break}}while(x<B&&O<re);ut=ce>>3,x-=ut,ce-=ut<<3,je&=(1<<ce)-1,C.next_in=x,C.next_out=O,C.avail_in=x<B?B-x+5:5-(x-B),C.avail_out=O<re?re-O+257:257-(O-re),at.hold=je,at.bits=ce};const l=15,c=new Uint16Array([3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0]),h=new Uint8Array([16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78]),u=new Uint16Array([1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0]),d=new Uint8Array([16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64]);var f=(C,N,x,B,O,U,re,ie)=>{const Re=ie.bits;let Q,ee,Mn,je,ce,wn,vt=0,He=0,pt=0,nt=0,xe=0,ut=0,It=0,Ue=0,bt=0,it=0,$e=null;const at=new Uint16Array(16),Rn=new Uint16Array(16);let ir,Or,kr,Br=null;for(vt=0;vt<=l;vt++)at[vt]=0;for(He=0;He<B;He++)at[N[x+He]]++;for(xe=Re,nt=l;nt>=1&&at[nt]===0;nt--);if(xe>nt&&(xe=nt),nt===0)return O[U++]=20971520,O[U++]=20971520,ie.bits=1,0;for(pt=1;pt<nt&&at[pt]===0;pt++);for(xe<pt&&(xe=pt),Ue=1,vt=1;vt<=l;vt++)if(Ue<<=1,Ue-=at[vt],Ue<0)return-1;if(Ue>0&&(C===0||nt!==1))return-1;for(Rn[1]=0,vt=1;vt<l;vt++)Rn[vt+1]=Rn[vt]+at[vt];for(He=0;He<B;He++)N[x+He]!==0&&(re[Rn[N[x+He]]++]=He);if(C===0?($e=Br=re,wn=20):C===1?($e=c,Br=h,wn=257):($e=u,Br=d,wn=0),it=0,He=0,vt=pt,ce=U,ut=xe,It=0,Mn=-1,bt=1<<xe,je=bt-1,C===1&&bt>852||C===2&&bt>592)return 1;for(;;){ir=vt-It,re[He]+1<wn?(Or=0,kr=re[He]):re[He]>=wn?(Or=Br[re[He]-wn],kr=$e[re[He]-wn]):(Or=96,kr=0),Q=1<<vt-It,ee=1<<ut,pt=ee;do ee-=Q,O[ce+(it>>It)+ee]=ir<<24|Or<<16|kr|0;while(ee!==0);for(Q=1<<vt-1;it&Q;)Q>>=1;if(Q!==0?(it&=Q-1,it+=Q):it=0,He++,--at[vt]==0){if(vt===nt)break;vt=N[x+re[He]]}if(vt>xe&&(it&je)!==Mn){for(It===0&&(It=xe),ce+=pt,ut=vt-It,Ue=1<<ut;ut+It<nt&&(Ue-=at[ut+It],!(Ue<=0));)ut++,Ue<<=1;if(bt+=1<<ut,C===1&&bt>852||C===2&&bt>592)return 1;Mn=it&je,O[Mn]=xe<<24|ut<<16|ce-U|0}}return it!==0&&(O[ce+it]=vt-It<<24|64<<16|0),ie.bits=xe,0},g={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_MEM_ERROR:-4,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8};const{Z_FINISH:_,Z_BLOCK:m,Z_TREES:p,Z_OK:y,Z_STREAM_END:b,Z_NEED_DICT:v,Z_STREAM_ERROR:M,Z_DATA_ERROR:E,Z_MEM_ERROR:A,Z_BUF_ERROR:P,Z_DEFLATED:S}=g,T=16180,L=16190,k=16191,H=16192,Y=16194,W=16199,j=16200,V=16206,q=16209,he=C=>(C>>>24&255)+(C>>>8&65280)+((65280&C)<<8)+((255&C)<<24);function ue(){this.strm=null,this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new Uint16Array(320),this.work=new Uint16Array(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}const de=C=>{if(!C)return 1;const N=C.state;return!N||N.strm!==C||N.mode<T||N.mode>16211?1:0},ze=C=>{if(de(C))return M;const N=C.state;return C.total_in=C.total_out=N.total=0,C.msg="",N.wrap&&(C.adler=1&N.wrap),N.mode=T,N.last=0,N.havedict=0,N.flags=-1,N.dmax=32768,N.head=null,N.hold=0,N.bits=0,N.lencode=N.lendyn=new Int32Array(852),N.distcode=N.distdyn=new Int32Array(592),N.sane=1,N.back=-1,y},Je=C=>{if(de(C))return M;const N=C.state;return N.wsize=0,N.whave=0,N.wnext=0,ze(C)},ht=(C,N)=>{let x;if(de(C))return M;const B=C.state;return N<0?(x=0,N=-N):(x=5+(N>>4),N<48&&(N&=15)),N&&(N<8||N>15)?M:(B.window!==null&&B.wbits!==N&&(B.window=null),B.wrap=x,B.wbits=N,Je(C))},_t=(C,N)=>{if(!C)return M;const x=new ue;C.state=x,x.strm=C,x.window=null,x.mode=T;const B=ht(C,N);return B!==y&&(C.state=null),B};let se,ae,we=!0;const tt=C=>{if(we){se=new Int32Array(512),ae=new Int32Array(32);let N=0;for(;N<144;)C.lens[N++]=8;for(;N<256;)C.lens[N++]=9;for(;N<280;)C.lens[N++]=7;for(;N<288;)C.lens[N++]=8;for(f(1,C.lens,0,288,se,0,C.work,{bits:9}),N=0;N<32;)C.lens[N++]=5;f(2,C.lens,0,32,ae,0,C.work,{bits:5}),we=!1}C.lencode=se,C.lenbits=9,C.distcode=ae,C.distbits=5},Ae=(C,N,x,B)=>{let O;const U=C.state;return U.window===null&&(U.wsize=1<<U.wbits,U.wnext=0,U.whave=0,U.window=new Uint8Array(U.wsize)),B>=U.wsize?(U.window.set(N.subarray(x-U.wsize,x),0),U.wnext=0,U.whave=U.wsize):(O=U.wsize-U.wnext,O>B&&(O=B),U.window.set(N.subarray(x-B,x-B+O),U.wnext),(B-=O)?(U.window.set(N.subarray(x-B,x),0),U.wnext=B,U.whave=U.wsize):(U.wnext+=O,U.wnext===U.wsize&&(U.wnext=0),U.whave<U.wsize&&(U.whave+=O))),0};var st={inflateReset:Je,inflateReset2:ht,inflateResetKeep:ze,inflateInit:C=>_t(C,15),inflateInit2:_t,inflate:(C,N)=>{let x,B,O,U,re,ie,Re,Q,ee,Mn,je,ce,wn,vt,He,pt,nt,xe,ut,It,Ue,bt,it=0;const $e=new Uint8Array(4);let at,Rn;const ir=new Uint8Array([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]);if(de(C)||!C.output||!C.input&&C.avail_in!==0)return M;x=C.state,x.mode===k&&(x.mode=H),re=C.next_out,O=C.output,Re=C.avail_out,U=C.next_in,B=C.input,ie=C.avail_in,Q=x.hold,ee=x.bits,Mn=ie,je=Re,bt=y;e:for(;;)switch(x.mode){case T:if(x.wrap===0){x.mode=H;break}for(;ee<16;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}if(2&x.wrap&&Q===35615){x.wbits===0&&(x.wbits=15),x.check=0,$e[0]=255&Q,$e[1]=Q>>>8&255,x.check=r(x.check,$e,2,0),Q=0,ee=0,x.mode=16181;break}if(x.head&&(x.head.done=!1),!(1&x.wrap)||(((255&Q)<<8)+(Q>>8))%31){C.msg="incorrect header check",x.mode=q;break}if((15&Q)!==S){C.msg="unknown compression method",x.mode=q;break}if(Q>>>=4,ee-=4,Ue=8+(15&Q),x.wbits===0&&(x.wbits=Ue),Ue>15||Ue>x.wbits){C.msg="invalid window size",x.mode=q;break}x.dmax=1<<x.wbits,x.flags=0,C.adler=x.check=1,x.mode=512&Q?16189:k,Q=0,ee=0;break;case 16181:for(;ee<16;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}if(x.flags=Q,(255&x.flags)!==S){C.msg="unknown compression method",x.mode=q;break}if(57344&x.flags){C.msg="unknown header flags set",x.mode=q;break}x.head&&(x.head.text=Q>>8&1),512&x.flags&&4&x.wrap&&($e[0]=255&Q,$e[1]=Q>>>8&255,x.check=r(x.check,$e,2,0)),Q=0,ee=0,x.mode=16182;case 16182:for(;ee<32;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}x.head&&(x.head.time=Q),512&x.flags&&4&x.wrap&&($e[0]=255&Q,$e[1]=Q>>>8&255,$e[2]=Q>>>16&255,$e[3]=Q>>>24&255,x.check=r(x.check,$e,4,0)),Q=0,ee=0,x.mode=16183;case 16183:for(;ee<16;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}x.head&&(x.head.xflags=255&Q,x.head.os=Q>>8),512&x.flags&&4&x.wrap&&($e[0]=255&Q,$e[1]=Q>>>8&255,x.check=r(x.check,$e,2,0)),Q=0,ee=0,x.mode=16184;case 16184:if(1024&x.flags){for(;ee<16;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}x.length=Q,x.head&&(x.head.extra_len=Q),512&x.flags&&4&x.wrap&&($e[0]=255&Q,$e[1]=Q>>>8&255,x.check=r(x.check,$e,2,0)),Q=0,ee=0}else x.head&&(x.head.extra=null);x.mode=16185;case 16185:if(1024&x.flags&&(ce=x.length,ce>ie&&(ce=ie),ce&&(x.head&&(Ue=x.head.extra_len-x.length,x.head.extra||(x.head.extra=new Uint8Array(x.head.extra_len)),x.head.extra.set(B.subarray(U,U+ce),Ue)),512&x.flags&&4&x.wrap&&(x.check=r(x.check,B,ce,U)),ie-=ce,U+=ce,x.length-=ce),x.length))break e;x.length=0,x.mode=16186;case 16186:if(2048&x.flags){if(ie===0)break e;ce=0;do Ue=B[U+ce++],x.head&&Ue&&x.length<65536&&(x.head.name+=String.fromCharCode(Ue));while(Ue&&ce<ie);if(512&x.flags&&4&x.wrap&&(x.check=r(x.check,B,ce,U)),ie-=ce,U+=ce,Ue)break e}else x.head&&(x.head.name=null);x.length=0,x.mode=16187;case 16187:if(4096&x.flags){if(ie===0)break e;ce=0;do Ue=B[U+ce++],x.head&&Ue&&x.length<65536&&(x.head.comment+=String.fromCharCode(Ue));while(Ue&&ce<ie);if(512&x.flags&&4&x.wrap&&(x.check=r(x.check,B,ce,U)),ie-=ce,U+=ce,Ue)break e}else x.head&&(x.head.comment=null);x.mode=16188;case 16188:if(512&x.flags){for(;ee<16;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}if(4&x.wrap&&Q!==(65535&x.check)){C.msg="header crc mismatch",x.mode=q;break}Q=0,ee=0}x.head&&(x.head.hcrc=x.flags>>9&1,x.head.done=!0),C.adler=x.check=0,x.mode=k;break;case 16189:for(;ee<32;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}C.adler=x.check=he(Q),Q=0,ee=0,x.mode=L;case L:if(x.havedict===0)return C.next_out=re,C.avail_out=Re,C.next_in=U,C.avail_in=ie,x.hold=Q,x.bits=ee,v;C.adler=x.check=1,x.mode=k;case k:if(N===m||N===p)break e;case H:if(x.last){Q>>>=7&ee,ee-=7&ee,x.mode=V;break}for(;ee<3;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}switch(x.last=1&Q,Q>>>=1,ee-=1,3&Q){case 0:x.mode=16193;break;case 1:if(tt(x),x.mode=W,N===p){Q>>>=2,ee-=2;break e}break;case 2:x.mode=16196;break;case 3:C.msg="invalid block type",x.mode=q}Q>>>=2,ee-=2;break;case 16193:for(Q>>>=7&ee,ee-=7&ee;ee<32;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}if((65535&Q)!=(Q>>>16^65535)){C.msg="invalid stored block lengths",x.mode=q;break}if(x.length=65535&Q,Q=0,ee=0,x.mode=Y,N===p)break e;case Y:x.mode=16195;case 16195:if(ce=x.length,ce){if(ce>ie&&(ce=ie),ce>Re&&(ce=Re),ce===0)break e;O.set(B.subarray(U,U+ce),re),ie-=ce,U+=ce,Re-=ce,re+=ce,x.length-=ce;break}x.mode=k;break;case 16196:for(;ee<14;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}if(x.nlen=257+(31&Q),Q>>>=5,ee-=5,x.ndist=1+(31&Q),Q>>>=5,ee-=5,x.ncode=4+(15&Q),Q>>>=4,ee-=4,x.nlen>286||x.ndist>30){C.msg="too many length or distance symbols",x.mode=q;break}x.have=0,x.mode=16197;case 16197:for(;x.have<x.ncode;){for(;ee<3;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}x.lens[ir[x.have++]]=7&Q,Q>>>=3,ee-=3}for(;x.have<19;)x.lens[ir[x.have++]]=0;if(x.lencode=x.lendyn,x.lenbits=7,at={bits:x.lenbits},bt=f(0,x.lens,0,19,x.lencode,0,x.work,at),x.lenbits=at.bits,bt){C.msg="invalid code lengths set",x.mode=q;break}x.have=0,x.mode=16198;case 16198:for(;x.have<x.nlen+x.ndist;){for(;it=x.lencode[Q&(1<<x.lenbits)-1],He=it>>>24,pt=it>>>16&255,nt=65535&it,!(He<=ee);){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}if(nt<16)Q>>>=He,ee-=He,x.lens[x.have++]=nt;else{if(nt===16){for(Rn=He+2;ee<Rn;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}if(Q>>>=He,ee-=He,x.have===0){C.msg="invalid bit length repeat",x.mode=q;break}Ue=x.lens[x.have-1],ce=3+(3&Q),Q>>>=2,ee-=2}else if(nt===17){for(Rn=He+3;ee<Rn;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}Q>>>=He,ee-=He,Ue=0,ce=3+(7&Q),Q>>>=3,ee-=3}else{for(Rn=He+7;ee<Rn;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}Q>>>=He,ee-=He,Ue=0,ce=11+(127&Q),Q>>>=7,ee-=7}if(x.have+ce>x.nlen+x.ndist){C.msg="invalid bit length repeat",x.mode=q;break}for(;ce--;)x.lens[x.have++]=Ue}}if(x.mode===q)break;if(x.lens[256]===0){C.msg="invalid code -- missing end-of-block",x.mode=q;break}if(x.lenbits=9,at={bits:x.lenbits},bt=f(1,x.lens,0,x.nlen,x.lencode,0,x.work,at),x.lenbits=at.bits,bt){C.msg="invalid literal/lengths set",x.mode=q;break}if(x.distbits=6,x.distcode=x.distdyn,at={bits:x.distbits},bt=f(2,x.lens,x.nlen,x.ndist,x.distcode,0,x.work,at),x.distbits=at.bits,bt){C.msg="invalid distances set",x.mode=q;break}if(x.mode=W,N===p)break e;case W:x.mode=j;case j:if(ie>=6&&Re>=258){C.next_out=re,C.avail_out=Re,C.next_in=U,C.avail_in=ie,x.hold=Q,x.bits=ee,a(C,je),re=C.next_out,O=C.output,Re=C.avail_out,U=C.next_in,B=C.input,ie=C.avail_in,Q=x.hold,ee=x.bits,x.mode===k&&(x.back=-1);break}for(x.back=0;it=x.lencode[Q&(1<<x.lenbits)-1],He=it>>>24,pt=it>>>16&255,nt=65535&it,!(He<=ee);){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}if(pt&&(240&pt)==0){for(xe=He,ut=pt,It=nt;it=x.lencode[It+((Q&(1<<xe+ut)-1)>>xe)],He=it>>>24,pt=it>>>16&255,nt=65535&it,!(xe+He<=ee);){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}Q>>>=xe,ee-=xe,x.back+=xe}if(Q>>>=He,ee-=He,x.back+=He,x.length=nt,pt===0){x.mode=16205;break}if(32&pt){x.back=-1,x.mode=k;break}if(64&pt){C.msg="invalid literal/length code",x.mode=q;break}x.extra=15&pt,x.mode=16201;case 16201:if(x.extra){for(Rn=x.extra;ee<Rn;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}x.length+=Q&(1<<x.extra)-1,Q>>>=x.extra,ee-=x.extra,x.back+=x.extra}x.was=x.length,x.mode=16202;case 16202:for(;it=x.distcode[Q&(1<<x.distbits)-1],He=it>>>24,pt=it>>>16&255,nt=65535&it,!(He<=ee);){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}if((240&pt)==0){for(xe=He,ut=pt,It=nt;it=x.distcode[It+((Q&(1<<xe+ut)-1)>>xe)],He=it>>>24,pt=it>>>16&255,nt=65535&it,!(xe+He<=ee);){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}Q>>>=xe,ee-=xe,x.back+=xe}if(Q>>>=He,ee-=He,x.back+=He,64&pt){C.msg="invalid distance code",x.mode=q;break}x.offset=nt,x.extra=15&pt,x.mode=16203;case 16203:if(x.extra){for(Rn=x.extra;ee<Rn;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}x.offset+=Q&(1<<x.extra)-1,Q>>>=x.extra,ee-=x.extra,x.back+=x.extra}if(x.offset>x.dmax){C.msg="invalid distance too far back",x.mode=q;break}x.mode=16204;case 16204:if(Re===0)break e;if(ce=je-Re,x.offset>ce){if(ce=x.offset-ce,ce>x.whave&&x.sane){C.msg="invalid distance too far back",x.mode=q;break}ce>x.wnext?(ce-=x.wnext,wn=x.wsize-ce):wn=x.wnext-ce,ce>x.length&&(ce=x.length),vt=x.window}else vt=O,wn=re-x.offset,ce=x.length;ce>Re&&(ce=Re),Re-=ce,x.length-=ce;do O[re++]=vt[wn++];while(--ce);x.length===0&&(x.mode=j);break;case 16205:if(Re===0)break e;O[re++]=x.length,Re--,x.mode=j;break;case V:if(x.wrap){for(;ee<32;){if(ie===0)break e;ie--,Q|=B[U++]<<ee,ee+=8}if(je-=Re,C.total_out+=je,x.total+=je,4&x.wrap&&je&&(C.adler=x.check=x.flags?r(x.check,O,je,re-je):n(x.check,O,je,re-je)),je=Re,4&x.wrap&&(x.flags?Q:he(Q))!==x.check){C.msg="incorrect data check",x.mode=q;break}Q=0,ee=0}x.mode=16207;case 16207:if(x.wrap&&x.flags){for(;ee<32;){if(ie===0)break e;ie--,Q+=B[U++]<<ee,ee+=8}if(4&x.wrap&&Q!==(4294967295&x.total)){C.msg="incorrect length check",x.mode=q;break}Q=0,ee=0}x.mode=16208;case 16208:bt=b;break e;case q:bt=E;break e;case 16210:return A;default:return M}return C.next_out=re,C.avail_out=Re,C.next_in=U,C.avail_in=ie,x.hold=Q,x.bits=ee,(x.wsize||je!==C.avail_out&&x.mode<q&&(x.mode<V||N!==_))&&Ae(C,C.output,C.next_out,je-C.avail_out),Mn-=C.avail_in,je-=C.avail_out,C.total_in+=Mn,C.total_out+=je,x.total+=je,4&x.wrap&&je&&(C.adler=x.check=x.flags?r(x.check,O,je,C.next_out-je):n(x.check,O,je,C.next_out-je)),C.data_type=x.bits+(x.last?64:0)+(x.mode===k?128:0)+(x.mode===W||x.mode===Y?256:0),(Mn===0&&je===0||N===_)&&bt===y&&(bt=P),bt},inflateEnd:C=>{if(de(C))return M;let N=C.state;return N.window&&(N.window=null),C.state=null,y},inflateGetHeader:(C,N)=>{if(de(C))return M;const x=C.state;return(2&x.wrap)==0?M:(x.head=N,N.done=!1,y)},inflateSetDictionary:(C,N)=>{const x=N.length;let B,O,U;return de(C)?M:(B=C.state,B.wrap!==0&&B.mode!==L?M:B.mode===L&&(O=1,O=n(O,N,x,0),O!==B.check)?E:(U=Ae(C,N,x,x),U?(B.mode=16210,A):(B.havedict=1,y)))},inflateInfo:"pako inflate (from Nodeca project)"};const cn=(C,N)=>Object.prototype.hasOwnProperty.call(C,N);var yt=function(C){const N=Array.prototype.slice.call(arguments,1);for(;N.length;){const x=N.shift();if(x){if(typeof x!="object")throw new TypeError(x+"must be non-object");for(const B in x)cn(x,B)&&(C[B]=x[B])}}return C},Rt=C=>{let N=0;for(let B=0,O=C.length;B<O;B++)N+=C[B].length;const x=new Uint8Array(N);for(let B=0,O=0,U=C.length;B<U;B++){let re=C[B];x.set(re,O),O+=re.length}return x};let Pt=!0;try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{Pt=!1}const et=new Uint8Array(256);for(let C=0;C<256;C++)et[C]=C>=252?6:C>=248?5:C>=240?4:C>=224?3:C>=192?2:1;et[254]=et[254]=1;var en=C=>{if(typeof TextEncoder=="function"&&TextEncoder.prototype.encode)return new TextEncoder().encode(C);let N,x,B,O,U,re=C.length,ie=0;for(O=0;O<re;O++)x=C.charCodeAt(O),(64512&x)==55296&&O+1<re&&(B=C.charCodeAt(O+1),(64512&B)==56320&&(x=65536+(x-55296<<10)+(B-56320),O++)),ie+=x<128?1:x<2048?2:x<65536?3:4;for(N=new Uint8Array(ie),U=0,O=0;U<ie;O++)x=C.charCodeAt(O),(64512&x)==55296&&O+1<re&&(B=C.charCodeAt(O+1),(64512&B)==56320&&(x=65536+(x-55296<<10)+(B-56320),O++)),x<128?N[U++]=x:x<2048?(N[U++]=192|x>>>6,N[U++]=128|63&x):x<65536?(N[U++]=224|x>>>12,N[U++]=128|x>>>6&63,N[U++]=128|63&x):(N[U++]=240|x>>>18,N[U++]=128|x>>>12&63,N[U++]=128|x>>>6&63,N[U++]=128|63&x);return N},F=(C,N)=>{const x=N||C.length;if(typeof TextDecoder=="function"&&TextDecoder.prototype.decode)return new TextDecoder().decode(C.subarray(0,N));let B,O;const U=new Array(2*x);for(O=0,B=0;B<x;){let re=C[B++];if(re<128){U[O++]=re;continue}let ie=et[re];if(ie>4)U[O++]=65533,B+=ie-1;else{for(re&=ie===2?31:ie===3?15:7;ie>1&&B<x;)re=re<<6|63&C[B++],ie--;ie>1?U[O++]=65533:re<65536?U[O++]=re:(re-=65536,U[O++]=55296|re>>10&1023,U[O++]=56320|1023&re)}}return((re,ie)=>{if(ie<65534&&re.subarray&&Pt)return String.fromCharCode.apply(null,re.length===ie?re:re.subarray(0,ie));let Re="";for(let Q=0;Q<ie;Q++)Re+=String.fromCharCode(re[Q]);return Re})(U,O)},tn=(C,N)=>{(N=N||C.length)>C.length&&(N=C.length);let x=N-1;for(;x>=0&&(192&C[x])==128;)x--;return x<0||x===0?N:x+et[C[x]]>N?x:N},Mt={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"},Ot=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg="",this.state=null,this.data_type=2,this.adler=0},Le=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name="",this.comment="",this.hcrc=0,this.done=!1};const I=Object.prototype.toString,{Z_NO_FLUSH:w,Z_FINISH:G,Z_OK:ne,Z_STREAM_END:oe,Z_NEED_DICT:te,Z_STREAM_ERROR:De,Z_DATA_ERROR:fe,Z_MEM_ERROR:Pe}=g;function Ge(C){this.options=yt({chunkSize:65536,windowBits:15,to:""},C||{});const N=this.options;N.raw&&N.windowBits>=0&&N.windowBits<16&&(N.windowBits=-N.windowBits,N.windowBits===0&&(N.windowBits=-15)),!(N.windowBits>=0&&N.windowBits<16)||C&&C.windowBits||(N.windowBits+=32),N.windowBits>15&&N.windowBits<48&&(15&N.windowBits)==0&&(N.windowBits|=15),this.err=0,this.msg="",this.ended=!1,this.chunks=[],this.strm=new Ot,this.strm.avail_out=0;let x=st.inflateInit2(this.strm,N.windowBits);if(x!==ne)throw new Error(Mt[x]);if(this.header=new Le,st.inflateGetHeader(this.strm,this.header),N.dictionary&&(typeof N.dictionary=="string"?N.dictionary=en(N.dictionary):I.call(N.dictionary)==="[object ArrayBuffer]"&&(N.dictionary=new Uint8Array(N.dictionary)),N.raw&&(x=st.inflateSetDictionary(this.strm,N.dictionary),x!==ne)))throw new Error(Mt[x])}function le(C,N){const x=new Ge(N);if(x.push(C),x.err)throw x.msg||Mt[x.err];return x.result}Ge.prototype.push=function(C,N){const x=this.strm,B=this.options.chunkSize,O=this.options.dictionary;let U,re,ie;if(this.ended)return!1;for(re=N===~~N?N:N===!0?G:w,I.call(C)==="[object ArrayBuffer]"?x.input=new Uint8Array(C):x.input=C,x.next_in=0,x.avail_in=x.input.length;;){for(x.avail_out===0&&(x.output=new Uint8Array(B),x.next_out=0,x.avail_out=B),U=st.inflate(x,re),U===te&&O&&(U=st.inflateSetDictionary(x,O),U===ne?U=st.inflate(x,re):U===fe&&(U=te));x.avail_in>0&&U===oe&&x.state.wrap>0&&C[x.next_in]!==0;)st.inflateReset(x),U=st.inflate(x,re);switch(U){case De:case fe:case te:case Pe:return this.onEnd(U),this.ended=!0,!1}if(ie=x.avail_out,x.next_out&&(x.avail_out===0||U===oe))if(this.options.to==="string"){let Re=tn(x.output,x.next_out),Q=x.next_out-Re,ee=F(x.output,Re);x.next_out=Q,x.avail_out=B-Q,Q&&x.output.set(x.output.subarray(Re,Re+Q),0),this.onData(ee)}else this.onData(x.output.length===x.next_out?x.output:x.output.subarray(0,x.next_out));if(U!==ne||ie!==0){if(U===oe)return U=st.inflateEnd(this.strm),this.onEnd(U),this.ended=!0,!0;if(x.avail_in===0)break}}return!0},Ge.prototype.onData=function(C){this.chunks.push(C)},Ge.prototype.onEnd=function(C){C===ne&&(this.options.to==="string"?this.result=this.chunks.join(""):this.result=Rt(this.chunks)),this.chunks=[],this.err=C,this.msg=this.strm.msg};var _e=Ge,Te=le,Ie=function(C,N){return(N=N||{}).raw=!0,le(C,N)},pe=le,rt=g,z={Inflate:_e,inflate:Te,inflateRaw:Ie,ungzip:pe,constants:rt};t.Inflate=_e,t.constants=rt,t.default=z,t.inflate=Te,t.inflateRaw=Ie,t.ungzip=pe,Object.defineProperty(t,"__esModule",{value:!0})}))})(Bu,Bu.exports);var MT=Bu.exports;const wT=!0;class ET{constructor(e){this.dataView=new DataView(e),this.position=0}skip(e){this.position+=e}readBytes(e){const t=e===4?"getUint32":e===2?"getUint16":"getUint8",n=this.position;return this.position+=e,this.dataView[t](n,wT)}}const TT=67324752,AT=33639248,jp=s=>{const e=new ET(s),t={};for(;;){const n=e.readBytes(4);if(n===TT){const i=RT(e);t[i.name]={buffer:i.buffer};continue}if(n===AT){CT(e);continue}break}return t},RT=s=>{let e=0,t;s.skip(4);const n=s.readBytes(2);s.skip(8);const i=s.readBytes(4);s.skip(4);const r=s.readBytes(2),o=s.readBytes(2),a=[],l=new Uint8Array(i);for(e=0;e<r;e++)a.push(String.fromCharCode(s.readBytes(1)));for(s.skip(o),e=0;e<i;e++)l[e]=s.readBytes(1);switch(n){case 0:t=l;break;case 8:t=new Uint8Array(MT.inflate(l,{raw:!0}));break;default:console.log(`${a.join("")}: unsupported compression type`),t=l}return{name:a.join(""),buffer:t}},CT=s=>{s.skip(24);const e=s.readBytes(2),t=s.readBytes(2),n=s.readBytes(2);s.skip(12),s.skip(e),s.skip(t),s.skip(n)},PT=class Ug{static unzip(e){return new Promise(t=>{const n=new Ug,i=new FileReader;i.onload=r=>{const o=r.target.result;n.files=jp(o),t(n)},e instanceof Blob&&i.readAsArrayBuffer(e)})}constructor(e,t={}){this._listeners={},this.url=e,this.fetchOptions=t,this.files=null}async load(){this.clear();const e=Date.now(),n=await(await fetch(this.url,this.fetchOptions).then(i=>{const r=this,o=parseInt(i.headers.get("content-length"),10);let a=0;return new Response(new ReadableStream({start(l){const c=i.body.getReader(),h=async()=>{const{done:u,value:d}=await c.read();if(u){l.close();return}a+=d.byteLength,l.enqueue(d),r.dispatch({type:"progress",loaded:a,total:o,elapsedTime:Date.now()-e}),h()};h()}}))}).catch(i=>{this.dispatch({type:"error",error:i})})).arrayBuffer();return this.files=jp(n),this.dispatch({type:"load",elapsedTime:Date.now()-e}),this.files}extractAsBlobUrl(e,t){if(this.files[e].url)return this.files[e].url;const n=new Blob([this.files[e].buffer],{type:t});return this.files[e].url=URL.createObjectURL(n),this.files[e].url}extractAsText(e){const t=this.files[e].buffer;if(typeof TextDecoder<"u")return new TextDecoder().decode(t);let n="";for(let i=0,r=t.length;i<r;i++)n+=String.fromCharCode(t[i]);return decodeURIComponent(escape(n))}extractAsJSON(e){return JSON.parse(this.extractAsText(e))}on(e,t){this._listeners[e]||(this._listeners[e]=[]),this._listeners[e].indexOf(t)===-1&&this._listeners[e].push(t)}off(e,t){const n=this._listeners[e];if(n){const i=n.indexOf(t);i!==-1&&n.splice(i,1)}}dispatch(e){const t=this._listeners[e.type];if(t){e.target=this;const n=t.length;for(let i=0;i<n;i++)t[i].call(this,e)}}clear(e){if(e){URL.revokeObjectURL(this.files[e].url),delete this.files[e];return}for(let t in this.files)URL.revokeObjectURL(this.files[t].url);this.files=null}};function vh(s,e,t,n){const r=t.distanceToPoint(s),o=t.distanceToPoint(e),a=Math.abs(r)<1e-6,l=Math.abs(o)<1e-6;if(a&&l){n.push(s.clone(),e.clone());return}if(a){n.push(s.clone());return}if(l){n.push(e.clone());return}if(r>0&&o<0||r<0&&o>0){const c=r/(r-o),h=new D().lerpVectors(s,e,c);n.push(h)}}function IT(s,e,t){const n=[],i=s.geometry;if(!i||!i.attributes.position)return null;const r=i.attributes.position,o=i.index?i.index.array:null,a=[];for(let u=0;u<r.count;u++)a.push(new D(r.getX(u),r.getY(u),r.getZ(u)).applyMatrix4(s.matrixWorld));const l=o?o.length/3:a.length/3;for(let u=0;u<l;u++){const d=o?o[u*3]:u*3,f=o?o[u*3+1]:u*3+1,g=o?o[u*3+2]:u*3+2,_=a[d],m=a[f],p=a[g],y=[];vh(_,m,e,y),vh(m,p,e,y),vh(p,_,e,y);const b=[],v=1e-6;for(const M of y)b.some(A=>A.distanceToSquared(M)<v*v)||b.push(M);b.length>=2&&n.push(b[0],b[1])}if(n.length===0)return null;const c=new zt().setFromPoints(n),h=new Ls({color:new ke(t),linewidth:2});return new zo(c,h)}function LT(s,e,t,n){if(e&&(s.remove(e),e.geometry.dispose(),e.material.dispose()),!t.showCrossSection)return null;let i,r;switch(t.crossSectionPlane){case"XY":i=new D(0,0,1),r=-t.crossSectionPos;break;case"XZ":i=new D(0,1,0),r=-t.crossSectionPos;break;case"YZ":i=new D(1,0,0),r=-t.crossSectionPos;break}const o=new Ti(i,r),a=[];if(n.forEach(l=>{l.traverse(c=>{if(c.isMesh&&c.visible){const h=IT(c,o,t.crossSectionColor);h&&h.geometry.attributes.position.count>0&&a.push(h)}})}),a.length>0){const l=new zt,c=[];a.forEach(d=>{const f=d.geometry.attributes.position;for(let g=0;g<f.count;g++)c.push(f.getX(g),f.getY(g),f.getZ(g));d.geometry.dispose(),d.material.dispose()}),l.setAttribute("position",new Ct(c,3));const h=new Ls({color:new ke(t.crossSectionColor),linewidth:2}),u=new zo(l,h);return s.add(u),u}return null}function DT(s,e,t,n,i){if(s.length===0){alert("No models to export.");return}const r="assembly_viewer.html",o=window.prompt("File name for HTML export:",r);if(o===null)return;const a=o.trim()||r;n();const l=new Ir,c=new Qi;s.forEach(h=>c.add(h.clone(!0))),i(),l.parse(c,function(h){const u=new Uint8Array(h);let d="";for(let b=0;b<u.byteLength;b++)d+=String.fromCharCode(u[b]);const f=btoa(d),g={duration:e.animationDuration,ease:e.animationEase,repeat:e.animationRepeat,delay:e.animationDelay,repeatDelay:e.animationRepeatDelay,yoyo:e.animationYoyo,stagger:e.animationStagger,overwrite:e.animationOverwrite,loop:e.animationLoop},_={section:t.section,showSectionMesh:t.showSectionMesh,px:t.px,py:t.py,pz:t.pz},m=Fg(f,g,_),p=new Blob([m],{type:"text/html;charset=utf-8"}),y=document.createElement("a");y.href=URL.createObjectURL(p),y.download=a,y.click(),URL.revokeObjectURL(y.href),console.log("Export to HTML: done.")},function(h){console.error("HTML export error:",h)},{binary:!0,onlyVisible:!1})}function Fg(s,e,t){return`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
<title>Assembly Viewer</title>
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 100%; height: 100%; overflow: hidden; background: #72645b; font-family: Arial, sans-serif; }
#canvas-container { width: 100%; height: 100%; }
canvas { display: block; width: 100%; height: 100%; }
#controls {
    position: fixed;
    bottom: max(16px, env(safe-area-inset-bottom));
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    z-index: 10;
    pointer-events: none;
}
#controls .row {
    display: flex;
    gap: 8px;
    pointer-events: auto;
}
#controls button {
    min-width: 64px;
    padding: 12px 18px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    color: #fff;
    background: rgba(50,50,50,0.85);
    backdrop-filter: blur(4px);
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
    transition: background 0.15s;
}
#controls button:active { background: rgba(80,80,80,0.95); }
#controls button:disabled { opacity: 0.4; cursor: default; }
#controls .chk-label {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    background: rgba(50,50,50,0.85);
    border-radius: 8px;
    cursor: pointer;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    user-select: none;
    -webkit-user-select: none;
    backdrop-filter: blur(4px);
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
}
#controls .chk-label input[type=checkbox] { cursor: pointer; width: 15px; height: 15px; accent-color: #0a8; flex-shrink: 0; }
@media (max-width: 480px) {
    #controls button { padding: 8px 10px; font-size: 13px; min-width: 48px; }
    #controls .chk-label { padding: 8px 10px; font-size: 13px; }
    #controls { bottom: max(10px, env(safe-area-inset-bottom)); gap: 5px; }
}
#status-bar {
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    pointer-events: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    max-width: 90vw;
}
#step-info {
    color: #fff;
    background: rgba(0,0,0,0.5);
    padding: 6px 16px;
    border-radius: 6px;
    font-size: 14px;
    max-width: 90vw;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
#step-desc {
    color: #ddd;
    background: rgba(0,0,0,0.4);
    padding: 4px 14px;
    border-radius: 6px;
    font-size: 12px;
    max-width: 90vw;
    text-align: center;
    display: none;
}
#section-panel {
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 10;
    min-width: 190px;
    background: rgba(50,50,50,0.85);
    border-radius: 8px;
    backdrop-filter: blur(4px);
    color: #fff;
    font-family: Arial, sans-serif;
    font-size: 14px;
}
#section-panel-hdr {
    padding: 8px 12px;
    cursor: pointer;
    font-weight: bold;
    user-select: none;
    -webkit-user-select: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 8px;
    transition: background 0.15s;
}
#section-panel-hdr:hover { background: rgba(80,80,80,0.9); }
#section-panel-body {
    display: none;
    flex-direction: column;
    gap: 6px;
    padding: 0 10px 10px;
}
#section-panel-body.open { display: flex; }
#section-panel-body .chk-label { font-size: 13px; }
.sec-row {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
}
.sec-row .sec-axis { min-width: 14px; font-weight: bold; }
.sec-row input[type=range] { flex: 1; accent-color: #0a8; cursor: pointer; }
.sec-row input[type=number] {
    width: 58px;
    background: rgba(30,30,30,0.8);
    border: 1px solid #555;
    border-radius: 4px;
    color: #fff;
    padding: 2px 4px;
    font-size: 12px;
}
#btn-sec-reset {
    margin-top: 2px;
    padding: 6px 10px;
    font-size: 13px;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: #fff;
    background: rgba(80,80,80,0.9);
    touch-action: manipulation;
    transition: background 0.15s;
}
#btn-sec-reset:active { background: rgba(120,120,120,0.95); }
@media (max-width: 480px) {
    #section-panel { min-width: 150px; font-size: 12px; }
    .sec-row input[type=number] { width: 46px; }
}
</style>
</head>
<body>
<div id="status-bar">
    <div id="step-info">Assembled</div>
    <div id="step-desc"></div>
</div>
<div id="section-panel">
    <div id="section-panel-hdr">&#x2702; Section &#x25BE;</div>
    <div id="section-panel-body">
        <label class="chk-label"><input type="checkbox" id="chk-section"> Section</label>
        <label class="chk-label"><input type="checkbox" id="chk-section-mesh"> Section Mesh</label>
        <div class="sec-row"><span class="sec-axis">X</span><input type="range" id="sld-px" step="1"><input type="number" id="num-px" step="1"></div>
        <div class="sec-row"><span class="sec-axis">Y</span><input type="range" id="sld-py" step="1"><input type="number" id="num-py" step="1"></div>
        <div class="sec-row"><span class="sec-axis">Z</span><input type="range" id="sld-pz" step="1"><input type="number" id="num-pz" step="1"></div>
        <button id="btn-sec-reset">&#x21BA; Reset</button>
    </div>
</div>
<div id="canvas-container"></div>
<div id="controls">
    <div class="row">
        <button id="btn-start" title="Reset to start [Home]">⏮ Start</button>
        <button id="btn-finish" title="Reset to finish [End]">Finish ⏭</button>
        <button id="btn-anim-start" title="Animate to start [Shift+PageUp]">&#x23EA; Anim</button>
        <button id="btn-anim-finish" title="Animate to finish [Shift+PageDown]">Anim &#x23E9;</button>
    </div>
    <div class="row">
        <button id="btn-prev" title="Previous step [PageUp / ←]">&#x25C4; Step</button>
        <button id="btn-next" title="Next step [PageDown / →]">Step &#x25BA;</button>
        <label class="chk-label"><input type="checkbox" id="chk-loop"${e.loop?" checked":""}> &#x221E; Loop</label>
        <label class="chk-label"><input type="checkbox" id="chk-fullscreen"> &#x26F6; Full</label>
    </div>
</div>

<script type="importmap">
{
    "imports": {
        "three": "https://esm.sh/three@0.182.0",
        "three/addons/": "https://esm.sh/three@0.182.0/examples/jsm/",
        "gsap": "https://esm.sh/gsap@3.12.5"
    }
}
<\/script>
<script type="module">
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import gsap from 'gsap';

// ---- Config ----
const ANIM_DURATION    = ${e.duration};
const ANIM_EASE        = '${e.ease}';
const ANIM_REPEAT      = ${e.repeat};
const ANIM_DELAY       = ${e.delay};
const ANIM_REPEAT_DELAY = ${e.repeatDelay};
const ANIM_YOYO        = ${e.yoyo};
const ANIM_STAGGER     = ${e.stagger};
const ANIM_OVERWRITE   = '${e.overwrite}';
const ANIM_LOOP        = ${e.loop};
const GLB_BASE64 = '${s}';

// ---- Scene setup ----
const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2;
renderer.localClippingEnabled = ${t.section};
container.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x72645b);

// Lights (matching original)
scene.add(new THREE.HemisphereLight(0x443333, 0x111122));
const dl1 = new THREE.DirectionalLight(0xffffff, 1.35);
dl1.position.set(1, 1, 1);
scene.add(dl1);
const dl2 = new THREE.DirectionalLight(0xffaa00, 1);
dl2.position.set(0.5, 1, -1);
scene.add(dl2);

// Clip planes (section view)
const clipPlanes = [
    new THREE.Plane(new THREE.Vector3(-1, 0, 0), ${t.px}),
    new THREE.Plane(new THREE.Vector3(0, -1, 0), ${t.py}),
    new THREE.Plane(new THREE.Vector3(0, 0, -1), ${t.pz}),
];
let sectionMeshEnabled = ${t.showSectionMesh};
let sceneRoot = null;

// Ortho camera
let orthoHalf = 500;
const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
    -orthoHalf * aspect, orthoHalf * aspect,
     orthoHalf, -orthoHalf,
    0.1, orthoHalf * 40
);
camera.position.set(1000, 1000, 1000);
camera.lookAt(0, 0, 0);

// Headlight
const headlight = new THREE.DirectionalLight(0xffffff, 0.5);
camera.add(headlight);
scene.add(camera);

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener('change', render);

function render() { renderer.render(scene, camera); }

function updateCameraFrustum() {
    const a = window.innerWidth / window.innerHeight;
    camera.left   = -orthoHalf * a;
    camera.right  =  orthoHalf * a;
    camera.top    =  orthoHalf;
    camera.bottom = -orthoHalf;
    camera.updateProjectionMatrix();
}

// ── Camera helpers ──
function recalibrateCamera(root) {
    const box = new THREE.Box3().setFromObject(root);
    if (box.isEmpty()) return;
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    orthoHalf    = maxDim * 1.5;
    camera.near  = Math.min(1, maxDim * 0.01);
    camera.far   = maxDim * 10;
    camera.zoom  = 1;
    updateCameraFrustum();
}

function fitView(root) {
    const box = new THREE.Box3().setFromObject(root);
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const dist   = maxDim * 2.6;
    const angle  = Math.PI / 4;
    camera.position.set(
        center.x + dist * Math.cos(angle),
        center.y + dist * Math.sin(angle),
        center.z + dist * Math.cos(angle)
    );
    const frameSize = Math.max(size.x, size.y) * 1.5;
    camera.zoom = Math.min(window.innerWidth / frameSize, window.innerHeight / frameSize);
    camera.lookAt(center);
    controls.target.copy(center);
    updateCameraFrustum();
    controls.update();
}

window.addEventListener('resize', () => {
    updateCameraFrustum();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
});

// ---- Assembly data ----
const assemblySteps = []; // { id, name, description, transformations[] }
let currentStepIndex = -1;
let assemblyAnimation = null;
let assemblyAnimationFinalize = null;
let cameraAnimation = null;
let cameraAnimationFinalize = null;
let loopEnabled = ANIM_LOOP;

function updateStatus() {
    const el = document.getElementById('step-info');
    const descEl = document.getElementById('step-desc');
    const n = assemblySteps.length;
    if (currentStepIndex < 0) {
        el.textContent = 'Assembled (' + n + ' step' + (n === 1 ? '' : 's') + ')';
        descEl.style.display = 'none';
    } else {
        const s = assemblySteps[currentStepIndex];
        el.textContent = 'Step ' + (currentStepIndex + 1) + '/' + n + ': ' + (s.name || '');
        if (s.description) {
            descEl.textContent = s.description;
            descEl.style.display = 'block';
        } else {
            descEl.style.display = 'none';
        }
    }
}

// ---- Load GLB ----
function base64ToArrayBuffer(b64) {
    const bin = atob(b64);
    const len = bin.length;
    const buf = new Uint8Array(len);
    for (let i = 0; i < len; i++) buf[i] = bin.charCodeAt(i);
    return buf.buffer;
}

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
loader.setDRACOLoader(dracoLoader);

const glbBuffer = base64ToArrayBuffer(GLB_BASE64);
loader.parse(glbBuffer, '', function(gltf) {
    const model = gltf.scene;
    scene.add(model);

    // Import assembly data from userData
    const importedSteps = new Map();
    model.traverse(function(child) {
        const arr = child.userData.assemblyTransformations;
        if (!Array.isArray(arr) || arr.length === 0) return;
        arr.forEach(entry => {
            if (!importedSteps.has(entry.step_id)) {
                importedSteps.set(entry.step_id, {
                    id: entry.step_id,
                    name: entry.step_name || ('Step ' + entry.step_id),
                    description: entry.step_description || '',
                    camera: entry.step_camera || null,
                    transformations: [],
                });
            }
            importedSteps.get(entry.step_id).transformations.push({
                objectRef: child,
                initPosition: entry.initPosition,
                finalPosition: entry.finalPosition,
                initQuaternion: entry.initQuaternion || null,
                finalQuaternion: entry.finalQuaternion || null,
                initScale: entry.initScale || null,
                finalScale: entry.finalScale || null,
            });
        });
        delete child.userData.assemblyTransformations;
    });
    [...importedSteps.values()].sort((a,b) => a.id - b.id).forEach(s => assemblySteps.push(s));

    // Camera setup
    recalibrateCamera(model);
    fitView(model);
    resetToStart();
    updateStatus();

    // Section view setup
    sceneRoot = model;
    applyClipPlanesToMaterials(model);
    if (sectionMeshEnabled) updateSectionMeshes();
    const _secBox = new THREE.Box3().setFromObject(model);
    const _secSize = _secBox.getSize(new THREE.Vector3());
    const _secRange = Math.ceil(Math.max(_secSize.x, _secSize.y, _secSize.z) * 2);
    setSectionSliderRange(_secRange);

    render();
}, function(error) {
    console.error('GLB load error:', error);
    document.getElementById('step-info').textContent = 'Error loading model.';
});

// ---- Animation helpers ----
function animateStep(transformations, forward, onComplete) {
    if (assemblyAnimation) { assemblyAnimation.kill(); assemblyAnimation = null; }

    const startStates = transformations.map(tr => {
        const tgtP = forward ? tr.finalPosition : tr.initPosition;
        const tgtQ = forward ? tr.finalQuaternion : tr.initQuaternion;
        const tgtS = forward ? tr.finalScale : tr.initScale;
        const hasRot = !!(tr.initQuaternion && tr.finalQuaternion);
        const hasScale = !!(tr.initScale && tr.finalScale);
        return {
            pos: tr.objectRef.position.clone(),
            targetPos: new THREE.Vector3(tgtP.x, tgtP.y, tgtP.z),
            quat: tr.objectRef.quaternion.clone(),
            targetQuat: hasRot ? new THREE.Quaternion(tgtQ.x, tgtQ.y, tgtQ.z, tgtQ.w) : null,
            scale: tr.objectRef.scale.clone(),
            targetScale: hasScale ? new THREE.Vector3(tgtS.x, tgtS.y, tgtS.z) : null,
            hasRot, hasScale,
        };
    });

    assemblyAnimationFinalize = () => {
        if (assemblyAnimation) { assemblyAnimation.kill(); assemblyAnimation = null; }
        startStates.forEach((s, i) => {
            transformations[i].objectRef.position.copy(s.targetPos);
            if (s.hasRot) transformations[i].objectRef.quaternion.copy(s.targetQuat);
            if (s.hasScale) transformations[i].objectRef.scale.copy(s.targetScale);
        });
        render();
        assemblyAnimationFinalize = null;
    };

    if (ANIM_DURATION <= 0) {
        assemblyAnimationFinalize();
        assemblyAnimationFinalize = null;
        if (onComplete) onComplete();
        return;
    }

    const proxy = { t: 0 };
    assemblyAnimation = gsap.to(proxy, {
        t: 1,
        duration:    ANIM_DURATION    / 1000,
        ease:        ANIM_EASE,
        repeat:      ANIM_REPEAT,
        delay:       ANIM_DELAY       / 1000,
        repeatDelay: ANIM_REPEAT_DELAY / 1000,
        yoyo:        ANIM_YOYO,
        stagger:     ANIM_STAGGER    / 1000,
        overwrite:   ANIM_OVERWRITE,
        onUpdate() {
            transformations.forEach((tr, i) => {
                const s = startStates[i];
                tr.objectRef.position.lerpVectors(s.pos, s.targetPos, proxy.t);
                if (s.hasRot) tr.objectRef.quaternion.slerpQuaternions(s.quat, s.targetQuat, proxy.t);
                if (s.hasScale) tr.objectRef.scale.lerpVectors(s.scale, s.targetScale, proxy.t);
            });
            render();
        },
        onComplete() {
            assemblyAnimation = null;
            assemblyAnimationFinalize = null;
            if (onComplete) onComplete();
        },
    });
}

function animateCameraToView(camData, onComplete) {
    if (!camData) { if (onComplete) onComplete(); return; }
    if (cameraAnimation) { cameraAnimation.kill(); cameraAnimation = null; }
    cameraAnimationFinalize = null;
    const startPos    = camera.position.clone();
    const startTarget = controls.target.clone();
    const endPos    = new THREE.Vector3(camData.position.x, camData.position.y, camData.position.z);
    const endTarget = new THREE.Vector3(camData.target.x,   camData.target.y,   camData.target.z);
    const startZoom = camera.zoom;
    const endZoom   = (camData.zoom != null) ? camData.zoom : startZoom;
    const EPS = 1e-6;
    if (startPos.distanceToSquared(endPos) < EPS && startTarget.distanceToSquared(endTarget) < EPS && Math.abs(startZoom - endZoom) < EPS) {
        if (onComplete) onComplete(); return;
    }
    cameraAnimationFinalize = () => {
        if (cameraAnimation) { cameraAnimation.kill(); cameraAnimation = null; }
        camera.position.copy(endPos);
        controls.target.copy(endTarget);
        camera.zoom = endZoom;
        camera.updateProjectionMatrix();
        controls.update();
        render();
        cameraAnimationFinalize = null;
        if (onComplete) onComplete();
    };
    if (ANIM_DURATION <= 0) {
        camera.position.copy(endPos);
        controls.target.copy(endTarget);
        camera.zoom = endZoom;
        camera.updateProjectionMatrix();
        controls.update();
        render();
        cameraAnimationFinalize = null;
        if (onComplete) onComplete();
        return;
    }
    const proxy = { t: 0 };
    cameraAnimation = gsap.to(proxy, {
        t: 1,
        duration: ANIM_DURATION / 1000,
        ease: ANIM_EASE,
        onUpdate() {
            camera.position.lerpVectors(startPos, endPos, proxy.t);
            controls.target.lerpVectors(startTarget, endTarget, proxy.t);
            camera.zoom = startZoom + (endZoom - startZoom) * proxy.t;
            camera.updateProjectionMatrix();
            controls.update();
            render();
        },
        onComplete() {
            cameraAnimation = null;
            cameraAnimationFinalize = null;
            if (onComplete) onComplete();
        },
    });
}

// ---- Playback functions ----
function resetToStart() {
    if (assemblyAnimation) { assemblyAnimation.kill(); assemblyAnimation = null; }
    if (cameraAnimation) { cameraAnimation.kill(); cameraAnimation = null; }
    assemblyAnimationFinalize = null;
    cameraAnimationFinalize = null;
    [...assemblySteps].reverse().forEach(step => {
        step.transformations.forEach(t => {
            t.objectRef.position.set(t.initPosition.x, t.initPosition.y, t.initPosition.z);
            if (t.initQuaternion) t.objectRef.quaternion.set(t.initQuaternion.x, t.initQuaternion.y, t.initQuaternion.z, t.initQuaternion.w);
            if (t.initScale) t.objectRef.scale.set(t.initScale.x, t.initScale.y, t.initScale.z);
        });
    });
    currentStepIndex = -1;
    updateStatus();
    render();
}

function resetToFinish() {
    if (assemblyAnimation) { assemblyAnimation.kill(); assemblyAnimation = null; }
    if (cameraAnimation) { cameraAnimation.kill(); cameraAnimation = null; }
    assemblyAnimationFinalize = null;
    cameraAnimationFinalize = null;
    if (!assemblySteps.length) return;
    assemblySteps.forEach(step => {
        step.transformations.forEach(t => {
            t.objectRef.position.set(t.finalPosition.x, t.finalPosition.y, t.finalPosition.z);
            if (t.finalQuaternion) t.objectRef.quaternion.set(t.finalQuaternion.x, t.finalQuaternion.y, t.finalQuaternion.z, t.finalQuaternion.w);
            if (t.finalScale) t.objectRef.scale.set(t.finalScale.x, t.finalScale.y, t.finalScale.z);
        });
    });
    currentStepIndex = assemblySteps.length - 1;
    updateStatus();
    render();
}

function nextStep() {
    cameraAnimationFinalize?.(); cameraAnimationFinalize = null;
    assemblyAnimationFinalize?.(); assemblyAnimationFinalize = null;
    const ni = currentStepIndex + 1;
    if (ni >= assemblySteps.length) return;
    const step = assemblySteps[ni];
    currentStepIndex = ni;
    updateStatus();
    if (step.transformations.length === 0) {
        if (step.camera) { animateCameraToView(step.camera); }
        return;
    }
    if (step.camera) {
        animateCameraToView(step.camera, () => {
            animateStep(step.transformations, true, () => { updateStatus(); });
        });
    } else {
        animateStep(step.transformations, true, () => { updateStatus(); });
    }
}

function prevStep() {
    cameraAnimationFinalize?.(); cameraAnimationFinalize = null;
    assemblyAnimationFinalize?.(); assemblyAnimationFinalize = null;
    if (currentStepIndex < 0) return;
    const step = assemblySteps[currentStepIndex];
    currentStepIndex--;
    updateStatus();
    if (step.transformations.length === 0) {
        if (step.camera) { animateCameraToView(step.camera); }
        return;
    }
    if (step.camera) {
        animateCameraToView(step.camera, () => {
            animateStep(step.transformations, false, () => { updateStatus(); });
        });
    } else {
        animateStep(step.transformations, false, () => { updateStatus(); });
    }
}

function animateToFinish() {
    cameraAnimationFinalize?.(); cameraAnimationFinalize = null;
    assemblyAnimationFinalize?.(); assemblyAnimationFinalize = null;
    if (assemblySteps.length === 0 || currentStepIndex >= assemblySteps.length - 1) return;
    function next() {
        const ni = currentStepIndex + 1;
        if (ni >= assemblySteps.length) {
            if (loopEnabled) animateToStart();
            return;
        }
        const step = assemblySteps[ni];
        currentStepIndex = ni;
        updateStatus();
        if (step.transformations.length === 0) {
            if (step.camera) {
                animateCameraToView(step.camera, () => next());
            } else {
                next();
            }
            return;
        }
        if (step.camera) {
            animateCameraToView(step.camera, () => {
                animateStep(step.transformations, true, () => { updateStatus(); next(); });
            });
        } else {
            animateStep(step.transformations, true, () => { updateStatus(); next(); });
        }
    }
    next();
}

function animateToStart() {
    cameraAnimationFinalize?.(); cameraAnimationFinalize = null;
    assemblyAnimationFinalize?.(); assemblyAnimationFinalize = null;
    if (currentStepIndex < 0) return;
    function prev() {
        if (currentStepIndex < 0) {
            if (loopEnabled) animateToFinish();
            return;
        }
        const step = assemblySteps[currentStepIndex];
        const afterTransforms = () => {
            currentStepIndex--;
            updateStatus();
            prev();
        };
        if (step.transformations.length === 0) {
            if (step.camera) {
                animateCameraToView(step.camera, () => afterTransforms());
            } else {
                afterTransforms();
            }
            return;
        }
        if (step.camera) {
            animateCameraToView(step.camera, () => {
                animateStep(step.transformations, false, () => { updateStatus(); afterTransforms(); });
            });
        } else {
            animateStep(step.transformations, false, () => { updateStatus(); afterTransforms(); });
        }
    }
    prev();
}

// ---- Wire buttons ----
document.getElementById('btn-start').addEventListener('click', resetToStart);
document.getElementById('btn-finish').addEventListener('click', resetToFinish);
document.getElementById('btn-prev').addEventListener('click', prevStep);
document.getElementById('btn-next').addEventListener('click', nextStep);
document.getElementById('btn-anim-start').addEventListener('click', animateToStart);
document.getElementById('btn-anim-finish').addEventListener('click', animateToFinish);
document.getElementById('chk-loop').addEventListener('change', function() {
    loopEnabled = this.checked;
});
document.getElementById('chk-fullscreen').addEventListener('change', function() {
    if (this.checked) {
        document.documentElement.requestFullscreen().catch(() => { this.checked = false; });
    } else {
        document.exitFullscreen();
    }
});
document.addEventListener('fullscreenchange', function() {
    document.getElementById('chk-fullscreen').checked = !!document.fullscreenElement;
});

// ---- Section view functions ----
function applyClipPlanesToMaterials(root) {
    root.traverse(function(child) {
        if (child.isMesh && !child.isSectionMesh) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(mat => {
                mat.clippingPlanes = clipPlanes;
                mat.clipIntersection = true;
                mat.side = THREE.DoubleSide;
                mat.needsUpdate = true;
            });
        }
    });
}

function createSectionMesh(mesh) {
    if (mesh.children.some(c => c.isSectionMesh)) return;
    const sm = mesh.clone(false);
    const mats = Array.isArray(sm.material) ? sm.material : [sm.material];
    const newMats = mats.map(mat => new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
        clippingPlanes: clipPlanes,
        clipIntersection: true,
        color: mat.color,
        polygonOffset: true,
        polygonOffsetFactor: -1,
    }));
    sm.material = Array.isArray(mesh.material) ? newMats : newMats[0];
    sm.position.set(0, 0, 0);
    sm.rotation.set(0, 0, 0);
    sm.scale.set(1, 1, 1);
    sm.isSectionMesh = true;
    mesh.add(sm);
}

function removeSectionMeshes(root) {
    root.traverse(function(child) {
        if (child.isMesh && !child.isSectionMesh) {
            [...child.children].filter(c => c.isSectionMesh).forEach(sm => {
                child.remove(sm);
                if (sm.geometry) sm.geometry.dispose();
                (Array.isArray(sm.material) ? sm.material : [sm.material]).forEach(m => m.dispose());
            });
        }
    });
}

function updateSectionMeshes() {
    if (!sceneRoot) return;
    if (sectionMeshEnabled) {
        sceneRoot.traverse(c => { if (c.isMesh && !c.isSectionMesh) createSectionMesh(c); });
    } else {
        removeSectionMeshes(sceneRoot);
    }
}

function setSectionSliderRange(range) {
    document.getElementById('sld-px').min = -range; document.getElementById('sld-px').max = range;
    document.getElementById('num-px').min = -range; document.getElementById('num-px').max = range;
    document.getElementById('sld-py').min = -range; document.getElementById('sld-py').max = range;
    document.getElementById('num-py').min = -range; document.getElementById('num-py').max = range;
    document.getElementById('sld-pz').min = -range; document.getElementById('sld-pz').max = range;
    document.getElementById('num-pz').min = -range; document.getElementById('num-pz').max = range;
}

// ---- Section UI wiring ----
document.getElementById('section-panel-hdr').addEventListener('click', function() {
    const body = document.getElementById('section-panel-body');
    body.classList.toggle('open');
    this.innerHTML = body.classList.contains('open') ? '&#x2702; Section &#x25B4;' : '&#x2702; Section &#x25BE;';
});

// Auto-open panel if section was active on export
${t.section?`document.getElementById('section-panel-body').classList.add('open');
document.getElementById('section-panel-hdr').innerHTML = '&#x2702; Section &#x25B4;';`:""}

const chkSection = document.getElementById('chk-section');
chkSection.checked = renderer.localClippingEnabled;
chkSection.addEventListener('change', function() {
    renderer.localClippingEnabled = this.checked;
    render();
});

const chkSectionMesh = document.getElementById('chk-section-mesh');
chkSectionMesh.checked = sectionMeshEnabled;
chkSectionMesh.addEventListener('change', function() {
    sectionMeshEnabled = this.checked;
    updateSectionMeshes();
    render();
});

function wireAxisSlider(sldId, numId, idx) {
    const sld = document.getElementById(sldId);
    const num = document.getElementById(numId);
    sld.value = clipPlanes[idx].constant;
    num.value = clipPlanes[idx].constant;
    function update(v) {
        clipPlanes[idx].constant = v;
        sld.value = v; num.value = v;
        render();
    }
    sld.addEventListener('input', () => update(parseFloat(sld.value)));
    num.addEventListener('change', () => update(parseFloat(num.value) || 0));
}
wireAxisSlider('sld-px', 'num-px', 0);
wireAxisSlider('sld-py', 'num-py', 1);
wireAxisSlider('sld-pz', 'num-pz', 2);

document.getElementById('btn-sec-reset').addEventListener('click', function() {
    clipPlanes[0].constant = 0; clipPlanes[1].constant = 0; clipPlanes[2].constant = 0;
    document.getElementById('sld-px').value = 0; document.getElementById('num-px').value = 0;
    document.getElementById('sld-py').value = 0; document.getElementById('num-py').value = 0;
    document.getElementById('sld-pz').value = 0; document.getElementById('num-pz').value = 0;
    render();
});

// ---- Keyboard shortcuts ----
window.addEventListener('keydown', function(e) {
    switch (e.key) {
        case 'Home':
            resetToStart();
            e.preventDefault();
            break;
        case 'End':
            resetToFinish();
            e.preventDefault();
            break;
        case 'PageUp':
            if (e.shiftKey) { animateToStart(); } else { prevStep(); }
            e.preventDefault();
            break;
        case 'PageDown':
            if (e.shiftKey) { animateToFinish(); } else { nextStep(); }
            e.preventDefault();
            break;
        case 'ArrowLeft':
            prevStep();
            e.preventDefault();
            break;
        case 'ArrowRight':
            nextStep();
            e.preventDefault();
            break;
    }
});
<\/script>
</body>
</html>`}function NT(s,e,t,n,i){if(s.length===0){alert("No models to export.");return}const r="assembly_viewer_obf.html",o=window.prompt("File name for obfuscated HTML export:",r);if(o===null)return;const a=o.trim()||r;n();const l=new Ir,c=new Qi;s.forEach(h=>c.add(h.clone(!0))),i(),l.parse(c,function(h){const u=new Uint8Array(h);let d="";for(let b=0;b<u.byteLength;b++)d+=String.fromCharCode(u[b]);const f=btoa(d),g={duration:e.animationDuration,ease:e.animationEase,repeat:e.animationRepeat,delay:e.animationDelay,repeatDelay:e.animationRepeatDelay,yoyo:e.animationYoyo,stagger:e.animationStagger,overwrite:e.animationOverwrite,loop:e.animationLoop},_={section:t.section,showSectionMesh:t.showSectionMesh,px:t.px,py:t.py,pz:t.pz},m=UT(f,g,_),p=new Blob([m],{type:"text/html;charset=utf-8"}),y=document.createElement("a");y.href=URL.createObjectURL(p),y.download=a,y.click(),URL.revokeObjectURL(y.href),console.log("Export to obfuscated HTML: done.")},function(h){console.error("Obfuscated HTML export error:",h)},{binary:!0,onlyVisible:!1})}function UT(s,e,t){const i=Fg("__GLB_BASE64_PLACEHOLDER__",e,t),r={"status-bar":"_a","step-info":"_b","step-desc":"_c","canvas-container":"_d",controls:"_e","btn-start":"_1","btn-finish":"_2","btn-prev":"_3","btn-next":"_4","btn-anim-start":"_5","btn-anim-finish":"_6","chk-loop":"_7","chk-fullscreen":"_8","section-panel":"_sa","section-panel-hdr":"_sb","section-panel-body":"_sc","chk-section":"_s1","chk-section-mesh":"_s2","sld-px":"_s3","num-px":"_s4","sld-py":"_s5","num-py":"_s6","sld-pz":"_s7","num-pz":"_s8","btn-sec-reset":"_s9"},o={row:"_r","chk-label":"_cl","sec-row":"_sr","sec-axis":"_sx"},a=i.match(/<script type="module">([\s\S]*?)<\/script>/);if(!a)throw new Error("Cannot extract module script from standalone HTML");let l=a[1];l=l.replace(/const GLB_BASE64 = '[^']*';/,"const GLB_BASE64 = document.getElementById('_g').textContent;"),l=l.replace(/from 'three';/g,"from 'https://esm.sh/three@0.182.0';"),l=l.replace(/from 'three\/addons\//g,"from 'https://esm.sh/three@0.182.0/examples/jsm/"),l=l.replace(/from 'gsap';/g,"from 'https://esm.sh/gsap@3.12.5';");for(const[v,M]of Object.entries(r))l=l.replaceAll("'"+v+"'","'"+M+"'");l=l.replace(/^[ \t]*\/\/.*$/gm,""),l=l.replace(/\n{2,}/g,`
`),l=l.trim();const c=Math.floor(Math.random()*254)+1;let h="";for(let v=0;v<l.length;v++)h+=String.fromCharCode(l.charCodeAt(v)^c);const u=btoa(h),d=i.match(/<style>([\s\S]*?)<\/style>/);let f=d?d[1]:"";const g=Object.entries(r).sort((v,M)=>M[0].length-v[0].length);for(const[v,M]of g)f=f.replaceAll("#"+v,"#"+M);const _=Object.entries(o).sort((v,M)=>M[0].length-v[0].length);for(const[v,M]of _)f=f.replaceAll("."+v,"."+M);f=f.replace(/\n\s*/g,""),f=f.replace(/\s*\{\s*/g,"{"),f=f.replace(/\s*\}\s*/g,"}"),f=f.replace(/\s*;\s*/g,";"),f=f.replace(/:\s+/g,":"),f=f.replace(/,\s+/g,","),f=f.trim();const m=t.section?" open":"",p=t.section?"&#x2702; Section &#x25B4;":"&#x2702; Section &#x25BE;",y=t.section?" checked":"",b=t.showSectionMesh?" checked":"";return`<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,user-scalable=no"><style>${f}</style></head><body><div id="_a"><div id="_b"></div><div id="_c"></div></div><div id="_sa"><div id="_sb">${p}</div><div id="_sc"${m?' class="open"':""}><label class="_cl"><input type="checkbox" id="_s1"${y}> Section</label><label class="_cl"><input type="checkbox" id="_s2"${b}> Section Mesh</label><div class="_sr"><span class="_sx">X</span><input type="range" id="_s3" step="1"><input type="number" id="_s4" step="1"></div><div class="_sr"><span class="_sx">Y</span><input type="range" id="_s5" step="1"><input type="number" id="_s6" step="1"></div><div class="_sr"><span class="_sx">Z</span><input type="range" id="_s7" step="1"><input type="number" id="_s8" step="1"></div><button id="_s9">&#x21BA; Reset</button></div></div><div id="_d"></div><div id="_e"><div class="_r"><button id="_1">&#x23EE; Start</button><button id="_2">Finish &#x23ED;</button><button id="_5">&#x23EA; Anim</button><button id="_6">Anim &#x23E9;</button></div><div class="_r"><button id="_3">&#x25C0; Step</button><button id="_4">Step &#x25B6;</button><label class="_cl"><input type="checkbox" id="_7"${e.loop?" checked":""}> &#x221E; Loop</label><label class="_cl"><input type="checkbox" id="_8"> &#x26F6; Full</label></div></div><script id="_g" type="text/plain">${s}<\/script><script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"><\/script><script>(function(){var _0x=${c},_0e=atob('${u}'),_0r='';for(var _0i=0;_0i<_0e.length;_0i++)_0r+=String.fromCharCode(_0e.charCodeAt(_0i)^_0x);import(URL.createObjectURL(new Blob([_0r],{type:'application/javascript'})))})()<\/script></body></html>`}let bh,wt,Vn;const On=[];let $l=null,Og,hi,Ve,Ze,ln;const Sn=[],es=[];let ba=[];const si=[],me={modelFile:"",description:"",steps:[]},Lr=new Map,Be={editMode:!1,currentStepIndex:-1};let gn=null,$i=null,Hs=null,Ss=null,Vs=null,ql=null;const qe={stepInfo:"– no step –",editMode:!1,editStepInfo:"– no step –",newStep:function(){b1()},stepName:"",stepDescription:"",moveStepUp:function(){w1()},moveStepDown:function(){E1()},deleteStep:function(){M1()},removeObjectFromStep:function(){S1()},saveCameraView:function(){y1()},clearCameraView:function(){v1()},resetToStart:function(){i_()},animateToStart:function(){Bd()},prevStep:function(){Hd()},nextStep:function(){zd()},animateToFinish:function(){kd()},resetToFinish:function(){n_()},animationDuration:600,animationEase:"power1.inOut",animationRepeat:0,animationDelay:0,animationRepeatDelay:0,animationYoyo:!1,animationStagger:0,animationOverwrite:"auto",animationLoop:!1},Wo=new Ud;let Me=null;const Zl=[],Pi=[];let Dn=null;const fo=new Tm,ss=new Ne(1,1),Kl=new Ne,Sh=new Ne,Ql=new Ne,Mh=new Ne;let Gn,Jl=!1,Ms=!1,zu=!1,qs,so=null,Sr=null,Mr=!1,Xn=500,jn=null,ec=[],Dl=!1;const jt=[],Dr=[],rs=[];let vs=null;const Tn=[];let _n=-1;const tc=[],wh=[],Z={perspCam:!1,section:!1,fullscreen:!1,isSelectAllowed:!0,backgroundColor:"#888888",px:0,py:0,pz:0,showCrossSection:!1,crossSectionPlane:"XY",crossSectionPos:0,crossSectionColor:"#ff0000",showSectionMesh:!1,autoUpdateSectionLines:!1,reset:function(){jT()},fit:function(){Sa()},viewx:function(){bo(1e3,0,0)},viewy:function(){bo(0,1e3,0)},viewz:function(){bo(0,0,1e3)},showHiddenObjects:function(){$g()},switchHiddenObjects:function(){qg()},resetWholeModel:function(){HT()},cleanupModel:function(){ZT()},rotateXPlus:function(){ro("x",Math.PI/2)},rotateXMinus:function(){ro("x",-Math.PI/2)},rotateYPlus:function(){ro("y",Math.PI/2)},rotateYMinus:function(){ro("y",-Math.PI/2)},rotateZPlus:function(){ro("z",Math.PI/2)},rotateZMinus:function(){ro("z",-Math.PI/2)},bakeWholeModelRotation:function(){VT()},exportAll:function(){u1()},exportSelected:function(){d1()},exportToHTML:function(){DT(si,qe,Z,ic,sc)},exportToHTMLObfuscated:function(){NT(si,qe,Z,ic,sc)},importGlb:function(){c1()},transformSpace:!0,snapEnabled:!0,snapTranslation:10,snapRotationDeg:30,snapScale:.25,transformMode:"translate",wireframe:!1,showAxesHelper:!1,axesHelperSize:100,showRaycastHelper:!1,raycastHelperSize:2e4,cadSelection:"CAD",multiSelectBoxPadding:3,addToMulti:function(){Vg()},isGroupTransformActive:!1,clearMulti:function(){gc()},addGroupToHistory:function(){_c()},historyInfo:"– žádný záznam –",historyPrev:function(){nc(-1)},historyNext:function(){nc(1)},historyRestore:function(){Xg()},historyRemove:function(){$T()}},ct={pn:-1e3,pp:1e3,pStep:10,rn:-3.1416,rp:3.1416,rStep:.035,sn:0,sp:10,sStep:.1},Wi={remove:function(){jg(Me)},color:"#888888",separate:function(){Me&&f1(Me)},deselect:function(){us()},randomColor:function(){Me&&kg(Me)},resetLocation:function(){Me&&Fd(Me)},selectParent:function(){zg()},selectPrevious:function(){Hg()},hideObject:function(){Me&&Yg(Me)},undoTransform:function(){Me&&jn&&Bg(Me)},flattenObject:function(){Me&&KT(Me)}};FT();ge();zT();class Va extends zo{constructor(e,t=16776960,n=0){const i=new Uint16Array([0,1,1,2,2,3,3,0,4,5,5,6,6,7,7,4,0,4,1,5,2,6,3,7]),r=new Float32Array(24),o=new zt;o.setIndex(new Et(i,1)),o.setAttribute("position",new Et(r,3)),super(o,new Ls({color:t,toneMapped:!1})),this.object=e,this.padding=n,this.type="PaddedBoxHelper",this.matrixAutoUpdate=!1,this.update()}update(e){if(e!==void 0&&(this.object=e),this.object===void 0)return;const t=new qn().setFromObject(this.object);if(t.isEmpty())return;this.padding!==0&&t.expandByScalar(this.padding);const{min:n,max:i}=t,r=this.geometry.attributes.position.array;r[0]=i.x,r[1]=i.y,r[2]=i.z,r[3]=n.x,r[4]=i.y,r[5]=i.z,r[6]=n.x,r[7]=n.y,r[8]=i.z,r[9]=i.x,r[10]=n.y,r[11]=i.z,r[12]=i.x,r[13]=i.y,r[14]=n.z,r[15]=n.x,r[16]=i.y,r[17]=n.z,r[18]=n.x,r[19]=n.y,r[20]=n.z,r[21]=i.x,r[22]=n.y,r[23]=n.z,this.geometry.attributes.position.needsUpdate=!0,this.geometry.computeBoundingSphere()}setFromObject(e){return this.object=e,this.update(),this}dispose(){this.geometry.dispose(),this.material.dispose()}}function FT(){bh=document.createElement("div"),document.body.appendChild(bh),Vn=new pM({antialias:!0}),Vn.setPixelRatio(window.devicePixelRatio),Vn.setSize(window.innerWidth,window.innerHeight),Vn.localClippingEnabled=!1,Vn.outputColorSpace=Qt,Vn.toneMapping=Xu,Vn.toneMappingExposure=2,bh.appendChild(Vn.domElement);const s=window.innerWidth/window.innerHeight;Og=new Wn(20,s,250,2e4),hi=new za(-Xn*s,Xn*s,Xn,-Xn,.1,Xn*40),Ve=hi,Ve.position.set(1e3,1e3,1e3),Ve.lookAt(0,0,0),wt=new gu,wt.background=new ke(7496795),wt.add(new J0(4469555,1118498)),Yp(1,1,1,16777215,1.35),Yp(.5,1,-1,16755200,1);const e=new fd(16777215,.5);Ve.add(e),wt.add(Ve),On[0]=new Ti(new D(-1,0,0),0),On[1]=new Ti(new D(0,-1,0),0),On[2]=new Ti(new D(0,0,-1),0),ln=new xE(Ve,Vn.domElement),ln.update(),ln.addEventListener("change",ge),Ze=new IE(Ve,Vn.domElement),Ze.setSize(.5),Ze.setSpace("world"),wr(),wt.add(Ze.getHelper()),Ze.addEventListener("change",function(){if(Mr&&(Z.snapEnabled||Dl)&&Ze.object&&Ze.getMode()==="translate"&&Ze.space==="world"){const t=Z.snapTranslation,n=Ze.object;n.updateWorldMatrix(!0,!1);const i=new D().setFromMatrixPosition(n.matrixWorld);if(i.x=Math.round(i.x/t)*t,i.y=Math.round(i.y/t)*t,i.z=Math.round(i.z/t)*t,n.parent){n.parent.updateWorldMatrix(!0,!1);const r=new Ye().copy(n.parent.matrixWorld).invert();i.applyMatrix4(r)}n.position.copy(i)}Mr&&Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge()}),Ze.addEventListener("dragging-changed",function(t){if(t.value){if(Be.editMode){const n=Ze.object;if(!(n&&n.name&&n.name.trim()!=="")){Ze.detach(),ln.enabled=!1,console.warn("Assembly edit mode: cannot transform an unnamed object."),alert("Object without name can not be transformed."),window.addEventListener("mouseup",()=>{ln.enabled=!0},{once:!0});return}}Mr=!0,ln.enabled=!1,Ze.object&&!Z.isGroupTransformActive&&Hu(),Z.isGroupTransformActive&&GT()}else setTimeout(()=>{if(Mr=!1,ln.enabled=!0,Ze.object){const n=Ze.object;n.position.x=oo(n.position.x),n.position.y=oo(n.position.y),n.position.z=oo(n.position.z),n.rotation.x=oo(n.rotation.x),n.rotation.y=oo(n.rotation.y),n.rotation.z=oo(n.rotation.z)}Be.editMode&&Be.currentStepIndex>=0&&(Z.isGroupTransformActive&&ec.length>0?x1():jn&&Ze.object&&t_()),Z.isGroupTransformActive&&(rs.forEach((n,i)=>{jt[i]&&n.setFromObject(jt[i])}),ge())},100)}),qs=new gx(new ve,16776960),qs.visible=!1,wt.add(qs),window.addEventListener("resize",JT,!1),window.addEventListener("mousemove",t1,!1),window.addEventListener("mousedown",n1,!1),window.addEventListener("mouseup",i1,!1),window.addEventListener("click",s1,!1),window.addEventListener("touchstart",r1,!1),window.addEventListener("touchmove",o1,!1),window.addEventListener("touchend",l1,!1),window.addEventListener("keydown",function(t){switch(t.key){case"Escape":us(),Pi.length=0,Xo(),jt.length>0&&(_c(),gc());break;case"q":case"Q":Ze.setSpace(Ze.space==="local"?"world":"local"),Z.transformSpace=Ze.space==="world";break;case"Shift":Dl=!0,wr();break;case"r":case"R":Ze.setMode("rotate"),Z.transformMode="rotate";break;case"s":case"S":Ze.setMode("scale"),Z.transformMode="scale";break;case"t":case"T":Ze.setMode("translate"),Z.transformMode="translate";break;case"/":Me&&Vg();break;case"*":Z.isGroupTransformActive?mc():Gg();break;case"+":case"=":Ze.setSize(Ze.size+.1);break;case"-":case"_":Ze.setSize(Math.max(Ze.size-.1,.1));break;case"x":case"X":Ze.showX=!Ze.showX;break;case"y":case"Y":Ze.showY=!Ze.showY;break;case"z":case"Z":Ze.showZ=!Ze.showZ;break;case" ":Ze.enabled=!Ze.enabled;break;case"m":Me&&Me.position.set(Math.random()*400-200,Math.random()*400-200,Math.random()*400-200);break;case"ArrowUp":zg();break;case"ArrowDown":Hg();break;case"PageUp":t.shiftKey?Bd():Hd(),t.preventDefault();break;case"PageDown":t.shiftKey?kd():zd(),t.preventDefault();break;case"Home":i_(),t.preventDefault();break;case"End":n_(),t.preventDefault();break;case"p":console.log("selectionHistory.length: ",Pi.length),Pi.forEach((n,i)=>{console.log(n.name,i)});break;case"7":nc(-1);break;case"8":Xg();break;case"9":nc(1);break}}),window.addEventListener("keyup",function(t){t.key==="Shift"&&(Dl=!1,wr())}),kT(),p1()}function Nl(){const s=new qn;if(Sn.forEach(i=>s.expandByObject(i)),s.isEmpty())return;const e=s.getSize(new D),t=Math.max(e.x,e.y,e.z);Xn=t*1.5;const n=window.innerWidth/window.innerHeight;hi.left=-Xn*n,hi.right=Xn*n,hi.top=Xn,hi.bottom=-Xn,hi.near=Math.min(1,t*.01),hi.far=t*10,hi.zoom=1,hi.updateProjectionMatrix(),console.log(`[recalibrateOrthoCamera] maxDim=${t.toFixed(1)}, orthoHalfSize=${Xn.toFixed(1)}, near=${hi.near.toFixed(2)}, far=${hi.far.toFixed(1)}`)}function wr(){Z.snapEnabled||Dl?(Ze.setTranslationSnap(Z.snapTranslation),Ze.setRotationSnap(Ro.degToRad(Z.snapRotationDeg)),Ze.setScaleSnap(Z.snapScale)):(Ze.setTranslationSnap(null),Ze.setRotationSnap(null),Ze.setScaleSnap(null))}function OT(s){Sn.forEach(e=>{e.isMesh&&(Array.isArray(e.material)?e.material:[e.material]).forEach(n=>{n.wireframe=s})}),ge()}function kT(){const s=Wo.addFolder("View");s.add(Z,"fit").name("Fit View"),s.add(Z,"resetWholeModel").name("Reset whole model"),s.add(Z,"cleanupModel").name("Cleanup (flatten unnamed nodes)"),s.add(Z,"showHiddenObjects").name("Show hidden objects"),s.add(Z,"switchHiddenObjects").name("Switch hidden objects");let e=s.add(Z,"fullscreen").name("Fullscreen").onChange(function(u){u?document.getElementById("body").requestFullscreen().catch(d=>{console.warn("Fullscreen not available: ",d.message)}):document.fullscreenElement&&document.exitFullscreen()}).listen();s.add(Z,"isSelectAllowed").name("Allow selection").listen(),s.add(Z,"wireframe").name("Wireframe").onChange(function(u){OT(u)}).listen(),s.add(Z,"transformSpace").name("Transform: World space").onChange(function(u){Ze.setSpace(u?"world":"local")}).listen(),s.add(Z,"cadSelection",["CAD","Detailed"]).name("Selection").listen(),s.addColor(Z,"backgroundColor").name("Background").onChange(function(u){wt.background=new ke(u),ge()});const t=s.addFolder("Section view");t.add(Z,"section").name("Section").onChange(function(u){Vn.localClippingEnabled=u,ge()}),t.add(Z,"showSectionMesh").name("Show Section Mesh").onChange(function(u){XT()}),t.add(Z,"px",ct.pn,ct.pp,ct.pStep).name("Pos. x").onChange(function(u){On[0].constant=u,ge()}).listen(),t.add(Z,"py",ct.pn,ct.pp,ct.pStep).name("Pos. y").onChange(function(u){On[1].constant=u,ge()}).listen(),t.add(Z,"pz",ct.pn,ct.pp,ct.pStep).name("Pos. z").onChange(function(u){On[2].constant=u,ge()}).listen(),t.add(Z,"reset").name("Reset section");const n=t.addFolder("Cross Section Lines");n.add(Z,"showCrossSection").name("Show Lines").onChange(function(u){xn(),ge()}),n.add(Z,"autoUpdateSectionLines").name("Update Section Lines"),n.add(Z,"crossSectionPlane",["XY","XZ","YZ"]).name("Plane").onChange(function(u){Z.showCrossSection&&(xn(),ge())}),n.add(Z,"crossSectionPos",ct.pn,ct.pp,ct.pStep).name("Position").onChange(function(u){Z.showCrossSection&&(xn(),ge())}).listen(),n.addColor(Z,"crossSectionColor").name("Color").onChange(function(u){$l&&($l.material.color.set(u),ge())}),n.close(),t.close();const i=s.addFolder("View orientation");i.add(Z,"viewx").name("View from X"),i.add(Z,"viewy").name("View from Y"),i.add(Z,"viewz").name("View from Z"),i.close();const r=s.addFolder("Whole Model Rotation");r.add(Z,"rotateXPlus").name("Rotate X +90°"),r.add(Z,"rotateXMinus").name("Rotate X -90°"),r.add(Z,"rotateYPlus").name("Rotate Y +90°"),r.add(Z,"rotateYMinus").name("Rotate Y -90°"),r.add(Z,"rotateZPlus").name("Rotate Z +90°"),r.add(Z,"rotateZMinus").name("Rotate Z -90°"),r.add(Z,"bakeWholeModelRotation").name("Bake rotation"),r.close();const o=s.addFolder("Snap");o.add(Z,"transformMode",["translate","rotate","scale"]).name("Mode").onChange(function(u){Ze.setMode(u)}).listen(),o.add(Z,"snapEnabled").name("Snap enabled").onChange(function(){wr()}).listen(),o.add(Z,"snapTranslation",1,1e3,1).name("Translation").onChange(function(){wr()}).listen(),o.add(Z,"snapRotationDeg",1,90,1).name("Rotation (°)").onChange(function(){wr()}).listen(),o.add(Z,"snapScale",.01,2,.01).name("Scale").onChange(function(){wr()}).listen(),o.close();const a=s.addFolder("Export / Import GLB");a.add(Z,"importGlb").name("Import GLB…"),a.add(Z,"exportAll").name("Export all models"),a.add(Z,"exportSelected").name("Export selected object"),a.add(Z,"exportToHTML").name("Export to HTML (assembly)"),a.add(Z,"exportToHTMLObfuscated").name("Export to HTML obfuscated"),a.close();const l=s.addFolder("Helpers");l.add(Z,"showAxesHelper").name("axes").onChange(function(){$p()}).listen(),l.add(Z,"axesHelperSize",1,2e3,1).name("axes size").onChange(function(){$p()}).listen(),l.add(Z,"showRaycastHelper").name("raycast").onChange(function(){!Z.showRaycastHelper&&Sr&&(wt.remove(Sr),Sr=null,ge())}).listen(),l.add(Z,"raycastHelperSize",100,1e5,100).name("raycast size").listen(),l.close();const c=s.addFolder("Group Selection");c.add(Z,"isGroupTransformActive").name("Group transform active (*)").onChange(function(u){u?Gg():mc()}).listen(),c.add(Z,"multiSelectBoxPadding",0,200,1).name("Box padding").listen(),c.add(Z,"addToMulti").name("Add/remove selected (/)"),c.add(Z,"clearMulti").name("Clear group"),c.add(Z,"addGroupToHistory").name("Add to history");const h=c.addFolder("Group History");h.add(Z,"historyInfo").name("Entry").listen().disable(),h.add(Z,"historyPrev").name("← Previous  [7]"),h.add(Z,"historyNext").name("→ Next  [9]"),h.add(Z,"historyRestore").name("Restore  [8]"),h.add(Z,"historyRemove").name("Remove from history"),h.close(),c.close(),document.addEventListener("fullscreenchange",function(){Z.fullscreen=!!document.fullscreenElement,e&&e.updateDisplay&&e.updateDisplay()}),s.close()}function BT(s){Dn&&(Dn.destroy(),Dn=null),(function(r){let o=null;r.material&&(o=Array.isArray(r.material)?r.material[0]:r.material),o||r.traverse(a=>{!o&&a.isMesh&&a.material&&(o=Array.isArray(a.material)?a.material[0]:a.material)}),o&&o.color&&(Wi.color="#"+o.color.getHexString())})(s),Dn=Wo.addFolder("Selected part: "+(s.name||"Unnamed")),Dn.add(s,"name").name("Name").listen(),Dn.addColor(Wi,"color").name("Specif. color").onChange(function(i){kg(s,i)}),Dn.add(Wi,"randomColor").name("Random color"),Dn.add(Wi,"remove").name("Remove Object"),Dn.add(Wi,"flattenObject").name("Flatten (remove node, keep children)"),Dn.add(Wi,"hideObject").name("Hide Object");const e=Dn.addFolder("Location");e.add(Wi,"resetLocation").name("Reset init. location"),e.add(Wi,"undoTransform").name("Undo last transform"),Hu();function t(){Be.editMode&&Be.currentStepIndex>=0&&t_(),Hu()}e.add(s.position,"x",ct.pn,ct.pp,ct.pStep).name("Px").onChange(function(i){s.position.x=i,ge()}).onFinishChange(t).listen(),e.add(s.position,"y",ct.pn,ct.pp,ct.pStep).name("Py").onChange(function(i){s.position.y=i,ge()}).onFinishChange(t).listen(),e.add(s.position,"z",ct.pn,ct.pp,ct.pStep).name("Pz").onChange(function(i){s.position.z=i,ge()}).onFinishChange(t).listen(),e.add(s.rotation,"x",ct.rn,ct.rp,ct.rStep).name("Rx").onChange(function(i){s.rotation.x=i,ge()}).onFinishChange(t).listen(),e.add(s.rotation,"y",ct.rn,ct.rp,ct.rStep).name("Ry").onChange(function(i){s.rotation.y=i,ge()}).onFinishChange(t).listen(),e.add(s.rotation,"z",ct.rn,ct.rp,ct.rStep).name("Rz").onChange(function(i){s.rotation.z=i,ge()}).onFinishChange(t).listen(),e.add(s.scale,"x",ct.sn,ct.sp,ct.sStep).name("Scale").onChange(function(i){s.scale.x=i,s.scale.y=i,s.scale.z=i,ge()}).onFinishChange(t).listen(),e.close();const n=Dn.addFolder("Navigation");n.add(Wi,"selectParent").name("Select parent (Arrow Up)"),n.add(Wi,"selectPrevious").name("Select previous (Arrow Down)"),n.open(),Dn.open()}function zT(){const s=new URLSearchParams(window.location.search),e=s.get("model"),t=s.get("name"),n=t?t.split(".").pop().toLowerCase():null;if(e&&t)switch(console.log(`fileUrl: ${e}`),console.log(`fileName: ${t}`),document.getElementById("fileNameLabel").textContent=t,document.getElementById("pageTitle").textContent=t,n){case"zip":qT(e,t).then(i=>{Nl(),Sa(),console.log(`Model ${t} loaded successfully.`)}).catch(i=>{console.error(`Chyba při načítání modelu ${t}:`,i)});break;case"glb":Vu(e).then(i=>{Nl(),Sa(),console.log(`Model ${t} loaded successfully.`)}).catch(i=>{console.error(`Chyba při načítání modelu ${t}:`,i)});break;default:console.error(`Chyba: Nepodporovaný formát souboru ${n}.`)}else Vu("./models/1012053_l.glb").then(i=>{Nl(),Sa()})}function kg(s,e){if(!s)return;const t=e?new ke(e):new ke(Math.random()*16777215),n=i=>{i&&(i.color&&i.color.copy(t),i.emissive&&i.emissive.setHex(0),i.needsUpdate=!0)};s.material&&(Array.isArray(s.material)?s.material.forEach(n):n(s.material)),s.traverse(i=>{i.isMesh&&i.material&&(Array.isArray(i.material)?i.material.forEach(n):n(i.material))}),ge()}function Fd(s){s&&(s.position.set(s.userData.initPosition.x,s.userData.initPosition.y,s.userData.initPosition.z),s.rotation.set(s.userData.initRotation.x,s.userData.initRotation.y,s.userData.initRotation.z),s.scale.set(s.userData.initScale.x,s.userData.initScale.y,s.userData.initScale.z),ge())}function HT(){wt.traverse(function(s){s.userData.initPosition&&s.userData.initRotation&&s.userData.initScale&&(s.position.copy(s.userData.initPosition),s.rotation.copy(s.userData.initRotation),s.scale.copy(s.userData.initScale))}),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge()}function VT(){si.forEach(function(s){if(!s)return;s.updateMatrixWorld(!0);const e=new Ut,t=new D,n=new D;s.matrixWorld.decompose(t,e,n);const i=new Ye().compose(t,new Ut,n),r=s.matrixWorld.clone().invert();s.traverse(function(o){if(!o.isMesh||!o.geometry)return;o.updateWorldMatrix(!0,!1);const a=o.matrixWorld.clone(),l=new Ye().multiplyMatrices(r,a),c=new Ye().multiplyMatrices(i,l),h=new Ye().multiplyMatrices(c.clone().invert(),a);o.geometry=o.geometry.clone(),o.geometry.applyMatrix4(h),o.geometry.computeBoundingSphere(),o.geometry.computeBoundingBox()}),s.rotation.set(0,0,0),s.updateMatrixWorld(!0)}),ge()}function ro(s,e){si.forEach(function(t){if(t&&t.rotation)switch(s){case"x":t.rotation.x+=e;break;case"y":t.rotation.y+=e;break;case"z":t.rotation.z+=e;break}}),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge()}function oo(s,e=1e-10){return Math.abs(s)<e?0:s}function Hu(){const s=Ze.object;s&&(jn={object:s,position:s.position.clone(),rotation:s.rotation.clone(),scale:s.scale.clone()})}function GT(){ec=jt.map(s=>(s.updateWorldMatrix(!0,!1),{object:s,worldMatrix:s.matrixWorld.clone()}))}function Bg(s){if(!s||!jn||jn.object!==s){console.log("Nothing to undo.");return}s.position.copy(jn.position),s.rotation.copy(jn.rotation),s.scale.copy(jn.scale),console.log("Transformation undone."),jn=null,ge()}function WT(s){if(s.children.some(i=>i.isSectionMesh))return;const e=s.clone(!1),n=(Array.isArray(e.material)?e.material:[e.material]).map(i=>{const r=i.color;return new ki({side:$n,clippingPlanes:On,clipIntersection:!0,color:r,polygonOffset:!0,polygonOffsetFactor:-1,wireframe:!1})});e.material=Array.isArray(e.material)?n:n[0],e.position.set(0,0,0),e.rotation.set(0,0,0),e.scale.set(1,1,1),e.isSectionMesh=!0,s.add(e)}function XT(){Z.showSectionMesh?Sn.forEach(s=>{s.isMesh&&WT(s)}):Sn.forEach(s=>{s.isMesh&&s.children.forEach(e=>{e.isSectionMesh&&(s.remove(e),e.geometry&&e.geometry.dispose(),e.material&&(Array.isArray(e.material)?e.material.forEach(t=>t.dispose()):e.material.dispose()))})}),ge()}function zg(){if(Me){const s=Me.parent;s&&s!==wt&&(xc(s),ge())}}function Hg(){if(Pi.length<2)return;const s=Pi[Pi.length-2];s&&(Pi.length-=2,xc(s),ge())}function jT(){Z.px=0,Z.py=0,Z.pz=0,Z.crossSectionPos=0,YT(),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn()}function xn(){$l=LT(wt,$l,Z,Sn)}function bo(s,e,t){let n=new qn;Sn.forEach(o=>{n.expandByObject(o)});const i=n.isEmpty()?new D(0,0,0):n.getCenter(new D);ln.target.copy(i);const r=new D(s,e,t);Ve.position.copy(i).add(r),Ve.lookAt(i.x,i.y,i.z),ln.update()}function Sa(){let s=new qn;if(Sn.forEach(e=>{s.expandByObject(e)}),!s.isEmpty()){const e=s.getCenter(new D),t=s.getSize(new D);ln.target.copy(e);const n=Math.max(t.x,t.y,t.z);let i;if(Ve.isPerspectiveCamera){const a=Ve.fov*(Math.PI/180);i=Math.abs(n/2/Math.tan(a/2))*1.5}else{i=n*1.5;const a=Math.max(t.x,t.y)*1.5;Ve.zoom=Math.min(window.innerWidth/a,window.innerHeight/a),Ve.updateProjectionMatrix()}const r=Math.PI/4;Ve.position.set(e.x+i*Math.cos(r),e.y+i*Math.sin(r),e.z+i*Math.cos(r)),Ve.lookAt(e),ln.update(),((a={})=>{if(console.log("=== FitView Debug ==="),console.log("--- Camera Frustum ---"),Ve.isPerspectiveCamera?(console.log("Camera type: Perspective"),console.log("FOV:",Ve.fov),console.log("Aspect:",Ve.aspect.toFixed(4)),console.log("Near:",Ve.near),console.log("Far:",Ve.far)):(console.log("Camera type: Orthographic"),console.log("Left:",Ve.left.toFixed(2)),console.log("Right:",Ve.right.toFixed(2)),console.log("Top:",Ve.top.toFixed(2)),console.log("Bottom:",Ve.bottom.toFixed(2)),console.log("Near:",Ve.near),console.log("Far:",Ve.far),console.log("Zoom:",Ve.zoom.toFixed(4))),console.log("--- Model & Camera ---"),console.log("Box center:",`x: ${e.x.toFixed(2)}, y: ${e.y.toFixed(2)}, z: ${e.z.toFixed(2)}`),console.log("Box size:",`x: ${t.x.toFixed(2)}, y: ${t.y.toFixed(2)}, z: ${t.z.toFixed(2)}`),a.maxDim!==void 0&&console.log("Max dimension:",a.maxDim.toFixed(2)),a.cameraDistance!==void 0&&console.log("Camera distance:",a.cameraDistance.toFixed(2)),a.cameraPosition){const l=a.cameraPosition;console.log("Camera position:",`x: ${l.x.toFixed(2)}, y: ${l.y.toFixed(2)}, z: ${l.z.toFixed(2)}`);const c=Math.sqrt(Math.pow(l.x-e.x,2)+Math.pow(l.y-e.y,2)+Math.pow(l.z-e.z,2));console.log("Actual distance from center:",c.toFixed(2))}console.log("====================")})({maxDim:n,cameraDistance:i,cameraPosition:Ve.position})}ge()}function YT(){On[0].constant=Z.px,On[1].constant=Z.py,On[2].constant=Z.pz,ge()}function Yp(s,e,t,n,i){const r=new fd(n,i);r.position.set(s,e,t),wt.add(r),r.castShadow=!0}function $p(){if(so&&(wt.remove(so),so.dispose?.(),so=null),!Z.showAxesHelper){ge();return}let s=Z.axesHelperSize;if(!s||s<=0){const e=new qn;if(Sn.forEach(t=>e.expandByObject(t)),e.isEmpty())return;{const t=e.getSize(new D);s=Math.max(t.x,t.y,t.z)*.5,Z.axesHelperSize=Math.round(s)}}so=new xx(s),wt.add(so),ge()}function Vg(){if(!Me)return;if(Z.isGroupTransformActive){console.log("Multi-selection is active – deactivate the group first.");return}const s=Me,e=jt.indexOf(s);if(e!==-1)jt.splice(e,1),Dr.splice(e,1),wt.remove(rs[e]),rs.splice(e,1),console.log(`Multi-selection: removed "${s.name}", remaining: ${jt.length}`);else{jt.push(s),Dr.push(s.parent);const t=new Va(s,52479,Z.multiSelectBoxPadding);wt.add(t),rs.push(t),console.log(`Multi-selection: added "${s.name}", total: ${jt.length}`)}ge()}function Gg(){if(jt.length<2){console.log("Multi-selection: at least 2 objects required (key +).");return}if(Z.isGroupTransformActive)return;us();const s=new D;jt.forEach(e=>{e.updateWorldMatrix(!0,!1),s.add(new D().setFromMatrixPosition(e.matrixWorld))}),s.divideScalar(jt.length),vs=new Ft,vs.name="__multiSelectPivot__",vs.position.copy(s),wt.add(vs),jt.forEach(e=>vs.attach(e)),Ze.attach(vs),Z.isGroupTransformActive=!0,console.log(`Multi-selection activated, ${jt.length} objects.`),ge()}function mc(){Z.isGroupTransformActive&&(Ze.object===vs&&Ze.detach(),jt.forEach((s,e)=>{(Dr[e]||wt).attach(s)}),wt.remove(vs),vs=null,Z.isGroupTransformActive=!1,rs.forEach((s,e)=>{jt[e]&&s.setFromObject(jt[e])}),console.log("Multi-selection deactivated. Object list preserved."),ge())}function gc(){mc(),rs.forEach(s=>wt.remove(s)),rs.length=0,jt.length=0,Dr.length=0,console.log("Multi-selection cleared."),ge()}function _c(){if(jt.length===0){console.log("Group History: list is empty, cannot save.");return}const s=jt.map(t=>t.name||"Unnamed").join(", "),e={name:`[${Tn.length+1}] ${s}`,objects:[...jt]};Tn.push(e),_n=Tn.length-1,Od(),console.log(`Group History: snapshot "${e.name}" saved.`)}function nc(s){if(Tn.length===0){console.log("Group History: history is empty.");return}_n=Math.max(0,Math.min(Tn.length-1,_n+s)),Od(),Xo(),Tn[_n].objects.forEach(e=>{if(!e||!e.parent)return;const t=new Va(e,16746496,Z.multiSelectBoxPadding);wt.add(t),tc.push(t)}),console.log(`Group History: index ${_n} – "${Tn[_n].name}"`),ge()}function Wg(){if(wh.forEach(t=>wt.remove(t)),wh.length=0,!Be.editMode){ge();return}const s=Be.currentStepIndex;if(s<0||s>=me.steps.length){ge();return}me.steps[s].transformations.forEach(t=>{if(!t.objectRef||!t.objectRef.parent)return;const n=new Va(t.objectRef,16772608,Z.multiSelectBoxPadding);wt.add(n),wh.push(n)}),ge()}function Xo(){tc.forEach(s=>wt.remove(s)),tc.length=0,ge()}function Xg(){if(_n<0||_n>=Tn.length){console.log("Group History: no record to restore.");return}Xo();const s=Tn[_n];mc(),rs.forEach(e=>wt.remove(e)),rs.length=0,jt.length=0,Dr.length=0,s.objects.forEach(e=>{if(!e||!e.parent)return;jt.push(e),Dr.push(e.parent);const t=new Va(e,52479,Z.multiSelectBoxPadding);wt.add(t),rs.push(t)}),console.log(`Group History: group "${s.name}" restored (${jt.length} objects).`),ge()}function $T(){if(_n<0||_n>=Tn.length){console.log("Group History: no record to delete.");return}Xo();const s=Tn.splice(_n,1)[0];_n>=Tn.length&&(_n=Tn.length-1),Od(),_n>=0&&(Tn[_n].objects.forEach(e=>{if(!e||!e.parent)return;const t=new Va(e,16746496,Z.multiSelectBoxPadding);wt.add(t),tc.push(t)}),ge()),console.log(`Group History: record "${s.name}" deleted, remaining: ${Tn.length}`)}function Od(){if(_n<0||Tn.length===0)Z.historyInfo="– žádný záznam –";else{const s=Tn[_n];Z.historyInfo=`${_n+1}/${Tn.length}: ${s.name}`}}function qT(s,e,t,n){return new Promise((i,r)=>{const o=new PT(s);o.load().then(function(){const a=o.extractAsBlobUrl(qp(e)+".txt");new Dw().load(a,function(c){const h=[],u=c.groups.length;console.log("nGeometryGroups: ",u);for(let f=0;f<u;f++){const g=new O0({side:Jn,clippingPlanes:On,clipIntersection:!0,color:Math.random()*16777215,wireframe:!1,polygonOffset:!0,polygonOffsetFactor:1});h.push(g)}const d=new ve(c,h);d.userData.initPosition={x:0,y:0,z:0},d.userData.initRotation={x:-Math.PI/2,y:0,z:0},d.userData.initScale={x:1,y:1,z:1},d.name=qp(s),wt.add(d),console.log(d),Sn.push(d),ge(),i(d),Me=d})})})}function Vu(s,e,t,n){return new Promise((i,r)=>{const o=new Nw,a=new mE;a.setDecoderPath("./draco/"),o.setDRACOLoader(a),o.load(s,function(l){l.scene.traverse(function(c){const h=c.scale;(Math.abs(h.x)<.1||Math.abs(h.x)>10||Math.abs(h.y)<.1||Math.abs(h.y)>10||Math.abs(h.z)<.1||Math.abs(h.z)>10)&&c.scale.set(1,1,1)}),wt.add(l.scene),si.push(l.scene),console.log(l.scene),l.scene.traverse(function(c){c.userData.initPosition=c.position.clone(),c.userData.initRotation=c.rotation.clone(),c.userData.initScale=c.scale.clone(),c.isMesh&&(c.material&&(c.material=c.material.clone(),c.material.clippingPlanes=On,c.material.clipIntersection=!0,c.material.side=Jn,c.material.polygonOffset=!0,c.material.polygonOffsetFactor=1),Sn.push(c))}),h1(l.scene),ge(),i(l.scene)},void 0,function(l){r(l)})})}function qp(s){const e=s.split("/");return e[e.length-1].split(".")[0]}function ZT(){if(!confirm("Flatten all unnamed nodes in the model?"))return;us();const s=[];if(si.forEach(function(t){t&&t.traverse(function(n){n.isMesh||n.isLight||n.isCamera||(!n.name||n.name.trim()==="")&&s.push(n)})}),s.length===0){console.log("cleanupModel: no unnamed nodes found.");return}s.reverse();let e=0;for(const t of s){if(!t.parent)continue;const n=t.parent,i=[...t.children];for(const a of i)n.attach(a);n.remove(t);const r=Sn.indexOf(t);r!==-1&&Sn.splice(r,1);const o=si.indexOf(t);o!==-1&&si.splice(o,1,...i),e++}console.log(`cleanupModel: removed ${e} unnamed node(s).`),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge()}function KT(s){if(!s||!confirm("Remove this node and move its children to the parent?"))return;const e=s.parent;if(!e){console.warn("flattenHierarchy: object has no parent, cannot flatten.");return}const t=[...s.children];if(t.length===0){console.warn("flattenHierarchy: object has no children, use Remove Object instead.");return}us();for(const r of t)e.attach(r);e.remove(s);const n=Sn.indexOf(s);n!==-1&&Sn.splice(n,1);const i=si.indexOf(s);i!==-1&&si.splice(i,1,...t),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge()}function jg(s){if(confirm("Do you really want to permanently remove object?"))try{us();const e=new Set;s.traverse(r=>{e.add(r);const o=Sn.indexOf(r);o!==-1&&Sn.splice(o,1);const a=es.indexOf(r);a!==-1&&es.splice(a,1)});const t=new Set;me.steps.forEach(r=>{const o=r.transformations.length;r.transformations=r.transformations.filter(a=>!e.has(a.objectRef)),r.transformations.length});const n=me.steps.filter(r=>r.transformations.length>0);n.length!==me.steps.length&&(me.steps.length=0,n.forEach((r,o)=>{r.id=o+1,me.steps.push(r)}),Be.currentStepIndex>=me.steps.length&&(Be.currentStepIndex=me.steps.length-1)),e.forEach(r=>Lr.delete(r)),s.parent?s.parent.remove(s):wt.remove(s);const i=si.indexOf(s);i!==-1&&si.splice(i,1),ql&&on(),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge()}catch(e){console.log("Error: removeModel "+e.message)}}function Yg(s){try{s.visible=!1;const e=ba.indexOf(s);e!==-1&&(ba.splice(e,1),console.log(`Object ${s.name||"Unnamed"} removed from temporarilyShownObjects.`)),es.includes(s)||(es.push(s),console.log(`Object ${s.name||"Unnamed"} hidden.`)),us(),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge()}catch(e){console.log("Error: hideObject "+e.message)}}function $g(){try{es.forEach(s=>{s.visible=!0,console.log(`Object ${s.name||"Unnamed"} shown.`)}),es.length=0,Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge()}catch(s){console.log("Error: showHiddenObjects "+s.message)}}function qg(){try{const s=[...es];es.length=0,es.push(...ba),ba=s,es.forEach(e=>{e.visible=!1,console.log(`Object ${e.name||"Unnamed"} is hidden.`)}),ba.forEach(e=>{e.visible=!0,console.log(`Object ${e.name||"Unnamed"} is visible.`)}),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge()}catch(s){console.log("Error: toggleHiddenObjects "+s.message)}}function QT(s){const e=[],t=s.groups,n=s.getAttribute("position").array,i=s.getAttribute("normal").array;for(let r=0,o=t.length;r<o;r++){const a=t[r],l=a.count,c=new zt,h=new Float32Array(l*3),u=new Float32Array(l*3);for(let d=0;d<l;d++){const f=3*(a.start+d),g=3*d;h[g+0]=n[f+0],h[g+1]=n[f+1],h[g+2]=n[f+2],u[g+0]=i[f+0],u[g+1]=i[f+1],u[g+2]=i[f+2]}c.setAttribute("position",new Et(h,3)),c.setAttribute("normal",new Et(u,3)),c.addGroup(0,l,0),e.push(c)}return e}function JT(){const s=window.innerWidth/window.innerHeight;Ve==Og&&(Ve.aspect=s),Ve==hi&&(Ve.left=-Xn*s,Ve.right=Xn*s,Ve.top=Xn,Ve.bottom=-Xn),Ve.updateProjectionMatrix(),Vn.setSize(window.innerWidth,window.innerHeight),ge()}function Zg(s,e=16711680){!s||!s.material||(Array.isArray(s.material)?s.material.forEach(t=>{t.emissive&&t.emissive.setHex(e)}):s.material.emissive&&s.material.emissive.setHex(e))}function e1(s){s&&qs&&(qs.setFromObject(s),qs.visible=!0)}function Kg(s){if(Z.cadSelection!=="CAD")return s;let e=s.parent;for(;e&&e.parent;){if(e.name&&e.name.trim()!=="")return e;e=e.parent}return s}function fa(){Gn&&qs&&(qs.visible=!1)}function xc(s){Me&&us(),s&&(Me=s,Ze.attach(s),Pi.push(s),Pi.length>30&&Pi.shift(),BT(s),s.traverse(function(e){e.isMesh&&Zl.push(e)}),Zl.forEach(e=>{e.material.emissive&&Zg(e,16711680)}),console.log("selected object: ",Me)),ge()}function us(){Me&&(fa(),Ze.object&&Ze.detach(),Dn&&(Dn.destroy(),Dn=null),Zl.forEach(s=>Zg(s,0)),Zl.length=0,Me=null,setTimeout(()=>{ge()},100))}function ge(){const s=document.elementFromPoint(ss.x*window.innerWidth/2+window.innerWidth/2,-ss.y*window.innerHeight/2+window.innerHeight/2)?.closest(".lil-gui");if(!Mr&&!s&&!Jl&&!Ms&&Z.isSelectAllowed&&!Z.isGroupTransformActive){fo.setFromCamera(ss,Ve),Z.showRaycastHelper&&(Sr&&wt.remove(Sr),Sr=new _x(fo.ray.direction,fo.ray.origin,Z.raycastHelperSize,16711680,20,10),wt.add(Sr));const e=fo.intersectObjects(Sn),t=i=>{let r=i;for(;r;){if(!r.visible)return!1;r=r.parent}return!0},n=Vn.localClippingEnabled&&On.length>0?e.filter(i=>t(i.object)&&On.some(r=>r.distanceToPoint(i.point)>=0)):e.filter(i=>t(i.object));n.length>0?Gn!=n[0].object&&(Gn&&fa(),Gn=n[0].object,e1(Gn)):Gn&&(fa(),Gn=null)}else(s||Jl||Ms)&&Gn&&(fa(),Gn=null);(!Z.isSelectAllowed||Z.isGroupTransformActive)&&Gn&&(fa(),Gn=null),Vn.render(wt,Ve)}function t1(s){s.preventDefault(),ss.x=s.clientX/window.innerWidth*2-1,ss.y=-(s.clientY/window.innerHeight)*2+1,ge()}function n1(s){Kl.x=s.clientX,Kl.y=s.clientY,Jl=!0}function i1(s){Jl=!1}function s1(s){if(Qg(s))return;const e=document.elementFromPoint(s.clientX,s.clientY);if(e&&e.closest(".ctx-menu")||!Z.isSelectAllowed||Z.isGroupTransformActive||Mr||(Sh.x=s.clientX,Sh.y=s.clientY,Kl.distanceTo(Sh)>3))return;const n=Jg();n?(Gn=n,xc(Kg(n))):(Gn=null,us(),Pi.length=0,Xo(),jt.length>0&&(_c(),gc()))}function r1(s){if(s.touches.length===1){const e=s.touches[0];Ql.x=e.clientX,Ql.y=e.clientY,Ms=!1,ss.x=e.clientX/window.innerWidth*2-1,ss.y=-(e.clientY/window.innerHeight)*2+1,ge()}}function o1(s){if(s.touches.length===1){const e=s.touches[0],t=new Ne(e.clientX,e.clientY);Ql.distanceTo(t)>3&&(Ms=!0),ss.x=e.clientX/window.innerWidth*2-1,ss.y=-(e.clientY/window.innerHeight)*2+1,ge()}}function Qg(s){const e=document.elementFromPoint(s.clientX,s.clientY);return Wo.domElement.contains(e)}function Jg(){fo.setFromCamera(ss,Ve);const s=fo.intersectObjects(Sn),e=n=>{let i=n;for(;i;){if(!i.visible)return!1;i=i.parent}return!0},t=Vn.localClippingEnabled&&On.length>0?s.filter(n=>e(n.object)&&On.some(i=>i.distanceToPoint(n.point)>=0)):s.filter(n=>e(n.object));return t.length>0?t[0].object:null}function a1(s){if(s.changedTouches.length>0){const e=s.changedTouches[0],t=document.elementFromPoint(e.clientX,e.clientY);return Wo.domElement.contains(t)}return!1}function l1(s){if(s.changedTouches.length>0){const e=s.changedTouches[0];if(Mh.x=e.clientX,Mh.y=e.clientY,Ql.distanceTo(Mh)>10||Ms){Ms=!1;return}if(!Z.isSelectAllowed||Z.isGroupTransformActive||Mr||a1(s))return;if(zu){zu=!1,Ms=!1;return}const n=document.elementFromPoint(e.clientX,e.clientY);if(n&&n.closest(".ctx-menu")){Ms=!1;return}const i=Jg();i?(Gn=i,xc(Kg(i))):(Gn=null,us(),Pi.length=0,Xo(),jt.length>0&&(_c(),gc())),Ms=!1}}function e_(s,e){const t=new Blob([s],{type:"application/octet-stream"}),n=document.createElement("a");n.href=URL.createObjectURL(t),n.download=e,n.click(),URL.revokeObjectURL(n.href)}function c1(){const s=document.createElement("input");s.type="file",s.accept=".glb",s.addEventListener("change",function(){const e=s.files[0];if(!e)return;const t=URL.createObjectURL(e);Vu(t,e.name).then(()=>{URL.revokeObjectURL(t),Nl(),Sa(),console.log(`[Import] GLB "${e.name}" loaded successfully.`)}).catch(n=>{URL.revokeObjectURL(t),console.error(`[Import] Failed to load "${e.name}":`,n)})}),s.click()}function ic(){const s=new Set;me.steps.forEach(e=>{e.transformations.forEach(t=>s.add(t.objectRef))}),s.forEach(e=>{e.userData.assemblyTransformations=[]}),me.steps.forEach(e=>{e.transformations.forEach(t=>{t.objectRef.userData.assemblyTransformations.push({step_id:e.id,step_name:e.name,step_description:e.description,step_camera:e.camera?{...e.camera}:null,initPosition:{...t.initPosition},finalPosition:{...t.finalPosition},initQuaternion:t.initQuaternion?{...t.initQuaternion}:null,finalQuaternion:t.finalQuaternion?{...t.finalQuaternion}:null,initScale:t.initScale?{...t.initScale}:null,finalScale:t.finalScale?{...t.finalScale}:null})})})}function sc(){me.steps.forEach(s=>{s.transformations.forEach(e=>{delete e.objectRef.userData.assemblyTransformations})})}function h1(s){const e=new Map;s.traverse(function(a){const l=a.userData.assemblyTransformations;!Array.isArray(l)||l.length===0||(l.forEach(c=>{e.has(c.step_id)||e.set(c.step_id,{id:c.step_id,name:c.step_name||`Step ${c.step_id}`,description:c.step_description||"",camera:c.step_camera||null,transformations:[]}),e.get(c.step_id).transformations.push({objectRef:a,initPosition:c.initPosition,finalPosition:c.finalPosition,initQuaternion:c.initQuaternion||null,finalQuaternion:c.finalQuaternion||null,initScale:c.initScale||null,finalScale:c.finalScale||null})}),delete a.userData.assemblyTransformations)});const t=[...e.values()].sort((a,l)=>a.id-l.id);if(t.length===0)return;if(me.steps.length===0){me.steps.push(...t),Sl(),console.log(`[Assembly] Imported ${t.length} step(s) from GLB.`),on();return}const n=me.steps.length,i=t.length,r=window.prompt(`Imported model contains Assembly Workflow (${i} step(s)).
Existing workflow: ${n} step(s).

Choose action:
  1 — Merge   (combine transformations of steps with matching IDs; keep existing step names)
  2 — Append  (add imported steps after existing steps)
  3 — Replace (overwrite existing workflow with imported)
  4 — Ignore  (discard imported workflow)`,"1"),o=r!==null?r.trim():"4";if(o==="1")t.forEach(a=>{const l=me.steps.find(c=>c.id===a.id);l?(l.transformations.push(...a.transformations),console.log(`[Assembly] Merge: added ${a.transformations.length} transformation(s) to step ${a.id} "${l.name}".`)):(me.steps.push(a),me.steps.sort((c,h)=>c.id-h.id),console.log(`[Assembly] Merge: new step ${a.id} "${a.name}" inserted.`))}),Sl();else if(o==="2"){const a=Math.max(...me.steps.map(l=>l.id));t.forEach((l,c)=>{l.id=a+c+1,me.steps.push(l)}),Sl(),console.log(`[Assembly] Append: ${t.length} step(s) added (IDs ${a+1}–${a+t.length}).`)}else o==="3"?(me.steps.length=0,me.steps.push(...t),Lr.clear(),Sl(),console.log(`[Assembly] Replace: workflow replaced with ${t.length} imported step(s).`)):console.log("[Assembly] Import: workflow ignored.");on()}function u1(){if(si.length===0){console.warn("Žádné modely k exportu.");return}const s="export_all.glb",e=window.prompt("Název souboru pro export:",s);if(e===null)return;const t=e.trim()||s;ic();const n=new Ir,i=new Qi;si.forEach(r=>{i.add(r.clone(!0))}),sc(),n.parse(i,function(r){e_(r,t),console.log("Export all: hotovo.")},function(r){console.error("Chyba při exportu:",r)},{binary:!0,onlyVisible:!1})}function d1(){if(!Me){console.warn("Žádný objekt není vybrán.");return}const s=`export_${Me.name||"selected"}.glb`,e=window.prompt("Název souboru pro export:",s);if(e===null)return;const t=e.trim()||s;Me.traverse(l=>{l.isMesh&&l.material&&(Array.isArray(l.material)?l.material:[l.material]).forEach(h=>{h.emissive&&h.emissive.setHex(0)})}),ic();const n=new Ir,i=Me.clone(!0);sc(),Me.updateWorldMatrix(!0,!1);const r=new D,o=new Ut,a=new D;Me.matrixWorld.decompose(r,o,a),i.position.copy(r),i.quaternion.copy(o),i.scale.copy(a),n.parse(i,function(l){e_(l,t),console.log("Export selected: hotovo.")},function(l){console.error("Chyba při exportu:",l)},{binary:!0,onlyVisible:!1})}function f1(s){if(!s||!s.geometry)return;const e=QT(s.geometry);jg(s),e.forEach((t,n)=>{const i=[];i.push(s.material[n]);const r=new ve(t,i);r.initPosition=s.position.clone(),r.initRotation=s.rotation.clone(),r.initScale=s.scale.clone(),Fd(r),r.name=`Part_${n}_${s.name||"sep"}`,wt.add(r),Sn.push(r)}),ge()}function p1(){const s=Wo.addFolder("Assembly Workflow");ql=s;const e=s.addFolder("Playback");e.add(qe,"stepInfo").name("Status").disable().listen(),e.add(qe,"animationLoop").name("Loop  ∞  (start ↔ finish)").listen(),e.add(qe,"resetToStart").name("⏮  Reset to start  [Home]"),e.add(qe,"animateToStart").name("◀◀  Animate to start  [Shift+PgUp]"),e.add(qe,"prevStep").name("◀  Previous step  [PageUp]"),e.add(qe,"nextStep").name("Next step  ▶  [PageDown]"),e.add(qe,"animateToFinish").name("Animate to finish  ▶▶  [Shift+PgDn]"),e.add(qe,"resetToFinish").name("Reset to finish  ⏭  [End]");const t=e.addFolder("Animation Settings");t.add(qe,"animationDuration",0,2e3,50).name("Duration (ms)"),t.add(qe,"animationEase",["none","power1.in","power1.out","power1.inOut","power2.in","power2.out","power2.inOut","power3.in","power3.out","power3.inOut","power4.in","power4.out","power4.inOut","back.in","back.out","back.inOut","bounce.in","bounce.out","bounce.inOut","elastic.in","elastic.out","elastic.inOut","circ.in","circ.out","circ.inOut","expo.in","expo.out","expo.inOut","sine.in","sine.out","sine.inOut"]).name("Ease"),t.add(qe,"animationRepeat",-1,10,1).name("Repeat (-1=∞)"),t.add(qe,"animationDelay",0,2e3,50).name("Delay (ms)"),t.add(qe,"animationRepeatDelay",0,2e3,50).name("Repeat delay (ms)"),t.add(qe,"animationYoyo").name("Yoyo"),t.add(qe,"animationStagger",0,1e3,10).name("Stagger (ms)"),t.add(qe,"animationOverwrite",["auto","true","false"]).name("Overwrite"),e.open();const n=s.addFolder("Edit");n.add(qe,"editMode").name("Edit mode").onChange(function(r){Be.editMode=r,i.forEach(o=>r?o.enable():o.disable()),Wg(),console.log(`[Assembly] Edit mode: ${r}`)}).listen(),n.add(qe,"editStepInfo").name("Active step").disable().listen();const i=[];i.push(n.add(qe,"stepName").name("Step name").onFinishChange(function(r){const o=Be.currentStepIndex;o>=0&&o<me.steps.length&&(me.steps[o].name=r,on())}).listen()),i.push(n.add(qe,"stepDescription").name("Description").onFinishChange(function(r){const o=Be.currentStepIndex;o>=0&&o<me.steps.length&&(me.steps[o].description=r)}).listen()),i.push(n.add(qe,"newStep").name("+ New step")),i.push(n.add(qe,"deleteStep").name("✕  Delete step")),i.push(n.add(qe,"moveStepUp").name("↑  Move step up")),i.push(n.add(qe,"moveStepDown").name("↓  Move step down")),i.push(n.add(qe,"removeObjectFromStep").name("✕  Remove object from step")),i.push(n.add(qe,"saveCameraView").name("📷  Save camera view")),i.push(n.add(qe,"clearCameraView").name("✕  Clear camera view")),i.forEach(r=>r.disable()),n.open(),s.close(),on()}function on(){const s=me.steps.length;if(Be.currentStepIndex<0)qe.stepInfo=`Assembled (${s} step${s===1?"":"s"})`;else{const t=me.steps[Be.currentStepIndex];qe.stepInfo=`${Be.currentStepIndex+1}/${s}: ${t.name}`}const e=Be.currentStepIndex;if(e>=0&&e<s){const t=me.steps[e];qe.editStepInfo=`${e+1}/${s}: (${t.transformations.length} move${t.transformations.length===1?"":"s"})${t.camera?" 📷":""}`,qe.stepName=t.name,qe.stepDescription=t.description}else qe.editStepInfo="Assembled",qe.stepName="",qe.stepDescription="";Wg(),m1()}function m1(){if(Vs&&(Vs.destroy(),Vs=null),!ql)return;const s=me.steps.length,e=s===0?"Steps (empty)":`Steps (${s})`;if(Vs=ql.addFolder(e),s===0){Vs.open();return}const t=Be.currentStepIndex===-1,n={go:function(){g1()}};Vs.add(n,"go").name(`${t?"▶ ":"   "}0:  Assembled`),me.steps.forEach((i,r)=>{const o=r===Be.currentStepIndex,a=i.camera?"  📷":"",l=`${o?"▶ ":"   "}${r+1}:  ${i.name}${a}`,c={go:function(){_1(r)}},h=Vs.add(c,"go").name(l);if(i.camera){const u=h.domElement.querySelector("button");u&&(u.style.color="#f0c040",u.style.fontWeight="bold")}}),Vs.open()}function Gu(s,e){[...me.steps].reverse().forEach(t=>{t.transformations.forEach(n=>{n.objectRef.position.set(n.initPosition.x,n.initPosition.y,n.initPosition.z)})});for(let t=0;t<=s;t++)me.steps[t].transformations.forEach(n=>{n.objectRef.position.set(n.finalPosition.x,n.finalPosition.y,n.finalPosition.z)});Be.currentStepIndex=s,ge(),e?zd():Hd()}function g1(){Be.currentStepIndex!==-1&&Gu(0,!1)}function _1(s){s<0||s>=me.steps.length||s!==Be.currentStepIndex&&(gn&&(gn.kill(),gn=null),s>Be.currentStepIndex?Gu(s-1,!0):Gu(s+1,!1))}function x1(){const s=me.steps[Be.currentStepIndex];s&&(ec.forEach((e,t)=>{const n=e.object;n.updateWorldMatrix(!0,!1);const i=n.matrixWorld.clone(),r=e.worldMatrix,o=Dr[t];let a=r.clone(),l=i.clone();if(o){o.updateWorldMatrix(!0,!1);const b=new Ye().copy(o.matrixWorld).invert();a.premultiply(b),l.premultiply(b)}const c=new D,h=new Ut,u=new D,d=new D,f=new Ut,g=new D;a.decompose(c,h,u),l.decompose(d,f,g);const _=d.distanceTo(c),m=h.angleTo(f),p=g.distanceTo(u);if(_<1e-4&&m<1e-4&&p<1e-4)return;const y=s.transformations.find(b=>b.objectRef===n);y?(y.finalPosition={x:d.x,y:d.y,z:d.z},y.finalQuaternion={x:f.x,y:f.y,z:f.z,w:f.w},y.finalScale={x:g.x,y:g.y,z:g.z}):(Lr.has(n)||Lr.set(n,{position:{x:c.x,y:c.y,z:c.z},quaternion:{x:h.x,y:h.y,z:h.z,w:h.w},scale:{x:u.x,y:u.y,z:u.z}}),s.transformations.push({objectRef:n,initPosition:{x:c.x,y:c.y,z:c.z},finalPosition:{x:d.x,y:d.y,z:d.z},initQuaternion:{x:h.x,y:h.y,z:h.z,w:h.w},finalQuaternion:{x:f.x,y:f.y,z:f.z,w:f.w},initScale:{x:u.x,y:u.y,z:u.z},finalScale:{x:g.x,y:g.y,z:g.z}})),Fr(n),console.log(`[Assembly] Step ${s.id} "${s.name}": recorded transform of object "${n.name}" (group)`)}),ec=[],on())}function t_(){const s=jn?.object;if(!s||!jn)return;const e=me.steps[Be.currentStepIndex];if(!e)return;const t=jn.position,n=jn.rotation,i=jn.scale,r=new Ut().setFromEuler(n),o=new Ut().setFromEuler(s.rotation),a=s.position.distanceTo(t),l=r.angleTo(o),c=s.scale.distanceTo(i);if(a<1e-4&&l<1e-4&&c<1e-4)return;const h=e.transformations.find(u=>u.objectRef===s);h?(h.finalPosition={x:s.position.x,y:s.position.y,z:s.position.z},h.finalQuaternion={x:o.x,y:o.y,z:o.z,w:o.w},h.finalScale={x:s.scale.x,y:s.scale.y,z:s.scale.z}):(Lr.has(s)||Lr.set(s,{position:{x:t.x,y:t.y,z:t.z},quaternion:{x:r.x,y:r.y,z:r.z,w:r.w},scale:{x:i.x,y:i.y,z:i.z}}),e.transformations.push({objectRef:s,initPosition:{x:t.x,y:t.y,z:t.z},finalPosition:{x:s.position.x,y:s.position.y,z:s.position.z},initQuaternion:{x:r.x,y:r.y,z:r.z,w:r.w},finalQuaternion:{x:o.x,y:o.y,z:o.z,w:o.w},initScale:{x:i.x,y:i.y,z:i.z},finalScale:{x:s.scale.x,y:s.scale.y,z:s.scale.z}})),Fr(s),console.log(`[Assembly] Step ${e.id} "${e.name}": recorded transform of object "${s.name}"`),on()}function Fr(s){const e=Lr.get(s);let t=e?e.position:null,n=e?e.quaternion:null,i=e?e.scale:null;for(const r of me.steps){const o=r.transformations.find(a=>a.objectRef===s);o&&(t!==null&&(o.initPosition={...t},n&&(o.initQuaternion={...n}),i&&(o.initScale={...i})),t=o.finalPosition,n=o.finalQuaternion,i=o.finalScale)}}function Sl(){const s=new Set;me.steps.forEach(e=>{e.transformations.forEach(t=>s.add(t.objectRef))}),s.forEach(e=>Fr(e)),console.log("[Assembly] Chain repaired.")}function Js(s,e,t){gn&&(gn.kill(),gn=null),$i=null;const n=qe.animationDuration;function i(d,f,g){d.forEach((_,m)=>{const p=f[m];_.objectRef.position.lerpVectors(p.pos,p.targetPos,g),p.hasRot&&_.objectRef.quaternion.slerpQuaternions(p.quat,p.targetQuat,g),p.hasScale&&_.objectRef.scale.lerpVectors(p.scale,p.targetScale,g)})}const r=s.map(d=>{const f=e?d.finalPosition:d.initPosition,g=e?d.finalQuaternion:d.initQuaternion,_=e?d.finalScale:d.initScale,m=!!(d.initQuaternion&&d.finalQuaternion),p=!!(d.initScale&&d.finalScale);return{pos:d.objectRef.position.clone(),targetPos:new D(f.x,f.y,f.z),quat:d.objectRef.quaternion.clone(),targetQuat:m?new Ut(g.x,g.y,g.z,g.w):null,scale:d.objectRef.scale.clone(),targetScale:p?new D(_.x,_.y,_.z):null,hasRot:m,hasScale:p}});if($i=()=>{gn&&(gn.kill(),gn=null),i(s,r,1),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge(),$i=null},n<=0){i(s,r,1),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge(),$i=null,t&&t();return}const o=qe.animationOverwrite==="true"?!0:qe.animationOverwrite==="false"?!1:"auto",a=n/1e3,l=qe.animationDelay/1e3,c=qe.animationRepeatDelay/1e3,h=qe.animationStagger/1e3,u={duration:a,ease:qe.animationEase,repeat:qe.animationRepeat,repeatDelay:c,yoyo:qe.animationYoyo,overwrite:o};if(h<=0){const d={t:0};gn=Yl.to(d,{...u,t:1,delay:l,onUpdate(){i(s,r,d.t),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge()},onComplete(){gn=null,$i=null,t&&t()}})}else{const d=Yl.timeline({delay:l,onComplete(){gn=null,$i=null,t&&t()}});s.forEach((f,g)=>{const _={t:0},m=r[g];d.to(_,{...u,t:1,onUpdate(){f.objectRef.position.lerpVectors(m.pos,m.targetPos,_.t),m.hasRot&&f.objectRef.quaternion.slerpQuaternions(m.quat,m.targetQuat,_.t),m.hasScale&&f.objectRef.scale.lerpVectors(m.scale,m.targetScale,_.t),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge()}},g*h)}),gn=d}}function n_(){gn&&(gn.kill(),gn=null),me.steps.length!==0&&(me.steps.forEach(s=>{s.transformations.forEach(e=>{e.objectRef.position.set(e.finalPosition.x,e.finalPosition.y,e.finalPosition.z),e.finalQuaternion&&e.objectRef.quaternion.set(e.finalQuaternion.x,e.finalQuaternion.y,e.finalQuaternion.z,e.finalQuaternion.w),e.finalScale&&e.objectRef.scale.set(e.finalScale.x,e.finalScale.y,e.finalScale.z)})}),Be.currentStepIndex=me.steps.length-1,on(),ge(),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge())}function i_(){gn&&(gn.kill(),gn=null),[...me.steps].reverse().forEach(s=>{s.transformations.forEach(e=>{e.objectRef.position.set(e.initPosition.x,e.initPosition.y,e.initPosition.z),e.initQuaternion&&e.objectRef.quaternion.set(e.initQuaternion.x,e.initQuaternion.y,e.initQuaternion.z,e.initQuaternion.w),e.initScale&&e.objectRef.scale.set(e.initScale.x,e.initScale.y,e.initScale.z)})}),Be.currentStepIndex=-1,on(),ge(),Z.showCrossSection&&Z.autoUpdateSectionLines&&xn(),ge()}function kd(){const s=me.steps.length;if(s===0||Be.currentStepIndex>=s-1)return;function e(){const t=Be.currentStepIndex+1;if(t>=s){qe.animationLoop&&Bd();return}const n=me.steps[t];if(Be.currentStepIndex=t,on(),n.transformations.length===0){n.camera?er(n.camera,()=>e()):e();return}n.camera?er(n.camera,()=>{Js(n.transformations,!0,()=>e())}):Js(n.transformations,!0,()=>e())}e()}function Bd(){if(Be.currentStepIndex<0)return;function s(){if(Be.currentStepIndex<0){qe.animationLoop&&kd();return}const e=me.steps[Be.currentStepIndex],t=()=>{Be.currentStepIndex--,on(),s()};if(e.transformations.length===0){e.camera?er(e.camera,()=>t()):t();return}e.camera?er(e.camera,()=>{Js(e.transformations,!1,()=>t())}):Js(e.transformations,!1,()=>t())}s()}function zd(){Ss?.(),Ss=null,$i?.(),$i=null;const s=Be.currentStepIndex+1;if(s>=me.steps.length){console.log("[Assembly] No more steps – end of disassembly.");return}const e=me.steps[s];if(e.transformations.length===0){Be.currentStepIndex=s,on(),e.camera&&er(e.camera),console.log(`[Assembly] → Step ${s+1}: "${e.name}" (no moves)`);return}Be.currentStepIndex=s,on(),e.camera?er(e.camera,()=>{Js(e.transformations,!0,()=>{console.log(`[Assembly] → Step ${s+1}/${me.steps.length}: "${e.name}"`)})}):Js(e.transformations,!0,()=>{console.log(`[Assembly] → Step ${s+1}/${me.steps.length}: "${e.name}"`)})}function Hd(){if(Ss?.(),Ss=null,$i?.(),$i=null,Be.currentStepIndex<0){console.log("[Assembly] Already at the start.");return}const s=me.steps[Be.currentStepIndex];if(s.transformations.length===0){Be.currentStepIndex--,on(),s.camera&&er(s.camera);return}Be.currentStepIndex--,on();const e=()=>{const t=Be.currentStepIndex<0?"Assembled":`Step ${Be.currentStepIndex+1}: "${me.steps[Be.currentStepIndex].name}"`;console.log(`[Assembly] ← Back → ${t}`)};s.camera?er(s.camera,()=>{Js(s.transformations,!1,e)}):Js(s.transformations,!1,e)}function y1(){const s=Be.currentStepIndex;if(s<0||s>=me.steps.length){console.log("[Assembly] No step selected – select a step first.");return}const e=me.steps[s];e.camera={position:{x:Ve.position.x,y:Ve.position.y,z:Ve.position.z},target:{x:ln.target.x,y:ln.target.y,z:ln.target.z},zoom:Ve.zoom},on(),console.log(`[Assembly] Camera view saved to step "${e.name}".`)}function v1(){const s=Be.currentStepIndex;if(s<0||s>=me.steps.length)return;const e=me.steps[s];delete e.camera,on(),console.log(`[Assembly] Camera view cleared from step "${e.name}".`)}function er(s,e){if(!s){e?.();return}Hs&&(Hs.kill(),Hs=null),Ss=null;const t=qe.animationDuration,n=Ve.position.clone(),i=ln.target.clone(),r=new D(s.position.x,s.position.y,s.position.z),o=new D(s.target.x,s.target.y,s.target.z),a=Ve.zoom,l=s.zoom!=null?s.zoom:a,c=1e-6;if(n.distanceToSquared(r)<c&&i.distanceToSquared(o)<c&&Math.abs(a-l)<c){e?.();return}if(Ss=()=>{Hs&&(Hs.kill(),Hs=null),Ve.position.copy(r),ln.target.copy(o),Ve.zoom=l,Ve.updateProjectionMatrix(),ln.update(),ge(),Ss=null,e?.()},t<=0){Ve.position.copy(r),ln.target.copy(o),Ve.zoom=l,Ve.updateProjectionMatrix(),ln.update(),ge(),Ss=null,e?.();return}const h={t:0};Hs=Yl.to(h,{t:1,duration:t/1e3,ease:qe.animationEase,onUpdate(){Ve.position.lerpVectors(n,r,h.t),ln.target.lerpVectors(i,o,h.t),Ve.zoom=a+(l-a)*h.t,Ve.updateProjectionMatrix(),ln.update(),ge()},onComplete(){Hs=null,Ss=null,e?.()}})}function b1(){const s=me.steps.length+1;me.steps.push({id:s,name:`Step ${s}`,description:"",transformations:[]}),Be.currentStepIndex=me.steps.length-1,on(),console.log(`[Assembly] New step ${s} created.`)}function S1(){const s=Be.currentStepIndex;if(s<0||s>=me.steps.length){console.log("[Assembly] No step selected – select a step using the playback controls.");return}if(!Me){console.log("[Assembly] No object selected.");return}const e=me.steps[s],t=e.transformations.length;if(!e.transformations.some(r=>r.objectRef===Me)){console.log(`[Assembly] Object "${Me.name}" not found in step "${e.name}".`);return}if(!confirm(`Remove "${Me.name}" from step "${e.name}"?`))return;e.transformations=e.transformations.filter(r=>r.objectRef!==Me),t-e.transformations.length>0&&(Fr(Me),console.log(`[Assembly] Object "${Me.name}" removed from step "${e.name}".`)),on()}function M1(){const s=Be.currentStepIndex;if(s<0||s>=me.steps.length){console.log("[Assembly] No step to delete – select a step using the playback controls.");return}const e=me.steps[s];if(!confirm(`Delete step "${e.name}"?`))return;const t=e.transformations.map(n=>n.objectRef);e.transformations.forEach(n=>{n.objectRef.position.set(n.initPosition.x,n.initPosition.y,n.initPosition.z),n.initQuaternion&&n.objectRef.quaternion.set(n.initQuaternion.x,n.initQuaternion.y,n.initQuaternion.z,n.initQuaternion.w),n.initScale&&n.objectRef.scale.set(n.initScale.x,n.initScale.y,n.initScale.z)}),me.steps.splice(s,1),me.steps.forEach((n,i)=>{n.id=i+1}),Be.currentStepIndex>=me.steps.length&&(Be.currentStepIndex=me.steps.length-1),t.forEach(n=>Fr(n)),on(),ge(),console.log(`[Assembly] Step "${e.name}" deleted, objects reset to init positions.`)}function w1(){const s=Be.currentStepIndex;if(s<=0)return;[me.steps[s],me.steps[s-1]]=[me.steps[s-1],me.steps[s]],me.steps.forEach((t,n)=>{t.id=n+1}),Be.currentStepIndex=s-1,new Set([...me.steps[s-1].transformations.map(t=>t.objectRef),...me.steps[s].transformations.map(t=>t.objectRef)]).forEach(t=>Fr(t)),on(),console.log(`[Assembly] Step moved up → position ${Be.currentStepIndex+1}.`)}function E1(){const s=Be.currentStepIndex;if(s<0||s>=me.steps.length-1)return;[me.steps[s],me.steps[s+1]]=[me.steps[s+1],me.steps[s]],me.steps.forEach((t,n)=>{t.id=n+1}),Be.currentStepIndex=s+1,new Set([...me.steps[s].transformations.map(t=>t.objectRef),...me.steps[s+1].transformations.map(t=>t.objectRef)]).forEach(t=>Fr(t)),on(),console.log(`[Assembly] Step moved down → position ${Be.currentStepIndex+1}.`)}(function(){function e(){const g=document.createElement("div");return g.className="ctx-separator",g}function t(g,_){const m=document.createElement("div");return m.className="ctx-item",m.textContent=g,m.addEventListener("click",_),m}function n(){const g=document.createElement("div");g.className="ctx-menu hidden";const _=document.createElement("div");_.className="ctx-label",_.textContent="Scene",g.appendChild(_);const m=document.createElement("div");m.className="ctx-item";const p=document.createElement("input");p.type="checkbox",p.id="ctx-chk-select";const y=document.createElement("label");y.htmlFor="ctx-chk-select",y.textContent="Allow selection",y.style.cursor="pointer",m.appendChild(p),m.appendChild(y),m.addEventListener("click",M=>{M.stopPropagation(),Z.isSelectAllowed=!Z.isSelectAllowed,p.checked=Z.isSelectAllowed,l()}),g.appendChild(m),g.appendChild(e()),g.appendChild(t("Show hidden objects",()=>{$g(),l()})),g.appendChild(t("Switch hidden objects",()=>{qg(),l()})),g.appendChild(e());const b=document.createElement("div");b.className="ctx-item has-sub",b.innerHTML="View orientation";const v=document.createElement("div");return v.className="ctx-submenu",[["View from X",()=>bo(1e3,0,0)],["View from Y",()=>bo(0,1e3,0)],["View from Z",()=>bo(0,0,1e3)]].forEach(([M,E])=>{v.appendChild(t(M,()=>{E(),l()}))}),b.appendChild(v),g.appendChild(b),g}function i(){const g=document.createElement("div");g.className="ctx-menu hidden";const _=document.createElement("div");_.className="ctx-label",_.id="ctx-obj-label",_.textContent="Object",g.appendChild(_),g.appendChild(t("Hide object",()=>{Me&&Yg(Me),l()})),g.appendChild(e());const m=document.createElement("div");m.className="ctx-item has-sub",m.innerHTML="Location";const p=document.createElement("div");return p.className="ctx-submenu",p.appendChild(t("Reset init. location",()=>{Me&&Fd(Me),l()})),p.appendChild(t("Undo last transform",()=>{Me&&jn&&Bg(Me),l()})),p.appendChild(e()),[{id:"ctx-px",label:"Px",step:ct.pStep,get:()=>Me?.position.x,set:b=>{Me&&(Me.position.x=b,ge())}},{id:"ctx-py",label:"Py",step:ct.pStep,get:()=>Me?.position.y,set:b=>{Me&&(Me.position.y=b,ge())}},{id:"ctx-pz",label:"Pz",step:ct.pStep,get:()=>Me?.position.z,set:b=>{Me&&(Me.position.z=b,ge())}},{id:"ctx-rx",label:"Rx",step:ct.rStep,get:()=>Me?.rotation.x,set:b=>{Me&&(Me.rotation.x=b,ge())}},{id:"ctx-ry",label:"Ry",step:ct.rStep,get:()=>Me?.rotation.y,set:b=>{Me&&(Me.rotation.y=b,ge())}},{id:"ctx-rz",label:"Rz",step:ct.rStep,get:()=>Me?.rotation.z,set:b=>{Me&&(Me.rotation.z=b,ge())}},{id:"ctx-sc",label:"Scale",step:ct.sStep,get:()=>Me?.scale.x,set:b=>{Me&&(Me.scale.set(b,b,b),ge())}}].forEach(b=>{const v=document.createElement("div");v.className="ctx-input-row";const M=document.createElement("label");M.textContent=b.label;const E=document.createElement("input");E.type="number",E.id=b.id,E.step=b.step,E.addEventListener("click",A=>A.stopPropagation()),E.addEventListener("change",A=>b.set(parseFloat(A.target.value))),v.appendChild(M),v.appendChild(E),p.appendChild(v)}),m.appendChild(p),g.appendChild(m),g}let r=null;const o=n(),a=i();document.body.appendChild(o),document.body.appendChild(a);function l(){o.classList.add("hidden"),a.classList.add("hidden"),r=null}function c(g,_,m){l(),g.style.left=_+"px",g.style.top=m+"px",g.classList.remove("hidden"),r=g;const p=g.getBoundingClientRect();p.right>window.innerWidth&&(g.style.left=_-p.width+"px"),p.bottom>window.innerHeight&&(g.style.top=m-p.height+"px")}function h(g){document.getElementById("ctx-obj-label").textContent=g.name||"Object";const _={"ctx-px":g.position.x,"ctx-py":g.position.y,"ctx-pz":g.position.z,"ctx-rx":g.rotation.x,"ctx-ry":g.rotation.y,"ctx-rz":g.rotation.z,"ctx-sc":g.scale.x};for(const[m,p]of Object.entries(_)){const y=document.getElementById(m);y&&(y.value=parseFloat(p.toFixed(4)))}}function u(g,_){Me?(h(Me),c(a,g,_)):(document.getElementById("ctx-chk-select").checked=Z.isSelectAllowed,c(o,g,_))}window.addEventListener("contextmenu",function(g){if(Qg(g))return;g.preventDefault();const _=new Ne(g.clientX,g.clientY);Kl.distanceTo(_)<=3&&u(g.clientX,g.clientY)},!1);let d=null,f=new Ne;window.addEventListener("touchstart",function(g){if(g.touches.length!==1)return;const _=g.touches[0],m=document.elementFromPoint(_.clientX,_.clientY);Wo.domElement.contains(m)||(f.set(_.clientX,_.clientY),d=setTimeout(()=>{d=null,zu=!0,u(_.clientX,_.clientY)},500))},{passive:!0}),window.addEventListener("touchmove",function(g){if(!d)return;if(g.touches.length!==1){clearTimeout(d),d=null;return}const _=g.touches[0];f.distanceTo(new Ne(_.clientX,_.clientY))>10&&(clearTimeout(d),d=null)},{passive:!0}),window.addEventListener("touchend",function(){d&&(clearTimeout(d),d=null)},{passive:!0}),window.addEventListener("touchcancel",function(){d&&(clearTimeout(d),d=null)},{passive:!0}),window.addEventListener("mousedown",function(g){r&&!r.contains(g.target)&&l()},!0),window.addEventListener("keydown",function(g){g.key==="Escape"&&l()})})();
