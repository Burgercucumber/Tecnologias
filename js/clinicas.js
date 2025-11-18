/**
 * clinica.js
 * Carga dinámica de datos de la clínica
 * Ubicación: /js/clinica.js
 */

console.log('🏥 clinica.js cargado!');

// ========== VARIABLES GLOBALES ==========
// Ojo: estos son para la página de detalle de clínica
let CLINICA_ID = null;
let CLINICA_NOMBRE = '';
let CLINICA_DATA = null; // Guardar datos completos

// Obtener ID de la URL
const urlParams = new URLSearchParams(window.location.search);
CLINICA_ID = parseInt(urlParams.get('id')) || 1;

console.log('🔍 Cargando clínica ID:', CLINICA_ID);

// ========== HELPERS ==========
function formatearCOP(valor) {
  return Number(valor || 0).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  });
}

// ========== CARGA DE DATOS ==========
async function loadClinica() {
  try {
    // Intentar cargar desde PHP primero
    let response = await fetch(`../php/get_clinica.php?id=${CLINICA_ID}`);

    // Si PHP no funciona, cargar directamente desde JSON
    if (!response.ok) {
      console.warn('⚠️ PHP no disponible, cargando desde JSON...');
      response = await fetch('../json/clinicas.json');
      const data = await response.json();
      const clinicaData = data.clinicas.find(c => c.id === CLINICA_ID);

      if (!clinicaData) throw new Error('Clínica no encontrada');

      CLINICA_DATA = clinicaData;
      renderClinica(clinicaData);
      return;
    }

    // Respuesta exitosa desde PHP
    const clinicaData = await response.json();

    if (clinicaData.error) {
      throw new Error(clinicaData.error);
    }

    console.log('✅ Datos cargados:', clinicaData);
    CLINICA_DATA = clinicaData;
    renderClinica(clinicaData);

  } catch (error) {
    console.error('❌ Error cargando clínica:', error);
    alert('Error al cargar la clínica. Verifica que los archivos estén configurados correctamente.');
    window.location.href = '../index.html';
  }
}

// ========== RENDER PRINCIPAL ==========
function renderClinica(clinica) {
  CLINICA_NOMBRE = clinica.nombre;

  // Título
  document.title = `${clinica.nombre} | OdontoGo`;

  // Logo lateral
  const logo = document.getElementById('clinica-logo');
  if (logo) {
    logo.src = clinica.logo || '';
    logo.alt = clinica.nombre || '';
  }

  // Contacto
  const contactoList = document.getElementById('contacto-list');
  if (contactoList) {
    contactoList.innerHTML = `
      <li><span class="lbl">Odontología</span></li>
      <li><span class="lbl">Nombre</span><span class="val">${clinica.nombre}</span></li>
      ${clinica.email ? `<li><span class="lbl">Email</span><span class="val">${clinica.email}</span></li>` : ''}
      ${clinica.numero ? `<li><span class="lbl">Número</span><span class="val">${clinica.numero}</span></li>` : ''}
    `;
  }

  // Acerca de
  if (clinica.acerca) {
    const panelAcerca = document.getElementById('panel-acerca');
    const acercaText  = document.getElementById('acerca-text');
    if (panelAcerca) panelAcerca.style.display = 'block';
    if (acercaText)  acercaText.textContent = clinica.acerca;
  }

  // Tratamientos (chips que abren modal)
  if (clinica.tratamientos && clinica.tratamientos.length > 0) {
    const panelTrat = document.getElementById('panel-tratamientos');
    const chipsContainer = document.getElementById('tratamientos-chips');

    if (panelTrat) panelTrat.style.display = 'block';

    if (chipsContainer) {
      chipsContainer.innerHTML = clinica.tratamientos
        .map((t, idx) => `
          <button type="button"
                  class="chip js-trat-chip"
                  data-trat-index="${idx}">
            ${t.nombre}
          </button>
        `)
        .join('');
    }
  }

  // Experiencia
  if (clinica.experinencia) {
    const panelExp = document.getElementById('panel-experiencia');
    if (panelExp) panelExp.style.display = 'block';
    const expVal = document.getElementById('experiencia-value');
    if (expVal) expVal.textContent = clinica.experinencia;
  }

  // Ratings
  const ratingValue = document.getElementById('rating-value');
  const reviewsCount = document.getElementById('reviews-count');
  if (ratingValue)  ratingValue.textContent  = `${clinica.rating} Estrellas`;
  if (reviewsCount) reviewsCount.textContent = `De ${clinica.reviews} pacientes`;

  renderStars(clinica.rating);
  renderReviews(clinica);

  // Interacciones generales (favoritos, compartir, reseñas, certificado)
  initInteractions();

  // Interacciones específicas del modal de tratamientos
  initTratamientosOverlay(clinica);
}

