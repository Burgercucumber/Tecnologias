// js/PerfilC.js
(function () {
  /* ----------------- Guard de sesión ----------------- */
  try {
    if (localStorage.getItem('odg_auth') !== '1') {
      location.replace('./Perfil.html');
      return;
    }
  } catch {}

  /* ----------------- Helpers ----------------- */
  const $    = (s, r = document) => r.querySelector(s);
  const $all = (s, r = document) => [...r.querySelectorAll(s)];
  const getTab = () => new URLSearchParams(location.search).get('tab') || 'info';

  // Fecha helpers
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DOW   = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
  const toISO = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const parseDDMMYYYY = s => { const [d,m,y] = s.split('/').map(n=>+n); return new Date(y, m-1, d); };
  const daysInMonth = (y,m) => new Date(y, m+1, 0).getDate();
  const addMonths   = (d,n) => { const a=new Date(d); a.setMonth(a.getMonth()+n); return a; };
  const isSameDate  = (a,b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

  /* ----------------- Estado demo ----------------- */
  const DEMO = { phone: "312 555 0101", birth: "30/10/2000", location: "Debajo de un puente" };
  function getProfile() {
    const def = { nombre: 'demo', email: 'demo@odontogo.com', telefono: DEMO.phone, nacimiento: DEMO.birth, ubicacion: DEMO.location };
    try { return { ...def, ...(JSON.parse(localStorage.getItem('odg_profile')) || {}) }; } catch { return def; }
  }
  const P = getProfile();

  const DATA = {
    user: {
      name:   P.nombre || localStorage.getItem('odg_name')  || 'Usuario Demo',
      email:  P.email  || localStorage.getItem('odg_email') || 'demo@odontogo.com',
      avatar: localStorage.getItem('odg_avatar') || '../img/user-placeholder.png',
      phone:  P.telefono || DEMO.phone,
      birth:  P.nacimiento || DEMO.birth,
      location: P.ubicacion || DEMO.location
    },
    favoritos: [
      { name: "DentiSalud", logo: "https://www.fincomercio.com/wp-content/uploads/2018/03/dentisalud.jpg", liked: true },
      { name: "BD Odont",   logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjPkh3QWB1EjreZN7-l0fQPRHZ68jiYBi3Ww&s",    liked: true }
    ],
    agenda: [
      { fecha: "05/10/2025", hora: "10:00", especialista: "Dr. Pérez" },
      { fecha: "12/11/2025", hora: "15:00", especialista: "Dra. López" }
    ],
    historial: {
      citas: [
        "10/05/2025 – Limpieza dental – Dra. María López",
        "15/02/2025 – Consulta ortodoncia – Dr. Alejandro Pérez"
      ],
      tratamientos: ["Blanqueamiento dental (2023)","Extracción de cordal superior izquierda (2024)"],
      documentos: ["Radiografía panorámica (PDF – 2024)","Consentimiento informado (PDF – 2025)"]
    },
    pagos: {
      facturas: [
        { n: "#12345", monto: "$200.000",   fecha: "10/05/2025", estado: "Pagada" },
        { n: "#12346", monto: "$1.200.000", fecha: "15/02/2025", estado: "Pendiente" }
      ],
      comprados: [
        { nombre: "Plan Ortodoncia Invisible", estado: "en curso" },
        { nombre: "Blanqueamiento",            estado: "Pagado y realizado" }
      ]
    },
    recomendaciones: [
      { titulo: "La Candelaria", img: "https://hansatours.com/images/La-Candelaria-Bogota-Tour.jpg",    texto: "Centro turístico y cultural icónico." },
      { titulo: "Plaza Bolívar", img: "https://files.visitbogota.co/drpl/sites/default/files/2024-04/PlazaBolivar5_RicardoBáez%20%281%29.jpg", texto: "Corazón histórico de Bogotá." }
    ]
  };

  /* ----------------- Calendario: sets ----------------- */
  let BOOKED_SET = new Set(DATA.agenda.map(a => toISO(parseDDMMYYYY(a.fecha))));
  const BLOCKED_SET = new Set(['2025-10-06','2025-10-07','2025-10-20','2025-10-25']);
  const HOLIDAY_SET = new Set(['2025-10-12','2025-10-31']);
  const refreshAgendaSets = () => { BOOKED_SET = new Set(DATA.agenda.map(a => toISO(parseDDMMYYYY(a.fecha)))); };

  /* ----------------- Recibos (persistencia simple) ----------------- */
  function getReceiptsMap() {
    try { return JSON.parse(localStorage.getItem('odg_receipts') || '{}'); }
    catch { return {}; }
  }
  function saveReceiptsMap(map) {
    try { localStorage.setItem('odg_receipts', JSON.stringify(map)); } catch {}
  }
  function setReceiptForInvoice(facturaNum, receiptObj) {
    const map = getReceiptsMap();
    map[facturaNum] = receiptObj;
    saveReceiptsMap(map);
  }
  function getReceiptByInvoice(facturaNum) {
    const map = getReceiptsMap();
    return map[facturaNum] || null;
  }

  /* ----------------- Header aside ----------------- */
  function paintHeader() {
    const u = DATA.user;
    $('#pf-avatar').src = u.avatar || '../img/user-placeholder.png';
    $('#pf-name').textContent = u.name || 'Usuario';
    $('#pf-mail').textContent = u.email || '';
  }

  /* ----------------- Renderers ----------------- */
  function rInfo() {
    const u = DATA.user;
    return `
      <div class="panel padded">
        <div class="topbar">
          <h2 class="section-title">Información</h2>
          <button class="btn outline" id="btn-edit">Editar Perfil</button>
        </div>
        <div class="card">
          <div style="display:flex; gap:16px; align-items:center; margin-bottom:16px;">
            <img class="avatar-lg" src="${u.avatar}" alt="avatar">
            <div>
              <div style="font-size:1.1rem; font-weight:800;">Datos Personales</div>
              <div class="muted">Resumen de tu perfil</div>
            </div>
          </div>
          <div class="grid2">
            <div>
              <div class="kpi"><span class="dot"></span><strong>Nombre:</strong>&nbsp; ${u.name}</div>
              <div class="kpi"><span class="dot"></span><strong>Correo:</strong>&nbsp; <a href="mailto:${u.email}">${u.email}</a></div>
              <div class="kpi"><span class="dot"></span><strong>Teléfono:</strong>&nbsp; ${u.phone}</div>
            </div>
            <div>
              <div class="kpi"><span class="dot"></span><strong>Fecha de nacimiento:</strong>&nbsp; ${u.birth}</div>
              <div class="kpi"><span class="dot"></span><strong>Ubicación:</strong>&nbsp; ${u.location}</div>
            </div>
          </div>
        </div>
      </div>`;
  }

  /* -------- Favoritos -------- */
  function rFavoritos() {
    const cards = DATA.favoritos.map((f, i) => `
      <article class="card fav-card" data-idx="${i}">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <img src="${f.logo}" alt="${f.name}" style="width:120px; height:70px; object-fit:contain; border-radius:12px; background:#fff;">
            <div><strong>${f.name}</strong><div class="muted">Clínica favorita</div></div>
          </div>
          <button class="btn fav-toggle" data-idx="${i}" aria-pressed="${f.liked}">
            <span class="ico"></span><span class="txt"></span>
          </button>
        </div>
      </article>
    `).join('');
    return `
      <div class="panel padded">
        <h2 class="section-title">Favoritos</h2>
        <div class="grid2">${cards || `<div class="card"><div class="muted">Aún no tienes favoritos.</div></div>`}</div>
      </div>`;
  }
  function setFavBtnState(btn, state){
    const ico = btn.querySelector('.ico'); const txt = btn.querySelector('.txt');
    if (state==='on'){
      btn.setAttribute('aria-pressed','true');
      btn.style.background='#e6f6ee'; btn.style.color='#108f63'; btn.style.border='1px solid #b8e7d4';
      ico.textContent='💚'; txt.textContent='Favorito'; btn.title='Quitar de favoritos';
    } else if (state==='removing'){
      btn.setAttribute('aria-pressed','true');
      btn.style.background='#fdecec'; btn.style.color='#b42318'; btn.style.border='1px solid #f3b4b4';
      ico.textContent='💔'; txt.textContent='Eliminando…'; btn.title='Eliminando';
    } else {
      btn.setAttribute('aria-pressed','false');
      btn.style.background='#f6f7f9'; btn.style.color='#4b5563'; btn.style.border='1px solid #e5e7eb';
      ico.textContent='🤍'; txt.textContent='Añadir'; btn.title='Marcar como favorito';
    }
  }
  function wireFavs(){
    $all('.fav-toggle').forEach(btn=>{
      const idx = +btn.dataset.idx;
      setFavBtnState(btn, DATA.favoritos[idx]?.liked ? 'on':'off');
      btn.addEventListener('click', ()=>{
        const item = DATA.favoritos[idx]; if (!item) return;
        if (item.liked){
          setFavBtnState(btn,'removing'); btn.disabled = true;
          setTimeout(()=>{ DATA.favoritos.splice(idx,1); renderTab('favoritos'); },420);
        } else {
          item.liked = true; setFavBtnState(btn,'on');
        }
      });
    });
  }

  /* -------- Agenda -------- */
  function rAgenda(){
    const cards = DATA.agenda.map((c,i)=>`
      <div class="card" data-apt="${i}">
        <div><strong>Fecha:</strong> ${c.fecha}</div>
        <div><strong>Hora:</strong> ${c.hora}</div>
        <div><strong>Especialista:</strong> ${c.especialista}</div>
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button class="btn outline apt-cancel" data-idx="${i}">Cancelar</button>
          <button class="btn apt-resched" data-idx="${i}">Reagendar</button>
        </div>
      </div>`).join('');
    return `
      <div class="panel padded">
        <div class="topbar">
          <h2 class="section-title">Agenda</h2>
          <button class="btn" id="btn-new-apt">Agendar nueva cita</button>
        </div>
        <div class="grid2">
          <div id="apt-list">${cards || `<div class="card"><div class="muted">Aún no tienes citas.</div></div>`}</div>
          <div class="card">
            <div class="muted" style="margin-bottom:8px;">Calendario</div>
            <div id="mini-cal" class="cal cal-mini" aria-label="Calendario (mini)"></div>
            <div class="cal-foot"><button id="cal-open" class="cal-open-link" type="button">Hacer clic para ampliar</button></div>
          </div>
        </div>
      </div>
      <div id="cal-modal" class="cal-modal" hidden>
        <div class="backdrop" data-cal-dismiss></div>
        <div class="dialog">
          <div class="head">
            <h3 class="section-title" style="margin:0;">Agenda</h3>
            <button class="close" data-cal-dismiss aria-label="Cerrar">✕</button>
          </div>
          <div class="cal-layout">
            <div id="full-cal" class="cal cal-full" aria-label="Calendario (ampliado)"></div>
            <aside id="cal-detail" class="day-detail" aria-live="polite"></aside>
          </div>
          <div class="cal-legend">
            <div class="item"><span class="sw sw-booked"></span><span>Cita</span></div>
            <div class="item"><span class="sw sw-blocked"></span><span>No disponible</span></div>
            <div class="item"><span class="sw sw-holiday"></span><span>Festividades</span></div>
          </div>
        </div>
      </div>
      <div id="apt-modal" class="pay-modal" hidden>
        <div class="backdrop" data-apt-dismiss></div>
        <div class="dialog">
          <div class="head">
            <h3 class="section-title" id="apt-title" style="margin:0;">Nueva cita</h3>
            <button class="close" data-apt-dismiss aria-label="Cerrar">✕</button>
          </div>
          <form id="apt-form" class="card" style="gap:10px;">
            <input type="hidden" id="apt-idx" value="">
            <div class="field"><label>Fecha</label><input type="date" id="apt-date" required></div>
            <div class="field"><label>Hora</label><input type="time" id="apt-time" required></div>
            <div class="field"><label>Especialista</label>
              <select id="apt-doc" required>
                <option>Dr. Pérez</option><option>Dra. López</option><option>Dr. Rivera</option>
              </select>
            </div>
            <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:6px;">
              <button type="button" class="btn outline" data-apt-dismiss>Cancelar</button>
              <button type="submit" class="btn">Guardar</button>
              <button type="button" id="apt-delete" class="btn outline" style="display:none;">Eliminar</button>
            </div>
          </form>
        </div>
      </div>`;
  }

  const getStatus = d => (BOOKED_SET.has(toISO(d)) ? 'booked' : (BLOCKED_SET.has(toISO(d)) ? 'blocked' : (HOLIDAY_SET.has(toISO(d)) ? 'holiday' : '')));

  function buildCalendarHTML(state){
    const y = state.view.getFullYear(), m = state.view.getMonth();
    const first = new Date(y,m,1), startCol = first.getDay();
    const prevDays = daysInMonth(y, m-1), thisDays = daysInMonth(y,m), today = new Date();
    let html = `
      <div class="cal-head">
        <div class="cal-title">${MESES[m]} ${y}</div>
        <div class="cal-nav"><button type="button" data-cal-prev aria-label="Mes anterior">◀</button><button type="button" data-cal-next aria-label="Mes siguiente">▶</button></div>
      </div>
      <div class="cal-grid">`;
    html += DOW.map(d=>`<div class="cal-dow">${d}</div>`).join('');
    for(let i=0;i<42;i++){
      const cell = i - startCol + 1;
      let day, cm, cy, other=false;
      if (cell<1){ day = prevDays + cell; cm=m-1; cy=y; other=true; }
      else if (cell>thisDays){ day = cell - thisDays; cm=m+1; cy=y; other=true; }
      else { day = cell; cm=m; cy=y; }
      const dObj = new Date(cy,cm,day);
      const status = getStatus(dObj);
      const classes = ['cal-day', other?'is-other':'', isSameDate(dObj,today)?'is-today':'', status?`is-${status}`:'', isSameDate(dObj,state.selected)?'is-selected':''].filter(Boolean).join(' ');
      html += `<button type="button" class="${classes}" data-cal-day data-y="${cy}" data-m="${cm}" data-d="${day}">${day}</button>`;
    }
    html += `</div>`;
    return html;
  }

  function renderDayDetail(state){
    const box = $('#cal-detail'); if(!box) return;
    const d = state.selected || new Date(); const iso = toISO(d); const status = getStatus(d);
    const citas = DATA.agenda.filter(a => toISO(parseDDMMYYYY(a.fecha)) === iso);
    let c = `<h4>Datos del día seleccionado</h4>
             <div class="muted" style="margin-bottom:6px;">${d.toLocaleDateString('es-CO',{weekday:'long', day:'2-digit', month:'long', year:'numeric'})}</div>`;
    if (status==='booked' && citas.length){
      c += `<div class="pill" style="margin-bottom:6px;">Cita programada</div>` +
           citas.map(ct=>`<div style="border:1px solid #e7eef3;border-radius:10px;padding:10px;margin:8px 0;">
             <div><strong>Hora:</strong> ${ct.hora}</div><div><strong>Especialista:</strong> ${ct.especialista}</div></div>`).join('');
    } else if (status==='blocked'){
      c += `<div class="pill" style="background:#fff4e6;color:#a96400;margin-bottom:6px;">No disponible</div><p class="muted">Este día no se pueden agendar citas.</p>`;
    } else if (status==='holiday'){
      c += `<div class="pill" style="background:#e6fbfd;color:#0ea4ac;margin-bottom:6px;">Festividad</div><p class="muted">La agenda puede variar por día festivo.</p>`;
    } else {
      c += `<div class="pill" style="margin-bottom:6px;">Disponible</div>
            <p class="muted">No tienes citas para este día. Puedes agendar una nueva.</p>
            <button class="btn" id="detail-new-apt" style="margin-top:6px;">Agendar nueva cita</button>`;
    }
    box.innerHTML = c;
    const add = $('#detail-new-apt'); if (add) add.addEventListener('click', ()=>{ openAptModal(null); $('#apt-date').value = iso; });
  }

  function mountCalendar(container, state, {mode='mini'}={}){
    if(!container) return;
    container.innerHTML = buildCalendarHTML(state);
    container.querySelector('[data-cal-prev]')?.addEventListener('click', ()=>{ state.view = addMonths(state.view,-1); mountCalendar(container,state,{mode}); if(mode==='full') renderDayDetail(state); });
    container.querySelector('[data-cal-next]')?.addEventListener('click', ()=>{ state.view = addMonths(state.view,+1); mountCalendar(container,state,{mode}); if(mode==='full') renderDayDetail(state); });
    container.querySelectorAll('[data-cal-day]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const y=+btn.dataset.y, m=+btn.dataset.m, d=+btn.dataset.d;
        state.selected=new Date(y,m,d); state.view=new Date(y,m,1);
        mountCalendar(container,state,{mode}); if(mode==='full') renderDayDetail(state);
      });
    });
  }

  function openCalendarModal(state){ const md = $('#cal-modal'); const full = $('#full-cal'); if(!md||!full) return; md.hidden=false; mountCalendar(full,state,{mode:'full'}); renderDayDetail(state); }
  function closeCalendarModal(){ const md = $('#cal-modal'); if(md) md.hidden=true; }

  function openAptModal(pref){
    const modal = $('#apt-modal'), title = $('#apt-title'), idxEl=$('#apt-idx'), date=$('#apt-date'), time=$('#apt-time'), doc=$('#apt-doc'), del=$('#apt-delete');
    if (pref){
      title.textContent='Reagendar cita'; idxEl.value=pref.idx;
      const [d,m,y] = pref.fecha.split('/'); date.value = `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
      time.value = pref.hora.length===5 ? pref.hora : (pref.hora || '10:00');
      doc.value  = pref.especialista; del.style.display='';
    } else {
      title.textContent='Nueva cita'; idxEl.value=''; date.value=new Date().toISOString().slice(0,10); time.value='10:00'; doc.value='Dr. Pérez'; del.style.display='none';
    }
    modal.hidden=false;
  }
  function closeAptModal(){ const m=$('#apt-modal'); if(m) m.hidden=true; }

  function wireAgenda(){
    // mini-cal
    const state = { view:new Date(), selected:null };
    const mini = $('#mini-cal'); if (mini) mountCalendar(mini,state,{mode:'mini'});
    $('#cal-open')?.addEventListener('click', e=>{ e.preventDefault(); openCalendarModal(state); });
    $all('[data-cal-dismiss]').forEach(el=>el.addEventListener('click', closeCalendarModal));

    // lista
    $all('.apt-cancel').forEach(b=>{
      b.addEventListener('click', ()=>{
        const idx = +b.dataset.idx; const c = DATA.agenda[idx]; if (!c) return;
        if (confirm(`¿Cancelar la cita del ${c.fecha} a las ${c.hora} con ${c.especialista}?`)){
          DATA.agenda.splice(idx,1); refreshAgendaSets(); renderTab('agenda');
        }
      });
    });
    $all('.apt-resched').forEach(b=>{
      b.addEventListener('click', ()=>{ const idx=+b.dataset.idx; const c=DATA.agenda[idx]; if(!c) return; openAptModal({ ...c, idx }); });
    });
    $('#btn-new-apt')?.addEventListener('click', ()=> openAptModal(null));

    // modal form
    const form = $('#apt-form'); const del = $('#apt-delete');
    form?.addEventListener('submit', e=>{
      e.preventDefault();
      const idx = $('#apt-idx').value;
      const iso = $('#apt-date').value; const [y,m,d]=iso.split('-'); const fecha = `${d}/${m}/${y}`;
      const time = $('#apt-time').value; const doc = $('#apt-doc').value;
      const nueva = { fecha, hora: time, especialista: doc };
      if (idx==='') DATA.agenda.push(nueva); else DATA.agenda[+idx] = nueva;
      DATA.agenda.sort((a,b)=> parseDDMMYYYY(a.fecha)-parseDDMMYYYY(b.fecha));
      refreshAgendaSets(); closeAptModal(); renderTab('agenda');
    });
    del?.addEventListener('click', ()=>{
      const idx = +$('#apt-idx').value; if (Number.isFinite(idx)){ DATA.agenda.splice(idx,1); refreshAgendaSets(); closeAptModal(); renderTab('agenda'); }
    });
    $all('[data-apt-dismiss]').forEach(el=> el.addEventListener('click', closeAptModal));
  }

  /* -------- Historial -------- */
  function rHistorial() {
    // Rutas de ejemplo; reemplaza por tus PDFs reales
    const DOCS = {
      pano:   '../docs/radiografia-panoramica.pdf',
      consent:'../docs/consentimiento-informado.pdf'
    };

    return `
      <div class="panel padded">
        <h2 class="section-title">Historial</h2>

        <div class="card">
          <h3 style="margin:0 0 8px;">Citas anteriores</h3>
          <ul>${DATA.historial.citas.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>

        <div class="card">
          <h3 style="margin:0 0 8px;">Tratamientos realizados</h3>
          <ul>${DATA.historial.tratamientos.map(t => `<li>${t}</li>`).join('')}</ul>
        </div>

        <div class="card">
          <h3 style="margin:0 0 8px;">Documentos clínicos</h3>
          <ul>
            <li>Radiografía panorámica (PDF – 2024)
              <button class="doc-link" data-src="${DOCS.pano}" aria-label="Ver Radiografía panorámica (PDF)">Ver</button>
            </li>
            <li>Consentimiento informado (PDF – 2025)
              <button class="doc-link" data-src="${DOCS.consent}" aria-label="Ver Consentimiento informado (PDF)">Ver</button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Visor de documentos -->
      <div id="doc-modal" class="pay-modal" hidden>
        <div class="backdrop" data-doc-dismiss></div>
        <div class="dialog" style="width:min(980px,96vw); max-height:90vh; display:flex; flex-direction:column;">
          <div class="head" style="gap:12px;">
            <h3 class="section-title" style="margin:0;">Documento</h3>
            <button class="close" data-doc-dismiss aria-label="Cerrar">✕</button>
          </div>
          <div style="flex:1 1 auto; min-height:60vh; border-radius:10px; overflow:hidden; border:1px solid #e7eef3;">
            <iframe id="doc-frame" title="Visor de documento" style="width:100%; height:100%; border:0;"></iframe>
          </div>
        </div>
      </div>
    `;
  }
  function wireDocViewer() {
    const open = (src) => {
      const modal = $('#doc-modal');
      const frame = $('#doc-frame');
      if (!modal || !frame) return;
      frame.src = src;
      modal.hidden = false;

      const onEsc = (e)=>{ if(e.key==='Escape'){ close(); } };
      modal._onEsc = onEsc;
      document.addEventListener('keydown', onEsc);
    };
    const close = () => {
      const modal = $('#doc-modal');
      const frame = $('#doc-frame');
      if (!modal) return;
      modal.hidden = true;
      if (frame) frame.src = 'about:blank';
      if (modal._onEsc) document.removeEventListener('keydown', modal._onEsc);
    };
    $all('.doc-link').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const src = btn.getAttribute('data-src');
        if (src) open(src);
      });
    });
    $all('[data-doc-dismiss]').forEach(el=> el.addEventListener('click', close));
  }

  /* -------- Pagos (con recibo) -------- */
  function rPagos(){
    const f = DATA.pagos.facturas.map(x=>{
      const bg = x.estado==='Pagada' ? '#eaf8f2' : (x.estado==='Pendiente' ? '#fff4e6' : '#f4e7e7');
      const col= x.estado==='Pagada' ? '#108f63' : (x.estado==='Pendiente' ? '#a96400' : '#a33434');

      const actions =
        x.estado === 'Pendiente'
          ? `<div style="display:flex; gap:8px;">
               <button class="btn sm" data-pay="${x.n}">Pagar</button>
               <button class="btn outline sm" data-cancel="${x.n}">Cancelar</button>
             </div>`
          : (x.estado === 'Pagada'
              ? `<div style="display:flex; gap:8px;">
                   <button class="btn outline sm" data-receipt="${x.n}">Ver recibo</button>
                 </div>`
              : '');

      return `<div class="row" data-row="${x.n}">
        <div>${x.n} – <strong>${x.monto}</strong> – ${x.fecha}</div>
        <div style="display:flex; gap:10px; align-items:center;">
          <div class="pill" style="background:${bg};color:${col}">${x.estado}</div>${actions}
        </div></div>`;
    }).join('');

    const t = DATA.pagos.comprados.map(x=>`<div class="row"><div>${x.nombre}</div><div class="muted">${x.estado}</div></div>`).join('');

    const modals = `
      <!-- Modal Pago -->
      <div id="pay-modal" class="pay-modal" hidden>
        <div class="backdrop" data-pay-dismiss></div>
        <div class="dialog">
          <div class="head"><h3 class="section-title" style="margin:0;">Pago de factura</h3><button class="close" data-pay-dismiss aria-label="Cerrar">✕</button></div>
          <div class="pay-grid">
            <form id="pay-form" class="card" style="gap:10px;">
              <input type="hidden" id="facturaN">
              <div class="field"><label>Nombre en la tarjeta</label><input id="cardname" required /></div>
              <div class="field"><label>Número de tarjeta</label><input id="cardnumber" inputmode="numeric" maxlength="19" placeholder="4111 1111 1111 1111" required /></div>
              <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                <div class="field"><label>Mes</label><select id="expmonth">${Array.from({length:12},(_,i)=>`<option value="${String(i+1).padStart(2,'0')}">${String(i+1).padStart(2,'0')}</option>`).join('')}</select></div>
                <div class="field"><label>Año</label><select id="expyear">${Array.from({length:12},(_,i)=>`<option>${new Date().getFullYear()+i}</option>`).join('')}</select></div>
                <div class="field"><label>CVV</label><input id="cvv" inputmode="numeric" maxlength="4" required /></div>
              </div>
              <div class="field"><label>Email</label><input id="pemail" type="email" required /></div>
              <div class="field"><label>Celular</label><input id="pphone" type="tel" /></div>
              <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:10px;"><button type="button" class="btn outline" data-pay-dismiss>Cancelar</button><button type="submit" class="btn">Pagar</button></div>
            </form>
            <aside class="card" id="pay-summary"></aside>
          </div>
        </div>
      </div>

      <!-- Modal Recibo -->
      <div id="receipt-modal" class="pay-modal" hidden>
        <div class="backdrop" data-receipt-dismiss></div>
        <div class="dialog">
          <div class="head">
            <h3 class="section-title" style="margin:0;">Recibo de pago</h3>
            <button class="close" data-receipt-dismiss aria-label="Cerrar">✕</button>
          </div>
          <div id="receipt-body" class="card" style="gap:10px;"></div>
          <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:10px;">
            <button class="btn outline" data-receipt-dismiss>Cerrar</button>
            <button class="btn" id="receipt-print">Imprimir / Guardar PDF</button>
          </div>
        </div>
      </div>
    `;

    return `<div class="panel padded">
      <h2 class="section-title">Pagos</h2>
      <div class="card"><h3 style="margin:0 0 8px;">Historial de pagos</h3><div class="table-like">${f}</div></div>
      <div class="card"><h3 style="margin:0 0 8px;">Tratamientos comprados</h3><div class="table-like">${t}</div></div>
    </div>${modals}`;
  }

  function openPayModal(f){
    const md = $('#pay-modal'); const sum = $('#pay-summary'); const u=DATA.user;
    $('#facturaN').value=f.n; $('#cardname').value= u.name || 'Juan Demo'; $('#cardnumber').value='4111 1111 1111 1111';
    $('#expmonth').value='12'; $('#expyear').value=String(new Date().getFullYear()+3); $('#cvv').value='123';
    $('#pemail').value=u.email; $('#pphone').value=u.phone || '';
    sum.innerHTML = `<h3 class="section-title" style="margin:0 0 6px;">Resumen del pago</h3>
      <div class="muted">Factura: <strong>${f.n}</strong></div><div class="muted">Emitida: ${f.fecha}</div>
      <hr style="border:none;border-top:1px solid #e7eef3;margin:10px 0;">
      <div style="display:flex;justify-content:space-between;"><div>Total</div><div><strong>${f.monto}</strong></div></div>
      <p class="muted" style="margin-top:8px;">*Simulación: no se procesa ningún cobro real.</p>`;
    md.hidden=false;

    $('#pay-form').onsubmit = e=>{
      e.preventDefault();
      const digits = $('#cardnumber').value.replace(/\D/g,'');
      if (digits.length<13 || digits.length>19){ alert('Número de tarjeta inválido'); return; }
      if (!/^\d{3,4}$/.test($('#cvv').value)){ alert('CVV inválido'); return; }
      if (!/\S+@\S+\.\S+/.test($('#pemail').value)){ alert('Email inválido'); return; }

      // Estado factura
      const row = DATA.pagos.facturas.find(x=>x.n===f.n); if (row) row.estado='Pagada';

      // Generar y guardar recibo
      const last4 = digits.slice(-4);
      const receipt = {
        id: 'RC-' + Date.now(),
        factura: f.n,
        monto: f.monto,
        emitida: f.fecha,
        pagadaEn: new Date().toLocaleString('es-CO'),
        metodo: `Tarjeta •••• ${last4}`,
        titular: $('#cardname').value,
        email: $('#pemail').value
      };
      setReceiptForInvoice(f.n, receipt);

      md.hidden=true;
      renderTab('pagos');
    };

    $all('[data-pay-dismiss]').forEach(el=> el.onclick = ()=> md.hidden=true);
  }

  function openReceiptModal(facturaNum) {
    const rec = getReceiptByInvoice(facturaNum);
    const modal = $('#receipt-modal');
    const body  = $('#receipt-body');

    if (!rec) {
      body.innerHTML = `<p class="muted">No se encontró el recibo para la factura <strong>${facturaNum}</strong>.</p>`;
    } else {
      body.innerHTML = `
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
          <div><div class="muted">Recibo</div><div><strong>${rec.id}</strong></div></div>
          <div><div class="muted">Factura</div><div>${rec.factura}</div></div>
          <div><div class="muted">Emitida</div><div>${rec.emitida}</div></div>
          <div><div class="muted">Pagada</div><div>${rec.pagadaEn}</div></div>
          <div><div class="muted">Monto</div><div><strong>${rec.monto}</strong></div></div>
          <div><div class="muted">Método</div><div>${rec.metodo}</div></div>
          <div><div class="muted">Titular</div><div>${rec.titular}</div></div>
          <div><div class="muted">Email</div><div>${rec.email}</div></div>
        </div>
        <hr style="border:none; border-top:1px solid #e7eef3; margin:10px 0;">
        <p class="muted" style="font-size:12px;">*Documento generado automáticamente para fines de demostración.</p>
      `;
      $('#receipt-print').onclick = () => printReceipt(rec);
    }

    modal.hidden = false;
    $all('[data-receipt-dismiss]').forEach(el => el.onclick = () => { modal.hidden = true; });
  }

  function printReceipt(rec) {
    const html = `
      <html>
        <head>
          <meta charset="utf-8">
          <title>${rec.id}</title>
          <style>
            body{ font-family:Arial, Helvetica, sans-serif; margin:24px; color:#222; }
            .box{ max-width:740px; margin:0 auto; border:1px solid #e7eef3; border-radius:12px; padding:20px; }
            h1{ font-size:20px; margin:0 0 8px; }
            .muted{ color:#6b7b86; font-size:12px; }
            .grid{ display:grid; grid-template-columns: 1fr 1fr; gap:10px; }
            hr{ border:none; border-top:1px solid #e7eef3; margin:12px 0; }
          </style>
        </head>
        <body>
          <div class="box">
            <h1>Recibo de pago</h1>
            <div class="muted">OdontoGo · Simulación</div>
            <hr>
            <div class="grid">
              <div><div class="muted">Recibo</div><div><strong>${rec.id}</strong></div></div>
              <div><div class="muted">Factura</div><div>${rec.factura}</div></div>
              <div><div class="muted">Emitida</div><div>${rec.emitida}</div></div>
              <div><div class="muted">Pagada</div><div>${rec.pagadaEn}</div></div>
              <div><div class="muted">Monto</div><div><strong>${rec.monto}</strong></div></div>
              <div><div class="muted">Método</div><div>${rec.metodo}</div></div>
              <div><div class="muted">Titular</div><div>${rec.titular}</div></div>
              <div><div class="muted">Email</div><div>${rec.email}</div></div>
            </div>
            <hr>
            <div class="muted">Este documento es válido solo para demostración/UX.</div>
          </div>
          <script>window.onload = () => setTimeout(() => window.print(), 100);<\/script>
        </body>
      </html>
    `;
    const w = window.open('', '_blank');
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  function wirePayments(){
    // pagar
    $all('[data-pay]').forEach(b=> b.addEventListener('click', ()=>{
      const n=b.getAttribute('data-pay'); const f=DATA.pagos.facturas.find(x=>x.n===n); if(f) openPayModal(f);
    }));
    // cancelar
    $all('[data-cancel]').forEach(b=> b.addEventListener('click', ()=>{
      const n=b.getAttribute('data-cancel');
      if(confirm('¿Cancelar esta factura?')){
        const f=DATA.pagos.facturas.find(x=>x.n===n); if(f) f.estado='Cancelada';
        renderTab('pagos');
      }
    }));
    // ver recibo
    $all('[data-receipt]').forEach(b=> b.addEventListener('click', ()=>{
      const n=b.getAttribute('data-receipt');
      openReceiptModal(n);
    }));
  }

  /* -------- Configuración -------- */
  function rConfig(){
    return `<div class="panel padded">
      <h2 class="section-title">Configuración</h2>
      <div class="card">
        <div class="table-like">
          <div class="row"><div>Cambiar contraseña</div><button class="btn outline" id="btn-pass">Cambiar</button></div>
          <div class="row"><div>Idioma</div><button class="btn outline" id="btn-lang">Idioma: ${localStorage.getItem('odg_lang')||'es'}</button></div>
          <div class="row"><div>Cerrar sesión</div><button class="btn" id="btn-logout">Cerrar sesión</button></div>
        </div>
      </div>
    </div>
    <div id="pass-modal" class="pay-modal" hidden>
      <div class="backdrop" data-pass-dismiss></div>
      <div class="dialog">
        <div class="head"><h3 class="section-title" style="margin:0;">Cambiar contraseña (demo)</h3><button class="close" data-pass-dismiss aria-label="Cerrar">✕</button></div>
        <form id="pass-form" class="card" style="gap:10px;">
          <div class="field"><label>Contraseña actual (demo)</label><input type="password" id="old-pass" required></div>
          <div class="field"><label>Nueva contraseña</label><input type="password" id="new-pass" minlength="6" required></div>
          <div class="field"><label>Repite nueva contraseña</label><input type="password" id="rep-pass" minlength="6" required></div>
          <div style="display:flex; gap:8px; justify-content:flex-end;">
            <button type="button" class="btn outline" data-pass-dismiss>Cancelar</button>
            <button type="submit" class="btn">Guardar</button>
          </div>
        </form>
      </div>
    </div>`;
  }
  function wireConfig(){
    // Logout
    $('#btn-logout')?.addEventListener('click', ()=>{
      if (window.__odgAuth?.clearSession) window.__odgAuth.clearSession();
      try {
        localStorage.removeItem('odg_auth'); localStorage.removeItem('odg_name'); localStorage.removeItem('odg_email'); localStorage.removeItem('odg_avatar');
      } catch {}
      location.href='./Perfil.html';
    });

    // Pass modal
    const pModal = $('#pass-modal');
    $('#btn-pass')?.addEventListener('click', ()=> { pModal.hidden=false; });
    $all('[data-pass-dismiss]').forEach(el=> el.addEventListener('click', ()=> pModal.hidden=true));
    $('#pass-form')?.addEventListener('submit', e=>{
      e.preventDefault();
      const old = $('#old-pass').value, nw = $('#new-pass').value, rp = $('#rep-pass').value;
      const current = localStorage.getItem('odg_pass') || 'demo123';
      if (old !== current){ alert('La contraseña actual no coincide (demo: demo123).'); return; }
      if (nw !== rp){ alert('Las contraseñas no coinciden.'); return; }
      localStorage.setItem('odg_pass', nw);
      alert('Contraseña actualizada (demo).'); pModal.hidden=true;
    });

    // Idioma (toggle es/en – demo)
    $('#btn-lang')?.addEventListener('click', ()=>{
      const cur = localStorage.getItem('odg_lang') || 'es';
      const next = cur === 'es' ? 'en' : 'es';
      localStorage.setItem('odg_lang', next);
      document.documentElement.setAttribute('lang', next);
      $('#btn-lang').textContent = `Idioma: ${next}`;
      alert(`Idioma guardado (${next}). (Demo: no traduce la UI aún)`);
    });
  }

  /* -------- Recomendaciones -------- */
  function rRecom(){
    const items = DATA.recomendaciones.map(r=>`
      <div class="card">
        <div class="pill">Lugares cercanos</div>
        <h3 style="margin:10px 0 6px;">${r.titulo}</h3>
        <p class="muted">${r.texto}</p>
        <img src="${r.img}" alt="${r.titulo}" style="width:100%; height:220px; object-fit:cover; border-radius:12px; margin-top:8px;">
      </div>`).join('');
    return `<div class="panel padded"><h2 class="section-title">Recomendaciones</h2><div class="grid2">${items}</div></div>`;
  }

  /* ----------------- Router ----------------- */
  const RENDERS = { info:rInfo, favoritos:rFavoritos, agenda:rAgenda, historial:rHistorial, pagos:rPagos, configuracion:rConfig, recomendaciones:rRecom };

  function renderTab(tab){
    const fn = RENDERS[tab] || RENDERS.info;
    $('#pf-view').innerHTML = fn();

    // activar en aside
    $all('#pf-menu li').forEach(li => li.classList.toggle('active', li.dataset.tab === tab));
    // URL sin recargar
    const url = new URL(location.href); url.searchParams.set('tab', tab); history.replaceState({tab}, '', url);

    // wire según tab
    if (tab==='favoritos')     wireFavs();
    if (tab==='agenda')        wireAgenda();
    if (tab==='pagos')         wirePayments();
    if (tab==='configuracion') wireConfig();
    if (tab==='historial')     wireDocViewer();

    // editar perfil
    const btnEdit = $('#btn-edit');
    if (btnEdit){
      const back='./PerfilC.html?tab=info';
      btnEdit.addEventListener('click', ()=> location.href = `./PerfilEditar.html?return=${encodeURIComponent(back)}`);
    }
  }

  function go(tab, push=false){
    renderTab(tab);
    if (push){
      const url=new URL(location.href); url.searchParams.set('tab',tab); history.pushState({tab},'',url);
    }
  }

  /* ----------------- Init ----------------- */
  document.addEventListener('DOMContentLoaded', ()=>{
    paintHeader();
    $all('#pf-menu li').forEach(li => li.addEventListener('click', ()=> go(li.dataset.tab, true)));
    go(getTab());
    window.addEventListener('popstate', ()=> renderTab(getTab()));
  });
})();
