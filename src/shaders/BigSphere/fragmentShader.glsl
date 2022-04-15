varying vec3 vPosition;
varying vec2 vUv;
uniform float time;
// Noise
float mod289(float x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 perm(vec4 x){return mod289(((x*34.)+1.)*x);}

float noise(vec3 p){
    vec3 a=floor(p);
    vec3 d=p-a;
    d=d*d*(3.-2.*d);
    
    vec4 b=a.xxyy+vec4(0.,1.,0.,1.);
    vec4 k1=perm(b.xyxy);
    vec4 k2=perm(k1.xyxy+b.zzww);
    
    vec4 c=k2+a.zzzz;
    vec4 k3=perm(c);
    vec4 k4=perm(c+1.);
    
    vec4 o1=fract(k3*(1./41.));
    vec4 o2=fract(k4*(1./41.));
    
    vec4 o3=o2*d.z+o1*(1.-d.z);
    vec2 o4=o3.yw*d.x+o3.xz*(1.-d.x);
    
    return o4.y*d.y+o4.x*(1.-d.y);
}

float line(vec2 uv,float offset){
    return smoothstep(0.,.5+offset*.5,
        abs(.5*sin(uv.x*50.)+offset*2.)
    );
}

mat2 rotate2D(float angle){
    return mat2(
        cos(angle),-sin(angle),
        sin(angle),cos(angle)
    );
}

void main(){
    // colors
    vec3 baseFirst=vec3(120./255.,158./255.,113./255.);
    vec3 accent=vec3(0.,0.,0.);
    vec3 baseSecond=vec3(224./255.,148./255.,66./255.);
    vec3 baseThird=vec3(232./255.,201./255.,73./255.);
    
    float n=noise(vPosition+time);
    vec2 baseUV=rotate2D(n)*vPosition.xy*.1;
    float basePattern=line(baseUV,.2);
    float secondPattern=line(baseUV,.1);
    
    vec3 baseColor=mix(baseSecond,baseFirst,basePattern);
    vec3 secondColor=mix(baseColor,accent,secondPattern);
    
    gl_FragColor=vec4(vec3(secondColor),1.);
}