// ========== ESTRELLAS ==========
function renderStars(rating) {
  const starsPreview = document.getElementById('stars-preview');
  if (!starsPreview) return;

  starsPreview.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const star = document.createElement('i');
    star.textContent = '★';
    if (i > Math.floor(rating)) {
      star.style.color = '#c5cbd3';
    }
    starsPreview.appendChild(star);
  }
  starsPreview.setAttribute('aria-label', `${rating} de 5`);
}

// ========== RESEÑAS ==========
function renderReviews(clinica) {
  if (!clinica.reseñas || clinica.reseñas.length === 0) {
    console.log('No hay reseñas disponibles');
    return;
  }

  // Preview (primera reseña)
  const previewCard = document.querySelector('.reviews .review-card');
  if (previewCard && clinica.reseñas.length > 0) {
    const firstReview = clinica.reseñas[0];
    previewCard.innerHTML = `
      <div class="row">
        <p class="user">${firstReview.usuario}</p>
        <div class="stars" aria-label="${firstReview.calificacion} de 5">
          ${generateStarsHTML(firstReview.calificacion)}
        </div>
      </div>
      <p class="txt">${firstReview.comentario}</p>
    `;
  }

  // Resto en el modal
  const reviewsGrid = document.querySelector('#overlay-reviews .reviews-grid');
  if (reviewsGrid) {
    reviewsGrid.innerHTML = clinica.reseñas.map(review => `
      <div class="review-card">
        <div class="row">
          <p class="user">${review.usuario}</p>
          <div class="stars" aria-label="${review.calificacion} de 5">
            ${generateStarsHTML(review.calificacion)}
          </div>
        </div>
        <p class="txt">${review.comentario}</p>
      </div>
    `).join('');
  }
}

function generateStarsHTML(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      html += '<i>★</i>';
    } else {
      html += '<i style="color:#c5cbd3;">★</i>';
    }
  }
  return html;
}

