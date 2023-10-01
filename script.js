let C=getID("canvas").getContext("2d",{antialias:0}),
hit_box_rand=getID("hit_box_rand"),
azusa_img=[],
pillar_img,
lapisLazuli_img;

소리.지정("sound/Azusa_Battle_Shout_2.ogg","아즈사");
소리.지정("sound/test.ogg","테스트");
소리.지정("sound/click.mp3","클릭");
소리.지정("sound/Azusa_Tactic_Defeat_1.ogg","패배1");
소리.지정("sound/Azusa_Tactic_Defeat_2.ogg","패배2");

let BGM=getID("BGM"),stop=getID("stop");

if(localStorage.getItem("cv")==null)localStorage.setItem('cv',.7)
volume=Number(localStorage.getItem("cv"))
cvolume_val(getID("CVR").value=volume*100|0)
function cvolume_val($){
  if(volume=Number($)/100){
    char_volume_.style.display='inline-block'
    char_mute.style.display='none'
    char_volume_.innerText=$
  }else{
    char_volume_.style.display='none'
    char_mute.style.display='inline-block'
  }
}

if(localStorage.getItem("BGM")==null)localStorage.setItem('BGM',.2)
BGM.volume=Number(localStorage.getItem("BGM"))
bgm_val(getID("BGMR").value=BGM.volume*100|0)
function bgm_val($){
  if(Number($)){
    BGM_volume_.style.display='inline-block'
    BGM_mute.style.display='none'
    BGM_volume_.innerText=$
  }else{
    BGM_volume_.style.display='none'
    BGM_mute.style.display='inline-block'
  }
}
BGM.play().catch(()=>{
  autoplay.checked=1
});

