let C=document.getElementById("canvas").getContext("2d"),
azusa_img=[],
page="home";
소리.지정("sound/Azusa_Battle_Shout_2.ogg","아즈사");
소리.지정("sound/test.ogg","테스트");
소리.지정("sound/click.mp3","클릭");
(async()=>{
  for(let i=0;i<6;++i)azusa_img[i]=await IMG(`img/${i}.png`);
  
  let ENTITY_list=[]
  class ENTITY{
    ax=0
    ay=0
    constructor(img,x=0,y=0,w=img.width,h=img.height,hit_rect=0){
      this.x=x
      this.y=y
      this.w=w
      this.h=h
      this.img=img
      this.hit_rect=hit_rect
      ENTITY_list.push(this)
      let c=document.createElement('canvas').getContext("2d",{antialias:0});
      c.canvas.width=w;c.canvas.height=h;
      c.drawImage(img,0,0,w,h);
      let d=c.getImageData(0,0,w,h).data,hx=w,hy=h,hw=0,hh=0;
      for(let y=0;y<h;++y)
        for(let x=0;x<w*4;x+=4)
          if(!d[x+y*w+3]){
            hx=hx>x?x:hx
            hy=hy>y?y:hy
            hw=hw<x?x:hw
            hh=hh<y?y:hh
          }
    }
    draw(hit_display=0){
      this.x+=this.ax
      this.y+=this.ay
      C.drawImage(this.img,this.x,this.y,this.w,this.h)
      if(hit_display)C.strokeRect(this.hit[0]+this.x,this.hit[1]+this.x,this.hit[2],this.hit[3])
    }
    hit(E){
      if(Array.isArray(E)){
        let r=0;
        E.map($=>{
          r||=this.x-this.w/2<=E.x+E.w/2&&this.x+this.w/2>=E.x-E.w/2&&this.y<=E.y+E.h&&this.y+this.h>=E.y
        })
        return r;
      }else return this.x-this.w/2<=E.x+E.w/2&&this.x+this.w/2>=E.x-E.w/2&&this.y<=E.y+E.h&&this.y+this.h>=E.y
    }
  }
  let key={},jump_cooldown=1,
  Halo=new ENTITY(await IMG("img/헤일로.webp"),50,0,90,90),
  azusa=new ENTITY(azusa_img[0],50,0,250,250),
  img_i=0,fc=0;
  document.addEventListener("keydown",$=>key[$.key]=1);
  document.addEventListener("keyup",$=>key[$.key]=0)
  getID("start").addEventListener("click",$=>{
    getID("home").style.display="none"
    page="play"
    azusa.ay=0;
    azusa.y=250;
    azusa.x=250
    Halo.x=azusa.x+70
    Halo.y=azusa.y+10
  })
  
  document.addEventListener("pointerdown",$=>{
    소리.재생("클릭")
  })
  C.canvas.addEventListener("pointerdown",$=>{
    console.log("jump")
    img_i=1
    fc=0
    azusa.ay=-10
    소리.재생("아즈사",volume)
  })

  games={
    home:()=>{
      home.style.display="block"
      if(azusa.y>1090){
        azusa.ay=0;
        azusa.y=-azusa.h;
        azusa.x=랜덤(0,1080-azusa.w)
        Halo.x=azusa.x+70
        Halo.y=azusa.y+10
      }
    },
    play:()=>{
      
      
      
    }
  }
  window.requestAnimationFrame(loop)
  function loop(){
    C.clearRect(0,0,1080,1080)
    games[page]()
    if(img_i&&frame_delay(4)){
      ++img_i
      if(img_i>5)img_i=0
    }
    if(key["ArrowUp"]||key[" "]){
      if(jump_cooldown){
        console.log("jump")
        img_i=1
        fc=0
        azusa.ay=-10
        소리.재생("아즈사",volume)
      }jump_cooldown=0
    }else jump_cooldown=1
    azusa.img=azusa_img[img_i]
    azusa.ay+=.5
    Halo.ax=(azusa.x+70-Halo.x)/2
    Halo.ay=(azusa.y+10-Halo.y)/2
    ENTITY_list.map($=>$.draw(1));
    ++fc;
    window.requestAnimationFrame(loop)
  }
  function frame_delay(n){
    return!(fc%n)
  }
})()
async function IMG(src){
  let img=new Image;
  img.src=src;
  await img.decode()
  console.log(img)
  return img
}

document.addEventListener("contextmenu",$=>$.preventDefault())