// ========== INTERACCIONES GENERALES ==========
function initInteractions() {
  // ------- Favoritos -------
  const favKey = 'fav-clinica-' + CLINICA_ID;
  const btnFav = document.getElementById('btn-fav');

  if (btnFav) {
    const applyFav = (on) => {
      btnFav.classList.toggle('active', on);
      btnFav.setAttribute('aria-pressed', on);
    };

    try {
      applyFav(localStorage.getItem(favKey) === '1');
    } catch (e) {
      console.warn('localStorage no disponible');
    }

    btnFav.addEventListener('click', () => {
      const on = !btnFav.classList.contains('active');
      applyFav(on);
      try {
        localStorage.setItem(favKey, on ? '1' : '0');
      } catch (e) {}
    });
  }

  // ------- Compartir -------
  const btnShare  = document.getElementById('btn-share');
  const shareMenu = document.getElementById('share-menu');

  if (btnShare && shareMenu) {
    const url  = encodeURIComponent(window.location.href);
    const text = encodeURIComponent('Mira ' + CLINICA_NOMBRE + ' en OdontoGo: ');

    const wa = document.getElementById('share-wa');
    const fb = document.getElementById('share-fb');
    const x  = document.getElementById('share-x');
    const copyBtn = document.getElementById('share-copy');

    if (wa) wa.href = `https://wa.me/?text=${text}${url}`;
    if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    if (x)  x.href  = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;

    btnShare.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = shareMenu.getAttribute('aria-hidden') !== 'false';
      shareMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
      btnShare.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          const old = shareMenu.innerHTML;
          shareMenu.innerHTML = '<div class="copied">¡Enlace copiado!</div>';
          setTimeout(() => (shareMenu.innerHTML = old), 1200);
        } catch (_) {
          alert('No se pudo copiar el enlace');
        }
      });
    }

    document.addEventListener('click', () => {
      shareMenu.setAttribute('aria-hidden', 'true');
      btnShare.setAttribute('aria-expanded', 'false');
    });
  }

  // ------- Modal certificado -------
  const overlayCert = document.getElementById('overlay-cert');
  const btnCert     = document.getElementById('btn-cert');
  const closeCert   = document.getElementById('cert-close');

  const openCert = () => {
    if (!overlayCert) return;
    overlayCert.classList.add('open');
    overlayCert.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeCertModal = () => {
    if (!overlayCert) return;
    overlayCert.classList.remove('open');
    overlayCert.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (btnCert && overlayCert && closeCert) {
    btnCert.addEventListener('click', openCert);
    closeCert.addEventListener('click', closeCertModal);
    overlayCert.addEventListener('click', e => {
      if (e.target === overlayCert) closeCertModal();
    });
  }

  // ------- Modal reseñas -------
  const overlayReviews = document.getElementById('overlay-reviews');
  const btnReviews     = document.getElementById('open-reviews');
  const closeReviews   = document.getElementById('reviews-close');

  const openReviews = (e) => {
    if (e) e.preventDefault();
    if (!overlayReviews) return;
    overlayReviews.classList.add('open');
    overlayReviews.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeReviewsModal = () => {
    if (!overlayReviews) return;
    overlayReviews.classList.remove('open');
    overlayReviews.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (overlayReviews && btnReviews && closeReviews) {
    btnReviews.addEventListener('click', openReviews);
    closeReviews.addEventListener('click', closeReviewsModal);
    overlayReviews.addEventListener('click', e => {
      if (e.target === overlayReviews) closeReviewsModal();
    });
  }

  // ESC para estos dos
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeCertModal();
      closeReviewsModal();
    }
  });
}

