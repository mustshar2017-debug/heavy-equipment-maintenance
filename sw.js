const CACHE='wad-kenana-maintenance-v49';
const ASSETS=[
 './','./index.html','./styles.css','./app.js','./manifest.json',
 './data/equipment.json','./data/fault-codes.json','./data/parts.json',
 './data/maintenance-plans.json','./data/volvo-ec210b-reference.json',
 './data/volvo-data-plates.json','./data/volvo-model-catalog.json','./data/hyundai-model-catalog.json','./data/hyundai-hx220hd-warnings.json','./assets/warning-symbols/21073CD07.svg','./data/hyundai-hx220hd-maintenance-standard.json',
 './data/hydraulic-diagnostics.json','./data/hyundai-hx220hd-troubleshooting.json','./hyundai-troubleshooting.js','./data/volvo-sinocmp-2022.json'
];
self.addEventListener('install',event=>{
 event.waitUntil((async()=>{
  const cache=await caches.open(CACHE);
  await Promise.all(ASSETS.map(async asset=>{
   try{const response=await fetch(asset,{cache:'reload'});if(response.ok)await cache.put(asset,response);}
   catch(error){console.warn('Precache skipped:',asset,error);}
  }));
  await self.skipWaiting();
 })());
});
self.addEventListener('activate',event=>{
 event.waitUntil((async()=>{
  const keys=await caches.keys();
  await Promise.all(keys.filter(key=>key.startsWith('wad-kenana-maintenance-')&&key!==CACHE).map(key=>caches.delete(key)));
  await self.clients.claim();
 })());
});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET')return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  try{
   const response=await fetch(request);
   if(response&&response.ok)await cache.put(request,response.clone());
   return response;
  }catch(error){
   const cached=await cache.match(request);
   if(cached)return cached;
   if(request.mode==='navigate'){
    const shell=await cache.match('./index.html');
    if(shell)return shell;
   }
   return new Response('المورد غير متاح حالياً. اتصل بالإنترنت مرة واحدة لتحديث الملفات ثم أعد المحاولة.',{
    status:503,headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'no-store'}
   });
  }
 })());
});