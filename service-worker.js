const NAME='b_v1.0',
FILE=[
  'index.html',
  'style.css',
  'script.js',
  'snolr.js',
  'azusa.ico',
  '512.webp',
  '192.webp',
  'manifest.json',
  'font/Title.woff',
  'img/0.webp',
  'img/1.webp',
  'img/2.webp',
  'img/3.webp',
  'img/4.webp',
  'img/5.webp',
  'img/기둥.webp',
  'img/기둥1.webp',
  'img/헤일로.webp',
  'img/음소거.mp4',
  'sound/Azusa_Battle_Shout_2.ogg',
  'sound/Azusa_Tactic_Defeat_1.ogg',
  'sound/Azusa_Tactic_Defeat_2.ogg',
  'sound/Fade Out.ogg',
  'sound/Hifumi Daisuki.ogg',
  'sound/test.ogg',
  'sound/click.mp3',
  'sound/Guruguru Usagi.mp3',
  '보충수업부.webp',
  'bg.webp',
  'title.webp',
];
self.addEventListener('install',$=>{
  self.skipWaiting();
  $.waitUntil(caches.open(NAME).then(cache=>cache.addAll(FILE)))
});
self.addEventListener('activate',$=>
  $.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.map($=>{
        if($!==NAME)return caches.delete($)
      }))
    )
  )
);
self.addEventListener('fetch',e=>
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request)
    }),
  )
);