// ========== MODAL DE TRATAMIENTOS ==========
function initTratamientosOverlay(clinica) {
  const chipsContainer = document.getElementById('tratamientos-chips');
  const overlayTrat    = document.getElementById('overlay-trat');
  if (!chipsContainer || !overlayTrat) return;

  const closeBtn       = overlayTrat.querySelector('.overlay-close, #trat-close');
  const btnContactar   = document.getElementById('btn-contactar');

  const fillCard = (tratamiento) => {
    // Datos generales de la clínica
    const mapaValores = {
      'det-nombre'       : clinica.nombre,
      'det-rating'       : clinica.rating,
      'det-reviews'      : clinica.reviews,
      'det-ubicacion'    : `${clinica.ciudad}, ${clinica.barrio}`,
      'det-duracion'     : (tratamiento && tratamiento.duracion) || clinica.duracion || '—',
      'det-precio-total' : formatearCOP((tratamiento && tratamiento.precio_total) || clinica.precio_total),
      'det-precio-proc'  : formatearCOP((tratamiento && tratamiento.precio_proc)  || clinica.precio_proc),
      'det-precio-rev'   : formatearCOP((tratamiento && tratamiento.precio_rev)   || clinica.precio_rev),
      'det-modalidad'    : (tratamiento && tratamiento.modalidad) || clinica.modalidad || '—'
    };

    Object.keys(mapaValores).forEach(id => {
      const el = document.getElementById(id);
      if (el && mapaValores[id] != null) el.textContent = mapaValores[id];
    });

    // Logo
    const logoEl = document.getElementById('det-logo');
    if (logoEl) {
      if (clinica.logo) {
        logoEl.src = clinica.logo;
        logoEl.style.display = 'block';
      } else {
        logoEl.style.display = 'none';
      }
    }

    // Info general derecha
    const detalle = tratamiento.detalle || {};
    const tituloEl = document.getElementById('det-titulo');
    const descEl   = document.getElementById('det-descripcion');
    const beneUl   = document.getElementById('det-beneficios');

    if (tituloEl) {
      tituloEl.textContent =
        (tratamiento && tratamiento.nombre) ||
        detalle.titulo ||
        '—';
    }

    if (descEl) {
      descEl.textContent =
        (tratamiento && tratamiento.descripcion) ||
        detalle.descripcion ||
        'Selecciona una clínica para ver más información.';
    }

    if (beneUl) {
      beneUl.innerHTML = '';
      const beneficios =
        (tratamiento && tratamiento.beneficios) ||
        detalle.beneficios ||
        [];
      beneficios.forEach(txt => {
        const li = document.createElement('li');
        li.textContent = txt;
        beneUl.appendChild(li);
      });
    }

    const modalInfo = {
      id                : clinica.id,
      nombre            : clinica.nombre,
      ciudad            : clinica.ciudad,
      barrio            : clinica.barrio,
      tratamiento_id    : tratamiento?.id || null,
      tratamiento_nombre: tratamiento?.nombre || 'Procedimiento',
      precio_total      : (tratamiento && tratamiento.precio_total) || clinica.precio_total || 0,
      precio_proc       : (tratamiento && tratamiento.precio_proc)  || clinica.precio_proc  || 0,
      precio_rev        : (tratamiento && tratamiento.precio_rev)   || clinica.precio_rev   || 0
    };

    window.OdgCurrentClinic = modalInfo;
    actualizarModalPago(modalInfo);

    if (btnContactar) {
      btnContactar.classList.add('js-open-pay');
      btnContactar.dataset.proc       = modalInfo.tratamiento_nombre || 'Procedimiento';
      btnContactar.dataset.precioProc = modalInfo.precio_proc || 0;
      btnContactar.dataset.precioRev  = modalInfo.precio_rev  || 0;
      btnContactar.dataset.clinica    = modalInfo.nombre || '';
      btnContactar.dataset.ubicacion  = `${clinica.ciudad}, ${clinica.barrio}`;
      btnContactar.dataset.clinicaId  = modalInfo.id || '';
      btnContactar.dataset.ofertaId   = modalInfo.tratamiento_id || '';
    }
  };

  const openOverlay = (tratamiento) => {
    fillCard(tratamiento);
    overlayTrat.classList.add('open');
    overlayTrat.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeOverlay = () => {
    overlayTrat.classList.remove('open');
    overlayTrat.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  // Click en chips
  chipsContainer.querySelectorAll('.js-trat-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.tratIndex, 10);
      const tratamiento = (clinica.tratamientos && clinica.tratamientos[idx]) || null;
      openOverlay(tratamiento);
    });
  });

  // Cerrar (botón, fondo, ESC)
  if (closeBtn) {
    closeBtn.addEventListener('click', closeOverlay);
  }
  overlayTrat.addEventListener('click', e => {
    if (e.target === overlayTrat) closeOverlay();
  });
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeOverlay();
  });

  if (clinica.tratamientos && clinica.tratamientos.length) {
    fillCard(clinica.tratamientos[0]);
  }
}

// ========== INICIO ==========
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadClinica);
} else {
  loadClinica();
}

/* =====================================================
 * 2) LÓGICA DE LISTA + FILTROS (clinicas.js)
 * ===================================================== */

// ========== VARIABLES GLOBALES PARA FILTROS ==========
const API_URL = '../php/clinicas.php';
let CLINICAS = {};
let currentClinicKey = null;
let currentTratamiento = null; // 👈 Guardar tratamiento actual
let currentBarrio = null;      // 👈 Guardar barrio actual

