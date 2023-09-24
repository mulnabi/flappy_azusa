const delay=_=>new Promise($=>setTimeout($,_)),
cookie={get:_=>RegExp(Key+'=').test(document.cookie)?JSON.parse(RegExp(`${Key}=(\\S+)(?:;)`).exec(document.cookie+';')[1]):undefined,set:(Key,Val,Day)=>{var expire=new Date();document.cookie=`${Key}=${JSON.stringify(Val)};path=/;expires=${expire.toUTCString(expire.setDate(expire.getDate()+Day))};`}},
랜덤=(mini,max)=>Math.floor(Math.random()*(max-mini+1)+mini),
설치=(name,txt)=>{var $=document.createElement('a');$.href=window.URL.createObjectURL(new Blob([txt],{type:'application/nabi'}));$.download=name;$.click()}
소리={
  목록:{},
  지정(src,N){this.목록[N]=new Audio(src);},
  재생(N,volume=0.7){
    this.목록[N].currentTime=0;
    this.목록[N].volume=volume
    this.목록[N].play();
  }
},getID=_=>document.getElementById(_),Qsel=_=>document.querySelector(_),
b64="_0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz$",
B64={
  txt(n){
    let a=b64[n&63];
    if(n>64)return this.txt(n>>64|0)+a;
    return a
  },
  num(t){
    let r=0,U=1;
    for(let i=t.length-1;i+1;U*=64,--i)r+=b64.indexOf(t[i])*U
    return r;
  }
};

Object.defineProperty(Element.prototype,'CSS',{
  get(){return this.style.cssText},
  set($){
    for(const i in $)this.style[i]=$[i];
  }
})

delete eval;
delete Function;