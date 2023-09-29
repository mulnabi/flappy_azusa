let C=getID("canvas").getContext("2d"),
hit_box_rand=getID("hit_box_rand"),
azusa_img=[],
obstacle_img;

소리.지정("sound/Azusa_Battle_Shout_2.ogg","아즈사");
소리.지정("sound/test.ogg","테스트");
소리.지정("sound/click.mp3","클릭");
소리.지정("sound/Azusa_Tactic_Defeat_1.ogg","패배1");
소리.지정("sound/Azusa_Tactic_Defeat_2.ogg","패배2");


(async()=>{
  let BGM=getID("BGM");
  BGM.volume=0.2
  BGM.play().catch(()=>{
    autoplay.checked=1
  })

  for(let i=0;i<6;++i)azusa_img[i]=await IMG(`img/${i}.webp`);
  pillar_img=[
    await IMG(`img/기둥.webp`),
    await IMG(`img/기둥1.webp`)
  ]
  
  let ENTITY_list=[]
  class ENTITY{
    ax=0
    ay=0
    constructor(img,x=0,y=0,w=img.width,h=img.height,ax=0,ay=0,hit_rect=0){
      this.x=x
      this.y=y
      this.w=w
      this.h=h
      this.img=img
      this.ax=ax
      this.ay=ay
      this.hit_rect=hit_rect
      ENTITY_list.push(this)
      if(!hit_rect){
        let c=document.createElement('canvas').getContext("2d",{antialias:0});
        c.canvas.width=w;c.canvas.height=h;
        c.drawImage(img,0,0,w,h);
        let d=c.getImageData(0,0,w,h).data,hx=w,hy=h,hw=0,hh=0;
        for(let y=0;y<h;++y)
          for(let x=0;x<w*4;x+=4)
            if(d[x+y*w*4+3]){
              hx=hx>x?x:hx
              hy=hy>y?y:hy
              hw=hw<x?x:hw
              hh=hh<y?y:hh
            }
        this.hit_rect=[hx/4,hy,(hw-hx)/4,hh-hy]
        console.log(this.hit_rect);
      }
    }
    draw(hit_display=0){
      this.x+=this.ax
      this.y+=this.ay
      C.drawImage(this.img,this.x,this.y,this.w,this.h)
      if(hit_display)C.strokeRect(this.hit_rect[0]+this.x,this.hit_rect[1]+this.y,this.hit_rect[2],this.hit_rect[3]);
    }
    hit(E){
      if(Array.isArray(E)){
        let r=0;
        E.map($=>{
          let ax=this.hit_rect[0]+this.x,ay=this.hit_rect[1]+this.y,
          bx=$.hit_rect[0]+$.x,by=$.hit_rect[1]+$.y;
          r||=ax<=bx+$.hit_rect[2]
          &&ax+this.hit_rect[2]>=bx
          &&ay<=by+$.hit_rect[3]
          &&ay+this.hit_rect[3]>=by
        })
        return r;
      }else{
        let ax=this.hit_rect[0]+this.x,ay=this.hit_rect[1]+this.y
        bx=E.hit_rect[0]+E.x,E.hit_rect[1]+E.y
        return ax<=bx+E.hit_rect[2]&&ax+this.hit_rect[2]>=bx&&ay<=by+E.hit_rect[3]&&ay+this.hit_rect[3]>=by
      }
    }
    del(){
      console.log("dd");
      ENTITY_list.splice(ENTITY_list.indexOf(this),1)
    }
  }
  let DF_list=[];
  class FRAME_DELAY{
    fc=0;
    st_fc=0;
    constructor(){
      DF_list.push(this)
    }
    gap(t){
      return!(this.fc%t)&&this.fc
    }
    start_after(t){
      if(this.st_fc)this.st_fc=this.fc;
      else if(this.fc-this.st_fc>t)return 1;
      return 0;
    }
    reset(){
      this.fc=0
      this.st_fc=0
    }
  }
  let key={},jump_cooldown=1,
  Halo=new ENTITY(await IMG("img/헤일로.webp"),50,0,90,90),
  azusa=new ENTITY(azusa_img[0],50,0,250,250),afps=new FRAME_DELAY,
  img_i=0;
  document.addEventListener("keydown",$=>key[$.key]=1);
  document.addEventListener("keyup",$=>key[$.key]=0)
  getID("start").addEventListener("click",avoid_set);
  getID("re_start").addEventListener("click",avoid_set);
  function avoid_set(){
    console.log(4);
    BGM.src="sound/Guruguru Usagi.mp3"
    BGM.currentTime=0;BGM.play()
    page="avoid"
    azusa.ay=-2;
    azusa.y=250;
    azusa.x=250
    Halo.x=azusa.x+70
    Halo.y=azusa.y+10
    pillar.map($=>$.del());
    pillar=[]
    score=0
  }
  
  document.addEventListener("pointerdown",$=>{
    소리.재생("클릭")
  })
  C.canvas.addEventListener("pointerdown",$=>{
    if(!game_over.checked){
      img_i=1
      afps.fc=0
      azusa.ay=-10
      소리.재생("아즈사",volume)
    }
    
  })
  window.requestAnimationFrame(loop)
  function loop(){
    if(!set.checked){
      Qsel("#set+label").style.display=""
      C.clearRect(0,0,1080,1080)
      games[page]()
      if(img_i&&afps.gap(4)){
        ++img_i
        if(img_i>5)img_i=0
      }
      if(key["ArrowUp"]||key[" "]){
        if(jump_cooldown&&!game_over.checked){
          console.log("jump")
          img_i=1
          afps.fc=0
          azusa.ay=-10
          소리.재생("아즈사",volume)
        }jump_cooldown=0
      }else jump_cooldown=1
      azusa.img=azusa_img[img_i]
      azusa.ay+=.5
      Halo.ax=(azusa.x+70-Halo.x)/2
      Halo.ay=(azusa.y+10-Halo.y)/2
      //기본 설정
      ENTITY_list.map($=>$.draw(hit_box_rand.checked));
      DF_list.map($=>++$.fc)
    }
    window.requestAnimationFrame(loop)
  }
  
  var score=0,pillar=[],pillar_spawn_deley=new FRAME_DELAY,score_delay=new FRAME_DELAY,dl=0;
  games={
    home:()=>{
      home.checked=1
      if(azusa.y>1090){
        azusa.ay=0;
        azusa.y=-azusa.h;
        azusa.x=랜덤(0,1080-azusa.w)
        Halo.x=azusa.x+70
        Halo.y=azusa.y+10
      }
    },
    avoid:()=>{
      Qsel("#set+label").style.display="none"
      play.checked=1
      if(pillar_spawn_deley.gap(200-dl)){
        let yhight=랜덤(100,1070-400),lv=(score/50>5?5:score/50);
        pillar.push(new ENTITY(pillar_img[1],1080,yhight-1080,200,1080,-3-lv,0,[2,0,190,1050]))
        pillar.push(new ENTITY(pillar_img[0],1080,yhight+300,200,1080,-3-lv,0,[2,20,200,1060]))

      }
      if(pillar_spawn_deley.gap(50))score_.innerText=(++score);
      pillar=pillar.filter($=>{
        if($.x>-100){
          return $;
        }else{
          console.log($);
          $?.del()
        }
      });
      if(azusa.y>1090||azusa.y<-400||azusa.hit(pillar)){
        page="gameover"
        BGM.src="sound/Fade Out.ogg"
        BGM.currentTime=0;BGM.play()
        score_delay.reset()
        소리.재생("패배"+랜덤(1,2),volume)
      }
    },
    gameover:()=>{
      if(!score_delay.start_after(50))score_show.innerText=랜덤(100,999)+"점"
      else score_show.innerText=score+"점"
      game_over.checked=1
    }
  };
})()
async function IMG(src){
  let img=new Image;
  img.src=src;
  await img.decode()
  console.log(img)
  return img
}

document.addEventListener("contextmenu",$=>$.preventDefault())