// ========== FUNCIONES AUXILIARES ==========
// usamos formatearCOP del bloque anterior

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========== CARGAR DATOS CON FILTROS COMBINADOS ==========
async function cargarClinicas() {
  console.log('🔍 Intentando cargar desde:', API_URL);
  
  try {
    // Construir URL con filtros activos
    let url = API_URL;
    const params = new URLSearchParams();
    
    if (currentTratamiento) {
      params.append('tratamiento', currentTratamiento);
    }
    
    if (currentBarrio) {
      params.append('barrio', currentBarrio);
    }
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    console.log('📡 URL completa:', url);
    
    const response = await fetch(url);
    console.log('📡 Respuesta recibida:', response.status);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('📦 Datos recibidos:', data);

    if (data.error) {
      throw new Error(data.mensaje || 'Error del servidor');
    }

    // Convertir array a objeto indexado por ID
    CLINICAS = {};
    const getKey = (clinica) => `${clinica.id}-${clinica.tratamiento_id || 'general'}`;
    data.clinicas.forEach(c => {
      CLINICAS[getKey(c)] = c;
    });

    console.log('✅ Clínicas cargadas:', Object.keys(CLINICAS).length);

    // Actualizar contador
    const countEl = document.getElementById('clinic-count');
    if (countEl) {
      countEl.textContent = data.total;
    }

    // Renderizar lista
    if (data.clinicas.length > 0) {
      renderizarLista(data.clinicas);
      const firstKey = `${data.clinicas[0].id}-${data.clinicas[0].tratamiento_id || 'general'}`;
      renderizarDetalle(firstKey);
    } else {
      // Mostrar mensaje si no hay resultados
      const listEl = document.getElementById('clinics-list');
      if (listEl) {
        listEl.innerHTML = `
          <li class="loading" style="color: #6b7b86;">
            No se encontraron clínicas con los filtros seleccionados
          </li>
        `;
      }
    }

  } catch (error) {
    console.error('❌ Error completo:', error);
    const listEl = document.getElementById('clinics-list');
    if (listEl) {
      listEl.innerHTML = `
        <li class="loading" style="color: #c44;">
          ❌ Error: ${escapeHtml(error.message)}
          <br><small>Revisa la consola (F12) para más detalles</small>
          <br><small>Ruta intentada: ${API_URL}</small>
        </li>
      `;
    }
  }
}

// ========== FILTRAR POR TRATAMIENTO ==========
async function filtrarPorTratamiento(tratamientoId) {
  console.log('🔵 Filtrando por tratamiento:', tratamientoId);
  currentTratamiento = tratamientoId; // 👈 Guardar filtro activo
  await cargarClinicas(); // Recargar con filtros combinados
}

// ========== FILTRAR POR BARRIO ==========
async function filtrarPorBarrio(barrio) {
  console.log('📍 Filtrando por barrio:', barrio);
  currentBarrio = barrio || null; // 👈 Guardar filtro activo (null si es "Todos")
  await cargarClinicas(); // Recargar con filtros combinados
}

