(() => {
'use strict';
const SUPABASE_URL='https://nmrardkogpcojtmbpvnu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY='sb_publishable_xsYXiO6wqk2jTWXI_wfcrQ_sFqVOTHt';
const RECORDS_KEY='wadKenanaMaintenanceRecordsV1';
const client=window.supabase?.createClient?.(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
if(!client){console.error('Supabase client library failed to load');return;}
const style=document.createElement('style');
style.textContent=`
#authGate{position:fixed;inset:0;z-index:99999;background:radial-gradient(ellipse at 80% -10%,#342b19 0,transparent 38%),#101114;color:#f4f1e9;display:grid;place-items:center;padding:20px;font-family:Cairo,system-ui,sans-serif}
#authGate[hidden]{display:none!important}
#authGate .auth-card{width:min(100%,440px);background:#191b20;border:1px solid #8f733d;border-radius:20px;padding:24px;box-shadow:0 20px 70px #0008}
#authGate h1{font-size:23px;margin:0 0 5px;color:#f0d48c}
#authGate p{color:#aaa7a0;font-size:13px;line-height:1.8}
#authGate label{display:block;font-size:12px;margin:12px 0 5px}
#authGate input{width:100%;padding:12px;border:1px solid #41434a;border-radius:9px;background:#111317;color:#f4f1e9;font:inherit}
#authGate button{width:100%;padding:11px;border-radius:9px;border:1px solid #d6b15e;background:#d6b15e;color:#171717;font:inherit;font-weight:700;margin-top:10px}
#authGate button.secondary{background:transparent;color:#f0d48c}
#authGate .auth-msg{min-height:24px;color:#f0d48c;font-size:12px;margin-top:10px}
#authGate .auth-logo{width:72px;height:72px;object-fit:cover;border-radius:50%;border:1px solid #d6b15e;margin-bottom:12px}
#authLogout{margin-inline-start:8px}
`;
document.head.append(style);
const gate=document.createElement('section');gate.id='authGate';gate.hidden=true;gate.innerHTML=`
<div class="auth-card" dir="rtl">
<img class="auth-logo" src="./assets/brand-logo.jpg" alt="شعار المستشار ود كنانة">
<h1>المستشار ود كنانة</h1><p>صيانة المعدات الثقيلة — سجّل الدخول للمتابعة</p>
<label for="authEmail">البريد الإلكتروني</label><input id="authEmail" type="email" autocomplete="email" placeholder="name@example.com">
<label for="authPassword">كلمة المرور</label><input id="authPassword" type="password" autocomplete="current-password" placeholder="كلمة المرور">
<button id="authLogin">تسجيل الدخول</button>
<button id="authSignup" class="secondary">إنشاء حساب جديد</button>
<button id="authGoogle" class="secondary">المتابعة باستخدام Google</button>
<button id="authReset" class="secondary">استعادة كلمة المرور</button>
<div id="authMessage" class="auth-msg" role="status" aria-live="polite"></div>
</div>`;
document.body.append(gate);
const msg=text=>{gate.querySelector('#authMessage').textContent=text||''};
const email=()=>gate.querySelector('#authEmail').value.trim();
const password=()=>gate.querySelector('#authPassword').value;
const show=()=>{gate.hidden=false;document.body.style.overflow='hidden'};
const hide=()=>{gate.hidden=true;document.body.style.overflow=''};
async function syncRecords(user){
 if(!navigator.onLine||!user)return;
 let local=[];try{local=JSON.parse(localStorage.getItem(RECORDS_KEY)||'[]')}catch{}
 if(!Array.isArray(local))local=[];
 const rows=local.map(r=>({user_id:user.id,local_id:String(r.id),record:r,updated_at:new Date().toISOString()}));
 if(rows.length){const {error}=await client.from('maintenance_records').upsert(rows,{onConflict:'user_id,local_id'});if(error){console.warn('Maintenance sync upload failed',error);return;}}
 const {data,error}=await client.from('maintenance_records').select('local_id,record').eq('user_id',user.id);
 if(error){console.warn('Maintenance sync download failed',error);return;}
 const merged=new Map(local.map(r=>[String(r.id),r]));
 (data||[]).forEach(row=>{if(row.record&&!merged.has(String(row.local_id)))merged.set(String(row.local_id),row.record)});
 try{localStorage.setItem(RECORDS_KEY,JSON.stringify([...merged.values()]));window.dispatchEvent(new CustomEvent('wadkenana:records-synced'))}catch(e){console.warn('Could not update local maintenance records',e)}
}
function addLogout(){
 if(document.getElementById('authLogout'))return;
 const header=document.querySelector('.topbar');if(!header)return;
 const button=document.createElement('button');button.id='authLogout';button.className='outline';button.type='button';button.textContent='تسجيل الخروج';
 button.addEventListener('click',async()=>{const {error}=await client.auth.signOut();if(error)alert('تعذر تسجيل الخروج: '+error.message)});
 header.append(button);
}
async function applySession(session){
 if(session?.user){hide();addLogout();syncRecords(session.user);return;}
 const old=document.getElementById('authLogout');if(old)old.remove();show();
}
gate.querySelector('#authLogin').addEventListener('click',async()=>{
 const e=email(),p=password();if(!e||!p){msg('أدخل البريد الإلكتروني وكلمة المرور.');return;}
 msg('جارٍ تسجيل الدخول…');const {data,error}=await client.auth.signInWithPassword({email:e,password:p});
 if(error){msg('تعذر تسجيل الدخول: '+error.message);return;}await applySession(data.session);
});
gate.querySelector('#authSignup').addEventListener('click',async()=>{
 const e=email(),p=password();if(!e||p.length<8){msg('أدخل بريداً صحيحاً وكلمة مرور من 8 أحرف على الأقل.');return;}
 msg('جارٍ إنشاء الحساب…');const {data,error}=await client.auth.signUp({email:e,password:p,options:{emailRedirectTo:window.location.href}});
 if(error){msg('تعذر إنشاء الحساب: '+error.message);return;}
 if(data.session)await applySession(data.session);else msg('تم إنشاء الحساب. راجع بريدك الإلكتروني لتأكيده ثم سجّل الدخول.');
});
gate.querySelector('#authReset').addEventListener('click',async()=>{
 const e=email();if(!e){msg('أدخل بريدك الإلكتروني أولاً.');return;}
 msg('جارٍ إرسال رابط الاستعادة…');const {error}=await client.auth.resetPasswordForEmail(e,{redirectTo:window.location.href});
 msg(error?'تعذر إرسال الرابط: '+error.message:'إذا كان البريد مسجلاً، سيصلك رابط استعادة كلمة المرور.');
});
gate.querySelector('#authGoogle').addEventListener('click',async()=>{
 msg('جارٍ فتح تسجيل الدخول بواسطة Google…');
 const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.href}});
 if(error)msg('تعذر بدء تسجيل Google: '+error.message);
});
client.auth.onAuthStateChange((_event,session)=>{applySession(session)});
(async()=>{show();const {data,error}=await client.auth.getSession();if(error){msg('تعذر التحقق من الجلسة. تحقق من الاتصال ثم أعد المحاولة.');return;}await applySession(data.session)})();
const originalSetItem=Storage.prototype.setItem;
Storage.prototype.setItem=function(key,value){originalSetItem.call(this,key,value);if(key===RECORDS_KEY){client.auth.getSession().then(({data})=>{if(data.session)syncRecords(data.session.user)}).catch(()=>{})}};
window.WadKenanaAuth={client,syncRecords};
})();