// js/perfil.js
// Control de pestañas + render con datos de demo si hay sesión

(() => {
  // Helpers de sesión expuestos por session-ui.js
  const auth = window.__odgAuth || {};
  const isLogged = typeof auth.isLogged === 'function' ? auth.isLogged : () => false;

  // ------------- Datos DEMO (se usan solo si hay sesión) -----------------
  const DEMO = {
    usuario: {
      nombre: "Juan Pablo Castaño Valderrama",
      email: "mcvent.slot@gmail.com",
      telefono: "321 555 7788",
      nacimiento: "30/10/2000",
      ubicacion: "Debajo de un puente",
      avatar: "../img/user-placeholder.png"
    },
    favoritos: [
      { nombre: "DentiSalud", logo: "../img/dentisalud.png" },
      { nombre: "BD Odont", logo: "../img/bdodont.png" }
    ],
    agenda: [
      { fecha: "05/10/2025", hora: "10:00 AM", especialista: "Dr. Perez" },
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
        { id: "#12345", valor: "$200.000", fecha: "10/05/2025", estado: "Pagada" },
        { id: "#12346", valor: "$1.200.000", fecha: "15/02/2025", estado: "Pendiente" }
      ],
      compras: [
        { nombre: "Plan Ortodoncia Invisible", estado: "en curso" },
        { nombre: "Blanqueamiento", estado: "Pagado y realizado" }
      ]
    },
    recomendaciones: [
      {
        titulo: "La Candelaria",
        texto:
          "Centro turístico, educativo y comercial con historia, artesanías e interés cultural.",
        img: "../img/reco-candelaria.jpg"
      },
      {
        titulo: "Plaza Bolívar",
        texto: "Un lugar icónico rodeado de edificios históricos y vida urbana.",
        img: "../img/reco-plaza.jpg"
      }
    ]
  };

  // -------------------- Utilidades UI ------------------------------------
  const qs  = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => r.querySelectorAll(s);

  const sideUserName = qs('.menu-lateral .usuario h3');
  const sideUserImg  = qs('.menu-lateral .usuario img');

  const sections = {
    info:           qs('#info'),
    favoritos:      qs('#favoritos'),
    historial:      qs('#historial'),
    agenda:         qs('#agenda'),
    pagos:          qs('#pagos'),
    configuracion:  qs('#configuracion'),
    recomendaciones:qs('#recomendaciones')
  };

  function setActiveSection(id) {
    Object.values(sections).forEach(sec => sec && sec.classList.remove('active'));
    if (sections[id]) sections[id].classList.add('active');

    // Marca opción activa en el menú lateral
    qsa('.menu-lateral .opciones li, .menu-lateral .recomendaciones').forEach(li => {
      li.classList.toggle('active', li.dataset.section === id);
    });
  }

  function getTabFromURL() {
    const p = new URLSearchParams(location.search);
    return p.get('tab') || 'info';
  }

  // -------------------- Render de cada sección ----------------------------
  function renderInfo(logged) {
    const el = sections.info;
    if (!el) return;
    if (!logged) {
      el.innerHTML = `
        <svg class="icono" viewBox="0 0 24 24"><!-- ícono --></svg>
        <p>Aquí aparecerán tus datos personales y médicos básicos cuando crees tu cuenta.</p>`;
      return;
    }
    const u = DEMO.usuario;
    el.innerHTML = `
      <h2>Información</h2>
      <div class="card sombra" style="max-width:900px;margin-top:12px;">
        <div style="display:flex;gap:24px;align-items:center;padding:20px;">
          <img src="${u.avatar}" alt="Avatar" style="width:84px;height:84px;border-radius:50%;object-fit:cover;">
          <div>
            <h3 style="margin:0 0 8px;">Datos Personales</h3>
            <p><strong>Nombre:</strong> ${u.nombre}</p>
            <p><strong>Correo:</strong> <a href="mailto:${u.email}">${u.email}</a></p>
            <p><strong>Teléfono:</strong> ${u.telefono}</p>
            <p><strong>Fecha de nacimiento:</strong> ${u.nacimiento}</p>
            <p><strong>Ubicación:</strong> ${u.ubicacion}</p>
          </div>
        </div>
        <div style="padding:0 20px 20px;">
          <button class="btn-primario">Editar perfil</button>
        </div>
      </div>`;
  }

  function renderFavoritos(logged) {
    const el = sections.favoritos;
    if (!el) return;
    if (!logged) {
      el.innerHTML = `<p>Guarda tus clínicas y tratamientos favoritos para tenerlos siempre a la mano.</p>`;
      return;
    }
    el.innerHTML = `
      <h2>Favoritos</h2>
      <div class="grid-logos" style="margin-top:12px;"></div>`;
    const grid = qs('.grid-logos', el);
    DEMO.favoritos.forEach(f => {
      const card = document.createElement('div');
      card.className = 'logo-card';
      card.style.padding = '14px';
      card.style.position = 'relative';
      card.innerHTML = `
        <img src="${f.logo}" alt="${f.nombre}" style="max-height:90px;object-fit:contain">
        <span style="position:absolute;top:10px;right:10px;font-size:18px;">💚</span>`;
      grid.appendChild(card);
    });
  }

  function renderHistorial(logged) {
    const el = sections.historial;
    if (!el) return;
    if (!logged) {
      el.innerHTML = `<p>Consulta tus tratamientos anteriores y el historial de tus citas.</p>`;
      return;
    }
    const h = DEMO.historial;
    el.innerHTML = `
      <h2>Historial</h2>
      <div class="card sombra" style="padding:20px;max-width:900px;margin-top:12px;">
        <h3>Citas Anteriores</h3>
        <ul>${h.citas.map(x => `<li>🦷 ${x}</li>`).join('')}</ul>
        <h3 style="margin-top:18px;">Tratamientos Realizados</h3>
        <ul>${h.tratamientos.map(x => `<li>🩺 ${x}</li>`).join('')}</ul>
        <h3 style="margin-top:18px;">Documentos Clínicos</h3>
        <ul>${h.documentos.map(x => `<li>📄 ${x}</li>`).join('')}</ul>
      </div>`;
  }

  function renderAgenda(logged) {
    const el = sections.agenda;
    if (!el) return;
    if (!logged) {
      el.innerHTML = `<p>Cuando tengas cuenta podrás agendar y gestionar tus citas fácilmente.</p>`;
      return;
    }
    el.innerHTML = `
      <h2>Agenda</h2>
      <div class="lista-citas" style="display:grid;gap:14px;margin-top:12px;max-width:900px;"></div>
      <div style="margin-top:12px;">
        <button class="btn-primario">Agendar nueva cita</button>
      </div>`;
    const list = qs('.lista-citas', el);
    DEMO.agenda.forEach(c => {
      const item = document.createElement('div');
      item.className = 'card sombra';
      item.style.padding = '14px';
      item.innerHTML = `
        <p><strong>Fecha:</strong> ${c.fecha}</p>
        <p><strong>Hora:</strong> ${c.hora}</p>
        <p><strong>Especialista:</strong> ${c.especialista}</p>
        <div style="margin-top:8px;">
          <button class="btn-secundario">Cancelar/Reagendar</button>
        </div>`;
      list.appendChild(item);
    });
  }

  function renderPagos(logged) {
    const el = sections.pagos;
    if (!el) return;
    if (!logged) {
      el.innerHTML = `<p>Aquí se mostrarán tus facturas, pagos realizados y tratamientos comprados.</p>`;
      return;
    }
    const p = DEMO.pagos;
    el.innerHTML = `
      <h2>Pagos</h2>
      <div class="card sombra" style="padding:18px;max-width:900px;margin-top:12px;">
        <h3>Historial de Pagos</h3>
        <ul>
          ${p.facturas.map(f => `<li>🧾 ${f.id} – <strong>${f.valor}</strong> – ${f.fecha} – <em>${f.estado}</em></li>`).join('')}
        </ul>
        <h3 style="margin-top:16px;">Tratamientos Comprados</h3>
        <ul>
          ${p.compras.map(c => `<li>🦷 ${c.nombre} – <em>${c.estado}</em></li>`).join('')}
        </ul>
      </div>`;
  }

  function renderConfiguracion(logged) {
    const el = sections.configuracion;
    if (!el) return;
    el.innerHTML = `
      <h2>Configuración</h2>
      <div class="card sombra" style="padding:16px;max-width:600px;margin-top:12px;">
        <ul>
          <li>Cambiar contraseña</li>
          <li>Idioma</li>
          <li>Privacidad</li>
          <li>${logged ? '<button id="btn-logout" class="btn-secundario">Cerrar sesión</button>' : '—'}</li>
        </ul>
      </div>`;
    const btnLogout = qs('#btn-logout', el);
    if (btnLogout && typeof auth.clearSession === 'function') {
      btnLogout.addEventListener('click', () => {
        auth.clearSession();
        location.href = '../index.html';
      });
    }
  }

  function renderRecomendaciones(logged) {
    const el = sections.recomendaciones;
    if (!el) return;
    if (!logged) {
      el.innerHTML = `<p>Accede a recomendaciones de lugares cercanos a tu clínica una vez tengas cuenta.</p>`;
      return;
    }
    el.innerHTML = `
      <h2>Recomendaciones</h2>
      <div class="reco-list" style="display:grid;gap:16px;margin-top:12px;max-width:900px;"></div>`;
    const list = qs('.reco-list', el);
    DEMO.recomendaciones.forEach(r => {
      const item = document.createElement('div');
      item.className = 'card sombra';
      item.style.padding = '16px';
      item.innerHTML = `
        <h3>${r.titulo}</h3>
        <p>${r.texto}</p>
        ${r.img ? `<img src="${r.img}" alt="${r.titulo}" style="width:100%;max-height:260px;object-fit:cover;border-radius:12px;">` : ''}`;
      list.appendChild(item);
    });
  }

  // -------------------- Init ----------------------------------------------
  function mountSidebarUser(logged) {
    if (!sideUserName || !sideUserImg) return;
    if (!logged) return;
    sideUserName.textContent = DEMO.usuario.nombre;
    sideUserImg.src = DEMO.usuario.avatar;
  }

  function render(tab) {
    const logged = isLogged();
    mountSidebarUser(logged);

    renderInfo(logged);
    renderFavoritos(logged);
    renderHistorial(logged);
    renderAgenda(logged);
    renderPagos(logged);
    renderConfiguracion(logged);
    renderRecomendaciones(logged);

    setActiveSection(tab);
  }

  // Clicks del menú lateral
  qsa('.menu-lateral [data-section]').forEach(el => {
    el.addEventListener('click', () => {
      const to = el.dataset.section;
      setActiveSection(to);
      // Actualiza la URL (no recarga)
      const u = new URL(location.href);
      u.searchParams.set('tab', to);
      history.replaceState(null, '', u.toString());
    });
  });

  // Arranque
  document.addEventListener('DOMContentLoaded', () => {
    render(getTabFromURL());
  });
})();