// ========== RENDERIZAR LISTA ==========
function renderizarLista(clinicas) {
  const list = document.getElementById('clinics-list');
  if (!list) return;
  
  list.innerHTML = '';

  const getKey = (clinica) => `${clinica.id}-${clinica.tratamiento_id || 'general'}`;

  clinicas.forEach(c => {
    const key = getKey(c);
    const li = document.createElement('li');
    li.className = 'result-card';
    li.dataset.key = key;

    li.innerHTML = `
      <a class="result-link" href="#" aria-labelledby="r${c.id}-tit">
        <div class="result-top">
          <h3 id="r${c.id}-tit">${escapeHtml(c.nombre)}</h3>
          <span class="badge-verificado" title="Verificado">
            <svg class="icon icon-verified" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#3ae78b" fill-rule="evenodd"
                d="M15.418 5.643a1.25 1.25 0 0 0-1.34-.555l-1.798.413a1.25 1.25 0 0 1-.56 0l-1.798-.413a1.25 1.25 0 0 0-1.34.555l-.98 1.564c-.1.16-.235.295-.395.396l-1.564.98a1.25 1.25 0 0 0-.555 1.338l.413 1.8a1.25 1.25 0 0 1 0 .559l-.413 1.799a1.25 1.25 0 0 0 .555 1.339l1.564.98c.16.1.295.235.396.395l.98 1.564c.282.451.82.674 1.339.555l1.798-.413a1.25 1.25 0 0 1 .56 0l1.799.413a1.25 1.25 0 0 0 1.339-.555l.98-1.564c.1-.16.235-.295.395-.395l1.565-.98a1.25 1.25 0 0 0 .554-1.34L18.5 12.28a1.25 1.25 0 0 1 0-.56l.413-1.799a1.25 1.25 0 0 0-.554-1.339l-1.565-.98a1.25 1.25 0 0 1-.395-.395zm-.503 4.127a.5.5 0 0 0-.86-.509l-2.615 4.426l-1.579-1.512a.5.5 0 1 0-.691.722l2.034 1.949a.5.5 0 0 0 .776-.107z"
                clip-rule="evenodd"/>
            </svg>
          </span>
        </div>
        <div class="result-rating">
          <strong>${c.rating}</strong>
          <svg class="icon icon-badge" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M9.153 5.408C10.42 3.136 11.053 2 12 2s1.58 1.136 2.847 3.408l.328.588c.36.646.54.969.82 1.182s.63.292 1.33.45l.636.144c2.46.557 3.689.835 3.982 1.776c.292.94-.546 1.921-2.223 3.882l-.434.507c-.476.557-.715.836-.822 1.18c-.107.345-.071.717.001 1.46l.066.677c.253 2.617.38 3.925-.386 4.506s-1.918.051-4.22-1.009l-.597-.274c-.654-.302-.981-.452-1.328-.452s-.674.15-1.328.452l-.596.274c-2.303 1.06-3.455 1.59-4.22 1.01c-.767-.582-.64-1.89-.387-4.507l.066-.676c.072-.744.108-1.116 0-1.46c-.106-.345-.345-.624-.821-1.18l-.434-.508c-1.677-1.96-2.515-2.941-2.223-3.882S3.58 8.328 6.04 7.772l.636-.144c.699-.158 1.048-.237 1.329-.45s.46-.536.82-1.182z"/>
          </svg>
        </div>
        <p class="result-loc">${escapeHtml(c.ciudad)}, ${escapeHtml(c.barrio)}</p>
        <p class="result-precio">${formatearCOP(c.precio_total)}</p>
      </a>
    `;

    li.addEventListener('click', (e) => {
      e.preventDefault();
      renderizarDetalle(key);
    });

    list.appendChild(li);
  });
}

// ========== RENDERIZAR DETALLE ==========
function renderizarDetalle(key) {
  const c = CLINICAS[key];
  if (!c) return;

  currentClinicKey = key;
  window.OdgCurrentClinic = c;

  // Marcar tarjeta activa
  document.querySelectorAll('.result-card').forEach(card => {
    card.classList.toggle('activa', card.dataset.key === key);
  });

  // Actualizar panel central
  const elementos = {
    'det-nombre': c.nombre,
    'det-rating': c.rating,
    'det-reviews': c.reviews,
    'det-ubicacion': `${c.ciudad}, ${c.barrio}`,
    'det-duracion': c.duracion || '—',
    'det-precio-total': formatearCOP(c.precio_total),
    'det-precio-proc': formatearCOP(c.precio_proc),
    'det-precio-rev': formatearCOP(c.precio_rev),
    'det-modalidad': c.modalidad || '—'
  };

  Object.keys(elementos).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = elementos[id];
  });

  // Panel derecho
  const detalle = c.detalle || {};
  
  const tituloEl = document.getElementById('det-titulo');
  if (tituloEl) tituloEl.textContent = detalle.titulo || '—';
  
  const descripcionEl = document.getElementById('det-descripcion');
  if (descripcionEl) 
    descripcionEl.textContent = detalle.descripcion || 'Selecciona una clínica para ver más información.';

  // Logo
  const logoEl = document.getElementById('det-logo');
  if (logoEl) {
    if (c.logo) {
      logoEl.src = c.logo;
      logoEl.style.display = 'block';
    } else {
      logoEl.style.display = 'none';
    }
  }

  // Beneficios
  const ul = document.getElementById('det-beneficios');
  if (ul) {
    ul.innerHTML = '';
    if (Array.isArray(detalle.beneficios)) {
      detalle.beneficios.forEach(txt => {
        const li = document.createElement('li');
        li.textContent = txt;
        ul.appendChild(li);
      });
    }
  }

  // Actualizar datos del modal de pago (si existe)
  actualizarModalPago(c);
}

