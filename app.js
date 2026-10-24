// Ứng dụng học từ vựng N3. Dữ liệu Mimikara nằm ở data/mimikara.js
const RAW=window.MIMIKARA;
let W;const MIMI=RAW.w.map(a=>({s:a[0],c:RAW.cats[a[1]],g:a[2],id:a[3],k:a[4],h:a[5]||a[4],v:a[6],m:a[7],n:a[8]}));
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let KEY='n3vocab_v1',P={};const ld=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}};

const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(P))}catch(e){}};
const dayNum=()=>Math.floor((Date.now()-new Date().getTimezoneOffset()*6e4)/864e5);
const INT=[0,1,3,7,14,30],REV=new Set([6,12,18,24,30,36]);
const hasK=s=>/[\u4e00-\u9fff]/.test(s);
let maxS=40;
const t0=new Date();t0.setHours(0,0,0,0);
const todayNo=Math.round((t0-new Date(2026,9,22))/864e5)+1;
const examDays=Math.round((new Date(2026,11,6)-t0)/864e5);
// ---- romaji -> kana
const T={},V='aiueo';
const add=(c,a)=>a.forEach((k,i)=>{if(k)T[c+V[i]]=k});
add('',[...'あいうえお']);
[['k','かきくけこ'],['s','さしすせそ'],['t','たちつてと'],['n','なにぬねの'],['h','はひふへほ'],['m','まみむめも'],['r','らりるれろ'],['g','がぎぐげご'],['z','ざじずぜぞ'],['d','だぢづでど'],['b','ばびぶべぼ'],['p','ぱぴぷぺぽ'],['l','ぁぃぅぇぉ'],['x','ぁぃぅぇぉ']].forEach(([c,s])=>add(c,[...s]));
add('y',['や',0,'ゆ',0,'よ']);add('w',['わ',0,0,0,'を']);
[['ky','き'],['gy','ぎ'],['ny','に'],['hy','ひ'],['by','び'],['py','ぴ'],['my','み'],['ry','り'],['sy','し'],['ty','ち'],['zy','じ'],['jy','じ'],['dy','ぢ'],['sh','し'],['ch','ち'],['j','じ']].forEach(([c,b])=>{T[c+'a']=b+'ゃ';T[c+'u']=b+'ゅ';T[c+'o']=b+'ょ';T[c+'e']=b+'ぇ'});
Object.assign(T,{shi:'し',chi:'ち',tsu:'つ',ji:'じ',fu:'ふ',fa:'ふぁ',fi:'ふぃ',fe:'ふぇ',fo:'ふぉ',xya:'ゃ',xyu:'ゅ',xyo:'ょ',lya:'ゃ',lyu:'ゅ',lyo:'ょ',xtu:'っ',ltu:'っ',xtsu:'っ',ltsu:'っ'});
const KEYS=Object.keys(T);
function toKana(s,fin){
 s=s.normalize('NFKC').toLowerCase();let o='',i=0;
 while(i<s.length){
  const ch=s[i],nx=s[i+1];
  if(ch==='-'){o+='ー';i++;continue}
  if(!/[a-z']/.test(ch)){o+=ch;i++;continue}
  if(ch==="'"){i++;continue}
  if(nx&&ch===nx&&/[bcdfghjkmpqrstvwxyz]/.test(ch)){o+='っ';i++;continue}
  if(ch==='n'){
   if(nx===undefined){o+=fin?'ん':'n';i++;continue}
   if(nx==='n'||nx==="'"){o+='ん';i+=2;continue}
   if(!/[aiueoy]/.test(nx)){o+='ん';i++;continue}
  }
  let m=0;
  for(let L=4;L>=1;L--){const k=s.substr(i,L);if(T[k]){o+=T[k];i+=L;m=1;break}}
  if(m)continue;
  const r=s.slice(i);
  if(!fin&&r.length<=3&&KEYS.some(k=>k.startsWith(r))){o+=r;break}
  o+=ch;i++;
 }
 return o;
}
const norm=s=>s.normalize('NFKC').replace(/[\s・、。.,\/〜~]/g,'').replace(/[\u30a1-\u30f6]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60)).toLowerCase();
const parts=s=>s.split(/[・\/、]/).map(norm).filter(Boolean);
function accepted(w,m){const st=new Set([...parts(w.h),norm(w.h)]);if(m==='write'){parts(w.k).forEach(x=>st.add(x));st.add(norm(w.k))}return st}
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
// ---- state
const defScope=REV.has(todayNo)||(todayNo>=1&&todayNo<=maxS)?'today':(todayNo>maxS?'due':'range');
let S={mode:'read',scope:defScope,from:1,to:1,cat:'all'},Q=null;
function pick(){
 const t=dayNum();let L=W;
 if(S.scope==='today')L=REV.has(todayNo)?W.filter(w=>w.s>=todayNo-5&&w.s<todayNo):W.filter(w=>w.s===todayNo);
 else if(S.scope==='due')L=W.filter(w=>P[w.id]&&P[w.id][1]<=t);
 else if(S.scope==='wrong')L=W.filter(w=>P[w.id]&&P[w.id][0]===0&&P[w.id][3]>0);
 else if(S.scope==='range')L=W.filter(w=>w.s>=S.from&&w.s<=S.to);
 else if(S.scope==='new')L=W.filter(w=>!P[w.id]);
 if(S.cat!=='all')L=L.filter(w=>w.c===S.cat);
 return L;
}
function home(){
 Q=null;const t=dayNum(),en=Object.values(P);
 const due=en.filter(e=>e[1]<=t).length,solid=en.filter(e=>e[0]>=3).length;
 const list=pick();
 const sessOpts=[...new Set(W.map(w=>w.s))].sort((a,b)=>a-b);
 const so=(v)=>sessOpts.map(n=>`<option value="${n}"${n===v?' selected':''}>Buổi ${n}</option>`).join('');
 const todayLbl=REV.has(todayNo)?`Hôm nay: ôn buổi ${todayNo-5}–${todayNo-1}`:`Hôm nay: buổi ${todayNo}`;
 const plan=!isMimi?'':todayNo<1?`Lịch bắt đầu ngày 22/10 (buổi 1).`:(todayNo>maxS+(maxS-1)/5|0?'':'');
 $('#app').innerHTML=`
 <button id="lib">← Thư viện</button><h1 style="margin-top:12px"><span class="hanko">単</span>${esc(FN)} · ${W.length} từ</h1>
 <div class="mu">${examDays>0?`Còn ${examDays} ngày đến kỳ thi JLPT (06/12/2026).`:examDays===0?'Hôm nay thi JLPT. Chúc bạn thi tốt!':'Kỳ thi đã qua.'} ${plan}</div>
 <div class="stats" style="margin-top:14px">
  <div class="stat"><b>${en.length}</b><span class="mu">từ đã làm / ${W.length}</span></div>
  <div class="stat"><b>${solid}</b><span class="mu">từ nhớ chắc</span></div>
  <div class="stat"><b>${due}</b><span class="mu">từ đến hạn ôn</span></div></div>
 <div class="card"><h2>Kiểu hỏi</h2>
  <label class="opt"><input type="radio" name="mode" value="read"${S.mode==='read'?' checked':''}><span><b>Đọc:</b> hiện kanji, bạn gõ cách đọc hiragana<br><span class="mu">Từ chỉ có kana sẽ tự chuyển sang kiểu Nhớ từ.</span></span></label>
  <label class="opt"><input type="radio" name="mode" value="write"${S.mode==='write'?' checked':''}><span><b>Nhớ từ:</b> hiện nghĩa tiếng Việt và Hán-Việt, bạn gõ từ tiếng Nhật<br><span class="mu">Gõ cách đọc hoặc kanji đều được chấm đúng.</span></span></label></div>
 <div class="card"><h2>Từ cần học</h2><div class="row">
  <select id="scope">
   ${isMimi&&todayNo>=1&&todayNo<=maxS?`<option value="today"${S.scope==='today'?' selected':''}>${todayLbl}</option>`:''}
   <option value="due"${S.scope==='due'?' selected':''}>Từ đến hạn ôn (${due})</option>
   <option value="wrong"${S.scope==='wrong'?' selected':''}>Từ hay sai</option>
   ${isMimi?`<option value="range"${S.scope==='range'?' selected':''}>Chọn buổi</option>`:''}<option value="new"${S.scope==='new'?' selected':''}>Từ chưa học (${W.filter(w=>!P[w.id]).length})</option>
   <option value="all"${S.scope==='all'?' selected':''}>Tất cả ${W.length} từ</option></select>
  <span id="rng" class="row${S.scope==='range'?'':' hidden'}"><select id="from">${so(S.from)}</select><span>đến</span><select id="to">${so(S.to)}</select></span>
  <select id="cat"><option value="all">Mọi loại từ</option>${[...new Set(W.map(w=>w.c))].map(c=>`<option${S.cat===c?' selected':''}>${esc(c)}</option>`).join('')}</select></div>
  <p class="mu" style="margin:12px 0 10px">${list.length} từ trong phạm vi này.</p>
  <button class="p" id="go"${list.length?'':' disabled'}>Bắt đầu</button></div>
 <details class="card"><summary>Sao lưu tiến độ</summary>
  <p class="mu">Tiến độ được lưu trong trình duyệt này. Để chuyển sang máy khác, bấm Xuất, chép đoạn chữ, rồi dán vào ô và bấm Nhập ở máy kia.</p>
  <textarea id="io" spellcheck="false"></textarea><div class="row" style="margin-top:8px"><button id="ex">Xuất</button><button id="im">Nhập</button><span id="iom" class="mu"></span></div></details>`;
 document.querySelectorAll('input[name=mode]').forEach(r=>r.onchange=()=>{S.mode=r.value});
 $('#scope').onchange=e=>{S.scope=e.target.value;home()};
 $('#from').onchange=e=>{S.from=+e.target.value;if(S.to<S.from)S.to=S.from;home()};
 $('#to').onchange=e=>{S.to=+e.target.value;if(S.from>S.to)S.from=S.to;home()};
 $('#cat').onchange=e=>{S.cat=e.target.value;home()};
 $('#go').onclick=()=>start(list);$('#lib').onclick=lib;
 $('#ex').onclick=()=>{$('#io').value=JSON.stringify(P);$('#iom').textContent='Đã xuất. Hãy chép đoạn chữ trong ô.'};
 $('#im').onclick=()=>{try{const o=JSON.parse($('#io').value);if(!o||typeof o!=='object')throw 0;P=o;save();home()}catch(e){$('#iom').textContent='Đoạn chữ không hợp lệ.'}};
}
function start(list){Q={mode:S.mode,items:shuffle(list.slice()).map(w=>({w,retry:false})),i:0,total:list.length,ok:0,ng:0,wrong:[],phase:'ask',hint:0};quiz()}
const qm=w=>Q.mode==='read'&&hasK(w.k)?'read':'write';
function quiz(){
 if(Q.i>=Q.items.length)return summary();
 const it=Q.items[Q.i],w=it.w,m=qm(w);
 const first=[...parts(w.h)][0]||'';
 $('#app').innerHTML=`
 <div class="row" style="justify-content:space-between"><button id="back">Thoát</button><span class="mu">Đúng ${Q.ok} · Sai ${Q.ng} · ${Q.ok+Q.ng}/${Q.total}</span></div>
 <div class="bar"><i style="width:${Math.round((Q.ok+Q.ng)/Q.total*100)}%"></i></div>
 <div class="card">
  <span class="chip">${esc(w.c)}</span>${w.g?`<span class="chip">${esc(w.g)}</span>`:''}${it.retry?'<span class="chip">Làm lại từ vừa sai</span>':''}
  ${m==='read'?`<div class="big">${esc(w.k)}</div><div class="mu">Gõ cách đọc bằng hiragana (gõ romaji sẽ tự đổi).</div>`
   :`<div class="big vi">${esc(w.m)}</div>${w.v?`<div class="mu">Hán-Việt: ${esc(w.v)}</div>`:''}<div class="mu">${hasK(w.k)?'Gõ từ tiếng Nhật: cách đọc hoặc kanji.':'Gõ từ tiếng Nhật bằng kana.'}</div>`}
  <input id="ans" autocomplete="off" autocapitalize="off" spellcheck="false" lang="ja" placeholder="Gõ đáp án rồi nhấn Enter">
  <div id="hint" class="mu">${Q.hint?`Gợi ý: ${esc(first[0]||'')}…`:''}</div>
  <div class="row" style="margin-top:8px"><button class="p" id="chk">Kiểm tra (Enter)</button><button id="hnt">Gợi ý</button><button id="skp">Chưa nhớ (Esc)</button></div>
  <div id="res"></div></div>`;
 const inp=$('#ans');inp.focus();
 inp.addEventListener('input',e=>{if(e.isComposing||Q.phase!=='ask')return;const v=toKana(inp.value,false);if(v!==inp.value)inp.value=v});
 $('#back').onclick=home;$('#chk').onclick=()=>check();$('#skp').onclick=()=>check(true);
 $('#hnt').onclick=()=>{Q.hint=1;$('#hint').textContent='Gợi ý: '+(first[0]||'')+'…';inp.focus()};
}
function check(skip){
 if(!Q||Q.phase!=='ask')return;
 const it=Q.items[Q.i],w=it.w,m=qm(w),inp=$('#ans');
 const val=skip?'':toKana(inp.value,true);inp.value=val;
 if(!skip&&!val.trim()){inp.classList.add('shake');setTimeout(()=>inp.classList.remove('shake'),300);return}
 const ok=!skip&&accepted(w,m).has(norm(val)),t=dayNum();
 Q.phase='result';inp.readOnly=true;
 if(!it.retry){
  const e=P[w.id]||[0,t,0,0];
  if(ok){e[2]++;e[0]=Math.min(5,e[0]+1);e[1]=t+INT[e[0]];Q.ok++}
  else{e[3]++;e[0]=0;e[1]=t;Q.ng++;Q.wrong.push(w);Q.items.splice(Math.min(Q.i+4,Q.items.length),0,{w,retry:true})}
  P[w.id]=e;save();
 }
 $('#res').innerHTML=`<div class="res ${ok?'ok':'no'}"><div class="rh"><span class="ic">${ok?'✓':'✗'}</span><b>${ok?'Đúng!':(skip?'Đáp án':'Chưa đúng')}</b>${!ok&&!skip?`<span class="mu">Bạn gõ</span><span class="mine">${esc(val)}</span>`:''}</div>
  <div class="det"><div class="ans"><span class="k">${esc(w.k)}</span>${w.h!==w.k?`<span class="rd">${esc(w.h)}</span>`:''}</div><div class="mean"><small>NGHĨA</small>${esc(w.m)}</div>${hv(w)}${w.n?`<div class="mu" style="margin-top:8px">${esc(w.n)}</div>`:''}${w.e?`<div class="ex"><small>VÍ DỤ</small>${esc(w.e)}<br><span class="mu">${esc(w.t||'')}</span></div>`:''}</div>
  <div style="margin-top:10px"><button class="p" id="nx">Tiếp (Enter)</button></div></div>`;
 $('#nx').onclick=next;$('#chk').disabled=$('#skp').disabled=$('#hnt').disabled=true;
}
function hv(w){
 if(!w.v)return '';
 const ks=w.k.match(/[\u4e00-\u9fff]/g)||[],sy=w.v.trim().split(/\s+/);
 if(ks.length&&ks.length===sy.length)return `<div class="hv"><small>HÁN-VIỆT</small><div class="tiles">${ks.map((c,i)=>`<span class="tl"><b>${c}</b><i>${esc(sy[i])}</i></span>`).join('')}</div></div>`;
 return `<div class="hv"><small>HÁN-VIỆT</small><span class="hvt">${esc(w.v)}</span></div>`;
}
function next(){if(!Q||Q.phase!=='result')return;Q.i++;Q.phase='ask';Q.hint=0;quiz()}
function summary(){
 const pct=Q.total?Math.round(Q.ok/Q.total*100):0,wr=[...new Map(Q.wrong.map(w=>[w.id,w])).values()];
 $('#app').innerHTML=`<h1><span class="hanko">完</span>Hoàn thành</h1><div class="card"><div class="big" style="font-size:40px">${Q.ok}/${Q.total} đúng ngay lần đầu</div><div class="mu">${pct}%</div>
 ${wr.length?`<h2 style="margin-top:14px">Từ cần ôn lại (${wr.length})</h2><table>${wr.map(w=>`<tr><td style="font-size:18px">${esc(w.k)}</td><td>${esc(w.h!==w.k?w.h:'')}</td><td>${esc(w.m)}</td></tr>`).join('')}</table>`:'<p>Không có từ nào sai. Rất tốt!</p>'}
 <div class="row" style="margin-top:14px">${wr.length?'<button class="p" id="rt">Ôn lại từ sai</button>':''}<button id="hm"${wr.length?'':' class="p"'}>Về trang chính</button></div></div>`;
 Q.done=1;$('#hm').onclick=home;if(wr.length)$('#rt').onclick=()=>start(wr);
}
document.addEventListener('keydown',e=>{
 if(!Q||Q.done||!$('#ans')||e.target.tagName==='BUTTON')return;
 if(e.key==='Enter'){e.preventDefault();Q.phase==='ask'?check():next()}
 else if(e.key==='Escape'&&Q.phase==='ask'){e.preventDefault();check(true)}
});
let FO=ld('n3vocab_folders')||[];
const sv=()=>{try{localStorage.setItem('n3vocab_folders',JSON.stringify(FO))}catch(e){}};
let isMimi=true,FN='',FID='mimi';
function openF(id){
 FID=id;isMimi=id==='mimi';
 if(isMimi){W=MIMI;KEY='n3vocab_v1';FN='Mimikara N3'}
 else{const f=FO.find(x=>x.id===id);W=f.w.map((x,i)=>({s:1,c:'Từ vựng',g:x.g||'',id:i+1,k:x.k,h:x.h||x.k,v:x.v||'',m:x.m||'',n:'',e:x.e||'',t:x.t||''}));KEY='n3vocab_p_'+id;FN=f.name}
 P=ld(KEY)||{};maxS=Math.max(...W.map(w=>w.s));
 S={mode:'read',scope:isMimi?defScope:'new',from:1,to:1,cat:'all'};home();
}
const QT=String.fromCharCode(34),TB=String.fromCharCode(9),NL=String.fromCharCode(10),CR=String.fromCharCode(13);
function parseTable(t){const d=t.indexOf(TB)>=0?TB:',',rows=[];let r=[],f='',q=0;for(let i=0;i<t.length;i++){const c=t[i];if(q){if(c===QT){if(t[i+1]===QT){f+=QT;i++}else q=0}else f+=c}else if(c===QT&&!f)q=1;else if(c===d){r.push(f);f=''}else if(c===NL||c===CR){if(c===CR&&t[i+1]===NL)i++;r.push(f);f='';rows.push(r);r=[]}else f+=c}r.push(f);rows.push(r);return rows.filter(r=>r.some(x=>x.trim()))}
const COLS=[['k',/言葉|単語|từ vựng|word|kanji|漢字|^từ$/i],['h',/読み|よみ|hiragana|cách đọc|reading|furigana/i],['m',/意味|nghĩa|meaning/i],['e',/例文|ví dụ|example/i],['t',/訳|dịch|translation/i],['v',/hán.?việt|漢越/i],['g',/nhóm|group|分類|chủ đề/i]];
const LB={k:'Từ',h:'Cách đọc',m:'Nghĩa',e:'Ví dụ',t:'Dịch ví dụ',v:'Hán-Việt',g:'Nhóm'};
function readTable(t){
 const rows=parseTable(t);let map=null,st=0;
 for(let i=0;i<Math.min(6,rows.length);i++){const m={};rows[i].forEach((x,j)=>{x=x.trim();for(const [f,re] of COLS){if(m[f]==null&&re.test(x)){m[f]=j;break}}});if(m.k!=null&&(m.m!=null||m.h!=null)){map=m;st=i+1;break}}
 if(!map){map={k:0,h:1,m:2,e:3,t:4};st=0}
 const g=(r,f)=>map[f]==null?'':(r[map[f]]||'').trim();
 return {map,w:rows.slice(st).map(r=>({k:g(r,'k'),h:g(r,'h'),m:g(r,'m'),e:g(r,'e'),t:g(r,'t'),v:g(r,'v'),g:g(r,'g')})).filter(x=>x.k)};
}
function imp(tid){
 const f=tid&&FO.find(x=>x.id===tid),fs='font:inherit;color:var(--tx);background:var(--bg);border:1px solid var(--ln);border-radius:8px;padding:8px 10px;width:100%';
 $('#imp').innerHTML=`<h2>${f?'Thêm từ vào “'+esc(f.name)+'”':'Tạo bộ từ vựng mới'}</h2>${f?'':`<input id='nm' placeholder='Tên bộ, ví dụ: IT日本語 – Mạng' style='${fs};margin-bottom:8px'>`}<textarea id='tb' style='${fs};height:120px' spellcheck='false' placeholder='Mở Google Sheets hoặc Excel, chọn vùng có dòng tiêu đề, copy rồi dán vào đây.'></textarea><p class='mu' id='pv'>Cột được nhận theo tiêu đề: 言葉/単語 (từ), 読み方 (cách đọc), 意味 (nghĩa), 例文 (ví dụ), ベトナム語訳 (dịch ví dụ). Nếu không có dòng tiêu đề, thứ tự cột là: từ, cách đọc, nghĩa, ví dụ, dịch.</p><button class='p' id='ok'>${f?'Thêm vào bộ':'Tạo bộ'}</button>`;
 const tb=$('#tb');
 tb.oninput=()=>{const r=readTable(tb.value),nr=r.w.filter(x=>!x.h).length;$('#pv').textContent=r.w.length?`Nhận được ${r.w.length} từ. Cột: ${Object.keys(r.map).map(k=>LB[k]).join(', ')}.${nr?` ${nr} từ chưa có cách đọc.`:''}`:'Chưa nhận được từ nào.'};
 $('#ok').onclick=()=>{const r=readTable(tb.value);if(!r.w.length){$('#pv').textContent='Chưa có từ nào để nhập.';return}
  if(f)f.w.push(...r.w);else FO.push({id:'f'+Date.now().toString(36),name:($('#nm').value.trim()||'Bộ mới'),w:r.w});sv();lib()};
}
function lib(){
 Q=null;const t=dayNum();
 const card=(id,name,n,p)=>{const en=Object.values(p),due=en.filter(e=>e[1]<=t).length;return `<div class='card'><div class='row' style='justify-content:space-between'><div><b>${esc(name)}</b><div class='mu'>${n} từ · đã làm ${en.length} · đến hạn ôn ${due}</div></div><div class='row'><button class='p' data-o='${id}'>Mở</button>${id==='mimi'?'':`<button data-a='${id}'>Thêm từ</button><button data-d='${id}'>Xoá</button>`}</div></div></div>`};
 $('#app').innerHTML=`<h1><span class='hanko'>辞</span>Thư viện từ vựng</h1><div class='mu'>Mỗi bộ có tiến độ học riêng, không lẫn nhau.</div>${card('mimi','Mimikara N3',MIMI.length,ld('n3vocab_v1')||{})}${FO.map(f=>card(f.id,f.name,f.w.length,ld('n3vocab_p_'+f.id)||{})).join('')}<div class='card' id='imp'></div><details class='card'><summary>Sao lưu toàn bộ thư viện</summary><p class='mu'>Gồm mọi bộ từ và tiến độ. Bấm Xuất, chép đoạn chữ, rồi dán vào ô và bấm Nhập ở máy khác.</p><textarea id='bio' spellcheck='false'></textarea><div class='row' style='margin-top:8px'><button id='bx'>Xuất</button><button id='bi'>Nhập</button><span id='bm' class='mu'></span></div></details>`;
 document.querySelectorAll('[data-o]').forEach(b=>b.onclick=()=>openF(b.dataset.o));
 document.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{imp(b.dataset.a);$('#imp').scrollIntoView()});
 document.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{if(!b.dataset.s){b.dataset.s=1;b.textContent='Bấm lại để xoá';return}const id=b.dataset.d;FO=FO.filter(x=>x.id!==id);sv();try{localStorage.removeItem('n3vocab_p_'+id)}catch(e){}lib()});
 $('#bx').onclick=()=>{const p={};FO.forEach(f=>p[f.id]=ld('n3vocab_p_'+f.id)||{});$('#bio').value=JSON.stringify({v:ld('n3vocab_v1')||{},f:FO,p});$('#bm').textContent='Đã xuất. Hãy chép đoạn chữ trong ô.'};
 $('#bi').onclick=()=>{try{const o=JSON.parse($('#bio').value);localStorage.setItem('n3vocab_v1',JSON.stringify(o.v||{}));FO=o.f||[];sv();Object.entries(o.p||{}).forEach(([id,p])=>localStorage.setItem('n3vocab_p_'+id,JSON.stringify(p)));lib()}catch(e){$('#bm').textContent='Đoạn chữ không hợp lệ.'}};
 imp();
}
lib();
