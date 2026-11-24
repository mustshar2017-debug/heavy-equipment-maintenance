(()=>{'use strict';
const root=document.getElementById('hyundaiTroubleshootingList');
if(!root)return;
let data=null,lang=()=>document.documentElement.lang==='en'?'en':'ar';
const $=id=>document.getElementById(id);
const escText=(v)=>String(v??'');
function render(){
 if(!data)return;
 const ar=lang()==='ar',q=($('hyundaiTroubleshootingSearch').value||'').trim().toLowerCase();
 const group=$('hyundaiTroubleshootingGroup').value;
 root.replaceChildren();
 const notice=document.createElement('p');notice.className='hint';notice.textContent=ar?data.noticeAr:data.noticeEn;root.append(notice);
 const rows=data.procedures.filter(p=>(group==='all'||p.group===group)&&[p.nameAr,p.nameEn,p.symptomAr,p.symptomEn,p.page,...(p.checksAr||[]),...(p.checksEn||[]),...(p.causesAr||[]),...(p.causesEn||[])].join(' ').toLowerCase().includes(q));
 if(!rows.length){const p=document.createElement('p');p.className='hint';p.textContent=ar?'لا توجد إجراءات مطابقة في الدليل.':'No matching procedures in the manual.';root.append(p);return}
 rows.forEach(p=>{
  const card=document.createElement('article');card.className='record';
  const title=document.createElement('strong');title.textContent=ar?p.nameAr:p.nameEn;
  const meta=document.createElement('p');meta.className='hint';meta.textContent=(ar?'المجموعة: ':'Group: ')+(p.group==='electrical'?(ar?'النظام الكهربائي':'Electrical system'):(ar?'الميكاترونكس':'Mechatronics'))+' · '+(ar?'صفحة الدليل: ':'Manual page: ')+p.page;
  const symptom=document.createElement('p');symptom.textContent=(ar?'العرض: ':'Symptom: ')+(ar?p.symptomAr:p.symptomEn);
  card.append(title,meta,symptom);
  const addList=(label,items)=>{if(!items?.length)return;const h=document.createElement('strong');h.textContent=label;const ul=document.createElement('ul');items.forEach(v=>{const li=document.createElement('li');li.textContent=v;ul.append(li)});card.append(h,ul)};
  addList(ar?'الفحوصات الواردة في الدليل':'Checks listed in the manual',ar?p.checksAr:p.checksEn);
  addList(ar?'الأسباب المحتملة في مخطط الدليل':'Possible causes in the manual flowchart',ar?p.causesAr:p.causesEn);
  addList(ar?'الإجراء المذكور':'Remedy listed',ar?p.remedyAr:p.remedyEn);
  const caution=document.createElement('p');caution.className='hint';caution.textContent=ar?'تنبيه فني: نفّذ القياسات الكهربائية بعد إطفاء مفتاح التشغيل وفصل الموصلات حسب تعليمات الدليل. قياسات الجهد تُجرى فقط عندما يحدد الدليل ذلك. لا تستبدل وحدة تحكم اعتماداً على اللمبة وحدها.':'Technician note: switch OFF before disconnecting connectors and follow the manual. Measure voltage only when the procedure calls for it. Do not replace a controller based on a warning lamp alone.';
  card.append(caution);root.append(card);
 });
}
$('hyundaiTroubleshootingSearch').addEventListener('input',render);
$('hyundaiTroubleshootingGroup').addEventListener('change',render);
document.getElementById('languageBtn')?.addEventListener('click',()=>setTimeout(render,0));
fetch('./data/hyundai-hx220hd-troubleshooting.json').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{if(!Array.isArray(d.procedures))throw Error('Invalid troubleshooting data');data=d;render()}).catch(e=>{root.textContent=lang()==='ar'?'تعذر تحميل دليل التشخيص.':'Could not load troubleshooting guide.';console.error(e)});
})();