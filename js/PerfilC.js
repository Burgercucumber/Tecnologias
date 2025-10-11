// js/perfilC.js
(function () {
  // ----- Seguridad adicional: si no hay sesión, reenvía a Perfil.html
  try {
    if (localStorage.getItem('odg_auth') !== '1') {
      location.replace('./Perfil.html');
      return;
    }
  } catch {}

  // ------- Datos DEMO (para completar info que no guardamos en localStorage) -------
  const DEMO = {
    phone: "312 555 0101",
    birth: "30/10/2000",
    location: "Debajo de un puente",
  };

  // ------- Estado usuario desde localStorage + demo -------
  const USER = {
    name:  localStorage.getItem('odg_name')   || 'Usuario Demo',
    email: localStorage.getItem('odg_email')  || 'demo@odonto.go',
    avatar:localStorage.getItem('odg_avatar') || '../img/user-placeholder.png',
    phone: DEMO.phone,
    birth: DEMO.birth,
    location: DEMO.location
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

  // ------- Utilidades -------
  const $ = (s, root = document) => root.querySelector(s);
  const $all = (s, root = document) => [...root.querySelectorAll(s)];
  const getTab = () => (new URLSearchParams(location.search).get('tab') || 'info');

  // ------- Pintar cabecera del aside -------
  function paintHeader() {
    $('#pf-avatar').src = DATA.user.avatar || '../img/user-placeholder.png';
    $('#pf-name').textContent = DATA.user.name || 'Usuario';
    $('#pf-mail').textContent = DATA.user.email || '';
  }

  // ------- Renderizadores de secciones -------
  function rInfo() {
    return `
      <div class="panel padded">
        <div class="topbar">
          <h2 class="section-title">Información</h2>
          <button class="btn outline" id="btn-edit">Editar Perfil</button>
        </div>
        <div class="card">
          <div style="display:flex; gap:16px; align-items:center; margin-bottom:16px;">
            <img class="avatar-lg" src="${DATA.user.avatar}" alt="avatar">
            <div>
              <div style="font-size:1.1rem; font-weight:800;">Datos Personales</div>
              <div class="muted">Resumen de tu perfil</div>
            </div>
          </div>
          <div class="grid2">
            <div>
              <div class="kpi"><span class="dot"></span><strong>Nombre:</strong>&nbsp; ${DATA.user.name}</div>
              <div class="kpi"><span class="dot"></span><strong>Correo:</strong>&nbsp; <a href="mailto:${DATA.user.email}">${DATA.user.email}</a></div>
              <div class="kpi"><span class="dot"></span><strong>Teléfono:</strong>&nbsp; ${DATA.user.phone}</div>
            </div>
            <div>
              <div class="kpi"><span class="dot"></span><strong>Fecha de nacimiento:</strong>&nbsp; ${DATA.user.birth}</div>
              <div class="kpi"><span class="dot"></span><strong>Ubicación:</strong>&nbsp; ${DATA.user.location}</div>
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
    return `
      <div class="panel padded">
        <h2 class="section-title">Favoritos</h2>
        <div class="grid2">${items}</div>
      </div>`;
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
          <div class="card">
            <div class="muted">Calendario (demo)</div>
            <div style="height:320px; background:linear-gradient(#f9fcff,#eef6fb); border-radius:12px; margin-top:10px;"></div>
          </div>
        </div>
      </div>`;
  }

  function rHistorial() {
    const li = arr => arr.map(t => `<li>${t}</li>`).join('');
    return `
      <div class="panel padded">
        <h2 class="section-title">Historial</h2>
        <div class="card">
          <h3 style="margin:0 0 8px;">Citas anteriores</h3>
          <ul>${li(DATA.historial.citas)}</ul>
        </div>
        <div class="card">
          <h3 style="margin:0 0 8px;">Tratamientos realizados</h3>
          <ul>${li(DATA.historial.tratamientos)}</ul>
        </div>
        <div class="card">
          <h3 style="margin:0 0 8px;">Documentos clínicos</h3>
          <ul>${li(DATA.historial.documentos)}</ul>
        </div>
      </div>`;
  }

  function rPagos() {
    const f = DATA.pagos.facturas.map(x => `
      <div class="row">
        <div>${x.n} – <strong>${x.monto}</strong> – ${x.fecha}</div>
        <div class="pill" style="background:${x.estado==='Pagada'?'#eaf8f2':'#fff4e6'};color:${x.estado==='Pagada'?'#108f63':'#a96400'}">${x.estado}</div>
      </div>
    `).join('');
    const t = DATA.pagos.comprados.map(x => `
      <div class="row"><div>${x.nombre}</div><div class="muted">${x.estado}</div></div>
    `).join('');
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
      </div>`;
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
    return `
      <div class="panel padded">
        <h2 class="section-title">Recomendaciones</h2>
        <div class="grid2">${items}</div>
      </div>`;
  }

  const RENDERS = {
    info: rInfo,
    favoritos: rFavoritos,
    agenda: rAgenda,
    historial: rHistorial,
    pagos: rPagos,
    configuracion: rConfig,
    recomendaciones: rRecom
  };

  // ------- Router simple -------
  function go(tab, push = false) {
    const fn = RENDERS[tab] || RENDERS.info;
    $('#pf-view').innerHTML = fn();

    // activar item en aside
    $all('#pf-menu li').forEach(li => li.classList.toggle('active', li.dataset.tab === tab));

    // actualizar URL (sin recargar)
    const url = new URL(location.href);
    url.searchParams.set('tab', tab);
    (push ? history.pushState : history.replaceState).call(history, { tab }, '', url);

    // wire del logout
    const btn = document.getElementById('btn-logout');
    if (btn) {
      btn.addEventListener('click', () => {
        if (window.__odgAuth?.clearSession) {
          window.__odgAuth.clearSession();
        } else {
          try {
            localStorage.removeItem('odg_auth');
            localStorage.removeItem('odg_name');
            localStorage.removeItem('odg_email');
            localStorage.removeItem('odg_avatar');
          } catch {}
        }
        location.href = './Perfil.html';
      });
    }
  }

  // ------- Init -------
  document.addEventListener('DOMContentLoaded', () => {
    paintHeader();

    // clicks del menú lateral
    $all('#pf-menu li').forEach(li => {
      li.addEventListener('click', () => go(li.dataset.tab, true));
    });

    // primer render según ?tab=
    go(getTab());

    // soporte back/forward
    window.addEventListener('popstate', () => go(getTab()));
  });
})();
