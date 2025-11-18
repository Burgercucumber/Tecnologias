(function () {
  /* ----------------- Helpers ----------------- */
  const $    = (s, r = document) => r.querySelector(s);
  const $all = (s, r = document) => [...r.querySelectorAll(s)];
  const getTab = () => new URLSearchParams(location.search).get('tab') || 'info';

  // Fecha helpers (por si luego usas agenda aquí también)
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const DOW   = ['Do','Lu','Ma','Mi','Ju','Vi','Sa'];
  const toISO = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const parseDDMMYYYY = s => { const [d,m,y] = s.split('/').map(n=>+n); return new Date(y, m-1, d); };
  const daysInMonth = (y,m) => new Date(y, m+1, 0).getDate();
  const addMonths   = (d,n) => { const a=new Date(d); a.setMonth(a.getMonth()+n); return a; };
  const isSameDate  = (a,b) => a && b && a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();

  /* ----------------- Usuario desde PHP (sesión) ----------------- */
  const SESSION_USER = (window.OdgUser && typeof window.OdgUser === 'object') ? window.OdgUser : {};

  const DEFAULT_USER = {
    name:     'Usuario',
    email:    '',
    avatar:   '../img/user-placeholder.png',
    phone:    '',
    birth:    '',
    location: ''
  };

  function buildUser(u) {
    return {
      name:     u.nombre   || u.name      || DEFAULT_USER.name,
      email:    u.email    || DEFAULT_USER.email,
      avatar:   u.avatar   || DEFAULT_USER.avatar,
      phone:    u.phone    || u.telefono  || DEFAULT_USER.phone,
      birth:    u.birth    || u.nacimiento|| DEFAULT_USER.birth,
      location: u.location || u.ubicacion || DEFAULT_USER.location
    };
  }

  let currentLang = document.documentElement.getAttribute('lang') || 'es';

  /* ----------------- Datos base ----------------- */
  const DATA = {
    user: buildUser(SESSION_USER),
    favoritos: [
      { name: "DentiSalud", logo: "https://www.fincomercio.com/wp-content/uploads/2018/03/dentisalud.jpg", liked: true },
      { name: "BD Odont",   logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjPkh3QWB1EjreZN7-l0fQPRHZ68jiYBi3Ww&s",    liked: true }
    ],
    recomendaciones: [
      { titulo: "La Candelaria", img: "https://hansatours.com/images/La-Candelaria-Bogota-Tour.jpg",    texto: "Centro turístico y cultural icónico." },
      { titulo: "Plaza Bolívar", img: "https://files.visitbogota.co/drpl/sites/default/files/2024-04/PlazaBolivar5_RicardoBáez%20%281%29.jpg", texto: "Corazón histórico de Bogotá." }
    ]
  };

  /* ----------------- Recibos (si quieres usar luego pagos, solo memoria) ----------------- */
  const RECEIPTS_MAP = {};
  function setReceiptForInvoice(facturaNum, receiptObj) { RECEIPTS_MAP[facturaNum] = receiptObj; }
  function getReceiptByInvoice(facturaNum) { return RECEIPTS_MAP[facturaNum] || null; }

  /* ----------------- Header aside ----------------- */
  function paintHeader() {
    const u = DATA.user;
    const img = $('#pf-avatar');
    const name = $('#pf-name');
    const mail = $('#pf-mail');
    if (img)  img.src = u.avatar || '../img/user-placeholder.png';
    if (name) name.textContent = u.name || 'Usuario';
    if (mail) mail.textContent = u.email || '';
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
              <div class="kpi"><span class="dot"></span><strong>Teléfono:</strong>&nbsp; ${u.phone || '—'}</div>
            </div>
            <div>
              <div class="kpi"><span class="dot"></span><strong>Fecha de nacimiento:</strong>&nbsp; ${u.birth || '—'}</div>
              <div class="kpi"><span class="dot"></span><strong>Ubicación:</strong>&nbsp; ${u.location || '—'}</div>
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

  /* -------- Configuración -------- */
  function rConfig(){
    return `<div class="panel padded">
      <h2 class="section-title">Configuración</h2>
      <div class="card">
        <div class="table-like">
          <div class="row">
            <div>Cambiar contraseña</div>
            <button class="btn outline" id="btn-pass">Cambiar</button>
          </div>
          <div class="row">
            <div>Idioma</div>
            <button class="btn outline" id="btn-lang">Idioma: ${currentLang}</button>
          </div>
          <div class="row">
            <div>Cerrar sesión</div>
            <button class="btn" id="btn-logout">Cerrar sesión</button>
          </div>
        </div>
      </div>
    </div>
    <div id="pass-modal" class="pay-modal" hidden>
      <div class="backdrop" data-pass-dismiss></div>
      <div class="dialog">
        <div class="head">
          <h3 class="section-title" style="margin:0;">Cambiar contraseña</h3>
          <button class="close" data-pass-dismiss aria-label="Cerrar">✕</button>
        </div>
        <form id="pass-form" class="card" style="gap:10px;">
          <div class="field"><label>Contraseña actual</label><input type="password" id="old-pass" required></div>
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
    // Cerrar sesión: deja que logout.php destruya la sesión y redirija
    $('#btn-logout')?.addEventListener('click', ()=>{
      location.href = './logout.php';
    });

    // Modal cambiar contraseña (solo UI por ahora, sin lógica backend)
    const pModal = $('#pass-modal');
    $('#btn-pass')?.addEventListener('click', ()=> { pModal.hidden = false; });
    $all('[data-pass-dismiss]').forEach(el=> el.addEventListener('click', ()=> { pModal.hidden = true; }));
    $('#pass-form')?.addEventListener('submit', e=>{
      e.preventDefault();
      // Aquí luego puedes hacer fetch a un PHP real
      alert('La actualización de contraseña aún no está implementada en el servidor.');
      pModal.hidden = true;
    });

    // Idioma (sin guardar en localStorage, solo esta sesión)
    $('#btn-lang')?.addEventListener('click', ()=>{
      currentLang = currentLang === 'es' ? 'en' : 'es';
      document.documentElement.setAttribute('lang', currentLang);
      $('#btn-lang').textContent = `Idioma: ${currentLang}`;
    });
  }

  /* -------- Recomendaciones (si las usas en este perfil) -------- */
  function rRecom(){
    const items = DATA.recomendaciones.map(r=>`
      <div class="card">
        <div class="pill">Lugares cercanos</div>
        <h3 style="margin:10px 0 6px;">${r.titulo}</h3>
        <p class="muted">${r.texto}</p>
        <img src="${r.img}" alt="${r.titulo}" style="width:100%; height:220px; object-fit:cover; border-radius:12px; margin-top:8px;">
      </div>`).join('');
    return `<div class="panel padded">
      <h2 class="section-title">Recomendaciones</h2>
      <div class="grid2">${items}</div>
    </div>`;
  }

  /* ----------------- Router ----------------- */
  const RENDERS = {
    info:           rInfo,
    favoritos:      rFavoritos,
    configuracion:  rConfig,
    recomendaciones:rRecom
  };

  function renderTab(tab){
    const fn = RENDERS[tab] || RENDERS.info;
    $('#pf-view').innerHTML = fn();

    // activar en aside
    $all('#pf-menu li').forEach(li => li.classList.toggle('active', li.dataset.tab === tab));
    // URL sin recargar
    const url = new URL(location.href);
    url.searchParams.set('tab', tab);
    history.replaceState({tab}, '', url);

    if (tab==='favoritos')      wireFavs();
    if (tab==='configuracion')  wireConfig();

    const btnEdit = $('#btn-edit');
    if (btnEdit){
      const back='./Perfil.php?tab=info';
      btnEdit.addEventListener('click', ()=> location.href = `./PerfilEditar.php?return=${encodeURIComponent(back)}`);
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

  /* ----------------- Init ----------------- */
  document.addEventListener('DOMContentLoaded', ()=> {
    paintHeader();
    $all('#pf-menu li').forEach(li => li.addEventListener('click', ()=> go(li.dataset.tab, true)));
    go(getTab());
    window.addEventListener('popstate', ()=> renderTab(getTab()));
  });
})();