// ========== ACTUALIZAR MODAL DE PAGO ==========
function actualizarModalPago(clinica) {
  const procEl = document.getElementById('pay-proc');
  const clinicaEl = document.getElementById('pay-clinica');
  const ubicEl = document.getElementById('pay-ubicacion');
  const procAmountEl = document.getElementById('pay-precio-proc');
  const revAmountEl = document.getElementById('pay-precio-rev');
  const totalEl = document.getElementById('pay-total');
  const btnContactar = document.getElementById('btn-contactar');

  if (procEl) procEl.textContent = clinica.tratamiento_nombre || 'Procedimiento';
  if (clinicaEl) clinicaEl.textContent = clinica.nombre || '';
  if (ubicEl) ubicEl.textContent = `${clinica.ciudad}, ${clinica.barrio}`;
  if (procAmountEl) {
    procAmountEl.textContent = formatearCOP(clinica.precio_proc);
    procAmountEl.dataset.raw = clinica.precio_proc || 0;
  }
  if (revAmountEl) {
    revAmountEl.textContent = formatearCOP(clinica.precio_rev);
    revAmountEl.dataset.raw = clinica.precio_rev || 0;
  }
  if (totalEl) totalEl.textContent = formatearCOP(clinica.precio_total);

  if (btnContactar) {
    btnContactar.classList.add('js-open-pay');
    btnContactar.dataset.proc = clinica.tratamiento_nombre || 'Procedimiento';
    btnContactar.dataset.precioProc = clinica.precio_proc || 0;
    btnContactar.dataset.precioRev = clinica.precio_rev || 0;
    btnContactar.dataset.clinica = clinica.nombre || '';
    btnContactar.dataset.ubicacion = `${clinica.ciudad}, ${clinica.barrio}`;
    btnContactar.dataset.clinicaId = clinica.id || '';
    btnContactar.dataset.ofertaId = clinica.tratamiento_id || '';
  }

  const nombreEl = document.getElementById('det-nombre');
  if (nombreEl) {
    nombreEl.dataset.clinicaId = clinica.id || '';
    nombreEl.dataset.ofertaId = clinica.tratamiento_id || '';
  }

  const detail = {
    clinica_id: clinica.id || '',
    oferta_id: clinica.tratamiento_id || '',
    tratamiento_nombre: clinica.tratamiento_nombre || clinica.tratamiento || '',
    precio_procedimiento: clinica.precio_proc || 0,
    precio_revision: clinica.precio_rev || 0,
    clinica_nombre: clinica.nombre || '',
    ubicacion_texto: `${clinica.ciudad}, ${clinica.barrio}`
  };
  document.dispatchEvent(new CustomEvent('odg:clinic-updated', { detail }));
}

// ========== EXPONER FUNCIONES GLOBALES ==========
window.filtrarPorTratamiento = filtrarPorTratamiento;
window.filtrarPorBarrio = filtrarPorBarrio;

// ========== INICIAR AL CARGAR PÁGINA ==========
window.addEventListener('DOMContentLoaded', () => {
  // Verificar si hay parámetros en la URL
  const urlParams2 = new URLSearchParams(window.location.search);
  const tratamiento = urlParams2.get('tratamiento');
  
  // Establecer filtro de tratamiento inicial
  if (tratamiento) {
    currentTratamiento = tratamiento;
  }
  
  // Cargar clínicas con filtros (si existe la lista en el DOM)
  const listEl = document.getElementById('clinics-list');
  if (listEl) {
    cargarClinicas();
  }
});
