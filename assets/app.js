(()=>{"use strict";
const C=window.SCHOOLPULSE_CONFIG,$=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
const VIEWS=[
 ["dashboard","لوحة اليوم","home"],["incidents","البلاغات","alert"],["absence","الغياب والتغطية","calendar"],
 ["tasks","المهام","tasks"],["tardies","التأخر الطلابي","clock"],["report","التقرير اليومي","report"],["settings","الإعدادات","settings"]
];
let DATA=null,REPORT=null,activeView="dashboard";
const iconPaths={
 home:'<path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/>',
 alert:'<path d="M12 3 2.7 19h18.6z"/><path d="M12 9v4m0 3h.01"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
 tasks:'<path d="M9 5h11M9 12h11M9 19h11"/><path d="m3 5 1 1 2-2m-3 8 1 1 2-2m-3 8 1 1 2-2"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 report:'<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v4h4M9 12h6M9 16h6"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14.5 3h-5L9 6a7 7 0 0 0-1.7 1L5 6 3 9.5 5.1 11A7 7 0 0 0 5 12c0 .3 0 .7.1 1L3 14.5 5 18l2.3-1a7 7 0 0 0 1.7 1l.5 3h5l.5-3a7 7 0 0 0 1.7-1l2.3 1 2-3.5-2.1-1.5c.1-.3.1-.7.1-1z"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9"/>',
 tool:'<path d="m14 7 3-3 3 3-3 3"/><path d="M17 7 9 15"/><path d="m8 14-4 4 2 2 4-4"/>',
 check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'
};
function icon(n){return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">${iconPaths[n]||""}</svg>`}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function num(v){return new Intl.NumberFormat("ar-SA").format(Number(v)||0)}
function session(){return{key:sessionStorage.getItem("schoolpulseKey")||"",staff:sessionStorage.getItem("schoolpulseStaff")||""}}
function saveSession(k,s){sessionStorage.setItem("schoolpulseKey",k);sessionStorage.setItem("schoolpulseStaff",s)}
function logout(){sessionStorage.removeItem("schoolpulseKey");sessionStorage.removeItem("schoolpulseStaff");location.reload()}
function alert(el,text,type="info"){el.textContent=text||"";el.className=`alert ${type}${text?"":" hidden"}`}
async function api(action,payload={},key=session().key){
 const r=await fetch(C.apiUrl,{method:"POST",headers:{"Content-Type":"application/json","X-SchoolPulse-Key":key},body:JSON.stringify({action,...payload})});
 const d=await r.json().catch(()=>({}));
 if(!r.ok||d.success===false)throw new Error(d.message||"تعذر تنفيذ العملية.");
 return d;
}
function buildNav(){
 $("#sideSchool").textContent=C.schoolName;$("#sideUser").textContent=session().staff||"—";
 $("#sideNav").innerHTML=VIEWS.map(([k,t,i])=>`<button class="nav-btn ${k===activeView?"active":""}" data-view="${k}">${icon(i)}<span>${t}</span></button>`).join("");
 $("#mobileNav").innerHTML=VIEWS.slice(0,6).map(([k,t,i])=>`<button class="${k===activeView?"active":""}" data-view="${k}">${icon(i)}<span>${t}</span></button>`).join("");
 all("[data-view]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.view)));
}
function go(view){activeView=view;all(".view").forEach(v=>v.classList.toggle("active",v.id===`${view}View`));$("#topTitle").textContent=VIEWS.find(x=>x[0]===view)?.[1]||"SchoolPulse";buildNav();if(view==="report")loadReport()}
function priorityBadge(p){const c=p==="حرج"?"critical":p==="عاجل"?"urgent":p==="منخفض"?"low":"normal";return `<span class="badge ${c}">${esc(p)}</span>`}
function statusBadge(s){const c=s==="مغلق"||s==="مكتملة"||s==="مغطاة"?"closed":s==="قيد المعالجة"||s==="قيد التنفيذ"?"progress":"open";return `<span class="badge ${c}">${esc(s)}</span>`}
function kpi(title,value,iconName){return `<article class="kpi"><div class="kpi-top"><span>${title}</span><div class="kpi-icon">${icon(iconName)}</div></div><strong>${num(value)}</strong></article>`}

async function login(key,staff){
 alert($("#loginMsg"),"جاري الاتصال بـ n8n...","info");
 try{await api("ping",{},key);saveSession(key,staff);$("#loginScreen").classList.add("hidden");buildNav();await refresh();alert($("#loginMsg"),"","info")}
 catch(e){alert($("#loginMsg"),e.message,"error")}
}
$("#loginForm").addEventListener("submit",e=>{e.preventDefault();login($("#loginKey").value.trim(),$("#loginStaff").value.trim())});
const cached=session();if(cached.key&&cached.staff){$("#loginKey").value=cached.key;$("#loginStaff").value=cached.staff;login(cached.key,cached.staff)}
$("#logoutBtn").addEventListener("click",logout);$("#refreshBtn").addEventListener("click",refresh);

async function refresh(){
 alert($("#globalMsg"),"جاري تحديث غرفة العمليات...","info");
 try{DATA=await api("dashboard");renderAll();alert($("#globalMsg"),`تم التحديث · ${DATA.generatedAt}`,"success")}
 catch(e){alert($("#globalMsg"),e.message,"error")}
}
function renderAll(){renderDashboard();renderIncidents();renderAbsence();renderTasks();renderTardies();renderStatus()}
function renderStatus(){
 const s=DATA.dayStatus||{level:"normal",label:"طبيعي"};$("#dayStatus").className=`day-status ${s.level==="critical"?"critical":s.level==="warning"?"warn":""}`;$("#dayStatusText").textContent=s.label;
}
function renderDashboard(){
 const s=DATA.summary;$("#dashboardKpis").innerHTML=
 kpi("البلاغات المفتوحة",s.openIncidents,"alert")+kpi("البلاغات الحرجة",s.criticalIncidents,"tool")+kpi("غياب المعلمين",s.absencesToday,"users")+kpi("حصص غير مغطاة",s.uncoveredLessons,"calendar")+kpi("مهام مفتوحة",s.openTasks,"tasks")+kpi("طلاب متأخرون",s.tardiesToday,"clock");
 const cats=DATA.incidentCategories||{},max=Math.max(...Object.values(cats),1);$("#incidentBars").innerHTML=Object.entries(cats).map(([k,v])=>`<div class="bar-row"><span>${esc(k)}</span><div class="bar-track"><i style="width:${v/max*100}%"></i></div><b>${num(v)}</b></div>`).join("")||'<p>لا توجد بلاغات مفتوحة.</p>';
 const cov=DATA.coverageStats||{total:0,covered:0,open:0};const pct=cov.total?Math.round(cov.covered/cov.total*100):100;$("#coverageSummary").innerHTML=`<div class="priority-box good"><small>مغطاة</small><b>${num(cov.covered)}</b></div><div class="priority-box warning"><small>غير مغطاة</small><b>${num(cov.open)}</b></div><div class="priority-box"><small>نسبة التغطية</small><b>${num(pct)}%</b></div>`;
 $("#timeline").innerHTML=(DATA.recentEvents||[]).slice(0,8).map(e=>`<div class="event"><div class="event-dot">${icon(e.type==="بلاغ"?"alert":e.type==="مهمة"?"tasks":e.type==="غياب"?"users":"clock")}</div><div><h4>${esc(e.description)}</h4><p>${esc(e.user||"النظام")}</p><time>${esc(e.at)}</time></div></div>`).join("")||'<p>لا توجد أحداث.</p>';
}
function renderIncidents(){
 let rows=DATA.incidents||[],f=$("#incidentStatusFilter")?.value||"الكل",t=$("#incidentSearch")?.value?.trim()||"";rows=rows.filter(r=>(f==="الكل"||r.status===f)&&(!t||`${r.id} ${r.title} ${r.category} ${r.location}`.includes(t)));
 $("#incidentsTable").innerHTML=rows.length?rows.map(r=>`<tr><td><b>${esc(r.id)}</b><br><small>${esc(r.createdAt)}</small></td><td><b>${esc(r.title)}</b><br><small>${esc(r.description)}</small></td><td>${esc(r.category)}</td><td>${priorityBadge(r.priority)}</td><td>${esc(r.location)}</td><td>${esc(r.assignee||"غير مسند")}</td><td>${r.slaState==="متأخر"?'<span class="badge critical">متأخر</span>':`<small>${esc(r.dueAt)}</small>`}</td><td>${statusBadge(r.status)}</td><td><div class="mini-actions"><button class="mini primary" data-edit-incident="${esc(r.id)}">تحديث</button></div></td></tr>`).join(""):'<tr><td colspan="9">لا توجد بلاغات.</td></tr>';
 all("[data-edit-incident]").forEach(b=>b.addEventListener("click",()=>openIncidentUpdate(b.dataset.editIncident)));
}
$("#incidentStatusFilter").addEventListener("change",renderIncidents);$("#incidentSearch").addEventListener("input",renderIncidents);

function renderAbsence(){
 $("#absenceTable").innerHTML=(DATA.absences||[]).length?DATA.absences.map(a=>`<tr><td><b>${esc(a.teacher)}</b></td><td>${esc(a.subject)}</td><td>${num(a.lessons)}</td><td>${esc(a.reason)}</td><td>${statusBadge(a.status)}</td></tr>`).join(""):'<tr><td colspan="5">لا يوجد غياب مسجل اليوم.</td></tr>';
 const c=DATA.coverageStats,total=c.total||0,pct=total?Math.round(c.covered/total*100):100;$("#coverageIndicator").innerHTML=`<div style="text-align:center;padding:14px"><div style="font-size:46px;font-weight:900;color:var(--teal)">${num(pct)}%</div><p style="font-size:10px;color:var(--muted)">تمت تغطية ${num(c.covered)} من ${num(total)} حصة</p><div class="bar-track" style="height:12px"><i style="width:${pct}%"></i></div></div>`;
 $("#coverageBoard").innerHTML=(DATA.coverage||[]).map(c=>`<article class="coverage ${c.status==="مغطاة"?"done":"open"}"><div class="coverage-top"><div><h4>الحصة ${esc(c.period)} · ${esc(c.className)}</h4><p>${esc(c.subject)} · المعلم الغائب: ${esc(c.absentTeacher)}</p></div>${statusBadge(c.status)}</div><b>${c.coverTeacher?`المكلف: ${esc(c.coverTeacher)}`:"لم يسند معلم بديل"}</b><div class="coverage-foot"><small>${esc(c.note||"")}</small><button class="mini primary" data-cover="${esc(c.id)}">إسناد / تحديث</button></div></article>`).join("")||'<p>لا توجد احتياجات تغطية.</p>';
 all("[data-cover]").forEach(b=>b.addEventListener("click",()=>openCoverageUpdate(b.dataset.cover)));
}
function renderTasks(){
 const f=$("#taskStatusFilter")?.value||"الكل";let rows=(DATA.tasks||[]).filter(t=>f==="الكل"||t.status===f);$("#tasksTable").innerHTML=rows.length?rows.map(t=>`<tr><td><b>${esc(t.title)}</b><br><small>${esc(t.description)}</small></td><td>${esc(t.owner)}</td><td>${priorityBadge(t.priority)}</td><td>${esc(t.department)}</td><td>${esc(t.dueDate)}</td><td>${statusBadge(t.status)}</td><td>${t.status!=="مكتملة"?`<button class="mini primary" data-complete-task="${esc(t.id)}">إكمال</button>`:"—"}</td></tr>`).join(""):'<tr><td colspan="7">لا توجد مهام.</td></tr>';
 all("[data-complete-task]").forEach(b=>b.addEventListener("click",()=>completeTask(b.dataset.completeTask)));
}
$("#taskStatusFilter").addEventListener("change",renderTasks);
function renderTardies(){
 const rows=DATA.tardies||[],avg=rows.length?Math.round(rows.reduce((s,r)=>s+Number(r.minutes||0),0)/rows.length):0,max=rows.length?Math.max(...rows.map(r=>Number(r.minutes||0))):0;
 $("#tardyKpis").innerHTML=kpi("عدد المتأخرين",rows.length,"users")+kpi("متوسط التأخر",avg+"","clock")+kpi("أعلى تأخر بالدقائق",max,"clock");
 $("#tardiesTable").innerHTML=rows.length?rows.map(r=>`<tr><td><b>${esc(r.student)}</b></td><td>${esc(r.grade)}</td><td>${esc(r.className)}</td><td>${num(r.minutes)}</td><td>${esc(r.note||"—")}</td><td>${esc(r.recordedBy)}</td><td>${esc(r.at)}</td></tr>`).join(""):'<tr><td colspan="7">لا يوجد تأخر مسجل اليوم.</td></tr>';
}
all("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));

function modal(title,body,buttons){
 $("#modalTitle").textContent=title;$("#modalBody").innerHTML=body;$("#modalFoot").innerHTML=buttons;$("#formModal").classList.remove("hidden");
}
function closeModal(){$("#formModal").classList.add("hidden")}
$("#modalClose").addEventListener("click",closeModal);$("#formModal").addEventListener("click",e=>{if(e.target===$("#formModal"))closeModal()});
all("[data-open]").forEach(b=>b.addEventListener("click",()=>openForm(b.dataset.open)));

function openForm(type){
 if(type==="incident")modal("تسجيل بلاغ جديد",`<div class="form-grid">
  <div class="field wide"><label>عنوان البلاغ</label><input id="fTitle" class="form-control" placeholder="وصف مختصر وواضح"></div>
  <div class="field"><label>التصنيف</label><select id="fCategory" class="form-control"><option>صيانة</option><option>سلامة</option><option>تقنية</option><option>مرافق</option><option>نظافة</option><option>سلوك</option><option>أخرى</option></select></div>
  <div class="field"><label>الأولوية</label><select id="fPriority" class="form-control"><option>متوسط</option><option>عاجل</option><option>حرج</option><option>منخفض</option></select></div>
  <div class="field"><label>الموقع</label><input id="fLocation" class="form-control" placeholder="مثال: الدور الثاني"></div>
  <div class="field"><label>المسؤول</label><input id="fAssignee" class="form-control" placeholder="اختياري"></div>
  <div class="field wide"><label>الوصف</label><textarea id="fDesc" class="form-control" rows="4"></textarea></div>
 </div><div id="modalMsg" class="alert hidden"></div>`,`<button class="btn btn-soft" id="mCancel">إلغاء</button><button class="btn btn-primary" id="mSave">تسجيل البلاغ</button>`);
 if(type==="absence")modal("تسجيل غياب معلم",`<div class="form-grid"><div class="field"><label>اسم المعلم</label><input id="fTeacher" class="form-control"></div><div class="field"><label>التخصص</label><input id="fSubject" class="form-control"></div><div class="field"><label>عدد الحصص التي تحتاج تغطية</label><input id="fLessons" type="number" min="0" max="8" value="4" class="form-control"></div><div class="field"><label>سبب الغياب</label><select id="fReason" class="form-control"><option>غياب</option><option>استئذان</option><option>مهمة رسمية</option><option>دورة تدريبية</option></select></div><div class="field wide"><label>ملاحظة</label><input id="fNote" class="form-control"></div></div><div id="modalMsg" class="alert hidden"></div>`,`<button class="btn btn-soft" id="mCancel">إلغاء</button><button class="btn btn-primary" id="mSave">حفظ الغياب</button>`);
 if(type==="coverage")modal("إضافة احتياج تغطية",`<div class="form-grid"><div class="field"><label>الحصة</label><input id="fPeriod" class="form-control" placeholder="مثال: 3"></div><div class="field"><label>الفصل</label><input id="fClass" class="form-control" placeholder="مثال: 2/3"></div><div class="field"><label>المادة</label><input id="fSubject" class="form-control"></div><div class="field"><label>المعلم الغائب</label><input id="fTeacher" class="form-control"></div></div><div id="modalMsg" class="alert hidden"></div>`,`<button class="btn btn-soft" id="mCancel">إلغاء</button><button class="btn btn-primary" id="mSave">إضافة</button>`);
 if(type==="task")modal("إضافة مهمة",`<div class="form-grid"><div class="field wide"><label>عنوان المهمة</label><input id="fTitle" class="form-control"></div><div class="field"><label>المسؤول</label><input id="fOwner" class="form-control"></div><div class="field"><label>الأولوية</label><select id="fPriority" class="form-control"><option>متوسط</option><option>عاجل</option><option>حرج</option><option>منخفض</option></select></div><div class="field"><label>الجهة</label><input id="fDept" class="form-control" placeholder="مثال: شؤون الطلاب"></div><div class="field"><label>تاريخ الاستحقاق</label><input id="fDue" type="date" class="form-control"></div><div class="field wide"><label>الوصف</label><textarea id="fDesc" class="form-control" rows="3"></textarea></div></div><div id="modalMsg" class="alert hidden"></div>`,`<button class="btn btn-soft" id="mCancel">إلغاء</button><button class="btn btn-primary" id="mSave">إضافة المهمة</button>`);
 if(type==="tardy")modal("تسجيل تأخر طالب",`<div class="form-grid"><div class="field wide"><label>اسم الطالب</label><input id="fStudent" class="form-control"></div><div class="field"><label>الصف</label><select id="fGrade" class="form-control"><option>الأول متوسط</option><option>الثاني متوسط</option><option>الثالث متوسط</option></select></div><div class="field"><label>الفصل</label><input id="fClass" class="form-control" placeholder="مثال: 3"></div><div class="field"><label>دقائق التأخر</label><input id="fMinutes" type="number" min="1" max="180" value="10" class="form-control"></div><div class="field"><label>ملاحظة</label><input id="fNote" class="form-control"></div></div><div id="modalMsg" class="alert hidden"></div>`,`<button class="btn btn-soft" id="mCancel">إلغاء</button><button class="btn btn-primary" id="mSave">تسجيل</button>`);
 $("#mCancel").addEventListener("click",closeModal);$("#mSave").addEventListener("click",()=>saveForm(type));
}
async function saveForm(type){
 const btn=$("#mSave");btn.disabled=true;alert($("#modalMsg"),"جاري الحفظ...","info");const staff=session().staff;
 try{
  if(type==="incident")await api("createIncident",{title:$("#fTitle").value.trim(),description:$("#fDesc").value.trim(),category:$("#fCategory").value,priority:$("#fPriority").value,location:$("#fLocation").value.trim(),assignee:$("#fAssignee").value.trim(),reportedBy:staff});
  if(type==="absence")await api("createAbsence",{teacher:$("#fTeacher").value.trim(),subject:$("#fSubject").value.trim(),lessons:Number($("#fLessons").value||0),reason:$("#fReason").value,note:$("#fNote").value.trim(),recordedBy:staff});
  if(type==="coverage")await api("createCoverage",{period:$("#fPeriod").value.trim(),className:$("#fClass").value.trim(),subject:$("#fSubject").value.trim(),absentTeacher:$("#fTeacher").value.trim(),recordedBy:staff});
  if(type==="task")await api("createTask",{title:$("#fTitle").value.trim(),description:$("#fDesc").value.trim(),owner:$("#fOwner").value.trim(),priority:$("#fPriority").value,department:$("#fDept").value.trim(),dueDate:$("#fDue").value,createdBy:staff});
  if(type==="tardy")await api("createTardy",{student:$("#fStudent").value.trim(),grade:$("#fGrade").value,className:$("#fClass").value.trim(),minutes:Number($("#fMinutes").value||0),note:$("#fNote").value.trim(),recordedBy:staff});
  closeModal();await refresh();
 }catch(e){alert($("#modalMsg"),e.message,"error")}finally{btn.disabled=false}
}
function openIncidentUpdate(id){const r=DATA.incidents.find(x=>x.id===id);modal(`تحديث ${r.id}`,`<div class="form-grid"><div class="field"><label>الحالة</label><select id="fStatus" class="form-control"><option ${r.status==="مفتوح"?"selected":""}>مفتوح</option><option ${r.status==="قيد المعالجة"?"selected":""}>قيد المعالجة</option><option ${r.status==="مغلق"?"selected":""}>مغلق</option></select></div><div class="field"><label>المسؤول</label><input id="fAssignee" class="form-control" value="${esc(r.assignee||"")}"></div><div class="field wide"><label>ملاحظة التحديث / الإغلاق</label><textarea id="fNote" class="form-control" rows="3"></textarea></div></div><div id="modalMsg" class="alert hidden"></div>`,`<button class="btn btn-soft" id="mCancel">إلغاء</button><button class="btn btn-primary" id="mSave">حفظ التحديث</button>`);$("#mCancel").onclick=closeModal;$("#mSave").onclick=async()=>{try{await api("updateIncident",{id,status:$("#fStatus").value,assignee:$("#fAssignee").value.trim(),note:$("#fNote").value.trim(),updatedBy:session().staff});closeModal();await refresh()}catch(e){alert($("#modalMsg"),e.message,"error")}}}
function openCoverageUpdate(id){const r=DATA.coverage.find(x=>x.id===id);modal(`تغطية الحصة ${r.period}`,`<div class="form-grid"><div class="field wide"><label>المعلم المكلف بالتغطية</label><input id="fCoverTeacher" class="form-control" value="${esc(r.coverTeacher||"")}"></div><div class="field"><label>الحالة</label><select id="fStatus" class="form-control"><option ${r.status==="غير مغطاة"?"selected":""}>غير مغطاة</option><option ${r.status==="مغطاة"?"selected":""}>مغطاة</option></select></div><div class="field"><label>ملاحظة</label><input id="fNote" class="form-control" value="${esc(r.note||"")}"></div></div><div id="modalMsg" class="alert hidden"></div>`,`<button class="btn btn-soft" id="mCancel">إلغاء</button><button class="btn btn-primary" id="mSave">حفظ</button>`);$("#mCancel").onclick=closeModal;$("#mSave").onclick=async()=>{try{await api("updateCoverage",{id,coverTeacher:$("#fCoverTeacher").value.trim(),status:$("#fStatus").value,note:$("#fNote").value.trim(),updatedBy:session().staff});closeModal();await refresh()}catch(e){alert($("#modalMsg"),e.message,"error")}}}
async function completeTask(id){if(!confirm("تأكيد إكمال المهمة؟"))return;try{await api("updateTask",{id,status:"مكتملة",updatedBy:session().staff});await refresh()}catch(e){alert($("#globalMsg"),e.message,"error")}}

async function loadReport(){
 try{REPORT=await api("report");renderReport()}catch(e){alert($("#globalMsg"),e.message,"error")}
}
function renderReport(){
 if(!REPORT)return;$("#reportSchool").textContent=C.schoolName;$("#reportDate").textContent=REPORT.date;$("#reportStaff").textContent=session().staff;$("#reportSign").textContent=session().staff;$("#reportState").textContent=REPORT.dayStatus.label;
 const s=REPORT.summary;$("#reportStats").innerHTML=[["بلاغات مفتوحة",s.openIncidents],["بلاغات مغلقة",s.closedIncidents],["غياب معلمين",s.absencesToday],["حصص مغطاة",s.coveredLessons],["مهام مكتملة",s.completedTasks],["طلاب متأخرون",s.tardiesToday],["حصص غير مغطاة",s.uncoveredLessons],["مهام مفتوحة",s.openTasks]].map(x=>`<div class="report-stat"><span>${x[0]}</span><b>${num(x[1])}</b></div>`).join("");
 $("#reportEvents").innerHTML=(REPORT.keyEvents||[]).map(e=>`<div class="report-note" style="margin-bottom:6px"><b>${esc(e.type)}</b> · ${esc(e.description)} <small>${esc(e.at)}</small></div>`).join("")||'<div class="report-note">لا توجد أحداث مسجلة.</div>';
 $("#reportIncidents").innerHTML=(REPORT.priorityIncidents||[]).length?REPORT.priorityIncidents.map(r=>`<tr><td>${esc(r.id)}</td><td>${esc(r.title)}</td><td>${priorityBadge(r.priority)}</td><td>${esc(r.location)}</td><td>${esc(r.assignee||"غير مسند")}</td><td>${statusBadge(r.status)}</td></tr>`).join(""):'<tr><td colspan="6">لا توجد بلاغات ذات أولوية مفتوحة.</td></tr>';
 $("#reportRecommendations").innerHTML=(REPORT.recommendations||[]).map((x,i)=>`${i+1}. ${esc(x)}`).join("<br>")||"لا توجد ملاحظات إضافية.";
}
$("#reportRefreshBtn").addEventListener("click",loadReport);$("#printReportBtn").addEventListener("click",()=>window.print());
$("#healthBtn").addEventListener("click",async()=>{alert($("#settingsMsg"),"جاري الفحص...","info");try{const r=await api("ping");$("#healthState").textContent=`متصل · ${r.serverTime}`;alert($("#settingsMsg"),"n8n متصل ويستجيب بنجاح.","success")}catch(e){$("#healthState").textContent="فشل الاتصال";alert($("#settingsMsg"),e.message,"error")}});
$("#apiUrlDisplay").textContent=C.apiUrl;$("#versionDisplay").textContent=C.version;
$("#resetDemoBtn").addEventListener("click",async()=>{if(!confirm("سيتم حذف تغييرات التجربة وإعادة البيانات الافتراضية. متابعة؟"))return;try{await api("resetDemo",{staff:session().staff});await refresh();alert($("#settingsMsg"),"تمت إعادة بيانات التجربة.","success")}catch(e){alert($("#settingsMsg"),e.message,"error")}});

buildNav();
})();