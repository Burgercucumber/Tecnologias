// js/perfilC.js
(function () {
  // --- Guard de sesión
  try {
    if (localStorage.getItem('odg_auth') !== '1') {
      location.replace('./Perfil.html');
      return;
    }
  } catch {}

  /* =========================================================
     REINICIO GARANTIZADO DEL ESTADO DE PAGOS EN CADA CARGA
     ---------------------------------------------------------
     Esto borra cualquier persistencia previa de facturas pagadas
     para que, al volver a entrar, la(s) factura(s) demo vuelvan
     a su estado original (p. ej. "Pendiente").
     ========================================================= */
  try { localStorage.removeItem('odg_invoices'); } catch {}

  // --- Utilidades para perfil
  function getProfile() {
    const def = {
      nombre: 'demo',
      email: 'demo@odontogo.com',
      telefono: '312 555 0101',
      nacimiento: '30/10/2000', // dd/mm/yyyy
      ubicacion: 'Debajo de un puente'
    };
    try { return { ...def, ...(JSON.parse(localStorage.getItem('odg_profile')) || {}) }; }
    catch { return def; }
  }
  function setProfile(p){ localStorage.setItem('odg_profile', JSON.stringify(p)); }

  // --- Datos base/demo
  const DEMO = { phone: "312 555 0101", birth: "30/10/2000", location: "Debajo de un puente" };

  // --- Estado usuario (mezcla: perfil guardado + odg_name/odg_email + demo)
  const P = getProfile();
  const USER = {
    name:   P.nombre || localStorage.getItem('odg_name')  || 'Usuario Demo',
    email:  P.email  || localStorage.getItem('odg_email') || 'demo@odontogo.com',
    avatar: localStorage.getItem('odg_avatar') || '../img/user-placeholder.png',
    phone:  P.telefono || DEMO.phone,
    birth:  P.nacimiento || DEMO.birth,
    location: P.ubicacion || DEMO.location
  };

  const DATA = {
    user: USER,
    favoritos: [
      { name: "DentiSalud", logo: "../img/dentisalud.png", liked: true },
      { name: "BD Odont",   logo: "../img/bdodont.png",    liked: true }
    ],
    agenda: [
      { fecha: "05/10/2025", hora: "10:00 AM", especialista: "Dr. Pérez" },
      { fecha: "12/11/2025", hora: "3:00 PM",  especialista: "Dra. López" }
    ],
    historial: {
      citas: [
        "10/05/2025 – Limpieza dental – Dra. María López",
        "15/02/2025 – Consulta ortodoncia – Dr. Alejandro Pérez"
      ],
      tratamientos: [
        "Blanqueamiento dental (2023)",
        "Extracción de cordal superior izquierda (2024)"
      ],
      documentos: [
        "Radiografía panorámica (PDF – 2024)",
        "Consentimiento informado (PDF – 2025)"
      ]
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
      { titulo: "La Candelaria", img: "../img/candelaria.jpg",    texto: "Centro turístico y cultural icónico." },
      { titulo: "Plaza Bolívar", img: "../img/plaza-bolivar.jpg", texto: "Corazón histórico de Bogotá." }
    ]
  };

  // --- Helpers DOM
  const $  = (s, root = document) => root.querySelector(s);
  const $all = (s, root = document) => [...root.querySelectorAll(s)];
  const getTab = () => (new URLSearchParams(location.search).get('tab') || 'info');

  // --- Cabecera aside
  function paintHeader() {
    $('#pf-avatar').src = DATA.user.avatar || '../img/user-placeholder.png';
    $('#pf-name').textContent = DATA.user.name || 'Usuario';
    $('#pf-mail').textContent = DATA.user.email || '';
  }

  // --- Renderers
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

  function rFavoritos() {
    const items = DATA.favoritos.map(f => `
      <div class="card" style="display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${f.logo}" alt="${f.name}" style="width:120px; height:70px; object-fit:contain; border-radius:12px; background:#fff;">
          <div><strong>${f.name}</strong><div class="muted">Clínica favorita</div></div>
        </div>
        <span class="pill">${f.liked ? '❤' : '♡'} Favorito</span>
      </div>
    `).join('');
    return `<div class="panel padded"><h2 class="section-title">Favoritos</h2><div class="grid2">${items}</div></div>`;
  }

  function rAgenda() {
    const cards = DATA.agenda.map(c => `
      <div class="card">
        <div><strong>Fecha:</strong> ${c.fecha}</div>
        <div><strong>Hora:</strong> ${c.hora}</div>
        <div><strong>Especialista:</strong> ${c.especialista}</div>
        <div style="margin-top:10px; display:flex; gap:8px;">
          <button class="btn outline">Cancelar/Reagendar</button>
        </div>
      </div>
    `).join('');

    return `
      <div class="panel padded">
        <div class="topbar">
          <h2 class="section-title">Agenda</h2>
          <button class="btn">Agendar nueva cita</button>
        </div>

        <div class="grid2">
          <div>${cards}</div>

          <!-- Calendario mini -->
          <div class="card">
            <div class="muted" style="margin-bottom:8px;">Calendario</div>
            <div id="mini-cal" class="cal cal-mini" aria-label="Calendario (mini)"></div>
            <div class="cal-foot">
              <button id="cal-open" class="cal-open-link" type="button" aria-controls="cal-modal">
                Hacer clic para ampliar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal con calendario grande + detalle + leyenda -->
      <div id="cal-modal" class="cal-modal" hidden>
        <div class="backdrop" data-cal-dismiss></div>
        <div class="dialog">
          <div class="head">
            <h3 class="section-title" style="margin:0;">Agenda</h3>
            <button class="close" data-cal-dismiss aria-label="Cerrar">✕</button>
          </div>

          <div class="cal-layout">
            <div id="full-cal" class="cal cal-full" aria-label="Calendario (ampliado)"></div>

            <aside id="cal-detail" class="day-detail" aria-live="polite">
              <!-- se llena por JS -->
            </aside>
          </div>

          <div class="cal-legend">
            <div class="item"><span class="sw sw-booked"></span><span>Cita</span></div>
            <div class="item"><span class="sw sw-blocked"></span><span>No disponible</span></div>
            <div class="item"><span class="sw sw-holiday"></span><span>Festividades</span></div>
          </div>
        </div>
      </div>
    `;
  }

  function rHistorial() {
    const li = arr => arr.map(t => `<li>${t}</li>`).join('');
    return `
      <div class="panel padded">
        <h2 class="section-title">Historial</h2>
        <div class="card"><h3 style="margin:0 0 8px;">Citas anteriores</h3><ul>${li(DATA.historial.citas)}</ul></div>
        <div class="card"><h3 style="margin:0 0 8px;">Tratamientos realizados</h3><ul>${li(DATA.historial.tratamientos)}</ul></div>
        <div class="card"><h3 style="margin:0 0 8px;">Documentos clínicos</h3><ul>${li(DATA.historial.documentos)}</ul></div>
      </div>`;
  }

  function rPagos() {
    // historial de facturas
    const f = DATA.pagos.facturas.map(x => {
      const pillCls =
        x.estado === 'Pagada'    ? '' :
        x.estado === 'Pendiente' ? 'pendiente' : 'cancelada';

      const actions = x.estado === 'Pendiente'
        ? `<div style="display:flex; gap:8px;">
             <button class="btn sm" data-pay="${x.n}">Pagar</button>
             <button class="btn outline sm" data-cancel="${x.n}">Cancelar</button>
           </div>`
        : '';

      const bg = x.estado==='Pagada' ? '#eaf8f2' : (x.estado==='Pendiente' ? '#fff4e6' : '#f4e7e7');
      const col= x.estado==='Pagada' ? '#108f63' : (x.estado==='Pendiente' ? '#a96400' : '#a33434');

      return `
        <div class="row" data-row="${x.n}">
          <div>${x.n} – <strong>${x.monto}</strong> – ${x.fecha}</div>
          <div style="display:flex; gap:10px; align-items:center;">
            <div class="pill ${pillCls}" style="background:${bg}; color:${col}">${x.estado}</div>
            ${actions}
          </div>
        </div>`;
    }).join('');

    // tratamientos comprados
    const t = DATA.pagos.comprados.map(x => `
      <div class="row"><div>${x.nombre}</div><div class="muted">${x.estado}</div></div>
    `).join('');

    // modal de pago
    const modal = `
      <div id="pay-modal" class="pay-modal" hidden>
        <div class="backdrop" data-pay-dismiss></div>
        <div class="dialog">
          <div class="head">
            <h3 class="section-title" style="margin:0;">Pago de factura</h3>
            <button class="close" data-pay-dismiss aria-label="Cerrar">✕</button>
          </div>

          <div class="pay-grid">
            <form id="pay-form">
              <input type="hidden" name="facturaN" id="facturaN">
              <div class="card">
                <div class="field">
                  <label>Nombre en la tarjeta</label>
                  <input name="cardname" required />
                </div>
                <div class="field">
                  <label>Número de tarjeta</label>
                  <input name="cardnumber" inputmode="numeric" maxlength="19" placeholder="4111 1111 1111 1111" required />
                </div>

                <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
                  <div class="field">
                    <label>Mes</label>
                    <select name="expmonth">
                      ${Array.from({length:12},(_,i)=>`<option value="${String(i+1).padStart(2,'0')}">${String(i+1).padStart(2,'0')}</option>`).join('')}
                    </select>
                  </div>
                  <div class="field">
                    <label>Año</label>
                    <select name="expyear">
                      ${Array.from({length:12},(_,i)=>`<option>${new Date().getFullYear()+i}</option>`).join('')}
                    </select>
                  </div>
                  <div class="field">
                    <label>CVV</label>
                    <input name="cvv" inputmode="numeric" maxlength="4" required />
                  </div>
                </div>

                <div class="field">
                  <label>Email</label>
                  <input name="email" type="email" required />
                </div>
                <div class="field">
                  <label>Celular</label>
                  <input name="phone" type="tel" />
                </div>

                <div style="display:flex; gap:8px; justify-content:flex-end; margin-top:10px;">
                  <button type="button" class="btn outline" data-pay-dismiss>Cancelar</button>
                  <button type="submit" class="btn">Pagar</button>
                </div>
              </div>
            </form>

            <aside class="card" id="pay-summary">
              <!-- se llena por JS -->
            </aside>
          </div>
        </div>
      </div>`;

    return `
      <div class="panel padded">
        <h2 class="section-title">Pagos</h2>
        <div class="card">
          <h3 style="margin:0 0 8px;">Historial de pagos</h3>
          <div class="table-like">${f}</div>
        </div>
        <div class="card">
          <h3 style="margin:0 0 8px;">Tratamientos comprados</h3>
          <div class="table-like">${t}</div>
        </div>
      </div>
      ${modal}
    `;
  }

  function rConfig() {
    return `
      <div class="panel padded">
        <h2 class="section-title">Configuración</h2>
        <div class="card">
          <div class="table-like">
            <div class="row"><div>Cambiar contraseña</div><button class="btn outline">Cambiar</button></div>
            <div class="row"><div>Idioma</div><button class="btn outline">Español</button></div>
            <div class="row"><div>Privacidad</div><button class="btn outline">Abrir</button></div>
            <div class="row"><div>Cerrar sesión</div><button class="btn" id="btn-logout">Cerrar sesión</button></div>
          </div>
        </div>
      </div>`;
  }

  function rRecom() {
    const items = DATA.recomendaciones.map(r => `
      <div class="card">
        <div class="pill">Lugares cercanos</div>
        <h3 style="margin:10px 0 6px;">${r.titulo}</h3>
        <p class="muted">${r.texto}</p>
        <img src="${r.img}" alt="${r.titulo}" style="width:100%; height:220px; object-fit:cover; border-radius:12px; margin-top:8px;">
      </div>
    `).join('');
    return `<div class="panel padded"><h2 class="section-title">Recomendaciones</h2><div class="grid2">${items}</div></div>`;
  }

  // ====== CALENDARIO + ESTADOS ======
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DOW   = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];

  const toISO = (d) => {
    const y=d.getFullYear(), m=String(d.getMonth()+1).padStart(2,'0'), da=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${da}`;
  };
  const parseDDMMYYYY = (s) => {
    const [d,m,y] = s.split('/').map(n=>+n);
    return new Date(y, m-1, d);
  };

  function daysInMonth(y,m){ return new Date(y, m+1, 0).getDate(); }
  function addMonths(d, n){ const a = new Date(d); a.setMonth(a.getMonth()+n); return a; }
  function isSameDate(a,b){ return a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

  /* === fuentes de datos demo === */
  const BOOKED_SET  = new Set(DATA.agenda.map(a => toISO(parseDDMMYYYY(a.fecha))));   // citas agendadas
  const BLOCKED_SET = new Set(['2025-10-06','2025-10-07','2025-10-20','2025-10-25']); // no disponibles
  const HOLIDAY_SET = new Set(['2025-10-12','2025-10-31']);                            // festivos

  function getStatus(dateObj){
    const k = toISO(dateObj);
    if (BOOKED_SET.has(k))  return 'booked';
    if (BLOCKED_SET.has(k)) return 'blocked';
    if (HOLIDAY_SET.has(k)) return 'holiday';
    return '';
  }

  function buildCalendarHTML(state){
    const y = state.view.getFullYear();
    const m = state.view.getMonth();
    const first = new Date(y, m, 1);
    const startCol = first.getDay(); // 0=Dom
    const prevDays = daysInMonth(y, m-1);
       const thisDays = daysInMonth(y, m);
    const today = new Date();

    let html = `
      <div class="cal-head">
        <div class="cal-title">${MESES[m]} ${y}</div>
        <div class="cal-nav">
          <button type="button" data-cal-prev aria-label="Mes anterior">◀</button>
          <button type="button" data-cal-next aria-label="Mes siguiente">▶</button>
        </div>
      </div>
      <div class="cal-grid">`;

    html += DOW.map(d => `<div class="cal-dow">${d}</div>`).join('');

    for(let i=0;i<42;i++){
      const cellIndex = i - startCol + 1;
      let day, cm, cy, other=false;
      if (cellIndex < 1){ day = prevDays + cellIndex; cm = m-1; cy = y; other=true; }
      else if (cellIndex > thisDays){ day = cellIndex - thisDays; cm = m+1; cy = y; other=true; }
      else { day = cellIndex; cm = m; cy = y; }

      const dObj = new Date(cy, cm, day);
      const status = getStatus(dObj);
      const classes = [
        'cal-day',
        other ? 'is-other' : '',
        isSameDate(dObj, today) ? 'is-today' : '',
        status ? `is-${status}` : '',
        isSameDate(dObj, state.selected) ? 'is-selected' : ''
      ].join(' ').trim();

      html += `<button type="button" class="${classes}" data-cal-day data-y="${cy}" data-m="${cm}" data-d="${day}">${day}</button>`;
    }
    html += `</div>`;
    return html;
  }

  function renderDayDetail(state){
    const box = document.getElementById('cal-detail');
    if(!box) return;

    const d = state.selected || new Date();
    const iso = toISO(d);
    const status = getStatus(d);

    // busca citas de ese día
    const citas = DATA.agenda.filter(a => toISO(parseDDMMYYYY(a.fecha)) === iso);

    let content = `
      <h4>Datos del día seleccionado</h4>
      <div class="muted" style="margin-bottom:6px;">${d.toLocaleDateString('es-CO', {weekday:'long', day:'2-digit', month:'long', year:'numeric'})}</div>
    `;

    if (status === 'booked' && citas.length){
      const li = citas.map(c => `
        <div style="border:1px solid #e7eef3; border-radius:10px; padding:10px; margin:8px 0;">
          <div><strong>Hora:</strong> ${c.hora}</div>
          <div><strong>Especialista:</strong> ${c.especialista}</div>
          <div><strong>Lugar:</strong> Clínica favorita</div>
        </div>
      `).join('');
      content += `<div class="pill" style="margin-bottom:6px;">Cita programada</div>${li}
                  <button class="btn outline" style="margin-top:6px;">Editar Perfil</button>`;
    } else if (status === 'blocked'){
      content += `<div class="pill" style="background:#fff4e6; color:#a96400; margin-bottom:6px;">No disponible</div>
                  <p class="muted">Este día no se pueden agendar citas.</p>`;
    } else if (status === 'holiday'){
      content += `<div class="pill" style="background:#e6fbfd; color:#0ea4ac; margin-bottom:6px;">Festividad</div>
                  <p class="muted">La agenda puede variar por día festivo.</p>`;
    } else {
      content += `<div class="pill" style="margin-bottom:6px;">Disponible</div>
                  <p class="muted">No tienes citas para este día. Puedes agendar una nueva.</p>
                  <button class="btn" style="margin-top:6px;">Agendar nueva cita</button>`;
    }

    box.innerHTML = content;
  }

  function openCalendarModal(state){
    const modal = document.getElementById('cal-modal');
    const full  = document.getElementById('full-cal');
    if(!modal || !full) return;
    modal.hidden = false;
    mountCalendar(full, state, {mode:'full'});
    renderDayDetail(state);
    const onEsc = (e)=>{ if(e.key==='Escape'){ closeCalendarModal(); document.removeEventListener('keydown', onEsc); } };
    document.addEventListener('keydown', onEsc);
  }
  function closeCalendarModal(){
    const modal = document.getElementById('cal-modal');
    if(modal) modal.hidden = true;
  }

  function mountCalendar(container, state, {mode='mini'}={}){
    if(!container) return;
    container.innerHTML = buildCalendarHTML(state);

    container.querySelector('[data-cal-prev]')?.addEventListener('click', ()=>{
      state.view = addMonths(state.view, -1);
      mountCalendar(container, state, {mode});
      if (mode==='full') renderDayDetail(state);
    });
    container.querySelector('[data-cal-next]')?.addEventListener('click', ()=>{
      state.view = addMonths(state.view, +1);
      mountCalendar(container, state, {mode});
      if (mode==='full') renderDayDetail(state);
    });

    container.querySelectorAll('[data-cal-day]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const y = +btn.dataset.y, m = +btn.dataset.m, d = +btn.dataset.d;
        state.selected = new Date(y,m,d);
        state.view = new Date(y,m,1);
        mountCalendar(container, state, {mode});
        if (mode==='full') renderDayDetail(state);
      });
    });
  }

  function initAgendaCalendar(){
    const state = { view: new Date(), selected: null };

    const mini = document.getElementById('mini-cal');
    if (mini){ mountCalendar(mini, state, {mode:'mini'}); }

    // Abrir modal SOLO al hacer clic en el texto
    document.getElementById('cal-open')?.addEventListener('click', (e)=>{
      e.preventDefault();
      openCalendarModal(state);
    });

    // Cerrar modal con fondo o botón
    document.querySelectorAll('[data-cal-dismiss]').forEach(el=>{
      el.addEventListener('click', closeCalendarModal);
    });
  }

  const RENDERS = { info: rInfo, favoritos: rFavoritos, agenda: rAgenda, historial: rHistorial, pagos: rPagos, configuracion: rConfig, recomendaciones: rRecom };

  /* ===== Persistencia simple de estado de facturas (se resetea arriba) ===== */
  function applyPersistedPayments(){
    try {
      const map = JSON.parse(localStorage.getItem('odg_invoices')||'{}');
      DATA.pagos.facturas.forEach(f => { if (map[f.n]) f.estado = map[f.n]; });
    } catch {}
  }
  function persistInvoiceStatus(n, estado){
    try {
      const map = JSON.parse(localStorage.getItem('odg_invoices')||'{}');
      map[n] = estado;
      localStorage.setItem('odg_invoices', JSON.stringify(map));
    } catch {}
  }

  /* ===== UI de pagos ===== */
  function openPayModal(factura){
    const modal = document.getElementById('pay-modal');
    const form  = document.getElementById('pay-form');
    const sum   = document.getElementById('pay-summary');

    // Datos demo precargados
    form.facturaN.value = factura.n;
    form.cardname.value = "Juan Pablo Castañeda";
    form.cardnumber.value = "4111 1111 1111 1111";   // Visa de prueba
    form.expmonth.value = "12";
    form.expyear.value  = String(new Date().getFullYear()+3);
    form.cvv.value      = "123";
    form.email.value    = DATA.user.email || "demo@odontogo.com";
    form.phone.value    = DATA.user.phone || "+57 312 555 0101";

    sum.innerHTML = `
      <h3 class="section-title" style="margin:0 0 6px;">Resumen del pago</h3>
      <div class="muted">Factura: <strong>${factura.n}</strong></div>
      <div class="muted">Emitida: ${factura.fecha}</div>
      <hr style="border:none; border-top:1px solid #e7eef3; margin:10px 0;">
      <div style="display:flex; justify-content:space-between;">
        <div>Total</div><div><strong>${factura.monto}</strong></div>
      </div>
      <p class="muted" style="margin-top:8px;">*Simulación: no se procesa ningún cobro real.</p>
    `;

    // abrir
    modal.hidden = false;

    // submit
    form.onsubmit = (e)=>{
      e.preventDefault();

      // Validación mínima
      const digits = form.cardnumber.value.replace(/\D/g,'');
      if (digits.length < 13 || digits.length > 19){
        alert('Número de tarjeta inválido'); return;
      }
      if (!/^\d{3,4}$/.test(form.cvv.value)) { alert('CVV inválido'); return; }
      if (!/\S+@\S+\.\S+/.test(form.email.value)) { alert('Email inválido'); return; }

      // marcar como pagada
      setInvoiceStatus(factura.n, 'Pagada');
      modal.hidden = true;
      // recargar solo la pestaña
      const url = new URL(location.href);
      url.searchParams.set('tab','pagos');
      history.replaceState({tab:'pagos'},'',url);
      // re-render
      document.getElementById('pf-view').innerHTML = rPagos();
      wirePaymentsUI(); // volver a cablear botones
    };
  }

  function setInvoiceStatus(n, estado){
    const f = DATA.pagos.facturas.find(x => x.n === n);
    if (f){ f.estado = estado; persistInvoiceStatus(n, estado); }
  }

  function wirePaymentsUI(){
    // Botones Pagar
    document.querySelectorAll('[data-pay]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const n = btn.getAttribute('data-pay');
        const f = DATA.pagos.facturas.find(x => x.n === n);
        if (f) openPayModal(f);
      });
    });
    // Botones Cancelar
    document.querySelectorAll('[data-cancel]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const n = btn.getAttribute('data-cancel');
        if (confirm('¿Cancelar esta factura?')){
          setInvoiceStatus(n, 'Cancelada');
          // re-render
          document.getElementById('pf-view').innerHTML = rPagos();
          wirePaymentsUI();
        }
      });
    });
    // Cerrar modal
    document.querySelectorAll('[data-pay-dismiss]').forEach(el=>{
      el.addEventListener('click', ()=>{ document.getElementById('pay-modal').hidden = true; });
    });
  }

  // --- Router simple
  function go(tab, push = false) {
    const fn = RENDERS[tab] || RENDERS.info;
    $('#pf-view').innerHTML = fn();

    // activar item en aside
    $all('#pf-menu li').forEach(li => li.classList.toggle('active', li.dataset.tab === tab));

    // actualizar URL sin recargar
    const url = new URL(location.href);
    url.searchParams.set('tab', tab);
    (push ? history.pushState : history.replaceState).call(history, { tab }, '', url);

    // wire: logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', () => {
        if (window.__odgAuth?.clearSession) {
          window.__odgAuth.clearSession();
        } else {
          try {
            localStorage.removeItem('odg_auth');
            localStorage.removeItem('odg_name');
            localStorage.removeItem('odg_email');
            localStorage.removeItem('odg_avatar');
            // Por si acaso, limpiar también los pagos persistidos
            localStorage.removeItem('odg_invoices');
          } catch {}
        }
        location.href = './Perfil.html';
      });
    }

    // ⚠️ Por si usas el botón del NAVBAR (id="pm-auth") para cerrar sesión:
    const pmAuth = document.getElementById('pm-auth');
    if (pmAuth && pmAuth.textContent.toLowerCase().includes('cerrar')) {
      pmAuth.addEventListener('click', () => {
        try { localStorage.removeItem('odg_invoices'); } catch {}
      });
    }

    // wire: EDITAR PERFIL → página de edición
    const btnEdit = document.getElementById('btn-edit');
    if (btnEdit) {
      const back = './PerfilC.html?tab=info';
      btnEdit.addEventListener('click', () => {
        location.href = `./PerfilEditar.html?return=${encodeURIComponent(back)}`;
      });
    }

    // Si estamos en Agenda, montar calendario
    if (tab === 'agenda') initAgendaCalendar();

    // Si estamos en Pagos, cablear botones de pago/cancelar + modal
    if (tab === 'pagos') wirePaymentsUI();
  }

  // --- Init
  document.addEventListener('DOMContentLoaded', () => {
    paintHeader();
    $all('#pf-menu li').forEach(li => li.addEventListener('click', () => go(li.dataset.tab, true)));
    go(getTab());
    window.addEventListener('popstate', () => go(getTab()));
  });
})();