(async()=>{
  for(let i=0;i<6;++i)azusa_img[i]=await IMG(`img/${i}.webp`);
  pillar_img=[
    await IMG(`img/기둥.webp`),
    await IMG(`img/기둥1.webp`)
  ];
  lapisLazuli_img=await IMG('img/청휘석.webp')
  loding.style.display='none';
  let ENTITY_list=[]
  class ENTITY{
    ax=0
    ay=0
    constructor(img,x=0,y=0,w=img.width,h=img.height,ax=0,ay=0,hit_rect=0,f=()=>{}){
      this.x=x
      this.y=y
      this.w=w
      this.h=h
      this.img=img
      this.ax=ax
      this.ay=ay
      this.hit_rect=hit_rect
      this.f=f
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
      }
    }
    draw(hit_display=0){
      this.x+=this.ax
      this.y+=this.ay
      this.f(this)
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
    hit_entity(E){
      let r=[];
      E.map($=>{
        let ax=this.hit_rect[0]+this.x,ay=this.hit_rect[1]+this.y,
        bx=$.hit_rect[0]+$.x,by=$.hit_rect[1]+$.y;
        if(ax<=bx+$.hit_rect[2]
        &&ax+this.hit_rect[2]>=bx
        &&ay<=by+$.hit_rect[3]
        &&ay+this.hit_rect[3]>=by)r.push($)
      })
      return r;
    }
    del(){
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
  document.addEventListener("keydown",$=>{
    if((play.checked||stop.checked)&&!key["Escape"]&&$.key=="Escape"){
      stop.checked=!stop.checked;
      Qsel('#set+label').style.display=''
    }
    key[$.key]=1
  });
  document.addEventListener("keyup",$=>key[$.key]=0)
  getID("start").addEventListener("click",avoid_set);
  getID("re_start").addEventListener("click",avoid_set);
  getID("re_start2").addEventListener("click",avoid_set);
  function avoid_set(){
    BGM.src="sound/Guruguru Usagi.mp3"
    BGM.currentTime=0;BGM.play()
    play.checked=1
    page="avoid"
    azusa.ay=-2;
    azusa.y=250;
    azusa.x=250
    Halo.x=azusa.x+70
    Halo.y=azusa.y+10
    pillar.map($=>$.del());
    pillar=[]
    lapisLazuli.map($=>$.del());
    lapisLazuli=[]
    count=1
    score=0
  }
  
  document.addEventListener("pointerdown",$=>{
    소리.재생("클릭");
    console.log($.target==document.body);
    if(!game_over.checked&&$.target==document.body||$.target==C.canvas){
      img_i=1
      afps.fc=0
      azusa.ay=-10
      소리.재생("아즈사",volume)
    }
  })
  setInterval(()=>{
    if(!set.checked&&!stop.checked){
      Qsel("#set+label").style.display=""
      C.clearRect(0,0,1080,1080)
      games[page]()
      if(img_i&&afps.gap(4)){
        ++img_i
        if(img_i>5)img_i=0
      }
      if(key["ArrowUp"]||key[" "]){
        if(jump_cooldown&&!game_over.checked){
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
  },17)
  
  var score=0,blue_score=0,pillar=[],lapisLazuli=[],count=1,pillar_spawn_deley=new FRAME_DELAY,score_delay=new FRAME_DELAY,dl=0;
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
      if(pillar_spawn_deley.gap((200-dl)/2|0)){
        let yhight=랜덤(50,1060-350),lv=(score/50>12?12:score/50);
        dl=lv*8|0
        pillar_spawn_deley.reset()
        if(count&1){
          if(랜덤(0,10)||score<350){
            pillar.push(new ENTITY(pillar_img[1],1080,yhight-1080,200,1080,-3-lv,0,[2,0,190,1050]))
            pillar.push(new ENTITY(pillar_img[0],1080,yhight+400-lv*12,200,1080,-3-lv,0,[2,20,200,1060]))
          }else{
            let ay=랜덤(0,1)?2:-2
            pillar.push(new ENTITY(pillar_img[1],1080,yhight-1080,200,1080,-3-lv,ay,[2,0,190,1050],$=>{
              if($.y<-1030||$.y>-430)$.ay=-$.ay
            }))
            pillar.push(new ENTITY(pillar_img[0],1080,yhight+350,200,1080,-3-lv,ay,[2,20,200,1060],$=>{
              if($.y<400||$.y>1000)$.ay=-$.ay
            }))
          }
          
        }else lapisLazuli.push(new ENTITY(lapisLazuli_img,1080+100-30,랜덤(50,900),60,80,-3-lv,0,[0,0,60,80]))
        ++count;
      }
      let item=azusa.hit_entity(lapisLazuli);
      if(score_delay.gap(20))score_.innerText=(++score)+blue_score*5;
      if(item.length)score_.innerText=(score+=10)+(++blue_score)*5;
      item.map($=>{
        lapisLazuli.splice(lapisLazuli.indexOf($),1)
        $.del()
      })

      pillar=pillar.filter($=>{
        if($.x>-250)return $;
        else{
          $?.del()
        }
      });
      if(azusa.y>1090||azusa.y<-400||azusa.hit(pillar)){
        page="gameover"
        BGM.src="sound/Fade Out.ogg"
        BGM.currentTime=0;BGM.play()
        score_delay.reset()
        소리.재생("패배"+랜덤(1,2),volume)
        maxscore_show.innerText=''
      }
    },
    gameover:()=>{
      dl=0
      if(!score_delay.start_after(50))score_show.innerText=랜덤(100,999)+"점"
      else if(!score_delay.start_after(51)){
        score_show.innerText=score+blue_score*5+"점"
        if(Number(localStorage.getItem("score"))<score)localStorage.setItem("score",score+blue_score*5)
      }else if(score_delay.fc==90){
        if(Number(localStorage.getItem("score"))<=score)maxscore_show.innerText='최고점 달성!'
        else maxscore_show.innerText=`(최고점:${localStorage.getItem("score")})`
      }
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

document.addEventListener("visibilitychange", () => {
  if(document.hidden){
    BGM.pause();
    if(play.checked){Qsel('#set+label').style.display='';getID('stop').checked=1}
  }else if(BGM.currentTime){
    BGM.play();
  }
});

document.addEventListener("contextmenu",$=>$.preventDefault())