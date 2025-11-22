// js/PerfilC.js
(function () {
  const DEFAULT_USER = {
    id: null,
    name: 'Usuario',
    email: 'usuario@odontogo.com',
    avatar: '../img/user-placeholder.png',
    phone: '',
    birth: '',
    location: ''
  };

  function normalizeUser(user) {
    user = user || {};
    return {
      id: user.id ?? DEFAULT_USER.id,
      name: user.nombre || user.name || DEFAULT_USER.name,
      email: user.email || DEFAULT_USER.email,
      avatar: user.avatar || DEFAULT_USER.avatar,
      phone: user.telefono || user.phone || DEFAULT_USER.phone,
      birth: user.nacimiento || user.birth || DEFAULT_USER.birth,
      location: user.ubicacion || user.location || DEFAULT_USER.location
    };
  }

  const DATA = {
    user: normalizeUser(window.OdgUser || {}),
    favoritos: [],
    agenda: [],
    pagos: [],
    favoritosCargados: false,
    agendaCargada: false,
    pagosCargados: false,
    historial: {
      citas: [
        "10/05/2025 - Limpieza dental - Dra. Maria Lopez",
        "15/02/2025 - Consulta ortodoncia - Dr. Alejandro Perez"
      ],
      tratamientos: [
        "Blanqueamiento dental (2023)",
        "Extraccion de cordal superior izquierda (2024)"
      ],
      documentos: [
        "Radiografia panoramica (PDF - 2024)",
        "Consentimiento informado (PDF - 2025)"
      ]
    },
    recomendaciones: [
      { titulo: "La Candelaria", img: "https://hansatours.com/images/La-Candelaria-Bogota-Tour.jpg", texto: "Centro turistico y cultural iconico." },
      { titulo: "Plaza Bolivar", img: "https://files.visitbogota.co/drpl/sites/default/files/2024-04/PlazaBolivar5_RicardoBaez%20%281%29.jpg", texto: "Corazon historico de Bogota." }
    ]
  };

  /* ----------------- Helpers ----------------- */
  const $    = (s, r = document) => r.querySelector(s);
  const $all = (s, r = document) => [...r.querySelectorAll(s)];
  const getTab = () => new URLSearchParams(location.search).get('tab') || 'info';

  // Fecha helpers
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DOW   = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
  const toISO = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const parseDDMMYYYY = s => { const [d,m,y] = s.split('/').map(n=>+n); return new Date(y, m-1, d); };
  const parseYYYYMMDD = s => { const [y,m,d] = s.split('-').map(n=>+n); return new Date(y, m-1, d); };
  const daysInMonth = (y,m) => new Date(y, m+1, 0).getDate();
  const addMonths   = (d,n) => { const a=new Date(d); a.setMonth(a.getMonth()+n); return a; };
  const isSameDate  = (a,b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

  /* ----------------- Calendario: sets ----------------- */
  let BOOKED_SET = new Set();
  const BLOCKED_SET = new Set(['2025-11-20','2025-11-25']);
  const HOLIDAY_SET = new Set(['2025-12-25','2026-01-01']);
  const refreshAgendaSets = () => {
    BOOKED_SET = new Set(DATA.agenda.map(a => a.fecha_cita));
  };

  /* ----------------- Header aside ----------------- */
  function paintHeader() {
    const u = DATA.user;
    const ava = $('#pf-avatar');
    const name = $('#pf-name');
    const mail = $('#pf-mail');

    if (ava)  ava.src = u.avatar || DEFAULT_USER.avatar;
    if (name) name.textContent = u.name || 'Usuario';
    if (mail) mail.textContent = u.email || '';
  }

  /* ----------------- CARGAR DATOS DESDE API ----------------- */
  async function cargarCitas() {
    DATA.agendaCargada = false;
    try {
      const res = await fetch('../php/obtner_citas.php', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      if (!payload.ok) throw new Error(payload.error || 'Error al cargar citas');
      const citas = Array.isArray(payload.citas) ? payload.citas : [];
      DATA.agenda = citas.sort((a, b) => new Date(a.fecha_cita) - new Date(b.fecha_cita));
    } catch (err) {
      console.error('Error cargando citas:', err);
      DATA.agenda = [];
    } finally {
      DATA.agendaCargada = true;
      refreshAgendaSets();
    }
  }

  async function cargarPagos() {
    DATA.pagosCargados = false;
    try {
      const res = await fetch('../php/obtener_pagos.php', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      if (!payload.ok) throw new Error(payload.error || 'Error al cargar pagos');
      const pagos = Array.isArray(payload.pagos) ? payload.pagos : [];
      DATA.pagos = pagos.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago));
    } catch (err) {
      console.error('Error cargando pagos:', err);
      DATA.pagos = [];
    } finally {
      DATA.pagosCargados = true;
    }
  }

  async function cargarFavoritos() {
    DATA.favoritosCargados = false;
    try {
      const res = await fetch('../php/favoritos.php', { credentials: 'include' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const payload = await res.json();
      if (!payload.ok) throw new Error(payload.error || 'Error al cargar favoritos');

      const lista = Array.isArray(payload.favoritos) ? payload.favoritos : [];
      DATA.favoritos = lista.map(f => ({
        id: f.clinica_id,
        clinica_id: f.clinica_id,
        name: f.nombre || f.name || 'Clinica',
        logo: f.logo || '',
        liked: true
      }));
    } catch (err) {
      console.error('Error cargando favoritos:', err);
      DATA.favoritos = [];
    } finally {
      DATA.favoritosCargados = true;
    }
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
    if (!DATA.favoritosCargados) {
      return `
        <div class="panel padded">
          <h2 class="section-title">Favoritos</h2>
          <div class="card"><div class="muted">Cargando favoritos...</div></div>
        </div>`;
    }

    if (!DATA.favoritos || DATA.favoritos.length === 0) {
      return `
        <div class="panel padded">
          <h2 class="section-title">Favoritos</h2>
          <div class="card"><div class="muted">Aún no tienes clínicas en favoritos.</div></div>
        </div>`;
    }

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
      const item = DATA.favoritos[idx];
      setFavBtnState(btn, item?.liked ? 'on':'off');
      btn.addEventListener('click', async ()=>{
        if (!item) return;
        const quitando = item.liked;
        const clinicaId = item.clinica_id || item.id;

        if (quitando){
          setFavBtnState(btn,'removing');
        } else {
          setFavBtnState(btn,'on');
        }
        btn.disabled = true;

        try {
          const res = await fetch('../php/favoritos.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              clinica_id: clinicaId,
              favorito: !quitando
            })
          });
          const data = await res.json();
          if (!res.ok || !data.ok) throw new Error(data.error || 'Error al actualizar favorito');

          await cargarFavoritos();
          await renderTab('favoritos');
        } catch (err) {
          console.error('Error actualizando favorito desde perfil:', err);
          setFavBtnState(btn, quitando ? 'on' : 'off');
          btn.disabled = false;
          alert('No se pudo actualizar este favorito. Intenta de nuevo.');
        }
      });
    });
  }

  /* -------- Agenda -------- */
  function rAgenda(){
    if (!DATA.agendaCargada || DATA.agenda.length === 0) {
      return `
        <div class="panel padded">
          <div class="topbar">
            <h2 class="section-title">Agenda</h2>
          </div>
          <div class="card">
            <div class="muted">${!DATA.agendaCargada ? 'Cargando citas...' : 'No tienes citas programadas.'}</div>
          </div>
        </div>`;
    }

    const hoy = new Date();
    const citasFuturas = DATA.agenda.filter(c => {
      const fecha = parseYYYYMMDD(c.fecha_cita);
      return fecha >= hoy;
    });
    const citasPasadas = DATA.agenda.filter(c => {
      const fecha = parseYYYYMMDD(c.fecha_cita);
      return fecha < hoy;
    });

    let html = '<div class="grid2"><div id="apt-list">';

    if (citasFuturas.length > 0) {
      html += '<h3 class="h5" style="margin: 0 0 10px;">Próximas citas</h3>';
      citasFuturas.forEach((c) => {
        const fecha = parseYYYYMMDD(c.fecha_cita);
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const fechaTexto = fecha.toLocaleDateString('es-ES', opciones);

        html += `
          <div class="card" style="margin-bottom: 12px;">
            <div><strong>${c.procedimiento}</strong></div>
            <div class="muted">${c.clinica} - ${c.ubicacion}</div>
            <div class="muted">${fechaTexto} • ${c.hora_cita}</div>
            <div style="margin-top:8px; display:flex; gap:6px; font-size:.9rem;">
              <span class="pill">Pagado: $${Number(c.total).toLocaleString('es-CO')}</span>
            </div>
          </div>`;
      });
    } else {
      html += '<div class="card"><div class="muted">No tienes citas próximas</div></div>';
    }

    if (citasPasadas.length > 0) {
      html += '<h3 class="h5" style="margin: 20px 0 10px;">Citas pasadas</h3>';
      citasPasadas.forEach((c) => {
        const fecha = parseYYYYMMDD(c.fecha_cita);
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        const fechaTexto = fecha.toLocaleDateString('es-ES', opciones);

        html += `
          <div class="card" style="margin-bottom: 12px; opacity: 0.7;">
            <div><strong>${c.procedimiento}</strong></div>
            <div class="muted">${c.clinica} - ${c.ubicacion}</div>
            <div class="muted">${fechaTexto} • ${c.hora_cita}</div>
          </div>`;
      });
    }

    html += '</div>';
    html += `<div class="card">
      <div class="muted" style="margin-bottom:8px;">Calendario</div>
      <div id="mini-cal" class="cal cal-mini" aria-label="Calendario (mini)"></div>
      <div class="cal-foot"><button id="cal-open" class="cal-open-link" type="button">Hacer clic para ampliar</button></div>
    </div></div>`;

    return `
      <div class="panel padded">
        <div class="topbar">
          <h2 class="section-title">Agenda</h2>
        </div>
        ${html}
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
      </div>`;
  }

  const getStatus = d => {
    const iso = toISO(d);
    return BOOKED_SET.has(iso)
      ? 'booked'
      : (BLOCKED_SET.has(iso)
          ? 'blocked'
          : (HOLIDAY_SET.has(iso) ? 'holiday' : ''));
  };

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
      const classes = ['cal-day',
        other?'is-other':'',
        isSameDate(dObj,today)?'is-today':'',
        status?`is-${status}`:'',
        isSameDate(dObj,state.selected)?'is-selected':''
      ].filter(Boolean).join(' ');
      html += `<button type="button" class="${classes}" data-cal-day data-y="${cy}" data-m="${cm}" data-d="${day}">${day}</button>`;
    }
    html += `</div>`;
    return html;
  }

  function renderDayDetail(state){
    const box = $('#cal-detail'); if(!box) return;
    const d = state.selected || new Date();
    const iso = toISO(d);
    const status = getStatus(d);
    const citas = DATA.agenda.filter(a => a.fecha_cita === iso);

    let c = `<h4>Datos del día seleccionado</h4>
             <div class="muted" style="margin-bottom:6px;">${d.toLocaleDateString('es-CO',{weekday:'long', day:'2-digit', month:'long', year:'numeric'})}</div>`;

    if (status==='booked' && citas.length){
      c += `<div class="pill" style="margin-bottom:6px;">Cita programada</div>` +
           citas.map(ct=>`<div style="border:1px solid #e7eef3;border-radius:10px;padding:10px;margin:8px 0;">
             <div><strong>${ct.procedimiento}</strong></div>
             <div class="muted">${ct.clinica}</div>
             <div><strong>Hora:</strong> ${ct.hora_cita}</div>
             </div>`).join('');
    } else if (status==='blocked'){
      c += `<div class="pill" style="background:#fff4e6;color:#a96400;margin-bottom:6px;">No disponible</div><p class="muted">Este día no se pueden agendar citas.</p>`;
    } else if (status==='holiday'){
      c += `<div class="pill" style="background:#e6fbfd;color:#0ea4ac;margin-bottom:6px;">Festividad</div><p class="muted">La agenda puede variar por día festivo.</p>`;
    } else {
      c += `<div class="pill" style="margin-bottom:6px;">Sin citas</div>
            <p class="muted">No tienes citas programadas para este día.</p>`;
    }
    box.innerHTML = c;
  }

  function mountCalendar(container, state, {mode='mini'}={}){
    if(!container) return;
    container.innerHTML = buildCalendarHTML(state);
    container.querySelector('[data-cal-prev]')?.addEventListener('click', ()=>{
      state.view = addMonths(state.view,-1);
      mountCalendar(container,state,{mode});
      if(mode==='full') renderDayDetail(state);
    });
    container.querySelector('[data-cal-next]')?.addEventListener('click', ()=>{
      state.view = addMonths(state.view,+1);
      mountCalendar(container,state,{mode});
      if(mode==='full') renderDayDetail(state);
    });
    container.querySelectorAll('[data-cal-day]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const y=+btn.dataset.y, m=+btn.dataset.m, d=+btn.dataset.d;
        state.selected=new Date(y,m,d); state.view=new Date(y,m,1);
        mountCalendar(container,state,{mode});
        if(mode==='full') renderDayDetail(state);
      });
    });
  }

  function openCalendarModal(state){
    const md = $('#cal-modal');
    const full = $('#full-cal');
    if(!md||!full) return;
    md.hidden=false;
    mountCalendar(full,state,{mode:'full'});
    renderDayDetail(state);
  }

  function closeCalendarModal(){
    const md = $('#cal-modal');
    if(md) md.hidden=true;
  }

  function wireAgenda(){
    const state = { view:new Date(), selected:null };
    const mini = $('#mini-cal');
    if (mini) mountCalendar(mini,state,{mode:'mini'});
    $('#cal-open')?.addEventListener('click', e=>{
      e.preventDefault();
      openCalendarModal(state);
    });
    $all('[data-cal-dismiss]').forEach(el=>el.addEventListener('click', closeCalendarModal));
  }

  /* -------- Historial -------- */
  function rHistorial() {
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

  /* -------- Pagos -------- */
  function rPagos(){
    if (!DATA.pagosCargados || DATA.pagos.length === 0) {
      return `
        <div class="panel padded">
          <h2 class="section-title">Historial de Pagos</h2>
          <div class="card">
            <div class="muted">${!DATA.pagosCargados ? 'Cargando pagos...' : 'No tienes pagos registrados.'}</div>
          </div>
        </div>`;
    }

    let html = '<div class="panel padded"><h2 class="section-title">Historial de Pagos</h2>';

    DATA.pagos.forEach(pago => {
      const fechaPago = new Date(pago.fecha_pago);
      const fechaCita = parseYYYYMMDD(pago.fecha_cita);

      const estadoClass = pago.estado === 'PAGADO'
        ? 'pill'
        : (pago.estado === 'PENDIENTE' ? 'pill pendiente' : 'pill cancelada');

      html += `
        <div class="card" style="margin-bottom: 14px;">
          <div class="topbar">
            <div>
              <h4 style="margin: 0 0 4px; color: #16313f;">
                Pago #${pago.id} - ${pago.procedimiento}
              </h4>
              <p class="muted" style="margin: 0;">${pago.clinica} - ${pago.ubicacion}</p>
            </div>
            <div class="${estadoClass}">${pago.estado}</div>
          </div>

          <div class="grid2" style="margin-top: 14px;">
            <div>
              <p class="muted" style="margin: 4px 0;">Fecha de pago:</p>
              <strong>${fechaPago.toLocaleDateString('es-ES')}</strong>
            </div>
            <div>
              <p class="muted" style="margin: 4px 0;">Fecha de cita:</p>
              <strong>${fechaCita.toLocaleDateString('es-ES')} ${pago.hora_cita}</strong>
            </div>
          </div>

          <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid #e7eef3;">
            <div style="display: flex; justify-content: space-between; margin: 6px 0;">
              <span class="muted">Procedimiento:</span>
              <strong>$${Number(pago.precio_procedimiento).toLocaleString('es-CO')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin: 6px 0;">
              <span class="muted">Revisión:</span>
              <strong>$${Number(pago.precio_revision).toLocaleString('es-CO')}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 10px; padding-top: 10px; border-top: 2px solid #e7eef3;">
              <span style="font-size: 1.1rem; font-weight: 700;">Total:</span>
              <strong style="font-size: 1.2rem; color: #0ec28b;">
                $${Number(pago.total).toLocaleString('es-CO')}
              </strong>
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    return html;
  }

  /* -------- Configuración -------- */
  function rConfig(){
    const lang = document.documentElement.getAttribute('lang') || 'es';
    return `<div class="panel padded">
      <h2 class="section-title">Configuracion</h2>
      <div class="card">
        <div class="table-like">
          <div class="row"><div>Cambiar contrasena</div><button class="btn outline" id="btn-pass">Proximamente</button></div>
          <div class="row"><div>Idioma</div><button class="btn outline" id="btn-lang">Idioma: ${lang}</button></div>
          <div class="row"><div>Cerrar sesion</div><button class="btn" id="btn-logout">Cerrar sesion</button></div>
        </div>
        <p class="muted" style="margin-top:12px;">Las opciones avanzadas del perfil se administran desde el panel seguro.</p>
      </div>
    </div>`;
  }

  function wireConfig(){
    $('#btn-logout')?.addEventListener('click', ()=>{
      location.href = './logout.php';
    });

    $('#btn-pass')?.addEventListener('click', ()=>{
      alert('La actualizacion de contrasena estara disponible pronto.');
    });

    $('#btn-lang')?.addEventListener('click', ()=>{
      const current = document.documentElement.getAttribute('lang') || 'es';
      const next = current === 'es' ? 'en' : 'es';
      document.documentElement.setAttribute('lang', next);
      $('#btn-lang').textContent = `Idioma: ${next}`;
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
  const RENDERS = {
    info: rInfo,
    favoritos: rFavoritos,
    agenda: rAgenda,
    historial: rHistorial,
    pagos: rPagos,
    configuracion: rConfig,
    recomendaciones: rRecom
  };

  async function renderTab(tab){
    // Cargar datos antes de agenda/pagos/favoritos
    if (tab === 'agenda' && !DATA.agendaCargada) {
      await cargarCitas();
    }
    if (tab === 'pagos' && !DATA.pagosCargados) {
      await cargarPagos();
    }
    if (tab === 'favoritos' && !DATA.favoritosCargados) {
      await cargarFavoritos();
    }

    const fn = RENDERS[tab] || RENDERS.info;
    $('#pf-view').innerHTML = fn();

    $all('#pf-menu li').forEach(li => li.classList.toggle('active', li.dataset.tab === tab));
    const url = new URL(location.href);
    url.searchParams.set('tab', tab);
    history.replaceState({tab}, '', url);

    if (tab==='favoritos')     wireFavs();
    if (tab==='agenda')        setTimeout(() => wireAgenda(), 100);
    if (tab==='configuracion') wireConfig();
    if (tab==='historial')     wireDocViewer();

    const btnEdit = $('#btn-edit');
    if (btnEdit){
      const back='./PerfilC.html?tab=info';
      btnEdit.addEventListener('click', ()=> {
        location.href = `./PerfilEditar.php?return=${encodeURIComponent(back)}`;
      });
    }
  }

  function go(tab, push=false){
    renderTab(tab);
    if (push){
      const url=new URL(location.href);
      url.searchParams.set('tab',tab);
      history.pushState({tab},'',url);
    }
  }

  /* ----------------- DEBUG ----------------- */
  function debugDatos() {
    console.log('=== DEBUG DATOS PERFIL ===');
    console.log('Usuario:', DATA.user.email);
    console.log('Citas cargadas:', DATA.agenda);
    console.log('Pagos cargados:', DATA.pagos);
    console.log('Agenda cargada:', DATA.agendaCargada);
    console.log('Pagos cargados:', DATA.pagosCargados);
    console.log('===================');
  }

  /* ----------------- Init ----------------- */
  let started = false;
  function startPerfil(user) {
    if (started) return;
    started = true;

    if (!user || !user.email) {
      location.href = './login.php?redirect=PerfilC.html';
      return;
    }

    DATA.user = normalizeUser(user);
    paintHeader();

    $all('#pf-menu li').forEach(li =>
      li.addEventListener('click', ()=> go(li.dataset.tab, true))
    );
    go(getTab());
    window.addEventListener('popstate', ()=> renderTab(getTab()));

    setTimeout(debugDatos, 1000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    // Si el usuario ya está en window.OdgUser (por el loader), arrancamos
    if (window.OdgUser && window.OdgUser.email) {
      startPerfil(window.OdgUser);
    }

    // Si llega más tarde (por el fetch de get_user.php), también arrancamos
    document.addEventListener('odg:user-ready', (ev) => {
      const u = window.OdgUser || ev.detail || null;
      startPerfil(u);
    });
  });
})();
